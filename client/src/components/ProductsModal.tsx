import { useEffect, useState } from "react";

interface LooseItem {
  id: number;
  name: string;
  category: string;
  isActive: boolean;
}

interface ProductsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProductsModal({ isOpen, onClose }: ProductsModalProps) {
  const [items, setItems] = useState<LooseItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      const fetchItems = async () => {
        try {
          const response = await fetch("/api/loose-items");
          if (response.ok) {
            const data = await response.json();
            setItems(data.items || []);
          }
        } catch (error) {
          console.error("Failed to fetch loose items:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchItems();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Agrupar itens por categoria
  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, LooseItem[]>);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#133903] text-white p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold">Produtos que compõe as Cestas Tradicionais e Personalizadas</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 text-3xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Carregando produtos...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {Object.entries(groupedItems).map(([category, categoryItems]) => (
                <div key={category}>
                  <h3 className="text-xl font-bold text-[#2E593F] mb-4 pb-2 border-b-2 border-[#133903]">
                    {category}
                  </h3>
                  <ul className="space-y-2">
                    {categoryItems.map((item) => (
                      <li key={item.id} className="text-gray-700">
                        {item.name}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {!loading && items.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">Nenhum produto disponível.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
