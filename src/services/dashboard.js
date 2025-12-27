/**
 * Dashboard API service
 * Requires authentication via adminAuth service
 */

import { authenticatedFetch } from './adminAuth'

const API_BASE = '/api'

/**
 * Get overall dashboard statistics
 * @returns {Promise<Object>} Dashboard statistics
 */
export async function getOverallStats() {
  try {
    const response = await authenticatedFetch(`/dashboard?type=overall`)

    // Check if response is actually JSON first
    const contentType = response.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      // Don't expose HTML content in error messages
      throw new Error('Dashboard API returned an unexpected response. Make sure you are running with `npm run dev:full` to enable API endpoints.')
    }

    const data = await response.json()

    if (!response.ok) {
      // Handle API error responses
      const errorMessage = data.message || data.error || `HTTP error! status: ${response.status}`
      throw new Error(errorMessage)
    }

    return data
  } catch (error) {
    console.error('Error fetching overall stats:', error)
    throw error
  }
}

/**
 * Get user-specific dashboard data
 * @param {string} discordName - Discord username
 * @returns {Promise<Object>} User data and overall stats
 */
export async function getUserDashboard(discordName) {
  try {
    const response = await authenticatedFetch(`/dashboard?type=user&user=${encodeURIComponent(discordName)}`)

    // Check if response is actually JSON first
    const contentType = response.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      // Don't expose HTML content in error messages
      throw new Error('Dashboard API returned an unexpected response. Make sure you are running with `npm run dev:full` to enable API endpoints.')
    }

    const data = await response.json()

    if (!response.ok) {
      // Handle API error responses
      const errorMessage = data.message || data.error || `HTTP error! status: ${response.status}`
      throw new Error(errorMessage)
    }

    return data
  } catch (error) {
    console.error('Error fetching user dashboard:', error)
    throw error
  }
}

/**
 * Get available fields for report builder
 * @returns {Promise<Object>} Available fields
 */
export async function getAvailableFields() {
  try {
    const response = await authenticatedFetch(`/dashboard?type=fields`)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching available fields:', error)
    throw error
  }
}

/**
 * Generate custom report
 * @param {string} field1 - First field to compare
 * @param {string} field2 - Second field to compare
 * @returns {Promise<Object>} Report data
 */
export async function generateReport(field1, field2) {
  try {
    const url = `/dashboard?type=report&field1=${encodeURIComponent(field1)}&field2=${encodeURIComponent(field2)}`
    const response = await authenticatedFetch(url)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error generating report:', error)
    throw error
  }
}

