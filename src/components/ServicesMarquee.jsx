import { useState } from 'react'
import { useSite } from '../context/SiteContext'
import './ServicesMarquee.css'

export default function ServicesMarquee() {
  const { services } = useSite()
  const [isPaused, setIsPaused] = useState(false)
  
  // Extract service titles
  const items = services.map(s => s.title)
  // Duplicate for seamless loop
  const allItems = [...items, ...items, ...items]

  return (
    <div 
      className="marquee-wrapper"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="marquee-label">
        <span className="marquee-label-icon">✦</span>
        <span className="marquee-label-text">Special Services</span>
      </div>
      <div className="marquee-content">
        <div 
          className="marquee-track"
          style={{ animationPlayState: isPaused ? 'paused' : 'running' }}
        >
          {allItems.map((item, i) => (
            <span key={i} className="marquee-item">
              <span className="marquee-dot">✦</span>
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
