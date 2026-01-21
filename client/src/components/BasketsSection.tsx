import { useEffect, useState } from "react";

interface Plan {
  id: number;
  name: string;
  description: string | null;
  imagePath: string | null;
  isActive: boolean;
  order: number;
}

export default function BasketsSection() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await fetch("/api/plans/active");
        if (response.ok) {
          const data = await response.json();
          setPlans(data.plans || []);
        }
      } catch (error) {
        console.error("Failed to fetch plans:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
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
          <h2 className="text-4xl font-bold text-[#2E593F] mb-4">Planos HortiBless</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Escolha o plano ideal para sua casa ou seu negócio
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden hover:shadow-xl transition-shadow"
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
              <div className="p-6">
                <h3 className="text-2xl font-bold text-[#2E593F] mb-3">
                  {plan.name}
                </h3>
                {plan.description && (
                  <p className="text-gray-600">{plan.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {plans.length === 0 && (
          <div className="text-center text-gray-500">
            <p>Nenhum plano disponível no momento.</p>
          </div>
        )}
      </div>
    </section>
  );
}
