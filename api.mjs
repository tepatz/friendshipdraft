import {getStore} from "@netlify/blobs";
const SEED={"drafts": {"ucl-2027": {"name": "Champions League 2027", "emoji": "⚽", "order": 0, "drafters": ["Alex", "Tim", "Ben", "Sam", "Craig", "Kooz"], "slots": ["Round 1", "Round 2", "Round 3", "Round 4", "Round 5", "Round 6", "Round 7", "Round 8", "Trade 1", "Trade 2"], "scoring": [{"id": "goals", "label": "Goals", "pts": 2}, {"id": "assists", "label": "Assists", "pts": 1}, {"id": "own-goals", "label": "Own goals", "pts": -2}, {"id": "red-cards", "label": "Red cards", "pts": -1}, {"id": "pk-misses", "label": "PK misses", "pts": -1}]}, "nhl-playoffs": {"name": "NHL Playoffs", "emoji": "🏒", "order": 1, "drafters": ["Alex", "Tim", "Ben", "Sam", "Craig", "Kooz"], "slots": ["Round 1", "Round 2", "Round 3", "Round 4", "Round 5", "Round 6", "Round 7", "Round 8", "Trade 1", "Trade 2"], "scoring": [{"id": "goals", "label": "Goals", "pts": 1}, {"id": "assists", "label": "Assists", "pts": 1}]}, "nba-playoffs": {"name": "NBA Playoffs", "emoji": "🏀", "order": 2, "drafters": ["Alex", "Tim", "Ben", "Sam", "Craig", "Kooz"], "slots": ["Round 1", "Round 2", "Round 3", "Round 4", "Round 5", "Round 6", "Round 7", "Round 8", "Trade 1", "Trade 2"], "scoring": [{"id": "points", "label": "Points", "pts": 1}, {"id": "rebounds", "label": "Rebounds", "pts": 1}, {"id": "assists", "label": "Assists", "pts": 1}]}}, "picks": {"ucl-2027.alex": {"draft": "ucl-2027", "r": {"0": "Kylian Mbappé", "1": "Désiré Doué", "2": "Luis Díaz", "3": "Rasmus Højlund", "4": "Donyell Malen", "5": "Fermín López", "6": "Christos Tzolis", "7": "Nico Paz"}}, "ucl-2027.tim": {"draft": "ucl-2027", "r": {"0": "Harry Kane", "1": "Bukayo Saka", "2": "Alexander Isak", "3": "Marcus Thuram", "4": "Bruno Fernandes", "5": "Cody Gakpo", "6": "André Silva", "7": "Karim Adeyemi"}}, "ucl-2027.ben": {"draft": "ucl-2027", "r": {"0": "Khvicha Kvaratskhelia", "1": "Michael Olise", "2": "Anthony Gordon", "3": "Kai Havertz", "4": "Enzo Fernández", "5": "Alex Baena", "6": "Arda Güler", "7": "Florian Wirtz"}}, "ucl-2027.sam": {"draft": "ucl-2027", "r": {"0": "Erling Haaland", "1": "Vinícius Júnior", "2": "Lautaro Martínez", "3": "Julián Álvarez", "4": "Eberechi Eze", "5": "Bradley Barcola", "6": "Marcus Rashford", "7": "Dani Olmo"}}, "ucl-2027.craig": {"draft": "ucl-2027", "r": {"0": "Ousmane Dembélé", "1": "Raphinha", "2": "Victor Osimhen", "3": "Ferran Torres", "4": "Ismael Saibari", "5": "Bryan Mbeumo", "6": "Rayan Cherki", "7": "Viktor Gyökeres"}}, "ucl-2027.kooz": {"draft": "ucl-2027", "r": {"0": "Jude Bellingham", "1": "Lamine Yamal", "2": "Antoine Semenyo", "3": "Serhou Guirassy", "4": "Matheus Cunha", "5": "Luis Suárez", "6": "Dominik Szoboszlai", "7": "Paulo Dybala"}}}, "stats": {}};
const COLS=["drafts","picks","stats"];
export default async (req) => {
  const store = getStore("draft-hub");
  const path = new URL(req.url).pathname.replace(/^\/api\//, "");
  const load = async (c) => (await store.get(c, {type: "json"})) || {};
  if (path === "all") {
    if (!(await store.get("seeded"))) {
      for (const c of COLS) await store.setJSON(c, SEED[c] || {});
      await store.set("seeded", "1");
    }
    const out = {};
    for (const c of COLS) out[c] = await load(c);
    return Response.json(out, {headers: {"cache-control": "no-store"}});
  }
  if (path === "set" && req.method === "POST") {
    let b; try { b = await req.json(); } catch { return new Response("bad", {status: 400}); }
    const {c, i, data} = b;
    if (!COLS.includes(c) || !/^[A-Za-z0-9._~:@+-]{1,100}$/.test(String(i)) || typeof data !== "object") return new Response("bad", {status: 400});
    const key = Netlify.env.get("ADMIN_KEY");
    if (c !== "picks" && (!key || req.headers.get("x-admin") !== key)) return new Response("no", {status: 401});
    const m = await load(c); m[i] = data; await store.setJSON(c, m);
    return Response.json({ok: 1});
  }
  return new Response("not found", {status: 404});
};
export const config = {path: "/api/*"};
