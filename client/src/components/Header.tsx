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
            <a href="#" className="hover:text-[#2E593F]" data-testid="nav-home">HOME</a>
            <a href="#" className="hover:text-[#2E593F]" data-testid="nav-about">ABOUT US</a>
            <div className="relative group">
              <button className="hover:text-[#2E593F] flex items-center" data-testid="nav-services">
                SERVICES
                <span className="iconify ml-1" data-icon="mdi:chevron-down"></span>
              </button>
            </div>
            <div className="relative group">
              <button className="hover:text-[#2E593F] flex items-center" data-testid="nav-features">
                FEATURES
                <span className="iconify ml-1" data-icon="mdi:chevron-down"></span>
              </button>
            </div>
            <div className="relative group">
              <button className="hover:text-[#2E593F] flex items-center" data-testid="nav-articles">
                ARTICLE & NEWS
                <span className="iconify ml-1" data-icon="mdi:chevron-down"></span>
              </button>
            </div>
            <a href="#" className="hover:text-[#2E593F]" data-testid="nav-contact">CONTACT US</a>
          </div>
        </div>
      </nav>
    </header>
  );
}
