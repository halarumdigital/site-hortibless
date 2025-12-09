import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import Home from "@/pages/Home";
import ServicesPage from "@/pages/ServicesPage";
import ArticlesPage from "@/pages/ArticlesPage";
import Contato from "@/pages/Contato";
import Sobre from "@/pages/Sobre";
import Cestas from "@/pages/Cestas";
import PlanosPage from "@/pages/PlanosPage";
import DicasBlog from "@/pages/DicasBlog";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Users from "@/pages/Users";
import SiteSettings from "@/pages/SiteSettings";
import ContactInfo from "@/pages/ContactInfo";
import Banners from "@/pages/Banners";
import CRM from "@/pages/CRM";
import Testimonials from "@/pages/Testimonials";
import Regions from "@/pages/Regions";
import Faq from "@/pages/Faq";
import SeasonalCalendar from "@/pages/SeasonalCalendar";
import ComparativeTable from "@/pages/ComparativeTable";
import PortfolioProdutos from "@/pages/PortfolioProdutos";
import LooseItems from "@/pages/LooseItems";
import Baskets from "@/pages/Baskets";
import Plans from "@/pages/Plans";
import Dicas from "@/pages/Dicas";
import Duvidas from "@/pages/Duvidas";
import Scripts from "@/pages/Scripts";
import Pedidos from "@/pages/Pedidos";
import WhatsAppIA from "@/pages/WhatsAppIA";
import AboutUs from "@/pages/AboutUs";
import Carrinho from "@/pages/Carrinho";
import CompraAvulsa from "@/pages/CompraAvulsa";
import PedidoPersonalizado from "@/pages/PedidoPersonalizado";
import TermosUso from "@/pages/TermosUso";
import Obrigado from "@/pages/Obrigado";
import NotFound from "@/pages/not-found";

function Router() {
  useSiteSettings();

  return (
    <Switch>
      <Route path="/" component={Home}/>
      <Route path="/services" component={ServicesPage}/>
      <Route path="/articles" component={ArticlesPage}/>
      <Route path="/contato" component={Contato}/>
      <Route path="/sobre" component={Sobre}/>
      <Route path="/cestas" component={Cestas}/>
      <Route path="/planos" component={PlanosPage}/>
      <Route path="/dicas" component={DicasBlog}/>
      <Route path="/carrinho" component={Carrinho}/>
      <Route path="/compra-avulsa" component={CompraAvulsa}/>
      <Route path="/pedido-personalizado" component={PedidoPersonalizado}/>
      <Route path="/termos-de-uso" component={TermosUso}/>
      <Route path="/obrigado/:orderId" component={Obrigado}/>
      <Route path="/login" component={Login}/>
      <Route path="/dashboard" component={Dashboard}/>
      <Route path="/dashboard/users" component={Users}/>
      <Route path="/dashboard/site-settings" component={SiteSettings}/>
      <Route path="/dashboard/about-us" component={AboutUs}/>
      <Route path="/dashboard/contact-info" component={ContactInfo}/>
      <Route path="/dashboard/banners" component={Banners}/>
      <Route path="/dashboard/crm" component={CRM}/>
      <Route path="/dashboard/testimonials" component={Testimonials}/>
      <Route path="/dashboard/regions" component={Regions}/>
      <Route path="/dashboard/faq" component={Faq}/>
      <Route path="/dashboard/seasonal-calendar" component={SeasonalCalendar}/>
      <Route path="/dashboard/comparative-table" component={ComparativeTable}/>
      <Route path="/dashboard/portfolio-produtos" component={PortfolioProdutos}/>
      <Route path="/dashboard/loose-items" component={LooseItems}/>
      <Route path="/dashboard/baskets" component={Baskets}/>
      <Route path="/dashboard/plans" component={Plans}/>
      <Route path="/dashboard/dicas" component={Dicas}/>
      <Route path="/dashboard/duvidas" component={Duvidas}/>
      <Route path="/dashboard/scripts" component={Scripts}/>
      <Route path="/dashboard/pedidos" component={Pedidos}/>
      <Route path="/dashboard/whatsapp-ia" component={WhatsAppIA}/>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
