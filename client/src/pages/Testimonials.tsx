import { useAuth } from "@/hooks/useAuth";
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
import { testimonialSchema, type InsertTestimonial } from "@shared/schema";
import { MessageSquare, Menu, Trash2, Plus } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { DashboardSidebar } from "@/components/DashboardSidebar";

interface Testimonial {
  id: number;
  name: string;
  text: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export default function Testimonials() {
  const { user, isLoading: authLoading } = useAuth(true);
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [deletingTestimonialId, setDeletingTestimonialId] = useState<number | null>(null);

  const { data: testimonialsData, isLoading: testimonialsLoading } = useQuery<{ success: boolean; testimonials: Testimonial[] }>({
    queryKey: ["/api/testimonials/all"],
    enabled: !!user,
  });

  const form = useForm<InsertTestimonial>({
    resolver: zodResolver(testimonialSchema),
    defaultValues: {
      name: "",
      text: "",
      isActive: true,
    },
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

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const createTestimonialMutation = useMutation({
    mutationFn: async (data: InsertTestimonial) => {
      return await apiRequest("POST", "/api/testimonials", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/testimonials/all"] });
      toast({ title: "Testimonial created successfully" });
      form.reset();
    },
    onError: (error: Error) => {
      console.error("Create error:", error);
      toast({
        title: "Failed to create testimonial",
        description: error.message,
        variant: "destructive"
      });
    },
  });

  const deleteTestimonialMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/testimonials/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/testimonials/all"] });
      setDeletingTestimonialId(null);
      toast({ title: "Testimonial deleted successfully" });
    },
    onError: (error: Error) => {
      console.error("Delete error:", error);
      toast({
        title: "Failed to delete testimonial",
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
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Depoimentos</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Gerencie depoimentos de clientes</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          <div className="space-y-6">
            {/* Add Testimonial */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Adicionar Depoimento
                </CardTitle>
                <CardDescription>Adicione um novo depoimento de cliente</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit((data) => createTestimonialMutation.mutate(data))} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome do Cliente</FormLabel>
                          <FormControl>
                            <Input
                              data-testid="input-name"
                              placeholder="Nome completo"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="text"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Depoimento</FormLabel>
                          <FormControl>
                            <Textarea
                              data-testid="input-text"
                              placeholder="Digite o depoimento aqui..."
                              rows={5}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      data-testid="button-create-testimonial"
                      type="submit"
                      className="w-full bg-[#133903] hover:bg-[#6a9e24]"
                      disabled={createTestimonialMutation.isPending}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      {createTestimonialMutation.isPending ? "Adicionando..." : "Adicionar Depoimento"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            {/* Testimonials List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Depoimentos Cadastrados
                </CardTitle>
                <CardDescription>
                  {testimonialsData?.testimonials?.length || 0} depoimento(s)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {testimonialsLoading ? (
                  <div className="text-center py-8">Carregando depoimentos...</div>
                ) : testimonialsData?.testimonials && testimonialsData.testimonials.length > 0 ? (
                  <div className="space-y-4">
                    {testimonialsData.testimonials.map((testimonial) => (
                      <div
                        key={testimonial.id}
                        className="border rounded-lg p-4 relative hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                              {testimonial.name}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mt-2 whitespace-pre-wrap">
                              "{testimonial.text}"
                            </p>
                            <p className="text-xs text-gray-500 mt-2">
                              {new Date(testimonial.createdAt).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                          <Button
                            data-testid={`button-delete-${testimonial.id}`}
                            variant="destructive"
                            size="sm"
                            onClick={() => setDeletingTestimonialId(testimonial.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Nenhum depoimento cadastrado. Adicione o primeiro depoimento acima.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      <AlertDialog open={!!deletingTestimonialId} onOpenChange={() => setDeletingTestimonialId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O depoimento será removido permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              data-testid="button-confirm-delete"
              onClick={() => deletingTestimonialId && deleteTestimonialMutation.mutate(deletingTestimonialId)}
              className="bg-red-600 hover:bg-red-700"
            >
              Deletar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
