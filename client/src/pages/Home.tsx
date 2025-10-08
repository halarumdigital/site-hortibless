import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import ServicesSection from "@/components/ServicesSection";
import AboutSection from "@/components/AboutSection";
import BasketsSection from "@/components/BasketsSection";
import ProductsButton from "@/components/ProductsButton";
import FaqSection from "@/components/FaqSection";
import WhyHortiblessSection from "@/components/WhyHortiblessSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

export default function Home() {
  return (
    <div className="min-h-screen scroll-smooth overflow-visible">
      <Header />
      <main className="overflow-visible">
        <section id="home" style={{position: 'relative', zIndex: 10, overflow: 'visible'}}>
          <HeroSection />
        </section>
        <section id="services" style={{overflow: 'visible'}}>
          <ServicesSection />
        </section>
        <section id="about">
          <AboutSection />
        </section>
        <section id="baskets">
          <BasketsSection />
        </section>
        <ProductsButton />
        <section id="faq">
          <FaqSection />
        </section>
        <section id="why-hortibless">
          <WhyHortiblessSection />
        </section>
        <section id="contact">
          <ContactSection />
        </section>
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
