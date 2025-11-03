import { useEffect, useRef, useState } from 'react'
import { registerSW } from './sw-register'

const API = 'http://localhost:8000'

function Chip({children}){ return <span className="chip" style={{marginRight:6}}>{children}</span> }
function LabelRow({label, children}){
  return (<div style={{display:'grid', gridTemplateColumns:'160px 1fr', alignItems:'center', gap:8, margin:'8px 0'}}>
    <div style={{opacity:.8}}>{label}</div><div>{children}</div></div>)
}

function MapView({origin, stops, dest, onMoveOrigin}){
  const mapRef = useRef(null), originMarker = useRef(null), destMarker = useRef(null)

  useEffect(() => {
    if (!mapRef.current){
      // eslint-disable-next-line no-undef
      const map = L.map('map').setView(origin, 14)
      // eslint-disable-next-line no-undef
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {maxZoom: 19}).addTo(map)
      // eslint-disable-next-line no-undef
      originMarker.current = L.marker(origin, {draggable:true}).addTo(map).bindPopup('Origin')
      originMarker.current.on('moveend', e => {
        const {lat, lng} = e.target.getLatLng()
        onMoveOrigin([lat, lng])
      })
      // eslint-disable-next-line no-undef
      destMarker.current = L.marker(dest).addTo(map).bindPopup('Destination')
      mapRef.current = map
    } else {
      mapRef.current.setView(origin, 14)
      originMarker.current.setLatLng(origin)
      destMarker.current.setLatLng(dest)
    }
  }, [origin, dest])

  useEffect(() => {
    if (!mapRef.current) return
    if (mapRef.current._stopsLayer){ mapRef.current.removeLayer(mapRef.current._stopsLayer) }
    // eslint-disable-next-line no-undef
    const group = L.layerGroup()
    stops.forEach(s => {
      // eslint-disable-next-line no-undef
      L.circleMarker([s.lat, s.lng], {radius:5}).bindTooltip(s.name).addTo(group)
    })
    group.addTo(mapRef.current)
    mapRef.current._stopsLayer = group
  }, [stops])

  return <div id="map" className="card"></div>
}

