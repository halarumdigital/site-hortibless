import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { useSiteSettings } from "@/hooks/useSiteSettings";

export default function Sobre() {
  const { settings } = useSiteSettings();

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
              Levando saúde à mesa da família, diretamente da horta
            </p>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl font-bold text-[#2E593F] mb-6">Nosso Propósito</h2>
                <p className="text-gray-700 text-lg mb-4">
                  Nosso propósito é agregar a família em torno da mesa, oferecendo soluções práticas e saborosas para o dia a dia, por meio do fornecimento de produtos hortifruti com um toque de qualidade e exclusividade.
                </p>
                <p className="text-gray-700 text-lg mb-8">
                  É sobre cuidar de pessoas e famílias nos detalhes da alimentação.
                </p>

                <div className="bg-[#EFF6EF] rounded-xl p-6">
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <span className="iconify text-[#133903] mr-3 mt-1" data-icon="mdi:leaf" data-width="28"></span>
                      <div>
                        <h3 className="text-lg font-bold text-[#2E593F] mb-1">100% Orgânico</h3>
                        <p className="text-gray-700 text-sm">Cultivamos sem agrotóxicos, respeitando a natureza e sua saúde.</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <span className="iconify text-[#133903] mr-3 mt-1" data-icon="mdi:truck-fast" data-width="28"></span>
                      <div>
                        <h3 className="text-lg font-bold text-[#2E593F] mb-1">Entrega Rápida</h3>
                        <p className="text-gray-700 text-sm">Da horta para sua casa em tempo recorde, mantendo o frescor.</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <span className="iconify text-[#133903] mr-3 mt-1" data-icon="mdi:heart" data-width="28"></span>
                      <div>
                        <h3 className="text-lg font-bold text-[#2E593F] mb-1">Feito com Amor</h3>
                        <p className="text-gray-700 text-sm">Cada produto é cultivado com dedicação e carinho.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="order-first lg:order-last">
                <img
                  src="/uploads/about-farmer1.png"
                  alt="Agricultor HortiBless"
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
                    src="/uploads/about-farmer2.jpg"
                    alt="Como tudo começou - HortiBless"
                    className="w-full h-auto rounded-xl shadow-lg object-cover"
                  />
                </div>
                <div>
                  <h2 className="text-4xl font-bold text-[#2E593F] mb-6">Como tudo começou</h2>
                  <div className="space-y-4 text-gray-700 text-lg">
                    <p>
                      A ideia da HortiBless surgiu do desejo de transformar a forma como as famílias consomem hortifruti: com mais praticidade, saúde e confiança. Em meio à rotina corrida, percebemos a necessidade de um serviço que garantisse alimentos sempre frescos, selecionados e entregues com carinho.
                    </p>
                    <p>
                      Nossos valores são sólidos: qualidade em cada entrega, cuidado em cada detalhe e compromisso em levar saúde e bem-estar para dentro de cada lar. Trabalhamos com produtos da estação, incentivamos o consumo consciente e apoiamos produtores locais, porque acreditamos que a natureza oferece o melhor quando respeitamos o seu tempo.
                    </p>
                    <p>
                      Mais do que um delivery, somos uma marca que cria experiências e transforma o dia a dia das pessoas. E este é apenas o começo: queremos crescer junto com nossos clientes, levando a bênção de uma vida mais saudável para cada vez mais lares.
                    </p>
                    <p className="font-semibold text-[#2E593F]">
                      HortiBless – conectando você ao melhor da natureza!
                    </p>
                  </div>
                </div>
              </div>

              {/* Quem Somos */}
              <div className="bg-[#EFF6EF] rounded-xl p-8">
                <h2 className="text-3xl font-bold text-[#2E593F] mb-6 text-center">Quem Somos</h2>
                <div className="space-y-4 text-gray-700 text-lg">
                  <p>
                    A HortiBless nasceu com a missão de levar saúde à mesa da família, diretamente da horta, unindo praticidade, sabor e sofisticação.
                  </p>
                  <p>
                    Por meio dos nossos planos de assinatura, proporcionamos a entrega de produtos selecionados da estação, estabelecendo uma experiência que une uma alimentação sempre fresca e saudável, sem abrir mão do sabor e da sofisticação.
                  </p>
                  <p className="font-semibold text-[#2E593F]">
                    HortiBless – mais do que um delivery, uma bênção para sua mesa!
                  </p>
                </div>
              </div>

              {/* Nossa Cultura */}
              <div>
                <h2 className="text-3xl font-bold text-[#2E593F] mb-6 text-center">Nossa Cultura</h2>
                <div className="space-y-4 text-gray-700 text-lg">
                  <p>
                    Nossa cultura é guiada pela excelência em cada detalhe. Acreditamos que a simplicidade, integridade e agilidade dos nossos processos fazem toda a diferença na vida das famílias.
                  </p>
                  <p>
                    Trabalhamos para oferecer facilidade, acesso e diversidade com produtos frescos da estação, sempre escolhidos com cuidado. Assim, entregamos muito mais do que alimentos: proporcionamos uma experiência de vida mais plena, vibrante e repleta de bem-estar.
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
                    Garantimos a qualidade e o frescor dos produtos do campo à sua mesa, com um processo simples e eficiente de delivery. Dessa forma, nossos clientes recebem seus produtos selecionados sem sair de casa e com a tranquilidade de uma reposição recorrente, sem preocupações.
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
                <div className="text-5xl font-bold mb-2">100%</div>
                <div className="text-gray-200">Orgânico</div>
              </div>
              <div>
                <div className="text-5xl font-bold mb-2">500+</div>
                <div className="text-gray-200">Famílias Atendidas</div>
              </div>
              <div>
                <div className="text-5xl font-bold mb-2">20+</div>
                <div className="text-gray-200">Variedades de Vegetais</div>
              </div>
              <div>
                <div className="text-5xl font-bold mb-2">24h</div>
                <div className="text-gray-200">Tempo Médio de Entrega</div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-[#EFF6EF]">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold text-[#2E593F] mb-6">Faça Parte Dessa História</h2>
            <p className="text-gray-700 text-lg mb-8 max-w-2xl mx-auto">
              Junte-se às centenas de famílias que já escolheram uma alimentação mais saudável e sustentável.
            </p>
            <a
              href="/contato"
              className="inline-block bg-[#133903] text-white px-8 py-4 rounded-lg font-semibold hover:bg-[#6a9f24] transition-colors text-lg"
            >
              Entre em Contato
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
