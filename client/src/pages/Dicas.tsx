import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { blogPostSchema, type InsertBlogPost } from "@shared/schema";
import { Lightbulb, Menu, Trash2, Plus, Edit2, Upload } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

interface BlogPost {
  id: number;
  title: string;
  content: string;
  imagePath?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export default function Dicas() {
  const { user, isLoading: authLoading } = useAuth(true);
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [deletingPostId, setDeletingPostId] = useState<number | null>(null);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [editorContent, setEditorContent] = useState("");

  const { data: postsData, isLoading: postsLoading } = useQuery<{ success: boolean; posts: BlogPost[] }>({
    queryKey: ["/api/blog-posts"],
    enabled: !!user,
  });

  const form = useForm<Omit<InsertBlogPost, 'content'>>({
    defaultValues: {
      title: "",
      imagePath: "",
      isActive: true,
    },
  });

  useEffect(() => {
    if (editingPost) {
      form.setValue("title", editingPost.title);
      setEditorContent(editingPost.content);
      setImagePreview(editingPost.imagePath || null);
      setIsDialogOpen(true);
    }
  }, [editingPost, form]);

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/logout", {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Logout failed");
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const createPostMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await fetch("/api/blog-posts", {
        method: "POST",
        credentials: "include",
        body: data,
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create post");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog-posts"] });
      toast({ title: "Post criado com sucesso" });
      handleCloseDialog();
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao criar post",
        description: error.message,
        variant: "destructive"
      });
    },
  });

  const updatePostMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: FormData }) => {
      const response = await fetch(`/api/blog-posts/${id}`, {
        method: "PUT",
        credentials: "include",
        body: data,
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update post");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog-posts"] });
      toast({ title: "Post atualizado com sucesso" });
      handleCloseDialog();
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar post",
        description: error.message,
        variant: "destructive"
      });
    },
  });

  const deletePostMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/blog-posts/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete post");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog-posts"] });
      setDeletingPostId(null);
      toast({ title: "Post deletado com sucesso" });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao deletar post",
        description: error.message,
        variant: "destructive"
      });
    },
  });

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingPost(null);
    setSelectedImage(null);
    setImagePreview(null);
    setEditorContent("");
    form.reset();
  };

  const onSubmit = async (data: any) => {
    // Validar título
    if (!data.title || data.title.trim() === '') {
      toast({
        title: "Erro ao criar post",
        description: "O título é obrigatório",
        variant: "destructive"
      });
      return;
    }

    // Validar conteúdo
    if (!editorContent || editorContent.trim() === '<p><br></p>' || editorContent.trim() === '') {
      toast({
        title: "Erro ao criar post",
        description: "O conteúdo é obrigatório",
        variant: "destructive"
      });
      return;
    }

    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("content", editorContent);
    formData.append("isActive", "true");

    if (selectedImage) {
      formData.append("image", selectedImage);
    } else if (editingPost?.imagePath) {
      formData.append("imagePath", editingPost.imagePath);
    }

    if (editingPost) {
      updatePostMutation.mutate({ id: editingPost.id, data: formData });
    } else {
      createPostMutation.mutate(formData);
    }
  };

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      [{ 'font': [] }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'script': 'sub' }, { 'script': 'super' }],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      [{ 'indent': '-1' }, { 'indent': '+1' }],
      [{ 'align': [] }],
      ['blockquote', 'code-block'],
      ['link'],
      ['clean']
    ],
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

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setIsSidebarOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dicas</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Gerencie posts de dicas do blog</p>
              </div>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  className="bg-[#133903] hover:bg-[#6a9e24]"
                  onClick={() => {
                    setEditingPost(null);
                    form.reset();
                    setEditorContent("");
                    setSelectedImage(null);
                    setImagePreview(null);
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Post
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingPost ? "Editar Post" : "Novo Post"}</DialogTitle>
                  <DialogDescription>
                    {editingPost ? "Atualize as informações do post" : "Adicione um novo post de dica"}
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Título</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Digite o título do post"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="space-y-2">
                      <FormLabel>Conteúdo</FormLabel>
                      <div className="bg-white dark:bg-gray-950 rounded-md">
                        <ReactQuill
                          theme="snow"
                          value={editorContent}
                          onChange={setEditorContent}
                          modules={modules}
                          className="h-64 mb-12"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <FormLabel>Imagem</FormLabel>
                      <div className="flex items-center gap-4">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="flex-1"
                        />
                        <Upload className="w-5 h-5 text-gray-500" />
                      </div>
                      {imagePreview && (
                        <div className="mt-4">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="max-w-xs h-auto rounded-lg border"
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCloseDialog}
                      >
                        Cancelar
                      </Button>
                      <Button
                        type="submit"
                        className="bg-[#133903] hover:bg-[#6a9e24]"
                        disabled={createPostMutation.isPending || updatePostMutation.isPending}
                      >
                        {createPostMutation.isPending || updatePostMutation.isPending
                          ? "Salvando..."
                          : editingPost
                          ? "Atualizar"
                          : "Criar Post"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5" />
                Posts de Dicas
              </CardTitle>
              <CardDescription>
                {postsData?.posts?.length || 0} post(s) cadastrado(s)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {postsLoading ? (
                <div className="text-center py-8">Carregando posts...</div>
              ) : postsData?.posts && postsData.posts.length > 0 ? (
                <div className="space-y-4">
                  {postsData.posts.map((post) => (
                    <div
                      key={post.id}
                      className="flex gap-4 p-4 border rounded-lg hover:shadow-md transition-shadow bg-white dark:bg-gray-800"
                    >
                      {post.imagePath && (
                        <img
                          src={post.imagePath}
                          alt={post.title}
                          className="w-32 h-32 object-cover rounded-lg flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-4 mb-2">
                          <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                            {post.title}
                          </h3>
                          <div className="flex gap-2 flex-shrink-0">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingPost(post)}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => setDeletingPostId(post.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <div
                          className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2"
                          dangerouslySetInnerHTML={{ __html: post.content }}
                        />
                        <span className="text-xs text-gray-500">
                          {new Date(post.createdAt).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Nenhum post cadastrado. Clique em "Novo Post" para adicionar o primeiro.
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>

      <AlertDialog open={!!deletingPostId} onOpenChange={() => setDeletingPostId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O post será removido permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingPostId && deletePostMutation.mutate(deletingPostId)}
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
