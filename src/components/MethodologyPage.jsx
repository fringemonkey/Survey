import React from 'react'
import { Link } from 'react-router-dom'
import Footer from './Footer'
import GovernmentBanner from './GovernmentBanner'

function MethodologyPage() {
  return (
    <div className="min-h-screen bg-notion-bg text-notion-text font-sans antialiased">
      <GovernmentBanner />
      <div className="notion-content py-12">
        <div className="mb-8">
          <Link
            to="/info"
            className="text-notion-text-secondary hover:text-notion-accent transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>
        </div>

        <h2 className="text-4xl font-bold mb-8">Survey Methodology & Platform Decisions</h2>

        <section className="my-8">
          <h3 className="text-2xl font-bold mb-4">Purpose of this document</h3>
          <p className="text-notion-text-secondary leading-relaxed mb-4">
            This document explains:
          </p>
          <ul className="list-disc list-inside text-notion-text-secondary space-y-2 ml-4 mb-4">
            <li>How the survey is designed</li>
            <li>How data is collected and interpreted</li>
            <li>Why specific tooling decisions were made</li>
            <li>Known limitations and tradeoffs</li>
          </ul>
          <p className="text-notion-text-secondary leading-relaxed">
            The goal is <strong>transparency</strong>, not authority.
          </p>
        </section>

        <section className="my-8">
          <h3 className="text-2xl font-bold mb-4">Survey methodology</h3>
          
          <div className="mb-6">
            <h4 className="text-xl font-semibold mb-3">Design principles</h4>
            <p className="text-notion-text-secondary leading-relaxed mb-4">
              This survey follows these principles:
            </p>
            <ol className="list-decimal list-inside text-notion-text-secondary space-y-2 ml-4">
              <li><strong>Player-first design</strong> — Questions are written in plain language and based on observable gameplay.</li>
              <li><strong>Structured over anecdotal</strong> — Quantitative data (FPS, ratings, bug counts) is prioritized to reduce noise.</li>
              <li><strong>Optional depth</strong> — Required sections capture core performance data; optional sections allow deeper feedback.</li>
              <li><strong>No assumptions</strong> — Players are not asked to diagnose causes—only to report experiences.</li>
            </ol>
          </div>

          <div className="mb-6">
            <h4 className="text-xl font-semibold mb-3">Data collection approach</h4>
            <ul className="list-disc list-inside text-notion-text-secondary space-y-2 ml-4">
              <li>One response per Discord name</li>
              <li>Secure return/edit links allow responses to evolve over time</li>
              <li>No login or account creation required</li>
              <li>No tracking beyond submission</li>
            </ul>
          </div>

          <div className="mb-6">
            <h4 className="text-xl font-semibold mb-3">Analysis approach</h4>
            <p className="text-notion-text-secondary leading-relaxed mb-4">
              Collected data is analyzed in aggregate to identify:
            </p>
            <ul className="list-disc list-inside text-notion-text-secondary space-y-2 ml-4 mb-4">
              <li>Common bugs and stability issues</li>
              <li>Performance changes before vs after CU1</li>
              <li>Correlations between hardware and reported issues</li>
              <li>Trends across the player base</li>
            </ul>
            <p className="text-notion-text-secondary leading-relaxed">
              Results are reported as <strong>patterns</strong>, not conclusions.
            </p>
          </div>
        </section>

        <section className="my-8">
          <h3 className="text-2xl font-bold mb-4">Platform comparison: Why a custom survey was chosen</h3>
          <p className="text-notion-text-secondary leading-relaxed mb-6">
            Several survey platforms were evaluated. Below is a comparison.
          </p>

          <div className="overflow-x-auto mb-6">
            <table className="w-full border-collapse border border-notion-bg-tertiary">
              <thead>
                <tr className="bg-notion-bg-secondary">
                  <th className="border border-notion-bg-tertiary p-3 text-left font-semibold">Capability</th>
                  <th className="border border-notion-bg-tertiary p-3 text-left font-semibold">SurveyMonkey</th>
                  <th className="border border-notion-bg-tertiary p-3 text-left font-semibold">Google Forms</th>
                  <th className="border border-notion-bg-tertiary p-3 text-left font-semibold">Custom (Cloudflare Pages + D1)</th>
                </tr>
              </thead>
              <tbody className="text-notion-text-secondary">
                <tr>
                  <td className="border border-notion-bg-tertiary p-3">Familiar user trust</td>
                  <td className="border border-notion-bg-tertiary p-3">High</td>
                  <td className="border border-notion-bg-tertiary p-3">Very High</td>
                  <td className="border border-notion-bg-tertiary p-3">Medium (improves with transparency)</td>
                </tr>
                <tr>
                  <td className="border border-notion-bg-tertiary p-3">Conditional logic</td>
                  <td className="border border-notion-bg-tertiary p-3">Yes</td>
                  <td className="border border-notion-bg-tertiary p-3">Yes</td>
                  <td className="border border-notion-bg-tertiary p-3">Yes</td>
                </tr>
                <tr>
                  <td className="border border-notion-bg-tertiary p-3">One response per Discord user</td>
                  <td className="border border-notion-bg-tertiary p-3">No</td>
                  <td className="border border-notion-bg-tertiary p-3">No</td>
                  <td className="border border-notion-bg-tertiary p-3">Yes</td>
                </tr>
                <tr>
                  <td className="border border-notion-bg-tertiary p-3">Secure return-to-edit links</td>
                  <td className="border border-notion-bg-tertiary p-3">Limited</td>
                  <td className="border border-notion-bg-tertiary p-3">No</td>
                  <td className="border border-notion-bg-tertiary p-3">Yes</td>
                </tr>
                <tr>
                  <td className="border border-notion-bg-tertiary p-3">Structured bug modeling</td>
                  <td className="border border-notion-bg-tertiary p-3">Weak</td>
                  <td className="border border-notion-bg-tertiary p-3">Weak</td>
                  <td className="border border-notion-bg-tertiary p-3">Strong</td>
                </tr>
                <tr>
                  <td className="border border-notion-bg-tertiary p-3">Hardware correlation analysis</td>
                  <td className="border border-notion-bg-tertiary p-3">Manual</td>
                  <td className="border border-notion-bg-tertiary p-3">Manual</td>
                  <td className="border border-notion-bg-tertiary p-3">Automated</td>
                </tr>
                <tr>
                  <td className="border border-notion-bg-tertiary p-3">Data schema control</td>
                  <td className="border border-notion-bg-tertiary p-3">No</td>
                  <td className="border border-notion-bg-tertiary p-3">No</td>
                  <td className="border border-notion-bg-tertiary p-3">Yes</td>
                </tr>
                <tr>
                  <td className="border border-notion-bg-tertiary p-3">Long-term tracking</td>
                  <td className="border border-notion-bg-tertiary p-3">Poor</td>
                  <td className="border border-notion-bg-tertiary p-3">Poor</td>
                  <td className="border border-notion-bg-tertiary p-3">Excellent</td>
                </tr>
                <tr>
                  <td className="border border-notion-bg-tertiary p-3">Data ownership</td>
                  <td className="border border-notion-bg-tertiary p-3">Platform-owned</td>
                  <td className="border border-notion-bg-tertiary p-3">Google-owned</td>
                  <td className="border border-notion-bg-tertiary p-3">Community-owned</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mb-6">
            <h4 className="text-xl font-semibold mb-3">Why SurveyMonkey was not used</h4>
            <p className="text-notion-text-secondary leading-relaxed mb-4">
              SurveyMonkey excels at fast surveys and basic charts, but:
            </p>
            <ul className="list-disc list-inside text-notion-text-secondary space-y-2 ml-4">
              <li>Cannot enforce Discord-based uniqueness</li>
              <li>Cannot reliably support return-to-edit links</li>
              <li>Stores data in survey-centric formats</li>
              <li>Requires repeated manual exports for analysis</li>
            </ul>
            <p className="text-notion-text-secondary leading-relaxed mt-4">
              This limits long-term usefulness.
            </p>
          </div>

          <div className="mb-6">
            <h4 className="text-xl font-semibold mb-3">Why Google Forms was not used</h4>
            <p className="text-notion-text-secondary leading-relaxed mb-4">
              Google Forms is highly trusted and easy to use, but:
            </p>
            <ul className="list-disc list-inside text-notion-text-secondary space-y-2 ml-4">
              <li>Cannot enforce one response per Discord user</li>
              <li>Has no usable return-to-edit mechanism</li>
              <li>Stores all responses as flat text</li>
              <li>Requires manual normalization for every analysis pass</li>
            </ul>
            <p className="text-notion-text-secondary leading-relaxed mt-4">
              It is suitable for quick sentiment checks, not structured performance tracking.
            </p>
          </div>

          <div className="mb-6">
            <h4 className="text-xl font-semibold mb-3">Why a custom solution was selected</h4>
            <p className="text-notion-text-secondary leading-relaxed mb-4">
              The custom approach enables:
            </p>
            <ul className="list-disc list-inside text-notion-text-secondary space-y-2 ml-4">
              <li>Clean, structured data collection</li>
              <li>Enforced uniqueness and editability</li>
              <li>Hardware-aware analysis</li>
              <li>Transparent methodology</li>
              <li>Long-term reuse across future patches</li>
            </ul>
            <p className="text-notion-text-secondary leading-relaxed mt-4">
              While initial trust requires explanation, transparency and published results help offset this.
            </p>
          </div>
        </section>

        <section className="my-8">
          <h3 className="text-2xl font-bold mb-4">Technical architecture</h3>
          <p className="text-notion-text-secondary leading-relaxed mb-4">
            This survey is built using a modern, serverless architecture that prioritizes privacy, reliability, and cost-effectiveness:
          </p>
          
          <div className="mb-6">
            <h4 className="text-xl font-semibold mb-3">Frontend: React + Vite</h4>
            <p className="text-notion-text-secondary leading-relaxed mb-2">
              The user interface is built with React and Vite, providing a fast, responsive experience. The frontend is statically generated and served via Cloudflare's global CDN.
            </p>
          </div>

          <div className="mb-6">
            <h4 className="text-xl font-semibold mb-3">Hosting: Cloudflare Pages</h4>
            <p className="text-notion-text-secondary leading-relaxed mb-2">
              The survey is hosted on Cloudflare Pages, which provides:
            </p>
            <ul className="list-disc list-inside text-notion-text-secondary space-y-2 ml-4">
              <li>Global CDN distribution for fast loading worldwide</li>
              <li>Automatic HTTPS encryption</li>
              <li>Serverless function support for API endpoints</li>
              <li>Free tier suitable for community projects</li>
            </ul>
          </div>

          <div className="mb-6">
            <h4 className="text-xl font-semibold mb-3">Database: Cloudflare D1 (SQLite)</h4>
            <p className="text-notion-text-secondary leading-relaxed mb-2">
              All survey responses are stored in Cloudflare D1, a serverless SQLite database that:
            </p>
            <ul className="list-disc list-inside text-notion-text-secondary space-y-2 ml-4">
              <li>Stores data securely in Cloudflare's infrastructure</li>
              <li>Provides structured, queryable data storage</li>
              <li>Offers generous free tier limits (5GB storage, 5M reads/day)</li>
              <li>Enables fast, efficient data retrieval for dashboards and reports</li>
            </ul>
            <p className="text-notion-text-secondary leading-relaxed mt-4">
              <strong>D1 is the primary storage.</strong> All survey data is stored here first and remains here permanently.
            </p>
          </div>

          <div className="mb-6">
            <h4 className="text-xl font-semibold mb-3">API: Cloudflare Pages Functions</h4>
            <p className="text-notion-text-secondary leading-relaxed mb-2">
              Serverless API endpoints handle form submissions and data retrieval:
            </p>
            <ul className="list-disc list-inside text-notion-text-secondary space-y-2 ml-4">
              <li><code>/api/submit</code> — Processes survey form submissions and stores data in D1</li>
              <li><code>/api/dashboard</code> — Provides aggregate statistics and user-specific data</li>
            </ul>
            <p className="text-notion-text-secondary leading-relaxed mt-4">
              These functions run on Cloudflare's edge network, ensuring low latency and high availability.
            </p>
          </div>

          <div className="mb-6 bg-notion-bg-secondary rounded-lg p-4">
            <h4 className="text-xl font-semibold mb-3">Data flow</h4>
            <p className="text-notion-text-secondary leading-relaxed mb-2">
              When you submit the survey:
            </p>
            <ol className="list-decimal list-inside text-notion-text-secondary space-y-2 ml-4">
              <li>Your form data is sent to <code>/api/submit</code> (Cloudflare Pages Function)</li>
              <li>The function validates your data and stores it in D1 database</li>
              <li>You receive a unique edit link to update your response later</li>
            </ol>
            <p className="text-notion-text-secondary leading-relaxed mt-4">
              All data is stored securely in D1 as the primary and permanent storage location.
            </p>
          </div>

          <div className="mb-6">
            <h4 className="text-xl font-semibold mb-3">Privacy and security</h4>
            <ul className="list-disc list-inside text-notion-text-secondary space-y-2 ml-4">
              <li>All data transmission is encrypted via HTTPS</li>
              <li>Data is stored in Cloudflare's secure infrastructure</li>
              <li>No third-party tracking or analytics are used</li>
              <li>No cookies are used for tracking (only for survey functionality)</li>
              <li>Source code is open-source and auditable</li>
            </ul>
          </div>
        </section>

        <section className="my-8">
          <h3 className="text-2xl font-bold mb-4">Known limitations</h3>
          <ul className="list-disc list-inside text-notion-text-secondary space-y-2 ml-4">
            <li>Discord names are self-reported</li>
            <li>Hardware data is player-entered and may be approximate</li>
            <li>FPS values are estimates, not benchmarks</li>
            <li>Participation is voluntary and self-selected</li>
          </ul>
          <p className="text-notion-text-secondary leading-relaxed mt-4">
            These limitations are acknowledged in all analysis.
          </p>
        </section>

        <section className="my-8">
          <h3 className="text-2xl font-bold mb-4">Transparency commitment</h3>
          <ul className="list-disc list-inside text-notion-text-secondary space-y-2 ml-4">
            <li>Methodology is public</li>
            <li>Schema decisions are documented</li>
            <li>Results are shared in aggregate</li>
            <li>No claims of authority or endorsement are made</li>
          </ul>
          <p className="text-notion-text-secondary leading-relaxed mt-4">
            This project exists to improve understanding—not to speak for anyone.
          </p>
        </section>

        <section className="my-8">
          <h3 className="text-2xl font-bold mb-4">Source code and transparency</h3>
          <p className="text-notion-text-secondary leading-relaxed mb-4">
            This survey is implemented using a small, custom, open-source codebase.
          </p>
          <p className="text-notion-text-secondary leading-relaxed mb-4">
            The source repository is publicly available for anyone who is interested in:
          </p>
          <ul className="list-disc list-inside text-notion-text-secondary space-y-2 ml-4 mb-4">
            <li>Reviewing how data is collected and stored</li>
            <li>Verifying that no additional tracking or data collection occurs</li>
            <li>Understanding how edits and deduplication are handled</li>
          </ul>
          <p className="text-notion-text-secondary leading-relaxed mb-4">
            Reviewing the code is <strong>not required</strong> to participate in the survey.
          </p>
          <p className="text-notion-text-secondary leading-relaxed">
            <strong>Repository:</strong>{' '}
            <a 
              href="https://github.com/fringemonkey/Survey" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-notion-accent hover:underline"
            >
              https://github.com/fringemonkey/Survey
            </a>
          </p>
        </section>

        <div className="mt-12 pt-8 border-t border-notion-bg-tertiary">
          <Link
            to="/survey"
            className="bg-notion-accent hover:bg-orange-600 text-white font-semibold px-8 py-4 rounded-lg transition-colors duration-200 inline-block"
          >
            Start Survey
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default MethodologyPage

