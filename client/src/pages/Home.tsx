import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import ServicesSection from "@/components/ServicesSection";
import AboutSection from "@/components/AboutSection";
import WhyChooseSection from "@/components/WhyChooseSection";
import TeamSection from "@/components/TeamSection";
import ArticlesSection from "@/components/ArticlesSection";
import CallToAction from "@/components/CallToAction";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection />
        <ServicesSection />
        <AboutSection />
        <WhyChooseSection />
        <TeamSection />
        <ArticlesSection />
        <CallToAction />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}
