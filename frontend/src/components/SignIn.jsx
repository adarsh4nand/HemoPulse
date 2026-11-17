import { useState } from 'react'
import { Shield, Clock, Activity, Users, Eye, EyeOff } from 'lucide-react'

const API = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000'

const floatingKeyframes = `
@keyframes float1 {
  0%, 100% { transform: translate(0, 0) rotate(0deg); opacity: 0.08; }
  50% { transform: translate(30px, -40px) rotate(180deg); opacity: 0.15; }
}
@keyframes float2 {
  0%, 100% { transform: translate(0, 0) rotate(0deg); opacity: 0.06; }
  50% { transform: translate(-40px, 30px) rotate(-120deg); opacity: 0.12; }
}
@keyframes float3 {
  0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.05; }
  50% { transform: translate(20px, 20px) scale(1.2); opacity: 0.1; }
}
@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}
`

const features = [
  { icon: Shield, label: 'Real-time Inventory Tracking' },
  { icon: Clock, label: 'Emergency SOS Alerts' },
  { icon: Activity, label: 'Donor Eligibility Engine' },
  { icon: Users, label: 'AI-Powered Assistance' },
]

export default function SignIn({ onLogin }) {
  const [isSignUp, setIsSignUp] = useState(false)
  const [form, setForm] = useState({ full_name: '', email: '', password: '', confirm_password: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
    setSuccess('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!form.email || !form.password) {
      setError('Please fill in all required fields.')
      return
    }

    if (isSignUp) {
      if (!form.full_name) {
        setError('Please enter your full name.')
        return
      }
      if (form.password !== form.confirm_password) {
        setError('Passwords do not match.')
        return
      }
      if (form.password.length < 6) {
        setError('Password must be at least 6 characters.')
        return
      }
    }

    setLoading(true)

    try {
      const url = isSignUp ? `${API}/api/register_user` : `${API}/api/login`
      const body = isSignUp
        ? { full_name: form.full_name, email: form.email, password: form.password }
        : { email: form.email, password: form.password }

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || data.message || 'Something went wrong.')
        setLoading(false)
        return
      }

      if (isSignUp) {
        setSuccess('Account created successfully! You can now sign in.')
        setIsSignUp(false)
        setForm({ full_name: '', email: form.email, password: '', confirm_password: '' })
      } else {
        onLogin(data.user)
      }
    } catch (err) {
      setError('Unable to connect to the server. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    fontSize: '15px',
    fontFamily: "'Inter', sans-serif",
    border: '2px solid #E2E8F0',
    borderRadius: '12px',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    color: '#0F172A',
    backgroundColor: '#F8FAFC',
    boxSizing: 'border-box',
  }

  const inputFocusHandler = (e) => {
    e.target.style.borderColor = '#DC2626'
    e.target.style.boxShadow = '0 0 0 3px rgba(220,38,38,0.1)'
    e.target.style.backgroundColor = '#FFFFFF'
  }

  const inputBlurHandler = (e) => {
    e.target.style.borderColor = '#E2E8F0'
    e.target.style.boxShadow = 'none'
    e.target.style.backgroundColor = '#F8FAFC'
  }

  const labelStyle = {
    display: 'block',
    fontSize: '13px',
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: '6px',
    letterSpacing: '0.01em',
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      <style>{floatingKeyframes}</style>

      {/* Left Panel */}
      <div
        style={{
          width: '45%',
          background: 'linear-gradient(160deg, #0F172A 0%, #1E293B 100%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '60px 48px',
          position: 'relative',
          overflow: 'hidden',
        }}
        className="left-panel"
      >
        {/* Floating shapes */}
        <div
          style={{
            position: 'absolute',
            top: '15%',
            left: '10%',
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            border: '2px solid rgba(220,38,38,0.2)',
            animation: 'float1 8s ease-in-out infinite',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '20%',
            right: '8%',
            width: '80px',
            height: '80px',
            borderRadius: '16px',
            border: '2px solid rgba(220,38,38,0.15)',
            transform: 'rotate(45deg)',
            animation: 'float2 10s ease-in-out infinite',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '60%',
            left: '20%',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: 'rgba(220,38,38,0.06)',
            animation: 'float3 12s ease-in-out infinite',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '8%',
            right: '25%',
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            backgroundColor: 'rgba(220,38,38,0.05)',
            animation: 'float2 9s ease-in-out infinite',
          }}
        />

        {/* Branding */}
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: '380px' }}>
          <div style={{ fontSize: '48px', marginBottom: '8px' }}>🩸</div>
          <h1
            style={{
              fontSize: '36px',
              fontWeight: '800',
              color: '#FFFFFF',
              marginBottom: '8px',
              letterSpacing: '-0.02em',
              margin: '0 0 8px 0',
            }}
          >
            HemoPulse
          </h1>
          <p
            style={{
              fontSize: '16px',
              color: '#94A3B8',
              fontWeight: '400',
              marginBottom: '48px',
              lineHeight: '1.5',
              margin: '0 0 48px 0',
            }}
          >
            Smart Blood Bank Management System
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {features.map(({ icon: Icon, label }) => (
              <div
                key={label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                }}
              >
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(220,38,38,0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Icon size={20} color="#DC2626" />
                </div>
                <span style={{ color: '#CBD5E1', fontSize: '15px', fontWeight: '500' }}>
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div
        style={{
          width: '55%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px 48px',
          backgroundColor: '#FFFFFF',
        }}
        className="right-panel"
      >
        <div style={{ width: '100%', maxWidth: '420px' }}>
          {/* Header */}
          <h2
            style={{
              fontSize: '28px',
              fontWeight: '700',
              color: '#0F172A',
              marginBottom: '8px',
              letterSpacing: '-0.02em',
              margin: '0 0 8px 0',
            }}
          >
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p
            style={{
              fontSize: '15px',
              color: '#64748B',
              marginBottom: '32px',
              margin: '0 0 32px 0',
            }}
          >
            {isSignUp
              ? 'Join HemoPulse to manage blood bank operations.'
              : 'Sign in to your HemoPulse account.'}
          </p>

          {/* Tab Toggle */}
          <div
            style={{
              display: 'flex',
              backgroundColor: '#F1F5F9',
              borderRadius: '14px',
              padding: '4px',
              marginBottom: '32px',
            }}
          >
            {['Sign In', 'Sign Up'].map((tab) => {
              const active =
                (tab === 'Sign In' && !isSignUp) || (tab === 'Sign Up' && isSignUp)
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => {
                    setIsSignUp(tab === 'Sign Up')
                    setError('')
                    setSuccess('')
                  }}
                  style={{
                    flex: 1,
                    padding: '10px 0',
                    fontSize: '14px',
                    fontWeight: '600',
                    fontFamily: "'Inter', sans-serif",
                    border: 'none',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    backgroundColor: active ? '#FFFFFF' : 'transparent',
                    color: active ? '#0F172A' : '#64748B',
                    boxShadow: active ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  }}
                >
                  {tab}
                </button>
              )
            })}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {isSignUp && (
              <div>
                <label style={labelStyle}>Full Name</label>
                <input
                  type="text"
                  name="full_name"
                  value={form.full_name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  style={inputStyle}
                  onFocus={inputFocusHandler}
                  onBlur={inputBlurHandler}
                  required
                />
              </div>
            )}

            <div>
              <label style={labelStyle}>Email Address</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                style={inputStyle}
                onFocus={inputFocusHandler}
                onBlur={inputBlurHandler}
                required
              />
            </div>

            <div>
              <label style={labelStyle}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  style={{ ...inputStyle, paddingRight: '48px' }}
                  onFocus={inputFocusHandler}
                  onBlur={inputBlurHandler}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    color: '#94A3B8',
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {isSignUp && (
              <div>
                <label style={labelStyle}>Confirm Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    name="confirm_password"
                    value={form.confirm_password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    style={{ ...inputStyle, paddingRight: '48px' }}
                    onFocus={inputFocusHandler}
                    onBlur={inputBlurHandler}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    style={{
                      position: 'absolute',
                      right: '14px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      color: '#94A3B8',
                    }}
                  >
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            )}

            {error && (
              <div
                style={{
                  padding: '12px 16px',
                  backgroundColor: '#FEF2F2',
                  border: '1px solid #FECACA',
                  borderRadius: '10px',
                  color: '#DC2626',
                  fontSize: '13px',
                  fontWeight: '500',
                }}
              >
                {error}
              </div>
            )}

            {success && (
              <div
                style={{
                  padding: '12px 16px',
                  backgroundColor: '#F0FDF4',
                  border: '1px solid #BBF7D0',
                  borderRadius: '10px',
                  color: '#16A34A',
                  fontSize: '13px',
                  fontWeight: '500',
                }}
              >
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px',
                fontSize: '15px',
                fontWeight: '600',
                fontFamily: "'Inter', sans-serif",
                color: '#FFFFFF',
                background: loading
                  ? '#94A3B8'
                  : 'linear-gradient(135deg, #DC2626 0%, #991B1B 100%)',
                border: 'none',
                borderRadius: '12px',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                boxShadow: loading ? 'none' : '0 4px 12px rgba(220,38,38,0.3)',
                marginTop: '4px',
                animation: loading ? 'pulse 1.5s ease-in-out infinite' : 'none',
              }}
            >
              {loading
                ? (isSignUp ? 'Creating Account...' : 'Signing In...')
                : (isSignUp ? 'Create Account' : 'Sign In')}
            </button>
          </form>

          {/* Footer */}
          <p
            style={{
              textAlign: 'center',
              fontSize: '13px',
              color: '#94A3B8',
              marginTop: '32px',
              margin: '32px 0 0 0',
            }}
          >
            {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp)
                setError('')
                setSuccess('')
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#DC2626',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '13px',
                fontFamily: "'Inter', sans-serif",
                padding: 0,
              }}
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>
      </div>

      {/* Responsive: hide left panel on small screens */}
      <style>{`
        @media (max-width: 768px) {
          .left-panel { display: none !important; }
          .right-panel { width: 100% !important; }
        }
      `}</style>
    </div>
  )
}
