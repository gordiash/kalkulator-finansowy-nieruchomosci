// Użycie: npm run market:refresh
// Działa lokalnie (domyślnie http://localhost:3000) lub z MARKET_REFRESH_URL w env

const url = process.env.MARKET_REFRESH_URL || 'http://localhost:3000/api/market/refresh';

async function main() {
  try {
    const res = await fetch(url, { method: 'POST' });
    const text = await res.text();
    if (!res.ok) {
      console.error('Refresh failed', res.status, text);
      process.exit(1);
    }
    console.log('Refresh OK:', text);
    process.exit(0);
  } catch (e) {
    console.error('Refresh error:', e);
    process.exit(1);
  }
}

main();
