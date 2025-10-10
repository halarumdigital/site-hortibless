import { OpenAI } from "openai";
import * as dotenv from 'dotenv';

dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.warn('⚠️  OPENAI_API_KEY não configurado. Por favor, configure no arquivo .env');
}

interface AiConfig {
  aiModel?: string;
  aiTemperature?: string;
  aiMaxTokens?: number;
  aiPrompt?: string;
}

class AiService {
  private openai: OpenAI | null = null;

  constructor() {
    if (OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: OPENAI_API_KEY,
      });
    }
  }

  async generateResponse(message: string, config: AiConfig): Promise<string> {
    if (!this.openai) {
      throw new Error("OpenAI não está configurado. Verifique a chave API.");
    }

    try {
      const completion = await this.openai.chat.completions.create({
        model: config.aiModel || "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: config.aiPrompt || "Você é um assistente virtual útil e amigável.",
          },
          {
            role: "user",
            content: message,
          },
        ],
        temperature: parseFloat(config.aiTemperature || "0.7"),
        max_tokens: config.aiMaxTokens || 1000,
      });

      return completion.choices[0]?.message?.content || "Desculpe, não consegui gerar uma resposta.";
    } catch (error: any) {
      console.error('❌ Erro ao gerar resposta da IA:', error);
      throw new Error(`Erro ao gerar resposta: ${error.message}`);
    }
  }
}

export const aiService = new AiService();
