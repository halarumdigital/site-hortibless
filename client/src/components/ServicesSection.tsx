export default function ServicesSection() {
  return (
    <section className="bg-[#EFF6EF] pt-40 pb-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <p className="text-[#79B42A] font-semibold mb-2">WHAT WE DO</p>
          <h2 className="text-4xl font-bold text-[#2E593F] mb-4">Our Services</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            We provide comprehensive hydroponic solutions for modern agriculture and sustainable farming practices.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Service 1 */}
          <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow" data-testid="service-hydroponic-systems">
            <div className="w-16 h-16 bg-[#79B42A] rounded-full flex items-center justify-center mb-6">
              <span className="iconify text-white" data-icon="mdi:sprout" data-width="32"></span>
            </div>
            <h3 className="text-2xl font-bold text-[#2E593F] mb-4">Hydroponic Systems</h3>
            <p className="text-gray-600 mb-6">
              Complete hydroponic setup and installation services for residential and commercial applications.
            </p>
            <a href="/services" className="text-[#79B42A] font-semibold hover:underline" data-testid="link-learn-more-systems">
              Learn More →
            </a>
          </div>

          {/* Service 2 */}
          <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow" data-testid="service-training">
            <div className="w-16 h-16 bg-[#79B42A] rounded-full flex items-center justify-center mb-6">
              <span className="iconify text-white" data-icon="mdi:school" data-width="32"></span>
            </div>
            <h3 className="text-2xl font-bold text-[#2E593F] mb-4">Training & Consultation</h3>
            <p className="text-gray-600 mb-6">
              Expert training programs and consultation services to help you succeed in hydroponic farming.
            </p>
            <a href="/services" className="text-[#79B42A] font-semibold hover:underline" data-testid="link-learn-more-training">
              Learn More →
            </a>
          </div>

          {/* Service 3 */}
          <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow" data-testid="service-supplies">
            <div className="w-16 h-16 bg-[#79B42A] rounded-full flex items-center justify-center mb-6">
              <span className="iconify text-white" data-icon="mdi:package-variant" data-width="32"></span>
            </div>
            <h3 className="text-2xl font-bold text-[#2E593F] mb-4">Supplies & Equipment</h3>
            <p className="text-gray-600 mb-6">
              High-quality hydroponic supplies, nutrients, and equipment for optimal plant growth.
            </p>
            <a href="/services" className="text-[#79B42A] font-semibold hover:underline" data-testid="link-learn-more-supplies">
              Learn More →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
