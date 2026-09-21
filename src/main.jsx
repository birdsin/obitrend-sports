import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { Home, Radio, Trophy, User, Search, Play, X, BarChart3, RefreshCw, Users, ChevronRight } from "lucide-react";
import "./styles.css";

const demoMatches=[
  {id:1,league:"Premier League",home:"Arsenal",away:"Chelsea",hs:2,as:1,time:"67'",live:true},
  {id:2,league:"La Liga",home:"Barcelona",away:"Valencia",hs:1,as:0,time:"HT",live:true},
  {id:3,league:"Serie A",home:"Inter",away:"Roma",hs:0,as:0,time:"31'",live:true},
  {id:4,league:"Bundesliga",home:"Bayern",away:"Dortmund",time:"18:30",live:false},
  {id:5,league:"Champions League",home:"Real Madrid",away:"PSG",time:"20:00",live:false},
  {id:6,league:"NBA",home:"Lakers",away:"Warriors",time:"02:30",live:false}
];

function App(){
  const [page,setPage]=useState("Home"),[query,setQuery]=useState(""),[selected,setSelected]=useState(null);
  const [points,setPoints]=useState(1000),[pick,setPick]=useState(null),[matches,setMatches]=useState(demoMatches);
  const [upcoming,setUpcoming]=useState(demoMatches.filter(m=>!m.live));
  const [dataSource,setDataSource]=useState("demo"),[updatedAt,setUpdatedAt]=useState(null),[loading,setLoading]=useState(true);
  const [leagueId,setLeagueId]=useState("39"),[season,setSeason]=useState("2026"),[standings,setStandings]=useState(null),[standingsLoading,setStandingsLoading]=useState(false);
  const [profile,setProfile]=useState(null);

  const loadMatches=async()=>{
    setLoading(true);
    try{const [liveRes,upcomingRes]=await Promise.all([fetch("/api/live"),fetch("/api/upcoming")]);const d=await liveRes.json(),u=await upcomingRes.json();if(Array.isArray(d.matches)&&d.matches.length)setMatches(d.matches);if(Array.isArray(u.matches))setUpcoming(u.matches);setDataSource(d.source==="api-sports"||u.source==="api-sports"?"api-sports":"demo");setUpdatedAt(d.updatedAt||u.updatedAt||null);}
    catch{setMatches(demoMatches);setDataSource("demo");}
    finally{setLoading(false);}
  };
  useEffect(()=>{loadMatches();const t=setInterval(loadMatches,30000);return()=>clearInterval(t);},[]);
  const filtered=useMemo(()=>matches.filter(m=>(m.home+" "+m.away+" "+m.league).toLowerCase().includes(query.toLowerCase())),[matches,query]);
  const live=matches.filter(m=>m.live);
  const choosePick=(m,side)=>{setPick(m.id+"-"+side);setPoints(p=>Math.max(0,p-10));};

  return <div className="app">
    <header className="topbar"><div className="brand"><span className="mark">♛</span><div><b>OBITREND</b><small>SPORTS</small></div></div><div className="top-actions"><button className="top-search" onClick={()=>setPage("Search")} aria-label="Search"><Search size={19}/></button><div className="points">● {points.toLocaleString()} pts</div><User size={20}/></div></header>
    <main>
      <div className="data-status"><span className={dataSource==="api-sports"?"status-live":"status-demo"}>● {dataSource==="api-sports"?"LIVE DATA":"DEMO DATA"}</span><span className="updated">{updatedAt?new Date(updatedAt).toLocaleTimeString():""}</span><button onClick={loadMatches} disabled={loading}><RefreshCw size={13}/> {loading?"Updating":"Refresh"}</button></div>
      {page==="Home"&&<><section className="hero"><div><span className="eyebrow">LIVE SPORTS HUB</span><h1>Every match.<br/><em>One place.</em></h1><p>Live scores, match centres, statistics and practice picks.</p><button onClick={()=>setPage("Live")} className="gold-btn"><Radio size={17}/> Watch Live Matches</button></div><div className="hero-ball">⚽</div></section><SectionTitle title="Live now" action="See all" onClick={()=>setPage("Live")}/><div className="match-grid">{live.map(m=><MatchCard key={m.id} m={m} onClick={()=>setSelected(m)}/>)}</div><SectionTitle title="Upcoming"/><div className="match-grid">{upcoming.slice(0,6).map(m=><MatchCard key={m.id} m={m} onClick={()=>setSelected(m)}/>)}</div></>}
      {page==="Live"&&<><SectionTitle title="Live matches"/><SearchBox query={query} setQuery={setQuery}/><div className="match-grid">{filtered.filter(m=>m.live).map(m=><MatchCard key={m.id} m={m} onClick={()=>setSelected(m)}/>)}</div></>}
      {page==="Search"&&<SearchPage setProfile={setProfile}/>}
      {page==="Matches"&&<MatchesPage filtered={[...filtered,...upcoming.filter(u=>!matches.some(m=>m.id===u.id))]} query={query} setQuery={setQuery} setSelected={setSelected} leagueId={leagueId} setLeagueId={setLeagueId} season={season} setSeason={setSeason} standings={standings} setStandings={setStandings} standingsLoading={standingsLoading} setStandingsLoading={setStandingsLoading} setProfile={setProfile}/>}
      {page==="Picks"&&<section className="panel"><SectionTitle title="Practice picks"/><p className="muted">Virtual points only. No real-money wagering is enabled.</p>{matches.slice(0,4).map(m=><div className="pick-row" key={m.id}><div><b>{m.home} vs {m.away}</b><small>{m.league} · {m.time}</small></div><div className="pick-buttons"><button className={pick===m.id+"-H"?"picked":""} onClick={()=>choosePick(m,"H")}>{m.home}</button><button className={pick===m.id+"-A"?"picked":""} onClick={()=>choosePick(m,"A")}>{m.away}</button></div></div>)}</section>}
      {page==="Account"&&<section className="panel account"><div className="avatar">O</div><h2>OBITREND SPORTS</h2><p className="muted">Account and app settings</p><div className="account-card"><span>Virtual points</span><b>{points.toLocaleString()}</b></div><div className="account-card"><span>Sports data</span><b>{dataSource==="api-sports"?"Connected":"Demo mode"}</b></div><div className="account-card"><span>Real-money betting</span><b>Not enabled</b></div><div className="account-card"><span>Live video</span><b>Rights required</b></div></section>}
    </main>
    <nav className="bottom-nav">{[["Home",Home],["Live",Radio],["Matches",Trophy],["Picks",BarChart3],["Account",User]].map(([name,Icon])=><button key={name} className={page===name?"active":""} onClick={()=>setPage(name)}><Icon size={20}/><span>{name}</span></button>)}</nav>
    {selected&&<MatchModal match={selected} onClose={()=>setSelected(null)} setProfile={setProfile}/>}\n    {profile&&<ProfileModal profile={profile} onClose={()=>setProfile(null)}/>}
  </div>
}

