const fs = require('fs');
const path = require('path');

const pages = {
  'Faq.tsx': 'FAQ',
  'SeasonalCalendar.tsx': 'Calendário Sazonal',
  'LooseItems.tsx': 'Itens Avulsos',
  'Pedidos.tsx': 'Pedidos',
  'Scripts.tsx': 'Scripts de Rastreamento'
};

const basePath = 'e:\\site-hortibless\\client\\src\\pages';

Object.entries(pages).forEach(([filename, title]) => {
  const filePath = path.join(basePath, filename);
  let content = fs.readFileSync(filePath, 'utf8');

  // Find the return statement and replace everything from sidebar to the main content
  const sidebarRegex = /{\s*\/\*\s*Sidebar\s*\*\/\s*}\s*<aside[\s\S]*?<\/aside>\s*{\s*\/\*\s*Overlay for mobile\s*\*\/\s*}[\s\S]*?{\s*isSidebarOpen\s*&&[\s\S]*?\}\)/;

  const maxWidth = filename === 'Pedidos.tsx' ? '7xl' : filename === 'SeasonalCalendar.tsx' ? '6xl' : '4xl';

  const replacement = `<DashboardSidebar
        user={user}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        onLogout={handleLogout}
        currentPath={location}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setIsSidebarOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </Button>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">${title}</h1>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-${maxWidth} mx-auto space-y-6">
            <Card`;

  if (sidebarRegex.test(content)) {
    content = content.replace(sidebarRegex, replacement);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✓ Updated sidebar in ${filename}`);
  } else {
    console.log(`✗ Pattern not found in ${filename}`);
  }
});

console.log('\\nAll sidebars replaced with DashboardSidebar!');
