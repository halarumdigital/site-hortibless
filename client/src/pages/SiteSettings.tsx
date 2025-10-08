import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { siteSettingsSchema, type UpdateSiteSettings } from "@shared/schema";
import { LogOut, Settings, Menu, X, Users, Upload, Phone, Image, Images, MessageSquare, MapPin, HelpCircle, Calendar, Table, Package, ShoppingBasket, Mail } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";

interface SiteSettings {
  id: number;
  siteName: string;
  logoPath?: string;
  footerLogoPath?: string;
  faviconPath?: string;
  createdAt: Date;
  updatedAt: Date;
}

export default function SiteSettings() {
  const { user, isLoading: authLoading } = useAuth(true);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [footerLogoPreview, setFooterLogoPreview] = useState<string | null>(null);
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null);
  const { settings } = useSiteSettings();

  const { data: settingsData, isLoading: settingsLoading } = useQuery<{ success: boolean; settings: SiteSettings }>({
    queryKey: ["/api/site-settings"],
    enabled: !!user,
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/logout");
    },
    onSuccess: () => {
      toast({ title: "Logged out successfully" });
      setLocation("/login");
    },
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch("/api/site-settings", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to update settings");
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/site-settings"] });
      toast({ title: "Site settings updated successfully" });
    },
    onError: (error: Error) => {
      console.error("Update error:", error);
      toast({
        title: "Failed to update site settings",
        description: error.message,
        variant: "destructive"
      });
    },
  });

  const form = useForm<UpdateSiteSettings>({
    resolver: zodResolver(siteSettingsSchema),
    defaultValues: {
      siteName: settingsData?.settings?.siteName || "Meu Site",
      logoPath: settingsData?.settings?.logoPath || "",
      footerLogoPath: settingsData?.settings?.footerLogoPath || "",
      faviconPath: settingsData?.settings?.faviconPath || "",
    },
    values: {
      siteName: settingsData?.settings?.siteName || "Meu Site",
      logoPath: settingsData?.settings?.logoPath || "",
      footerLogoPath: settingsData?.settings?.footerLogoPath || "",
      faviconPath: settingsData?.settings?.faviconPath || "",
    },
  });

  const onSubmit = async (data: UpdateSiteSettings) => {
    const formData = new FormData();
    formData.append("siteName", data.siteName);

    const logoInput = document.getElementById("logo-upload") as HTMLInputElement;
    const footerLogoInput = document.getElementById("footer-logo-upload") as HTMLInputElement;
    const faviconInput = document.getElementById("favicon-upload") as HTMLInputElement;

    if (logoInput?.files?.[0]) {
      formData.append("logo", logoInput.files[0]);
    }

    if (footerLogoInput?.files?.[0]) {
      formData.append("footerLogo", footerLogoInput.files[0]);
    }

    if (faviconInput?.files?.[0]) {
      formData.append("favicon", faviconInput.files[0]);
    }

    updateSettingsMutation.mutate(formData);
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFooterLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFooterLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFaviconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFaviconPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Sidebar */}
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

          <nav className="flex-1 p-4">
            <div className="space-y-1">
              <button
                data-testid="menu-users"
                className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => setLocation("/dashboard")}
              >
                <Users className="w-5 h-5" />
                Usuários
              </button>
              <button
                data-testid="menu-site-settings"
                className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md bg-[#133903] text-white"
              >
                <Settings className="w-5 h-5" />
                Configurações do Site
              </button>
              <button
                data-testid="menu-contact-info"
                className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => setLocation("/dashboard/contact-info")}
              >
                <Phone className="w-5 h-5" />
                Contatos
              </button>
              <button
                data-testid="menu-banners"
                className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => setLocation("/dashboard/banners")}
              >
                <Image className="w-5 h-5" />
                Banners
              </button>
              <button
                data-testid="menu-gallery"
                className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => setLocation("/dashboard/gallery")}
              >
                <Images className="w-5 h-5" />
                Galeria
              </button>
              <button
                data-testid="menu-testimonials"
                className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => setLocation("/dashboard/testimonials")}
              >
                <MessageSquare className="w-5 h-5" />
                Depoimentos
              </button>
              <button
                data-testid="menu-regions"
                className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => setLocation("/dashboard/regions")}
              >
                <MapPin className="w-5 h-5" />
                Regiões de Atendimento
              </button>
              <button
                data-testid="menu-faq"
                className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => setLocation("/dashboard/faq")}
              >
                <HelpCircle className="w-5 h-5" />
                FAQ
              </button>
              <button
                data-testid="menu-seasonal-calendar"
                className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => setLocation("/dashboard/seasonal-calendar")}
              >
                <Calendar className="w-5 h-5" />
                Calendário Sazonal
              </button>
              <button
                data-testid="menu-comparative-table"
                className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => setLocation("/dashboard/comparative-table")}
              >
                <Table className="w-5 h-5" />
                Tabela Comparativa
              </button>
              <button
                data-testid="menu-loose-items"
                className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => setLocation("/dashboard/loose-items")}
              >
                <Package className="w-5 h-5" />
                Itens Avulsos
              </button>
              <button
                data-testid="menu-baskets"
                className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => setLocation("/dashboard/baskets")}
              >
                <ShoppingBasket className="w-5 h-5" />
                Cestas
              </button>
              <button
                data-testid="menu-duvidas"
                className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => setLocation("/dashboard/duvidas")}
              >
                <Mail className="w-5 h-5" />
                Dúvidas
              </button>
            </div>
          </nav>

          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-[#133903] flex items-center justify-center text-white font-semibold">
                {user?.name.charAt(0).toUpperCase()}
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
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
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

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                data-testid="button-toggle-sidebar"
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setIsSidebarOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Configurações do Site</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Gerencie as configurações gerais do site</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Configurações Gerais
                  </CardTitle>
                  <CardDescription>Atualize as informações e logotipos do site</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {settingsLoading ? (
                <div className="text-center py-8">Carregando configurações...</div>
              ) : (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="siteName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome do Site</FormLabel>
                          <FormControl>
                            <Input
                              data-testid="input-site-name"
                              placeholder="Digite o nome do site"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="space-y-2">
                      <FormLabel>Logo Principal</FormLabel>
                      <div className="flex items-start gap-4">
                        <div className="flex-1">
                          <Input
                            id="logo-upload"
                            data-testid="input-logo"
                            type="file"
                            accept="image/*"
                            onChange={handleLogoChange}
                          />
                          <p className="text-xs text-gray-500 mt-1">Formatos aceitos: JPEG, PNG, GIF, WebP</p>
                        </div>
                        {(logoPreview || settingsData?.settings?.logoPath) && (
                          <div className="w-24 h-24 border rounded-md overflow-hidden">
                            <img
                              src={logoPreview || settingsData?.settings?.logoPath}
                              alt="Logo preview"
                              className="w-full h-full object-contain"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <FormLabel>Logo do Rodapé</FormLabel>
                      <div className="flex items-start gap-4">
                        <div className="flex-1">
                          <Input
                            id="footer-logo-upload"
                            data-testid="input-footer-logo"
                            type="file"
                            accept="image/*"
                            onChange={handleFooterLogoChange}
                          />
                          <p className="text-xs text-gray-500 mt-1">Formatos aceitos: JPEG, PNG, GIF, WebP</p>
                        </div>
                        {(footerLogoPreview || settingsData?.settings?.footerLogoPath) && (
                          <div className="w-24 h-24 border rounded-md overflow-hidden">
                            <img
                              src={footerLogoPreview || settingsData?.settings?.footerLogoPath}
                              alt="Footer logo preview"
                              className="w-full h-full object-contain"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <FormLabel>Favicon</FormLabel>
                      <div className="flex items-start gap-4">
                        <div className="flex-1">
                          <Input
                            id="favicon-upload"
                            data-testid="input-favicon"
                            type="file"
                            accept="image/*"
                            onChange={handleFaviconChange}
                          />
                          <p className="text-xs text-gray-500 mt-1">Formatos aceitos: ICO, PNG (Recomendado: 32x32 ou 16x16 pixels)</p>
                        </div>
                        {(faviconPreview || settingsData?.settings?.faviconPath) && (
                          <div className="w-24 h-24 border rounded-md overflow-hidden">
                            <img
                              src={faviconPreview || settingsData?.settings?.faviconPath}
                              alt="Favicon preview"
                              className="w-full h-full object-contain"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    <Button
                      data-testid="button-save-settings"
                      type="submit"
                      className="w-full bg-[#133903] hover:bg-[#6a9e24]"
                      disabled={updateSettingsMutation.isPending}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {updateSettingsMutation.isPending ? "Salvando..." : "Salvar Configurações"}
                    </Button>
                  </form>
                </Form>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
