import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import AdminPage from '../AdminPage'
import * as adminAuth from '../../services/adminAuth'

// Mock the adminAuth service
vi.mock('../../services/adminAuth', () => ({
  isAuthenticated: vi.fn(),
  authenticatedFetch: vi.fn(),
  logout: vi.fn()
}))

// Mock useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate
  }
})

// Mock fetch for authenticatedFetch
global.fetch = vi.fn()

describe('AdminPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockNavigate.mockClear()
    adminAuth.isAuthenticated.mockReturnValue(true)
  })

  const mockApiResponse = (endpoint, data) => {
    adminAuth.authenticatedFetch.mockImplementation((url) => {
      if (url.includes(endpoint) || url === endpoint) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => data
        })
      }
      return Promise.reject(new Error('Not found'))
    })
  }

  const renderAdminPage = () => {
    return render(
      <BrowserRouter>
        <AdminPage />
      </BrowserRouter>
    )
  }

  describe('Authentication', () => {
    it('redirects to login when not authenticated', () => {
      adminAuth.isAuthenticated.mockReturnValue(false)
      
      renderAdminPage()
      
      expect(mockNavigate).toHaveBeenCalledWith('/admin/login')
    })

    it('renders admin panel when authenticated', async () => {
      mockApiResponse('/admin/stats', {
        staging: { totalRecords: 10, lastSubmission: new Date().toISOString() },
        production: { totalRecords: 8, lastSubmission: new Date().toISOString() }
      })
      mockApiResponse('/admin/submissions', {
        submissions: [],
        pagination: { page: 1, limit: 50, total: 0, totalPages: 1 }
      })
      mockApiResponse('/admin/status', {
        databases: { staging: { connected: true }, production: { connected: true } },
        sanitization: { pendingCount: 2, approvedCount: 8, rejectedCount: 0, successRate: 100 },
        rateLimit: { status: 'configured' }
      })
      
      renderAdminPage()
      
      await waitFor(() => {
        expect(screen.getByText('Admin Panel')).toBeInTheDocument()
      })
    })
  })

  describe('Database Statistics', () => {
    it('displays staging database stats', async () => {
      mockApiResponse('/admin/stats', {
        staging: {
          totalRecords: 15,
          lastSubmission: '2024-01-15T10:00:00Z',
          statusBreakdown: [
            { sanitization_status: 'pending', count: 5 },
            { sanitization_status: 'approved', count: 10 }
          ]
        },
        production: { totalRecords: 10 }
      })
      mockApiResponse('/submissions', {
        submissions: [],
        pagination: { page: 1, limit: 50, total: 0, totalPages: 1 }
      })
      mockApiResponse('/status', {
        databases: { staging: { connected: true }, production: { connected: true } },
        sanitization: { pendingCount: 0 },
        rateLimit: { status: 'configured' }
      })
      
      renderAdminPage()
      
      await waitFor(() => {
        expect(screen.getByText('Staging Database')).toBeInTheDocument()
        expect(screen.getByText('15')).toBeInTheDocument() // Total records
      })
    })

    it('displays production database stats', async () => {
      mockApiResponse('/admin/stats', {
        staging: { totalRecords: 15 },
        production: {
          totalRecords: 12,
          lastSubmission: '2024-01-15T11:00:00Z'
        }
      })
      mockApiResponse('/submissions', {
        submissions: [],
        pagination: { page: 1, limit: 50, total: 0, totalPages: 1 }
      })
      mockApiResponse('/status', {
        databases: { staging: { connected: true }, production: { connected: true } },
        sanitization: { pendingCount: 0 },
        rateLimit: { status: 'configured' }
      })
      
      renderAdminPage()
      
      await waitFor(() => {
        expect(screen.getByText('Production Database')).toBeInTheDocument()
        expect(screen.getByText('12')).toBeInTheDocument()
      })
    })
  })

  describe('Submission Log', () => {
    it('displays submission log table', async () => {
      mockApiResponse('/admin/stats', {
        staging: { totalRecords: 0 },
        production: { totalRecords: 0 }
      })
      mockApiResponse('/admin/submissions', {
        submissions: [
          {
            response_id: 'TLC-LH-1',
            submitted_at: '2024-01-15T10:00:00Z',
            sanitization_status: 'pending',
            sanitized_at: null
          },
          {
            response_id: 'TLC-LH-2',
            submitted_at: '2024-01-15T09:00:00Z',
            sanitization_status: 'approved',
            sanitized_at: '2024-01-15T09:05:00Z'
          }
        ],
        pagination: { page: 1, limit: 50, total: 2, totalPages: 1 }
      })
      mockApiResponse('/status', {
        databases: { staging: { connected: true }, production: { connected: true } },
        sanitization: { pendingCount: 0 },
        rateLimit: { status: 'configured' }
      })
      
      renderAdminPage()
      
      await waitFor(() => {
        expect(screen.getByText('Submission Log')).toBeInTheDocument()
        expect(screen.getByText('TLC-LH-1')).toBeInTheDocument()
        expect(screen.getByText('TLC-LH-2')).toBeInTheDocument()
      })
    })

    it('displays pagination controls', async () => {
      mockApiResponse('/admin/stats', {
        staging: { totalRecords: 0 },
        production: { totalRecords: 0 }
      })
      mockApiResponse('/admin/submissions', {
        submissions: [],
        pagination: { page: 1, limit: 50, total: 100, totalPages: 2 }
      })
      mockApiResponse('/status', {
        databases: { staging: { connected: true }, production: { connected: true } },
        sanitization: { pendingCount: 0 },
        rateLimit: { status: 'configured' }
      })
      
      renderAdminPage()
      
      await waitFor(() => {
        expect(screen.getByText(/Page 1 of 2/)).toBeInTheDocument()
        expect(screen.getByText('Next')).toBeInTheDocument()
      })
    })

    it('handles empty submission log', async () => {
      mockApiResponse('/admin/stats', {
        staging: { totalRecords: 0 },
        production: { totalRecords: 0 }
      })
      mockApiResponse('/admin/submissions', {
        submissions: [],
        pagination: { page: 1, limit: 50, total: 0, totalPages: 1 }
      })
      mockApiResponse('/status', {
        databases: { staging: { connected: true }, production: { connected: true } },
        sanitization: { pendingCount: 0 },
        rateLimit: { status: 'configured' }
      })
      
      renderAdminPage()
      
      await waitFor(() => {
        expect(screen.getByText('No submissions found')).toBeInTheDocument()
      })
    })
  })

  describe('System Status', () => {
    it('displays database connectivity status', async () => {
      mockApiResponse('/admin/stats', {
        staging: { totalRecords: 0 },
        production: { totalRecords: 0 }
      })
      mockApiResponse('/admin/submissions', {
        submissions: [],
        pagination: { page: 1, limit: 50, total: 0, totalPages: 1 }
      })
      mockApiResponse('/admin/status', {
        databases: {
          staging: { connected: true },
          production: { connected: true }
        },
        sanitization: { pendingCount: 0 },
        rateLimit: { status: 'configured' }
      })
      
      renderAdminPage()
      
      await waitFor(() => {
        expect(screen.getByText('Database Connectivity')).toBeInTheDocument()
        expect(screen.getByText(/✓ Connected/)).toBeInTheDocument()
      })
    })

    it('displays sanitization metrics', async () => {
      mockApiResponse('/admin/stats', {
        staging: { totalRecords: 0 },
        production: { totalRecords: 0 }
      })
      mockApiResponse('/admin/submissions', {
        submissions: [],
        pagination: { page: 1, limit: 50, total: 0, totalPages: 1 }
      })
      mockApiResponse('/admin/status', {
        databases: { staging: { connected: true }, production: { connected: true } },
        sanitization: {
          pendingCount: 5,
          approvedCount: 20,
          rejectedCount: 2,
          successRate: 91,
          lastRun: '2024-01-15T10:00:00Z'
        },
        rateLimit: { status: 'configured' }
      })
      
      renderAdminPage()
      
      await waitFor(() => {
        expect(screen.getByText('Sanitization')).toBeInTheDocument()
        expect(screen.getByText('5')).toBeInTheDocument() // Pending
        expect(screen.getByText('20')).toBeInTheDocument() // Approved
        expect(screen.getByText('2')).toBeInTheDocument() // Rejected
        expect(screen.getByText('91%')).toBeInTheDocument() // Success rate
      })
    })
  })

  describe('Logout', () => {
    it('calls logout and redirects on logout button click', async () => {
      adminAuth.logout.mockResolvedValue()
      mockApiResponse('/admin/stats', {
        staging: { totalRecords: 0 },
        production: { totalRecords: 0 }
      })
      mockApiResponse('/admin/submissions', {
        submissions: [],
        pagination: { page: 1, limit: 50, total: 0, totalPages: 1 }
      })
      mockApiResponse('/admin/status', {
        databases: { staging: { connected: true }, production: { connected: true } },
        sanitization: { pendingCount: 0 },
        rateLimit: { status: 'configured' }
      })
      
      renderAdminPage()
      
      await waitFor(() => {
        expect(screen.getByText('Logout')).toBeInTheDocument()
      })
      
      const logoutButton = screen.getByText('Logout')
      await userEvent.click(logoutButton)
      
      await waitFor(() => {
        expect(adminAuth.logout).toHaveBeenCalled()
        expect(mockNavigate).toHaveBeenCalledWith('/admin/login')
      })
    })
  })

  describe('Auto-refresh', () => {
    it('has auto-refresh toggle', async () => {
      mockApiResponse('/admin/stats', {
        staging: { totalRecords: 0 },
        production: { totalRecords: 0 }
      })
      mockApiResponse('/admin/submissions', {
        submissions: [],
        pagination: { page: 1, limit: 50, total: 0, totalPages: 1 }
      })
      mockApiResponse('/admin/status', {
        databases: { staging: { connected: true }, production: { connected: true } },
        sanitization: { pendingCount: 0 },
        rateLimit: { status: 'configured' }
      })
      
      renderAdminPage()
      
      await waitFor(() => {
        expect(screen.getByLabelText(/Auto-refresh/i)).toBeInTheDocument()
      })
    })
  })

  describe('Error Handling', () => {
    it('displays error message on API failure', async () => {
      adminAuth.authenticatedFetch.mockRejectedValue(new Error('Network error'))
      
      renderAdminPage()
      
      await waitFor(() => {
        expect(screen.getByText(/Failed to load admin data/i)).toBeInTheDocument()
      })
    })

    it('redirects to login on 401 response', async () => {
      adminAuth.authenticatedFetch.mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ error: 'Unauthorized' })
      })
      
      renderAdminPage()
      
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/admin/login')
      })
    })
  })

  describe('Refresh Button', () => {
    it('calls loadAllData on refresh button click', async () => {
      mockApiResponse('/admin/stats', {
        staging: { totalRecords: 0 },
        production: { totalRecords: 0 }
      })
      mockApiResponse('/admin/submissions', {
        submissions: [],
        pagination: { page: 1, limit: 50, total: 0, totalPages: 1 }
      })
      mockApiResponse('/admin/status', {
        databases: { staging: { connected: true }, production: { connected: true } },
        sanitization: { pendingCount: 0 },
        rateLimit: { status: 'configured' }
      })
      
      renderAdminPage()
      
      await waitFor(() => {
        expect(screen.getByText('Refresh Data')).toBeInTheDocument()
      })
      
      const refreshButton = screen.getByText('Refresh Data')
      await userEvent.click(refreshButton)
      
      // Should call authenticatedFetch multiple times (once for each endpoint)
      await waitFor(() => {
        expect(adminAuth.authenticatedFetch).toHaveBeenCalledTimes(4) // Initial load + refresh
      })
    })
  })
})

