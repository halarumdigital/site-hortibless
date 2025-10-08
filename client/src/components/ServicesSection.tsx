export default function ServicesSection() {
  return (
    <section className="bg-[#EFF6EF] pt-64 pb-20" style={{position: 'relative', zIndex: 1}}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <p className="text-[#133903] font-semibold mb-2">COMO FUNCIONA</p>
          <h2 className="text-4xl font-bold text-[#2E593F] mb-4">Simples e Prático</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Em poucos passos você garante alimentos frescos e saudáveis na sua casa
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Passo 1 */}
          <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow" data-testid="step-1">
            <div className="w-16 h-16 bg-[#133903] rounded-full flex items-center justify-center mb-6">
              <span className="iconify text-white" data-icon="fa6-solid:basket-shopping" data-width="32"></span>
            </div>
            <h3 className="text-xl font-bold text-[#2E593F] mb-4">Passo 1</h3>
            <p className="text-gray-600">
              Escolha seu plano ou cesta avulsa.
            </p>
          </div>

          {/* Passo 2 */}
          <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow" data-testid="step-2">
            <div className="w-16 h-16 bg-[#133903] rounded-full flex items-center justify-center mb-6">
              <span className="iconify text-white" data-icon="mdi:calendar-clock" data-width="32"></span>
            </div>
            <h3 className="text-xl font-bold text-[#2E593F] mb-4">Passo 2</h3>
            <p className="text-gray-600">
              Selecione a frequência de entrega
            </p>
          </div>

          {/* Passo 3 */}
          <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow" data-testid="step-3">
            <div className="w-16 h-16 bg-[#133903] rounded-full flex items-center justify-center mb-6">
              <span className="iconify text-white" data-icon="fa6-solid:box-open" data-width="32"></span>
            </div>
            <h3 className="text-xl font-bold text-[#2E593F] mb-4">Passo 3</h3>
            <p className="text-gray-600">
              Receba em casa frutas, legumes e verduras frescos da estação
            </p>
          </div>

          {/* Passo 4 */}
          <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow" data-testid="step-4">
            <div className="w-16 h-16 bg-[#133903] rounded-full flex items-center justify-center mb-6">
              <span className="iconify text-white" data-icon="fa6-solid:face-smile-wink" data-width="32"></span>
            </div>
            <h3 className="text-xl font-bold text-[#2E593F] mb-4">Passo 4</h3>
            <p className="text-gray-600">
              Viva mais saúde, praticidade e sabor todos os dias
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
