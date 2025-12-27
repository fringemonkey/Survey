import { describe, it, expect, beforeEach, vi } from 'vitest'
import { onRequestPost } from '../submit.js'
import { createMockEnv, createMockRequest, createMockContext } from '../../__tests__/test-utils.js'

describe('Submit API', () => {
  let env, context

  beforeEach(() => {
    env = createMockEnv()
    vi.clearAllMocks()
    // Clear databases between tests
    env.DB_STAGING._clear()
    env.DB_PROD._clear()
    env.RATE_LIMIT_KV._clear()
  })

  describe('Hardware Survey', () => {
    it('submits hardware survey successfully', async () => {
      const request = createMockRequest({
        surveyType: 'hardware',
        cpu: 'Intel i7',
        gpu: 'RTX 3080',
        ram: '16GB',
        storage: '1TB SSD'
      })
      context = createMockContext(env, request)

      const response = await onRequestPost(context)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.responseId).toMatch(/^TLC-LH-\d+$/)
      expect(data.id).toBeGreaterThan(0)
    })

    it('handles missing hardware fields', async () => {
      const request = createMockRequest({
        surveyType: 'hardware',
        cpu: null
      })
      context = createMockContext(env, request)

      const response = await onRequestPost(context)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })
  })

  describe('Personal Data Survey', () => {
    it('submits personal data survey successfully', async () => {
      const request = createMockRequest({
        surveyType: 'personal',
        age: 25,
        tos: true,
        playtime: '50-100 hours'
      })
      context = createMockContext(env, request)

      const response = await onRequestPost(context)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })

    it('rejects missing age', async () => {
      const request = createMockRequest({
        surveyType: 'personal',
        tos: true
      })
      context = createMockContext(env, request)

      const response = await onRequestPost(context)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBeTruthy()
    })

    it('rejects missing TOS', async () => {
      const request = createMockRequest({
        surveyType: 'personal',
        age: 25
      })
      context = createMockContext(env, request)

      const response = await onRequestPost(context)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBeTruthy()
    })

    it('rejects age below 16', async () => {
      const request = createMockRequest({
        surveyType: 'personal',
        age: 15,
        tos: true
      })
      context = createMockContext(env, request)

      const response = await onRequestPost(context)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('16 or older')
    })
  })

  describe('Performance Survey', () => {
    it('submits performance survey successfully', async () => {
      const request = createMockRequest({
        surveyType: 'performance',
        avgFpsPreCu1: 60,
        avgFpsPostCu1: 65,
        performanceChange: 'Better',
        overallStability: 4
      })
      context = createMockContext(env, request)

      const response = await onRequestPost(context)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })
  })

  describe('Bug Survey', () => {
    it('submits bug survey successfully', async () => {
      const request = createMockRequest({
        surveyType: 'bug',
        bugNone: false,
        bugBoatStuck: true,
        bugBoatSinking: false,
        crashesPerSession: 2
      })
      context = createMockContext(env, request)

      const response = await onRequestPost(context)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })
  })

  describe('Quest Survey', () => {
    it('submits quest survey successfully', async () => {
      const request = createMockRequest({
        surveyType: 'quest',
        questProgress: '50%',
        preCu1QuestsRating: 4,
        overallQuestRating: 5
      })
      context = createMockContext(env, request)

      const response = await onRequestPost(context)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })
  })

  describe('Story Survey', () => {
    it('submits story survey successfully', async () => {
      const request = createMockRequest({
        surveyType: 'story',
        storyEngagement: 5,
        overallStoryRating: 4,
        overallScore: 5
      })
      context = createMockContext(env, request)

      const response = await onRequestPost(context)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })
  })

  describe('Rate Limiting', () => {
    it('allows submission within rate limit', async () => {
      const request = createMockRequest({
        surveyType: 'hardware',
        cpu: 'Intel i7'
      })
      context = createMockContext(env, request)

      const response = await onRequestPost(context)
      expect(response.status).toBe(200)
    })

    it('blocks submission exceeding rate limit', async () => {
      // Fill up rate limit
      const ip = '192.168.1.1'
      const request = createMockRequest({
        surveyType: 'hardware',
        cpu: 'Intel i7'
      }, { 'CF-Connecting-IP': ip })
      context = createMockContext(env, request)

      // Submit up to limit
      for (let i = 0; i < 10; i++) {
        await onRequestPost(context)
      }

      // Next one should be blocked
      const response = await onRequestPost(context)
      const data = await response.json()

      expect(response.status).toBe(429)
      expect(data.error).toContain('Rate limit exceeded')
    })
  })

  describe('Full Survey', () => {
    it('submits full survey with all fields', async () => {
      const request = createMockRequest({
        age: 25,
        tos: true,
        cpu: 'Intel i7',
        gpu: 'RTX 3080',
        ram: '16GB',
        playtime: '50-100 hours',
        avgFpsPreCu1: 60,
        avgFpsPostCu1: 65,
        performanceChange: 'Better',
        overallClientStability: 4,
        crashesPerSession: 1,
        questProgress: '50%',
        overallScorePostCu1: 5
      })
      context = createMockContext(env, request)

      const response = await onRequestPost(context)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })

    it('rejects full survey without age', async () => {
      const request = createMockRequest({
        tos: true,
        cpu: 'Intel i7'
      })
      context = createMockContext(env, request)

      const response = await onRequestPost(context)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('required fields')
    })

    it('rejects full survey without TOS', async () => {
      const request = createMockRequest({
        age: 25,
        cpu: 'Intel i7'
      })
      context = createMockContext(env, request)

      const response = await onRequestPost(context)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('required fields')
    })
  })

  describe('Error Handling', () => {
    it('handles database errors gracefully', async () => {
      // Create env with broken database
      const brokenEnv = {
        ...env,
        DB_STAGING: {
          prepare: () => ({
            bind: () => ({
              run: async () => {
                throw new Error('Database connection failed')
              },
              first: async () => {
                throw new Error('Database connection failed')
              }
            })
          })
        }
      }

      const request = createMockRequest({
        surveyType: 'hardware',
        cpu: 'Intel i7'
      })
      context = createMockContext(brokenEnv, request)

      const response = await onRequestPost(context)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBeTruthy()
    })

    it('handles invalid JSON', async () => {
      const request = {
        json: async () => {
          throw new Error('Invalid JSON')
        },
        headers: new Map([['CF-Connecting-IP', '1.2.3.4']]),
        get: function(key) { return this.headers.get(key) }
      }
      context = createMockContext(env, request)

      const response = await onRequestPost(context)
      expect(response.status).toBe(500)
    })
  })

  describe('Sanitization Trigger', () => {
    it('triggers sanitization after successful submission', async () => {
      const request = createMockRequest({
        surveyType: 'hardware',
        cpu: 'Intel i7',
        gpu: 'RTX 3080'
      })
      context = createMockContext(env, request)

      const response = await onRequestPost(context)
      expect(response.status).toBe(200)

      // Wait a bit for async sanitization
      await new Promise(resolve => setTimeout(resolve, 100))

      // Check that record was added to staging
      const stagingData = env.DB_STAGING._getData()
      expect(stagingData.length).toBeGreaterThan(0)
    })
  })

  describe('Response ID Generation', () => {
    it('generates first response ID as TLC-LH-1', async () => {
      const request = createMockRequest({
        surveyType: 'hardware',
        cpu: 'Intel i7'
      })
      context = createMockContext(env, request)

      const response = await onRequestPost(context)
      const data = await response.json()

      expect(data.responseId).toBe('TLC-LH-1')
    })

    it('increments response ID for subsequent submissions', async () => {
      // Use a fresh environment for this test
      const freshEnv = createMockEnv()
      
      const request = createMockRequest({
        surveyType: 'hardware',
        cpu: 'Intel i7'
      })
      context = createMockContext(freshEnv, request)

      // First submission
      const response1 = await onRequestPost(context)
      const data1 = await response1.json()

      // Second submission - use same context/environment so it sees the first record
      const response2 = await onRequestPost(context)
      const data2 = await response2.json()

      expect(data1.responseId).toBe('TLC-LH-1')
      expect(data2.responseId).toBe('TLC-LH-2')
    })

    it('checks production DB for existing IDs when provided', async () => {
      // Add a record to production DB with TLC-LH-5
      env.DB_PROD._addRecord({ response_id: 'TLC-LH-5' })

      const request = createMockRequest({
        surveyType: 'hardware',
        cpu: 'Intel i7'
      })
      context = createMockContext(env, request)

      const response = await onRequestPost(context)
      const data = await response.json()

      // Should start from TLC-LH-6
      expect(data.responseId).toBe('TLC-LH-6')
    })

    it('handles migration from TLC-CU1 format', async () => {
      // Add a record with old format
      env.DB_STAGING._addRecord({ response_id: 'TLC-CU1-10' })

      const request = createMockRequest({
        surveyType: 'hardware',
        cpu: 'Intel i7'
      })
      context = createMockContext(env, request)

      const response = await onRequestPost(context)
      const data = await response.json()

      // Should continue with new format
      expect(data.responseId).toBe('TLC-LH-11')
    })
  })

  describe('Response Headers', () => {
    it('includes CORS headers in successful response', async () => {
      const request = createMockRequest({
        surveyType: 'hardware',
        cpu: 'Intel i7'
      })
      context = createMockContext(env, request)

      const response = await onRequestPost(context)

      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*')
      expect(response.headers.get('Content-Type')).toBe('application/json')
    })

    it('includes rate limit headers in successful response', async () => {
      const request = createMockRequest({
        surveyType: 'hardware',
        cpu: 'Intel i7'
      })
      context = createMockContext(env, request)

      const response = await onRequestPost(context)

      expect(response.headers.get('X-RateLimit-Remaining')).toBeTruthy()
      expect(response.headers.get('X-RateLimit-Reset')).toBeTruthy()
    })

    it('includes Retry-After header in rate limit response', async () => {
      const ip = '192.168.1.1'
      const request = createMockRequest({
        surveyType: 'hardware',
        cpu: 'Intel i7'
      }, { 'CF-Connecting-IP': ip })
      context = createMockContext(env, request)

      // Fill up rate limit
      for (let i = 0; i < 10; i++) {
        await onRequestPost(context)
      }

      // Next one should be blocked
      const response = await onRequestPost(context)

      expect(response.headers.get('Retry-After')).toBeTruthy()
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*')
    })
  })

  describe('Hardware Survey Edge Cases', () => {
    it('handles all hardware fields', async () => {
      const request = createMockRequest({
        surveyType: 'hardware',
        cpu: 'AMD Ryzen 9 5900X',
        gpu: 'NVIDIA RTX 4090',
        ram: '32GB DDR4',
        storage: '2TB NVMe SSD'
      })
      context = createMockContext(env, request)

      const response = await onRequestPost(context)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })

    it('handles empty strings as null', async () => {
      const request = createMockRequest({
        surveyType: 'hardware',
        cpu: '',
        gpu: '',
        ram: '',
        storage: ''
      })
      context = createMockContext(env, request)

      const response = await onRequestPost(context)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })
  })

  describe('Personal Data Survey Edge Cases', () => {
    it('accepts age exactly 16', async () => {
      const request = createMockRequest({
        surveyType: 'personal',
        age: 16,
        tos: true
      })
      context = createMockContext(env, request)

      const response = await onRequestPost(context)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })

    it('rejects invalid age format', async () => {
      const request = createMockRequest({
        surveyType: 'personal',
        age: 'not-a-number',
        tos: true
      })
      context = createMockContext(env, request)

      const response = await onRequestPost(context)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('16 or older')
    })

    it('rejects TOS as false', async () => {
      const request = createMockRequest({
        surveyType: 'personal',
        age: 25,
        tos: false
      })
      context = createMockContext(env, request)

      const response = await onRequestPost(context)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBeTruthy()
    })

    it('handles optional discord name', async () => {
      const request = createMockRequest({
        surveyType: 'personal',
        age: 25,
        tos: true,
        discordName: 'TestUser#1234'
      })
      context = createMockContext(env, request)

      const response = await onRequestPost(context)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })
  })

  describe('Performance Survey Edge Cases', () => {
    it('handles string FPS values', async () => {
      const request = createMockRequest({
        surveyType: 'performance',
        avgFpsPreCu1: '60',
        avgFpsPostCu1: '65',
        performanceChange: 'Better',
        overallStability: '4'
      })
      context = createMockContext(env, request)

      const response = await onRequestPost(context)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })

    it('handles missing performance fields', async () => {
      const request = createMockRequest({
        surveyType: 'performance'
      })
      context = createMockContext(env, request)

      const response = await onRequestPost(context)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })
  })

  describe('Bug Survey Edge Cases', () => {
    it('handles all bug types', async () => {
      const request = createMockRequest({
        surveyType: 'bug',
        bugNone: false,
        bugBoatStuck: true,
        bugBoatSinking: true,
        bugSlidingBuildings: true,
        bugElevator: true,
        bugQuest: true,
        bugOther: true,
        bugOtherText: 'Custom bug description',
        crashesPerSession: 5
      })
      context = createMockContext(env, request)

      const response = await onRequestPost(context)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })

    it('handles bug frequency and impact in additional_data', async () => {
      const request = createMockRequest({
        surveyType: 'bug',
        bugBoatStuck: true,
        bugFrequency: 'daily',
        bugImpact: 'high',
        resolved: false
      })
      context = createMockContext(env, request)

      const response = await onRequestPost(context)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })

    it('handles quest bugs as yes', async () => {
      const request = createMockRequest({
        surveyType: 'bug',
        bugQuest: true,
        questBugs: 'yes'
      })
      context = createMockContext(env, request)

      const response = await onRequestPost(context)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })
  })

  describe('Quest Survey Edge Cases', () => {
    it('handles quest bugs as no', async () => {
      const request = createMockRequest({
        surveyType: 'quest',
        questProgress: '75%',
        preCu1QuestsRating: 4,
        overallQuestRating: 5,
        questBugs: 'no'
      })
      context = createMockContext(env, request)

      const response = await onRequestPost(context)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })

    it('handles favorite quest in additional_data', async () => {
      const request = createMockRequest({
        surveyType: 'quest',
        questProgress: '50%',
        favoriteQuest: 'The Warehouse'
      })
      context = createMockContext(env, request)

      const response = await onRequestPost(context)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })
  })

  describe('Story Survey Edge Cases', () => {
    it('handles story pacing and character development', async () => {
      const request = createMockRequest({
        surveyType: 'story',
        storyEngagement: 5,
        overallStoryRating: 4,
        overallScore: 5,
        storyPacing: 4,
        characterDevelopment: 5
      })
      context = createMockContext(env, request)

      const response = await onRequestPost(context)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })
  })

  describe('Database Operations', () => {
    it('uses staging database for writes', async () => {
      const request = createMockRequest({
        surveyType: 'hardware',
        cpu: 'Intel i7'
      })
      context = createMockContext(env, request)

      const response = await onRequestPost(context)
      expect(response.status).toBe(200)

      const stagingData = env.DB_STAGING._getData()
      expect(stagingData.length).toBe(1)
    })

    it('falls back to DB when DB_STAGING not available', async () => {
      const fallbackEnv = {
        ...env,
        DB_STAGING: undefined,
        DB: env.DB_STAGING // Use DB as fallback
      }

      const request = createMockRequest({
        surveyType: 'hardware',
        cpu: 'Intel i7'
      })
      context = createMockContext(fallbackEnv, request)

      const response = await onRequestPost(context)
      expect(response.status).toBe(200)
    })

    it('handles database constraint errors', async () => {
      // Create a mock that fails on INSERT
      let insertCalled = false
      const brokenEnv = {
        ...env,
        DB_STAGING: {
          prepare: (query) => {
            const stmt = {
              bind: (...args) => {
                stmt._boundArgs = args
                return stmt
              },
              first: async () => {
                // Allow generateResponseId to succeed
                return null
              },
              run: async () => {
                // Fail on INSERT queries only
                if (query.includes('INSERT INTO')) {
                  insertCalled = true
                  const error = new Error('NOT NULL constraint failed')
                  throw error
                }
                return { meta: { last_row_id: 1 } }
              }
            }
            return stmt
          }
        }
      }

      const request = createMockRequest({
        surveyType: 'hardware',
        cpu: 'Intel i7'
      })
      context = createMockContext(brokenEnv, request)

      const response = await onRequestPost(context)
      const data = await response.json()

      expect(insertCalled).toBe(true)
      expect(response.status).toBe(500)
      expect(data.error).toContain('Database constraint error')
    })

    it('handles missing table errors', async () => {
      const brokenEnv = {
        ...env,
        DB_STAGING: {
          prepare: (query) => {
            const stmt = {
              bind: (...args) => {
                stmt._boundArgs = args
                return stmt
              },
              first: async () => null,
              run: async () => {
                if (query.includes('INSERT INTO')) {
                  throw new Error('no such table: survey_responses')
                }
                return { meta: { last_row_id: 1 } }
              }
            }
            return stmt
          }
        }
      }

      const request = createMockRequest({
        surveyType: 'hardware',
        cpu: 'Intel i7'
      })
      context = createMockContext(brokenEnv, request)

      const response = await onRequestPost(context)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toContain('Database schema error')
    })

    it('handles missing column errors', async () => {
      const brokenEnv = {
        ...env,
        DB_STAGING: {
          prepare: (query) => {
            const stmt = {
              bind: (...args) => {
                stmt._boundArgs = args
                return stmt
              },
              first: async () => null,
              run: async () => {
                if (query.includes('INSERT INTO')) {
                  throw new Error('no such column: invalid_column')
                }
                return { meta: { last_row_id: 1 } }
              }
            }
            return stmt
          }
        }
      }

      const request = createMockRequest({
        surveyType: 'hardware',
        cpu: 'Intel i7'
      })
      context = createMockContext(brokenEnv, request)

      const response = await onRequestPost(context)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toContain('Database schema error')
    })
  })

  describe('Rate Limiting Edge Cases', () => {
    it('handles missing rate limit KV gracefully', async () => {
      const noKvEnv = {
        ...env,
        RATE_LIMIT_KV: null
      }

      const request = createMockRequest({
        surveyType: 'hardware',
        cpu: 'Intel i7'
      })
      context = createMockContext(noKvEnv, request)

      const response = await onRequestPost(context)
      expect(response.status).toBe(200)
    })

    it('handles custom rate limit per hour', async () => {
      const customEnv = {
        ...env,
        RATE_LIMIT_PER_HOUR: '5'
      }

      const ip = '192.168.1.2'
      const request = createMockRequest({
        surveyType: 'hardware',
        cpu: 'Intel i7'
      }, { 'CF-Connecting-IP': ip })
      context = createMockContext(customEnv, request)

      // Submit up to custom limit
      for (let i = 0; i < 5; i++) {
        await onRequestPost(context)
      }

      // Next one should be blocked
      const response = await onRequestPost(context)
      const data = await response.json()

      expect(response.status).toBe(429)
      expect(data.error).toContain('Rate limit exceeded')
    })

    it('uses X-Forwarded-For when CF-Connecting-IP missing', async () => {
      const request = createMockRequest({
        surveyType: 'hardware',
        cpu: 'Intel i7'
      }, { 
        'CF-Connecting-IP': undefined,
        'X-Forwarded-For': '10.0.0.1, 192.168.1.1'
      })
      context = createMockContext(env, request)

      const response = await onRequestPost(context)
      expect(response.status).toBe(200)
    })
  })

  describe('Full Survey Edge Cases', () => {
    it('handles playtime as string', async () => {
      const request = createMockRequest({
        age: 25,
        tos: true,
        playtime: '100+ hours'
      })
      context = createMockContext(env, request)

      const response = await onRequestPost(context)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })

    it('handles playtime as number', async () => {
      const request = createMockRequest({
        age: 25,
        tos: true,
        playtime: 150
      })
      context = createMockContext(env, request)

      const response = await onRequestPost(context)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })

    it('handles all optional fields', async () => {
      const request = createMockRequest({
        age: 25,
        tos: true,
        cpu: 'Intel i7',
        gpu: 'RTX 3080',
        ram: '16GB',
        storage: '1TB',
        playtime: '50-100 hours',
        avgFpsPreCu1: 60,
        avgFpsPostCu1: 65,
        preCu1VsPost: 'Better',
        overallClientStability: 4,
        crashesPerSession: 1,
        questProgress: '50%',
        preCu1QuestsRating: 4,
        motherRating: 5,
        overallScorePostCu1: 5,
        openFeedbackSpace: 'Great game!'
      })
      context = createMockContext(env, request)

      const response = await onRequestPost(context)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })
  })

  describe('Error Messages', () => {
    it('provides helpful error for missing age', async () => {
      const request = createMockRequest({
        surveyType: 'personal',
        tos: true
      })
      context = createMockContext(env, request)

      const response = await onRequestPost(context)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBeTruthy()
      expect(data.message || data.error).toContain('required')
    })

    it('provides helpful error for invalid age', async () => {
      const request = createMockRequest({
        surveyType: 'personal',
        age: 14,
        tos: true
      })
      context = createMockContext(env, request)

      const response = await onRequestPost(context)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('16 or older')
    })

    it('includes reset time in rate limit error', async () => {
      const ip = '192.168.1.3'
      const request = createMockRequest({
        surveyType: 'hardware',
        cpu: 'Intel i7'
      }, { 'CF-Connecting-IP': ip })
      context = createMockContext(env, request)

      // Fill up rate limit
      for (let i = 0; i < 10; i++) {
        await onRequestPost(context)
      }

      const response = await onRequestPost(context)
      const data = await response.json()

      expect(response.status).toBe(429)
      expect(data.resetAt).toBeTruthy()
      expect(data.message).toContain('try again after')
    })
  })
})
