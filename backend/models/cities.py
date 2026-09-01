from typing import Literal

from pydantic import BaseModel, Field


RiskTier = Literal["low", "moderate", "high", "very_high"]


class CityRisk(BaseModel):
    id: str
    name: str
    state: str
    lat: float
    lng: float
    max_temp: float = Field(description="Demonstration peak temperature in Celsius")
    heatwave_days: int = Field(description="Demonstration annual heatwave-day index")
    pop_exposure: int = Field(ge=0, le=100)
    urbanization: int = Field(ge=0, le=100)
    vegetation_cover: int = Field(ge=0, le=100)
    score: int = Field(ge=0, le=100)
    tier: RiskTier
    is_demo: bool = True
    source_note: str = Field(
        default="Educational demonstration value; replace with station-level verified dataset."
    )


class TrendPoint(BaseModel):
    year: str
    frequency: int
    day_temperature: float
    night_temperature: float


class RiskCalculationRequest(BaseModel):
    max_temp: float = Field(ge=30, le=55)
    heatwave_days: int = Field(ge=0, le=60)
    pop_exposure: int = Field(ge=0, le=100)
    urbanization: int = Field(ge=0, le=100)
    vegetation_cover: int = Field(ge=0, le=100)


class RiskCalculationResponse(BaseModel):
    score: int
    tier: RiskTier
    components: dict[str, float]
    formula: str


