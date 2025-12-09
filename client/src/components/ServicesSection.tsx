export default function ServicesSection() {
  return (
    <section className="bg-[#EFF6EF] pt-16 md:pt-64 pb-16 md:pb-20" style={{position: 'relative', zIndex: 1}}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 md:mb-16">
          <p className="text-gray-500 font-medium tracking-widest text-xs md:text-sm mb-2">COMO FUNCIONA</p>
          <h2 className="text-2xl md:text-4xl font-bold text-[#1A4731] mb-2 md:mb-4">Simples e Prático</h2>
          <p className="text-gray-500 text-sm md:text-base max-w-2xl mx-auto">
            Em poucos passos, garanta praticidade e frescor para a sua casa ou para o seu negócio.
          </p>
        </div>

        {/* Mobile: 2 colunas / Desktop: 4 colunas */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 max-w-6xl mx-auto">
          {/* Passo 1 */}
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-xl transition-shadow flex flex-col items-start text-left gap-4" data-testid="step-1">
            <div className="w-14 h-14 md:w-16 md:h-16 bg-[#1A4731] rounded-full flex items-center justify-center">
              <span className="iconify text-white text-2xl md:text-3xl" data-icon="mdi:shopping-outline"></span>
            </div>
            <h3 className="text-lg md:text-xl font-bold text-[#1A4731]">Passo 1</h3>
            <p className="text-gray-500 text-sm md:text-base">
              Escolha seu plano ou cesta avulsa.
            </p>
          </div>

          {/* Passo 2 */}
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-xl transition-shadow flex flex-col items-start text-left gap-4" data-testid="step-2">
            <div className="w-14 h-14 md:w-16 md:h-16 bg-[#1A4731] rounded-full flex items-center justify-center">
              <span className="iconify text-white text-2xl md:text-3xl" data-icon="mdi:calendar-clock-outline"></span>
            </div>
            <h3 className="text-lg md:text-xl font-bold text-[#1A4731]">Passo 2</h3>
            <p className="text-gray-500 text-sm md:text-base">
              Selecione a frequência de entrega.
            </p>
          </div>

          {/* Passo 3 */}
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-xl transition-shadow flex flex-col items-start text-left gap-4" data-testid="step-3">
            <div className="w-14 h-14 md:w-16 md:h-16 bg-[#1A4731] rounded-full flex items-center justify-center">
              <span className="iconify text-white text-2xl md:text-3xl" data-icon="mdi:package-variant"></span>
            </div>
            <h3 className="text-lg md:text-xl font-bold text-[#1A4731]">Passo 3</h3>
            <p className="text-gray-500 text-sm md:text-base">
              Receba em casa ou no seu negócio frutas, legumes, verduras e temperos frescos da estação.
            </p>
          </div>

          {/* Passo 4 */}
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-xl transition-shadow flex flex-col items-start text-left gap-4" data-testid="step-4">
            <div className="w-14 h-14 md:w-16 md:h-16 bg-[#1A4731] rounded-full flex items-center justify-center">
              <span className="iconify text-white text-2xl md:text-3xl" data-icon="mdi:emoticon-happy-outline"></span>
            </div>
            <h3 className="text-lg md:text-xl font-bold text-[#1A4731]">Passo 4</h3>
            <p className="text-gray-500 text-sm md:text-base">
              Viva mais saúde, praticidade e sabor todos os dias.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
