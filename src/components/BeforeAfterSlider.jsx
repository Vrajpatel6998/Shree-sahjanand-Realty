import { useState } from 'react'
import './BeforeAfterSlider.css'

export default function BeforeAfterSlider({ 
  beforeImage = "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200&q=80", 
  afterImage = "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200&q=90",
  beforeLabel = "Before",
  afterLabel = "After"
}) {
  const [position, setPosition] = useState(50)

  const handleSliderChange = (e) => {
    setPosition(Number(e.target.value))
  }

  return (
    <div className="before-after-slider">
      {/* Before Image (Bottom) */}
      <div className="before-after-slider__img before-after-slider__img--before">
        <img src={beforeImage} alt={beforeLabel} />
        <span className="before-after-slider__label before-after-slider__label--before">
          {beforeLabel}
        </span>
      </div>

      {/* After Image (Top, Clipped) */}
      <div 
        className="before-after-slider__img before-after-slider__img--after"
        style={{ clipPath: `inset(0 0 0 ${position}%)` }}
      >
        <img src={afterImage} alt={afterLabel} />
        <span className="before-after-slider__label before-after-slider__label--after">
          {afterLabel}
        </span>
      </div>

      {/* Interactive Handle Line and Drag Circle */}
      <div 
        className="before-after-slider__handle" 
        style={{ left: `${position}%` }}
      >
        <div className="before-after-slider__handle-line" />
        <div className="before-after-slider__handle-btn">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
            <path d="M8.5 7l-5 5 5 5V7zm7 0v10l5-5-5-5z" />
          </svg>
        </div>
      </div>

      {/* Hidden input overlay for mouse/touch interactions */}
      <input 
        type="range"
        min="0"
        max="100"
        value={position}
        onChange={handleSliderChange}
        className="before-after-slider__input"
        aria-label="Before and after comparison slider"
      />
    </div>
  )
}
