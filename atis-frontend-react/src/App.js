import { useEffect, useState } from 'react'
const API = '' // CRA proxy forwards to backend
function Chip({children}){ return <span className="chip" style={{marginRight:6}}>{children}</span> }
function AuthPanel({token, setToken, username, setUsername}){
  const [mode, setMode] = useState('login'); const [user, setUser] = useState(''); const [pass, setPass] = useState(''); const [error, setError] = useState('')
  useEffect(()=>{ const t=localStorage.getItem('atis_token'); const u=localStorage.getItem('atis_user'); if(t&&u){setToken(t); setUsername(u)} },[setToken,setUsername])
  const submit = async ()=>{ setError(''); try{ const r=await fetch(`${API}/auth/${mode}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:user,password:pass})}); const d=await r.json(); if(!r.ok) throw new Error(d.detail||'Auth failed'); setToken(d.token); setUsername(d.username); localStorage.setItem('atis_token',d.token); localStorage.setItem('atis_user',d.username); setUser(''); setPass('')}catch(e){setError(e.message)}}
  const logout=()=>{ setToken(null); setUsername(null); localStorage.removeItem('atis_token'); localStorage.removeItem('atis_user') }
  if(token) return (<div className="auth"><div>Signed in as <b>{username}</b></div><button className="btn btn-danger" onClick={logout}>Log out</button></div>)
  return (<div className="auth">
    <select value={mode} onChange={e=>setMode(e.target.value)}><option value="login">Login</option><option value="register">Register</option></select>
    <input placeholder="Username" value={user} onChange={e=>setUser(e.target.value)} /><input type="password" placeholder="Password" value={pass} onChange={e=>setPass(e.target.value)} />
    <button className="btn btn-primary" onClick={submit}>{mode.toUpperCase()}</button>{error && <span style={{color:'var(--danger)'}}>{error}</span>}
  </div>)
}
export default function App(){
  const [token, setToken] = useState(null), [username, setUsername] = useState(null)
  const [origin, setOrigin] = useState([-36.8485, 174.7633]), [dest, setDest] = useState([-36.8443, 174.7676])
  const [stops, setStops] = useState([]), [itins, setItins] = useState([]), [banner, setBanner] = useState('')
  const [selectedStop, setSelectedStop] = useState(null), [departures, setDepartures] = useState([])
  const [alerts, setAlerts] = useState([]), [alts, setAlts] = useState({})
  const [modes, setModes] = useState(['bus','train','walk']), [optimize, setOptimize] = useState('fastest')
  const [maxWalkKm, setMaxWalkKm] = useState(1.2), [avoidStairs, setAvoidStairs] = useState(false), [bikeOk, setBikeOk] = useState(false)
  const [whenType, setWhenType] = useState('depart'), [whenValue, setWhenValue] = useState('now')
  useEffect(()=>{ fetch(`${API}/stops/nearby?lat=${origin[0]}&lng=${origin[1]}&radius=900`).then(r=>r.json()).then(d=>setStops(d.stops||[])).catch(()=>{})
                  fetch(`${API}/alerts`).then(r=>r.json()).then(d=>setAlerts([...(d.alerts||[]),...(d.traffic||[])])).catch(()=>{}) },[origin])
  const viewDepartures=async(stop)=>{ setSelectedStop(stop); const r=await fetch(`${API}/departures?stop_id=${stop.stop_id}`); const d=await r.json(); setDepartures(d.departures||[]) }
  const plan=async()=>{ const payload={origin,destination:dest,depart_at:whenType==='depart'?whenValue:'now',arrive_by:whenType==='arrive'?whenValue:null,optimize,max_walk_km:parseFloat(maxWalkKm),avoid_stairs:avoidStairs,bike_ok:bikeOk,modes}
    const r=await fetch(`${API}/plan`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)}); const d=await r.json(); setItins(d.itineraries||[]); setBanner(d.context?.weatherAlert||''); setAlts({}) }
  const exportPdf=async(it)=>{ const r=await fetch(`${API}/export/itinerary`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({origin,destination:dest,itinerary:it})}); const b=await r.blob(); const url=URL.createObjectURL(b); const a=document.createElement('a'); a.href=url; a.download='atis_trip.pdf'; a.click(); URL.revokeObjectURL(url) }
  const suggestAlt=async(it)=>{ const r=await fetch(`${API}/routes/suggest`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({current_itinerary:it,incidents:alerts})}); const d=await r.json(); setAlts(p=>({...p,[it.id]:d.alternative})) }
  const authHeaders=()=> token?{'Authorization':`Bearer ${token}`}:{}
  const savePrefs=async()=>{ if(!token){alert('Please login to save preferences.'); return} const r=await fetch(`${API}/prefs`,{method:'POST',headers:{'Content-Type':'application/json',...authHeaders()},body:JSON.stringify({lang:'en',currency:'NZD',home:origin,work:dest})}); alert(r.ok?'Preferences saved':'Failed to save') }
  const [reviews, setReviews] = useState([]), [reviewLoc, setReviewLoc] = useState(''), [reviewRating, setReviewRating] = useState(5), [reviewComment, setReviewComment] = useState('')
  const loadReviews=()=> fetch(`${API}/reviews`).then(r=>r.json()).then(d=>setReviews(d.reviews||[])).catch(()=>{}); useEffect(loadReviews, [])
  const submitReview=async()=>{ if(!token){alert('Please login to post a review.'); return}
    const r=await fetch(`${API}/reviews`,{method:'POST',headers:{'Content-Type':'application/json',...authHeaders()},body:JSON.stringify({location:reviewLoc,rating:Number(reviewRating),comment:reviewComment})})
    if(!r.ok){ const t=await r.json(); alert('Failed: '+(t.detail||r.status)) } setReviewLoc(''); setReviewRating(5); setReviewComment(''); loadReviews() }
  const toggleMode=m=> setModes(p=> p.includes(m)?p.filter(x=>x!==m):[...p,m]); const swapOD=()=>{ const o=origin; setOrigin(dest); setDest(o) }
  return (<div className="container">
    <header><div><h1 style={{margin:'0 0 4px'}}>ATIS</h1><div style={{color:'var(--muted)'}}>Plan smart, go faster.</div></div>
    <div style={{display:'flex',gap:12,alignItems:'center'}}>
      <AuthPanel token={token} setToken={setToken} username={username} setUsername={setUsername} />
      <button className="btn" onClick={()=>{const s=JSON.parse(localStorage.getItem('atisSavedPlaces')||'{}'); s.home=origin; localStorage.setItem('atisSavedPlaces',JSON.stringify(s)); alert('Saved Home')}}>Save Home</button>
      <button className="btn" onClick={()=>{const s=JSON.parse(localStorage.getItem('atisSavedPlaces')||'{}'); s.work=dest; localStorage.setItem('atisSavedPlaces',JSON.stringify(s)); alert('Saved Work')}}>Save Work</button>
      <button className="btn" onClick={savePrefs}>Save Preferences</button></div></header>
    <div className="grid">
      <div className="card">
        <h3 style={{marginTop:0}}>Options</h3>
        <div style={{display:'grid',gridTemplateColumns:'160px 1fr',gap:8,margin:'8px 0'}}>
          <div style={{opacity:.8}}>Origin</div><div><input value={origin.join(',')} onChange={e=>setOrigin(e.target.value.split(',').map(Number))} style={{width:'100%'}}/>
          <div style={{marginTop:6,textAlign:'right'}}><button className="btn" onClick={()=>setOrigin(dest)}>Use destination</button></div></div></div>
        <div style={{display:'grid',gridTemplateColumns:'160px 1fr',gap:8,margin:'8px 0'}}>
          <div style={{opacity:.8}}>Destination</div><div><input value={dest.join(',')} onChange={e=>setDest(e.target.value.split(',').map(Number))} style={{width:'100%'}}/>
          <div style={{marginTop:6,textAlign:'right'}}><button className="btn" onClick={()=>setDest(origin)}>Use origin</button></div></div></div>
        <div style={{textAlign:'right',marginBottom:8}}><button className="btn" onClick={swapOD}>Swap Origin/Destination</button></div>
        <div style={{display:'grid',gridTemplateColumns:'160px 1fr',gap:8,margin:'8px 0'}}>
          <div style={{opacity:.8}}>Modes</div><div>{['bus','train','ferry','walk','bike'].map(m=>(
            <label key={m} style={{marginRight:10}}><input type="checkbox" checked={modes.includes(m)} onChange={()=>toggleMode(m)} /> {m}</label>))}</div></div>
        <div style={{display:'grid',gridTemplateColumns:'160px 1fr',gap:8,margin:'8px 0'}}>
          <div style={{opacity:.8}}>Optimize for</div><select value={optimize} onChange={e=>setOptimize(e.target.value)}>
            <option value="fastest">Fastest</option><option value="fewest_transfers">Fewest transfers</option>
            <option value="least_walking">Least walking</option><option value="reliable">Most reliable</option></select></div>
        <div style={{display:'grid',gridTemplateColumns:'160px 1fr',gap:8,margin:'8px 0'}}>
          <div style={{opacity:.8}}>Max walk (km)</div><div><input type="range" min="0" max="3" step="0.1" value={maxWalkKm} onChange={e=>setMaxWalkKm(e.target.value)} />
          <span style={{marginLeft:8}}>{parseFloat(maxWalkKm).toFixed(1)}</span></div></div>
        <div style={{display:'grid',gridTemplateColumns:'160px 1fr',gap:8,margin:'8px 0'}}>
          <div style={{opacity:.8}}>Accessibility</div><div>
            <label style={{marginRight:12}}><input type="checkbox" checked={avoidStairs} onChange={e=>setAvoidStairs(e.target.checked)} /> Avoid stairs</label>
            <label><input type="checkbox" checked={bikeOk} onChange={e=>setBikeOk(e.target.checked)} /> Bike OK</label></div></div>
        <div style={{display:'grid',gridTemplateColumns:'160px 1fr',gap:8,margin:'8px 0'}}>
          <div style={{opacity:.8}}>When</div><div>
            <label style={{marginRight:10}}><input type="radio" name="when" value="depart" checked={whenType==='depart'} onChange={()=>setWhenType('depart')} /> Depart at</label>
            <label><input type="radio" name="when" value="arrive" checked={whenType==='arrive'} onChange={()=>setWhenType('arrive')} /> Arrive by</label>
            <div style={{marginTop:6}}><input placeholder="now or 2025-11-03T09:00" value={whenValue} onChange={e=>setWhenValue(e.target.value)} style={{width:'100%'}}/></div></div></div>
        <div style={{textAlign:'right'}}><button className="btn btn-primary" onClick={plan}>Find itineraries</button></div>
      </div>
      <div style={{display:'grid',gridTemplateRows:'auto auto 1fr',gap:16}}>
        <div className="card"><div id="map">Map placeholder (Leaflet optional)</div></div>
        {banner && <div className="card">{banner}</div>}
        <div className="card"><h3 style={{marginTop:0}}>Itineraries</h3>
          {itins.length===0 && <p style={{opacity:.8}}>Press <b>Find itineraries</b> to see options.</p>}
          <ol>{itins.map(it=>(<li key={it.id} style={{margin:'10px 0',padding:'8px 0',borderTop:'1px solid var(--line)'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div><div><strong>~{it.durationMin} min</strong> • {it.transfers} transfers • <span title="Reliability score">{Math.round((it.reliability||0)*100)}%</span></div>
              <div style={{opacity:.8}}>legs: {it.legs.join(' → ')}</div><div style={{marginTop:6}}><Chip>{(it.walk_km??0).toFixed(1)} km walk</Chip><Chip>{(it.modes||[]).join(', ')}</Chip></div></div>
              <div><button className="btn" onClick={()=>exportPdf(it)}>Export PDF</button>
                <button className="btn" style={{marginLeft:8}} onClick={()=>suggestAlt(it)}>Suggest Alternative</button></div></div>
            {(() => { const alt = alts[it.id]; return alt ? (<div className="alt">
              <div><strong>Alternative:</strong> ~{alt.durationMin || '—'} min • {alt.transfers || 0} transfers</div>
              {alt.note && <div style={{opacity:.8}}>{alt.note}</div>}
              {alt.legs && <div style={{opacity:.8}}>legs: {alt.legs.join(' → ')}</div>}</div>) : null })()}</li>))}</ol>
        </div></div></div>
      <div className="grid" style={{marginTop:16}}>
        <div className="card"><h3 style={{marginTop:0}}>Alerts</h3>
          <ul>{alerts.map((a,i)=>(<li key={i}><strong>{a.type||a.id}</strong>: {a.title||a.summary} {a.severity?`• ${a.severity}`:''}</li>))}</ul></div>
        <div className="card"><h3 style={{marginTop:0}}>Nearby stops</h3>
          <div style={{display:'flex',flexWrap:'wrap'}}>{stops.map(s=>(<div key={s.stop_id} style={{padding:8,border:'1px solid var(--line)',borderRadius:8,margin:'6px',background:'#fff'}}>
            <div style={{fontWeight:600}}>{s.name}</div><div style={{opacity:.7,fontSize:12}}>{s.distance_m} m</div>
            <div style={{marginTop:6}}><button className="btn" onClick={()=>{setSelectedStop(s); viewDepartures(s)}}>Live departures</button></div></div>))}</div>
          {selectedStop && (<div style={{marginTop:8}}><h4 style={{margin:'8px 0'}}>Departures — {selectedStop.name}</h4>
            <ul>{departures.map((d,i)=>(<li key={i}><strong>{d.route}</strong> → {d.headsign} <span style={{opacity:.7}}>in {d.departure_in_min} min</span></li>))}</ul></div>)}
        </div>
      </div></div>)
}
