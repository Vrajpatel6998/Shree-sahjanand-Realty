import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import { FiArrowRight } from 'react-icons/fi'
import { services } from '../data/siteData'
import './ServicesSection.css'

export default function ServicesSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.1 })

  // Show only 4 main property services on homepage
  const mainServices = services.slice(0, 4)

  return (
    <section className="services-section" ref={ref}>
      <div className="container">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <span className="section-label">What We Offer</span>
          <h2 className="section-title">Our Premium Services</h2>
          <p className="section-subtitle" style={{ margin: '0 auto' }}>
            Comprehensive real estate solutions tailored to your needs — from residential homes
            to commercial empires, we cover it all.
          </p>
        </motion.div>

        <div className="services-section__grid">
          {mainServices.map((service, i) => (
            <motion.div
              key={service.id}
              className="service-card"
              initial={{ opacity: 0, y: 50 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.12, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="service-card__image">
                <img src={service.image} alt={service.title} loading="lazy" />
                <div className="service-card__overlay" style={{ background: `${service.color}cc` }} />
              </div>

              <div className="service-card__content">
                <div className="service-card__icon">{service.icon}</div>
                <h3 className="service-card__title">{service.title}</h3>
                <p className="service-card__desc">{service.shortDesc}</p>
                <Link
                  to={`/services#${service.id}`}
                  className="service-card__cta"
                >
                  Learn More <FiArrowRight />
                </Link>
              </div>

              <div className="service-card__features">
                {service.features.slice(0, 3).map((f) => (
                  <span key={f} className="service-card__feature">✓ {f}</span>
                ))}
              </div>

              <div className="service-card__shine" />
            </motion.div>
          ))}
        </div>

        <motion.div
          className="services-section__footer"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.6 }}
        >
          <Link to="/services" className="btn btn-primary btn-lg">
            View All Services
            <FiArrowRight />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
