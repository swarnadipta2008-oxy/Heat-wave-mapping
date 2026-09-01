import { useMemo, useState } from "react";
import type { PointerEvent, ReactNode } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  Calculator,
  ChevronRight,
  CircleHelp,
  CloudSun,
  Droplets,
  ExternalLink,
  Leaf,
  MapPin,
  Menu,
  Navigation,
  Move,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  ThermometerSun,
  Trees,
  Users,
  Waves,
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Layers3,
  Zap,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { apiGet, apiPost } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type RiskTier = "low" | "moderate" | "high" | "very_high";

interface CityRisk {
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

interface TrendPoint {
  year: string;
  frequency: number;
  day_temperature: number;
  night_temperature: number;
}

interface RiskCalculationRequest {
  max_temp: number;
  heatwave_days: number;
  pop_exposure: number;
  urbanization: number;
  vegetation_cover: number;
}

interface RiskCalculationResponse {
  score: number;
  tier: RiskTier;
  components: Record<string, number>;
  formula: string;
}

const tierMeta: Record<RiskTier, { label: string; color: string; bg: string; border: string }> = {
  low: { label: "Low Risk", color: "#10B981", bg: "rgba(16,185,129,.14)", border: "rgba(16,185,129,.35)" },
  moderate: { label: "Moderate Risk", color: "#F59E0B", bg: "rgba(245,158,11,.14)", border: "rgba(245,158,11,.35)" },
  high: { label: "High Risk", color: "#F97316", bg: "rgba(249,115,22,.14)", border: "rgba(249,115,22,.35)" },
  very_high: { label: "Very High Risk", color: "#EF4444", bg: "rgba(239,68,68,.16)", border: "rgba(239,68,68,.4)" },
};

const navItems = [
  ["map", "Map"], ["dashboard", "Dashboard"], ["compare", "Compare"], ["trends", "Trends"],
  ["calculator", "Calculator"], ["safety", "Safety"], ["methodology", "Methodology"], ["sources", "Sources"],
];

const fetchCities = () => apiGet<CityRisk[]>("/heatmap/cities");
const fetchTrends = () => apiGet<TrendPoint[]>("/heatmap/trends");

type MapLayer = "cartographic" | "thermal" | "grid";

const projectPoint = (lng: number, lat: number) => ({
  x: 28 + (lng - 68) * 13.4,
  y: 18 + (37 - lat) * 15.5,
});

const polygonPath = (points: ReadonlyArray<readonly [number, number]>) => points.map(([lng, lat], index) => {
  const point = projectPoint(lng, lat);
  return `${index === 0 ? "M" : "L"} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`;
}).join(" ") + " Z";

const indiaOutline: Array<[number, number]> = [
  [80.22, 13.49], [80.05, 15.12], [80.35, 15.76], [80.95, 15.72], [81.36, 16.36], [82.28, 16.55], [82.32, 17.07], [84.12, 18.30], [84.95, 19.30], [86.41, 19.99], [87.03, 20.70], [86.89, 21.32], [88.18, 22.08], [87.93, 22.41], [88.25, 21.56], [88.67, 22.21], [88.71, 21.69], [88.83, 21.94], [89.10, 21.64], [88.87, 22.01], [89.07, 22.13], [88.99, 23.22], [88.56, 23.64], [88.74, 24.27], [88.01, 24.66], [88.45, 25.20], [89.01, 25.28], [88.10, 25.83], [88.52, 26.35], [88.40, 26.63], [88.83, 26.24], [89.09, 26.40], [89.35, 26.01], [89.69, 26.23], [89.84, 25.29], [92.43, 25.03], [92.17, 24.42], [91.38, 24.11], [91.16, 23.61], [91.63, 22.95], [91.96, 23.73], [92.27, 23.73], [92.61, 21.98], [92.73, 22.15], [92.92, 21.95], [93.21, 22.26], [93.13, 23.05], [93.39, 23.14], [93.35, 24.11], [94.17, 23.86], [94.72, 24.94], [94.63, 25.39], [95.19, 26.08], [95.15, 26.62], [96.30, 27.30], [97.15, 27.10], [96.90, 27.62], [97.39, 27.90], [97.40, 28.20], [96.26, 28.41], [96.62, 28.78], [96.53, 29.08], [96.17, 28.90], [96.39, 29.26], [96.09, 29.46], [95.41, 29.03], [94.62, 29.35], [93.93, 28.67], [93.34, 28.64], [92.56, 27.82], [91.54, 27.86], [91.65, 27.48], [92.12, 27.29], [92.06, 26.85], [89.13, 26.81], [88.75, 27.14], [88.83, 28.02], [88.13, 27.96], [88.03, 26.36], [85.21, 26.76], [84.15, 27.52], [82.74, 27.50], [82.71, 27.72], [81.90, 27.85], [80.07, 28.83], [80.37, 29.75], [81.02, 30.26], [79.41, 31.04], [79.09, 31.46], [78.88, 31.27], [78.77, 32.00], [78.44, 32.25], [78.53, 32.61], [78.77, 32.70], [78.98, 32.34], [79.63, 32.74], [79.33, 33.01], [79.45, 33.26], [78.95, 33.38], [78.90, 33.98], [79.43, 34.02], [79.51, 34.47], [80.07, 34.71], [80.29, 35.61], [79.38, 35.99], [77.44, 35.46], [75.34, 37.05], [73.69, 36.91], [73.90, 36.71], [73.08, 36.70], [72.53, 35.92], [73.09, 35.88], [74.13, 35.11], [73.39, 34.37], [73.63, 33.09], [74.70, 32.84], [74.68, 32.49], [75.36, 32.23], [74.58, 31.86], [74.69, 31.08], [73.93, 30.46], [73.96, 30.19], [73.39, 29.94], [72.94, 29.02], [72.34, 28.72], [71.90, 27.96], [70.82, 27.70], [70.37, 28.01], [69.56, 27.14], [69.51, 26.74], [70.17, 26.55], [70.17, 25.83], [70.67, 25.70], [71.13, 24.39], [69.91, 24.16], [68.79, 24.30], [68.44, 23.45], [69.47, 22.77], [70.49, 23.08], [70.17, 22.55], [68.94, 22.28], [70.82, 20.69], [72.11, 21.20], [72.40, 22.36], [72.91, 22.25], [72.50, 21.93], [72.81, 21.66], [72.60, 21.56], [72.90, 20.60], [72.65, 19.83], [72.80, 18.95], [73.03, 19.00], [72.86, 18.65], [73.31, 16.53], [74.36, 14.52], [75.17, 12.06], [75.74, 11.35], [76.54, 8.91], [77.00, 8.36], [77.55, 8.08], [78.07, 8.37], [78.21, 8.97], [79.16, 9.28], [78.90, 9.49], [79.27, 10.24], [79.88, 10.29], [79.76, 11.64], [80.26, 12.78], [80.22, 13.49],
];

const markerOffsets: Record<string, { x: number; y: number; labelX: number }> = {
  amritsar: { x: -20, y: -12, labelX: -58 },
  jalandhar: { x: 18, y: -9, labelX: 8 },
  ludhiana: { x: 18, y: 10, labelX: 8 },
  bathinda: { x: -22, y: 19, labelX: -51 },
  patiala: { x: 24, y: 29, labelX: 8 },
  chandigarh: { x: 25, y: -25, labelX: 8 },
};

const mapRegions = [
  { id: "punjab", label: "Punjab", matches: ["punjab"], points: [[74.0, 32.4], [77.0, 32.2], [77.4, 29.2], [73.8, 29.6]] },
  { id: "rajasthan", label: "Rajasthan", matches: ["rajasthan"], points: [[68.5, 29.0], [75.0, 31.6], [78.5, 28.0], [76.5, 23.0], [70.0, 24.0]] },
  { id: "indo-gangetic", label: "Indo-Gangetic plain", matches: ["delhi", "uttar pradesh", "bihar", "west bengal", "punjab"], points: [[74.0, 32.0], [95.2, 29.0], [94.0, 22.0], [82.0, 23.0], [75.0, 26.0]] },
  { id: "western-plateau", label: "Western & central plateau", matches: ["gujarat", "madhya pradesh", "maharashtra"], points: [[68.5, 24.0], [82.0, 25.0], [84.5, 16.0], [74.0, 15.0], [69.0, 20.0]] },
  { id: "deccan", label: "Deccan peninsula", matches: ["telangana", "karnataka", "andhra", "tamil", "kerala", "odisha"], points: [[75.0, 20.0], [86.0, 19.0], [82.0, 9.0], [75.0, 8.0], [72.0, 16.0]] },
  { id: "northeast", label: "Northeast", matches: ["assam"], points: [[88.0, 30.0], [96.0, 28.0], [95.0, 23.0], [90.0, 22.0], [87.0, 25.0]] },
] as const;

function RiskBadge({ tier, compact = false }: { tier: RiskTier; compact?: boolean }) {
  const meta = tierMeta[tier];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[.12em] ${compact ? "px-2 py-0.5 text-[9px]" : ""}`}
      style={{ color: meta.color, backgroundColor: meta.bg, borderColor: meta.border }}
      data-testid={`risk-badge-${tier}`}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: meta.color }} />{meta.label}
    </span>
  );
}

function SectionHeading({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: ReactNode }) {
  return (
    <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <p className="eyebrow" data-testid={`section-eyebrow-${eyebrow.toLowerCase().replaceAll(" ", "-")}`}>{eyebrow}</p>
        <h2 className="mt-2 font-heading text-2xl font-bold tracking-tight text-white sm:text-3xl" data-testid={`section-title-${title.toLowerCase().replaceAll(" ", "-")}`}>{title}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400" data-testid={`section-description-${eyebrow.toLowerCase().replaceAll(" ", "-")}`}>{description}</p>
      </div>
      {action}
    </div>
  );
}

function MetricBar({ label, value, display, color = "#F97316" }: { label: string; value: number; display: string; color?: string }) {
  return (
    <div className="space-y-2" data-testid={`metric-${label.toLowerCase().replaceAll(" ", "-")}`}>
      <div className="flex items-center justify-between text-xs"><span className="text-slate-400">{label}</span><span className="font-mono text-slate-200">{display}</span></div>
      <div className="h-1.5 overflow-hidden rounded-full bg-white/[.07]"><motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(value, 100)}%` }} className="h-full rounded-full" style={{ backgroundColor: color }} /></div>
    </div>
  );
}

