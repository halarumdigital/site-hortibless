import { OpenAI } from "openai";
import * as fs from "fs";

interface AiConfig {
  aiModel?: string;
  aiTemperature?: string;
  aiMaxTokens?: number;
  aiPrompt?: string;
}

class AiService {
  private openai: OpenAI | null = null;

  // Lazy initialization - cria a instância do OpenAI apenas quando necessário
  private getOpenAI(): OpenAI {
    if (!this.openai) {
      const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

      if (!OPENAI_API_KEY) {
        throw new Error("OPENAI_API_KEY não está configurado. Verifique o arquivo .env");
      }

      this.openai = new OpenAI({
        apiKey: OPENAI_API_KEY,
      });
    }
    return this.openai;
  }

  async generateResponse(message: string, config: AiConfig): Promise<string> {
    const openai = this.getOpenAI();

    try {
      const completion = await openai.chat.completions.create({
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

  /**
   * Transcreve um arquivo de áudio usando Whisper da OpenAI
   * @param audioFilePath - Caminho para o arquivo de áudio
   * @returns Texto transcrito
   */
  async transcribeAudio(audioFilePath: string): Promise<string> {
    const openai = this.getOpenAI();

    try {
      console.log('🎤 Iniciando transcrição de áudio:', audioFilePath);

      const transcription = await openai.audio.transcriptions.create({
        file: fs.createReadStream(audioFilePath),
        model: "whisper-1",
        language: "pt", // Português
      });

      console.log('✅ Transcrição concluída:', transcription.text);
      return transcription.text;
    } catch (error: any) {
      console.error('❌ Erro ao transcrever áudio:', error);
      throw new Error(`Erro ao transcrever áudio: ${error.message}`);
    }
  }
}

export const aiService = new AiService();
