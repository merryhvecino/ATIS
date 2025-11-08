import { useEffect, useState, useMemo, useCallback } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, Circle, Polyline, useMap } from 'react-leaflet'
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

// Custom map icons for different features
const mapIcons = {
  origin: new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  }),
  destination: new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  }),
  stop: new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  }),
  trafficWarning: new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  }),
  trafficCritical: new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  })
}

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

const ALERT_TYPE_ICONS = {
  weather: '🌦️',
  event: '🎟️',
  safety: '🚨',
  accident: '🚗',
  roadworks: '🚧',
  service: '🛠️',
  ferry: '⛴️',
  train: '🚆',
  bus: '🚌',
}

const ALERT_SEVERITY_STYLES = {
  critical: { bg: 'rgba(239,68,68,0.15)', color: '#ef4444', label: 'Critical' },
  high: { bg: 'rgba(239,68,68,0.15)', color: '#ef4444', label: 'High' },
  warning: { bg: 'rgba(251,191,36,0.18)', color: '#f59e0b', label: 'Warning' },
  moderate: { bg: 'rgba(249,115,22,0.18)', color: '#f97316', label: 'Moderate' },
  info: { bg: 'rgba(59,130,246,0.18)', color: '#3b82f6', label: 'Info' },
  planned: { bg: 'rgba(167,139,250,0.18)', color: '#8b5cf6', label: 'Planned' },
  low: { bg: 'rgba(16,185,129,0.18)', color: '#10b981', label: 'Low' }
}

const getAlertIcon = (type = '') => {
  const key = type.toLowerCase()
  if (ALERT_TYPE_ICONS[key]) return ALERT_TYPE_ICONS[key]
  if (key.includes('accident')) return '🚗'
  if (key.includes('road')) return '🚧'
  if (key.includes('weather')) return '🌦️'
  return '⚠️'
}

const getSeverityAppearance = (severity = '') => {
  const key = severity.toLowerCase()
  return ALERT_SEVERITY_STYLES[key] || { bg: 'rgba(148,163,184,0.18)', color: '#475569', label: severity ? severity : 'Info' }
}

const SEVERITY_RANK = {
  critical: 6,
  high: 5,
  warning: 4,
  moderate: 3,
  planned: 2,
  info: 1,
  low: 0
}

const getSeverityRank = (severity = '') => {
  const key = severity.toLowerCase()
  return SEVERITY_RANK[key] ?? 1
}

const formatAlertWindow = (start, end) => {
  if (!start && !end) return ''
  const opts = { hour: 'numeric', minute: '2-digit' }
  const startStr = start ? new Date(start).toLocaleTimeString([], opts) : null
  const endStr = end ? new Date(end).toLocaleTimeString([], opts) : null
  if (startStr && endStr) return `${startStr} – ${endStr}`
  if (startStr) return `From ${startStr}`
  if (endStr) return `Until ${endStr}`
  return ''
}

const formatMinutesAsDuration = (minutes) => {
  if (minutes == null) return null
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (mins === 0) return `${hours} hr`
  return `${hours} hr ${mins} min`
}

const formatAlertStatus = (start, end) => {
  const now = Date.now()
  const startMs = start ? new Date(start).getTime() : null
  const endMs = end ? new Date(end).getTime() : null
  if (startMs && startMs > now) {
    const diffMin = Math.max(1, Math.round((startMs - now) / 60000))
    if (diffMin < 60) return `Starts in ${diffMin} min`
    const hours = Math.round(diffMin / 60)
    return `Starts in ${hours} hr`
  }
  if (endMs && endMs < now) {
    const diffMin = Math.max(1, Math.round((now - endMs) / 60000))
    if (diffMin < 60) return `Ended ${diffMin} min ago`
    const hours = Math.round(diffMin / 60)
    return `Ended ${hours} hr ago`
  }
  if (startMs && startMs <= now && (!endMs || endMs >= now)) {
    return 'Ongoing now'
  }
  return 'Active'
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
      icon={mapIcons.origin}
    >
      <Popup minWidth={90}>
        <span onClick={() => setDraggable((d) => !d)}>
          {label}<br/>
          <small style={{color:'#666'}}>{draggable ? 'Draggable' : 'Click to make draggable'}</small>
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

// Component to handle "My Location" button
function RecenterButton({ position }) {
  const map = useMap()
  
  const recenter = () => {
    map.flyTo(position, 15, {
      duration: 1.5
    })
  }
  
  return (
    <button
      onClick={recenter}
      style={{
        position: 'absolute',
        top: 64,
        right: 10,
        zIndex: 1000,
        padding: '10px 16px',
        background: 'white',
        border: '2px solid rgba(0,0,0,0.2)',
        borderRadius: 8,
        cursor: 'pointer',
        fontSize: 14,
        fontWeight: 600,
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        transition: 'all 0.2s',
        minWidth: 200
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = '#3b82f6'
        e.currentTarget.style.color = 'white'
        e.currentTarget.style.transform = 'translateY(-2px)'
        e.currentTarget.style.boxShadow = '0 4px 16px rgba(59, 130, 246, 0.4)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'white'
        e.currentTarget.style.color = '#333'
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)'
      }}
      title="Center map on your origin location"
    >
      📍 My Location
    </button>
  )
}

