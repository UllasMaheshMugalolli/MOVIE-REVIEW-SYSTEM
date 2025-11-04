import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import { getUserInfo } from '../../utils/auth'

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

export default function AdminCastCrew() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [movies, setMovies] = useState([])
  const [persons, setPersons] = useState([])
  const [selectedMovie, setSelectedMovie] = useState('')
  const [selectedPerson, setSelectedPerson] = useState('')
  const [selectedRole, setSelectedRole] = useState('Actor')
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
    fetchMovies()
    fetchPersons()
  }, [])

  const fetchMovies = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/movies`)
      if (res.ok) setMovies(await res.json())
    } catch (err) {
      console.error(err)
    }
  }

  const fetchPersons = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/persons`)
      if (res.ok) setPersons(await res.json())
    } catch (err) {
      console.error(err)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    router.push('/')
  }

  const handleAssign = async (e) => {
    e.preventDefault()
    setMessage('')

    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${apiUrl}/api/persons/movie-role`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          movie_id: parseInt(selectedMovie),
          person_id: parseInt(selectedPerson),
          role: selectedRole
        })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Assignment failed')

      setMessage('✓ Person assigned to movie successfully!')
      setSelectedMovie('')
      setSelectedPerson('')
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      setMessage(err.message)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar isLoggedIn={isLoggedIn} isAdmin={isAdmin} onLogout={handleLogout} />
      
      <main style={{ flex: 1, padding: '48px 24px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          
          <Link href="/admin" style={{ color: 'var(--accent)', textDecoration: 'none', fontSize: 14, marginBottom: 8, display: 'inline-block' }}>
            ← Back to Dashboard
          </Link>
          <h1 style={{ fontSize: 32, fontWeight: 700, margin: '0 0 8px 0' }}>
            🎭 Cast & Crew Assignment
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: '0 0 32px 0' }}>
            Assign actors, directors, and producers to movies
          </p>

          <div style={{
            background: 'var(--panel)',
            borderRadius: 'var(--radius)',
            border: '1px solid var(--border)',
            padding: 32
          }}>
            <form onSubmit={handleAssign}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500 }}>
                  Select Movie *
                </label>
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
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500 }}>
                  Select Person *
                </label>
                <select
                  value={selectedPerson}
                  onChange={(e) => setSelectedPerson(e.target.value)}
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
                  <option value="">Choose a person...</option>
                  {persons.map(person => (
                    <option key={person.person_id} value={person.person_id}>
                      {person.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500 }}>
                  Role *
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
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
                  <option value="Actor">Actor</option>
                  <option value="Director">Director</option>
                  <option value="Producer">Producer</option>
                </select>
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
                Assign to Movie
              </button>
            </form>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  )
}
