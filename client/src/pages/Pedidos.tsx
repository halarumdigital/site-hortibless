import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table as TableUI, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Menu, ShoppingCart, Eye, Download, FileText, Edit as EditIcon } from "lucide-react";
import { DashboardSidebar } from "@/components/DashboardSidebar";

interface OneTimePurchase {
  id: number;
  basketId: number;
  customerName: string;
  customerCpf: string;
  customerEmail: string;
  customerWhatsapp: string;
  customerAddress: string;
  deliveryAddress: string;
  totalAmount: string;
  paymentMethod: string;
  excludedItems?: string;
  cardNumber?: string;
  cardName?: string;
  cardExpiry?: string;
  cardCvv?: string;
  asaasCustomerId?: string;
  asaasPaymentId?: string;
  asaasBankSlipUrl?: string;
  asaasPixQrCode?: string;
  asaasPixPayload?: string;
  status: string;
  createdAt: Date;
}

interface Order {
  id: number;
  basketId: number;
  customerName: string;
  customerEmail: string;
  customerCpf: string;
  customerWhatsapp: string;
  customerAddress: string;
  deliveryAddress: string;
  frequency: string;
  totalAmount: string;
  excludedItems?: string;
  status: string;
  asaasCustomerId?: string;
  asaasSubscriptionId?: string;
  createdAt: Date;
}

type CombinedOrder = (OneTimePurchase | Order) & { orderType: 'avulsa' | 'assinatura' };

interface Basket {
  id: number;
  name: string;
  description?: string;
  priceLoose?: string;
  priceSubscription?: string;
}

