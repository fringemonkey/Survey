import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { isAuthenticated, authenticatedFetch, logout } from '../services/adminAuth'
import Footer from './Footer'

function AdminPage() {
  const [loading, setLoading] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)
  const [stats, setStats] = useState(null)
  const [submissions, setSubmissions] = useState(null)
  const [status, setStatus] = useState(null)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [backupLoading, setBackupLoading] = useState(false)
  const [sanitizeLoading, setSanitizeLoading] = useState(false)
  const [operationMessage, setOperationMessage] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    checkAuthentication()
  }, [])

  useEffect(() => {
    if (authenticated) {
      loadAllData()
      
      // Auto-refresh every 30 seconds if enabled
      let interval = null
      if (autoRefresh) {
        interval = setInterval(() => {
          loadAllData()
        }, 30000)
      }
      
      return () => {
        if (interval) clearInterval(interval)
      }
    }
  }, [authenticated, autoRefresh])

  const checkAuthentication = () => {
    if (!isAuthenticated()) {
      navigate('/admin/login')
    } else {
      setAuthenticated(true)
    }
    setLoading(false)
  }

  const loadAllData = async () => {
    try {
      setError(null)
      await Promise.all([
        loadStats(),
        loadSubmissions(currentPage),
        loadStatus()
      ])
    } catch (err) {
      console.error('Error loading admin data:', err)
      setError('Failed to load admin data. Please refresh the page.')
    }
  }

  const loadStats = async () => {
    try {
      const response = await authenticatedFetch('/admin/stats')
      
      if (response.status === 401) {
        await logout()
        navigate('/admin/login')
        return
      }
      
      if (!response.ok) {
        throw new Error('Failed to load stats')
      }
      
      const data = await response.json()
      setStats(data)
    } catch (err) {
      console.error('Error loading stats:', err)
      if (err.message === 'Not authenticated') {
        navigate('/admin/login')
      }
    }
  }

  const loadSubmissions = async (page) => {
    try {
      const response = await authenticatedFetch(`/admin/submissions?page=${page}&limit=50`)
      
      if (response.status === 401) {
        await logout()
        navigate('/admin/login')
        return
      }
      
      if (!response.ok) {
        throw new Error('Failed to load submissions')
      }
      
      const data = await response.json()
      setSubmissions(data)
    } catch (err) {
      console.error('Error loading submissions:', err)
      if (err.message === 'Not authenticated') {
        navigate('/admin/login')
      }
    }
  }

  const loadStatus = async () => {
    try {
      const response = await authenticatedFetch('/admin/status')
      
      if (response.status === 401) {
        await logout()
        navigate('/admin/login')
        return
      }
      
      if (!response.ok) {
        throw new Error('Failed to load status')
      }
      
      const data = await response.json()
      setStatus(data)
    } catch (err) {
      console.error('Error loading status:', err)
      if (err.message === 'Not authenticated') {
        navigate('/admin/login')
      }
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/admin/login')
  }

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage)
    loadSubmissions(newPage)
  }

  const handleBackup = async () => {
    setBackupLoading(true)
    setOperationMessage(null)
    try {
      const response = await authenticatedFetch('/api/backup', {
        method: 'POST'
      })
      
      if (response.status === 401) {
        await logout()
        navigate('/admin/login')
        return
      }
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Backup failed')
      }
      
      const data = await response.json()
      setOperationMessage({
        type: 'success',
        text: `Backup completed successfully. Processed ${data.backups?.length || 0} database(s).`
      })
      
      // Refresh data after backup
      setTimeout(() => {
        loadAllData()
      }, 1000)
    } catch (err) {
      console.error('Backup error:', err)
      setOperationMessage({
        type: 'error',
        text: err.message || 'Failed to create backup'
      })
    } finally {
      setBackupLoading(false)
    }
  }

  const handleSanitize = async () => {
    setSanitizeLoading(true)
    setOperationMessage(null)
    try {
      const response = await authenticatedFetch('/api/sanitize', {
        method: 'POST'
      })
      
      if (response.status === 401) {
        await logout()
        navigate('/admin/login')
        return
      }
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Sanitization failed')
      }
      
      const data = await response.json()
      setOperationMessage({
        type: 'success',
        text: `Sanitization completed. Processed: ${data.processed || 0}, Approved: ${data.approved || 0}, Rejected: ${data.rejected || 0}`
      })
      
      // Refresh data after sanitization
      setTimeout(() => {
        loadAllData()
      }, 1000)
    } catch (err) {
      console.error('Sanitization error:', err)
      setOperationMessage({
        type: 'error',
        text: err.message || 'Failed to run sanitization'
      })
    } finally {
      setSanitizeLoading(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    try {
      return new Date(dateString).toLocaleString()
    } catch {
      return dateString
    }
  }

  const getStatusColor = (statusValue) => {
    if (statusValue === 'approved') return 'text-green-500'
    if (statusValue === 'rejected') return 'text-red-500'
    return 'text-yellow-500'
  }

  const getHealthColor = (healthy) => {
    return healthy ? 'text-green-500' : 'text-red-500'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-notion-text mx-auto mb-4"></div>
          <p className="text-notion-text-muted">Loading admin panel...</p>
        </div>
      </div>
    )
  }

  if (!authenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-notion-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-notion-text mb-2">Admin Panel</h1>
            <p className="text-notion-text-muted">
              Database statistics, submission logs, and system status
            </p>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-notion-text-muted">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded"
              />
              Auto-refresh
            </label>
            <button
              onClick={handleLogout}
              className="px-4 py-2 border border-notion-border rounded-lg text-notion-text hover:bg-notion-surface transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-lg p-4">
            <p className="text-red-500">{error}</p>
          </div>
        )}

        {operationMessage && (
          <div className={`mb-6 rounded-lg p-4 ${
            operationMessage.type === 'success' 
              ? 'bg-green-500/10 border border-green-500/20' 
              : 'bg-red-500/10 border border-red-500/20'
          }`}>
            <p className={operationMessage.type === 'success' ? 'text-green-500' : 'text-red-500'}>
              {operationMessage.text}
            </p>
          </div>
        )}

        {/* Manual Operations */}
        <div className="bg-notion-surface rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-notion-text mb-4">Manual Operations</h2>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={handleSanitize}
              disabled={sanitizeLoading}
              className="px-6 py-2 bg-notion-blue text-white rounded-lg hover:bg-notion-blue-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {sanitizeLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Running Sanitization...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Run Sanitization
                </>
              )}
            </button>
            <button
              onClick={handleBackup}
              disabled={backupLoading}
              className="px-6 py-2 bg-notion-green text-white rounded-lg hover:bg-notion-green-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {backupLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Creating Backup...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                  Create Backup
                </>
              )}
            </button>
          </div>
          <p className="text-sm text-notion-text-muted mt-4">
            <strong>Sanitization:</strong> Processes pending records from staging database and moves approved records to production.
            <br />
            <strong>Backup:</strong> Creates backups of both staging and production databases.
          </p>
        </div>

        {/* Database Statistics */}
        {stats && (
          <div className="bg-notion-surface rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold text-notion-text mb-4">Database Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Staging Database */}
              <div className="bg-notion-bg rounded-lg p-4">
                <h3 className="text-lg font-medium text-notion-text mb-3">Staging Database</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-notion-text-muted">Total Records:</span>
                    <span className="text-notion-text font-semibold">{stats.staging?.totalRecords || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-notion-text-muted">Last Submission:</span>
                    <span className="text-notion-text">{formatDate(stats.staging?.lastSubmission)}</span>
                  </div>
                  {stats.staging?.statusBreakdown && stats.staging.statusBreakdown.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-notion-border">
                      <div className="text-sm text-notion-text-muted mb-2">Status Breakdown:</div>
                      {stats.staging.statusBreakdown.map((item) => (
                        <div key={item.sanitization_status} className="flex justify-between text-sm">
                          <span className="text-notion-text">{item.sanitization_status || 'pending'}:</span>
                          <span className="text-notion-text-muted">{item.count}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Production Database */}
              <div className="bg-notion-bg rounded-lg p-4">
                <h3 className="text-lg font-medium text-notion-text mb-3">Production Database</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-notion-text-muted">Total Records:</span>
                    <span className="text-notion-text font-semibold">{stats.production?.totalRecords || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-notion-text-muted">Last Submission:</span>
                    <span className="text-notion-text">{formatDate(stats.production?.lastSubmission)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* System Status */}
        {status && (
          <div className="bg-notion-surface rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold text-notion-text mb-4">System Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Database Connectivity */}
              <div className="bg-notion-bg rounded-lg p-4">
                <h3 className="text-lg font-medium text-notion-text mb-3">Database Connectivity</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-notion-text-muted">Staging:</span>
                    <span className={getHealthColor(status.databases.staging.connected)}>
                      {status.databases.staging.connected ? '✓ Connected' : '✗ Disconnected'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-notion-text-muted">Production:</span>
                    <span className={getHealthColor(status.databases.production.connected)}>
                      {status.databases.production.connected ? '✓ Connected' : '✗ Disconnected'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Sanitization */}
              <div className="bg-notion-bg rounded-lg p-4">
                <h3 className="text-lg font-medium text-notion-text mb-3">Sanitization</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-notion-text-muted">Pending:</span>
                    <span className="text-notion-text">{status.sanitization.pendingCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-notion-text-muted">Approved:</span>
                    <span className="text-green-500">{status.sanitization.approvedCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-notion-text-muted">Rejected:</span>
                    <span className="text-red-500">{status.sanitization.rejectedCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-notion-text-muted">Success Rate:</span>
                    <span className="text-notion-text">{status.sanitization.successRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-notion-text-muted">Last Run:</span>
                    <span className="text-notion-text text-sm">{formatDate(status.sanitization.lastRun)}</span>
                  </div>
                </div>
              </div>

              {/* Rate Limiting */}
              <div className="bg-notion-bg rounded-lg p-4">
                <h3 className="text-lg font-medium text-notion-text mb-3">Rate Limiting</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-notion-text-muted">Status:</span>
                    <span className={getHealthColor(status.rateLimit.status === 'configured')}>
                      {status.rateLimit.status === 'configured' ? '✓ Configured' : '✗ Not Configured'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Submission Log */}
        {submissions && (
          <div className="bg-notion-surface rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold text-notion-text mb-4">Submission Log</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-notion-border">
                    <th className="text-left py-2 px-4 text-sm font-medium text-notion-text-muted">Response ID</th>
                    <th className="text-left py-2 px-4 text-sm font-medium text-notion-text-muted">Submitted At</th>
                    <th className="text-left py-2 px-4 text-sm font-medium text-notion-text-muted">Status</th>
                    <th className="text-left py-2 px-4 text-sm font-medium text-notion-text-muted">Sanitized At</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.submissions && submissions.submissions.length > 0 ? (
                    submissions.submissions.map((sub, index) => (
                      <tr key={index} className="border-b border-notion-border hover:bg-notion-bg">
                        <td className="py-2 px-4 text-sm text-notion-text">{sub.response_id || 'N/A'}</td>
                        <td className="py-2 px-4 text-sm text-notion-text">{formatDate(sub.submitted_at)}</td>
                        <td className={`py-2 px-4 text-sm ${getStatusColor(sub.sanitization_status)}`}>
                          {sub.sanitization_status || 'pending'}
                        </td>
                        <td className="py-2 px-4 text-sm text-notion-text">{formatDate(sub.sanitized_at)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="py-4 px-4 text-center text-notion-text-muted">
                        No submissions found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {submissions.pagination && submissions.pagination.totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-notion-text-muted">
                  Page {submissions.pagination.page} of {submissions.pagination.totalPages} 
                  ({submissions.pagination.total} total)
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-notion-border rounded-lg text-notion-text hover:bg-notion-surface disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= submissions.pagination.totalPages}
                    className="px-3 py-1 border border-notion-border rounded-lg text-notion-text hover:bg-notion-surface disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Refresh Button */}
        <div className="mb-8">
          <button
            onClick={() => loadAllData()}
            className="px-6 py-2 bg-notion-blue text-white rounded-lg hover:bg-notion-blue-hover transition-colors"
          >
            Refresh Data
          </button>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default AdminPage

