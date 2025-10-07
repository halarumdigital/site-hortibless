import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function ServicesPage() {
  const services = [
    {
      id: 1,
      icon: "mdi:sprout",
      title: "Hydroponic Systems",
      description: "Complete hydroponic setup and installation services for residential and commercial applications.",
      features: [
        "NFT (Nutrient Film Technique) Systems",
        "Deep Water Culture (DWC) Systems",
        "Drip Irrigation Systems",
        "Aeroponics Systems",
        "Custom System Design",
        "Installation & Setup Support"
      ],
      benefits: [
        "90% less water usage compared to traditional farming",
        "Year-round production capability",
        "Space-efficient vertical farming options",
        "Automated nutrient delivery"
      ]
    },
    {
      id: 2,
      icon: "mdi:school",
      title: "Training & Consultation",
      description: "Expert training programs and consultation services to help you succeed in hydroponic farming.",
      features: [
        "Beginner to Advanced Training Programs",
        "On-site Consultation Services",
        "Business Planning & Setup Guidance",
        "Crop Selection & Planning",
        "Troubleshooting & Support",
        "Online Learning Resources"
      ],
      benefits: [
        "Learn from industry experts",
        "Hands-on practical training",
        "Customized learning paths",
        "Ongoing support and mentorship"
      ]
    },
    {
      id: 3,
      icon: "mdi:package-variant",
      title: "Supplies & Equipment",
      description: "High-quality hydroponic supplies, nutrients, and equipment for optimal plant growth.",
      features: [
        "Premium Nutrient Solutions",
        "Growing Media & Substrates",
        "pH & EC Testing Equipment",
        "LED Grow Lights",
        "Climate Control Systems",
        "Automation & Monitoring Tools"
      ],
      benefits: [
        "Top-quality products from trusted brands",
        "Competitive pricing",
        "Technical support included",
        "Fast and reliable delivery"
      ]
    }
  ];

  return (
    <div className="min-h-screen scroll-smooth">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="hero-bg py-32">
          <div className="container mx-auto px-4 text-center">
            <p className="text-[#79B42A] font-semibold mb-4 text-lg" data-testid="text-services-subtitle">OUR SERVICES</p>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6" data-testid="heading-services-title">
              Professional Hydroponic Solutions
            </h1>
            <p className="text-white text-xl max-w-3xl mx-auto" data-testid="text-services-description">
              Comprehensive services to help you succeed in modern hydroponic farming
            </p>
          </div>
        </section>

        {/* Services Details */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            {services.map((service, index) => (
              <div 
                key={service.id} 
                className={`mb-20 ${index === services.length - 1 ? 'mb-0' : ''}`}
                data-testid={`service-detail-${service.id}`}
              >
                <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
                  <div className={index % 2 === 1 ? 'lg:order-2' : ''}>
                    <div className="w-20 h-20 bg-[#79B42A] rounded-full flex items-center justify-center mb-6">
                      <span className="iconify text-white" data-icon={service.icon} data-width="40"></span>
                    </div>
                    <h2 className="text-4xl font-bold text-[#2E593F] mb-4" data-testid={`heading-service-${service.id}`}>
                      {service.title}
                    </h2>
                    <p className="text-gray-600 text-lg mb-6">{service.description}</p>
                    
                    <h3 className="text-2xl font-bold text-[#2E593F] mb-4">What We Offer</h3>
                    <ul className="space-y-3 mb-6">
                      {service.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start" data-testid={`feature-${service.id}-${idx}`}>
                          <span className="iconify text-[#79B42A] mr-3 mt-1" data-icon="mdi:check-circle" data-width="20"></span>
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className={index % 2 === 1 ? 'lg:order-1' : ''}>
                    <div className="bg-[#EFF6EF] rounded-xl p-8">
                      <h3 className="text-2xl font-bold text-[#2E593F] mb-4">Key Benefits</h3>
                      <ul className="space-y-4">
                        {service.benefits.map((benefit, idx) => (
                          <li key={idx} className="flex items-start" data-testid={`benefit-${service.id}-${idx}`}>
                            <span className="iconify text-[#79B42A] mr-3 mt-1" data-icon="mdi:star" data-width="20"></span>
                            <span className="text-gray-700">{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
                
                {index < services.length - 1 && (
                  <div className="mt-12 border-b border-gray-200"></div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-bg py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold text-white mb-6" data-testid="heading-services-cta">
              Ready to Get Started?
            </h2>
            <p className="text-white text-xl mb-8 max-w-2xl mx-auto">
              Contact us today to discuss your hydroponic farming needs and find the perfect solution.
            </p>
            <a 
              href="/#contact" 
              className="inline-block bg-white text-[#2E593F] px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              data-testid="button-contact-services"
            >
              Contact Us
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
