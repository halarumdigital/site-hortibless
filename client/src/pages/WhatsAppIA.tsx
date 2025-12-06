import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Menu, Plus, Trash2, RefreshCw, QrCode, Settings, Bot, Send, Loader2 } from "lucide-react";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { apiRequest } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface WhatsappConnection {
  id: number;
  name: string;
  phoneNumber: string;
  instanceName?: string;
  status: string;
  qrCode?: string;
  isActive: boolean;
  aiEnabled?: boolean;
  aiModel?: string;
  aiTemperature?: string;
  aiMaxTokens?: number;
  aiPrompt?: string;
  createdAt: string;
}

// Lista de modelos disponíveis da OpenAI
const OPENAI_MODELS = [
  { value: "gpt-4o", label: "GPT-4o (Mais Capaz)" },
  { value: "gpt-4o-mini", label: "GPT-4o Mini (Rápido e Econômico)" },
  { value: "gpt-4-turbo", label: "GPT-4 Turbo" },
  { value: "gpt-4", label: "GPT-4" },
  { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo" },
];

export default function WhatsAppIA() {
  const { user, isLoading: authLoading } = useAuth(true);
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [connections, setConnections] = useState<WhatsappConnection[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [currentQrCode, setCurrentQrCode] = useState<string>("");
  const [currentConnectionId, setCurrentConnectionId] = useState<number | null>(null);
  const [isLoadingQr, setIsLoadingQr] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "",
  });

  // IA Configuration State
  const [selectedConnection, setSelectedConnection] = useState<number | null>(null);
  const [aiConfig, setAiConfig] = useState({
    aiEnabled: false,
    aiModel: "gpt-4o-mini",
    aiTemperature: "0.7",
    aiMaxTokens: 1000,
    aiPrompt: "",
  });
  const [testMessage, setTestMessage] = useState("");
  const [testResponse, setTestResponse] = useState("");
  const [isTesting, setIsTesting] = useState(false);
  const [isSavingAi, setIsSavingAi] = useState(false);

  useEffect(() => {
    loadConnections();

    // Verificar status a cada 5 minutos (300000ms)
    const interval = setInterval(() => {
      checkConnectionsStatus();
    }, 300000);

    return () => clearInterval(interval);
  }, []);

  // Verificar status mais frequentemente quando o modal QR está aberto
  useEffect(() => {
    if (isQrModalOpen && currentConnectionId) {
      // Verificar status a cada 3 segundos enquanto o modal está aberto
      const interval = setInterval(() => {
        checkSingleConnectionStatus(currentConnectionId);
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [isQrModalOpen, currentConnectionId]);

  useEffect(() => {
    console.log("🔄 Estado connections atualizado:", connections);
  }, [connections]);

  const loadConnections = async () => {
    try {
      console.log("Carregando conexões...");
      const response = await apiRequest("GET", "/api/whatsapp-connections");
      const data = await response.json();
      console.log("Conexões recebidas:", data);
      setConnections(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading connections:", error);
      setConnections([]);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as conexões",
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    try {
      await apiRequest("POST", "/api/logout");
      toast({ title: "Logged out successfully" });
      setLocation("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleOpenModal = () => {
    setFormData({ name: "", phoneNumber: "" });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({ name: "", phoneNumber: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await apiRequest("POST", "/api/whatsapp-connections", formData);
      const newConnection = await response.json();
      console.log("✅ Conexão criada:", newConnection);

      // Adicionar a nova conexão imediatamente ao estado
      setConnections(prev => [newConnection, ...prev]);

      toast({
        title: "Sucesso",
        description: "Conexão criada com sucesso!",
      });

      handleCloseModal();
    } catch (error: any) {
      console.error("❌ Error creating connection:", error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível criar a conexão",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir esta conexão?")) {
      return;
    }

    try {
      await apiRequest("DELETE", `/api/whatsapp-connections/${id}`);
      toast({
        title: "Sucesso",
        description: "Conexão excluída com sucesso!",
      });
      loadConnections();
    } catch (error) {
      console.error("Error deleting connection:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a conexão",
        variant: "destructive",
      });
    }
  };

  const handleShowQrCode = async (id: number) => {
    setIsLoadingQr(true);
    setIsQrModalOpen(true);
    setCurrentConnectionId(id);

    try {
      const response = await apiRequest("GET", `/api/whatsapp-connections/${id}/qrcode`);
      const data = await response.json();

      if (data.qrCode) {
        setCurrentQrCode(data.qrCode);
        toast({
          title: "QR Code gerado!",
          description: "Escaneie o QR Code com seu WhatsApp",
        });
      } else {
        throw new Error("QR Code não disponível");
      }
    } catch (error: any) {
      console.error("Error generating QR Code:", error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível gerar o QR Code",
        variant: "destructive",
      });
      setIsQrModalOpen(false);
      setCurrentConnectionId(null);
    } finally {
      setIsLoadingQr(false);
    }
  };

  const handleCloseQrModal = () => {
    setIsQrModalOpen(false);
    setCurrentQrCode("");
    setCurrentConnectionId(null);
  };

  const checkConnectionsStatus = async () => {
    // Verificar status apenas das conexões que não estão conectadas
    const pendingConnections = connections.filter(c => c.status !== "connected");

    for (const connection of pendingConnections) {
      try {
        const response = await apiRequest("GET", `/api/whatsapp-connections/${connection.id}/status`);
        const data = await response.json();

        if (data.status && data.status !== connection.status) {
          // Atualizar status localmente
          setConnections(prev =>
            prev.map(c =>
              c.id === connection.id ? { ...c, status: data.status } : c
            )
          );

          // Mostrar notificação se conectou
          if (data.status === "connected") {
            toast({
              title: "WhatsApp Conectado!",
              description: `A conexão "${connection.name}" foi estabelecida com sucesso.`,
            });
          }
        }
      } catch (error) {
        console.error(`Erro ao verificar status da conexão ${connection.id}:`, error);
      }
    }
  };

  const checkSingleConnectionStatus = async (connectionId: number) => {
    try {
      const response = await apiRequest("GET", `/api/whatsapp-connections/${connectionId}/status`);
      const data = await response.json();

      if (data.status) {
        const connection = connections.find(c => c.id === connectionId);

        if (connection && data.status !== connection.status) {
          // Atualizar status localmente
          setConnections(prev =>
            prev.map(c =>
              c.id === connectionId ? { ...c, status: data.status } : c
            )
          );

          // Se conectou, fechar o modal e mostrar notificação
          if (data.status === "connected") {
            setIsQrModalOpen(false);
            setCurrentQrCode("");
            setCurrentConnectionId(null);

            toast({
              title: "WhatsApp Conectado!",
              description: `A conexão "${connection.name}" foi estabelecida com sucesso.`,
            });
          }
        }
      }
    } catch (error) {
      console.error(`Erro ao verificar status da conexão ${connectionId}:`, error);
    }
  };

  const handleConfigureWhatsApp = async (id: number, name: string) => {
    if (!confirm(`Deseja configurar o WhatsApp para "${name}"?\n\nSerão aplicadas as seguintes configurações:\n- Rejeitar chamadas\n- Ignorar grupos\n- Sempre online\n- Marcar mensagens como lidas\n- Marcar status como visto`)) {
      return;
    }

    try {
      const response = await apiRequest("POST", `/api/whatsapp-connections/${id}/configure`);
      const data = await response.json();

      toast({
        title: "Sucesso!",
        description: data.message || "Configurações aplicadas com sucesso",
      });
    } catch (error: any) {
      console.error("Error configuring WhatsApp:", error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível aplicar as configurações",
        variant: "destructive",
      });
    }
  };

  const handleConfigureIA = async (id: number, name: string) => {
    if (!confirm(`Deseja configurar a IA para "${name}"?\n\nSerá configurado um webhook para receber e processar mensagens automaticamente.`)) {
      return;
    }

    try {
      const response = await apiRequest("POST", `/api/whatsapp-connections/${id}/configure-ia`);
      const data = await response.json();

      toast({
        title: "IA Configurada!",
        description: data.message || "IA configurada com sucesso",
      });
    } catch (error: any) {
      console.error("Error configuring IA:", error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível configurar a IA",
        variant: "destructive",
      });
    }
  };

  // Carregar configurações de IA quando uma conexão é selecionada
  useEffect(() => {
    if (selectedConnection) {
      const connection = connections.find(c => c.id === selectedConnection);
      if (connection) {
        setAiConfig({
          aiEnabled: connection.aiEnabled || false,
          aiModel: connection.aiModel || "gpt-4o-mini",
          aiTemperature: connection.aiTemperature || "0.7",
          aiMaxTokens: connection.aiMaxTokens || 1000,
          aiPrompt: connection.aiPrompt || "",
        });
      }
    }
  }, [selectedConnection, connections]);

  const handleSaveAiConfig = async () => {
    if (!selectedConnection) {
      toast({
        title: "Erro",
        description: "Selecione uma conexão primeiro",
        variant: "destructive",
      });
      return;
    }

    setIsSavingAi(true);
    try {
      const response = await apiRequest(
        "PATCH",
        `/api/whatsapp-connections/${selectedConnection}/ai-config`,
        aiConfig
      );

      if (response.ok) {
        toast({
          title: "Sucesso!",
          description: "Configurações de IA salvas com sucesso",
        });
        // Recarregar conexões para atualizar os dados
        await loadConnections();
      }
    } catch (error: any) {
      console.error("Error saving AI config:", error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível salvar as configurações",
        variant: "destructive",
      });
    } finally {
      setIsSavingAi(false);
    }
  };

  const handleTestAi = async () => {
    if (!selectedConnection) {
      toast({
        title: "Erro",
        description: "Selecione uma conexão primeiro",
        variant: "destructive",
      });
      return;
    }

    if (!testMessage.trim()) {
      toast({
        title: "Erro",
        description: "Digite uma mensagem de teste",
        variant: "destructive",
      });
      return;
    }

    setIsTesting(true);
    setTestResponse("");

    try {
      const response = await apiRequest(
        "POST",
        `/api/whatsapp-connections/${selectedConnection}/test-ai`,
        {
          message: testMessage,
          config: aiConfig,
        }
      );

      const data = await response.json();

      if (data.response) {
        setTestResponse(data.response);
        toast({
          title: "Teste concluído!",
          description: "Resposta gerada com sucesso",
        });
      }
    } catch (error: any) {
      console.error("Error testing AI:", error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível testar a IA",
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
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
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">WhatsApp e IA</h1>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <Tabs defaultValue="whatsapp" className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-md">
              <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
              <TabsTrigger value="ia">IA</TabsTrigger>
            </TabsList>

            <TabsContent value="whatsapp" className="mt-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Conexões WhatsApp</CardTitle>
                      <CardDescription>
                        Gerencie suas conexões do WhatsApp
                      </CardDescription>
                    </div>
                    <Button onClick={handleOpenModal}>
                      <Plus className="w-4 h-4 mr-2" />
                      Nova Conexão
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-gray-400 mb-2">
                    Debug: {connections.length} conexão(ões) carregada(s)
                  </div>
                  {connections.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      Nenhuma conexão cadastrada. Clique em "Nova Conexão" para começar.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {connections.map((connection) => (
                        <div
                          key={connection.id}
                          className="p-4 border rounded-lg"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold">{connection.name}</h3>
                                <span
                                  className={`text-xs px-2 py-1 rounded ${
                                    connection.status === "connected"
                                      ? "bg-green-100 text-green-800"
                                      : connection.status === "pending"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : connection.status === "error"
                                      ? "bg-red-100 text-red-800"
                                      : "bg-gray-100 text-gray-800"
                                  }`}
                                >
                                  {connection.status === "connected"
                                    ? "Conectado"
                                    : connection.status === "pending"
                                    ? "Aguardando"
                                    : connection.status === "error"
                                    ? "Erro"
                                    : "Desconectado"}
                                </span>
                              </div>
                              <p className="text-sm text-gray-500 mt-1">{connection.phoneNumber}</p>
                              {connection.instanceName && (
                                <p className="text-xs text-gray-400 mt-1">
                                  Instância: {connection.instanceName}
                                </p>
                              )}
                              <p className="text-xs text-gray-400 mt-1">
                                Criado em: {new Date(connection.createdAt).toLocaleString("pt-BR")}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => checkSingleConnectionStatus(connection.id)}
                                title="Atualizar status"
                              >
                                <RefreshCw className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleShowQrCode(connection.id)}
                                disabled={connection.status === "connected"}
                                title={connection.status === "connected" ? "Já conectado" : "Gerar QR Code"}
                              >
                                <QrCode className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleConfigureWhatsApp(connection.id, connection.name)}
                                disabled={connection.status !== "connected"}
                                title={connection.status !== "connected" ? "Conecte o WhatsApp primeiro" : "Configurar WhatsApp"}
                              >
                                <Settings className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleConfigureIA(connection.id, connection.name)}
                                disabled={connection.status !== "connected"}
                                title={connection.status !== "connected" ? "Conecte o WhatsApp primeiro" : "Configurar IA"}
                                className="bg-blue-50 hover:bg-blue-100 text-blue-600"
                              >
                                <Bot className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDelete(connection.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="ia" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Configurações de IA</CardTitle>
                  <CardDescription>
                    Configure a integração com OpenAI para respostas automáticas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Seletor de Conexão */}
                    <div className="space-y-2">
                      <Label htmlFor="connection">Selecione uma Conexão</Label>
                      <Select
                        value={selectedConnection?.toString() || ""}
                        onValueChange={(value) => setSelectedConnection(Number(value))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma conexão WhatsApp" />
                        </SelectTrigger>
                        <SelectContent>
                          {connections.filter(c => c.status === "connected").map((connection) => (
                            <SelectItem key={connection.id} value={connection.id.toString()}>
                              {connection.name} - {connection.phoneNumber}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {connections.filter(c => c.status === "connected").length === 0 && (
                        <p className="text-sm text-yellow-600">
                          Nenhuma conexão ativa. Conecte um WhatsApp na aba "WhatsApp" primeiro.
                        </p>
                      )}
                    </div>

                    {selectedConnection && (
                      <>
                        {/* Habilitar IA */}
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="space-y-0.5">
                            <Label htmlFor="ai-enabled">Habilitar IA</Label>
                            <p className="text-sm text-gray-500">
                              Ativar respostas automáticas com inteligência artificial
                            </p>
                          </div>
                          <Switch
                            id="ai-enabled"
                            checked={aiConfig.aiEnabled}
                            onCheckedChange={(checked) =>
                              setAiConfig({ ...aiConfig, aiEnabled: checked })
                            }
                          />
                        </div>

                        {/* Modelo */}
                        <div className="space-y-2">
                          <Label htmlFor="ai-model">Modelo OpenAI</Label>
                          <Select
                            value={aiConfig.aiModel}
                            onValueChange={(value) =>
                              setAiConfig({ ...aiConfig, aiModel: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {OPENAI_MODELS.map((model) => (
                                <SelectItem key={model.value} value={model.value}>
                                  {model.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-gray-500">
                            GPT-4o Mini é recomendado para uso geral por sua velocidade e custo
                          </p>
                        </div>

                        {/* Temperatura */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="ai-temperature">Temperatura</Label>
                            <span className="text-sm text-gray-500">{aiConfig.aiTemperature}</span>
                          </div>
                          <Input
                            id="ai-temperature"
                            type="range"
                            min="0"
                            max="2"
                            step="0.1"
                            value={aiConfig.aiTemperature}
                            onChange={(e) =>
                              setAiConfig({ ...aiConfig, aiTemperature: e.target.value })
                            }
                            className="w-full"
                          />
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>Preciso (0)</span>
                            <span>Balanceado (1)</span>
                            <span>Criativo (2)</span>
                          </div>
                          <p className="text-xs text-gray-500">
                            Controla a criatividade das respostas. Valores mais baixos são mais focados e determinísticos.
                          </p>
                        </div>

                        {/* Máximo de Tokens */}
                        <div className="space-y-2">
                          <Label htmlFor="ai-tokens">Máximo de Tokens</Label>
                          <Input
                            id="ai-tokens"
                            type="number"
                            min="100"
                            max="4000"
                            step="100"
                            value={aiConfig.aiMaxTokens}
                            onChange={(e) =>
                              setAiConfig({ ...aiConfig, aiMaxTokens: Number(e.target.value) })
                            }
                          />
                          <p className="text-xs text-gray-500">
                            Limite de tokens para a resposta (aproximadamente 4 caracteres por token)
                          </p>
                        </div>

                        {/* Prompt do Sistema */}
                        <div className="space-y-2">
                          <Label htmlFor="ai-prompt">Prompt do Sistema</Label>
                          <Textarea
                            id="ai-prompt"
                            placeholder="Ex: Você é um assistente virtual amigável que ajuda clientes com informações sobre produtos e serviços..."
                            value={aiConfig.aiPrompt}
                            onChange={(e) =>
                              setAiConfig({ ...aiConfig, aiPrompt: e.target.value })
                            }
                            rows={6}
                            className="resize-none"
                          />
                          <p className="text-xs text-gray-500">
                            Defina o comportamento e personalidade do agente de IA
                          </p>
                        </div>

                        {/* Área de Teste */}
                        <div className="border-t pt-6 space-y-4">
                          <h3 className="font-semibold text-lg">Testar IA</h3>

                          <div className="space-y-2">
                            <Label htmlFor="test-message">Mensagem de Teste</Label>
                            <div className="flex gap-2">
                              <Input
                                id="test-message"
                                placeholder="Digite uma mensagem para testar a IA..."
                                value={testMessage}
                                onChange={(e) => setTestMessage(e.target.value)}
                                onKeyPress={(e) => {
                                  if (e.key === "Enter" && !isTesting) {
                                    handleTestAi();
                                  }
                                }}
                              />
                              <Button
                                onClick={handleTestAi}
                                disabled={isTesting || !testMessage.trim()}
                              >
                                {isTesting ? (
                                  <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Testando...
                                  </>
                                ) : (
                                  <>
                                    <Send className="w-4 h-4 mr-2" />
                                    Testar
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>

                          {testResponse && (
                            <div className="space-y-2">
                              <Label>Resposta da IA</Label>
                              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border">
                                <p className="text-sm whitespace-pre-wrap">{testResponse}</p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Botão Salvar */}
                        <div className="flex justify-end pt-4 border-t">
                          <Button
                            onClick={handleSaveAiConfig}
                            disabled={isSavingAi}
                            size="lg"
                          >
                            {isSavingAi ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Salvando...
                              </>
                            ) : (
                              "Salvar Configurações"
                            )}
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>

      {/* Modal de criação de conexão */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Conexão WhatsApp</DialogTitle>
            <DialogDescription>
              Adicione uma nova conexão do WhatsApp ao sistema
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  placeholder="Ex: Atendimento Principal"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Número</Label>
                <Input
                  id="phoneNumber"
                  placeholder="5599999999999"
                  value={formData.phoneNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, phoneNumber: e.target.value })
                  }
                  pattern="55\d{11}"
                  title="Formato: 5599999999999 (55 + DDD + número)"
                  required
                />
                <p className="text-xs text-gray-500">
                  Formato: 55 + DDD + número (Ex: 5511999999999)
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseModal}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Criando..." : "Criar Conexão"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de QR Code */}
      <Dialog open={isQrModalOpen} onOpenChange={handleCloseQrModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>QR Code do WhatsApp</DialogTitle>
            <DialogDescription>
              Escaneie este QR Code com seu WhatsApp para conectar
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-6">
            {isLoadingQr ? (
              <div className="flex flex-col items-center gap-4">
                <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
                <p className="text-sm text-gray-500">Gerando QR Code...</p>
              </div>
            ) : currentQrCode ? (
              <div className="space-y-4">
                <img
                  src={currentQrCode}
                  alt="QR Code WhatsApp"
                  className="w-64 h-64 mx-auto border-2 border-gray-200 rounded-lg"
                />
                <div className="text-center space-y-2">
                  <p className="text-sm font-medium text-gray-900">
                    Como conectar:
                  </p>
                  <ol className="text-xs text-gray-600 text-left list-decimal list-inside space-y-1">
                    <li>Abra o WhatsApp no seu celular</li>
                    <li>Toque em <strong>Mais opções</strong> ou <strong>Configurações</strong></li>
                    <li>Toque em <strong>Aparelhos conectados</strong></li>
                    <li>Toque em <strong>Conectar um aparelho</strong></li>
                    <li>Aponte seu celular para esta tela para escanear o QR Code</li>
                  </ol>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">QR Code não disponível</p>
            )}
          </div>
          <DialogFooter>
            <Button onClick={handleCloseQrModal}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
