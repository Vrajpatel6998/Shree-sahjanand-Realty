import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiChevronLeft, FiChevronRight, FiArrowRight } from 'react-icons/fi'
import { heroSlides } from '../data/siteData.js'
import FloatingInquiryForm from './FloatingInquiryForm'
import './HeroSlider.css'

export default function HeroSlider({ onInquiryOpen }) {
  const [current, setCurrent] = useState(0)
  const [direction, setDirection] = useState(1)

  const next = useCallback(() => {
    setDirection(1)
    setCurrent(prev => (prev + 1) % heroSlides.length)
  }, [])

  const prev = useCallback(() => {
    setDirection(-1)
    setCurrent(prev => (prev - 1 + heroSlides.length) % heroSlides.length)
  }, [])

  useEffect(() => {
    const timer = setInterval(next, 5500)
    return () => clearInterval(timer)
  }, [next])

  const slide = heroSlides[current]

  const variants = {
    enter: (d) => ({ x: d > 0 ? '8%' : '-8%', opacity: 0, scale: 1.05 }),
    center: { x: 0, opacity: 1, scale: 1 },
    exit: (d) => ({ x: d < 0 ? '8%' : '-8%', opacity: 0, scale: 0.97 }),
  }

  return (
    <section className="hero" id="home">
      {/* BG Image Slides */}
      <div className="hero__slides">
        <AnimatePresence custom={direction} initial={false}>
          <motion.div
            key={current}
            className="hero__slide"
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            style={{ backgroundImage: `url(${slide.image})` }}
          >
            <div className="hero__overlay" />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Content */}
      <div className="hero__content container">
        <div className="hero__text">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.div
                className="hero__label"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                ✦ Trusted Since 2007 ✦
              </motion.div>
              <h1 className="hero__headline">
                {slide.headline}{' '}
                <span className="hero__highlight">{slide.highlight}</span>
              </h1>
              <p className="hero__subheading">{slide.subheading}</p>
              <div className="hero__actions">
                <Link to="/services" className="btn btn-accent btn-lg">
                  Explore Properties
                  <FiArrowRight />
                </Link>
                <Link to="/contact" className="btn btn-outline btn-lg">
                  Contact Us
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Floating Inquiry Form */}
        <FloatingInquiryForm onInquiryOpen={onInquiryOpen} />
      </div>

      {/* Controls */}
      <div className="hero__controls">
        <button className="hero__arrow hero__arrow--prev" onClick={prev} aria-label="Previous">
          <FiChevronLeft size={22} />
        </button>

        <div className="hero__dots">
          {heroSlides.map((_, i) => (
            <button
              key={i}
              className={`hero__dot ${i === current ? 'hero__dot--active' : ''}`}
              onClick={() => { setDirection(i > current ? 1 : -1); setCurrent(i) }}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>

        <button className="hero__arrow hero__arrow--next" onClick={next} aria-label="Next">
          <FiChevronRight size={22} />
        </button>
      </div>

      {/* Scroll indicator */}
      <div className="hero__scroll-hint">
        <motion.div
          className="hero__scroll-ball"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      </div>
    </section>
  )
}