function SearchBox({query,setQuery}){return <div className="search"><Search size={18}/><input placeholder="Search teams or leagues" value={query} onChange={e=>setQuery(e.target.value)}/></div>}

function SearchPage({setProfile}){
  const [q,setQ]=useState(""),[results,setResults]=useState([]),[loading,setLoading]=useState(false),[searched,setSearched]=useState(false);
  useEffect(()=>{const value=q.trim();if(!value){setResults([]);setSearched(false);return}const t=setTimeout(async()=>{setLoading(true);try{const r=await fetch("/api/search?q="+encodeURIComponent(value));const d=await r.json();setResults(d.results||[]);setSearched(true)}catch{setResults([]);setSearched(true)}finally{setLoading(false)}},350);return()=>clearTimeout(t)},[q]);
  return <section><SectionTitle title="Search sports" /><div className="search global-search"><Search size={18}/><input autoFocus placeholder="Search teams or players" value={q} onChange={e=>setQ(e.target.value)}/></div><div className="search-results">{loading?<div className="detail-empty">Searching…</div>:searched&&!results.length?<div className="detail-empty">No teams or players found.</div>:results.map((r,i)=><button className="search-result" key={r.type+"-"+r.id+"-"+i} onClick={()=>setProfile({type:r.type,id:r.id,name:r.name})}>{r.logo?<img src={r.logo} alt=""/>:<span className="result-icon">{r.type==="team"?"T":"P"}</span>}<span><b>{r.name}</b><small>{r.subtitle}</small></span><ChevronRight size={16}/></button>)}</div></section>
}
function SectionTitle({title,action,onClick}){return <div className="section-title"><h2>{title}</h2>{action&&<button onClick={onClick}>{action} →</button>}</div>}
function MatchCard({m,onClick}){return <button className="match-card" onClick={onClick}><div className="league">{m.league}<span className={m.live?"live-dot":"scheduled"}>{m.live?"LIVE":m.time}</span></div><div className="teams"><div><strong>{m.home}</strong>{m.live&&<b>{m.hs}</b>}</div><div><strong>{m.away}</strong>{m.live&&<b>{m.as}</b>}</div></div><div className="card-footer">{m.live?<><span>{m.time}</span><span>Match Centre →</span></>:<span>View match →</span>}</div></button>}

