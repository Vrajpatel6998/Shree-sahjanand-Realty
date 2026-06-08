import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { FiPhone } from 'react-icons/fi'
import { teamMembers } from '../data/siteData.js'
import './TeamSection.css'

export default function TeamSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.1 })

  return (
    <section className="team-section" ref={ref}>
      <div className="container">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <span className="section-label">Our Experts</span>
          <h2 className="section-title">Meet Our Professional Team</h2>
          <p className="section-subtitle" style={{ margin: '0 auto' }}>
            Dedicated real estate professionals committed to finding you the perfect property
            with personalized service and deep market expertise.
          </p>
        </motion.div>

        <div className="team-section__grid">
          {teamMembers.map((member, i) => (
            <motion.div
              key={member.id}
              className="team-card"
              initial={{ opacity: 0, y: 50 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.13, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="team-card__photo">
                <img src={member.image} alt={member.name} loading="lazy" />
              </div>

              <div className="team-card__info">
                <div className="team-card__exp-badge">{member.experience}</div>
                <h3 className="team-card__name">{member.name}</h3>
                <p className="team-card__designation">{member.designation}</p>
                <a href={`tel:${member.phone}`} className="team-card__contact-btn">
                  <FiPhone />
                  {member.phone}
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
