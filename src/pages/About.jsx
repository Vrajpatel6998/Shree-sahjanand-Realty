import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import { FiCheckCircle, FiArrowRight, FiTarget, FiZap } from 'react-icons/fi'
import { teamMembers, timeline, whyUs, siteInfo } from '../data/siteData.js'
import TeamSection from '../components/TeamSection'
import CTASection from '../components/CTASection'
import './About.css'

const visionMission = [
  {
    type: 'Vision',
    icon: FiTarget,
    content: 'To be the most trusted and preferred real estate partner across Gujarat, known for integrity, expertise, and client-centric service that transforms property dreams into reality.',
  },
  {
    type: 'Mission',
    icon: FiZap,
    content: 'To provide transparent, ethical, and comprehensive real estate solutions — from property discovery to interior design — creating lasting value for every client we serve.',
  },
]

export default function About({ onInquiryOpen }) {
  const introRef = useRef(null)
  const introInView = useInView(introRef, { once: true, amount: 0.2 })
  const timelineRef = useRef(null)
  const timelineInView = useInView(timelineRef, { once: true, amount: 0.1 })
  const whyRef = useRef(null)
  const whyInView = useInView(whyRef, { once: true, amount: 0.1 })

  return (
    <>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header__bg" />
        <div className="container">
          <motion.div
            className="page-header__content"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1 className="page-header__title">About Us</h1>
            <div className="page-header__breadcrumb">
              <Link to="/">Home</Link>
              <span>/</span>
              <span>About Us</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Company Introduction */}
      <section className="about-intro" ref={introRef}>
        <div className="container">
          <div className="about-intro__grid">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={introInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8 }}
            >
              <span className="section-label">Our Story</span>
              <h2 className="section-title">
                Building Trust in Real Estate{' '}
                <span className="text-accent">Since 2007</span>
              </h2>
              <p style={{ color: 'var(--text-body)', lineHeight: 1.8, marginBottom: 16 }}>
                Founded in 2007 by Mr. Rajesh Patel, <strong>Shree Sahjanand Realty</strong> was born from a simple
                belief — that every family deserves honest, expert guidance in finding their perfect property.
              </p>
              <p style={{ color: 'var(--text-body)', lineHeight: 1.8, marginBottom: 24 }}>
                Over 18+ years, we've grown from a humble property consultancy into Gujarat's most trusted
                full-service real estate firm, serving 1000+ clients across residential, commercial, industrial,
                land, loan, and interior design sectors.
              </p>
              <p style={{ color: 'var(--text-body)', lineHeight: 1.8, marginBottom: 36 }}>
                Our strength lies in our deep market knowledge, transparent dealings, and a passionate team
                of 20+ dedicated professionals committed to making every property transaction seamless and rewarding.
              </p>
              <Link to="/contact" className="btn btn-primary btn-lg">
                Get in Touch <FiArrowRight />
              </Link>
            </motion.div>
            <motion.div
              className="about-intro__visual"
              initial={{ opacity: 0, x: 50 }}
              animate={introInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="about-intro__img-stack">
                <div className="about-intro__img about-intro__img--main">
                  <img src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=700&q=80" alt="Our Office" />
                </div>
                <div className="about-intro__img about-intro__img--overlay">
                  <img src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=80" alt="Team" />
                </div>
                <div className="about-intro__stat-chip">
                  <strong>18+</strong>
                  <span>Years of Trust</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="vision-mission">
        <div className="container">
          <div className="vision-mission__grid">
            {visionMission.map((item, i) => (
              <motion.div
                key={item.type}
                className="vm-card"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2, duration: 0.7 }}
              >
                <div className="vm-card__icon"><item.icon size={32} /></div>
                <h3 className="vm-card__type">{item.type}</h3>
                <div className="vm-card__divider" />
                <p className="vm-card__content">{item.content}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="why-us" ref={whyRef}>
        <div className="container">
          <motion.div
            className="section-header"
            initial={{ opacity: 0, y: 30 }}
            animate={whyInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <span className="section-label">Why Us</span>
            <h2 className="section-title">Why Choose Shree Sahjanand Realty?</h2>
            <p className="section-subtitle" style={{ margin: '0 auto' }}>
              We combine deep market expertise with genuine care to deliver exceptional real estate experiences.
            </p>
          </motion.div>

          <div className="why-us__grid">
            {whyUs.map((item, i) => (
              <motion.div
                key={item.title}
                className="why-card"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={whyInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <div className="why-card__icon"><item.icon size={32} /></div>
                <h4 className="why-card__title">{item.title}</h4>
                <p className="why-card__desc">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Company Timeline */}
      <section className="timeline-section" ref={timelineRef}>
        <div className="timeline-section__bg" />
        <div className="container">
          <motion.div
            className="section-header"
            initial={{ opacity: 0, y: 30 }}
            animate={timelineInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <span className="section-label" style={{ color: 'rgba(255,255,255,0.7)' }}>Journey</span>
            <h2 className="section-title" style={{ color: 'var(--white)' }}>Our Company Journey</h2>
          </motion.div>

          <div className="timeline">
            {timeline.map((item, i) => (
              <motion.div
                key={item.year}
                className={`timeline-item ${i % 2 === 0 ? 'timeline-item--left' : 'timeline-item--right'}`}
                initial={{ opacity: 0, x: i % 2 === 0 ? -50 : 50 }}
                animate={timelineInView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: i * 0.15, duration: 0.7 }}
              >
                <div className="timeline-item__card">
                  <div className="timeline-item__year">{item.year}</div>
                  <h4 className="timeline-item__title">{item.title}</h4>
                  <p className="timeline-item__desc">{item.desc}</p>
                </div>
                <div className="timeline-item__dot" />
              </motion.div>
            ))}
            <div className="timeline__line" />
          </div>
        </div>
      </section>

      {/* Team Section */}
      <TeamSection />

      {/* CTA Section */}
      <CTASection onInquiryOpen={onInquiryOpen} />
    </>
  )
}
