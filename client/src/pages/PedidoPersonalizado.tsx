import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface Basket {
  id: number;
  name: string;
  description: string;
  imagePath?: string;
}

interface ServiceRegion {
  id: number;
  name: string;
  isActive: boolean;
}

interface LooseItem {
  id: number;
  name: string;
  category: string;
  isActive: boolean;
}

interface SelectedItem {
  itemId: number;
  itemName: string;
  category: string;
  quantity: number;
}

export default function PedidoPersonalizado() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [basket, setBasket] = useState<Basket | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [serviceRegions, setServiceRegions] = useState<ServiceRegion[]>([]);
  const [whatsappNumber, setWhatsappNumber] = useState("");

  // Form state
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerCpf, setCustomerCpf] = useState("");
  const [customerWhatsapp, setCustomerWhatsapp] = useState("");

  // Address fields
  const [street, setStreet] = useState("");
  const [number, setNumber] = useState("");
  const [cep, setCep] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [city, setCity] = useState("");
  const [reference, setReference] = useState("");

  // Delivery address fields
  const [deliveryStreet, setDeliveryStreet] = useState("");
  const [deliveryNumber, setDeliveryNumber] = useState("");
  const [deliveryCep, setDeliveryCep] = useState("");
  const [deliveryNeighborhood, setDeliveryNeighborhood] = useState("");
  const [deliveryCity, setDeliveryCity] = useState("");
  const [deliveryReference, setDeliveryReference] = useState("");

  const [sameAddress, setSameAddress] = useState(true);
  const [frequency, setFrequency] = useState<"semanal" | "quinzenal" | "mensal">("mensal");
  const [observations, setObservations] = useState("");

  // Loose items state
  const [looseItems, setLooseItems] = useState<LooseItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const basketId = params.get("basketId");

    if (!basketId) {
      toast({
        title: "Erro",
        description: "Nenhuma cesta selecionada",
        variant: "destructive"
      });
      setLocation("/planos");
      return;
    }

    const fetchBasket = async () => {
      try {
        const response = await fetch(`/api/baskets/${basketId}`);
        if (response.ok) {
          const data = await response.json();
          setBasket(data.basket);
        } else {
          toast({
            title: "Erro",
            description: "Cesta não encontrada",
            variant: "destructive"
          });
          setLocation("/planos");
        }
      } catch (error) {
        console.error("Failed to fetch basket:", error);
        toast({
          title: "Erro",
          description: "Erro ao carregar cesta",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBasket();

    // Fetch service regions
    const fetchServiceRegions = async () => {
      try {
        const response = await fetch('/api/service-regions');
        if (response.ok) {
          const data = await response.json();
          setServiceRegions(data.regions || []);
        }
      } catch (error) {
        console.error("Failed to fetch service regions:", error);
      }
    };
    fetchServiceRegions();

    // Fetch contact info for WhatsApp
    const fetchContactInfo = async () => {
      try {
        const response = await fetch('/api/contact-info');
        if (response.ok) {
          const data = await response.json();
          if (data.contactInfo?.whatsapp) {
            setWhatsappNumber(data.contactInfo.whatsapp.replace(/\D/g, ''));
          }
        }
      } catch (error) {
        console.error("Failed to fetch contact info:", error);
      }
    };
    fetchContactInfo();

    // Fetch loose items
    const fetchLooseItems = async () => {
      try {
        const response = await fetch('/api/loose-items');
        if (response.ok) {
          const data = await response.json();
          setLooseItems(data.items?.filter((item: LooseItem) => item.isActive) || []);
        }
      } catch (error) {
        console.error("Failed to fetch loose items:", error);
      }
    };
    fetchLooseItems();
  }, [toast, setLocation]);

  useEffect(() => {
    if (sameAddress) {
      setDeliveryStreet(street);
      setDeliveryNumber(number);
      setDeliveryCep(cep);
      setDeliveryNeighborhood(neighborhood);
      setDeliveryCity(city);
      setDeliveryReference(reference);
    }
  }, [street, number, cep, neighborhood, city, reference, sameAddress]);

  const formatCpf = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    return value;
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    return value;
  };

  const formatCep = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 8) {
      return numbers.replace(/(\d{5})(\d{3})/, '$1-$2');
    }
    return value;
  };

  const buildAddress = () => {
    return `${street}, ${number} - ${neighborhood} - ${city} - CEP: ${cep}${reference ? ` - Ref: ${reference}` : ''}`;
  };

  const buildDeliveryAddress = () => {
    if (sameAddress) {
      return buildAddress();
    }
    return `${deliveryStreet}, ${deliveryNumber} - ${deliveryNeighborhood} - ${deliveryCity} - CEP: ${deliveryCep}${deliveryReference ? ` - Ref: ${deliveryReference}` : ''}`;
  };

  // Get items by category
  const getItemsByCategory = (category: string) => {
    return looseItems.filter(item => item.category === category);
  };

  // Add item to selection
  const addItem = (item: LooseItem) => {
    const existingItem = selectedItems.find(si => si.itemId === item.id);
    if (existingItem) {
      setSelectedItems(prev =>
        prev.map(si => si.itemId === item.id ? { ...si, quantity: si.quantity + 1 } : si)
      );
    } else {
      setSelectedItems(prev => [...prev, {
        itemId: item.id,
        itemName: item.name,
        category: item.category,
        quantity: 1
      }]);
    }
  };

  // Remove item from selection
  const removeItem = (itemId: number) => {
    setSelectedItems(prev => {
      const item = prev.find(si => si.itemId === itemId);
      if (item && item.quantity > 1) {
        return prev.map(si => si.itemId === itemId ? { ...si, quantity: si.quantity - 1 } : si);
      }
      return prev.filter(si => si.itemId !== itemId);
    });
  };

  // Get quantity of selected item
  const getItemQuantity = (itemId: number) => {
    return selectedItems.find(si => si.itemId === itemId)?.quantity || 0;
  };

  // Format selected items for order
  const formatSelectedItems = () => {
    if (selectedItems.length === 0) return "";

    const categories = ["Frutas", "Legumes", "Verduras", "Temperos"];
    const formattedByCategory = categories.map(category => {
      const items = selectedItems.filter(si => si.category === category);
      if (items.length === 0) return null;
      return `${category}: ${items.map(i => `${i.itemName} (${i.quantity}x)`).join(", ")}`;
    }).filter(Boolean);

    return formattedByCategory.join(" | ");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!basket) return;

    setSubmitting(true);

    try {
      const itemsList = formatSelectedItems();
      const fullObservations = itemsList
        ? `Itens Selecionados: ${itemsList}\n\n${observations}`
        : observations;

      const orderData = {
        basketId: basket.id,
        customerName,
        customerEmail,
        customerCpf: customerCpf.replace(/\D/g, ''),
        customerWhatsapp: customerWhatsapp.replace(/\D/g, ''),
        customerAddress: buildAddress(),
        deliveryAddress: buildDeliveryAddress(),
        frequency,
        totalAmount: "0.00",
        excludedItems: fullObservations,
        orderType: "personalizado",
      };

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitted(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        toast({
          title: "Erro ao processar pedido",
          description: data.message || "Tente novamente mais tarde",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Order submission error:", error);
      toast({
        title: "Erro",
        description: "Erro ao processar pedido. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <p className="text-xl text-gray-600">Carregando...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!basket) {
    return null;
  }

  // Success screen
  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <WhatsAppButton />

        <main className="flex-grow bg-[#EFF6EF] py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center">
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="iconify text-green-600" data-icon="mdi:check-circle" data-width="48"></span>
                </div>

                <h1 className="text-3xl font-bold text-[#2E593F] mb-4">
                  Pedido enviado com sucesso!
                </h1>

                <p className="text-gray-600 mb-6">
                  Recebemos as informações da sua cesta personalizada. Nossa equipe vai entrar em contato pelo WhatsApp para calcular o valor, confirmar os detalhes e enviar o link de pagamento.
                </p>

                <p className="text-gray-600 mb-8">
                  Se preferir, você também pode falar com a gente agora:
                </p>

                <a
                  href={`https://wa.me/55${whatsappNumber}?text=${encodeURIComponent(`Olá! Acabei de enviar um pedido personalizado da cesta "${basket.name}". Gostaria de mais informações.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-3 bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors"
                >
                  <span className="iconify" data-icon="mdi:whatsapp" data-width="28"></span>
                  Falar com a equipe HortiBless no WhatsApp
                </a>

                <div className="mt-8 pt-6 border-t">
                  <a
                    href="/planos"
                    className="text-[#2E593F] hover:underline font-medium"
                  >
                    Voltar para Planos
                  </a>
                </div>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <WhatsAppButton />

      <main className="flex-grow bg-[#EFF6EF] py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-[#2E593F] mb-8 text-center">
              Pedido Personalizado
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Form Section */}
              <div className="lg:col-span-2">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Personal Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Dados Pessoais</CardTitle>
                      <CardDescription>Preencha suas informações</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="name">Nome Completo *</Label>
                        <Input
                          id="name"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          required
                          placeholder="Seu nome completo"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="cpf">CPF *</Label>
                          <Input
                            id="cpf"
                            value={customerCpf}
                            onChange={(e) => setCustomerCpf(formatCpf(e.target.value))}
                            required
                            placeholder="000.000.000-00"
                            maxLength={14}
                          />
                        </div>

                        <div>
                          <Label htmlFor="whatsapp">WhatsApp *</Label>
                          <Input
                            id="whatsapp"
                            value={customerWhatsapp}
                            onChange={(e) => setCustomerWhatsapp(formatPhone(e.target.value))}
                            required
                            placeholder="(00) 00000-0000"
                            maxLength={15}
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="email">E-mail *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={customerEmail}
                          onChange={(e) => setCustomerEmail(e.target.value)}
                          required
                          placeholder="seu@email.com"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Address */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Endereço</CardTitle>
                      <CardDescription>Endereço de cadastro</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2">
                          <Label htmlFor="street">Rua *</Label>
                          <Input
                            id="street"
                            value={street}
                            onChange={(e) => setStreet(e.target.value)}
                            required
                            placeholder="Nome da rua"
                          />
                        </div>

                        <div>
                          <Label htmlFor="number">Número *</Label>
                          <Input
                            id="number"
                            value={number}
                            onChange={(e) => setNumber(e.target.value)}
                            required
                            placeholder="Nº"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="cep">CEP *</Label>
                          <Input
                            id="cep"
                            value={cep}
                            onChange={(e) => setCep(formatCep(e.target.value))}
                            required
                            placeholder="00000-000"
                            maxLength={9}
                          />
                        </div>

                        <div>
                          <Label htmlFor="neighborhood">Bairro *</Label>
                          <Input
                            id="neighborhood"
                            value={neighborhood}
                            onChange={(e) => setNeighborhood(e.target.value)}
                            required
                            placeholder="Seu bairro"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="city">Cidade *</Label>
                          <Input
                            id="city"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            required
                            placeholder="Sua cidade"
                          />
                        </div>

                        <div>
                          <Label htmlFor="reference">Referência</Label>
                          <Input
                            id="reference"
                            value={reference}
                            onChange={(e) => setReference(e.target.value)}
                            placeholder="Ponto de referência"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Delivery Address */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Endereço de Entrega</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Service Regions */}
                      {serviceRegions.length > 0 && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                            Regiões de Atendimento:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {serviceRegions.map((region) => (
                              <span
                                key={region.id}
                                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#133903]/10 text-[#133903] dark:bg-[#6a9e24]/20 dark:text-[#6a9e24]"
                              >
                                {region.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="sameAddress"
                          checked={sameAddress}
                          onChange={(e) => setSameAddress(e.target.checked)}
                          className="w-4 h-4"
                        />
                        <Label htmlFor="sameAddress" className="cursor-pointer">
                          Mesmo endereço de cadastro
                        </Label>
                      </div>

                      {!sameAddress && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="md:col-span-2">
                              <Label htmlFor="deliveryStreet">Rua *</Label>
                              <Input
                                id="deliveryStreet"
                                value={deliveryStreet}
                                onChange={(e) => setDeliveryStreet(e.target.value)}
                                required={!sameAddress}
                                placeholder="Nome da rua"
                              />
                            </div>

                            <div>
                              <Label htmlFor="deliveryNumber">Número *</Label>
                              <Input
                                id="deliveryNumber"
                                value={deliveryNumber}
                                onChange={(e) => setDeliveryNumber(e.target.value)}
                                required={!sameAddress}
                                placeholder="Nº"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="deliveryCep">CEP *</Label>
                              <Input
                                id="deliveryCep"
                                value={deliveryCep}
                                onChange={(e) => setDeliveryCep(formatCep(e.target.value))}
                                required={!sameAddress}
                                placeholder="00000-000"
                                maxLength={9}
                              />
                            </div>

                            <div>
                              <Label htmlFor="deliveryNeighborhood">Bairro *</Label>
                              <Input
                                id="deliveryNeighborhood"
                                value={deliveryNeighborhood}
                                onChange={(e) => setDeliveryNeighborhood(e.target.value)}
                                required={!sameAddress}
                                placeholder="Bairro"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="deliveryCity">Cidade *</Label>
                              <Input
                                id="deliveryCity"
                                value={deliveryCity}
                                onChange={(e) => setDeliveryCity(e.target.value)}
                                required={!sameAddress}
                                placeholder="Cidade"
                              />
                            </div>

                            <div>
                              <Label htmlFor="deliveryReference">Referência</Label>
                              <Input
                                id="deliveryReference"
                                value={deliveryReference}
                                onChange={(e) => setDeliveryReference(e.target.value)}
                                placeholder="Ponto de referência"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Subscription Frequency */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Periodicidade da Entrega</CardTitle>
                      <CardDescription>Escolha a frequência de entrega desejada</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Select value={frequency} onValueChange={(value: any) => setFrequency(value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a periodicidade" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mensal">Mensal (1x por mês)</SelectItem>
                          <SelectItem value="quinzenal">Quinzenal (2x por mês)</SelectItem>
                          <SelectItem value="semanal">Semanal (4x por mês)</SelectItem>
                        </SelectContent>
                      </Select>
                    </CardContent>
                  </Card>

                  {/* Item Selection by Category */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Selecione os Itens</CardTitle>
                      <CardDescription>Escolha os itens que deseja receber na sua cesta personalizada</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {["Frutas", "Legumes", "Verduras", "Temperos"].map((category) => {
                        const categoryItems = getItemsByCategory(category);
                        const categorySelectedItems = selectedItems.filter(si => si.category === category);

                        return (
                          <div key={category} className="border rounded-lg p-4">
                            <h4 className="font-semibold text-[#2E593F] mb-3 flex items-center gap-2">
                              <span className="w-3 h-3 rounded-full bg-green-500"></span>
                              {category}
                              {categorySelectedItems.length > 0 && (
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                  {categorySelectedItems.reduce((acc, item) => acc + item.quantity, 0)} item(s)
                                </span>
                              )}
                            </h4>

                            {categoryItems.length > 0 ? (
                              <div className="flex items-center gap-2">
                                <Select
                                  onValueChange={(value) => {
                                    const item = categoryItems.find(i => i.id === parseInt(value));
                                    if (item) addItem(item);
                                  }}
                                >
                                  <SelectTrigger className="flex-1">
                                    <SelectValue placeholder={`Selecione um item de ${category}`} />
                                  </SelectTrigger>
                                  <SelectContent className="max-h-60 overflow-y-auto">
                                    {categoryItems.map((item) => (
                                      <SelectItem key={item.id} value={String(item.id)}>
                                        {item.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            ) : (
                              <p className="text-sm text-gray-500 italic">
                                Nenhum item disponível nesta categoria
                              </p>
                            )}

                            {/* Show selected items for this category */}
                            {categorySelectedItems.length > 0 && (
                              <div className="mt-3 space-y-2">
                                {categorySelectedItems.map((item) => (
                                  <div
                                    key={item.itemId}
                                    className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2"
                                  >
                                    <span className="text-sm text-green-800">{item.itemName}</span>
                                    <div className="flex items-center gap-2">
                                      <button
                                        type="button"
                                        onClick={() => removeItem(item.itemId)}
                                        className="w-7 h-7 flex items-center justify-center bg-red-100 hover:bg-red-200 text-red-600 rounded-full text-sm font-bold transition-colors"
                                      >
                                        −
                                      </button>
                                      <span className="w-8 text-center text-sm font-semibold text-green-700">
                                        {item.quantity}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const looseItem = looseItems.find(li => li.id === item.itemId);
                                          if (looseItem) addItem(looseItem);
                                        }}
                                        className="w-7 h-7 flex items-center justify-center bg-green-100 hover:bg-green-200 text-green-600 rounded-full text-sm font-bold transition-colors"
                                      >
                                        +
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {/* Summary of selected items */}
                      {selectedItems.length > 0 && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <h4 className="font-semibold text-green-800 mb-2">Resumo dos Itens Selecionados:</h4>
                          <div className="space-y-1">
                            {["Frutas", "Legumes", "Verduras", "Temperos"].map((category) => {
                              const items = selectedItems.filter(si => si.category === category);
                              if (items.length === 0) return null;
                              return (
                                <p key={category} className="text-sm text-green-700">
                                  <strong>{category}:</strong> {items.map(i => `${i.itemName} (${i.quantity}x)`).join(", ")}
                                </p>
                              );
                            })}
                          </div>
                          <p className="text-xs text-green-600 mt-2">
                            Total: {selectedItems.reduce((acc, item) => acc + item.quantity, 0)} item(s) selecionado(s)
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Observations */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Observações</CardTitle>
                      <CardDescription>Descreva suas preferências e necessidades</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="observations">
                          Observações do Pedido
                        </Label>
                        <Textarea
                          id="observations"
                          value={observations}
                          onChange={(e) => setObservations(e.target.value)}
                          placeholder="Descreva aqui suas preferências, itens desejados, quantidades aproximadas, etc..."
                          className="min-h-[120px]"
                        />
                      </div>

                      {/* Como funciona */}
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                        <h4 className="font-bold text-blue-800 mb-3">Como funciona a continuação do seu pedido</h4>
                        <p className="text-sm text-blue-700 mb-3">Após o envio das suas informações, nossa equipe irá:</p>
                        <ol className="text-sm text-blue-700 space-y-2 list-decimal list-inside">
                          <li>Analisar os itens selecionados e a periodicidade desejada;</li>
                          <li>Calcular o valor da sua cesta personalizada;</li>
                          <li>Confirmar os detalhes com você pelo WhatsApp;</li>
                          <li>Enviar o link para pagamento e agendar a primeira entrega.</li>
                        </ol>
                        <div className="mt-4 pt-3 border-t border-blue-200">
                          <p className="text-xs text-blue-600 font-medium">
                            <strong>Importante:</strong> o envio deste formulário ainda não confirma a contratação do plano. A assinatura só é concluída após a validação das informações com a nossa equipe e o pagamento do pedido.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Button
                    type="submit"
                    className="w-full bg-[#133903] hover:bg-[#0f2b02] text-white py-6 text-lg font-semibold"
                    disabled={submitting}
                  >
                    {submitting ? "Enviando..." : "Enviar Pedido"}
                  </Button>
                </form>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <Card className="sticky top-4">
                  <CardHeader>
                    <CardTitle>Resumo do Pedido</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="border-b pb-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Periodicidade:</span>
                        <span className="font-semibold capitalize">{frequency}</span>
                      </div>

                      <div className="flex justify-between text-sm">
                        <span>Entregas por mês:</span>
                        <span className="font-semibold">
                          {frequency === "semanal" ? "4x" : frequency === "quinzenal" ? "2x" : "1x"}
                        </span>
                      </div>
                    </div>

                    {/* Selected Items Summary */}
                    {selectedItems.length > 0 ? (
                      <div className="space-y-3">
                        <h4 className="font-semibold text-[#2E593F]">Itens Selecionados:</h4>
                        {["Frutas", "Legumes", "Verduras", "Temperos"].map((category) => {
                          const items = selectedItems.filter(si => si.category === category);
                          if (items.length === 0) return null;
                          return (
                            <div key={category} className="text-sm">
                              <p className="font-medium text-gray-700">{category}:</p>
                              <ul className="ml-2 text-gray-600">
                                {items.map(item => (
                                  <li key={item.itemId}>• {item.itemName} ({item.quantity}x)</li>
                                ))}
                              </ul>
                            </div>
                          );
                        })}
                        <div className="border-t pt-2 mt-2">
                          <p className="text-sm font-semibold text-[#2E593F]">
                            Total: {selectedItems.reduce((acc, item) => acc + item.quantity, 0)} item(s)
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                        <p className="text-gray-500 text-sm">
                          Nenhum item selecionado ainda.
                        </p>
                        <p className="text-gray-400 text-xs mt-1">
                          Selecione os itens desejados no formulário ao lado.
                        </p>
                      </div>
                    )}

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
                      <p className="font-semibold mb-2">Como funciona:</p>
                      <ul className="space-y-2 text-xs">
                        <li>1. Preencha seus dados e envie o pedido</li>
                        <li>2. Nossa equipe entrará em contato pelo WhatsApp</li>
                        <li>3. Juntos definiremos os itens e valores</li>
                        <li>4. Você confirma e recebe sua cesta personalizada</li>
                      </ul>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800">
                      <p className="font-semibold mb-1">Plano Personalizado</p>
                      <p className="text-xs">
                        Monte sua cesta do seu jeito! Escolha os itens, quantidades e frequência que melhor atendem suas necessidades.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
