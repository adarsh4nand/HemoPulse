import { useState } from 'react'
import DonorForm from './components/DonorForm'
import Inventory from './components/Inventory'
import Chatbot from './components/Chatbot'
import EmergencySOS from './components/EmergencySOS'
import Dashboard from './components/Dashboard'
import './App.css'

function App() {
  const [tab, setTab] = useState('dashboard') // Default to the new Dashboard!
  
  return (
    <div className="app">
      <header className="header">
        <h1>🩸 HemoPulse</h1>
        <nav>
          <button className={tab === 'dashboard' ? 'active' : ''} onClick={() => setTab('dashboard')}>Dashboard</button>
          <button className={tab === 'donor' ? 'active' : ''} onClick={() => setTab('donor')}>Donor Registration</button>
          <button className={tab === 'inventory' ? 'active' : ''} onClick={() => setTab('inventory')}>Inventory</button>
          <button className={tab === 'sos' ? 'active' : ''} onClick={() => setTab('sos')}>🚨 SOS</button>
          <button className={tab === 'chat' ? 'active' : ''} onClick={() => setTab('chat')}>NLP Assistant</button>
        </nav>
      </header>
      <main>
        {tab === 'dashboard' ? <Dashboard /> : 
         tab === 'donor' ? <DonorForm /> : 
         tab === 'inventory' ? <Inventory /> : 
         tab === 'sos' ? <EmergencySOS /> : <Chatbot />}
      </main>
    </div>
  )
}
export default App