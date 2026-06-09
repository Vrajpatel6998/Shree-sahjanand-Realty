import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import InquiryModal from './components/InquiryModal'
import Home from './pages/Home'
import About from './pages/About'
import Services from './pages/Services'
import Contact from './pages/Contact'
import './pages/About.css'
import './App.css'

// Admin CRM Imports
import { AuthProvider } from './context/AuthContext'
import Login from './pages/admin/Login'
import AdminLayout from './components/admin/AdminLayout'
import Dashboard from './pages/admin/Dashboard'
import Leads from './pages/admin/Leads'
import Staff from './pages/admin/Staff'
import Roles from './pages/admin/Roles'
import AdminServices from './pages/admin/Services'
import Logs from './pages/admin/Logs'
import Settings from './pages/admin/Settings'
import FollowUps from './pages/admin/FollowUps'

function ScrollToTop() {
  const { pathname } = useLocation()
  const prevPath = useState(pathname)[0]
  if (pathname !== prevPath) window.scrollTo(0, 0)
  return null
}

function PageTransitionWrapper({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

function AppContent() {
  const [inquiryOpen, setInquiryOpen] = useState(false)
  const location = useLocation()

  const isAdminRoute = location.pathname.startsWith('/admin')

  if (isAdminRoute) {
    return (
      <Routes>
        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="leads" element={<Leads />} />
          <Route path="followups" element={<FollowUps />} />
          <Route path="staff" style={{ display: 'none' }} element={<Staff />} />
          <Route path="roles" element={<Roles />} />
          <Route path="services" element={<AdminServices />} />
          <Route path="logs" element={<Logs />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    )
  }

  return (
    <>
      <ScrollToTop />
      
      {/* Sticky Navbar */}
      <Navbar onInquiryOpen={() => setInquiryOpen(true)} />

      {/* Page Routes with Transition */}
      <main>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={
              <PageTransitionWrapper>
                <Home onInquiryOpen={() => setInquiryOpen(true)} />
              </PageTransitionWrapper>
            } />
            <Route path="/about" element={
              <PageTransitionWrapper>
                <About onInquiryOpen={() => setInquiryOpen(true)} />
              </PageTransitionWrapper>
            } />
            <Route path="/services" element={
              <PageTransitionWrapper>
                <Services onInquiryOpen={() => setInquiryOpen(true)} />
              </PageTransitionWrapper>
            } />
            <Route path="/contact" element={
              <PageTransitionWrapper>
                <Contact />
              </PageTransitionWrapper>
            } />
          </Routes>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <Footer />

      {/* Inquiry Modal */}
      <InquiryModal isOpen={inquiryOpen} onClose={() => setInquiryOpen(false)} />

      {/* WhatsApp FAB */}
      <a
        href="https://wa.me/919909421050"
        target="_blank"
        rel="noopener noreferrer"
        className="whatsapp-fab"
        aria-label="Chat on WhatsApp"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="whatsapp-fab__icon">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.464 3.488"/>
        </svg>
      </a>
    </>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  )
}

