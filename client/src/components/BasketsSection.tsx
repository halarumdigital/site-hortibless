import { useEffect, useState } from "react";

interface Basket {
  id: number;
  name: string;
  description: string;
  priceLoose: number | null;
  priceSubscription: number | null;
  imagePath?: string;
  isActive: boolean;
}

export default function BasketsSection() {
  const [baskets, setBaskets] = useState<Basket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBaskets = async () => {
      try {
        const response = await fetch("/api/baskets");
        if (response.ok) {
          const data = await response.json();
          setBaskets(data.baskets || []);
        }
      } catch (error) {
        console.error("Failed to fetch baskets:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBaskets();
  }, []);

  if (loading) {
    return (
      <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-gray-600">Carregando planos...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-[#eff6ef] py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <p className="text-[#133903] font-semibold mb-2">NOSSOS PLANOS</p>
          <h2 className="text-4xl font-bold text-[#2E593F] mb-4">Planos Tradicionais</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Escolha o plano ideal para você e sua família
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {baskets.map((basket) => (
            <div
              key={basket.id}
              className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden hover:shadow-xl transition-shadow"
            >
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
                <p className="text-gray-600 mb-4">{basket.description}</p>
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Avulso:</span>
                    <span className="text-xl font-bold text-[#2E593F]">
                      R$ {basket.priceLoose ? Number(basket.priceLoose).toFixed(2) : '0.00'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Assinatura:</span>
                    <span className="text-xl font-bold text-[#133903]">
                      R$ {basket.priceSubscription ? Number(basket.priceSubscription).toFixed(2) : '0.00'}
                    </span>
                  </div>
                </div>
                <a
                  href={`/carrinho?basketId=${basket.id}`}
                  className="bg-[#133903] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#0f2b02] transition-colors w-full block text-center"
                >
                  Assinar
                </a>
              </div>
            </div>
          ))}
        </div>

        {baskets.length === 0 && (
          <div className="text-center text-gray-500">
            <p>Nenhum plano disponível no momento.</p>
          </div>
        )}
      </div>
    </section>
  );
}
