import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

export default function PersonDetails() {
  const router = useRouter()
  const { id } = router.query
  
  const [person, setPerson] = useState(null)
  const [age, setAge] = useState(null)
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    setIsLoggedIn(!!token)
    
    if (id) {
      fetchPersonDetails()
    }
  }, [id])

  const fetchPersonDetails = async () => {
    try {
      setLoading(true)
      
      // Fetch person details
      const personRes = await fetch(`${apiUrl}/api/persons/${id}`)
      if (!personRes.ok) throw new Error('Failed to fetch person details')
      const personData = await personRes.json()
      
      // Backend returns { person, age, movies }
      setPerson(personData.person)
      setAge(personData.age)
      setMovies(personData.movies || [])
      
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

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar isLoggedIn={isLoggedIn} onLogout={handleLogout} />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ color: 'var(--text-secondary)' }}>Loading...</div>
        </div>
        <Footer />
      </div>
    )
  }

  if (error || !person) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar isLoggedIn={isLoggedIn} onLogout={handleLogout} />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ color: 'var(--danger)' }}>Error: {error || 'Person not found'}</div>
        </div>
        <Footer />
      </div>
    )
  }

  const dob = person.date_of_birth 
    ? new Date(person.date_of_birth.split('T')[0]).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        timeZone: 'UTC'
      })
    : 'Unknown'

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar isLoggedIn={isLoggedIn} onLogout={handleLogout} />
      
      <main style={{ flex: 1, padding: '48px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          
          {/* Back Button */}
          <button
            onClick={() => router.back()}
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: 8,
              color: 'var(--accent)',
              background: 'none',
              border: 'none',
              fontSize: 14,
              fontWeight: 500,
              marginBottom: 24,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              padding: 0
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.gap = '12px'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.gap = '8px'
            }}
          >
            <span style={{ fontSize: 18 }}>←</span>
            Back
          </button>
          
          {/* Person Header */}
          <div style={{
            background: 'var(--panel)',
            borderRadius: 'var(--radius)',
            border: '1px solid var(--border)',
            padding: 32,
            marginBottom: 32
          }}>
            <h1 style={{ fontSize: 36, fontWeight: 700, margin: '0 0 24px 0' }}>
              {person.name}
            </h1>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24 }}>
              <div>
                <span style={{ color: 'var(--muted)', fontSize: 14, display: 'block', marginBottom: 4 }}>
                  Date of Birth
                </span>
                <div style={{ fontSize: 18, color: 'var(--text)' }}>{dob}</div>
              </div>
              
              <div>
                <span style={{ color: 'var(--muted)', fontSize: 14, display: 'block', marginBottom: 4 }}>
                  Age (Calculated)
                </span>
                <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--accent)' }}>
                  {age !== null ? `${age} years` : 'N/A'}
                </div>
              </div>
            </div>
          </div>

          {/* Movies */}
          {movies && movies.length > 0 && (
            <div style={{
              background: 'var(--panel)',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--border)',
              padding: 24
            }}>
              <h2 style={{ fontSize: 24, fontWeight: 600, margin: '0 0 20px 0' }}>
                Movies & Roles
              </h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {movies.map((movie, index) => (
                  <Link
                    key={index}
                    href={`/movies/${movie.movie_id}`}
                    style={{
                      padding: 16,
                      background: 'var(--card)',
                      borderRadius: 8,
                      border: '1px solid var(--border)',
                      textDecoration: 'none',
                      color: 'inherit',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--accent)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border)'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, marginBottom: 4 }}>{movie.title}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                        Role: {movie.role || 'N/A'}
                      </div>
                    </div>
                    <div style={{ color: 'var(--accent)' }}>→</div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
