import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import {
  ArrowRight,
  BarChart3,
  ChevronDown,
  CircleAlert,
  CloudSun,
  ExternalLink,
  Leaf,
  MapPin,
  Menu,
  Navigation,
  Search,
  ShieldCheck,
  ThermometerSun,
  Users,
  X,
} from "lucide-react";

import { apiGet } from "@/lib/api";
import { fetchLiveCities } from "@/lib/liveWeather";

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

const fallbackCities: CityRisk[] = [
  {
    id: "delhi",
    name: "Delhi",
    state: "Delhi",
    lat: 28.61,
    lng: 77.21,
    max_temp: 45,
    heatwave_days: 18,
    pop_exposure: 91,
    urbanization: 92,
    vegetation_cover: 18,
    score: 88,
    tier: "very_high",
    is_demo: true,
    source_note: "Demo value",
  },
  {
    id: "ahmedabad",
    name: "Ahmedabad",
    state: "Gujarat",
    lat: 23.02,
    lng: 72.57,
    max_temp: 44,
    heatwave_days: 16,
    pop_exposure: 84,
    urbanization: 88,
    vegetation_cover: 21,
    score: 82,
    tier: "very_high",
    is_demo: true,
    source_note: "Demo value",
  },
  {
    id: "jaipur",
    name: "Jaipur",
    state: "Rajasthan",
    lat: 26.91,
    lng: 75.79,
    max_temp: 43,
    heatwave_days: 15,
    pop_exposure: 73,
    urbanization: 79,
    vegetation_cover: 23,
    score: 77,
    tier: "very_high",
    is_demo: true,
    source_note: "Demo value",
  },
  {
    id: "mumbai",
    name: "Mumbai",
    state: "Maharashtra",
    lat: 19.07,
    lng: 72.87,
    max_temp: 38,
    heatwave_days: 8,
    pop_exposure: 95,
    urbanization: 96,
    vegetation_cover: 27,
    score: 68,
    tier: "high",
    is_demo: true,
    source_note: "Demo value",
  },
  {
    id: "kolkata",
    name: "Kolkata",
    state: "West Bengal",
    lat: 22.57,
    lng: 88.36,
    max_temp: 40,
    heatwave_days: 10,
    pop_exposure: 88,
    urbanization: 91,
    vegetation_cover: 31,
    score: 66,
    tier: "high",
    is_demo: true,
    source_note: "Demo value",
  },
  {
    id: "hyderabad",
    name: "Hyderabad",
    state: "Telangana",
    lat: 17.38,
    lng: 78.48,
    max_temp: 41,
    heatwave_days: 11,
    pop_exposure: 77,
    urbanization: 84,
    vegetation_cover: 30,
    score: 65,
    tier: "high",
    is_demo: true,
    source_note: "Demo value",
  },
  {
    id: "bengaluru",
    name: "Bengaluru",
    state: "Karnataka",
    lat: 12.97,
    lng: 77.59,
    max_temp: 35,
    heatwave_days: 4,
    pop_exposure: 80,
    urbanization: 86,
    vegetation_cover: 39,
    score: 47,
    tier: "moderate",
    is_demo: true,
    source_note: "Demo value",
  },
  {
    id: "kochi",
    name: "Kochi",
    state: "Kerala",
    lat: 9.93,
    lng: 76.27,
    max_temp: 34,
    heatwave_days: 3,
    pop_exposure: 61,
    urbanization: 67,
    vegetation_cover: 51,
    score: 31,
    tier: "low",
    is_demo: true,
    source_note: "Demo value",
  },
];

const riskMeta: Record<
  RiskTier,
  {
    label: string;
    color: string;
    soft: string;
  }
> = {
  low: {
    label: "Low",
    color: "#15803d",
    soft: "#dcfce7",
  },
  moderate: {
    label: "Moderate",
    color: "#b45309",
    soft: "#fef3c7",
  },
  high: {
    label: "High",
    color: "#ea580c",
    soft: "#ffedd5",
  },
  very_high: {
    label: "Very High",
    color: "#dc2626",
    soft: "#fee2e2",
  },
};

