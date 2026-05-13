const API_TOKEN = process.env.BSD_API_TOKEN || 'YOUR_API_TOKEN_HERE';
const BASE_URL = 'https://sports.bzzoiro.com';

async function run() {
  const res = await fetch(BASE_URL + '/api/events/?league=39', { headers: { Authorization: API_TOKEN }});
  const data = await res.json();
  const match = data.results.find(m => (m.home_team && m.home_team.includes('Arsenal')) || (m.away_team && m.away_team.includes('Arsenal')));
  console.log("Match:", match.id, match.home_team, match.away_team);

  const detail = await fetch(BASE_URL + '/api/events/' + match.id + '/', { headers: { Authorization: API_TOKEN }}).then(r=>r.json());
  console.log("Detail stats:", {
    hp: detail.home_possession, hso: detail.home_shots_on_target,
    hpa: detail.home_pass_accuracy, hx: detail.home_xg
  });

  const shots = await fetch(BASE_URL + '/api/events/' + match.id + '/shots/', { headers: { Authorization: API_TOKEN }}).then(r=>r.json());
  console.log("Shots array?", Array.isArray(shots));
  if (Array.isArray(shots)) console.log("Shots[0]:", shots[0]);
  else console.log("Shots:", shots);
  
  const haaland = await fetch(BASE_URL + '/api/players/?search=Haaland', { headers: { Authorization: API_TOKEN }}).then(r=>r.json());
  console.log("Haaland results length:", haaland.results ? haaland.results.length : 0);
  if (haaland.results) console.log("Haaland stats:", haaland.results[0].xg, haaland.results[0].shots);
}
run();
