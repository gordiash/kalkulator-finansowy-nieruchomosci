// Skrypt do testowania połączenia z Airtable
require('dotenv').config();

const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;
const AIRTABLE_TABLE_NAME = process.env.AIRTABLE_TABLE_NAME;

async function testAirtableConnection() {
  console.log('🔍 Testowanie połączenia z Airtable...\n');
  
  // Sprawdź zmienne środowiskowe
  console.log('📋 Konfiguracja:');
  console.log(`Base ID: ${AIRTABLE_BASE_ID ? '✅ Ustawione' : '❌ Brak'}`);
  console.log(`Token: ${AIRTABLE_TOKEN ? '✅ Ustawione' : '❌ Brak'}`);
  console.log(`Tabela: ${AIRTABLE_TABLE_NAME ? '✅ Ustawione' : '❌ Brak'}\n`);
  
  if (!AIRTABLE_BASE_ID || !AIRTABLE_TOKEN || !AIRTABLE_TABLE_NAME) {
    console.log('❌ Brak wymaganych zmiennych środowiskowych!');
    return;
  }
  
  try {
    // Sprawdź dostęp do tabeli (pobierz pierwszy rekord)
    const response = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}?maxRecords=1`,
      {
        headers: {
          'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
        },
      }
    );
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Połączenie z Airtable: SUKCES');
      console.log(`📊 Tabela "${AIRTABLE_TABLE_NAME}" jest dostępna`);
      
      if (data.records && data.records.length > 0) {
        console.log('📝 Przykładowe pola w tabeli:');
        Object.keys(data.records[0].fields).forEach(field => {
          console.log(`   - ${field}`);
        });
      }
    } else {
      console.log('❌ Błąd połączenia z Airtable:');
      console.log(`Status: ${response.status}`);
      console.log(`Błąd: ${data.error?.type || 'Unknown'}`);
      console.log(`Opis: ${data.error?.message || 'No message'}`);
      
      // Sugestie rozwiązania
      console.log('\n🔧 Możliwe rozwiązania:');
      if (data.error?.type === 'INVALID_PERMISSIONS_OR_MODEL_NOT_FOUND') {
        console.log('- Sprawdź czy Base ID jest poprawne');
        console.log('- Sprawdź czy Personal Access Token ma uprawnienia do tej bazy');
        console.log('- Sprawdź czy nazwa tabeli jest dokładnie: "Newsletter"');
      }
    }
    
  } catch (error) {
    console.log('❌ Błąd sieciowy:', error.message);
  }
}

// Test zapisu próbnego rekordu
async function testRecord() {
  console.log('\n🧪 Testowanie zapisu rekordu...');
  
  try {
    const testEmail = `test-${Date.now()}@example.com`;
    
    const response = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          records: [
            {
              fields: {
                'Email': testEmail,
                'Source': 'test',
                'Created': new Date().toISOString().split('T')[0],
                'Status': 'Test'
              }
            }
          ]
        })
      }
    );
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Zapis testowy: SUKCES');
      console.log(`📧 Email testowy: ${testEmail}`);
      console.log(`🆔 ID rekordu: ${data.records[0].id}`);
    } else {
      console.log('❌ Błąd zapisu:');
      console.log(`Status: ${response.status}`);
      console.log(`Błąd: ${data.error?.type || 'Unknown'}`);
      console.log(`Opis: ${data.error?.message || 'No message'}`);
      
      if (data.error?.type === 'UNKNOWN_FIELD_NAME') {
        console.log('\n🔧 Upewnij się, że tabela ma pola:');
        console.log('- Email (Single line text)');
        console.log('- Source (Single line text)');
        console.log('- Created (Date)');
        console.log('- Status (Single line text)');
      }
    }
    
  } catch (error) {
    console.log('❌ Błąd zapisu:', error.message);
  }
}

// Uruchom testy
testAirtableConnection().then(() => {
  testRecord();
}); 