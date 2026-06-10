import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiPhone, FiMail, FiMapPin, FiFacebook, FiInstagram, FiYoutube, FiLinkedin, FiSend, FiTwitter } from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa'
import logo from '../assets/logo.png'
import { siteInfo, services } from '../data/siteData.js'
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
  const [settings, setSettings] = useState(siteInfo)

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

  const handleNewsletter = (e) => {
    e.preventDefault()
    if (email) {
      setNewsletterStatus('success')
      setEmail('')
      setTimeout(() => setNewsletterStatus(null), 3000)
    }
  }

  const socialIcons = [
    { icon: FiFacebook, href: settings?.social?.facebook || siteInfo.social.facebook, label: 'Facebook' },
    { icon: FiInstagram, href: settings?.social?.instagram || siteInfo.social.instagram, label: 'Instagram' },
    { icon: FiYoutube, href: settings?.social?.youtube || siteInfo.social.youtube, label: 'YouTube' },
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
                  <div className="footer__logo-name">{settings?.name || siteInfo.name}</div>
                  <div className="footer__logo-tag">{settings?.tagline || siteInfo.tagline}</div>
                </div>
              </Link>
              <p className="footer__desc">
                {settings?.subtagline || "Gujarat's most trusted real estate consultancy providing residential, commercial, industrial, land, loan, and interior design services since 2007."}
              </p>
              <div className="footer__socials">
                {socialIcons.map(({ icon: Icon, href, label }) => (
                  <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="footer__social-btn" aria-label={label}>
                    <Icon />
                  </a>
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
                <a href={`tel:${settings?.phone || siteInfo.phone}`} className="footer__contact-item">
                  <div className="footer__contact-icon"><FiPhone /></div>
                  <div>
                    <div className="footer__contact-label">Phone</div>
                    <div className="footer__contact-value">{settings?.phone || siteInfo.phone}</div>
                    { (settings?.phone2 || siteInfo.phone2) && <div className="footer__contact-value">{settings?.phone2 || siteInfo.phone2}</div> }
                  </div>
                </a>
                <a href={`mailto:${settings?.email || siteInfo.email}`} className="footer__contact-item">
                  <div className="footer__contact-icon"><FiMail /></div>
                  <div>
                    <div className="footer__contact-label">Email</div>
                    <div className="footer__contact-value">{settings?.email || siteInfo.email}</div>
                  </div>
                </a>
                <div className="footer__contact-item">
                  <div className="footer__contact-icon"><FiMapPin /></div>
                  <div>
                    <div className="footer__contact-label">Office Address</div>
                    <div className="footer__contact-value footer__contact-address">{settings?.address || siteInfo.address}</div>
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
