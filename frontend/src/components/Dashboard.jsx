import { useState, useEffect } from 'react'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { Users, Droplet, Heart, AlertTriangle, Calendar, Activity, TrendingUp } from 'lucide-react'

const COLORS = ['#dc2626', '#2563eb', '#16a34a', '#ca8a04', '#9333ea', '#0891b2', '#ea580c', '#475569']

function Dashboard() {
  const [stats, setStats] = useState({ total_donors: 0, total_units: 0, lives_saved: 0, chart_data: [] })
  const [activity, setActivity] = useState({ recent_donors: [], expiring_soon: [] })

  useEffect(() => {
    // Fetch Stats
    fetch('http://127.0.0.1:5000/api/stats').then(res => res.json()).then(setStats).catch(err => console.error(err))
    // Fetch Activity
    fetch('http://127.0.0.1:5000/api/recent_activity').then(res => res.json()).then(setActivity).catch(err => console.error(err))
  }, [])

  // Mock data for Bar Chart (Donations by Blood Group)
  const barData = [
    { name: 'A+', donations: 12 }, { name: 'B+', donations: 19 },
    { name: 'O+', donations: 25 }, { name: 'AB+', donations: 8 },
    { name: 'O-', donations: 5 }
  ]

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dash-header">
        <div>
          <h2>Community Dashboard</h2>
          <p>Real-time overview of HemoPulse network impact</p>
        </div>
        <div className="date-badge">
          <Calendar size={16} /> {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Stat Cards Row */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fee2e2', color: '#dc2626' }}><Users size={24} /></div>
          <div className="stat-info">
            <h3>Total Donors</h3>
            <p>{stats.total_donors}</p>
            <span className="stat-trend positive"><TrendingUp size={12} /> +12% this month</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#dbeafe', color: '#2563eb' }}><Droplet size={24} /></div>
          <div className="stat-info">
            <h3>Units in Stock</h3>
            <p>{stats.total_units}</p>
            <span className="stat-trend">Across 4 blood banks</span>
          </div>
        </div>
        <div className="stat-card highlight">
          <div className="stat-icon" style={{ background: '#dcfce7', color: '#16a34a' }}><Heart size={24} /></div>
          <div className="stat-info">
            <h3>Lives Saved</h3>
            <p>{stats.lives_saved}</p>
            <span className="stat-trend positive">Based on 3 lives/unit</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fef3c7', color: '#d97706' }}><AlertTriangle size={24} /></div>
          <div className="stat-info">
            <h3>Expiring Soon</h3>
            <p>{activity.expiring_soon.length}</p>
            <span className="stat-trend negative">Requires attention</span>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="charts-grid">
        <div className="chart-card">
          <h3><Droplet size={18} /> Inventory Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={stats.chart_data} dataKey="total" nameKey="blood_group" cx="50%" cy="50%" outerRadius={80} label>
                {stats.chart_data.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-card">
          <h3><Activity size={18} /> Recent Donation Trends</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip />
              <Bar dataKey="donations" fill="#dc2626" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row: Activity & Camps */}
      <div className="bottom-grid">
        <div className="activity-card">
          <h3><Activity size={18} /> Live Audit Trail (Recent Donors)</h3>
          <div className="activity-list">
            {activity.recent_donors.length > 0 ? activity.recent_donors.map((d, i) => (
              <div key={i} className="activity-item">
                <div className="activity-dot"></div>
                <div className="activity-details">
                  <strong>{d.full_name}</strong> donated <span className="badge">{d.blood_group}</span>
                  <span className="activity-time">{new Date(d.created_at).toLocaleTimeString()}</span>
                </div>
              </div>
            )) : <p style={{color: '#9ca3af', textAlign: 'center', padding: '20px'}}>No recent donors. Register one to see it here!</p>}
          </div>
        </div>

        <div className="camps-card">
          <h3><Calendar size={18} /> Upcoming Donation Camps</h3>
          <div className="camp-list">
            <div className="camp-item">
              <div className="camp-date">NOV<br/><strong>20</strong></div>
              <div className="camp-info">
                <strong>Red Cross Society Drive</strong>
                <p>Community Center, Sector 12 • 9:00 AM</p>
              </div>
            </div>
            <div className="camp-item">
              <div className="camp-date">NOV<br/><strong>25</strong></div>
              <div className="camp-info">
                <strong>College Blood Drive</strong>
                <p>Main Auditorium • 10:00 AM</p>
              </div>
            </div>
            <div className="camp-item">
              <div className="camp-date">DEC<br/><strong>01</strong></div>
              <div className="camp-info">
                <strong>World AIDS Day Camp</strong>
                <p>City Hospital Plaza • 8:00 AM</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
export default Dashboard