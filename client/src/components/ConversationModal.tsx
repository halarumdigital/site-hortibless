import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { User, Bot, Phone, Calendar, Clock, MessageSquare } from "lucide-react";

interface ConversationMessage {
  id: number;
  conversationId: number;
  sender: 'user' | 'agent' | 'system';
  senderName: string | null;
  message: string;
  messageType: string;
  mediaUrl: string | null;
  isRead: boolean;
  metadata: string | null;
  createdAt: string;
}

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
}

interface ConversationModalProps {
  conversation: Conversation | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange?: (conversationId: number, newStatus: string) => void;
}

export function ConversationModal({ conversation, isOpen, onClose, onStatusChange }: ConversationModalProps) {
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Buscar mensagens da conversa
  const { data: messagesData, isLoading: messagesLoading } = useQuery<{ success: boolean; conversation: Conversation; messages: ConversationMessage[] }>({
    queryKey: [`/api/conversations/${conversation?.id}`],
    enabled: !!conversation?.id && isOpen,
    refetchInterval: 3000, // Atualizar a cada 3 segundos
  });

  // Marcar conversa como concluída
  const markAsDoneMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("PATCH", `/api/conversations/${conversation?.id}/status`, {
        status: 'closed'
      });
    },
    onSuccess: () => {
      toast({ title: "Conversa marcada como concluída" });
      if (conversation && onStatusChange) {
        onStatusChange(conversation.id, 'closed');
      }
      onClose();
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

  // Scroll para o final das mensagens quando carregar ou atualizar
  useEffect(() => {
    if (messagesData?.messages) {
      scrollToBottom();
    }
  }, [messagesData?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatDate = (date: string) => {
    return format(new Date(date), "dd/MM/yyyy HH:mm", { locale: ptBR });
  };

  const formatPhone = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 13) {
      return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 4)} ${cleaned.slice(4, 9)}-${cleaned.slice(9)}`;
    }
    if (cleaned.length === 11) {
      return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
    }
    return phone;
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'pending':
        return <Badge className="bg-red-100 text-red-800">Não atendido</Badge>;
      case 'in_progress':
        return <Badge className="bg-yellow-100 text-yellow-800">Em Atendimento</Badge>;
      case 'closed':
        return <Badge className="bg-green-100 text-green-800">Concluído</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (!conversation) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader className="border-b pb-4">
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-xl font-bold flex items-center gap-3">
                <User className="w-5 h-5" />
                {conversation.customerName}
              </DialogTitle>
              <DialogDescription className="mt-2">
                <div className="flex flex-col gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <span>{formatPhone(conversation.customerWhatsapp)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Iniciada em: {formatDate(conversation.createdAt)}</span>
                  </div>
                  {conversation.lastMessageAt && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>Última mensagem: {formatDate(conversation.lastMessageAt)}</span>
                    </div>
                  )}
                </div>
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge(conversation.status)}
              {conversation.status !== 'closed' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => markAsDoneMutation.mutate()}
                  className="text-green-600 hover:bg-green-50"
                >
                  Marcar como Concluída
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {messagesLoading ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">Carregando mensagens...</p>
            </div>
          ) : (
            <ScrollArea className="h-full pr-4" ref={scrollAreaRef}>
              <div className="space-y-4 py-4">
                {messagesData?.messages?.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === 'user' ? 'justify-start' : msg.sender === 'agent' ? 'justify-end' : 'justify-center'}`}
                  >
                    <div
                      className={`max-w-[70%] ${
                        msg.sender === 'user'
                          ? 'bg-gray-100 text-gray-900'
                          : msg.sender === 'agent'
                          ? 'bg-blue-600 text-white'
                          : 'bg-yellow-100 text-yellow-800'
                      } rounded-lg p-3`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {msg.sender === 'user' && <User className="w-4 h-4" />}
                        {msg.sender === 'agent' && <Bot className="w-4 h-4" />}
                        {msg.sender === 'system' && <MessageSquare className="w-4 h-4" />}
                        <span className="text-xs font-semibold">
                          {msg.senderName || (msg.sender === 'user' ? 'Cliente' : msg.sender === 'agent' ? 'Agente' : 'Sistema')}
                        </span>
                        <span className="text-xs opacity-75">
                          {format(new Date(msg.createdAt), "HH:mm", { locale: ptBR })}
                        </span>
                      </div>
                      <p className="whitespace-pre-wrap break-words">{msg.message}</p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}