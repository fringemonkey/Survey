import React from 'react'
import { Routes, Route } from 'react-router-dom'
import AdminDashboard from '../components/AdminDashboard'
import AdminLogin from '../components/AdminLogin'

/**
 * Admin routes
 * All routes under /admin/* are protected by Cloudflare Zero Trust at the edge
 * When mounted at /admin/*, paths are relative
 */
function AdminRoutes() {
  return (
    <Routes>
      <Route index element={<AdminDashboard />} />
      <Route path="login" element={<AdminLogin />} />
    </Routes>
  )
}

export default AdminRoutes

