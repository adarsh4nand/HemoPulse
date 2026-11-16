import { useState, useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { X, Package, ScanLine } from 'lucide-react'

const API = 'http://127.0.0.1:5000'

function Inventory() {
  const [items, setItems] = useState([])
  
  // State for Manual Add
  const [manualForm, setManualForm] = useState({ blood_group: 'O+', component_type: 'Whole Blood', quantity: 1, expiry_date: '' })
  
  // State for Yield Calculator
  const [yieldForm, setYieldForm] = useState({ blood_group: 'O+', quantity: 1, expiry_date: '' })
  const [yieldMsg, setYieldMsg] = useState('')

  // State for QR Modal
  const [selectedUnit, setSelectedUnit] = useState(null)

  const load = () => fetch(`${API}/api/inventory`).then(r => r.json()).then(setItems).catch(() => {})
  useEffect(() => { load() }, [])

  const handleManualSubmit = async (e) => {
    e.preventDefault()
    const res = await fetch(`${API}/api/add_inventory`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(manualForm)
    })
    if (res.ok) { load() }
  }

  const handleYieldSubmit = async (e) => {
    e.preventDefault()
    setYieldMsg('Processing...')
    const res = await fetch(`${API}/api/process_donation`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(yieldForm)
    })
    const data = await res.json()
    setYieldMsg(data.message)
    if (res.ok) { 
      load() 
      setYieldForm({ blood_group: 'O+', quantity: 1, expiry_date: '' })
    }
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="card wide">
      <h2><Package size={24} /> Blood Inventory & Processing</h2>

      {/* --- YIELD CALCULATOR SECTION --- */}
      <div style={{ background: '#fef2f2', padding: '20px', borderRadius: '12px', marginBottom: '30px', border: '1px solid #fecaca' }}>
        <h3 style={{ marginTop: 0, color: '#dc2626' }}>🧪 Automated Component Yield Calculator</h3>
        <p style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>
          Log a Whole Blood donation. The system will automatically split it into RBC, Plasma, and Platelets based on medical yield standards.
        </p>
        <form onSubmit={handleYieldSubmit} className="inline-form" style={{ background: 'white' }}>
          <label style={{ flex: 1 }}>
            Blood Group
            <select value={yieldForm.blood_group} onChange={e => setYieldForm({...yieldForm, blood_group: e.target.value})}>
              {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(g => <option key={g}>{g}</option>)}
            </select>
          </label>
          <label style={{ flex: 1 }}>
            Units Collected
            <input type="number" value={yieldForm.quantity} onChange={e => setYieldForm({...yieldForm, quantity: e.target.value})} min="1" />
          </label>
          <label style={{ flex: 1 }}>
            Collection Date
            <input type="date" value={yieldForm.expiry_date} onChange={e => setYieldForm({...yieldForm, expiry_date: e.target.value})} required />
          </label>
          <button type="submit" style={{ marginTop: '22px' }}>Process & Split</button>
        </form>
        {yieldMsg && <div className="msg success" style={{ marginTop: '15px' }}>{yieldMsg}</div>}
      </div>

      {/* --- MANUAL ADD SECTION --- */}
      <h3>➕ Manual Stock Adjustment</h3>
      <form onSubmit={handleManualSubmit} className="inline-form">
        <label style={{ flex: 1 }}>
          Blood Group
          <select value={manualForm.blood_group} onChange={e => setManualForm({...manualForm, blood_group: e.target.value})}>
            {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(g => <option key={g}>{g}</option>)}
          </select>
        </label>
        <label style={{ flex: 1 }}>
          Component
          <select value={manualForm.component_type} onChange={e => setManualForm({...manualForm, component_type: e.target.value})}>
            {['Whole Blood','RBC','Plasma','Platelets'].map(c => <option key={c}>{c}</option>)}
          </select>
        </label>
        <label style={{ flex: 1 }}>
          Qty
          <input type="number" value={manualForm.quantity} onChange={e => setManualForm({...manualForm, quantity: e.target.value})} min="1" />
        </label>
        <label style={{ flex: 1 }}>
          Expiry
          <input type="date" value={manualForm.expiry_date} onChange={e => setManualForm({...manualForm, expiry_date: e.target.value})} required />
        </label>
        <button type="submit" style={{ marginTop: '22px' }}>Add Stock</button>
      </form>

      {/* --- INVENTORY TABLE WITH QR CODES --- */}
      <h3><ScanLine size={20} /> Live Inventory & Audit Trail</h3>
      <div style={{ overflowX: 'auto' }}>
        <table>
          <thead>
            <tr>
              <th>QR Audit</th>
              <th>Group</th>
              <th>Component</th>
              <th>Qty</th>
              <th>Expiry</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {items.map(i => (
              <tr key={i.unit_id}>
                <td>
                  <div 
                    className="qr-trigger" 
                    onClick={() => setSelectedUnit(i)}
                    title="Click to view Audit Trail"
                  >
                    <QRCodeSVG value={`HEMOPULSE-UNIT-${i.unit_id}-${i.blood_group}-${i.component_type}`} size={40} />
                  </div>
                </td>
                <td><strong>{i.blood_group}</strong></td>
                <td>{i.component_type}</td>
                <td>{i.quantity}</td>
                <td className={i.expiry_date < today ? 'expired' : 'ok'}>{i.expiry_date}</td>
                <td>{i.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- QR CODE MODAL (AUDIT TRAIL) --- */}
      {selectedUnit && (
        <div className="modal-overlay" onClick={() => setSelectedUnit(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setSelectedUnit(null)}><X size={20} /></button>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <QRCodeSVG value={`HEMOPULSE-UNIT-${selectedUnit.unit_id}`} size={150} />
            </div>
            <h3 style={{ textAlign: 'center', color: '#dc2626' }}>Unit Audit Trail</h3>
            <div className="audit-details">
              <p><strong>Unit ID:</strong> #{selectedUnit.unit_id}</p>
              <p><strong>Blood Group:</strong> {selectedUnit.blood_group}</p>
              <p><strong>Component:</strong> {selectedUnit.component_type}</p>
              <p><strong>Quantity:</strong> {selectedUnit.quantity} Units</p>
              <p><strong>Expiry Date:</strong> {selectedUnit.expiry_date}</p>
              <p><strong>Status:</strong> {selectedUnit.status}</p>
              <p style={{ fontSize: '12px', color: '#666', marginTop: '20px', textAlign: 'center' }}>
                Scanned via HemoPulse Secure Ledger
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
export default Inventory