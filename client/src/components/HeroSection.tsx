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
          <div className="hero-bg w-full h-full"></div>
        )}
      </div>

      <div className="container mx-auto px-4 flex flex-col items-center text-center pt-20 relative z-10" style={{height: '850px'}}>
        <h1 className="text-7xl font-bold leading-tight mt-20">
          Mais do que um delivery, <br />
          uma bênção para a sua mesa!
        </h1>
        <p className="mt-6 text-lg max-w-2xl mb-8">
          HortiBless entrega frutas, legumes e verduras selecionados, frescos da estação, em cestas avulsas ou planos por assinatura, direto na sua casa
        </p>
        <div className="flex gap-4 mt-4">
          <a href="/#contact" className="bg-[#133903] text-white px-8 py-4 rounded-lg font-semibold hover:bg-[#0f2b02] transition-colors shadow-lg">
            Quero minha cesta agora
          </a>
          <a href="/#services" className="bg-white text-[#2E593F] px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg">
            Conheça nossos planos
          </a>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="absolute -bottom-40 left-1/2 -translate-x-1/2 w-full max-w-6xl mx-auto px-4" style={{position: 'absolute', zIndex: 999}}>
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
            <h3 className="text-lg font-bold mb-3 text-white">Cultivo Sustentável</h3>
            <p className="text-sm text-gray-200 text-center leading-relaxed">
              Trabalhamos com produtores locais que utilizam práticas responsáveis e respeitam o meio ambiente.
            </p>
          </div>
          <div className="bg-[#2E593F] p-6 rounded-lg shadow-xl text-center flex flex-col items-center justify-start hover:bg-[#1f3e2b] transition-colors h-full" data-testid="feature-local">
            <div className="bg-[#133903] rounded-full p-4 mb-4 shadow-lg">
              <span className="iconify text-white" data-icon="mdi:handshake" data-width="40"></span>
            </div>
            <h3 className="text-lg font-bold mb-3 text-white">Apoio ao Produtor Local</h3>
            <p className="text-sm text-gray-200 text-center leading-relaxed">
              Valorizamos a agricultura familiar, incentivando pequenos produtores e fortalecendo a economia da nossa região.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
