import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  login,
  logout,
  isAuthenticated,
  authenticatedFetch,
  getSessionToken
} from '../adminAuth.js'

// Mock fetch globally
global.fetch = vi.fn()
global.sessionStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}

// Mock document.cookie
Object.defineProperty(document, 'cookie', {
  writable: true,
  value: ''
})

describe('Admin Auth Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch.mockClear()
    sessionStorage.getItem.mockReturnValue(null)
    document.cookie = ''
  })

  describe('isAuthenticated', () => {
    it('returns false when no session cookie exists', () => {
      document.cookie = ''
      expect(isAuthenticated()).toBe(false)
    })

    it('returns true when session cookie exists', () => {
      document.cookie = 'admin_session=test-token'
      expect(isAuthenticated()).toBe(true)
    })

    it('handles multiple cookies correctly', () => {
      document.cookie = 'other_cookie=value; admin_session=test-token; another=value'
      expect(isAuthenticated()).toBe(true)
    })
  })

  describe('getSessionToken', () => {
    it('extracts session token from cookie', () => {
      document.cookie = 'admin_session=test-token-123'
      const token = getSessionToken()
      expect(token).toBe('test-token-123')
    })

    it('returns null when no session cookie', () => {
      document.cookie = 'other_cookie=value'
      const token = getSessionToken()
      expect(token).toBeNull()
    })
  })

  describe('login', () => {
    it('succeeds with correct password', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ success: true, message: 'Login successful' }),
        headers: {
          get: () => null
        }
      })

      const result = await login('correct-password')

      expect(result.success).toBe(true)
      expect(result.error).toBeUndefined()
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/admin/login',
        expect.objectContaining({
          method: 'POST',
          credentials: 'include',
          body: JSON.stringify({ password: 'correct-password' })
        })
      )
    })

    it('fails with incorrect password', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ error: 'Invalid password' })
      })

      const result = await login('wrong-password')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Invalid password')
    })

    it('handles network errors', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'))

      const result = await login('any-password')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Network error. Please try again.')
    })
  })

  describe('logout', () => {
    it('calls logout endpoint', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ success: true })
      })

      await logout()

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/admin/logout',
        expect.objectContaining({
          method: 'POST',
          credentials: 'include'
        })
      )
    })

    it('handles errors gracefully', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'))

      await expect(logout()).resolves.not.toThrow()
    })
  })

  describe('authenticatedFetch', () => {
    it('throws error when not authenticated', async () => {
      document.cookie = ''
      
      await expect(authenticatedFetch('/dashboard')).rejects.toThrow('Not authenticated')
    })

    it('sends request with session token when authenticated', async () => {
      document.cookie = 'admin_session=test-token'
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: 'test' })
      })

      await authenticatedFetch('/dashboard')

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/dashboard',
        expect.objectContaining({
          credentials: 'include',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token',
            'Content-Type': 'application/json'
          })
        })
      )
    })

    it('uses correct base path for endpoints starting with /admin', async () => {
      document.cookie = 'admin_session=test-token'
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({})
      })

      await authenticatedFetch('/admin/stats')

      // When endpoint starts with /admin, uses API_BASE (/api/admin) as base
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/admin/admin/stats',
        expect.any(Object)
      )
    })

    it('uses /api base path for non-admin endpoints', async () => {
      document.cookie = 'admin_session=test-token'
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({})
      })

      await authenticatedFetch('/dashboard?type=overall')

      // When endpoint doesn't start with /admin, uses /api as base
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/dashboard?type=overall',
        expect.any(Object)
      )
    })

    it('uses correct base path for non-admin endpoints', async () => {
      document.cookie = 'admin_session=test-token'
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({})
      })

      await authenticatedFetch('/dashboard?type=overall')

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/dashboard?type=overall',
        expect.any(Object)
      )
    })

    it('includes custom headers', async () => {
      document.cookie = 'admin_session=test-token'
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({})
      })

      await authenticatedFetch('/dashboard', {
        headers: { 'Custom-Header': 'value' }
      })

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/dashboard',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Custom-Header': 'value',
            'Authorization': 'Bearer test-token'
          })
        })
      )
    })

    it('handles 401 responses', async () => {
      document.cookie = 'admin_session=test-token'
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ error: 'Unauthorized' })
      })

      const response = await authenticatedFetch('/dashboard')
      expect(response.status).toBe(401)
    })
  })
})