export default function Home() {
  const citiesQuery = useQuery({ queryKey: ["heatmap-cities"], queryFn: fetchCities, retry: false });
  const trendsQuery = useQuery({ queryKey: ["heatmap-trends"], queryFn: fetchTrends, retry: false });
  const cities = citiesQuery.data ?? [];
  const trends = trendsQuery.data ?? [];
  const [selectedId, setSelectedId] = useState("delhi");
  const [filter, setFilter] = useState<"all" | RiskTier>("all");
  const [search, setSearch] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [compareIds, setCompareIds] = useState(["delhi", "bengaluru", "kochi"]);
  const [calcValues, setCalcValues] = useState<RiskCalculationRequest>({ max_temp: 44, heatwave_days: 16, pop_exposure: 75, urbanization: 78, vegetation_cover: 24 });
  const [activeRegion, setActiveRegion] = useState("all");
  const [mapLayer, setMapLayer] = useState<MapLayer>("cartographic");
  const [mapView, setMapView] = useState({ scale: 1, x: 0, y: 0 });
  const [panStart, setPanStart] = useState<{ x: number; y: number } | null>(null);

  const selected = cities.find((city) => city.id === selectedId) ?? cities[0];
  const filteredCities = useMemo(() => cities.filter((city) => {
    const region = mapRegions.find((item) => item.id === activeRegion);
    const regionMatch = !region || region.matches.some((match) => city.state.toLowerCase().includes(match));
    return regionMatch && (filter === "all" || city.tier === filter) && city.name.toLowerCase().includes(search.toLowerCase());
  }), [cities, filter, search, activeRegion]);
  const highCount = cities.filter((city) => city.tier === "high" || city.tier === "very_high").length;
  const averageScore = cities.length ? (cities.reduce((sum, city) => sum + city.score, 0) / cities.length).toFixed(1) : "—";
  const highest = [...cities].sort((a, b) => b.score - a.score)[0];
  const distribution = (Object.keys(tierMeta) as RiskTier[]).map((tier) => ({ name: tierMeta[tier].label.replace(" Risk", ""), value: cities.filter((city) => city.tier === tier).length, color: tierMeta[tier].color }));
  const ranking = [...cities].sort((a, b) => b.score - a.score).slice(0, 8);
  const comparison = compareIds.map((id) => cities.find((city) => city.id === id)).filter((city): city is CityRisk => Boolean(city));
  const peakTemperature = cities.length ? Math.max(...cities.map((city) => city.max_temp)).toFixed(1) : "—";
  const previewScore = Math.round(((calcValues.max_temp - 30) / 18 * 100) * .3 + Math.min(100, calcValues.heatwave_days / 24 * 100) * .25 + calcValues.pop_exposure * .2 + calcValues.urbanization * .15 + (100 - calcValues.vegetation_cover) * .1);
  const calculateMutation = useMutation({ mutationFn: (payload: RiskCalculationRequest) => apiPost<RiskCalculationResponse>("/heatmap/calculate", payload) });

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  const selectCity = (id: string) => { setSelectedId(id); setTimeout(() => scrollTo("map"), 50); };
  const toggleCompare = (id: string) => setCompareIds((current) => current.includes(id) ? (current.length > 2 ? current.filter((item) => item !== id) : current) : (current.length < 4 ? [...current, id] : current));
  const zoomMap = (delta: number) => setMapView((current) => ({ ...current, scale: Math.min(3.2, Math.max(0.8, Number((current.scale + delta).toFixed(1)))) }));
  const resetMap = () => { setMapView({ scale: 1, x: 0, y: 0 }); setActiveRegion("all"); setMapLayer("cartographic"); };
  const handleMapPointerMove = (event: PointerEvent<SVGSVGElement>) => {
    if (!panStart) return;
    const dx = (event.clientX - panStart.x) / 2;
    const dy = (event.clientY - panStart.y) / 2;
    setMapView((current) => ({ ...current, x: Math.max(-120, Math.min(120, current.x + dx)), y: Math.max(-110, Math.min(110, current.y + dy)) }));
    setPanStart({ x: event.clientX, y: event.clientY });
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#0A0E17] text-slate-100">
      <header className="sticky top-0 z-50 border-b border-white/[.07] bg-[#0A0E17]/85 backdrop-blur-xl" data-testid="main-navbar">
        <div className="mx-auto flex max-w-[1480px] items-center justify-between px-5 py-3 lg:px-8">
          <a href="#overview" className="flex items-center gap-3" data-testid="brand-home-link">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-orange-400 to-red-600 shadow-lg shadow-orange-950/30"><ThermometerSun className="h-5 w-5 text-white" /></span>
            <span><span className="block font-heading text-sm font-bold tracking-tight text-white">HeatMap <span className="text-orange-400">India</span></span><span className="block font-mono text-[9px] uppercase tracking-[.18em] text-slate-500">EVS · CA1 PROJECT</span></span>
          </a>
          <nav className="hidden items-center gap-0.5 xl:flex" aria-label="Primary navigation">
            {navItems.map(([id, label]) => <a key={id} href={`#${id}`} className="rounded-lg px-2.5 py-2 text-[11px] font-medium text-slate-400 transition-colors hover:bg-white/[.06] hover:text-white" data-testid={`nav-link-${id}`}>{label}</a>)}
          </nav>
          <div className="flex items-center gap-2">
            <span className="hidden items-center gap-1.5 rounded-full border border-orange-400/20 bg-orange-400/[.08] px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-orange-300 sm:flex" data-testid="demo-data-badge"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-orange-400" /> Demo Data</span>
            <Button variant="outline" size="icon-sm" className="border-white/10 bg-white/[.04] text-slate-300 hover:bg-white/10 hover:text-white xl:hidden" onClick={() => setMobileMenu((open) => !open)} data-testid="mobile-menu-toggle-button" aria-label="Toggle menu">{mobileMenu ? <X /> : <Menu />}</Button>
          </div>
        </div>
        {mobileMenu && <div className="border-t border-white/[.07] px-5 py-3 xl:hidden" data-testid="mobile-navigation"><div className="grid grid-cols-2 gap-1">{navItems.map(([id, label]) => <a key={id} href={`#${id}`} onClick={() => setMobileMenu(false)} className="rounded-lg px-3 py-2 text-xs text-slate-300 hover:bg-white/[.06]" data-testid={`mobile-nav-link-${id}`}>{label}</a>)}</div></div>}
      </header>

      <main>
        <section id="overview" className="relative mx-auto max-w-[1480px] px-5 pb-16 pt-14 lg:px-8 lg:pb-24 lg:pt-24" data-testid="hero-overview-section">
          <div className="pointer-events-none absolute -right-32 -top-40 h-[520px] w-[520px] rounded-full bg-orange-500/[.07] blur-[110px]" />
          <div className="grid items-center gap-12 lg:grid-cols-[1.15fr_.85fr]">
            <div className="relative">
              <div className="mb-6 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.24em] text-orange-400"><span className="h-px w-8 bg-orange-400" /> Digital climate intelligence</div>
              <h1 className="max-w-4xl font-heading text-4xl font-bold leading-[1.05] tracking-[-.04em] text-white sm:text-6xl lg:text-[72px]" data-testid="hero-title">Digital Heatwave<br /><span className="text-gradient">Risk Mapping</span><br /><span className="text-slate-400">for Indian Cities</span></h1>
              <p className="mt-7 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg" data-testid="hero-subtitle">Using digital technology to visualize and understand urban heatwave risk. An interactive Environmental Studies CA1 project for clearer climate awareness.</p>
              <div className="mt-8 flex flex-wrap gap-3"><Button onClick={() => scrollTo("map")} className="h-11 bg-orange-500 px-5 text-sm text-white shadow-lg shadow-orange-950/30 hover:bg-orange-400" data-testid="hero-explore-map-button"><MapPin className="mr-2 h-4 w-4" /> Explore risk map <ChevronRight className="ml-1 h-4 w-4" /></Button><Button onClick={() => scrollTo("calculator")} variant="outline" className="h-11 border-white/10 bg-white/[.04] px-5 text-slate-200 hover:bg-white/10" data-testid="hero-calculator-button"><Calculator className="mr-2 h-4 w-4" /> Try the calculator</Button></div>
              <div className="mt-12 flex flex-wrap gap-8 border-t border-white/[.08] pt-6"><div><p className="font-mono text-2xl font-bold text-white">{cities.length || 25}</p><p className="mt-1 text-[10px] uppercase tracking-widest text-slate-500">Cities monitored</p></div><div><p className="font-mono text-2xl font-bold text-orange-400">{highCount}</p><p className="mt-1 text-[10px] uppercase tracking-widest text-slate-500">Critical hotspots</p></div><div><p className="font-mono text-2xl font-bold text-white">{peakTemperature}°</p><p className="mt-1 text-[10px] uppercase tracking-widest text-slate-500">Demo peak °C</p></div></div>
            </div>
            <div className="relative mx-auto w-full max-w-[500px] lg:ml-auto" data-testid="hero-signal-panel">
              <div className="thermal-panel relative overflow-hidden rounded-3xl p-6 sm:p-8"><div className="absolute inset-0 opacity-30" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.06) 1px, transparent 1px)", backgroundSize: "32px 32px" }} /><div className="relative"><div className="flex items-start justify-between"><div><p className="eyebrow text-orange-300">National risk signal</p><p className="mt-2 font-heading text-5xl font-bold text-white">{averageScore}<span className="text-2xl text-slate-500">/100</span></p></div><span className="rounded-xl border border-red-400/20 bg-red-400/10 p-3 text-red-300"><Activity className="h-6 w-6" /></span></div><div className="mt-8 h-32"><ResponsiveContainer width="100%" height="100%"><AreaChart data={trends}><defs><linearGradient id="heroFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#F97316" stopOpacity={.5} /><stop offset="100%" stopColor="#F97316" stopOpacity={0} /></linearGradient></defs><Area type="monotone" dataKey="day_temperature" stroke="#FB923C" strokeWidth={2} fill="url(#heroFill)" dot={false} /></AreaChart></ResponsiveContainer></div><div className="flex items-center justify-between border-t border-white/[.08] pt-4 text-xs"><span className="text-slate-400">10-year temperature trend</span><span className="flex items-center gap-1.5 font-mono text-orange-300"><ArrowUpRight className="h-3.5 w-3.5" /> +2.4°C index</span></div></div></div><div className="absolute -bottom-4 -left-5 rounded-xl border border-emerald-400/20 bg-[#111827] px-4 py-3 shadow-2xl"><p className="text-[10px] uppercase tracking-widest text-slate-500">Coverage status</p><p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-emerald-300"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Ready for exploration</p></div>
            </div>
          </div>
        </section>

        <section id="map" className="section-shell scroll-mt-20" data-testid="interactive-map-section">
          <SectionHeading eyebrow="01 / Interactive atlas" title="India heat risk map" description="Select a city marker to inspect its educational risk profile. Filters and search update the map in real time." action={<span className="flex items-center gap-2 rounded-full border border-orange-400/20 bg-orange-400/[.07] px-3 py-2 text-[10px] uppercase tracking-wider text-orange-300"><Navigation className="h-3.5 w-3.5" /> {filteredCities.length} visible nodes</span>} />
          <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"><div className="relative max-w-sm flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search a city..." className="h-10 w-full rounded-lg border border-white/10 bg-white/[.04] pl-10 pr-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-orange-400/50" data-testid="city-search-input" />{search && <div className="absolute left-0 right-0 top-12 z-20 rounded-xl border border-white/10 bg-[#151d2c] p-1 shadow-2xl">{filteredCities.slice(0, 5).map((city) => <button key={city.id} onClick={() => { selectCity(city.id); setSearch(city.name); }} className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs hover:bg-white/[.07]" data-testid={`search-result-${city.id}`}><span className="text-slate-200">{city.name}</span><span className="font-mono text-slate-500">{city.score}</span></button>)}</div>}</div><div className="flex flex-wrap gap-1.5" data-testid="risk-filter-group">{(["all", "very_high", "high", "moderate", "low"] as const).map((tier) => <button key={tier} onClick={() => setFilter(tier)} className={`rounded-full border px-3 py-2 text-[10px] font-semibold uppercase tracking-wider transition-colors ${filter === tier ? "border-orange-400/50 bg-orange-400/15 text-orange-300" : "border-white/10 text-slate-500 hover:border-white/20 hover:text-slate-300"}`} data-testid={`risk-filter-${tier}`}>{tier === "all" ? "All cities" : tierMeta[tier].label}</button>)}</div></div>
          <div className="mb-5 flex flex-wrap items-center gap-3 rounded-xl border border-white/[.07] bg-white/[.025] p-3" data-testid="map-toolkit"><div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-slate-500"><Layers3 className="h-3.5 w-3.5 text-orange-300" /> Map layers</div><select value={mapLayer} onChange={(event) => setMapLayer(event.target.value as MapLayer)} className="h-8 rounded-lg border border-white/10 bg-[#111827] px-2 text-xs text-slate-200 outline-none focus:border-orange-400/50" data-testid="map-layer-selector" aria-label="Map layer"><option value="cartographic">Cartographic vector</option><option value="thermal">Thermal overlay</option><option value="grid">Tactical grid</option></select><span className="h-5 w-px bg-white/10" /><label className="text-[10px] uppercase tracking-wider text-slate-500" htmlFor="map-region-filter">Region focus</label><select id="map-region-filter" value={activeRegion} onChange={(event) => setActiveRegion(event.target.value)} className="h-8 rounded-lg border border-white/10 bg-[#111827] px-2 text-xs text-slate-200 outline-none focus:border-orange-400/50" data-testid="map-region-filter"><option value="all">All India</option>{mapRegions.map((region) => <option key={region.id} value={region.id}>{region.label}</option>)}</select>{activeRegion !== "all" && <button type="button" onClick={() => setActiveRegion("all")} className="rounded-lg px-2 py-1.5 text-[10px] text-orange-300 hover:bg-orange-400/10" data-testid="clear-map-region-button">Clear region</button>}<div className="flex items-center gap-1 rounded-lg border border-white/[.08] bg-[#111827] p-1" data-testid="map-navigation-controls"><button type="button" onClick={() => zoomMap(.2)} className="map-control-button" data-testid="map-zoom-in" aria-label="Zoom in"><ZoomIn className="h-4 w-4" /></button><button type="button" onClick={() => zoomMap(-.2)} className="map-control-button" data-testid="map-zoom-out" aria-label="Zoom out"><ZoomOut className="h-4 w-4" /></button><button type="button" onClick={resetMap} className="map-control-button" data-testid="map-reset-view" aria-label="Reset map view"><RotateCcw className="h-4 w-4" /></button></div><span className="ml-auto hidden text-[10px] text-slate-500 sm:inline">Click a shaded region or marker · drag to pan</span></div>
          <div className="grid gap-5 xl:grid-cols-[1.65fr_1fr]">
            <div className="map-shell relative min-h-[520px] overflow-hidden rounded-2xl border border-white/[.08] bg-[#0c1421]" data-testid="india-map-canvas">
              <div className="absolute inset-0 opacity-50" style={{ backgroundImage: "linear-gradient(rgba(148,163,184,.06) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,.06) 1px, transparent 1px)", backgroundSize: "48px 48px" }} />
              <div className="absolute left-5 top-5 z-20 flex items-center gap-2"><span className="rounded-md border border-white/10 bg-[#111827]/85 px-2.5 py-1.5 font-mono text-[9px] uppercase tracking-widest text-slate-400">INDIA / VECTOR ATLAS</span><span className="hidden rounded-md border border-emerald-400/20 bg-emerald-400/[.08] px-2.5 py-1.5 font-mono text-[9px] uppercase tracking-widest text-emerald-300 sm:inline">{mapView.scale.toFixed(1)}× VIEW</span></div>
              <div className="absolute right-5 top-5 z-20 hidden rounded-md border border-white/10 bg-[#111827]/85 px-2.5 py-1.5 font-mono text-[9px] uppercase tracking-widest text-slate-500 sm:block">CALIBRATED LAT / LNG · DEMO</div>
              <div className="absolute bottom-5 left-5 z-20 flex max-w-[calc(100%-2.5rem)] flex-wrap gap-3 rounded-lg border border-white/[.08] bg-[#111827]/90 px-3 py-2 backdrop-blur" data-testid="map-risk-legend"><span className="text-[10px] text-slate-500">Risk tier</span>{(Object.keys(tierMeta) as RiskTier[]).map((tier) => <span key={tier} className="flex items-center gap-1.5 text-[10px] text-slate-400"><i className="h-2 w-2 rounded-full" style={{ background: tierMeta[tier].color }} />{tierMeta[tier].label.replace(" Risk", "")}</span>)}</div>
              <svg className={`absolute inset-0 h-full w-full ${panStart ? "cursor-grabbing" : "cursor-grab"}`} viewBox="0 0 460 520" role="img" aria-label="Accurate vector outline of India with clickable regional zones and city heat-risk markers" onPointerDown={(event) => { if (event.button === 0) setPanStart({ x: event.clientX, y: event.clientY }); }} onPointerMove={handleMapPointerMove} onPointerUp={() => setPanStart(null)} onPointerLeave={() => setPanStart(null)} data-testid="india-map-svg">
                <defs><linearGradient id="indiaMapFill" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#29465a" /><stop offset="1" stopColor="#102031" /></linearGradient><linearGradient id="thermalOverlay" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#EF4444" stopOpacity=".42" /><stop offset=".42" stopColor="#F97316" stopOpacity=".24" /><stop offset="1" stopColor="#10B981" stopOpacity=".13" /></linearGradient><clipPath id="indiaShapeClip"><path d={polygonPath(indiaOutline)} /></clipPath></defs>
                <g transform={`translate(${mapView.x} ${mapView.y}) scale(${mapView.scale})`}>
                  <path d={polygonPath(indiaOutline)} fill="url(#indiaMapFill)" stroke="#9bb5c2" strokeWidth="1.2" vectorEffect="non-scaling-stroke" data-testid="india-boundary-path" />
                  <g clipPath="url(#indiaShapeClip)">{mapLayer === "thermal" && <rect x="20" y="10" width="430" height="510" fill="url(#thermalOverlay)" data-testid="thermal-overlay" />}{mapLayer === "grid" && <g fill="none" stroke="#38BDF8" strokeOpacity=".25" strokeWidth=".45" strokeDasharray="3 3">{[22, 28, 34].map((lat) => <path key={`lat-${lat}`} d={`M 20 ${projectPoint(68, lat).y} H 440`} />)}{[72, 80, 88, 94].map((lng) => <path key={`lng-${lng}`} d={`M ${projectPoint(lng, 7).x} 5 V 510`} />)}</g>}<g fill="none" stroke="#a6bcc5" strokeOpacity=".42" strokeWidth=".6" strokeDasharray="2.5 2.5">{mapRegions.map((region) => <path key={region.id} d={polygonPath(region.points)} />)}</g></g>
                  <g fill="#c5d3da" fontFamily="IBM Plex Sans, sans-serif" fontSize="8" fontWeight="600" letterSpacing=".4" pointerEvents="none"><text x={projectPoint(75.2, 34.1).x} y={projectPoint(75.2, 34.1).y}>J&amp;K / LADAKH</text><text x={projectPoint(75.0, 31.3).x} y={projectPoint(75.0, 31.3).y}>PUNJAB</text><text x={projectPoint(71.2, 27.1).x} y={projectPoint(71.2, 27.1).y}>RAJASTHAN</text><text x={projectPoint(80.0, 26.7).x} y={projectPoint(80.0, 26.7).y}>U.P.</text><text x={projectPoint(78.8, 22.9).x} y={projectPoint(78.8, 22.9).y}>M.P.</text><text x={projectPoint(72.0, 22.0).x} y={projectPoint(72.0, 22.0).y}>GUJARAT</text><text x={projectPoint(75.0, 18.5).x} y={projectPoint(75.0, 18.5).y}>MAHARASHTRA</text><text x={projectPoint(78.0, 14.5).x} y={projectPoint(78.0, 14.5).y}>KARNATAKA</text><text x={projectPoint(80.0, 17.0).x} y={projectPoint(80.0, 17.0).y}>TELANGANA</text><text x={projectPoint(87.0, 22.5).x} y={projectPoint(87.0, 22.5).y}>ODISHA</text><text x={projectPoint(92.0, 25.5).x} y={projectPoint(92.0, 25.5).y}>ASSAM</text></g>
                  {mapRegions.slice().reverse().map((region) => <path key={`click-${region.id}`} d={polygonPath(region.points)} fill="transparent" stroke="transparent" strokeWidth="10" className="cursor-pointer" onPointerDown={(event) => event.stopPropagation()} onClick={() => setActiveRegion((current) => current === region.id ? "all" : region.id)} data-testid={`map-region-${region.id}`} aria-label={`Filter ${region.label}`} role="button" tabIndex={0} />)}
                  {filteredCities.map((city) => { const position = projectPoint(city.lng, city.lat); const offset = markerOffsets[city.id] ?? { x: 0, y: 0, labelX: 7 }; const display = { x: position.x + offset.x, y: position.y + offset.y }; const meta = tierMeta[city.tier]; return <g key={city.id} className="cursor-pointer" onPointerDown={(event) => event.stopPropagation()} onClick={() => selectCity(city.id)}>{offset.x !== 0 && <line x1={position.x} y1={position.y} x2={display.x} y2={display.y} stroke={meta.color} strokeOpacity=".55" strokeWidth=".8" strokeDasharray="2 2" pointerEvents="none" />}<circle cx={display.x} cy={display.y} r="11" fill="transparent" data-testid={`city-marker-${city.id}`} role="button" tabIndex={0} aria-label={`Select ${city.name}`} /><circle cx={display.x} cy={display.y} r={selectedId === city.id ? 9 : 6} fill={meta.color} fillOpacity=".18" stroke={meta.color} strokeWidth={selectedId === city.id ? 2 : 1.3} pointerEvents="none" /><circle cx={display.x} cy={display.y} r={selectedId === city.id ? 4 : 3} fill={meta.color} stroke="#f8fafc" strokeWidth="1" pointerEvents="none" /><text x={display.x + offset.labelX} y={display.y - 7} fill="#e2e8f0" fontSize="8" fontFamily="IBM Plex Sans, sans-serif" fontWeight="600" pointerEvents="none" className={selectedId === city.id ? "map-city-label-active" : "map-city-label"}>{city.name}</text></g> })}
                  <path d="M 115 466 C 126 473 130 488 121 498 C 111 504 103 490 108 478 Z" fill="#10B981" opacity=".55" stroke="#9ee7c9" strokeWidth=".8" /><text x="100" y="512" fill="#94A3B8" fontSize="7">LAKSHADWEEP / ANDAMAN ISLANDS</text>
                </g>
              </svg>
              <div className="absolute bottom-5 right-5 z-20 hidden items-center gap-2 rounded-lg border border-white/[.08] bg-[#111827]/90 px-3 py-2 text-[10px] text-slate-400 backdrop-blur sm:flex"><Move className="h-3.5 w-3.5 text-sky-300" /> Drag map to pan</div>
            </div>
            <div className="dashboard-card flex min-h-[520px] flex-col rounded-2xl p-6" data-testid="selected-city-inspector">{selected ? <><div className="flex items-start justify-between"><div><p className="eyebrow">City risk inspector</p><h3 className="mt-2 font-heading text-2xl font-bold text-white" data-testid="selected-city-name">{selected.name}</h3><p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500"><MapPin className="h-3.5 w-3.5" />{selected.state} · {selected.lat.toFixed(2)}°N, {selected.lng.toFixed(2)}°E</p></div><RiskBadge tier={selected.tier} /></div><div className="mt-7 flex items-end justify-between border-b border-white/[.08] pb-5"><div><p className="text-[10px] uppercase tracking-widest text-slate-500">Overall risk score</p><p className="mt-1 font-mono text-5xl font-bold" style={{ color: tierMeta[selected.tier].color }} data-testid="selected-city-score">{selected.score}<span className="text-xl text-slate-600"> / 100</span></p></div><div className="text-right"><p className="font-mono text-2xl font-semibold text-white">{selected.max_temp}°C</p><p className="text-[10px] uppercase tracking-widest text-slate-500">demo max temp</p></div></div><div className="mt-6 space-y-5"><MetricBar label="Temperature signal" value={(selected.max_temp - 30) / 18 * 100} display={`${selected.max_temp}°C`} color="#EF4444" /><MetricBar label="Heatwave frequency" value={selected.heatwave_days / 24 * 100} display={`${selected.heatwave_days} days / yr`} color="#F97316" /><MetricBar label="Population exposure" value={selected.pop_exposure} display={`${selected.pop_exposure} / 100`} color="#F59E0B" /><MetricBar label="Urbanization" value={selected.urbanization} display={`${selected.urbanization}%`} color="#A78BFA" /><MetricBar label="Green cover · cooling buffer" value={selected.vegetation_cover} display={`${selected.vegetation_cover}%`} color="#10B981" /></div><div className="mt-auto flex items-start gap-2 rounded-xl border border-orange-400/15 bg-orange-400/[.06] p-3 text-xs leading-5 text-slate-400" data-testid="selected-city-data-note"><CircleHelp className="mt-0.5 h-4 w-4 shrink-0 text-orange-300" /><span>Values shown are demonstration indicators for academic visualization, not official measurements.<br /><span className="text-slate-500">Source-ready note: {selected.source_note}</span></span></div></> : <div className="grid flex-1 place-items-center text-sm text-slate-500">Loading city data…</div>}</div>
          </div>
        </section>

        <section id="dashboard" className="section-shell scroll-mt-20" data-testid="city-risk-dashboard-section">
          <SectionHeading eyebrow="02 / Risk dashboard" title="A national view of exposure" description="Use the snapshot to identify concentrations of risk before exploring the underlying indicators city by city." />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><div className="kpi-card" data-testid="kpi-total-cities"><span className="kpi-icon text-sky-300"><MapPin /></span><p className="kpi-label">Cities monitored</p><p className="kpi-value">{cities.length || 20}</p><p className="kpi-note text-sky-300">Across 15 states / UTs</p></div><div className="kpi-card" data-testid="kpi-critical-cities"><span className="kpi-icon text-red-300"><Zap /></span><p className="kpi-label">High + very high</p><p className="kpi-value">{highCount || 12}</p><p className="kpi-note text-red-300">{cities.length ? Math.round(highCount / cities.length * 100) : 60}% of monitored cities</p></div><div className="kpi-card" data-testid="kpi-average-score"><span className="kpi-icon text-orange-300"><Activity /></span><p className="kpi-label">Average risk score</p><p className="kpi-value">{averageScore}</p><p className="kpi-note text-orange-300">National demo index</p></div><div className="kpi-card" data-testid="kpi-highest-city"><span className="kpi-icon text-amber-300"><ThermometerSun /></span><p className="kpi-label">Highest-risk city</p><p className="kpi-value text-2xl">{highest?.name ?? "Delhi (NCR)"}</p><p className="kpi-note text-amber-300">Score {highest?.score ?? 88} / 100</p></div></div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1.35fr_.85fr]"><div className="dashboard-card rounded-2xl p-5 sm:p-6" data-testid="city-ranking-chart"><div className="mb-5 flex items-center justify-between"><div><p className="eyebrow">Comparative ranking</p><h3 className="mt-1 font-heading text-lg font-semibold text-white">City risk index</h3></div><Badge variant="outline" className="border-white/10 text-[10px] text-slate-400">Top 8</Badge></div><div className="h-[290px]"><ResponsiveContainer width="100%" height="100%"><BarChart data={ranking} layout="vertical" margin={{ left: 8, right: 16 }}><CartesianGrid horizontal={false} stroke="rgba(148,163,184,.1)" /><XAxis type="number" domain={[0, 100]} tick={{ fill: "#64748B", fontSize: 10 }} axisLine={false} tickLine={false} /><YAxis type="category" dataKey="name" width={92} tick={{ fill: "#94A3B8", fontSize: 10 }} axisLine={false} tickLine={false} /><Tooltip contentStyle={{ background: "#111827", border: "1px solid rgba(255,255,255,.1)", borderRadius: 10, fontSize: 11 }} cursor={{ fill: "rgba(255,255,255,.03)" }} /><Bar dataKey="score" name="Risk score" radius={[0, 4, 4, 0]}>{ranking.map((city) => <Cell key={city.id} fill={tierMeta[city.tier].color} />)}</Bar></BarChart></ResponsiveContainer></div></div><div className="dashboard-card rounded-2xl p-5 sm:p-6" data-testid="risk-distribution-chart"><div className="mb-1"><p className="eyebrow">Distribution</p><h3 className="mt-1 font-heading text-lg font-semibold text-white">Risk tier mix</h3></div><div className="relative h-[225px]"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={distribution} dataKey="value" nameKey="name" innerRadius={60} outerRadius={86} paddingAngle={3} stroke="none">{distribution.map((item) => <Cell key={item.name} fill={item.color} />)}</Pie><Tooltip contentStyle={{ background: "#111827", border: "1px solid rgba(255,255,255,.1)", borderRadius: 10, fontSize: 11 }} /></PieChart></ResponsiveContainer><div className="pointer-events-none absolute inset-0 grid place-items-center"><div className="text-center"><p className="font-mono text-2xl font-bold text-white">{cities.length || 20}</p><p className="text-[9px] uppercase tracking-widest text-slate-500">cities</p></div></div></div><div className="grid grid-cols-2 gap-2">{distribution.map((item) => <div key={item.name} className="flex items-center justify-between text-[10px] text-slate-400" data-testid={`distribution-${item.name.toLowerCase()}`}><span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />{item.name}</span><span className="font-mono text-slate-200">{item.value}</span></div>)}</div></div></div>
        </section>

        <section id="compare" className="section-shell scroll-mt-20" data-testid="city-comparison-section">
          <SectionHeading eyebrow="03 / Comparison engine" title="Put cities side by side" description="Choose 2–4 cities to compare their five risk dimensions. This makes the scoring framework visible, not just the final category." action={<span className="font-mono text-[10px] text-slate-500">{compareIds.length} / 4 selected</span>} />
          <div className="mb-5 flex gap-2 overflow-x-auto pb-2" data-testid="comparison-city-selector">{cities.map((city) => <button key={city.id} onClick={() => toggleCompare(city.id)} className={`flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2 text-left transition-all ${compareIds.includes(city.id) ? "border-orange-400/40 bg-orange-400/[.1]" : "border-white/[.08] bg-white/[.025] opacity-60 hover:opacity-100"}`} data-testid={`compare-toggle-${city.id}`}><span className="h-2 w-2 rounded-full" style={{ background: tierMeta[city.tier].color }} /><span className="text-[11px] text-slate-200">{city.name}</span>{compareIds.includes(city.id) && <span className="text-[10px] text-orange-300">✓</span>}</button>)}</div>
          <div className="grid gap-5 lg:grid-cols-[1fr_1fr]"><div className="dashboard-card rounded-2xl p-5 sm:p-6" data-testid="comparison-radar-chart"><div className="mb-3 flex items-center justify-between"><div><p className="eyebrow">Five dimensions</p><h3 className="mt-1 font-heading text-lg font-semibold text-white">Vulnerability profile</h3></div><SlidersHorizontal className="h-4 w-4 text-slate-500" /></div><div className="h-[350px]"><ResponsiveContainer width="100%" height="100%"><RadarChart data={["Temperature", "Frequency", "Exposure", "Urbanization", "Green buffer"].map((metric, index) => ({ metric, ...Object.fromEntries(comparison.map((city) => [city.id, [Math.min(100, (city.max_temp - 30) / 18 * 100), city.heatwave_days / 24 * 100, city.pop_exposure, city.urbanization, city.vegetation_cover][index]])) }))} outerRadius="67%"><PolarGrid stroke="rgba(148,163,184,.15)" /><PolarAngleAxis dataKey="metric" tick={{ fill: "#94A3B8", fontSize: 10 }} /><PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} /><Tooltip contentStyle={{ background: "#111827", border: "1px solid rgba(255,255,255,.1)", borderRadius: 10, fontSize: 11 }} /><Legend wrapperStyle={{ fontSize: 10, color: "#94A3B8" }} />{comparison.map((city, index) => <Radar key={city.id} name={city.name} dataKey={city.id} stroke={["#FB923C", "#38BDF8", "#34D399", "#A78BFA"][index]} fill={["#FB923C", "#38BDF8", "#34D399", "#A78BFA"][index]} fillOpacity={.12} />)}</RadarChart></ResponsiveContainer></div></div><div className="dashboard-card overflow-hidden rounded-2xl" data-testid="comparison-metrics-table"><div className="border-b border-white/[.08] p-5 sm:p-6"><p className="eyebrow">Metric delta</p><h3 className="mt-1 font-heading text-lg font-semibold text-white">Indicator matrix</h3></div><div className="overflow-x-auto"><table className="w-full min-w-[500px] text-left text-xs"><thead><tr className="border-b border-white/[.06] text-[10px] uppercase tracking-wider text-slate-500"><th className="px-5 py-3 font-medium">Indicator</th>{comparison.map((city) => <th key={city.id} className="px-3 py-3 font-medium">{city.name.split(" ")[0]}</th>)}</tr></thead><tbody>{[["Risk score", (city: CityRisk) => `${city.score}/100`], ["Max temperature", (city: CityRisk) => `${city.max_temp}°C`], ["Heatwave days", (city: CityRisk) => `${city.heatwave_days} / yr`], ["Population exposure", (city: CityRisk) => `${city.pop_exposure}%`], ["Urbanization", (city: CityRisk) => `${city.urbanization}%`], ["Green cover", (city: CityRisk) => `${city.vegetation_cover}%`]].map(([label, format]) => <tr key={label as string} className="border-b border-white/[.05] last:border-0"><td className="px-5 py-3 text-slate-400">{label as string}</td>{comparison.map((city) => <td key={city.id} className="px-3 py-3 font-mono text-slate-200">{(format as (city: CityRisk) => string)(city)}</td>)}</tr>)}<tr><td className="px-5 py-3 text-slate-400">Category</td>{comparison.map((city) => <td key={city.id} className="px-3 py-3"><RiskBadge tier={city.tier} compact /></td>)}</tr></tbody></table></div></div></div>
        </section>

        <section id="trends" className="section-shell scroll-mt-20" data-testid="heatwave-trends-section">
          <SectionHeading eyebrow="04 / Signals over time" title="Heatwave trends & urban heat" description="A demonstration series shows how frequency and day/night temperature signals can be read together. Replace the series with verified data when available." action={<span className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-slate-500"><span className="h-2 w-2 rounded-full bg-orange-400" /> Demo series · 2015–2024</span>} />
          <div className="grid gap-5 lg:grid-cols-[1.2fr_.8fr]"><div className="dashboard-card rounded-2xl p-5 sm:p-6" data-testid="temperature-trend-chart"><div className="mb-4 flex items-center justify-between"><div><p className="eyebrow">Thermal baseline</p><h3 className="mt-1 font-heading text-lg font-semibold text-white">Day vs night temperature</h3></div><CloudSun className="h-5 w-5 text-orange-300" /></div><div className="h-[280px]"><ResponsiveContainer width="100%" height="100%"><LineChart data={trends}><CartesianGrid stroke="rgba(148,163,184,.1)" vertical={false} /><XAxis dataKey="year" tick={{ fill: "#64748B", fontSize: 10 }} axisLine={false} tickLine={false} /><YAxis domain={[24, 44]} tick={{ fill: "#64748B", fontSize: 10 }} axisLine={false} tickLine={false} unit="°" /><Tooltip contentStyle={{ background: "#111827", border: "1px solid rgba(255,255,255,.1)", borderRadius: 10, fontSize: 11 }} /><Legend wrapperStyle={{ fontSize: 10 }} /><Line type="monotone" dataKey="day_temperature" name="Day temperature" stroke="#FB923C" strokeWidth={2.5} dot={false} /><Line type="monotone" dataKey="night_temperature" name="Night temperature" stroke="#38BDF8" strokeWidth={2.5} dot={false} /></LineChart></ResponsiveContainer></div></div><div className="dashboard-card rounded-2xl p-5 sm:p-6" data-testid="frequency-trend-chart"><div className="mb-4"><p className="eyebrow">Heatwave signal</p><h3 className="mt-1 font-heading text-lg font-semibold text-white">Frequency index</h3></div><div className="h-[280px]"><ResponsiveContainer width="100%" height="100%"><AreaChart data={trends}><defs><linearGradient id="frequencyFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#EF4444" stopOpacity={.45} /><stop offset="100%" stopColor="#EF4444" stopOpacity={0} /></linearGradient></defs><CartesianGrid stroke="rgba(148,163,184,.1)" vertical={false} /><XAxis dataKey="year" tick={{ fill: "#64748B", fontSize: 10 }} axisLine={false} tickLine={false} /><YAxis tick={{ fill: "#64748B", fontSize: 10 }} axisLine={false} tickLine={false} /><Tooltip contentStyle={{ background: "#111827", border: "1px solid rgba(255,255,255,.1)", borderRadius: 10, fontSize: 11 }} /><Area type="monotone" dataKey="frequency" name="Demo heatwave days" stroke="#EF4444" strokeWidth={2.5} fill="url(#frequencyFill)" /></AreaChart></ResponsiveContainer></div></div></div>
          <div className="mt-5 flex flex-col gap-3 rounded-xl border border-sky-400/15 bg-sky-400/[.05] p-4 text-xs leading-5 text-slate-400 sm:flex-row sm:items-center" data-testid="trend-data-disclaimer"><Waves className="h-5 w-5 shrink-0 text-sky-300" /><span><strong className="text-sky-200">Reading the chart:</strong> This is a visual demonstration series, not a verified historical record. The interface is structured so a future researcher can replace it with IMD, ERA5, or city heat-action-plan datasets.</span></div>
        </section>

        <section id="calculator" className="section-shell scroll-mt-20" data-testid="risk-calculator-section">
          <SectionHeading eyebrow="05 / Transparent model" title="Test the risk score" description="Adjust the five inputs to see how the weighted educational model responds. The same calculation is available through the project API." />
          <div className="grid gap-5 lg:grid-cols-[1fr_.8fr]"><div className="dashboard-card rounded-2xl p-5 sm:p-7" data-testid="risk-calculator-form"><div className="mb-6 flex items-center justify-between"><div><p className="eyebrow">Scenario simulator</p><h3 className="mt-1 font-heading text-lg font-semibold text-white">Build a city scenario</h3></div><Calculator className="h-5 w-5 text-orange-300" /></div><div className="grid gap-x-8 gap-y-6 sm:grid-cols-2">{([ ["max_temp", "Maximum temperature", `${calcValues.max_temp}°C`, 30, 48, 0.1], ["heatwave_days", "Heatwave days / year", `${calcValues.heatwave_days} days`, 0, 30, 1], ["pop_exposure", "Population exposure", `${calcValues.pop_exposure}%`, 0, 100, 1], ["urbanization", "Urbanization", `${calcValues.urbanization}%`, 0, 100, 1], ["vegetation_cover", "Green cover buffer", `${calcValues.vegetation_cover}%`, 0, 100, 1]] as const).map(([key, label, display, min, max, step]) => <label key={key} className="space-y-2" data-testid={`calculator-field-${key}`}><span className="flex items-center justify-between text-xs text-slate-400"><span>{label}</span><span className="font-mono text-orange-300">{display}</span></span><input type="range" min={min} max={max} step={step} value={calcValues[key]} onChange={(event) => setCalcValues((current) => ({ ...current, [key]: Number(event.target.value) }))} className="risk-slider w-full" data-testid={`calculator-slider-${key}`} /></label>)}</div><div className="mt-7 rounded-xl border border-white/[.07] bg-black/10 p-4"><p className="eyebrow">Model equation</p><p className="mt-2 text-xs leading-6 text-slate-400">Temperature <b className="text-orange-300">30%</b> + Frequency <b className="text-orange-300">25%</b> + Population <b className="text-orange-300">20%</b> + Urbanization <b className="text-orange-300">15%</b> + (100 − Vegetation) <b className="text-emerald-300">10%</b></p></div><Button onClick={() => calculateMutation.mutate(calcValues)} disabled={calculateMutation.isPending} className="mt-6 h-10 bg-orange-500 text-white hover:bg-orange-400" data-testid="calculate-risk-button">{calculateMutation.isPending ? "Calculating…" : "Calculate scenario score"}<ArrowUpRight className="ml-2 h-4 w-4" /></Button></div><div className="thermal-panel rounded-2xl p-6 sm:p-7" data-testid="calculator-result-panel"><p className="eyebrow text-orange-300">Live scenario preview</p><div className="mt-8 flex items-end justify-between"><div><p className="font-mono text-6xl font-bold text-white" data-testid="calculator-preview-score">{calculateMutation.data?.score ?? previewScore}</p><p className="mt-1 text-xs uppercase tracking-wider text-slate-500">out of 100</p></div><RiskBadge tier={calculateMutation.data?.tier ?? (previewScore >= 75 ? "very_high" : previewScore >= 60 ? "high" : previewScore >= 40 ? "moderate" : "low")} /></div><div className="mt-8 space-y-3"><div className="flex justify-between text-xs"><span className="text-slate-400">Hazard signal</span><span className="font-mono text-slate-200">{Math.round(((calcValues.max_temp - 30) / 18 * 100) * .3 + Math.min(100, calcValues.heatwave_days / 24 * 100) * .25)} pts</span></div><div className="h-2 rounded-full bg-white/[.08]"><div className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-orange-400 to-red-500" style={{ width: `${previewScore}%` }} /></div><p className="text-xs leading-5 text-slate-400">Higher green cover reduces the score because vegetation can provide shade and evaporative cooling.</p></div><div className="mt-8 border-t border-white/[.08] pt-4 text-[10px] uppercase tracking-wider text-slate-500">Educational simulation · not an official warning</div></div></div>
        </section>

        <section id="safety" className="section-shell scroll-mt-20" data-testid="safety-awareness-section">
          <SectionHeading eyebrow="06 / Heat health" title="Safety & awareness" description="Heat risk is a public-health issue. These simple actions can reduce exposure while official alerts and local heat action plans remain the authority." action={<span className="rounded-full border border-emerald-400/20 bg-emerald-400/[.07] px-3 py-2 text-[10px] uppercase tracking-wider text-emerald-300">Practical checklist</span>} />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><div className="advice-card" data-testid="safety-hydrate"><span className="advice-icon text-sky-300"><Droplets /></span><h3>Hydrate often</h3><p>Drink water regularly; do not wait until you feel thirsty.</p></div><div className="advice-card" data-testid="safety-avoid-peak"><span className="advice-icon text-orange-300"><SunIcon /></span><h3>Plan around peak heat</h3><p>Avoid unnecessary outdoor activity between 12 PM and 4 PM.</p></div><div className="advice-card" data-testid="safety-cooling"><span className="advice-icon text-emerald-300"><Leaf /></span><h3>Find shade & cooling</h3><p>Use shaded streets, cool spaces, light clothing, and ventilation.</p></div><div className="advice-card" data-testid="safety-community"><span className="advice-icon text-amber-300"><Users /></span><h3>Check on others</h3><p>Look out for older adults, children, outdoor workers, and neighbours.</p></div></div><div className="mt-4 flex flex-col items-start justify-between gap-4 rounded-2xl border border-red-400/20 bg-red-400/[.06] p-5 sm:flex-row sm:items-center" data-testid="official-alert-advisory"><div className="flex items-start gap-3"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-red-300" /><div><p className="text-sm font-semibold text-white">When symptoms appear, act quickly</p><p className="mt-1 text-xs leading-5 text-slate-400">Confusion, fainting, very hot skin, or seizures can signal heat stroke. Move to a cool place and seek emergency help.</p></div></div><span className="shrink-0 rounded-lg bg-red-400/10 px-3 py-2 font-mono text-xs text-red-200">Emergency: 108</span></div>
        </section>

        <section id="methodology" className="section-shell scroll-mt-20" data-testid="methodology-section">
          <SectionHeading eyebrow="07 / Academic context" title="Methodology & project scope" description="HeatMap India is a teaching product: it makes a risk-assessment workflow understandable and replaceable, rather than presenting itself as an operational warning system." />
          <div className="grid gap-5 lg:grid-cols-[1fr_1fr]"><div className="dashboard-card rounded-2xl p-6 sm:p-7" data-testid="methodology-model-card"><div className="flex items-start gap-4"><span className="number-chip">01</span><div><h3 className="font-heading text-lg font-semibold text-white">Hazard × exposure × context</h3><p className="mt-2 text-sm leading-6 text-slate-400">The demonstration combines a temperature signal and heatwave frequency with population exposure, urbanization pressure, and a vegetation cooling buffer. Each input is normalized to a 0–100 index.</p></div></div><div className="my-7 flex flex-wrap items-center gap-2 text-xs"><span className="formula-chip">Temperature <b>30%</b></span><span className="text-slate-600">+</span><span className="formula-chip">Frequency <b>25%</b></span><span className="text-slate-600">+</span><span className="formula-chip">Exposure <b>20%</b></span><span className="text-slate-600">+</span><span className="formula-chip">Urban <b>15%</b></span><span className="text-slate-600">+</span><span className="formula-chip">Green buffer <b>10%</b></span></div><div className="flex gap-3 border-t border-white/[.07] pt-5 text-xs leading-5 text-slate-500"><CircleHelp className="h-4 w-4 shrink-0 text-orange-300" /> The weights are a simple educational assumption for demonstrating multi-factor assessment. They should be reviewed before any research or policy use.</div></div><div className="dashboard-card rounded-2xl p-6 sm:p-7" data-testid="about-project-card"><div className="flex items-start gap-4"><span className="number-chip bg-sky-400/10 text-sky-300">02</span><div><h3 className="font-heading text-lg font-semibold text-white">Why cities need a heat lens</h3><p className="mt-2 text-sm leading-6 text-slate-400">Dense built surfaces can retain heat, while high population exposure can increase health impacts. Digital maps help students communicate where multiple pressures overlap and where cooling, shade, and preparedness deserve attention.</p></div></div><div className="mt-7 grid grid-cols-3 gap-2"><div className="rounded-xl bg-white/[.04] p-3 text-center"><Trees className="mx-auto h-5 w-5 text-emerald-300" /><p className="mt-2 text-[10px] text-slate-400">Green cover</p></div><div className="rounded-xl bg-white/[.04] p-3 text-center"><Users className="mx-auto h-5 w-5 text-orange-300" /><p className="mt-2 text-[10px] text-slate-400">Exposure</p></div><div className="rounded-xl bg-white/[.04] p-3 text-center"><BarChart3 className="mx-auto h-5 w-5 text-sky-300" /><p className="mt-2 text-[10px] text-slate-400">Evidence</p></div></div><div className="mt-5 rounded-xl border border-red-400/15 bg-red-400/[.05] p-3 text-xs leading-5 text-slate-400"><b className="text-red-200">Limitation:</b> This product is not an official IMD early-warning or government decision-support system.</div></div></div>
        </section>

        <section id="sources" className="section-shell scroll-mt-20" data-testid="sources-section">
          <SectionHeading eyebrow="08 / Research trail" title="Data sources & references" description="The demo values are labelled and intentionally replaceable. These are authoritative starting points for a verified future dataset, not claims that the demo values came from them." />
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5"><SourceCard number="01" title="India Meteorological Department" text="Official observations, heatwave definitions, warnings, and climate summaries." href="https://mausam.imd.gov.in/" testId="source-imd" /><SourceCard number="02" title="NDMA heatwave guidance" text="National guidance for heatwave preparedness and heat action planning." href="https://ndma.gov.in/" testId="source-ndma" /><SourceCard number="03" title="ISRO Bhuvan / NRSC" text="Satellite land-surface temperature and urban heat-island study portal." href="https://bhuvan.nrsc.gov.in/" testId="source-isro-bhuvan" /><SourceCard number="04" title="Punjab SAPCC" text="State climate-action planning context for Punjab heat and vulnerability indicators." href="http://pscst.punjab.gov.in/" testId="source-punjab-sapcc" /><SourceCard number="05" title="BharatMaps boundary" text="Open GeoJSON geometry used to derive the dependency-free India vector outline." href="https://github.com/Amazing-coder1203/BharatMaps" testId="source-bharatmaps" /></div><div className="mt-12 flex flex-col justify-between gap-4 border-t border-white/[.08] pt-6 text-xs text-slate-500 sm:flex-row"><span className="flex items-center gap-2"><ThermometerSun className="h-4 w-4 text-orange-400" /> HeatMap India · Environmental Studies CA1</span><span>Educational demonstration · Data status: Demo Data</span></div>
        </section>
      </main>
    </div>
  );
}

