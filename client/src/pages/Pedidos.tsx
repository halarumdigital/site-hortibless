import { useAuth } from "@/hooks/useAuth";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table as TableUI, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LogOut, Menu, X, Users, Settings, Phone, Image, Images, MessageSquare, MapPin, HelpCircle, Calendar, Table, Package, ShoppingBasket, Mail, Code, ShoppingCart, Eye, Download, FileText, Edit as EditIcon } from "lucide-react";

interface OneTimePurchase {
  id: number;
  basketId: number;
  customerName: string;
  customerCpf: string;
  customerEmail: string;
  customerWhatsapp: string;
  customerStreet: string;
  customerNumber: string;
  customerCep: string;
  customerNeighborhood: string;
  customerCity: string;
  customerReference?: string;
  deliveryStreet: string;
  deliveryNumber: string;
  deliveryCep: string;
  deliveryNeighborhood: string;
  deliveryCity: string;
  deliveryReference?: string;
  paymentMethod: string;
  asaasCustomerId?: string;
  asaasPaymentId?: string;
  asaasBankSlipUrl?: string;
  asaasPixQrCode?: string;
  asaasPixPayload?: string;
  status: string;
  createdAt: Date;
}

interface Basket {
  id: number;
  name: string;
  description?: string;
  priceLoose?: string;
}

