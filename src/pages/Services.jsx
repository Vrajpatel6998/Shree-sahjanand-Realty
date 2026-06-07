import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiArrowRight, FiCheckCircle } from 'react-icons/fi'
import { services } from '../data/siteData'
import CTASection from '../components/CTASection'
import './Services.css'

export default function Services({ onInquiryOpen }) {
  const location = useLocation()

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.slice(1)
      setTimeout(() => {
        const el = document.getElementById(id)
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    }
  }, [location])

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
            transition={{ duration: 0.7 }}
          >
            <h1 className="page-header__title">Our Services</h1>
            <div className="page-header__breadcrumb">
              <Link to="/">Home</Link>
              <span>/</span>
              <span>Services</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Service Sections */}
      {services.map((service, i) => (
        <section
          key={service.id}
          id={service.id}
          className={`service-detail ${i % 2 === 1 ? 'service-detail--alt' : ''}`}
        >
          <div className="container">
            <div className="service-detail__grid">
              {/* Image */}
              <motion.div
                className="service-detail__visual"
                initial={{ opacity: 0, x: i % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.8 }}
              >
                <div className="service-detail__img-wrap">
                  <img src={service.image} alt={service.title} />
                  <div className="service-detail__img-badge" style={{ background: service.gradient }}>
                    <span>{service.icon}</span>
                  </div>
                </div>
              </motion.div>

              {/* Content */}
              <motion.div
                className="service-detail__content"
                initial={{ opacity: 0, x: i % 2 === 0 ? 50 : -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <span className="section-label">Our Services</span>
                <h2 className="service-detail__title">{service.title}</h2>
                <p className="service-detail__desc">{service.description}</p>

                <div className="service-detail__features">
                  {service.features.map((f) => (
                    <div key={f} className="service-detail__feature">
                      <FiCheckCircle className="service-detail__check" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>

                <div className="service-detail__actions">
                  <button className="btn btn-primary btn-lg" onClick={onInquiryOpen}>
                    Inquire Now <FiArrowRight />
                  </button>
                  <Link to="/contact" className="btn btn-outline-primary btn-lg">
                    Contact Us
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      ))}

      <CTASection onInquiryOpen={onInquiryOpen} />
    </>
  )
}
