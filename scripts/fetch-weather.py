"""Rebuild the public ERA5 dataset. Python 3 standard library only."""
import json, pathlib, urllib.request, urllib.parse, datetime, hashlib
root=pathlib.Path(__file__).resolve().parents[1]
seeds=json.loads((root/'frontend/src/data/cities.json').read_text())
params=urllib.parse.urlencode({'latitude':','.join(str(c['lat']) for c in seeds),'longitude':','.join(str(c['lng']) for c in seeds),'start_date':'2024-01-01','end_date':'2025-12-31','daily':'temperature_2m_max,temperature_2m_min','models':'era5','timezone':'Asia/Kolkata'})
url='https://archive-api.open-meteo.com/v1/archive?'+params
with urllib.request.urlopen(url,timeout=90) as r: raw=r.read()
payload=json.loads(raw)
assert isinstance(payload,list) and len(payload)==len(seeds), 'Incomplete city response'
records=[]
for seed,weather in zip(seeds,payload):
 daily=weather['daily']; dates=daily['time']; highs=daily['temperature_2m_max']; lows=daily['temperature_2m_min']
 assert len(dates)==len(highs)==len(lows)==731, 'Incomplete time series'
 assert all(isinstance(v,(int,float)) and -60<v<65 for v in highs+lows), 'Invalid temperature'
 for year in [2024,2025]:
  rows=[{'date':d,'high':hi,'low':lo} for d,hi,lo in zip(dates,highs,lows) if d.startswith(str(year))]
  months=[]
  for month in range(1,13):
   subset=[r for r in rows if int(r['date'][5:7])==month]
   months.append({'month':month,'high':round(sum(r['high'] for r in subset)/len(subset),1),'low':round(sum(r['low'] for r in subset)/len(subset),1),'hotDays':sum(r['high']>=40 for r in subset)})
  records.append({**{k:seed[k] for k in ['id','name','state','lat','lng']},'year':year,'peak':max(r['high'] for r in rows),'hotDays':sum(r['high']>=40 for r in rows),'warmNights':sum(r['low']>=25 for r in rows),'days':len(rows),'monthly':months,'daily':rows,'gridLat':weather['latitude'],'gridLng':weather['longitude']})
meta={'provider':'Open-Meteo','model':'ERA5','timezone':'Asia/Kolkata','retrievedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'request':url,'sha256':hashlib.sha256(raw).hexdigest(),'license':'CC BY 4.0','years':[2024,2025],'cityCount':len(seeds)}
(root/'frontend/public/data/era5-raw.json').write_bytes(raw)
(root/'frontend/src/data/weather.json').write_text(json.dumps({'meta':meta,'cities':records},separators=(',',':'))+'\n')
(root/'frontend/public/data/provenance.json').write_text(json.dumps(meta,indent=2)+'\n')
print(f'Validated {len(records)} city-year records, {sum(c["days"] for c in records)} daily pairs. SHA256: {meta["sha256"]}')
