import HeroSlider from '../components/HeroSlider'
import StatsSection from '../components/StatsSection'
import AboutSection from '../components/AboutSection'
import ServicesSection from '../components/ServicesSection'
import LoanSection from '../components/LoanSection'
import InteriorSection from '../components/InteriorSection'
import TeamSection from '../components/TeamSection'
import CTASection from '../components/CTASection'

export default function Home({ onInquiryOpen }) {
  return (
    <>
      <HeroSlider onInquiryOpen={onInquiryOpen} />
      <StatsSection />
      <AboutSection />
      <ServicesSection />
      <LoanSection onInquiryOpen={onInquiryOpen} />
      <InteriorSection />
      <TeamSection />
      <CTASection onInquiryOpen={onInquiryOpen} />
    </>
  )
}
