import React from 'react'

function GovernmentBanner() {
  return (
    <div className="relative w-full bg-gradient-to-b from-slate-800 to-slate-900 text-white overflow-hidden">
      {/* Official Banner Stripes */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600"></div>
      
      {/* Content */}
      <div className="relative py-12 md:py-16">
        <div className="notion-content w-full">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Official COCS Logo */}
            <div className="flex-shrink-0">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-white/10 backdrop-blur-sm border-4 border-white/20 overflow-hidden flex items-center justify-center">
                <img 
                  src="/cocs-logo.png" 
                  alt="COCS Logo" 
                  className="w-full h-full object-cover scale-150"
                />
              </div>
            </div>
            
            {/* Title and Subtitle */}
            <div className="flex-1 text-center md:text-left">
              <div className="mb-2">
                <span className="text-xs md:text-sm font-semibold tracking-wider uppercase text-blue-300">
                  Community Performance Survey
                </span>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold mb-2 leading-tight">
                <span className="text-white">THE LAST</span>
                <br />
                <span className="text-orange-400">CARETAKER</span>
              </h1>
              <p className="text-sm md:text-base text-slate-300 font-medium">
                Last Humans Update Performance & Stability Assessment
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom Accent Bar */}
      <div className="h-1 bg-gradient-to-r from-orange-500 via-orange-400 to-orange-500"></div>
    </div>
  )
}

export default GovernmentBanner

