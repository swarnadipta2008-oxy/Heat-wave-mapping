import { useMemo, useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from "react-simple-maps";

type City = {
  name: string;
  state: string;
  coordinates: [number, number];
  risk: "Extreme" | "High" | "Moderate" | "Low";
  temperature: number;
};

const INDIA_GEO_URL =
  "https://raw.githubusercontent.com/AbhinavSwami28/india-official-geojson/main/india-states-simplified.geojson";

const cities: City[] = [
  { name: "Delhi", state: "Delhi", coordinates: [77.1025, 28.7041], risk: "Extreme", temperature: 45 },
  { name: "Amritsar", state: "Punjab", coordinates: [74.8723, 31.634], risk: "High", temperature: 43 },
  { name: "Ludhiana", state: "Punjab", coordinates: [75.8573, 30.901], risk: "High", temperature: 43 },
  { name: "Chandigarh", state: "Chandigarh", coordinates: [76.7794, 30.7333], risk: "High", temperature: 42 },
  { name: "Jaipur", state: "Rajasthan", coordinates: [75.7873, 26.9124], risk: "Extreme", temperature: 46 },
  { name: "Jodhpur", state: "Rajasthan", coordinates: [73.0243, 26.2389], risk: "Extreme", temperature: 47 },
  { name: "Kota", state: "Rajasthan", coordinates: [75.8648, 25.2138], risk: "Extreme", temperature: 46 },
  { name: "Lucknow", state: "Uttar Pradesh", coordinates: [80.9462, 26.8467], risk: "Extreme", temperature: 45 },
  { name: "Kanpur", state: "Uttar Pradesh", coordinates: [80.3319, 26.4499], risk: "Extreme", temperature: 45 },
  { name: "Agra", state: "Uttar Pradesh", coordinates: [78.0081, 27.1767], risk: "Extreme", temperature: 46 },
  { name: "Varanasi", state: "Uttar Pradesh", coordinates: [82.9739, 25.3176], risk: "High", temperature: 44 },
  { name: "Prayagraj", state: "Uttar Pradesh", coordinates: [81.8463, 25.4358], risk: "Extreme", temperature: 46 },
  { name: "Dehradun", state: "Uttarakhand", coordinates: [78.0322, 30.3165], risk: "Moderate", temperature: 39 },

  { name: "Mumbai", state: "Maharashtra", coordinates: [72.8777, 19.076], risk: "High", temperature: 34 },
  { name: "Pune", state: "Maharashtra", coordinates: [73.8567, 18.5204], risk: "Moderate", temperature: 36 },
  { name: "Nagpur", state: "Maharashtra", coordinates: [79.0882, 21.1458], risk: "Extreme", temperature: 45 },
  { name: "Nashik", state: "Maharashtra", coordinates: [73.7898, 19.9975], risk: "High", temperature: 39 },
  { name: "Ahmedabad", state: "Gujarat", coordinates: [72.5714, 23.0225], risk: "Extreme", temperature: 46 },
  { name: "Surat", state: "Gujarat", coordinates: [72.8311, 21.1702], risk: "High", temperature: 40 },
  { name: "Vadodara", state: "Gujarat", coordinates: [73.1812, 22.3072], risk: "High", temperature: 42 },
  { name: "Rajkot", state: "Gujarat", coordinates: [70.8022, 22.3039], risk: "Extreme", temperature: 44 },
  { name: "Indore", state: "Madhya Pradesh", coordinates: [75.8577, 22.7196], risk: "High", temperature: 42 },
  { name: "Bhopal", state: "Madhya Pradesh", coordinates: [77.4126, 23.2599], risk: "High", temperature: 42 },
  { name: "Jabalpur", state: "Madhya Pradesh", coordinates: [79.9864, 23.1815], risk: "High", temperature: 43 },
  { name: "Gwalior", state: "Madhya Pradesh", coordinates: [78.1828, 26.2183], risk: "Extreme", temperature: 45 },

  { name: "Kolkata", state: "West Bengal", coordinates: [88.3639, 22.5726], risk: "Extreme", temperature: 42 },
  { name: "Siliguri", state: "West Bengal", coordinates: [88.3953, 26.7271], risk: "Moderate", temperature: 37 },
  { name: "Patna", state: "Bihar", coordinates: [85.1376, 25.5941], risk: "Extreme", temperature: 45 },
  { name: "Ranchi", state: "Jharkhand", coordinates: [85.3096, 23.3441], risk: "Moderate", temperature: 39 },
  { name: "Bhubaneswar", state: "Odisha", coordinates: [85.8245, 20.2961], risk: "High", temperature: 40 },
  { name: "Guwahati", state: "Assam", coordinates: [91.7362, 26.1445], risk: "Moderate", temperature: 37 },
  { name: "Raipur", state: "Chhattisgarh", coordinates: [81.6296, 21.2514], risk: "Extreme", temperature: 44 },

  { name: "Bengaluru", state: "Karnataka", coordinates: [77.5946, 12.9716], risk: "Moderate", temperature: 34 },
  { name: "Hyderabad", state: "Telangana", coordinates: [78.4867, 17.385], risk: "High", temperature: 42 },
  { name: "Chennai", state: "Tamil Nadu", coordinates: [80.2707, 13.0827], risk: "High", temperature: 39 },
  { name: "Coimbatore", state: "Tamil Nadu", coordinates: [76.9558, 11.0168], risk: "Moderate", temperature: 35 },
  { name: "Madurai", state: "Tamil Nadu", coordinates: [78.1198, 9.9252], risk: "High", temperature: 40 },
  { name: "Kochi", state: "Kerala", coordinates: [76.2673, 9.9312], risk: "Moderate", temperature: 34 },
  { name: "Thiruvananthapuram", state: "Kerala", coordinates: [76.9366, 8.5241], risk: "Moderate", temperature: 33 },
  { name: "Vijayawada", state: "Andhra Pradesh", coordinates: [80.648, 16.5062], risk: "High", temperature: 43 },
  { name: "Visakhapatnam", state: "Andhra Pradesh", coordinates: [83.2185, 17.6868], risk: "High", temperature: 39 },
  { name: "Mysuru", state: "Karnataka", coordinates: [76.6394, 12.2958], risk: "Low", temperature: 33 },

  { name: "Shimla", state: "Himachal Pradesh", coordinates: [77.1734, 31.1048], risk: "Low", temperature: 29 },
  { name: "Srinagar", state: "Jammu & Kashmir", coordinates: [74.7973, 34.0837], risk: "Low", temperature: 31 },
  { name: "Jammu", state: "Jammu & Kashmir", coordinates: [74.857, 32.7266], risk: "Moderate", temperature: 39 },
];

const riskColor = {
  Extreme: "#dc2626",
  High: "#f97316",
  Moderate: "#eab308",
  Low: "#16a34a",
};

export default function Home() {
  const [selectedCity, setSelectedCity] = useState<City | null>(cities[0]);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  const filteredCities = useMemo(() => {
    return cities.filter((city) => {
      const matchesRisk = filter === "All" || city.risk === filter;
      const matchesSearch =
        city.name.toLowerCase().includes(search.toLowerCase()) ||
        city.state.toLowerCase().includes(search.toLowerCase());

      return matchesRisk && matchesSearch;
    });
  }, [filter, search]);

  return (
    <main className="heat-page">
      <header className="hero">
        <div>
          <p className="eyebrow">INDIA • URBAN CLIMATE INTELLIGENCE</p>

          <h1>
            Heat Risk
            <span> Mapping</span>
          </h1>

          <p className="subtitle">
            Explore heat exposure across major Indian cities.
          </p>
        </div>

        <div className="hero-stat">
          <strong>{cities.length}</strong>
          <span>cities mapped</span>
        </div>
      </header>

      <section className="map-section">
        <div className="map-header">
          <div>
            <h2>Indian City Heat Risk</h2>
            <p>
              Select a city to inspect its current risk profile.
            </p>
          </div>

          <input
            className="city-search"
            placeholder="Search city or state..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="risk-filters">
          {["All", "Extreme", "High", "Moderate", "Low"].map((level) => (
            <button
              key={level}
              className={filter === level ? "active" : ""}
              onClick={() => setFilter(level)}
            >
              {level !== "All" && (
                <span
                  className="filter-dot"
                  style={{
                    background:
                      riskColor[level as keyof typeof riskColor],
                  }}
                />
              )}
              {level}
            </button>
          ))}
        </div>

        <div className="map-layout">
          <div className="india-map-card">
            <ComposableMap
              projection="geoMercator"
              projectionConfig={{
                center: [82, 22],
                scale: 1050,
              }}
              width={600}
              height={560}
              style={{
                width: "100%",
                height: "auto",
              }}
            >
              <Geographies geography={INDIA_GEO_URL}>
                {({ geographies }: { geographies: any[] }) =>
                  geographies.map((geo) => (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill="#eef5ed"
                      stroke="#9fb4a1"
                      strokeWidth={0.7}
                      style={{
                        default: {
                          outline: "none",
                        },
                        hover: {
                          fill: "#e3eee3",
                          outline: "none",
                        },
                        pressed: {
                          outline: "none",
                        },
                      }}
                    />
                  ))
                }
              </Geographies>

              {filteredCities.map((city) => (
                <Marker
                  key={city.name}
                  coordinates={city.coordinates}
                  onClick={() => setSelectedCity(city)}
                  style={{
                    default: {
                      cursor: "pointer",
                    },
                  }}
                >
                  <circle
                    r={selectedCity?.name === city.name ? 7 : 4}
                    fill={riskColor[city.risk]}
                    stroke="#ffffff"
                    strokeWidth={2}
                  />

                  {selectedCity?.name === city.name && (
                    <text
                      textAnchor="middle"
                      y={-12}
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: "10px",
                        fontWeight: 700,
                        fill: "#172019",
                        pointerEvents: "none",
                      }}
                    >
                      {city.name}
                    </text>
                  )}
                </Marker>
              ))}
            </ComposableMap>

            <div className="map-note">
              <span />
              Geographic city locations • Risk visualization
            </div>
          </div>

          <aside className="city-panel">
            {selectedCity ? (
              <>
                <div className="selected-label">SELECTED CITY</div>

                <h2>{selectedCity.name}</h2>

                <p className="state-name">
                  {selectedCity.state}
                </p>

                <div
                  className="risk-badge"
                  style={{
                    background: `${riskColor[selectedCity.risk]}18`,
                    color: riskColor[selectedCity.risk],
                  }}
                >
                  <span
                    style={{
                      background: riskColor[selectedCity.risk],
                    }}
                  />
                  {selectedCity.risk} Risk
                </div>

                <div className="temperature">
                  <strong>{selectedCity.temperature}°</strong>
                  <span>peak temperature indicator</span>
                </div>

                <div className="coordinates">
                  <div>
                    <span>LATITUDE</span>
                    <strong>
                      {selectedCity.coordinates[1].toFixed(4)}°
                    </strong>
                  </div>

                  <div>
                    <span>LONGITUDE</span>
                    <strong>
                      {selectedCity.coordinates[0].toFixed(4)}°
                    </strong>
                  </div>
                </div>

                <div className="panel-message">
                  <strong>Research data layer</strong>
                  <p>
                    This panel is ready to be connected to the
                    verified heat-risk dataset in the next step.
                  </p>
                </div>
              </>
            ) : (
              <p>Select a city on the map.</p>
            )}
          </aside>
        </div>
      </section>
    </main>
  );
}