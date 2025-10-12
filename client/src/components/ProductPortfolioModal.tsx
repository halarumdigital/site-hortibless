import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface ProductPortfolioItem {
  id: number;
  imagePath: string;
  isActive: boolean;
}

interface ProductPortfolioModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProductPortfolioModal({ open, onOpenChange }: ProductPortfolioModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const { data: portfolioData, isLoading } = useQuery<{ success: boolean; items: ProductPortfolioItem[] }>({
    queryKey: ["/api/product-portfolio"],
    enabled: open,
  });

  const items = portfolioData?.items || [];
  const hasMultipleItems = items.length > 1;

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? items.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === items.length - 1 ? 0 : prev + 1));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-[#2E593F]">
            Itens da Cesta
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-gray-500">Carregando...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-gray-500">Nenhum portfolio cadastrado</p>
            </div>
          ) : (
            <div className="relative">
              <img
                src={items[currentIndex].imagePath}
                alt={`Portfolio ${currentIndex + 1}`}
                className="w-full h-auto rounded-lg border border-gray-200"
              />

              {hasMultipleItems && (
                <>
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white"
                    onClick={handlePrevious}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>

                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white"
                    onClick={handleNext}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>

                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
                    {currentIndex + 1} / {items.length}
                  </div>
                </>
              )}
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
            <p className="font-semibold mb-2">ℹ️ Informação:</p>
            <p>
              Esta é a lista de itens que compõem a cesta. No campo abaixo, você pode indicar quais itens{" "}
              <strong>NÃO deseja receber</strong> em sua cesta.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
