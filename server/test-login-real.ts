import * as dotenv from 'dotenv';
dotenv.config();

async function testLogin() {
  console.log('=== Testando API de Login ===\n');

  const credentials = {
    username: 'admin',
    password: '@Arcano1987'
  };

  console.log('Tentando fazer login com:');
  console.log('Username:', credentials.username);
  console.log('Password:', credentials.password);
  console.log('');

  try {
    const response = await fetch('http://localhost:5000/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    console.log('Status da resposta:', response.status, response.statusText);

    const data = await response.json();
    console.log('Resposta da API:');
    console.log(JSON.stringify(data, null, 2));

    if (response.ok) {
      console.log('\n✓ LOGIN BEM SUCEDIDO!');
    } else {
      console.log('\n✗ LOGIN FALHOU!');
      console.log('Motivo:', data.message || 'Erro desconhecido');
    }

  } catch (error: any) {
    console.error('\n✗ Erro ao testar login:');
    if (error.cause?.code === 'ECONNREFUSED') {
      console.error('Servidor não está rodando! Execute: npm run dev');
    } else {
      console.error(error.message);
    }
  }

  console.log('\n=== Teste concluído ===');
}

testLogin();
