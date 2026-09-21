export default async function handler(req, res) {
  res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=900");
  const key = process.env.APISPORTS_KEY;
  const league = req.query?.league;
  const demo = [
    { id:4, league:"Bundesliga", home:"Bayern", homeId:106, away:"Dortmund", awayId:107, time:"18:30", live:false, date:"2026-09-21T18:30:00+01:00" },
    { id:5, league:"UEFA Champions League", home:"Real Madrid", homeId:108, away:"PSG", awayId:109, time:"20:00", live:false, date:"2026-09-21T20:00:00+01:00" },
    { id:6, league:"Premier League", home:"Liverpool", homeId:110, away:"Manchester City", awayId:111, time:"20:00", live:false, date:"2026-09-21T20:00:00+01:00" },
    { id:7, league:"La Liga", home:"Barcelona", homeId:102, away:"Real Sociedad", awayId:112, time:"21:00", live:false, date:"2026-09-21T21:00:00+01:00" }
  ];

  if (!key) return res.status(200).json({ source:"demo", updatedAt:new Date().toISOString(), matches:demo });

  try {
    const params = new URLSearchParams({ next:"20", timezone:"Africa/Lagos" });
    if (league) params.set("league", league);
    const response = await fetch("https://v3.football.api-sports.io/fixtures?" + params.toString(), {
      headers:{ "x-apisports-key":key }
    });
    if (!response.ok) return res.status(502).json({ source:"api-sports", error:"Upcoming fixtures provider unavailable" });
    const json = await response.json();
    const matches = (json.response || []).map(item => ({
      id:item.fixture?.id,
      league:item.league?.name || "Football",
      leagueId:item.league?.id,
      home:item.teams?.home?.name || "Home",
      homeId:item.teams?.home?.id,
      away:item.teams?.away?.name || "Away",
      awayId:item.teams?.away?.id,
      time:item.fixture?.date ? new Date(item.fixture.date).toLocaleTimeString("en-NG",{hour:"2-digit",minute:"2-digit"}) : "",
      date:item.fixture?.date,
      live:false,
      status:item.fixture?.status?.short || "NS"
    }));
    return res.status(200).json({ source:"api-sports", updatedAt:new Date().toISOString(), matches });
  } catch {
    return res.status(500).json({ source:"api-sports", error:"Unable to load upcoming fixtures" });
  }
}