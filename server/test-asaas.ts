import { asaasService } from "./services/asaas.service";
import * as dotenv from 'dotenv';

dotenv.config();

async function testAsaasCreateCustomer() {
  console.log("🧪 Testando criação de cliente no Asaas...\n");

  try {
    // Verificar configuração
    console.log("📋 Configuração:");
    console.log("API URL:", process.env.ASAAS_API_URL);
    console.log("API Token configurado:", asaasService.isConfigured() ? "✅ SIM" : "❌ NÃO");
    console.log("");

    if (!asaasService.isConfigured()) {
      console.error("❌ Asaas não está configurado corretamente!");
      return;
    }

    // Dados de teste
    const customerData = {
      name: "Gilliard Damaceno",
      cpfCnpj: "33233587597",
      email: "damaceno@gmail.com",
      mobilePhone: "49999214230",
      address: "Rua Exemplo",
      addressNumber: "123",
      province: "Centro",
      postalCode: "89000000",
    };

    console.log("👤 Dados do cliente:");
    console.log(JSON.stringify(customerData, null, 2));
    console.log("");

    // 1. Verificar se cliente já existe
    console.log("🔍 Verificando se cliente já existe...");
    let existingCustomer = await asaasService.getCustomerByCpfCnpj(customerData.cpfCnpj);

    if (existingCustomer) {
      console.log("✅ Cliente já existe no Asaas!");
      console.log("ID:", existingCustomer.id);
      console.log("Nome:", existingCustomer.name);
      console.log("Email:", existingCustomer.email);
      console.log("\n✅ Teste concluído com sucesso!");
      return;
    }

    console.log("📝 Cliente não encontrado. Criando novo cliente...\n");

    // 2. Criar cliente
    const customer = await asaasService.createCustomer(customerData);

    console.log("✅ Cliente criado com sucesso!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("ID do Cliente:", customer.id);
    console.log("Nome:", customer.name);
    console.log("Email:", customer.email);
    console.log("CPF:", customer.cpfCnpj);
    console.log("Telefone:", customer.mobilePhone);
    console.log("Criado em:", customer.dateCreated);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("\n✅ Teste concluído com sucesso!");

  } catch (error: any) {
    console.error("\n❌ Erro no teste:", error.message);
    console.error("Detalhes:", error);
  }
}

// Executar teste
testAsaasCreateCustomer()
  .then(() => {
    console.log("\n🏁 Teste finalizado");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Erro fatal:", error);
    process.exit(1);
  });
