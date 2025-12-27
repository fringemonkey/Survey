import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../services/adminAuth'

function AdminLogin() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await login(password)
      
      if (result.success) {
        navigate('/admin')
      } else {
        setError(result.error || 'Invalid password')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-notion-bg flex items-center justify-center p-4">
      <div className="bg-notion-surface rounded-lg max-w-md w-full p-8 shadow-lg">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-notion-text mb-2">Admin Login</h1>
          <p className="text-notion-text-muted">
            Enter the admin password to access the admin panel
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-medium text-notion-text mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setError('')
              }}
              placeholder="Enter admin password"
              className="w-full px-4 py-2 bg-notion-bg border border-notion-border rounded-lg text-notion-text focus:outline-none focus:ring-2 focus:ring-notion-blue"
              autoFocus
              disabled={loading}
            />
            {error && (
              <p className="text-red-500 text-sm mt-2">{error}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !password.trim()}
            className="w-full px-4 py-2 bg-notion-blue text-white rounded-lg hover:bg-notion-blue-hover transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-notion-border">
          <button
            onClick={() => navigate('/')}
            className="text-sm text-notion-text-muted hover:text-notion-text transition-colors"
          >
            ← Back to home
          </button>
        </div>
      </div>
    </div>
  )
}

export default AdminLogin

