import { useState } from "react";

export default function PortfolioSection() {
  const [selectedCategory, setSelectedCategory] = useState("All");

  const projects = [
    {
      id: 1,
      title: "Urban Rooftop Farm - NYC",
      category: "Commercial",
      image: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
      description: "500 sq ft hydroponic farm producing 2,000 lbs of fresh greens monthly"
    },
    {
      id: 2,
      title: "Residential NFT System",
      category: "Residential",
      image: "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
      description: "Custom-built NFT system for year-round herb and vegetable production"
    },
    {
      id: 3,
      title: "Vertical Farm Installation",
      category: "Commercial",
      image: "https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
      description: "20-tier vertical farming system with automated climate control"
    },
    {
      id: 4,
      title: "Educational Greenhouse",
      category: "Educational",
      image: "https://images.unsplash.com/photo-1592841200221-a6898f307baa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
      description: "School hydroponic greenhouse for hands-on learning programs"
    },
    {
      id: 5,
      title: "Restaurant Supply System",
      category: "Commercial",
      image: "https://images.unsplash.com/photo-1628862427190-e5c0e99dd0bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
      description: "On-site hydroponic system providing fresh ingredients daily"
    },
    {
      id: 6,
      title: "Home Hydroponic Setup",
      category: "Residential",
      image: "https://images.unsplash.com/photo-1509587584298-0f3b3a3a1797?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
      description: "Compact countertop system for fresh herbs and microgreens"
    },
    {
      id: 7,
      title: "Research Facility",
      category: "Educational",
      image: "https://images.unsplash.com/photo-1574943320219-553eb213f72d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
      description: "Advanced hydroponic research lab for agricultural studies"
    },
    {
      id: 8,
      title: "Community Garden Project",
      category: "Community",
      image: "https://pixabay.com/get/ged747e6c46877695aa9514a21007405b925a1b228fb1d90626f6fd94f4bdb7a7dca3dc4f45af5c22a02bfc882946bd8639c7d60605f881d3be566e5e77c8a3d7_1280.jpg",
      description: "Shared hydroponic garden for urban community food production"
    },
    {
      id: 9,
      title: "Greenhouse Expansion",
      category: "Commercial",
      image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
      description: "Large-scale commercial greenhouse with automated systems"
    }
  ];

  const categories = ["All", "Commercial", "Residential", "Educational", "Community"];

  const filteredProjects = selectedCategory === "All" 
    ? projects 
    : projects.filter(project => project.category === selectedCategory);

  return (
    <section className="bg-[#EFF6EF] py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <p className="text-[#79B42A] font-semibold mb-2" data-testid="text-portfolio-subtitle">OUR PROJECTS</p>
          <h2 className="text-4xl font-bold text-[#2E593F] mb-4" data-testid="heading-portfolio-title">Portfolio & Gallery</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Explore our successful hydroponic installations and projects across various sectors
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-2 rounded-full font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-[#79B42A] text-white' 
                  : 'bg-white text-gray-700 hover:bg-white hover:text-[#2E593F]'
              }`}
              data-testid={`portfolio-filter-${category.toLowerCase()}`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project) => (
            <div 
              key={project.id} 
              className="group relative bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
              data-testid={`portfolio-project-${project.id}`}
            >
              <div className="relative overflow-hidden">
                <img 
                  src={project.image} 
                  alt={project.title} 
                  className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-4 right-4">
                  <span className="bg-[#79B42A] text-white text-xs font-semibold px-3 py-1 rounded-full" data-testid={`portfolio-category-${project.id}`}>
                    {project.category}
                  </span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                  <div className="p-6 text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    <h3 className="text-xl font-bold mb-2" data-testid={`portfolio-title-${project.id}`}>{project.title}</h3>
                    <p className="text-sm text-gray-200">{project.description}</p>
                    <button className="mt-4 inline-flex items-center text-white hover:text-[#79B42A] transition-colors" data-testid={`button-view-project-${project.id}`}>
                      <span>View Project</span>
                      <span className="iconify ml-2" data-icon="mdi:arrow-right" data-width="16"></span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View More Button */}
        {filteredProjects.length > 6 && (
          <div className="text-center mt-12">
            <button 
              className="bg-[#79B42A] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#6a9f24] transition-colors inline-flex items-center"
              data-testid="button-view-more-projects"
            >
              <span>View More Projects</span>
              <span className="iconify ml-2" data-icon="mdi:arrow-down" data-width="20"></span>
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