export default function App(){
  useEffect(() => registerSW(), [])

  const [origin, setOrigin] = useState([-36.8485, 174.7633])
  const [dest, setDest] = useState([-36.8443, 174.7676])
  const [stops, setStops] = useState([])
  const [itins, setItins] = useState([])
  const [banner, setBanner] = useState('')
  const [selectedStop, setSelectedStop] = useState(null)
  const [departures, setDepartures] = useState([])
  const [alerts, setAlerts] = useState([])

  // traveler options
  const [modes, setModes] = useState(['bus','train','walk'])
  const [optimize, setOptimize] = useState('fastest')
  const [maxWalkKm, setMaxWalkKm] = useState(1.2)
  const [avoidStairs, setAvoidStairs] = useState(false)
  const [bikeOk, setBikeOk] = useState(false)
  const [whenType, setWhenType] = useState('depart')
  const [whenValue, setWhenValue] = useState('now')

  // language + currency + simple converter
  const [lang, setLang] = useState('en')
  const [currency, setCurrency] = useState('NZD')
  const [nzd, setNzd] = useState(100)
  const rates = { NZD: 1, USD: 0.60, EUR: 0.55, PHP: 34.0 } // static demo rates
  const converted = (nzd * (rates[currency]||1)).toFixed(2)

  // saved places
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

  // fetch nearby stops & alerts
  useEffect(() => {
    fetch(`${API}/stops/nearby?lat=${origin[0]}&lng=${origin[1]}&radius=900`)
      .then(r => r.json()).then(d => setStops(d.stops || []))
    fetch(`${API}/alerts`).then(r=>r.json()).then(d=> setAlerts([...(d.alerts||[]), ...(d.traffic||[])]))
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
      optimize, max_walk_km: parseFloat(maxWalkKm),
      avoid_stairs: avoidStairs, bike_ok: bikeOk, modes,
    }
    const r = await fetch(`${API}/plan`, {
      method: 'POST', headers: {'Content-Type':'application/json'},
      body: JSON.stringify(payload)
    })
    const data = await r.json()
    setItins(data.itineraries || [])
    setBanner(data.context?.weatherAlert || '')
  }

  const exportPdf = async (itinerary) => {
    const r = await fetch(`${API}/export/itinerary`,{
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ origin, destination: dest, itinerary })
    })
    const blob = await r.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'atis_trip.pdf'; a.click()
    URL.revokeObjectURL(url)
  }

  // safety contacts
  const [contacts, setContacts] = useState([])
  useEffect(()=>{ fetch(`${API}/safety/contacts`).then(r=>r.json()).then(d=>setContacts(d.contacts||[])) }, [])

  // reviews
  const [reviews, setReviews] = useState([])
  const [reviewLoc, setReviewLoc] = useState('')
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const loadReviews = ()=> fetch(`${API}/reviews`).then(r=>r.json()).then(d=>setReviews(d.reviews||[]))
  useEffect(loadReviews, [])
  const submitReview = async ()=>{
    await fetch(`${API}/reviews`, {method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ location: reviewLoc, rating: Number(reviewRating), comment: reviewComment }) })
    setReviewLoc(''); setReviewRating(5); setReviewComment(''); loadReviews()
  }

  // prefs save to backend (language, currency, saved places)
  const savePrefs = async ()=>{
    await fetch(`${API}/prefs`, {method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ lang, currency, home: origin, work: dest })})
    alert('Preferences saved')
  }

  const toggleMode = (m) => setModes(prev => prev.includes(m) ? prev.filter(x => x!==m) : [...prev, m])
  const swapOD = () => { const o = origin; setOrigin(dest); setDest(o) }

  return (
    <div className="container">
      <header>
        <div>
          <h1 style={{margin:'0 0 4px'}}>ATIS</h1>
          <div style={{color:'var(--muted)'}}>Real-time travel, trip planning, safety & more.</div>
        </div>
        <div>
          <button className="btn" onClick={()=>savePlace('home', origin)}>Save Home</button>
          <button className="btn" style={{marginLeft:8}} onClick={()=>savePlace('work', dest)}>Save Work</button>
          <button className="btn" style={{marginLeft:8}} onClick={savePrefs}>Save Preferences</button>
        </div>
      </header>

      <div className="grid">
        <div className="card">
          <h3 style={{marginTop:0}}>Options</h3>

          <LabelRow label="Origin">
            <input value={origin.join(',')} onChange={e => setOrigin(e.target.value.split(',').map(Number))} style={{width:'100%'}}/>
            <div style={{marginTop:6, textAlign:'right'}}><button className="btn" onClick={()=>setOrigin(dest)}>Use destination</button></div>
          </LabelRow>

          <LabelRow label="Destination">
            <input value={dest.join(',')} onChange={e => setDest(e.target.value.split(',').map(Number))} style={{width:'100%'}}/>
            <div style={{marginTop:6, textAlign:'right'}}><button className="btn" onClick={()=>setDest(origin)}>Use origin</button></div>
          </LabelRow>

          <div style={{textAlign:'right', marginBottom:8}}>
            <button className="btn" onClick={swapOD}>Swap Origin/Destination</button>
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
            <span style={{marginLeft:8}}>{parseFloat(maxWalkKm).toFixed(1)}</span>
          </LabelRow>

          <LabelRow label="Accessibility">
            <label style={{marginRight:12}}><input type="checkbox" checked={avoidStairs} onChange={e => setAvoidStairs(e.target.checked)} /> Avoid stairs</label>
            <label><input type="checkbox" checked={bikeOk} onChange={e => setBikeOk(e.target.checked)} /> Bike OK</label>
          </LabelRow>

          <LabelRow label="When">
            <div>
              <label style={{marginRight:10}}><input type="radio" name="when" value="depart" checked={whenType==='depart'} onChange={()=>setWhenType('depart')} /> Depart at</label>
              <label><input type="radio" name="when" value="arrive" checked={whenType==='arrive'} onChange={()=>setWhenType('arrive')} /> Arrive by</label>
              <div style={{marginTop:6}}><input placeholder="now or 2025-11-03T09:00" value={whenValue} onChange={e=>setWhenValue(e.target.value)} style={{width:'100%'}}/></div>
            </div>
          </LabelRow>

          <div style={{textAlign:'right'}}>
            <button className="btn btn-primary" onClick={plan}>Find itineraries</button>
          </div>
        </div>

        <div style={{display:'grid', gridTemplateRows:'auto auto 1fr', gap:16}}>
          <div className="card">
            <div id="map"></div>
          </div>

          {banner && <div className="card">{banner}</div>}

          <div className="card">
            <h3 style={{marginTop:0}}>Itineraries</h3>
            {itins.length === 0 && <p style={{opacity:.8}}>Press <b>Find itineraries</b> to see options.</p>}
            <ol>
              {itins.map(it => (
                <li key={it.id} style={{margin:'10px 0', padding:'8px 0', borderTop:'1px solid var(--line)'}}>
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                    <div>
                      <div><strong>~{it.durationMin} min</strong> • {it.transfers} transfers • <span title="Reliability score">{Math.round((it.reliability||0)*100)}%</span></div>
                      <div style={{opacity:.8}}>legs: {it.legs.join(' → ')}</div>
                      <div style={{marginTop:6}}><Chip>{(it.walk_km ?? 0).toFixed(1)} km walk</Chip><Chip>{(it.modes||[]).join(', ')}</Chip></div>
                    </div>
                    <div>
                      <button className="btn" onClick={()=>exportPdf(it)}>Export PDF</button>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>

      <div className="grid" style={{marginTop:16}}>
        <div className="card">
          <h3 style={{marginTop:0}}>Alerts & Safety</h3>
          <ul>
            {alerts.map((a,i)=>(<li key={i}><strong>{a.type||a.id}</strong>: {a.title||a.summary} {a.severity?`• ${a.severity}`:''}</li>))}
          </ul>
          <h4>Emergency Contacts</h4>
          <ul>{contacts.map((c,i)=>(<li key={i}><strong>{c.name}</strong> — {c.phone}</li>))}</ul>
        </div>

        <div className="card">
          <h3 style={{marginTop:0}}>Reviews</h3>
          <div style={{display:'grid', gridTemplateColumns:'1fr 120px 1fr auto', gap:8}}>
            <input placeholder="Location" value={reviewLoc} onChange={e=>setReviewLoc(e.target.value)} />
            <input type="number" min="1" max="5" value={reviewRating} onChange={e=>setReviewRating(e.target.value)} />
            <input placeholder="Comment" value={reviewComment} onChange={e=>setReviewComment(e.target.value)} />
            <button className="btn" onClick={submitReview}>Post</button>
          </div>
          <ul style={{marginTop:8}}>
            {reviews.map((r,i)=>(<li key={i}><strong>{r.location}</strong> — {r.rating}/5 — {r.comment}</li>))}
          </ul>
        </div>

        <div className="card">
          <h3 style={{marginTop:0}}>Travel Tools</h3>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:8}}>
            <div>
              <div style={{opacity:.8, marginBottom:6}}>Language</div>
              <select value={lang} onChange={e=>setLang(e.target.value)}>
                <option value="en">English</option>
                <option value="tl">Tagalog</option>
                <option value="zh">中文</option>
              </select>
            </div>
            <div>
              <div style={{opacity:.8, marginBottom:6}}>Currency</div>
              <select value={currency} onChange={e=>setCurrency(e.target.value)}>
                <option value="NZD">NZD</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="PHP">PHP</option>
              </select>
            </div>
          </div>
          <div style={{marginTop:8}}>
            <div style={{opacity:.8, marginBottom:6}}>Currency Converter (demo rates)</div>
            <div style={{display:'grid', gridTemplateColumns:'1fr auto 1fr', gap:8}}>
              <input type="number" value={nzd} onChange={e=>setNzd(e.target.value)} />
              <div style={{alignSelf:'center'}}>NZD → {currency}</div>
              <input value={converted} readOnly />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
