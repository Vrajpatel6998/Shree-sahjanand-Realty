import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiX, FiSend, FiUser, FiPhone, FiBriefcase, FiDollarSign, FiAward, FiTag, FiSearch } from 'react-icons/fi'
import { inquiryFormOptions } from '../data/siteData.js'
import './InquiryModal.css'

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

export default function InquiryModal({ isOpen, onClose }) {
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
          onClose()
        }, 2500)
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
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            className={`inquiry-modal ${shakeActive ? 'animate-shake' : ''}`}
            initial={{ opacity: 0, scale: 0.85, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 40 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* Header */}
            <div className="inquiry-modal__header">
              <div>
                <div className="section-label" style={{ color: 'var(--accent)' }}>Quick Inquiry</div>
                <h2 className="inquiry-modal__title">Let's Connect</h2>
                <p className="inquiry-modal__subtitle">Fill in your details and our expert will contact you shortly</p>
              </div>
              <button className="inquiry-modal__close" onClick={onClose} aria-label="Close modal">
                <FiX size={20} />
              </button>
            </div>

            {/* Form / Success */}
            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div
                  className="inquiry-modal__success"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="inquiry-modal__success-icon">✅</div>
                  <h3>Inquiry Submitted!</h3>
                  <p>Thank you! Our team will contact you within 24 hours.</p>
                </motion.div>
              ) : (
                <motion.form
                  className="inquiry-modal__form"
                  onSubmit={handleSubmit}
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  noValidate
                >
                  <div className="inquiry-modal__grid">
                    {/* First Name */}
                    <div className="form-group">
                      <label htmlFor="modal-firstName">First Name *</label>
                      <div className="input-with-icon">
                        <input
                          id="modal-firstName"
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
                      <label htmlFor="modal-lastName">Last Name *</label>
                      <div className="input-with-icon">
                        <input
                          id="modal-lastName"
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
                      <label htmlFor="modal-contactNumber">Contact Number *</label>
                      <div className="input-with-icon">
                        <input
                          id="modal-contactNumber"
                          name="contactNumber"
                          value={form.contactNumber}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className={`form-control ${touched.contactNumber && errors.contactNumber ? 'is-invalid' : touched.contactNumber && !errors.contactNumber ? 'is-valid' : ''}`}
                          placeholder="e.g. +91 98765 43210"
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

                    {/* Alternate Contact Number */}
                    <div className="form-group">
                      <label htmlFor="modal-alternateNumber">Alternative Contact Number</label>
                      <div className="input-with-icon">
                        <input
                          id="modal-alternateNumber"
                          name="alternateNumber"
                          value={form.alternateNumber}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className={`form-control ${touched.alternateNumber && errors.alternateNumber ? 'is-invalid' : touched.alternateNumber && !errors.alternateNumber ? 'is-valid' : ''}`}
                          placeholder="e.g. +91 98765 43210"
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
                      <label htmlFor="modal-interestedService">Interested Service *</label>
                      <div className="input-with-icon">
                        <select
                          id="modal-interestedService"
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
                      <label htmlFor="modal-inquiryType">Inquiry Type *</label>
                      <div className="input-with-icon">
                        <select
                          id="modal-inquiryType"
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
                      <label htmlFor="modal-occupation">Occupation</label>
                      <div className="input-with-icon">
                        <input
                          id="modal-occupation"
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
                      <label htmlFor="modal-budget">Budget</label>
                      <div className="input-with-icon">
                        <input
                          id="modal-budget"
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
                      <label htmlFor="modal-reference">Reference / How did you hear about us?</label>
                      <div className="input-with-icon">
                        <input
                          id="modal-reference"
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

                  <button
                    type="submit"
                    id="modal-submit-btn"
                    className="btn btn-primary btn-lg inquiry-modal__submit"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="contact-loader" />
                    ) : (
                      <>
                        <FiSend />
                        Submit Inquiry
                      </>
                    )}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
