from fastapi import APIRouter

from models.cities import (
    CITY_DATA,
    TREND_DATA,
    CityRisk,
    RiskCalculationRequest,
    RiskCalculationResponse,
    TrendPoint,
)


router = APIRouter(prefix="/heatmap", tags=["heatmap"])


@router.get("/cities", response_model=list[CityRisk])
async def list_cities() -> list[CityRisk]:
    return CITY_DATA


@router.get("/trends", response_model=list[TrendPoint])
async def list_trends() -> list[TrendPoint]:
    return TREND_DATA


def risk_tier(score: int) -> str:
    if score >= 75:
        return "very_high"
    if score >= 60:
        return "high"
    if score >= 40:
        return "moderate"
    return "low"


@router.post("/calculate", response_model=RiskCalculationResponse)
async def calculate_risk(payload: RiskCalculationRequest) -> RiskCalculationResponse:
    temperature_index = max(0.0, min(100.0, (payload.max_temp - 30) / 18 * 100))
    frequency_index = min(100.0, payload.heatwave_days / 24 * 100)
    green_offset = 100 - payload.vegetation_cover
    score = round(
        temperature_index * 0.30
        + frequency_index * 0.25
        + payload.pop_exposure * 0.20
        + payload.urbanization * 0.15
        + green_offset * 0.10
    )
    return RiskCalculationResponse(
        score=score,
        tier=risk_tier(score),
        components={
            "temperature": round(temperature_index * 0.30, 1),
            "frequency": round(frequency_index * 0.25, 1),
            "population": round(payload.pop_exposure * 0.20, 1),
            "urbanization": round(payload.urbanization * 0.15, 1),
            "vegetation": round(green_offset * 0.10, 1),
        },
        formula="Temperature 30% + Frequency 25% + Population 20% + Urbanization 15% + (100 − Vegetation) 10%",
    )