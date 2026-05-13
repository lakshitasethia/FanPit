const API_TOKEN = process.env.BSD_API_TOKEN || 'YOUR_API_TOKEN_HERE';
const BASE_URL = 'https://sports.bzzoiro.com';

async function run() {
  const haaland = await fetch(BASE_URL + '/api/players/?search=Haaland', { headers: { Authorization: API_TOKEN }}).then(r=>r.json());
  const stats = haaland.results[0];
  console.log("Haaland stats:", {xg: stats.xg, shots: stats.shots, assists: stats.assists, pass_accuracy: stats.pass_accuracy, dribbles: stats.dribbles});
}
run();
