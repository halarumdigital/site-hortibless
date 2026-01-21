import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useContactInfo } from "@/hooks/useContactInfo";

export default function ContactSection() {
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
    <section className="bg-[#EFF6EF] py-12 md:py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-8 md:mb-16">
          <p className="text-gray-500 font-medium tracking-widest text-xs md:text-sm mb-2">ENTRE EM CONTATO</p>
          <h2 className="text-2xl md:text-4xl font-bold text-[#1A4731] mb-2 md:mb-4">Fale Conosco</h2>
          <p className="text-gray-500 text-sm md:text-base max-w-2xl mx-auto">
            Tem dúvidas? Estamos aqui para ajudar você a começar com a HortiBless.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 md:gap-8 max-w-5xl mx-auto text-left">
          {/* Contact Form */}
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg lg:w-1/2 w-full">
            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Seu Nome</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E593F] focus:border-[#2E593F]"
                    placeholder="Maria Silva"
                    data-testid="input-name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Endereço de Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E593F] focus:border-[#2E593F]"
                    placeholder="maria@exemplo.com"
                    data-testid="input-email"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
                <input
                  type="text"
                  name="whatsapp"
                  value={formData.whatsapp}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E593F] focus:border-[#2E593F]"
                  placeholder="(11) 98765-4321"
                  data-testid="input-whatsapp"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mensagem</label>
                <textarea
                  rows={4}
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E593F] focus:border-[#2E593F]"
                  placeholder="Conte-nos mais sobre seu interesse..."
                  data-testid="textarea-message"
                ></textarea>
              </div>
              <div>
                <button
                  type="submit"
                  className="w-full bg-[#1A4731] text-white py-3 rounded-full font-semibold hover:bg-[#0f2b02] transition-colors"
                  data-testid="button-send-message"
                >
                  Enviar Mensagem
                </button>
              </div>
            </form>
          </div>

          {/* Contact Information & Map */}
          <div className="lg:w-1/2 w-full space-y-6 md:space-y-8">
            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <h3 className="font-bold text-lg text-[#1A4731] mb-4">Informações de Contato</h3>
              <div className="space-y-4 text-gray-500">
                {contactInfo?.address && (
                  <div className="flex items-start gap-3" data-testid="contact-address">
                    <span className="iconify text-xl text-[#1A4731] mt-1" data-icon="mdi:map-marker-outline"></span>
                    <div>
                      <p className="font-semibold text-gray-700">Endereço</p>
                      <p className="text-sm">{contactInfo.address}</p>
                    </div>
                  </div>
                )}
                {contactInfo?.whatsapp && (
                  <div className="flex items-start gap-3" data-testid="contact-phone">
                    <span className="iconify text-xl text-[#1A4731] mt-1" data-icon="mdi:whatsapp"></span>
                    <div>
                      <p className="font-semibold text-gray-700">WhatsApp</p>
                      <a href={`https://wa.me/${contactInfo.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-sm hover:text-[#1A4731]">
                        {contactInfo.whatsapp}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Google Maps */}
            <div className="rounded-2xl shadow-lg overflow-hidden h-[300px]" data-testid="map-container">
              <iframe
                src="https://www.google.com/maps/d/u/1/embed?mid=1ObNJQ2BkXucUCfLptmVhlse7FBMwNnU&ll=-23.524801825964325,-46.84438455000001&z=12"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Mapa de áreas de entrega HortiBless"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
