import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useQuery } from "@tanstack/react-query";

interface AboutUs {
  id: number;
  image1Path: string | null;
  image2Path: string | null;
  image3Path: string | null;
}

export default function Sobre() {
  const { settings } = useSiteSettings();

  const { data: aboutUsData } = useQuery<{ success: boolean; aboutUs: AboutUs | null }>({
    queryKey: ["/api/about-us"],
  });

  const image2Src = aboutUsData?.aboutUs?.image2Path || "/uploads/about-farmer1.png";
  const image3Src = aboutUsData?.aboutUs?.image3Path || "/uploads/about-farmer2.jpg";

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <WhatsAppButton />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-[#1A472A] to-[#2E593F] text-white py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-5xl font-bold mb-4">Sobre a HortiBless</h1>
            <p className="text-xl text-gray-200 max-w-2xl mx-auto">
              Levando saúde e frescor da horta à mesa de famílias e negócios que valorizam qualidade e bem-estar
            </p>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl font-bold text-[#2E593F] mb-6">Nosso Propósito</h2>
                <p className="text-gray-700 text-lg mb-8">
                  Nosso propósito é nutrir conexões por meio da alimentação, oferecendo soluções práticas e saborosas para o dia a dia de famílias e negócios. Levamos produtos hortifruti com qualidade, frescor e um toque de exclusividade — porque cuidar bem das pessoas também é cuidar do que vai à mesa.
                </p>

                <div className="bg-[#EFF6EF] rounded-xl p-6">
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <span className="iconify text-[#133903] mr-3 mt-1" data-icon="mdi:fruit-cherries" data-width="28"></span>
                      <div>
                        <h3 className="text-lg font-bold text-[#2E593F] mb-1">Qualidade e Origem Garantidas</h3>
                        <p className="text-gray-700 text-sm">Selecionamos produtos diretamente do produtor, com rastreabilidade e confiança.</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <span className="iconify text-[#133903] mr-3 mt-1" data-icon="mdi:sprout" data-width="28"></span>
                      <div>
                        <h3 className="text-lg font-bold text-[#2E593F] mb-1">Frescor da Estação</h3>
                        <p className="text-gray-700 text-sm">Frutas, verduras e legumes sempre no auge do sabor e da colheita</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <span className="iconify text-[#133903] mr-3 mt-1" data-icon="mdi:recycle" data-width="28"></span>
                      <div>
                        <h3 className="text-lg font-bold text-[#2E593F] mb-1">Sustentabilidade em Ação</h3>
                        <p className="text-gray-700 text-sm">Reduzimos desperdícios e cuidamos da natureza em cada processo.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="order-first lg:order-last">
                <img
                  src={image2Src}
                  alt="Nosso Propósito - HortiBless"
                  className="w-full h-auto rounded-xl shadow-lg object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20 bg-[#EFF6EF]">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-[#2E593F] mb-4">Nossos Valores</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Princípios que guiam nosso trabalho diário
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white rounded-xl p-8 shadow-lg text-center">
                <div className="inline-block bg-[#EFF6EF] rounded-full p-4 mb-4">
                  <span className="iconify text-[#133903]" data-icon="mdi:shield-check" data-width="48"></span>
                </div>
                <h3 className="text-2xl font-bold text-[#2E593F] mb-4">Qualidade</h3>
                <p className="text-gray-700">
                  Compromisso com produtos de excelência, desde o cultivo até a entrega.
                </p>
              </div>

              <div className="bg-white rounded-xl p-8 shadow-lg text-center">
                <div className="inline-block bg-[#EFF6EF] rounded-full p-4 mb-4">
                  <span className="iconify text-[#133903]" data-icon="mdi:earth" data-width="48"></span>
                </div>
                <h3 className="text-2xl font-bold text-[#2E593F] mb-4">Sustentabilidade</h3>
                <p className="text-gray-700">
                  Práticas que respeitam o meio ambiente e promovem a agricultura sustentável.
                </p>
              </div>

              <div className="bg-white rounded-xl p-8 shadow-lg text-center">
                <div className="inline-block bg-[#EFF6EF] rounded-full p-4 mb-4">
                  <span className="iconify text-[#133903]" data-icon="mdi:account-heart" data-width="48"></span>
                </div>
                <h3 className="text-2xl font-bold text-[#2E593F] mb-4">Cuidado</h3>
                <p className="text-gray-700">
                  Atenção especial a cada detalhe para garantir sua satisfação e bem-estar.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto space-y-12">
              {/* Como tudo começou */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div>
                  <img
                    src={image3Src}
                    alt="Nossa História - HortiBless"
                    className="w-full h-auto rounded-xl shadow-lg object-cover"
                  />
                </div>
                <div>
                  <h2 className="text-4xl font-bold text-[#2E593F] mb-6">Nossa História</h2>
                  <div className="space-y-4 text-gray-700 text-lg">
                    <p>
                      A ideia da HortiBless nasceu do desejo de transformar a forma como pessoas e negócios consomem hortifruti — com mais praticidade, saúde e confiança. Em meio à rotina corrida, percebemos a necessidade de um serviço que garantisse alimentos sempre frescos, selecionados e entregues com carinho, tanto para famílias quanto para estabelecimentos que valorizam qualidade e sabor em cada preparo.
                    </p>
                    <p>
                      Nossos valores são sólidos: qualidade em cada entrega, cuidado em cada detalhe e compromisso em levar saúde e bem-estar a quem confia em nosso trabalho. Trabalhamos com produtos da estação, incentivamos o consumo consciente e atuamos com responsabilidade em cada etapa do processo — desde a seleção até a entrega.
                    </p>
                    <p>
                      Mais do que um delivery, somos uma marca que cria experiências e conecta pessoas e negócios ao melhor da natureza. E este é apenas o começo: queremos crescer junto com nossos clientes, levando a bênção de uma vida mais saudável e sustentável para lares e empreendimentos.
                    </p>
                    <p className="font-semibold text-[#2E593F]">
                      HortiBless – conectando pessoas e negócios ao melhor da natureza!
                    </p>
                  </div>
                </div>
              </div>

              {/* Quem Somos */}
              <div className="bg-[#EFF6EF] rounded-xl p-8">
                <h2 className="text-3xl font-bold text-[#2E593F] mb-6 text-center">Quem Somos</h2>
                <div className="space-y-4 text-gray-700 text-lg">
                  <p>
                    Na HortiBless, acreditamos que cada refeição é uma oportunidade de cuidar de pessoas e negócios, oferecendo produtos hortifruti frescos, selecionados e da estação. Nossa missão é levar saúde, sabor e praticidade diretamente para a mesa — seja de famílias que valorizam alimentação equilibrada, seja de estabelecimentos que buscam qualidade e frescor em cada preparo.
                  </p>
                  <p>
                    Por meio dos nossos planos de assinatura e entregas personalizadas, criamos experiências que unem conveniência, sofisticação e frescor, tornando cada refeição mais especial e nutritiva. Trabalhamos para que alimentação saudável e saborosa faça parte do dia a dia de todos que confiam na HortiBless.
                  </p>
                </div>
              </div>

              {/* Nossa Cultura */}
              <div>
                <h2 className="text-3xl font-bold text-[#2E593F] mb-6 text-center">Nossa Cultura</h2>
                <div className="space-y-4 text-gray-700 text-lg">
                  <p>
                    Nossa cultura é guiada pela excelência em cada detalhe. Acreditamos que a simplicidade, integridade e agilidade dos nossos processos fazem toda a diferença tanto na vida de famílias quanto de negócios.
                  </p>
                  <p>
                    Trabalhamos para oferecer facilidade, acesso e diversidade, com produtos frescos da estação, sempre escolhidos com cuidado. Mais do que entregar alimentos, proporcionamos uma experiência que torna o dia a dia mais pleno, vibrante e repleto de bem-estar, seja em casa ou em seu estabelecimento.
                  </p>
                </div>
              </div>

              {/* Nossa Experiência */}
              <div className="bg-[#EFF6EF] rounded-xl p-8">
                <h2 className="text-3xl font-bold text-[#2E593F] mb-6 text-center">Nossa Experiência</h2>
                <div className="space-y-4 text-gray-700 text-lg">
                  <p>
                    A experiência HortiBless é marcada por uma jornada de compra prática, agradável e confiável.
                  </p>
                  <p>
                    Garantimos a qualidade e o frescor dos produtos do campo à mesa, com um processo simples e eficiente de delivery. Dessa forma, nossos clientes — famílias e negócios — recebem seus produtos selecionados sem sair de casa ou sem precisar se preocupar com reposição de estoque, com a tranquilidade de uma entrega recorrente e planejada.
                  </p>
                  <p>
                    Mais do que fornecer hortifruti, criamos experiências que facilitam a vida de quem cozinha, nutre e encanta, unindo qualidade, sofisticação e confiança em cada refeição.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 bg-gradient-to-r from-[#1A472A] to-[#2E593F] text-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-5xl font-bold mb-2">50+</div>
                <div className="text-gray-200">Famílias e Negócios Atendidos</div>
              </div>
              <div>
                <div className="text-5xl font-bold mb-2">34+</div>
                <div className="text-gray-200">Variedades de Frutas</div>
              </div>
              <div>
                <div className="text-5xl font-bold mb-2">28+</div>
                <div className="text-gray-200">Variedades de Legumes</div>
              </div>
              <div>
                <div className="text-5xl font-bold mb-2">20+</div>
                <div className="text-gray-200">Variedades de Verduras</div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-[#EFF6EF]">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold text-[#2E593F] mb-6">Faça Parte Dessa História</h2>
            <p className="text-gray-700 text-lg mb-8 max-w-2xl mx-auto">
              Junte-se às centenas de famílias e negócios que já escolheram uma alimentação mais saudável, prática e sustentável.
            </p>
            <a
              href="/cestas"
              className="inline-block bg-[#133903] text-white px-8 py-4 rounded-lg font-semibold hover:bg-[#6a9f24] transition-colors text-lg"
            >
              Assinar Agora
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
