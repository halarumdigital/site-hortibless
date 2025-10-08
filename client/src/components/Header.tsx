import { useContactInfo } from "@/hooks/useContactInfo";
import { useSiteSettings } from "@/hooks/useSiteSettings";

export default function Header() {
  const { contactInfo } = useContactInfo();
  const { settings } = useSiteSettings();

  return (
    <header>
      {/* Top Bar */}
      <div className="bg-[#1A472A] text-white">
        <div className="container mx-auto px-4 py-2 flex justify-between items-center text-sm">
          <div className="flex items-center space-x-6">
            {contactInfo?.email && (
              <a href={`mailto:${contactInfo.email}`} className="flex items-center space-x-2 hover:text-gray-300 transition-colors">
                <span className="iconify" data-icon="mdi:email-outline" data-width="16"></span>
                <span>{contactInfo.email}</span>
              </a>
            )}
            {contactInfo?.whatsapp && (
              <a href={`https://wa.me/${contactInfo.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 hover:text-gray-300 transition-colors">
                <span className="iconify" data-icon="mdi:whatsapp" data-width="16"></span>
                <span>{contactInfo.whatsapp}</span>
              </a>
            )}
          </div>
          <div className="flex items-center space-x-4">
            {contactInfo?.instagram && (
              <a href={contactInfo.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-gray-300" data-testid="link-instagram">
                <span className="iconify" data-icon="mdi:instagram" data-width="16"></span>
              </a>
            )}
            {contactInfo?.facebook && (
              <a href={contactInfo.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-gray-300" data-testid="link-facebook">
                <span className="iconify" data-icon="mdi:facebook" data-width="16"></span>
              </a>
            )}
            {contactInfo?.tiktok && (
              <a href={contactInfo.tiktok} target="_blank" rel="noopener noreferrer" className="hover:text-gray-300" data-testid="link-tiktok">
                <span className="iconify" data-icon="ic:baseline-tiktok" data-width="16"></span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <a href="/#home" className="flex items-center" data-testid="logo-zatplant">
              {settings?.logoPath ? (
                <img
                  key={settings.logoPath}
                  src={settings.logoPath}
                  alt={settings.siteName || "Logo"}
                  className="h-[65px] w-auto object-contain"
                />
              ) : (
                <div className="flex items-center">
                  <span className="iconify text-[#133903] mr-2" data-icon="mdi:leaf" data-width="48"></span>
                  <span className="text-3xl font-bold text-[#2E593F]">{settings?.siteName || "ZATPLANT"}</span>
                </div>
              )}
            </a>
          </div>
          <div className="hidden md:flex items-center space-x-8 text-gray-700 font-medium">
            <a href="/#home" className="hover:text-[#2E593F]" data-testid="nav-home">Início</a>
            <a href="/cestas" className="hover:text-[#2E593F]" data-testid="nav-baskets">Cestas</a>
            <a href="/sobre" className="hover:text-[#2E593F]" data-testid="nav-about">Sobre</a>
            <a href="/contato" className="hover:text-[#2E593F]" data-testid="nav-contact">Contato</a>
          </div>
        </div>
      </nav>
    </header>
  );
}
