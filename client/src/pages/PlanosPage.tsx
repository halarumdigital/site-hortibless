import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

interface Plan {
  id: number;
  name: string;
  description: string | null;
  imagePath: string | null;
  isActive: boolean;
  order: number;
}

interface Basket {
  id: number;
  name: string;
  description: string | null;
  imagePath: string | null;
  priceLoose: string | null;
  priceSubscription: string | null;
  isActive: boolean;
  planId: number | null;
}

interface ComparativeTable {
  id: number;
  imagePath: string;
  isActive: boolean;
}

interface SeasonalCalendar {
  id: number;
  imagePath: string;
  isActive: boolean;
}

interface Testimonial {
  id: number;
  name: string;
  text: string;
  isActive: boolean;
}

export default function PlanosPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [baskets, setBaskets] = useState<Basket[]>([]);
  const [comparativeTable, setComparativeTable] = useState<ComparativeTable | null>(null);
  const [seasonalCalendars, setSeasonalCalendars] = useState<SeasonalCalendar[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch plans
        const plansResponse = await fetch("/api/plans/active");
        if (plansResponse.ok) {
          const plansData = await plansResponse.json();
          setPlans(plansData.plans || []);
        }

        // Fetch baskets
        const basketsResponse = await fetch("/api/baskets");
        if (basketsResponse.ok) {
          const basketsData = await basketsResponse.json();
          setBaskets(basketsData.baskets || []);
        }

        // Fetch comparative tables
        const tableResponse = await fetch("/api/comparative-tables");
        if (tableResponse.ok) {
          const tableData = await tableResponse.json();
          if (tableData.items && tableData.items.length > 0) {
            setComparativeTable(tableData.items[0]);
          }
        }

        // Fetch seasonal calendars
        const calendarResponse = await fetch("/api/seasonal-calendar");
        if (calendarResponse.ok) {
          const calendarData = await calendarResponse.json();
          if (calendarData.items && calendarData.items.length > 0) {
            setSeasonalCalendars(calendarData.items);
          }
        }

        // Fetch testimonials
        const testimonialsResponse = await fetch("/api/testimonials");
        if (testimonialsResponse.ok) {
          const testimonialsData = await testimonialsResponse.json();
          setTestimonials(testimonialsData.testimonials || []);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Get baskets for a specific plan
  const getBasketsForPlan = (planId: number) => {
    return baskets.filter(basket => basket.planId === planId && basket.isActive);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <WhatsAppButton />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-[#1A472A] to-[#2E593F] text-white py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
              Escolha o plano HortiBless
              <br />
              <span className="text-yellow-400">ideal para a sua rotina ou para o seu negócio</span>
            </h1>
            <p className="text-base md:text-lg text-gray-200 max-w-2xl mx-auto leading-relaxed">
              Planos pensados para diferentes estilos de vida e negócios – com hortifruti frescos, entregas programadas e muito mais praticidade no seu dia a dia
            </p>
          </div>
        </section>

        {/* Plans Cards Section */}
        <section className="bg-[#EFF6EF] py-20">
          <div className="container mx-auto px-4">
            {loading ? (
              <div className="text-center">
                <p className="text-gray-600 text-lg">Carregando planos...</p>
              </div>
            ) : plans.length === 0 ? (
              <div className="text-center text-gray-500">
                <p className="text-lg">Nenhum plano disponível no momento.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden hover:shadow-xl transition-shadow flex flex-col"
                  >
                    {plan.imagePath && (
                      <div className="h-64 overflow-hidden">
                        <img
                          src={plan.imagePath}
                          alt={plan.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="p-6 flex flex-col flex-grow">
                      <h3 className="text-2xl font-bold text-[#2E593F] mb-3">
                        {plan.name}
                      </h3>
                      {plan.description && (
                        <p className="text-gray-600 mb-4 flex-grow">{plan.description}</p>
                      )}
                      <a
                        href={`#plano-${plan.id}`}
                        className="inline-flex items-center justify-center gap-2 bg-[#2E593F] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#1e3d2a] transition-colors mt-auto"
                      >
                        Ver Mais
                        <span className="iconify" data-icon="mdi:arrow-down" data-width="20"></span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Plans with Baskets Section */}
        {!loading && plans.length > 0 && (
          <section className="bg-white py-20">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-[#2E593F] mb-4">Cestas por Plano</h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Conheça as cestas disponíveis em cada plano
                </p>
              </div>
              <div className="space-y-16">
                {plans.map((plan) => {
                  const planBaskets = getBasketsForPlan(plan.id);
                  return (
                    <div key={plan.id} id={`plano-${plan.id}`} className="bg-[#EFF6EF] rounded-2xl shadow-lg overflow-hidden scroll-mt-24">
                      {/* Plan Header */}
                      <div className="bg-gradient-to-r from-[#1A472A] to-[#2E593F] text-white p-8">
                        <div className="flex flex-col md:flex-row items-center gap-6">
                          {plan.imagePath && (
                            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white/30 flex-shrink-0">
                              <img
                                src={plan.imagePath}
                                alt={plan.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <div className="text-center md:text-left">
                            <h2 className="text-3xl font-bold mb-2">{plan.name}</h2>
                            {plan.description && (
                              <p className="text-gray-200 text-lg">{plan.description}</p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Plan Baskets */}
                      <div className="p-8">
                        {planBaskets.length === 0 ? (
                          <p className="text-gray-500 text-center py-8">
                            Nenhuma cesta cadastrada para este plano.
                          </p>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {planBaskets.map((basket) => (
                              <div
                                key={basket.id}
                                className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow flex flex-col"
                              >
                                {basket.imagePath && (
                                  <div className="h-48 overflow-hidden">
                                    <img
                                      src={basket.imagePath}
                                      alt={basket.name}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                )}
                                <div className="p-4 flex flex-col flex-grow">
                                  <h4 className="text-lg font-bold text-[#2E593F] mb-2">
                                    {basket.name}
                                  </h4>
                                  {basket.description && (
                                    <p className="text-gray-600 text-sm mb-3">{basket.description}</p>
                                  )}

                                  {/* Preços */}
                                  {!plan.name.toLowerCase().includes('personalizado') && (
                                    <div className="space-y-2 mb-4 flex-grow">
                                      {basket.priceLoose && (
                                        <div className="flex justify-between items-center">
                                          <span className="text-gray-600 text-sm">Avulso:</span>
                                          <span className="text-[#133903] font-bold">R$ {basket.priceLoose}</span>
                                        </div>
                                      )}
                                      {basket.priceSubscription && (
                                        <div className="flex justify-between items-center">
                                          <span className="text-gray-600 text-sm">Assinatura:</span>
                                          <span className="text-[#133903] font-bold">R$ {basket.priceSubscription}</span>
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  {/* Botões */}
                                  <div className="space-y-2 mt-auto">
                                    {basket.priceLoose && !plan.name.toLowerCase().includes('personalizado') && (
                                      <a
                                        href={`/compra-avulsa?basketId=${basket.id}`}
                                        className="block w-full text-center bg-[#2E593F] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#1e3d2a] transition-colors"
                                      >
                                        Comprar Avulso
                                      </a>
                                    )}
                                    <a
                                      href={plan.name.toLowerCase().includes('personalizado')
                                        ? `/pedido-personalizado?basketId=${basket.id}`
                                        : `/carrinho?basketId=${basket.id}`}
                                      className="block w-full text-center bg-yellow-500 text-[#133903] px-4 py-2 rounded-lg font-semibold hover:bg-yellow-400 transition-colors"
                                    >
                                      Assinar
                                    </a>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Comparative Table Section */}
        {comparativeTable && (
          <section className="bg-white py-20">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-xl border-2 border-gray-200 shadow-lg overflow-hidden">
                  <div className="bg-gradient-to-r from-[#1A472A] to-[#2E593F] text-white p-6">
                    <h2 className="text-3xl font-bold text-center">Tabela Comparativa das Cestas</h2>
                  </div>
                  <div className="p-6">
                    <div
                      className="cursor-pointer transition-transform hover:scale-105"
                      onClick={() => {
                        setSelectedImage(comparativeTable.imagePath);
                        setImageModalOpen(true);
                      }}
                    >
                      <img
                        src={comparativeTable.imagePath}
                        alt="Tabela Comparativa das Cestas"
                        className="w-full h-auto rounded-lg shadow-md"
                      />
                    </div>
                    <p className="text-center text-gray-500 text-sm mt-4">
                      Clique na imagem para ampliar
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Seasonal Calendar Section */}
        {seasonalCalendars.length > 0 && (
          <section className="bg-[#EFF6EF] py-20">
            <div className="container mx-auto px-4">
              <div className="max-w-6xl mx-auto">
                <div className="bg-white rounded-xl border-2 border-gray-200 shadow-lg overflow-hidden">
                  <div className="bg-gradient-to-r from-[#1A472A] to-[#2E593F] text-white p-6">
                    <h2 className="text-3xl font-bold text-center">Calendário da Estação</h2>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {seasonalCalendars.map((calendar, index) => (
                        <div key={calendar.id}>
                          <div
                            className="cursor-pointer transition-transform hover:scale-105"
                            onClick={() => {
                              setSelectedImage(calendar.imagePath);
                              setImageModalOpen(true);
                            }}
                          >
                            <img
                              src={calendar.imagePath}
                              alt={`Calendário Sazonal ${index + 1}`}
                              className="w-full h-auto rounded-lg shadow-md"
                            />
                          </div>
                          <p className="text-center text-gray-700 font-medium mt-2">
                            Calendário {index + 1}
                          </p>
                        </div>
                      ))}
                    </div>
                    <p className="text-center text-gray-500 text-sm mt-6">
                      Clique nas imagens para ampliar
                    </p>

                    {/* Legenda */}
                    <div className="mt-8 pt-6 border-t border-gray-200">
                      <h3 className="text-lg font-bold text-[#2E593F] mb-4 text-center">Legenda</h3>
                      <div className="flex flex-col md:flex-row justify-center gap-6">
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 bg-green-500 rounded"></div>
                          <div>
                            <p className="font-semibold text-gray-800">Safra Plena (alta disponibilidade e frescor máximo)</p>
                            <p className="text-sm text-gray-600">Período em que os alimentos estão em plena safra — mais frescos, saborosos e nutritivos.</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 bg-yellow-500 rounded"></div>
                          <div>
                            <p className="font-semibold text-gray-800">Safra Moderada (disponibilidade intermediária)</p>
                            <p className="text-sm text-gray-600">Os produtos ainda estão disponíveis, mas já fora do auge da colheita.</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 bg-red-500 rounded"></div>
                          <div>
                            <p className="font-semibold text-gray-800">Safra Limitada (baixa disponibilidade)</p>
                            <p className="text-sm text-gray-600">Itens em final de safra ou de menor disponibilidade natural.</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Informativo sobre as safras */}
                    <div className="mt-8 pt-6 border-t border-gray-200 bg-[#EFF6EF] rounded-xl p-6">
                      <p className="text-gray-700 mb-4">
                        A HortiBless trabalha exclusivamente com frutas, legumes, verduras e temperos pertencentes às safras <strong className="text-[#2E593F]">Plena</strong> e <strong className="text-[#2E593F]">Moderada</strong>, respeitando o ciclo natural de cada estação.
                      </p>
                      <p className="text-gray-700 mb-4">
                        Dessa forma, garantimos cestas sempre frescas, saborosas e nutritivas, com excelente diversidade e o padrão de qualidade que faz parte da essência HortiBless.
                      </p>
                      <p className="text-gray-700 font-semibold">
                        <strong className="text-red-600">Importante:</strong> itens classificados como Safra Limitada não são utilizados na composição das cestas HortiBless.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Image Modal */}
        {imageModalOpen && selectedImage && (
          <div
            className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
            onClick={() => {
              setImageModalOpen(false);
              setSelectedImage(null);
            }}
          >
            <div className="relative max-w-7xl w-full">
              <button
                onClick={() => {
                  setImageModalOpen(false);
                  setSelectedImage(null);
                }}
                className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75 transition-colors"
              >
                <span className="iconify" data-icon="mdi:close" data-width="24"></span>
              </button>
              <img
                src={selectedImage}
                alt="Imagem Ampliada"
                className="w-full h-auto rounded-lg"
              />
            </div>
          </div>
        )}

        {/* Benefits Section */}
        <section className="bg-[#EFF6EF] py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-[#2E593F] mb-4">Por que Assinar?</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Vantagens exclusivas para nossos assinantes
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="text-center">
                <div className="inline-block bg-[#EFF6EF] rounded-full p-4 mb-4">
                  <span className="iconify text-[#133903]" data-icon="mdi:currency-usd" data-width="48"></span>
                </div>
                <h3 className="text-xl font-bold text-[#2E593F] mb-2">Economia</h3>
                <p className="text-gray-600">
                  Preços especiais para assinantes com desconto garantido em todas as entregas
                </p>
              </div>

              <div className="text-center">
                <div className="inline-block bg-[#EFF6EF] rounded-full p-4 mb-4">
                  <span className="iconify text-[#133903]" data-icon="mdi:calendar-check" data-width="48"></span>
                </div>
                <h3 className="text-xl font-bold text-[#2E593F] mb-2">Praticidade</h3>
                <p className="text-gray-600">
                  Entregas recorrentes sem preocupação. Sua cesta chega sempre no dia combinado
                </p>
              </div>

              <div className="text-center">
                <div className="inline-block bg-[#EFF6EF] rounded-full p-4 mb-4">
                  <span className="iconify text-[#133903]" data-icon="mdi:star" data-width="48"></span>
                </div>
                <h3 className="text-xl font-bold text-[#2E593F] mb-2">Qualidade</h3>
                <p className="text-gray-600">
                  Produtos sempre frescos da estação, selecionados especialmente para você
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        {testimonials.length > 0 && (
          <section className="bg-white py-20">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-[#2E593F] mb-4">O que nossos clientes dizem</h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Depoimentos de quem já faz parte da família HortiBless
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {testimonials.map((testimonial) => (
                  <div
                    key={testimonial.id}
                    className="bg-[#EFF6EF] rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <span className="iconify text-[#2E593F]" data-icon="mdi:format-quote-open" data-width="32"></span>
                      </div>
                      <div>
                        <p className="text-gray-700 mb-4 italic">
                          "{testimonial.text}"
                        </p>
                        <p className="font-bold text-[#2E593F]">
                          — {testimonial.name}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