function MapLegend({ trafficCount }) {
  return (
    <div style={{
      position: 'absolute',
      bottom: 20,
      right: 20,
      background: 'rgba(255, 255, 255, 0.95)',
      padding: '12px 16px',
      borderRadius: 12,
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      zIndex: 1000,
      fontSize: 13,
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(0,0,0,0.1)'
    }}>
      <div style={{fontWeight:700, marginBottom:10, fontSize:14, color:'#1a1a1a'}}>
        🗺️ Map Legend
      </div>
      <div style={{display:'flex', flexDirection:'column', gap:8}}>
        <div style={{display:'flex', alignItems:'center', gap:8}}>
          <div style={{width:20, height:20, borderRadius:'50%', background:'#28a745'}}></div>
          <span style={{color:'#333'}}>Origin (drag to move)</span>
        </div>
        <div style={{display:'flex', alignItems:'center', gap:8}}>
          <div style={{width:20, height:20, borderRadius:'50%', background:'#dc3545'}}></div>
          <span style={{color:'#333'}}>Destination (click map)</span>
        </div>
        <div style={{display:'flex', alignItems:'center', gap:8}}>
          <div style={{width:20, height:20, borderRadius:'50%', background:'#007bff'}}></div>
          <span style={{color:'#333'}}>Transit Stops</span>
        </div>
        <div style={{display:'flex', alignItems:'center', gap:8}}>
          <div style={{width:20, height:20, borderRadius:'50%', background:'#fd7e14'}}></div>
          <span style={{color:'#333'}}>Traffic Warning</span>
        </div>
        <div style={{display:'flex', alignItems:'center', gap:8}}>
          <div style={{width:20, height:20, borderRadius:'50%', background:'#6f42c1'}}></div>
          <span style={{color:'#333'}}>Traffic Critical</span>
        </div>
        {trafficCount > 0 && (
          <div style={{
            marginTop:8, 
            paddingTop:8, 
            borderTop:'1px solid rgba(0,0,0,0.1)',
            fontSize:12,
            color:'#666',
            display:'flex',
            alignItems:'center',
            gap:6
          }}>
            <span style={{
              display:'inline-block',
              width:8,
              height:8,
              borderRadius:'50%',
              background:'#ff4444',
              animation:'pulse 2s infinite'
            }}></span>
            {trafficCount} active traffic incident{trafficCount !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  )
}

function InteractiveMap({ origin, setOrigin, dest, setDest, stops, trafficIncidents = [], lastUpdate, onRefresh }) {
  const [showTraffic, setShowTraffic] = useState(true)
  const [showRoute, setShowRoute] = useState(true)
  const [showStops, setShowStops] = useState(true)
  const [mapStyle, setMapStyle] = useState('standard')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const center = origin
  
  // Calculate route line between origin and destination
  const routeLine = [origin, dest]
  
  // Map tile URLs for different styles
  const mapTiles = {
    standard: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    transport: 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
    dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png'
  }
  
  // Manual refresh handler with animation
  const handleManualRefresh = async () => {
    setIsRefreshing(true)
    await onRefresh()
    setTimeout(() => setIsRefreshing(false), 1000)
  }
  
  return (
    <div style={{position:'relative', height:'100%', width:'100%'}}>
      {/* Real-Time Update Indicator - Top Center */}
      <div style={{
        position: 'absolute',
        top: 10,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4
      }}>
        <div style={{
          padding: '8px 16px',
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          color: 'white',
          border: '2px solid rgba(255,255,255,0.3)',
          borderRadius: 20,
          fontSize: 12,
          fontWeight: 700,
          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          animation: 'pulse 2s ease-in-out infinite'
        }}>
          <span style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: '#fff',
            animation: 'pulse 1.5s ease-in-out infinite',
            boxShadow: '0 0 8px rgba(255,255,255,0.8)'
          }}></span>
          🔴 LIVE UPDATES
        </div>
        {lastUpdate && (
          <div style={{
            padding: '4px 12px',
            background: 'rgba(0,0,0,0.7)',
            color: 'white',
            borderRadius: 12,
            fontSize: 10,
            fontWeight: 600,
            backdropFilter: 'blur(10px)'
          }}>
            Updated {lastUpdate}
          </div>
        )}
      </div>

      {/* Map Controls Panel - Top Left */}
      <div style={{
        position: 'absolute',
        top: 10,
        left: 10,
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: 8
      }}>
        {/* Manual Refresh Button */}
        <button
          onClick={handleManualRefresh}
          disabled={isRefreshing}
          style={{
            padding: '10px 16px',
            background: isRefreshing ? '#10b981' : 'white',
            color: isRefreshing ? 'white' : '#333',
            border: '2px solid rgba(0,0,0,0.2)',
            borderRadius: 8,
            cursor: isRefreshing ? 'wait' : 'pointer',
            fontSize: 14,
            fontWeight: 600,
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            transition: 'all 0.3s',
            opacity: isRefreshing ? 0.8 : 1
          }}
          title="Refresh traffic data now"
        >
          <span style={{
            display: 'inline-block',
            animation: isRefreshing ? 'spin 1s linear infinite' : 'none'
          }}>
            🔄
          </span>
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </button>
        
        <button
          onClick={() => setShowTraffic(!showTraffic)}
          style={{
            padding: '10px 16px',
            background: showTraffic ? '#3b82f6' : 'white',
            color: showTraffic ? 'white' : '#333',
            border: '2px solid rgba(0,0,0,0.2)',
            borderRadius: 8,
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 600,
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            transition: 'all 0.2s'
          }}
          title={showTraffic ? 'Hide traffic incidents' : 'Show traffic incidents'}
        >
          🚦 Traffic {showTraffic ? '(On)' : '(Off)'}
        </button>
        <button
          onClick={() => setShowRoute(!showRoute)}
          style={{
            padding: '10px 16px',
            background: showRoute ? '#3b82f6' : 'white',
            color: showRoute ? 'white' : '#333',
            border: '2px solid rgba(0,0,0,0.2)',
            borderRadius: 8,
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 600,
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            transition: 'all 0.2s'
          }}
          title={showRoute ? 'Hide route line' : 'Show route line'}
        >
          🛣️ Route {showRoute ? '(On)' : '(Off)'}
        </button>
        <button
          onClick={() => setShowStops(!showStops)}
          style={{
            padding: '10px 16px',
            background: showStops ? '#3b82f6' : 'white',
            color: showStops ? 'white' : '#333',
            border: '2px solid rgba(0,0,0,0.2)',
            borderRadius: 8,
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 600,
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            transition: 'all 0.2s'
          }}
          title={showStops ? 'Hide transit stops' : 'Show transit stops'}
        >
          🚏 Stops {showStops ? '(On)' : '(Off)'}
        </button>
      </div>
      
      {/* Top Right Control Panel */}
      <div style={{
        position: 'absolute',
        top: 10,
        right: 10,
        zIndex: 1000,
        minWidth: 200
      }}>
        {/* Map Style Selector */}
        <select
          value={mapStyle}
          onChange={(e) => setMapStyle(e.target.value)}
          style={{
            width: '100%',
            padding: '10px 16px',
            background: 'white',
            color: '#333',
            border: '2px solid rgba(0,0,0,0.2)',
            borderRadius: 8,
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 600,
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            outline: 'none',
            appearance: 'none',
            WebkitAppearance: 'none',
            MozAppearance: 'none',
            backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'currentColor\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 12px center',
            backgroundSize: '16px',
            paddingRight: '36px',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#3b82f6'
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(0,0,0,0.2)'
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)'
          }}
          title="Change map style"
        >
          <option value="standard">🗺️ Standard Map</option>
          <option value="transport">🚌 Transport Map</option>
          <option value="dark">🌙 Dark Mode</option>
        </select>
      </div>
      
    <MapContainer center={center} zoom={13} style={{height: '100%', width: '100%', borderRadius: 12}}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url={mapTiles[mapStyle]}
          key={mapStyle}
        />
        
        {/* Route Line - Blue dashed line between origin and destination */}
        {showRoute && (
          <Polyline
            positions={routeLine}
            pathOptions={{
              color: '#3b82f6',
              weight: 4,
              opacity: 0.7,
              dashArray: '10, 10',
              lineCap: 'round',
              lineJoin: 'round'
            }}
          >
            <Popup>
              <strong>📍 Planned Route</strong><br/>
              <small>From origin to destination</small>
            </Popup>
          </Polyline>
        )}
        
        {/* Origin Marker - Green (draggable) */}
      <DraggableMarker position={origin} setPosition={setOrigin} label="Origin (drag me)" />
        
        {/* My Location Button */}
        <RecenterButton position={origin} />
        
        {/* Destination Marker - Red */}
        <Marker position={dest} icon={mapIcons.destination}>
          <Popup>
            <strong>🎯 Destination</strong><br/>
            <small>{dest[0].toFixed(5)}, {dest[1].toFixed(5)}</small>
          </Popup>
      </Marker>
        
        {/* Transit Stops - Blue (conditionally shown) */}
        {showStops && stops.slice(0, 10).map((stop) => (
          <Marker 
            key={stop.stop_id} 
            position={[stop.lat, stop.lng]} 
            icon={mapIcons.stop}
          >
            <Popup>
              <strong>🚏 {stop.name}</strong><br/>
              <small>📏 {stop.distance_m}m away</small>
            </Popup>
        </Marker>
      ))}
        
        {/* Traffic Incidents - Orange/Violet (conditionally shown) */}
        {showTraffic && trafficIncidents
          .filter(incident => {
            // Only show incidents with valid coordinates
            const hasCoords = incident.location?.coordinates || 
                            (incident.lat != null && incident.lng != null)
            return hasCoords
          })
          .map((incident, idx) => {
          // Determine severity and icon
          const isCritical = incident.severity === 'critical' || 
                           incident.severity === 'major' ||
                           incident.type === 'accident' ||
                           incident.type === 'closure'
          const icon = isCritical ? mapIcons.trafficCritical : mapIcons.trafficWarning
          
          // Get position - guaranteed to be valid now
          const position = incident.location?.coordinates || [incident.lat, incident.lng]
          
          // Validate position is an array with 2 numbers
          if (!Array.isArray(position) || position.length !== 2 || 
              typeof position[0] !== 'number' || typeof position[1] !== 'number') {
            console.warn('Invalid traffic incident position:', incident)
            return null
          }
          
          // Format time
          const timeStr = incident.start_time ? new Date(incident.start_time).toLocaleTimeString() : 'Now'
          
          return (
            <div key={`traffic-${idx}`}>
              <Marker position={position} icon={icon}>
                <Popup maxWidth={250}>
                  <div style={{padding:'4px 0'}}>
                    <strong style={{
                      color: isCritical ? '#6f42c1' : '#fd7e14',
                      fontSize:14
                    }}>
                      {isCritical ? '🚨' : '⚠️'} {incident.title || incident.type || 'Traffic Incident'}
                    </strong>
                    <div style={{marginTop:8, fontSize:13, lineHeight:1.5}}>
                      {incident.description || incident.summary || 'Traffic disruption reported'}
                    </div>
                    <div style={{
                      marginTop:8, 
                      paddingTop:8, 
                      borderTop:'1px solid #eee',
                      fontSize:11,
                      color:'#666'
                    }}>
                      <div><strong>Severity:</strong> {incident.severity || 'moderate'}</div>
                      {incident.affected_routes && (
                        <div><strong>Routes:</strong> {incident.affected_routes}</div>
                      )}
                      <div><strong>Time:</strong> {timeStr}</div>
                    </div>
                  </div>
                </Popup>
              </Marker>
              
              {/* Add radius circle for critical incidents */}
              {isCritical && (
                <Circle
                  center={position}
                  radius={500}
                  pathOptions={{
                    color: '#6f42c1',
                    fillColor: '#6f42c1',
                    fillOpacity: 0.1,
                    weight: 2,
                    dashArray: '5, 5'
                  }}
                />
              )}
            </div>
          )
        }).filter(Boolean)}
        
      <MapClickHandler onMapClick={setDest} />
    </MapContainer>
      
      {/* Add the legend */}
      <MapLegend trafficCount={showTraffic ? trafficIncidents.length : 0} />
    </div>
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
  const [mfaCode, setMfaCode] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [strength, setStrength] = useState(0)
  const [requiresMfa, setRequiresMfa] = useState(false)

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
    
    // If MFA is required but code not provided
    if (requiresMfa && !mfaCode) {
      setError('Please enter your 6-digit MFA code')
      return
    }
    
    setLoading(true)
    try{
      const payload = mode === 'register' 
        ? {username: user, password: pass, email: email}
        : {username: user, password: pass, mfa_code: mfaCode || null}
      
      const r = await fetch(`${API}/auth/${mode}`, { 
        method:'POST', 
        headers:{'Content-Type':'application/json'}, 
        body: JSON.stringify(payload) 
      })
      const d = await r.json()
      
      // Check if MFA is required
      if (r.status === 403 && d.detail === 'MFA code required') {
        setRequiresMfa(true)
        setError('🔐 MFA enabled on this account. Please enter your 6-digit code from your authenticator app.')
        setLoading(false)
        return
      }
      
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
    <div style={{minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:20, position:'relative', overflow:'hidden', background:'#0a0e27'}}>
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

            {/* MFA Code Input (shown only when MFA is required) */}
            {requiresMfa && mode === 'login' && (
              <div>
                <label style={{display:'block', marginBottom:8, fontSize:13, fontWeight:600, color:'var(--muted)'}}>
                  🔐 Authenticator Code
                </label>
                <input 
                  type="text"
                  placeholder="Enter 6-digit code" 
                  value={mfaCode} 
                  onChange={e=>setMfaCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  style={{
                    width:'100%',
                    textAlign:'center',
                    fontSize:20,
                    letterSpacing:8,
                    fontWeight:700,
                    fontFamily:'monospace'
                  }}
                  autoComplete="off"
                  disabled={loading}
                  maxLength={6}
                  required
                />
                <div style={{
                  marginTop:8,
                  padding:10,
                  background:'rgba(59,130,246,0.1)',
                  border:'1px solid rgba(59,130,246,0.3)',
                  borderRadius:8,
                  fontSize:11,
                  color:'rgba(148,163,184,0.9)'
                }}>
                  💡 Open your authenticator app (Google Authenticator, Microsoft Authenticator, or Authy) and enter the 6-digit code shown for ATIS Transport.
                </div>
              </div>
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
  // Initialize as true if token exists to prevent flash during verification
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!(localStorage.getItem('atis_token') && localStorage.getItem('atis_user'))
  })
  const [isVerifying, setIsVerifying] = useState(true)
  
  const [origin, setOrigin] = useState([-36.8485, 174.7633])
  const [dest, setDest] = useState([-36.8443, 174.7676])
  const [stops, setStops] = useState([])
  const [itins, setItins] = useState([])
  const [banner, setBanner] = useState('')
  const [selectedStop, setSelectedStop] = useState(null)
  const [departures, setDepartures] = useState([])
  const [alerts, setAlerts] = useState([])
  const [trafficIncidents, setTrafficIncidents] = useState([])
  const [lastTrafficUpdate, setLastTrafficUpdate] = useState(null)
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
  
  // MFA States
  const [mfaEnabled, setMfaEnabled] = useState(false)
  const [mfaQrCode, setMfaQrCode] = useState(null)
  const [mfaSecret, setMfaSecret] = useState(null)
  const [mfaSetupCode, setMfaSetupCode] = useState('')
  const [mfaLoading, setMfaLoading] = useState(false)
  const [mfaError, setMfaError] = useState('')
  const [mfaSuccess, setMfaSuccess] = useState('')
  const [reviewComment, setReviewComment] = useState('')

  // Location search states
  const [originSearch, setOriginSearch] = useState('')
  const [destSearch, setDestSearch] = useState('')
  const [originName, setOriginName] = useState('Auckland CBD')
  const [destName, setDestName] = useState('Auckland Airport')
  const [searchResults, setSearchResults] = useState([])
  const [searchingFor, setSearchingFor] = useState(null)

  // Assessment features - Environmental & MCDA
  const [mcdaProfile, setMcdaProfile] = useState('balanced')
  const [showMcdaBreakdown, setShowMcdaBreakdown] = useState({})

  const text = TRANSLATIONS[uiLang] || TRANSLATIONS.en
  const convertedAmount = Number((amount * (CURRENCY_RATES[currency] || 1)).toFixed(2))

  const sortedAlerts = useMemo(() => {
    const now = Date.now()
    const isOngoing = (alert) => {
      const start = alert.start_time ? new Date(alert.start_time).getTime() : null
      const end = alert.end_time ? new Date(alert.end_time).getTime() : null
      const started = !start || start <= now
      const notEnded = !end || end >= now
      return started && notEnded
    }
    const getStart = (alert) => alert.start_time ? new Date(alert.start_time).getTime() : now - 1
    const getEnd = (alert) => alert.end_time ? new Date(alert.end_time).getTime() : now + 1
    const copy = [...alerts]
    copy.sort((a, b) => {
      const rankDiff = getSeverityRank(b.severity) - getSeverityRank(a.severity)
      if (rankDiff !== 0) return rankDiff
      const aOngoing = isOngoing(a)
      const bOngoing = isOngoing(b)
      if (aOngoing !== bOngoing) return aOngoing ? -1 : 1
      const startDiff = getStart(a) - getStart(b)
      if (startDiff !== 0) return startDiff
      return getEnd(a) - getEnd(b)
    })
    return copy
  }, [alerts])

  const alertStats = useMemo(() => {
    const now = Date.now()
    let severe = 0
    let upcoming = 0
    let ongoing = 0
    let delaySum = 0
    let delayCount = 0
    let nextStart = null
    const severityBreakdown = {}

    sortedAlerts.forEach(alert => {
      const rank = getSeverityRank(alert.severity)
      if (rank >= 4) severe += 1

      const start = alert.start_time ? new Date(alert.start_time).getTime() : null
      const end = alert.end_time ? new Date(alert.end_time).getTime() : null
      const isUpcoming = start && start > now
      const isOngoing = (!start || start <= now) && (!end || end >= now)

      if (isUpcoming) {
        upcoming += 1
        if (!nextStart || start < nextStart) {
          nextStart = start
        }
      }
      if (isOngoing) ongoing += 1

      if (typeof alert.expected_delay_min === 'number') {
        delaySum += alert.expected_delay_min
        delayCount += 1
      }

      const sevKey = (alert.severity || 'info').toLowerCase()
      severityBreakdown[sevKey] = (severityBreakdown[sevKey] || 0) + 1
    })

    return {
      total: sortedAlerts.length,
      severe,
      upcoming,
      ongoing,
      avgDelay: delayCount ? Math.round(delaySum / delayCount) : null,
      nextStart,
      severityBreakdown
    }
  }, [sortedAlerts])

  const topAlert = useMemo(() => {
    if (sortedAlerts.length === 0) return null
    const priorityAlert = sortedAlerts.find(a => getSeverityRank(a.severity) >= 4)
    return priorityAlert || sortedAlerts[0]
  }, [sortedAlerts])

  const alertSummaryCards = useMemo(() => {
    const cards = [
      { icon: '⚡', label: 'Active alerts', value: alertStats.total },
      { icon: '🔥', label: 'Severe disruptions', value: alertStats.severe },
      { icon: '⏳', label: 'Ongoing now', value: alertStats.ongoing },
      { icon: '📅', label: 'Upcoming', value: alertStats.upcoming }
    ]

    if (alertStats.avgDelay != null) {
      cards.push({ icon: '🕒', label: 'Average delay', value: formatMinutesAsDuration(alertStats.avgDelay) })
    }
    if (alertStats.nextStart) {
      cards.push({ icon: '🔔', label: 'Next disruption', value: new Date(alertStats.nextStart).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) })
    }
    return cards
  }, [alertStats])

  const homeMetrics = useMemo(() => {
    return [
      {
        icon: '🛰️',
        label: 'Nearby stops',
        value: stops.length,
        meta: stops.length ? 'within 1 km radius' : 'Pulling nearby stops…'
      },
      {
        icon: '🧭',
        label: 'Routes planned',
        value: itins.length,
        meta: itins.length ? 'Saved for quick launch' : 'No itineraries yet'
      },
      {
        icon: '⚠️',
        label: 'Active alerts',
        value: alertStats.total,
        meta: alertStats.severe ? `${alertStats.severe} severe` : 'All manageable'
      },
      {
        icon: '🚦',
        label: 'Traffic refresh',
        value: lastTrafficUpdate ? getRelativeTime(lastTrafficUpdate) : 'Awaiting feed',
        meta: lastTrafficUpdate ? 'Last update' : 'Tap refresh on map'
      }
    ]
  }, [stops.length, itins.length, alertStats.total, alertStats.severe, lastTrafficUpdate])


  const greeting = useMemo(() => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }, [])

  const formattedDateTime = useMemo(() => {
    return new Date().toLocaleString([], {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
  }, [])

  const topAlertStatus = useMemo(() => {
    if (!topAlert) return null
    return formatAlertStatus(topAlert.start_time, topAlert.end_time)
  }, [topAlert])

  // Transit system status - simulated real-time
  const transitStatus = useMemo(() => {
    const modes = [
      { name: 'Bus Network', icon: '🚌', status: alerts.filter(a => a.affected_modes?.includes('bus')).length > 0 ? 'delays' : 'normal' },
      { name: 'Train Services', icon: '🚆', status: alerts.filter(a => a.affected_modes?.includes('train')).length > 0 ? 'disrupted' : 'normal' },
      { name: 'Ferry Services', icon: '⛴️', status: alerts.filter(a => a.affected_modes?.includes('ferry')).length > 0 ? 'delays' : 'normal' },
      { name: 'Road Network', icon: '🚗', status: trafficIncidents.length > 2 ? 'congested' : trafficIncidents.length > 0 ? 'delays' : 'normal' }
    ]
    return modes
  }, [alerts, trafficIncidents])

  // Recent activity - stores last few actions
  const [recentActivity, setRecentActivity] = useState(() => {
    const saved = localStorage.getItem('atis_recent_activity')
    return saved ? JSON.parse(saved) : []
  })

  const addActivity = (activity) => {
    const newActivity = {
      id: Date.now(),
      timestamp: Date.now(),
      ...activity
    }
    const updated = [newActivity, ...recentActivity].slice(0, 5)
    setRecentActivity(updated)
    localStorage.setItem('atis_recent_activity', JSON.stringify(updated))
  }

  // Quick shortcuts - saved places
  const [quickShortcuts, setQuickShortcuts] = useState(() => {
    const saved = localStorage.getItem('atis_shortcuts')
    return saved ? JSON.parse(saved) : [
      { id: 1, name: 'Home → Work', icon: '🏢', origin: [-36.8485, 174.7633], dest: [-36.8443, 174.7676] },
      { id: 2, name: 'Home → Airport', icon: '✈️', origin: [-36.8485, 174.7633], dest: [-37.0082, 174.7850] }
    ]
  })

  // Live departures state
  const [liveDepartures, setLiveDepartures] = useState([])
  const [departuresLoading, setDeparturesLoading] = useState(false)
  const [expandedStops, setExpandedStops] = useState({})

  // Fetch live departures for nearby stops
  const fetchLiveDepartures = async () => {
    if (stops.length === 0) return
    
    setDeparturesLoading(true)
    try {
      // Get departures from top 3 nearest stops
      const topStops = stops.slice(0, 3)
      const departurePromises = topStops.map(async (stop) => {
        try {
          const r = await fetch(`${API}/departures?stop_id=${stop.stop_id}`)
          const data = await r.json()
          return {
            stopName: stop.stop_name,
            stopId: stop.stop_id,
            departures: (data.departures || []).slice(0, 3).map(dep => ({
              ...dep,
              fetchedAt: Date.now()
            }))
          }
        } catch (err) {
          return { stopName: stop.stop_name, stopId: stop.stop_id, departures: [] }
        }
      })
      
      const results = await Promise.all(departurePromises)
      setLiveDepartures(results)
    } catch (error) {
      console.error('Failed to fetch live departures:', error)
    } finally {
      setDeparturesLoading(false)
    }
  }

  // Auto-refresh departures every 30 seconds
  useEffect(() => {
    if (view === 'home' && stops.length > 0) {
      fetchLiveDepartures()
      const interval = setInterval(fetchLiveDepartures, 30000)
      return () => clearInterval(interval)
    }
  }, [view, stops])
  
  // Fetch MFA status when user is authenticated
  useEffect(() => {
    if (token && username) {
      fetchMfaStatus()
    }
  }, [token, username])
  
  // Fetch MFA status when settings view is opened
  useEffect(() => {
    if (view === 'settings' && token) {
      fetchMfaStatus()
    }
  }, [view, token])

  // Calculate minutes until departure
  const getMinutesUntil = (departureTime) => {
    if (!departureTime) return null
    const now = new Date()
    const depTime = new Date(departureTime)
    const diffMs = depTime - now
    const diffMins = Math.floor(diffMs / 60000)
    return diffMins
  }

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
            // Token is valid - keep authenticated state
            setToken(savedToken)
            setUsername(savedUser)
            // isAuthenticated already true from initialization
          } else {
            // Token is invalid, clear storage and set both states together
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
      
        // Set verification complete AFTER authentication state is finalized
      if (mounted) {
          // Use setTimeout to ensure state updates are batched
          setTimeout(() => {
            console.log('[ATIS] Verification complete, ready to show content')
        setIsVerifying(false)
            // Tell the page React is ready - show content NOW
            if (window.__atisReady) {
              window.__atisReady()
            }
          }, 100)  // Small delay to ensure DOM is painted
        }
      } else {
        // No saved token, set both states
        if (mounted) {
          console.log('[ATIS] No token found, showing login')
          setIsAuthenticated(false)
          // Use setTimeout to ensure state updates are batched
          setTimeout(() => {
            setIsVerifying(false)
            // Tell the page React is ready - show content NOW
            if (window.__atisReady) {
              window.__atisReady()
            }
          }, 100)  // Small delay to ensure DOM is painted
        }
      }
    }
    
    verifySession()
    
    return () => {
      mounted = false
    }
  }, [])

  // Load initial data once (only after authentication is verified)
  useEffect(() => {
    // Don't load data until verification is complete and user is authenticated
    if (isVerifying || !isAuthenticated) return
    
    fetch(`${API}/stops/nearby?lat=${origin[0]}&lng=${origin[1]}&radius=900`)
      .then(r=>r.json()).then(d=>setStops(d.stops||[])).catch(()=>{})
    fetch(`${API}/alerts`)
      .then(r=>r.json()).then(d=> {
        setAlerts([...(d.alerts||[]), ...(d.traffic||[])])
        setTrafficIncidents(d.traffic||[])
        setLastTrafficUpdate(Date.now())
      }).catch(()=>{})
    fetch(`${API}/weather/point?lat=${origin[0]}&lng=${origin[1]}`)
      .then(r=>r.json()).then(d=>setWeather(d.forecast||null)).catch(()=>{})
    fetch(`${API}/safety/contacts`)
      .then(r=>r.json()).then(d=>setSafetyContacts(d.contacts||[])).catch(()=>{})
    fetch(`${API}/reviews`)
      .then(r=>r.json()).then(d=>setReviews(d.reviews||[])).catch(()=>{})
  }, [isAuthenticated, isVerifying])

  // Update when origin changes (debounced to prevent excessive re-renders)
  useEffect(() => {
    // Only update if authenticated
    if (!isAuthenticated) return
    
    const timeoutId = setTimeout(() => {
      fetch(`${API}/stops/nearby?lat=${origin[0]}&lng=${origin[1]}&radius=900`)
        .then(r=>r.json()).then(d=>setStops(d.stops||[])).catch(()=>{})
      fetch(`${API}/weather/point?lat=${origin[0]}&lng=${origin[1]}`)
        .then(r=>r.json()).then(d=>setWeather(d.forecast||null)).catch(()=>{})
    }, 300)
    
    return () => clearTimeout(timeoutId)
  }, [origin[0], origin[1], isAuthenticated])

  // Helper function to get relative time string - defined as function for hoisting
  function getRelativeTime(timestamp) {
    const seconds = Math.floor((Date.now() - timestamp) / 1000)
    if (seconds < 10) return 'just now'
    if (seconds < 60) return `${seconds}s ago`
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    return `${hours}h ago`
  }

  // Manual refresh function that can be called from the map
  const refreshTrafficData = async () => {
    try {
      const r = await fetch(`${API}/alerts`)
      const d = await r.json()
      setAlerts([...(d.alerts||[]), ...(d.traffic||[])])
      setTrafficIncidents(d.traffic||[])
      const now = Date.now()
      setLastTrafficUpdate(now)
      console.log('🔄 Traffic data updated!')
      return true
    } catch(err) {
      console.error('Failed to refresh traffic:', err)
      return false
    }
  }

  // Auto-refresh traffic data every 30 seconds for real-time updates
  useEffect(() => {
    if (!isAuthenticated) return
    
    const refreshTraffic = () => {
      fetch(`${API}/alerts`)
        .then(r=>r.json())
        .then(d=> {
          setAlerts([...(d.alerts||[]), ...(d.traffic||[])])
          setTrafficIncidents(d.traffic||[])
          const now = Date.now()
          setLastTrafficUpdate(now)
        })
        .catch(()=>{})
    }
    
    // Set up interval for auto-refresh (30 seconds)
    const intervalId = setInterval(refreshTraffic, 30000)
    
    // Clean up interval on unmount
    return () => clearInterval(intervalId)
  }, [isAuthenticated])
  
  // Update relative time display every 10 seconds
  const [, forceUpdate] = useState()
  useEffect(() => {
    const timer = setInterval(() => forceUpdate({}), 10000)
    return () => clearInterval(timer)
  }, [])

  const viewDepartures = async (stop) => {
    setSelectedStop(stop)
    const r = await fetch(`${API}/departures?stop_id=${stop.stop_id}`)
    const data = await r.json()
    setDepartures(data.departures || [])
  }

  const plan = async () => {
    if (!token) {
      alert('Please login to plan trips.')
      return
    }
    const payload = {
      origin, destination: dest,
      depart_at: whenType === 'depart' ? whenValue : 'now',
      arrive_by: whenType === 'arrive' ? whenValue : null,
      optimize, max_walk_km: parseFloat(maxWalkKm),
      avoid_stairs: avoidStairs, bike_ok: bikeOk, modes,
    }
    try {
      const r = await fetch(`${API}/plan`, { 
        method:'POST', 
        headers:{
          'Content-Type':'application/json',
          ...authHeaders()
        }, 
        body: JSON.stringify(payload) 
      })
      if (!r.ok) {
        const error = await r.json()
        throw new Error(error.detail || 'Failed to plan trip')
      }
      const d = await r.json()
      setItins(d.itineraries || [])
      setBanner(d.context?.weatherAlert || '')
      setAlts({})
    } catch (error) {
      console.error('Plan error:', error)
      alert(error.message || 'Failed to plan trip. Please try again.')
    }
  }

  const trackTrip = async (itinerary) => {
    if (!token) return
    try {
      await fetch(`${API}/analytics/track/trip`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          origin,
          destination: dest,
          itinerary
        })
      })
    } catch (error) {
      console.log('Analytics tracking failed:', error)
    }
  }

  // loadAnalytics function removed - Analytics feature disabled

  const exportPdf = async (itinerary) => {
    if (!token) {
      alert('Please login to export PDF.')
      return
    }
    try {
      const r = await fetch(`${API}/export/itinerary`, {
        method:'POST', 
        headers:{
          'Content-Type':'application/json',
          ...authHeaders()
        }, 
        body: JSON.stringify({ origin, destination: dest, itinerary }) 
      })
      if (!r.ok) {
        throw new Error('Failed to export PDF')
      }
      const blob = await r.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a'); a.href = url; a.download = 'atis_trip.pdf'; a.click(); URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export error:', error)
      alert('Failed to export PDF. Please try again.')
    }
  }

  const suggestAlt = async (itinerary) => {
    if (!token) {
      alert('Please login to suggest alternative routes.')
      return
    }
    try {
      const r = await fetch(`${API}/routes/suggest`, { 
        method:'POST', 
        headers:{
          'Content-Type':'application/json',
          ...authHeaders()
        }, 
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
  
  // MFA Management Functions
  const fetchMfaStatus = async () => {
    try {
      const r = await fetch(`${API}/auth/mfa/status`, { headers: authHeaders() })
      if (r.ok) {
        const d = await r.json()
        setMfaEnabled(d.enabled)
      }
    } catch (e) {
      console.error('Failed to fetch MFA status:', e)
    }
  }
  
  const startMfaSetup = async () => {
    setMfaError('')
    setMfaSuccess('')
    setMfaLoading(true)
    try {
      const r = await fetch(`${API}/auth/mfa/setup`, { headers: authHeaders() })
      const d = await r.json()
      if (!r.ok) throw new Error(d.detail || 'Failed to setup MFA')
      
      setMfaQrCode(d.qr_code)
      setMfaSecret(d.secret)
      setMfaSuccess('Scan the QR code with your authenticator app!')
    } catch (e) {
      setMfaError(e.message)
    } finally {
      setMfaLoading(false)
    }
  }
  
  const enableMfa = async () => {
    if (!mfaSetupCode || mfaSetupCode.length !== 6) {
      setMfaError('Please enter a valid 6-digit code')
      return
    }
    
    setMfaError('')
    setMfaSuccess('')
    setMfaLoading(true)
    try {
      const r = await fetch(`${API}/auth/mfa/enable`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ code: mfaSetupCode })
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.detail || 'Invalid code')
      
      setMfaEnabled(true)
      setMfaQrCode(null)
      setMfaSecret(null)
      setMfaSetupCode('')
      setMfaSuccess('🎉 MFA enabled successfully! You\'ll need your authenticator app for future logins.')
    } catch (e) {
      setMfaError(e.message)
    } finally {
      setMfaLoading(false)
    }
  }
  
  const disableMfa = async () => {
    const code = prompt('Enter your current 6-digit MFA code to disable:')
    if (!code) return
    
    setMfaError('')
    setMfaSuccess('')
    setMfaLoading(true)
    try {
      const r = await fetch(`${API}/auth/mfa/disable`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ code })
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.detail || 'Invalid code')
      
      setMfaEnabled(false)
      setMfaSuccess('MFA disabled successfully')
    } catch (e) {
      setMfaError(e.message)
    } finally {
      setMfaLoading(false)
    }
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

  // Show loading screen while verifying token - PREVENTS BLINKING
  if (isVerifying) {
    return (
      <div style={{
        minHeight:'100vh',
        width:'100%',
        display:'flex',
        flexDirection:'column',
        alignItems:'center',
        justifyContent:'center',
        background:'#0a0e27',  // Exact match to app background
        color:'white',
        position:'fixed',
        top:0,
        left:0,
        zIndex:9999
      }}>
        <div style={{textAlign:'center'}}>
          <div style={{
            width:60,
            height:60,
            border:'4px solid rgba(139, 92, 246, 0.3)',
            borderTop:'4px solid #8b5cf6',
            borderRadius:'50%',
            animation:'spin 1s linear infinite',
            margin:'0 auto 20px'
          }}></div>
          <div style={{fontSize:18, fontWeight:600}}>Verifying session...</div>
          <div style={{fontSize:14, opacity:0.7, marginTop:8}}>Please wait</div>
        </div>
      </div>
    )
  }

  // Show login page if not authenticated - NO ACCESS TO MAIN APP
  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} isVerifying={false} />
  }

  return (
    <div style={{minHeight:'100vh', padding:'0', background:'#0a0e27', willChange:'auto'}}>
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
            {/* Hero Section with Greeting & Time */}
            <div style={{marginBottom:40}}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:16, marginBottom:24}}>
                <div>
                  <h1 style={{fontSize:36, fontWeight:800, marginBottom:8, background:'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent'}}>
                    {greeting}, {username}! 👋
                  </h1>
                  <p style={{fontSize:16, color:'rgba(148,163,184,0.9)', fontWeight:500}}>
                    {formattedDateTime}
                  </p>
                </div>
                {topAlert && (
                  <div style={{
                    background:'linear-gradient(135deg, rgba(239,68,68,0.15) 0%, rgba(251,191,36,0.15) 100%)',
                    border:'1px solid rgba(239,68,68,0.4)',
                    borderRadius:16,
                    padding:'12px 20px',
                    display:'flex',
                    alignItems:'center',
                    gap:12,
                    maxWidth:400,
                    boxShadow:'0 8px 24px rgba(239,68,68,0.2)'
                  }}>
                    <div style={{fontSize:24}}>🚨</div>
                    <div>
                      <div style={{fontSize:13, fontWeight:700, marginBottom:2}}>{topAlert.title || topAlert.summary || 'Active disruption'}</div>
                      <div style={{fontSize:11, color:'rgba(239,68,68,0.9)', fontWeight:600}}>{topAlertStatus}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Enhanced Metrics Grid */}
              <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(240px, 1fr))', gap:20}}>
                {homeMetrics.map((metric, idx) => {
                  // Determine click action based on metric type
                  let clickAction = null
                  let actionLabel = null
                  
                  if (metric.label === 'Nearby stops') {
                    clickAction = () => setView('map')
                    actionLabel = 'View on map'
                  } else if (metric.label === 'Routes planned') {
                    clickAction = () => setView('plan')
                    actionLabel = 'Plan new trip'
                  } else if (metric.label === 'Active alerts') {
                    clickAction = () => setView('alerts')
                    actionLabel = 'View details'
                  } else if (metric.label === 'Traffic refresh') {
                    clickAction = refreshTrafficData
                    actionLabel = 'Refresh now'
                  }
                  
                  const isClickable = clickAction !== null
                  
                  return (
                    <div
                      key={idx}
                      onClick={clickAction}
                      style={{
                        background:'linear-gradient(135deg, rgba(15,23,42,0.6) 0%, rgba(30,41,59,0.4) 100%)',
                        border:'1px solid rgba(148,163,184,0.2)',
                        borderRadius:20,
                        padding:'24px 20px',
                        backdropFilter:'blur(12px)',
                        boxShadow:'0 8px 32px rgba(0,0,0,0.12)',
                        transition:'all 0.3s ease',
                        cursor:isClickable ? 'pointer' : 'default',
                        position:'relative',
                        overflow:'hidden'
                      }}
                      onMouseEnter={(e) => {
                        if (isClickable) {
                          e.currentTarget.style.transform = 'translateY(-4px)'
                          e.currentTarget.style.boxShadow = '0 12px 40px rgba(102,126,234,0.25)'
                          e.currentTarget.style.borderColor = 'rgba(102,126,234,0.5)'
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)'
                        e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.12)'
                        e.currentTarget.style.borderColor = 'rgba(148,163,184,0.2)'
                      }}
                    >
                      <div style={{
                        position:'absolute',
                        top:-20,
                        right:-20,
                        fontSize:80,
                        opacity:0.08,
                        transform:'rotate(15deg)',
                        pointerEvents:'none'
                      }}>{metric.icon}</div>
                      <div style={{position:'relative', zIndex:1}}>
                        <div style={{fontSize:28, marginBottom:8}}>{metric.icon}</div>
                        <div style={{fontSize:32, fontWeight:800, marginBottom:6, color:'#fff'}}>{metric.value}</div>
                        <div style={{fontSize:13, fontWeight:600, color:'rgba(148,163,184,0.95)', marginBottom:4}}>{metric.label}</div>
                        <div style={{fontSize:11, color:'rgba(148,163,184,0.7)', fontStyle:'italic'}}>{metric.meta}</div>
                        {isClickable && (
                          <div style={{
                            marginTop:12,
                            fontSize:11,
                            fontWeight:600,
                            color:'rgba(102,126,234,0.9)',
                            display:'flex',
                            alignItems:'center',
                            gap:4
                          }}>
                            {actionLabel} <span style={{fontSize:14}}>→</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Real-Time Dashboard Sections */}
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:24, marginBottom:32}}>
              
              {/* Transit System Status */}
              <div style={{
                background:'linear-gradient(135deg, rgba(16,185,129,0.12) 0%, rgba(15,23,42,0.4) 100%)',
                border:'1px solid rgba(16,185,129,0.3)',
                borderRadius:20,
                padding:'24px',
                backdropFilter:'blur(12px)',
                boxShadow:'0 8px 32px rgba(0,0,0,0.12)'
              }}>
                <div style={{display:'flex', alignItems:'center', gap:12, marginBottom:20}}>
                  <div style={{fontSize:28}}>🚦</div>
                  <div>
                    <h3 style={{fontSize:18, fontWeight:700, marginBottom:2}}>Transit System Status</h3>
                    <p style={{fontSize:12, color:'rgba(148,163,184,0.9)'}}>Live service monitoring</p>
                  </div>
                </div>
                <div style={{display:'flex', flexDirection:'column', gap:12}}>
                  {transitStatus.map((mode, idx) => {
                    const statusConfig = {
                      normal: { color: '#10b981', bg: 'rgba(16,185,129,0.15)', label: 'Normal' },
                      delays: { color: '#f59e0b', bg: 'rgba(245,158,11,0.15)', label: 'Delays' },
                      disrupted: { color: '#ef4444', bg: 'rgba(239,68,68,0.15)', label: 'Disrupted' },
                      congested: { color: '#f97316', bg: 'rgba(249,115,22,0.15)', label: 'Congested' }
                    }
                    const config = statusConfig[mode.status] || statusConfig.normal
                    return (
                      <div
                        key={idx}
                        style={{
                          display:'flex',
                          justifyContent:'space-between',
                          alignItems:'center',
                          padding:'12px 16px',
                          background:'rgba(255,255,255,0.05)',
                          border:'1px solid rgba(255,255,255,0.1)',
                          borderRadius:12,
                          transition:'all 0.3s'
                        }}
                      >
                        <div style={{display:'flex', alignItems:'center', gap:10}}>
                          <div style={{fontSize:22}}>{mode.icon}</div>
                          <div style={{fontSize:14, fontWeight:600}}>{mode.name}</div>
                        </div>
                        <div style={{
                          padding:'4px 12px',
                          borderRadius:999,
                          background:config.bg,
                          border:`1px solid ${config.color}`,
                          color:config.color,
                          fontSize:11,
                          fontWeight:700,
                          textTransform:'uppercase'
                        }}>
                          {config.label}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Weather Widget */}
              <div style={{
                background:'linear-gradient(135deg, rgba(59,130,246,0.12) 0%, rgba(15,23,42,0.4) 100%)',
                border:'1px solid rgba(59,130,246,0.3)',
                borderRadius:20,
                padding:'24px',
                backdropFilter:'blur(12px)',
                boxShadow:'0 8px 32px rgba(0,0,0,0.12)'
              }}>
                <div style={{display:'flex', alignItems:'center', gap:12, marginBottom:20}}>
                  <div style={{fontSize:28}}>🌤️</div>
                  <div>
                    <h3 style={{fontSize:18, fontWeight:700, marginBottom:2}}>Current Weather</h3>
                    <p style={{fontSize:12, color:'rgba(148,163,184,0.9)'}}>Auckland CBD conditions</p>
                  </div>
                </div>
                {weather ? (
                  <div>
                    <div style={{display:'flex', alignItems:'center', gap:20, marginBottom:16}}>
                      <div style={{fontSize:64}}>
                        {weather.condition.toLowerCase().includes('rain') ? '🌧️' :
                         weather.condition.toLowerCase().includes('cloud') ? '☁️' :
                         weather.condition.toLowerCase().includes('sun') ? '☀️' : '🌤️'}
                      </div>
                      <div>
                        <div style={{fontSize:48, fontWeight:800}}>{weather.tempC}°C</div>
                        <div style={{fontSize:14, color:'rgba(148,163,184,0.9)', marginTop:4}}>{weather.condition}</div>
                      </div>
                    </div>
                    <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>
                      <div style={{padding:'12px', background:'rgba(255,255,255,0.05)', borderRadius:10}}>
                        <div style={{fontSize:11, color:'rgba(148,163,184,0.8)', marginBottom:4}}>Wind Speed</div>
                        <div style={{fontSize:18, fontWeight:700}}>💨 {weather.windKph} km/h</div>
                      </div>
                      <div style={{padding:'12px', background:'rgba(255,255,255,0.05)', borderRadius:10}}>
                        <div style={{fontSize:11, color:'rgba(148,163,184,0.8)', marginBottom:4}}>Humidity</div>
                        <div style={{fontSize:18, fontWeight:700}}>💧 {weather.humidity || 65}%</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{textAlign:'center', padding:'40px 0', color:'rgba(148,163,184,0.7)'}}>
                    <div style={{fontSize:48, marginBottom:12}}>⏳</div>
                    <div style={{fontSize:14}}>Loading weather data...</div>
                  </div>
                )}
              </div>
            </div>

            {/* Live Departure Board - Full Width */}
            <div style={{
              background:'linear-gradient(135deg, rgba(245,158,11,0.12) 0%, rgba(15,23,42,0.4) 100%)',
              border:'1px solid rgba(245,158,11,0.3)',
              borderRadius:20,
              padding:'24px',
              backdropFilter:'blur(12px)',
              boxShadow:'0 8px 32px rgba(0,0,0,0.12)',
              marginBottom:32
            }}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20}}>
                <div style={{display:'flex', alignItems:'center', gap:12}}>
                  <div style={{fontSize:28}}>🚏</div>
                  <div>
                    <h3 style={{fontSize:18, fontWeight:700, marginBottom:2}}>Live Departure Board</h3>
                    <p style={{fontSize:12, color:'rgba(148,163,184,0.9)'}}>Next departures from nearby stops</p>
                  </div>
                </div>
                <div style={{display:'flex', alignItems:'center', gap:12}}>
                  <div style={{
                    padding:'6px 12px',
                    background:'rgba(16,185,129,0.2)',
                    border:'1px solid rgba(16,185,129,0.4)',
                    borderRadius:8,
                    fontSize:11,
                    fontWeight:600,
                    color:'#10b981',
                    display:'flex',
                    alignItems:'center',
                    gap:6
                  }}>
                    <span style={{
                      width:6,
                      height:6,
                      borderRadius:'50%',
                      background:'#10b981',
                      animation:'pulse 2s infinite'
                    }}></span>
                    LIVE
                  </div>
                  <button
                    onClick={fetchLiveDepartures}
                    disabled={departuresLoading}
                    style={{
                      padding:'6px 12px',
                      background:'rgba(245,158,11,0.2)',
                      border:'1px solid rgba(245,158,11,0.4)',
                      borderRadius:8,
                      color:'#f59e0b',
                      fontSize:11,
                      fontWeight:600,
                      cursor:departuresLoading ? 'not-allowed' : 'pointer',
                      opacity:departuresLoading ? 0.5 : 1
                    }}
                  >
                    {departuresLoading ? '⏳ Refreshing...' : '🔄 Refresh'}
                  </button>
                </div>
              </div>

              {departuresLoading && liveDepartures.length === 0 ? (
                <div style={{textAlign:'center', padding:'40px 0', color:'rgba(148,163,184,0.7)'}}>
                  <div style={{fontSize:48, marginBottom:12}}>🔄</div>
                  <div style={{fontSize:14}}>Loading live departures...</div>
                </div>
              ) : liveDepartures.length === 0 ? (
                <div style={{textAlign:'center', padding:'40px 0', color:'rgba(148,163,184,0.7)'}}>
                  <div style={{fontSize:48, marginBottom:12}}>🚏</div>
                  <div style={{fontSize:14}}>No nearby stops found</div>
                  <div style={{fontSize:12, marginTop:4}}>Try viewing the map to find transit stops</div>
                </div>
              ) : (
                <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(360px, 1fr))', gap:16}}>
                  {liveDepartures.map((stopData, idx) => {
                    const isExpanded = expandedStops[stopData.stopId]
                    const displayDeps = isExpanded ? stopData.departures : stopData.departures.slice(0, 3)
                    
                    const getOccupancyInfo = (occupancy) => {
                      const info = {
                        many_seats: { icon: '💺', label: 'Many seats', color: '#10b981' },
                        seats_available: { icon: '🪑', label: 'Seats available', color: '#3b82f6' },
                        standing_room: { icon: '🧍', label: 'Standing room', color: '#f59e0b' },
                        crowded: { icon: '👥', label: 'Crowded', color: '#ef4444' }
                      }
                      return info[occupancy] || info.seats_available
                    }
                    
                    return (
                      <div
                        key={idx}
                        style={{
                          background:'rgba(255,255,255,0.05)',
                          border:'1px solid rgba(255,255,255,0.15)',
                          borderRadius:16,
                          padding:'16px',
                          transition:'all 0.3s',
                          cursor:'pointer'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
                          e.currentTarget.style.borderColor = 'rgba(245,158,11,0.4)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'
                        }}
                      >
                        <div
                          onClick={() => setExpandedStops(prev => ({...prev, [stopData.stopId]: !prev[stopData.stopId]}))}
                          style={{
                            fontSize:14,
                            fontWeight:700,
                            marginBottom:12,
                            paddingBottom:10,
                            borderBottom:'1px solid rgba(255,255,255,0.1)',
                            display:'flex',
                            alignItems:'center',
                            justifyContent:'space-between',
                            gap:8
                          }}
                        >
                          <div style={{display:'flex', alignItems:'center', gap:8}}>
                            <span style={{fontSize:18}}>📍</span>
                            {stopData.stopName}
                          </div>
                          <div style={{display:'flex', alignItems:'center', gap:8}}>
                            <div style={{fontSize:10, color:'rgba(148,163,184,0.8)', fontWeight:500}}>
                              {stopData.departures.length} services
                            </div>
                            <span style={{fontSize:16, transition:'transform 0.3s', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)'}}>
                              ▼
                            </span>
                          </div>
                        </div>
                        
                        {stopData.departures.length === 0 ? (
                          <div style={{textAlign:'center', padding:'20px 0', color:'rgba(148,163,184,0.6)', fontSize:12}}>
                            No departures scheduled
                          </div>
                        ) : (
                          <div style={{display:'flex', flexDirection:'column', gap:10}}>
                            {displayDeps.map((dep, depIdx) => {
                              const minsUntil = getMinutesUntil(dep.departure_time)
                              const isImmediate = minsUntil !== null && minsUntil <= 5
                              const isDelayed = dep.delay_min && dep.delay_min > 2
                              const occupancyInfo = getOccupancyInfo(dep.occupancy)
                              
                              return (
                                <div
                                  key={depIdx}
                                  style={{
                                    padding:'12px',
                                    background:isImmediate ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.03)',
                                    border:isImmediate ? '1px solid rgba(239,68,68,0.4)' : '1px solid rgba(255,255,255,0.08)',
                                    borderRadius:10,
                                    animation:isImmediate ? 'pulse 2s infinite' : 'none'
                                  }}
                                >
                                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8}}>
                                    <div style={{flex:1}}>
                                      <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:6}}>
                                        <div style={{
                                          padding:'4px 10px',
                                          background:'rgba(245,158,11,0.25)',
                                          border:'1px solid rgba(245,158,11,0.5)',
                                          borderRadius:8,
                                          fontSize:12,
                                          fontWeight:800,
                                          color:'#f59e0b'
                                        }}>
                                          {dep.route || 'N/A'}
                                        </div>
                                        {dep.service_type === 'express' && (
                                          <div style={{
                                            padding:'2px 6px',
                                            background:'rgba(139,92,246,0.2)',
                                            border:'1px solid rgba(139,92,246,0.4)',
                                            borderRadius:4,
                                            fontSize:9,
                                            fontWeight:700,
                                            color:'#a78bfa',
                                            textTransform:'uppercase'
                                          }}>
                                            Express
                                          </div>
                                        )}
                                      </div>
                                      <div style={{fontSize:14, fontWeight:600, marginBottom:4}}>
                                        → {dep.headsign || 'Unknown destination'}
                                      </div>
                                      {isExpanded && (
                                        <div style={{fontSize:11, color:'rgba(148,163,184,0.8)', marginTop:4, display:'flex', flexDirection:'column', gap:3}}>
                                          <div>🚏 {dep.platform || 'Platform TBA'}</div>
                                          <div>🚌 {dep.vehicle_type || 'Standard'}</div>
                                          <div style={{display:'flex', alignItems:'center', gap:4}}>
                                            <span>{occupancyInfo.icon}</span>
                                            <span style={{color:occupancyInfo.color}}>{occupancyInfo.label}</span>
                                          </div>
                                          {dep.accessible && <div>♿ Wheelchair accessible</div>}
                                        </div>
                                      )}
                                    </div>
                                    <div style={{textAlign:'right'}}>
                                      {minsUntil !== null ? (
                                        <>
                                          <div style={{
                                            fontSize:minsUntil <= 5 ? 22 : 20,
                                            fontWeight:800,
                                            color:minsUntil <= 2 ? '#ef4444' : minsUntil <= 5 ? '#f59e0b' : '#fff'
                                          }}>
                                            {minsUntil <= 0 ? 'NOW' : `${minsUntil}m`}
                                          </div>
                                          <div style={{fontSize:10, color:'rgba(148,163,184,0.7)', marginTop:2}}>
                                            {new Date(dep.departure_time).toLocaleTimeString([], {hour:'numeric', minute:'2-digit'})}
                                          </div>
                                        </>
                                      ) : (
                                        <div style={{fontSize:13, color:'rgba(148,163,184,0.8)'}}>
                                          {dep.departure_time ? new Date(dep.departure_time).toLocaleTimeString([], {hour:'numeric', minute:'2-digit'}) : 'N/A'}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  {isDelayed && (
                                    <div style={{
                                      fontSize:10,
                                      color:'#ef4444',
                                      fontWeight:600,
                                      padding:'4px 8px',
                                      background:'rgba(239,68,68,0.1)',
                                      borderRadius:6,
                                      marginTop:6
                                    }}>
                                      ⚠️ Delayed {dep.delay_min} min · Scheduled {new Date(dep.scheduled_time).toLocaleTimeString([], {hour:'numeric', minute:'2-digit'})}
                                    </div>
                                  )}
                                  {isExpanded && dep.realtime && (
                                    <div style={{
                                      fontSize:9,
                                      color:'rgba(16,185,129,0.9)',
                                      fontWeight:600,
                                      marginTop:6,
                                      display:'flex',
                                      alignItems:'center',
                                      gap:4
                                    }}>
                                      <span style={{
                                        width:6,
                                        height:6,
                                        borderRadius:'50%',
                                        background:'#10b981',
                                        animation:'pulse 2s infinite'
                                      }}></span>
                                      REAL-TIME DATA
                                    </div>
                                  )}
                                </div>
                              )
                            })}
                            {!isExpanded && stopData.departures.length > 3 && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setExpandedStops(prev => ({...prev, [stopData.stopId]: true}))
                                }}
                                style={{
                                  padding:'8px',
                                  background:'rgba(245,158,11,0.15)',
                                  border:'1px solid rgba(245,158,11,0.3)',
                                  borderRadius:8,
                                  color:'#f59e0b',
                                  fontSize:11,
                                  fontWeight:600,
                                  cursor:'pointer',
                                  transition:'all 0.3s'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = 'rgba(245,158,11,0.25)'
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = 'rgba(245,158,11,0.15)'
                                }}
                              >
                                Show {stopData.departures.length - 3} more departures ↓
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Second Row: Quick Shortcuts & Recent Activity */}
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:24}}>
              
              {/* Quick Trip Shortcuts */}
              <div style={{
                background:'linear-gradient(135deg, rgba(139,92,246,0.12) 0%, rgba(15,23,42,0.4) 100%)',
                border:'1px solid rgba(139,92,246,0.3)',
                borderRadius:20,
                padding:'24px',
                backdropFilter:'blur(12px)',
                boxShadow:'0 8px 32px rgba(0,0,0,0.12)'
              }}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20}}>
                  <div style={{display:'flex', alignItems:'center', gap:12}}>
                    <div style={{fontSize:28}}>⚡</div>
                    <div>
                      <h3 style={{fontSize:18, fontWeight:700, marginBottom:2}}>Quick Shortcuts</h3>
                      <p style={{fontSize:12, color:'rgba(148,163,184,0.9)'}}>Your saved routes</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setView('plan')}
                    style={{
                      padding:'6px 12px',
                      background:'rgba(139,92,246,0.2)',
                      border:'1px solid rgba(139,92,246,0.4)',
                      borderRadius:8,
                      color:'#a78bfa',
                      fontSize:11,
                      fontWeight:600,
                      cursor:'pointer'
                    }}
                  >
                    + Add
                  </button>
                </div>
                <div style={{display:'flex', flexDirection:'column', gap:10}}>
                  {quickShortcuts.length > 0 ? quickShortcuts.map((shortcut) => (
                    <button
                      key={shortcut.id}
                      onClick={() => {
                        setOrigin(shortcut.origin)
                        setDest(shortcut.dest)
                        setView('plan')
                        addActivity({ type: 'shortcut', name: shortcut.name })
                      }}
                      style={{
                        display:'flex',
                        alignItems:'center',
                        gap:12,
                        padding:'14px 16px',
                        background:'rgba(255,255,255,0.05)',
                        border:'1px solid rgba(255,255,255,0.1)',
                        borderRadius:12,
                        cursor:'pointer',
                        transition:'all 0.3s',
                        textAlign:'left',
                        color:'#fff'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(139,92,246,0.2)'
                        e.currentTarget.style.borderColor = 'rgba(139,92,246,0.5)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
                      }}
                    >
                      <div style={{fontSize:28}}>{shortcut.icon}</div>
                      <div style={{flex:1}}>
                        <div style={{fontSize:14, fontWeight:600}}>{shortcut.name}</div>
                        <div style={{fontSize:11, color:'rgba(148,163,184,0.8)', marginTop:2}}>Tap to plan route</div>
                      </div>
                      <div style={{fontSize:20, opacity:0.6}}>→</div>
                    </button>
                  )) : (
                    <div style={{textAlign:'center', padding:'30px 0', color:'rgba(148,163,184,0.7)'}}>
                      <div style={{fontSize:36, marginBottom:8}}>📍</div>
                      <div style={{fontSize:13}}>No shortcuts saved yet</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Activity */}
              <div style={{
                background:'linear-gradient(135deg, rgba(236,72,153,0.12) 0%, rgba(15,23,42,0.4) 100%)',
                border:'1px solid rgba(236,72,153,0.3)',
                borderRadius:20,
                padding:'24px',
                backdropFilter:'blur(12px)',
                boxShadow:'0 8px 32px rgba(0,0,0,0.12)'
              }}>
                <div style={{display:'flex', alignItems:'center', gap:12, marginBottom:20}}>
                  <div style={{fontSize:28}}>📋</div>
                  <div>
                    <h3 style={{fontSize:18, fontWeight:700, marginBottom:2}}>Recent Activity</h3>
                    <p style={{fontSize:12, color:'rgba(148,163,184,0.9)'}}>Your latest actions</p>
                  </div>
                </div>
                <div style={{display:'flex', flexDirection:'column', gap:10}}>
                  {recentActivity.length > 0 ? recentActivity.map((activity) => {
                    const activityIcons = {
                      shortcut: '⚡',
                      plan: '🗺️',
                      view: '👀',
                      export: '📄',
                      alert: '⚠️'
                    }
                    return (
                      <div
                        key={activity.id}
                        style={{
                          padding:'12px 16px',
                          background:'rgba(255,255,255,0.05)',
                          border:'1px solid rgba(255,255,255,0.1)',
                          borderRadius:12
                        }}
                      >
                        <div style={{display:'flex', alignItems:'center', gap:10}}>
                          <div style={{fontSize:20}}>{activityIcons[activity.type] || '📌'}</div>
                          <div style={{flex:1}}>
                            <div style={{fontSize:13, fontWeight:600}}>{activity.name}</div>
                            <div style={{fontSize:11, color:'rgba(148,163,184,0.7)', marginTop:2}}>
                              {getRelativeTime(activity.timestamp)}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  }) : (
                    <div style={{textAlign:'center', padding:'30px 0', color:'rgba(148,163,184,0.7)'}}>
                      <div style={{fontSize:36, marginBottom:8}}>🕐</div>
                      <div style={{fontSize:13}}>No recent activity</div>
                    </div>
                  )}
                </div>
              </div>
            </div>

          </>
        )}

        {view === 'map' && (
          <div>
            <h2 className="section-title">🌍 Interactive Map</h2>
          <FeatureCard icon="🗺️" title="Map View" description="Drag origin marker, click map to set destination, view nearby stops">
            <div style={{height:450, width:'100%', borderRadius:16, overflow:'hidden', boxShadow:'0 8px 24px rgba(0,0,0,0.12)'}}>
              <InteractiveMap 
                origin={origin} 
                setOrigin={setOrigin} 
                dest={dest} 
                setDest={setDest} 
                stops={stops} 
                trafficIncidents={trafficIncidents}
                lastUpdate={lastTrafficUpdate ? getRelativeTime(lastTrafficUpdate) : null}
                onRefresh={refreshTrafficData}
              />
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
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6}}>
                  <div style={{fontWeight:600}}>{text.alertsIncidents}</div>
                  {lastTrafficUpdate && (
                    <span style={{fontSize:11, color:'rgba(100,116,139,0.9)', background:'rgba(148,163,184,0.12)', padding:'4px 8px', borderRadius:999}}>
                      Updated {getRelativeTime(lastTrafficUpdate)}
                    </span>
                  )}
                </div>
                {alerts.length === 0 ? (
                  <div style={{opacity:0.7, fontSize:13}}>{text.noAlerts}</div>
                ) : (
                  <div style={{display:'flex', flexDirection:'column', gap:12}}>
                    {alerts.slice(0,6).map((a,i) => {
                      const key = a.id || `alert-${i}`
                      const icon = getAlertIcon(a.type || a.category || a.source)
                      const severityInfo = getSeverityAppearance(a.severity || 'info')
                      const headline = a.title || a.summary || 'Service alert'
                      const sublineParts = []
                      if (a.type) sublineParts.push(`${a.type}`)
                      if (a.location) sublineParts.push(a.location)
                      const subline = sublineParts.join(' • ')
                      const timeWindow = formatAlertWindow(a.start_time, a.end_time)
                      const chips = [
                        timeWindow ? `⏱️ ${timeWindow}` : null,
                        a.expected_delay_min ? `⏳ ~${a.expected_delay_min} min delay` : null,
                        Array.isArray(a.affected_routes) && a.affected_routes.length ? `🚌 Routes: ${a.affected_routes.slice(0,4).join(', ')}` : null,
                        Array.isArray(a.affected_modes) && a.affected_modes.length ? `🚈 Modes: ${a.affected_modes.join(', ')}` : null,
                      ].filter(Boolean)
                      return (
                        <div
                          key={key}
                          style={{
                            background:'linear-gradient(135deg, rgba(15,23,42,0.05) 0%, rgba(15,23,42,0.08) 100%)',
                            border:'1px solid rgba(148,163,184,0.24)',
                            borderRadius:12,
                            padding:'12px 14px',
                            boxShadow:'0 6px 18px rgba(15,23,42,0.12)',
                            backdropFilter:'blur(6px)'
                          }}
                        >
                          <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:12}}>
                            <div style={{display:'flex', gap:12}}>
                              <div style={{fontSize:24, filter:'drop-shadow(0 4px 6px rgba(15,23,42,0.12))'}}>{icon}</div>
                              <div>
                                <div style={{fontWeight:700, fontSize:15}}>{headline}</div>
                                {subline && (
                                  <div style={{fontSize:12, color:'rgba(100,116,139,0.9)', textTransform:'capitalize'}}>
                                    {subline}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div style={{
                              background: severityInfo.bg,
                              color: severityInfo.color,
                              border:`1px solid ${severityInfo.color}33`,
                              padding:'4px 10px',
                              borderRadius:999,
                              fontSize:11,
                              fontWeight:700,
                              textTransform:'uppercase'
                            }}>
                              {(severityInfo.label || (a.severity || 'Info')).toString()
                                .replace(/_/g,' ')}
                            </div>
                          </div>
                          {(a.impact || a.description || a.summary) && (
                            <div style={{marginTop:8, fontSize:13, color:'rgba(15,23,42,0.82)', lineHeight:1.5}}>
                              {a.impact || a.description || a.summary}
                            </div>
                          )}
                          {chips.length > 0 && (
                            <div style={{marginTop:10, display:'flex', gap:8, flexWrap:'wrap'}}>
                              {chips.map((chip, idx) => (
                                <span
                                  key={`${key}-chip-${idx}`}
                                  style={{
                                    background:'rgba(255,255,255,0.6)',
                                    border:'1px solid rgba(148,163,184,0.25)',
                                    borderRadius:999,
                                    padding:'4px 10px',
                                    fontSize:11,
                                    fontWeight:600,
                                    color:'rgba(71,85,105,0.95)'
                                  }}
                                >
                                  {chip}
                                </span>
                              ))}
                            </div>
                          )}
                          {a.advice && (
                            <div style={{
                              marginTop:10,
                              padding:'10px 12px',
                              background:'rgba(59,130,246,0.12)',
                              borderRadius:10,
                              border:'1px solid rgba(59,130,246,0.25)',
                              fontSize:12,
                              color:'rgba(37,99,235,0.95)'
                            }}>
                              <strong>Traveler tip:</strong> {a.advice}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
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
                                <div style={{fontSize:16, fontWeight:700}}>
                                  {it.environmental ? 
                                    `${it.environmental.co2_saved_kg.toFixed(2)} kg` : 
                                    `${(it.durationMin * 0.05).toFixed(1)} kg`}
                                </div>
                                {it.environmental && (
                                  <div style={{fontSize:10, opacity:0.5, marginTop:2}}>
                                    {it.environmental.co2_saved_percent.toFixed(0)}% vs car
                                  </div>
                                )}
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

                            {/* MCDA Score Breakdown - Assessment Feature */}
                            {it.mcda_score && (
                              <div style={{
                                marginTop:20,
                                padding:16,
                                background:'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(219, 39, 119, 0.1) 100%)',
                                border:'2px solid rgba(139, 92, 246, 0.3)',
                                borderRadius:12
                              }}>
                                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12}}>
                                  <div style={{fontSize:14, fontWeight:700, color:'#a78bfa'}}>
                                    🏆 Multi-Criteria Decision Score (MCDA)
                                  </div>
                                  <div style={{
                                    fontSize:24,
                                    fontWeight:700,
                                    color: it.mcda_score >= 85 ? '#10b981' : it.mcda_score >= 70 ? '#3b82f6' : '#f59e0b',
                                    display:'flex',
                                    alignItems:'center',
                                    gap:6
                                  }}>
                                    {it.mcda_score.toFixed(1)}/100
                                    {it.mcda_rank && <span style={{fontSize:14, opacity:0.7}}>#{it.mcda_rank}</span>}
                                  </div>
                                </div>

                                {it.mcda_recommendation && (
                                  <div style={{
                                    fontSize:12,
                                    padding:'8px 12px',
                                    background:'rgba(139, 92, 246, 0.15)',
                                    borderRadius:8,
                                    marginBottom:12,
                                    color:'rgba(255,255,255,0.9)'
                                  }}>
                                    {it.mcda_recommendation}
                                  </div>
                                )}

                                {it.mcda_breakdown && (
                                  <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(120px, 1fr))', gap:10}}>
                                    {Object.entries(it.mcda_breakdown).map(([criterion, score]) => (
                                      <div key={criterion} style={{
                                        padding:10,
                                        background:'rgba(0,0,0,0.2)',
                                        borderRadius:8,
                                        border:'1px solid rgba(255,255,255,0.1)'
                                      }}>
                                        <div style={{fontSize:10, opacity:0.6, marginBottom:4, textTransform:'capitalize'}}>
                                          {criterion === 'time' ? '⏱️' : 
                                           criterion === 'cost' ? '💰' :
                                           criterion === 'comfort' ? '🛋️' :
                                           criterion === 'reliability' ? '✓' :
                                           '🌱'} {criterion}
                                        </div>
                                        <div style={{fontSize:14, fontWeight:700, color: score >= 80 ? '#10b981' : score >= 60 ? '#3b82f6' : '#f59e0b'}}>
                                          {score.toFixed(0)}/100
                                        </div>
                                        <div style={{
                                          width:'100%',
                                          height:4,
                                          background:'rgba(255,255,255,0.1)',
                                          borderRadius:2,
                                          marginTop:4,
                                          overflow:'hidden'
                                        }}>
                                          <div style={{
                                            width:`${score}%`,
                                            height:'100%',
                                            background: score >= 80 ? '#10b981' : score >= 60 ? '#3b82f6' : '#f59e0b',
                                            borderRadius:2
                                          }} />
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {it.mcda_weights && (
                                  <div style={{fontSize:10, opacity:0.5, marginTop:8}}>
                                    Weights: {Object.entries(it.mcda_weights).map(([k,v]) => `${k} ${(v*100).toFixed(0)}%`).join(' • ')}
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Environmental Impact Details - Assessment Feature */}
                            {it.environmental && (
                              <div style={{
                                marginTop:20,
                                padding:16,
                                background:'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(52, 211, 153, 0.1) 100%)',
                                border:'2px solid rgba(16, 185, 129, 0.3)',
                                borderRadius:12
                              }}>
                                <div style={{fontSize:14, fontWeight:700, color:'#10b981', marginBottom:12}}>
                                  🌍 Environmental Impact Analysis
                                </div>

                                <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(150px, 1fr))', gap:12, marginBottom:12}}>
                                  <div style={{padding:12, background:'rgba(16, 185, 129, 0.1)', borderRadius:8}}>
                                    <div style={{fontSize:11, opacity:0.7, marginBottom:4}}>CO₂ Emissions</div>
                                    <div style={{fontSize:18, fontWeight:700, color:'#10b981'}}>
                                      {it.environmental.total_co2_kg.toFixed(2)} kg
                                    </div>
                                  </div>

                                  <div style={{padding:12, background:'rgba(16, 185, 129, 0.1)', borderRadius:8}}>
                                    <div style={{fontSize:11, opacity:0.7, marginBottom:4}}>CO₂ Saved vs Car</div>
                                    <div style={{fontSize:18, fontWeight:700, color:'#10b981'}}>
                                      {it.environmental.co2_saved_kg.toFixed(2)} kg
                                    </div>
                                    <div style={{fontSize:10, opacity:0.6, marginTop:2}}>
                                      {it.environmental.co2_saved_percent.toFixed(0)}% reduction
                                    </div>
                                  </div>

                                  <div style={{padding:12, background:'rgba(16, 185, 129, 0.1)', borderRadius:8}}>
                                    <div style={{fontSize:11, opacity:0.7, marginBottom:4}}>Distance</div>
                                    <div style={{fontSize:18, fontWeight:700, color:'#10b981'}}>
                                      {it.environmental.total_distance_km.toFixed(1)} km
                                    </div>
                                  </div>

                                  <div style={{padding:12, background:'rgba(16, 185, 129, 0.1)', borderRadius:8}}>
                                    <div style={{fontSize:11, opacity:0.7, marginBottom:4}}>Trees to Offset</div>
                                    <div style={{fontSize:18, fontWeight:700, color:'#10b981'}}>
                                      {it.environmental.trees_equivalent.toFixed(2)} 🌳
                                    </div>
                                  </div>
                                </div>

                                {it.environmental.legs && it.environmental.legs.length > 0 && (
                                  <div style={{marginTop:12}}>
                                    <div style={{fontSize:12, fontWeight:600, marginBottom:8, opacity:0.8}}>
                                      Emissions by Leg:
                                    </div>
                                    <div style={{display:'flex', flexDirection:'column', gap:6}}>
                                      {it.environmental.legs.map((leg, idx) => (
                                        <div key={idx} style={{
                                          display:'flex',
                                          justifyContent:'space-between',
                                          padding:'8px 12px',
                                          background:'rgba(0,0,0,0.2)',
                                          borderRadius:6,
                                          fontSize:11
                                        }}>
                                          <span>{leg.mode} ({leg.distance_km.toFixed(1)} km)</span>
                                          <span style={{fontWeight:600, color:'#10b981'}}>
                                            {leg.co2_kg.toFixed(3)} kg CO₂
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                <div style={{
                                  marginTop:12,
                                  padding:'10px 12px',
                                  background:'rgba(16, 185, 129, 0.15)',
                                  borderRadius:8,
                                  fontSize:12
                                }}>
                                  💡 <b>Eco-Score:</b> {it.environmental.eco_score ? 
                                    `${it.environmental.eco_score}/100` : 
                                    'Excellent choice for the environment!'
                                  }
                                  {it.environmental.co2_saved_percent >= 70 && 
                                    " - You're making a significant positive impact! 🌟"
                                  }
                                </div>
                              </div>
                            )}
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
            
          {/* MFA Security Settings */}
          <FeatureCard icon="🔐" title="Multi-Factor Authentication (MFA)" description="Add an extra layer of security to your account with TOTP authenticator apps.">
            <div style={{display:'flex', flexDirection:'column', gap:20}}>
              
              {/* MFA Status */}
              <div style={{
                padding:16,
                background: mfaEnabled ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                border: `1px solid ${mfaEnabled ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)'}`,
                borderRadius:12,
                display:'flex',
                justifyContent:'space-between',
                alignItems:'center',
                flexWrap:'wrap',
                gap:12
              }}>
                <div>
                  <div style={{fontWeight:700, fontSize:16, marginBottom:4}}>
                    {mfaEnabled ? '✅ MFA Enabled' : '⚠️ MFA Disabled'}
                  </div>
                  <div style={{fontSize:13, opacity:0.85}}>
                    {mfaEnabled 
                      ? 'Your account is protected with two-factor authentication' 
                      : 'Enable MFA for enhanced security'}
                  </div>
                </div>
                <button
                  onClick={mfaEnabled ? disableMfa : startMfaSetup}
                  className="btn"
                  style={{
                    background: mfaEnabled ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)',
                    color: mfaEnabled ? '#ef4444' : '#10b981',
                    border: `1px solid ${mfaEnabled ? 'rgba(239,68,68,0.4)' : 'rgba(16,185,129,0.4)'}`
                  }}
                  disabled={mfaLoading}
                >
                  {mfaLoading ? '⏳ Loading...' : (mfaEnabled ? 'Disable MFA' : 'Enable MFA')}
                </button>
              </div>

              {/* MFA Setup (shown when starting setup) */}
              {mfaQrCode && (
                <div style={{
                  padding:20,
                  background:'rgba(255,255,255,0.05)',
                  border:'1px solid rgba(148,163,184,0.2)',
                  borderRadius:16
                }}>
                  <h3 style={{fontSize:16, fontWeight:700, marginBottom:16}}>📱 Setup Instructions</h3>
                  
                  <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:24, alignItems:'start'}}>
                    {/* QR Code */}
                    <div>
                      <div style={{fontWeight:600, marginBottom:12}}>1. Scan QR Code</div>
                      <div style={{
                        background:'#fff',
                        padding:16,
                        borderRadius:12,
                        display:'inline-block'
                      }}>
                        <img src={mfaQrCode} alt="MFA QR Code" style={{width:200, height:200, display:'block'}} />
                      </div>
                      <div style={{fontSize:11, opacity:0.7, marginTop:8}}>
                        Open your authenticator app and scan this code
                      </div>
                    </div>

                    {/* Manual Entry & Verification */}
                    <div>
                      <div style={{marginBottom:16}}>
                        <div style={{fontWeight:600, marginBottom:8}}>2. Or Enter Manually</div>
                        <div style={{
                          padding:12,
                          background:'rgba(0,0,0,0.3)',
                          borderRadius:8,
                          fontFamily:'monospace',
                          fontSize:13,
                          wordBreak:'break-all',
                          userSelect:'all'
                        }}>
                          {mfaSecret}
                        </div>
                      </div>

                      <div>
                        <div style={{fontWeight:600, marginBottom:8}}>3. Enter Code to Verify</div>
                        <input
                          type="text"
                          placeholder="Enter 6-digit code"
                          value={mfaSetupCode}
                          onChange={e => setMfaSetupCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          style={{
                            width:'100%',
                            textAlign:'center',
                            fontSize:20,
                            letterSpacing:8,
                            fontWeight:700,
                            fontFamily:'monospace',
                            marginBottom:12
                          }}
                          maxLength={6}
                          disabled={mfaLoading}
                        />
                        <button
                          onClick={enableMfa}
                          className="btn btn-primary"
                          style={{width:'100%'}}
                          disabled={mfaLoading || mfaSetupCode.length !== 6}
                        >
                          {mfaLoading ? '⏳ Verifying...' : '✅ Enable MFA'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Supported Apps */}
                  <div style={{
                    marginTop:20,
                    padding:12,
                    background:'rgba(59,130,246,0.1)',
                    border:'1px solid rgba(59,130,246,0.3)',
                    borderRadius:8,
                    fontSize:12
                  }}>
                    <div style={{fontWeight:600, marginBottom:6}}>✨ Supported Authenticator Apps:</div>
                    <div style={{opacity:0.9}}>
                      • Google Authenticator • Microsoft Authenticator • Authy • 1Password • Bitwarden
                    </div>
                  </div>
                </div>
              )}

              {/* Messages */}
              {mfaError && (
                <div style={{
                  padding:12,
                  background:'rgba(239,68,68,0.1)',
                  border:'1px solid rgba(239,68,68,0.3)',
                  borderRadius:8,
                  color:'#ef4444',
                  fontSize:13
                }}>
                  ⚠️ {mfaError}
                </div>
              )}
              
              {mfaSuccess && (
                <div style={{
                  padding:12,
                  background:'rgba(16,185,129,0.1)',
                  border:'1px solid rgba(16,185,129,0.3)',
                  borderRadius:8,
                  color:'#10b981',
                  fontSize:13
                }}>
                  ✅ {mfaSuccess}
                </div>
              )}

              {/* Info Section */}
              {!mfaQrCode && (
                <div style={{fontSize:13, opacity:0.8, lineHeight:1.6}}>
                  <div style={{fontWeight:600, marginBottom:8}}>ℹ️ About MFA:</div>
                  <ul style={{margin:0, paddingLeft:20}}>
                    <li>Works 100% offline - no internet required after setup</li>
                    <li>Uses TOTP (Time-based One-Time Password) standard</li>
                    <li>Generates new 6-digit codes every 30 seconds</li>
                    <li>Significantly improves account security</li>
                  </ul>
                </div>
              )}
            </div>
          </FeatureCard>

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

        {/* Analytics removed per user request */}
        {false && view === 'analytics' && (
          <div>
            <h2 className="section-title">📊 System Analytics Dashboard</h2>
            <div style={{
              padding:'16px 20px',
              background:'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)',
              borderRadius:12,
              border:'1px solid rgba(59, 130, 246, 0.3)',
              marginBottom:24
            }}>
              <div style={{fontSize:14}}>
                <b>🎓 Assessment Feature:</b> Analytics dashboard tracks system usage, environmental impact, and performance metrics for research and evaluation purposes.
              </div>
            </div>

            {analyticsData ? (
              <>
                {/* Summary Stats Grid */}
                <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:16, marginBottom:32}}>
                  <div style={{padding:20, background:'var(--glass-bg)', backdropFilter:'blur(10px)', borderRadius:12, border:'1px solid var(--glass-border)'}}>
                    <div style={{fontSize:12, opacity:0.7, marginBottom:6}}>Total Trips Planned</div>
                    <div style={{fontSize:32, fontWeight:700, color:'#3b82f6'}}>{analyticsData.total_trips || 0}</div>
                  </div>

                  <div style={{padding:20, background:'var(--glass-bg)', backdropFilter:'blur(10px)', borderRadius:12, border:'1px solid var(--glass-border)'}}>
                    <div style={{fontSize:12, opacity:0.7, marginBottom:6}}>Active Users (7d)</div>
                    <div style={{fontSize:32, fontWeight:700, color:'#8b5cf6'}}>{analyticsData.active_users_7d || 0}</div>
                  </div>

                  <div style={{padding:20, background:'var(--glass-bg)', backdropFilter:'blur(10px)', borderRadius:12, border:'1px solid var(--glass-border)'}}>
                    <div style={{fontSize:12, opacity:0.7, marginBottom:6}}>CO₂ Saved (kg)</div>
                    <div style={{fontSize:32, fontWeight:700, color:'#10b981'}}>{analyticsData.total_co2_saved_kg?.toFixed(1) || 0}</div>
                    <div style={{fontSize:11, opacity:0.6, marginTop:4}}>vs driving alone</div>
                  </div>

                  <div style={{padding:20, background:'var(--glass-bg)', backdropFilter:'blur(10px)', borderRadius:12, border:'1px solid var(--glass-border)'}}>
                    <div style={{fontSize:12, opacity:0.7, marginBottom:6}}>Avg MCDA Score</div>
                    <div style={{fontSize:32, fontWeight:700, color:'#f59e0b'}}>{analyticsData.avg_mcda_score?.toFixed(1) || 0}</div>
                    <div style={{fontSize:11, opacity:0.6, marginTop:4}}>out of 100</div>
                  </div>
                </div>

                {/* Performance Metrics */}
                <FeatureCard icon="📈" title="System Performance" description="Route quality and user satisfaction metrics">
                  <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(220px, 1fr))', gap:20}}>
                    <div>
                      <div style={{fontWeight:600, marginBottom:8}}>Trip Metrics</div>
                      <div style={{display:'flex', flexDirection:'column', gap:8}}>
                        <div style={{display:'flex', justifyContent:'space-between'}}>
                          <span style={{opacity:0.7}}>Avg Duration:</span>
                          <strong>{analyticsData.avg_duration_min?.toFixed(1) || 0} min</strong>
                        </div>
                        <div style={{display:'flex', justifyContent:'space-between'}}>
                          <span style={{opacity:0.7}}>Avg Transfers:</span>
                          <strong>{analyticsData.avg_transfers?.toFixed(1) || 0}</strong>
                        </div>
                        <div style={{display:'flex', justifyContent:'space-between'}}>
                          <span style={{opacity:0.7}}>Total Distance:</span>
                          <strong>{analyticsData.total_distance_km?.toFixed(1) || 0} km</strong>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div style={{fontWeight:600, marginBottom:8}}>Environmental Impact</div>
                      <div style={{display:'flex', flexDirection:'column', gap:8}}>
                        <div style={{display:'flex', justifyContent:'space-between'}}>
                          <span style={{opacity:0.7}}>Car Trips Avoided:</span>
                          <strong style={{color:'#10b981'}}>{analyticsData.car_trips_avoided || 0}</strong>
                        </div>
                        <div style={{display:'flex', justifyContent:'space-between'}}>
                          <span style={{opacity:0.7}}>Total CO₂ Saved:</span>
                          <strong style={{color:'#10b981'}}>{analyticsData.total_co2_saved_kg?.toFixed(2) || 0} kg</strong>
                        </div>
                        <div style={{display:'flex', justifyContent:'space-between'}}>
                          <span style={{opacity:0.7}}>Avg per Trip:</span>
                          <strong style={{color:'#10b981'}}>
                            {(analyticsData.total_co2_saved_kg / Math.max(analyticsData.total_trips, 1))?.toFixed(2) || 0} kg
                          </strong>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div style={{fontWeight:600, marginBottom:8}}>System Health</div>
                      <div style={{display:'flex', flexDirection:'column', gap:8}}>
                        <div style={{display:'flex', justifyContent:'space-between'}}>
                          <span style={{opacity:0.7}}>Total Users:</span>
                          <strong>{analyticsData.total_users || 0}</strong>
                        </div>
                        <div style={{display:'flex', justifyContent:'space-between'}}>
                          <span style={{opacity:0.7}}>Total Searches:</span>
                          <strong>{analyticsData.total_searches || 0}</strong>
                        </div>
                        <div style={{display:'flex', justifyContent:'space-between'}}>
                          <span style={{opacity:0.7}}>Uptime:</span>
                          <strong>{analyticsData.system_uptime_days?.toFixed(1) || 0} days</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                </FeatureCard>

                {/* MCDA Insights */}
                <FeatureCard icon="🏆" title="Multi-Criteria Decision Analysis" description="Route scoring breakdown across all trips">
                  <div style={{padding:16, background:'rgba(139, 92, 246, 0.1)', borderRadius:8}}>
                    <div style={{fontSize:14, marginBottom:12}}>
                      Average MCDA score of <strong style={{color:'#8b5cf6'}}>{analyticsData.avg_mcda_score?.toFixed(1)}/100</strong> indicates{' '}
                      {analyticsData.avg_mcda_score >= 80 ? 'excellent' : 
                       analyticsData.avg_mcda_score >= 65 ? 'good' : 
                       'acceptable'} route quality across all planned trips.
                    </div>
                    <div style={{fontSize:12, opacity:0.7}}>
                      💡 MCDA considers time, cost, comfort, reliability, and environmental factors to rank route options.
                    </div>
                  </div>
                </FeatureCard>

                {/* Environmental Summary */}
                <FeatureCard icon="🌍" title="Environmental Impact Summary" description="Cumulative sustainability metrics">
                  <div style={{padding:20, background:'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(52, 211, 153, 0.1) 100%)', borderRadius:12, border:'1px solid rgba(16, 185, 129, 0.3)'}}>
                    <div style={{fontSize:18, fontWeight:700, marginBottom:12, color:'#10b981'}}>
                      🌟 Total CO₂ Savings: {analyticsData.total_co2_saved_kg?.toFixed(2) || 0} kg
                    </div>
                    <div style={{fontSize:14, opacity:0.9, marginBottom:16}}>
                      By using public transport instead of driving, users have collectively saved{' '}
                      <strong style={{color:'#10b981'}}>{analyticsData.total_co2_saved_kg?.toFixed(2) || 0} kg of CO₂</strong> emissions.
                    </div>
                    <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:12}}>
                      <div style={{padding:12, background:'rgba(16, 185, 129, 0.15)', borderRadius:8}}>
                        <div style={{fontSize:12, opacity:0.7}}>Equivalent Trees</div>
                        <div style={{fontSize:24, fontWeight:700, color:'#10b981'}}>
                          {((analyticsData.total_co2_saved_kg / 1000) * 45.9)?.toFixed(1) || 0} 🌳
                        </div>
                        <div style={{fontSize:10, opacity:0.6, marginTop:4}}>needed to offset emissions</div>
                      </div>

                      <div style={{padding:12, background:'rgba(16, 185, 129, 0.15)', borderRadius:8}}>
                        <div style={{fontSize:12, opacity:0.7}}>Car Trips Avoided</div>
                        <div style={{fontSize:24, fontWeight:700, color:'#10b981'}}>
                          {analyticsData.car_trips_avoided || 0}
                        </div>
                        <div style={{fontSize:10, opacity:0.6, marginTop:4}}>reduced congestion</div>
                      </div>

                      <div style={{padding:12, background:'rgba(16, 185, 129, 0.15)', borderRadius:8}}>
                        <div style={{fontSize:12, opacity:0.7}}>Distance Traveled</div>
                        <div style={{fontSize:24, fontWeight:700, color:'#10b981'}}>
                          {analyticsData.total_distance_km?.toFixed(1) || 0} km
                        </div>
                        <div style={{fontSize:10, opacity:0.6, marginTop:4}}>via public transport</div>
                      </div>
                    </div>
                  </div>
                </FeatureCard>

                <div style={{marginTop:20, padding:16, background:'rgba(59, 130, 246, 0.1)', borderRadius:8, fontSize:13, opacity:0.8}}>
                  ℹ️ <b>Note:</b> Analytics data is tracked for research and assessment purposes. All metrics are calculated based on actual trip planning data.
                </div>
              </>
            ) : (
              <div style={{textAlign:'center', padding:60}}>
                <div style={{fontSize:48, marginBottom:16}}>📊</div>
                <div style={{fontSize:16, opacity:0.7, marginBottom:12}}>Loading analytics data...</div>
                <div style={{fontSize:14, opacity:0.5}}>Plan some trips to see analytics!</div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}
