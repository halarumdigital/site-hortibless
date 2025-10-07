import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import ServicesSection from "@/components/ServicesSection";
import AboutSection from "@/components/AboutSection";
import WhyChooseSection from "@/components/WhyChooseSection";
import PortfolioSection from "@/components/PortfolioSection";
import TeamSection from "@/components/TeamSection";
import ArticlesSection from "@/components/ArticlesSection";
import CallToAction from "@/components/CallToAction";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen scroll-smooth">
      <Header />
      <main>
        <section id="home">
          <HeroSection />
        </section>
        <section id="services">
          <ServicesSection />
        </section>
        <section id="about">
          <AboutSection />
          <WhyChooseSection />
        </section>
        <section id="portfolio">
          <PortfolioSection />
        </section>
        <section id="features">
          <TeamSection />
        </section>
        <section id="articles">
          <ArticlesSection />
        </section>
        <CallToAction />
        <section id="contact">
          <ContactSection />
        </section>
      </main>
      <Footer />
    </div>
  );
}
