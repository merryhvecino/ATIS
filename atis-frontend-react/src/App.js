import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

const API = '' // CRA proxy forwards to backend

// Fix Leaflet default icon issue with webpack
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const TRANSLATIONS = {
  en: {
    name: 'Advanced Traveler Info',
    tagline: 'Real-time, multimodal trip planning with smart suggestions.',
    translatorLabel: 'Preferred language',
    offlineCta: 'Save offline snapshot',
    shareLocation: 'Share Location',
    copyCoords: 'Copy Coordinates',
    locationCopied: 'Location copied!',
    tripPlanning: 'Trip planning & dynamic routing',
    realTimeSnapshot: 'Real-time snapshot',
    weatherNow: 'Weather now',
    alertsIncidents: 'Alerts & incidents',
    noAlerts: 'No active alerts right now.',
    findItineraries: 'Find itineraries',
    exportPdf: 'Export PDF',
    suggestAlt: 'Suggest alternative',
    emergencyContacts: 'Emergency Contacts'
  },
  es: {
    name: 'Información de Viaje Avanzada',
    tagline: 'Planificación de viajes multimodal con datos en tiempo real.',
    translatorLabel: 'Idioma preferido',
    offlineCta: 'Guardar información sin conexión',
    shareLocation: 'Compartir Ubicación',
    copyCoords: 'Copiar Coordenadas',
    locationCopied: '¡Ubicación copiada!',
    tripPlanning: 'Planificación y enrutamiento dinámico',
    realTimeSnapshot: 'Instantánea en tiempo real',
    weatherNow: 'Clima ahora',
    alertsIncidents: 'Alertas e incidentes',
    noAlerts: 'No hay alertas activas ahora.',
    findItineraries: 'Buscar itinerarios',
    exportPdf: 'Exportar PDF',
    suggestAlt: 'Sugerir alternativa',
    emergencyContacts: 'Contactos de Emergencia'
  },
  tl: {
    name: 'Advanced na Impormasyon sa Paglalakbay',
    tagline: 'Real-time na pagpaplano ng biyahe gamit ang matalinong mungkahi.',
    translatorLabel: 'Gustong wika',
    offlineCta: 'I-save ang offline na snapshot',
    shareLocation: 'Ibahagi ang Lokasyon',
    copyCoords: 'Kopyahin ang Coordinates',
    locationCopied: 'Nakopya ang lokasyon!',
    tripPlanning: 'Pagpaplano ng biyahe at dynamic na ruta',
    realTimeSnapshot: 'Real-time na snapshot',
    weatherNow: 'Panahon ngayon',
    alertsIncidents: 'Mga alerto at insidente',
    noAlerts: 'Walang aktibong alerto ngayon.',
    findItineraries: 'Maghanap ng itinerary',
    exportPdf: 'I-export ang PDF',
    suggestAlt: 'Magmungkahi ng alternatibo',
    emergencyContacts: 'Emergency na Contacts'
  },
  zh: {
    name: '高级旅行信息系统',
    tagline: '实时多模式行程规划与智能建议',
    translatorLabel: '首选语言',
    offlineCta: '保存离线快照',
    shareLocation: '分享位置',
    copyCoords: '复制坐标',
    locationCopied: '位置已复制！',
    tripPlanning: '行程规划与动态路线',
    realTimeSnapshot: '实时快照',
    weatherNow: '当前天气',
    alertsIncidents: '警报和事件',
    noAlerts: '目前没有活动警报',
    findItineraries: '查找行程',
    exportPdf: '导出PDF',
    suggestAlt: '建议替代方案',
    emergencyContacts: '紧急联系人'
  }
}

const CURRENCY_RATES = {
  NZD: 1,
  USD: 0.59,
  EUR: 0.55,
  AUD: 0.91
}

function Chip({children}){ return <span className="chip" style={{marginRight:6}}>{children}</span> }

