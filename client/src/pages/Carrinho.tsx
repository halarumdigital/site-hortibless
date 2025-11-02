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
import { ProductPortfolioModal } from "@/components/ProductPortfolioModal";
import { WhatsAppFreteButton } from "@/components/WhatsAppFreteButton";
import { Package } from "lucide-react";

interface Basket {
  id: number;
  name: string;
  description: string;
  priceLoose: number | null;
  priceSubscription: number | null;
  imagePath?: string;
}

export default function Carrinho() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [basket, setBasket] = useState<Basket | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

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
  const [excludedItems, setExcludedItems] = useState("");
  const [portfolioModalOpen, setPortfolioModalOpen] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const basketId = params.get("basketId");

    if (!basketId) {
      toast({
        title: "Erro",
        description: "Nenhuma cesta selecionada",
        variant: "destructive"
      });
      setLocation("/cestas");
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
          setLocation("/cestas");
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

  const calculateTotal = () => {
    if (!basket?.priceSubscription) return "0.00";

    const basePrice = parseFloat(basket.priceSubscription.toString().replace(/[^\d,]/g, '').replace(',', '.'));

    // Retorna o valor unitário da cesta
    return basePrice.toFixed(2);
  };

  const calculateMonthlyTotal = () => {
    if (!basket?.priceSubscription) return "0.00";

    const basePrice = parseFloat(basket.priceSubscription.toString().replace(/[^\d,]/g, '').replace(',', '.'));

    // Calcula total mensal baseado na frequência
    if (frequency === "semanal") {
      return (basePrice * 4).toFixed(2);
    } else if (frequency === "quinzenal") {
      return (basePrice * 2).toFixed(2);
    } else {
      return basePrice.toFixed(2);
    }
  };

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

  const formatCardNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
  };

  const formatExpiry = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length >= 2) {
      return numbers.replace(/(\d{2})(\d{0,4})/, '$1/$2');
    }
    return numbers;
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!basket) return;

    setSubmitting(true);

    try {
      const orderData = {
        basketId: basket.id,
        customerName,
        customerEmail,
        customerCpf: customerCpf.replace(/\D/g, ''),
        customerWhatsapp: customerWhatsapp.replace(/\D/g, ''),
        customerAddress: buildAddress(),
        deliveryAddress: buildDeliveryAddress(),
        frequency,
        totalAmount: calculateMonthlyTotal(),
        excludedItems,
        cardNumber: cardNumber.replace(/\D/g, ''),
        cardName,
        cardExpiry,
        cardCvv,
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
        toast({
          title: "Pedido realizado com sucesso!",
          description: "Você receberá um e-mail de confirmação em breve.",
        });

        // Redirect to thank you page
        setTimeout(() => {
          setLocation(`/obrigado/${data.order.id}?type=assinatura`);
        }, 2000);
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

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <WhatsAppButton />

      <main className="flex-grow bg-[#EFF6EF] py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-4xl font-bold text-[#2E593F] mb-8 text-center">
              Finalizar Assinatura
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
                      <CardTitle>Periodicidade da Cesta</CardTitle>
                      <CardDescription>Escolha a frequência de entrega</CardDescription>
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

                  {/* Excluded Items */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Itens da Cesta</CardTitle>
                      <CardDescription>Indique os itens que não deseja receber</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full border-[#133903] text-[#133903] hover:bg-[#133903] hover:text-white"
                        onClick={() => setPortfolioModalOpen(true)}
                      >
                        <Package className="w-4 h-4 mr-2" />
                        Clique aqui para ver os itens da cesta
                      </Button>

                      <div>
                        <Label htmlFor="excludedItems">
                          Itens que NÃO deseja receber *
                        </Label>
                        <Textarea
                          id="excludedItems"
                          value={excludedItems}
                          onChange={(e) => setExcludedItems(e.target.value)}
                          required
                          placeholder="Ex: Tomate, Alface, Cenoura..."
                          className="min-h-[100px]"
                        />
                        <p className="text-sm text-gray-500 mt-2">
                          Liste os itens que você não deseja receber em sua cesta, separados por vírgula.
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Payment Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Dados do Cartão</CardTitle>
                      <CardDescription>Informações de pagamento</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="cardNumber">Número do Cartão *</Label>
                        <Input
                          id="cardNumber"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                          required
                          placeholder="0000 0000 0000 0000"
                          maxLength={19}
                        />
                      </div>

                      <div>
                        <Label htmlFor="cardName">Nome no Cartão *</Label>
                        <Input
                          id="cardName"
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value.toUpperCase())}
                          required
                          placeholder="NOME COMO NO CARTÃO"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="cardExpiry">Validade *</Label>
                          <Input
                            id="cardExpiry"
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                            required
                            placeholder="MM/AAAA"
                            maxLength={7}
                          />
                        </div>

                        <div>
                          <Label htmlFor="cardCvv">CVV *</Label>
                          <Input
                            id="cardCvv"
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                            required
                            placeholder="000"
                            maxLength={4}
                            type="password"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* WhatsApp Frete Grátis */}
                  <WhatsAppFreteButton />

                  <Button
                    type="submit"
                    className="w-full bg-[#133903] hover:bg-[#0f2b02] text-white py-6 text-lg font-semibold"
                    disabled={submitting}
                  >
                    {submitting ? "Processando..." : "Finalizar Pedido"}
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
                    {basket.imagePath && (
                      <img
                        src={basket.imagePath}
                        alt={basket.name}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    )}

                    <div>
                      <h3 className="font-bold text-lg text-[#2E593F]">{basket.name}</h3>
                      <p className="text-sm text-gray-600 mt-2">{basket.description}</p>
                    </div>

                    <div className="border-t pt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Valor por entrega:</span>
                        <span className="font-semibold">
                          R$ {basket.priceSubscription ? Number(basket.priceSubscription).toFixed(2) : "0.00"}
                        </span>
                      </div>

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

                      <div className="border-t pt-2 mt-2">
                        <div className="flex justify-between text-lg font-bold">
                          <span>Total Mensal:</span>
                          <span className="text-[#133903]">R$ {calculateMonthlyTotal()}</span>
                        </div>
                      </div>

                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3 text-sm text-blue-800">
                        <p className="font-semibold mb-2">ℹ️ Como funciona:</p>
                        <div className="space-y-1 text-xs">
                          <p>✅ Você recebe <strong>{frequency === "semanal" ? "4 cestas por mês" : frequency === "quinzenal" ? "2 cestas por mês" : "1 cesta por mês"}</strong></p>
                          <p>💳 <strong>Cobrança MENSAL</strong> de <strong>R$ {calculateMonthlyTotal()}</strong></p>
                          <p>📅 Cobrado sempre no mesmo dia do mês</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800">
                      <p className="font-semibold mb-1">🔄 Pagamento Recorrente</p>
                      <p className="text-xs">
                        O valor total mensal de <strong>R$ {calculateMonthlyTotal()}</strong> será cobrado uma vez por mês no cartão cadastrado.
                      </p>
                      <p className="text-xs mt-2">
                        Ao finalizar o pedido, você concorda com nossos{" "}
                        <a href="/termos-de-uso" target="_blank" className="text-[#133903] font-semibold hover:underline">
                          Termos de Uso
                        </a>.
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

      {/* Product Portfolio Modal */}
      <ProductPortfolioModal
        open={portfolioModalOpen}
        onOpenChange={setPortfolioModalOpen}
      />
    </div>
  );
}
