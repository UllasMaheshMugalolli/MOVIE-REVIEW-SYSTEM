import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import { getUserInfo } from '../../utils/auth'

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

export default function AdminGenres() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [genres, setGenres] = useState([])
  const [movies, setMovies] = useState([])
  const [newGenreName, setNewGenreName] = useState('')
  const [selectedMovie, setSelectedMovie] = useState('')
  const [selectedGenre, setSelectedGenre] = useState('')
  const [message, setMessage] = useState('')

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
    fetchGenres()
    fetchMovies()
  }, [])

  const fetchGenres = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/genres`)
      if (res.ok) setGenres(await res.json())
    } catch (err) {
      console.error(err)
    }
  }

  const fetchMovies = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/movies`)
      if (res.ok) setMovies(await res.json())
    } catch (err) {
      console.error(err)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    router.push('/')
  }

  const handleAddGenre = async (e) => {
    e.preventDefault()
    setMessage('')

    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${apiUrl}/api/genres`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: newGenreName })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to add genre')

      setMessage('✓ Genre added successfully!')
      setNewGenreName('')
      await fetchGenres()
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      setMessage(err.message)
    }
  }

  const handleAssignGenre = async (e) => {
    e.preventDefault()
    setMessage('')

    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${apiUrl}/api/genres/movie`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          movie_id: parseInt(selectedMovie),
          genre_id: parseInt(selectedGenre)
        })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Assignment failed')

      setMessage('✓ Genre assigned to movie!')
      setSelectedMovie('')
      setSelectedGenre('')
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      setMessage(err.message)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar isLoggedIn={isLoggedIn} isAdmin={isAdmin} onLogout={handleLogout} />
      
      <main style={{ flex: 1, padding: '48px 24px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          
          <Link href="/admin" style={{ color: 'var(--accent)', textDecoration: 'none', fontSize: 14, marginBottom: 8, display: 'inline-block' }}>
            ← Back to Dashboard
          </Link>
          <h1 style={{ fontSize: 32, fontWeight: 700, margin: '0 0 32px 0' }}>
            🎪 Genres Management
          </h1>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            
            {/* Add Genre */}
            <div style={{
              background: 'var(--panel)',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--border)',
              padding: 24
            }}>
              <h2 style={{ fontSize: 20, fontWeight: 600, margin: '0 0 16px 0' }}>Add New Genre</h2>
              <form onSubmit={handleAddGenre}>
                <input
                  type="text"
                  value={newGenreName}
                  onChange={(e) => setNewGenreName(e.target.value)}
                  placeholder="Genre name"
                  required
                  style={{
                    width: '100%',
                    padding: 12,
                    background: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: 6,
                    color: 'var(--text)',
                    fontSize: 14,
                    marginBottom: 12
                  }}
                />
                <button
                  type="submit"
                  style={{
                    width: '100%',
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
                  Add Genre
                </button>
              </form>

              <div style={{ marginTop: 20 }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: 'var(--muted)' }}>
                  Existing Genres ({genres.length})
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {genres.map(genre => (
                    <div key={genre.genre_id} style={{
                      background: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: 6,
                      padding: '6px 12px',
                      fontSize: 13
                    }}>
                      {genre.name}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Assign Genre to Movie */}
            <div style={{
              background: 'var(--panel)',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--border)',
              padding: 24
            }}>
              <h2 style={{ fontSize: 20, fontWeight: 600, margin: '0 0 16px 0' }}>Assign Genre to Movie</h2>
              <form onSubmit={handleAssignGenre}>
                <select
                  value={selectedMovie}
                  onChange={(e) => setSelectedMovie(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: 12,
                    background: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: 6,
                    color: 'var(--text)',
                    fontSize: 14,
                    marginBottom: 12
                  }}
                >
                  <option value="">Select Movie...</option>
                  {movies.map(movie => (
                    <option key={movie.movie_id} value={movie.movie_id}>{movie.title}</option>
                  ))}
                </select>

                <select
                  value={selectedGenre}
                  onChange={(e) => setSelectedGenre(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: 12,
                    background: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: 6,
                    color: 'var(--text)',
                    fontSize: 14,
                    marginBottom: 12
                  }}
                >
                  <option value="">Select Genre...</option>
                  {genres.map(genre => (
                    <option key={genre.genre_id} value={genre.genre_id}>{genre.name}</option>
                  ))}
                </select>

                <button
                  type="submit"
                  style={{
                    width: '100%',
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
                  Assign Genre
                </button>
              </form>
            </div>

          </div>

          {message && (
            <div style={{ 
              padding: 12, 
              background: message.includes('✓') ? '#10b98122' : '#ef444422',
              border: `1px solid ${message.includes('✓') ? '#10b981' : '#ef4444'}`,
              borderRadius: 6,
              marginTop: 16,
              fontSize: 14
            }}>
              {message}
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  )
}
