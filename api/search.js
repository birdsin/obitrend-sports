export default async function handler(req,res){
  res.setHeader("Cache-Control","s-maxage=120, stale-while-revalidate=300");
  const q=String(req.query?.q||"").trim();
  const season=String(req.query?.season||"2026");
  const demoTeams=[
    {type:"team",id:101,name:"Arsenal",subtitle:"England",logo:""},
    {type:"team",id:102,name:"Barcelona",subtitle:"Spain",logo:""},
    {type:"team",id:103,name:"Inter",subtitle:"Italy",logo:""},
    {type:"team",id:104,name:"Chelsea",subtitle:"England",logo:""},
    {type:"team",id:105,name:"Manchester United",subtitle:"England",logo:""}
  ];
  const demoPlayers=[
    {type:"player",id:2001,name:"Bukayo Saka",subtitle:"Arsenal",logo:""},
    {type:"player",id:2002,name:"Lamine Yamal",subtitle:"Barcelona",logo:""},
    {type:"player",id:2003,name:"Cole Palmer",subtitle:"Chelsea",logo:""}
  ];
  if(!q)return res.status(200).json({source:"demo",results:[]});
  if(!process.env.APISPORTS_KEY){
    const needle=q.toLowerCase();
    return res.status(200).json({source:"demo",results:[...demoTeams,...demoPlayers].filter(x=>(x.name+" "+x.subtitle).toLowerCase().includes(needle)).slice(0,12)});
  }
  try{
    const key=process.env.APISPORTS_KEY;
    const headers={"x-apisports-key":key};
    const [tr,pr]=await Promise.all([
      fetch("https://v3.football.api-sports.io/teams?search="+encodeURIComponent(q),{headers}),
      fetch("https://v3.football.api-sports.io/players?search="+encodeURIComponent(q)+"&season="+encodeURIComponent(season),{headers})
    ]);
    if(!tr.ok||!pr.ok)return res.status(502).json({source:"api-sports",error:"Search provider unavailable"});
    const [tj,pj]=await Promise.all([tr.json(),pr.json()]);
    const teams=(tj.response||[]).map(x=>({type:"team",id:x.team?.id,name:x.team?.name||"Team",subtitle:x.team?.country||"Football",logo:x.team?.logo||""}));
    const players=(pj.response||[]).map(x=>({type:"player",id:x.player?.id,name:x.player?.name||"Player",subtitle:x.statistics?.[0]?.team?.name||x.player?.nationality||"Football",logo:x.player?.photo||""}));
    return res.status(200).json({source:"api-sports",results:[...teams,...players].slice(0,16)});
  }catch{return res.status(500).json({source:"api-sports",error:"Unable to search sports data"});}
}