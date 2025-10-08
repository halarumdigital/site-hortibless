import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useContactInfo } from "@/hooks/useContactInfo";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

export default function Contato() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    whatsapp: "",
    message: ""
  });
  const { toast } = useToast();
  const { contactInfo } = useContactInfo();

  const contactMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await apiRequest("POST", "/api/contact", data);
      return await res.json() as { success: boolean; message: string; id: string };
    },
    onSuccess: (data) => {
      toast({
        title: "Mensagem Enviada!",
        description: data.message || "Obrigado pela sua mensagem. Entraremos em contato em breve.",
      });
      setFormData({
        name: "",
        email: "",
        whatsapp: "",
        message: ""
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao enviar mensagem. Por favor, tente novamente.",
        variant: "destructive"
      });
    }
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!formData.name || !formData.email || !formData.whatsapp || !formData.message) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive"
      });
      return;
    }

    contactMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <WhatsAppButton />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-[#1A472A] to-[#2E593F] text-white py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-5xl font-bold mb-4">Entre em Contato</h1>
            <p className="text-xl text-gray-200 max-w-2xl mx-auto">
              Estamos aqui para responder suas dúvidas e ajudá-lo a ter uma alimentação mais saudável
            </p>
          </div>
        </section>

        {/* Contact Section */}
        <section className="bg-[#EFF6EF] py-20">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Contact Form */}
              <div className="bg-white rounded-xl p-8 shadow-lg">
                <h2 className="text-3xl font-bold text-[#2E593F] mb-6">Envie sua Mensagem</h2>
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">Seu Nome *</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#133903]"
                        placeholder="Maria Silva"
                        data-testid="input-name"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">Endereço de Email *</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#133903]"
                        placeholder="maria@exemplo.com"
                        data-testid="input-email"
                      />
                    </div>
                  </div>
                  <div className="mb-6">
                    <label className="block text-gray-700 font-semibold mb-2">WhatsApp *</label>
                    <input
                      type="text"
                      name="whatsapp"
                      value={formData.whatsapp}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#133903]"
                      placeholder="(11) 98765-4321"
                      data-testid="input-whatsapp"
                    />
                  </div>
                  <div className="mb-6">
                    <label className="block text-gray-700 font-semibold mb-2">Mensagem *</label>
                    <textarea
                      rows={5}
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#133903]"
                      placeholder="Conte-nos mais sobre seu interesse..."
                      data-testid="textarea-message"
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    disabled={contactMutation.isPending}
                    className="w-full bg-[#133903] text-white py-3 rounded-lg font-semibold hover:bg-[#6a9f24] transition-colors disabled:opacity-50"
                    data-testid="button-send-message"
                  >
                    {contactMutation.isPending ? "Enviando..." : "Enviar Mensagem"}
                  </button>
                </form>
              </div>

              {/* Contact Information & Map */}
              <div>
                <div className="bg-white rounded-xl p-8 shadow-lg mb-6">
                  <h3 className="text-2xl font-bold text-[#2E593F] mb-6">Informações de Contato</h3>
                  <div className="space-y-6">
                    {contactInfo?.address && (
                      <div className="flex items-start" data-testid="contact-address">
                        <span className="iconify text-[#133903] mr-4 mt-1" data-icon="mdi:map-marker" data-width="24"></span>
                        <div>
                          <h4 className="font-semibold text-gray-800">Endereço</h4>
                          <p className="text-gray-600">{contactInfo.address}</p>
                        </div>
                      </div>
                    )}
                    {contactInfo?.whatsapp && (
                      <div className="flex items-start" data-testid="contact-phone">
                        <span className="iconify text-[#133903] mr-4 mt-1" data-icon="mdi:whatsapp" data-width="24"></span>
                        <div>
                          <h4 className="font-semibold text-gray-800">WhatsApp</h4>
                          <a href={`https://wa.me/${contactInfo.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-[#133903]">
                            {contactInfo.whatsapp}
                          </a>
                        </div>
                      </div>
                    )}
                    {contactInfo?.email && (
                      <div className="flex items-start" data-testid="contact-email">
                        <span className="iconify text-[#133903] mr-4 mt-1" data-icon="mdi:email" data-width="24"></span>
                        <div>
                          <h4 className="font-semibold text-gray-800">Email</h4>
                          <a href={`mailto:${contactInfo.email}`} className="text-gray-600 hover:text-[#133903]">
                            {contactInfo.email}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Social Media */}
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <h4 className="font-semibold text-gray-800 mb-4">Siga-nos nas Redes Sociais</h4>
                    <div className="flex space-x-4">
                      {contactInfo?.instagram && (
                        <a href={contactInfo.instagram} target="_blank" rel="noopener noreferrer" className="text-[#133903] hover:text-[#6a9f24] transition-colors">
                          <span className="iconify" data-icon="mdi:instagram" data-width="32"></span>
                        </a>
                      )}
                      {contactInfo?.facebook && (
                        <a href={contactInfo.facebook} target="_blank" rel="noopener noreferrer" className="text-[#133903] hover:text-[#6a9f24] transition-colors">
                          <span className="iconify" data-icon="mdi:facebook" data-width="32"></span>
                        </a>
                      )}
                      {contactInfo?.tiktok && (
                        <a href={contactInfo.tiktok} target="_blank" rel="noopener noreferrer" className="text-[#133903] hover:text-[#6a9f24] transition-colors">
                          <span className="iconify" data-icon="ic:baseline-tiktok" data-width="32"></span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Map Placeholder */}
                <div className="bg-gray-200 rounded-xl overflow-hidden h-64" data-testid="map-placeholder">
                  <div className="w-full h-full flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <span className="iconify mb-2" data-icon="mdi:map" data-width="48"></span>
                      <p>Mapa</p>
                      <p className="text-sm">Integração com Google Maps</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
