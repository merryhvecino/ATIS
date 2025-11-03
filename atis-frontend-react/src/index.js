import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { registerSW } from './sw-register'

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(<App />)

// Register service worker for offline capability
registerSW()
