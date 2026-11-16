import { useState } from 'react'
const API = 'http://127.0.0.1:5000'

function DonorForm() {
  const [form, setForm] = useState({ full_name: '', phone: '', blood_group: 'O+', last_donation_date: '' })
  const [msg, setMsg] = useState('')
  const [type, setType] = useState('')

  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch(`${API}/api/register_donor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      setMsg(data.message || data.error)
      setType(res.ok ? 'success' : 'error')
      if (res.ok) setForm({ full_name: '', phone: '', blood_group: 'O+', last_donation_date: '' })
    } catch {
      setMsg('Backend not running. Check Terminal 1.')
      setType('error')
    }
  }

  return (
    <div className="card">
      <h2>Donor Registration</h2>
      <form onSubmit={submit}>
        <label>Full Name<input name="full_name" value={form.full_name} onChange={update} required /></label>
        <label>Phone<input name="phone" value={form.phone} onChange={update} required /></label>
        <label>Blood Group
          <select name="blood_group" value={form.blood_group} onChange={update}>
            {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(g => <option key={g}>{g}</option>)}
          </select>
        </label>
        <label>Last Donation Date (optional)
          <input type="date" name="last_donation_date" value={form.last_donation_date} onChange={update} />
        </label>
        <button type="submit">Register Donor</button>
      </form>
      {msg && <div className={`msg ${type}`}>{msg}</div>}
    </div>
  )
}
export default DonorForm