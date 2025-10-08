import { useContactInfo } from "@/hooks/useContactInfo";
import { useSiteSettings } from "@/hooks/useSiteSettings";

export default function Footer() {
  const { contactInfo } = useContactInfo();
  const { settings } = useSiteSettings();

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
              {settings?.footerLogoPath ? (
                <img
                  key={settings.footerLogoPath}
                  src={settings.footerLogoPath}
                  alt={settings.siteName || "Logo"}
                  className="h-20 w-auto object-contain"
                />
              ) : settings?.logoPath ? (
                <img
                  key={settings.logoPath}
                  src={settings.logoPath}
                  alt={settings.siteName || "Logo"}
                  className="h-20 w-auto object-contain"
                />
              ) : (
                <div className="flex items-center">
                  <span className="iconify text-[#133903] mr-2" data-icon="mdi:leaf" data-width="32"></span>
                  <span className="text-2xl font-bold">{settings?.siteName || "ZATPLANT"}</span>
                </div>
              )}
            </div>
            <p className="text-gray-300 mb-4">
              A HortiBless nasceu com a missão de levar saúde à mesa da família, diretamente da horta, unindo praticidade, sabor e sofisticação.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-300 hover:text-[#133903] transition-colors" data-testid="footer-about">About Us</a></li>
              <li><a href="#" className="text-gray-300 hover:text-[#133903] transition-colors" data-testid="footer-services">Our Services</a></li>
              <li><a href="#" className="text-gray-300 hover:text-[#133903] transition-colors" data-testid="footer-projects">Projects</a></li>
              <li><a href="#" className="text-gray-300 hover:text-[#133903] transition-colors" data-testid="footer-team">Team</a></li>
              <li><a href="#" className="text-gray-300 hover:text-[#133903] transition-colors" data-testid="footer-contact">Contact</a></li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h4 className="text-lg font-bold mb-4">Redes Sociais</h4>
            <div className="flex flex-col space-y-3">
              {contactInfo?.facebook && (
                <a href={contactInfo.facebook} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-3 text-gray-300 hover:text-[#133903] transition-colors" data-testid="footer-social-facebook">
                  <span className="iconify" data-icon="mdi:facebook" data-width="24"></span>
                  <span>Facebook</span>
                </a>
              )}
              {contactInfo?.instagram && (
                <a href={contactInfo.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-3 text-gray-300 hover:text-[#133903] transition-colors" data-testid="footer-social-instagram">
                  <span className="iconify" data-icon="mdi:instagram" data-width="24"></span>
                  <span>Instagram</span>
                </a>
              )}
              {contactInfo?.tiktok && (
                <a href={contactInfo.tiktok} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-3 text-gray-300 hover:text-[#133903] transition-colors" data-testid="footer-social-tiktok">
                  <span className="iconify" data-icon="ic:baseline-tiktok" data-width="24"></span>
                  <span>TikTok</span>
                </a>
              )}
            </div>
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
                className="bg-[#133903] px-4 py-2 rounded-r-lg hover:bg-[#6a9f24] transition-colors"
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
            <p data-testid="copyright">&copy; 2025 HortiBless. Todos os direitos reservados.</p>
            <p className="mt-4 md:mt-0">
              Feito pela <a href="https://halarum.dev" target="_blank" rel="noopener noreferrer" className="hover:text-[#133903] transition-colors font-semibold">Halarum.dev</a>
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-[#133903] transition-colors" data-testid="footer-privacy">Política de Privacidade</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
