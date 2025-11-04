import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import LandingHero from '../components/LandingHero'
import { getUserInfo } from '../utils/auth'

export default function Home() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [username, setUsername] = useState('')
  const [stats, setStats] = useState({ totalMovies: 0, totalRatings: 0, avgRating: 0 })

  useEffect(() => {
    const token = localStorage.getItem('token')
    setIsLoggedIn(!!token)
    
    if (token) {
      const userInfo = getUserInfo()
      if (userInfo) {
        setUsername(userInfo.username || 'User')
        setIsAdmin(userInfo.is_admin || false)
      }
      fetchStats()
    }
  }, [])

  const fetchStats = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
      const res = await fetch(`${apiUrl}/api/movies`)
      if (res.ok) {
        const movies = await res.json()
        const totalMovies = movies.length
        const moviesWithRatings = movies.filter(m => m.avg_rating && m.avg_rating > 0)
        const avgRating = moviesWithRatings.length > 0
          ? (moviesWithRatings.reduce((sum, m) => sum + parseFloat(m.avg_rating || 0), 0) / moviesWithRatings.length).toFixed(1)
          : 0
        
        setStats({
          totalMovies,
          totalRatings: moviesWithRatings.length,
          avgRating
        })
      }
    } catch (err) {
      console.error('Failed to fetch stats', err)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    setIsLoggedIn(false)
    router.push('/')
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar isLoggedIn={isLoggedIn} isAdmin={isAdmin} onLogout={handleLogout} />
      
      {!isLoggedIn ? (
        <LandingHero />
      ) : (
        <main style={{ flex: 1, padding: '48px 24px' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            
            {/* Welcome Section */}
            <div style={{
              background: 'linear-gradient(135deg, var(--accent) 0%, #8b5cf6 100%)',
              borderRadius: 'var(--radius)',
              padding: '48px 32px',
              marginBottom: 32,
              textAlign: 'center',
              boxShadow: 'var(--shadow-lg)'
            }}>
              <div style={{ 
                fontSize: 48, 
                marginBottom: 12,
                animation: 'fadeIn 0.6s ease-out'
              }}>
                🎬
              </div>
              <h1 style={{ 
                fontSize: 36, 
                fontWeight: 700, 
                margin: '0 0 12px 0',
                color: 'white'
              }}>
                Welcome back, {username}!
              </h1>
              <p style={{ 
                fontSize: 18, 
                color: 'rgba(255,255,255,0.9)',
                margin: 0
              }}>
                Discover amazing movies and share your reviews
              </p>
            </div>

            {/* Quick Stats */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: 24,
              marginBottom: 32
            }}>
              <div style={{
                background: 'var(--panel)',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border)',
                padding: 24,
                textAlign: 'center'
              }}>
                <div style={{ fontSize: 36, fontWeight: 700, color: 'var(--accent)', marginBottom: 8 }}>
                  {stats.totalMovies}
                </div>
                <div style={{ fontSize: 14, color: 'var(--muted)' }}>Total Movies</div>
              </div>
              
              <div style={{
                background: 'var(--panel)',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border)',
                padding: 24,
                textAlign: 'center'
              }}>
                <div style={{ fontSize: 36, fontWeight: 700, color: 'var(--accent)', marginBottom: 8 }}>
                  {stats.totalRatings}
                </div>
                <div style={{ fontSize: 14, color: 'var(--muted)' }}>Rated Movies</div>
              </div>
              
              <div style={{
                background: 'var(--panel)',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border)',
                padding: 24,
                textAlign: 'center'
              }}>
                <div style={{ fontSize: 36, fontWeight: 700, color: 'var(--accent)', marginBottom: 8 }}>
                  ⭐ {stats.avgRating}
                </div>
                <div style={{ fontSize: 14, color: 'var(--muted)' }}>Average Rating</div>
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 24
            }}>
              <Link href="/movies" style={{ textDecoration: 'none' }}>
                <div style={{
                  background: 'var(--panel)',
                  borderRadius: 'var(--radius)',
                  border: '1px solid var(--border)',
                  padding: 32,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  ':hover': { transform: 'translateY(-4px)' }
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)'
                  e.currentTarget.style.borderColor = 'var(--accent)'
                  e.currentTarget.style.boxShadow = 'var(--shadow-lg)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.borderColor = 'var(--border)'
                  e.currentTarget.style.boxShadow = 'none'
                }}>
                  <div style={{ fontSize: 40, marginBottom: 16 }}>🎥</div>
                  <h3 style={{ fontSize: 20, fontWeight: 600, margin: '0 0 8px 0' }}>
                    Browse Movies
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: 14 }}>
                    Explore our collection of movies and rate your favorites
                  </p>
                </div>
              </Link>

              <Link href="/reports" style={{ textDecoration: 'none' }}>
                <div style={{
                  background: 'var(--panel)',
                  borderRadius: 'var(--radius)',
                  border: '1px solid var(--border)',
                  padding: 32,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)'
                  e.currentTarget.style.borderColor = 'var(--accent)'
                  e.currentTarget.style.boxShadow = 'var(--shadow-lg)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.borderColor = 'var(--border)'
                  e.currentTarget.style.boxShadow = 'none'
                }}>
                  <div style={{ fontSize: 40, marginBottom: 16 }}>📊</div>
                  <h3 style={{ fontSize: 20, fontWeight: 600, margin: '0 0 8px 0' }}>
                    View Reports
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: 14 }}>
                    Check movie statistics, profits, and analytics
                  </p>
                </div>
              </Link>
            </div>

          </div>
        </main>
      )}
      
      <Footer />
    </div>
  )
}
