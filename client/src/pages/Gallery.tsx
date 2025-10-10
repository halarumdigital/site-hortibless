import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { youtubeVideoSchema, type YoutubeVideo } from "@shared/schema";
import { Image as ImageIcon, Menu, Upload, Trash2, Video } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { DashboardSidebar } from "@/components/DashboardSidebar";

interface GalleryItem {
  id: number;
  type: "image" | "video";
  path: string;
  title?: string;
  description?: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export default function Gallery() {
  const { user, isLoading: authLoading } = useAuth(true);
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [deletingItemId, setDeletingItemId] = useState<number | null>(null);

  const { data: galleryData, isLoading: galleryLoading } = useQuery<{ success: boolean; items: GalleryItem[] }>({
    queryKey: ["/api/gallery/all"],
    enabled: !!user,
  });

  const form = useForm<YoutubeVideo>({
    resolver: zodResolver(youtubeVideoSchema),
    defaultValues: {
      youtubeUrl: "",
      title: "",
      description: "",
    },
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

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const uploadImagesMutation = useMutation({
    mutationFn: async (files: FileList) => {
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append("images", file);
      });

      const response = await fetch("/api/gallery/images", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to upload images");
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/gallery/all"] });
      toast({ title: "Images uploaded successfully" });
      setSelectedFiles(null);
      const fileInput = document.getElementById("image-upload") as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    },
    onError: (error: Error) => {
      console.error("Upload error:", error);
      toast({
        title: "Failed to upload images",
        description: error.message,
        variant: "destructive"
      });
    },
  });

  const addVideoMutation = useMutation({
    mutationFn: async (data: YoutubeVideo) => {
      const response = await fetch("/api/gallery/video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Failed to add video");
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/gallery/all"] });
      toast({ title: "Video added successfully" });
      form.reset();
    },
    onError: (error: Error) => {
      console.error("Add video error:", error);
      toast({
        title: "Failed to add video",
        description: error.message,
        variant: "destructive"
      });
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/gallery/${id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to delete item");
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/gallery/all"] });
      setDeletingItemId(null);
      toast({ title: "Item deleted successfully" });
    },
    onError: (error: Error) => {
      console.error("Delete error:", error);
      toast({
        title: "Failed to delete item",
        description: error.message,
        variant: "destructive"
      });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFiles(e.target.files);
  };

  const handleUploadImages = () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      toast({
        title: "Please select files to upload",
        variant: "destructive"
      });
      return;
    }
    uploadImagesMutation.mutate(selectedFiles);
  };

  const getYoutubeEmbedUrl = (url: string) => {
    let videoId = "";
    if (url.includes("youtube.com")) {
      const urlObj = new URL(url);
      videoId = urlObj.searchParams.get("v") || "";
    } else if (url.includes("youtu.be")) {
      videoId = url.split("/").pop()?.split("?")[0] || "";
    }
    return `https://www.youtube.com/embed/${videoId}`;
  };

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const images = galleryData?.items?.filter(item => item.type === "image") || [];
  const videos = galleryData?.items?.filter(item => item.type === "video") || [];

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
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Galeria</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Gerencie imagens e vídeos do YouTube</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          <Tabs defaultValue="images" className="space-y-6">
            <TabsList>
              <TabsTrigger value="images">
                <ImageIcon className="w-4 h-4 mr-2" />
                Imagens
              </TabsTrigger>
              <TabsTrigger value="videos">
                <Video className="w-4 h-4 mr-2" />
                Vídeos
              </TabsTrigger>
            </TabsList>

            <TabsContent value="images" className="space-y-6">
              {/* Upload Images */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="w-5 h-5" />
                    Adicionar Imagens
                  </CardTitle>
                  <CardDescription>Selecione múltiplas imagens (PNG, JPG, JPEG)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Input
                      id="image-upload"
                      data-testid="input-images"
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
                      data-testid="button-upload-images"
                      onClick={handleUploadImages}
                      className="w-full bg-[#133903] hover:bg-[#6a9e24]"
                      disabled={uploadImagesMutation.isPending || !selectedFiles}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {uploadImagesMutation.isPending ? "Enviando..." : "Enviar Imagens"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Images List */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="w-5 h-5" />
                    Imagens da Galeria
                  </CardTitle>
                  <CardDescription>{images.length} imagem(ns)</CardDescription>
                </CardHeader>
                <CardContent>
                  {galleryLoading ? (
                    <div className="text-center py-8">Carregando galeria...</div>
                  ) : images.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {images.map((item) => (
                        <div
                          key={item.id}
                          className="relative border rounded-lg overflow-hidden group"
                        >
                          <img
                            src={item.path}
                            alt={item.title || `Image ${item.id}`}
                            className="w-full h-48 object-cover"
                          />
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              data-testid={`button-delete-${item.id}`}
                              variant="destructive"
                              size="sm"
                              onClick={() => setDeletingItemId(item.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      Nenhuma imagem na galeria. Adicione imagens acima.
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="videos" className="space-y-6">
              {/* Add Video */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Video className="w-5 h-5" />
                    Adicionar Vídeo do YouTube
                  </CardTitle>
                  <CardDescription>Cole o link do vídeo do YouTube</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit((data) => addVideoMutation.mutate(data))} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="youtubeUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>URL do YouTube</FormLabel>
                            <FormControl>
                              <Input
                                data-testid="input-youtube-url"
                                placeholder="https://www.youtube.com/watch?v=..."
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Título (Opcional)</FormLabel>
                            <FormControl>
                              <Input
                                data-testid="input-video-title"
                                placeholder="Título do vídeo"
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
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Descrição (Opcional)</FormLabel>
                            <FormControl>
                              <Textarea
                                data-testid="input-video-description"
                                placeholder="Descrição do vídeo"
                                {...field}
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        data-testid="button-add-video"
                        type="submit"
                        className="w-full bg-[#133903] hover:bg-[#6a9e24]"
                        disabled={addVideoMutation.isPending}
                      >
                        <Video className="w-4 h-4 mr-2" />
                        {addVideoMutation.isPending ? "Adicionando..." : "Adicionar Vídeo"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>

              {/* Videos List */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Video className="w-5 h-5" />
                    Vídeos do YouTube
                  </CardTitle>
                  <CardDescription>{videos.length} vídeo(s)</CardDescription>
                </CardHeader>
                <CardContent>
                  {galleryLoading ? (
                    <div className="text-center py-8">Carregando vídeos...</div>
                  ) : videos.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {videos.map((item) => (
                        <div key={item.id} className="relative border rounded-lg overflow-hidden">
                          <div className="aspect-video">
                            <iframe
                              src={getYoutubeEmbedUrl(item.path)}
                              title={item.title || `Video ${item.id}`}
                              className="w-full h-full"
                              allowFullScreen
                            />
                          </div>
                          {item.title && (
                            <div className="p-2 bg-white dark:bg-gray-800">
                              <p className="text-sm font-medium">{item.title}</p>
                            </div>
                          )}
                          <div className="absolute top-2 right-2">
                            <Button
                              data-testid={`button-delete-video-${item.id}`}
                              variant="destructive"
                              size="sm"
                              onClick={() => setDeletingItemId(item.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      Nenhum vídeo na galeria. Adicione vídeos acima.
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>

      <AlertDialog open={!!deletingItemId} onOpenChange={() => setDeletingItemId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O item será removido permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              data-testid="button-confirm-delete"
              onClick={() => deletingItemId && deleteItemMutation.mutate(deletingItemId)}
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
