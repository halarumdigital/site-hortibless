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
    <section className="bg-white py-12 md:py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-8 md:mb-16">
          <p className="text-gray-500 font-medium tracking-widest text-xs md:text-sm mb-2">TIRE SUAS DÚVIDAS</p>
          <h2 className="text-2xl md:text-4xl font-bold text-[#1A4731] mb-2 md:mb-4">Perguntas Frequentes</h2>
          <p className="text-gray-500 text-sm md:text-base max-w-2xl mx-auto">
            Encontre respostas para as dúvidas mais comuns sobre nossos serviços.
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-4 text-left">
          {categories.map((category) => (
            <div
              key={category}
              className="faq-item"
            >
              {/* Cabeçalho da Categoria */}
              <button
                onClick={() => toggleCategory(category)}
                className="faq-header w-full flex justify-between items-center bg-[#2E593F] text-white p-4 rounded-xl font-semibold"
              >
                <span className="text-sm md:text-base">{category}</span>
                <div className="flex items-center gap-2 md:gap-3">
                  <span className="bg-white/30 text-white text-xs px-2 py-1 rounded-full">
                    {groupedFaqs[category].length} {groupedFaqs[category].length === 1 ? 'pergunta' : 'perguntas'}
                  </span>
                  <span
                    className={`faq-icon text-2xl font-bold transition-transform duration-300 ${
                      openCategory === category ? "rotate-45" : ""
                    }`}
                  >
                    +
                  </span>
                </div>
              </button>

              {/* Lista de FAQs da Categoria */}
              {openCategory === category && (
                <div className="faq-content bg-gray-100 p-4 rounded-b-xl">
                  {groupedFaqs[category].map((faq, index) => (
                    <div
                      key={faq.id}
                      className={`${index > 0 ? 'border-t border-gray-200 pt-3 mt-3' : ''}`}
                    >
                      <button
                        onClick={() => toggleFaq(faq.id)}
                        className="w-full flex justify-between items-center text-left"
                      >
                        <h4 className="text-sm md:text-base font-semibold text-[#1A4731] pr-4">
                          {faq.question}
                        </h4>
                        <span
                          className={`text-[#1A4731] text-xl font-bold transition-transform duration-300 flex-shrink-0 ${
                            openFaqId === faq.id ? "rotate-45" : ""
                          }`}
                        >
                          +
                        </span>
                      </button>
                      {openFaqId === faq.id && (
                        <div className="mt-2">
                          <p className="text-gray-500 text-sm leading-relaxed">{faq.answer}</p>
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
