export default function WhyHortiblessSection() {
  const benefits = [
    {
      icon: "mdi:home-heart",
      title: "Conveniência para sua casa ou seu negócio",
      description: "Entrega direta na sua casa ou no seu negócio"
    },
    {
      icon: "mdi:calendar-sync",
      title: "Planos flexíveis",
      description: "Semanais, quinzenais, mensais ou avulsos"
    },
    {
      icon: "mdi:hand-heart",
      title: "Curadoria HortiBless",
      description: "Seleção dos itens"
    },
    {
      icon: "mdi:basket-outline",
      title: "Cestas no tamanho ideal",
      description: "Pequena, média, grande ou personalizada"
    },
    {
      icon: "mdi:food-apple",
      title: "Mais sabor e frescor",
      description: "Nas refeições do dia a dia"
    },
    {
      icon: "mdi:truck-check",
      title: "Entrega confiável",
      description: "Com pontualidade e cuidado"
    }
  ];

  return (
    <section className="bg-[#eff6ef] py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-[#2E593F] mb-4">Porque a HortiBless?</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow text-center"
            >
              <div className="w-20 h-20 bg-[#133903] rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="iconify text-white" data-icon={benefit.icon} data-width="40"></span>
              </div>
              <h3 className="text-xl font-bold text-[#2E593F] mb-3">
                {benefit.title}
              </h3>
              <p className="text-gray-600">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
