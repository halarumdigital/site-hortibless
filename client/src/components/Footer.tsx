export default function Footer() {
  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter subscription
    alert('Newsletter subscription functionality would be implemented here');
  };

  return (
    <footer className="bg-[#1A472A] text-white pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Company Info */}
          <div>
            <div className="flex items-center mb-4" data-testid="footer-logo">
              <span className="iconify text-[#79B42A] mr-2" data-icon="mdi:leaf" data-width="32"></span>
              <span className="text-2xl font-bold">ZATPLANT</span>
            </div>
            <p className="text-gray-300 mb-4">
              Leading the future of sustainable agriculture with innovative hydroponic solutions.
            </p>
            <div className="flex space-x-3">
              <a href="#" className="w-10 h-10 bg-[#2E593F] rounded-full flex items-center justify-center hover:bg-[#79B42A] transition-colors" data-testid="footer-facebook">
                <span className="iconify" data-icon="mdi:facebook" data-width="20"></span>
              </a>
              <a href="#" className="w-10 h-10 bg-[#2E593F] rounded-full flex items-center justify-center hover:bg-[#79B42A] transition-colors" data-testid="footer-twitter">
                <span className="iconify" data-icon="mdi:twitter" data-width="20"></span>
              </a>
              <a href="#" className="w-10 h-10 bg-[#2E593F] rounded-full flex items-center justify-center hover:bg-[#79B42A] transition-colors" data-testid="footer-instagram">
                <span className="iconify" data-icon="mdi:instagram" data-width="20"></span>
              </a>
              <a href="#" className="w-10 h-10 bg-[#2E593F] rounded-full flex items-center justify-center hover:bg-[#79B42A] transition-colors" data-testid="footer-linkedin">
                <span className="iconify" data-icon="mdi:linkedin" data-width="20"></span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-300 hover:text-[#79B42A] transition-colors" data-testid="footer-about">About Us</a></li>
              <li><a href="#" className="text-gray-300 hover:text-[#79B42A] transition-colors" data-testid="footer-services">Our Services</a></li>
              <li><a href="#" className="text-gray-300 hover:text-[#79B42A] transition-colors" data-testid="footer-projects">Projects</a></li>
              <li><a href="#" className="text-gray-300 hover:text-[#79B42A] transition-colors" data-testid="footer-team">Team</a></li>
              <li><a href="#" className="text-gray-300 hover:text-[#79B42A] transition-colors" data-testid="footer-contact">Contact</a></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-bold mb-4">Our Services</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-300 hover:text-[#79B42A] transition-colors" data-testid="footer-hydroponic-systems">Hydroponic Systems</a></li>
              <li><a href="#" className="text-gray-300 hover:text-[#79B42A] transition-colors" data-testid="footer-consultation">Consultation</a></li>
              <li><a href="#" className="text-gray-300 hover:text-[#79B42A] transition-colors" data-testid="footer-training">Training Programs</a></li>
              <li><a href="#" className="text-gray-300 hover:text-[#79B42A] transition-colors" data-testid="footer-equipment">Equipment Supply</a></li>
              <li><a href="#" className="text-gray-300 hover:text-[#79B42A] transition-colors" data-testid="footer-maintenance">Maintenance</a></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-lg font-bold mb-4">Newsletter</h4>
            <p className="text-gray-300 mb-4">Subscribe to get the latest updates and offers.</p>
            <form className="flex" onSubmit={handleNewsletterSubmit}>
              <input 
                type="email" 
                placeholder="Your email" 
                className="flex-1 px-4 py-2 rounded-l-lg text-gray-800 focus:outline-none"
                data-testid="input-newsletter-email"
              />
              <button 
                type="submit" 
                className="bg-[#79B42A] px-4 py-2 rounded-r-lg hover:bg-[#6a9f24] transition-colors"
                data-testid="button-newsletter-submit"
              >
                <span className="iconify" data-icon="mdi:send" data-width="20"></span>
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[#2E593F] pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center text-gray-300 text-sm">
            <p data-testid="copyright">&copy; 2024 ZATPLANT. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-[#79B42A] transition-colors" data-testid="footer-privacy">Privacy Policy</a>
              <a href="#" className="hover:text-[#79B42A] transition-colors" data-testid="footer-terms">Terms of Service</a>
              <a href="#" className="hover:text-[#79B42A] transition-colors" data-testid="footer-cookies">Cookie Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
