import { useRef, useState } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { interiorServices } from '../data/siteData'
import './InteriorSection.css'

export default function InteriorSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.1 })
  const [active, setActive] = useState(0)

  return (
    <section className="interior-section" ref={ref}>
      <div className="interior-section__bg" />

      <div className="container">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <span className="section-label" style={{ color: 'rgba(255,255,255,0.8)' }}>Interior Solutions</span>
          <h2 className="section-title" style={{ color: 'var(--white)' }}>
            Transform Your <span style={{ color: 'var(--accent)' }}>Space</span>
          </h2>
          <p className="section-subtitle" style={{ margin: '0 auto', color: 'rgba(255,255,255,0.65)' }}>
            Premium interior design services that turn your property into a dream space.
            From concept to completion, we handle everything.
          </p>
        </motion.div>

        <div className="interior-section__showcase">
          {/* Left: Menu */}
          <motion.div
            className="interior-menu"
            initial={{ opacity: 0, x: -40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.3, duration: 0.7 }}
          >
            {interiorServices.map((item, i) => (
              <button
                key={item.id}
                className={`interior-menu__item ${i === active ? 'active' : ''}`}
                onClick={() => setActive(i)}
              >
                <span className="interior-menu__icon">{item.icon}</span>
                <span className="interior-menu__label">{item.title}</span>
                <span className="interior-menu__arrow">→</span>
              </button>
            ))}
          </motion.div>

          {/* Right: Image */}
          <motion.div
            className="interior-showcase"
            initial={{ opacity: 0, x: 40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.4, duration: 0.7 }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                className="interior-showcase__frame"
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                <img
                  src={interiorServices[active].image}
                  alt={interiorServices[active].title}
                />
                <div className="interior-showcase__info">
                  <h3>{interiorServices[active].title}</h3>
                  <p>{interiorServices[active].desc}</p>
                  <button className="btn btn-accent btn-sm">Request Quote</button>
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Cards Grid */}
        <div className="interior-cards">
          {interiorServices.map((item, i) => (
            <motion.div
              key={item.id}
              className="interior-card"
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.5 + i * 0.1, duration: 0.6 }}
              onMouseEnter={() => setActive(i)}
            >
              <div className="interior-card__img">
                <img src={item.image} alt={item.title} loading="lazy" />
                <div className="interior-card__overlay">
                  <span className="interior-card__icon">{item.icon}</span>
                </div>
              </div>
              <div className="interior-card__label">{item.title}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
