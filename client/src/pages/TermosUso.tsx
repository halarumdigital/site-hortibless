import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

export default function TermosUso() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <WhatsAppButton />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-[#1A472A] to-[#2E593F] text-white py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-5xl font-bold mb-4">Termos de Uso</h1>
            <p className="text-xl text-gray-200 max-w-2xl mx-auto">
              Termo de Adesão - HortiBless
            </p>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="prose prose-lg max-w-none">
              <div className="bg-[#EFF6EF] rounded-xl p-8 mb-8">
                <h2 className="text-2xl font-bold text-[#2E593F] mb-4">TERMO DE ADESÃO – HORTIBLESS</h2>
                <p className="text-gray-700 mb-2">Assinaturas e Compras Avulsas | Compromisso com qualidade e transparência</p>
                <p className="text-gray-600 text-sm">Última atualização: [inserir data]</p>
              </div>

              <div className="space-y-6 text-gray-700">
                <p>
                  Pelo presente instrumento particular, o(a) cliente abaixo identificado(a) declara ter lido, compreendido e
                  aceitado as condições e regras descritas neste Termo de Adesão, para contratação e utilização dos
                  serviços da HortiBless Comércio e Serviços de Alimentos Ltda, inscrita no CNPJ sob nº
                  61.299.154/0001-10.
                </p>

                <p>
                  Este Termo aplica-se tanto a pessoas físicas (clientes residenciais - B2C) quanto a pessoas jurídicas
                  (clientes comerciais - B2B) que contratem o fornecimento de cestas e produtos hortifrutis da
                  HORTIBLESS.
                </p>

                <div className="mt-8">
                  <h3 className="text-2xl font-bold text-[#2E593F] mb-4">1. OBJETO</h3>
                  <p className="mb-3">
                    1.1. O presente Termo regula a contratação dos serviços de fornecimento e entrega de cestas de
                    hortifruti pela HORTIBLESS, seja por meio de assinaturas recorrentes (planos) ou compras avulsas
                    (pontuais).
                  </p>
                  <p className="mb-3">
                    1.2. As cestas poderão variar quanto ao tamanho, composição e frequência de entrega, conforme
                    descrito no site oficial da HORTIBLESS e/ou nas comunicações oficiais da empresa.
                  </p>
                  <p className="mb-3">
                    1.3. A HORTIBLESS compromete-se a fornecer frutas, legumes, verduras e temperos selecionados,
                    respeitando a sazonalidade e priorizando sempre a qualidade e o frescor dos produtos.
                  </p>
                  <p>
                    1.4. O cliente poderá informar, no momento da contratação, quais itens da lista de produtos da estação
                    não deseja receber, para que sejam substituídos por outros disponíveis.
                  </p>
                </div>

                <div className="mt-8">
                  <h3 className="text-2xl font-bold text-[#2E593F] mb-4">2. PLANOS, COMPRAS AVULSAS E FREQUÊNCIA DE ENTREGA</h3>
                  <p className="mb-3">2.1. Modalidades de contratação:</p>
                  <ul className="list-disc pl-8 mb-3">
                    <li>Planos de Assinatura: entregas recorrentes com periodicidade semanal, quinzenal ou mensal.</li>
                    <li>Compras Avulsas: realizadas de forma pontual, sem vínculo de recorrência.</li>
                  </ul>
                  <p className="mb-3">2.2. Tamanhos das cestas:</p>
                  <ul className="list-disc pl-8 mb-3">
                    <li>Pequena – serve até 2 pessoas</li>
                    <li>Média – serve de 3 a 4 pessoas</li>
                    <li>Grande – serve de 5 a 6 pessoas</li>
                  </ul>
                  <p className="mb-3">2.3. Entregas realizadas no endereço informado pelo cliente.</p>
                  <p className="mb-3">
                    2.4. Caso o cliente não esteja presente, a cesta poderá ser deixada com um responsável ou reagendada
                    mediante taxa adicional.
                  </p>
                  <p>
                    2.5. Entregas poderão ser temporariamente suspensas em feriados prolongados, datas comemorativas
                    ou situações logísticas excepcionais, mediante aviso prévio.
                  </p>
                </div>

                <div className="mt-8">
                  <h3 className="text-2xl font-bold text-[#2E593F] mb-4">3. PAGAMENTO</h3>
                  <p className="mb-3">3.1. O pagamento será processado através da plataforma Asaas, conforme modalidade escolhida:</p>
                  <ul className="list-disc pl-8 mb-3">
                    <li>Assinaturas recorrentes: Pix Automático (recorrente); Cartão de crédito (recorrente).</li>
                    <li>Compras avulsas: Pix à vista; Cartão de crédito à vista; Boleto bancário.</li>
                  </ul>
                  <p className="mb-3">3.2. Boleto bancário não será aceito para planos de assinatura.</p>
                  <p className="mb-3">3.3. Assinaturas cobradas antecipadamente, renovação automática conforme periodicidade.</p>
                  <p className="mb-3">3.4. Inadimplência autoriza suspensão imediata das entregas.</p>
                  <p className="mb-3">3.5. Não pagamento por dois ciclos consecutivos implica cancelamento automático da assinatura.</p>
                  <p>3.6. Valores poderão ser reajustados com aviso prévio de 15 dias.</p>
                </div>

                <div className="mt-8">
                  <h3 className="text-2xl font-bold text-[#2E593F] mb-4">4. GESTÃO DA ASSINATURA</h3>
                  <p className="mb-3">4.1. O cliente assinante poderá, por meio do atendimento oficial da HORTIBLESS via WhatsApp, realizar
                  as seguintes ações:</p>
                  <ul className="list-disc pl-8 mb-3">
                    <li>Pausar a assinatura e a cobrança por 7, 14 ou 30 dias;</li>
                    <li>Cancelar a assinatura;</li>
                    <li>Alterar dados cadastrais (endereço, telefone, etc.);</li>
                    <li>Alterar o tamanho da cesta;</li>
                    <li>Alterar a frequência de entrega;</li>
                    <li>Informar itens que compõem a cesta que não deseja receber, respeitando as opções disponíveis
                    da estação.</li>
                  </ul>
                  <p>4.2. Alterações realizadas após o fechamento da cesta valerão para o próximo ciclo de entrega.</p>
                </div>

                <div className="mt-8">
                  <h3 className="text-2xl font-bold text-[#2E593F] mb-4">5. VIGÊNCIA E CANCELAMENTO</h3>
                  <p className="mb-3">5.1. Assinaturas têm validade indeterminada, renovação automática.</p>
                  <p className="mb-3">5.2. Cancelamento a qualquer momento com aviso mínimo de 72 horas antes da próxima entrega.</p>
                  <p className="mb-3">5.3. Cancelamentos após cobrança de novo ciclo não geram reembolso.</p>
                  <p className="mb-3">5.4. Compras avulsas não são renováveis e não podem ser canceladas após pagamento.</p>
                  <p>5.5. Contratos B2B podem estabelecer condições específicas mediante acordo formal.</p>
                </div>

                <div className="mt-8">
                  <h3 className="text-2xl font-bold text-[#2E593F] mb-4">6. RESPONSABILIDADES</h3>
                  <p className="mb-3">6.1. Entrega de produtos frescos, selecionados e dentro dos padrões de qualidade.</p>
                  <p className="mb-3">6.2. Cliente responsável por fornecer informações corretas de endereço e contato.</p>
                  <p className="mb-3">6.3. HORTIBLESS não se responsabiliza por danos decorrentes de armazenamento inadequado.</p>
                  <p className="mb-3">6.4. Cliente pode informar itens que não deseja receber, respeitando opções da estação.</p>
                  <p>6.5. Clientes B2B podem ajustar substituições ou volumes mediante comunicação prévia.</p>
                </div>

                <div className="mt-8">
                  <h3 className="text-2xl font-bold text-[#2E593F] mb-4">7. EMISSÃO DE NOTA FISCAL</h3>
                  <p className="mb-3">7.1. Emissão de NFSe ou NF-e conforme legislação vigente.</p>
                  <p>7.2. Documento fiscal disponibilizado digitalmente após confirmação do pagamento.</p>
                </div>

                <div className="mt-8">
                  <h3 className="text-2xl font-bold text-[#2E593F] mb-4">8. POLÍTICA DE TROCAS E DEVOLUÇÕES</h3>
                  <p className="mb-3">8.1. Não há devolução após entrega, salvo avaria, deterioração ou não conformidade.</p>
                  <p className="mb-3">
                    8.2. Problemas devem ser comunicados em até 24 horas após recebimento para análise e eventual
                    substituição.
                  </p>
                  <p>8.3. Clientes B2B: substituição ou compensação preferencialmente na próxima entrega.</p>
                </div>

                <div className="mt-8">
                  <h3 className="text-2xl font-bold text-[#2E593F] mb-4">9. CONDIÇÕES CLIMÁTICAS, LOGÍSTICAS E FORÇA MAIOR</h3>
                  <p className="mb-3">
                    9.1. Entregas poderão ser reprogramadas em caso de força maior ou eventos imprevisíveis, como
                    desastres naturais, greves, bloqueios, falhas logísticas ou restrições legais.
                  </p>
                  <p>9.2. Cliente será informado da nova data de entrega sem prejuízo financeiro.</p>
                </div>

                <div className="mt-8">
                  <h3 className="text-2xl font-bold text-[#2E593F] mb-4">10. DISPOSIÇÕES GERAIS</h3>
                  <p className="mb-3">10.1. Adesão implica concordância plena com todas as cláusulas.</p>
                  <p className="mb-3">10.2. Ajustes de preços e condições mediante aviso prévio de 15 dias.</p>
                  <p className="mb-3">10.3. HORTIBLESS poderá alterar o Termo, mediante publicação da nova versão no site oficial.</p>
                  <p className="mb-3">10.4. Este Termo constitui acordo integral entre as partes, substituindo entendimentos anteriores.</p>
                  <p className="mb-3">
                    10.5. Casos omissos resolvidos conforme legislação aplicável (CDC ou Código Civil), conforme natureza
                    do contrato (B2C ou B2B).
                  </p>
                  <p>10.6. Foro eleito: Comarca de Carapicuíba/SP.</p>
                </div>

                <div className="mt-8 bg-[#EFF6EF] rounded-xl p-6">
                  <p className="text-center mb-4">
                    Ao realizar uma compra avulsa ou aderir a um plano de assinatura, o cliente declara estar ciente e de
                    acordo com todas as condições deste Termo.
                  </p>
                  <div className="text-center">
                    <p className="font-bold text-[#2E593F]">HortiBless Comércio e Serviços de Alimentos Ltda</p>
                    <p className="text-gray-700">CNPJ: 61.299.154/0001-10</p>
                    <p className="text-gray-700">WhatsApp: (11) 94518-3919</p>
                    <p className="text-gray-700">Site: www.hortibless.com.br</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
