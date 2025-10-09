import * as dotenv from 'dotenv';

dotenv.config();

const ASAAS_API_URL = process.env.ASAAS_API_URL || 'https://sandbox.asaas.com/api/v3';
const ASAAS_API_TOKEN = process.env.ASAAS_API_TOKEN;

if (!ASAAS_API_TOKEN) {
  console.warn('⚠️  ASAAS_API_TOKEN não configurado. Por favor, configure no arquivo .env');
}

interface AsaasCustomer {
  name: string;
  cpfCnpj: string;
  email: string;
  mobilePhone?: string;
  address?: string;
  addressNumber?: string;
  complement?: string;
  province?: string;
  postalCode?: string;
  externalReference?: string;
  notificationDisabled?: boolean;
}

interface AsaasCustomerResponse {
  id: string;
  dateCreated: string;
  name: string;
  email: string;
  cpfCnpj: string;
  mobilePhone?: string;
  address?: string;
  addressNumber?: string;
  province?: string;
  postalCode?: string;
  externalReference?: string;
}

interface AsaasPayment {
  customer: string;
  billingType: 'BOLETO' | 'CREDIT_CARD' | 'PIX';
  value: number;
  dueDate: string;
  description?: string;
  externalReference?: string;
  discount?: {
    value: number;
    dueDateLimitDays: number;
  };
  fine?: {
    value: number;
  };
  interest?: {
    value: number;
  };
  postalService?: boolean;
}

interface AsaasCreditCardPayment extends AsaasPayment {
  billingType: 'CREDIT_CARD';
  creditCard: {
    holderName: string;
    number: string;
    expiryMonth: string;
    expiryYear: string;
    ccv: string;
  };
  creditCardHolderInfo: {
    name: string;
    email: string;
    cpfCnpj: string;
    postalCode: string;
    addressNumber: string;
    phone: string;
  };
}

interface AsaasPaymentResponse {
  id: string;
  dateCreated: string;
  customer: string;
  value: number;
  netValue: number;
  billingType: string;
  status: string;
  dueDate: string;
  invoiceUrl?: string;
  bankSlipUrl?: string;
  invoiceNumber?: string;
  description?: string;
  externalReference?: string;
  pixTransaction?: {
    qrCode: {
      encodedImage: string;
      payload: string;
    };
    expirationDate: string;
  };
}

interface AsaasError {
  errors?: Array<{
    code: string;
    description: string;
  }>;
  message?: string;
}

interface AsaasPixQrCodeResponse {
  success: boolean;
  encodedImage: string;
  payload: string;
  expirationDate: string;
  description?: string;
}

interface AsaasSubscription {
  customer: string;
  billingType: 'BOLETO' | 'CREDIT_CARD' | 'PIX';
  cycle: 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'SEMIANNUALLY' | 'YEARLY';
  value: number;
  nextDueDate: string;
  description?: string;
  externalReference?: string;
}

interface AsaasSubscriptionWithCreditCard extends AsaasSubscription {
  billingType: 'CREDIT_CARD';
  creditCard: {
    holderName: string;
    number: string;
    expiryMonth: string;
    expiryYear: string;
    ccv: string;
  };
  creditCardHolderInfo: {
    name: string;
    email: string;
    cpfCnpj: string;
    postalCode: string;
    addressNumber: string;
    phone: string;
  };
}

interface AsaasSubscriptionResponse {
  id: string;
  dateCreated: string;
  customer: string;
  value: number;
  netValue: number;
  billingType: string;
  cycle: string;
  nextDueDate: string;
  status: string;
  description?: string;
  externalReference?: string;
}

class AsaasService {
  private apiUrl: string;
  private apiToken: string;

  constructor() {
    this.apiUrl = ASAAS_API_URL;
    this.apiToken = ASAAS_API_TOKEN || '';
  }