export default function Pedidos() {
  const { user, isLoading: authLoading } = useAuth(true);
  const { settings } = useSiteSettings();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [viewingPurchase, setViewingPurchase] = useState<OneTimePurchase | null>(null);
  const [viewingBasket, setViewingBasket] = useState<Basket | null>(null);
  const [editingStatus, setEditingStatus] = useState<number | null>(null);

  const { data: purchasesData, isLoading: purchasesLoading, refetch } = useQuery<{ success: boolean; purchases: OneTimePurchase[] }>({
    queryKey: ["/api/one-time-purchases"],
    enabled: !!user,
  });

  const logoutMutation = async () => {
    const response = await fetch("/api/logout", { method: "POST" });
    if (response.ok) {
      toast({ title: "Logged out successfully" });
      setLocation("/login");
    }
  };

  const formatCurrency = (value?: string) => {
    if (!value) return "N/A";
    const num = parseFloat(value);
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(num);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      pending: { label: "Pendente", variant: "outline" },
      confirmed: { label: "Confirmado", variant: "secondary" },
      paid: { label: "Pago", variant: "default" },
      processing: { label: "Processando", variant: "default" },
      completed: { label: "Entregue", variant: "default" },
      cancelled: { label: "Cancelado", variant: "destructive" },
    };
    const statusInfo = statusMap[status] || { label: status, variant: "outline" as const };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  const getStatusOptions = () => [
    { value: "pending", label: "Pendente" },
    { value: "confirmed", label: "Confirmado" },
    { value: "paid", label: "Pago" },
    { value: "processing", label: "Processando" },
    { value: "completed", label: "Entregue" },
    { value: "cancelled", label: "Cancelado" },
  ];

  const getPaymentMethodLabel = (method: string) => {
    const methods: Record<string, string> = {
      pix: "PIX",
      boleto: "Boleto",
      cartao: "Cartão de Crédito",
    };
    return methods[method] || method;
  };

  const handleViewPurchase = async (purchase: OneTimePurchase) => {
    setViewingPurchase(purchase);

    // Buscar dados da cesta
    try {
      const response = await fetch(`/api/baskets/${purchase.basketId}`);
      const data = await response.json();
      if (data.success) {
        setViewingBasket(data.basket);
      }
    } catch (error) {
      console.error("Error fetching basket:", error);
    }
  };

  const handleStatusChange = async (purchaseId: number, newStatus: string) => {
    try {
      const response = await fetch(`/api/one-time-purchases/${purchaseId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Status atualizado",
          description: "O status do pedido foi atualizado com sucesso.",
        });
        refetch();
        setEditingStatus(null);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Erro ao atualizar status",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadPDF = async (purchase: OneTimePurchase) => {
    try {
      // Buscar dados da cesta primeiro
      const basketResponse = await fetch(`/api/baskets/${purchase.basketId}`);
      const basketData = await basketResponse.json();
      const basket = basketData.success ? basketData.basket : null;

      // Criar conteúdo HTML para o PDF
      const content = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Pedido #${purchase.id}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; }
            .header { border-bottom: 2px solid #133903; padding-bottom: 20px; margin-bottom: 30px; }
            .header h1 { color: #133903; margin: 0; }
            .section { margin-bottom: 25px; }
            .section h2 { color: #133903; border-bottom: 1px solid #ddd; padding-bottom: 8px; }
            .info-row { margin: 8px 0; }
            .label { font-weight: bold; display: inline-block; width: 180px; }
            .value { display: inline-block; }
            .status {
              display: inline-block;
              padding: 4px 12px;
              border-radius: 4px;
              background: #f0f0f0;
              font-weight: bold;
            }
            .footer { margin-top: 40px; text-align: center; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Pedido #${purchase.id}</h1>
            <p>Data: ${formatDate(purchase.createdAt)}</p>
          </div>

          <div class="section">
            <h2>Informações do Cliente</h2>
            <div class="info-row"><span class="label">Nome:</span><span class="value">${purchase.customerName}</span></div>
            <div class="info-row"><span class="label">CPF:</span><span class="value">${purchase.customerCpf}</span></div>
            <div class="info-row"><span class="label">Email:</span><span class="value">${purchase.customerEmail}</span></div>
            <div class="info-row"><span class="label">WhatsApp:</span><span class="value">${purchase.customerWhatsapp}</span></div>
            <div class="info-row"><span class="label">Endereço:</span><span class="value">${purchase.customerStreet}, ${purchase.customerNumber}</span></div>
            <div class="info-row"><span class="label">Bairro:</span><span class="value">${purchase.customerNeighborhood}</span></div>
            <div class="info-row"><span class="label">Cidade:</span><span class="value">${purchase.customerCity}</span></div>
            <div class="info-row"><span class="label">CEP:</span><span class="value">${purchase.customerCep}</span></div>
            ${purchase.customerReference ? `<div class="info-row"><span class="label">Referência:</span><span class="value">${purchase.customerReference}</span></div>` : ''}
          </div>

          <div class="section">
            <h2>Endereço de Entrega</h2>
            <div class="info-row"><span class="label">Rua:</span><span class="value">${purchase.deliveryStreet}, ${purchase.deliveryNumber}</span></div>
            <div class="info-row"><span class="label">Bairro:</span><span class="value">${purchase.deliveryNeighborhood}</span></div>
            <div class="info-row"><span class="label">Cidade:</span><span class="value">${purchase.deliveryCity}</span></div>
            <div class="info-row"><span class="label">CEP:</span><span class="value">${purchase.deliveryCep}</span></div>
            ${purchase.deliveryReference ? `<div class="info-row"><span class="label">Referência:</span><span class="value">${purchase.deliveryReference}</span></div>` : ''}
          </div>

          <div class="section">
            <h2>Informações do Produto</h2>
            <div class="info-row"><span class="label">Cesta:</span><span class="value">${basket?.name || 'N/A'}</span></div>
            ${basket?.description ? `<div class="info-row"><span class="label">Descrição:</span><span class="value">${basket.description}</span></div>` : ''}
            <div class="info-row"><span class="label">Valor:</span><span class="value">${formatCurrency(basket?.priceLoose)}</span></div>
          </div>

          <div class="section">
            <h2>Informações de Pagamento</h2>
            <div class="info-row"><span class="label">Método:</span><span class="value">${getPaymentMethodLabel(purchase.paymentMethod)}</span></div>
            <div class="info-row"><span class="label">Status:</span><span class="value status">${purchase.status.toUpperCase()}</span></div>
            ${purchase.asaasPaymentId ? `<div class="info-row"><span class="label">ID Asaas:</span><span class="value">${purchase.asaasPaymentId}</span></div>` : ''}
          </div>

          <div class="footer">
            <p>Documento gerado em ${new Date().toLocaleString('pt-BR')}</p>
          </div>
        </body>
        </html>
      `;

      // Criar um blob e fazer download
      const blob = new Blob([content], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pedido-${purchase.id}.html`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Download iniciado",
        description: "Abra o arquivo HTML e imprima como PDF através do navegador."
      });
    } catch (error) {
      console.error("Error downloading PDF:", error);
      toast({
        title: "Erro ao gerar PDF",
        description: "Tente novamente mais tarde.",
        variant: "destructive"
      });
    }
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
          <div className="flex items-center justify-center p-4 border-b border-gray-200 dark:border-gray-700 relative">
            {settings?.logoPath && (
              <div className="flex justify-center">
                <img src={settings.logoPath} alt="Logo" className="h-16 object-contain" />
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden absolute right-2"
              onClick={() => setIsSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          <nav className="flex-1 p-4 overflow-y-auto">
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
                className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => setLocation("/dashboard/baskets")}
              >
                <ShoppingBasket className="w-5 h-5" />
                Cestas
              </button>
              <button
                className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => setLocation("/dashboard/duvidas")}
              >
                <Mail className="w-5 h-5" />
                Dúvidas
              </button>
              <button
                className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => setLocation("/dashboard/scripts")}
              >
                <Code className="w-5 h-5" />
                Scripts
              </button>
              <button
                className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md bg-[#133903] text-white"
              >
                <ShoppingCart className="w-5 h-5" />
                Pedidos
              </button>
            </div>
          </nav>

          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-[#133903] flex items-center justify-center text-white font-semibold">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => logoutMutation()}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Pedidos</h1>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Pedidos</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Gerencie todos os pedidos de compra avulsa
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Lista de Pedidos</CardTitle>
                <CardDescription>
                  {purchasesData?.purchases?.length || 0} pedido(s) registrado(s)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {purchasesLoading ? (
                  <div className="text-center py-8">Carregando...</div>
                ) : purchasesData?.purchases && purchasesData.purchases.length > 0 ? (
                  <div className="overflow-x-auto">
                    <TableUI>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[80px]">ID</TableHead>
                          <TableHead>Cliente</TableHead>
                          <TableHead>Data</TableHead>
                          <TableHead>Pagamento</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {purchasesData.purchases.map((purchase) => (
                          <TableRow key={purchase.id}>
                            <TableCell className="font-medium">#{purchase.id}</TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">{purchase.customerName}</div>
                                <div className="text-sm text-gray-500">{purchase.customerEmail}</div>
                              </div>
                            </TableCell>
                            <TableCell>{formatDate(purchase.createdAt)}</TableCell>
                            <TableCell>{getPaymentMethodLabel(purchase.paymentMethod)}</TableCell>
                            <TableCell>
                              {editingStatus === purchase.id ? (
                                <Select
                                  defaultValue={purchase.status}
                                  onValueChange={(value) => handleStatusChange(purchase.id, value)}
                                >
                                  <SelectTrigger className="w-[140px]">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {getStatusOptions().map((option) => (
                                      <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              ) : (
                                <div className="flex items-center gap-2">
                                  {getStatusBadge(purchase.status)}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setEditingStatus(purchase.id)}
                                  >
                                    <EditIcon className="w-3 h-3" />
                                  </Button>
                                </div>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleViewPurchase(purchase)}
                                >
                                  <Eye className="w-4 h-4 mr-1" />
                                  Ver
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDownloadPDF(purchase)}
                                >
                                  <Download className="w-4 h-4 mr-1" />
                                  PDF
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </TableUI>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>Nenhum pedido encontrado</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* View Purchase Dialog */}
      <Dialog open={!!viewingPurchase} onOpenChange={(open) => !open && setViewingPurchase(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Pedido #{viewingPurchase?.id}</DialogTitle>
            <DialogDescription>
              Pedido realizado em {viewingPurchase && formatDate(viewingPurchase.createdAt)}
            </DialogDescription>
          </DialogHeader>

          {viewingPurchase && (
            <div className="space-y-6">
              {/* Status e Pagamento */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <div className="mt-1">{getStatusBadge(viewingPurchase.status)}</div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Método de Pagamento</p>
                  <p className="mt-1">{getPaymentMethodLabel(viewingPurchase.paymentMethod)}</p>
                </div>
              </div>

              {/* Informações do Cliente */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-[#133903]">Informações do Cliente</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Nome</p>
                    <p className="mt-1">{viewingPurchase.customerName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">CPF</p>
                    <p className="mt-1">{viewingPurchase.customerCpf}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p className="mt-1">{viewingPurchase.customerEmail}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">WhatsApp</p>
                    <p className="mt-1">{viewingPurchase.customerWhatsapp}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm font-medium text-gray-500">Endereço</p>
                    <p className="mt-1">
                      {viewingPurchase.customerStreet}, {viewingPurchase.customerNumber} - {viewingPurchase.customerNeighborhood}
                      <br />
                      {viewingPurchase.customerCity} - CEP: {viewingPurchase.customerCep}
                      {viewingPurchase.customerReference && <><br />Ref: {viewingPurchase.customerReference}</>}
                    </p>
                  </div>
                </div>
              </div>

              {/* Endereço de Entrega */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-[#133903]">Endereço de Entrega</h3>
                <p>
                  {viewingPurchase.deliveryStreet}, {viewingPurchase.deliveryNumber} - {viewingPurchase.deliveryNeighborhood}
                  <br />
                  {viewingPurchase.deliveryCity} - CEP: {viewingPurchase.deliveryCep}
                  {viewingPurchase.deliveryReference && <><br />Ref: {viewingPurchase.deliveryReference}</>}
                </p>
              </div>

              {/* Produto */}
              {viewingBasket && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-[#133903]">Produto</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="font-medium">{viewingBasket.name}</p>
                    {viewingBasket.description && (
                      <p className="text-sm text-gray-600 mt-1">{viewingBasket.description}</p>
                    )}
                    <p className="text-lg font-semibold text-[#133903] mt-2">
                      {formatCurrency(viewingBasket.priceLoose)}
                    </p>
                  </div>
                </div>
              )}

              {/* Informações Asaas */}
              {viewingPurchase.asaasPaymentId && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-[#133903]">Informações Asaas</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">ID do Cliente</p>
                      <p className="mt-1 text-sm font-mono">{viewingPurchase.asaasCustomerId}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">ID do Pagamento</p>
                      <p className="mt-1 text-sm font-mono">{viewingPurchase.asaasPaymentId}</p>
                    </div>
                  </div>
                  {viewingPurchase.asaasBankSlipUrl && (
                    <div className="mt-4">
                      <Button
                        variant="outline"
                        onClick={() => window.open(viewingPurchase.asaasBankSlipUrl, '_blank')}
                      >
                        Ver Boleto
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Botão Download PDF */}
              <div className="flex justify-end pt-4 border-t">
                <Button onClick={() => handleDownloadPDF(viewingPurchase)}>
                  <Download className="w-4 h-4 mr-2" />
                  Baixar PDF
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
