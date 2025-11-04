import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import { getUserInfo } from '../../utils/auth'

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

export default function AdminPersons() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [persons, setPersons] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingPerson, setEditingPerson] = useState(null)
  const [formData, setFormData] = useState({ name: '', date_of_birth: '', gender: '' })
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
    fetchPersons()
  }, [])

  const fetchPersons = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/persons`)
      if (res.ok) {
        const data = await res.json()
        setPersons(data)
      }
    } catch (err) {
      console.error('Failed to fetch persons', err)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    router.push('/')
  }

  const handleAdd = () => {
    setEditingPerson(null)
    setFormData({ name: '', date_of_birth: '', gender: '' })
    setShowModal(true)
    setMessage('')
  }

  const handleEdit = (person) => {
    setEditingPerson(person)
    setFormData({ 
      name: person.name, 
      date_of_birth: person.date_of_birth ? person.date_of_birth.split('T')[0] : '',
      gender: person.gender || ''
    })
    setShowModal(true)
    setMessage('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage('')

    try {
      const token = localStorage.getItem('token')
      const url = editingPerson 
        ? `${apiUrl}/api/persons/${editingPerson.person_id}`
        : `${apiUrl}/api/persons`
      
      const res = await fetch(url, {
        method: editingPerson ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      const data = await res.json()
      
      if (!res.ok) throw new Error(data.error || 'Operation failed')

      setMessage(editingPerson ? '✓ Person updated!' : '✓ Person added!')
      await fetchPersons()
      setTimeout(() => {
        setShowModal(false)
        setMessage('')
      }, 1500)
    } catch (err) {
      setMessage(err.message)
    }
  }

  const handleDelete = async (person) => {
    if (!confirm(`Delete "${person.name}"? They will be removed from all movies.`)) return

    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${apiUrl}/api/persons/${person.person_id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Delete failed')
      }

      await fetchPersons()
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
                👥 Persons Management
              </h1>
              <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
                {persons.length} persons in database
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
                cursor: 'pointer'
              }}
            >
              + Add Person
            </button>
          </div>

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
                  <th style={{ padding: 16, textAlign: 'left', fontSize: 13, fontWeight: 600, color: 'var(--muted)' }}>Name</th>
                  <th style={{ padding: 16, textAlign: 'left', fontSize: 13, fontWeight: 600, color: 'var(--muted)' }}>Date of Birth</th>
                  <th style={{ padding: 16, textAlign: 'left', fontSize: 13, fontWeight: 600, color: 'var(--muted)' }}>Gender</th>
                  <th style={{ padding: 16, textAlign: 'right', fontSize: 13, fontWeight: 600, color: 'var(--muted)' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {persons.map((person, index) => (
                  <tr 
                    key={person.person_id}
                    style={{ 
                      borderBottom: index < persons.length - 1 ? '1px solid var(--border)' : 'none',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--card)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: 16, fontSize: 14 }}>{person.person_id}</td>
                    <td style={{ padding: 16, fontSize: 14, fontWeight: 600 }}>{person.name}</td>
                    <td style={{ padding: 16, fontSize: 14 }}>
                      {person.date_of_birth ? new Date(person.date_of_birth).toLocaleDateString() : 'N/A'}
                    </td>
                    <td style={{ padding: 16, fontSize: 14 }}>
                      {person.gender === 'M' ? 'Male' : person.gender === 'F' ? 'Female' : person.gender === 'O' ? 'Other' : 'N/A'}
                    </td>
                    <td style={{ padding: 16, textAlign: 'right' }}>
                      <button
                        onClick={() => handleEdit(person)}
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
                        onClick={() => handleDelete(person)}
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
              {editingPerson ? 'Edit Person' : 'Add New Person'}
            </h2>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500 }}>
                  Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500 }}>
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
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
                  Gender
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
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
                  <option value="">Select...</option>
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                  <option value="O">Other</option>
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
                  {editingPerson ? 'Update' : 'Add'} Person
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
