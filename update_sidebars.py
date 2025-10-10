#!/usr/bin/env python3
import re
import os

# Lista de arquivos para atualizar
files_to_update = [
    r"e:\site-hortibless\client\src\pages\Gallery.tsx",
    r"e:\site-hortibless\client\src\pages\Testimonials.tsx",
    r"e:\site-hortibless\client\src\pages\Regions.tsx",
    r"e:\site-hortibless\client\src\pages\Faq.tsx",
    r"e:\site-hortibless\client\src\pages\SeasonalCalendar.tsx",
    r"e:\site-hortibless\client\src\pages\ComparativeTable.tsx",
    r"e:\site-hortibless\client\src\pages\LooseItems.tsx",
    r"e:\site-hortibless\client\src\pages\Baskets.tsx",
    r"e:\site-hortibless\client\src\pages\Duvidas.tsx",
    r"e:\site-hortibless\client\src\pages\Scripts.tsx",
    r"e:\site-hortibless\client\src\pages\Pedidos.tsx",
]

for file_path in files_to_update:
    print(f"Processando {os.path.basename(file_path)}...")

    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        original_content = content

        # 1. Atualizar imports - remover icons não utilizados e adicionar DashboardSidebar
        content = re.sub(
            r'import { useSiteSettings } from "@/hooks/useSiteSettings";',
            '',
            content
        )

        # Adicionar import do DashboardSidebar se não existir
        if 'import { DashboardSidebar }' not in content:
            # Encontrar a última linha de import lucide-react
            content = re.sub(
                r'(import {[^}]*} from "lucide-react";)',
                r'\1\nimport { DashboardSidebar } from "@/components/DashboardSidebar";',
                content,
                count=1
            )

        # 2. Mudar const [, setLocation] para const [location, setLocation]
        content = re.sub(
            r'const \[, setLocation\] = useLocation\(\);',
            'const [location, setLocation] = useLocation();',
            content
        )

        # 3. Adicionar handleLogout antes de logoutMutation
        if 'const handleLogout = () => {' not in content:
            content = re.sub(
                r'(  const logoutMutation = )',
                r'  const handleLogout = () => {\n    logoutMutation.mutate();\n  };\n\n\1',
                content,
                count=1
            )

        # 4. Substituir toda a sidebar por DashboardSidebar
        # Padrão: desde "return (\n    <div className="min-h-screen" até o fim do overlay
        sidebar_pattern = r'(return \(\s*<div className="min-h-screen[^>]*>\s*)(?:\/\* Sidebar \*\/.*?\/\* Overlay for mobile \*\/\s*\{isSidebarOpen &&[^}]*\}\s*\}\))'

        sidebar_replacement = r'''\1<DashboardSidebar
        user={user}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        onLogout={handleLogout}
        currentPath={location}
      />'''

        content = re.sub(sidebar_pattern, sidebar_replacement, content, flags=re.DOTALL)

        # Salvar apenas se houve mudanças
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"  ✓ {os.path.basename(file_path)} atualizado!")
        else:
            print(f"  - {os.path.basename(file_path)} sem mudanças")

    except Exception as e:
        print(f"  ✗ Erro ao processar {os.path.basename(file_path)}: {e}")

print("\nProcessamento concluído!")
