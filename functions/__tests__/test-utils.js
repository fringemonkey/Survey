/**
 * Test utilities for Cloudflare Pages Functions
 * Provides mock environment and helpers for testing
 */

/**
 * Create a mock Cloudflare environment
 */
export function createMockEnv(overrides = {}) {
  const mockDb = createMockD1()
  const mockKv = createMockKV()
  
  return {
    DB_STAGING: mockDb,
    DB_PROD: createMockD1(),
    DB: mockDb, // Legacy binding
    RATE_LIMIT_KV: mockKv,
    RATE_LIMIT_PER_HOUR: '10',
    BACKUP_SECRET: 'test-backup-secret',
    SANITIZE_SECRET: 'test-sanitize-secret',
    ...overrides
  }
}

/**
 * Create a mock D1 database
 */
export function createMockD1() {
  const data = []
  let lastId = 0
  
  return {
    prepare: (query) => {
      const stmt = {
        bind: (...args) => {
          stmt._boundArgs = args
          return stmt
        },
        first: async () => {
          // Simple SELECT first() implementation
          if (query.includes('SELECT') && query.includes('LIMIT 1')) {
            if (query.includes('COUNT(*)')) {
              return { count: data.length }
            }
            if (query.includes('response_id')) {
              // Handle response_id queries with LIKE patterns (TLC-LH-% or TLC-CU1-%)
              let filtered = data.filter(r => r.response_id)
              if (query.includes('LIKE')) {
                // Filter by LIKE pattern
                if (query.includes("TLC-LH-%") || query.includes("TLC-CU1-%")) {
                  filtered = filtered.filter(r => 
                    r.response_id && (
                      r.response_id.startsWith('TLC-LH-') || 
                      r.response_id.startsWith('TLC-CU1-')
                    )
                  )
                }
              }
              // Sort by id DESC and return first
              const sorted = filtered.sort((a, b) => b.id - a.id)
              return sorted[0] || null
            }
            // Handle WHERE id = ? queries
            if (query.includes('WHERE id =')) {
              const id = stmt._boundArgs[0]
              return data.find(r => r.id === id) || null
            }
            return data[0] || null
          }
          return null
        },
        all: async () => {
          // Simple SELECT all() implementation
          if (query.includes('SELECT') && !query.includes('LIMIT 1')) {
            if (query.includes('sanitization_status') && query.includes('pending')) {
              return { results: data.filter(r => !r.sanitization_status || r.sanitization_status === 'pending') }
            }
            return { results: data }
          }
          return { results: [] }
        },
        run: async () => {
          // Simple INSERT implementation
          if (query.includes('INSERT INTO')) {
            lastId++
            const record = {
              id: lastId,
              ...stmt._boundArgs.reduce((acc, val, idx) => {
                // Extract column names from query (handle multiline)
                // Match everything between INSERT INTO table_name ( and the closing ) before VALUES
                const columnMatch = query.match(/INSERT INTO \w+\s*\(([\s\S]+?)\)\s*VALUES/i)
                if (columnMatch) {
                  const columns = columnMatch[1]
                    .split(',')
                    .map(c => c.trim())
                    .filter(c => c.length > 0)
                  if (columns && columns[idx]) {
                    acc[columns[idx]] = val
                  }
                }
                return acc
              }, {}),
              sanitization_status: 'pending',
              sanitization_attempts: 0
            }
            data.push(record)
            return { meta: { last_row_id: lastId } }
          }
          // Simple UPDATE implementation
          if (query.includes('UPDATE')) {
            // Find the WHERE id = ? clause - last argument is usually the ID
            const id = stmt._boundArgs[stmt._boundArgs.length - 1]
            const record = data.find(r => r.id === id)
            if (record) {
              // Parse SET clauses from query and map to bound args
              // Extract column names from SET clause
              const setMatch = query.match(/SET\s+(.+?)\s+WHERE/i)
              if (setMatch) {
                const setClause = setMatch[1]
                const columns = setClause.split(',').map(c => {
                  const colMatch = c.match(/(\w+)\s*=/)
                  return colMatch ? colMatch[1].trim() : null
                }).filter(Boolean)
                
                // Map bound args to columns (skip last one which is ID)
                const values = stmt._boundArgs.slice(0, -1)
                columns.forEach((col, idx) => {
                  if (values[idx] !== undefined) {
                    if (col === 'sanitization_status') {
                      record[col] = values[idx] === 'approved' || query.includes("'approved'") ? 'approved' :
                                   values[idx] === 'rejected' || query.includes("'rejected'") ? 'rejected' : values[idx]
                    } else if (col === 'rejected_reason') {
                      record[col] = values[idx] === null || query.includes('NULL') ? null : values[idx]
                    } else {
                      record[col] = values[idx]
                    }
                  }
                })
              }
            }
            return { meta: { changes: record ? 1 : 0 } }
          }
          return { meta: { changes: 0 } }
        }
      }
      return stmt
    },
    _getData: () => data,
    _clear: () => {
      data.length = 0
      lastId = 0
    },
    _addRecord: (record) => {
      lastId++
      data.push({ id: lastId, ...record })
      return lastId
    }
  }
}

/**
 * Create a mock KV namespace
 */
export function createMockKV() {
  const store = new Map()
  
  return {
    get: async (key, options = {}) => {
      const value = store.get(key)
      if (!value) return null
      
      if (options.type === 'json') {
        try {
          return JSON.parse(value)
        } catch {
          return null
        }
      }
      return value
    },
    put: async (key, value, options = {}) => {
      store.set(key, typeof value === 'string' ? value : JSON.stringify(value))
      return undefined
    },
    delete: async (key) => {
      store.delete(key)
      return undefined
    },
    _clear: () => store.clear(),
    _getStore: () => store
  }
}

/**
 * Create a mock request
 */
export function createMockRequest(body, headers = {}) {
  const headerMap = new Map(Object.entries({
    'Content-Type': 'application/json',
    ...headers
  }))
  
  // Only add CF-Connecting-IP if not explicitly provided or set to undefined
  if (!headers.hasOwnProperty('CF-Connecting-IP') && headers['CF-Connecting-IP'] !== undefined) {
    headerMap.set('CF-Connecting-IP', '192.168.1.1')
  } else if (headers['CF-Connecting-IP'] === undefined) {
    headerMap.delete('CF-Connecting-IP')
  }
  
  if (headers['X-Forwarded-For'] === undefined) {
    headerMap.delete('X-Forwarded-For')
  }
  
  return {
    json: async () => body,
    headers: headerMap,
    get: function(key) {
      return this.headers.get(key)
    }
  }
}

/**
 * Create a mock context
 */
export function createMockContext(env, request) {
  return {
    request,
    env,
    waitUntil: (promise) => promise
  }
}

