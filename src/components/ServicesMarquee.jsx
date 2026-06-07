import './ServicesMarquee.css'

const items = [
  "Residential Properties",
  "Commercial Properties",
  "Industrial Properties",
  "Land Properties",
  "Real Estate Loans",
  "Interior Design Services",
]

export default function ServicesMarquee() {
  // Duplicate for seamless loop
  const allItems = [...items, ...items, ...items]

  return (
    <div className="marquee-wrapper">
      <div className="marquee-track">
        {allItems.map((item, i) => (
          <span key={i} className="marquee-item">
            <span className="marquee-dot">✦</span>
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}
