import { useEffect, useState } from "react";

interface Faq {
  id: number;
  question: string;
  answer: string;
  category: string;
  isActive: boolean;
}

export default function FaqSection() {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [loading, setLoading] = useState(true);
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const [openFaqId, setOpenFaqId] = useState<number | null>(null);

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const response = await fetch("/api/faqs");
        if (response.ok) {
          const data = await response.json();
          setFaqs(data.faqs || []);
        }
      } catch (error) {
        console.error("Failed to fetch FAQs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFaqs();
  }, []);

  // Agrupar FAQs por categoria
  const groupedFaqs = faqs.reduce((acc, faq) => {
    const category = faq.category || "GERAL";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(faq);
    return acc;
  }, {} as Record<string, Faq[]>);

  const categories = Object.keys(groupedFaqs).sort();

  const toggleCategory = (category: string) => {
    if (openCategory === category) {
      setOpenCategory(null);
      setOpenFaqId(null);
    } else {
      setOpenCategory(category);
      setOpenFaqId(null);
    }
  };

  const toggleFaq = (faqId: number) => {
    setOpenFaqId(openFaqId === faqId ? null : faqId);
  };

  if (loading) {
    return (
      <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-gray-600">Carregando perguntas...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <p className="text-[#133903] font-semibold mb-2">TIRE SUAS DÚVIDAS</p>
          <h2 className="text-4xl font-bold text-[#2E593F] mb-4">Perguntas Frequentes</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Encontre respostas para as dúvidas mais comuns sobre nossos serviços
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-4">
          {categories.map((category) => (
            <div
              key={category}
              className="bg-white border-2 border-gray-200 rounded-lg overflow-hidden hover:border-[#133903] transition-colors"
            >
              {/* Cabeçalho da Categoria */}
              <button
                onClick={() => toggleCategory(category)}
                className="w-full px-6 py-5 flex justify-between items-center text-left bg-gradient-to-r from-[#133903] to-[#2E593F] hover:from-[#1a4a04] hover:to-[#3a6f4f] transition-colors"
              >
                <h3 className="text-xl font-bold text-white pr-4">
                  {category}
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-white/80 bg-white/20 px-3 py-1 rounded-full">
                    {groupedFaqs[category].length} {groupedFaqs[category].length === 1 ? 'pergunta' : 'perguntas'}
                  </span>
                  <span
                    className={`text-white text-3xl font-bold transition-transform duration-300 ${
                      openCategory === category ? "rotate-45" : ""
                    }`}
                  >
                    +
                  </span>
                </div>
              </button>

              {/* Lista de FAQs da Categoria */}
              {openCategory === category && (
                <div className="bg-gray-50">
                  {groupedFaqs[category].map((faq, index) => (
                    <div
                      key={faq.id}
                      className={`border-t border-gray-200 ${
                        index === groupedFaqs[category].length - 1 ? '' : ''
                      }`}
                    >
                      <button
                        onClick={() => toggleFaq(faq.id)}
                        className="w-full px-6 py-4 flex justify-between items-center text-left hover:bg-white transition-colors"
                      >
                        <h4 className="text-base font-semibold text-[#2E593F] pr-4">
                          {faq.question}
                        </h4>
                        <span
                          className={`text-[#133903] text-2xl font-bold transition-transform duration-300 flex-shrink-0 ${
                            openFaqId === faq.id ? "rotate-45" : ""
                          }`}
                        >
                          +
                        </span>
                      </button>
                      {openFaqId === faq.id && (
                        <div className="px-6 pb-4 bg-white">
                          <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {faqs.length === 0 && (
          <div className="text-center text-gray-500">
            <p>Nenhuma pergunta disponível no momento.</p>
          </div>
        )}
      </div>
    </section>
  );
}
