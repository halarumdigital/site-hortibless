import { useQuery } from "@tanstack/react-query";

interface AboutUs {
  id: number;
  image1Path: string | null;
  image2Path: string | null;
  image3Path: string | null;
}

export default function AboutSection() {
  const { data: aboutUsData } = useQuery<{ success: boolean; aboutUs: AboutUs | null }>({
    queryKey: ["/api/about-us"],
  });

  const imageSrc = aboutUsData?.aboutUs?.image1Path || "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600";

  return (
    <section className="bg-white py-12 md:py-20 wave-bottom">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto flex flex-col lg:flex-row items-center gap-8 md:gap-10">
          {/* Imagem - Mobile: largura total / Desktop: metade */}
          <div className="lg:w-1/2 w-full">
            <img
              src={imageSrc}
              alt="Sobre a HortiBless"
              className="rounded-2xl shadow-lg w-full h-auto"
              data-testid="img-about-hydroponic-farm"
            />
          </div>
          {/* Texto */}
          <div className="lg:w-1/2 w-full text-left">
            <h2 className="text-2xl md:text-4xl font-bold text-[#1A4731] mb-4 md:mb-6">Sobre nós</h2>
            <p className="text-gray-500 text-sm md:text-base mb-4">
              Na HortiBless, acreditamos que cada refeição é uma oportunidade de cuidar de pessoas e negócios, oferecendo produtos hortifruti frescos, selecionados e da estação. Nossa missão é levar saúde, sabor e praticidade diretamente para a mesa — seja de famílias que valorizam alimentação equilibrada, seja de estabelecimentos que buscam qualidade e frescor em cada preparo.
            </p>
            <p className="text-gray-500 text-sm md:text-base mb-6 md:mb-8">
              Por meio dos nossos planos de assinatura e entregas personalizadas, criamos experiências que unem conveniência, sofisticação e frescor, tornando cada refeição mais especial e nutritiva. Trabalhamos para que alimentação saudável e saborosa faça parte do dia a dia de todos que confiam na HortiBless.
            </p>
            <a
              href="/sobre"
              className="inline-block bg-[#1A4731] text-white px-6 md:px-8 py-3 rounded-full font-semibold hover:bg-[#0f2b02] transition-colors"
            >
              Ver mais
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
