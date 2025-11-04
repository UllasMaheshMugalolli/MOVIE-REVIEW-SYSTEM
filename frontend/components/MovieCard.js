import Link from 'next/link'

export default function MovieCard({ movie }) {
  const releaseDate = movie.release_date 
    ? new Date(movie.release_date).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      })
    : 'Unknown'
  
  const avgRating = movie.avg_rating != null ? movie.avg_rating : 'N/A'

  return (
    <Link 
      href={`/movies/${movie.movie_id}`}
      style={{
        display: 'block',
        background: 'var(--panel)',
        borderRadius: 'var(--radius)',
        border: '1px solid var(--border)',
        padding: 20,
        transition: 'all 0.2s ease',
        textDecoration: 'none',
        color: 'inherit'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)'
        e.currentTarget.style.boxShadow = 'var(--shadow-md)'
        e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = 'none'
        e.currentTarget.style.borderColor = 'var(--border)'
      }}
    >
      <h3 style={{ 
        fontSize: 18, 
        fontWeight: 600, 
        margin: '0 0 12px 0',
        color: 'var(--text)'
      }}>
        {movie.title}
      </h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
          <span style={{ color: 'var(--muted)' }}>Release:</span> {releaseDate}
        </div>
        
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 6,
          fontSize: 14
        }}>
          <span style={{ color: 'var(--muted)' }}>Rating:</span>
          <span style={{ 
            fontSize: 18, 
            fontWeight: 700,
            color: avgRating !== 'N/A' ? 'var(--accent)' : 'var(--muted)'
          }}>
            {avgRating !== 'N/A' ? `⭐ ${avgRating}` : 'N/A'}
          </span>
        </div>
      </div>
    </Link>
  )
}
