import { useState } from 'react'

const API = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000'

function EmergencySOS() {
  const [bloodGroup, setBloodGroup] = useState('O+')
  const [message, setMessage] = useState('')
  const [type, setType] = useState('')
  const [loading, setLoading] = useState(false)

  const sendAlert = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    
    try {
      const res = await fetch(`${API}/api/sos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blood_group: bloodGroup })
      })
      const data = await res.json()
      setMessage(data.message)
      setType('success')
    } catch {
      setMessage('Failed to connect to server.')
      setType('error')
    }
    setLoading(false)
  }

  return (
    <div className="card sos-card">
      <h2 style={{ color: '#d32f2f', textAlign: 'center' }}>🚨 BLOOD SOS EMERGENCY</h2>
      <p style={{ textAlign: 'center', marginBottom: '20px' }}>Select the urgently required blood group to alert eligible donors instantly.</p>
      
      <form onSubmit={sendAlert}>
        <select 
          value={bloodGroup} 
          onChange={(e) => setBloodGroup(e.target.value)}
          className="sos-select"
        >
          {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(g => <option key={g} value={g}>{g}</option>)}
        </select>
        
        <button type="submit" className="sos-button">
          {loading ? 'SENDING ALERTS...' : 'SEND EMERGENCY ALERT'}
        </button>
      </form>

      {message && (
        <div className={`msg ${type}`}>
          {message}
        </div>
      )}
    </div>
  )
}
export default EmergencySOS