function FeatureCard({title, description, children}){
  return (
    <section className="card" style={{padding:24, borderRadius:18, border:'1px solid var(--line)', background:'var(--card, #fff)', boxShadow:'0 1px 3px rgba(15,23,42,0.08)', marginBottom:20}}>
      <div style={{marginBottom:12}}>
        <div style={{fontSize:18, fontWeight:700}}>{title}</div>
        {description && <div style={{opacity:0.75, marginTop:4}}>{description}</div>}
      </div>
      <div>{children}</div>
    </section>
  )
}

function DraggableMarker({ position, setPosition, label }) {
  const [draggable, setDraggable] = useState(true)
  
  const eventHandlers = {
    dragend(e) {
      const marker = e.target
      const pos = marker.getLatLng()
      setPosition([pos.lat, pos.lng])
    },
  }

  return (
    <Marker
      draggable={draggable}
      eventHandlers={eventHandlers}
      position={position}
    >
      <Popup minWidth={90}>
        <span onClick={() => setDraggable((d) => !d)}>
          {label}<br/>
          {draggable ? 'Draggable' : 'Click to make draggable'}
        </span>
      </Popup>
    </Marker>
  )
}

function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      if (onMapClick) {
        onMapClick([e.latlng.lat, e.latlng.lng])
      }
    },
  })
  return null
}

function InteractiveMap({ origin, setOrigin, dest, setDest, stops }) {
  const center = origin
  
  return (
    <MapContainer center={center} zoom={13} style={{height: '100%', width: '100%', borderRadius: 12}}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <DraggableMarker position={origin} setPosition={setOrigin} label="Origin (drag me)" />
      <Marker position={dest}>
        <Popup>Destination</Popup>
      </Marker>
      {stops.slice(0, 10).map((stop) => (
        <Marker key={stop.stop_id} position={[stop.lat, stop.lng]} icon={new L.Icon({
          iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41]
        })}>
          <Popup><strong>{stop.name}</strong><br/>{stop.distance_m}m away</Popup>
        </Marker>
      ))}
      <MapClickHandler onMapClick={setDest} />
    </MapContainer>
  )
}

function AuthPanel({token, setToken, username, setUsername}){
  const [mode, setMode] = useState('login')
  const [user, setUser] = useState('')
  const [pass, setPass] = useState('')
  const [error, setError] = useState('')

  useEffect(()=>{
    const t = localStorage.getItem('atis_token')
    const u = localStorage.getItem('atis_user')
    if (t && u){ setToken(t); setUsername(u) }
  }, [setToken, setUsername])

  const submit = async () => {
    setError('')
    try{
      const r = await fetch(`${API}/auth/${mode}`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({username:user, password:pass}) })
      const d = await r.json()
      if (!r.ok) throw new Error(d.detail || 'Auth failed')
      setToken(d.token); setUsername(d.username)
      localStorage.setItem('atis_token', d.token); localStorage.setItem('atis_user', d.username)
      setUser(''); setPass('')
    }catch(e){ setError(e.message) }
  }

  const logout = () => { setToken(null); setUsername(null); localStorage.removeItem('atis_token'); localStorage.removeItem('atis_user') }

  return (
    <div className="toolbar">
      {token ? (<><span className="pill">Signed in as <b>{username}</b></span><button className="btn btn-danger" onClick={logout}>Logout</button></>) : (
        <>
          <select value={mode} onChange={e=>setMode(e.target.value)} style={{width:130}}>
            <option value="login">Login</option>
            <option value="register">Register</option>
          </select>
          <input placeholder="Username" value={user} onChange={e=>setUser(e.target.value)} style={{width:140}} />
          <input type="password" placeholder="Password" value={pass} onChange={e=>setPass(e.target.value)} style={{width:140}} />
          <button className="btn btn-primary" onClick={submit}>{mode.toUpperCase()}</button>
          {error && <span style={{color:'var(--danger)'}}>{error}</span>}
        </>
      )}
    </div>
  )
}

