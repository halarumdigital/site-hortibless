import { db } from "./server/db";
import { whatsappConnections } from "./shared/schema";

async function checkConnections() {
  try {
    const connections = await db.select().from(whatsappConnections);

    console.log(`\n📱 Total de conexões: ${connections.length}\n`);

    if (connections.length === 0) {
      console.log("⚠️  Nenhuma conexão encontrada no banco de dados");
      return;
    }

    connections.forEach((conn, index) => {
      console.log(`\n=== Conexão ${index + 1} ===`);
      console.log(`ID: ${conn.id}`);
      console.log(`Instance Name: ${conn.instanceName}`);
      console.log(`Status: ${conn.status}`);
      console.log(`AI Enabled: ${conn.aiEnabled}`);
      console.log(`AI Model: ${conn.aiModel}`);
      console.log(`AI Temperature: ${conn.aiTemperature}`);
      console.log(`AI Max Tokens: ${conn.aiMaxTokens}`);
      console.log(`AI Prompt: ${conn.aiPrompt ? conn.aiPrompt.substring(0, 100) + "..." : "Não configurado"}`);
    });

  } catch (error) {
    console.error("❌ Erro ao buscar conexões:", error);
  }

  process.exit(0);
}

checkConnections();
