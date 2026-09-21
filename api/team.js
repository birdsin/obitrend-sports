export default async function handler(req, res) {
  res.setHeader("Cache-Control", "s-maxage=1800, stale-while-revalidate=3600");
  const team = req.query?.team;
  const key = process.env.APISPORTS_KEY;

  const demo = {
    team: { id: Number(team || 100), name: "Arsenal", logo: "", country: "England", founded: 1886 },
    venue: { name: "OBITREND Stadium", city: "London", capacity: "60,000" },
    coach: { name: "Head Coach" },
    squad: [
      { id: 1001, name: "Goalkeeper", number: 1, position: "Goalkeeper" },
      { id: 1002, name: "Defender", number: 4, position: "Defender" },
      { id: 1003, name: "Midfielder", number: 8, position: "Midfielder" },
      { id: 1004, name: "Forward", number: 9, position: "Attacker" }
    ]
  };

  if (!key || !team) return res.status(200).json({ source: "demo", data: demo });

  try {
    const [teamResponse, squadResponse] = await Promise.all([
      fetch("https://v3.football.api-sports.io/teams?id=" + encodeURIComponent(team), {
        headers: { "x-apisports-key": key }
      }),
      fetch("https://v3.football.api-sports.io/players/squads?team=" + encodeURIComponent(team), {
        headers: { "x-apisports-key": key }
      })
    ]);

    if (!teamResponse.ok) return res.status(502).json({ error: "Team provider unavailable" });
    const teamJson = await teamResponse.json();
    const squadJson = squadResponse.ok ? await squadResponse.json() : { response: [] };
    const item = teamJson.response?.[0];
    if (!item) return res.status(404).json({ error: "Team not found" });

    return res.status(200).json({
      source: "api-sports",
      data: {
        team: item.team,
        venue: item.venue,
        coach: null,
        squad: squadJson.response?.[0]?.players || []
      }
    });
  } catch {
    return res.status(500).json({ error: "Unable to load team profile" });
  }
}
