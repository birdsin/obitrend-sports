export default async function handler(req, res) {
  res.setHeader("Cache-Control", "s-maxage=15, stale-while-revalidate=30");
  const fixture = req.query?.fixture;
  const key = process.env.APISPORTS_KEY;
  const demo = {
    fixture: { id: fixture || 1, status: { short: "LIVE", elapsed: 67 }, venue: { name: "OBITREND Arena", city: "Lagos" } },
    events: [
      { time:{elapsed:12}, team:{name:"Arsenal"}, player:{name:"Demo Player"}, type:"Goal", detail:"Normal Goal" },
      { time:{elapsed:44}, team:{name:"Chelsea"}, player:{name:"Demo Player"}, type:"Card", detail:"Yellow Card" },
      { time:{elapsed:61}, team:{name:"Arsenal"}, player:{name:"Demo Player"}, type:"Goal", detail:"Normal Goal" }
    ],
    lineups: [
      { team:{name:"Arsenal"}, formation:"4-3-3", startXI:[{player:{name:"Starting XI"}}], substitutes:[] },
      { team:{name:"Chelsea"}, formation:"4-2-3-1", startXI:[{player:{name:"Starting XI"}}], substitutes:[] }
    ],
    statistics: [
      { team:{name:"Arsenal"}, statistics:[{type:"Ball Possession",value:"54%"},{type:"Total Shots",value:9},{type:"Shots on Goal",value:5},{type:"Corner Kicks",value:4}] },
      { team:{name:"Chelsea"}, statistics:[{type:"Ball Possession",value:"46%"},{type:"Total Shots",value:7},{type:"Shots on Goal",value:3},{type:"Corner Kicks",value:2}] }
    ]
  };
  if (!key || !fixture) return res.status(200).json({source:"demo", data:demo});
  try {
    const response = await fetch("https://v3.football.api-sports.io/fixtures?id=" + encodeURIComponent(fixture), {headers:{"x-apisports-key":key}});
    if (!response.ok) return res.status(502).json({error:"Match data provider unavailable"});
    const json = await response.json();
    const data = json.response?.[0];
    if (!data) return res.status(404).json({error:"Match not found"});
    return res.status(200).json({source:"api-sports", data});
  } catch {
    return res.status(500).json({error:"Unable to load match data"});
  }
}