import { useState } from "react";
import ProductsModal from "./ProductsModal";

export default function ProductsButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <section className="bg-[#EFF6EF] py-12 md:py-16 px-4">
      <div className="container mx-auto text-center">
        <div className="flex flex-col items-center gap-4 md:gap-6">
          <a
            href="/planos"
            className="bg-[#2E593F] text-white px-6 md:px-8 py-3 md:py-4 rounded-full text-sm md:text-lg font-semibold hover:bg-[#1e3d2a] transition-colors shadow-lg inline-flex items-center gap-2"
          >
            Conhecer Planos
          </a>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#1A4731] text-white px-4 md:px-6 py-3 rounded-full text-xs md:text-base font-medium hover:bg-[#0f2b02] transition-colors inline-flex items-center gap-2 md:gap-3"
          >
            <span className="iconify text-lg md:text-xl" data-icon="mdi:basket-outline"></span>
            <span>Produtos que compõe as Cestas Tradicionais e Personalizadas</span>
          </button>
        </div>
      </div>

      <ProductsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </section>
  );
}
