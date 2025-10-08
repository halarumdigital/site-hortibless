import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

interface Basket {
  id: number;
  name: string;
  description: string;
  priceLoose: number | null;
  priceSubscription: number | null;
  imagePath?: string;
  isActive: boolean;
  isFeatured: boolean;
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

export default function Cestas() {
  const [baskets, setBaskets] = useState<Basket[]>([]);
  const [comparativeTable, setComparativeTable] = useState<ComparativeTable | null>(null);
  const [seasonalCalendars, setSeasonalCalendars] = useState<SeasonalCalendar[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
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
          console.log("Comparative tables data:", tableData);
          if (tableData.items && tableData.items.length > 0) {
            setComparativeTable(tableData.items[0]);
          }
        }

        // Fetch seasonal calendars
        const calendarResponse = await fetch("/api/seasonal-calendar");
        if (calendarResponse.ok) {
          const calendarData = await calendarResponse.json();
          console.log("Seasonal calendars data:", calendarData);
          if (calendarData.items && calendarData.items.length > 0) {
            setSeasonalCalendars(calendarData.items);
          }
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <WhatsAppButton />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-[#1A472A] to-[#2E593F] text-white py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-5xl font-bold mb-4">Nossos Planos de Cestas</h1>
            <p className="text-xl text-gray-200 max-w-2xl mx-auto">
              Escolha o plano ideal para você e sua família. Produtos frescos e selecionados direto da horta para sua mesa.
            </p>
          </div>
        </section>

        {/* Baskets Section */}
        <section className="bg-[#EFF6EF] py-20">
          <div className="container mx-auto px-4">
            {loading ? (
              <div className="text-center">
                <p className="text-gray-600 text-lg">Carregando planos...</p>
              </div>
            ) : baskets.length === 0 ? (
              <div className="text-center text-gray-500">
                <p className="text-lg">Nenhum plano disponível no momento.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {baskets.map((basket) => (
                  <div
                    key={basket.id}
                    className={`${basket.isFeatured ? 'bg-gradient-to-br from-[#EFF6EF] to-white border-4 border-[#133903]' : 'bg-white border-2 border-gray-200'} rounded-xl overflow-hidden hover:shadow-xl transition-shadow relative`}
                  >
                    {basket.isFeatured && (
                      <div className="absolute top-4 right-4 bg-[#133903] text-white px-3 py-1 rounded-full text-xs font-bold z-10">
                        ⭐ DESTAQUE
                      </div>
                    )}
                    {basket.imagePath && (
                      <div className="h-64 overflow-hidden">
                        <img
                          src={basket.imagePath}
                          alt={basket.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="p-6">
                      <h3 className="text-2xl font-bold text-[#2E593F] mb-3">
                        {basket.name}
                      </h3>
                      <p className="text-gray-600 mb-6">{basket.description}</p>

                      <div className="space-y-3 mb-6">
                        {basket.priceLoose !== null && (
                          <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                            <span className="text-gray-700 font-medium">Compra Avulsa:</span>
                            <span className="text-2xl font-bold text-[#2E593F]">
                              R$ {Number(basket.priceLoose).toFixed(2)}
                            </span>
                          </div>
                        )}
                        {basket.priceSubscription !== null && (
                          <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                            <span className="text-gray-700 font-medium">Assinatura:</span>
                            <span className="text-2xl font-bold text-[#133903]">
                              R$ {Number(basket.priceSubscription).toFixed(2)}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-3">
                        {basket.priceSubscription !== null && (
                          <a
                            href="/contato"
                            className="bg-[#133903] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#0f2b02] transition-colors w-full block text-center"
                          >
                            Assinar Plano
                          </a>
                        )}
                        {basket.priceLoose !== null && (
                          <a
                            href="/contato"
                            className="bg-white text-[#133903] border-2 border-[#133903] px-6 py-3 rounded-lg font-semibold hover:bg-[#133903] hover:text-white transition-colors w-full block text-center"
                          >
                            Comprar Avulso
                          </a>
                        )}
                        {basket.isFeatured && (
                          <div className="text-center pt-2">
                            <span className="inline-block bg-yellow-400 text-gray-900 px-4 py-1 rounded-full text-sm font-bold">
                              Destaque
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

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
                    <h2 className="text-3xl font-bold text-center">Calendário Sazonal</h2>
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
                            <p className="font-semibold text-gray-800">Alta oferta</p>
                            <p className="text-sm text-gray-600">Boa disponibilidade, mas em menor volume</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 bg-yellow-500 rounded"></div>
                          <div>
                            <p className="font-semibold text-gray-800">Média oferta</p>
                            <p className="text-sm text-gray-600">Boa disponibilidade, mas em menor volume</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 bg-red-500 rounded"></div>
                          <div>
                            <p className="font-semibold text-gray-800">Baixa oferta</p>
                            <p className="text-sm text-gray-600">Produtos fora de época, encontrados com menos frequência</p>
                          </div>
                        </div>
                      </div>
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
      </main>

      <Footer />
    </div>
  );
}
