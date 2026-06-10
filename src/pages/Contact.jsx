import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiPhone, FiMail, FiMapPin, FiSend, FiUser, FiBriefcase, FiDollarSign, FiAward, FiTag, FiSearch } from 'react-icons/fi'
import { useSite } from '../context/SiteContext'
import { inquiryFormOptions } from '../data/siteData.js'
import ServicesMarquee from '../components/ServicesMarquee'
import './Contact.css'

const initialForm = {
  firstName: '',
  lastName: '',
  contactNumber: '',
  alternateNumber: '',
  interestedService: '',
  occupation: '',
  budget: '',
  inquiryType: '',
  reference: ''
}

export default function Contact() {
  const { siteInfo } = useSite()
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const contactCards = [
    {
      icon: FiPhone,
      title: 'Call Us',
      lines: [siteInfo.phone, siteInfo.phone2].filter(Boolean),
      href: `tel:${siteInfo.phone}`,
      color: '#1a3c8e',
    },
    {
      icon: FiMail,
      title: 'Email Us',
      lines: [siteInfo.email, siteInfo.email2].filter(Boolean),
      href: `mailto:${siteInfo.email}`,
      color: '#1a3c8e',
    },
    {
      icon: FiMapPin,
      title: 'Visit Us',
      lines: [siteInfo.address],
      href: '#map',
      color: '#1a3c8e',
    },
  ]
  const [shakeActive, setShakeActive] = useState(false)
  const [currentTaglineIdx, setCurrentTaglineIdx] = useState(0)

  const taglineLines = [
    <span key="award" className="contact-tagline-item"><FiAward style={{ color: 'var(--accent)' }} /> Your Trusted Real Estate Partner Since 2007</span>,
    <span key="phone" className="contact-tagline-item"><FiPhone style={{ color: 'var(--accent)' }} /> Contact us for free legal guidance & property consulting!</span>
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTaglineIdx(prev => (prev + 1) % taglineLines.length)
    }, 4500)
    return () => clearInterval(timer)
  }, [taglineLines.length])

  const validateField = (name, value, allValues) => {
    let error = ''
    switch (name) {
      case 'firstName':
        if (!value.trim()) {
          error = 'First name is required'
        } else if (value.trim().length < 2) {
          error = 'Must be at least 2 characters'
        }
        break
      case 'lastName':
        if (!value.trim()) {
          error = 'Last name is required'
        } else if (value.trim().length < 2) {
          error = 'Must be at least 2 characters'
        }
        break
      case 'contactNumber':
        if (!value.trim()) {
          error = 'Contact number is required'
        } else {
          const cleaned = value.replace(/[\s()-]/g, '')
          const phoneRegex = /^(?:\+91|91|0)?[6-9]\d{9}$/
          if (!phoneRegex.test(cleaned)) {
            error = 'Enter a valid 10-digit number'
          }
        }
        break
      case 'alternateNumber':
        if (value.trim()) {
          const cleaned = value.replace(/[\s()-]/g, '')
          const phoneRegex = /^(?:\+91|91|0)?[6-9]\d{9}$/
          if (!phoneRegex.test(cleaned)) {
            error = 'Enter a valid alternate number'
          } else if (cleaned === allValues.contactNumber.replace(/[\s()-]/g, '')) {
            error = 'Must be different from primary contact'
          }
        }
        break
      case 'interestedService':
        if (!value) {
          error = 'Please select a service'
        }
        break
      case 'inquiryType':
        if (!value) {
          error = 'Please select an inquiry type'
        }
        break
      default:
        break
    }
    return error
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => {
      const updated = { ...prev, [name]: value }
      if (touched[name]) {
        const error = validateField(name, value, updated)
        setErrors(prevErr => ({ ...prevErr, [name]: error }))
      }
      return updated
    })
  }

  const handleBlur = (e) => {
    const { name, value } = e.target
    setTouched(prev => ({ ...prev, [name]: true }))
    const error = validateField(name, value, form)
    setErrors(prev => ({ ...prev, [name]: error }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // validate all fields
    const newErrors = {}
    const newTouched = {}
    Object.keys(initialForm).forEach(key => {
      newTouched[key] = true
      const error = validateField(key, form[key], form)
      if (error) {
        newErrors[key] = error
      }
    })

    setTouched(newTouched)
    setErrors(newErrors)

    const hasErrors = Object.values(newErrors).some(err => !!err)
    if (hasErrors) {
      setShakeActive(true)
      setTimeout(() => setShakeActive(false), 500)
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/leads/public', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      })

      if (response.ok) {
        setSubmitted(true)
        setTimeout(() => {
          setSubmitted(false)
          setForm(initialForm)
          setErrors({})
          setTouched({})
        }, 4000)
      } else {
        const data = await response.json()
        alert(data.message || 'Submission failed. Please try again.')
      }
    } catch (err) {
      console.error(err)
      alert('Network error submitting inquiry. Please try again.')
    } finally {
      setLoading(false)
    }
  }

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
            <h1 className="page-header__title">Contact Us</h1>
            <div className="page-header__breadcrumb">
              <Link to="/">Home</Link>
              <span>/</span>
              <span>Contact Us</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Contact Info Cards */}
      <section className="contact-info-section">
        <div className="container">
          <div className="contact-info-cards">
            {contactCards.map((card, i) => {
              const Icon = card.icon
              return (
                <motion.a
                  key={card.title}
                  href={card.href}
                  className="contact-info-card"
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15, duration: 0.6 }}
                >
                  <div className="contact-info-card__icon" style={{ background: `${card.color}15`, color: card.color, border: `1px solid ${card.color}30` }}>
                    <Icon size={24} />
                  </div>
                  <div className="contact-info-card__text">
                    <h3 className="contact-info-card__title">{card.title}</h3>
                    {card.lines.map((line, j) => (
                      <p key={j} className="contact-info-card__line">{line}</p>
                    ))}
                  </div>
                </motion.a>
              )
            })}
          </div>
        </div>
      </section>

      {/* Map + Form */}
      <section className="contact-main">
        <div className="container">
          <div className="contact-main__grid">
            {/* Map */}
            <motion.div
              className="contact-map"
              id="map"
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="contact-map__header">
                <h2 className="section-title">Find Us Here</h2>
                <p style={{ color: 'var(--gray-text)' }}>Visit our office for a personal consultation</p>
              </div>
              <div className="contact-map__frame">
                <iframe
                  src={siteInfo.mapEmbedUrl}
                  title="Shree Sahjanand Realty Location"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
              <div className="contact-map__address">
                <FiMapPin style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 3 }} />
                <p>{siteInfo.address}</p>
              </div>

              {/* Tagline Announcement (Marquee) */}
              <div className="contact-map__announcement">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentTaglineIdx}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.4 }}
                    className="contact-map__announcement-inner"
                  >
                    {taglineLines[currentTaglineIdx]}
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              className={`contact-form-wrap ${shakeActive ? 'animate-shake' : ''}`}
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="contact-form-wrap__header">
                <span className="section-label">Send Message</span>
                <h2 className="section-title">Get In Touch</h2>
                <p style={{ color: 'var(--gray-text)' }}>Fill in the form below and we'll get back to you within 24 hours.</p>
              </div>

              {submitted ? (
                <motion.div
                  className="contact-success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <div className="contact-success__icon">✅</div>
                  <h3>Thank You!</h3>
                  <p>Your message has been received. Our team will contact you within 24 hours.</p>
                </motion.div>
              ) : (
                <form className="contact-form" onSubmit={handleSubmit} noValidate>
                  <div className="contact-form__grid">
                    {/* First Name */}
                    <div className="form-group">
                      <label htmlFor="contact-firstName">First Name *</label>
                      <div className="input-with-icon">
                        <input
                          id="contact-firstName"
                          name="firstName"
                          value={form.firstName}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className={`form-control ${touched.firstName && errors.firstName ? 'is-invalid' : touched.firstName && !errors.firstName ? 'is-valid' : ''}`}
                          placeholder="Enter first name"
                          required
                        />
                        <FiUser className="input-icon" />
                      </div>
                      <AnimatePresence>
                        {touched.firstName && errors.firstName && (
                          <motion.span
                            className="form-error"
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                          >
                            {errors.firstName}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Last Name */}
                    <div className="form-group">
                      <label htmlFor="contact-lastName">Last Name *</label>
                      <div className="input-with-icon">
                        <input
                          id="contact-lastName"
                          name="lastName"
                          value={form.lastName}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className={`form-control ${touched.lastName && errors.lastName ? 'is-invalid' : touched.lastName && !errors.lastName ? 'is-valid' : ''}`}
                          placeholder="Enter last name"
                          required
                        />
                        <FiUser className="input-icon" />
                      </div>
                      <AnimatePresence>
                        {touched.lastName && errors.lastName && (
                          <motion.span
                            className="form-error"
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                          >
                            {errors.lastName}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Contact Number */}
                    <div className="form-group">
                      <label htmlFor="contact-phone">Contact Number *</label>
                      <div className="input-with-icon">
                        <input
                          id="contact-phone"
                          name="contactNumber"
                          value={form.contactNumber}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className={`form-control ${touched.contactNumber && errors.contactNumber ? 'is-invalid' : touched.contactNumber && !errors.contactNumber ? 'is-valid' : ''}`}
                          placeholder="e.g. +91 99094 21050"
                          type="tel"
                          required
                        />
                        <FiPhone className="input-icon" />
                      </div>
                      <AnimatePresence>
                        {touched.contactNumber && errors.contactNumber && (
                          <motion.span
                            className="form-error"
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                          >
                            {errors.contactNumber}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Alternate Number */}
                    <div className="form-group">
                      <label htmlFor="contact-alt">Alternative Contact Number</label>
                      <div className="input-with-icon">
                        <input
                          id="contact-alt"
                          name="alternateNumber"
                          value={form.alternateNumber}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className={`form-control ${touched.alternateNumber && errors.alternateNumber ? 'is-invalid' : touched.alternateNumber && !errors.alternateNumber ? 'is-valid' : ''}`}
                          placeholder="e.g. +91 99094 21050"
                          type="tel"
                        />
                        <FiPhone className="input-icon" />
                      </div>
                      <AnimatePresence>
                        {touched.alternateNumber && errors.alternateNumber && (
                          <motion.span
                            className="form-error"
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                          >
                            {errors.alternateNumber}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Interested Service */}
                    <div className="form-group">
                      <label htmlFor="contact-service">Interested Service *</label>
                      <div className="input-with-icon">
                        <select
                          id="contact-service"
                          name="interestedService"
                          value={form.interestedService}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className={`form-control ${touched.interestedService && errors.interestedService ? 'is-invalid' : touched.interestedService && !errors.interestedService ? 'is-valid' : ''}`}
                          required
                        >
                          <option value="">Select Interested Service</option>
                          {inquiryFormOptions.services.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <FiBriefcase className="input-icon" />
                      </div>
                      <AnimatePresence>
                        {touched.interestedService && errors.interestedService && (
                          <motion.span
                            className="form-error"
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                          >
                            {errors.interestedService}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Inquiry Type */}
                    <div className="form-group">
                      <label htmlFor="contact-inquiryType">Inquiry Type *</label>
                      <div className="input-with-icon">
                        <select
                          id="contact-inquiryType"
                          name="inquiryType"
                          value={form.inquiryType}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className={`form-control ${touched.inquiryType && errors.inquiryType ? 'is-invalid' : touched.inquiryType && !errors.inquiryType ? 'is-valid' : ''}`}
                          required
                        >
                          <option value="">Select Inquiry Type</option>
                          {inquiryFormOptions.inquiryTypes.map(t => <option key={t} value={t.toLowerCase().replace(/\s/g, '')}>{t}</option>)}
                        </select>
                        <FiTag className="input-icon" />
                      </div>
                      <AnimatePresence>
                        {touched.inquiryType && errors.inquiryType && (
                          <motion.span
                            className="form-error"
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                          >
                            {errors.inquiryType}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Occupation */}
                    <div className="form-group">
                      <label htmlFor="contact-occupation">Occupation</label>
                      <div className="input-with-icon">
                        <input
                          id="contact-occupation"
                          name="occupation"
                          value={form.occupation}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className="form-control"
                          placeholder="e.g. Business Owner, Engineer"
                        />
                        <FiAward className="input-icon" />
                      </div>
                    </div>

                    {/* Budget */}
                    <div className="form-group">
                      <label htmlFor="contact-budget">Budget</label>
                      <div className="input-with-icon">
                        <input
                          id="contact-budget"
                          name="budget"
                          value={form.budget}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className="form-control"
                          placeholder="e.g. ₹50 - 75 Lakhs"
                        />
                        <FiDollarSign className="input-icon" />
                      </div>
                    </div>

                    {/* Reference */}
                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                      <label htmlFor="contact-ref">Reference / How did you hear about us?</label>
                      <div className="input-with-icon">
                        <input
                          id="contact-ref"
                          name="reference"
                          value={form.reference}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className="form-control"
                          placeholder="e.g. Newspaper, Google, Friend"
                        />
                        <FiSearch className="input-icon" />
                      </div>
                    </div>
                  </div>
                  <button type="submit" id="contact-form-submit" className="btn btn-primary btn-lg contact-form__submit" disabled={loading}>
                    {loading ? <span className="contact-loader" /> : <><FiSend /> Send Message</>}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Marquee */}
      <ServicesMarquee />
    </>
  )
}
