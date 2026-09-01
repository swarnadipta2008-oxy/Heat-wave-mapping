# HeatMap India — Living Product Spec

## Product
Single-page responsive Environmental Studies CA1 dashboard titled **HeatMap India – Digital Heatwave Risk Mapping for Indian Cities**. It is an educational visualization tool, not an official government heatwave warning system.

## Core flows
- Hero actions scroll to the interactive India map or calculator.
- Map shows 25 city markers (including Ludhiana, Amritsar, Bathinda, Jalandhar, Patiala and Chandigarh in the Punjab region), risk-tier filters, city search, clickable regional zones, zoom/reset controls, pan gestures, and a clickable city risk inspector.
- Dashboard shows city count, critical-city count, average score, highest-risk city, ranking chart, and tier distribution.
- Comparison lets users select 2–4 cities and inspect a radar chart plus indicator matrix.
- Trends shows demonstration 2015–2024 day/night temperature and heatwave-frequency series.
- Calculator adjusts five inputs and calls `POST /api/heatmap/calculate` for a weighted scenario score.
- Safety, methodology/about, and data-source sections are anchored for report screenshots.

## Data model
`CityRisk`: id, name, state, lat, lng, max_temp, heatwave_days, pop_exposure, urbanization, vegetation_cover, score, tier, is_demo, source_note.
All city records and trend points are explicitly demo/educational values; `source_note` makes the replacement path explicit. The sources section points to IMD, NDMA, ISRO Bhuvan/NRSC, and Punjab SAPCC starting points for a future verified dataset.

## Risk model
Temperature 30% + heatwave frequency 25% + population exposure 20% + urbanization 15% + (100 − vegetation cover) 10%. Tiers: low <40, moderate 40–59, high 60–74, very high >=75.

## API
- `GET /api/heatmap/cities`
- `GET /api/heatmap/trends`
- `POST /api/heatmap/calculate`
- Starter `GET/POST /api/status` remains available for template connectivity.

## Map interaction
The map is a dependency-free SVG vector atlas derived from the public BharatMaps India boundary and projected with city longitude/latitude into a calibrated viewBox. Users can click city nodes, click or select regional focus (including Punjab), switch cartographic/thermal/grid layers, zoom from 0.8x–3.2x, reset, and drag to pan.

## Auth and roles
No authentication. Public academic demonstration.