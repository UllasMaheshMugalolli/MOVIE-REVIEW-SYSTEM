import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

export default function MovieDetails() {
  const router = useRouter()
  const { id } = router.query
  
  const [movie, setMovie] = useState(null)
  const [cast, setCast] = useState([])
  const [ratings, setRatings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  
  // Add rating form state
  const [numericRating, setNumericRating] = useState('10')
  const [verbalRating, setVerbalRating] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [ratingMessage, setRatingMessage] = useState('')
  
  // Edit rating state
  const [editingRatingId, setEditingRatingId] = useState(null)
  const [editNumericRating, setEditNumericRating] = useState('')
  const [editVerbalRating, setEditVerbalRating] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('token')
    setIsLoggedIn(!!token)
    
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        setCurrentUser(payload)
      } catch (e) {
        console.error('Failed to parse token', e)
      }
    }
    
    if (id) {
      fetchMovieDetails()
    }
  }, [id])

  const fetchMovieDetails = async () => {
    try {
      setLoading(true)
      
      // Fetch movie details
      const movieRes = await fetch(`${apiUrl}/api/movies/${id}`)
      if (!movieRes.ok) throw new Error('Failed to fetch movie')
      const movieData = await movieRes.json()
      
      // Backend returns { movie, genres, people, ratings }
      setMovie(movieData.movie)
      setCast(movieData.people || [])
      
      // Fetch ratings for this movie
      fetchRatings()
      
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchRatings = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/ratings/movie/${id}`)
      if (res.ok) {
        const data = await res.json()
        setRatings(data)
      }
    } catch (err) {
      console.error('Failed to fetch ratings', err)
    }
  }

  const handleAddRating = async (e) => {
    e.preventDefault()
    if (!isLoggedIn) {
      setRatingMessage('Please login to add a rating')
      return
    }
    
    setSubmitting(true)
    setRatingMessage('')
    
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${apiUrl}/api/ratings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          movie_id: parseInt(id),
          numeric_rating: parseInt(numericRating),
          verbal_rating: verbalRating
        })
      })
      
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to add rating')
      
      setRatingMessage('✓ Rating added successfully!')
      setVerbalRating('')
      setNumericRating('10')
      
      // Refresh movie details to show updated avg_rating
      await fetchMovieDetails()
      await fetchRatings()
      
    } catch (err) {
      setRatingMessage(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditRating = async (ratingId) => {
    if (!editNumericRating || !editVerbalRating) return
    
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${apiUrl}/api/ratings/${ratingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          numeric_rating: parseInt(editNumericRating),
          verbal_rating: editVerbalRating
        })
      })
      
      if (!res.ok) throw new Error('Failed to update rating')
      
      setEditingRatingId(null)
      await fetchMovieDetails()
      await fetchRatings()
      
    } catch (err) {
      alert(err.message)
    }
  }

  const handleDeleteRating = async (ratingId) => {
    if (!confirm('Are you sure you want to delete this rating?')) return
    
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${apiUrl}/api/ratings/${ratingId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!res.ok) throw new Error('Failed to delete rating')
      
      await fetchMovieDetails()
      await fetchRatings()
      
    } catch (err) {
      alert(err.message)
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

  if (error || !movie) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar isLoggedIn={isLoggedIn} onLogout={handleLogout} />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ color: 'var(--danger)' }}>Error: {error || 'Movie not found'}</div>
        </div>
        <Footer />
      </div>
    )
  }

  const releaseDate = movie.release_date 
    ? new Date(movie.release_date.split('T')[0]).toLocaleDateString('en-US', { 
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
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          
          {/* Back Button */}
          <Link href="/movies" style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: 8,
            color: 'var(--accent)',
            textDecoration: 'none',
            fontSize: 14,
            fontWeight: 500,
            marginBottom: 24,
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.gap = '12px'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.gap = '8px'
          }}>
            <span style={{ fontSize: 18 }}>←</span>
            Back to Movies
          </Link>
          
          {/* Movie Header */}
          <div style={{
            background: 'var(--panel)',
            borderRadius: 'var(--radius)',
            border: '1px solid var(--border)',
            padding: 32,
            marginBottom: 32
          }}>
            <h1 style={{ fontSize: 36, fontWeight: 700, margin: '0 0 16px 0' }}>
              {movie.title}
            </h1>
            
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: 16 }}>
              <div>
                <span style={{ color: 'var(--muted)', fontSize: 14 }}>Release Date:</span>
                <div style={{ fontSize: 16, color: 'var(--text)' }}>{releaseDate}</div>
              </div>
              
              <div>
                <span style={{ color: 'var(--muted)', fontSize: 14 }}>Average Rating:</span>
                <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--accent)' }}>
                  {movie.avg_rating != null && movie.avg_rating > 0 
                    ? `⭐ ${parseFloat(movie.avg_rating).toFixed(1)}/10` 
                    : 'No ratings yet'}
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, marginBottom: 32 }}>
            
            {/* Cast & Crew Section */}
            <div style={{
              background: 'var(--panel)',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--border)',
              padding: 24
            }}>
              <h2 style={{ fontSize: 24, fontWeight: 600, margin: '0 0 20px 0' }}>
                Cast & Crew
              </h2>
              
              {cast.length === 0 ? (
                <div style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                  No cast information available
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {cast.map(person => (
                    <Link
                      key={person.person_id}
                      href={`/persons/${person.person_id}`}
                      style={{
                        padding: 12,
                        background: 'var(--card)',
                        borderRadius: 8,
                        border: '1px solid var(--border)',
                        textDecoration: 'none',
                        color: 'inherit',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'var(--accent)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--border)'
                      }}
                    >
                      <div style={{ fontWeight: 600, marginBottom: 4 }}>{person.name}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                        Role: Actor/Director
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Ratings Section */}
            <div style={{
              background: 'var(--panel)',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--border)',
              padding: 24
            }}>
              <h2 style={{ fontSize: 24, fontWeight: 600, margin: '0 0 20px 0' }}>
                Ratings & Reviews
              </h2>
              
              {/* Add Rating Form */}
              {isLoggedIn && (
                <form onSubmit={handleAddRating} style={{ marginBottom: 24 }}>
                  <div style={{ marginBottom: 12 }}>
                    <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 500 }}>
                      Your Rating (1-10)
                    </label>
                    <select
                      value={numericRating}
                      onChange={(e) => setNumericRating(e.target.value)}
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
                      {[1,2,3,4,5,6,7,8,9,10].map(n => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div style={{ marginBottom: 12 }}>
                    <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 500 }}>
                      Your Review
                    </label>
                    <textarea
                      value={verbalRating}
                      onChange={(e) => setVerbalRating(e.target.value)}
                      placeholder="Share your thoughts about this movie..."
                      rows={3}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: 8,
                        border: '1px solid var(--border)',
                        background: 'var(--card)',
                        color: 'var(--text)',
                        fontSize: 15,
                        resize: 'vertical'
                      }}
                    />
                  </div>
                  
                  <button 
                    type="submit" 
                    className="btn" 
                    disabled={submitting}
                    style={{ width: '100%' }}
                  >
                    {submitting ? 'Submitting...' : 'Submit Rating'}
                  </button>
                  
                  {ratingMessage && (
                    <div style={{
                      marginTop: 12,
                      padding: 12,
                      borderRadius: 8,
                      background: ratingMessage.includes('✓') 
                        ? 'rgba(16, 185, 129, 0.1)' 
                        : 'rgba(239, 68, 68, 0.1)',
                      border: `1px solid ${ratingMessage.includes('✓') 
                        ? 'rgba(16, 185, 129, 0.2)' 
                        : 'rgba(239, 68, 68, 0.2)'}`,
                      color: ratingMessage.includes('✓') ? 'var(--success)' : 'var(--danger)',
                      fontSize: 14
                    }}>
                      {ratingMessage}
                    </div>
                  )}
                </form>
              )}
              
              {!isLoggedIn && (
                <div style={{
                  padding: 16,
                  background: 'var(--card)',
                  borderRadius: 8,
                  border: '1px solid var(--border)',
                  textAlign: 'center',
                  marginBottom: 24
                }}>
                  <p style={{ margin: '0 0 12px 0', color: 'var(--text-secondary)' }}>
                    Please login to add a rating
                  </p>
                  <Link href="/login" className="btn">
                    Sign In
                  </Link>
                </div>
              )}
              
              {/* Ratings List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {ratings.length === 0 ? (
                  <div style={{ color: 'var(--text-secondary)', fontSize: 14, textAlign: 'center', padding: 20 }}>
                    No ratings yet. Be the first to rate this movie!
                  </div>
                ) : (
                  ratings.map(rating => (
                    <div
                      key={rating.rating_id}
                      style={{
                        padding: 12,
                        background: 'var(--card)',
                        borderRadius: 8,
                        border: '1px solid var(--border)'
                      }}
                    >
                      {editingRatingId === rating.rating_id ? (
                        <div>
                          <input
                            type="number"
                            min="1"
                            max="10"
                            value={editNumericRating}
                            onChange={(e) => setEditNumericRating(e.target.value)}
                            style={{ marginBottom: 8, width: '100%' }}
                          />
                          <textarea
                            value={editVerbalRating}
                            onChange={(e) => setEditVerbalRating(e.target.value)}
                            rows={2}
                            style={{ marginBottom: 8, width: '100%' }}
                          />
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button 
                              onClick={() => handleEditRating(rating.rating_id)}
                              className="btn"
                              style={{ padding: '6px 12px', fontSize: 13 }}
                            >
                              Save
                            </button>
                            <button 
                              onClick={() => setEditingRatingId(null)}
                              className="btn secondary"
                              style={{ padding: '6px 12px', fontSize: 13 }}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                            <span style={{ fontWeight: 600, color: 'var(--accent)' }}>
                              ⭐ {rating.numeric_rating}/10
                            </span>
                            {currentUser && currentUser.user_id === rating.user_id && (
                              <div style={{ display: 'flex', gap: 8 }}>
                                <button
                                  onClick={() => {
                                    setEditingRatingId(rating.rating_id)
                                    setEditNumericRating(rating.numeric_rating)
                                    setEditVerbalRating(rating.verbal_rating)
                                  }}
                                  style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: 'var(--accent)',
                                    cursor: 'pointer',
                                    fontSize: 13
                                  }}
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteRating(rating.rating_id)}
                                  style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: 'var(--danger)',
                                    cursor: 'pointer',
                                    fontSize: 13
                                  }}
                                >
                                  Delete
                                </button>
                              </div>
                            )}
                          </div>
                          <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
                            {rating.verbal_rating}
                          </div>
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