function SourceCard({ number, title, text, href, testId }: { number: string; title: string; text: string; href?: string; testId: string }) {
  const content = <><span className="font-mono text-[10px] text-orange-300">{number}</span><h3 className="mt-5 font-heading text-sm font-semibold text-white">{title}</h3><p className="mt-2 text-xs leading-5 text-slate-500">{text}</p><span className="mt-5 flex items-center gap-1 text-[10px] text-slate-400">{href ? "Open reference" : "Built for replacement"}<ExternalLink className="h-3 w-3" /></span></>;
  return href ? <a href={href} target="_blank" rel="noreferrer" className="source-card" data-testid={testId}>{content}</a> : <div className="source-card" data-testid={testId}>{content}</div>;
}

function SunIcon() {
  return <span className="relative block h-5 w-5"><span className="absolute inset-1 rounded-full border-2 border-current" /><span className="absolute left-1/2 top-0 h-1 w-0.5 -translate-x-1/2 bg-current" /><span className="absolute bottom-0 left-1/2 h-1 w-0.5 -translate-x-1/2 bg-current" /><span className="absolute left-0 top-1/2 h-0.5 w-1 -translate-y-1/2 bg-current" /><span className="absolute right-0 top-1/2 h-0.5 w-1 -translate-y-1/2 bg-current" /></span>;
}