import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import MovieCard from '../components/MovieCard'

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

export default function MoviesPage() {
  const router = useRouter()
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    setIsLoggedIn(!!token)
    fetchMovies()
  }, [])

  const fetchMovies = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/movies`)
      if (!res.ok) throw new Error('Failed to fetch movies')
      const data = await res.json()
      setMovies(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    setIsLoggedIn(false)
    router.push('/')
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar isLoggedIn={isLoggedIn} onLogout={handleLogout} />
      
      <main style={{ flex: 1, padding: '48px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontSize: 32, fontWeight: 700, margin: '0 0 8px 0' }}>
              Browse Movies
            </h1>
            <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
              Discover and explore our collection of movies
            </p>
          </div>

          {loading && (
            <div style={{ textAlign: 'center', padding: 48, color: 'var(--text-secondary)' }}>
              Loading movies...
            </div>
          )}

          {error && (
            <div style={{
              padding: 16,
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: 8,
              color: 'var(--danger)'
            }}>
              Error: {error}
            </div>
          )}

          {!loading && !error && movies.length === 0 && (
            <div style={{ textAlign: 'center', padding: 48, color: 'var(--text-secondary)' }}>
              No movies found
            </div>
          )}

          {!loading && !error && movies.length > 0 && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 20
            }}>
              {movies.map(movie => (
                <MovieCard key={movie.movie_id} movie={movie} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
