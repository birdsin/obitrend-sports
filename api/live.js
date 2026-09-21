export default async function handler(req, res) {
  res.setHeader("Cache-Control", "s-maxage=15, stale-while-revalidate=30");

  const key = process.env.APISPORTS_KEY;
  if (!key) {
    return res.status(200).json({
      source: "demo",
      updatedAt: new Date().toISOString(),
      matches: [
        { id:1, league:"Premier League", home:"Arsenal", away:"Chelsea", hs:2, as:1, time:"67'", live:true },
        { id:2, league:"La Liga", home:"Barcelona", away:"Valencia", hs:1, as:0, time:"HT", live:true },
        { id:3, league:"Serie A", home:"Inter", away:"Roma", hs:0, as:0, time:"31'", live:true },
        { id:4, league:"Bundesliga", home:"Bayern", away:"Dortmund", time:"18:30", live:false },
        { id:5, league:"Champions League", home:"Real Madrid", away:"PSG", time:"20:00", live:false },
        { id:6, league:"NBA", home:"Lakers", away:"Warriors", time:"02:30", live:false }
      ]
    });
  }

  try {
    const response = await fetch("https://v3.football.api-sports.io/fixtures?live=all", {
      headers: { "x-apisports-key": key }
    });

    if (!response.ok) {
      return res.status(502).json({ source:"api-sports", error:"Live sports data provider unavailable" });
    }

    const json = await response.json();
    const matches = (json.response || []).map(item => ({
      id: item.fixture?.id,
      league: item.league?.name || "Football",
      home: item.teams?.home?.name || "Home",
      away: item.teams?.away?.name || "Away",
      hs: item.goals?.home ?? 0,
      as: item.goals?.away ?? 0,
      time: item.fixture?.status?.elapsed ? String(item.fixture.status.elapsed) + "'" : item.fixture?.status?.short || "",
      live: true,
      status: item.fixture?.status?.short || ""
    }));

    return res.status(200).json({
      source:"api-sports",
      updatedAt:new Date().toISOString(),
      matches
    });
  } catch {
    return res.status(500).json({ source:"api-sports", error:"Unable to load live sports data" });
  }
}