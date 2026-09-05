from datetime import date, timedelta
from statistics import mean

import httpx
from fastapi import APIRouter, HTTPException

from models.cities import CITY_DATA, CityRisk, TrendPoint


router = APIRouter(prefix="/heatmap", tags=["live-data"])

OPEN_METEO_FORECAST = "https://api.open-meteo.com/v1/forecast"
OPEN_METEO_ARCHIVE = "https://archive-api.open-meteo.com/v1/archive"


@router.get("/live-cities", response_model=list[CityRisk])
async def live_cities() -> list[CityRisk]:
    """Refresh city temperature/risk signals from Open-Meteo.

    Context variables (population, urbanisation and vegetation) remain the
    project's explicitly labelled baseline indicators; meteorological values
    are refreshed from the live forecast service.
    """
    latitudes = ",".join(str(c.lat) for c in CITY_DATA)
    longitudes = ",".join(str(c.lng) for c in CITY_DATA)

    params = {
        "latitude": latitudes,
        "longitude": longitudes,
        "daily": "temperature_2m_max,temperature_2m_min,apparent_temperature_max",
        "past_days": 7,
        "forecast_days": 7,
        "timezone": "auto",
    }

    try:
        async with httpx.AsyncClient(timeout=20.0) as client:
            response = await client.get(OPEN_METEO_FORECAST, params=params)
            response.raise_for_status()
            payload = response.json()
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=502, detail=f"Weather provider unavailable: {exc}") from exc

    results = payload if isinstance(payload, list) else [payload]
    live: list[CityRisk] = []

    for base, weather in zip(CITY_DATA, results):
        daily = weather.get("daily", {})
        highs = [x for x in daily.get("temperature_2m_max", []) if x is not None]
        if not highs:
            live.append(base)
            continue

        recent_highs = highs[:7]
        max_temp = round(max(recent_highs), 1)
        hot_days = sum(1 for value in recent_highs if value >= 40)

        temperature_index = max(0.0, min(100.0, (max_temp - 30) / 18 * 100))
        frequency_index = min(100.0, hot_days / 7 * 100)
        green_offset = 100 - base.vegetation_cover
        score = round(
            temperature_index * 0.30
            + frequency_index * 0.25
            + base.pop_exposure * 0.20
            + base.urbanization * 0.15
            + green_offset * 0.10
        )
        tier = "very_high" if score >= 75 else "high" if score >= 60 else "moderate" if score >= 40 else "low"

        live.append(
            base.model_copy(
                update={
                    "max_temp": max_temp,
                    "heatwave_days": hot_days,
                    "score": score,
                    "tier": tier,
                    "is_demo": False,
                    "source_note": (
                        "Meteorological signal refreshed from Open-Meteo forecast data "
                        f"({len(recent_highs)}-day window). Hot-day count is a project "
                        "indicator (daily maximum >= 40°C), not an official IMD heatwave classification."
                    ),
                }
            )
        )

    return live


@router.get("/real-trends", response_model=list[TrendPoint])
async def real_trends() -> list[TrendPoint]:
    """Return a reproducible ERA5-derived trend for Delhi as the reference city."""
    reference = next(city for city in CITY_DATA if city.id == "delhi")
    end = date.today() - timedelta(days=5)
    start = end.replace(year=end.year - 10)

    params = {
        "latitude": reference.lat,
        "longitude": reference.lng,
        "start_date": start.isoformat(),
        "end_date": end.isoformat(),
        "daily": "temperature_2m_max,temperature_2m_min",
        "timezone": "Asia/Kolkata",
    }

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(OPEN_METEO_ARCHIVE, params=params)
            response.raise_for_status()
            payload = response.json()
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=502, detail=f"Historical weather provider unavailable: {exc}") from exc

    daily = payload.get("daily", {})
    years: dict[str, dict[str, list[float]]] = {}
    for day, high, low in zip(
        daily.get("time", []),
        daily.get("temperature_2m_max", []),
        daily.get("temperature_2m_min", []),
    ):
        if high is None or low is None:
            continue
        year = day[:4]
        bucket = years.setdefault(year, {"high": [], "low": []})
        bucket["high"].append(float(high))
        bucket["low"].append(float(low))

    return [
        TrendPoint(
            year=year,
            frequency=sum(value >= 40 for value in values["high"]),
            day_temperature=round(mean(values["high"]), 1),
            night_temperature=round(mean(values["low"]), 1),
        )
        for year, values in sorted(years.items())
    ]
