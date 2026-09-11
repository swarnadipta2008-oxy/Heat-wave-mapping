import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from 'react-simple-maps';
import { Plus, Minus, RotateCcw, Layers, Navigation, ArrowUpRight } from 'lucide-react';
import { scoreHeat, tierMeta, type City } from '@/lib/heatModel';

type Props = { cities: City[]; selected: City | undefined; select: (id: string) => void; region: string };
export default function HeatAtlas({ cities, selected, select, region }: Props) {
  const [position, setPosition] = useState<{ coordinates: [number, number]; zoom: number }>({ coordinates: [82, 23], zoom: 1 });
  const [halos, setHalos] = useState(true);
  const geometry = useQuery({ queryKey: ['india-boundaries'], queryFn: async ({ signal }) => {
    const res = await fetch('/india-states.geojson', { signal });
    if (!res.ok) throw new Error('Map unavailable');
    return res.json();
  }, staleTime: Infinity, retry: 1 });
  const reset = () => setPosition({ coordinates: [82, 23], zoom: 1 });
  return <div className="map-canvas">
    <div className="map-label"><span className="eyebrow">INDIA / CITY OBSERVATIONS</span><span>{cities.length} locations in view</span></div>
    <div className="map-tools"><button aria-label="Zoom in" onClick={() => setPosition(p => ({ ...p, zoom: Math.min(6, p.zoom * 1.4) }))}><Plus size={17}/></button><button aria-label="Zoom out" onClick={() => setPosition(p => ({ ...p, zoom: Math.max(1, p.zoom / 1.4) }))}><Minus size={17}/></button><button aria-label="Reset map" onClick={reset}><RotateCcw size={15}/></button><button aria-label="Toggle marker halos" aria-pressed={halos} onClick={() => setHalos(v => !v)}><Layers size={16}/></button></div>
    {geometry.isPending ? <div className="map-message">Drawing the atlas…</div> : geometry.isError ? <div className="map-message">The map could not load. The city list is still available.<button onClick={() => geometry.refetch()}>Retry map</button></div> : <ComposableMap projection="geoMercator" projectionConfig={{ center: [82, 23], scale: 940 }} width={760} height={610} aria-label="Interactive map of Indian cities, colored by educational heat index">
      <defs><radialGradient id="marker-glow"><stop offset="0" stopColor="#e67f3c" stopOpacity=".32"/><stop offset="1" stopColor="#e67f3c" stopOpacity="0"/></radialGradient></defs>
      <ZoomableGroup center={position.coordinates} zoom={position.zoom} minZoom={1} maxZoom={6} onMoveEnd={p => {
        if (p.coordinates && typeof p.zoom === 'number') setPosition({ coordinates: p.coordinates as [number, number], zoom: p.zoom });
      }}>
        <Geographies geography={geometry.data}>{({ geographies }) => geographies.map(geo => <Geography key={geo.rsmKey} geography={geo} fill="#dde4d4" stroke="#fafbf7" strokeWidth={1 / position.zoom} tabIndex={-1} style={{ outline: 'none' }}/>)}</Geographies>
        {cities.map(city => { const meta = tierMeta[scoreHeat(city).tier]; const active = selected?.id === city.id; return <Marker key={city.id} coordinates={[city.lng, city.lat]}>
          <g role="button" tabIndex={0} aria-label={`Select ${city.name}`} aria-pressed={active} onClick={() => select(city.id)} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(city.id); } }} className={`city-marker${active ? ' active' : ''}`} style={{ cursor: 'pointer' }}>
            <title>{city.name}: {scoreHeat(city).score}/100 · {city.peak}°C peak</title>
            {halos && <circle r={(active ? 32 : 20) / position.zoom} fill="url(#marker-glow)"/>}
            <circle className="marker-hit-area" r={13 / position.zoom} fill="transparent"/>
            <circle className="marker-button-ring" r={10 / position.zoom} stroke={meta.color} fill="none" strokeWidth={1.4 / position.zoom}/>
            {active && <circle className="marker-selected-ring" r={14 / position.zoom} stroke={meta.color} fill="none" strokeWidth={1.2 / position.zoom}/>}
            <circle className="city-dot" r={(active ? 6 : 4.5) / position.zoom} fill={meta.color} stroke="#fff" strokeWidth={1.5 / position.zoom}/>
          </g>
          {(active || ['mumbai', 'chennai', 'kolkata', 'bengaluru', 'guwahati'].includes(city.id)) && <g transform={`scale(${1 / position.zoom})`} pointerEvents="none"><text x={active ? 17 : 9} y={active ? -13 : 4} fontSize={active ? 13 : 10} fill={active ? '#153e32' : '#526453'} fontWeight={active ? 700 : 500} stroke="#f1f4e9" strokeWidth={3} paintOrder="stroke">{city.name.replace(' (NCR)', '')}</text></g>}
        </Marker>; })}
      </ZoomableGroup>
    </ComposableMap>}
    <span className="ocean ocean-west">ARABIAN<br/>SEA</span><span className="ocean ocean-east">BAY OF<br/>BENGAL</span>
    <div className="compass"><Navigation size={18}/><span>N</span></div>
    <div className="map-bottom"><span>City markers · drag to pan · scroll to zoom</span><a href="https://github.com/AbhinavSwami28/india-official-geojson" target="_blank" rel="noreferrer">Map attribution <ArrowUpRight size={12}/></a></div>
  </div>;
}
