const API_TOKEN = process.env.BSD_API_TOKEN || 'YOUR_API_TOKEN_HERE';
const BASE_URL = 'https://sports.bzzoiro.com';

async function run() {
  const data = await fetch(BASE_URL + '/api/events/?league=39', { headers: { Authorization: API_TOKEN }}).then(r=>r.json());
  for (const m of data.results) {
    const shots = await fetch(BASE_URL + '/api/events/' + m.id + '/shots/', { headers: { Authorization: API_TOKEN }}).then(r=>r.json());
    console.log(`Match ${m.id} shots:`, shots.error ? "Error" : shots.length || (shots.results && shots.results.length));
  }
}
run();
