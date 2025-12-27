import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function AdminLogin() {
  const navigate = useNavigate()

  useEffect(() => {
    // Auto-redirect to admin panel - Cloudflare Zero Trust will handle authentication
    // If user is not authenticated, CF will redirect to GitHub OAuth
    window.location.href = '/admin'
  }, [])

  const handleAccessAdmin = () => {
    // Redirect to admin panel - Cloudflare Zero Trust will handle authentication
    // If user is not authenticated, CF will redirect to GitHub OAuth
    window.location.href = '/admin'
  }

  return (
    <div className="min-h-screen bg-notion-bg flex items-center justify-center p-4">
      <div className="bg-notion-surface rounded-lg max-w-md w-full p-8 shadow-lg">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-notion-text mb-2">Admin Access</h1>
          <p className="text-notion-text-muted mb-4">
            Accessing the admin panel requires GitHub authentication via Cloudflare Zero Trust.
          </p>
          <p className="text-notion-text-secondary text-sm">
            When you click the button below, you will be redirected to authenticate with GitHub if you haven't already.
          </p>
        </div>

        <button
          onClick={handleAccessAdmin}
          className="w-full px-4 py-2 bg-notion-blue text-white rounded-lg hover:bg-notion-blue-hover transition-colors font-medium"
        >
          Access Admin Panel
        </button>

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

