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
import { serviceRegionSchema, type InsertServiceRegion } from "@shared/schema";
import { MapPin, Menu, Trash2, Plus } from "lucide-react";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface ServiceRegion {
  id: number;
  name: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export default function Regions() {
  const { user, isLoading: authLoading } = useAuth(true);
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [deletingRegionId, setDeletingRegionId] = useState<number | null>(null);

  const { data: regionsData, isLoading: regionsLoading } = useQuery<{ success: boolean; regions: ServiceRegion[] }>({
    queryKey: ["/api/service-regions/all"],
    enabled: !!user,
  });

  const form = useForm<InsertServiceRegion>({
    resolver: zodResolver(serviceRegionSchema),
    defaultValues: {
      name: "",
      isActive: true,
    },
  });

  const handleLogout = async () => {
    try {
      await apiRequest("POST", "/api/logout");
      toast({ title: "Logged out successfully" });
      setLocation("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const createRegionMutation = useMutation({
    mutationFn: async (data: InsertServiceRegion) => {
      return await apiRequest("POST", "/api/service-regions", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/service-regions/all"] });
      toast({ title: "Region created successfully" });
      form.reset();
    },
    onError: (error: Error) => {
      console.error("Create error:", error);
      toast({
        title: "Failed to create region",
        description: error.message,
        variant: "destructive"
      });
    },
  });

  const deleteRegionMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/service-regions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/service-regions/all"] });
      setDeletingRegionId(null);
      toast({ title: "Region deleted successfully" });
    },
    onError: (error: Error) => {
      console.error("Delete error:", error);
      toast({
        title: "Failed to delete region",
        description: error.message,
        variant: "destructive"
      });
    },
  });

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
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-4">
              <Button
                data-testid="button-open-sidebar"
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setIsSidebarOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </Button>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Regiões de Atendimento</h1>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Add Region Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Adicionar Nova Região
                </CardTitle>
                <CardDescription>
                  Adicione uma região de atendimento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit((data) => createRegionMutation.mutate(data))} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome da Região</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Ex: São Paulo - SP"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      disabled={createRegionMutation.isPending}
                      className="w-full sm:w-auto bg-[#133903] hover:bg-[#6a9e24]"
                    >
                      {createRegionMutation.isPending ? "Salvando..." : "Adicionar Região"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            {/* Regions List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Regiões Cadastradas
                </CardTitle>
                <CardDescription>
                  Lista de todas as regiões de atendimento
                </CardDescription>
              </CardHeader>
              <CardContent>
                {regionsLoading ? (
                  <div className="text-center py-8 text-gray-500">Carregando...</div>
                ) : regionsData?.regions && regionsData.regions.length > 0 ? (
                  <div className="space-y-2">
                    {regionsData.regions.map((region) => (
                      <div
                        key={region.id}
                        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                      >
                        <div className="flex items-center gap-3">
                          <MapPin className="w-5 h-5 text-[#133903]" />
                          <span className="font-medium text-gray-900 dark:text-white">
                            {region.name}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeletingRegionId(region.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Nenhuma região cadastrada ainda
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deletingRegionId !== null} onOpenChange={() => setDeletingRegionId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta região? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deletingRegionId) {
                  deleteRegionMutation.mutate(deletingRegionId);
                }
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