function MatchesPage({filtered,query,setQuery,setSelected,leagueId,setLeagueId,season,setSeason,standings,setStandings,standingsLoading,setStandingsLoading,setProfile}){
  const loadStandings=async()=>{setStandingsLoading(true);try{const r=await fetch(`/api/standings?league=${leagueId}&season=${season}`);const d=await r.json();setStandings(d)}catch{setStandings({standings:[]})}finally{setStandingsLoading(false)}};
  useEffect(()=>{loadStandings()},[leagueId,season]);
  const leagues=[["39","Premier League"],["140","La Liga"],["135","Serie A"],["78","Bundesliga"],["2","UEFA Champions League"]];
  return <><SectionTitle title="All matches"/><SearchBox query={query} setQuery={setQuery}/><div className="match-grid">{filtered.map(m=><MatchCard key={m.id} m={m} onClick={()=>setSelected(m)}/>)}</div>
  <section className="panel explore-panel"><div className="explore-head"><div><span className="eyebrow">FOOTBALL DATA</span><h2>Competitions & standings</h2></div><div className="season-box"><span>Season</span><select value={season} onChange={e=>setSeason(e.target.value)}><option value="2026">2026</option><option value="2025">2025</option></select></div></div>
  <div className="league-chips">{leagues.map(([id,name])=><button key={id} className={leagueId===id?"chip-active":""} onClick={()=>setLeagueId(id)}>{name}</button>)}</div>
  <div className="standings-title"><b>{standings?.league?.name||leagues.find(x=>x[0]===leagueId)?.[1]||"League"}</b><button onClick={loadStandings}><RefreshCw size={13}/>{standingsLoading?"Updating":"Refresh"}</button></div>
  {standingsLoading?<div className="detail-empty">Loading standings…</div>:<StandingsTable rows={(standings?.standings||[]).flat()} setProfile={setProfile}/>}</section></>
}
function StandingsTable({rows,setProfile}){if(!rows.length)return <div className="detail-empty">Standings are not available for this competition or season yet.</div>;return <div className="table-wrap"><div className="standing-row standing-head"><span>#</span><span>Team</span><span>P</span><span>W</span><span>D</span><span>L</span><span>GD</span><span>Pts</span></div>{rows.slice(0,30).map((r,i)=><button className="standing-row" key={r.team?.id||i} onClick={()=>setProfile({type:"team",id:r.team?.id,name:r.team?.name})}><span>{r.rank||i+1}</span><span className="team-cell">{r.team?.logo&&<img src={r.team.logo} alt=""/>}<b>{r.team?.name||"Team"}</b></span><span>{r.all?.played??0}</span><span>{r.all?.win??0}</span><span>{r.all?.draw??0}</span><span>{r.all?.lose??0}</span><span>{r.goalsDiff??0}</span><strong>{r.points??0}</strong></button>)}</div>}

function MatchModal({match,onClose,setProfile}){
  const [tab,setTab]=useState("Stats"),[detail,setDetail]=useState(null),[loading,setLoading]=useState(true);
  useEffect(()=>{let active=true;setLoading(true);fetch("/api/match?fixture="+encodeURIComponent(match.id)).then(r=>r.json()).then(d=>{if(active)setDetail(d)}).catch(()=>{}).finally(()=>{if(active)setLoading(false)});return()=>{active=false};},[match.id]);
  const data=detail?.data||{},events=data.events||[],lineups=data.lineups||[],stats=data.statistics||[];
  return <div className="modal-backdrop" onClick={onClose}><div className="modal" onClick={e=>e.stopPropagation()}>
    <button className="close" onClick={onClose}><X/></button><span className="live-label">{match.live?"● LIVE":"UPCOMING"}</span>
    <h2><button className="team-link" onClick={()=>setProfile({type:"team",id:match.homeId,name:match.home})}>{match.home}</button> <span>vs</span> <button className="team-link" onClick={()=>setProfile({type:"team",id:match.awayId,name:match.away})}>{match.away}</button></h2><div className="score-head"><strong>{match.hs??"—"}</strong><span>-</span><strong>{match.as??"—"}</strong></div>
    {match.live?<div className="video-box"><Play size={40}/><b>Live video placeholder</b><small>Streaming will appear when OBITREND has the required rights.</small></div>:<div className="video-box"><b>Match centre</b><small>Kickoff {match.time}. Live coverage will appear here when available.</small></div>}
    <div className="tabs">{["Stats","Events","Lineups"].map(t=><button key={t} className={tab===t?"tab-active":""} onClick={()=>setTab(t)}>{t}</button>)}</div>
    <div className="detail-panel">{loading?<div className="detail-empty">Loading match centre…</div>:tab==="Stats"?<Stats stats={stats}/>:tab==="Events"?<Events events={events}/>:<Lineups lineups={lineups} setProfile={setProfile}/>}</div>
  </div></div>
}
function Stats({stats}){if(!stats.length)return <div className="detail-empty">Statistics will appear when the provider supplies them.</div>;return <div>{stats.map((team,i)=><div className="stat-team" key={i}><b>{team.team?.name}</b>{(team.statistics||[]).map((s,j)=><div className="stat-row" key={j}><span>{s.type}</span><strong>{s.value??"—"}</strong></div>)}</div>)}</div>}
function Events({events}){if(!events.length)return <div className="detail-empty">No events available yet.</div>;return <div>{events.map((e,i)=><div className="event-row" key={i}><span>{e.time?.elapsed??"—"}'</span><b>{e.type}</b><span>{e.player?.name||"Event"}</span><small>{e.detail||""}</small></div>)}</div>}
function Lineups({lineups,setProfile}){if(!lineups.length)return <div className="detail-empty">Lineups will appear when available.</div>;return <div>{lineups.map((team,i)=><div className="stat-team" key={i}><b>{team.team?.name}{team.formation?" · "+team.formation:""}</b>{(team.startXI||[]).slice(0,11).map((p,j)=><button className="lineup-player" key={j} onClick={()=>p.player?.id&&setProfile({type:"player",id:p.player.id,name:p.player.name})}><span>{j+1}</span>{p.player?.name||"Player"}</button>)}</div>)}</div>}
createRoot(document.getElementById("root")).render(<App />);
function ProfileModal({profile,onClose}){
  const [detail,setDetail]=useState(null),[loading,setLoading]=useState(true);
  useEffect(()=>{let active=true;setLoading(true);const endpoint=profile.type==="team"?`/api/team?team=${encodeURIComponent(profile.id)}`:`/api/player?player=${encodeURIComponent(profile.id)}&season=2026`;fetch(endpoint).then(r=>r.json()).then(d=>{if(active)setDetail(d)}).catch(()=>{}).finally(()=>{if(active)setLoading(false)});return()=>{active=false}},[profile]);
  const data=detail?.data||{};
  return <div className="modal-backdrop" onClick={onClose}><div className="modal profile-modal" onClick={e=>e.stopPropagation()}><button className="close" onClick={onClose}><X/></button><span className="live-label">{profile.type==="team"?"TEAM PROFILE":"PLAYER PROFILE"}</span>{loading?<div className="detail-empty">Loading profile…</div>:profile.type==="team"?<TeamProfile data={data} setProfile={setProfileFromChild}/>:<PlayerProfile data={data}/>}</div></div>;
  function setProfileFromChild(p){setDetail(null);onClose();} 
}
function TeamProfile({data}){const t=data.team||{},v=data.venue||{};return <><div className="profile-hero">{t.logo&&<img src={t.logo} alt=""/>}<div><h2>{t.name||"Team"}</h2><p>{t.country?.name||t.country||"Football"}{t.founded?` · Founded ${t.founded}`:""}</p></div></div><div className="profile-grid"><div><small>Venue</small><b>{v.name||"—"}</b></div><div><small>City</small><b>{v.city||"—"}</b></div><div><small>Capacity</small><b>{v.capacity||"—"}</b></div></div><div className="profile-list"><h3>Squad</h3>{(data.squad||[]).slice(0,18).map(p=><div className="squad-row" key={p.id}><span>{p.number||"—"}</span><b>{p.name}</b><small>{p.position||""}</small></div>)}</div></>}
function PlayerProfile({data}){const p=data.player||{},s=(data.statistics||[])[0]||{},g=s.games||{},go=s.goals||{};return <><div className="profile-hero">{p.photo&&<img src={p.photo} alt=""/>}<div><h2>{p.name||"Player"}</h2><p>{p.nationality||"International"}{p.age?` · ${p.age} years`:""}</p></div></div><div className="profile-grid"><div><small>Position</small><b>{g.position||"—"}</b></div><div><small>Appearances</small><b>{g.appearences??"—"}</b></div><div><small>Minutes</small><b>{g.minutes??"—"}</b></div><div><small>Goals</small><b>{go.total??"—"}</b></div><div><small>Assists</small><b>{go.assists??"—"}</b></div><div><small>Nationality</small><b>{p.nationality||"—"}</b></div></div></>}