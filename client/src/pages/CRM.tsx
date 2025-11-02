import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { ConversationModal } from "@/components/ConversationModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Menu, Phone, Calendar, User, MessageSquare, Clock, Eye } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Conversation {
  id: number;
  customerId: number | null;
  customerName: string;
  customerEmail: string | null;
  customerWhatsapp: string;
  agentId: number | null;
  agentName: string | null;
  status: string;
  channel: string;
  lastMessageAt: string | null;
  createdAt: string;
  updatedAt: string;
  lastMessage?: string;
  unreadCount?: number;
}

interface KanbanColumn {
  id: string;
  title: string;
  color: string;
  conversations: Conversation[];
}

export default function CRM() {
  const { user, isLoading: authLoading } = useAuth(true);
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [draggedConversation, setDraggedConversation] = useState<Conversation | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  // Buscar conversas
  const { data: conversationsData, isLoading: conversationsLoading, refetch } = useQuery<{ success: boolean; conversations: Conversation[] }>({
    queryKey: ["/api/conversations"],
    enabled: !!user,
    refetchInterval: 5000, // Atualizar a cada 5 segundos
  });

  // Atualizar status da conversa
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      console.log(`🔄 Updating conversation ${id} to status: ${status}`);
      const result = await apiRequest("PATCH", `/api/conversations/${id}/status`, { status });
      console.log('✅ Update response:', result);
      return result;
    },
    onSuccess: (data, variables) => {
      console.log('✅ Mutation success, invalidating queries...');
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      toast({ title: "Status atualizado com sucesso" });

      // Force refetch to ensure UI updates
      setTimeout(() => {
        refetch();
      }, 100);
    },
    onError: (error: Error) => {
      console.error("Erro ao atualizar status:", error);
      toast({
        title: "Erro ao atualizar status",
        description: error.message,
        variant: "destructive"
      });
    },
  });

  // Organizar conversas por status
  const getKanbanColumns = (): KanbanColumn[] => {
    const conversations = conversationsData?.conversations || [];

    // Debug: Log all statuses
    if (conversations.length > 0) {
      console.log('📊 All conversations and their statuses:');
      conversations.forEach(c => {
        console.log(`  - ${c.customerName}: status = "${c.status}"`);
      });
    }

    // Mapear status para colunas do Kanban
    const notAttended = conversations.filter(c => c.status === 'pending' || c.status === 'active');
    const inProgress = conversations.filter(c => c.status === 'in_progress' || c.status === 'in-progress'); // Also check for hyphenated version
    const done = conversations.filter(c => c.status === 'closed' || c.status === 'done');

    console.log(`📋 Column distribution: Not Attended: ${notAttended.length}, In Progress: ${inProgress.length}, Done: ${done.length}`);

    return [
      {
        id: 'not_attended',
        title: 'Não atendido',
        color: 'bg-red-100 border-red-300',
        conversations: notAttended
      },
      {
        id: 'in_progress',
        title: 'Em Atendimento',
        color: 'bg-yellow-100 border-yellow-300',
        conversations: inProgress
      },
      {
        id: 'done',
        title: 'Pronto',
        color: 'bg-green-100 border-green-300',
        conversations: done
      }
    ];
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const logoutMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/logout");
    },
    onSuccess: () => {
      toast({ title: "Logged out successfully" });
      setLocation("/login");
    },
  });

  const handleDragStart = (e: React.DragEvent, conversation: Conversation) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('conversationId', conversation.id.toString());
    setDraggedConversation(conversation);

    // Add drag image styling
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.5';
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    e.preventDefault();
    setDraggedConversation(null);
    setDragOverColumn(null);

    // Reset drag element styling
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    setDragOverColumn(columnId);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    // Only clear if leaving the column entirely
    if (e.currentTarget === e.target) {
      setDragOverColumn(null);
    }
  };

  const handleDrop = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    e.stopPropagation();

    const conversationId = parseInt(e.dataTransfer.getData('conversationId'));
    setDragOverColumn(null);
    setDraggedConversation(null);

    // Find the conversation from the data
    const conversation = conversationsData?.conversations?.find(c => c.id === conversationId);
    if (!conversation) {
      console.error('Conversation not found:', conversationId);
      return;
    }

    let newStatus = '';
    switch(columnId) {
      case 'not_attended':
        newStatus = 'pending';
        break;
      case 'in_progress':
        newStatus = 'in_progress'; // Using underscore to match database
        break;
      case 'done':
        newStatus = 'closed';
        break;
    }

    console.log(`🎯 Column drop: ${columnId} -> new status: ${newStatus}`);

    // Check if status actually changed
    const currentStatus = conversation.status;
    const needsUpdate =
      (columnId === 'not_attended' && currentStatus !== 'pending' && currentStatus !== 'active') ||
      (columnId === 'in_progress' && currentStatus !== 'in_progress') ||
      (columnId === 'done' && currentStatus !== 'closed' && currentStatus !== 'done');

    if (newStatus && needsUpdate) {
      console.log(`Updating conversation ${conversationId} from ${currentStatus} to ${newStatus}`);
      updateStatusMutation.mutate({ id: conversationId, status: newStatus });
    } else {
      console.log(`No update needed for conversation ${conversationId} (current: ${currentStatus}, target: ${newStatus})`);
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return 'Sem data';
    return format(new Date(date), "dd/MM/yyyy HH:mm", { locale: ptBR });
  };

  const formatPhone = (phone: string) => {
    // Formatar número de telefone brasileiro
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 13) {
      // +55 11 99999-9999
      return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 4)} ${cleaned.slice(4, 9)}-${cleaned.slice(9)}`;
    }
    if (cleaned.length === 11) {
      // 11 99999-9999
      return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
    }
    return phone;
  };

  const openConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedConversation(null);
    refetch(); // Atualizar a lista após fechar o modal
  };

  const handleStatusChangeFromModal = (conversationId: number, newStatus: string) => {
    updateStatusMutation.mutate({ id: conversationId, status: newStatus });
  };

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const columns = getKanbanColumns();

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
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setIsSidebarOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">CRM - Central de Atendimento</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Gerencie suas conversas do WhatsApp</p>
              </div>
            </div>
            <Button
              onClick={() => refetch()}
              variant="outline"
              size="sm"
            >
              Atualizar
            </Button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          {conversationsLoading ? (
            <div className="text-center py-8">Carregando conversas...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
              {columns.map((column) => (
                <div
                  key={column.id}
                  className={`flex flex-col transition-all ${
                    dragOverColumn === column.id ? 'scale-105' : ''
                  }`}
                  onDragOver={handleDragOver}
                  onDragEnter={(e) => handleDragEnter(e, column.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, column.id)}
                >
                  <Card className={`flex-1 ${column.color} transition-all ${
                    dragOverColumn === column.id ? 'ring-2 ring-blue-500 shadow-xl' : ''
                  }`}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg font-semibold">
                        {column.title}
                      </CardTitle>
                      <CardDescription>
                        {column.conversations.length} conversa{column.conversations.length !== 1 ? 's' : ''}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[600px] pr-4">
                        <div className="space-y-3">
                          {column.conversations.map((conversation) => (
                            <Card
                              key={conversation.id}
                              className={`cursor-move hover:shadow-lg transition-all hover:scale-105 bg-white ${
                                draggedConversation?.id === conversation.id ? 'opacity-50' : ''
                              }`}
                              draggable
                              onDragStart={(e) => handleDragStart(e, conversation)}
                              onDragEnd={handleDragEnd}
                              onClick={() => openConversation(conversation)}
                            >
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <User className="w-4 h-4 text-gray-500" />
                                    <span className="font-semibold text-sm">
                                      {conversation.customerName}
                                    </span>
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openConversation(conversation);
                                    }}
                                  >
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                </div>

                                <div className="space-y-1 text-xs text-gray-600">
                                  <div className="flex items-center gap-2">
                                    <Phone className="w-3 h-3" />
                                    <span>{formatPhone(conversation.customerWhatsapp)}</span>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <Calendar className="w-3 h-3" />
                                    <span>{formatDate(conversation.lastMessageAt)}</span>
                                  </div>

                                  {conversation.agentName && (
                                    <div className="flex items-center gap-2 mt-2">
                                      <MessageSquare className="w-3 h-3" />
                                      <span className="text-blue-600">
                                        Atendido por: {conversation.agentName}
                                      </span>
                                    </div>
                                  )}

                                  {conversation.unreadCount && conversation.unreadCount > 0 && (
                                    <div className="flex items-center gap-2 mt-2">
                                      <div className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                                        {conversation.unreadCount} não lida{conversation.unreadCount > 1 ? 's' : ''}
                                      </div>
                                    </div>
                                  )}
                                </div>

                                <div className="mt-3 pt-3 border-t">
                                  <div className="flex items-center gap-2 text-xs">
                                    <Clock className="w-3 h-3 text-gray-400" />
                                    <span className="text-gray-500">
                                      Iniciada: {formatDate(conversation.createdAt)}
                                    </span>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Modal de Conversa */}
      <ConversationModal
        conversation={selectedConversation}
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onStatusChange={handleStatusChangeFromModal}
      />
    </div>
  );
}