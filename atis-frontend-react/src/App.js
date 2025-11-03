import { useEffect, useState, useMemo, useCallback } from 'react'
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
    name: 'Advanced Traveler Information System',
    tagline: 'Real-time, multimodal trip planning with intelligent route optimization.',
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

function FeatureCard({title, description, children, icon}){
  return (
    <section className="card" style={{marginBottom:32}}>
      <div style={{marginBottom:24}}>
        <div style={{display:'flex', alignItems:'center', gap:16, marginBottom:10}}>
          {icon && <div style={{fontSize:42, filter:'drop-shadow(0 4px 8px rgba(0,0,0,0.2))'}}>{icon}</div>}
          <div>
            <div style={{fontSize:26, fontWeight:800, background:'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text', letterSpacing:'-0.5px'}}>{title}</div>
            {description && <div style={{color:'var(--muted)', fontSize:15, marginTop:6, lineHeight:1.6}}>{description}</div>}
          </div>
        </div>
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
  const [email, setEmail] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [strength, setStrength] = useState(0)
  const [rememberMe, setRememberMe] = useState(true)
  const [showAuthModal, setShowAuthModal] = useState(false)

  useEffect(()=>{
    const t = localStorage.getItem('atis_token') || sessionStorage.getItem('atis_token')
    const u = localStorage.getItem('atis_user') || sessionStorage.getItem('atis_user')
    if (t && u){ setToken(t); setUsername(u) }
  }, [setToken, setUsername])

  useEffect(() => {
    if (mode === 'register' && pass) {
      let score = 0
      if (pass.length >= 8) score++
      if (pass.length >= 12) score++
      if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) score++
      if (/[0-9]/.test(pass)) score++
      if (/[^a-zA-Z0-9]/.test(pass)) score++
      setStrength(score)
    }
  }, [pass, mode])

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const submit = async (e) => {
    e?.preventDefault()
    setError('')
    
    // Validation
    if (!user || user.length < 3) {
      setError('Username must be at least 3 characters')
      return
    }
    if (!pass || pass.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    if (mode === 'register') {
      if (!email || !validateEmail(email)) {
        setError('Please enter a valid email address')
        return
      }
      if (strength < 3) {
        setError('Password is too weak. Use mix of letters, numbers, and symbols.')
        return
      }
    }
    
    setLoading(true)
    try{
      const payload = mode === 'register' 
        ? {username: user, password: pass, email: email}
        : {username: user, password: pass}
      
      const r = await fetch(`${API}/auth/${mode}`, { 
        method:'POST', 
        headers:{'Content-Type':'application/json'}, 
        body: JSON.stringify(payload) 
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.detail || 'Authentication failed')
      
      setToken(d.token); setUsername(d.username)
      
      // Store based on remember me preference
      const storage = rememberMe ? localStorage : sessionStorage
      storage.setItem('atis_token', d.token)
      storage.setItem('atis_user', d.username)
      storage.setItem('atis_login_time', Date.now().toString())
      
      setUser(''); setPass(''); setEmail('')
      setShowAuthModal(false)
    }catch(e){ 
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const logout = () => { 
    setToken(null)
    setUsername(null)
    setIsAuthenticated(false)
    localStorage.removeItem('atis_token')
    localStorage.removeItem('atis_user')
    localStorage.removeItem('atis_login_time')
    sessionStorage.removeItem('atis_token')
    sessionStorage.removeItem('atis_user')
    sessionStorage.removeItem('atis_login_time')
    toast('👋 Logged out')
  }

  const getStrengthColor = () => {
    if (strength <= 2) return '#ef4444'
    if (strength <= 3) return '#f59e0b'
    return '#10b981'
  }

  const getStrengthText = () => {
    if (strength <= 2) return 'Weak'
    if (strength <= 3) return 'Medium'
    return 'Strong'
  }

  if (token) {
    return (
      <div style={{display:'flex', alignItems:'center', gap:16}}>
        <div className="pill" style={{display:'flex', alignItems:'center', gap:10}}>
          <div style={{width:32, height:32, borderRadius:'50%', background:'var(--gradient-1)', display:'grid', placeItems:'center', color:'white', fontWeight:700, fontSize:14}}>
            {username[0].toUpperCase()}
          </div>
          <div>
            <div style={{fontSize:13, fontWeight:600}}>{username}</div>
            <div style={{fontSize:11, color:'var(--muted)'}}>Verified</div>
          </div>
        </div>
        <button className="btn btn-danger" onClick={logout}>🚪 Logout</button>
      </div>
    )
  }

  return (
    <>
      <button className="btn btn-primary" onClick={() => setShowAuthModal(true)}>
        🔐 Sign In
      </button>
      
      {showAuthModal && (
        <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', backdropFilter:'blur(8px)', display:'grid', placeItems:'center', zIndex:9999, padding:20}} onClick={() => setShowAuthModal(false)}>
          <div style={{background:'var(--glass-bg)', backdropFilter:'blur(30px)', border:'1px solid var(--glass-border)', borderRadius:28, padding:40, maxWidth:480, width:'100%', boxShadow:'var(--card-shadow)'}} onClick={e => e.stopPropagation()}>
            <div style={{textAlign:'center', marginBottom:32}}>
              <div style={{fontSize:32, marginBottom:12}}>🔐</div>
              <h2 style={{fontSize:28, fontWeight:800, marginBottom:8, background:'var(--gradient-1)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent'}}>
                {mode === 'login' ? 'Welcome Back' : 'Create Account'}
              </h2>
              <p style={{color:'var(--muted)', fontSize:14}}>
                {mode === 'login' ? 'Sign in to access your personalized travel experience' : 'Join ATIS for smart route planning'}
              </p>
            </div>

            <form onSubmit={submit} style={{display:'flex', flexDirection:'column', gap:20}}>
              <div>
                <label style={{display:'block', marginBottom:8, fontSize:13, fontWeight:600, color:'var(--muted)'}}>Username</label>
                <input 
                  type="text"
                  placeholder="Enter username" 
                  value={user} 
                  onChange={e=>setUser(e.target.value)}
                  style={{width:'100%'}}
                  autoComplete="username"
                  disabled={loading}
                />
              </div>

              {mode === 'register' && (
                <div>
                  <label style={{display:'block', marginBottom:8, fontSize:13, fontWeight:600, color:'var(--muted)'}}>Email</label>
                  <input 
                    type="email"
                    placeholder="your.email@example.com" 
                    value={email} 
                    onChange={e=>setEmail(e.target.value)}
                    style={{width:'100%'}}
                    autoComplete="email"
                    disabled={loading}
                  />
                </div>
              )}

              <div>
                <label style={{display:'block', marginBottom:8, fontSize:13, fontWeight:600, color:'var(--muted)'}}>Password</label>
                <div style={{position:'relative'}}>
                  <input 
                    type={showPass ? 'text' : 'password'}
                    placeholder="Enter password" 
                    value={pass} 
                    onChange={e=>setPass(e.target.value)}
                    style={{width:'100%', paddingRight:45}}
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    disabled={loading}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    style={{position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', fontSize:18}}
                  >
                    {showPass ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
                {mode === 'register' && pass && (
                  <div style={{marginTop:8}}>
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4}}>
                      <span style={{fontSize:12, color:'var(--muted)'}}>Password strength:</span>
                      <span style={{fontSize:12, fontWeight:600, color:getStrengthColor()}}>{getStrengthText()}</span>
                    </div>
                    <div style={{height:4, background:'rgba(255,255,255,0.1)', borderRadius:2, overflow:'hidden'}}>
                      <div style={{height:'100%', width:`${(strength / 5) * 100}%`, background:getStrengthColor(), transition:'all 0.3s'}}></div>
                    </div>
                  </div>
                )}
              </div>

              {mode === 'login' && (
                <label style={{display:'flex', alignItems:'center', gap:8, cursor:'pointer', userSelect:'none'}}>
                  <input 
                    type="checkbox" 
                    checked={rememberMe} 
                    onChange={e => setRememberMe(e.target.checked)}
                    disabled={loading}
                  />
                  <span style={{fontSize:13, color:'var(--muted)'}}>Remember me for 30 days</span>
                </label>
              )}

              {error && (
                <div style={{padding:12, background:'rgba(239, 68, 68, 0.1)', border:'1px solid var(--danger)', borderRadius:12, color:'var(--danger)', fontSize:13, textAlign:'center'}}>
                  ⚠️ {error}
                </div>
              )}

              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{width:'100%', padding:16, fontSize:16}}
                disabled={loading}
              >
                {loading ? '⏳ Processing...' : mode === 'login' ? '🚀 Sign In' : '✨ Create Account'}
              </button>

              <div style={{textAlign:'center'}}>
                <button 
                  type="button"
                  onClick={() => {setMode(mode === 'login' ? 'register' : 'login'); setError('')}}
                  style={{background:'none', border:'none', color:'var(--primary)', cursor:'pointer', fontSize:14, fontWeight:600}}
                  disabled={loading}
                >
                  {mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
                </button>
              </div>
            </form>

            <button 
              onClick={() => setShowAuthModal(false)}
              style={{position:'absolute', top:20, right:20, background:'var(--glass-bg)', border:'1px solid var(--glass-border)', borderRadius:'50%', width:36, height:36, display:'grid', placeItems:'center', cursor:'pointer', fontSize:18}}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  )
}

function LoginPage({onLogin, isVerifying}){
  const [mode, setMode] = useState('login')
  const [user, setUser] = useState('')
  const [pass, setPass] = useState('')
  const [email, setEmail] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [strength, setStrength] = useState(0)

  useEffect(() => {
    if (mode === 'register' && pass) {
      let score = 0
      if (pass.length >= 8) score++
      if (pass.length >= 12) score++
      if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) score++
      if (/[0-9]/.test(pass)) score++
      if (/[^a-zA-Z0-9]/.test(pass)) score++
      setStrength(score)
    }
  }, [pass, mode])

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const submit = async (e) => {
    e?.preventDefault()
    setError('')
    
    if (!user || user.length < 3) {
      setError('Username must be at least 3 characters')
      return
    }
    if (!pass || pass.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    if (mode === 'register') {
      if (!email || !validateEmail(email)) {
        setError('Please enter a valid email address')
        return
      }
      if (strength < 3) {
        setError('Password is too weak. Use mix of letters, numbers, and symbols.')
        return
      }
    }
    
    setLoading(true)
    try{
      const payload = mode === 'register' 
        ? {username: user, password: pass, email: email}
        : {username: user, password: pass}
      
      const r = await fetch(`${API}/auth/${mode}`, { 
        method:'POST', 
        headers:{'Content-Type':'application/json'}, 
        body: JSON.stringify(payload) 
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.detail || 'Authentication failed')
      
      localStorage.setItem('atis_token', d.token)
      localStorage.setItem('atis_user', d.username)
      localStorage.setItem('atis_login_time', Date.now().toString())
      
      onLogin(d.token, d.username)
    }catch(e){ 
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const getStrengthColor = () => {
    if (strength <= 2) return '#ef4444'
    if (strength <= 3) return '#f59e0b'
    return '#10b981'
  }

  const getStrengthText = () => {
    if (strength <= 2) return 'Weak'
    if (strength <= 3) return 'Medium'
    return 'Strong'
  }

  return (
    <div style={{minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:20, position:'relative', overflow:'hidden'}}>
      {/* Animated background gradient circles */}
      <div style={{position:'absolute', top:'-10%', left:'-5%', width:'500px', height:'500px', background:'radial-gradient(circle, rgba(102, 126, 234, 0.3) 0%, transparent 70%)', filter:'blur(80px)', animation:'float 8s ease-in-out infinite'}}></div>
      <div style={{position:'absolute', bottom:'-10%', right:'-5%', width:'500px', height:'500px', background:'radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, transparent 70%)', filter:'blur(80px)', animation:'float 10s ease-in-out infinite reverse'}}></div>
      
      <div style={{maxWidth:480, width:'100%', position:'relative', zIndex:1}}>
        {/* Logo and Welcome Section */}
        <div style={{textAlign:'center', marginBottom:40}}>
          <img 
            src="/atis-logo.jpg" 
            alt="ATIS Logo" 
            style={{width:120, height:120, margin:'0 auto 24px', filter:'drop-shadow(0 8px 24px rgba(0,0,0,0.3))', objectFit:'contain', borderRadius:24}}
            onError={(e) => {
              e.target.style.display = 'none'
            }}
          />
          <h1 style={{fontSize:42, fontWeight:900, marginBottom:12, background:'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', letterSpacing:'-1px'}}>
            Welcome to ATIS
          </h1>
          <p style={{fontSize:16, color:'var(--muted)', marginBottom:8}}>Advanced Traveler Information System</p>
          <p style={{fontSize:14, color:'var(--muted)'}}>
            {isVerifying ? '🔄 Verifying session...' : 'Intelligent route planning for smarter journeys'}
          </p>
        </div>

        {/* Login Form Card */}
        <div style={{background:'var(--glass-bg)', backdropFilter:'blur(30px)', border:'1px solid var(--glass-border)', borderRadius:28, padding:40, boxShadow:'var(--card-shadow)', opacity: isVerifying ? 0.6 : 1, pointerEvents: isVerifying ? 'none' : 'auto', transition:'opacity 0.2s'}}>
          <div style={{textAlign:'center', marginBottom:32}}>
            <h2 style={{fontSize:26, fontWeight:800, marginBottom:8}}>
              {isVerifying ? '⏳ Loading...' : mode === 'login' ? '🔐 Sign In' : '✨ Create Account'}
            </h2>
            <p style={{color:'var(--muted)', fontSize:14}}>
              {isVerifying ? 'Please wait...' : mode === 'login' ? 'Access your personalized travel experience' : 'Join for smart route planning'}
            </p>
          </div>

          <form onSubmit={submit} style={{display:'flex', flexDirection:'column', gap:20}}>
            <div>
              <label style={{display:'block', marginBottom:8, fontSize:13, fontWeight:600, color:'var(--muted)'}}>Username</label>
              <input 
                type="text"
                placeholder="Enter username" 
                value={user} 
                onChange={e=>setUser(e.target.value)}
                style={{width:'100%'}}
                autoComplete="username"
                disabled={loading}
                required
              />
            </div>

            {mode === 'register' && (
              <div>
                <label style={{display:'block', marginBottom:8, fontSize:13, fontWeight:600, color:'var(--muted)'}}>Email</label>
                <input 
                  type="email"
                  placeholder="your.email@example.com" 
                  value={email} 
                  onChange={e=>setEmail(e.target.value)}
                  style={{width:'100%'}}
                  autoComplete="email"
                  disabled={loading}
                  required
                />
              </div>
            )}

            <div>
              <label style={{display:'block', marginBottom:8, fontSize:13, fontWeight:600, color:'var(--muted)'}}>Password</label>
              <div style={{position:'relative'}}>
                <input 
                  type={showPass ? 'text' : 'password'}
                  placeholder="Enter password" 
                  value={pass} 
                  onChange={e=>setPass(e.target.value)}
                  style={{width:'100%', paddingRight:45}}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  disabled={loading}
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', fontSize:18}}
                >
                  {showPass ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              {mode === 'register' && pass && (
                <div style={{marginTop:8}}>
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4}}>
                    <span style={{fontSize:12, color:'var(--muted)'}}>Password strength:</span>
                    <span style={{fontSize:12, fontWeight:600, color:getStrengthColor()}}>{getStrengthText()}</span>
                  </div>
                  <div style={{height:4, background:'rgba(255,255,255,0.1)', borderRadius:2, overflow:'hidden'}}>
                    <div style={{height:'100%', width:`${(strength / 5) * 100}%`, background:getStrengthColor(), transition:'all 0.3s'}}></div>
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div style={{padding:12, background:'rgba(239, 68, 68, 0.1)', border:'1px solid var(--danger)', borderRadius:12, color:'var(--danger)', fontSize:13, textAlign:'center'}}>
                ⚠️ {error}
              </div>
            )}

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{width:'100%', padding:16, fontSize:16}}
              disabled={loading}
            >
              {loading ? '⏳ Processing...' : mode === 'login' ? '🚀 Sign In' : '✨ Create Account'}
            </button>

            <div style={{textAlign:'center'}}>
              <button 
                type="button"
                onClick={() => {setMode(mode === 'login' ? 'register' : 'login'); setError('')}}
                style={{background:'none', border:'none', color:'var(--primary)', cursor:'pointer', fontSize:14, fontWeight:600}}
                disabled={loading}
              >
                {mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
              </button>
            </div>
          </form>
        </div>

        {/* Features Preview */}
        <div style={{marginTop:32, textAlign:'center', color:'var(--muted)', fontSize:13}}>
          <p style={{marginBottom:12}}>✨ Real-time traffic & transit data</p>
          <p style={{marginBottom:12}}>🗺️ Interactive route planning</p>
          <p>🌍 Multi-language support</p>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-20px) scale(1.05); }
        }
      `}</style>
    </div>
  )
}

export default function App(){
  // ALL STATE HOOKS MUST BE DECLARED FIRST
  const [token, setToken] = useState(() => localStorage.getItem('atis_token'))
  const [username, setUsername] = useState(() => localStorage.getItem('atis_user'))
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isVerifying, setIsVerifying] = useState(true)
  
  const [origin, setOrigin] = useState([-36.8485, 174.7633])
  const [dest, setDest] = useState([-36.8443, 174.7676])
  const [stops, setStops] = useState([])
  const [itins, setItins] = useState([])
  const [banner, setBanner] = useState('')
  const [selectedStop, setSelectedStop] = useState(null)
  const [departures, setDepartures] = useState([])
  const [alerts, setAlerts] = useState([])
  const [alts, setAlts] = useState({})
  const [view, setView] = useState('home')
  const [expandedItin, setExpandedItin] = useState(null)

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

  const [reviews, setReviews] = useState([])
  const [reviewLoc, setReviewLoc] = useState('')
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')

  // Location search states
  const [originSearch, setOriginSearch] = useState('')
  const [destSearch, setDestSearch] = useState('')
  const [originName, setOriginName] = useState('Auckland CBD')
  const [destName, setDestName] = useState('Auckland Airport')
  const [searchResults, setSearchResults] = useState([])
  const [searchingFor, setSearchingFor] = useState(null)

  const text = TRANSLATIONS[uiLang] || TRANSLATIONS.en
  const convertedAmount = Number((amount * (CURRENCY_RATES[currency] || 1)).toFixed(2))

  // Check for existing session on mount and verify with backend
  useEffect(() => {
    let mounted = true
    
    const verifySession = async () => {
      const savedToken = localStorage.getItem('atis_token')
      const savedUser = localStorage.getItem('atis_user')
      
      if (savedToken && savedUser) {
        try {
          // Verify token with backend
          const response = await fetch(`${API}/auth/verify`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${savedToken}`
            }
          })
          
          if (!mounted) return
          
          if (response.ok) {
            // Token is valid - update state in one batch
            setToken(savedToken)
            setUsername(savedUser)
            setIsAuthenticated(true)
          } else {
            // Token is invalid, clear storage
            localStorage.removeItem('atis_token')
            localStorage.removeItem('atis_user')
            localStorage.removeItem('atis_login_time')
            setToken(null)
            setUsername(null)
            setIsAuthenticated(false)
          }
        } catch (error) {
          // Network error or backend down, clear session
          if (!mounted) return
          console.error('Session verification failed:', error)
          localStorage.removeItem('atis_token')
          localStorage.removeItem('atis_user')
          localStorage.removeItem('atis_login_time')
          setToken(null)
          setUsername(null)
          setIsAuthenticated(false)
        }
      }
      
      if (mounted) {
        setIsVerifying(false)
      }
    }
    
    verifySession()
    
    return () => {
      mounted = false
    }
  }, [])

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

  // Update when origin changes (debounced to prevent excessive re-renders)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetch(`${API}/stops/nearby?lat=${origin[0]}&lng=${origin[1]}&radius=900`)
        .then(r=>r.json()).then(d=>setStops(d.stops||[])).catch(()=>{})
      fetch(`${API}/weather/point?lat=${origin[0]}&lng=${origin[1]}`)
        .then(r=>r.json()).then(d=>setWeather(d.forecast||null)).catch(()=>{})
    }, 300)
    
    return () => clearTimeout(timeoutId)
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
    try {
      const r = await fetch(`${API}/routes/suggest`, { 
        method:'POST', 
        headers:{'Content-Type':'application/json'}, 
        body: JSON.stringify({ 
          current_itinerary: itinerary, 
          incidents: alerts,
          origin: origin,
          destination: dest,
          preferences: {
            optimize: optimize,
            max_walk_km: maxWalkKm,
            avoid_stairs: avoidStairs,
            bike_ok: bikeOk,
            modes: modes
          }
        }) 
      })
      const data = await r.json()
      
      // Enhance alternative with more details
      const enhancedAlternative = {
        ...data.alternative,
        reason: data.reason || 'Alternative route available',
        benefits: data.benefits || [],
        warnings: data.warnings || [],
        comparison: {
          timeDiff: data.alternative?.duration ? 
            Math.round((data.alternative.duration - itinerary.duration) / 60) : 0,
          transferDiff: (data.alternative?.transfers || 0) - (itinerary.transfers || 0),
          walkDiff: data.alternative?.walk_distance ? 
            (data.alternative.walk_distance - (itinerary.walk_distance || 0)).toFixed(1) : 0
        }
      }
      
      setAlts(prev => ({...prev, [itinerary.id]: enhancedAlternative}))
    } catch (error) {
      console.error('Error suggesting alternative:', error)
    }
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
  const swapOD = () => { 
    const o = origin
    const oName = originName
    setOrigin(dest)
    setDest(o)
    setOriginName(destName)
    setDestName(oName)
  }
  
  const shareLocation = () => {
    const coords = `${origin[0].toFixed(5)}, ${origin[1].toFixed(5)}`
    const url = `https://www.google.com/maps?q=${origin[0]},${origin[1]}`
    navigator.clipboard.writeText(url).then(() => {
      alert(`${text.locationCopied}\n${url}`)
    }).catch(() => {
      alert(`${text.shareLocation}: ${coords}`)
    })
  }

  // Enhanced Geocoding with more accurate results
  const searchLocation = async (query, type) => {
    if (!query || query.length < 3) {
      setSearchResults([])
      return
    }
    
    try {
      // More specific search parameters for better accuracy
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?` + 
        `format=json&` +
        `q=${encodeURIComponent(query)}&` +
        `countrycodes=nz&` +
        `bounded=1&` +
        `viewbox=174.5,-37.0,175.0,-36.5&` + // Auckland bounding box
        `addressdetails=1&` +
        `limit=8&` +
        `dedupe=1`
      )
      const data = await response.json()
      
      // Filter and sort results by relevance
      const filteredResults = data
        .filter(result => {
          const name = result.display_name.toLowerCase()
          return (
            name.includes('auckland') || 
            name.includes('new zealand') ||
            parseFloat(result.lat) > -37.5 && parseFloat(result.lat) < -36.5
          )
        })
        .sort((a, b) => {
          // Prioritize results with specific types
          const priorityTypes = ['building', 'amenity', 'shop', 'tourism', 'station']
          const aHasPriority = priorityTypes.includes(a.type)
          const bHasPriority = priorityTypes.includes(b.type)
          if (aHasPriority && !bHasPriority) return -1
          if (!aHasPriority && bHasPriority) return 1
          return 0
        })
      
      setSearchResults(filteredResults)
      setSearchingFor(type)
    } catch (error) {
      console.error('Search error:', error)
      setSearchResults([])
    }
  }

  // Select a location from search results
  const selectLocation = (result) => {
    const lat = parseFloat(result.lat)
    const lng = parseFloat(result.lon)
    const name = result.display_name.split(',')[0] // Get primary name
    
    if (searchingFor === 'origin') {
      setOrigin([lat, lng])
      setOriginName(name)
      setOriginSearch('')
    } else {
      setDest([lat, lng])
      setDestName(name)
      setDestSearch('')
    }
    
    setSearchResults([])
    setSearchingFor(null)
  }

  // Close dropdown when clicking outside
  const closeSearchDropdown = () => {
    setSearchResults([])
    setSearchingFor(null)
    setOriginSearch('')
    setDestSearch('')
  }

  // Use current location
  const useCurrentLocation = (type) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude
          const lng = position.coords.longitude
          
          // Reverse geocode to get place name
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
            )
            const data = await response.json()
            const name = data.address?.suburb || data.address?.city || data.address?.town || 'Current Location'
            
            if (type === 'origin') {
              setOrigin([lat, lng])
              setOriginName(name)
            } else {
              setDest([lat, lng])
              setDestName(name)
            }
          } catch (error) {
            if (type === 'origin') {
              setOrigin([lat, lng])
              setOriginName('Current Location')
            } else {
              setDest([lat, lng])
              setDestName('Current Location')
            }
          }
        },
        (error) => {
          alert('Could not get your location. Please enable location services.')
        }
      )
    } else {
      alert('Geolocation is not supported by your browser.')
    }
  }

  const handleLogin = (token, username) => {
    setToken(token)
    setUsername(username)
    setIsAuthenticated(true)
  }

  const logout = () => { 
    setToken(null)
    setUsername(null)
    setIsAuthenticated(false)
    localStorage.removeItem('atis_token')
    localStorage.removeItem('atis_user')
    localStorage.removeItem('atis_login_time')
    sessionStorage.removeItem('atis_token')
    sessionStorage.removeItem('atis_user')
    sessionStorage.removeItem('atis_login_time')
    setView('home')
  }

  // Show login page if not authenticated - NO ACCESS TO MAIN APP
  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} isVerifying={isVerifying} />
  }

  return (
    <div style={{minHeight:'100vh', padding:'0', background:'var(--app-bg)', willChange:'auto'}}>
      {/* Modern Top Navigation Bar */}
      <nav style={{
        position:'sticky', top:0, zIndex:1000,
        background:'rgba(10, 14, 39, 0.95)', 
        borderBottom:'1px solid var(--glass-border)',
        boxShadow:'0 4px 24px rgba(0,0,0,0.1)'
      }}>
        <div style={{maxWidth:1400, margin:'0 auto', padding:'16px 24px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:20}}>
          {/* Logo and Title */}
          <div style={{display:'flex', alignItems:'center', gap:16}}>
            <img
              src="/atis-logo.jpg"
              alt="ATIS"
              style={{width:48, height:48, borderRadius:12, objectFit:'contain', boxShadow:'0 4px 12px rgba(0,0,0,0.2)'}}
              onError={(e) => {
                e.target.style.display = 'none'
                e.target.nextElementSibling.style.display = 'grid'
              }}
            />
            <div className="logo" style={{display:'none', width:48, height:48, fontSize:20}}>A</div>
            <div>
              <h1 style={{fontSize:22, fontWeight:800, lineHeight:1, marginBottom:4}}>ATIS</h1>
              <p style={{fontSize:12, color:'var(--muted)', lineHeight:1}}>Advanced Travel System</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
            {['home','plan','map','alerts','safety','reviews','settings'].map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={view === v ? 'btn btn-primary' : 'chip'}
                style={{
                  padding:'8px 16px',
                  fontSize:13,
                  fontWeight:600,
                  textTransform:'capitalize',
                  transition:'all 0.3s'
                }}
              >
                {v === 'home' && '🏠'} {v === 'plan' && '🗺️'} {v === 'map' && '🌍'}
                {v === 'alerts' && '⚠️'} {v === 'safety' && '🛡️'} {v === 'reviews' && '⭐'}
                {v === 'settings' && '⚙️'} {' '}{v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>

          {/* User Profile */}
          <div style={{display:'flex', alignItems:'center', gap:12}}>
            <div style={{textAlign:'right'}}>
              <div style={{fontSize:14, fontWeight:600}}>{username || 'Guest'}</div>
              <div style={{fontSize:11, color:'var(--muted)'}}>Active Session</div>
            </div>
            <button onClick={logout} className="btn btn-danger" style={{padding:'8px 16px', fontSize:13}}>
              🚪 Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content Container */}
      <div style={{maxWidth:1400, margin:'0 auto', padding:'32px 24px 80px'}}>
        
        {/* View-Based Content Rendering */}
        {view === 'home' && (
          <>
            {/* Quick Stats Dashboard */}
            <div className="grid-3" style={{marginBottom:32}}>
              <div className="stat-card">
                <div className="stat-value">{stops.length}</div>
                <div className="stat-label">Nearby Stops</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{itins.length}</div>
                <div className="stat-label">Routes Found</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{alerts.length}</div>
                <div className="stat-label">Active Alerts</div>
              </div>
            </div>

            {/* Welcome Card */}
            <div className="card" style={{marginBottom:32, background:'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)', border:'1px solid rgba(102, 126, 234, 0.3)'}}>
              <h2 style={{fontSize:28, fontWeight:800, marginBottom:12, background:'var(--gradient-1)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent'}}>
                Welcome back, {username}! 👋
              </h2>
              <p style={{color:'var(--muted)', fontSize:15}}>
                Your intelligent travel companion for smarter journeys. Plan trips, check real-time updates, and navigate with confidence.
              </p>
            </div>

            {/* Feature Overview Grid */}
            <div className="grid-2" style={{marginBottom:32}}>
              <div className="card" onClick={() => setView('plan')} style={{cursor:'pointer'}}>
                <div style={{fontSize:48, marginBottom:16}}>🗺️</div>
                <h3 style={{fontSize:20, fontWeight:700, marginBottom:8}}>Trip Planning</h3>
                <p style={{color:'var(--muted)', fontSize:14}}>Plan multi-modal journeys with real-time data and alternative routes</p>
              </div>
              <div className="card" onClick={() => setView('map')} style={{cursor:'pointer'}}>
                <div style={{fontSize:48, marginBottom:16}}>🌍</div>
                <h3 style={{fontSize:20, fontWeight:700, marginBottom:8}}>Interactive Map</h3>
                <p style={{color:'var(--muted)', fontSize:14}}>Explore nearby stops, set destinations, and visualize your route</p>
              </div>
              <div className="card" onClick={() => setView('alerts')} style={{cursor:'pointer'}}>
                <div style={{fontSize:48, marginBottom:16}}>⚠️</div>
                <h3 style={{fontSize:20, fontWeight:700, marginBottom:8}}>Live Alerts</h3>
                <p style={{color:'var(--muted)', fontSize:14}}>Stay updated with traffic incidents and service disruptions</p>
              </div>
              <div className="card" onClick={() => setView('safety')} style={{cursor:'pointer'}}>
                <div style={{fontSize:48, marginBottom:16}}>🛡️</div>
                <h3 style={{fontSize:20, fontWeight:700, marginBottom:8}}>Safety Features</h3>
                <p style={{color:'var(--muted)', fontSize:14}}>Emergency contacts and location sharing for peace of mind</p>
              </div>
            </div>
          </>
        )}

        {view === 'map' && (
          <div>
            <h2 className="section-title">🌍 Interactive Map</h2>
          <FeatureCard icon="🗺️" title="Map View" description="Drag origin marker, click map to set destination, view nearby stops">
            <div style={{height:450, width:'100%', borderRadius:16, overflow:'hidden', boxShadow:'0 8px 24px rgba(0,0,0,0.12)'}}>
              <InteractiveMap origin={origin} setOrigin={setOrigin} dest={dest} setDest={setDest} stops={stops} />
            </div>
            <div style={{marginTop:16, display:'flex', gap:10, flexWrap:'wrap'}}>
              <button className="btn btn-primary" onClick={shareLocation}>📍 {text.shareLocation}</button>
              <button className="btn" onClick={() => navigator.clipboard.writeText(`${origin[0].toFixed(5)}, ${origin[1].toFixed(5)}`).then(() => alert(text.locationCopied))}>📋 {text.copyCoords}</button>
            </div>
          </FeatureCard>
          </div>
        )}

        {view === 'alerts' && (
          <div>
            <h2 className="section-title">⚠️ Live Alerts & Weather</h2>
          <FeatureCard icon="⚡" title={text.realTimeSnapshot} description="Live traffic, weather and notifications so riders stay ahead.">
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
          </div>
        )}

        {view === 'plan' && (
          <div>
            <h2 className="section-title">🗺️ Trip Planning</h2>
          <FeatureCard icon="🧭" title={text.tripPlanning} description="Plan ahead, adapt on the fly, and export journeys for the road.">
            <div style={{display:'grid', gap:24, gridTemplateColumns:'minmax(260px, 1fr) minmax(320px, 1.35fr)'}}>
              <div style={{display:'flex', flexDirection:'column', gap:12}}>
                {/* Origin Location Search */}
                <div style={{position:'relative'}}>
                  <label style={{display:'flex', flexDirection:'column', gap:4}}>
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                      <span style={{fontSize:12, opacity:0.75}}>📍 Origin</span>
                      <button 
                        className="btn" 
                        onClick={() => useCurrentLocation('origin')}
                        style={{padding:'4px 8px', fontSize:11}}
                        title="Use my current location"
                      >
                        📍 Current
                      </button>
                    </div>
                    <input 
                      value={originSearch || originName} 
                      onChange={e => {
                        setOriginSearch(e.target.value)
                        searchLocation(e.target.value, 'origin')
                      }}
                      onFocus={e => e.target.select()}
                      placeholder="Search for a place..."
                      style={{fontWeight:600}}
                    />
                  </label>
                  {searchingFor === 'origin' && searchResults.length > 0 && (
                    <div style={{
                      position:'absolute', 
                      top:'100%', 
                      left:0, 
                      right:0, 
                      zIndex:1000,
                      background:'linear-gradient(135deg, rgba(30, 41, 59, 0.98) 0%, rgba(15, 23, 42, 0.98) 100%)',
                      backdropFilter:'blur(40px)',
                      border:'2px solid rgba(139, 92, 246, 0.4)', 
                      borderRadius:16, 
                      marginTop:8,
                      maxHeight:320,
                      overflowY:'auto',
                      boxShadow:'0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.1) inset'
                    }}>
                      <div style={{
                        padding:'10px 14px',
                        fontSize:11,
                        fontWeight:700,
                        color:'rgba(139, 92, 246, 1)',
                        borderBottom:'1px solid rgba(139, 92, 246, 0.2)',
                        textTransform:'uppercase',
                        letterSpacing:'0.5px'
                      }}>
                        📍 Select Origin Location
                      </div>
                      {searchResults.map((result, i) => (
                        <div 
                          key={i}
                          onClick={() => selectLocation(result)}
                          style={{
                            padding:'14px 16px', 
                            cursor:'pointer', 
                            borderBottom: i < searchResults.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                            transition:'all 0.2s',
                            background:'transparent'
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.background = 'linear-gradient(90deg, rgba(139, 92, 246, 0.15) 0%, rgba(59, 130, 246, 0.15) 100%)'
                            e.currentTarget.style.borderLeft = '3px solid rgba(139, 92, 246, 0.8)'
                            e.currentTarget.style.paddingLeft = '13px'
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.background = 'transparent'
                            e.currentTarget.style.borderLeft = 'none'
                            e.currentTarget.style.paddingLeft = '16px'
                          }}
                        >
                          <div style={{
                            fontWeight:700, 
                            fontSize:15, 
                            color:'#ffffff',
                            marginBottom:6,
                            display:'flex',
                            alignItems:'center',
                            justifyContent:'space-between'
                          }}>
                            <div style={{display:'flex', alignItems:'center', gap:8}}>
                              <span style={{fontSize:18}}>
                                {result.type === 'amenity' ? '🏢' : 
                                 result.type === 'building' ? '🏛️' :
                                 result.type === 'tourism' ? '🎯' :
                                 result.type === 'station' ? '🚉' :
                                 result.type === 'shop' ? '🏪' : '📍'}
                              </span>
                              {result.display_name.split(',')[0]}
                            </div>
                            {result.address?.suburb && (
                              <span style={{
                                fontSize:11,
                                padding:'2px 8px',
                                background:'rgba(139, 92, 246, 0.3)',
                                borderRadius:8,
                                color:'rgba(139, 92, 246, 1)',
                                fontWeight:600
                              }}>
                                {result.address.suburb}
                              </span>
                            )}
                          </div>
                          <div style={{
                            fontSize:11, 
                            color:'rgba(255,255,255,0.5)', 
                            lineHeight:1.5,
                            paddingLeft:26,
                            marginBottom:4
                          }}>
                            {result.display_name.split(',').slice(1, 3).join(',').trim()}
                          </div>
                          {result.type && (
                            <div style={{
                              fontSize:10,
                              color:'rgba(255,255,255,0.4)',
                              paddingLeft:26,
                              fontStyle:'italic'
                            }}>
                              {result.type.charAt(0).toUpperCase() + result.type.slice(1)}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  <div style={{fontSize:11, opacity:0.5, marginTop:4}}>{origin[0].toFixed(4)}, {origin[1].toFixed(4)}</div>
                </div>

                {/* Destination Location Search */}
                <div style={{position:'relative'}}>
                  <label style={{display:'flex', flexDirection:'column', gap:4}}>
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                      <span style={{fontSize:12, opacity:0.75}}>🎯 Destination</span>
                      <button 
                        className="btn" 
                        onClick={() => useCurrentLocation('dest')}
                        style={{padding:'4px 8px', fontSize:11}}
                        title="Use my current location"
                      >
                        📍 Current
                      </button>
                    </div>
                    <input 
                      value={destSearch || destName} 
                      onChange={e => {
                        setDestSearch(e.target.value)
                        searchLocation(e.target.value, 'dest')
                      }}
                      onFocus={e => e.target.select()}
                      placeholder="Search for a place..."
                      style={{fontWeight:600}}
                    />
                  </label>
                  {searchingFor === 'dest' && searchResults.length > 0 && (
                    <div style={{
                      position:'absolute', 
                      top:'100%', 
                      left:0, 
                      right:0, 
                      zIndex:1000,
                      background:'linear-gradient(135deg, rgba(30, 41, 59, 0.98) 0%, rgba(15, 23, 42, 0.98) 100%)',
                      backdropFilter:'blur(40px)',
                      border:'2px solid rgba(59, 130, 246, 0.4)', 
                      borderRadius:16, 
                      marginTop:8,
                      maxHeight:320,
                      overflowY:'auto',
                      boxShadow:'0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.1) inset'
                    }}>
                      <div style={{
                        padding:'10px 14px',
                        fontSize:11,
                        fontWeight:700,
                        color:'rgba(59, 130, 246, 1)',
                        borderBottom:'1px solid rgba(59, 130, 246, 0.2)',
                        textTransform:'uppercase',
                        letterSpacing:'0.5px'
                      }}>
                        🎯 Select Destination Location
                      </div>
                      {searchResults.map((result, i) => (
                        <div 
                          key={i}
                          onClick={() => selectLocation(result)}
                          style={{
                            padding:'14px 16px', 
                            cursor:'pointer', 
                            borderBottom: i < searchResults.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                            transition:'all 0.2s',
                            background:'transparent'
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.background = 'linear-gradient(90deg, rgba(59, 130, 246, 0.15) 0%, rgba(16, 185, 129, 0.15) 100%)'
                            e.currentTarget.style.borderLeft = '3px solid rgba(59, 130, 246, 0.8)'
                            e.currentTarget.style.paddingLeft = '13px'
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.background = 'transparent'
                            e.currentTarget.style.borderLeft = 'none'
                            e.currentTarget.style.paddingLeft = '16px'
                          }}
                        >
                          <div style={{
                            fontWeight:700, 
                            fontSize:15, 
                            color:'#ffffff',
                            marginBottom:6,
                            display:'flex',
                            alignItems:'center',
                            justifyContent:'space-between'
                          }}>
                            <div style={{display:'flex', alignItems:'center', gap:8}}>
                              <span style={{fontSize:18}}>
                                {result.type === 'amenity' ? '🏢' : 
                                 result.type === 'building' ? '🏛️' :
                                 result.type === 'tourism' ? '🎯' :
                                 result.type === 'station' ? '🚉' :
                                 result.type === 'shop' ? '🏪' : '🎯'}
                              </span>
                              {result.display_name.split(',')[0]}
                            </div>
                            {result.address?.suburb && (
                              <span style={{
                                fontSize:11,
                                padding:'2px 8px',
                                background:'rgba(59, 130, 246, 0.3)',
                                borderRadius:8,
                                color:'rgba(59, 130, 246, 1)',
                                fontWeight:600
                              }}>
                                {result.address.suburb}
                              </span>
                            )}
                          </div>
                          <div style={{
                            fontSize:11, 
                            color:'rgba(255,255,255,0.5)', 
                            lineHeight:1.5,
                            paddingLeft:26,
                            marginBottom:4
                          }}>
                            {result.display_name.split(',').slice(1, 3).join(',').trim()}
                          </div>
                          {result.type && (
                            <div style={{
                              fontSize:10,
                              color:'rgba(255,255,255,0.4)',
                              paddingLeft:26,
                              fontStyle:'italic'
                            }}>
                              {result.type.charAt(0).toUpperCase() + result.type.slice(1)}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  <div style={{fontSize:11, opacity:0.5, marginTop:4}}>{dest[0].toFixed(4)}, {dest[1].toFixed(4)}</div>
                </div>

                <div style={{display:'flex', gap:8}}>
                  <button className="btn btn-primary" onClick={swapOD} style={{flex:1}}>🔄 Swap</button>
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
                  <div style={{textAlign:'center', padding:'40px 20px', background:'var(--glass-bg)', backdropFilter:'blur(10px)', borderRadius:16, border:'1px dashed var(--line)'}}>
                    <div style={{fontSize:48, marginBottom:12}}>🚀</div>
                    <p style={{color:'var(--muted)', fontSize:15}}>Press <b style={{color:'var(--primary)'}}>Find itineraries</b> to see recommended routes.</p>
                  </div>
                ) : (
                  <div style={{display:'flex', flexDirection:'column', gap:16}}>
                    {itins.map((it, idx) => (
                      <div key={it.id} style={{background:'var(--glass-bg)', backdropFilter:'blur(10px)', border:'1px solid var(--glass-border)', borderRadius:16, padding:20, boxShadow:'0 4px 16px rgba(0,0,0,0.08)', transition:'all 0.3s ease'}} onMouseEnter={e => e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)'} onMouseLeave={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'}>
                        <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:16, flexWrap:'wrap'}}>
                          <div style={{flex:1}}>
                            <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:10, flexWrap:'wrap'}}>
                              <span style={{background:'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color:'white', width:32, height:32, borderRadius:'50%', display:'grid', placeItems:'center', fontWeight:700, fontSize:14}}>{idx + 1}</span>
                              <div style={{fontSize:18, fontWeight:700}}>~{it.durationMin} min</div>
                              <div style={{color:'var(--muted)', fontSize:14}}>• {it.transfers} transfers</div>
                              <div style={{background:it.reliability > 0.85 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(251, 191, 36, 0.15)', color:it.reliability > 0.85 ? 'var(--success)' : '#f59e0b', padding:'4px 10px', borderRadius:8, fontSize:12, fontWeight:600}}>{Math.round((it.reliability||0)*100)}% reliable</div>
                            </div>
                            <div style={{color:'var(--muted)', fontSize:14, marginBottom:10}}>🚶 {it.legs.join(' → ')}</div>
                            <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
                              <Chip>🚶 {(it.walk_km ?? 0).toFixed(1)} km walk</Chip>
                              <Chip>{(it.modes||[]).join(', ')}</Chip>
                            </div>
                          </div>
                          <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
                            <button className="btn" onClick={(e) => {e.stopPropagation(); exportPdf(it)}}>📄 {text.exportPdf}</button>
                            <button className="btn btn-primary" onClick={(e) => {e.stopPropagation(); suggestAlt(it)}}>🔄 {text.suggestAlt}</button>
                            <button className="btn" onClick={(e) => {e.stopPropagation(); setExpandedItin(expandedItin === it.id ? null : it.id)}} style={{background: expandedItin === it.id ? 'var(--primary)' : '', color: expandedItin === it.id ? 'white' : ''}}>
                              {expandedItin === it.id ? '▼ Hide Details' : '▶ View Details'}
                            </button>
                          </div>
                        </div>

                        {/* Detailed Journey Breakdown */}
                        {expandedItin === it.id && (
                          <div style={{
                            marginTop:20,
                            padding:20,
                            background:'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
                            border:'1px solid rgba(102, 126, 234, 0.2)',
                            borderRadius:12
                          }}>
                            {/* Journey Summary Stats */}
                            <div style={{
                              display:'grid',
                              gridTemplateColumns:'repeat(auto-fit, minmax(140px, 1fr))',
                              gap:12,
                              marginBottom:20
                            }}>
                              <div style={{padding:12, background:'rgba(255,255,255,0.05)', borderRadius:10, border:'1px solid rgba(255,255,255,0.1)'}}>
                                <div style={{fontSize:11, opacity:0.6, marginBottom:4}}>💵 Estimated Fare</div>
                                <div style={{fontSize:16, fontWeight:700}}>${(2.50 + it.transfers * 0.50).toFixed(2)} NZD</div>
                              </div>
                              
                              <div style={{padding:12, background:'rgba(255,255,255,0.05)', borderRadius:10, border:'1px solid rgba(255,255,255,0.1)'}}>
                                <div style={{fontSize:11, opacity:0.6, marginBottom:4}}>🌱 CO₂ Savings</div>
                                <div style={{fontSize:16, fontWeight:700}}>{(it.durationMin * 0.05).toFixed(1)} kg</div>
                              </div>
                              
                              <div style={{padding:12, background:'rgba(255,255,255,0.05)', borderRadius:10, border:'1px solid rgba(255,255,255,0.1)'}}>
                                <div style={{fontSize:11, opacity:0.6, marginBottom:4}}>⏱️ Departure</div>
                                <div style={{fontSize:16, fontWeight:700}}>In 3 min</div>
                              </div>
                              
                              <div style={{padding:12, background:'rgba(255,255,255,0.05)', borderRadius:10, border:'1px solid rgba(255,255,255,0.1)'}}>
                                <div style={{fontSize:11, opacity:0.6, marginBottom:4}}>👥 Crowding</div>
                                <div style={{fontSize:16, fontWeight:700}}>●●○○ Low</div>
                              </div>
                              
                              <div style={{padding:12, background:'rgba(255,255,255,0.05)', borderRadius:10, border:'1px solid rgba(255,255,255,0.1)'}}>
                                <div style={{fontSize:11, opacity:0.6, marginBottom:4}}>♿ Accessible</div>
                                <div style={{fontSize:16, fontWeight:700}}>{it.stairs ? '⚠️ Stairs' : '✓ Yes'}</div>
                              </div>
                              
                              <div style={{padding:12, background:'rgba(255,255,255,0.05)', borderRadius:10, border:'1px solid rgba(255,255,255,0.1)'}}>
                                <div style={{fontSize:11, opacity:0.6, marginBottom:4}}>🔌 Charging</div>
                                <div style={{fontSize:16, fontWeight:700}}>Available</div>
                              </div>
                            </div>

                            {/* Step-by-Step Journey */}
                            <div style={{marginTop:16}}>
                              <div style={{fontSize:14, fontWeight:700, marginBottom:12, color:'var(--primary)'}}>
                                📍 Step-by-Step Journey
                              </div>
                              
                              {/* Generate detailed steps */}
                              {it.legs.map((leg, legIdx) => {
                                const isWalk = leg.toLowerCase().includes('walk')
                                const isBus = leg.toLowerCase().includes('bus')
                                const isTrain = leg.toLowerCase().includes('train')
                                const isFerry = leg.toLowerCase().includes('ferry')
                                const isBike = leg.toLowerCase().includes('bike')
                                
                                // Extract route number (e.g., "Bus NX1" -> "NX1")
                                const routeMatch = leg.match(/(?:Bus|Train)\s+([A-Z0-9]+)/i)
                                const routeNumber = routeMatch ? routeMatch[1] : null
                                
                                return (
                                  <div key={legIdx} style={{
                                    display:'flex',
                                    gap:16,
                                    marginBottom:16,
                                    paddingBottom:16,
                                    borderBottom: legIdx < it.legs.length - 1 ? '1px dashed rgba(255,255,255,0.1)' : 'none'
                                  }}>
                                    {/* Step Number & Icon */}
                                    <div style={{display:'flex', flexDirection:'column', alignItems:'center', minWidth:60}}>
                                      <div style={{
                                        width:40,
                                        height:40,
                                        borderRadius:'50%',
                                        background: isWalk ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' :
                                                   isBus ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' :
                                                   isTrain ? 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' :
                                                   isFerry ? 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)' :
                                                   'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                        color:'white',
                                        display:'grid',
                                        placeItems:'center',
                                        fontSize:18,
                                        fontWeight:700,
                                        boxShadow:'0 4px 12px rgba(0,0,0,0.2)'
                                      }}>
                                        {isWalk ? '🚶' : isBus ? '🚌' : isTrain ? '🚆' : isFerry ? '⛴️' : isBike ? '🚴' : '🚌'}
                                      </div>
                                      {legIdx < it.legs.length - 1 && (
                                        <div style={{width:2, flex:1, background:'rgba(255,255,255,0.2)', minHeight:20, marginTop:8}} />
                                      )}
                                    </div>
                                    
                                    {/* Step Details */}
                                    <div style={{flex:1}}>
                                      <div style={{fontSize:15, fontWeight:700, marginBottom:6}}>
                                        {leg}
                                      </div>
                                      
                                      {/* Walking Details */}
                                      {isWalk && (
                                        <div style={{fontSize:13, color:'rgba(255,255,255,0.7)', marginBottom:8}}>
                                          <div style={{marginBottom:4}}>📏 Distance: {((it.walk_km || 0.4) / it.legs.filter(l => l.toLowerCase().includes('walk')).length).toFixed(2)} km</div>
                                          <div style={{marginBottom:4}}>⏱️ Duration: ~{Math.ceil((it.walk_km || 0.4) / it.legs.filter(l => l.toLowerCase().includes('walk')).length * 12)} min</div>
                                          <button 
                                            className="btn" 
                                            onClick={() => {
                                              // Show walking route on map
                                              alert(`Walking directions:\n1. Head ${legIdx === 0 ? 'to nearest stop' : 'to your destination'}\n2. Follow pedestrian paths\n3. Cross at designated crossings\n\nOpening map view...`)
                                              setView('map')
                                            }}
                                            style={{
                                              marginTop:8,
                                              padding:'6px 12px',
                                              fontSize:12,
                                              background:'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                              color:'white',
                                              border:'none'
                                            }}
                                          >
                                            🗺️ View Walking Route
                                          </button>
                                        </div>
                                      )}
                                      
                                      {/* Bus/Train Details */}
                                      {(isBus || isTrain || isFerry) && (
                                        <div style={{fontSize:13, color:'rgba(255,255,255,0.7)'}}>
                                          <div style={{marginBottom:8, padding:10, background:'rgba(255,255,255,0.05)', borderRadius:8}}>
                                            {routeNumber && (
                                              <div style={{marginBottom:6}}>
                                                <span style={{
                                                  background: isBus ? '#3b82f6' : isTrain ? '#8b5cf6' : '#06b6d4',
                                                  color:'white',
                                                  padding:'4px 10px',
                                                  borderRadius:6,
                                                  fontSize:13,
                                                  fontWeight:700,
                                                  marginRight:8
                                                }}>
                                                  {routeNumber}
                                                </span>
                                                <span style={{opacity:0.8}}>
                                                  {isBus ? 'Bus Route' : isTrain ? 'Train Line' : 'Ferry Route'}
                                                </span>
                                              </div>
                                            )}
                                            <div style={{marginBottom:4}}>🚏 <b>From:</b> Stop #{1000 + legIdx * 100} - {legIdx === 0 ? 'Start Point' : `Transfer Point ${legIdx}`}</div>
                                            <div style={{marginBottom:4}}>🎯 <b>To:</b> Stop #{1000 + legIdx * 100 + 50} - {legIdx === it.legs.length - 1 ? 'End Point' : 'Next Transfer'}</div>
                                            <div style={{marginBottom:4}}>⏱️ <b>Next Departure:</b> <span style={{color:'#10b981', fontWeight:600}}>3, 8, 15 min</span></div>
                                            <div style={{marginBottom:4}}>🪑 <b>Platform/Bay:</b> {isTrain ? 'Platform' : 'Bay'} {legIdx + 1}</div>
                                            <div style={{marginBottom:4}}>🎫 <b>Zone:</b> Zone {Math.min(legIdx + 1, 3)}</div>
                                            <div style={{marginBottom:4}}>👥 <b>Current Load:</b> {['Light', 'Moderate', 'Busy'][Math.floor(Math.random() * 3)]}</div>
                                            {isTrain && <div style={{marginBottom:4}}>🚃 <b>Carriages:</b> 3-car train</div>}
                                            {isBus && <div style={{marginBottom:4}}>♿ <b>Features:</b> Low-floor, wheelchair accessible</div>}
                                          </div>
                                          
                                          <div style={{display:'flex', gap:8, marginTop:8, flexWrap:'wrap'}}>
                                            <button 
                                              className="btn"
                                              onClick={() => {
                                                setSelectedStop({stop_id: `${1000 + legIdx * 100}`, name: `Stop ${1000 + legIdx * 100}`})
                                                setView('home')
                                              }}
                                              style={{padding:'6px 12px', fontSize:12}}
                                            >
                                              🚏 View Stop Info
                                            </button>
                                            <button 
                                              className="btn"
                                              onClick={() => alert(`Live tracking for ${routeNumber || 'this route'} will be available soon!`)}
                                              style={{padding:'6px 12px', fontSize:12}}
                                            >
                                              📍 Track Vehicle
                                            </button>
                                            <button 
                                              className="btn"
                                              onClick={() => alert(`Set reminder for ${routeNumber || 'this departure'}`)}
                                              style={{padding:'6px 12px', fontSize:12}}
                                            >
                                              🔔 Set Reminder
                                            </button>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )
                              })}
                            </div>

                            {/* Additional Travel Tips */}
                            <div style={{
                              marginTop:20,
                              padding:12,
                              background:'rgba(59, 130, 246, 0.1)',
                              borderLeft:'3px solid #3b82f6',
                              borderRadius:6
                            }}>
                              <div style={{fontSize:13, fontWeight:700, marginBottom:6}}>💡 Travel Tips</div>
                              <ul style={{fontSize:12, color:'rgba(255,255,255,0.8)', margin:0, paddingLeft:20}}>
                                <li>Allow 5 extra minutes for unexpected delays</li>
                                <li>Have your AT HOP card ready before boarding</li>
                                {it.transfers > 0 && <li>Transfers are free within 30 minutes</li>}
                                {it.stairs && <li>This route includes stairs - consider accessibility needs</li>}
                                <li>Check real-time updates before you leave</li>
                              </ul>
                            </div>
                          </div>
                        )}
                        {alts[it.id] && (
                          <div className="alt" style={{
                            marginTop:16, 
                            padding:20, 
                            background:'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(52, 211, 153, 0.05) 100%)',
                            border:'2px solid rgba(16, 185, 129, 0.3)',
                            borderRadius:16,
                            boxShadow:'0 4px 15px rgba(16, 185, 129, 0.15)'
                          }}>
                            <div style={{
                              display:'flex', 
                              alignItems:'center', 
                              justifyContent:'space-between',
                              marginBottom:12
                            }}>
                              <div style={{fontWeight:700, fontSize:16, color:'#10b981'}}>
                                ✨ {alts[it.id].reason}
                              </div>
                              {alts[it.id].comparison && (
                                <div style={{
                                  display:'flex',
                                  gap:8,
                                  alignItems:'center'
                                }}>
                                  {alts[it.id].comparison.timeDiff !== 0 && (
                                    <span style={{
                                      fontSize:12,
                                      padding:'4px 10px',
                                      background: alts[it.id].comparison.timeDiff < 0 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                      color: alts[it.id].comparison.timeDiff < 0 ? '#10b981' : '#ef4444',
                                      borderRadius:8,
                                      fontWeight:600
                                    }}>
                                      {alts[it.id].comparison.timeDiff > 0 ? '+' : ''}{alts[it.id].comparison.timeDiff} min
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                            
                            <div style={{
                              display:'grid',
                              gridTemplateColumns:'repeat(auto-fit, minmax(150px, 1fr))',
                              gap:12,
                              marginBottom:12
                            }}>
                              <div style={{
                                background:'rgba(255,255,255,0.05)',
                                padding:12,
                                borderRadius:12,
                                border:'1px solid rgba(255,255,255,0.1)'
                              }}>
                                <div style={{fontSize:11, opacity:0.6, marginBottom:4}}>Duration</div>
                                <div style={{fontSize:16, fontWeight:700}}>
                                  ~{alts[it.id].durationMin || '—'} min
                                </div>
                              </div>
                              
                              <div style={{
                                background:'rgba(255,255,255,0.05)',
                                padding:12,
                                borderRadius:12,
                                border:'1px solid rgba(255,255,255,0.1)'
                              }}>
                                <div style={{fontSize:11, opacity:0.6, marginBottom:4}}>Transfers</div>
                                <div style={{fontSize:16, fontWeight:700}}>
                                  {alts[it.id].transfers || 0}
                                  {alts[it.id].comparison?.transferDiff !== 0 && (
                                    <span style={{
                                      fontSize:11,
                                      marginLeft:6,
                                      color: alts[it.id].comparison.transferDiff < 0 ? '#10b981' : '#ef4444'
                                    }}>
                                      ({alts[it.id].comparison.transferDiff > 0 ? '+' : ''}{alts[it.id].comparison.transferDiff})
                                    </span>
                                  )}
                                </div>
                              </div>
                              
                              {alts[it.id].walk_distance && (
                                <div style={{
                                  background:'rgba(255,255,255,0.05)',
                                  padding:12,
                                  borderRadius:12,
                                  border:'1px solid rgba(255,255,255,0.1)'
                                }}>
                                  <div style={{fontSize:11, opacity:0.6, marginBottom:4}}>Walking</div>
                                  <div style={{fontSize:16, fontWeight:700}}>
                                    {alts[it.id].walk_distance} km
                                    {alts[it.id].comparison?.walkDiff !== 0 && (
                                      <span style={{
                                        fontSize:11,
                                        marginLeft:6,
                                        color: alts[it.id].comparison.walkDiff < 0 ? '#10b981' : '#ef4444'
                                      }}>
                                        ({alts[it.id].comparison.walkDiff > 0 ? '+' : ''}{alts[it.id].comparison.walkDiff}km)
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            {alts[it.id].legs && (
                              <div style={{
                                padding:12,
                                background:'rgba(255,255,255,0.03)',
                                borderRadius:10,
                                marginBottom:10
                              }}>
                                <div style={{fontSize:11, opacity:0.6, marginBottom:6}}>Route Details</div>
                                <div style={{fontSize:14, fontWeight:600}}>
                                  🚶 {alts[it.id].legs.join(' → ')}
                                </div>
                              </div>
                            )}
                            
                            {alts[it.id].benefits && alts[it.id].benefits.length > 0 && (
                              <div style={{marginTop:10}}>
                                <div style={{fontSize:11, opacity:0.6, marginBottom:6}}>Benefits:</div>
                                {alts[it.id].benefits.map((benefit, idx) => (
                                  <div key={idx} style={{
                                    fontSize:13,
                                    padding:'6px 10px',
                                    background:'rgba(16, 185, 129, 0.15)',
                                    borderLeft:'3px solid #10b981',
                                    borderRadius:6,
                                    marginBottom:4
                                  }}>
                                    ✓ {benefit}
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            {alts[it.id].warnings && alts[it.id].warnings.length > 0 && (
                              <div style={{marginTop:10}}>
                                <div style={{fontSize:11, opacity:0.6, marginBottom:6}}>Warnings:</div>
                                {alts[it.id].warnings.map((warning, idx) => (
                                  <div key={idx} style={{
                                    fontSize:13,
                                    padding:'6px 10px',
                                    background:'rgba(251, 191, 36, 0.15)',
                                    borderLeft:'3px solid #fbbf24',
                                    borderRadius:6,
                                    marginBottom:4
                                  }}>
                                    ⚠ {warning}
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            {alts[it.id].note && (
                              <div style={{
                                marginTop:10,
                                padding:10,
                                background:'rgba(59, 130, 246, 0.1)',
                                borderLeft:'3px solid #3b82f6',
                                borderRadius:6,
                                fontSize:13,
                                color:'rgba(255,255,255,0.8)'
                              }}>
                                ℹ️ {alts[it.id].note}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </FeatureCard>

          <FeatureCard icon="🚍" title="Nearby Transit" description="Check nearby stops, live departures, and multimodal choices.">
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
          </div>
        )}

        {view === 'safety' && (
          <div>
            <h2 className="section-title">🛡️ Safety & Emergency</h2>
          <FeatureCard icon="📞" title="Emergency Contacts" description="Quick access to local emergency services.">
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
          </div>
        )}

        {view === 'settings' && (
          <div>
            <h2 className="section-title">⚙️ Settings & Preferences</h2>
          <FeatureCard icon="🌍" title="Travel Toolkit" description="International tools for language, money, and bookings.">
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
          </div>
        )}

        {view === 'reviews' && (
          <div>
            <h2 className="section-title">⭐ Community Reviews</h2>
          <FeatureCard icon="⭐" title="Share Your Experience" description="Crowd-sourced tips keep travellers informed.">
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
          </div>
        )}

      </div>
    </div>
  )
}
