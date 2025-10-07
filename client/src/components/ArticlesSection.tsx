export default function ArticlesSection() {
  return (
    <section className="bg-white py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <p className="text-[#79B42A] font-semibold mb-2">LATEST NEWS</p>
          <h2 className="text-4xl font-bold text-[#2E593F] mb-4">Articles & Resources</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Stay updated with the latest trends, tips, and innovations in hydroponic farming.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Article 1 */}
          <article className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow" data-testid="article-hydroponic-lettuce">
            <img 
              src="https://pixabay.com/get/ged747e6c46877695aa9514a21007405b925a1b228fb1d90626f6fd94f4bdb7a7dca3dc4f45af5c22a02bfc882946bd8639c7d60605f881d3be566e5e77c8a3d7_1280.jpg" 
              alt="Hydroponic lettuce growing system" 
              className="w-full h-48 object-cover"
            />
            <div className="p-6">
              <div className="flex items-center text-sm text-gray-500 mb-3">
                <span className="iconify mr-2" data-icon="mdi:calendar" data-width="16"></span>
                <span>January 15, 2024</span>
              </div>
              <h3 className="text-xl font-bold text-[#2E593F] mb-3 hover:text-[#79B42A] cursor-pointer">
                Getting Started with Hydroponic Lettuce
              </h3>
              <p className="text-gray-600 mb-4">
                Learn the basics of growing fresh, crispy lettuce using hydroponic methods for year-round harvest.
              </p>
              <a href="#" className="text-[#79B42A] font-semibold hover:underline" data-testid="link-read-more-lettuce">
                Read More →
              </a>
            </div>
          </article>

          {/* Article 2 */}
          <article className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow" data-testid="article-nutrient-solutions">
            <img 
              src="https://images.unsplash.com/photo-1532094349884-543bc11b234d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250" 
              alt="Nutrient solution testing in laboratory" 
              className="w-full h-48 object-cover"
            />
            <div className="p-6">
              <div className="flex items-center text-sm text-gray-500 mb-3">
                <span className="iconify mr-2" data-icon="mdi:calendar" data-width="16"></span>
                <span>January 12, 2024</span>
              </div>
              <h3 className="text-xl font-bold text-[#2E593F] mb-3 hover:text-[#79B42A] cursor-pointer">
                Understanding Nutrient Solutions
              </h3>
              <p className="text-gray-600 mb-4">
                A comprehensive guide to creating and maintaining the perfect nutrient balance for optimal plant growth.
              </p>
              <a href="#" className="text-[#79B42A] font-semibold hover:underline" data-testid="link-read-more-nutrients">
                Read More →
              </a>
            </div>
          </article>

          {/* Article 3 */}
          <article className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow" data-testid="article-vertical-farming">
            <img 
              src="https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250" 
              alt="Advanced vertical farming system with LED lights" 
              className="w-full h-48 object-cover"
            />
            <div className="p-6">
              <div className="flex items-center text-sm text-gray-500 mb-3">
                <span className="iconify mr-2" data-icon="mdi:calendar" data-width="16"></span>
                <span>January 8, 2024</span>
              </div>
              <h3 className="text-xl font-bold text-[#2E593F] mb-3 hover:text-[#79B42A] cursor-pointer">
                The Future of Vertical Farming
              </h3>
              <p className="text-gray-600 mb-4">
                Explore how vertical farming is revolutionizing urban agriculture and sustainable food production.
              </p>
              <a href="#" className="text-[#79B42A] font-semibold hover:underline" data-testid="link-read-more-vertical">
                Read More →
              </a>
            </div>
          </article>
        </div>

        <div className="text-center mt-12">
          <button 
            className="bg-[#79B42A] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#6a9f24] transition-colors"
            data-testid="button-view-all-articles"
          >
            View All Articles
          </button>
        </div>
      </div>
    </section>
  );
}
