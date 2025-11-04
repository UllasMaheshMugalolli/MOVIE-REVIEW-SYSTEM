import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import { getUserInfo } from '../../utils/auth'

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

export default function AdminDashboard() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    const userInfo = getUserInfo()
    if (!userInfo || !userInfo.is_admin) {
      alert('Access denied. Admin privileges required.')
      router.push('/')
      return
    }

    setIsLoggedIn(true)
    setIsAdmin(true)
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/movies/stats/aggregate`)
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
    } catch (err) {
      console.error('Failed to fetch stats', err)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    setIsLoggedIn(false)
    router.push('/')
  }

  const adminSections = [
    {
      title: 'Movies Management',
      icon: '🎬',
      description: 'Add, edit, and delete movies',
      link: '/admin/movies',
      color: '#3b82f6'
    },
    {
      title: 'Persons Management',
      icon: '👥',
      description: 'Manage actors, directors, and producers',
      link: '/admin/persons',
      color: '#8b5cf6'
    },
    {
      title: 'Cast & Crew',
      icon: '🎭',
      description: 'Assign persons to movies with roles',
      link: '/admin/cast-crew',
      color: '#ec4899'
    },
    {
      title: 'Genres Management',
      icon: '🎪',
      description: 'Create and assign genres',
      link: '/admin/genres',
      color: '#f59e0b'
    },
    {
      title: 'Revenue Management',
      icon: '💰',
      description: 'Track financial data',
      link: '/admin/revenue',
      color: '#10b981'
    }
  ]

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar isLoggedIn={isLoggedIn} isAdmin={isAdmin} onLogout={handleLogout} />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ color: 'var(--text-secondary)' }}>Loading...</div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar isLoggedIn={isLoggedIn} isAdmin={isAdmin} onLogout={handleLogout} />
      
      <main style={{ flex: 1, padding: '48px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          
          {/* Header */}
          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontSize: 32, fontWeight: 700, margin: '0 0 8px 0' }}>
              ⚙️ Admin Dashboard
            </h1>
            <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
              Manage movies, persons, cast, crew, genres, and revenue
            </p>
          </div>

          {/* Stats Cards */}
          {stats && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 16,
              marginBottom: 32
            }}>
              <div style={{
                background: 'var(--panel)',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border)',
                padding: 20,
                textAlign: 'center'
              }}>
                <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--accent)', marginBottom: 8 }}>
                  {stats.totalMovies}
                </div>
                <div style={{ fontSize: 13, color: 'var(--muted)' }}>Total Movies</div>
              </div>
              
              <div style={{
                background: 'var(--panel)',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border)',
                padding: 20,
                textAlign: 'center'
              }}>
                <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--accent)', marginBottom: 8 }}>
                  {stats.totalRatings}
                </div>
                <div style={{ fontSize: 13, color: 'var(--muted)' }}>Total Ratings</div>
              </div>
              
              <div style={{
                background: 'var(--panel)',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border)',
                padding: 20,
                textAlign: 'center'
              }}>
                <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--accent)', marginBottom: 8 }}>
                  {stats.totalUsers}
                </div>
                <div style={{ fontSize: 13, color: 'var(--muted)' }}>Total Users</div>
              </div>
              
              <div style={{
                background: 'var(--panel)',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border)',
                padding: 20,
                textAlign: 'center'
              }}>
                <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--accent)', marginBottom: 8 }}>
                  {stats.moviesWithRevenue || 0}
                </div>
                <div style={{ fontSize: 13, color: 'var(--muted)' }}>Movies w/ Revenue</div>
              </div>
            </div>
          )}

          {/* Admin Sections */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 24
          }}>
            {adminSections.map((section, index) => (
              <Link
                key={index}
                href={section.link}
                style={{
                  textDecoration: 'none',
                  background: 'var(--panel)',
                  borderRadius: 'var(--radius)',
                  border: '1px solid var(--border)',
                  padding: 32,
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)'
                  e.currentTarget.style.borderColor = section.color
                  e.currentTarget.style.boxShadow = 'var(--shadow-lg)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.borderColor = 'var(--border)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                <div style={{ fontSize: 48, marginBottom: 16 }}>{section.icon}</div>
                <h3 style={{ 
                  fontSize: 20, 
                  fontWeight: 600, 
                  margin: '0 0 8px 0',
                  color: 'var(--text)'
                }}>
                  {section.title}
                </h3>
                <p style={{ 
                  color: 'var(--text-secondary)', 
                  margin: 0, 
                  fontSize: 14 
                }}>
                  {section.description}
                </p>
              </Link>
            ))}
          </div>

        </div>
      </main>

      <Footer />
    </div>
  )
}
