import { OpenAI } from "openai";
import * as fs from "fs";
import type { ConversationMessage } from "@shared/schema";

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
   * Gera resposta com histórico de conversação completo
   * @param message - Nova mensagem do usuário
   * @param config - Configurações da IA
   * @param conversationHistory - Histórico de mensagens anteriores
   * @param lastAssistantMessages - Últimas mensagens do assistente para evitar duplicação
   */
  async generateResponseWithHistory(
    message: string,
    config: AiConfig,
    conversationHistory: ConversationMessage[],
    lastAssistantMessages: string[] = []
  ): Promise<string> {
    const openai = this.getOpenAI();

    try {
      // Construir histórico de mensagens para o contexto
      const messages: any[] = [
        {
          role: "system",
          content: `${config.aiPrompt || "Você é um assistente virtual útil e amigável."}

REGRAS IMPORTANTES:
1. Você SEMPRE deve lembrar do contexto da conversa anterior.
2. NUNCA repita exatamente a mesma resposta que já deu anteriormente.
3. Se o usuário fizer a mesma pergunta, responda de forma diferente ou complemente a informação anterior.
4. Mantenha consistência com o que foi discutido anteriormente.
5. Seja natural e mantenha uma conversa fluída baseada no histórico.`,
        },
      ];

      // Adicionar histórico da conversa (limitar a últimas 20 mensagens para não exceder o contexto)
      const recentHistory = conversationHistory.slice(-20);

      for (const msg of recentHistory) {
        if (msg.sender === 'user') {
          messages.push({
            role: 'user',
            content: msg.message
          });
        } else if (msg.sender === 'agent') {
          messages.push({
            role: 'assistant',
            content: msg.message
          });
        }
        // Ignorar mensagens do tipo 'system'
      }

      // Adicionar a nova mensagem do usuário
      messages.push({
        role: "user",
        content: message,
      });

      // Adicionar instrução para evitar repetição se houver mensagens anteriores
      if (lastAssistantMessages.length > 0) {
        const lastMessages = lastAssistantMessages.slice(-3).join('\n');
        messages.push({
          role: "system",
          content: `ATENÇÃO: Você já respondeu anteriormente com estas mensagens. NÃO repita exatamente o mesmo conteúdo:
${lastMessages}

Por favor, forneça uma resposta DIFERENTE e NOVA, mesmo que o usuário faça a mesma pergunta.`
        });
      }

      console.log('🧠 Gerando resposta com histórico de', recentHistory.length, 'mensagens anteriores');

      const completion = await openai.chat.completions.create({
        model: config.aiModel || "gpt-4o-mini",
        messages,
        temperature: parseFloat(config.aiTemperature || "0.8"), // Um pouco mais alto para mais variação
        max_tokens: config.aiMaxTokens || 1000,
      });

      const response = completion.choices[0]?.message?.content || "Desculpe, não consegui gerar uma resposta.";

      // Verificar se a resposta é muito similar às anteriores
      for (const lastMsg of lastAssistantMessages) {
        if (response.toLowerCase().trim() === lastMsg.toLowerCase().trim()) {
          console.log('⚠️  Resposta duplicada detectada, regenerando...');
          // Regenerar com temperatura mais alta
          const retryCompletion = await openai.chat.completions.create({
            model: config.aiModel || "gpt-4o-mini",
            messages: [
              ...messages,
              {
                role: "system",
                content: "A resposta anterior foi idêntica a uma mensagem já enviada. Por favor, forneça uma resposta COMPLETAMENTE DIFERENTE."
              }
            ],
            temperature: 0.9,
            max_tokens: config.aiMaxTokens || 1000,
          });
          return retryCompletion.choices[0]?.message?.content || response;
        }
      }

      return response;
    } catch (error: any) {
      console.error('❌ Erro ao gerar resposta da IA com histórico:', error);
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
