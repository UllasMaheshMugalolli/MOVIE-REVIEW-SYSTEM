import Link from 'next/link'

export default function Navbar({ isLoggedIn, onLogout, isAdmin }) {
  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      background: 'rgba(10, 14, 26, 0.8)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      borderBottom: '1px solid var(--border)',
      padding: '16px 24px',
      zIndex: 100
    }}>
      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Link href="/" style={{ 
          fontSize: 20, 
          fontWeight: 700,
          color: 'var(--text)',
          textDecoration: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}>
          🎬 Movie Review
        </Link>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {isLoggedIn ? (
            <>
              <Link href="/movies" style={{ 
                color: 'var(--text)', 
                textDecoration: 'none', 
                fontSize: 14,
                padding: '8px 12px',
                borderRadius: 6,
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--card)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                Movies
              </Link>
              <Link href="/reports" style={{ 
                color: 'var(--text)', 
                textDecoration: 'none', 
                fontSize: 14,
                padding: '8px 12px',
                borderRadius: 6,
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--card)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                Reports
              </Link>
              {isAdmin && (
                <Link href="/admin" style={{ 
                  color: 'var(--accent)', 
                  textDecoration: 'none', 
                  fontSize: 14,
                  padding: '8px 12px',
                  borderRadius: 6,
                  border: '1px solid var(--accent)',
                  transition: 'all 0.2s',
                  fontWeight: 600
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--accent)'
                  e.currentTarget.style.color = 'white'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = 'var(--accent)'
                }}
                >
                  ⚙️ Admin
                </Link>
              )}
              <button onClick={onLogout} className="btn secondary" style={{ padding: '8px 16px' }}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn" style={{ padding: '8px 16px' }}>
                Sign In
              </Link>
              <Link href="/signup" className="btn secondary" style={{ padding: '8px 16px' }}>
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
