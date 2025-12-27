import { describe, it, expect, beforeEach, vi } from 'vitest'
import { onRequestGet, onRequestPost } from '../admin.js'
import { createMockEnv, createMockRequest, createMockContext } from '../../__tests__/test-utils.js'
import { createSession } from '../../utils/auth.js'

describe('Admin API', () => {
  let env, context, sessionToken

  beforeEach(async () => {
    env = createMockEnv({
      ADMIN_PASSWORD: 'test-admin-password'
    })
    // Use RATE_LIMIT_KV for sessions (fallback)
    env.SESSION_KV = env.RATE_LIMIT_KV
    
    // Create a valid session token for authenticated requests
    sessionToken = await createSession(env)
    
    // Add test data to staging database
    env.DB_STAGING._addRecord({
      response_id: 'TLC-LH-1',
      submitted_at: new Date().toISOString(),
      sanitization_status: 'pending'
    })
    env.DB_STAGING._addRecord({
      response_id: 'TLC-LH-2',
      submitted_at: new Date(Date.now() - 3600000).toISOString(),
      sanitization_status: 'approved',
      sanitized_at: new Date().toISOString()
    })
    
    // Add test data to production database
    env.DB_PROD._addRecord({
      response_id: 'TLC-LH-2',
      submitted_at: new Date().toISOString()
    })
    
    vi.clearAllMocks()
  })

  describe('Authentication', () => {
    it('rejects unauthenticated GET requests', async () => {
      const request = createMockRequest({}, {})
      const url = new URL('https://example.com/api/admin/stats')
      request.url = url.href
      context = createMockContext(env, request)

      const response = await onRequestGet(context)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('accepts authenticated GET requests with session token', async () => {
      const request = createMockRequest({}, {
        'Authorization': `Bearer ${sessionToken}`
      })
      const url = new URL('https://example.com/api/admin/stats')
      request.url = url.href
      context = createMockContext(env, request)

      const response = await onRequestGet(context)
      expect(response.status).toBe(200)
    })

    it('accepts authenticated GET requests with cookie', async () => {
      const request = createMockRequest({}, {
        'Cookie': `admin_session=${sessionToken}`
      })
      const url = new URL('https://example.com/api/admin/stats')
      request.url = url.href
      context = createMockContext(env, request)

      const response = await onRequestGet(context)
      expect(response.status).toBe(200)
    })
  })

  describe('Login (POST /api/admin/login)', () => {
    it('creates session for correct password', async () => {
      const request = createMockRequest({ password: 'test-admin-password' }, {})
      const url = new URL('https://example.com/api/admin/login')
      request.url = url.href
      context = createMockContext(env, request)

      const response = await onRequestPost(context)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(response.headers.get('Set-Cookie')).toContain('admin_session=')
    })

    it('rejects incorrect password', async () => {
      const request = createMockRequest({ password: 'wrong-password' }, {})
      const url = new URL('https://example.com/api/admin/login')
      request.url = url.href
      context = createMockContext(env, request)

      const response = await onRequestPost(context)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Invalid password')
    })

    it('handles missing password in request', async () => {
      const request = createMockRequest({}, {})
      const url = new URL('https://example.com/api/admin/login')
      request.url = url.href
      context = createMockContext(env, request)

      const response = await onRequestPost(context)
      expect(response.status).toBe(400)
    })

    it('handles missing ADMIN_PASSWORD env var', async () => {
      const envNoPassword = { ...env, ADMIN_PASSWORD: undefined }
      const request = createMockRequest({ password: 'any-password' }, {})
      const url = new URL('https://example.com/api/admin/login')
      request.url = url.href
      context = createMockContext(envNoPassword, request)

      const response = await onRequestPost(context)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Admin password not configured')
    })
  })

  describe('Logout (POST /api/admin/logout)', () => {
    it('invalidates session and clears cookie', async () => {
      const request = createMockRequest({}, {
        'Authorization': `Bearer ${sessionToken}`
      })
      const url = new URL('https://example.com/api/admin/logout')
      request.url = url.href
      context = createMockContext(env, request)

      const response = await onRequestPost(context)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(response.headers.get('Set-Cookie')).toContain('Max-Age=0')
    })

    it('handles logout without session token', async () => {
      const request = createMockRequest({}, {})
      const url = new URL('https://example.com/api/admin/logout')
      request.url = url.href
      context = createMockContext(env, request)

      const response = await onRequestPost(context)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })
  })

  describe('Stats Endpoint (GET /api/admin/stats)', () => {
    it('returns database statistics', async () => {
      const request = createMockRequest({}, {
        'Authorization': `Bearer ${sessionToken}`
      })
      const url = new URL('https://example.com/api/admin/stats')
      request.url = url.href
      context = createMockContext(env, request)

      const response = await onRequestGet(context)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.staging).toBeDefined()
      expect(data.production).toBeDefined()
      expect(data.staging.totalRecords).toBeGreaterThanOrEqual(0)
      expect(data.production.totalRecords).toBeGreaterThanOrEqual(0)
    })

    it('includes status breakdown for staging', async () => {
      const request = createMockRequest({}, {
        'Authorization': `Bearer ${sessionToken}`
      })
      const url = new URL('https://example.com/api/admin/stats')
      request.url = url.href
      context = createMockContext(env, request)

      const response = await onRequestGet(context)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.staging.statusBreakdown).toBeDefined()
      expect(Array.isArray(data.staging.statusBreakdown)).toBe(true)
    })

    it('handles missing databases gracefully', async () => {
      const envNoDb = {
        ...env,
        DB_STAGING: null,
        DB_PROD: null
      }
      const request = createMockRequest({}, {
        'Authorization': `Bearer ${sessionToken}`
      })
      const url = new URL('https://example.com/api/admin/stats')
      request.url = url.href
      context = createMockContext(envNoDb, request)

      const response = await onRequestGet(context)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.errors).toBeDefined()
      expect(Array.isArray(data.errors)).toBe(true)
    })
  })

  describe('Submissions Endpoint (GET /api/admin/submissions)', () => {
    it('returns paginated submissions', async () => {
      const request = createMockRequest({}, {
        'Authorization': `Bearer ${sessionToken}`
      })
      const url = new URL('https://example.com/api/admin/submissions?page=1&limit=50')
      request.url = url.href
      context = createMockContext(env, request)

      const response = await onRequestGet(context)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.submissions).toBeDefined()
      expect(Array.isArray(data.submissions)).toBe(true)
      expect(data.pagination).toBeDefined()
      expect(data.pagination.page).toBe(1)
      expect(data.pagination.limit).toBe(50)
    })

    it('excludes user-identifiable data', async () => {
      env.DB_STAGING._addRecord({
        response_id: 'TLC-LH-3',
        submitted_at: new Date().toISOString(),
        sanitization_status: 'pending',
        discord_name: 'testuser',
        age: 25
      })

      const request = createMockRequest({}, {
        'Authorization': `Bearer ${sessionToken}`
      })
      const url = new URL('https://example.com/api/admin/submissions?page=1&limit=50')
      request.url = url.href
      context = createMockContext(env, request)

      const response = await onRequestGet(context)
      const data = await response.json()

      expect(response.status).toBe(200)
      // Check that submissions don't contain user-identifiable fields
      data.submissions.forEach(sub => {
        expect(sub).not.toHaveProperty('discord_name')
        expect(sub).not.toHaveProperty('age')
        expect(sub).not.toHaveProperty('cpu')
        expect(sub).not.toHaveProperty('gpu')
        // Should only have these fields
        expect(sub).toHaveProperty('response_id')
        expect(sub).toHaveProperty('submitted_at')
        expect(sub).toHaveProperty('sanitization_status')
      })
    })

    it('handles pagination correctly', async () => {
      // Add multiple records
      for (let i = 3; i <= 10; i++) {
        env.DB_STAGING._addRecord({
          response_id: `TLC-LH-${i}`,
          submitted_at: new Date().toISOString(),
          sanitization_status: 'pending'
        })
      }

      const request = createMockRequest({}, {
        'Authorization': `Bearer ${sessionToken}`
      })
      const url = new URL('https://example.com/api/admin/submissions?page=1&limit=5')
      request.url = url.href
      context = createMockContext(env, request)

      const response = await onRequestGet(context)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.submissions.length).toBeLessThanOrEqual(5)
      expect(data.pagination.totalPages).toBeGreaterThanOrEqual(1)
    })

    it('handles missing staging database', async () => {
      const envNoStaging = {
        ...env,
        DB_STAGING: null,
        DB: null
      }
      const request = createMockRequest({}, {
        'Authorization': `Bearer ${sessionToken}`
      })
      const url = new URL('https://example.com/api/admin/submissions')
      request.url = url.href
      context = createMockContext(envNoStaging, request)

      const response = await onRequestGet(context)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toContain('not configured')
    })
  })

  describe('Status Endpoint (GET /api/admin/status)', () => {
    it('returns system status', async () => {
      const request = createMockRequest({}, {
        'Authorization': `Bearer ${sessionToken}`
      })
      const url = new URL('https://example.com/api/admin/status')
      request.url = url.href
      context = createMockContext(env, request)

      const response = await onRequestGet(context)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.databases).toBeDefined()
      expect(data.databases.staging).toBeDefined()
      expect(data.databases.production).toBeDefined()
      expect(data.sanitization).toBeDefined()
      expect(data.rateLimit).toBeDefined()
    })

    it('includes sanitization metrics', async () => {
      const request = createMockRequest({}, {
        'Authorization': `Bearer ${sessionToken}`
      })
      const url = new URL('https://example.com/api/admin/status')
      request.url = url.href
      context = createMockContext(env, request)

      const response = await onRequestGet(context)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.sanitization.pendingCount).toBeDefined()
      expect(data.sanitization.approvedCount).toBeDefined()
      expect(data.sanitization.rejectedCount).toBeDefined()
      expect(data.sanitization.successRate).toBeDefined()
      expect(typeof data.sanitization.successRate).toBe('number')
    })

    it('reports database connectivity', async () => {
      const request = createMockRequest({}, {
        'Authorization': `Bearer ${sessionToken}`
      })
      const url = new URL('https://example.com/api/admin/status')
      request.url = url.href
      context = createMockContext(env, request)

      const response = await onRequestGet(context)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(typeof data.databases.staging.connected).toBe('boolean')
      expect(typeof data.databases.production.connected).toBe('boolean')
    })

    it('handles database errors gracefully', async () => {
      // Create a mock DB that throws errors
      const brokenDb = {
        prepare: () => ({
          first: async () => { throw new Error('Database error') }
        })
      }
      const envBroken = {
        ...env,
        DB_STAGING: brokenDb
      }

      const request = createMockRequest({}, {
        'Authorization': `Bearer ${sessionToken}`
      })
      const url = new URL('https://example.com/api/admin/status')
      request.url = url.href
      context = createMockContext(envBroken, request)

      const response = await onRequestGet(context)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.databases.staging.connected).toBe(false)
      expect(data.databases.staging.error).toBeDefined()
      expect(data.errors).toBeDefined()
    })
  })

  describe('Error Handling', () => {
    it('returns 404 for unknown endpoints', async () => {
      const request = createMockRequest({}, {
        'Authorization': `Bearer ${sessionToken}`
      })
      const url = new URL('https://example.com/api/admin/unknown')
      request.url = url.href
      context = createMockContext(env, request)

      const response = await onRequestGet(context)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('Not found')
    })

    it('handles malformed requests gracefully', async () => {
      const request = createMockRequest({}, {
        'Authorization': `Bearer ${sessionToken}`
      })
      const url = new URL('https://example.com/api/admin/submissions?page=invalid')
      request.url = url.href
      context = createMockContext(env, request)

      const response = await onRequestGet(context)
      // Should handle invalid page number
      expect([200, 400, 500]).toContain(response.status)
    })
  })
})

