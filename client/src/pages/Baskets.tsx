import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { basketSchema, type InsertBasket } from "@shared/schema";
import { LogOut, Menu, X, Users, Settings, Phone, Image, Images, MessageSquare, MapPin, HelpCircle, Calendar, Table, Trash2, Plus, Package, ShoppingBasket, Edit, Save } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface Basket {
  id: number;
  name: string;
  description?: string;
  priceLoose?: string;
  priceSubscription?: string;
  imagePath?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface LooseItem {
  id: number;
  name: string;
  category: string;
}

interface BasketItem {
  id: number;
  basketId: number;
  looseItemId: number;
  quantity: number;
}

export default function Baskets() {
  const { user, isLoading: authLoading } = useAuth(true);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [deletingBasketId, setDeletingBasketId] = useState<number | null>(null);
  const [editingBasket, setEditingBasket] = useState<Basket | null>(null);
  const [managingBasketId, setManagingBasketId] = useState<number | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const { data: basketsData, isLoading: basketsLoading } = useQuery<{ success: boolean; baskets: Basket[] }>({
    queryKey: ["/api/baskets/all"],
    enabled: !!user,
  });

  const { data: looseItemsData } = useQuery<{ success: boolean; items: LooseItem[] }>({
    queryKey: ["/api/loose-items/all"],
    enabled: !!user && managingBasketId !== null,
  });

  const { data: basketDetailsData } = useQuery<{ success: boolean; basket: Basket; items: BasketItem[] }>({
    queryKey: [`/api/baskets/${managingBasketId}`],
    enabled: !!user && managingBasketId !== null,
  });

  const form = useForm<InsertBasket>({
    resolver: zodResolver(basketSchema),
    defaultValues: {
      name: "",
      description: "",
      priceLoose: "",
      priceSubscription: "",
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/logout", { method: "POST" });
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Logged out successfully" });
      setLocation("/login");
    },
  });

  const createBasketMutation = useMutation({
    mutationFn: async (data: { formData: FormData }) => {
      const response = await fetch("/api/baskets", {
        method: "POST",
        body: data.formData,
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Failed to create basket");
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/baskets/all"] });
      toast({ title: "Cesta criada com sucesso" });
      form.reset();
      setSelectedFile(null);
      setImagePreview(null);
      const fileInput = document.getElementById("image-upload") as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    },
    onError: (error: Error) => {
      console.error("Create error:", error);
      toast({
        title: "Falha ao criar cesta",
        description: error.message,
        variant: "destructive"
      });
    },
  });

  const deleteBasketMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/baskets/${id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to delete basket");
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/baskets/all"] });
      setDeletingBasketId(null);
      toast({ title: "Cesta deletada com sucesso" });
    },
    onError: (error: Error) => {
      console.error("Delete error:", error);
      toast({
        title: "Falha ao deletar cesta",
        description: error.message,
        variant: "destructive"
      });
    },
  });

  const addItemMutation = useMutation({
    mutationFn: async ({ basketId, looseItemId, quantity }: { basketId: number; looseItemId: number; quantity: number }) => {
      const response = await fetch(`/api/baskets/${basketId}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ looseItemId, quantity }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to add item");
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/baskets/${managingBasketId}`] });
      toast({ title: "Item adicionado à cesta" });
    },
    onError: (error: Error) => {
      toast({
        title: "Falha ao adicionar item",
        description: error.message,
        variant: "destructive"
      });
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: async (itemId: number) => {
      const response = await fetch(`/api/basket-items/${itemId}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to remove item");
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/baskets/${managingBasketId}`] });
      toast({ title: "Item removido da cesta" });
    },
    onError: (error: Error) => {
      toast({
        title: "Falha ao remover item",
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

  const onSubmit = (data: InsertBasket) => {
    const formData = new FormData();
    formData.append("name", data.name);
    if (data.description) formData.append("description", data.description);
    if (data.priceLoose) formData.append("priceLoose", data.priceLoose);
    if (data.priceSubscription) formData.append("priceSubscription", data.priceSubscription);
    if (selectedFile) formData.append("image", selectedFile);

    createBasketMutation.mutate({ formData });
  };

  const handleAddItem = (looseItemId: number) => {
    if (managingBasketId) {
      addItemMutation.mutate({ basketId: managingBasketId, looseItemId, quantity: 1 });
    }
  };

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const getItemName = (itemId: number) => {
    const item = looseItemsData?.items.find(i => i.id === itemId);
    return item ? `${item.name} (${item.category})` : "Item desconhecido";
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:z-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-[#79B42A]">ZATPLANT</h2>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          <nav className="flex-1 p-4">
            <div className="space-y-1">
              <button
                className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => setLocation("/dashboard")}
              >
                <Users className="w-5 h-5" />
                Usuários
              </button>
              <button
                className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => setLocation("/dashboard/site-settings")}
              >
                <Settings className="w-5 h-5" />
                Configurações do Site
              </button>
              <button
                className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => setLocation("/dashboard/contact-info")}
              >
                <Phone className="w-5 h-5" />
                Contatos
              </button>
              <button
                className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => setLocation("/dashboard/banners")}
              >
                <Image className="w-5 h-5" />
                Banners
              </button>
              <button
                className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => setLocation("/dashboard/gallery")}
              >
                <Images className="w-5 h-5" />
                Galeria
              </button>
              <button
                className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => setLocation("/dashboard/testimonials")}
              >
                <MessageSquare className="w-5 h-5" />
                Depoimentos
              </button>
              <button
                className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => setLocation("/dashboard/regions")}
              >
                <MapPin className="w-5 h-5" />
                Regiões de Atendimento
              </button>
              <button
                className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => setLocation("/dashboard/faq")}
              >
                <HelpCircle className="w-5 h-5" />
                FAQ
              </button>
              <button
                className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => setLocation("/dashboard/seasonal-calendar")}
              >
                <Calendar className="w-5 h-5" />
                Calendário Sazonal
              </button>
              <button
                className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => setLocation("/dashboard/comparative-table")}
              >
                <Table className="w-5 h-5" />
                Tabela Comparativa
              </button>
              <button
                className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => setLocation("/dashboard/loose-items")}
              >
                <Package className="w-5 h-5" />
                Itens Avulsos
              </button>
              <button
                className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md bg-[#79B42A] text-white"
              >
                <ShoppingBasket className="w-5 h-5" />
                Cestas
              </button>
            </div>
          </nav>

          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-[#79B42A] flex items-center justify-center text-white font-semibold">
                {user?.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
              </div>
            </div>
            <Button
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
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Cestas</h1>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Add Basket Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Criar Nova Cesta
                </CardTitle>
                <CardDescription>
                  Preencha os dados da cesta
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
                          <FormLabel>Nome da Cesta</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Cesta Básica" {...field} />
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
                              placeholder="Descrição da cesta"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="priceLoose"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Valor Avulso</FormLabel>
                            <FormControl>
                              <Input placeholder="R$ 0,00" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="priceSubscription"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Valor Assinatura</FormLabel>
                            <FormControl>
                              <Input placeholder="R$ 0,00" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Imagem da Cesta</label>
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
                      disabled={createBasketMutation.isPending}
                      className="w-full sm:w-auto bg-[#79B42A] hover:bg-[#6a9e24]"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      {createBasketMutation.isPending ? "Criando..." : "Criar Cesta"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            {/* Baskets List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingBasket className="w-5 h-5" />
                  Cestas Cadastradas
                </CardTitle>
                <CardDescription>
                  Gerencie suas cestas
                </CardDescription>
              </CardHeader>
              <CardContent>
                {basketsLoading ? (
                  <div className="text-center py-8 text-gray-500">Carregando...</div>
                ) : basketsData?.baskets && basketsData.baskets.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {basketsData.baskets.map((basket) => (
                      <div
                        key={basket.id}
                        className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                      >
                        {basket.imagePath && (
                          <img
                            src={basket.imagePath}
                            alt={basket.name}
                            className="w-full h-40 object-cover"
                          />
                        )}
                        <div className="p-4">
                          <h3 className="font-semibold text-lg mb-2">{basket.name}</h3>
                          {basket.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                              {basket.description}
                            </p>
                          )}
                          <div className="space-y-1 text-sm mb-4">
                            {basket.priceLoose && (
                              <p>
                                <span className="font-medium">Avulso:</span> {basket.priceLoose}
                              </p>
                            )}
                            {basket.priceSubscription && (
                              <p>
                                <span className="font-medium">Assinatura:</span> {basket.priceSubscription}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1"
                              onClick={() => setManagingBasketId(basket.id)}
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              Gerenciar Itens
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => setDeletingBasketId(basket.id)}
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
                    Nenhuma cesta cadastrada ainda
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* Manage Basket Items Dialog */}
      <Dialog open={managingBasketId !== null} onOpenChange={() => setManagingBasketId(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Gerenciar Itens da Cesta</DialogTitle>
            <DialogDescription>
              Adicione ou remova itens desta cesta
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Current Items */}
            <div>
              <h3 className="font-semibold mb-2">Itens na Cesta</h3>
              {basketDetailsData?.items && basketDetailsData.items.length > 0 ? (
                <div className="space-y-2">
                  {basketDetailsData.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{getItemName(item.looseItemId)}</p>
                        <p className="text-sm text-gray-500">Quantidade: {item.quantity}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeItemMutation.mutate(item.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">Nenhum item adicionado ainda</p>
              )}
            </div>

            {/* Available Items */}
            <div>
              <h3 className="font-semibold mb-2">Adicionar Itens</h3>
              {looseItemsData?.items && looseItemsData.items.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {looseItemsData.items.map((item) => {
                    const isAdded = basketDetailsData?.items.some(bi => bi.looseItemId === item.id);
                    return (
                      <Button
                        key={item.id}
                        size="sm"
                        variant="outline"
                        disabled={isAdded || addItemMutation.isPending}
                        onClick={() => handleAddItem(item.id)}
                        className="justify-start"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        {item.name} ({item.category})
                      </Button>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-gray-500">Nenhum item disponível</p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deletingBasketId !== null} onOpenChange={() => setDeletingBasketId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta cesta? Todos os itens associados também serão removidos. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deletingBasketId) {
                  deleteBasketMutation.mutate(deletingBasketId);
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
