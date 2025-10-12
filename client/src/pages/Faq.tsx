import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { faqSchema, type InsertFaq } from "@shared/schema";
import { Menu, HelpCircle, Trash2, Plus, Edit as EditIcon } from "lucide-react";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Faq {
  id: number;
  question: string;
  answer: string;
  category: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const FAQ_CATEGORIES = [
  "GERAL",
  "CESTAS E PRODUTOS",
  "ASSINATURAS",
  "PAGAMENTOS",
  "ATENDIMENTO EMPRESARIAL (B2B)",
  "ENTREGAS",
];

export default function Faq() {
  const { user, isLoading: authLoading } = useAuth(true);
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [deletingFaqId, setDeletingFaqId] = useState<number | null>(null);
  const [editingFaq, setEditingFaq] = useState<Faq | null>(null);

  const { data: faqsData, isLoading: faqsLoading } = useQuery<{ success: boolean; faqs: Faq[] }>({
    queryKey: ["/api/faqs/all"],
    enabled: !!user,
  });

  const form = useForm<InsertFaq>({
    resolver: zodResolver(faqSchema),
    defaultValues: {
      question: "",
      answer: "",
      category: "GERAL",
      isActive: true,
    },
  });

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST" });
      toast({ title: "Logged out successfully" });
      setLocation("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const createFaqMutation = useMutation({
    mutationFn: async (data: InsertFaq) => {
      return await apiRequest("POST", "/api/faqs", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/faqs/all"] });
      toast({ title: "FAQ criada com sucesso" });
      form.reset({ question: "", answer: "", category: "GERAL", isActive: true });
    },
    onError: (error: Error) => {
      console.error("Create error:", error);
      toast({
        title: "Falha ao criar FAQ",
        description: error.message,
        variant: "destructive"
      });
    },
  });

  const updateFaqMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertFaq> }) => {
      return await apiRequest("PUT", `/api/faqs/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/faqs/all"] });
      toast({ title: "FAQ atualizada com sucesso" });
      setEditingFaq(null);
      form.reset({ question: "", answer: "", category: "GERAL", isActive: true });
    },
    onError: (error: Error) => {
      console.error("Update error:", error);
      toast({
        title: "Falha ao atualizar FAQ",
        description: error.message,
        variant: "destructive"
      });
    },
  });

  const deleteFaqMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/faqs/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/faqs/all"] });
      setDeletingFaqId(null);
      toast({ title: "FAQ deleted successfully" });
    },
    onError: (error: Error) => {
      console.error("Delete error:", error);
      toast({
        title: "Failed to delete FAQ",
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
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">FAQ</h1>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Add/Edit FAQ Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {editingFaq ? <EditIcon className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                  {editingFaq ? "Editar Pergunta" : "Adicionar Nova Pergunta"}
                </CardTitle>
                <CardDescription>
                  {editingFaq ? "Edite a pergunta e resposta" : "Adicione perguntas frequentes e suas respostas"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit((data) => {
                    if (editingFaq) {
                      updateFaqMutation.mutate({ id: editingFaq.id, data });
                    } else {
                      createFaqMutation.mutate(data);
                    }
                  })} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="question"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pergunta</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Digite a pergunta..."
                              rows={2}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="answer"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Resposta</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Digite a resposta..."
                              rows={4}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Categoria</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione uma categoria" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {FAQ_CATEGORIES.map((category) => (
                                <SelectItem key={category} value={category}>
                                  {category}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex gap-2">
                      <Button
                        type="submit"
                        disabled={createFaqMutation.isPending || updateFaqMutation.isPending}
                        className="bg-[#133903] hover:bg-[#6a9e24]"
                      >
                        {editingFaq
                          ? (updateFaqMutation.isPending ? "Atualizando..." : "Atualizar FAQ")
                          : (createFaqMutation.isPending ? "Salvando..." : "Adicionar FAQ")
                        }
                      </Button>
                      {editingFaq && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setEditingFaq(null);
                            form.reset({ question: "", answer: "", category: "GERAL", isActive: true });
                          }}
                        >
                          Cancelar
                        </Button>
                      )}
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>

            {/* FAQs List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5" />
                  Perguntas Cadastradas
                </CardTitle>
                <CardDescription>
                  Lista de todas as perguntas frequentes
                </CardDescription>
              </CardHeader>
              <CardContent>
                {faqsLoading ? (
                  <div className="text-center py-8 text-gray-500">Carregando...</div>
                ) : faqsData?.faqs && faqsData.faqs.length > 0 ? (
                  <div className="space-y-4">
                    {faqsData.faqs.map((faq) => (
                      <div
                        key={faq.id}
                        className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                      >
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-start gap-2">
                              <HelpCircle className="w-5 h-5 text-[#133903] mt-0.5 flex-shrink-0" />
                              <div className="flex-1">
                                <p className="font-semibold text-gray-900 dark:text-white">
                                  {faq.question}
                                </p>
                                <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-[#133903] text-white rounded">
                                  {faq.category}
                                </span>
                              </div>
                            </div>
                            <p className="text-gray-600 dark:text-gray-300 pl-7">
                              {faq.answer}
                            </p>
                          </div>
                          <div className="flex gap-2 flex-shrink-0">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingFaq(faq);
                                form.reset({
                                  question: faq.question,
                                  answer: faq.answer,
                                  category: faq.category,
                                  isActive: faq.isActive,
                                });
                              }}
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            >
                              <EditIcon className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeletingFaqId(faq.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Nenhuma pergunta cadastrada ainda
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deletingFaqId !== null} onOpenChange={() => setDeletingFaqId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta pergunta? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deletingFaqId) {
                  deleteFaqMutation.mutate(deletingFaqId);
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
