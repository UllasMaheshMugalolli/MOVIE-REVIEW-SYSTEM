import Link from 'next/link'

export default function LandingHero() {
  return (
    <div style={{ 
      flex: 1,
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '48px 24px',
      position: 'relative'
    }}>
      {/* Background decoration */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at 30% 40%, rgba(59, 130, 246, 0.15) 0%, transparent 50%), radial-gradient(circle at 70% 60%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)',
        pointerEvents: 'none'
      }} />

      <div style={{ maxWidth: 900, width: '100%', position: 'relative', zIndex: 1 }}>
        {/* Logo/Title */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🎬</div>
          <h1 style={{ 
            fontSize: 48, 
            fontWeight: 700, 
            margin: '0 0 16px 0',
            background: 'linear-gradient(135deg, var(--text) 0%, var(--text-secondary) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Movie Review System
          </h1>
          <p style={{ fontSize: 20, color: 'var(--text-secondary)', margin: 0 }}>
            Discover, rate, and review your favorite movies
          </p>
        </div>

        {/* Main Content Card */}
        <div style={{
          background: 'var(--panel)',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border)',
          padding: 48,
          boxShadow: 'var(--shadow-lg)',
          textAlign: 'center'
        }}>
          <h2 style={{ fontSize: 28, margin: '0 0 16px 0', fontWeight: 600 }}>
            Join Our Community
          </h2>
          <p style={{ 
            color: 'var(--text-secondary)', 
            fontSize: 16, 
            lineHeight: 1.7, 
            marginBottom: 32,
            maxWidth: 600,
            marginLeft: 'auto',
            marginRight: 'auto'
          }}>
            Share your opinions, discover hidden gems, and connect with fellow movie enthusiasts. 
            Create an account to start rating and reviewing movies today.
          </p>
          
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/signup" className="btn" style={{ minWidth: 180, fontSize: 16, padding: '14px 28px' }}>
              Get Started
            </Link>
            <Link href="/login" className="btn secondary" style={{ minWidth: 180, fontSize: 16, padding: '14px 28px' }}>
              Sign In
            </Link>
          </div>

          {/* Features */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: 24, 
            marginTop: 48,
            textAlign: 'left'
          }}>
            <div>
              <div style={{ fontSize: 32, marginBottom: 8 }}>⭐</div>
              <h3 style={{ fontSize: 16, margin: '0 0 8px 0', color: 'var(--text)' }}>Rate Movies</h3>
              <p style={{ fontSize: 14, margin: 0, color: 'var(--text-secondary)' }}>
                Share your ratings and help others discover great films
              </p>
            </div>
            <div>
              <div style={{ fontSize: 32, marginBottom: 8 }}>📝</div>
              <h3 style={{ fontSize: 16, margin: '0 0 8px 0', color: 'var(--text)' }}>Write Reviews</h3>
              <p style={{ fontSize: 14, margin: 0, color: 'var(--text-secondary)' }}>
                Express your thoughts with detailed movie reviews
              </p>
            </div>
            <div>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🎯</div>
              <h3 style={{ fontSize: 16, margin: '0 0 8px 0', color: 'var(--text)' }}>Discover</h3>
              <p style={{ fontSize: 14, margin: 0, color: 'var(--text-secondary)' }}>
                Find movies based on ratings and community feedback
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
