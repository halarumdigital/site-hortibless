import axios from 'axios';

async function testLoginAPI() {
  console.log('=== Testando API de Login ===\n');

  try {
    const response = await axios.post('http://localhost:5000/api/login', {
      username: 'admin',
      password: '@Arcano1987'
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      withCredentials: true,
      validateStatus: () => true // Aceitar qualquer status
    });

    console.log('Status:', response.status);
    console.log('Response:', response.data);
    console.log('Headers:', response.headers);

  } catch (error: any) {
    console.error('Erro na requisição:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error(error.message);
    }
  }
}

testLoginAPI();
