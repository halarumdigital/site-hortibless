export default function AboutSection() {
  return (
    <section className="bg-white py-20 wave-bottom">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <img 
              src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
              alt="Hydroponic vertical farm" 
              className="rounded-xl shadow-lg w-full h-auto"
              data-testid="img-about-hydroponic-farm"
            />
          </div>
          <div>
            <h2 className="text-4xl font-bold text-[#2E593F] mb-6">Sobre nós</h2>
            <p className="text-gray-600 mb-6">
              Na HortiBless, acreditamos que cada refeição é uma oportunidade de cuidar de pessoas e negócios, oferecendo produtos hortifruti frescos, selecionados e da estação. Nossa missão é levar saúde, sabor e praticidade diretamente para a mesa — seja de famílias que valorizam alimentação equilibrada, seja de estabelecimentos que buscam qualidade e frescor em cada preparo.
            </p>
            <p className="text-gray-600 mb-6">
              Por meio dos nossos planos de assinatura e entregas personalizadas, criamos experiências que unem conveniência, sofisticação e frescor, tornando cada refeição mais especial e nutritiva. Trabalhamos para que alimentação saudável e saborosa faça parte do dia a dia de todos que confiam na HortiBless.
            </p>
            <a
              href="/sobre"
              className="inline-block bg-[#133903] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#6a9f24] transition-colors"
            >
              Ver mais
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
