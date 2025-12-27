import { describe, it, expect, beforeEach, vi } from 'vitest'
import { onRequestGet } from '../dashboard.js'
import { createMockEnv, createMockRequest, createMockContext } from '../../__tests__/test-utils.js'

describe('Dashboard API', () => {
  let env, context

  beforeEach(() => {
    // Dashboard requires ADMIN_PASSWORD - set it for tests
    env = createMockEnv({ ADMIN_PASSWORD: 'test-admin-password' })
    
    // Add some test data to production DB
    env.DB_PROD._addRecord({
      age: 25,
      cpu: 'Intel i7',
      gpu: 'RTX 3080',
      avg_fps_pre_cu1: 60,
      avg_fps_post_cu1: 65,
      overall_client_stability: 4,
      tos: 1,
      response_id: 'TLC-LH-1',
      submitted_at: new Date().toISOString()
    })
    
    vi.clearAllMocks()
  })

  describe('Overall Statistics', () => {
    it('returns overall statistics', async () => {
      const request = createMockRequest({}, {
        'Authorization': 'Bearer test-admin-password'
      })
      const url = new URL('https://example.com/api/dashboard?type=overall')
      request.url = url.href
      context = createMockContext(env, request)

      const response = await onRequestGet(context)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.totalResponses).toBeGreaterThanOrEqual(0)
    })

    it('calculates average FPS correctly', async () => {
      // Add multiple records with FPS data
      env.DB_PROD._addRecord({
        avg_fps_pre_cu1: 50,
        avg_fps_post_cu1: 55,
        tos: 1,
        response_id: 'TLC-LH-2',
        submitted_at: new Date().toISOString()
      })
      env.DB_PROD._addRecord({
        avg_fps_pre_cu1: 70,
        avg_fps_post_cu1: 75,
        tos: 1,
        response_id: 'TLC-LH-3',
        submitted_at: new Date().toISOString()
      })

      const request = createMockRequest({}, {
        'Authorization': 'Bearer test-admin-password'
      })
      const url = new URL('https://example.com/api/dashboard?type=overall')
      request.url = url.href
      context = createMockContext(env, request)

      const response = await onRequestGet(context)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.avgFpsPre).toBeGreaterThanOrEqual(0)
      expect(data.avgFpsPost).toBeGreaterThanOrEqual(0)
    })
  })

  describe('User Data', () => {
    it('returns user-specific data', async () => {
      const request = createMockRequest({}, {
        'Authorization': 'Bearer test-admin-password'
      })
      const url = new URL('https://example.com/api/dashboard?type=user&user=testuser')
      request.url = url.href
      context = createMockContext(env, request)

      const response = await onRequestGet(context)
      expect(response.status).toBe(200)
    })

    it('returns null for non-existent user', async () => {
      const request = createMockRequest({}, {
        'Authorization': 'Bearer test-admin-password'
      })
      const url = new URL('https://example.com/api/dashboard?type=user&user=nonexistent')
      request.url = url.href
      context = createMockContext(env, request)

      const response = await onRequestGet(context)
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data.user).toBeNull()
    })
  })

  describe('Fields Endpoint', () => {
    it('returns available fields', async () => {
      const request = createMockRequest({}, {
        'Authorization': 'Bearer test-admin-password'
      })
      const url = new URL('https://example.com/api/dashboard?type=fields')
      request.url = url.href
      context = createMockContext(env, request)

      const response = await onRequestGet(context)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.performance).toBeDefined()
      expect(data.quests).toBeDefined()
      expect(data.hardware).toBeDefined()
    })
  })

  describe('Report Generation', () => {
    it('generates custom report', async () => {
      const request = createMockRequest({}, {
        'Authorization': 'Bearer test-admin-password'
      })
      const url = new URL('https://example.com/api/dashboard?type=report&field1=avg_fps_pre_cu1&field2=avg_fps_post_cu1')
      request.url = url.href
      context = createMockContext(env, request)

      const response = await onRequestGet(context)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.field1).toBe('avg_fps_pre_cu1')
      expect(data.field2).toBe('avg_fps_post_cu1')
    })

    it('rejects report with missing fields', async () => {
      const request = createMockRequest({}, {
        'Authorization': 'Bearer test-admin-password'
      })
      const url = new URL('https://example.com/api/dashboard?type=report&field1=avg_fps_pre_cu1')
      request.url = url.href
      context = createMockContext(env, request)

      const response = await onRequestGet(context)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('required')
    })

    it('prevents discord_name in reports', async () => {
      const request = createMockRequest({}, {
        'Authorization': 'Bearer test-admin-password'
      })
      const url = new URL('https://example.com/api/dashboard?type=report&field1=discord_name&field2=age')
      request.url = url.href
      context = createMockContext(env, request)

      const response = await onRequestGet(context)
      expect(response.status).toBe(500)
    })
  })

  describe('Error Handling', () => {
    it('handles missing database', async () => {
      const brokenEnv = { 
        DB_PROD: null, 
        DB: null,
        ADMIN_PASSWORD: 'test-admin-password'
      }
      const request = createMockRequest({}, {
        'Authorization': 'Bearer test-admin-password'
      })
      const url = new URL('https://example.com/api/dashboard?type=overall')
      request.url = url.href
      context = createMockContext(brokenEnv, request)

      const response = await onRequestGet(context)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toContain('Database')
    })

    it('handles invalid request type', async () => {
      const request = createMockRequest({}, {
        'Authorization': 'Bearer test-admin-password'
      })
      const url = new URL('https://example.com/api/dashboard?type=invalid')
      request.url = url.href
      context = createMockContext(env, request)

      const response = await onRequestGet(context)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('Invalid')
    })
  })
})
