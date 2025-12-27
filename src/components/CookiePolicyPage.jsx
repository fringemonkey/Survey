import React from 'react'
import { Link } from 'react-router-dom'
import Footer from './Footer'
import GovernmentBanner from './GovernmentBanner'

function CookiePolicyPage() {
  return (
    <div className="min-h-screen">
      <GovernmentBanner />

      <div className="notion-content py-12">
        <div className="mb-8">
          <Link
            to="/survey"
            className="text-notion-text-secondary hover:text-notion-accent transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Survey
          </Link>
        </div>

        <h1 className="text-4xl font-bold mb-6">Cookie Policy</h1>

        <div className="bg-notion-bg-secondary rounded-lg p-8 space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-4">What Are Cookies?</h2>
            <p className="text-notion-text-secondary leading-relaxed">
              Cookies are small text files that are stored on your device when you visit a website. 
              They help websites remember information about your visit, such as your preferences and actions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">How We Use Cookies and LocalStorage</h2>
            <p className="text-notion-text-secondary mb-4">
              We use session cookies and browser localStorage for the following purposes:
            </p>
            <ul className="list-disc list-inside space-y-2 text-notion-text-secondary ml-4">
              <li>
                <strong>Session Management:</strong> Session cookies maintain your survey session as you navigate 
                through the form pages
              </li>
              <li>
                <strong>Auto-Save Functionality:</strong> Browser localStorage automatically saves your form progress 
                as you fill it out, allowing you to resume if you close the browser or navigate away
              </li>
              <li>
                <strong>Data Integrity:</strong> To prevent duplicate submissions and ensure the 
                accuracy of survey responses
              </li>
              <li>
                <strong>Security:</strong> To help protect against unauthorized access to your survey data
              </li>
              <li>
                <strong>Admin Panel Authentication:</strong> If you access the admin panel, a secure HttpOnly session cookie 
                is used for authentication. This cookie contains only a randomly generated session token—your password is 
                <strong> never</strong> stored on your device. Sessions are managed entirely server-side using Cloudflare KV storage 
                and expire after 24 hours.
              </li>
            </ul>
            <p className="text-notion-text-secondary mt-4">
              <strong>Important:</strong> All data stored in localStorage remains on your device and is never 
              transmitted to our servers until you submit the completed form. You can clear this data at any time 
              through your browser settings.
            </p>
            <p className="text-notion-text-secondary mt-4">
              <strong>Security Note:</strong> Admin authentication uses server-side session management. Your password is 
              verified once during login and never stored on your device. Only a secure session token is stored in an 
              HttpOnly cookie, which cannot be accessed by JavaScript. All session validation happens server-side.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Cookie Duration</h2>
            <p className="text-notion-text-secondary leading-relaxed mb-4">
              Cookie duration depends on the type:
            </p>
            <ul className="list-disc list-inside space-y-2 text-notion-text-secondary ml-4 mb-4">
              <li>
                <strong>Survey Session Cookies:</strong> Expire automatically after <strong>20 minutes of inactivity</strong>. 
                This means if you don't interact with the survey for 20 minutes, your session will end 
                and you'll need to start over. This helps protect your privacy and ensures fresh sessions 
                for each survey attempt.
              </li>
              <li>
                <strong>Admin Panel Session Cookies:</strong> Expire after <strong>24 hours</strong> or when you log out. 
                These cookies are HttpOnly (not accessible to JavaScript) and contain only a server-generated session token.
              </li>
              <li>
                <strong>Cookie Consent:</strong> Stored for 1 year to remember your consent preference.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">What We Don't Use Cookies For</h2>
            <p className="text-notion-text-secondary mb-4">
              We are committed to transparency and privacy. We do <strong>not</strong> use cookies for:
            </p>
            <ul className="list-disc list-inside space-y-2 text-notion-text-secondary ml-4">
              <li>Tracking your browsing behavior across other websites</li>
              <li>Advertising or marketing purposes</li>
              <li>Building user profiles</li>
              <li>Sharing data with third parties</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Managing Cookies</h2>
            <p className="text-notion-text-secondary leading-relaxed mb-4">
              You can control cookies through your browser settings. Most browsers allow you to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-notion-text-secondary ml-4">
              <li>View what cookies are stored on your device</li>
              <li>Delete cookies</li>
              <li>Block cookies from specific sites</li>
              <li>Block all cookies</li>
            </ul>
            <p className="text-notion-text-secondary mt-4">
              <strong>Note:</strong> If you choose to block cookies or disable localStorage, you may not be able to 
              complete the survey, as these technologies are required for the survey to function properly. 
              Your form progress will not be saved if localStorage is disabled.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Your Consent</h2>
            <p className="text-notion-text-secondary leading-relaxed">
              By clicking "Accept Cookies" when starting the survey, you consent to our use of 
              session cookies as described in this policy. You can withdraw your consent at any time 
              by clearing your browser cookies or declining cookies when prompted.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">More Information</h2>
            <p className="text-notion-text-secondary leading-relaxed">
              For more information about how we handle your data, please see our{' '}
              <Link to="/methodology" className="text-notion-accent hover:underline">
                Methodology & Privacy
              </Link>
              {' '}page. For details about system monitoring and the admin panel, see our{' '}
              <Link to="/admin-panel" className="text-notion-accent hover:underline">
                Admin Panel documentation
              </Link>
              . If you have questions about our cookie usage, please contact us through 
              the appropriate channels.
            </p>
          </section>

          <section className="pt-4 border-t border-notion-bg-tertiary">
            <p className="text-sm text-notion-text-secondary">
              <strong>Last Updated:</strong> {new Date().toLocaleDateString()}
            </p>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default CookiePolicyPage

