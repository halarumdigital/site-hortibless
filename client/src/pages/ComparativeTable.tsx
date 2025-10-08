import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { LogOut, Menu, X, Users, Settings, Phone, Image, Images, MessageSquare, MapPin, HelpCircle, Calendar, Trash2, Plus, Upload, Table, Package, ShoppingBasket } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface ComparativeTableItem {
  id: number;
  imagePath: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export default function ComparativeTable() {
  const { user, isLoading: authLoading } = useAuth(true);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [deletingItemId, setDeletingItemId] = useState<number | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const { data: itemsData, isLoading: itemsLoading } = useQuery<{ success: boolean; items: ComparativeTableItem[] }>({
    queryKey: ["/api/comparative-tables/all"],
    enabled: !!user,
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

  const uploadItemMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch("/api/comparative-tables", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to upload item");
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/comparative-tables/all"] });
      toast({ title: "Tabela comparativa adicionada com sucesso" });
      setSelectedFile(null);
      setImagePreview(null);
      const fileInput = document.getElementById("image-upload") as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    },
    onError: (error: Error) => {
      console.error("Upload error:", error);
      toast({
        title: "Falha ao adicionar tabela",
        description: error.message,
        variant: "destructive"
      });
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/comparative-tables/${id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to delete item");
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/comparative-tables/all"] });
      setDeletingItemId(null);
      toast({ title: "Tabela comparativa deletada com sucesso" });
    },
    onError: (error: Error) => {
      console.error("Delete error:", error);
      toast({
        title: "Falha ao deletar tabela",
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

  const handleUpload = () => {
    if (!selectedFile) {
      toast({
        title: "Selecione uma imagem",
        variant: "destructive"
      });
      return;
    }
    uploadItemMutation.mutate(selectedFile);
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
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-[#79B42A]">ZATPLANT</h2>
            <Button
              data-testid="button-close-sidebar"
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
                data-testid="menu-users"
                className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => setLocation("/dashboard")}
              >
                <Users className="w-5 h-5" />
                Usuários
              </button>
              <button
                data-testid="menu-site-settings"
                className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => setLocation("/dashboard/site-settings")}
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
                className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md bg-[#79B42A] text-white"
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
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tabela Comparativa</h1>
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
                  Adicionar Tabela
                </CardTitle>
                <CardDescription>
                  Envie uma imagem da tabela comparativa
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Imagem</label>
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
                        className="max-h-64 mx-auto rounded"
                      />
                    </div>
                  )}

                  <Button
                    onClick={handleUpload}
                    disabled={uploadItemMutation.isPending || !selectedFile}
                    className="w-full sm:w-auto bg-[#79B42A] hover:bg-[#6a9e24]"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {uploadItemMutation.isPending ? "Enviando..." : "Adicionar Tabela"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Items Grid */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Table className="w-5 h-5" />
                  Tabelas Cadastradas
                </CardTitle>
                <CardDescription>
                  Todas as tabelas comparativas
                </CardDescription>
              </CardHeader>
              <CardContent>
                {itemsLoading ? (
                  <div className="text-center py-8 text-gray-500">Carregando...</div>
                ) : itemsData?.items && itemsData.items.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {itemsData.items.map((item) => (
                      <div
                        key={item.id}
                        className="relative group border rounded-lg overflow-hidden"
                      >
                        <img
                          src={item.imagePath}
                          alt="Comparative table"
                          className="w-full h-48 object-cover"
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => setDeletingItemId(item.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Nenhuma tabela cadastrada ainda
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deletingItemId !== null} onOpenChange={() => setDeletingItemId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta tabela? Esta ação não pode ser desfeita.
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
