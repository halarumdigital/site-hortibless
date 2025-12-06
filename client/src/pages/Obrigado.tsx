import { useEffect, useState } from "react";
import { useLocation, useRoute } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { CheckCircle, MessageCircle, Package, ArrowRight } from "lucide-react";

interface ContactInfo {
  whatsapp?: string;
}

export default function Obrigado() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/obrigado/:orderId");
  const orderId = params?.orderId;
  const [orderType, setOrderType] = useState<string>("");
  const [contactInfo, setContactInfo] = useState<ContactInfo>({});

  useEffect(() => {
    // Pegar tipo do pedido da URL (query params)
    const urlParams = new URLSearchParams(window.location.search);
    setOrderType(urlParams.get("type") || "avulsa");

    // Buscar informações de contato
    const fetchContactInfo = async () => {
      try {
        const response = await fetch("/api/contact-info");
        if (response.ok) {
          const data = await response.json();
          setContactInfo(data.contactInfo || {});
        }
      } catch (error) {
        console.error("Failed to fetch contact info:", error);
      }
    };

    fetchContactInfo();
  }, []);

  const handleWhatsAppClick = () => {
    const whatsappNumber = contactInfo.whatsapp || "5511999999999";
    const message = encodeURIComponent(
      `Olá! Acabei de fazer um pedido (Nº ${orderId}) e gostaria de mais informações.`
    );
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, "_blank");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-gradient-to-b from-green-50 to-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto">
            {/* Success Icon */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-6">
                <CheckCircle className="w-16 h-16 text-green-600" />
              </div>

              <h1 className="text-4xl font-bold text-[#2E593F] mb-4">
                Pedido Recebido!
              </h1>

              <p className="text-xl text-gray-600 mb-2">
                Obrigado pela sua {orderType === "assinatura" ? "assinatura" : "compra"}!
              </p>
            </div>

            {/* Order Info Card */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8 border-2 border-green-200">
              <div className="flex items-start gap-4 mb-6">
                <Package className="w-8 h-8 text-[#133903] flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-[#2E593F] mb-3">
                    Recebemos o seu pedido em nosso sistema
                  </h2>

                  <div className="bg-green-50 border-l-4 border-[#133903] p-4 rounded">
                    <p className="text-gray-700">
                      O seu pedido é o de número
                    </p>
                    <p className="text-3xl font-bold text-[#133903] mt-2">
                      #{orderId}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="font-semibold text-[#2E593F] mb-3">
                  Próximos passos:
                </h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start gap-2">
                    <ArrowRight className="w-5 h-5 text-[#133903] flex-shrink-0 mt-0.5" />
                    <span>Você receberá um e-mail com a confirmação do pedido</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="w-5 h-5 text-[#133903] flex-shrink-0 mt-0.5" />
                    <span>Entraremos em contato para confirmar a entrega</span>
                  </li>
                  {orderType === "assinatura" ? (
                    <li className="flex items-start gap-2">
                      <ArrowRight className="w-5 h-5 text-[#133903] flex-shrink-0 mt-0.5" />
                      <span>Sua primeira cesta será entregue conforme a periodicidade escolhida</span>
                    </li>
                  ) : (
                    <li className="flex items-start gap-2">
                      <ArrowRight className="w-5 h-5 text-[#133903] flex-shrink-0 mt-0.5" />
                      <span>Sua cesta será preparada e entregue em breve</span>
                    </li>
                  )}
                </ul>
              </div>
            </div>

            {/* WhatsApp Section */}
            <div className="bg-[#133903] text-white rounded-lg p-8 mb-8 text-center">
              <MessageCircle className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-3">
                Ficou com alguma dúvida?
              </h3>
              <p className="mb-6 text-green-100">
                Estamos aqui para ajudar! Entre em contato conosco pelo WhatsApp.
              </p>
              <Button
                onClick={handleWhatsAppClick}
                size="lg"
                className="bg-white text-[#133903] hover:bg-green-50 font-semibold text-lg px-8"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Falar no WhatsApp
              </Button>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => setLocation("/")}
                variant="outline"
                size="lg"
                className="border-[#133903] text-[#133903] hover:bg-green-50"
              >
                Voltar para o Início
              </Button>
              <Button
                onClick={() => setLocation("/cestas")}
                size="lg"
                className="bg-[#133903] hover:bg-[#1a4a04]"
              >
                Ver Outras Cestas
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
