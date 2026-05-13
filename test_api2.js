const API_TOKEN = process.env.BSD_API_TOKEN || 'YOUR_API_TOKEN_HERE';
const BASE_URL = 'https://sports.bzzoiro.com';

async function run() {
  const res = await fetch(BASE_URL + '/api/events/?league=39', { headers: { Authorization: API_TOKEN }});
  const data = await res.json();
  console.log("Matches:", data.results.map(m => m.home_team + " vs " + m.away_team));
}
run();
