import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { isAuthenticated, logout } from '../services/adminAuth'
import { getOverallStats } from '../services/dashboard'
import ReportBuilder from './ReportBuilder'
import Footer from './Footer'

function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)
  const [stats, setStats] = useState(null)
  const [error, setError] = useState(null)
  const [showReportBuilder, setShowReportBuilder] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    checkAuthentication()
  }, [])

  useEffect(() => {
    if (authenticated) {
      loadDashboardData()
    }
  }, [authenticated])

  const checkAuthentication = () => {
    if (!isAuthenticated()) {
      navigate('/admin/login')
    } else {
      setAuthenticated(true)
    }
    setLoading(false)
  }

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const data = await getOverallStats()
      setStats(data)
    } catch (err) {
      console.error('Error loading dashboard:', err)
      
      // Handle authentication errors
      if (err.message === 'Not authenticated' || err.message.includes('Unauthorized')) {
        await logout()
        navigate('/admin/login')
        return
      }
      
      let errorMessage = 'Failed to load dashboard data. Please try again later.'
      
      // Provide more helpful error messages (sanitize to avoid showing stack traces)
      const errMsg = err.message || ''
      if (errMsg.includes('Failed to fetch') || errMsg.includes('NetworkError')) {
        errorMessage = 'Unable to connect to the dashboard API. Make sure you are running the app with `npm run dev:full` for local development.'
      } else if (errMsg.includes('Expected JSON')) {
        errorMessage = 'The dashboard API returned an unexpected response. Make sure you are running with `npm run dev:full` to enable API endpoints.'
      } else if (errMsg && !errMsg.includes('stack') && !errMsg.includes('at ') && errMsg.length < 200) {
        // Only show clean error messages (no stack traces, reasonable length)
        errorMessage = errMsg
      }
      
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-notion-text mx-auto mb-4"></div>
          <p className="text-notion-text-muted">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!authenticated) {
    return null
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-4">
            <p className="text-red-500">{error}</p>
          </div>
          <button
            onClick={loadDashboardData}
            className="px-4 py-2 bg-notion-blue text-white rounded-lg hover:bg-notion-blue-hover transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!stats) {
    return null
  }

  return (
    <div className="min-h-screen bg-notion-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-notion-text mb-2">Survey Dashboard</h1>
          <p className="text-notion-text-muted">
            Overall survey statistics and aggregated data
          </p>
        </div>

        {/* Basic Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Responses"
            value={stats.totalResponses}
            icon="📊"
          />
          <StatCard
            title="Avg FPS Pre CU1"
            value={stats.avgFpsPre}
            suffix=" FPS"
            icon="⚡"
          />
          <StatCard
            title="Avg FPS Post CU1"
            value={stats.avgFpsPost}
            suffix=" FPS"
            icon="🚀"
          />
          <StatCard
            title="Avg Stability"
            value={stats.avgStability}
            suffix="/5"
            icon="🛡️"
          />
        </div>

        {/* Performance Comparison */}
        {stats.performanceComparison && stats.performanceComparison.length > 0 && (
          <div className="bg-notion-surface rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold text-notion-text mb-4">Performance Comparison</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {stats.performanceComparison.map((item) => (
                <div key={item.pre_cu1_vs_post} className="bg-notion-bg rounded-lg p-4">
                  <div className="text-sm text-notion-text-muted mb-1">{item.pre_cu1_vs_post}</div>
                  <div className="text-2xl font-bold text-notion-text">{item.count}</div>
                  <div className="text-xs text-notion-text-muted mt-1">
                    {stats.totalResponses > 0 ? ((item.count / stats.totalResponses) * 100).toFixed(1) : 0}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}


        {/* Bug Statistics */}
        {stats.bugStats && Object.keys(stats.bugStats).length > 0 && (
          <div className="bg-notion-surface rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold text-notion-text mb-4">Common Bugs Experienced</h2>
            <div className="space-y-2">
              {Object.entries(stats.bugStats).map(([bug, count]) => (
                <div key={bug} className="flex items-center justify-between">
                  <span className="text-notion-text">{bug}</span>
                  <div className="flex items-center gap-4">
                    <div className="w-32 bg-notion-bg rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-notion-blue h-full transition-all"
                        style={{ width: `${stats.totalResponses > 0 ? (count / stats.totalResponses) * 100 : 0}%` }}
                      />
                    </div>
                    <span className="text-notion-text font-medium w-16 text-right">
                      {count} ({stats.totalResponses > 0 ? ((count / stats.totalResponses) * 100).toFixed(1) : 0}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quest Ratings */}
        {Object.keys(stats.questRatings).length > 0 && (
          <div className="bg-notion-surface rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold text-notion-text mb-4">Quest Ratings (Average)</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(stats.questRatings).map(([quest, rating]) => (
                <div key={quest} className="bg-notion-bg rounded-lg p-4">
                  <div className="text-sm text-notion-text-muted mb-1">{quest}</div>
                  <div className="text-2xl font-bold text-notion-text">{rating}/5</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Hardware Stats */}
        {stats.hardwareStats && (
          <div className="bg-notion-surface rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold text-notion-text mb-4">Hardware Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="text-lg font-medium text-notion-text mb-3">Top CPUs</h3>
                <div className="space-y-2">
                  {stats.hardwareStats.topCpus && stats.hardwareStats.topCpus.length > 0 ? (
                    stats.hardwareStats.topCpus.slice(0, 5).map((cpu) => (
                      <div key={cpu.cpu} className="flex justify-between text-sm">
                        <span className="text-notion-text">{cpu.cpu}</span>
                        <span className="text-notion-text-muted">{cpu.count}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-notion-text-muted">No data available</div>
                  )}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium text-notion-text mb-3">Top GPUs</h3>
                <div className="space-y-2">
                  {stats.hardwareStats.topGpus && stats.hardwareStats.topGpus.length > 0 ? (
                    stats.hardwareStats.topGpus.slice(0, 5).map((gpu) => (
                      <div key={gpu.gpu} className="flex justify-between text-sm">
                        <span className="text-notion-text">{gpu.gpu}</span>
                        <span className="text-notion-text-muted">{gpu.count}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-notion-text-muted">No data available</div>
                  )}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium text-notion-text mb-3">Average Playtime</h3>
                <div className="text-3xl font-bold text-notion-text">{stats.hardwareStats.avgPlaytime || 0} hours</div>
              </div>
            </div>
          </div>
        )}

        {/* Report Builder Toggle */}
        <div className="mb-8">
          <button
            onClick={() => setShowReportBuilder(!showReportBuilder)}
            className="w-full px-6 py-4 bg-notion-blue text-white rounded-lg hover:bg-notion-blue-hover transition-colors font-medium"
          >
            {showReportBuilder ? 'Hide Report Builder' : 'Open Report Builder'}
          </button>
        </div>

        {/* Report Builder */}
        {showReportBuilder && (
          <div className="mb-8">
            <ReportBuilder />
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}

function StatCard({ title, value, suffix = '', icon }) {
  return (
    <div className="bg-notion-surface rounded-lg p-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-notion-text-muted">{title}</span>
        <span className="text-2xl">{icon}</span>
      </div>
      <div className="text-3xl font-bold text-notion-text">
        {value !== null && value !== undefined ? value : 'N/A'}{suffix}
      </div>
    </div>
  )
}

export default DashboardPage

