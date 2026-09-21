export default async function handler(req, res) {
  res.setHeader("Cache-Control", "s-maxage=15, stale-while-revalidate=30");

  const key = process.env.APISPORTS_KEY;
  if (!key) {
    return res.status(200).json({
      source: "demo",
      updatedAt: new Date().toISOString(),
      matches: [
        { id:1, league:"Premier League", home:"Arsenal", homeId:100, away:"Chelsea", awayId:101, hs:2, as:1, time:"67'", live:true },
        { id:2, league:"La Liga", home:"Barcelona", homeId:102, away:"Valencia", awayId:103, hs:1, as:0, time:"HT", live:true },
        { id:3, league:"Serie A", home:"Inter", homeId:104, away:"Roma", awayId:105, hs:0, as:0, time:"31'", live:true },
        { id:4, league:"Bundesliga", home:"Bayern", homeId:106, away:"Dortmund", awayId:107, time:"18:30", live:false },
        { id:5, league:"Champions League", home:"Real Madrid", homeId:108, away:"PSG", awayId:109, time:"20:00", live:false },
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
      homeId: item.teams?.home?.id,
      away: item.teams?.away?.name || "Away",
      awayId: item.teams?.away?.id,
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