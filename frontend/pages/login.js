import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import AuthLayout from '../components/AuthLayout'

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setMessage('')
    setError('')
    if (!email || !password) return setError('Email and password required')

    setLoading(true)
    try {
      const res = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Login failed')

      setMessage('✓ Login successful! Welcome back.')
      if (data.token) {
        localStorage.setItem('token', data.token)
        setTimeout(() => router.push('/'), 1500)
      }
      
      // Clear form
      setEmail('')
      setPassword('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <div className="auth-card">
        <h2>Welcome back</h2>
        <p className="lead">Sign in to your account to continue</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input 
              type="email"
              value={email} 
              onChange={(e)=>setEmail(e.target.value)} 
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e)=>setPassword(e.target.value)} 
              placeholder="Enter your password"
              autoComplete="current-password"
            />
          </div>

          {message && <div className="success">{message}</div>}
          {error && <div className="error">{error}</div>}

          <div className="btn-group">
            <button type="submit" className="btn" disabled={loading} style={{ flex: 1 }}>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>

          <div className="footer-note">
            Don't have an account? <Link href="/signup">Create one now</Link>
          </div>
        </form>
      </div>
    </AuthLayout>
  )
}
