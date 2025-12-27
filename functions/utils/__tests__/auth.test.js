import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  isAuthenticated,
  createSession,
  invalidateSession,
  verifyPasswordAndCreateSession,
  getSessionToken,
  getSessionCookieHeader,
  getClearSessionCookieHeader
} from '../auth.js'
import { createMockKV, createMockRequest } from '../../__tests__/test-utils.js'

describe('Auth Utilities', () => {
  let mockKv, env, request

  beforeEach(() => {
    mockKv = createMockKV()
    env = {
      ADMIN_PASSWORD: 'test-password',
      SESSION_KV: mockKv,
      RATE_LIMIT_KV: mockKv // Fallback
    }
    vi.clearAllMocks()
  })

  describe('getSessionToken', () => {
    it('extracts token from Authorization header', () => {
      request = createMockRequest({}, {
        'Authorization': 'Bearer test-session-token'
      })
      const token = getSessionToken(request)
      expect(token).toBe('test-session-token')
    })

    it('extracts token from cookie', () => {
      request = createMockRequest({}, {
        'Cookie': 'admin_session=test-session-token; other=cookie'
      })
      const token = getSessionToken(request)
      expect(token).toBe('test-session-token')
    })

    it('prefers Authorization header over cookie', () => {
      request = createMockRequest({}, {
        'Authorization': 'Bearer header-token',
        'Cookie': 'admin_session=cookie-token'
      })
      const token = getSessionToken(request)
      expect(token).toBe('header-token')
    })

    it('returns null when no token present', () => {
      request = createMockRequest({}, {})
      const token = getSessionToken(request)
      expect(token).toBeNull()
    })
  })

  describe('isAuthenticated', () => {
    it('returns false when no session token', async () => {
      request = createMockRequest({}, {})
      const result = await isAuthenticated(request, env)
      expect(result).toBe(false)
    })

    it('returns false when session does not exist in KV', async () => {
      request = createMockRequest({}, {
        'Authorization': 'Bearer invalid-token'
      })
      const result = await isAuthenticated(request, env)
      expect(result).toBe(false)
    })

    it('returns true when valid session exists', async () => {
      const sessionToken = await createSession(env)
      request = createMockRequest({}, {
        'Authorization': `Bearer ${sessionToken}`
      })
      const result = await isAuthenticated(request, env)
      expect(result).toBe(true)
    })

    it('returns false when ADMIN_PASSWORD not configured', async () => {
      const envNoPassword = { ...env, ADMIN_PASSWORD: undefined }
      request = createMockRequest({}, {
        'Authorization': 'Bearer test-token'
      })
      const result = await isAuthenticated(request, envNoPassword)
      expect(result).toBe(false)
    })

    it('uses RATE_LIMIT_KV as fallback when SESSION_KV not configured', async () => {
      const envFallback = {
        ADMIN_PASSWORD: 'test-password',
        RATE_LIMIT_KV: mockKv
      }
      const sessionToken = await createSession(envFallback)
      request = createMockRequest({}, {
        'Authorization': `Bearer ${sessionToken}`
      })
      const result = await isAuthenticated(request, envFallback)
      expect(result).toBe(true)
    })
  })

  describe('createSession', () => {
    it('creates a session token and stores in KV', async () => {
      const token = await createSession(env)
      expect(token).toBeTruthy()
      expect(token.length).toBeGreaterThan(0)
      
      const sessionData = await mockKv.get(`session:${token}`, { type: 'json' })
      expect(sessionData).toBeTruthy()
      expect(sessionData.valid).toBe(true)
      expect(sessionData.createdAt).toBeDefined()
    })

    it('generates unique tokens', async () => {
      const token1 = await createSession(env)
      const token2 = await createSession(env)
      expect(token1).not.toBe(token2)
    })

    it('throws error when no KV configured', async () => {
      const envNoKv = { ADMIN_PASSWORD: 'test-password' }
      await expect(createSession(envNoKv)).rejects.toThrow('No KV namespace')
    })
  })

  describe('invalidateSession', () => {
    it('deletes session from KV', async () => {
      const token = await createSession(env)
      await invalidateSession(token, env)
      
      const sessionData = await mockKv.get(`session:${token}`, { type: 'json' })
      expect(sessionData).toBeNull()
    })

    it('handles invalid token gracefully', async () => {
      await expect(invalidateSession('invalid-token', env)).resolves.not.toThrow()
    })

    it('handles missing KV gracefully', async () => {
      const envNoKv = {}
      await expect(invalidateSession('token', envNoKv)).resolves.not.toThrow()
    })
  })

  describe('verifyPasswordAndCreateSession', () => {
    it('returns success with session token for correct password', async () => {
      const result = await verifyPasswordAndCreateSession('test-password', env)
      expect(result.success).toBe(true)
      expect(result.sessionToken).toBeDefined()
      expect(result.error).toBeUndefined()
    })

    it('returns error for incorrect password', async () => {
      const result = await verifyPasswordAndCreateSession('wrong-password', env)
      expect(result.success).toBe(false)
      expect(result.error).toBe('Invalid password')
      expect(result.sessionToken).toBeUndefined()
    })

    it('returns error when ADMIN_PASSWORD not configured', async () => {
      const envNoPassword = { ...env, ADMIN_PASSWORD: undefined }
      const result = await verifyPasswordAndCreateSession('any-password', envNoPassword)
      expect(result.success).toBe(false)
      expect(result.error).toBe('Admin password not configured')
    })

    it('creates valid session after successful verification', async () => {
      const result = await verifyPasswordAndCreateSession('test-password', env)
      expect(result.success).toBe(true)
      
      const sessionData = await mockKv.get(`session:${result.sessionToken}`, { type: 'json' })
      expect(sessionData).toBeTruthy()
      expect(sessionData.valid).toBe(true)
    })
  })

  describe('Cookie Headers', () => {
    it('getSessionCookieHeader returns proper cookie format', () => {
      const token = 'test-session-token'
      const header = getSessionCookieHeader(token)
      expect(header).toContain('admin_session=test-session-token')
      expect(header).toContain('HttpOnly')
      expect(header).toContain('Secure')
      expect(header).toContain('SameSite=Lax')
      expect(header).toContain('Max-Age=86400') // 24 hours
    })

    it('getClearSessionCookieHeader returns proper clear format', () => {
      const header = getClearSessionCookieHeader()
      expect(header).toContain('admin_session=')
      expect(header).toContain('Max-Age=0')
      expect(header).toContain('HttpOnly')
      expect(header).toContain('Secure')
    })
  })
})

