import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import AuthLayout from '../components/AuthLayout'

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

export default function Signup() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setMessage('')
    setError('')
    if (!username || !email || !password) return setError('All fields are required')
    if (password.length < 6) return setError('Password must be at least 6 characters')
    if (password !== confirmPassword) return setError('Passwords do not match')

    setLoading(true)
    try {
      const res = await fetch(`${apiUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Registration failed')

      // show success message
      setMessage('✓ Registration successful! You are now logged in.')
      if (data.token) {
        localStorage.setItem('token', data.token)
        setTimeout(() => router.push('/'), 1500)
      }
      
      // Clear form
      setUsername('')
      setEmail('')
      setPassword('')
      setConfirmPassword('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <div className="auth-card">
        <h2>Create your account</h2>
        <p className="lead">Join our community to rate and review movies</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input 
              type="text"
              value={username} 
              onChange={(e)=>setUsername(e.target.value)} 
              placeholder="Choose a unique username" 
              autoComplete="username"
            />
          </div>

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
              placeholder="Min. 6 characters"
              autoComplete="new-password"
            />
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input 
              type="password" 
              value={confirmPassword} 
              onChange={(e)=>setConfirmPassword(e.target.value)} 
              placeholder="Re-enter your password"
              autoComplete="new-password"
            />
          </div>

          {message && <div className="success">{message}</div>}
          {error && <div className="error">{error}</div>}

          <div className="btn-group">
            <button type="submit" className="btn" disabled={loading} style={{ flex: 1 }}>
              {loading ? 'Creating account...' : 'Sign up'}
            </button>
          </div>

          <div className="footer-note">
            Already have an account? <Link href="/login">Log in here</Link>
          </div>
        </form>
      </div>
    </AuthLayout>
  )
}
