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
      <div className="flex flex-col gap-3">
        <div className="flex items-start gap-3">
          <FaWhatsapp className="text-3xl text-green-600 dark:text-green-400 flex-shrink-0 mt-1" />
          <div className="flex-1 space-y-2">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              HortiBless atende bairros da região Oeste da Grande São Paulo: Barueri (Centro, Alphaville, Tamboré), Santana de Parnaíba (Alphaville), Cotia (Granja Viana), Carapicuíba e Osasco.
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Assinantes têm frete grátis em um raio de até 20 km da base. Compras avulsas no mesmo raio têm taxa fixa de R$10.
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Atendemos empresas (restaurantes, cafés, padarias) com frete sob consulta, negociado por volume e frequência.
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Fora da área? Fale no WhatsApp e informe o endereço. Avaliamos a viabilidade de incluir sua região nas próximas rotas, conforme demanda e disponibilidade.
            </p>
          </div>
        </div>
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 font-medium text-sm w-full sm:w-auto sm:self-start"
        >
          <FaWhatsapp className="text-lg" />
          Chamar no WhatsApp
        </a>
      </div>
    </div>
  );
}