CITY_DATA: list[CityRisk] = [
    CityRisk(id="delhi", name="Delhi (NCR)", state="Delhi", lat=28.6139, lng=77.2090, max_temp=46.8, heatwave_days=24, pop_exposure=94, urbanization=92, vegetation_cover=18, score=88, tier="very_high"),
    CityRisk(id="ahmedabad", name="Ahmedabad", state="Gujarat", lat=23.0225, lng=72.5714, max_temp=46.2, heatwave_days=22, pop_exposure=85, urbanization=88, vegetation_cover=14, score=86, tier="very_high"),
    CityRisk(id="nagpur", name="Nagpur", state="Maharashtra", lat=21.1458, lng=79.0882, max_temp=45.9, heatwave_days=21, pop_exposure=78, urbanization=76, vegetation_cover=22, score=82, tier="very_high"),
    CityRisk(id="hyderabad", name="Hyderabad", state="Telangana", lat=17.3850, lng=78.4867, max_temp=43.6, heatwave_days=18, pop_exposure=88, urbanization=84, vegetation_cover=19, score=79, tier="very_high"),
    CityRisk(id="patna", name="Patna", state="Bihar", lat=25.5941, lng=85.1376, max_temp=44.5, heatwave_days=19, pop_exposure=82, urbanization=74, vegetation_cover=16, score=78, tier="very_high"),
    CityRisk(id="jaipur", name="Jaipur", state="Rajasthan", lat=26.9124, lng=75.7873, max_temp=45.2, heatwave_days=20, pop_exposure=76, urbanization=75, vegetation_cover=15, score=76, tier="very_high"),
    CityRisk(id="lucknow", name="Lucknow", state="Uttar Pradesh", lat=26.8467, lng=80.9462, max_temp=44.1, heatwave_days=16, pop_exposure=79, urbanization=72, vegetation_cover=21, score=73, tier="high"),
    CityRisk(id="chennai", name="Chennai", state="Tamil Nadu", lat=13.0827, lng=80.2707, max_temp=42.1, heatwave_days=14, pop_exposure=86, urbanization=90, vegetation_cover=17, score=72, tier="high"),
    CityRisk(id="kolkata", name="Kolkata", state="West Bengal", lat=22.5726, lng=88.3639, max_temp=41.5, heatwave_days=15, pop_exposure=91, urbanization=89, vegetation_cover=15, score=74, tier="high"),
    CityRisk(id="mumbai", name="Mumbai", state="Maharashtra", lat=19.0760, lng=72.8777, max_temp=38.9, heatwave_days=11, pop_exposure=96, urbanization=95, vegetation_cover=20, score=68, tier="high"),
    CityRisk(id="bhubaneswar", name="Bhubaneswar", state="Odisha", lat=20.2961, lng=85.8245, max_temp=43.4, heatwave_days=14, pop_exposure=64, urbanization=68, vegetation_cover=25, score=65, tier="high"),
    CityRisk(id="surat", name="Surat", state="Gujarat", lat=21.1702, lng=72.8311, max_temp=42.0, heatwave_days=12, pop_exposure=79, urbanization=86, vegetation_cover=18, score=64, tier="high"),
    CityRisk(id="bhopal", name="Bhopal", state="Madhya Pradesh", lat=23.2599, lng=77.4126, max_temp=43.8, heatwave_days=15, pop_exposure=68, urbanization=70, vegetation_cover=28, score=67, tier="high"),
    CityRisk(id="pune", name="Pune", state="Maharashtra", lat=18.5204, lng=73.8567, max_temp=41.0, heatwave_days=10, pop_exposure=74, urbanization=80, vegetation_cover=32, score=55, tier="moderate"),
    CityRisk(id="visakhapatnam", name="Visakhapatnam", state="Andhra Pradesh", lat=17.6868, lng=83.2185, max_temp=39.5, heatwave_days=9, pop_exposure=66, urbanization=71, vegetation_cover=35, score=52, tier="moderate"),
    CityRisk(id="chandigarh", name="Chandigarh", state="Punjab/Haryana", lat=30.7333, lng=76.7794, max_temp=43.2, heatwave_days=13, pop_exposure=55, urbanization=78, vegetation_cover=42, score=57, tier="moderate"),
    CityRisk(id="ludhiana", name="Ludhiana", state="Punjab", lat=30.9010, lng=75.8573, max_temp=45.4, heatwave_days=18, pop_exposure=83, urbanization=86, vegetation_cover=16, score=79, tier="very_high", source_note="Demo baseline structured for replacement with IMD station records and Punjab SAPCC indicators."),
    CityRisk(id="amritsar", name="Amritsar", state="Punjab", lat=31.6340, lng=74.8723, max_temp=44.8, heatwave_days=16, pop_exposure=76, urbanization=79, vegetation_cover=22, score=74, tier="high", source_note="Demo baseline structured for replacement with IMD station records and Punjab climate indicators."),
    CityRisk(id="bathinda", name="Bathinda", state="Punjab", lat=30.2110, lng=74.9455, max_temp=46.1, heatwave_days=21, pop_exposure=71, urbanization=68, vegetation_cover=14, score=78, tier="very_high", source_note="Demo baseline structured for replacement with IMD extreme-weather records and Punjab SAPCC indicators."),
    CityRisk(id="jalandhar", name="Jalandhar", state="Punjab", lat=31.3260, lng=75.5762, max_temp=43.9, heatwave_days=14, pop_exposure=74, urbanization=78, vegetation_cover=20, score=69, tier="high", source_note="Demo baseline structured for replacement with IMD station records and Punjab state heat indicators."),
    CityRisk(id="patiala", name="Patiala", state="Punjab", lat=30.3398, lng=76.3869, max_temp=44.6, heatwave_days=15, pop_exposure=67, urbanization=71, vegetation_cover=24, score=67, tier="high", source_note="Demo baseline structured for replacement with IMD station records and Punjab SAPCC indicators."),
    CityRisk(id="bengaluru", name="Bengaluru", state="Karnataka", lat=12.9716, lng=77.5946, max_temp=38.2, heatwave_days=7, pop_exposure=84, urbanization=87, vegetation_cover=36, score=53, tier="moderate"),
    CityRisk(id="kochi", name="Kochi", state="Kerala", lat=9.9312, lng=76.2673, max_temp=36.4, heatwave_days=4, pop_exposure=60, urbanization=73, vegetation_cover=46, score=38, tier="low"),
    CityRisk(id="guwahati", name="Guwahati", state="Assam", lat=26.1445, lng=91.7362, max_temp=37.8, heatwave_days=5, pop_exposure=52, urbanization=60, vegetation_cover=52, score=35, tier="low"),
    CityRisk(id="shimla", name="Shimla", state="Himachal Pradesh", lat=31.1048, lng=77.1734, max_temp=31.5, heatwave_days=2, pop_exposure=32, urbanization=45, vegetation_cover=75, score=21, tier="low"),
]


TREND_DATA: list[TrendPoint] = [
    TrendPoint(year="2015", frequency=9, day_temperature=39.4, night_temperature=27.1),
    TrendPoint(year="2016", frequency=11, day_temperature=39.8, night_temperature=27.4),
    TrendPoint(year="2017", frequency=10, day_temperature=40.1, night_temperature=27.6),
    TrendPoint(year="2018", frequency=12, day_temperature=40.3, night_temperature=27.9),
    TrendPoint(year="2019", frequency=13, day_temperature=40.5, night_temperature=28.2),
    TrendPoint(year="2020", frequency=12, day_temperature=40.7, night_temperature=28.4),
    TrendPoint(year="2021", frequency=14, day_temperature=40.9, night_temperature=28.7),
    TrendPoint(year="2022", frequency=15, day_temperature=41.2, night_temperature=29.0),
    TrendPoint(year="2023", frequency=16, day_temperature=41.4, night_temperature=29.2),
    TrendPoint(year="2024", frequency=18, day_temperature=41.8, night_temperature=29.6),
]