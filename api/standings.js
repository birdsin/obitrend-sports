export default async function handler(req, res) {
  res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=7200");
  const league = req.query?.league || "39";
  const season = req.query?.season || "2026";
  const key = process.env.APISPORTS_KEY;

  const demoTeams = [
    ["Arsenal", 6, 5, 1, 0, 15, 4, 16],
    ["Chelsea", 6, 4, 1, 1, 12, 6, 13],
    ["Liverpool", 6, 4, 0, 2, 11, 7, 12],
    ["Manchester City", 6, 3, 2, 1, 10, 6, 11],
    ["Manchester United", 6, 3, 1, 2, 9, 8, 10],
    ["Tottenham", 6, 2, 2, 2, 8, 7, 8]
  ];

  const demo = demoTeams.map((x, i) => ({
    rank: i + 1,
    team: { id: 100 + i, name: x[0], logo: "" },
    points: x[7],
    goalsDiff: x[6] - x[5],
    all: { played: x[1], win: x[2], draw: x[3], lose: x[4] },
    goals: { for: x[5], against: x[6] },
    form: "WWDWW"
  }));

  if (!key) {
    return res.status(200).json({
      source: "demo",
      league: { id: Number(league), name: "Premier League", season: Number(season) },
      standings: [demo]
    });
  }

  try {
    const url = "https://v3.football.api-sports.io/standings?league=" +
      encodeURIComponent(league) + "&season=" + encodeURIComponent(season);
    const response = await fetch(url, { headers: { "x-apisports-key": key } });
    if (!response.ok) return res.status(502).json({ error: "Standings provider unavailable" });
    const json = await response.json();
    const item = json.response?.[0];
    if (!item) return res.status(404).json({ error: "Standings not found" });

    return res.status(200).json({
      source: "api-sports",
      league: item.league,
      standings: item.league?.standings || []
    });
  } catch {
    return res.status(500).json({ error: "Unable to load standings" });
  }
}
