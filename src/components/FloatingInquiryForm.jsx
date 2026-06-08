import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiSend, FiUser, FiPhone, FiBriefcase, FiDollarSign, FiAward, FiTag, FiSearch, FiCheckCircle } from 'react-icons/fi'
import { inquiryFormOptions } from '../data/siteData.js'
import './FloatingInquiryForm.css'

const initialState = {
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

export default function FloatingInquiryForm() {
  const [form, setForm] = useState(initialState)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [shakeActive, setShakeActive] = useState(false)

  const validateField = (name, value, allValues) => {
    let error = ''
    switch (name) {
      case 'firstName':
        if (!value.trim()) {
          error = 'Required'
        } else if (value.trim().length < 2) {
          error = 'Min 2 chars'
        }
        break
      case 'lastName':
        if (!value.trim()) {
          error = 'Required'
        } else if (value.trim().length < 2) {
          error = 'Min 2 chars'
        }
        break
      case 'contactNumber':
        if (!value.trim()) {
          error = 'Required'
        } else {
          const cleaned = value.replace(/[\s()-]/g, '')
          const phoneRegex = /^(?:\+91|91|0)?[6-9]\d{9}$/
          if (!phoneRegex.test(cleaned)) {
            error = 'Invalid number'
          }
        }
        break
      case 'alternateNumber':
        if (value.trim()) {
          const cleaned = value.replace(/[\s()-]/g, '')
          const phoneRegex = /^(?:\+91|91|0)?[6-9]\d{9}$/
          if (!phoneRegex.test(cleaned)) {
            error = 'Invalid number'
          } else if (cleaned === allValues.contactNumber.replace(/[\s()-]/g, '')) {
            error = 'Must be different'
          }
        }
        break
      case 'interestedService':
        if (!value) {
          error = 'Required'
        }
        break
      case 'inquiryType':
        if (!value) {
          error = 'Required'
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
    Object.keys(initialState).forEach(key => {
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
          setForm(initialState)
          setErrors({})
          setTouched({})
        }, 3000)
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
    <motion.div
      className={`float-form ${shakeActive ? 'animate-shake' : ''}`}
      initial={{ opacity: 0, x: 60 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.5, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="float-form__header">
        <div className="float-form__badge">Free Consultation</div>
        <h3 className="float-form__title">Quick Inquiry</h3>
        <p className="float-form__sub">Get expert advice in 24 hours</p>
      </div>

      {submitted ? (
        <motion.div
          className="float-form__success"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="float-form__success-icon">
            <FiCheckCircle style={{ color: 'var(--accent)', fontSize: '3rem' }} />
          </div>
          <h4>Thank You!</h4>
          <p>Our team will reach out shortly.</p>
        </motion.div>
      ) : (
        <form className="float-form__body" onSubmit={handleSubmit} noValidate>
          {/* First Name & Last Name */}
          <div className="float-form__row">
            <div className="float-form__group">
              <div className="input-with-icon">
                <input
                  id="hero-firstName"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="First Name *"
                  className={`form-control float-form__input ${touched.firstName && errors.firstName ? 'is-invalid' : touched.firstName && !errors.firstName ? 'is-valid' : ''}`}
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
            <div className="float-form__group">
              <div className="input-with-icon">
                <input
                  id="hero-lastName"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Last Name *"
                  className={`form-control float-form__input ${touched.lastName && errors.lastName ? 'is-invalid' : touched.lastName && !errors.lastName ? 'is-valid' : ''}`}
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
          </div>

          {/* Contact Number & Alternate Contact */}
          <div className="float-form__row">
            <div className="float-form__group">
              <div className="input-with-icon">
                <input
                  id="hero-contact"
                  name="contactNumber"
                  value={form.contactNumber}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Contact Number *"
                  type="tel"
                  className={`form-control float-form__input ${touched.contactNumber && errors.contactNumber ? 'is-invalid' : touched.contactNumber && !errors.contactNumber ? 'is-valid' : ''}`}
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
            <div className="float-form__group">
              <div className="input-with-icon">
                <input
                  id="hero-altContact"
                  name="alternateNumber"
                  value={form.alternateNumber}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Alternate Number"
                  type="tel"
                  className={`form-control float-form__input ${touched.alternateNumber && errors.alternateNumber ? 'is-invalid' : touched.alternateNumber && !errors.alternateNumber ? 'is-valid' : ''}`}
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
          </div>

          {/* Service */}
          <div className="float-form__group">
            <div className="input-with-icon">
              <select
                id="hero-service"
                name="interestedService"
                value={form.interestedService}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`form-control float-form__input ${touched.interestedService && errors.interestedService ? 'is-invalid' : touched.interestedService && !errors.interestedService ? 'is-valid' : ''}`}
                required
              >
                <option value="">Interested Service *</option>
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
          <div className="float-form__group">
            <div className="input-with-icon">
              <select
                id="hero-inquiryType"
                name="inquiryType"
                value={form.inquiryType}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`form-control float-form__input ${touched.inquiryType && errors.inquiryType ? 'is-invalid' : touched.inquiryType && !errors.inquiryType ? 'is-valid' : ''}`}
                required
              >
                <option value="">Inquiry Type *</option>
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

          {/* Occupation & Budget */}
          <div className="float-form__row">
            <div className="float-form__group">
              <div className="input-with-icon">
                <input
                  id="hero-occupation"
                  name="occupation"
                  value={form.occupation}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Occupation"
                  className="form-control float-form__input"
                />
                <FiAward className="input-icon" />
              </div>
            </div>
            <div className="float-form__group">
              <div className="input-with-icon">
                <input
                  id="hero-budget"
                  name="budget"
                  value={form.budget}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Budget"
                  className="form-control float-form__input"
                />
                <FiDollarSign className="input-icon" />
              </div>
            </div>
          </div>

          {/* Reference */}
          <div className="float-form__group">
            <div className="input-with-icon">
              <input
                id="hero-reference"
                name="reference"
                value={form.reference}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="How did you hear?"
                className="form-control float-form__input"
              />
              <FiSearch className="input-icon" />
            </div>
          </div>

          <button
            type="submit"
            id="hero-form-submit"
            className="float-form__submit"
            disabled={loading}
          >
            {loading ? (
              <span className="float-form__loader" />
            ) : (
              <>
                <FiSend />
                Submit Inquiry
              </>
            )}
          </button>
        </form>
      )}
    </motion.div>
  )
}