export default function Pedidos() {
  const { user, isLoading: authLoading } = useAuth(true);
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [viewingOrder, setViewingOrder] = useState<CombinedOrder | null>(null);
  const [viewingBasket, setViewingBasket] = useState<Basket | null>(null);
  const [editingStatus, setEditingStatus] = useState<{ id: number; type: 'avulsa' | 'assinatura' } | null>(null);
  const [combinedOrders, setCombinedOrders] = useState<CombinedOrder[]>([]);

  const { data: purchasesData, isLoading: purchasesLoading, refetch: refetchPurchases } = useQuery<{ success: boolean; purchases: OneTimePurchase[] }>({
    queryKey: ["/api/one-time-purchases"],
    enabled: !!user,
  });

  const { data: ordersData, isLoading: ordersLoading, refetch: refetchOrders } = useQuery<{ success: boolean; orders: Order[] }>({
    queryKey: ["/api/orders"],
    enabled: !!user,
  });

  // Combinar compras avulsas e assinaturas
  const isLoading = purchasesLoading || ordersLoading;

  React.useEffect(() => {
    const purchases: CombinedOrder[] = (purchasesData?.purchases || []).map(p => ({
      ...p,
      orderType: 'avulsa' as const
    }));

    const orders: CombinedOrder[] = (ordersData?.orders || []).map(o => ({
      ...o,
      orderType: 'assinatura' as const
    }));

    const combined = [...purchases, ...orders].sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    setCombinedOrders(combined);
  }, [purchasesData, ordersData]);

  const refetch = () => {
    refetchPurchases();
    refetchOrders();
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST" });
      toast({ title: "Logged out successfully" });
      setLocation("/login");
    } catch (error) {
      console.error("Logout error:", error);
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
      active: { label: "Ativa", variant: "default" },
    };
    const statusInfo = statusMap[status] || { label: status, variant: "outline" as const };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  const getStatusOptions = (orderType: 'avulsa' | 'assinatura') => {
    if (orderType === 'assinatura') {
      return [
        { value: "pending", label: "Pendente" },
        { value: "active", label: "Ativa" },
        { value: "cancelled", label: "Cancelada" },
      ];
    }
    return [
      { value: "pending", label: "Pendente" },
      { value: "confirmed", label: "Confirmado" },
      { value: "paid", label: "Pago" },
      { value: "processing", label: "Processando" },
      { value: "completed", label: "Entregue" },
      { value: "cancelled", label: "Cancelado" },
    ];
  };

  const getPaymentMethodLabel = (method: string) => {
    const methods: Record<string, string> = {
      pix: "PIX",
      boleto: "Boleto",
      cartao: "Cartão de Crédito",
    };
    return methods[method] || method;
  };

  const handleViewOrder = async (order: CombinedOrder) => {
    setViewingOrder(order);

    // Buscar dados da cesta
    try {
      const response = await fetch(`/api/baskets/${order.basketId}`);
      const data = await response.json();
      if (data.success) {
        setViewingBasket(data.basket);
      }
    } catch (error) {
      console.error("Error fetching basket:", error);
    }
  };

  const handleStatusChange = async (orderId: number, orderType: 'avulsa' | 'assinatura', newStatus: string) => {
    try {
      const endpoint = orderType === 'assinatura'
        ? `/api/orders/${orderId}/status`
        : `/api/one-time-purchases/${orderId}/status`;

      const response = await fetch(endpoint, {
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
            <div class="info-row"><span class="label">Endereço de Cadastro:</span><span class="value">${purchase.customerAddress}</span></div>
          </div>

          <div class="section">
            <h2>Endereço de Entrega</h2>
            <div class="info-row"><span class="value">${purchase.deliveryAddress}</span></div>
          </div>

          ${purchase.excludedItems ? `
          <div class="section">
            <h2>⚠️ Itens que o Cliente NÃO Deseja Receber</h2>
            <div class="info-row" style="background: #FFF3E0; padding: 15px; border-radius: 8px; border-left: 4px solid #FF9800;">
              <span class="value" style="color: #E65100; font-weight: bold;">${purchase.excludedItems}</span>
            </div>
          </div>
          ` : ''}

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

  const handleDownloadSubscriptionPDF = async (order: Order) => {
    try {
      // Buscar dados da cesta primeiro
      const basketResponse = await fetch(`/api/baskets/${order.basketId}`);
      const basketData = await basketResponse.json();
      const basket = basketData.success ? basketData.basket : null;

      // Criar conteúdo HTML para o PDF
      const content = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Assinatura #${order.id}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; }
            .header { border-bottom: 2px solid #133903; padding-bottom: 20px; margin-bottom: 30px; }
            .header h1 { color: #133903; margin: 0; }
            .badge {
              display: inline-block;
              background: #133903;
              color: white;
              padding: 4px 12px;
              border-radius: 4px;
              font-size: 14px;
              margin-left: 10px;
            }
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
            .highlight {
              background: #EFF6EF;
              padding: 15px;
              border-radius: 8px;
              margin: 15px 0;
              border-left: 4px solid #133903;
            }
            .highlight .big-value {
              font-size: 24px;
              font-weight: bold;
              color: #133903;
              margin: 5px 0;
            }
            .footer { margin-top: 40px; text-align: center; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Assinatura #${order.id}<span class="badge">ASSINATURA</span></h1>
            <p>Data da Contratação: ${formatDate(order.createdAt)}</p>
          </div>

          <div class="highlight">
            <div class="info-row">
              <span class="label">Frequência:</span>
              <span class="value" style="text-transform: capitalize; font-size: 18px; font-weight: bold;">${order.frequency}</span>
            </div>
            <div class="info-row">
              <span class="label">Valor Mensal:</span>
              <div class="big-value">R$ ${order.totalAmount}</div>
            </div>
            <div class="info-row">
              <span class="label">Cobranças:</span>
              <span class="value">Mensalmente no dia ${new Date(order.createdAt).getDate()}</span>
            </div>
          </div>

          <div class="section">
            <h2>Informações do Cliente</h2>
            <div class="info-row"><span class="label">Nome:</span><span class="value">${order.customerName}</span></div>
            <div class="info-row"><span class="label">CPF:</span><span class="value">${order.customerCpf}</span></div>
            <div class="info-row"><span class="label">Email:</span><span class="value">${order.customerEmail}</span></div>
            <div class="info-row"><span class="label">WhatsApp:</span><span class="value">${order.customerWhatsapp}</span></div>
            <div class="info-row"><span class="label">Endereço de Cadastro:</span><span class="value">${order.customerAddress}</span></div>
          </div>

          <div class="section">
            <h2>Endereço de Entrega</h2>
            <div class="info-row"><span class="value">${order.deliveryAddress}</span></div>
          </div>

          ${order.excludedItems ? `
          <div class="section">
            <h2>⚠️ Itens que o Cliente NÃO Deseja Receber</h2>
            <div class="info-row" style="background: #FFF3E0; padding: 15px; border-radius: 8px; border-left: 4px solid #FF9800;">
              <span class="value" style="color: #E65100; font-weight: bold;">${order.excludedItems}</span>
            </div>
          </div>
          ` : ''}

          <div class="section">
            <h2>Informações do Produto</h2>
            <div class="info-row"><span class="label">Cesta:</span><span class="value">${basket?.name || 'N/A'}</span></div>
            ${basket?.description ? `<div class="info-row"><span class="label">Descrição:</span><span class="value">${basket.description}</span></div>` : ''}
            <div class="info-row"><span class="label">Valor por Entrega:</span><span class="value">${formatCurrency(basket?.priceSubscription)}</span></div>
            <div class="info-row"><span class="label">Entregas por Mês:</span><span class="value">${
              order.frequency === 'semanal' ? '4 entregas (toda semana)' :
              order.frequency === 'quinzenal' ? '2 entregas (a cada 15 dias)' :
              '1 entrega (mensal)'
            }</span></div>
          </div>

          <div class="section">
            <h2>Informações da Assinatura</h2>
            <div class="info-row"><span class="label">Status:</span><span class="value status">${order.status.toUpperCase()}</span></div>
            <div class="info-row"><span class="label">Tipo de Cobrança:</span><span class="value">Cartão de Crédito (Recorrente)</span></div>
            ${order.asaasCustomerId ? `<div class="info-row"><span class="label">ID Cliente Asaas:</span><span class="value">${order.asaasCustomerId}</span></div>` : ''}
            ${order.asaasSubscriptionId ? `<div class="info-row"><span class="label">ID Assinatura Asaas:</span><span class="value">${order.asaasSubscriptionId}</span></div>` : ''}
          </div>

          <div class="highlight">
            <h3 style="margin-top: 0; color: #133903;">Como Funciona:</h3>
            <p style="margin: 8px 0;">✅ Você recebe ${
              order.frequency === 'semanal' ? '4 cestas por mês' :
              order.frequency === 'quinzenal' ? '2 cestas por mês' :
              '1 cesta por mês'
            }</p>
            <p style="margin: 8px 0;">💳 Cobrança MENSAL de R$ ${order.totalAmount}</p>
            <p style="margin: 8px 0;">📅 Cobrado sempre no dia ${new Date(order.createdAt).getDate()} de cada mês</p>
          </div>

          <div class="footer">
            <p>Documento gerado em ${new Date().toLocaleString('pt-BR')}</p>
            <p style="margin-top: 10px; font-size: 10px;">Este é um documento de assinatura recorrente. As cobranças são realizadas automaticamente.</p>
          </div>
        </body>
        </html>
      `;

      // Criar um blob e fazer download
      const blob = new Blob([content], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `assinatura-${order.id}.html`;
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
      <DashboardSidebar
        user={user}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        onLogout={handleLogout}
        currentPath={location}
      />

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
                Gerencie todos os pedidos (compras avulsas e assinaturas)
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Lista de Pedidos</CardTitle>
                <CardDescription>
                  {combinedOrders.length} pedido(s) registrado(s)
                  {' '}({(purchasesData?.purchases?.length || 0)} avulsa(s), {(ordersData?.orders?.length || 0)} assinatura(s))
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">Carregando...</div>
                ) : combinedOrders.length > 0 ? (
                  <div className="overflow-x-auto">
                    <TableUI>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[80px]">ID</TableHead>
                          <TableHead className="w-[100px]">Tipo</TableHead>
                          <TableHead>Cliente</TableHead>
                          <TableHead>Data</TableHead>
                          <TableHead>Pagamento/Frequência</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {combinedOrders.map((order) => (
                          <TableRow key={`${order.orderType}-${order.id}`}>
                            <TableCell className="font-medium">#{order.id}</TableCell>
                            <TableCell>
                              <Badge variant={order.orderType === 'assinatura' ? 'default' : 'outline'}>
                                {order.orderType === 'assinatura' ? 'Assinatura' : 'Avulsa'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">{order.customerName}</div>
                                <div className="text-sm text-gray-500">{order.customerEmail}</div>
                              </div>
                            </TableCell>
                            <TableCell>{formatDate(order.createdAt)}</TableCell>
                            <TableCell>
                              {order.orderType === 'assinatura'
                                ? `${(order as Order).frequency.charAt(0).toUpperCase() + (order as Order).frequency.slice(1)} - R$ ${(order as Order).totalAmount}`
                                : getPaymentMethodLabel((order as OneTimePurchase).paymentMethod)
                              }
                            </TableCell>
                            <TableCell>
                              {editingStatus && editingStatus.id === order.id && editingStatus.type === order.orderType ? (
                                <Select
                                  defaultValue={order.status}
                                  onValueChange={(value) => handleStatusChange(order.id, order.orderType, value)}
                                >
                                  <SelectTrigger className="w-[140px]">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {getStatusOptions(order.orderType).map((option) => (
                                      <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              ) : (
                                <div className="flex items-center gap-2">
                                  {getStatusBadge(order.status)}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setEditingStatus({ id: order.id, type: order.orderType })}
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
                                  onClick={() => handleViewOrder(order)}
                                >
                                  <Eye className="w-4 h-4 mr-1" />
                                  Ver
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => order.orderType === 'assinatura'
                                    ? handleDownloadSubscriptionPDF(order as Order)
                                    : handleDownloadPDF(order as OneTimePurchase)
                                  }
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

      {/* View Order Dialog */}
      <Dialog open={!!viewingOrder} onOpenChange={(open) => !open && setViewingOrder(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Detalhes do Pedido #{viewingOrder?.id}
              {viewingOrder && (
                <Badge className="ml-2" variant={viewingOrder.orderType === 'assinatura' ? 'default' : 'outline'}>
                  {viewingOrder.orderType === 'assinatura' ? 'Assinatura' : 'Avulsa'}
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription>
              Pedido realizado em {viewingOrder && formatDate(viewingOrder.createdAt)}
            </DialogDescription>
          </DialogHeader>

          {viewingOrder && (
            <div className="space-y-6">
              {/* Status e Pagamento/Frequência */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <div className="mt-1">{getStatusBadge(viewingOrder.status)}</div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    {viewingOrder.orderType === 'assinatura' ? 'Frequência' : 'Método de Pagamento'}
                  </p>
                  <p className="mt-1">
                    {viewingOrder.orderType === 'assinatura'
                      ? `${(viewingOrder as Order).frequency.charAt(0).toUpperCase() + (viewingOrder as Order).frequency.slice(1)}`
                      : getPaymentMethodLabel((viewingOrder as OneTimePurchase).paymentMethod)
                    }
                  </p>
                </div>
              </div>

              {/* Valor Total para Assinaturas */}
              {viewingOrder.orderType === 'assinatura' && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Valor Mensal</p>
                  <p className="text-2xl font-bold text-[#133903] mt-1">
                    R$ {(viewingOrder as Order).totalAmount}
                  </p>
                </div>
              )}

              {/* Informações do Cliente */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-[#133903]">Informações do Cliente</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Nome</p>
                    <p className="mt-1">{viewingOrder.customerName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">CPF</p>
                    <p className="mt-1">{viewingOrder.customerCpf}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p className="mt-1">{viewingOrder.customerEmail}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">WhatsApp</p>
                    <p className="mt-1">{viewingOrder.customerWhatsapp}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm font-medium text-gray-500">Endereço de Cadastro</p>
                    <p className="mt-1">
                      {viewingOrder.orderType === 'assinatura'
                        ? (viewingOrder as Order).customerAddress
                        : (viewingOrder as OneTimePurchase).customerAddress
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Endereço de Entrega */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-[#133903]">Endereço de Entrega</h3>
                <p>
                  {viewingOrder.orderType === 'assinatura'
                    ? (viewingOrder as Order).deliveryAddress
                    : (viewingOrder as OneTimePurchase).deliveryAddress
                  }
                </p>
              </div>

              {/* Itens Excluídos */}
              {viewingOrder.excludedItems && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-[#133903]">Itens que o Cliente NÃO Deseja Receber</h3>
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <p className="text-sm font-medium text-orange-800 mb-2">⚠️ Observação Importante:</p>
                    <p className="text-gray-700 whitespace-pre-wrap">{viewingOrder.excludedItems}</p>
                  </div>
                </div>
              )}

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
              {(viewingOrder.orderType === 'avulsa' && (viewingOrder as OneTimePurchase).asaasPaymentId) ||
               (viewingOrder.orderType === 'assinatura' && (viewingOrder as Order).asaasSubscriptionId) ? (
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-[#133903]">Informações Asaas</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">ID do Cliente</p>
                      <p className="mt-1 text-sm font-mono">{viewingOrder.asaasCustomerId}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        {viewingOrder.orderType === 'assinatura' ? 'ID da Assinatura' : 'ID do Pagamento'}
                      </p>
                      <p className="mt-1 text-sm font-mono">
                        {viewingOrder.orderType === 'assinatura'
                          ? (viewingOrder as Order).asaasSubscriptionId
                          : (viewingOrder as OneTimePurchase).asaasPaymentId
                        }
                      </p>
                    </div>
                  </div>
                  {viewingOrder.orderType === 'avulsa' && (viewingOrder as OneTimePurchase).asaasBankSlipUrl && (
                    <div className="mt-4">
                      <Button
                        variant="outline"
                        onClick={() => window.open((viewingOrder as OneTimePurchase).asaasBankSlipUrl, '_blank')}
                      >
                        Ver Boleto
                      </Button>
                    </div>
                  )}
                </div>
              ) : null}

              {/* Botão Download PDF */}
              <div className="flex justify-end pt-4 border-t">
                <Button onClick={() => viewingOrder.orderType === 'assinatura'
                  ? handleDownloadSubscriptionPDF(viewingOrder as Order)
                  : handleDownloadPDF(viewingOrder as OneTimePurchase)
                }>
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
