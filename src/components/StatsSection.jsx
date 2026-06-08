import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { stats } from '../data/siteData.js'
import './StatsSection.css'

function Counter({ value, suffix, duration = 2000 }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (!inView) return
    let startTime = null
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3) // ease out cubic
      setCount(Math.floor(eased * value))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [inView, value, duration])

  return <span ref={ref}>{count}{suffix}</span>
}

export default function StatsSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.3 })

  return (
    <section className="stats" ref={ref}>
      <div className="container">
        <motion.div
          className="stats__header"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <span className="section-label">Our Achievement</span>
          <h2 className="section-title">Numbers That Speak</h2>
        </motion.div>

        <div className="stats__grid">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.id}
              className="stats__card"
              initial={{ opacity: 0, y: 40, scale: 0.9 }}
              animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{ duration: 0.6, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="stats__icon"><stat.icon size={36} /></div>
              <div className="stats__number">
                <Counter value={stat.value} suffix={stat.suffix} />
              </div>
              <div className="stats__label">{stat.label}</div>
              <div className="stats__glow" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
