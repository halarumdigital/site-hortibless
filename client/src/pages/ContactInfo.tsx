import { useAuth } from "@/hooks/useAuth";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contactInfoSchema, type UpdateContactInfo } from "@shared/schema";
import { Phone, Menu, Mail, MapPin, Save } from "lucide-react";
import { FaWhatsapp, FaInstagram, FaFacebook, FaTiktok, FaLinkedin } from "react-icons/fa";
import { DashboardSidebar } from "@/components/DashboardSidebar";

interface ContactInfo {
  id: number;
  whatsapp?: string;
  email?: string;
  address?: string;
  instagram?: string;
  facebook?: string;
  tiktok?: string;
  linkedin?: string;
  createdAt: Date;
  updatedAt: Date;
}

export default function ContactInfo() {
  const { user, isLoading: authLoading } = useAuth(true);
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const { data: contactData, isLoading: contactLoading } = useQuery<{ success: boolean; info: ContactInfo }>({
    queryKey: ["/api/contact-info"],
    enabled: !!user,
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const logoutMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/logout");
    },
    onSuccess: () => {
      toast({ title: "Logged out successfully" });
      setLocation("/login");
    },
  });

  const updateContactMutation = useMutation({
    mutationFn: async (data: UpdateContactInfo) => {
      return await apiRequest("POST", "/api/contact-info", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contact-info"] });
      toast({ title: "Contact info updated successfully" });
    },
    onError: (error: Error) => {
      console.error("Update error:", error);
      toast({
        title: "Failed to update contact info",
        description: error.message,
        variant: "destructive"
      });
    },
  });

  const form = useForm<UpdateContactInfo>({
    resolver: zodResolver(contactInfoSchema),
    defaultValues: {
      whatsapp: contactData?.info?.whatsapp || "",
      email: contactData?.info?.email || "",
      address: contactData?.info?.address || "",
      instagram: contactData?.info?.instagram || "",
      facebook: contactData?.info?.facebook || "",
      tiktok: contactData?.info?.tiktok || "",
      linkedin: contactData?.info?.linkedin || "",
    },
    values: {
      whatsapp: contactData?.info?.whatsapp || "",
      email: contactData?.info?.email || "",
      address: contactData?.info?.address || "",
      instagram: contactData?.info?.instagram || "",
      facebook: contactData?.info?.facebook || "",
      tiktok: contactData?.info?.tiktok || "",
      linkedin: contactData?.info?.linkedin || "",
    },
  });

  const onSubmit = async (data: UpdateContactInfo) => {
    updateContactMutation.mutate(data);
  };

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      <DashboardSidebar
        user={user}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        onLogout={handleLogout}
        currentPath={location}
      />

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
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Informações de Contato</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Gerencie as informações de contato e redes sociais</p>
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
                    <Phone className="w-5 h-5" />
                    Dados de Contato
                  </CardTitle>
                  <CardDescription>Atualize as informações de contato e redes sociais</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {contactLoading ? (
                <div className="text-center py-8">Carregando informações...</div>
              ) : (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="whatsapp"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <FaWhatsapp className="text-green-600" />
                              WhatsApp
                            </FormLabel>
                            <FormControl>
                              <Input
                                data-testid="input-whatsapp"
                                placeholder="+55 11 99999-9999"
                                {...field}
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Mail className="w-4 h-4" />
                              E-mail
                            </FormLabel>
                            <FormControl>
                              <Input
                                data-testid="input-email"
                                type="email"
                                placeholder="contato@exemplo.com"
                                {...field}
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            Endereço
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              data-testid="input-address"
                              placeholder="Rua exemplo, 123 - Bairro - Cidade/Estado"
                              rows={3}
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="border-t pt-6">
                      <h3 className="text-lg font-semibold mb-4">Redes Sociais</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="instagram"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2">
                                <FaInstagram className="text-pink-600" />
                                Instagram
                              </FormLabel>
                              <FormControl>
                                <Input
                                  data-testid="input-instagram"
                                  placeholder="@usuario"
                                  {...field}
                                  value={field.value || ""}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="facebook"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2">
                                <FaFacebook className="text-blue-600" />
                                Facebook
                              </FormLabel>
                              <FormControl>
                                <Input
                                  data-testid="input-facebook"
                                  placeholder="https://facebook.com/..."
                                  {...field}
                                  value={field.value || ""}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="tiktok"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2">
                                <FaTiktok className="text-black dark:text-white" />
                                TikTok
                              </FormLabel>
                              <FormControl>
                                <Input
                                  data-testid="input-tiktok"
                                  placeholder="@usuario"
                                  {...field}
                                  value={field.value || ""}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="linkedin"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2">
                                <FaLinkedin className="text-blue-700" />
                                LinkedIn
                              </FormLabel>
                              <FormControl>
                                <Input
                                  data-testid="input-linkedin"
                                  placeholder="https://linkedin.com/in/..."
                                  {...field}
                                  value={field.value || ""}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <Button
                      data-testid="button-save-contact"
                      type="submit"
                      className="w-full bg-[#133903] hover:bg-[#6a9e24]"
                      disabled={updateContactMutation.isPending}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {updateContactMutation.isPending ? "Salvando..." : "Salvar Informações"}
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
