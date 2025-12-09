import { useContactInfo } from "@/hooks/useContactInfo";
import { useSiteSettings } from "@/hooks/useSiteSettings";

export default function Footer() {
  const { contactInfo } = useContactInfo();
  const { settings } = useSiteSettings();

  return (
    <footer className="bg-[#1A4731] text-white">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row text-center md:text-left gap-10">
          {/* Company Info */}
          <div className="md:w-1/3 flex flex-col items-center md:items-start">
            <div className="mb-4" data-testid="footer-logo">
              {settings?.footerLogoPath ? (
                <img
                  key={settings.footerLogoPath}
                  src={settings.footerLogoPath}
                  alt={settings.siteName || "Logo"}
                  className="h-16 md:h-20 w-auto object-contain"
                />
              ) : settings?.logoPath ? (
                <img
                  key={settings.logoPath}
                  src={settings.logoPath}
                  alt={settings.siteName || "Logo"}
                  className="h-16 md:h-20 w-auto object-contain"
                />
              ) : (
                <h3 className="text-2xl font-bold tracking-wider">
                  {settings?.siteName || "HORTIBLESS"}
                </h3>
              )}
            </div>
            <p className="text-gray-300 text-sm max-w-xs">
              Nossa missão é levar saúde, sabor e praticidade diretamente para a mesa — seja de famílias que valorizam alimentação equilibrada, seja de estabelecimentos que buscam qualidade e frescor em cada preparo.
            </p>
          </div>

          {/* Quick Links */}
          <div className="md:w-1/3 flex flex-col items-center md:items-start">
            <h4 className="font-semibold text-lg mb-4">Acesso Rápido</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><a href="/" className="hover:underline" data-testid="footer-home">Início</a></li>
              <li><a href="/dicas" className="hover:underline" data-testid="footer-dicas">Dicas</a></li>
              <li><a href="/sobre" className="hover:underline" data-testid="footer-about">Sobre</a></li>
              <li><a href="/contato" className="hover:underline" data-testid="footer-contact">Contato</a></li>
            </ul>
          </div>

          {/* Social Media */}
          <div className="md:w-1/3 flex flex-col items-center md:items-start">
            <h4 className="font-semibold text-lg mb-4">Redes Sociais</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              {contactInfo?.facebook && (
                <li>
                  <a href={contactInfo.facebook} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center justify-center md:justify-start gap-2" data-testid="footer-social-facebook">
                    <span className="iconify text-xl" data-icon="mdi:facebook"></span>
                    <span>Facebook</span>
                  </a>
                </li>
              )}
              {contactInfo?.instagram && (
                <li>
                  <a href={contactInfo.instagram} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center justify-center md:justify-start gap-2" data-testid="footer-social-instagram">
                    <span className="iconify text-xl" data-icon="mdi:instagram"></span>
                    <span>Instagram</span>
                  </a>
                </li>
              )}
              {contactInfo?.linkedin && (
                <li>
                  <a href={contactInfo.linkedin} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center justify-center md:justify-start gap-2" data-testid="footer-social-linkedin">
                    <span className="iconify text-xl" data-icon="mdi:linkedin"></span>
                    <span>LinkedIn</span>
                  </a>
                </li>
              )}
              {contactInfo?.tiktok && (
                <li>
                  <a href={contactInfo.tiktok} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center justify-center md:justify-start gap-2" data-testid="footer-social-tiktok">
                    <span className="iconify text-xl" data-icon="ic:baseline-tiktok"></span>
                    <span>TikTok</span>
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/20">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center text-xs text-gray-400 gap-4">
          <p data-testid="copyright">&copy; 2025 HortiBless. Todos os direitos reservados.</p>
          <p>
            Feito pela <a href="https://halarum.dev" target="_blank" rel="noopener noreferrer" className="hover:underline font-semibold">Halorum.dev</a>
          </p>
          <div className="flex gap-4">
            <a href="/termos-de-uso" className="hover:underline" data-testid="footer-terms">Termos de Uso</a>
            <a href="#" className="hover:underline" data-testid="footer-privacy">Política de Privacidade</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
