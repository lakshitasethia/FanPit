const API_TOKEN = process.env.BSD_API_TOKEN || 'YOUR_API_TOKEN_HERE';
const BASE_URL = 'https://sports.bzzoiro.com';

async function run() {
  const detail = await fetch(BASE_URL + '/api/events/206701/', { headers: { Authorization: API_TOKEN }}).then(r=>r.json());
  console.log("Match Detail Keys:", Object.keys(detail));
  console.log(detail);
}
run();
