/**
 * Admin index handler
 * This file handles /admin routes (non-API routes)
 * API routes are handled by individual files in functions/admin/api/
 * Middleware at functions/admin/_middleware.js handles authentication for all /admin/* routes
 */

export async function onRequest(context) {
  const { request } = context
  const url = new URL(request.url)
  
  // If this is an API route, don't handle it here - let the API handlers handle it
  if (url.pathname.startsWith('/admin/api/')) {
    return context.next()
  }
  
  // For non-API admin routes, just pass through to the frontend
  // The React app will handle routing
  return context.next()
}

