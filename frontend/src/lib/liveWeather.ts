export type RiskTier = "low" | "moderate" | "high" | "very_high";

export interface CityRisk {
  id: string;
  name: string;
  state: string;
  lat: number;
  lng: number;
  max_temp: number;
  heatwave_days: number;
  pop_exposure: number;
  urbanization: number;
  vegetation_cover: number;
  score: number;
  tier: RiskTier;
  is_demo: boolean;
  source_note: string;
}

export interface TrendPoint {
  year: string;
  frequency: number;
  day_temperature: number;
  night_temperature: number;
}

const BASE_CITIES = [
  ["delhi","Delhi (NCR)","Delhi",28.6139,77.2090,94,92,18],
  ["ahmedabad","Ahmedabad","Gujarat",23.0225,72.5714,85,88,14],
  ["nagpur","Nagpur","Maharashtra",21.1458,79.0882,78,76,22],
  ["hyderabad","Hyderabad","Telangana",17.3850,78.4867,88,84,19],
  ["patna","Patna","Bihar",25.5941,85.1376,82,74,16],
  ["jaipur","Jaipur","Rajasthan",26.9124,75.7873,76,75,15],
  ["lucknow","Lucknow","Uttar Pradesh",26.8467,80.9462,79,72,21],
  ["chennai","Chennai","Tamil Nadu",13.0827,80.2707,86,90,17],
  ["kolkata","Kolkata","West Bengal",22.5726,88.3639,91,89,15],
  ["mumbai","Mumbai","Maharashtra",19.0760,72.8777,96,95,20],
  ["bhubaneswar","Bhubaneswar","Odisha",20.2961,85.8245,64,68,25],
  ["surat","Surat","Gujarat",21.1702,72.8311,79,86,18],
  ["bhopal","Bhopal","Madhya Pradesh",23.2599,77.4126,68,70,28],
  ["pune","Pune","Maharashtra",18.5204,73.8567,74,80,32],
  ["visakhapatnam","Visakhapatnam","Andhra Pradesh",17.6868,83.2185,66,71,35],
  ["chandigarh","Chandigarh","Punjab/Haryana",30.7333,76.7794,55,78,42],
  ["ludhiana","Ludhiana","Punjab",30.9010,75.8573,83,86,16],
  ["amritsar","Amritsar","Punjab",31.6340,74.8723,76,79,22],
  ["bathinda","Bathinda","Punjab",30.2110,74.9455,71,68,14],
  ["jalandhar","Jalandhar","Punjab",31.3260,75.5762,74,78,20],
  ["patiala","Patiala","Punjab",30.3398,76.3869,67,71,24],
  ["bengaluru","Bengaluru","Karnataka",12.9716,77.5946,84,87,36],
  ["kochi","Kochi","Kerala",9.9312,76.2673,60,73,46],
  ["guwahati","Guwahati","Assam",26.1445,91.7362,52,60,52],
  ["shimla","Shimla","Himachal Pradesh",31.1048,77.1734,32,45,75],
] as const;

const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";
const ARCHIVE_URL = "https://archive-api.open-meteo.com/v1/archive";

function scoreCity(maxTemp: number, hotDays: number, pop: number, urban: number, vegetation: number) {
  const temperatureIndex = Math.max(0, Math.min(100, (maxTemp - 30) / 18 * 100));
  const frequencyIndex = Math.min(100, hotDays / 7 * 100);
  const score = Math.round(
    temperatureIndex * .30 + frequencyIndex * .25 + pop * .20 + urban * .15 + (100 - vegetation) * .10
  );
  const tier: RiskTier = score >= 75 ? "very_high" : score >= 60 ? "high" : score >= 40 ? "moderate" : "low";
  return { score, tier };
}

export async function fetchLiveCities(): Promise<CityRisk[]> {
  const latitude = BASE_CITIES.map(c => c[3]).join(",");
  const longitude = BASE_CITIES.map(c => c[4]).join(",");
  const params = new URLSearchParams({
    latitude,
    longitude,
    daily: "temperature_2m_max,temperature_2m_min,apparent_temperature_max",
    past_days: "7",
    forecast_days: "7",
    timezone: "auto",
  });
  const response = await fetch(`${FORECAST_URL}?${params}`);
  if (!response.ok) throw new Error(`Weather provider returned ${response.status}`);
  const payload = await response.json();
  const results = Array.isArray(payload) ? payload : [payload];

  return BASE_CITIES.map((base, index) => {
    const daily = results[index]?.daily ?? {};
    const highs = (daily.temperature_2m_max ?? []).filter((v: number | null): v is number => v !== null);
    const recent = highs.slice(0, 7);
    const maxTemp = recent.length ? Math.max(...recent) : 0;
    const hotDays = recent.filter((v: number) => v >= 40).length;
    const [id, name, state, lat, lng, pop, urban, vegetation] = base;
    const { score, tier } = scoreCity(maxTemp, hotDays, pop, urban, vegetation);
    return {
      id, name, state, lat, lng,
      max_temp: Number(maxTemp.toFixed(1)),
      heatwave_days: hotDays,
      pop_exposure: pop,
      urbanization: urban,
      vegetation_cover: vegetation,
      score,
      tier,
      is_demo: false,
      source_note: "Live meteorological signal from Open-Meteo (7-day recent window). Context indicators remain project baseline values. Hot day = daily maximum ≥ 40°C; this is not an official IMD heatwave classification.",
    };
  });
}

export async function fetchRealTrends(): Promise<TrendPoint[]> {
  const end = new Date();
  end.setDate(end.getDate() - 5);
  const start = new Date(end);
  start.setFullYear(start.getFullYear() - 10);
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  const params = new URLSearchParams({
    latitude: "28.6139",
    longitude: "77.2090",
    start_date: iso(start),
    end_date: iso(end),
    daily: "temperature_2m_max,temperature_2m_min",
    timezone: "Asia/Kolkata",
  });
  const response = await fetch(`${ARCHIVE_URL}?${params}`);
  if (!response.ok) throw new Error(`Historical provider returned ${response.status}`);
  const payload = await response.json();
  const daily = payload.daily ?? {};
  const years: Record<string, { high: number[]; low: number[] }> = {};

  (daily.time ?? []).forEach((day: string, i: number) => {
    const high = daily.temperature_2m_max?.[i];
    const low = daily.temperature_2m_min?.[i];
    if (high == null || low == null) return;
    const year = day.slice(0, 4);
    (years[year] ??= { high: [], low: [] }).high.push(Number(high));
    years[year].low.push(Number(low));
  });

  return Object.entries(years).sort(([a], [b]) => a.localeCompare(b)).map(([year, values]) => ({
    year,
    frequency: values.high.filter(v => v >= 40).length,
    day_temperature: Number((values.high.reduce((a,b) => a+b, 0) / values.high.length).toFixed(1)),
    night_temperature: Number((values.low.reduce((a,b) => a+b, 0) / values.low.length).toFixed(1)),
  }));
}