export default function App(){
  const [token, setToken] = useState(null)
  const [username, setUsername] = useState(null)

  const [origin, setOrigin] = useState([-36.8485, 174.7633])
  const [dest, setDest] = useState([-36.8443, 174.7676])
  const [stops, setStops] = useState([])
  const [itins, setItins] = useState([])
  const [banner, setBanner] = useState('')
  const [selectedStop, setSelectedStop] = useState(null)
  const [departures, setDepartures] = useState([])
  const [alerts, setAlerts] = useState([])
  const [alts, setAlts] = useState({})

  const [modes, setModes] = useState(['bus','train','walk'])
  const [optimize, setOptimize] = useState('fastest')
  const [maxWalkKm, setMaxWalkKm] = useState(1.2)
  const [avoidStairs, setAvoidStairs] = useState(false)
  const [bikeOk, setBikeOk] = useState(false)
  const [whenType, setWhenType] = useState('depart')
  const [whenValue, setWhenValue] = useState('now')

  const [weather, setWeather] = useState(null)
  const [safetyContacts, setSafetyContacts] = useState([])
  const [uiLang, setUiLang] = useState('en')
  const [currency, setCurrency] = useState('NZD')
  const [amount, setAmount] = useState(50)

  const text = TRANSLATIONS[uiLang] || TRANSLATIONS.en
  const convertedAmount = Number((amount * (CURRENCY_RATES[currency] || 1)).toFixed(2))

  const [reviews, setReviews] = useState([])
  const [reviewLoc, setReviewLoc] = useState('')
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')

  // Load initial data once
  useEffect(() => {
    fetch(`${API}/stops/nearby?lat=${origin[0]}&lng=${origin[1]}&radius=900`)
      .then(r=>r.json()).then(d=>setStops(d.stops||[])).catch(()=>{})
    fetch(`${API}/alerts`)
      .then(r=>r.json()).then(d=> setAlerts([...(d.alerts||[]), ...(d.traffic||[])])).catch(()=>{})
    fetch(`${API}/weather/point?lat=${origin[0]}&lng=${origin[1]}`)
      .then(r=>r.json()).then(d=>setWeather(d.forecast||null)).catch(()=>{})
    fetch(`${API}/safety/contacts`)
      .then(r=>r.json()).then(d=>setSafetyContacts(d.contacts||[])).catch(()=>{})
    fetch(`${API}/reviews`)
      .then(r=>r.json()).then(d=>setReviews(d.reviews||[])).catch(()=>{})
  }, [])

  // Update when origin changes
  useEffect(() => {
    fetch(`${API}/stops/nearby?lat=${origin[0]}&lng=${origin[1]}&radius=900`)
      .then(r=>r.json()).then(d=>setStops(d.stops||[])).catch(()=>{})
    fetch(`${API}/weather/point?lat=${origin[0]}&lng=${origin[1]}`)
      .then(r=>r.json()).then(d=>setWeather(d.forecast||null)).catch(()=>{})
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
    const r = await fetch(`${API}/plan`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) })
    const d = await r.json()
    setItins(d.itineraries || [])
    setBanner(d.context?.weatherAlert || '')
    setAlts({})
  }

  const exportPdf = async (itinerary) => {
    const r = await fetch(`${API}/export/itinerary`,{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ origin, destination: dest, itinerary }) })
    const blob = await r.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'atis_trip.pdf'; a.click(); URL.revokeObjectURL(url)
  }

  const suggestAlt = async (itinerary) => {
    const r = await fetch(`${API}/routes/suggest`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ current_itinerary: itinerary, incidents: alerts }) })
    const data = await r.json()
    setAlts(prev => ({...prev, [itinerary.id]: data.alternative}))
  }

  const authHeaders = () => token ? {'Authorization': `Bearer ${token}`} : {}
  
  const savePrefs = async () => {
    if (!token){ alert('Please login to save preferences.'); return }
    const r = await fetch(`${API}/prefs`, { method:'POST', headers:{'Content-Type':'application/json', ...authHeaders()}, body: JSON.stringify({ lang:'en', currency:'NZD', home: origin, work: dest }) })
    alert(r.ok?'Preferences saved':'Failed to save')
  }

  const languageOptions = Object.keys(TRANSLATIONS)
  const currencyOptions = Object.keys(CURRENCY_RATES)
  
  const saveOfflinePack = () => {
    const snapshot = { saved: { origin, destination: dest, modes, optimize, maxWalkKm, avoidStairs, bikeOk }, alerts, weather, stops, safetyContacts }
    localStorage.setItem('atis_offline_snapshot', JSON.stringify(snapshot))
    alert('Offline toolkit saved to this device.')
  }

  const updateSavedPlace = (key, coords) => {
    const store = JSON.parse(localStorage.getItem('atisSavedPlaces') || '{}')
    store[key] = coords
    localStorage.setItem('atisSavedPlaces', JSON.stringify(store))
    alert(`${key.charAt(0).toUpperCase() + key.slice(1)} saved`)
  }

  const submitReview = async ()=>{
    if (!token){ alert('Please login to post a review.'); return }
    const r = await fetch(`${API}/reviews`, {method:'POST', headers:{'Content-Type':'application/json', ...authHeaders()}, body: JSON.stringify({ location: reviewLoc, rating: Number(reviewRating), comment: reviewComment }) })
    if (!r.ok){ const t = await r.json(); alert('Failed: '+(t.detail||r.status)) }
    setReviewLoc(''); setReviewRating(5); setReviewComment('')
    fetch(`${API}/reviews`).then(r=>r.json()).then(d=>setReviews(d.reviews||[])).catch(()=>{})
  }

  const toggleMode = (m) => setModes(prev => prev.includes(m) ? prev.filter(x => x!==m) : [...prev, m])
  const swapOD = () => { const o = origin; setOrigin(dest); setDest(o) }
  
  const shareLocation = () => {
    const coords = `${origin[0].toFixed(5)}, ${origin[1].toFixed(5)}`
    const url = `https://www.google.com/maps?q=${origin[0]},${origin[1]}`
    navigator.clipboard.writeText(url).then(() => {
      alert(`${text.locationCopied}\n${url}`)
    }).catch(() => {
      alert(`${text.shareLocation}: ${coords}`)
    })
  }

  return (
    <div style={{background:'var(--app-bg,#f4f6fb)', minHeight:'100vh', padding:'24px 16px 48px'}}>
      <div style={{maxWidth:1180, margin:'0 auto'}}>
        <header style={{display:'flex', flexWrap:'wrap', justifyContent:'space-between', alignItems:'flex-start', gap:16, marginBottom:28}}>
          <div style={{display:'flex', alignItems:'center', gap:16}}>
            <div className="logo" style={{width:52, height:52, borderRadius:'50%', background:'var(--primary,#2563eb)', color:'#fff', display:'grid', placeItems:'center', fontWeight:800, fontSize:24}}>A</div>
            <div>
              <div style={{fontSize:24, fontWeight:800}}>{text.name}</div>
              <div style={{color:'var(--muted,#4b5563)', maxWidth:540}}>{text.tagline}</div>
            </div>
          </div>
          <div style={{display:'flex', flexDirection:'column', alignItems:'flex-end', gap:10, minWidth:260}}>
            <div style={{display:'flex', gap:8, alignItems:'center'}}>
              <span style={{fontSize:12, opacity:0.7}}>{text.translatorLabel}</span>
              <select value={uiLang} onChange={e=>setUiLang(e.target.value)}>
                {languageOptions.map(code => <option key={code} value={code}>{code.toUpperCase()}</option>)}
              </select>
            </div>
            <AuthPanel token={token} setToken={setToken} username={username} setUsername={setUsername} />
          </div>
        </header>

        <main>
          <FeatureCard title="🗺️ Interactive Map" description="Drag origin marker, click map to set destination, view nearby stops">
            <div style={{height:400, width:'100%'}}>
              <InteractiveMap origin={origin} setOrigin={setOrigin} dest={dest} setDest={setDest} stops={stops} />
            </div>
            <div style={{marginTop:12, display:'flex', gap:8, flexWrap:'wrap'}}>
              <button className="btn" onClick={shareLocation}>{text.shareLocation}</button>
              <button className="btn" onClick={() => navigator.clipboard.writeText(`${origin[0].toFixed(5)}, ${origin[1].toFixed(5)}`).then(() => alert(text.locationCopied))}>{text.copyCoords}</button>
            </div>
          </FeatureCard>

          <FeatureCard title={text.realTimeSnapshot} description="Live traffic, weather and notifications so riders stay ahead.">
            <div style={{display:'flex', flexWrap:'wrap', gap:16}}>
              <div style={{flex:'1 1 200px', minWidth:220}}>
                <div style={{fontWeight:600, marginBottom:6}}>{text.weatherNow}</div>
                {weather ? (
                  <div>
                    <div style={{fontSize:18, fontWeight:700}}>{weather.condition}</div>
                    <div style={{opacity:0.75}}>Temp {weather.tempC}°C • Wind {weather.windKph} km/h</div>
                  </div>
                ) : (
                  <div style={{opacity:0.65}}>Fetching latest forecast…</div>
                )}
              </div>
              <div style={{flex:'2 1 320px'}}>
                <div style={{fontWeight:600, marginBottom:6}}>{text.alertsIncidents}</div>
                <ul style={{margin:0, paddingLeft:18}}>
                  {alerts.slice(0,6).map((a,i)=>(
                    <li key={i}><strong>{a.type||a.id}</strong>: {a.title||a.summary} {a.severity?`• ${a.severity}`:''}</li>
                  ))}
                  {alerts.length===0 && <li style={{opacity:0.7}}>{text.noAlerts}</li>}
                </ul>
              </div>
              {banner && (
                <div style={{flexBasis:'100%', background:'rgba(37,99,235,0.12)', padding:12, borderRadius:12}}>
                  <strong>Notification:</strong> {banner}
                </div>
              )}
            </div>
          </FeatureCard>

          <FeatureCard title={text.tripPlanning} description="Plan ahead, adapt on the fly, and export journeys for the road.">
            <div style={{display:'grid', gap:24, gridTemplateColumns:'minmax(260px, 1fr) minmax(320px, 1.35fr)'}}>
              <div style={{display:'flex', flexDirection:'column', gap:12}}>
                <label style={{display:'flex', flexDirection:'column', gap:4}}>
                  <span style={{fontSize:12, opacity:0.75}}>Origin (lat,lng)</span>
                  <input value={origin.join(',')} onChange={e => setOrigin(e.target.value.split(',').map(Number))} />
                </label>
                <label style={{display:'flex', flexDirection:'column', gap:4}}>
                  <span style={{fontSize:12, opacity:0.75}}>Destination (lat,lng)</span>
                  <input value={dest.join(',')} onChange={e => setDest(e.target.value.split(',').map(Number))} />
                </label>
                <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
                  <button className="btn" style={{flex:1}} onClick={() => setOrigin(dest)}>Use destination as origin</button>
                  <button className="btn" style={{flex:1}} onClick={() => setDest(origin)}>Use origin as destination</button>
                  <button className="btn" onClick={swapOD}>Swap</button>
                </div>
                <div style={{display:'flex', flexDirection:'column', gap:6}}>
                  <span style={{fontSize:12, opacity:0.75}}>Preferred modes</span>
                  <div>
                    {['bus','train','ferry','walk','bike'].map(m => (
                      <label key={m} style={{marginRight:10}}>
                        <input type="checkbox" checked={modes.includes(m)} onChange={() => toggleMode(m)} /> {m}
                      </label>
                    ))}
                  </div>
                </div>
                <label style={{display:'flex', flexDirection:'column', gap:4}}>
                  <span style={{fontSize:12, opacity:0.75}}>Optimize for</span>
                  <select value={optimize} onChange={e => setOptimize(e.target.value)}>
                    <option value="fastest">Fastest</option>
                    <option value="fewest_transfers">Fewest transfers</option>
                    <option value="least_walking">Least walking</option>
                    <option value="reliable">Most reliable</option>
                  </select>
                </label>
                <label style={{display:'flex', flexDirection:'column', gap:4}}>
                  <span style={{fontSize:12, opacity:0.75}}>Max walking distance (km)</span>
                  <input type="number" min="0" max="3" step="0.1" value={maxWalkKm} onChange={e => setMaxWalkKm(e.target.value)} />
                </label>
                <div style={{display:'flex', gap:12, flexWrap:'wrap'}}>
                  <label><input type="checkbox" checked={avoidStairs} onChange={e => setAvoidStairs(e.target.checked)} /> Avoid stairs</label>
                  <label><input type="checkbox" checked={bikeOk} onChange={e => setBikeOk(e.target.checked)} /> Bike friendly</label>
                </div>
                <div style={{display:'flex', flexDirection:'column', gap:6}}>
                  <span style={{fontSize:12, opacity:0.75}}>When to travel</span>
                  <div style={{display:'flex', gap:12}}>
                    <label><input type="radio" name="when" value="depart" checked={whenType==='depart'} onChange={()=>setWhenType('depart')} /> Depart at</label>
                    <label><input type="radio" name="when" value="arrive" checked={whenType==='arrive'} onChange={()=>setWhenType('arrive')} /> Arrive by</label>
                  </div>
                  <input placeholder="now or 2025-11-03T09:00" value={whenValue} onChange={e=>setWhenValue(e.target.value)} />
                </div>
                <button className="btn btn-primary" onClick={plan} style={{alignSelf:'flex-start'}}>{text.findItineraries}</button>
              </div>
              <div>
                {itins.length === 0 ? (
                  <p style={{opacity:0.75}}>Press <b>Find itineraries</b> to see recommended routes.</p>
                ) : (
                  <ol style={{paddingLeft:20, margin:0, display:'flex', flexDirection:'column', gap:12}}>
                    {itins.map(it => (
                      <li key={it.id} style={{padding:'12px 0', borderTop:'1px solid var(--line,#e5e7eb)'}}>
                        <div style={{display:'flex', justifyContent:'space-between', gap:12, flexWrap:'wrap'}}>
                          <div>
                            <div><strong>~{it.durationMin} min</strong> • {it.transfers} transfers • <span title="Reliability score">{Math.round((it.reliability||0)*100)}%</span></div>
                            <div style={{opacity:0.75}}>legs: {it.legs.join(' → ')}</div>
                            <div style={{marginTop:6}}>
                              <Chip>{(it.walk_km ?? 0).toFixed(1)} km walk</Chip>
                              <Chip>{(it.modes||[]).join(', ')}</Chip>
                            </div>
                          </div>
                          <div style={{display:'flex', gap:8}}>
                            <button className="btn" onClick={()=>exportPdf(it)}>{text.exportPdf}</button>
                            <button className="btn" onClick={()=>suggestAlt(it)}>{text.suggestAlt}</button>
                          </div>
                        </div>
                        {alts[it.id] && (
                          <div style={{marginTop:10, padding:12, borderRadius:12, background:'rgba(22,163,74,0.08)'}}>
                            <div><strong>Alternative:</strong> ~{alts[it.id].durationMin || '—'} min • {alts[it.id].transfers || 0} transfers</div>
                            {alts[it.id].note && <div style={{opacity:0.75}}>{alts[it.id].note}</div>}
                            {alts[it.id].legs && <div style={{opacity:0.75}}>legs: {alts[it.id].legs.join(' → ')}</div>}
                          </div>
                        )}
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            </div>
          </FeatureCard>

          <FeatureCard title="Multimodal & nearby options" description="Check nearby stops, live departures, and multimodal choices.">
            <div style={{display:'flex', flexDirection:'column', gap:18}}>
              <div style={{display:'flex', flexWrap:'wrap', gap:12}}>
                {stops.slice(0,6).map(s => (
                  <div key={s.stop_id} style={{padding:12, border:'1px solid var(--line,#e5e7eb)', borderRadius:12, background:'var(--card,#fff)', minWidth:180}}>
                    <div style={{fontWeight:700}}>{s.name}</div>
                    <div style={{opacity:0.7, fontSize:12}}>{s.distance_m} m away</div>
                    <div style={{marginTop:10}}><button className="btn" onClick={()=>viewDepartures(s)}>Live departures</button></div>
                  </div>
                ))}
                {stops.length===0 && <div style={{opacity:0.7}}>Searching for nearby stops…</div>}
              </div>
              {selectedStop && (
                <div style={{border:'1px solid var(--line,#e5e7eb)', borderRadius:12, padding:16, background:'var(--card,#fff)'}}>
                  <div style={{fontWeight:700, marginBottom:8}}>Departures — {selectedStop.name}</div>
                  <ul style={{margin:0, paddingLeft:18}}>
                    {departures.map((d,i)=>(
                      <li key={i}><strong>{d.route}</strong> → {d.headsign} <span style={{opacity:0.65}}>in {d.departure_in_min} min</span></li>
                    ))}
                    {departures.length===0 && <li style={{opacity:0.65}}>Loading departures…</li>}
                  </ul>
                </div>
              )}
            </div>
          </FeatureCard>

          <FeatureCard title="Personalization & safety" description="Save favourites, keep data offline, and access emergency support.">
            <div style={{display:'flex', flexWrap:'wrap', gap:20}}>
              <div style={{flex:'1 1 260px', display:'flex', flexDirection:'column', gap:10}}>
                <div style={{fontWeight:600}}>Quick actions</div>
                <button className="btn" onClick={()=>updateSavedPlace('home', origin)}>Save home</button>
                <button className="btn" onClick={()=>updateSavedPlace('work', dest)}>Save work</button>
                <button className="btn btn-primary" onClick={savePrefs}>Save to profile</button>
                <button className="btn" onClick={saveOfflinePack}>{text.offlineCta}</button>
                {token ? (
                  <div style={{fontSize:13, opacity:0.75}}>Signed in as {username}. Preferences sync across devices.</div>
                ) : (
                  <div style={{fontSize:13, opacity:0.75}}>Create an account above to sync preferences and reviews.</div>
                )}
              </div>
              <div style={{flex:'1 1 260px'}}>
                <div style={{fontWeight:600, marginBottom:6}}>🛟 {text.emergencyContacts}</div>
                <ul style={{margin:0, paddingLeft:18}}>
                  {safetyContacts.map((c,i)=>(
                    <li key={i}><strong>{c.name}</strong> — <a href={`tel:${c.phone}`} style={{color:'var(--danger)', fontWeight:700}}>{c.phone}</a></li>
                  ))}
                  {safetyContacts.length===0 && <li style={{opacity:0.7}}>Loading local contacts…</li>}
                </ul>
                <div style={{marginTop:12}}>
                  <button className="btn" onClick={shareLocation}>{text.shareLocation}</button>
                </div>
              </div>
              <div style={{flex:'1 1 260px'}}>
                <div style={{fontWeight:600, marginBottom:6}}>Share status</div>
                <p style={{opacity:0.75}}>Tap <em>Save offline snapshot</em> before you head out to keep routes, alerts, and emergency numbers handy — even without coverage.</p>
              </div>
            </div>
          </FeatureCard>

          <FeatureCard title="Travel toolkit" description="International tools for language, money, and bookings.">
            <div style={{display:'flex', flexWrap:'wrap', gap:20}}>
              <div style={{flex:'1 1 220px'}}>
                <div style={{fontWeight:600, marginBottom:6}}>In-app translator</div>
                <p style={{opacity:0.75}}>Interface now in <strong>{uiLang.toUpperCase()}</strong>. Additional copy will respect this preference as the app grows.</p>
              </div>
              <div style={{flex:'1 1 260px', display:'flex', flexDirection:'column', gap:8}}>
                <div style={{fontWeight:600}}>Currency helper</div>
                <label style={{fontSize:12, opacity:0.75}}>Amount in NZD</label>
                <input type="number" value={amount} min="0" onChange={e=>setAmount(Number(e.target.value) || 0)} />
                <label style={{fontSize:12, opacity:0.75}}>Convert to</label>
                <select value={currency} onChange={e=>setCurrency(e.target.value)}>
                  {currencyOptions.map(code => <option key={code} value={code}>{code}</option>)}
                </select>
                <div style={{marginTop:4, fontWeight:600}}>≈ {convertedAmount} {currency}</div>
              </div>
              <div style={{flex:'1 1 260px'}}>
                <div style={{fontWeight:600, marginBottom:6}}>Bookings & payments</div>
                <ul style={{margin:0, paddingLeft:18}}>
                  <li>Reserve transit passes and parking</li>
                  <li>Bundle flights + hotels (coming soon)</li>
                  <li>Secure wallet for ticketing integrations</li>
                </ul>
              </div>
            </div>
          </FeatureCard>

          <FeatureCard title="Community insights" description="Crowd-sourced tips keep travellers informed.">
            <div style={{display:'flex', flexWrap:'wrap', gap:20}}>
              <div style={{flex:'1 1 260px', display:'flex', flexDirection:'column', gap:10}}>
                <label style={{display:'flex', flexDirection:'column', gap:4}}>
                  <span style={{fontSize:12, opacity:0.75}}>Location</span>
                  <input placeholder="e.g., Britomart" value={reviewLoc} onChange={e=>setReviewLoc(e.target.value)} />
                </label>
                <label style={{display:'flex', flexDirection:'column', gap:4}}>
                  <span style={{fontSize:12, opacity:0.75}}>Rating</span>
                  <select value={reviewRating} onChange={e=>setReviewRating(e.target.value)}>
                    {[5,4,3,2,1].map(n=> <option key={n} value={n}>{n}</option>)}
                  </select>
                </label>
                <label style={{display:'flex', flexDirection:'column', gap:4}}>
                  <span style={{fontSize:12, opacity:0.75}}>Comment</span>
                  <input placeholder="Short note…" value={reviewComment} onChange={e=>setReviewComment(e.target.value)} />
                </label>
                <button className="btn btn-primary" onClick={submitReview}>Share review</button>
              </div>
              <div style={{flex:'1 1 320px'}}>
                <div style={{fontWeight:600, marginBottom:8}}>Latest reviews</div>
                <ul style={{margin:0, paddingLeft:18, display:'flex', flexDirection:'column', gap:8}}>
                  {reviews.map((r,i)=>(
                    <li key={i}><strong>{r.location}</strong> • {r.rating}/5 — {r.comment} <span style={{opacity:0.6}}>by {r.user}</span></li>
                  ))}
                  {reviews.length===0 && <li style={{opacity:0.7}}>Be the first to add a community update.</li>}
                </ul>
              </div>
            </div>
          </FeatureCard>
        </main>
      </div>
    </div>
  )
}
