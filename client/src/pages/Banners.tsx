import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Image as ImageIcon, Menu, Upload, Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { DashboardSidebar } from "@/components/DashboardSidebar";

interface Banner {
  id: number;
  imagePath: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export default function Banners() {
  const { user, isLoading: authLoading } = useAuth(true);
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [deletingBannerId, setDeletingBannerId] = useState<number | null>(null);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const { data: bannersData, isLoading: bannersLoading } = useQuery<{ success: boolean; banners: Banner[] }>({
    queryKey: ["/api/banners/all"],
    enabled: !!user,
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/logout", {
        method: "POST",
      });
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Logged out successfully" });
      setLocation("/login");
    },
  });

  const uploadBannersMutation = useMutation({
    mutationFn: async (files: FileList) => {
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append("banners", file);
      });

      const response = await fetch("/api/banners", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to upload banners");
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/banners/all"] });
      toast({ title: "Banners uploaded successfully" });
      setSelectedFiles(null);
      const fileInput = document.getElementById("banner-upload") as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    },
    onError: (error: Error) => {
      console.error("Upload error:", error);
      toast({
        title: "Failed to upload banners",
        description: error.message,
        variant: "destructive"
      });
    },
  });

  const deleteBannerMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/banners/${id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to delete banner");
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/banners/all"] });
      setDeletingBannerId(null);
      toast({ title: "Banner deleted successfully" });
    },
    onError: (error: Error) => {
      console.error("Delete error:", error);
      toast({
        title: "Failed to delete banner",
        description: error.message,
        variant: "destructive"
      });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 5) {
      toast({
        title: "Maximum 5 files allowed",
        variant: "destructive"
      });
      e.target.value = "";
      return;
    }
    setSelectedFiles(files);
  };

  const handleUpload = () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      toast({
        title: "Please select files to upload",
        variant: "destructive"
      });
      return;
    }
    uploadBannersMutation.mutate(selectedFiles);
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
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gerenciar Banners</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Adicione ou remova banners (máximo 5 imagens)</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          <div className="space-y-6">
            {/* Upload Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Adicionar Banners
                </CardTitle>
                <CardDescription>Selecione até 5 imagens (PNG, JPG, JPEG)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Input
                    id="banner-upload"
                    data-testid="input-banners"
                    type="file"
                    accept="image/png,image/jpeg,image/jpg"
                    multiple
                    onChange={handleFileChange}
                  />
                  {selectedFiles && selectedFiles.length > 0 && (
                    <p className="text-sm text-gray-600">
                      {selectedFiles.length} arquivo(s) selecionado(s)
                    </p>
                  )}
                  <Button
                    data-testid="button-upload-banners"
                    onClick={handleUpload}
                    className="w-full bg-[#133903] hover:bg-[#6a9e24]"
                    disabled={uploadBannersMutation.isPending || !selectedFiles}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {uploadBannersMutation.isPending ? "Enviando..." : "Enviar Banners"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Banners List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  Banners Atuais
                </CardTitle>
                <CardDescription>
                  {bannersData?.banners?.length || 0} de 5 banners
                </CardDescription>
              </CardHeader>
              <CardContent>
                {bannersLoading ? (
                  <div className="text-center py-8">Carregando banners...</div>
                ) : bannersData?.banners && bannersData.banners.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {bannersData.banners.map((banner) => (
                      <div
                        key={banner.id}
                        className="relative border rounded-lg overflow-hidden group"
                      >
                        <img
                          src={banner.imagePath}
                          alt={`Banner ${banner.id}`}
                          className="w-full h-48 object-cover"
                        />
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            data-testid={`button-delete-${banner.id}`}
                            variant="destructive"
                            size="sm"
                            onClick={() => setDeletingBannerId(banner.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="p-2 bg-white dark:bg-gray-800">
                          <p className="text-xs text-gray-500">Ordem: {banner.order}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Nenhum banner cadastrado. Adicione imagens acima.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      <AlertDialog open={!!deletingBannerId} onOpenChange={() => setDeletingBannerId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O banner será removido permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              data-testid="button-confirm-delete"
              onClick={() => deletingBannerId && deleteBannerMutation.mutate(deletingBannerId)}
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
