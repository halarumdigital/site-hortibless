import { useContactInfo } from "@/hooks/useContactInfo";
import { FaWhatsapp } from "react-icons/fa";

export function WhatsAppFreteButton() {
  const { contactInfo, loading } = useContactInfo();

  if (loading || !contactInfo?.whatsapp) {
    return null;
  }

  // Remove caracteres não numéricos do telefone para o link
  const phoneNumber = contactInfo.whatsapp.replace(/\D/g, '');

  // Adiciona o código do país se não estiver presente
  const formattedPhone = phoneNumber.startsWith('55') ? phoneNumber : `55${phoneNumber}`;

  // Mensagem padrão
  const message = encodeURIComponent('Olá! Gostaria de saber sobre o frete grátis.');

  const whatsappLink = `https://wa.me/${formattedPhone}?text=${message}`;

  return (
    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 my-4">
      <div className="flex items-center gap-3">
        <FaWhatsapp className="text-3xl text-green-600 dark:text-green-400 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
            Para saber sobre o frete grátis nos chame no WhatsApp
          </p>
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 font-medium text-sm"
          >
            <FaWhatsapp className="text-lg" />
            Chamar no WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}