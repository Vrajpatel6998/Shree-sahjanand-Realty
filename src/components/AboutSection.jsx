import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import { FiArrowRight, FiCheckCircle } from 'react-icons/fi'
import './AboutSection.css'

const highlights = [
  "18+ Years of Trust & Excellence",
  "1000+ Happy Families Served",
  "RERA Compliant Properties",
  "End-to-End Legal Support",
  "Pan-Gujarat Real Estate Network",
  "Transparent & Honest Dealings",
]

export default function AboutSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.2 })

  return (
    <section className="about" id="about" ref={ref}>
      <div className="container">
        <div className="about__grid">
          {/* Image Side */}
          <motion.div
            className="about__visual"
            initial={{ opacity: 0, x: -60 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="about__img-wrap">
              <div className="about__img-main">
                <img
                  src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=700&q=80"
                  alt="Shree Sahjanand Realty Office"
                />
              </div>
              <div className="about__img-secondary">
                <img
                  src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&q=80"
                  alt="Premium Property"
                />
              </div>
              <div className="about__badge">
                <span className="about__badge-year">2007</span>
                <span className="about__badge-text">Year of<br />Establishment</span>
              </div>
              <div className="about__experience-card">
                <div className="about__exp-number">18+</div>
                <div className="about__exp-label">Years of<br />Experience</div>
              </div>
            </div>
          </motion.div>

          {/* Content Side */}
          <motion.div
            className="about__content"
            initial={{ opacity: 0, x: 60 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="section-label">About Us</span>
            <h2 className="section-title">
              Gujarat's Most Trusted{' '}
              <span className="text-accent">Real Estate</span> Consultancy
            </h2>
            <p className="about__desc">
              Since 2007, <strong>Shree Sahjanand Realty</strong> has been the cornerstone of real estate excellence
              in Gujarat. We are a full-service real estate consultancy providing premium residential,
              commercial, industrial, land, loan, and interior design services.
            </p>
            <p className="about__desc">
              Our team of dedicated professionals brings unmatched market expertise, transparent dealings,
              and a client-first approach that has earned the trust of over 1,000 families and businesses.
            </p>

            <div className="about__highlights">
              {highlights.map((h, i) => (
                <motion.div
                  key={h}
                  className="about__highlight-item"
                  initial={{ opacity: 0, x: 20 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.4 + i * 0.08 }}
                >
                  <FiCheckCircle className="about__check-icon" />
                  <span>{h}</span>
                </motion.div>
              ))}
            </div>

            <div className="about__actions">
              <Link to="/about" className="btn btn-primary btn-lg">
                Read More About Us
                <FiArrowRight />
              </Link>
              <Link to="/contact" className="btn btn-outline-primary btn-lg">
                Get in Touch
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