function RiskPill({ tier }: { tier: RiskTier }) {
  const meta = riskMeta[tier];

  return (
    <span
      className="risk-pill"
      style={{
        color: meta.color,
        background: meta.soft,
      }}
    >
      <span
        className="risk-dot"
        style={{ background: meta.color }}
      />
      {meta.label}
    </span>
  );
}

function getRiskClass(tier: RiskTier) {
  return `risk-${tier}`;
}

export default function Home() {
  const [selectedId, setSelectedId] = useState("delhi");
  const [search, setSearch] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  const citiesQuery = useQuery({
    queryKey: ["heatmap-cities"],
    queryFn: () =>
      apiGet<CityRisk[]>("/heatmap/cities").catch(
        () => fetchLiveCities(),
      ),
    retry: false,
    staleTime: 15 * 60 * 1000,
  });

  const cities =
    citiesQuery.data && citiesQuery.data.length > 0
      ? citiesQuery.data
      : fallbackCities;

  const selected =
    cities.find((city) => city.id === selectedId) ??
    cities[0];

  const filteredCities = useMemo(() => {
    const term = search.toLowerCase().trim();

    if (!term) return cities;

    return cities.filter(
      (city) =>
        city.name.toLowerCase().includes(term) ||
        city.state.toLowerCase().includes(term),
    );
  }, [cities, search]);

  const highRiskCount = cities.filter(
    (city) =>
      city.tier === "high" ||
      city.tier === "very_high",
  ).length;

  const averageRisk = cities.length
    ? Math.round(
        cities.reduce(
          (total, city) => total + city.score,
          0,
        ) / cities.length,
      )
    : 0;

  const peakTemp = cities.length
    ? Math.max(...cities.map((city) => city.max_temp))
    : 0;

  const selectCity = (id: string) => {
    setSelectedId(id);

    setTimeout(() => {
      document
        .getElementById("city-profile")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 50);
  };

  const scrollTo = (id: string) => {
    document
      .getElementById(id)
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

    setMobileOpen(false);
  };

  return (
    <div className="heat-app">
      {/* NAVIGATION */}
      <header className="site-header">
        <div className="nav-inner">
          <button
            className="brand"
            onClick={() => scrollTo("top")}
          >
            <span className="brand-mark">
              <ThermometerSun size={20} />
            </span>

            <span>
              <strong>HeatScape</strong>
              <small>INDIA · URBAN HEAT INTELLIGENCE</small>
            </span>
          </button>

          <nav className="desktop-nav">
            <button onClick={() => scrollTo("map")}>
              Explore map
            </button>

            <button onClick={() => scrollTo("cities")}>
              Cities
            </button>

            <button onClick={() => scrollTo("why")}>
              Why heat?
            </button>

            <button onClick={() => scrollTo("methodology")}>
              Methodology
            </button>
          </nav>

          <div className="nav-actions">
            <span className="live-badge">
              <span />
              DATA CONNECTED
            </span>

            <button
              className="mobile-menu"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? (
                <X size={21} />
              ) : (
                <Menu size={21} />
              )}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="mobile-nav">
            <button onClick={() => scrollTo("map")}>
              Explore map
            </button>
            <button onClick={() => scrollTo("cities")}>
              Cities
            </button>
            <button onClick={() => scrollTo("why")}>
              Why heat?
            </button>
            <button onClick={() => scrollTo("methodology")}>
              Methodology
            </button>
          </div>
        )}
      </header>

      <main id="top">
        {/* HERO */}
        <section className="hero-section">
          <div className="hero-grid">
            <div className="hero-copy">
              <div className="eyebrow">
                <span />
                URBAN CLIMATE INTELLIGENCE
              </div>

              <h1>
                India's heat is
                <br />
                <em>not evenly distributed.</em>
              </h1>

              <p className="hero-description">
                Explore how temperature, urbanisation,
                vegetation and population exposure combine
                to shape heat risk across Indian cities.
              </p>

              <div className="hero-buttons">
                <button
                  className="primary-button"
                  onClick={() => scrollTo("map")}
                >
                  Explore the map
                  <ArrowRight size={17} />
                </button>

                <button
                  className="text-button"
                  onClick={() => scrollTo("methodology")}
                >
                  How is risk calculated?
                  <ChevronDown size={16} />
                </button>
              </div>

              <div className="hero-note">
                <ShieldCheck size={15} />
                Educational climate-risk visualization ·
                not an official warning system
              </div>
            </div>

            {/* HERO VISUAL */}
            <div className="hero-visual">
              <div className="sun-orbit orbit-one" />
              <div className="sun-orbit orbit-two" />

              <div className="hero-thermal-card">
                <div className="thermal-top">
                  <div>
                    <span>INDIA · CURRENT VIEW</span>
                    <strong>Urban heat signal</strong>
                  </div>

                  <div className="thermal-icon">
                    <ThermometerSun size={20} />
                  </div>
                </div>

                <div className="thermal-number">
                  {peakTemp || "—"}
                  <small>°C</small>
                </div>

                <div className="thermal-label">
                  Highest monitored maximum
                </div>

                <div className="thermal-bars">
                  <div>
                    <span>North & central</span>
                    <i style={{ width: "91%" }} />
                  </div>

                  <div>
                    <span>West</span>
                    <i style={{ width: "82%" }} />
                  </div>

                  <div>
                    <span>East</span>
                    <i style={{ width: "69%" }} />
                  </div>

                  <div>
                    <span>South</span>
                    <i style={{ width: "48%" }} />
                  </div>
                </div>

                <div className="thermal-footer">
                  <span>
                    <span className="legend-dot red" />
                    Higher heat signal
                  </span>

                  <span>
                    <span className="legend-dot green" />
                    Cooling influence
                  </span>
                </div>
              </div>

              <div className="floating-card floating-card-one">
                <CircleAlert size={17} />
                <div>
                  <strong>{highRiskCount}</strong>
                  <span>high-risk cities</span>
                </div>
              </div>

              <div className="floating-card floating-card-two">
                <Leaf size={17} />
                <div>
                  <strong>
                    {selected?.vegetation_cover ?? "—"}%
                  </strong>
                  <span>green cover</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* KEY NUMBERS */}
        <section className="numbers-section">
          <div className="numbers-grid">
            <div className="number-block">
              <span>01</span>
              <strong>{cities.length}</strong>
              <p>cities monitored</p>
            </div>

            <div className="number-block">
              <span>02</span>
              <strong>{highRiskCount}</strong>
              <p>high / very-high risk</p>
            </div>

            <div className="number-block">
              <span>03</span>
              <strong>{peakTemp}°</strong>
              <p>highest monitored max</p>
            </div>

            <div className="number-block">
              <span>04</span>
              <strong>{averageRisk}</strong>
              <p>average risk score</p>
            </div>
          </div>
        </section>

        {/* MAP */}
        <section
          id="map"
          className="content-section map-section"
        >
          <div className="section-intro">
            <div>
              <span className="section-number">
                01 / EXPLORE
              </span>

              <h2>
                Where is the
                <br />
                heat concentrated?
              </h2>
            </div>

            <p>
              Select a city to inspect the factors behind
              its heat-risk score. The visualization combines
              hazard, exposure and environmental context.
            </p>
          </div>

          <div className="map-layout">
            <div className="map-card">
              <div className="map-toolbar">
                <div>
                  <strong>India heat-risk overview</strong>
                  <span>
                    {citiesQuery.isFetching
                      ? "Updating data…"
                      : "Latest available dataset"}
                  </span>
                </div>

                <div className="map-legend">
                  {(Object.keys(riskMeta) as RiskTier[]).map(
                    (tier) => (
                      <span key={tier}>
                        <i
                          style={{
                            background:
                              riskMeta[tier].color,
                          }}
                        />
                        {riskMeta[tier].label}
                      </span>
                    ),
                  )}
                </div>
              </div>

              <div className="india-map">
                <div className="map-grid" />

                <div className="india-silhouette">
                  <div className="india-glow glow-one" />
                  <div className="india-glow glow-two" />
                  <div className="india-shape">
                    INDIA
                  </div>
                </div>

                {cities.map((city) => {
                  const left =
                    12 +
                    ((city.lng - 68) / 30) * 76;

                  const top =
                    16 +
                    ((37 - city.lat) / 30) * 70;

                  const isSelected =
                    city.id === selected?.id;

                  return (
                    <button
                      key={city.id}
                      className={`map-marker ${
                        isSelected ? "selected" : ""
                      } ${getRiskClass(city.tier)}`}
                      style={{
                        left: `${Math.min(
                          88,
                          Math.max(8, left),
                        )}%`,
                        top: `${Math.min(
                          88,
                          Math.max(8, top),
                        )}%`,
                      }}
                      onClick={() =>
                        selectCity(city.id)
                      }
                      title={city.name}
                    >
                      <span className="marker-pulse" />
                      <span className="marker-core" />

                      <span className="marker-label">
                        {city.name}
                      </span>
                    </button>
                  );
                })}

                <div className="map-compass">
                  <Navigation size={15} />
                  <span>N</span>
                </div>

                <div className="map-scale">
                  <span />
                  <small>500 km</small>
                </div>
              </div>

              <div className="map-bottom">
                <span>
                  <span className="map-live-dot" />
                  {citiesQuery.isFetching
                    ? "Updating"
                    : "Dataset available"}
                </span>

                <span>
                  Click any city to inspect its profile
                </span>
              </div>
            </div>

            {/* CITY LIST */}
            <aside className="city-list-panel">
              <div className="panel-heading">
                <div>
                  <span>SEARCH CITIES</span>
                  <strong>City explorer</strong>
                </div>

                <MapPin size={18} />
              </div>

              <div className="search-box">
                <Search size={16} />
                <input
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search city or state..."
                />
              </div>

              <div className="city-list">
                {filteredCities
                  .sort((a, b) => b.score - a.score)
                  .slice(0, 8)
                  .map((city) => (
                    <button
                      key={city.id}
                      className={`city-row ${
                        selected?.id === city.id
                          ? "active"
                          : ""
                      }`}
                      onClick={() =>
                        selectCity(city.id)
                      }
                    >
                      <div
                        className="city-risk-line"
                        style={{
                          background:
                            riskMeta[city.tier].color,
                        }}
                      />

                      <div className="city-row-main">
                        <strong>{city.name}</strong>
                        <span>{city.state}</span>
                      </div>

                      <div className="city-row-score">
                        <strong>{Math.round(city.score)}</strong>
                        <span>
                          <RiskPill tier={city.tier} />
                        </span>
                      </div>
                    </button>
                  ))}
              </div>
            </aside>
          </div>
        </section>

        {/* CITY PROFILE */}
        {selected && (
          <section
            id="city-profile"
            className="content-section profile-section"
          >
            <div className="profile-header">
              <div>
                <span className="section-number">
                  02 / CITY PROFILE
                </span>

                <div className="profile-title">
                  <h2>{selected.name}</h2>
                  <RiskPill tier={selected.tier} />
                </div>

                <p>
                  {selected.state} ·{" "}
                  {selected.lat.toFixed(2)}°N ·{" "}
                  {selected.lng.toFixed(2)}°E
                </p>
              </div>

              <div className="profile-score">
                <span>RISK SCORE</span>
                <strong>
                  {Math.round(selected.score)}
                </strong>
                <small>/ 100</small>
              </div>
            </div>

            <div className="profile-grid">
              <div className="profile-main-card">
                <div className="card-heading">
                  <span>RISK COMPOSITION</span>
                  <BarChart3 size={18} />
                </div>

                <div className="factor">
                  <div>
                    <span>
                      <ThermometerSun size={15} />
                      Maximum temperature
                    </span>

                    <strong>
                      {selected.max_temp}°C
                    </strong>
                  </div>

                  <div className="factor-bar">
                    <i
                      style={{
                        width: `${Math.min(
                          100,
                          ((selected.max_temp - 28) /
                            20) *
                            100,
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="factor">
                  <div>
                    <span>
                      <CircleAlert size={15} />
                      Heatwave frequency
                    </span>

                    <strong>
                      {selected.heatwave_days} days
                    </strong>
                  </div>

                  <div className="factor-bar">
                    <i
                      style={{
                        width: `${Math.min(
                          100,
                          (selected.heatwave_days /
                            24) *
                            100,
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="factor">
                  <div>
                    <span>
                      <Users size={15} />
                      Population exposure
                    </span>

                    <strong>
                      {selected.pop_exposure}%
                    </strong>
                  </div>

                  <div className="factor-bar">
                    <i
                      style={{
                        width: `${selected.pop_exposure}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="factor">
                  <div>
                    <span>
                      <Navigation size={15} />
                      Urbanisation
                    </span>

                    <strong>
                      {selected.urbanization}%
                    </strong>
                  </div>

                  <div className="factor-bar">
                    <i
                      style={{
                        width: `${selected.urbanization}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="factor">
                  <div>
                    <span>
                      <Leaf size={15} />
                      Vegetation cover
                    </span>

                    <strong>
                      {selected.vegetation_cover}%
                    </strong>
                  </div>

                  <div className="factor-bar cooling">
                    <i
                      style={{
                        width: `${selected.vegetation_cover}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="profile-insight-card">
                <span className="insight-label">
                  CITY INSIGHT
                </span>

                <div className="insight-icon">
                  <CloudSun size={25} />
                </div>

                <h3>
                  {selected.name} has a{" "}
                  {riskMeta[selected.tier].label.toLowerCase()}{" "}
                  heat-risk signal.
                </h3>

                <p>
                  The score reflects the combined influence
                  of temperature, heatwave frequency,
                  population exposure, urbanisation and
                  vegetation.
                </p>

                <div className="insight-location">
                  <MapPin size={15} />
                  {selected.name}, {selected.state}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* WHY HEAT */}
        <section
          id="why"
          className="content-section why-section"
        >
          <div className="section-intro">
            <div>
              <span className="section-number">
                03 / WHY IT MATTERS
              </span>

              <h2>
                Heat is more than
                <br />
                a temperature.
              </h2>
            </div>

            <p>
              Two cities can experience the same temperature
              but face very different levels of risk. Exposure,
              built-up surfaces and access to cooling all
              influence the outcome.
            </p>
          </div>

          <div className="why-grid">
            <motion.article
              whileHover={{ y: -5 }}
              className="why-card"
            >
              <span className="why-number">01</span>
              <div className="why-icon orange">
                <ThermometerSun />
              </div>
              <h3>Hazard</h3>
              <p>
                Extreme temperature and repeated heatwave
                conditions create the physical heat signal.
              </p>
            </motion.article>

            <motion.article
              whileHover={{ y: -5 }}
              className="why-card"
            >
              <span className="why-number">02</span>
              <div className="why-icon red">
                <Users />
              </div>
              <h3>Exposure</h3>
              <p>
                A larger exposed population can mean more
                people facing heat-related impacts.
              </p>
            </motion.article>

            <motion.article
              whileHover={{ y: -5 }}
              className="why-card"
            >
              <span className="why-number">03</span>
              <div className="why-icon green">
                <Leaf />
              </div>
              <h3>Cooling</h3>
              <p>
                Trees, vegetation and shaded environments
                can provide important cooling benefits.
              </p>
            </motion.article>

            <motion.article
              whileHover={{ y: -5 }}
              className="why-card"
            >
              <span className="why-number">04</span>
              <div className="why-icon blue">
                <Navigation />
              </div>
              <h3>Urban form</h3>
              <p>
                Dense built environments can store and
                redistribute heat across the urban landscape.
              </p>
            </motion.article>
          </div>
        </section>

        {/* CITIES */}
        <section
          id="cities"
          className="content-section cities-section"
        >
          <div className="section-intro">
            <div>
              <span className="section-number">
                04 / CITY RANKING
              </span>

              <h2>
                India's urban
                <br />
                heat hotspots.
              </h2>
            </div>

            <p>
              A quick comparison of monitored cities based
              on the current risk dataset.
            </p>
          </div>

          <div className="ranking-table">
            <div className="ranking-head">
              <span>#</span>
              <span>City</span>
              <span>Maximum temperature</span>
              <span>Risk score</span>
              <span>Status</span>
            </div>

            {[...cities]
              .sort((a, b) => b.score - a.score)
              .slice(0, 10)
              .map((city, index) => (
                <button
                  className="ranking-row"
                  key={city.id}
                  onClick={() =>
                    selectCity(city.id)
                  }
                >
                  <span className="ranking-number">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <span className="ranking-city">
                    <strong>{city.name}</strong>
                    <small>{city.state}</small>
                  </span>

                  <span className="ranking-temp">
                    {city.max_temp}°C
                  </span>

                  <span className="ranking-score">
                    {Math.round(city.score)}
                  </span>

                  <span>
                    <RiskPill tier={city.tier} />
                  </span>

                  <ArrowRight
                    className="ranking-arrow"
                    size={17}
                  />
                </button>
              ))}
          </div>
        </section>

        {/* METHODOLOGY */}
        <section
          id="methodology"
          className="content-section methodology-section"
        >
          <div className="method-card">
            <div className="method-copy">
              <span className="section-number">
                05 / METHODOLOGY
              </span>

              <h2>
                Turning climate
                <br />
                signals into a
                <br />
                <em>risk index.</em>
              </h2>

              <p>
                The educational model combines several
                dimensions instead of treating temperature
                alone as heat risk.
              </p>

              <div className="method-formula">
                <span>Risk</span>
                <b>=</b>
                <span>Hazard</span>
                <b>+</b>
                <span>Exposure</span>
                <b>+</b>
                <span>Urban context</span>
                <b>−</b>
                <span>Cooling</span>
              </div>
            </div>

            <div className="method-factors">
              <div>
                <span>30%</span>
                <strong>Temperature</strong>
                <p>Maximum temperature signal</p>
              </div>

              <div>
                <span>25%</span>
                <strong>Heatwave frequency</strong>
                <p>Repeated extreme heat exposure</p>
              </div>

              <div>
                <span>20%</span>
                <strong>Population</strong>
                <p>People potentially exposed</p>
              </div>

              <div>
                <span>15%</span>
                <strong>Urbanisation</strong>
                <p>Built-environment pressure</p>
              </div>

              <div>
                <span>10%</span>
                <strong>Vegetation</strong>
                <p>Cooling / green-cover influence</p>
              </div>
            </div>
          </div>
        </section>

        {/* DATA */}
        <section className="data-section">
          <div className="data-inner">
            <div>
              <span className="section-number">
                06 / DATA & SOURCES
              </span>

              <h2>
                Built around
                <br />
                <em>evidence.</em>
              </h2>

              <p>
                The project is designed so that demonstration
                values can be replaced with verified datasets
                from authoritative climate, satellite and
                demographic sources.
              </p>
            </div>

            <div className="source-list">
              <a
                href="https://mausam.imd.gov.in/"
                target="_blank"
                rel="noreferrer"
              >
                <span>01</span>
                <strong>
                  India Meteorological Department
                </strong>
                <ExternalLink size={15} />
              </a>

              <a
                href="https://ndma.gov.in/"
                target="_blank"
                rel="noreferrer"
              >
                <span>02</span>
                <strong>
                  National Disaster Management Authority
                </strong>
                <ExternalLink size={15} />
              </a>

              <a
                href="https://bhuvan.nrsc.gov.in/"
                target="_blank"
                rel="noreferrer"
              >
                <span>03</span>
                <strong>ISRO Bhuvan / NRSC</strong>
                <ExternalLink size={15} />
              </a>

              <div>
                <span>04</span>
                <strong>Population & urban datasets</strong>
                <span className="source-status">
                  To be verified
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="site-footer">
          <div>
            <div className="footer-brand">
              <ThermometerSun size={18} />
              <strong>HeatScape India</strong>
            </div>

            <p>
              Digital heat-risk mapping for Indian cities.
            </p>
          </div>

          <div className="footer-right">
            <span>
              Environmental Studies · CA1 Project
            </span>

            <span>
              Educational visualization
            </span>
          </div>
        </footer>
      </main>
    </div>
  );
}