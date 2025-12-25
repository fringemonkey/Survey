import React from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Callout from './Callout'
import CollapsibleSection from './CollapsibleSection'
import Footer from './Footer'

function LandingPage() {
  const navigate = useNavigate()
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
        <div className="mb-8">
          <Link
            to="/"
            className="text-notion-text-secondary hover:text-notion-accent transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>
        </div>
        <h2 className="text-4xl font-bold mb-8">The Last Caretaker - Xmas 2025 State of the Game Survey</h2>

        <Callout icon="💡">
          <strong>This is NOT an official Channel 37 survey.</strong> This is a community project started by Fringemonkey. The goal is to provide feedback about the state of the game to the Devs. Any response is completely voluntary and appreciated.
        </Callout>

        <section className="my-8">
          <h3 className="text-2xl font-bold mb-4">How It Works</h3>
          <p className="text-notion-text-secondary leading-relaxed mb-4">
            The focus of this survey is to get insight into player experience in regards to the first major patch (CU1), both the patch process itself and the changes made. Hopefully we can use this to help us and the Devs determine what the major issues are and what the overall feelings from the community are currently.
          </p>
        </section>

        <CollapsibleSection title="Why did this survey get made?">
          <p className="mb-4">
            I (Fringemonkey on Discord) talk to a ton of people on the Discord, and every group/time zone/channel has a "vibe". From talking to them since the patch I have noticed the opinions vary a lot and every time I check a new group or channel I learn about something new, good and bad. I am a networking and data guy by trade so when I can't keep up with the data or make sense of it in my head, I build structure to put it in. Then usually I start collecting the data myself. Its been made clear to me that in this case, my perspective is a tiny data point in a vast ocean, so I need help. My HOPE is it provides useful insights for anyone that cares.
          </p>
          <p>
            If you have feedback on the survey or just want to call me a nerd feel free to DM me on Discord.
          </p>
        </CollapsibleSection>

        <section className="my-8">
          <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <span>📝</span>
            <span>Take the Survey</span>
          </h3>
          <p className="text-notion-text-secondary leading-relaxed mb-6">
            Click the button below to start the survey. Your response will be added to the database where we can view all feedback together and provide consolidated insights to the Channel 37 developers.
          </p>

          <div className="my-6">
            <h4 className="text-xl font-semibold mb-4">Survey Sections</h4>
            <ul className="list-disc list-inside text-notion-text-secondary space-y-2 ml-4">
              <li>Stability and performance feedback <span className="text-red-500">(Required)</span></li>
              <li>Quests and objectives experience <span className="text-gray-500">(Optional)</span></li>
              <li>Exploration and puzzle mechanics <span className="text-gray-500">(Optional)</span></li>
              <li>Lore and story impressions <span className="text-gray-500">(Optional)</span></li>
            </ul>
          </div>

          <button
            onClick={() => navigate('/survey/form')}
            className="bg-notion-accent hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors duration-200 mt-6"
          >
            Start Survey
          </button>
        </section>

        <Callout icon="⚠️" className="mt-8">
          <div>
            <strong>Eligibility & Data Use:</strong> You must be <strong>16 years or older</strong> to participate. We collect your <strong>Discord username and age</strong> and process this data in accordance with applicable data protection laws, including the <strong>EU General Data Protection Regulation (GDPR)</strong>.
          </div>
          <Callout icon="💡" className="mt-4 bg-notion-bg-tertiary">
            If the survey gets abused in anyway that violates Notion's policies or the rules of common decency it will be removed and the data deleted. Let's all be adults please.
          </Callout>
          </Callout>
      </div>
      <Footer />
    </div>
  )
}

export default LandingPage

