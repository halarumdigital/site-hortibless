import { useState } from "react";
import ProductsModal from "./ProductsModal";

export default function ProductsButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <section className="bg-[#eff6ef] py-12">
      <div className="container mx-auto px-4 text-center">
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#133903] text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-[#0f2b02] transition-colors shadow-lg inline-flex items-center gap-2"
        >
          <span className="iconify" data-icon="mdi:basket-outline" data-width="24"></span>
          Produtos que compõe as Cestas Tradicionais e Personalizados
        </button>
      </div>

      <ProductsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </section>
  );
}
