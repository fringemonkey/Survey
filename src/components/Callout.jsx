import React from 'react'

const iconMap = {
  '💡': 'lightbulb',
  '⚠️': 'warning',
  '📝': 'pencil',
  '👉': 'pointing',
  'info': 'info',
}

function Callout({ icon = '💡', children, className = '' }) {
  const displayIcon = typeof icon === 'string' ? icon : iconMap[icon] || '💡'
  
  return (
    <div className={`bg-notion-bg-secondary rounded-lg p-4 my-4 flex gap-3 ${className}`}>
      <div className="flex-shrink-0 text-xl leading-none">{displayIcon}</div>
      <div className="flex-1 text-notion-text-secondary leading-relaxed">
        {children}
      </div>
    </div>
  )
}

export default Callout

