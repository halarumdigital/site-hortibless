import { useEffect, useState } from "react";

interface Banner {
  id: number;
  imagePath: string;
  order: number;
  isActive: boolean;
}

export default function HeroSection() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await fetch("/api/banners");
        if (response.ok) {
          const data = await response.json();
          setBanners(data.banners || []);
        }
      } catch (error) {
        console.error("Failed to fetch banners:", error);
      }
    };

    fetchBanners();
  }, []);

  useEffect(() => {
    if (banners.length === 0) return;

    const interval = setInterval(() => {
      setCurrentBannerIndex((prevIndex) => (prevIndex + 1) % banners.length);
    }, 10000); // 10 seconds

    return () => clearInterval(interval);
  }, [banners.length]);

  const currentBanner = banners[currentBannerIndex];

  return (
    <section className="text-white relative" style={{overflow: 'visible'}}>
      {/* Background Images with Carousel */}
      <div className="absolute inset-0">
        {banners.length > 0 ? (
          banners.map((banner, index) => (
            <div
              key={banner.id}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentBannerIndex ? "opacity-100" : "opacity-0"
              }`}
            >
              <img
                src={banner.imagePath}
                alt={`Banner ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/70"></div>
            </div>
          ))
        ) : (
          <div className="absolute inset-0 bg-[#4A4A4A]"></div>
        )}
      </div>

      {/* Mobile: altura menor, texto menor / Desktop: mantém original */}
      <div className="container mx-auto px-4 flex flex-col items-center text-center py-12 md:pt-20 relative z-10 min-h-[500px] md:min-h-0" style={{height: 'auto'}}>
        <div className="md:h-[850px] flex flex-col items-center justify-center md:justify-start md:pt-20">
          <h1 className="text-3xl md:text-7xl font-bold leading-tight">
            Mais do que um delivery, <span className="md:hidden"><br /></span>
            <span className="hidden md:inline"><br /></span>
            uma bênção para a sua mesa e o seu negócio!
          </h1>
          <p className="mt-4 md:mt-6 text-sm md:text-lg max-w-2xl mb-6 md:mb-8 text-gray-300">
            HortiBless entrega frutas, legumes, verduras e temperos frescos da estação, selecionados com carinho, entregues em cestas avulsas ou por assinatura, para nutrir sua família e impulsionar seu negócio.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mt-4 w-full sm:w-auto px-4 sm:px-0">
            <a href="/planos" className="bg-white text-[#1A4731] px-6 md:px-8 py-3 md:py-4 rounded-full font-semibold hover:bg-gray-100 transition-colors shadow-lg text-center w-full sm:w-auto">
              Quero minha cesta agora
            </a>
          </div>
        </div>
      </div>

      {/* Feature Cards - Mobile: escondido aqui, mostrado na seção de features */}
      <div className="hidden md:block absolute -bottom-40 left-1/2 -translate-x-1/2 w-full max-w-6xl mx-auto px-4" style={{position: 'absolute', zIndex: 999}}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-[#2E593F] p-6 rounded-lg shadow-xl text-center flex flex-col items-center justify-start hover:bg-[#1f3e2b] transition-colors h-full" data-testid="feature-variety">
            <div className="bg-[#133903] rounded-full p-4 mb-4 shadow-lg">
              <span className="iconify text-white" data-icon="mdi:fruit-grapes" data-width="40"></span>
            </div>
            <h3 className="text-lg font-bold mb-3 text-white">Variedade da Estação</h3>
            <p className="text-sm text-gray-200 text-center leading-relaxed">
              Selecionamos frutas, verduras e legumes da época para garantir o melhor sabor e preço justo.
            </p>
          </div>
          <div className="bg-[#2E593F] p-6 rounded-lg shadow-xl text-center flex flex-col items-center justify-start hover:bg-[#1f3e2b] transition-colors h-full" data-testid="feature-delivery">
            <div className="bg-[#133903] rounded-full p-4 mb-4 shadow-lg">
              <span className="iconify text-white" data-icon="mdi:truck-delivery" data-width="40"></span>
            </div>
            <h3 className="text-lg font-bold mb-3 text-white">Entrega Rápida e Segura</h3>
            <p className="text-sm text-gray-200 text-center leading-relaxed">
              Sua cesta chega fresca e bem embalada diretamente na sua porta, com todo o cuidado que você merece.
            </p>
          </div>
          <div className="bg-[#2E593F] p-6 rounded-lg shadow-xl text-center flex flex-col items-center justify-start hover:bg-[#1f3e2b] transition-colors h-full" data-testid="feature-sustainable">
            <div className="bg-[#133903] rounded-full p-4 mb-4 shadow-lg">
              <span className="iconify text-white" data-icon="mdi:leaf" data-width="40"></span>
            </div>
            <h3 className="text-lg font-bold mb-3 text-white">Produtos Selecionados</h3>
            <p className="text-sm text-gray-200 text-center leading-relaxed">
              Priorizamos produtos frescos, bonitos e de excelente qualidade para cada entrega.
            </p>
          </div>
          <div className="bg-[#2E593F] p-6 rounded-lg shadow-xl text-center flex flex-col items-center justify-start hover:bg-[#1f3e2b] transition-colors h-full" data-testid="feature-local">
            <div className="bg-[#133903] rounded-full p-4 mb-4 shadow-lg">
              <span className="iconify text-white" data-icon="mdi:handshake" data-width="40"></span>
            </div>
            <h3 className="text-lg font-bold mb-3 text-white">Flexibilidade de Planos</h3>
            <p className="text-sm text-gray-200 text-center leading-relaxed">
              Opções de planos personalizados ou cestas avulsas para atender diferentes necessidades
            </p>
          </div>
        </div>
      </div>

      {/* Feature Cards Mobile - Aparece apenas no mobile, integrado à seção */}
      <div className="md:hidden relative z-10 px-4 pt-8 pb-8 -mt-4 bg-[#EFF6EF]">
        <div className="grid grid-cols-1 gap-4">
          <div className="bg-[#2E593F] p-6 rounded-2xl text-left flex flex-col items-start gap-3">
            <span className="iconify text-white text-4xl" data-icon="mdi:fruit-grapes"></span>
            <h3 className="text-lg font-bold text-white">Variedade da Estação</h3>
            <p className="text-sm text-gray-200">
              Selecionamos frutas, verduras e legumes da época para garantir o melhor sabor e preço justo.
            </p>
          </div>
          <div className="bg-[#2E593F] p-6 rounded-2xl text-left flex flex-col items-start gap-3">
            <span className="iconify text-white text-4xl" data-icon="mdi:truck-delivery"></span>
            <h3 className="text-lg font-bold text-white">Entrega Rápida e Segura</h3>
            <p className="text-sm text-gray-200">
              Sua cesta chega fresca e bem embalada diretamente na sua porta, com todo o cuidado que você merece.
            </p>
          </div>
          <div className="bg-[#2E593F] p-6 rounded-2xl text-left flex flex-col items-start gap-3">
            <span className="iconify text-white text-4xl" data-icon="mdi:leaf"></span>
            <h3 className="text-lg font-bold text-white">Produtos Selecionados</h3>
            <p className="text-sm text-gray-200">
              Priorizamos produtos frescos, bonitos e de excelente qualidade para cada entrega.
            </p>
          </div>
          <div className="bg-[#2E593F] p-6 rounded-2xl text-left flex flex-col items-start gap-3">
            <span className="iconify text-white text-4xl" data-icon="mdi:handshake"></span>
            <h3 className="text-lg font-bold text-white">Flexibilidade de Planos</h3>
            <p className="text-sm text-gray-200">
              Opções de planos personalizados ou cestas avulsas para atender diferentes necessidades.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
