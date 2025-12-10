import Header from './components/Header';
import TrustBar from './components/TrustBar';
import HeroSection from './components/HeroSection';
import ProblemsSection from './components/ProblemsSection';
import GoogleAdsCTA from './components/GoogleAdsCTA';
import ServicesSection from './components/ServicesSection';
import CertificationsSection from './components/CertificationsSection';
import ProcessSection from './components/ProcessSection';
import ServiceAttentionSection from './components/ServiceAttentionSection';
import BenefitsSection from './components/BenefitsSection';
import LocationSection from './components/LocationSection';
import ReviewsSection from './components/ReviewsSection';
import FinalCTA from './components/FinalCTA';
import FloatingButtons from './components/FloatingButtons';
import Footer from './components/Footer';

export default function App() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <TrustBar />
      <main>
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
        <FinalCTA />
      </main>
      <Footer />
      <FloatingButtons />
    </div>
  );
}
