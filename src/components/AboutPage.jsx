import React from 'react'
import { Link } from 'react-router-dom'
import Footer from './Footer'
import GovernmentBanner from './GovernmentBanner'

function AboutPage() {
  return (
    <div className="min-h-screen">
      <GovernmentBanner />

      {/* Main Content */}
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

        <h2 className="text-4xl font-bold mb-8">About This Survey</h2>

        <section className="my-8">
          <h3 className="text-2xl font-bold mb-4">Community-Driven Initiative</h3>
          <p className="text-notion-text-secondary leading-relaxed mb-4">
            This survey is a <strong>community-run project</strong> created by players of <em>The Last Caretaker</em> to better understand how the Last Humans update is performing across different systems and player experiences.
          </p>
          <p className="text-notion-text-secondary leading-relaxed">
            It is not created, requested, endorsed, or managed by the developers of <em>The Last Caretaker</em>.
          </p>
        </section>

        <section className="my-8">
          <h3 className="text-2xl font-bold mb-4">Purpose</h3>
          <p className="text-notion-text-secondary leading-relaxed mb-4">
            After major updates, feedback often becomes fragmented across Discord threads, Steam discussions, and individual bug reports. This survey exists to:
          </p>
          <ul className="list-disc list-inside text-notion-text-secondary space-y-2 ml-4">
            <li>Collect structured performance and stability data</li>
            <li>Identify common bugs and major pain points</li>
            <li>Share workarounds players have discovered</li>
            <li>Compare performance across different hardware setups</li>
            <li>Turn scattered feedback into clear, usable signal</li>
          </ul>
        </section>

        <section className="my-8">
          <h3 className="text-2xl font-bold mb-4">Contact</h3>
          <p className="text-notion-text-secondary leading-relaxed mb-4">
            This survey was created by <strong>Fringemonkey</strong> on Discord.
          </p>
          <p className="text-notion-text-secondary leading-relaxed mb-4">
            If you have feedback on the survey, questions about the methodology, or just want to call me a nerd, feel free to DM me on Discord.
          </p>
          <p className="text-notion-text-secondary leading-relaxed">
            For technical questions about the survey platform or to report issues, please visit the{' '}
            <a 
              href="https://github.com/fringemonkey/Survey" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-notion-accent hover:underline"
            >
              GitHub repository
            </a>.
          </p>
        </section>

        <div className="mt-12 pt-8 border-t border-notion-bg-tertiary">
          <Link
            to="/survey"
            className="bg-notion-accent hover:bg-orange-600 text-white font-semibold px-8 py-4 rounded-lg transition-colors duration-200 inline-block mr-4"
          >
            Start Survey
          </Link>
          <Link
            to="/info"
            className="bg-notion-bg-tertiary hover:bg-notion-bg-secondary text-notion-text font-semibold px-8 py-4 rounded-lg transition-colors duration-200 inline-block mr-4 border border-notion-bg-tertiary"
          >
            More Info
          </Link>
          <Link
            to="/methodology"
            className="bg-notion-bg-tertiary hover:bg-notion-bg-secondary text-notion-text font-semibold px-8 py-4 rounded-lg transition-colors duration-200 inline-block border border-notion-bg-tertiary"
          >
            View Methodology
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default AboutPage

