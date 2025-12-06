import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { planSchema, type InsertPlan } from "@shared/schema";
import { Menu, Trash2, Plus, ClipboardList, Edit, Save } from "lucide-react";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface Plan {
  id: number;
  name: string;
  description?: string;
  imagePath?: string;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export default function Plans() {
  const { user, isLoading: authLoading } = useAuth(true);
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [deletingPlanId, setDeletingPlanId] = useState<number | null>(null);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const { data: plansData, isLoading: plansLoading } = useQuery<{ success: boolean; plans: Plan[] }>({
    queryKey: ["/api/plans"],
    enabled: !!user,
  });

  const form = useForm<InsertPlan>({
    resolver: zodResolver(planSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST" });
      toast({ title: "Logout realizado com sucesso" });
      setLocation("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const createPlanMutation = useMutation({
    mutationFn: async (data: { formData: FormData }) => {
      const response = await fetch("/api/plans", {
        method: "POST",
        body: data.formData,
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Falha ao criar plano");
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/plans"] });
      toast({ title: "Plano criado com sucesso" });
      form.reset();
      setSelectedFile(null);
      setImagePreview(null);
      const fileInput = document.getElementById("image-upload") as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    },
    onError: (error: Error) => {
      console.error("Create error:", error);
      toast({
        title: "Falha ao criar plano",
        description: error.message,
        variant: "destructive"
      });
    },
  });

  const deletePlanMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/plans/${id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Falha ao deletar plano");
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/plans"] });
      setDeletingPlanId(null);
      toast({ title: "Plano deletado com sucesso" });
    },
    onError: (error: Error) => {
      console.error("Delete error:", error);
      toast({
        title: "Falha ao deletar plano",
        description: error.message,
        variant: "destructive"
      });
    },
  });

  const updatePlanMutation = useMutation({
    mutationFn: async ({ id, formData }: { id: number; formData: FormData }) => {
      const response = await fetch(`/api/plans/${id}`, {
        method: "PUT",
        body: formData,
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Falha ao atualizar plano");
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/plans"] });
      setEditingPlan(null);
      setSelectedFile(null);
      setImagePreview(null);
      toast({ title: "Plano atualizado com sucesso" });
    },
    onError: (error: Error) => {
      console.error("Update error:", error);
      toast({
        title: "Falha ao atualizar plano",
        description: error.message,
        variant: "destructive"
      });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = (data: InsertPlan) => {
    const formData = new FormData();
    formData.append("name", data.name);
    if (data.description) formData.append("description", data.description);
    if (selectedFile) formData.append("image", selectedFile);

    createPlanMutation.mutate({ formData });
  };

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
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
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Planos</h1>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Criar Novo Plano
                </CardTitle>
                <CardDescription>
                  Preencha os dados do plano
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome do Plano</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Plano Família" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descrição</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Descrição do plano"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div>
                      <label className="block text-sm font-medium mb-2">Imagem do Plano</label>
                      <Input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                    </div>

                    {imagePreview && (
                      <div className="border rounded-lg p-4">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="max-h-48 mx-auto rounded"
                        />
                      </div>
                    )}

                    <Button
                      type="submit"
                      disabled={createPlanMutation.isPending}
                      className="w-full sm:w-auto bg-[#133903] hover:bg-[#6a9e24]"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      {createPlanMutation.isPending ? "Criando..." : "Criar Plano"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="w-5 h-5" />
                  Planos Cadastrados
                </CardTitle>
                <CardDescription>
                  Gerencie seus planos
                </CardDescription>
              </CardHeader>
              <CardContent>
                {plansLoading ? (
                  <div className="text-center py-8 text-gray-500">Carregando...</div>
                ) : plansData?.plans && plansData.plans.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {plansData.plans.map((plan) => (
                      <div
                        key={plan.id}
                        className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                      >
                        {plan.imagePath && (
                          <img
                            src={plan.imagePath}
                            alt={plan.name}
                            className="w-full h-40 object-cover"
                          />
                        )}
                        <div className="p-4">
                          <h3 className="font-semibold text-lg mb-2">{plan.name}</h3>
                          {plan.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                              {plan.description}
                            </p>
                          )}
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1"
                              onClick={() => setEditingPlan(plan)}
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              Editar
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="flex-1"
                              onClick={() => setDeletingPlanId(plan.id)}
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Excluir
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Nenhum plano cadastrado ainda
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      <Dialog open={editingPlan !== null} onOpenChange={() => {
        setEditingPlan(null);
        setSelectedFile(null);
        setImagePreview(null);
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Plano</DialogTitle>
            <DialogDescription>
              Atualize as informações do plano
            </DialogDescription>
          </DialogHeader>
          {editingPlan && (
            <EditPlanForm
              plan={editingPlan}
              onSubmit={(formData) => {
                updatePlanMutation.mutate({ id: editingPlan.id, formData });
              }}
              isLoading={updatePlanMutation.isPending}
              selectedFile={selectedFile}
              setSelectedFile={setSelectedFile}
              imagePreview={imagePreview}
              setImagePreview={setImagePreview}
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={deletingPlanId !== null} onOpenChange={() => setDeletingPlanId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este plano? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deletingPlanId) {
                  deletePlanMutation.mutate(deletingPlanId);
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

function EditPlanForm({
  plan,
  onSubmit,
  isLoading,
  selectedFile,
  setSelectedFile,
  imagePreview,
  setImagePreview
}: {
  plan: Plan;
  onSubmit: (formData: FormData) => void;
  isLoading: boolean;
  selectedFile: File | null;
  setSelectedFile: (file: File | null) => void;
  imagePreview: string | null;
  setImagePreview: (preview: string | null) => void;
}) {
  const form = useForm<InsertPlan>({
    resolver: zodResolver(planSchema),
    defaultValues: {
      name: plan.name,
      description: plan.description || "",
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (data: InsertPlan) => {
    const formData = new FormData();
    formData.append("name", data.name);
    if (data.description) formData.append("description", data.description);
    if (selectedFile) formData.append("image", selectedFile);

    onSubmit(formData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do Plano</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Plano Família" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Descrição do plano"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <FormLabel>Imagem do Plano</FormLabel>
          <Input
            id="edit-image-upload"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
          />
          <p className="text-xs text-gray-500">Deixe em branco para manter a imagem atual</p>
          {(imagePreview || plan.imagePath) && (
            <div className="mt-2 border rounded-md overflow-hidden w-full h-48">
              <img
                src={imagePreview || plan.imagePath}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>

        <Button
          type="submit"
          className="w-full bg-[#133903] hover:bg-[#6a9e24]"
          disabled={isLoading}
        >
          <Save className="w-4 h-4 mr-2" />
          {isLoading ? "Salvando..." : "Salvar Alterações"}
        </Button>
      </form>
    </Form>
  );
}
