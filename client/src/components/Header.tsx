import { useState } from "react";
import { useContactInfo } from "@/hooks/useContactInfo";
import { useSiteSettings } from "@/hooks/useSiteSettings";

export default function Header() {
  const { contactInfo } = useContactInfo();
  const { settings } = useSiteSettings();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50">
      {/* Top Bar - Mobile: simplificado com WhatsApp / Desktop: completo */}
      <div className="bg-[#2E593F] text-white">
        {/* Mobile Top Bar */}
        <div className="md:hidden flex items-center justify-center gap-2 py-2 text-sm">
          <span className="iconify" data-icon="mdi:whatsapp" data-width="16"></span>
          <span>{contactInfo?.whatsapp || "11 94518-3919"}</span>
        </div>
        {/* Desktop Top Bar */}
        <div className="hidden md:block">
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
              {contactInfo?.linkedin && (
                <a href={contactInfo.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-gray-300" data-testid="link-linkedin">
                  <span className="iconify" data-icon="mdi:linkedin" data-width="16"></span>
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
      </div>

      {/* Navigation - Mobile e Desktop: fundo branco */}
      <nav className="bg-white shadow-md relative z-10">
        <div className="container mx-auto px-4 py-3 md:py-4 flex justify-between items-center">
          <div className="flex items-center">
            <a href="/#home" className="flex items-center" data-testid="logo-zatplant">
              {settings?.logoPath ? (
                <img
                  key={settings.logoPath}
                  src={settings.logoPath}
                  alt={settings.siteName || "Logo"}
                  className="h-10 md:h-[65px] w-auto object-contain"
                />
              ) : (
                <div className="flex items-center">
                  <span className="text-2xl md:text-3xl font-bold tracking-wider text-[#2E593F]">
                    {settings?.siteName || "HORTIBLESS"}
                  </span>
                </div>
              )}
            </a>
          </div>

          {/* Botão Hambúrguer Mobile */}
          <button
            className="md:hidden text-[#4A4A4A]"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Abrir menu"
          >
            <span className="iconify text-3xl" data-icon="mdi:menu" data-width="30"></span>
          </button>

          {/* Menu Desktop */}
          <div className="hidden md:flex items-center space-x-8 text-gray-700 font-medium">
            <a href="/#home" className="hover:text-[#2E593F]" data-testid="nav-home">Início</a>
            <a href="/planos" className="hover:text-[#2E593F]" data-testid="nav-plans">Planos</a>
            <a href="/dicas" className="hover:text-[#2E593F]" data-testid="nav-dicas">Dicas</a>
            <a href="/sobre" className="hover:text-[#2E593F]" data-testid="nav-about">Sobre</a>
            <a href="/contato" className="hover:text-[#2E593F]" data-testid="nav-contact">Contato</a>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-[#4A4A4A] z-[100] p-4 text-white md:hidden">
          <div className="flex justify-between items-center mb-10">
            <div className="text-2xl font-bold tracking-wider">
              {settings?.siteName || "HORTIBLESS"}
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Fechar menu"
            >
              <span className="iconify text-3xl" data-icon="mdi:close" data-width="30"></span>
            </button>
          </div>
          <nav className="flex flex-col items-center gap-6 text-lg">
            <a href="/#home" className="hover:text-gray-300" onClick={() => setMobileMenuOpen(false)}>Início</a>
            <a href="/planos" className="hover:text-gray-300" onClick={() => setMobileMenuOpen(false)}>Planos</a>
            <a href="/dicas" className="hover:text-gray-300" onClick={() => setMobileMenuOpen(false)}>Dicas</a>
            <a href="/sobre" className="hover:text-gray-300" onClick={() => setMobileMenuOpen(false)}>Sobre</a>
            <a href="/contato" className="hover:text-gray-300" onClick={() => setMobileMenuOpen(false)}>Contato</a>
          </nav>
        </div>
      )}
    </header>
  );
}
