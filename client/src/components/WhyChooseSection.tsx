export default function WhyChooseSection() {
  return (
    <section className="bg-[#EFF6EF] py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <p className="text-[#133903] font-semibold mb-2">POR QUE ESCOLHER A HORTIBLESS</p>
          <h2 className="text-4xl font-bold text-[#2E593F] mb-4">Nossos Diferenciais</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="text-center" data-testid="benefit-variety">
            <div className="w-20 h-20 bg-[#133903] rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="iconify text-white" data-icon="mdi:fruit-grapes" data-width="40"></span>
            </div>
            <h3 className="text-xl font-bold text-[#2E593F] mb-2">Variedade da Estação</h3>
            <p className="text-gray-600">Selecionamos frutas, verduras e legumes da época para garantir o melhor sabor e preço justo.</p>
          </div>

          <div className="text-center" data-testid="benefit-delivery">
            <div className="w-20 h-20 bg-[#133903] rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="iconify text-white" data-icon="mdi:truck-delivery" data-width="40"></span>
            </div>
            <h3 className="text-xl font-bold text-[#2E593F] mb-2">Entrega Rápida e Segura</h3>
            <p className="text-gray-600">Sua cesta chega fresca e bem embalada diretamente na sua porta, com todo o cuidado que você merece.</p>
          </div>

          <div className="text-center" data-testid="benefit-sustainable">
            <div className="w-20 h-20 bg-[#133903] rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="iconify text-white" data-icon="mdi:leaf" data-width="40"></span>
            </div>
            <h3 className="text-xl font-bold text-[#2E593F] mb-2">Cultivo Sustentável</h3>
            <p className="text-gray-600">Trabalhamos com produtores locais que utilizam práticas responsáveis e respeitam o meio ambiente.</p>
          </div>

          <div className="text-center" data-testid="benefit-local">
            <div className="w-20 h-20 bg-[#133903] rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="iconify text-white" data-icon="mdi:handshake" data-width="40"></span>
            </div>
            <h3 className="text-xl font-bold text-[#2E593F] mb-2">Apoio ao Produtor Local</h3>
            <p className="text-gray-600">Valorizamos a agricultura familiar, incentivando pequenos produtores e fortalecendo a economia da nossa região.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
