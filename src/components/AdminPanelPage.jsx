import React from 'react'
import Footer from './Footer'
import GovernmentBanner from './GovernmentBanner'

function AdminPanelPage() {
  return (
    <div className="min-h-screen bg-notion-bg text-notion-text font-sans antialiased">
      <GovernmentBanner />
      <div className="notion-content py-12">
        <div className="mb-8">
          <Link
            to="/methodology"
            className="text-notion-text-secondary hover:text-notion-accent transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Methodology
          </Link>
        </div>

        <h1 className="text-4xl font-bold mb-8">Admin Panel & System Monitoring</h1>

        <section className="my-8">
          <h2 className="text-2xl font-bold mb-4">Purpose</h2>
          <p className="text-notion-text-secondary leading-relaxed mb-4">
            The admin panel exists to monitor system health and ensure the survey platform is functioning correctly. 
            It is <strong>not</strong> a tool for accessing individual user data or special analysis capabilities.
          </p>
          <p className="text-notion-text-secondary leading-relaxed">
            The panel provides visibility into:
          </p>
          <ul className="list-disc list-inside text-notion-text-secondary space-y-2 ml-4 mt-4">
            <li>Database connectivity and record counts</li>
            <li>System health metrics (sanitization status, backup status, rate limiting)</li>
            <li>Recent submission logs (without any user-identifiable information)</li>
            <li>Processing statistics and error rates</li>
          </ul>
        </section>

        <section className="my-8">
          <h2 className="text-2xl font-bold mb-4">What the Admin Panel Shows</h2>
          
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-3">Database Statistics</h3>
            <p className="text-notion-text-secondary leading-relaxed mb-2">
              Shows aggregate counts of records in both staging and production databases:
            </p>
            <ul className="list-disc list-inside text-notion-text-secondary space-y-2 ml-4">
              <li>Total record counts (no individual data)</li>
              <li>Last submission timestamp</li>
              <li>Sanitization status breakdown (pending, approved, rejected counts)</li>
            </ul>
            <p className="text-notion-text-secondary leading-relaxed mt-4">
              This helps verify that data is flowing correctly through the system and that sanitization processes are working.
            </p>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-3">Submission Log</h3>
            <p className="text-notion-text-secondary leading-relaxed mb-2">
              Displays recent submissions with the following information only:
            </p>
            <ul className="list-disc list-inside text-notion-text-secondary space-y-2 ml-4">
              <li>Response ID (e.g., "TLC-LH-123")</li>
              <li>Submission timestamp</li>
              <li>Sanitization status</li>
              <li>Sanitization timestamp</li>
            </ul>
            <p className="text-notion-text-secondary leading-relaxed mt-4">
              <strong>No user-identifiable data is shown:</strong> No Discord names, ages, hardware information, 
              or any survey responses are visible in the log. This log exists solely to verify that submissions 
              are being received and processed correctly.
            </p>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-3">System Status</h3>
            <p className="text-notion-text-secondary leading-relaxed mb-2">
              Monitors the health of various system components:
            </p>
            <ul className="list-disc list-inside text-notion-text-secondary space-y-2 ml-4">
              <li><strong>Database Connectivity:</strong> Verifies both staging and production databases are accessible</li>
              <li><strong>Sanitization Metrics:</strong> Shows pending, approved, and rejected record counts, plus success rates</li>
              <li><strong>Backup Status:</strong> Indicates when last backup was performed</li>
              <li><strong>Rate Limiting:</strong> Confirms rate limiting system is configured and active</li>
            </ul>
            <p className="text-notion-text-secondary leading-relaxed mt-4">
              These metrics help ensure the platform is operating correctly and that automated processes 
              (sanitization, backups) are running as expected.
            </p>
          </div>
        </section>

        <section className="my-8">
          <h2 className="text-2xl font-bold mb-4">What the Admin Panel Does NOT Show</h2>
          <p className="text-notion-text-secondary leading-relaxed mb-4">
            To protect privacy, the admin panel explicitly excludes:
          </p>
          <ul className="list-disc list-inside text-notion-text-secondary space-y-2 ml-4">
            <li>Discord names or any user identifiers</li>
            <li>Individual survey responses or answers</li>
            <li>Hardware information tied to specific users</li>
            <li>Personal data (ages, playtime, etc.)</li>
            <li>Any data that could identify individual respondents</li>
          </ul>
          <p className="text-notion-text-secondary leading-relaxed mt-4">
            The panel is designed for <strong>system monitoring</strong>, not data analysis or user tracking.
          </p>
        </section>

        <section className="my-8">
          <h2 className="text-2xl font-bold mb-4">Database Schema Transparency</h2>
          <p className="text-notion-text-secondary leading-relaxed mb-4">
            The complete database schema is publicly available in the source repository. This demonstrates:
          </p>
          <ul className="list-disc list-inside text-notion-text-secondary space-y-2 ml-4 mb-4">
            <li>Exactly what data fields are collected</li>
            <li>How data is structured and stored</li>
            <li>What information is available (and what is not)</li>
            <li>That no hidden or additional data collection occurs</li>
          </ul>
          <p className="text-notion-text-secondary leading-relaxed mb-4">
            <strong>Database Schema Files:</strong>
          </p>
          <ul className="list-disc list-inside text-notion-text-secondary space-y-2 ml-4 mb-4">
            <li>
              <a 
                href="https://github.com/TLC-Community-Survey/Survey/tree/main/migrations" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-notion-accent hover:underline"
              >
                Migration files (migrations/)
              </a> - Shows the complete schema evolution
            </li>
            <li>
              <a 
                href="https://github.com/TLC-Community-Survey/Survey/blob/main/migrations/0001_init.sql" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-notion-accent hover:underline"
              >
                Initial schema (0001_init.sql)
              </a> - Base table structure
            </li>
          </ul>
          <p className="text-notion-text-secondary leading-relaxed">
            Reviewing these schemas confirms that the admin panel only displays aggregate statistics and system 
            metadata—never individual user data or responses.
          </p>
        </section>

        <section className="my-8">
          <h2 className="text-2xl font-bold mb-4">Authentication & Security</h2>
          <p className="text-notion-text-secondary leading-relaxed mb-4">
            The admin panel uses secure, server-side authentication:
          </p>
          <ul className="list-disc list-inside text-notion-text-secondary space-y-2 ml-4 mb-4">
            <li><strong>Server-Side Sessions:</strong> Authentication uses Cloudflare KV for session storage</li>
            <li><strong>No Password Storage:</strong> Your password is never stored on your device—only a secure session token</li>
            <li><strong>HttpOnly Cookies:</strong> Session tokens are stored in HttpOnly cookies that cannot be accessed by JavaScript</li>
            <li><strong>24-Hour Expiration:</strong> Sessions automatically expire after 24 hours for security</li>
            <li><strong>Secure Transmission:</strong> All authentication happens over HTTPS</li>
          </ul>
          <p className="text-notion-text-secondary leading-relaxed">
            This ensures that even if someone gains access to your browser, they cannot extract your password 
            or session credentials.
          </p>
        </section>

        <section className="my-8">
          <h2 className="text-2xl font-bold mb-4">Why This Matters</h2>
          <p className="text-notion-text-secondary leading-relaxed mb-4">
            The admin panel exists to ensure the survey platform operates correctly and reliably. It provides:
          </p>
          <ul className="list-disc list-inside text-notion-text-secondary space-y-2 ml-4 mb-4">
            <li><strong>Operational Visibility:</strong> Quick verification that systems are functioning</li>
            <li><strong>Problem Detection:</strong> Early identification of issues before they affect users</li>
            <li><strong>Transparency:</strong> Public documentation of what monitoring exists</li>
            <li><strong>Accountability:</strong> Clear boundaries on what data is accessible</li>
          </ul>
          <p className="text-notion-text-secondary leading-relaxed">
            By documenting the admin panel's existence and capabilities, we maintain transparency about 
            system operations while protecting user privacy.
          </p>
        </section>

        <section className="my-8 bg-notion-bg-secondary rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Source Code & Verification</h2>
          <p className="text-notion-text-secondary leading-relaxed mb-4">
            The admin panel implementation is open-source and available for review:
          </p>
          <ul className="list-disc list-inside text-notion-text-secondary space-y-2 ml-4 mb-4">
            <li>
              <a 
                href="https://github.com/TLC-Community-Survey/Survey/tree/main/functions/api/admin.js" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-notion-accent hover:underline"
              >
                Admin API endpoint (functions/api/admin.js)
              </a>
            </li>
            <li>
              <a 
                href="https://github.com/TLC-Community-Survey/Survey/tree/main/src/components/AdminPage.jsx" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-notion-accent hover:underline"
              >
                Admin panel UI (src/components/AdminPage.jsx)
              </a>
            </li>
            <li>
              <a 
                href="https://github.com/TLC-Community-Survey/Survey/tree/main/functions/utils/auth.js" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-notion-accent hover:underline"
              >
                Authentication system (functions/utils/auth.js)
              </a>
            </li>
          </ul>
          <p className="text-notion-text-secondary leading-relaxed">
            Reviewing this code confirms that the admin panel only displays aggregate statistics and system 
            health metrics—never individual user data or responses.
          </p>
        </section>

        <div className="mt-12 pt-8 border-t border-notion-bg-tertiary">
          <Link
            to="/methodology"
            className="text-notion-accent hover:underline"
          >
            ← Back to Methodology & Privacy
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default AdminPanelPage

