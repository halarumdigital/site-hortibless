import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Menu, Trash2, Eye } from "lucide-react";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface ContactMessage {
  id: number;
  name: string;
  email: string;
  whatsapp: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function Duvidas() {
  const { user, isLoading: authLoading } = useAuth(true);
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [deletingMessageId, setDeletingMessageId] = useState<number | null>(null);
  const [viewingMessage, setViewingMessage] = useState<ContactMessage | null>(null);

  const { data: messagesData, isLoading: messagesLoading } = useQuery<{ success: boolean; messages: ContactMessage[] }>({
    queryKey: ["/api/contact-messages"],
    enabled: !!user,
  });

  const handleLogout = async () => {
    try {
      await apiRequest("POST", "/api/logout");
      toast({ title: "Logged out successfully" });
      setLocation("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const markAsReadMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("PATCH", `/api/contact-messages/${id}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contact-messages"] });
      toast({ title: "Mensagem marcada como lida" });
    },
    onError: (error: Error) => {
      console.error("Mark as read error:", error);
      toast({
        title: "Erro ao marcar como lida",
        description: error.message,
        variant: "destructive"
      });
    },
  });

  const deleteMessageMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/contact-messages/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contact-messages"] });
      setDeletingMessageId(null);
      toast({ title: "Mensagem excluída com sucesso" });
    },
    onError: (error: Error) => {
      console.error("Delete error:", error);
      toast({
        title: "Erro ao excluir mensagem",
        description: error.message,
        variant: "destructive"
      });
    },
  });

  const handleViewMessage = (message: ContactMessage) => {
    setViewingMessage(message);
    if (!message.isRead) {
      markAsReadMutation.mutate(message.id);
    }
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

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
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
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dúvidas</h1>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <Card>
            <CardHeader>
              <CardTitle>Mensagens de Contato</CardTitle>
              <CardDescription>
                Mensagens enviadas através do formulário de contato
              </CardDescription>
            </CardHeader>
            <CardContent>
              {messagesLoading ? (
                <div className="text-center py-8">Carregando...</div>
              ) : messagesData?.messages && messagesData.messages.length > 0 ? (
                <div className="space-y-4">
                  {messagesData.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`border rounded-lg p-4 ${
                        message.isRead ? "bg-gray-50" : "bg-white border-blue-200"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-gray-900">{message.name}</h3>
                            {!message.isRead && (
                              <Badge variant="default" className="bg-blue-500">Nova</Badge>
                            )}
                          </div>
                          <div className="space-y-1 text-sm text-gray-600">
                            <p><strong>Email:</strong> {message.email}</p>
                            <p><strong>WhatsApp:</strong> {message.whatsapp}</p>
                            <p className="text-xs text-gray-400">
                              {new Date(message.createdAt).toLocaleString('pt-BR')}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewMessage(message)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDeletingMessageId(message.id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Nenhuma mensagem recebida ainda.
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>

      {/* View Message Dialog */}
      <Dialog open={viewingMessage !== null} onOpenChange={() => setViewingMessage(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Mensagem de {viewingMessage?.name}</DialogTitle>
            <DialogDescription>
              Recebida em {viewingMessage && new Date(viewingMessage.createdAt).toLocaleString('pt-BR')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-semibold text-gray-700">Email:</p>
              <p className="text-sm text-gray-600">{viewingMessage?.email}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700">WhatsApp:</p>
              <p className="text-sm text-gray-600">{viewingMessage?.whatsapp}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700">Mensagem:</p>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{viewingMessage?.message}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deletingMessageId !== null} onOpenChange={() => setDeletingMessageId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta mensagem? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingMessageId && deleteMessageMutation.mutate(deletingMessageId)}
              className="bg-red-500 hover:bg-red-600"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
