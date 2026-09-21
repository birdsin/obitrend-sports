export default async function handler(req, res) {
  res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=7200");
  const player = req.query?.player;
  const season = req.query?.season || "2026";
  const key = process.env.APISPORTS_KEY;

  const demo = {
    player: {
      id: Number(player || 1001),
      name: "OBITREND Player",
      firstname: "OBITREND",
      lastname: "Player",
      age: 24,
      nationality: "International",
      height: "180 cm",
      weight: "75 kg",
      photo: ""
    },
    statistics: [{
      team: { name: "Arsenal" },
      games: { appearences: 12, minutes: 840, position: "Forward" },
      goals: { total: 7, assists: 3 },
      shots: { total: 24, on: 13 },
      passes: { total: 180, key: 21 },
      cards: { yellow: 1, red: 0 }
    }]
  };

  if (!key || !player) return res.status(200).json({ source: "demo", data: demo });

  try {
    const url = "https://v3.football.api-sports.io/players?id=" +
      encodeURIComponent(player) + "&season=" + encodeURIComponent(season);
    const response = await fetch(url, { headers: { "x-apisports-key": key } });
    if (!response.ok) return res.status(502).json({ error: "Player provider unavailable" });
    const json = await response.json();
    const item = json.response?.[0];
    if (!item) return res.status(404).json({ error: "Player not found" });

    return res.status(200).json({ source: "api-sports", data: item });
  } catch {
    return res.status(500).json({ error: "Unable to load player profile" });
  }
}
