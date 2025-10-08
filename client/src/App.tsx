import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import Home from "@/pages/Home";
import ServicesPage from "@/pages/ServicesPage";
import ArticlesPage from "@/pages/ArticlesPage";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import SiteSettings from "@/pages/SiteSettings";
import ContactInfo from "@/pages/ContactInfo";
import Banners from "@/pages/Banners";
import Gallery from "@/pages/Gallery";
import Testimonials from "@/pages/Testimonials";
import Regions from "@/pages/Regions";
import Faq from "@/pages/Faq";
import SeasonalCalendar from "@/pages/SeasonalCalendar";
import ComparativeTable from "@/pages/ComparativeTable";
import LooseItems from "@/pages/LooseItems";
import Baskets from "@/pages/Baskets";
import NotFound from "@/pages/not-found";

function Router() {
  useSiteSettings();

  return (
    <Switch>
      <Route path="/" component={Home}/>
      <Route path="/services" component={ServicesPage}/>
      <Route path="/articles" component={ArticlesPage}/>
      <Route path="/login" component={Login}/>
      <Route path="/dashboard" component={Dashboard}/>
      <Route path="/dashboard/site-settings" component={SiteSettings}/>
      <Route path="/dashboard/contact-info" component={ContactInfo}/>
      <Route path="/dashboard/banners" component={Banners}/>
      <Route path="/dashboard/gallery" component={Gallery}/>
      <Route path="/dashboard/testimonials" component={Testimonials}/>
      <Route path="/dashboard/regions" component={Regions}/>
      <Route path="/dashboard/faq" component={Faq}/>
      <Route path="/dashboard/seasonal-calendar" component={SeasonalCalendar}/>
      <Route path="/dashboard/comparative-table" component={ComparativeTable}/>
      <Route path="/dashboard/loose-items" component={LooseItems}/>
      <Route path="/dashboard/baskets" component={Baskets}/>
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
