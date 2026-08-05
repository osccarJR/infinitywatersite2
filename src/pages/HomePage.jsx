import HeroSection from '../components/HeroSection';
import ProblemsSection from '../components/ProblemsSection';
import GoogleAdsCTA from '../components/GoogleAdsCTA';
import ServicesSection from '../components/ServicesSection';
import CertificationsSection from '../components/CertificationsSection';
import ProcessSection from '../components/ProcessSection';
import ServiceAttentionSection from '../components/ServiceAttentionSection';
import BenefitsSection from '../components/BenefitsSection';
import LocationSection from '../components/LocationSection';
import ReviewsSection from '../components/ReviewsSection';
import ContactSection from '../components/ContactSection';
import FinalCTA from '../components/FinalCTA';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ProblemsSection />
      <GoogleAdsCTA />
      <ServicesSection />
      <CertificationsSection />
      <ProcessSection />
      <ServiceAttentionSection />
      <BenefitsSection />
      <LocationSection />
      <ReviewsSection />
      <ContactSection />
      <FinalCTA />
    </>
  );
}
