import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function ArticlesPage() {
  const articles = [
    {
      id: 1,
      title: "Getting Started with Hydroponic Lettuce",
      excerpt: "Learn the basics of growing fresh, crispy lettuce using hydroponic methods for year-round harvest.",
      image: "https://pixabay.com/get/ged747e6c46877695aa9514a21007405b925a1b228fb1d90626f6fd94f4bdb7a7dca3dc4f45af5c22a02bfc882946bd8639c7d60605f881d3be566e5e77c8a3d7_1280.jpg",
      date: "January 15, 2024",
      category: "Getting Started",
      readTime: "5 min read"
    },
    {
      id: 2,
      title: "Understanding Nutrient Solutions",
      excerpt: "A comprehensive guide to creating and maintaining the perfect nutrient balance for optimal plant growth.",
      image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250",
      date: "January 12, 2024",
      category: "Expert Tips",
      readTime: "8 min read"
    },
    {
      id: 3,
      title: "The Future of Vertical Farming",
      excerpt: "Explore how vertical farming is revolutionizing urban agriculture and sustainable food production.",
      image: "https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250",
      date: "January 8, 2024",
      category: "Innovation",
      readTime: "6 min read"
    },
    {
      id: 4,
      title: "Hydroponic Tomatoes: A Complete Guide",
      excerpt: "Master the art of growing delicious, vine-ripened tomatoes in your hydroponic system.",
      image: "https://images.unsplash.com/photo-1592841200221-a6898f307baa?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250",
      date: "January 5, 2024",
      category: "Crop Guides",
      readTime: "10 min read"
    },
    {
      id: 5,
      title: "Preventing Common Hydroponic Problems",
      excerpt: "Identify and solve common issues in hydroponic systems before they affect your crops.",
      image: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250",
      date: "January 3, 2024",
      category: "Troubleshooting",
      readTime: "7 min read"
    },
    {
      id: 6,
      title: "LED Grow Lights: Choosing the Right Spectrum",
      excerpt: "Learn how to select and optimize LED grow lights for maximum photosynthesis and plant health.",
      image: "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250",
      date: "December 28, 2023",
      category: "Equipment",
      readTime: "6 min read"
    },
    {
      id: 7,
      title: "Building Your First NFT System",
      excerpt: "Step-by-step instructions for constructing a nutrient film technique hydroponic system.",
      image: "https://images.unsplash.com/photo-1628862427190-e5c0e99dd0bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250",
      date: "December 25, 2023",
      category: "DIY Projects",
      readTime: "12 min read"
    },
    {
      id: 8,
      title: "Hydroponic Herbs for Beginners",
      excerpt: "Start small with these easy-to-grow herbs perfect for hydroponic newcomers.",
      image: "https://images.unsplash.com/photo-1509587584298-0f3b3a3a1797?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250",
      date: "December 22, 2023",
      category: "Getting Started",
      readTime: "4 min read"
    },
    {
      id: 9,
      title: "Commercial Hydroponics: Scaling Your Operation",
      excerpt: "Expert advice on transitioning from hobby farming to commercial hydroponic production.",
      image: "https://images.unsplash.com/photo-1574943320219-553eb213f72d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250",
      date: "December 18, 2023",
      category: "Business",
      readTime: "15 min read"
    }
  ];

  const categories = ["All", "Getting Started", "Expert Tips", "Innovation", "Crop Guides", "Troubleshooting", "Equipment", "DIY Projects", "Business"];

  return (
    <div className="min-h-screen scroll-smooth">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="hero-bg py-32">
          <div className="container mx-auto px-4 text-center">
            <p className="text-[#79B42A] font-semibold mb-4 text-lg" data-testid="text-articles-subtitle">KNOWLEDGE BASE</p>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6" data-testid="heading-articles-title">
              Articles & Resources
            </h1>
            <p className="text-white text-xl max-w-3xl mx-auto" data-testid="text-articles-description">
              Stay updated with the latest trends, tips, and innovations in hydroponic farming
            </p>
          </div>
        </section>

        {/* Category Filter */}
        <section className="bg-white py-8 border-b">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap justify-center gap-3">
              {categories.map((category, index) => (
                <button
                  key={index}
                  className={`px-6 py-2 rounded-full font-medium transition-colors ${
                    index === 0 
                      ? 'bg-[#79B42A] text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-[#EFF6EF] hover:text-[#2E593F]'
                  }`}
                  data-testid={`category-filter-${category.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Articles Grid */}
        <section className="py-20 bg-[#EFF6EF]">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {articles.map((article) => (
                <article 
                  key={article.id} 
                  className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
                  data-testid={`article-card-${article.id}`}
                >
                  <img 
                    src={article.image} 
                    alt={article.title} 
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold text-[#79B42A] bg-[#EFF6EF] px-3 py-1 rounded-full" data-testid={`article-category-${article.id}`}>
                        {article.category}
                      </span>
                      <span className="text-sm text-gray-500">{article.readTime}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500 mb-3">
                      <span className="iconify mr-2" data-icon="mdi:calendar" data-width="16"></span>
                      <span>{article.date}</span>
                    </div>
                    <h3 className="text-xl font-bold text-[#2E593F] mb-3 hover:text-[#79B42A] cursor-pointer" data-testid={`article-title-${article.id}`}>
                      {article.title}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {article.excerpt}
                    </p>
                    <a 
                      href="#" 
                      className="text-[#79B42A] font-semibold hover:underline inline-flex items-center" 
                      data-testid={`link-read-article-${article.id}`}
                    >
                      Read More
                      <span className="iconify ml-1" data-icon="mdi:arrow-right" data-width="16"></span>
                    </a>
                  </div>
                </article>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center items-center mt-12 space-x-2">
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors" data-testid="button-pagination-prev">
                <span className="iconify" data-icon="mdi:chevron-left" data-width="20"></span>
              </button>
              <button className="px-4 py-2 bg-[#79B42A] text-white rounded-lg" data-testid="button-pagination-1">1</button>
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors" data-testid="button-pagination-2">2</button>
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors" data-testid="button-pagination-3">3</button>
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors" data-testid="button-pagination-next">
                <span className="iconify" data-icon="mdi:chevron-right" data-width="20"></span>
              </button>
            </div>
          </div>
        </section>

        {/* Newsletter CTA */}
        <section className="bg-white py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold text-[#2E593F] mb-6" data-testid="heading-newsletter-cta">
              Never Miss an Update
            </h2>
            <p className="text-gray-600 text-xl mb-8 max-w-2xl mx-auto">
              Subscribe to our newsletter and get the latest articles delivered straight to your inbox.
            </p>
            <div className="max-w-md mx-auto flex gap-4">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#79B42A]"
                data-testid="input-newsletter-articles"
              />
              <button className="bg-[#79B42A] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#6a9f24] transition-colors" data-testid="button-subscribe-articles">
                Subscribe
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
