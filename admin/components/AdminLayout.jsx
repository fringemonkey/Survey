import React from 'react'
import Footer from '../../src/components/Footer'

/**
 * Admin layout wrapper component
 * Provides consistent layout for admin pages
 */
function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-notion-bg">
      {children}
      <Footer />
    </div>
  )
}

export default AdminLayout

