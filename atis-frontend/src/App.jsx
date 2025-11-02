import { useEffect, useState } from 'react'

const API = 'http://localhost:8000'

export default function App() {
  const [origin, setOrigin] = useState([-36.8485, 174.7633]) // Auckland CBD
  const [dest, setDest] = useState([-36.8443, 174.7676])     // Britomart
  const [stops, setStops] = useState([])
  const [itins, setItins] = useState([])
  const [banner, setBanner] = useState('')

  useEffect(() => {
    fetch(`${API}/stops/nearby?lat=${origin[0]}&lng=${origin[1]}&radius=900`)
      .then(r => r.json()).then(d => setStops(d.stops || []))
  }, [origin])

  const plan = async () => {
    const r = await fetch(`${API}/plan`, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ origin, destination: dest, depart_at: "now", prefers_fewer_transfers: true })
    })
    const data = await r.json()
    setItins(data.itineraries || [])
    setBanner(data.context?.weatherAlert || '')
  }

  return (
    <div style={{maxWidth: 900, margin: '24px auto', padding: 16, fontFamily:'Inter, system-ui, Arial'}}>
      <h1 style={{marginBottom: 8}}>ATIS (Demo)</h1>
      <p style={{opacity:.8, marginTop:0}}>Simple traveler info: nearby stops, quick plan, and AI-ish re-rank.</p>

      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:16}}>
        <div style={{border:'1px solid #ddd', borderRadius:12, padding:12}}>
          <h3 style={{marginTop:0}}>Nearby stops</h3>
          <small>Origin: {origin[0].toFixed(4)},{origin[1].toFixed(4)}</small>
          <ul>
            {stops.map(s => (
              <li key={s.stop_id}>
                <strong>{s.name}</strong> <span style={{opacity:.7}}>— {s.distance_m} m</span>
              </li>
            ))}
          </ul>
        </div>

        <div style={{border:'1px solid #ddd', borderRadius:12, padding:12}}>
          <h3 style={{marginTop:0}}>Plan</h3>
          <button onClick={plan}>Get itineraries</button>
          {banner && <div style={{marginTop:10, padding:8, border:'1px solid #f0c', borderRadius:8}}>{banner}</div>}
          <ol>
            {itins.map(it => (
              <li key={it.id} style={{margin:'8px 0'}}>
                <div><strong>~{it.durationMin} min</strong> • {it.transfers} transfers</div>
                <div style={{opacity:.7}}>legs: {it.legs.join(' → ')}</div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  )
}
