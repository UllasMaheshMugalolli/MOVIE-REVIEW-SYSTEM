export default function Footer() {
  return (
    <footer style={{ 
      textAlign: 'center', 
      padding: '24px',
      borderTop: '1px solid var(--border)',
      marginTop: 'auto'
    }}>
      <p style={{ margin: 0, fontSize: 13, color: 'var(--muted)' }}>
        © 2025 Movie Review System. Built with Next.js & Express.
      </p>
    </footer>
  )
}
