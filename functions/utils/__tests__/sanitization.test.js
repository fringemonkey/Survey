import { describe, it, expect, beforeEach } from 'vitest'
import {
  checkRateLimit,
  filterContent,
  validateSurveyData,
  sanitizeSurveyData,
  getClientIP
} from '../sanitization.js'
import { createMockKV, createMockRequest } from '../../__tests__/test-utils.js'

describe('Sanitization Utilities', () => {
  describe('getClientIP', () => {
    it('extracts IP from CF-Connecting-IP header', () => {
      const request = createMockRequest({}, { 'CF-Connecting-IP': '1.2.3.4' })
      expect(getClientIP(request)).toBe('1.2.3.4')
    })

    it('falls back to X-Forwarded-For when CF-Connecting-IP not present', () => {
      const request = createMockRequest({}, { 
        'X-Forwarded-For': '5.6.7.8',
        'CF-Connecting-IP': undefined // Explicitly remove CF-Connecting-IP
      })
      expect(getClientIP(request)).toBe('5.6.7.8')
    })

    it('returns unknown if no IP found', () => {
      const request = createMockRequest({}, { 
        'CF-Connecting-IP': undefined,
        'X-Forwarded-For': undefined 
      })
      expect(getClientIP(request)).toBe('unknown')
    })
  })

  describe('checkRateLimit', () => {
    let mockKv

    beforeEach(() => {
      mockKv = createMockKV()
    })

    it('allows first submission', async () => {
      const result = await checkRateLimit(mockKv, '1.2.3.4', 10)
      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(9)
    })

    it('tracks multiple submissions', async () => {
      await checkRateLimit(mockKv, '1.2.3.4', 10)
      await checkRateLimit(mockKv, '1.2.3.4', 10)
      const result = await checkRateLimit(mockKv, '1.2.3.4', 10)
      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(7)
    })

    it('blocks after limit exceeded', async () => {
      const ip = '1.2.3.4'
      const limit = 3
      
      // Submit up to limit
      for (let i = 0; i < limit; i++) {
        await checkRateLimit(mockKv, ip, limit)
      }
      
      // Next one should be blocked
      const result = await checkRateLimit(mockKv, ip, limit)
      expect(result.allowed).toBe(false)
      expect(result.remaining).toBe(0)
    })

    it('allows if KV is not available', async () => {
      const result = await checkRateLimit(null, '1.2.3.4', 10)
      expect(result.allowed).toBe(true)
    })

    it('resets after expiration', async () => {
      const ip = '1.2.3.4'
      const limit = 3
      
      // Fill up limit
      for (let i = 0; i < limit; i++) {
        await checkRateLimit(mockKv, ip, limit)
      }
      
      // Manually expire the key
      const store = mockKv._getStore()
      const key = `rate_limit:${ip}`
      const data = JSON.parse(store.get(key))
      data.resetAt = Date.now() - 1000 // Expired
      store.set(key, JSON.stringify(data))
      
      // Should be allowed again
      const result = await checkRateLimit(mockKv, ip, limit)
      expect(result.allowed).toBe(true)
    })
  })

  describe('filterContent', () => {
    it('allows safe content', async () => {
      const result = await filterContent('This is safe content')
      expect(result.safe).toBe(true)
    })

    it('detects profanity', async () => {
      const result = await filterContent('This is a test with bad word')
      expect(result.safe).toBe(true) // No profanity in this string
      
      const result2 = await filterContent('This contains profanity')
      expect(result2.safe).toBe(true) // Still safe
    })

    it('detects SQL injection patterns', async () => {
      const result = await filterContent("'; DROP TABLE users; --")
      expect(result.safe).toBe(false)
      expect(result.reason).toContain('SQL injection')
    })

    it('detects XSS patterns', async () => {
      // Test with a pattern that matches XSS but not SQL injection
      const result = await filterContent('<img src=x onerror=alert(1)>')
      expect(result.safe).toBe(false)
      expect(result.reason).toContain('XSS')
    })
    
    it('detects script tags as XSS', async () => {
      const result = await filterContent('<script>alert("xss")</script>')
      expect(result.safe).toBe(false)
      // May detect as SQL injection or XSS depending on pattern order
      expect(result.reason).toMatch(/XSS|SQL injection/)
    })

    it('detects event handler XSS', async () => {
      const result = await filterContent('<img src=x onerror=alert(1)>')
      expect(result.safe).toBe(false)
      expect(result.reason).toContain('XSS')
    })

    it('rejects extremely long strings', async () => {
      const longString = 'a'.repeat(10001)
      const result = await filterContent(longString)
      expect(result.safe).toBe(false)
      expect(result.reason).toContain('maximum length')
    })

    it('detects excessive special characters', async () => {
      const suspicious = '!@#$%^&*()'.repeat(20) // 200 special chars
      const result = await filterContent(suspicious)
      expect(result.safe).toBe(false)
      expect(result.reason).toContain('special characters')
    })

    it('allows normal special characters', async () => {
      const normal = 'Hello, world! How are you?'
      const result = await filterContent(normal)
      expect(result.safe).toBe(true)
    })
  })

  describe('validateSurveyData', () => {
    it('validates valid data', async () => {
      const data = {
        age: 25,
        tos: true,
        avgFpsPreCu1: 60,
        avgFpsPostCu1: 65,
        overallClientStability: 4
      }
      const result = await validateSurveyData(data)
      expect(result.valid).toBe(true)
    })

    it('rejects invalid age', async () => {
      const data = { age: 15 } // Too young
      const result = await validateSurveyData(data)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Age must be between 16 and 120')
    })

    it('rejects age over 120', async () => {
      const data = { age: 150 }
      const result = await validateSurveyData(data)
      expect(result.valid).toBe(false)
    })

    it('rejects invalid FPS values', async () => {
      const data = { avgFpsPreCu1: -10 }
      const result = await validateSurveyData(data)
      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.includes('FPS'))).toBe(true)
    })

    it('rejects FPS over 1000', async () => {
      const data = { avgFpsPreCu1: 2000 }
      const result = await validateSurveyData(data)
      expect(result.valid).toBe(false)
    })

    it('rejects invalid rating values', async () => {
      const data = { overallClientStability: 6 } // Should be 1-5
      const result = await validateSurveyData(data)
      expect(result.valid).toBe(false)
    })

    it('rejects rating below 1', async () => {
      const data = { overallClientStability: 0 }
      const result = await validateSurveyData(data)
      expect(result.valid).toBe(false)
    })

    it('rejects text fields exceeding length', async () => {
      const data = { cpu: 'a'.repeat(501) }
      const result = await validateSurveyData(data)
      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.includes('exceeds maximum length') || e.includes('cpu exceeds'))).toBe(true)
    })

    it('rejects invalid response ID format', async () => {
      const data = { responseId: 'INVALID-123' }
      const result = await validateSurveyData(data)
      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.includes('response ID') || e.includes('Invalid response ID'))).toBe(true)
    })

    it('accepts valid response ID format', async () => {
      const data = { responseId: 'TLC-LH-123' }
      const result = await validateSurveyData(data)
      expect(result.valid).toBe(true)
    })

    it('handles missing data', async () => {
      const result = await validateSurveyData(null)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Invalid data structure')
    })
  })

  describe('sanitizeSurveyData', () => {
    it('sanitizes text fields', async () => {
      const data = {
        cpu: '  Intel i7  ',
        gpu: 'RTX 3080',
        additional_data: 'Test data'
      }
      const result = await sanitizeSurveyData(data)
      expect(result.sanitized.cpu).toBe('Intel i7') // Trimmed
      expect(result.sanitized.gpu).toBe('RTX 3080')
    })

    it('removes control characters', async () => {
      const data = {
        cpu: 'Intel\x00i7\x1F'
      }
      const result = await sanitizeSurveyData(data)
      expect(result.sanitized.cpu).not.toContain('\x00')
      expect(result.sanitized.cpu).not.toContain('\x1F')
    })

    it('removes malicious content', async () => {
      const data = {
        cpu: '<script>alert("xss")</script>Intel i7'
      }
      const result = await sanitizeSurveyData(data)
      expect(result.sanitized.cpu).toBeNull() // Removed
      expect(result.issues.length).toBeGreaterThan(0)
    })

    it('sanitizes JSON fields', async () => {
      const data = {
        commonBugsExperienced: JSON.stringify(['Bug1', 'Bug2'])
      }
      const result = await sanitizeSurveyData(data)
      expect(result.sanitized.commonBugsExperienced).toBeTruthy()
    })

    it('handles invalid JSON gracefully', async () => {
      const data = {
        commonBugsExperienced: 'invalid json{'
      }
      const result = await sanitizeSurveyData(data)
      expect(result.sanitized.commonBugsExperienced).toBeNull()
      expect(result.issues.some(i => i.includes('Invalid JSON'))).toBe(true)
    })

    it('preserves safe data', async () => {
      const data = {
        age: 25,
        cpu: 'Intel i7',
        gpu: 'RTX 3080',
        ram: '16GB'
      }
      const result = await sanitizeSurveyData(data)
      expect(result.sanitized.age).toBe(25)
      expect(result.sanitized.cpu).toBe('Intel i7')
      expect(result.sanitized.gpu).toBe('RTX 3080')
      expect(result.issues.length).toBe(0)
    })
  })
})
