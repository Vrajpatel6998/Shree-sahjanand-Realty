import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiMenu, FiX, FiChevronDown, FiPhone } from 'react-icons/fi'
import logo from '../assets/logo.png'
import TopBar from './TopBar'
import './Navbar.css'

const serviceLinks = [
  { label: 'Residential Properties', to: '/services#residential' },
  { label: 'Commercial Properties', to: '/services#commercial' },
  { label: 'Industrial Properties', to: '/services#industrial' },
  { label: 'Land Properties', to: '/services#land' },
  { label: 'Real Estate Loans', to: '/services#loans' },
  { label: 'Interior Solutions', to: '/services#interior' },
]

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'About Us', to: '/about' },
  { label: 'Services', to: '/services', dropdown: serviceLinks },
  { label: 'Contact Us', to: '/contact' },
]

export default function Navbar({ onInquiryOpen }) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false)
  const [settings, setSettings] = useState(null)
  const location = useLocation()
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    fetch('/api/settings')
      .then(res => {
        if (!res.ok) throw new Error('Network response not ok');
        return res.json();
      })
      .then(data => {
        if (data && typeof data === 'object' && data.social) {
          setSettings(data);
        }
      })
      .catch(err => console.warn('Offline settings fallback:', err))
  }, [])

  useEffect(() => {
    setMobileOpen(false)
    setDropdownOpen(false)
    setMobileServicesOpen(false)
  }, [location])

  useEffect(() => {
    if (mobileOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  return (
    <>
      <div className={`header-container ${scrolled ? 'header-container--scrolled' : ''}`}>
        {/* Desktop Logo Area with Curve */}
        <div className="header-logo-container container">
          <Link to="/" className="header-logo-text">
            <span className="header-logo-text-name">Shree Sahjanand</span>
            <span className="header-logo-text-sub">Realty</span>
          </Link>
          <div className="header-logo-curve">
            <Link to="/" className="header-logo-link">
              <div className="header-logo-circle">
                <img src={logo} alt="Shree Sahjanand Realty Logo" />
              </div>
            </Link>
          </div>
        </div>

        <TopBar scrolled={scrolled} />
        
        <motion.nav
          className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}
          initial={{ y: -80 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
        <div className="navbar__inner container">


          {/* Desktop logo spacer */}
          <div className="navbar__logo-spacer" />

          {/* Desktop Nav */}
          <ul className="navbar__links">
            {navLinks.map((link) => (
              <li
                key={link.label}
                className={`navbar__item ${link.dropdown ? 'navbar__item--dropdown' : ''}`}
                onMouseEnter={() => link.dropdown && setDropdownOpen(true)}
                onMouseLeave={() => link.dropdown && setDropdownOpen(false)}
                ref={link.dropdown ? dropdownRef : null}
              >
                {link.dropdown ? (
                  <>
                    <span className={`navbar__link ${location.pathname === link.to ? 'navbar__link--active' : ''}`}>
                      {link.label}
                      <FiChevronDown className={`navbar__chevron ${dropdownOpen ? 'open' : ''}`} />
                    </span>
                    <AnimatePresence>
                      {dropdownOpen && (
                        <motion.ul
                          className="navbar__dropdown"
                          initial={{ opacity: 0, y: 10, scale: 0.97 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.97 }}
                          transition={{ duration: 0.2 }}
                        >
                          {serviceLinks.map((s) => (
                            <li key={s.label}>
                              <Link to={s.to} className="navbar__dropdown-item">{s.label}</Link>
                            </li>
                          ))}
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  </>
                ) : (
                  <Link
                    to={link.to}
                    className={`navbar__link ${location.pathname === link.to ? 'navbar__link--active' : ''}`}
                  >
                    {link.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>

          {/* CTA Buttons */}
          <div className="navbar__actions">
            <button className="btn btn-accent btn-sm navbar__cta" onClick={onInquiryOpen}>
              Inquiry Now
            </button>
          </div>

          {/* Hamburger */}
          <button className="navbar__hamburger" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle Menu">
            {mobileOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
      </motion.nav>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="navbar__mobile-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              className="navbar__mobile"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 200 }}
            >
              <div className="navbar__mobile-header">
                <img src={logo} alt="Logo" className="navbar__mobile-logo" />
                <button onClick={() => setMobileOpen(false)} className="navbar__mobile-close">
                  <FiX size={24} />
                </button>
              </div>

              <ul className="navbar__mobile-links">
                {navLinks.map((link, i) => (
                  <motion.li
                    key={link.label}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07 }}
                  >
                    {link.dropdown ? (
                      <>
                        <button
                          className="navbar__mobile-link navbar__mobile-link--expand"
                          onClick={() => setMobileServicesOpen(!mobileServicesOpen)}
                        >
                          {link.label}
                          <FiChevronDown className={`navbar__chevron ${mobileServicesOpen ? 'open' : ''}`} />
                        </button>
                        <AnimatePresence>
                          {mobileServicesOpen && (
                            <motion.ul
                              className="navbar__mobile-sub"
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                            >
                              {serviceLinks.map((s) => (
                                <li key={s.label}>
                                  <Link to={s.to} className="navbar__mobile-sub-link">{s.label}</Link>
                                </li>
                              ))}
                            </motion.ul>
                          )}
                        </AnimatePresence>
                      </>
                    ) : (
                      <Link to={link.to} className="navbar__mobile-link">{link.label}</Link>
                    )}
                  </motion.li>
                ))}
              </ul>

              <div className="navbar__mobile-cta">
                <button className="btn btn-accent w-full" style={{ justifyContent: 'center' }} onClick={onInquiryOpen}>
                  Inquiry Now
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
