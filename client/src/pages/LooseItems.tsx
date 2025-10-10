import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { looseItemSchema, type InsertLooseItem } from "@shared/schema";
import { Menu, Trash2, Plus, Package } from "lucide-react";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface LooseItem {
  id: number;
  name: string;
  category: "Frutas" | "Legumes" | "Verduras" | "Temperos";
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const categories = ["Frutas", "Legumes", "Verduras", "Temperos"] as const;

export default function LooseItems() {
  const { user, isLoading: authLoading } = useAuth(true);
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [deletingItemId, setDeletingItemId] = useState<number | null>(null);

  const { data: itemsData, isLoading: itemsLoading } = useQuery<{ success: boolean; items: LooseItem[] }>({
    queryKey: ["/api/loose-items/all"],
    enabled: !!user,
  });

  const form = useForm<InsertLooseItem>({
    resolver: zodResolver(looseItemSchema),
    defaultValues: {
      name: "",
      category: "Frutas",
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

  const createItemMutation = useMutation({
    mutationFn: async (data: InsertLooseItem) => {
      const response = await fetch("/api/loose-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Failed to create item");
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/loose-items/all"] });
      toast({ title: "Item adicionado com sucesso" });
      form.reset();
    },
    onError: (error: Error) => {
      console.error("Create error:", error);
      toast({
        title: "Falha ao adicionar item",
        description: error.message,
        variant: "destructive"
      });
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/loose-items/${id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to delete item");
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/loose-items/all"] });
      setDeletingItemId(null);
      toast({ title: "Item deletado com sucesso" });
    },
    onError: (error: Error) => {
      console.error("Delete error:", error);
      toast({
        title: "Falha ao deletar item",
        description: error.message,
        variant: "destructive"
      });
    },
  });

  const onSubmit = (data: InsertLooseItem) => {
    createItemMutation.mutate(data);
  };

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const groupedItems = itemsData?.items.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, LooseItem[]>);

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
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Itens Avulsos</h1>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Add Item Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Adicionar Item
                </CardTitle>
                <CardDescription>
                  Adicione um novo item avulso com nome e categoria
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
                          <FormLabel>Nome do Item</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Tomate" {...field} />
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
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione uma categoria" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories.map((category) => (
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

                    <Button
                      type="submit"
                      disabled={createItemMutation.isPending}
                      className="w-full sm:w-auto bg-[#133903] hover:bg-[#6a9e24]"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      {createItemMutation.isPending ? "Adicionando..." : "Adicionar Item"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            {/* Items List by Category */}
            {itemsLoading ? (
              <Card>
                <CardContent className="py-8">
                  <div className="text-center text-gray-500">Carregando...</div>
                </CardContent>
              </Card>
            ) : groupedItems && Object.keys(groupedItems).length > 0 ? (
              categories.map((category) => {
                const items = groupedItems[category] || [];
                if (items.length === 0) return null;

                return (
                  <Card key={category}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Package className="w-5 h-5" />
                        {category}
                      </CardTitle>
                      <CardDescription>
                        {items.length} {items.length === 1 ? "item" : "itens"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {items.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                          >
                            <span className="text-sm font-medium">{item.name}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeletingItemId(item.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <Card>
                <CardContent className="py-8">
                  <div className="text-center text-gray-500">
                    Nenhum item cadastrado ainda
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deletingItemId !== null} onOpenChange={() => setDeletingItemId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este item? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deletingItemId) {
                  deleteItemMutation.mutate(deletingItemId);
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
