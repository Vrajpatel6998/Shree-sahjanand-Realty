import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import { FiArrowRight, FiMessageSquare, FiAward, FiSmile, FiHome, FiStar } from 'react-icons/fi'
import './CTASection.css'

export default function CTASection({ onInquiryOpen }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.3 })

  return (
    <section className="cta-section" ref={ref}>
      {/* Background particles */}
      <div className="cta-section__bg">
        {[...Array(6)].map((_, i) => (
          <div key={i} className={`cta-particle cta-particle--${i + 1}`} />
        ))}
      </div>

      <div className="container">
        <motion.div
          className="cta-section__content"
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="cta-section__label">✦ Take The Next Step ✦</div>
          <h2 className="cta-section__heading">
            Looking For Your<br />
            <span className="cta-section__highlight">Dream Property?</span>
          </h2>
          <p className="cta-section__sub">
            Let our experts guide you to the perfect property. With 18+ years of experience
            and 1000+ happy clients, we're ready to help you today.
          </p>

          <div className="cta-section__actions">
            <Link to="/contact" className="btn btn-white btn-lg">
              Contact Us
              <FiArrowRight />
            </Link>
            <button className="btn btn-accent btn-lg" onClick={onInquiryOpen}>
              <FiMessageSquare />
              Submit Inquiry
            </button>
          </div>

          <div className="cta-section__trust">
            <div className="cta-trust-item">
              <span className="cta-trust-icon"><FiAward /></span>
              <span>18+ Years</span>
            </div>
            <div className="cta-trust-item">
              <span className="cta-trust-icon"><FiSmile /></span>
              <span>1000+ Clients</span>
            </div>
            <div className="cta-trust-item">
              <span className="cta-trust-icon"><FiHome /></span>
              <span>500+ Properties</span>
            </div>
            <div className="cta-trust-item">
              <span className="cta-trust-icon"><FiStar /></span>
              <span>5-Star Service</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
