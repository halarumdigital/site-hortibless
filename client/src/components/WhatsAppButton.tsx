import { useContactInfo } from "@/hooks/useContactInfo";

export default function WhatsAppButton() {
  const { contactInfo } = useContactInfo();

  if (!contactInfo?.whatsapp) {
    return null;
  }

  const whatsappNumber = contactInfo.whatsapp.replace(/\D/g, '');
  const whatsappUrl = `https://wa.me/${whatsappNumber}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 bg-[#25D366] text-white rounded-full p-4 shadow-lg hover:bg-[#20BA5A] transition-all duration-300 hover:scale-110 z-50 flex items-center justify-center"
      aria-label="Contact us on WhatsApp"
    >
      <span className="iconify" data-icon="mdi:whatsapp" data-width="32"></span>
    </a>
  );
}
