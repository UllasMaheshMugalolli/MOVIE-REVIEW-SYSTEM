import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import { getUserInfo } from '../../utils/auth'

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

export default function AdminRevenue() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [movies, setMovies] = useState([])
  const [selectedMovie, setSelectedMovie] = useState('')
  const [formData, setFormData] = useState({ investment: '', outcome_revenue: '' })
  const [message, setMessage] = useState('')
  const [revenueData, setRevenueData] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    const userInfo = getUserInfo()
    if (!userInfo || !userInfo.is_admin) {
      alert('Access denied')
      router.push('/')
      return
    }

    setIsLoggedIn(true)
    setIsAdmin(true)
    fetchMovies()
  }, [])

  const fetchMovies = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/movies`)
      if (res.ok) setMovies(await res.json())
    } catch (err) {
      console.error(err)
    }
  }

  const fetchRevenueForMovie = async (movieId) => {
    try {
      const res = await fetch(`${apiUrl}/api/revenue/${movieId}`)
      if (res.ok) {
        const data = await res.json()
        setRevenueData(data)
        setFormData({
          investment: data.investment || '',
          outcome_revenue: data.outcome_revenue || ''
        })
      } else {
        setRevenueData(null)
        setFormData({ investment: '', outcome_revenue: '' })
      }
    } catch (err) {
      setRevenueData(null)
      setFormData({ investment: '', outcome_revenue: '' })
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    router.push('/')
  }

  const handleMovieChange = (movieId) => {
    setSelectedMovie(movieId)
    setMessage('')
    if (movieId) {
      fetchRevenueForMovie(movieId)
    } else {
      setRevenueData(null)
      setFormData({ investment: '', outcome_revenue: '' })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage('')

    try {
      const token = localStorage.getItem('token')
      const method = revenueData ? 'PUT' : 'POST'
      const url = revenueData 
        ? `${apiUrl}/api/revenue/${selectedMovie}`
        : `${apiUrl}/api/revenue`
      
      const body = revenueData 
        ? formData
        : { ...formData, movie_id: parseInt(selectedMovie) }

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Operation failed')

      setMessage('✓ Revenue data saved successfully!')
      await fetchRevenueForMovie(selectedMovie)
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      setMessage(err.message)
    }
  }

  const profit = formData.investment && formData.outcome_revenue
    ? parseFloat(formData.outcome_revenue) - parseFloat(formData.investment)
    : null

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar isLoggedIn={isLoggedIn} isAdmin={isAdmin} onLogout={handleLogout} />
      
      <main style={{ flex: 1, padding: '48px 24px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          
          <Link href="/admin" style={{ color: 'var(--accent)', textDecoration: 'none', fontSize: 14, marginBottom: 8, display: 'inline-block' }}>
            ← Back to Dashboard
          </Link>
          <h1 style={{ fontSize: 32, fontWeight: 700, margin: '0 0 8px 0' }}>
            💰 Revenue Management
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: '0 0 32px 0' }}>
            Add or update financial data for movies
          </p>

          <div style={{
            background: 'var(--panel)',
            borderRadius: 'var(--radius)',
            border: '1px solid var(--border)',
            padding: 32
          }}>
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500 }}>
                Select Movie *
              </label>
              <select
                value={selectedMovie}
                onChange={(e) => handleMovieChange(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: 12,
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: 6,
                  color: 'var(--text)',
                  fontSize: 14
                }}
              >
                <option value="">Choose a movie...</option>
                {movies.map(movie => (
                  <option key={movie.movie_id} value={movie.movie_id}>
                    {movie.title}
                  </option>
                ))}
              </select>
              {revenueData && (
                <div style={{ marginTop: 8, fontSize: 13, color: '#10b981' }}>
                  ✓ Revenue data exists for this movie
                </div>
              )}
            </div>

            {selectedMovie && (
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500 }}>
                    Investment (USD) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.investment}
                    onChange={(e) => setFormData({ ...formData, investment: e.target.value })}
                    required
                    placeholder="0.00"
                    style={{
                      width: '100%',
                      padding: 12,
                      background: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: 6,
                      color: 'var(--text)',
                      fontSize: 14
                    }}
                  />
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500 }}>
                    Outcome Revenue (USD) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.outcome_revenue}
                    onChange={(e) => setFormData({ ...formData, outcome_revenue: e.target.value })}
                    required
                    placeholder="0.00"
                    style={{
                      width: '100%',
                      padding: 12,
                      background: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: 6,
                      color: 'var(--text)',
                      fontSize: 14
                    }}
                  />
                </div>

                {profit !== null && (
                  <div style={{
                    padding: 16,
                    background: profit >= 0 ? '#10b98122' : '#ef444422',
                    border: `1px solid ${profit >= 0 ? '#10b981' : '#ef4444'}`,
                    borderRadius: 6,
                    marginBottom: 16
                  }}>
                    <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 4 }}>
                      Calculated Profit/Loss
                    </div>
                    <div style={{ fontSize: 24, fontWeight: 700, color: profit >= 0 ? '#10b981' : '#ef4444' }}>
                      ${profit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                )}

                {message && (
                  <div style={{ 
                    padding: 12, 
                    background: message.includes('✓') ? '#10b98122' : '#ef444422',
                    border: `1px solid ${message.includes('✓') ? '#10b981' : '#ef4444'}`,
                    borderRadius: 6,
                    marginBottom: 16,
                    fontSize: 14
                  }}>
                    {message}
                  </div>
                )}

                <button
                  type="submit"
                  style={{
                    width: '100%',
                    background: 'var(--accent)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 6,
                    padding: 14,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {revenueData ? 'Update' : 'Add'} Revenue Data
                </button>
              </form>
            )}
          </div>

        </div>
      </main>

      <Footer />
    </div>
  )
}
