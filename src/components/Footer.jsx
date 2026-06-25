import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiPhone, FiMail, FiMapPin, FiFacebook, FiInstagram, FiYoutube, FiLinkedin, FiSend, FiTwitter } from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa'
import logo from '../assets/logo.png'
import { useSite } from '../context/SiteContext'
import './Footer.css'

const quickLinks = [
  { label: 'Home', to: '/' },
  { label: 'About Us', to: '/about' },
  { label: 'Services', to: '/services' },
  { label: 'Contact Us', to: '/contact' },
]

export default function Footer() {
  const [email, setEmail] = useState('')
  const [newsletterStatus, setNewsletterStatus] = useState(null)
  const { siteInfo, services } = useSite()

  const handleNewsletter = (e) => {
    e.preventDefault()
    if (email) {
      setNewsletterStatus('success')
      setEmail('')
      setTimeout(() => setNewsletterStatus(null), 3000)
    }
  }

  const socialIcons = [
    { icon: FiFacebook, href: siteInfo.social?.facebook, label: 'Facebook' },
    { icon: FiInstagram, href: siteInfo.social?.instagram, label: 'Instagram' },
    { icon: FiYoutube, href: siteInfo.social?.youtube, label: 'YouTube' },
  ]

  return (
    <footer className="footer">
      <div className="footer__top">
        <div className="container">
          <div className="footer__grid">
            {/* Brand Column */}
            <div className="footer__brand">
              <Link to="/" className="footer__logo">
                <img src={logo} alt="Shree Sahjanand Realty" />
                <div>
                  <div className="footer__logo-name">{siteInfo.name}</div>
                  <div className="footer__logo-tag">{siteInfo.tagline}</div>
                </div>
              </Link>
              <p className="footer__desc">
                {siteInfo.subtagline || "Gujarat's most trusted real estate consultancy providing residential, commercial, industrial, land, and loan services since 2007."}
              </p>
              <div className="footer__socials">
                {socialIcons.map(({ icon: Icon, href, label }) => (
                  href && (
                    <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="footer__social-btn" aria-label={label}>
                      <Icon />
                    </a>
                  )
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div className="footer__col">
              <h4 className="footer__col-title">Quick Links</h4>
              <ul className="footer__links">
                {quickLinks.map(link => (
                  <li key={link.label}>
                    <Link to={link.to} className="footer__link">
                      <span className="footer__link-arrow">→</span>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Services */}
            <div className="footer__col">
              <h4 className="footer__col-title">Our Services</h4>
              <ul className="footer__links">
                {services.map(s => (
                  <li key={s.id}>
                    <Link to={`/services#${s.id}`} className="footer__link">
                      <span className="footer__link-arrow">→</span>
                      {s.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div className="footer__col">
              <h4 className="footer__col-title">Contact Us</h4>
              <div className="footer__contact-list">
                <a href={`tel:${siteInfo.phone}`} className="footer__contact-item">
                  <div className="footer__contact-icon"><FiPhone /></div>
                  <div>
                    <div className="footer__contact-label">Phone</div>
                    <div className="footer__contact-value">{siteInfo.phone}</div>
                    { siteInfo.phone2 && <div className="footer__contact-value">{siteInfo.phone2}</div> }
                  </div>
                </a>
                <a href={`mailto:${siteInfo.email}`} className="footer__contact-item">
                  <div className="footer__contact-icon"><FiMail /></div>
                  <div>
                    <div className="footer__contact-label">Email</div>
                    <div className="footer__contact-value">{siteInfo.email}</div>
                  </div>
                </a>
                <div className="footer__contact-item">
                  <div className="footer__contact-icon"><FiMapPin /></div>
                  <div>
                    <div className="footer__contact-label">Office Address</div>
                    <div className="footer__contact-value footer__contact-address">{siteInfo.address}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer__bottom">
        <div className="container">
          <div className="footer__bottom-inner">
            <p className="footer__copyright">{siteInfo.copyright}</p>
            <div className="footer__bottom-links">
              <a href="#">Privacy Policy</a>
              <span>|</span>
              <a href="#">Terms of Service</a>
              <span>|</span>
              <a href="#">RERA Compliance</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
