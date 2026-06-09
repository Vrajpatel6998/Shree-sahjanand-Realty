import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import {
  FiCheckCircle,
  FiArrowRight,
  FiTarget,
  FiZap,
  FiFlag,
  FiUsers,
  FiTrendingUp,
  FiLayers,
  FiDollarSign,
  FiCpu,
  FiAward
} from 'react-icons/fi'
import { teamMembers, timeline, whyUs, siteInfo } from '../data/siteData.js'
import TeamSection from '../components/TeamSection'
import CTASection from '../components/CTASection'
import ServicesMarquee from '../components/ServicesMarquee'
import './About.css'

const timelineIcons = [
  FiFlag,        // 2007 - Foundation
  FiUsers,       // 2010 - First 100 Clients
  FiTrendingUp,  // 2013 - Commercial Expansion
  FiLayers,      // 2016 - Interior Division
  FiDollarSign,  // 2019 - Loan Advisory
  FiCpu,         // 2022 - Digital Transformation
  FiAward        // 2024 - 1000+ Clients
]

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

      {/* Services Marquee */}
      <ServicesMarquee />

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
                  <img src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=700&q=80" alt="Modern Building" />
                </div>
                <div className="about-intro__img about-intro__img--overlay">
                  <img src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=500&q=80" alt="Fully Furnished Home" />
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
            <h2 className="section-title">
              Why Choose <span className="text-accent">Shree Sahjanand Realty?</span>
            </h2>
            <p className="section-subtitle" style={{ margin: '0 auto' }}>
              Trusted by 1000+ families — combining expertise, integrity, and personalized service.
            </p>
          </motion.div>

          <div className="why-us__three-col">
            {/* LEFT: First 3 cards */}
            <div className="why-us__col why-us__col--left">
              {whyUs.slice(0, 3).map((item, i) => (
                <motion.div
                  key={item.title}
                  className="why-card"
                  initial={{ opacity: 0, x: -50 }}
                  animate={whyInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: i * 0.12, duration: 0.55 }}
                >
                  <div className={`why-card__icon why-card__icon--${i}`}>
                    <item.icon size={22} />
                  </div>
                  <div className="why-card__text">
                    <h4 className="why-card__title">{item.title}</h4>
                    <p className="why-card__desc">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* CENTER: City / building illustration */}
            <motion.div
              className="why-us__center"
              initial={{ opacity: 0, y: 30 }}
              animate={whyInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="why-us__center-capsule">
                <div className="why-us__center-badge">
                  ✦ Trusted by 1000+ Clients
                </div>
                <img
                  src="/city-illustration.png"
                  alt="Modern Real Estate"
                  className="why-us__city-img"
                />
                {/* Floating stat chips */}
                <div className="why-us__float-chip why-us__float-chip--top">
                  <strong>18+</strong>
                  <span>Years</span>
                </div>
                <div className="why-us__float-chip why-us__float-chip--bottom">
                  <strong>500+</strong>
                  <span>Properties</span>
                </div>
              </div>
            </motion.div>

            {/* RIGHT: Last 3 cards */}
            <div className="why-us__col why-us__col--right">
              {whyUs.slice(3, 6).map((item, i) => (
                <motion.div
                  key={item.title}
                  className="why-card why-card--right"
                  initial={{ opacity: 0, x: 50 }}
                  animate={whyInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: i * 0.12, duration: 0.55 }}
                >
                  <div className={`why-card__icon why-card__icon--${i + 3}`}>
                    <item.icon size={22} />
                  </div>
                  <div className="why-card__text">
                    <h4 className="why-card__title">{item.title}</h4>
                    <p className="why-card__desc">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
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
            <span className="section-label">Journey</span>
            <h2 className="section-title">Our Company Journey</h2>
            <p className="section-subtitle" style={{ margin: '0 auto' }}>
              Hover over each milestone node along the road to see our detailed timeline content.
            </p>
          </motion.div>

          <div className="journey-road">
            {/* The SVG road line (Desktop only) */}
            <div className="journey-road__track">
              <svg viewBox="0 0 1300 500" width="100%" height="100%" preserveAspectRatio="none" className="journey-road__svg">
                {/* Outer Road Casing */}
                <path
                  d="M 0 100 C 50 100, 50 40, 100 40 C 150 40, 150 100, 200 100 C 250 100, 250 160, 300 160 C 350 160, 350 100, 400 100 C 450 100, 450 40, 500 40 C 550 40, 550 100, 600 100 C 650 100, 650 160, 700 160 C 750 160, 750 100, 800 100 C 850 100, 850 40, 900 40 C 950 40, 950 100, 1000 100 C 1050 100, 1050 160, 1100 160 C 1150 160, 1150 100, 1200 100 C 1250 100, 1250 40, 1300 40 C 1350 40, 1350 100, 1400 100"
                  fill="none"
                  stroke="rgba(13, 27, 75, 0.08)"
                  strokeWidth="28"
                  strokeLinecap="round"
                />
                {/* Inner Road Fill */}
                <path
                  d="M 0 100 C 50 100, 50 40, 100 40 C 150 40, 150 100, 200 100 C 250 100, 250 160, 300 160 C 350 160, 350 100, 400 100 C 450 100, 450 40, 500 40 C 550 40, 550 100, 600 100 C 650 100, 650 160, 700 160 C 750 160, 750 100, 800 100 C 850 100, 850 40, 900 40 C 950 40, 950 100, 1000 100 C 1050 100, 1050 160, 1100 160 C 1150 160, 1150 100, 1200 100 C 1250 100, 1250 40, 1300 40 C 1350 40, 1350 100, 1400 100"
                  fill="none"
                  stroke="#1e293b"
                  strokeWidth="20"
                  strokeLinecap="round"
                />
                {/* Dashed Center Lane */}
                <path
                  d="M 0 100 C 50 100, 50 40, 100 40 C 150 40, 150 100, 200 100 C 250 100, 250 160, 300 160 C 350 160, 350 100, 400 100 C 450 100, 450 40, 500 40 C 550 40, 550 100, 600 100 C 650 100, 650 160, 700 160 C 750 160, 750 100, 800 100 C 850 100, 850 40, 900 40 C 950 40, 950 100, 1000 100 C 1050 100, 1050 160, 1100 160 C 1150 160, 1150 100, 1200 100 C 1250 100, 1250 40, 1300 40 C 1350 40, 1350 100, 1400 100"
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeDasharray="8 8"
                />
              </svg>
            </div>

            {/* Interactive Nodes */}
            <div className="journey-road__nodes">
              {timeline.map((item, i) => {
                const IconComponent = timelineIcons[i] || FiCheckCircle
                const isUp = i % 2 === 0
                const positions = [7, 20, 37, 52, 67, 82, 95]
                const xPct = positions[i]
                const yPct = isUp ? 2 : 30

                return (
                  <motion.div
                    key={item.year}
                    className={`journey-node journey-node--${isUp ? 'up' : 'down'}`}
                    style={{ left: `${xPct}%`, top: `${yPct}%` }}
                    initial={{ opacity: 0, scale: 0.5 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1, duration: 0.5 }}
                  >
                    {/* Node Dot / Icon button */}
                    <div className="journey-node__icon-wrapper">
                      <div className="journey-node__icon">
                        <IconComponent size={20} />
                      </div>
                      <div className="journey-node__info">
                        <span className="journey-node__year">{item.year}</span>
                        <span className="journey-node__title">{item.title}</span>
                      </div>
                    </div>

                    {/* Pop-up detail card */}
                    <div className="journey-node__card">
                      <div className="journey-node__card-arrow" />
                      <div className="journey-node__card-year">{item.year}</div>
                      <h4 className="journey-node__card-title">{item.title}</h4>
                      <p className="journey-node__card-desc">{item.desc}</p>
                    </div>
                  </motion.div>
                )
              })}
            </div>
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
