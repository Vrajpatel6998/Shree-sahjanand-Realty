import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { FiArrowRight } from 'react-icons/fi'
import { loanTypes, loanProcess } from '../data/siteData'
import './LoanSection.css'

export default function LoanSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.1 })

  return (
    <section className="loan-section" ref={ref}>
      {/* Decorative BG */}
      <div className="loan-section__bg" />

      <div className="container">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <span className="section-label">Financial Solutions</span>
          <h2 className="section-title">
            Real Estate <span className="text-accent">Loan Services</span>
          </h2>
          <p className="section-subtitle" style={{ margin: '0 auto' }}>
            We connect you with the best lending partners for seamless real estate financing
            at the most competitive rates in the market.
          </p>
        </motion.div>

        {/* Loan Types */}
        <div className="loan-section__types">
          {loanTypes.map((loan, i) => (
            <motion.div
              key={loan.id}
              className="loan-card"
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.1, duration: 0.6 }}
            >
              <div className="loan-card__icon">{loan.icon}</div>
              <h3 className="loan-card__title">{loan.title}</h3>
              <p className="loan-card__desc">{loan.desc}</p>
              <div className="loan-card__rate">
                <span className="loan-card__rate-label">Starting from</span>
                <span className="loan-card__rate-value">{loan.rate}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Process Timeline */}
        <motion.div
          className="loan-section__process"
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.5, duration: 0.7 }}
        >
          <div className="loan-process__header">
            <h3 className="loan-process__title">Our Simple Loan Process</h3>
          </div>
          <div className="loan-process__steps">
            {loanProcess.map((step, i) => (
              <div key={step.step} className="loan-step">
                <div className="loan-step__circle">
                  <span className="loan-step__icon">{step.icon}</span>
                  <div className="loan-step__num">{step.step}</div>
                </div>
                {i < loanProcess.length - 1 && <div className="loan-step__line" />}
                <div className="loan-step__content">
                  <h4 className="loan-step__title">{step.title}</h4>
                  <p className="loan-step__desc">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          className="loan-section__cta"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.7 }}
        >
          <div className="loan-cta-card">
            <div className="loan-cta-card__text">
              <h3>Ready to secure the best loan deal?</h3>
              <p>Our financial experts are waiting to guide you through the best options.</p>
            </div>
            <button className="btn btn-gold btn-lg">
              Get Free Loan Advice
              <FiArrowRight />
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
