import React from 'react'
import { Routes, Route } from 'react-router-dom'
import AdminDashboard from '../components/AdminDashboard'
import AdminLogin from '../components/AdminLogin'

/**
 * Admin routes
 * All routes under /admin/* are protected by Cloudflare Zero Trust at the edge
 */
function AdminRoutes() {
  return (
    <Routes>
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/login" element={<AdminLogin />} />
    </Routes>
  )
}

export default AdminRoutes

