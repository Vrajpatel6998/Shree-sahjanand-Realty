import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiPhone, FiMail, FiFacebook, FiInstagram, FiTwitter, FiYoutube, FiLinkedin, FiAward } from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa'
import { siteInfo } from '../data/siteData.js'
import './TopBar.css'

export default function TopBar({ settings, scrolled }) {
  const [currentLineIdx, setCurrentLineIdx] = useState(0)
  
  const lines = [
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}><FiAward style={{ color: 'var(--accent)' }} /> Your Trusted Real Estate Partner Since 2007</span>,
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}><FiPhone style={{ color: 'var(--accent)' }} /> Contact us for free legal guidance & property consulting!</span>
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentLineIdx(prev => (prev + 1) % lines.length)
    }, 4500)
    return () => clearInterval(timer)
  }, [])

  const phone = settings?.phone || siteInfo.phone
  const email = settings?.email || siteInfo.email
  
  const socialIcons = [
    { icon: FiFacebook, href: settings?.social?.facebook || siteInfo.social.facebook, label: 'Facebook' },
    { icon: FiInstagram, href: settings?.social?.instagram || siteInfo.social.instagram, label: 'Instagram' },
    { icon: FiTwitter, href: settings?.social?.twitter || siteInfo.social.twitter, label: 'Twitter' },
    { icon: FiYoutube, href: settings?.social?.youtube || siteInfo.social.youtube, label: 'YouTube' },
    { icon: FiLinkedin, href: settings?.social?.linkedin || siteInfo.social.linkedin, label: 'LinkedIn' },
    { icon: FaWhatsapp, href: settings?.social?.whatsapp || siteInfo.social.whatsapp, label: 'WhatsApp' },
  ]

  return (
    <div className={`top-bar ${scrolled ? 'top-bar--scrolled' : ''}`}>
      <div className="container top-bar__inner">
        <div className="top-bar__announcement">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentLineIdx}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="top-bar__announcement-text"
            >
              {lines[currentLineIdx]}
            </motion.div>
          </AnimatePresence>
        </div>
        
        <div className="top-bar__contacts">
          <a href={`tel:${phone}`} className="top-bar__contact-item">
            <FiPhone className="top-bar__icon" />
            <span>{phone}</span>
          </a>
          <span className="top-bar__divider">|</span>
          <a href={`mailto:${email}`} className="top-bar__contact-item">
            <FiMail className="top-bar__icon" />
            <span>{email}</span>
          </a>
        </div>
        
        <div className="top-bar__socials">
          {socialIcons.map(({ icon: Icon, href, label }) => (
            href && (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="top-bar__social-link" aria-label={label}>
                <Icon />
              </a>
            )
          ))}
        </div>
      </div>
    </div>
  )
}
