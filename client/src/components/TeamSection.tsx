export default function TeamSection() {
  return (
    <section className="team-bg py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 text-white">
          <p className="text-[#79B42A] font-semibold mb-2">OUR TEAM</p>
          <h2 className="text-4xl font-bold mb-4">Meet Our Expert Team</h2>
          <p className="text-gray-200 max-w-2xl mx-auto">
            Our dedicated team of hydroponic specialists and agricultural experts are here to help you succeed.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Team Member 1 */}
          <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow" data-testid="team-john-anderson">
            <img 
              src="https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400" 
              alt="John Anderson - Chief Agronomist" 
              className="w-full h-64 object-cover"
            />
            <div className="p-6">
              <h3 className="text-xl font-bold text-[#2E593F] mb-1">John Anderson</h3>
              <p className="text-[#79B42A] mb-4">Chief Agronomist</p>
              <p className="text-gray-600 text-sm mb-4">Expert in hydroponic systems with 15+ years of experience.</p>
              <div className="flex space-x-3">
                <a href="#" className="text-gray-600 hover:text-[#79B42A]" data-testid="link-john-linkedin">
                  <span className="iconify" data-icon="mdi:linkedin" data-width="20"></span>
                </a>
                <a href="#" className="text-gray-600 hover:text-[#79B42A]" data-testid="link-john-twitter">
                  <span className="iconify" data-icon="mdi:twitter" data-width="20"></span>
                </a>
                <a href="#" className="text-gray-600 hover:text-[#79B42A]" data-testid="link-john-email">
                  <span className="iconify" data-icon="mdi:email" data-width="20"></span>
                </a>
              </div>
            </div>
          </div>

          {/* Team Member 2 */}
          <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow" data-testid="team-sarah-mitchell">
            <img 
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400" 
              alt="Sarah Mitchell - Nutrition Specialist" 
              className="w-full h-64 object-cover"
            />
            <div className="p-6">
              <h3 className="text-xl font-bold text-[#2E593F] mb-1">Sarah Mitchell</h3>
              <p className="text-[#79B42A] mb-4">Nutrition Specialist</p>
              <p className="text-gray-600 text-sm mb-4">Specialized in plant nutrition and hydroponic solutions.</p>
              <div className="flex space-x-3">
                <a href="#" className="text-gray-600 hover:text-[#79B42A]" data-testid="link-sarah-linkedin">
                  <span className="iconify" data-icon="mdi:linkedin" data-width="20"></span>
                </a>
                <a href="#" className="text-gray-600 hover:text-[#79B42A]" data-testid="link-sarah-twitter">
                  <span className="iconify" data-icon="mdi:twitter" data-width="20"></span>
                </a>
                <a href="#" className="text-gray-600 hover:text-[#79B42A]" data-testid="link-sarah-email">
                  <span className="iconify" data-icon="mdi:email" data-width="20"></span>
                </a>
              </div>
            </div>
          </div>

          {/* Team Member 3 */}
          <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow" data-testid="team-michael-chen">
            <img 
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400" 
              alt="Michael Chen - Systems Engineer" 
              className="w-full h-64 object-cover"
            />
            <div className="p-6">
              <h3 className="text-xl font-bold text-[#2E593F] mb-1">Michael Chen</h3>
              <p className="text-[#79B42A] mb-4">Systems Engineer</p>
              <p className="text-gray-600 text-sm mb-4">Designs and implements advanced hydroponic systems.</p>
              <div className="flex space-x-3">
                <a href="#" className="text-gray-600 hover:text-[#79B42A]" data-testid="link-michael-linkedin">
                  <span className="iconify" data-icon="mdi:linkedin" data-width="20"></span>
                </a>
                <a href="#" className="text-gray-600 hover:text-[#79B42A]" data-testid="link-michael-twitter">
                  <span className="iconify" data-icon="mdi:twitter" data-width="20"></span>
                </a>
                <a href="#" className="text-gray-600 hover:text-[#79B42A]" data-testid="link-michael-email">
                  <span className="iconify" data-icon="mdi:email" data-width="20"></span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
