#!/bin/bash

# Script para atualizar páginas do dashboard com DashboardSidebar

PAGES=("Regions" "Faq" "SeasonalCalendar" "ComparativeTable" "LooseItems" "Baskets" "Duvidas" "Scripts" "Pedidos")

for page in "${PAGES[@]}"; do
  FILE="e:/site-hortibless/client/src/pages/${page}.tsx"

  if [ ! -f "$FILE" ]; then
    echo "❌ Arquivo não encontrado: $FILE"
    continue
  fi

  echo "📝 Processando $page.tsx..."

  # 1. Adicionar import do DashboardSidebar se não existir
  if ! grep -q "DashboardSidebar" "$FILE"; then
    # Adicionar o import após os outros imports
    sed -i '/^import.*from "lucide-react";/a\import { DashboardSidebar } from "@/components/DashboardSidebar";' "$FILE"
  fi

  # 2. Remover import do useSiteSettings
  sed -i '/import.*useSiteSettings/d' "$FILE"

  # 3. Mudar useLocation
  sed -i 's/const \[, setLocation\] = useLocation();/const [location, setLocation] = useLocation();/' "$FILE"

  # 4. Remover linha const { settings } = useSiteSettings();
  sed -i '/const { settings } = useSiteSettings();/d' "$FILE"

  echo "✅ $page.tsx atualizado!"
done

echo ""
echo "🎉 Todas as páginas foram atualizadas!"
