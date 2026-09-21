import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { Home, Radio, Trophy, User, Search, Play, X, BarChart3, RefreshCw } from "lucide-react";
import "./styles.css";

const demoMatches = [
  { id:1, league:"Premier League", home:"Arsenal", away:"Chelsea", hs:2, as:1, time:"67'", live:true },
  { id:2, league:"La Liga", home:"Barcelona", away:"Valencia", hs:1, as:0, time:"HT", live:true },
  { id:3, league:"Serie A", home:"Inter", away:"Roma", hs:0, as:0, time:"31'", live:true },
  { id:4, league:"Bundesliga", home:"Bayern", away:"Dortmund", time:"18:30", live:false },
  { id:5, league:"Champions League", home:"Real Madrid", away:"PSG", time:"20:00", live:false },
  { id:6, league:"NBA", home:"Lakers", away:"Warriors", time:"02:30", live:false }
];

function App() {
  const [page,setPage] = useState("Home");
  const [query,setQuery] = useState("");
  const [selected,setSelected] = useState(null);
  const [points,setPoints] = useState(1000);
  const [pick,setPick] = useState(null);
  const [matches,setMatches] = useState(demoMatches);
  const [dataSource,setDataSource] = useState("demo");
  const [updatedAt,setUpdatedAt] = useState(null);
  const [loading,setLoading] = useState(true);

  const loadMatches = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/live");
      const data = await response.json();
      if (Array.isArray(data.matches) && data.matches.length) setMatches(data.matches);
      setDataSource(data.source || "demo");
      setUpdatedAt(data.updatedAt || null);
    } catch {
      setMatches(demoMatches);
      setDataSource("demo");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMatches();
    const timer = setInterval(loadMatches, 30000);
    return () => clearInterval(timer);
  }, []);

  const filtered = useMemo(() => matches.filter(m =>
    (m.home+" "+m.away+" "+m.league).toLowerCase().includes(query.toLowerCase())
  ), [matches, query]);

  const live = matches.filter(m => m.live);

  const choosePick = (m, side) => {
    setPick(m.id+"-"+side);
    setPoints(p => Math.max(0,p-10));
  };

  return <div className="app">
    <header className="topbar">
      <div className="brand"><span className="mark">♛</span><div><b>OBITREND</b><small>SPORTS</small></div></div>
      <div className="top-actions">
        <div className="points">● {points.toLocaleString()} pts</div>
        <User size={20}/>
      </div>
    </header>

    <main>
      <div className="data-status">
        <span className={dataSource==="api-sports" ? "status-live" : "status-demo"}>
          ● {dataSource==="api-sports" ? "LIVE DATA" : "DEMO DATA"}
        </span>
        <button onClick={loadMatches} disabled={loading}><RefreshCw size={13}/> {loading ? "Updating" : "Refresh"}</button>
      </div>

      {page==="Home" && <>
        <section className="hero">
          <div>
            <span className="eyebrow">LIVE SPORTS HUB</span>
            <h1>Every match.<br/><em>One place.</em></h1>
            <p>Live scores, match centres, statistics and practice picks.</p>
            <button onClick={()=>setPage("Live")} className="gold-btn"><Radio size={17}/> Watch Live Matches</button>
          </div>
          <div className="hero-ball">⚽</div>
        </section>
        <SectionTitle title="Live now" action="See all" onClick={()=>setPage("Live")}/>
        <div className="match-grid">{live.map(m=><MatchCard key={m.id} m={m} onClick={()=>setSelected(m)}/>)}</div>
        <SectionTitle title="Upcoming"/>
        <div className="match-grid">{matches.filter(m=>!m.live).map(m=><MatchCard key={m.id} m={m} onClick={()=>setSelected(m)}/>)}</div>
      </>}

      {page==="Live" && <><SectionTitle title="Live matches"/><div className="search"><Search size={18}/><input placeholder="Search teams or leagues" value={query} onChange={e=>setQuery(e.target.value)}/></div><div className="match-grid">{filtered.filter(m=>m.live).map(m=><MatchCard key={m.id} m={m} onClick={()=>setSelected(m)}/>)}</div></>}

      {page==="Matches" && <><SectionTitle title="All matches"/><div className="search"><Search size={18}/><input placeholder="Search teams or leagues" value={query} onChange={e=>setQuery(e.target.value)}/></div><div className="match-grid">{filtered.map(m=><MatchCard key={m.id} m={m} onClick={()=>setSelected(m)}/>)}</div></>}

      {page==="Picks" && <section className="panel"><SectionTitle title="Practice picks"/><p className="muted">Virtual points only. No real-money wagering is enabled.</p>{matches.slice(0,4).map(m=><div className="pick-row" key={m.id}><div><b>{m.home} vs {m.away}</b><small>{m.league} · {m.time}</small></div><div className="pick-buttons"><button className={pick===m.id+"-H"?"picked":""} onClick={()=>choosePick(m,"H")}>{m.home}</button><button className={pick===m.id+"-A"?"picked":""} onClick={()=>choosePick(m,"A")}>{m.away}</button></div></div>)}</section>}

      {page==="Account" && <section className="panel account"><div className="avatar">O</div><h2>OBITREND SPORTS</h2><p className="muted">Account and app settings</p><div className="account-card"><span>Virtual points</span><b>{points.toLocaleString()}</b></div><div className="account-card"><span>Sports data</span><b>{dataSource==="api-sports" ? "Connected" : "Demo mode"}</b></div><div className="account-card"><span>Real-money betting</span><b>Not enabled</b></div><div className="account-card"><span>Live video</span><b>Rights required</b></div></section>}
    </main>

    <nav className="bottom-nav">
      {[["Home",Home],["Live",Radio],["Matches",Trophy],["Picks",BarChart3],["Account",User]].map(([name,Icon])=>
        <button key={name} className={page===name?"active":""} onClick={()=>setPage(name)}><Icon size={20}/><span>{name}</span></button>
      )}
    </nav>

    {selected && <div className="modal-backdrop" onClick={()=>setSelected(null)}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <button className="close" onClick={()=>setSelected(null)}><X/></button>
        <span className="live-label">{selected.live?"● LIVE":"UPCOMING"}</span>
        <h2>{selected.home} <span>vs</span> {selected.away}</h2>
        {selected.live ? <div className="video-box"><Play size={40}/><b>Live video placeholder</b><small>Streaming will appear when OBITREND has the required rights.</small></div> : <div className="video-box"><b>Match centre</b><small>Kickoff {selected.time}. Live coverage will appear here when available.</small></div>}
        <div className="tabs"><button className="tab-active">Stats</button><button>Events</button><button>Lineups</button></div>
      </div>
    </div>}
  </div>
}

function SectionTitle({title,action,onClick}) {
  return <div className="section-title"><h2>{title}</h2>{action&&<button onClick={onClick}>{action} →</button>}</div>
}
function MatchCard({m,onClick}) {
  return <button className="match-card" onClick={onClick}>
    <div className="league">{m.league}<span className={m.live?"live-dot":"scheduled"}>{m.live?"LIVE":m.time}</span></div>
    <div className="teams"><div><strong>{m.home}</strong>{m.live&&<b>{m.hs}</b>}</div><div><strong>{m.away}</strong>{m.live&&<b>{m.as}</b>}</div></div>
    <div className="card-footer">{m.live?<><span>{m.time}</span><span>Match Centre →</span></>:<span>View match →</span>}</div>
  </button>
}
createRoot(document.getElementById("root")).render(<App />);