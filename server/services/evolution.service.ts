import * as dotenv from 'dotenv';

dotenv.config();

const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL;
const EVOLUTION_API_TOKEN = process.env.EVOLUTION_API_TOKEN;

if (!EVOLUTION_API_URL) {
  console.warn('⚠️  EVOLUTION_API_URL não configurado. Por favor, configure no arquivo .env');
}

if (!EVOLUTION_API_TOKEN) {
  console.warn('⚠️  EVOLUTION_API_TOKEN não configurado. Por favor, configure no arquivo .env');
}

interface CreateInstanceRequest {
  instanceName: string;
  token?: string;
  number?: string;
  integration?: string;
  // settings (Optional)
}

interface CreateInstanceResponse {
  instance: {
    instanceName: string;
    instanceId?: string;
    status?: string;
    // outros campos da resposta
  };
  hash?: {
    apikey: string;
  };
  webhook?: any;
  events?: any;
  rabbitmq?: any;
  sqs?: any;
  websocket?: any;
  chatwoot?: any;
  typebot?: any;
  proxy?: any;
  settings?: any;
}

interface EvolutionApiError {
  message: string;
  status?: number;
}

class EvolutionService {
  private baseUrl: string;
  private apiToken: string;

  constructor() {
    this.baseUrl = EVOLUTION_API_URL || '';
    this.apiToken = EVOLUTION_API_TOKEN || '';
  }

  private async makeRequest<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    body?: any
  ): Promise<T> {
    if (!this.baseUrl || !this.apiToken) {
      throw new Error('Evolution API não configurada. Verifique as variáveis de ambiente EVOLUTION_API_URL e EVOLUTION_API_TOKEN');
    }

    const url = `${this.baseUrl}${endpoint}`;

    console.log(`🔌 Evolution API Request: ${method} ${url}`);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'apikey': this.apiToken,
    };

    const options: RequestInit = {
      method,
      headers,
    };

    if (body && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(body);
      console.log('📤 Request Body:', JSON.stringify(body, null, 2));
    }

    try {
      const response = await fetch(url, options);
      const responseText = await response.text();

      console.log(`📥 Evolution API Response Status: ${response.status}`);
      console.log(`📥 Evolution API Response:`, responseText);

      if (!response.ok) {
        let errorMessage = `Evolution API error: ${response.status}`;
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          errorMessage = responseText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      // Se a resposta estiver vazia, retorna objeto vazio
      if (!responseText) {
        return {} as T;
      }

      return JSON.parse(responseText) as T;
    } catch (error: any) {
      console.error('❌ Evolution API Error:', error);
      throw error;
    }
  }

  /**
   * Cria uma nova instância do WhatsApp na Evolution API
   */
  async createInstance(instanceName: string, phoneNumber?: string): Promise<CreateInstanceResponse> {
    const body: CreateInstanceRequest = {
      instanceName,
      integration: 'WHATSAPP-BAILEYS', // WHATSAPP-BAILEYS | WHATSAPP-BUSINESS | EVOLUTION (Default WHATSAPP-BAILEYS)
    };

    // Adiciona número se fornecido (opcional)
    if (phoneNumber) {
      body.number = phoneNumber;
    }

    return await this.makeRequest<CreateInstanceResponse>(
      '/instance/create',
      'POST',
      body
    );
  }

  /**
   * Conecta uma instância do WhatsApp (gera QR Code)
   */
  async connectInstance(instanceName: string): Promise<any> {
    return await this.makeRequest<any>(
      `/instance/connect/${instanceName}`,
      'GET'
    );
  }

  /**
   * Busca informações de uma instância
   */
  async fetchInstance(instanceName: string): Promise<any> {
    return await this.makeRequest<any>(
      `/instance/fetchInstances?instanceName=${instanceName}`,
      'GET'
    );
  }

  /**
   * Deleta uma instância
   */
  async deleteInstance(instanceName: string): Promise<any> {
    return await this.makeRequest<any>(
      `/instance/delete/${instanceName}`,
      'DELETE'
    );
  }

  /**
   * Desconecta uma instância (logout)
   */
  async logoutInstance(instanceName: string): Promise<any> {
    return await this.makeRequest<any>(
      `/instance/logout/${instanceName}`,
      'DELETE'
    );
  }

  /**
   * Verifica o status de conexão de uma instância
   */
  async connectionState(instanceName: string): Promise<any> {
    return await this.makeRequest<any>(
      `/instance/connectionState/${instanceName}`,
      'GET'
    );
  }

  /**
   * Configura as settings da instância do WhatsApp
   */
  async setSettings(instanceName: string, settings: {
    rejectCall?: boolean;
    msgCall?: string;
    groupsIgnore?: boolean;
    alwaysOnline?: boolean;
    readMessages?: boolean;
    syncFullHistory?: boolean;
    readStatus?: boolean;
  }): Promise<any> {
    return await this.makeRequest<any>(
      `/settings/set/${instanceName}`,
      'POST',
      settings
    );
  }

  /**
   * Configura o webhook da instância do WhatsApp
   */
  async setWebhook(instanceName: string, webhookConfig: {
    enabled: boolean;
    url: string;
    headers?: Record<string, string>;
    byEvents?: boolean;
    base64?: boolean;
    events?: string[];
  }): Promise<any> {
    return await this.makeRequest<any>(
      `/webhook/set/${instanceName}`,
      'POST',
      { webhook: webhookConfig }
    );
  }

  /**
   * Envia uma mensagem de texto para um número do WhatsApp
   */
  async sendTextMessage(instanceName: string, number: string, text: string): Promise<any> {
    const body = {
      number: number,
      text: text,
    };

    return await this.makeRequest<any>(
      `/message/sendText/${instanceName}`,
      'POST',
      body
    );
  }
}

export const evolutionService = new EvolutionService();