  private async makeRequest<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    body?: any
  ): Promise<T> {
    if (!this.apiToken) {
      throw new Error('Asaas API Token não configurado');
    }

    const url = `${this.apiUrl}${endpoint}`;

    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'access_token': this.apiToken,
      },
    };

    if (body && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, options);
      const data = await response.json();

      if (!response.ok) {
        const error = data as AsaasError;
        const errorMessage = error.errors?.[0]?.description || error.message || 'Erro na API do Asaas';
        throw new Error(errorMessage);
      }

      return data as T;
    } catch (error: any) {
      console.error('Asaas API Error:', error);
      throw error;
    }
  }

  /**
   * Cria um cliente no Asaas
   */
  async createCustomer(customerData: AsaasCustomer): Promise<AsaasCustomerResponse> {
    try {
      console.log('📝 Criando cliente no Asaas:', customerData.name);
      const response = await this.makeRequest<AsaasCustomerResponse>(
        '/customers',
        'POST',
        customerData
      );
      console.log('✅ Cliente criado no Asaas:', response.id);
      return response;
    } catch (error: any) {
      console.error('❌ Erro ao criar cliente no Asaas:', error.message);
      throw new Error(`Falha ao criar cliente: ${error.message}`);
    }
  }

  /**
   * Busca um cliente por CPF/CNPJ
   */
  async getCustomerByCpfCnpj(cpfCnpj: string): Promise<AsaasCustomerResponse | null> {
    try {
      const response = await this.makeRequest<{ data: AsaasCustomerResponse[] }>(
        `/customers?cpfCnpj=${cpfCnpj}`,
        'GET'
      );

      if (response.data && response.data.length > 0) {
        return response.data[0];
      }

      return null;
    } catch (error) {
      console.error('Erro ao buscar cliente:', error);
      return null;
    }
  }

  /**
   * Cria uma cobrança (pagamento) no Asaas
   */
  async createPayment(paymentData: AsaasPayment | AsaasCreditCardPayment): Promise<AsaasPaymentResponse> {
    try {
      console.log('💳 Criando cobrança no Asaas:', paymentData.billingType);
      const response = await this.makeRequest<AsaasPaymentResponse>(
        '/payments',
        'POST',
        paymentData
      );
      console.log('✅ Cobrança criada no Asaas:', response.id);
      return response;
    } catch (error: any) {
      console.error('❌ Erro ao criar cobrança no Asaas:', error.message);
      throw new Error(`Falha ao criar cobrança: ${error.message}`);
    }
  }

  /**
   * Busca uma cobrança por ID
   */
  async getPayment(paymentId: string): Promise<AsaasPaymentResponse> {
    try {
      const response = await this.makeRequest<AsaasPaymentResponse>(
        `/payments/${paymentId}`,
        'GET'
      );
      return response;
    } catch (error: any) {
      console.error('❌ Erro ao buscar cobrança:', error.message);
      throw new Error(`Falha ao buscar cobrança: ${error.message}`);
    }
  }

  /**
   * Busca o QR Code de um pagamento PIX
   * O QR Code é gerado de forma assíncrona, então este endpoint deve ser chamado após a criação do pagamento
   */
  async getPixQrCode(paymentId: string): Promise<AsaasPixQrCodeResponse> {
    try {
      console.log('🔍 Buscando QR Code PIX para pagamento:', paymentId);
      const response = await this.makeRequest<AsaasPixQrCodeResponse>(
        `/payments/${paymentId}/pixQrCode`,
        'GET'
      );
      console.log('✅ QR Code PIX recebido com sucesso');
      return response;
    } catch (error: any) {
      console.error('❌ Erro ao buscar QR Code PIX:', error.message);
      throw new Error(`Falha ao buscar QR Code PIX: ${error.message}`);
    }
  }

  /**
   * Cria uma assinatura (recorrência) no Asaas
   */
  async createSubscription(subscriptionData: AsaasSubscription | AsaasSubscriptionWithCreditCard): Promise<AsaasSubscriptionResponse> {
    try {
      console.log('🔄 Criando assinatura no Asaas:', subscriptionData.billingType, subscriptionData.cycle);
      const response = await this.makeRequest<AsaasSubscriptionResponse>(
        '/subscriptions',
        'POST',
        subscriptionData
      );
      console.log('✅ Assinatura criada no Asaas:', response.id);
      return response;
    } catch (error: any) {
      console.error('❌ Erro ao criar assinatura no Asaas:', error.message);
      throw new Error(`Falha ao criar assinatura: ${error.message}`);
    }
  }

  /**
   * Busca uma assinatura por ID
   */
  async getSubscription(subscriptionId: string): Promise<AsaasSubscriptionResponse> {
    try {
      const response = await this.makeRequest<AsaasSubscriptionResponse>(
        `/subscriptions/${subscriptionId}`,
        'GET'
      );
      return response;
    } catch (error: any) {
      console.error('❌ Erro ao buscar assinatura:', error.message);
      throw new Error(`Falha ao buscar assinatura: ${error.message}`);
    }
  }

  /**
   * Verifica se a API está configurada corretamente
   */
  isConfigured(): boolean {
    return !!this.apiToken && this.apiToken !== 'your_asaas_api_token_here';
  }
}

export const asaasService = new AsaasService();
export type {
  AsaasCustomer,
  AsaasCustomerResponse,
  AsaasPayment,
  AsaasCreditCardPayment,
  AsaasPaymentResponse,
  AsaasPixQrCodeResponse,
  AsaasSubscription,
  AsaasSubscriptionWithCreditCard,
  AsaasSubscriptionResponse
};
