import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, Receipt, QrCode, Package } from "lucide-react";
import { ProductPortfolioModal } from "@/components/ProductPortfolioModal";
import { WhatsAppFreteButton } from "@/components/WhatsAppFreteButton";

interface Basket {
  id: number;
  name: string;
  description: string;
  priceLoose: number | null;
  priceSubscription: number | null;
  imagePath?: string;
}

export default function CompraAvulsa() {
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
  const [paymentMethod, setPaymentMethod] = useState<"cartao" | "boleto" | "pix">("cartao");
  const [excludedItems, setExcludedItems] = useState("");
  const [portfolioModalOpen, setPortfolioModalOpen] = useState(false);

  // Card payment fields
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");

  // Payment result state
  const [paymentResult, setPaymentResult] = useState<{
    purchaseId?: number;
    pixQrCode?: string;
    pixPayload?: string;
    bankSlipUrl?: string;
  } | null>(null);

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

    // Validate card fields only if payment method is card
    if (paymentMethod === "cartao" && (!cardNumber || !cardName || !cardExpiry || !cardCvv)) {
      toast({
        title: "Erro",
        description: "Preencha todos os dados do cartão",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);

    try {
      const purchaseData = {
        basketId: basket.id,
        customerName,
        customerEmail,
        customerCpf: customerCpf.replace(/\D/g, ''),
        customerWhatsapp: customerWhatsapp.replace(/\D/g, ''),
        customerAddress: buildAddress(),
        deliveryAddress: buildDeliveryAddress(),
        totalAmount: basket.priceLoose ? Number(basket.priceLoose).toFixed(2) : "0.00",
        paymentMethod,
        excludedItems,
        cardNumber: paymentMethod === "cartao" ? cardNumber.replace(/\D/g, '') : undefined,
        cardName: paymentMethod === "cartao" ? cardName : undefined,
        cardExpiry: paymentMethod === "cartao" ? cardExpiry : undefined,
        cardCvv: paymentMethod === "cartao" ? cardCvv : undefined,
      };

      const response = await fetch("/api/one-time-purchases", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(purchaseData),
      });

      const data = await response.json();

      console.log("📦 Resposta da API:", data);

      if (response.ok) {
        // Se for PIX ou Boleto, exibir dados de pagamento
        if (paymentMethod === "pix" && data.pixQrCode) {
          console.log("✅ PIX recebido!");
          console.log("🖼️ QR Code:", data.pixQrCode?.substring(0, 100));
          console.log("📋 Payload:", data.pixPayload?.substring(0, 100));

          setPaymentResult({
            purchaseId: data.purchase.id,
            pixQrCode: data.pixQrCode,
            pixPayload: data.pixPayload,
          });
          toast({
            title: "PIX gerado com sucesso!",
            description: "Use o QR Code ou código abaixo para pagar.",
          });
        } else if (paymentMethod === "pix" && !data.pixQrCode) {
          console.error("❌ PIX selecionado mas QR Code não retornado:", data);
          toast({
            title: "Erro",
            description: "QR Code não foi gerado. Tente novamente.",
            variant: "destructive"
          });
        } else if (paymentMethod === "boleto" && data.bankSlipUrl) {
          setPaymentResult({
            purchaseId: data.purchase.id,
            bankSlipUrl: data.bankSlipUrl,
          });
          toast({
            title: "Boleto gerado com sucesso!",
            description: "Acesse o link para imprimir seu boleto.",
          });
        } else {
          // Cartão - redireciona para página de obrigado
          toast({
            title: "Compra realizada com sucesso!",
            description: "Pagamento processado.",
          });
          setTimeout(() => {
            setLocation(`/obrigado/${data.purchase.id}?type=avulsa`);
          }, 2000);
        }
      } else {
        toast({
          title: "Erro ao processar compra",
          description: data.message || "Tente novamente mais tarde",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Purchase submission error:", error);
      toast({
        title: "Erro",
        description: "Erro ao processar compra. Tente novamente.",
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

  // Se tem resultado de pagamento (PIX ou Boleto), exibir tela de pagamento
  if (paymentResult) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <WhatsAppButton />

        <main className="flex-grow bg-[#EFF6EF] py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle className="text-center text-2xl text-[#2E593F]">
                    {paymentResult.pixQrCode ? "Pagamento via PIX" : "Pagamento via Boleto"}
                  </CardTitle>
                  <CardDescription className="text-center">
                    Complete o pagamento para finalizar sua compra
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* PIX */}
                  {paymentResult.pixQrCode && (
                    <>
                      <div className="flex flex-col items-center space-y-4">
                        <div className="bg-white p-4 rounded-lg border-2 border-[#133903]">
                          <img
                            src={paymentResult.pixQrCode}
                            alt="QR Code PIX"
                            className="w-64 h-64 object-contain"
                            onError={(e) => {
                              console.error("❌ Erro ao carregar QR Code:", paymentResult.pixQrCode?.substring(0, 100));
                              e.currentTarget.style.display = 'none';
                              const parent = e.currentTarget.parentElement;
                              if (parent) {
                                parent.innerHTML = `
                                  <div class="w-64 h-64 flex items-center justify-center bg-gray-100 rounded text-gray-500 text-center p-4">
                                    <div>
                                      <p class="font-semibold mb-2">⚠️ QR Code não disponível</p>
                                      <p class="text-sm">Use o código PIX abaixo para pagar</p>
                                    </div>
                                  </div>
                                `;
                              }
                            }}
                          />
                        </div>
                        <p className="text-center text-sm text-gray-600">
                          Escaneie o QR Code com o app do seu banco
                        </p>
                      </div>

                      {paymentResult.pixPayload && (
                        <div className="border-t pt-4">
                          <Label className="text-sm font-semibold text-gray-700">
                            Ou copie o código PIX:
                          </Label>
                          <div className="mt-2 flex gap-2">
                            <Input
                              value={paymentResult.pixPayload}
                              readOnly
                              className="font-mono text-sm"
                            />
                            <Button
                              onClick={() => {
                                navigator.clipboard.writeText(paymentResult.pixPayload || "");
                                toast({
                                  title: "Código copiado!",
                                  description: "Cole no app do seu banco para pagar.",
                                });
                              }}
                              className="bg-[#133903] hover:bg-[#0f2b02]"
                            >
                              Copiar
                            </Button>
                          </div>
                        </div>
                      )}

                      {!paymentResult.pixPayload && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
                          <p className="font-semibold mb-1">⚠️ Atenção</p>
                          <p>O código PIX ainda está sendo gerado. Aguarde alguns instantes e recarregue a página.</p>
                        </div>
                      )}

                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                        <p className="font-semibold mb-2">💡 Como pagar:</p>
                        <ol className="list-decimal list-inside space-y-1">
                          <li>Abra o app do seu banco</li>
                          <li>Escolha pagar com PIX</li>
                          <li>Escaneie o QR Code ou cole o código</li>
                          <li>Confirme o pagamento</li>
                        </ol>
                      </div>
                    </>
                  )}

                  {/* Boleto */}
                  {paymentResult.bankSlipUrl && (
                    <>
                      <div className="flex flex-col items-center space-y-4">
                        <div className="text-center">
                          <Receipt className="w-24 h-24 text-[#133903] mx-auto mb-4" />
                          <p className="text-lg font-semibold text-gray-700">
                            Seu boleto foi gerado com sucesso!
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Button
                          onClick={() => window.open(paymentResult.bankSlipUrl, '_blank')}
                          className="w-full bg-[#133903] hover:bg-[#0f2b02] text-white py-6 text-lg"
                        >
                          Abrir Boleto
                        </Button>

                        <Button
                          onClick={() => {
                            navigator.clipboard.writeText(paymentResult.bankSlipUrl || "");
                            toast({
                              title: "Link copiado!",
                              description: "Você pode acessar o boleto depois.",
                            });
                          }}
                          variant="outline"
                          className="w-full border-[#133903] text-[#133903] hover:bg-[#133903] hover:text-white py-6 text-lg"
                        >
                          Copiar Link do Boleto
                        </Button>
                      </div>

                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
                        <p className="font-semibold mb-2">⚠️ Importante:</p>
                        <ul className="list-disc list-inside space-y-1">
                          <li>Prazo de vencimento: 3 dias</li>
                          <li>Você também receberá o boleto por e-mail</li>
                          <li>Após o pagamento, pode levar até 2 dias úteis para confirmar</li>
                        </ul>
                      </div>
                    </>
                  )}

                  <div className="border-t pt-4 flex gap-4">
                    <Button
                      onClick={() => {
                        if (paymentResult?.purchaseId) {
                          setLocation(`/obrigado/${paymentResult.purchaseId}?type=avulsa`);
                        } else {
                          setLocation("/");
                        }
                      }}
                      className="flex-1 bg-[#133903] hover:bg-[#0f2b02]"
                    >
                      Continuar
                    </Button>
                  </div>
                </CardContent>
              </Card>
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
          <div className="max-w-6xl mx-auto">
            <h1 className="text-4xl font-bold text-[#2E593F] mb-8 text-center">
              Compra Avulsa
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

                  {/* Payment Method */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Forma de Pagamento</CardTitle>
                      <CardDescription>Escolha como deseja pagar</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <RadioGroup value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
                        <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-gray-50">
                          <RadioGroupItem value="cartao" id="cartao" />
                          <Label htmlFor="cartao" className="flex items-center gap-2 cursor-pointer flex-1">
                            <CreditCard className="w-5 h-5 text-[#133903]" />
                            <span>Cartão de Crédito</span>
                          </Label>
                        </div>

                        <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-gray-50">
                          <RadioGroupItem value="boleto" id="boleto" />
                          <Label htmlFor="boleto" className="flex items-center gap-2 cursor-pointer flex-1">
                            <Receipt className="w-5 h-5 text-[#133903]" />
                            <span>Boleto Bancário</span>
                          </Label>
                        </div>

                        <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-gray-50">
                          <RadioGroupItem value="pix" id="pix" />
                          <Label htmlFor="pix" className="flex items-center gap-2 cursor-pointer flex-1">
                            <QrCode className="w-5 h-5 text-[#133903]" />
                            <span>PIX</span>
                          </Label>
                        </div>
                      </RadioGroup>
                    </CardContent>
                  </Card>

                  {/* Card Payment Information (only show if card is selected) */}
                  {paymentMethod === "cartao" && (
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
                            required={paymentMethod === "cartao"}
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
                            required={paymentMethod === "cartao"}
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
                              required={paymentMethod === "cartao"}
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
                              required={paymentMethod === "cartao"}
                              placeholder="000"
                              maxLength={4}
                              type="password"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Payment Instructions */}
                  {paymentMethod === "boleto" && (
                    <Card className="bg-blue-50 border-blue-200">
                      <CardContent className="pt-6">
                        <div className="flex gap-3">
                          <Receipt className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                          <div>
                            <p className="font-semibold text-blue-900 mb-2">Pagamento por Boleto</p>
                            <p className="text-sm text-blue-800">
                              Após finalizar a compra, você receberá o boleto por e-mail. O prazo para pagamento é de até 3 dias úteis.
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {paymentMethod === "pix" && (
                    <Card className="bg-green-50 border-green-200">
                      <CardContent className="pt-6">
                        <div className="flex gap-3">
                          <QrCode className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                          <div>
                            <p className="font-semibold text-green-900 mb-2">Pagamento por PIX</p>
                            <p className="text-sm text-green-800">
                              Após finalizar a compra, você receberá o QR Code do PIX por e-mail para efetuar o pagamento instantâneo.
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* WhatsApp Frete Grátis */}
                  <WhatsAppFreteButton />

                  <Button
                    type="submit"
                    className="w-full bg-[#133903] hover:bg-[#0f2b02] text-white py-6 text-lg font-semibold"
                    disabled={submitting}
                  >
                    {submitting ? "Processando..." : "Finalizar Compra"}
                  </Button>
                </form>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <Card className="sticky top-4">
                  <CardHeader>
                    <CardTitle>Resumo da Compra</CardTitle>
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
                        <span>Tipo:</span>
                        <span className="font-semibold">Compra Avulsa</span>
                      </div>

                      <div className="flex justify-between text-sm">
                        <span>Forma de Pagamento:</span>
                        <span className="font-semibold capitalize">
                          {paymentMethod === "cartao" ? "Cartão de Crédito" : paymentMethod === "boleto" ? "Boleto" : "PIX"}
                        </span>
                      </div>

                      <div className="border-t pt-2 mt-2">
                        <div className="flex justify-between text-lg font-bold">
                          <span>Total:</span>
                          <span className="text-[#133903]">
                            R$ {basket.priceLoose ? Number(basket.priceLoose).toFixed(2) : "0.00"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800">
                      <p className="font-semibold mb-1">✓ Compra Única</p>
                      <p className="text-xs">
                        Esta é uma compra avulsa, sem renovação automática. Você receberá seu pedido uma única vez.
                      </p>
                      <p className="text-xs mt-2">
                        Ao finalizar a compra, você concorda com nossos{" "}
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
