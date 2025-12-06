import { useAuth } from "@/hooks/useAuth";
import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Info, Menu, Upload, Trash2, Image as ImageIcon } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { DashboardSidebar } from "@/components/DashboardSidebar";

interface AboutUs {
  id: number;
  image1Path: string | null;
  image2Path: string | null;
  image3Path: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export default function AboutUs() {
  const { user, isLoading: authLoading } = useAuth(true);
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [deletingImage, setDeletingImage] = useState<number | null>(null);

  const fileInput1Ref = useRef<HTMLInputElement>(null);
  const fileInput2Ref = useRef<HTMLInputElement>(null);
  const fileInput3Ref = useRef<HTMLInputElement>(null);

  const { data: aboutUsData, isLoading } = useQuery<{ success: boolean; aboutUs: AboutUs | null }>({
    queryKey: ["/api/about-us"],
    enabled: !!user,
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

  const uploadImageMutation = useMutation({
    mutationFn: async ({ imageNumber, file }: { imageNumber: number; file: File }) => {
      const formData = new FormData();
      formData.append(`image${imageNumber}`, file);

      const response = await fetch("/api/about-us", {
        method: "PUT",
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to upload image");
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/about-us"] });
      toast({ title: "Imagem enviada com sucesso" });
    },
    onError: (error: Error) => {
      console.error("Upload error:", error);
      toast({
        title: "Falha ao enviar imagem",
        description: error.message,
        variant: "destructive"
      });
    },
  });

  const deleteImageMutation = useMutation({
    mutationFn: async (imageNumber: number) => {
      const response = await fetch(`/api/about-us/image/${imageNumber}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to delete image");
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/about-us"] });
      setDeletingImage(null);
      toast({ title: "Imagem removida com sucesso" });
    },
    onError: (error: Error) => {
      console.error("Delete error:", error);
      toast({
        title: "Falha ao remover imagem",
        description: error.message,
        variant: "destructive"
      });
    },
  });

  const handleFileChange = (imageNumber: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadImageMutation.mutate({ imageNumber, file });
    }
  };

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const aboutUs = aboutUsData?.aboutUs;
  const images = [
    { number: 1, path: aboutUs?.image1Path, ref: fileInput1Ref },
    { number: 2, path: aboutUs?.image2Path, ref: fileInput2Ref },
    { number: 3, path: aboutUs?.image3Path, ref: fileInput3Ref },
  ];

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
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Sobre Nós</h1>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-4xl mx-auto space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="w-5 h-5" />
                  Imagens da Seção "Sobre Nós"
                </CardTitle>
                <CardDescription>
                  Faça upload de até 3 imagens que serão exibidas na seção "Sobre Nós" do site
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8 text-gray-500">Carregando...</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {images.map((image) => (
                      <div key={image.number} className="space-y-3">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Imagem {image.number}
                        </p>

                        <div className="relative aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden border-2 border-dashed border-gray-300 dark:border-gray-600">
                          {image.path ? (
                            <>
                              <img
                                src={image.path}
                                alt={`Sobre Nós - Imagem ${image.number}`}
                                className="w-full h-full object-cover"
                              />
                              <Button
                                variant="destructive"
                                size="sm"
                                className="absolute top-2 right-2"
                                onClick={() => setDeletingImage(image.number)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </>
                          ) : (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400">
                              <ImageIcon className="w-12 h-12 mb-2" />
                              <span className="text-sm">Nenhuma imagem</span>
                            </div>
                          )}
                        </div>

                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          ref={image.ref}
                          onChange={(e) => handleFileChange(image.number, e)}
                        />

                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => image.ref.current?.click()}
                          disabled={uploadImageMutation.isPending}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          {image.path ? "Substituir Imagem" : "Enviar Imagem"}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deletingImage !== null} onOpenChange={() => setDeletingImage(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta imagem? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deletingImage) {
                  deleteImageMutation.mutate(deletingImage);
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
