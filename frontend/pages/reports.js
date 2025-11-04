import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

export default function ReportsPage() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  
  // Movie Profit Calculator
  const [movies, setMovies] = useState([])
  const [selectedMovie, setSelectedMovie] = useState('')
  const [profitData, setProfitData] = useState(null)
  const [profitLoading, setProfitLoading] = useState(false)
  
  // Site Statistics
  const [stats, setStats] = useState(null)
  const [statsLoading, setStatsLoading] = useState(false)
  
  // Movie Search (Nested Query)
  const [minRating, setMinRating] = useState('8')
  const [searchResults, setSearchResults] = useState([])
  const [searchLoading, setSearchLoading] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    setIsLoggedIn(!!token)
    
    fetchMovies()
    fetchStats()
  }, [])

  const fetchMovies = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/movies`)
      if (res.ok) {
        const data = await res.json()
        setMovies(data)
      }
    } catch (err) {
      console.error('Failed to fetch movies', err)
    }
  }

  const fetchStats = async () => {
    setStatsLoading(true)
    try {
      const res = await fetch(`${apiUrl}/api/movies/stats/aggregate`)
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
    } catch (err) {
      console.error('Failed to fetch stats', err)
    } finally {
      setStatsLoading(false)
    }
  }

  const handleCalculateProfit = async () => {
    if (!selectedMovie) return
    
    setProfitLoading(true)
    try {
      const res = await fetch(`${apiUrl}/api/movies/profit/${encodeURIComponent(selectedMovie)}`)
      if (!res.ok) throw new Error('Failed to calculate profit')
      const data = await res.json()
      setProfitData(data)
    } catch (err) {
      alert(err.message)
    } finally {
      setProfitLoading(false)
    }
  }

  const handleSearchHighRated = async () => {
    setSearchLoading(true)
    try {
      // This would need a backend endpoint for nested query
      // For now, filter client-side
      const filtered = movies.filter(m => m.avg_rating > parseFloat(minRating))
      setSearchResults(filtered)
    } catch (err) {
      alert(err.message)
    } finally {
      setSearchLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    setIsLoggedIn(false)
    router.push('/')
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar isLoggedIn={isLoggedIn} onLogout={handleLogout} />
      
      <main style={{ flex: 1, padding: '48px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          
          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontSize: 32, fontWeight: 700, margin: '0 0 8px 0' }}>
              Reports & Insights
            </h1>
            <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
              View statistics, calculate profits, and search movies
            </p>
          </div>

          {/* Site Statistics */}
          <div style={{
            background: 'var(--panel)',
            borderRadius: 'var(--radius)',
            border: '1px solid var(--border)',
            padding: 24,
            marginBottom: 24
          }}>
            <h2 style={{ fontSize: 24, fontWeight: 600, margin: '0 0 20px 0' }}>
              📊 Site Statistics
            </h2>
            
            {statsLoading ? (
              <div style={{ color: 'var(--text-secondary)' }}>Loading statistics...</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                <div style={{
                  padding: 20,
                  background: 'var(--card)',
                  borderRadius: 8,
                  border: '1px solid var(--border)'
                }}>
                  <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 8 }}>
                    Total Movies
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--accent)' }}>
                    {stats?.totalMovies || 0}
                  </div>
                </div>
                
                <div style={{
                  padding: 20,
                  background: 'var(--card)',
                  borderRadius: 8,
                  border: '1px solid var(--border)'
                }}>
                  <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 8 }}>
                    Total Ratings
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--accent)' }}>
                    {stats?.totalRatings || 0}
                  </div>
                </div>
                
                <div style={{
                  padding: 20,
                  background: 'var(--card)',
                  borderRadius: 8,
                  border: '1px solid var(--border)'
                }}>
                  <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 8 }}>
                    Avg Rating
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--accent)' }}>
                    ⭐ {stats?.avgRating || '0'}
                  </div>
                </div>
                
                <div style={{
                  padding: 20,
                  background: 'var(--card)',
                  borderRadius: 8,
                  border: '1px solid var(--border)'
                }}>
                  <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 8 }}>
                    Total Users
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--accent)' }}>
                    {stats?.totalUsers || 0}
                  </div>
                </div>
                
                <div style={{
                  padding: 20,
                  background: 'var(--card)',
                  borderRadius: 8,
                  border: '1px solid var(--border)'
                }}>
                  <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 8 }}>
                    Avg Investment
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--accent)' }}>
                    {stats?.avgInvestment ? formatCurrency(stats.avgInvestment) : 'N/A'}
                  </div>
                </div>
                
                <div style={{
                  padding: 20,
                  background: 'var(--card)',
                  borderRadius: 8,
                  border: '1px solid var(--border)'
                }}>
                  <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 8 }}>
                    Avg Profit
                  </div>
                  <div style={{ 
                    fontSize: 24, 
                    fontWeight: 700, 
                    color: stats?.avgProfit >= 0 ? '#10b981' : '#ef4444' 
                  }}>
                    {stats?.avgProfit ? formatCurrency(stats.avgProfit) : 'N/A'}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
            
            {/* Movie Profit Calculator */}
            <div style={{
              background: 'var(--panel)',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--border)',
              padding: 24
            }}>
              <h2 style={{ fontSize: 24, fontWeight: 600, margin: '0 0 20px 0' }}>
                💰 Movie Profit Calculator
              </h2>
              
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500 }}>
                  Select Movie
                </label>
                <select
                  value={selectedMovie}
                  onChange={(e) => setSelectedMovie(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: '1px solid var(--border)',
                    background: 'var(--card)',
                    color: 'var(--text)',
                    fontSize: 15
                  }}
                >
                  <option value="">Choose a movie...</option>
                  {movies.map(movie => (
                    <option key={movie.movie_id} value={movie.title}>
                      {movie.title}
                    </option>
                  ))}
                </select>
              </div>
              
              <button
                onClick={handleCalculateProfit}
                disabled={!selectedMovie || profitLoading}
                className="btn"
                style={{ width: '100%', marginBottom: 16 }}
              >
                {profitLoading ? 'Calculating...' : 'Calculate Profit'}
              </button>
              
              {profitData && (
                <div style={{
                  padding: 16,
                  background: 'var(--card)',
                  borderRadius: 8,
                  border: '1px solid var(--border)'
                }}>
                  <div style={{ marginBottom: 12 }}>
                    <span style={{ fontSize: 13, color: 'var(--muted)' }}>Investment:</span>
                    <div style={{ fontSize: 18, fontWeight: 600 }}>
                      {formatCurrency(profitData.investment)}
                    </div>
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <span style={{ fontSize: 13, color: 'var(--muted)' }}>Outcome Revenue:</span>
                    <div style={{ fontSize: 18, fontWeight: 600 }}>
                      {formatCurrency(profitData.outcome_revenue)}
                    </div>
                  </div>
                  <div style={{ paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                    <span style={{ fontSize: 13, color: 'var(--muted)' }}>Profit:</span>
                    <div style={{ 
                      fontSize: 24, 
                      fontWeight: 700,
                      color: profitData.profit >= 0 ? 'var(--success)' : 'var(--danger)'
                    }}>
                      {formatCurrency(profitData.profit)}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Movie Search (Nested Query) */}
            <div style={{
              background: 'var(--panel)',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--border)',
              padding: 24
            }}>
              <h2 style={{ fontSize: 24, fontWeight: 600, margin: '0 0 20px 0' }}>
                🔍 Movie Search
              </h2>
              
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500 }}>
                  Find movies rated higher than...
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  step="0.1"
                  value={minRating}
                  onChange={(e) => setMinRating(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: '1px solid var(--border)',
                    background: 'var(--card)',
                    color: 'var(--text)',
                    fontSize: 15
                  }}
                />
              </div>
              
              <button
                onClick={handleSearchHighRated}
                disabled={searchLoading}
                className="btn"
                style={{ width: '100%', marginBottom: 16 }}
              >
                {searchLoading ? 'Searching...' : 'Search'}
              </button>
              
              {searchResults.length > 0 && (
                <div style={{
                  maxHeight: 300,
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8
                }}>
                  {searchResults.map(movie => (
                    <div
                      key={movie.movie_id}
                      style={{
                        padding: 12,
                        background: 'var(--card)',
                        borderRadius: 8,
                        border: '1px solid var(--border)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <span style={{ fontWeight: 500 }}>{movie.title}</span>
                      <span style={{ color: 'var(--accent)', fontWeight: 600 }}>
                        ⭐ {movie.avg_rating}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              
              {searchResults.length === 0 && minRating && !searchLoading && (
                <div style={{
                  padding: 16,
                  textAlign: 'center',
                  color: 'var(--text-secondary)',
                  fontSize: 14
                }}>
                  No movies found with rating higher than {minRating}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
