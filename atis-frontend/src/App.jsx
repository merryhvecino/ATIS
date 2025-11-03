import { useEffect, useState } from 'react'

const API = 'http://localhost:8000'

function Chip({children}){
  return <span style={{border:'1px solid #ddd', borderRadius:16, padding:'2px 8px', marginRight:6, fontSize:12}}>{children}</span>
}

function LabelRow({label, children}){
  return (
    <div style={{display:'grid', gridTemplateColumns:'160px 1fr', alignItems:'center', gap:8, margin:'8px 0'}}>
      <div style={{opacity:.8}}>{label}</div>
      <div>{children}</div>
    </div>
  )
}

export default function App() {
  const [origin, setOrigin] = useState([-36.8485, 174.7633])
  const [dest, setDest] = useState([-36.8443, 174.7676])
  const [stops, setStops] = useState([])
  const [itins, setItins] = useState([])
  const [banner, setBanner] = useState('')
  const [selectedStop, setSelectedStop] = useState(null)
  const [departures, setDepartures] = useState([])

  const [modes, setModes] = useState(['bus','train','walk'])
  const [optimize, setOptimize] = useState('fastest')
  const [maxWalkKm, setMaxWalkKm] = useState(1.2)
  const [avoidStairs, setAvoidStairs] = useState(false)
  const [bikeOk, setBikeOk] = useState(false)
  const [prefersFewerTransfers, setPrefersFewerTransfers] = useState(true)
  const [whenType, setWhenType] = useState('depart')
  const [whenValue, setWhenValue] = useState('now')

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('atisSavedPlaces') || '{}')
    if (saved.home) setOrigin(saved.home)
    if (saved.work) setDest(saved.work)
  }, [])

  const savePlace = (key, coords) => {
    const saved = JSON.parse(localStorage.getItem('atisSavedPlaces') || '{}')
    saved[key] = coords
    localStorage.setItem('atisSavedPlaces', JSON.stringify(saved))
    alert(`Saved ${key} location!`)
  }

  useEffect(() => {
    fetch(`${API}/stops/nearby?lat=${origin[0]}&lng=${origin[1]}&radius=900`)
      .then(r => r.json()).then(d => setStops(d.stops || []))
  }, [origin])

  const viewDepartures = async (stop) => {
    setSelectedStop(stop)
    const r = await fetch(`${API}/departures?stop_id=${stop.stop_id}`)
    const data = await r.json()
    setDepartures(data.departures || [])
  }

  const plan = async () => {
    const payload = {
      origin, destination: dest,
      depart_at: whenType === 'depart' ? whenValue : 'now',
      arrive_by: whenType === 'arrive' ? whenValue : null,
      prefers_fewer_transfers: prefersFewerTransfers,
      optimize, max_walk_km: parseFloat(maxWalkKm),
      avoid_stairs: avoidStairs, bike_ok: bikeOk, modes,
    }
    const r = await fetch(`${API}/plan`, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify(payload)
    })
    const data = await r.json()
    setItins(data.itineraries || [])
    setBanner(data.context?.weatherAlert || '')
  }

  const toggleMode = (m) => {
    setModes(prev => prev.includes(m) ? prev.filter(x => x!==m) : [...prev, m])
  }
  const swapOD = () => { const o = origin; setOrigin(dest); setDest(o) }

  return (
    <div style={{maxWidth: 1100, margin: '24px auto', padding: 16, fontFamily:'Inter, system-ui, Arial'}}>
      <h1 style={{marginBottom: 8}}>ATIS (Demo)</h1>
      <p style={{opacity:.8, marginTop:0}}>Traveler-friendly controls for better public transport choices.</p>

      <div style={{display:'grid', gridTemplateColumns:'360px 1fr', gap:16}}>
        <div style={{border:'1px solid #ddd', borderRadius:12, padding:12}}>
          <h3 style={{marginTop:0}}>Options</h3>

          <LabelRow label="Origin">
            <div>
              <input value={origin.join(',')} onChange={e => setOrigin(e.target.value.split(',').map(Number))} style={{width:'100%'}}/>
              <div style={{marginTop:6}}>
                <button onClick={() => savePlace('home', origin)}>Save Home</button>
                <button style={{marginLeft:8}} onClick={() => savePlace('work', origin)}>Save Work (as origin)</button>
              </div>
            </div>
          </LabelRow>

          <LabelRow label="Destination">
            <div>
              <input value={dest.join(',')} onChange={e => setDest(e.target.value.split(',').map(Number))} style={{width:'100%'}}/>
              <div style={{marginTop:6}}>
                <button onClick={() => savePlace('home', dest)}>Save Home (as dest)</button>
                <button style={{marginLeft:8}} onClick={() => savePlace('work', dest)}>Save Work</button>
              </div>
            </div>
          </LabelRow>

          <div style={{textAlign:'right', marginBottom:8}}>
            <button onClick={swapOD}>Swap Origin/Destination</button>
          </div>

          <LabelRow label="Modes">
            <div>
              {['bus','train','ferry','walk','bike'].map(m => (
                <label key={m} style={{marginRight:10}}>
                  <input type="checkbox" checked={modes.includes(m)} onChange={() => toggleMode(m)} /> {m}
                </label>
              ))}
            </div>
          </LabelRow>

          <LabelRow label="Optimize for">
            <select value={optimize} onChange={e => setOptimize(e.target.value)}>
              <option value="fastest">Fastest</option>
              <option value="fewest_transfers">Fewest transfers</option>
              <option value="least_walking">Least walking</option>
              <option value="reliable">Most reliable</option>
            </select>
          </LabelRow>

          <LabelRow label="Max walk (km)">
            <input type="range" min="0" max="3" step="0.1" value={maxWalkKm} onChange={e => setMaxWalkKm(e.target.value)} />
            <div style={{marginLeft:8, display:'inline-block', width:40, textAlign:'right'}}>{parseFloat(maxWalkKm).toFixed(1)}</div>
          </LabelRow>

          <LabelRow label="Accessibility">
            <label style={{marginRight:12}}>
              <input type="checkbox" checked={avoidStairs} onChange={e => setAvoidStairs(e.target.checked)} /> Avoid stairs
            </label>
            <label>
              <input type="checkbox" checked={bikeOk} onChange={e => setBikeOk(e.target.checked)} /> Bike OK
            </label>
          </LabelRow>

          <LabelRow label="Transfers">
            <label>
              <input type="checkbox" checked={prefersFewerTransfers} onChange={e => setPrefersFewerTransfers(e.target.checked)} />
              {' '}Prefer fewer transfers
            </label>
          </LabelRow>

          <LabelRow label="When">
            <div>
              <label style={{marginRight:10}}><input type="radio" name="when" value="depart" checked={whenType==='depart'} onChange={()=>setWhenType('depart')} /> Depart at</label>
              <label><input type="radio" name="when" value="arrive" checked={whenType==='arrive'} onChange={()=>setWhenType('arrive')} /> Arrive by</label>
              <div style={{marginTop:6}}>
                <input placeholder="now or 2025-11-03T09:00" value={whenValue} onChange={e=>setWhenValue(e.target.value)} style={{width:'100%'}}/>
              </div>
            </div>
          </LabelRow>

          <div style={{textAlign:'right'}}>
            <button onClick={plan}>Find itineraries</button>
          </div>
        </div>

        <div style={{display:'grid', gridTemplateRows:'auto auto 1fr', gap:16}}>
          {banner && <div style={{padding:12, border:'1px solid #f0c', borderRadius:12}}>{banner}</div>}

          <div style={{border:'1px solid #ddd', borderRadius:12, padding:12}}>
            <h3 style={{marginTop:0}}>Nearby stops (from origin)</h3>
            <div style={{display:'flex', flexWrap:'wrap'}}>
              {stops.map(s => (
                <div key={s.stop_id} style={{padding:8, border:'1px solid #eee', borderRadius:8, margin:'6px'}}>
                  <div style={{fontWeight:600}}>{s.name}</div>
                  <div style={{opacity:.7, fontSize:12}}>{s.distance_m} m</div>
                  <div style={{marginTop:6}}>
                    <button onClick={()=>viewDepartures(s)}>Live departures</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{border:'1px solid #ddd', borderRadius:12, padding:12}}>
            <h3 style={{marginTop:0}}>Itineraries</h3>
            {itins.length === 0 && <p style={{opacity:.8}}>Press <b>Find itineraries</b> to see options.</p>}
            <ol>
              {itins.map(it => (
                <li key={it.id} style={{margin:'10px 0'}}>
                  <div><strong>~{it.durationMin} min</strong> • {it.transfers} transfers • <span title="Reliability score">{Math.round((it.reliability||0)*100)}%</span></div>
                  <div style={{opacity:.8}}>legs: {it.legs.join(' → ')}</div>
                  <div style={{marginTop:6}}>
                    <Chip>{(it.walk_km ?? 0).toFixed(1)} km walk</Chip>
                    <Chip>{(it.modes||[]).join(', ')}</Chip>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {selectedStop && (
            <div style={{border:'1px solid #ddd', borderRadius:12, padding:12}}>
              <h3 style={{marginTop:0}}>Departures — {selectedStop.name}</h3>
              <ul>
                {departures.map((d, i) => (
                  <li key={i}>
                    <strong>{d.route}</strong> → {d.headsign} <span style={{opacity:.7}}>in {d.departure_in_min} min</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
