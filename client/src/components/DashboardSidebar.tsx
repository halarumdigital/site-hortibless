import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { LogOut, Users, Menu, X, Settings, Phone, Image, Headphones, MessageSquare, MapPin, HelpCircle, Calendar, Table, Package, ShoppingBasket, Mail, Code, ShoppingCart, TrendingUp, MessageCircle, Lightbulb, Briefcase } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";

interface DashboardSidebarProps {
  user: any;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  onLogout: () => void;
  currentPath?: string;
}

export function DashboardSidebar({ user, isSidebarOpen, setIsSidebarOpen, onLogout, currentPath }: DashboardSidebarProps) {
  const [, setLocation] = useLocation();
  const { settings } = useSiteSettings();

  const menuItems = [
    { path: "/dashboard", icon: TrendingUp, label: "Dashboard", testId: "menu-dashboard" },
    { path: "/dashboard/users", icon: Users, label: "Usuários", testId: "menu-users" },
    { path: "/dashboard/site-settings", icon: Settings, label: "Configurações do Site", testId: "menu-site-settings" },
    { path: "/dashboard/contact-info", icon: Phone, label: "Contatos", testId: "menu-contact-info" },
    { path: "/dashboard/banners", icon: Image, label: "Banners", testId: "menu-banners" },
    { path: "/dashboard/crm", icon: Headphones, label: "CRM", testId: "menu-crm" },
    { path: "/dashboard/testimonials", icon: MessageSquare, label: "Depoimentos", testId: "menu-testimonials" },
    { path: "/dashboard/regions", icon: MapPin, label: "Regiões de Atendimento", testId: "menu-regions" },
    { path: "/dashboard/faq", icon: HelpCircle, label: "FAQ", testId: "menu-faq" },
    { path: "/dashboard/seasonal-calendar", icon: Calendar, label: "Calendário Sazonal", testId: "menu-seasonal-calendar" },
    { path: "/dashboard/comparative-table", icon: Table, label: "Tabela Comparativa", testId: "menu-comparative-table" },
    { path: "/dashboard/portfolio-produtos", icon: Briefcase, label: "Portfolio de Produtos", testId: "menu-portfolio-produtos" },
    { path: "/dashboard/loose-items", icon: Package, label: "Itens Avulsos", testId: "menu-loose-items" },
    { path: "/dashboard/baskets", icon: ShoppingBasket, label: "Cestas", testId: "menu-baskets" },
    { path: "/dashboard/dicas", icon: Lightbulb, label: "Dicas", testId: "menu-dicas" },
    { path: "/dashboard/duvidas", icon: Mail, label: "Dúvidas", testId: "menu-duvidas" },
    { path: "/dashboard/scripts", icon: Code, label: "Scripts", testId: "menu-scripts" },
    { path: "/dashboard/pedidos", icon: ShoppingCart, label: "Pedidos", testId: "menu-pedidos" },
    { path: "/dashboard/whatsapp-ia", icon: MessageCircle, label: "WhatsApp e IA", testId: "menu-whatsapp-ia" },
  ];

  return (
    <>
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:z-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-center p-4 border-b border-gray-200 dark:border-gray-700 relative">
            {settings?.logoPath && (
              <div className="flex justify-center">
                <img
                  src={settings.logoPath}
                  alt="Logo"
                  className="h-16 object-contain"
                />
              </div>
            )}
            <Button
              data-testid="button-close-sidebar"
              variant="ghost"
              size="sm"
              className="lg:hidden absolute right-2"
              onClick={() => setIsSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          <nav className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPath === item.path;

                return (
                  <button
                    key={item.path}
                    data-testid={item.testId}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md ${
                      isActive
                        ? "bg-[#133903] text-white"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                    onClick={() => setLocation(item.path)}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span className="whitespace-nowrap overflow-hidden text-ellipsis">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </nav>

          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-[#133903] flex items-center justify-center text-white font-semibold">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
              </div>
            </div>
            <Button
              data-testid="button-logout"
              variant="outline"
              className="w-full"
              onClick={onLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </>
  );
}
