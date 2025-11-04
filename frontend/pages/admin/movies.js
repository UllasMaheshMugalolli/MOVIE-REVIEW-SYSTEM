import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import { getUserInfo } from '../../utils/auth'

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

export default function AdminMovies() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingMovie, setEditingMovie] = useState(null)
  const [formData, setFormData] = useState({ title: '', release_date: '' })
  const [message, setMessage] = useState('')

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
    fetchMovies()
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
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    router.push('/')
  }

  const handleAdd = () => {
    setEditingMovie(null)
    setFormData({ title: '', release_date: '' })
    setShowModal(true)
    setMessage('')
  }

  const handleEdit = (movie) => {
    setEditingMovie(movie)
    setFormData({ 
      title: movie.title, 
      release_date: movie.release_date ? movie.release_date.split('T')[0] : '' 
    })
    setShowModal(true)
    setMessage('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage('')

    try {
      const token = localStorage.getItem('token')
      const url = editingMovie 
        ? `${apiUrl}/api/movies/${editingMovie.movie_id}`
        : `${apiUrl}/api/movies`
      
      const res = await fetch(url, {
        method: editingMovie ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      const data = await res.json()
      
      if (!res.ok) throw new Error(data.error || 'Operation failed')

      setMessage(editingMovie ? '✓ Movie updated!' : '✓ Movie added!')
      await fetchMovies()
      setTimeout(() => {
        setShowModal(false)
        setMessage('')
      }, 1500)
    } catch (err) {
      setMessage(err.message)
    }
  }

  const handleDelete = async (movie) => {
    if (!confirm(`Delete "${movie.title}"? This will also delete all related data.`)) return

    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${apiUrl}/api/movies/${movie.movie_id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Delete failed')
      }

      await fetchMovies()
    } catch (err) {
      alert(err.message)
    }
  }

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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
            <div>
              <Link href="/admin" style={{ 
                color: 'var(--accent)', 
                textDecoration: 'none', 
                fontSize: 14,
                marginBottom: 8,
                display: 'inline-block'
              }}>
                ← Back to Dashboard
              </Link>
              <h1 style={{ fontSize: 32, fontWeight: 700, margin: '0 0 8px 0' }}>
                🎬 Movies Management
              </h1>
              <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
                {movies.length} movies in database
              </p>
            </div>
            <button 
              onClick={handleAdd}
              style={{
                background: 'var(--accent)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--radius)',
                padding: '12px 24px',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              + Add Movie
            </button>
          </div>

          {/* Movies Table */}
          <div style={{
            background: 'var(--panel)',
            borderRadius: 'var(--radius)',
            border: '1px solid var(--border)',
            overflow: 'hidden'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--card)', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: 16, textAlign: 'left', fontSize: 13, fontWeight: 600, color: 'var(--muted)' }}>ID</th>
                  <th style={{ padding: 16, textAlign: 'left', fontSize: 13, fontWeight: 600, color: 'var(--muted)' }}>Title</th>
                  <th style={{ padding: 16, textAlign: 'left', fontSize: 13, fontWeight: 600, color: 'var(--muted)' }}>Release Date</th>
                  <th style={{ padding: 16, textAlign: 'left', fontSize: 13, fontWeight: 600, color: 'var(--muted)' }}>Avg Rating</th>
                  <th style={{ padding: 16, textAlign: 'right', fontSize: 13, fontWeight: 600, color: 'var(--muted)' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {movies.map((movie, index) => (
                  <tr 
                    key={movie.movie_id}
                    style={{ 
                      borderBottom: index < movies.length - 1 ? '1px solid var(--border)' : 'none',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--card)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: 16, fontSize: 14 }}>{movie.movie_id}</td>
                    <td style={{ padding: 16, fontSize: 14, fontWeight: 600 }}>{movie.title}</td>
                    <td style={{ padding: 16, fontSize: 14 }}>
                      {movie.release_date ? new Date(movie.release_date).toLocaleDateString() : 'N/A'}
                    </td>
                    <td style={{ padding: 16, fontSize: 14 }}>
                      {movie.avg_rating ? `⭐ ${parseFloat(movie.avg_rating).toFixed(1)}` : 'N/A'}
                    </td>
                    <td style={{ padding: 16, textAlign: 'right' }}>
                      <button
                        onClick={() => handleEdit(movie)}
                        style={{
                          background: 'transparent',
                          color: 'var(--accent)',
                          border: '1px solid var(--accent)',
                          borderRadius: 6,
                          padding: '6px 12px',
                          fontSize: 13,
                          cursor: 'pointer',
                          marginRight: 8
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(movie)}
                        style={{
                          background: 'transparent',
                          color: '#ef4444',
                          border: '1px solid #ef4444',
                          borderRadius: 6,
                          padding: '6px 12px',
                          fontSize: 13,
                          cursor: 'pointer'
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}
        onClick={() => setShowModal(false)}
        >
          <div 
            style={{
              background: 'var(--panel)',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--border)',
              padding: 32,
              maxWidth: 500,
              width: '100%',
              margin: 24
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ fontSize: 24, fontWeight: 600, margin: '0 0 24px 0' }}>
              {editingMovie ? 'Edit Movie' : 'Add New Movie'}
            </h2>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500 }}>
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
                />
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500 }}>
                  Release Date *
                </label>
                <input
                  type="date"
                  value={formData.release_date}
                  onChange={(e) => setFormData({ ...formData, release_date: e.target.value })}
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
                />
              </div>

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

              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    background: 'var(--accent)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 6,
                    padding: 12,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {editingMovie ? 'Update' : 'Add'} Movie
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    flex: 1,
                    background: 'transparent',
                    color: 'var(--text)',
                    border: '1px solid var(--border)',
                    borderRadius: 6,
                    padding: 12,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}
