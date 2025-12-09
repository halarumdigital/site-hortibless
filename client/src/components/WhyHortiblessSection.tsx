export default function WhyHortiblessSection() {
  const benefits = [
    {
      icon: "mdi:home-outline",
      title: "Conveniência para sua casa ou seu negócio",
      description: "Entrega direta na sua casa ou no seu negócio"
    },
    {
      icon: "mdi:calendar-blank-outline",
      title: "Planos flexíveis",
      description: "Semanais, quinzenais, mensais ou avulsos"
    },
    {
      icon: "mdi:hand-heart-outline",
      title: "Curadoria HortiBless",
      description: "Seleção dos itens"
    },
    {
      icon: "mdi:basket-outline",
      title: "Cestas no tamanho ideal",
      description: "Pequena, média, grande ou personalizada"
    },
    {
      icon: "mdi:apple",
      title: "Mais sabor e frescor",
      description: "Nas refeições do dia a dia"
    },
    {
      icon: "mdi:truck-check-outline",
      title: "Entrega confiável",
      description: "Com pontualidade e cuidado"
    }
  ];

  return (
    <section className="bg-[#EFF6EF] py-12 md:py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 md:mb-16">
          <h2 className="text-2xl md:text-4xl font-bold text-[#1A4731] mb-4">Porque a HortiBless?</h2>
        </div>

        {/* Mobile: grid 2x3 / Desktop: grid 3x2 */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8 max-w-3xl md:max-w-6xl mx-auto">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-4 md:p-8 shadow-lg hover:shadow-xl transition-shadow flex flex-col items-center text-center gap-2"
            >
              <div className="w-10 h-10 md:w-20 md:h-20 bg-[#1A4731] rounded-full flex items-center justify-center">
                <span className="iconify text-white text-xl md:text-4xl" data-icon={benefit.icon}></span>
              </div>
              <h3 className="text-sm md:text-xl font-bold text-[#1A4731]">
                {benefit.title}
              </h3>
              <p className="text-gray-500 text-xs md:text-base">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
