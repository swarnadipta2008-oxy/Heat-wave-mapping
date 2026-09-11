/** Educational temperature-based screening model, not a validated health-risk model. */
export type Tier = 'low' | 'moderate' | 'high' | 'very_high';
export type HeatInputs = { peak: number; hotDays: number; warmNights: number };
export type Daily = { date: string; high: number; low: number };
export type City = HeatInputs & {
  id: string; name: string; state: string; lat: number; lng: number;
  year: number; days: number; gridLat: number; gridLng: number;
  monthly: { month: number; high: number; low: number; hotDays: number }[];
  daily: Daily[];
};
export const tierMeta: Record<Tier, { label: string; color: string; tint: string }> = {
  low: { label: 'Low', color: '#388374', tint: '#e5f0eb' },
  moderate: { label: 'Moderate', color: '#9d791e', tint: '#f5efd7' },
  high: { label: 'High', color: '#d66b2d', tint: '#fbeada' },
  very_high: { label: 'Very high', color: '#c84b3d', tint: '#f7e3df' },
};
export const clamp = (n: number, min = 0, max = 100) => Math.min(max, Math.max(min, n));
export function scoreHeat(input: HeatInputs) {
  if (![input.peak, input.hotDays, input.warmNights].every(Number.isFinite)) throw new Error('Heat inputs must be finite numbers');
  const components = [clamp((input.peak - 30) / 18 * 100) * .45, clamp(input.hotDays / 60 * 100) * .35, clamp(input.warmNights / 150 * 100) * .20];
  const score = Math.round(components.reduce((a, b) => a + b, 0));
  const tier: Tier = score >= 75 ? 'very_high' : score >= 60 ? 'high' : score >= 40 ? 'moderate' : 'low';
  return { score, tier, components };
}
export const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export function csvFor(cities: City[]) {
  const quote = (v: unknown) => `"${String(v).replaceAll('"', '""')}"`;
  const header = ['city', 'state', 'year', 'peak_c', 'days_max_ge_40c', 'nights_min_ge_25c', 'valid_days', 'heat_index', 'index_tier', 'source', 'model_version'];
  const rows = cities.map(c => [c.name, c.state, c.year, c.peak, c.hotDays, c.warmNights, c.days, scoreHeat(c).score, scoreHeat(c).tier, 'Open-Meteo / ERA5; reanalysis', 'HM-1: peak45-hotdays35-warmnights20']);
  return [header, ...rows].map(r => r.map(quote).join(',')).join('\r\n');
}
export function downloadFile(content: string, filename: string, mime = 'text/csv;charset=utf-8') {
  const url = URL.createObjectURL(new Blob([content], { type: mime }));
  const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export async function fetchForecast(city: Pick<City, 'lat' | 'lng'>, signal?: AbortSignal): Promise<Daily[]> {
  const params = new URLSearchParams({ latitude: String(city.lat), longitude: String(city.lng), daily: 'temperature_2m_max,temperature_2m_min', forecast_days: '7', timezone: 'Asia/Kolkata' });
  const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`, { signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(15000)]) : AbortSignal.timeout(15000) });
  if (!res.ok) throw new Error('Weather provider is unavailable. Please retry.');
  const { daily } = await res.json();
  if (!daily || daily.time?.length !== 7 || daily.temperature_2m_max?.length !== 7 || daily.temperature_2m_min?.length !== 7) throw new Error('The provider returned an incomplete forecast. Please retry.');
  return daily.time.map((date: string, i: number) => {
    const high = daily.temperature_2m_max[i], low = daily.temperature_2m_min[i];
    if (!Number.isFinite(high) || !Number.isFinite(low)) throw new Error('Some forecast values are missing. Please retry.');
    return { date, high, low };
  });
}
