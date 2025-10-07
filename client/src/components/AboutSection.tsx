export default function AboutSection() {
  return (
    <section className="bg-white py-20 wave-bottom">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <img 
              src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
              alt="Hydroponic vertical farm" 
              className="rounded-xl shadow-lg w-full h-auto"
              data-testid="img-about-hydroponic-farm"
            />
          </div>
          <div>
            <p className="text-[#79B42A] font-semibold mb-2">ABOUT US</p>
            <h2 className="text-4xl font-bold text-[#2E593F] mb-6">We Are Leader in Hydroponic Technology</h2>
            <p className="text-gray-600 mb-6">
              ZATPLANT is a pioneering company in the field of hydroponic farming and sustainable agriculture. 
              With over 10 years of experience, we've helped thousands of farmers and businesses transition to 
              efficient, eco-friendly growing methods.
            </p>
            <p className="text-gray-600 mb-6">
              Our mission is to revolutionize agriculture through innovative hydroponic solutions that save water, 
              increase yield, and promote sustainable food production for future generations.
            </p>
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="flex items-start" data-testid="feature-expert-team">
                <span className="iconify text-[#79B42A] mr-3 mt-1" data-icon="mdi:check-circle" data-width="24"></span>
                <div>
                  <h4 className="font-semibold text-[#2E593F]">Expert Team</h4>
                  <p className="text-sm text-gray-600">Certified professionals</p>
                </div>
              </div>
              <div className="flex items-start" data-testid="feature-quality-products">
                <span className="iconify text-[#79B42A] mr-3 mt-1" data-icon="mdi:check-circle" data-width="24"></span>
                <div>
                  <h4 className="font-semibold text-[#2E593F]">Quality Products</h4>
                  <p className="text-sm text-gray-600">Premium equipment</p>
                </div>
              </div>
              <div className="flex items-start" data-testid="feature-support">
                <span className="iconify text-[#79B42A] mr-3 mt-1" data-icon="mdi:check-circle" data-width="24"></span>
                <div>
                  <h4 className="font-semibold text-[#2E593F]">24/7 Support</h4>
                  <p className="text-sm text-gray-600">Always here to help</p>
                </div>
              </div>
              <div className="flex items-start" data-testid="feature-eco-friendly">
                <span className="iconify text-[#79B42A] mr-3 mt-1" data-icon="mdi:check-circle" data-width="24"></span>
                <div>
                  <h4 className="font-semibold text-[#2E593F]">Eco-Friendly</h4>
                  <p className="text-sm text-gray-600">Sustainable solutions</p>
                </div>
              </div>
            </div>
            <button 
              className="bg-[#79B42A] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#6a9f24] transition-colors"
              data-testid="button-discover-more"
            >
              Discover More
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
