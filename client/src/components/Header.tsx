export default function Header() {
  return (
    <header>
      {/* Top Bar */}
      <div className="bg-[#1A472A] text-white">
        <div className="container mx-auto px-4 py-2 flex justify-between items-center text-sm">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <span className="iconify" data-icon="mdi:email-outline" data-width="16"></span>
              <span>awesomeconsult@email.com</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="iconify" data-icon="mdi:phone-outline" data-width="16"></span>
              <span>Call Free - (123) - 234 - 1234</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="iconify" data-icon="mdi:clock-outline" data-width="16"></span>
              <span>Mon - Fri : 9:00 - 17:00</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <a href="#" className="hover:text-gray-300" data-testid="link-twitter">
              <span className="iconify" data-icon="mdi:twitter" data-width="16"></span>
            </a>
            <a href="#" className="hover:text-gray-300" data-testid="link-facebook">
              <span className="iconify" data-icon="mdi:facebook" data-width="16"></span>
            </a>
            <a href="#" className="hover:text-gray-300" data-testid="link-instagram">
              <span className="iconify" data-icon="mdi:instagram" data-width="16"></span>
            </a>
            <a href="#" className="hover:text-gray-300" data-testid="link-linkedin">
              <span className="iconify" data-icon="mdi:linkedin" data-width="16"></span>
            </a>
            <a href="#" className="hover:text-gray-300" data-testid="link-youtube">
              <span className="iconify" data-icon="mdi:youtube" data-width="16"></span>
            </a>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <div className="flex items-center" data-testid="logo-zatplant">
              <span className="iconify text-[#79B42A] mr-2" data-icon="mdi:leaf" data-width="48"></span>
              <span className="text-3xl font-bold text-[#2E593F]">ZATPLANT</span>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-8 text-gray-700 font-medium">
            <a href="#home" className="hover:text-[#2E593F]" data-testid="nav-home">HOME</a>
            <a href="#about" className="hover:text-[#2E593F]" data-testid="nav-about">ABOUT US</a>
            <div className="relative group">
              <a href="#services" className="hover:text-[#2E593F] flex items-center" data-testid="nav-services">
                SERVICES
                <span className="iconify ml-1" data-icon="mdi:chevron-down"></span>
              </a>
              <div className="absolute left-0 mt-2 w-56 bg-white shadow-lg rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50" data-testid="dropdown-services">
                <div className="py-2">
                  <a href="#services" className="block px-4 py-2 text-sm text-gray-700 hover:bg-[#EFF6EF] hover:text-[#2E593F]" data-testid="dropdown-item-hydroponic-systems">
                    <span className="iconify mr-2" data-icon="mdi:sprout"></span>
                    Hydroponic Systems
                  </a>
                  <a href="#services" className="block px-4 py-2 text-sm text-gray-700 hover:bg-[#EFF6EF] hover:text-[#2E593F]" data-testid="dropdown-item-training">
                    <span className="iconify mr-2" data-icon="mdi:school"></span>
                    Training & Consultation
                  </a>
                  <a href="#services" className="block px-4 py-2 text-sm text-gray-700 hover:bg-[#EFF6EF] hover:text-[#2E593F]" data-testid="dropdown-item-supplies">
                    <span className="iconify mr-2" data-icon="mdi:package-variant"></span>
                    Supplies & Equipment
                  </a>
                </div>
              </div>
            </div>
            <div className="relative group">
              <a href="#features" className="hover:text-[#2E593F] flex items-center" data-testid="nav-features">
                FEATURES
                <span className="iconify ml-1" data-icon="mdi:chevron-down"></span>
              </a>
              <div className="absolute left-0 mt-2 w-56 bg-white shadow-lg rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50" data-testid="dropdown-features">
                <div className="py-2">
                  <a href="#features" className="block px-4 py-2 text-sm text-gray-700 hover:bg-[#EFF6EF] hover:text-[#2E593F]" data-testid="dropdown-item-water-saving">
                    <span className="iconify mr-2" data-icon="mdi:water"></span>
                    Water-Saving Technology
                  </a>
                  <a href="#features" className="block px-4 py-2 text-sm text-gray-700 hover:bg-[#EFF6EF] hover:text-[#2E593F]" data-testid="dropdown-item-nutrition">
                    <span className="iconify mr-2" data-icon="mdi:nutrition"></span>
                    Efficient Nutrition
                  </a>
                  <a href="#features" className="block px-4 py-2 text-sm text-gray-700 hover:bg-[#EFF6EF] hover:text-[#2E593F]" data-testid="dropdown-item-quality">
                    <span className="iconify mr-2" data-icon="mdi:quality-high"></span>
                    Production Quality
                  </a>
                  <a href="#features" className="block px-4 py-2 text-sm text-gray-700 hover:bg-[#EFF6EF] hover:text-[#2E593F]" data-testid="dropdown-item-pesticide-free">
                    <span className="iconify mr-2" data-icon="mdi:leaf-off"></span>
                    Pesticide-Free Growing
                  </a>
                </div>
              </div>
            </div>
            <div className="relative group">
              <a href="#articles" className="hover:text-[#2E593F] flex items-center" data-testid="nav-articles">
                ARTICLE & NEWS
                <span className="iconify ml-1" data-icon="mdi:chevron-down"></span>
              </a>
              <div className="absolute left-0 mt-2 w-56 bg-white shadow-lg rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50" data-testid="dropdown-articles">
                <div className="py-2">
                  <a href="#articles" className="block px-4 py-2 text-sm text-gray-700 hover:bg-[#EFF6EF] hover:text-[#2E593F]" data-testid="dropdown-item-latest-news">
                    <span className="iconify mr-2" data-icon="mdi:newspaper"></span>
                    Latest News
                  </a>
                  <a href="#articles" className="block px-4 py-2 text-sm text-gray-700 hover:bg-[#EFF6EF] hover:text-[#2E593F]" data-testid="dropdown-item-guides">
                    <span className="iconify mr-2" data-icon="mdi:book-open-page-variant"></span>
                    Growing Guides
                  </a>
                  <a href="#articles" className="block px-4 py-2 text-sm text-gray-700 hover:bg-[#EFF6EF] hover:text-[#2E593F]" data-testid="dropdown-item-success-stories">
                    <span className="iconify mr-2" data-icon="mdi:trophy"></span>
                    Success Stories
                  </a>
                </div>
              </div>
            </div>
            <a href="#contact" className="hover:text-[#2E593F]" data-testid="nav-contact">CONTACT US</a>
          </div>
        </div>
      </nav>
    </header>
  );
}
