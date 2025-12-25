import React from 'react'
import { Link } from 'react-router-dom'
import Callout from './Callout'

function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Banner */}
      <div className="bg-white text-black py-12 px-4">
        <div className="notion-content">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            <span className="text-black">THE LAST</span>
            <br />
            <span className="text-orange-500">CARETAKER</span>
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="notion-content py-12">
        <h2 className="text-4xl font-bold mb-8">The Last Caretaker – Community Performance Survey (CU1)</h2>

        <section className="my-8">
          <h3 className="text-2xl font-bold mb-4">Why this survey exists</h3>
          <p className="text-notion-text-secondary leading-relaxed mb-4">
            This is a <strong>community-run survey</strong> created by players of <em>The Last Caretaker</em> to better understand how the <strong>CU1 update</strong> is performing across different systems and player experiences.
          </p>
          <p className="text-notion-text-secondary leading-relaxed mb-4">
            After major updates, feedback often becomes fragmented across Discord threads, Steam discussions, and individual bug reports. Important details get repeated, lost, or buried. This survey exists to:
          </p>
          <ul className="list-disc list-inside text-notion-text-secondary space-y-2 ml-4 mb-4">
            <li>Collect <strong>structured performance and stability data</strong></li>
            <li>Identify <strong>common bugs and major pain points</strong></li>
            <li>Share <strong>workarounds players have discovered</strong></li>
            <li>Compare how the game performs across <strong>different hardware setups</strong></li>
            <li>Turn scattered feedback into <strong>clear, usable signal</strong></li>
          </ul>
          <p className="text-notion-text-secondary leading-relaxed">
            The goal is to benefit the <strong>player community</strong>, <strong>support volunteers</strong>, and—if they choose to review it—the <strong>developers</strong>, without speaking for them.
          </p>
        </section>

        <Callout icon="⚠️">
          <div>
            <h4 className="font-semibold mb-2">Important disclaimers</h4>
            <p className="mb-2">Please read before participating:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li><strong>This survey is not official.</strong> It is not created, requested, endorsed, or managed by the developers of <em>The Last Caretaker</em>.</li>
              <li><strong>This survey does not represent the developers.</strong> All summaries and interpretations are community-generated and informational only.</li>
              <li><strong>Participation does not guarantee changes.</strong> Results may be shared publicly, but there is no promise of fixes or responses.</li>
              <li><strong>No insider or confidential information is collected.</strong> All questions relate only to normal gameplay and publicly observable behavior.</li>
            </ul>
            <p className="mt-2">This project exists solely to organize player experiences in a useful and transparent way.</p>
          </div>
        </Callout>

        <section className="my-8">
          <h3 className="text-2xl font-bold mb-4">Who this survey is for</h3>
          <p className="text-notion-text-secondary leading-relaxed mb-4">
            This survey is intended for:
          </p>
          <ul className="list-disc list-inside text-notion-text-secondary space-y-2 ml-4 mb-4">
            <li>Active players of <em>The Last Caretaker</em></li>
            <li>Players who experienced performance or stability changes after CU1</li>
            <li>Players who encountered bugs or gameplay issues</li>
            <li>Community members interested in improving shared understanding</li>
          </ul>
          <p className="text-notion-text-secondary leading-relaxed">
            You do <strong>not</strong> need technical expertise. Approximate answers are completely acceptable.
          </p>
        </section>

        <section className="my-8">
          <h3 className="text-2xl font-bold mb-4">What data is collected (and why)</h3>
          <p className="text-notion-text-secondary leading-relaxed mb-4">The survey collects:</p>
          <ul className="list-disc list-inside text-notion-text-secondary space-y-2 ml-4 mb-4">
            <li><strong>Basic system information</strong> (CPU, GPU, RAM) → to understand performance differences across hardware</li>
            <li><strong>FPS and stability data (pre- and post-CU1)</strong> → to identify performance improvements or regressions</li>
            <li><strong>Bug reports and workarounds</strong> → to highlight common issues and how players are mitigating them</li>
            <li><strong>Optional quest and story feedback</strong> → to understand player sentiment around CU1 content</li>
            <li><strong>Optional open-ended feedback</strong> → for anything not covered elsewhere</li>
          </ul>
          <p className="text-notion-text-secondary leading-relaxed">No sensitive personal information is collected.</p>
        </section>

        <section className="my-8">
          <h3 className="text-2xl font-bold mb-4">Identity, duplicates, and editing responses</h3>
          <ul className="list-disc list-inside text-notion-text-secondary space-y-2 ml-4 mb-4">
            <li>The survey asks for a <strong>Discord name</strong> only to prevent duplicate submissions and improve overall data quality.</li>
            <li><strong>One response per Discord name</strong> is allowed.</li>
            <li>After submitting, you will receive a <strong>unique return/edit link</strong>. This link allows you to update your responses later if your experience changes.</li>
            <li>Edit links are secure, not guessable, and only usable by the original respondent.</li>
          </ul>
          <p className="text-notion-text-secondary leading-relaxed">
            Discord names are <strong>not used for moderation, tracking, or enforcement</strong>, and are not shared outside the dataset.
          </p>
        </section>

        <section className="my-8">
          <h3 className="text-2xl font-bold mb-4">Privacy and transparency</h3>
          <ul className="list-disc list-inside text-notion-text-secondary space-y-2 ml-4">
            <li>Data is stored securely and used <strong>only</strong> for analysis related to this survey.</li>
            <li>Results may be shared publicly <strong>in aggregate form</strong> (counts, averages, trends).</li>
            <li>Individual responses are never highlighted or singled out.</li>
            <li>No advertising, monetization, or third-party tracking is involved.</li>
          </ul>
        </section>

        <section className="my-8">
          <h3 className="text-2xl font-bold mb-4">Time commitment</h3>
          <ul className="list-disc list-inside text-notion-text-secondary space-y-2 ml-4">
            <li>Required sections: <strong>~5 minutes</strong></li>
            <li>Optional sections: <strong>up to ~10 minutes total</strong></li>
          </ul>
          <p className="text-notion-text-secondary leading-relaxed mt-4">You can skip any optional section.</p>
        </section>

        <section className="my-8">
          <h3 className="text-2xl font-bold mb-4">Why your participation matters</h3>
          <p className="text-notion-text-secondary leading-relaxed mb-4">By contributing, you help:</p>
          <ul className="list-disc list-inside text-notion-text-secondary space-y-2 ml-4 mb-4">
            <li>Reduce repeated "is this just me?" discussions</li>
            <li>Identify issues affecting many players</li>
            <li>Improve the quality of community support</li>
            <li>Create clearer feedback signals around updates</li>
          </ul>
          <p className="text-notion-text-secondary leading-relaxed">Even one response helps.</p>
        </section>

        <section className="my-12 bg-notion-bg-secondary rounded-lg p-8 text-center">
          <h3 className="text-2xl font-bold mb-4">Ready to participate?</h3>
          <p className="text-notion-text-secondary mb-6">Click below to begin the survey.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/survey"
              className="bg-notion-accent hover:bg-orange-600 text-white font-semibold px-8 py-4 rounded-lg transition-colors duration-200"
            >
              Start Survey
            </Link>
            <Link
              to="/methodology"
              className="bg-notion-bg-tertiary hover:bg-notion-bg-secondary text-notion-text font-semibold px-8 py-4 rounded-lg transition-colors duration-200 border border-notion-bg-tertiary"
            >
              View Methodology
            </Link>
          </div>
          <p className="text-notion-text-secondary mt-6 text-sm">Thank you for supporting the community.</p>
        </section>
      </div>
    </div>
  )
}

export default HomePage

