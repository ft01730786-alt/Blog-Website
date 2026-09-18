import React, {useEffect, useMemo, useState} from "react";
import {createRoot} from "react-dom/client";
import {AnimatePresence, motion} from "framer-motion";
import {
  ArrowRight, BookOpen, BriefcaseBusiness, Check, ChevronDown, Clock3,
  Code2, Copy, ExternalLink, Github, Home as AdminHome, Layers3, LockKeyhole,
  Menu, Moon, Pencil, Plus, Search, Settings, Sparkles, Sun, Trash2,
  X, LogOut, Download, Upload, Eye, FileText, FlaskConical, Award,
  Mail, Command, Save, RotateCcw
} from "lucide-react";
import "./styles.css";

type Article={id:string;title:string;slug:string;excerpt:string;content:string;category:string;tags:string[];published:boolean;featured:boolean;createdAt:string;updatedAt:string;readingTime:number;coverImage?:string;seoTitle?:string;seoDescription?:string};
type Project={id:string;title:string;slug:string;description:string;longDescription:string;technologies:string[];features:string[];githubUrl?:string;liveUrl?:string;featured:boolean;status:string};
type Lab={id:string;title:string;description:string;problem:string;solution:string;technologies:string[];featured:boolean};
type Settings={siteName:string;tagline:string;bio:string;accent:string;dark:boolean;github:string;linkedin:string;email:string};
type Admin={email:string;hash:string;salt:string};

const KEY={articles:"fd_articles",projects:"fd_projects",labs:"fd_labs",settings:"fd_settings",admin:"fd_admin",bookmarks:"fd_bookmarks",history:"fd_history"};

const seedArticles:Article[]=[
{id:"a1",title:"How I Build Modern Full-Stack Projects",slug:"how-i-build-modern-full-stack-projects",excerpt:"A practical look at turning an idea into a polished, maintainable web application.",category:"Web Development",tags:["react","architecture","javascript"],published:true,featured:true,createdAt:"2026-09-18",updatedAt:"2026-09-18",readingTime:6,content:`# How I Build Modern Full-Stack Projects

Building a project is more than writing components. I start with the **problem**, define the smallest useful version, then design the experience before writing the architecture.

## 1. Start with the user

A good project answers one clear question. I write down the target user, their pain point, and the outcome they want.

## 2. Design the system

I split the product into reusable UI, application logic, data models and services. This keeps the project easier to test and evolve.

## 3. Build in small phases

Each feature should be implemented, tested, and verified before the next feature begins.

## 4. Polish

Responsive behavior, accessibility, performance, loading states and error states are part of the product—not optional extras.

> Build something useful, then make it delightful.`},
{id:"a2",title:"My Practical JavaScript Learning System",slug:"my-practical-javascript-learning-system",excerpt:"How projects, notes and deliberate repetition can turn scattered tutorials into real skill.",category:"JavaScript",tags:["javascript","learning"],published:true,featured:false,createdAt:"2026-09-16",updatedAt:"2026-09-16",readingTime:5,content:`# My Practical JavaScript Learning System

I learn best when every concept quickly becomes something I can use.

## Learn

Study one focused concept.

## Build

Use it in a small project.

## Break

Intentionally change the code and observe what happens.

## Document

Write down the lesson in plain language.

That loop turns passive watching into active understanding.`},
{id:"a3",title:"Why I Prefer Small Experiments",slug:"why-i-prefer-small-experiments",excerpt:"Tiny labs are a fast way to explore animation, APIs, browser storage and new ideas.",category:"Labs",tags:["experiments","frontend"],published:true,featured:false,createdAt:"2026-09-12",updatedAt:"2026-09-12",readingTime:4,content:`# Why I Prefer Small Experiments

A lab has a different goal from a product. It lets me test one idea without carrying the complexity of a full application.

## Examples

- CSS perspective and depth
- Local-first storage
- Search interfaces
- Accessible dialogs
- Performance experiments

The best experiments eventually become reusable patterns.`}
];

const seedProjects:Project[]=[
{id:"p1",title:"Vehicle Tracking System",slug:"vehicle-tracking-system",description:"A dashboard concept for tracking vehicles, routes and operational data.",longDescription:"A responsive dashboard focused on information hierarchy, clear status indicators and reusable data views.",technologies:["React","TypeScript","Node.js","MongoDB"],features:["Responsive dashboard","Vehicle status views","Reusable UI architecture"],featured:true,status:"Prototype"},
{id:"p2",title:"Personal Developer Platform",slug:"personal-developer-platform",description:"This local-first blogging and portfolio platform.",longDescription:"A personal brand platform combining articles, projects, labs, learning history and a local CMS.",technologies:["React","TypeScript","Vite","IndexedDB"],features:["Local CMS","Article reader","Backup/restore"],featured:true,status:"Active"}
];
const seedLabs:Lab[]=[
{id:"l1",title:"3D Card Depth Experiment",slug:"3d-card-depth",description:"A lightweight perspective interaction for project cards.",problem:"Make cards feel dimensional without a heavy 3D scene.",solution:"Use CSS perspective and pointer-aware transforms with reduced-motion support.",technologies:["CSS","React"],featured:true},
{id:"l2",title:"Local-First Content Store",slug:"local-first-content-store",description:"Testing a browser-only content management workflow.",problem:"Persist a personal site without a remote database.",solution:"Use LocalStorage for structured data and IndexedDB for larger media.",technologies:["Web Storage","IndexedDB","Web Crypto"],featured:true}
];

function uid(){return crypto.randomUUID?.()||Math.random().toString(36).slice(2)}
function get<T>(k:string,f:T):T{try{const v=localStorage.getItem(k);return v?JSON.parse(v):f}catch{return f}}
function set(k:string,v:unknown){localStorage.setItem(k,JSON.stringify(v));window.dispatchEvent(new Event("fd-storage"))}
function esc(s:string){return s.replace(/[&<>]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;"}[c]!))}
function markdown(md:string){
 let h=esc(md).replace(/^### (.*)$/gm,"<h3>$1</h3>").replace(/^## (.*)$/gm,"<h2>$1</h2>").replace(/^# (.*)$/gm,"<h1>$1</h1>");
 h=h.replace(/^> (.*)$/gm,"<blockquote>$1</blockquote>").replace(/`([^`]+)`/g,"<code>$1</code>");
 h=h.replace(/\*\*([^*]+)\*\*/g,"<strong>$1</strong>").replace(/\*([^*]+)\*/g,"<em>$1</em>");
 h=h.replace(/^(?:- )(.*)$/gm,"<li>$1</li>").replace(/(<li>.*<\/li>)/gs,"<ul>$1</ul>");
 return h.split(/\n{2,}/).map(x=>x.startsWith("<h")||x.startsWith("<ul")||x.startsWith("<blockquote")?x:`<p>${x.replace(/\n/g,"<br/>")}</p>`).join("");
}
async function hashPassword(password:string,salt:string){
 const data=new TextEncoder().encode(password+salt);
 const digest=await crypto.subtle.digest("SHA-256",data);
 return [...new Uint8Array(digest)].map(x=>x.toString(16).padStart(2,"0")).join("");
}
function useStore<T>(k:string,initial:T){const [v,setV]=useState<T>(()=>get(k,initial));useEffect(()=>{const f=()=>setV(get(k,initial));window.addEventListener("fd-storage",f);return()=>window.removeEventListener("fd-storage",f)},[k]);return v}
function Logo({onAdmin}:{onAdmin:()=>void}){const [n,setN]=useState(0);const tap=()=>{const x=n+1;setN(x);if(x>=5){setN(0);onAdmin()};setTimeout(()=>setN(0),1500)};return <button className="logo" onClick={tap} aria-label="Site logo"><span className="logo-mark">F</span><span>FAISAL<span className="muted">.DEV</span></span></button>}

function App(){
 const [settings,setSettings]=useState<Settings>(()=>get(KEY.settings,{siteName:"Faisal Dev",tagline:"Build. Learn. Share.",bio:"Developer, builder and lifelong learner documenting projects, experiments and lessons.",accent:"#7c5cff",dark:true,github:"https://github.com/",linkedin:"https://linkedin.com/",email:"hello@example.com"}));
 const [articles]=[useStore(KEY.articles,seedArticles)];
 const projects=useStore(KEY.projects,seedProjects),labs=useStore(KEY.labs,seedLabs);
 const [page,setPage]=useState("home"),[selected,setSelected]=useState<Article|null>(null),[query,setQuery]=useState(""),[adminOpen,setAdminOpen]=useState(false);
 const [theme,setTheme]=useState(settings.dark);
 useEffect(()=>{document.documentElement.dataset.theme=theme?"dark":"light";document.documentElement.style.setProperty("--accent",settings.accent)},[theme,settings.accent]);
 const go=(p:string)=>{setPage(p);setSelected(null);scrollTo({top:0,behavior:"smooth"})};
 const published=articles.filter(a=>a.published);
 const featured=published.find(a=>a.featured)||published[0];
 const filtered=published.filter(a=>(a.title+" "+a.excerpt+" "+a.tags.join(" ")).toLowerCase().includes(query.toLowerCase()));
 return <div className="app">
  <header className="nav"><Logo onAdmin={()=>setAdminOpen(true)}/><nav>{["home","blog","projects","labs","about","resume"].map(x=><button key={x} className={page===x?"active":""} onClick={()=>go(x)}>{x[0].toUpperCase()+x.slice(1)}</button>)}</nav><div className="nav-actions"><button className="icon-btn" onClick={()=>setTheme(!theme)} aria-label="Toggle theme">{theme?<Sun/>:<Moon/>}</button><button className="icon-btn mobile-menu"><Menu/></button></div></header>
  <main>
   <AnimatePresence mode="wait">
   {selected?<ArticlePage article={selected} articles={published} onBack={()=>go("blog")}/>:page==="home"?<Home settings={settings} articles={published} projects={projects} labs={labs} featured={featured} go={go} openArticle={setSelected}/>:page==="blog"?<Blog articles={filtered} query={query} setQuery={setQuery} openArticle={setSelected}/>:page==="projects"?<Projects projects={projects}/>:page==="labs"?<Labs labs={labs}/>:page==="about"?<About settings={settings}/>:<Resume settings={settings}/>}
   </AnimatePresence>
  </main>
  <footer><div><b>{settings.siteName}</b><p>{settings.bio}</p></div><div className="footer-links"><button onClick={()=>go("blog")}>Blog</button><button onClick={()=>go("projects")}>Projects</button><button onClick={()=>go("labs")}>Labs</button></div><small>© {new Date().getFullYear()} {settings.siteName}. Built with care.</small></footer>
  {adminOpen&&<Admin onClose={()=>setAdminOpen(false)} settings={settings} setSettings={(s:Settings)=>{setSettings(s);set(KEY.settings,s)}}/>}
 </div>
}

function Home({settings,articles,projects,labs,featured,go,openArticle}:{settings:Settings;articles:Article[];projects:Project[];labs:Lab[];featured:Article;go:(p:string)=>void;openArticle:(a:Article)=>void}){
 return <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} className="page">
  <section className="hero"><div className="hero-orb orb1"/><div className="hero-orb orb2"/><div className="eyebrow"><Sparkles/> Personal Developer Platform</div><h1>Build things.<br/><span>Learn deeply.</span><br/>Share the journey.</h1><p>{settings.bio}</p><div className="actions"><button className="primary" onClick={()=>go("projects")}>Explore my work <ArrowRight/></button><button className="secondary" onClick={()=>go("blog")}>Read articles <BookOpen/></button></div><div className="hero-grid"><div><b>{articles.length}+</b><span>Articles</span></div><div><b>{projects.length}+</b><span>Projects</span></div><div><b>{labs.length}+</b><span>Labs</span></div><div><b>∞</b><span>Ideas</span></div></div></section>
  <section className="section"><div className="section-head"><div><span className="eyebrow">Featured</span><h2>Ideas worth reading.</h2></div><button className="text-btn" onClick={()=>go("blog")}>View all <ArrowRight/></button></div><div className="feature-card" onClick={()=>openArticle(featured)}><div className="feature-art"><div className="grid-lines"/><Code2 size={74}/></div><div className="feature-copy"><span className="tag">{featured.category}</span><h3>{featured.title}</h3><p>{featured.excerpt}</p><div className="meta"><Clock3/> {featured.readingTime} min read · {featured.createdAt}</div><span className="read">Read article <ArrowRight/></span></div></div></section>
  <section className="section"><div className="section-head"><div><span className="eyebrow">Selected work</span><h2>Things I've built.</h2></div><button className="text-btn" onClick={()=>go("projects")}>All projects <ArrowRight/></button></div><div className="cards">{projects.map(p=><div className="project-card" key={p.id}><div className="project-visual"><Layers3/><span>{p.status}</span></div><h3>{p.title}</h3><p>{p.description}</p><div className="chips">{p.technologies.map(t=><span key={t}>{t}</span>)}</div></div>)}</div></section>
  <section className="section"><div className="section-head"><div><span className="eyebrow">Laboratory</span><h2>Small experiments. Big lessons.</h2></div><button className="text-btn" onClick={()=>go("labs")}>Explore labs <ArrowRight/></button></div><div className="cards">{labs.map(l=><div className="lab-card" key={l.id}><FlaskConical/><span className="tag">Experiment</span><h3>{l.title}</h3><p>{l.description}</p><div className="chips">{l.technologies.map(t=><span key={t}>{t}</span>)}</div></div>)}</div></section>
 </motion.div>
}

function Blog({articles,query,setQuery,openArticle}:{articles:Article[];query:string;setQuery:(x:string)=>void;openArticle:(a:Article)=>void}){
 return <motion.div initial={{opacity:0}} animate={{opacity:1}} className="page"><section className="page-title"><span className="eyebrow"><BookOpen/> Writing</span><h1>The blog.</h1><p>Notes, tutorials, build logs and lessons from the journey.</p></section><div className="searchbox"><Search/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search articles, tags, topics..." /><kbd>⌘ K</kbd></div><div className="article-list">{articles.map(a=><article className="article-row" key={a.id} onClick={()=>openArticle(a)}><div className="article-index">/{a.category.toLowerCase().replaceAll(" ","-")}</div><div><div className="chips">{a.tags.map(t=><span key={t}>#{t}</span>)}</div><h2>{a.title}</h2><p>{a.excerpt}</p><div className="meta"><Clock3/>{a.readingTime} min read · {a.createdAt}</div></div><ArrowRight className="row-arrow"/></article>)}</div>{articles.length===0&&<div className="empty"><Search/><h3>No articles found</h3><p>Try another search.</p></div>}</motion.div>
}

function ArticlePage({article,articles,onBack}:{article:Article;articles:Article[];onBack:()=>void}){
 const [copied,setCopied]=useState(false),[bookmarks,setBookmarks]=useState<string[]>(()=>get(KEY.bookmarks,[]));
 const save=()=>{const n=bookmarks.includes(article.id)?bookmarks.filter(x=>x!==article.id):[...bookmarks,article.id];setBookmarks(n);set(KEY.bookmarks,n)};
 useEffect(()=>{const h=get<string[]>(KEY.history,[]).filter(x=>x!==article.id);set(KEY.history,[article.id,...h].slice(0,20))},[article.id]);
 const headings=article.content.split("\n").filter(x=>x.startsWith("## ")).map(x=>x.slice(3));
 return <motion.article initial={{opacity:0}} animate={{opacity:1}} className="article-page"><button className="back-btn" onClick={onBack}>← Back to blog</button><div className="article-layout"><div className="article-main"><span className="tag">{article.category}</span><h1>{article.title}</h1><p className="lead">{article.excerpt}</p><div className="meta"><Clock3/>{article.readingTime} min read · Published {article.createdAt}</div><div className="article-actions"><button onClick={save}>{bookmarks.includes(article.id)?"★ Saved":"☆ Save"}</button><button onClick={async()=>{await navigator.clipboard?.writeText(location.href);setCopied(true);setTimeout(()=>setCopied(false),1200)}}>{copied?<Check/>:<Copy/>} {copied?"Copied":"Copy link"}</button></div><div className="article-content" dangerouslySetInnerHTML={{__html:markdown(article.content)}}/><div className="article-bottom"><button className="secondary" onClick={onBack}>← More articles</button></div></div><aside className="toc"><b>ON THIS PAGE</b>{headings.map(h=><a key={h} href={"#"+h.toLowerCase().replaceAll(" ","-")}>{h}</a>)}</aside></div></motion.article>
}

function Projects({projects}:{projects:Project[]}){return <motion.div initial={{opacity:0}} animate={{opacity:1}} className="page"><section className="page-title"><span className="eyebrow"><BriefcaseBusiness/> Work</span><h1>Projects.</h1><p>Selected applications, systems and product experiments.</p></section><div className="project-grid">{projects.map(p=><div className="case-card" key={p.id}><div className="case-art"><Code2 size={48}/><span>{p.status}</span></div><span className="tag">Case Study</span><h2>{p.title}</h2><p>{p.longDescription}</p><ul>{p.features.map(f=><li key={f}><Check/>{f}</li>)}</ul><div className="chips">{p.technologies.map(t=><span key={t}>{t}</span>)}</div><div className="actions">{p.githubUrl&&<a className="secondary" href={p.githubUrl} target="_blank"><Github/> GitHub</a>}{p.liveUrl&&<a className="primary" href={p.liveUrl} target="_blank"><ExternalLink/> Live demo</a>}</div></div>)}</div></motion.div>}
function Labs({labs}:{labs:Lab[]}){return <motion.div initial={{opacity:0}} animate={{opacity:1}} className="page"><section className="page-title"><span className="eyebrow"><FlaskConical/> Experiments</span><h1>Developer lab.</h1><p>Small, focused experiments where ideas become reusable patterns.</p></section><div className="cards">{labs.map(l=><div className="lab-large" key={l.id}><div className="lab-icon"><FlaskConical/></div><span className="tag">LAB</span><h2>{l.title}</h2><p>{l.description}</p><h4>Problem</h4><p>{l.problem}</p><h4>Approach</h4><p>{l.solution}</p><div className="chips">{l.technologies.map(t=><span key={t}>{t}</span>)}</div></div>)}</div></motion.div>}
function About({settings}:{settings:Settings}){return <motion.div initial={{opacity:0}} animate={{opacity:1}} className="page narrow"><section className="page-title"><span className="eyebrow">About</span><h1>A little about me.</h1><p>{settings.bio}</p></section><div className="prose"><p>I build web experiences with a focus on clarity, performance, responsive design and practical problem solving.</p><h2>What I care about</h2><ul><li>Useful products over unnecessary complexity.</li><li>Accessible interfaces that work for real people.</li><li>Learning by building and documenting the process.</li><li>Clean architecture that can grow with the project.</li></ul><h2>Current focus</h2><p>Modern frontend engineering, full-stack applications, browser capabilities, performance and thoughtful UI/UX.</p></div></motion.div>}
function Resume({settings}:{settings:Settings}){return <motion.div initial={{opacity:0}} animate={{opacity:1}} className="page narrow"><section className="page-title"><span className="eyebrow"><FileText/> Resume</span><h1>{settings.siteName}</h1><p>{settings.tagline}</p></section><div className="resume-card"><h2>Developer</h2><p>{settings.bio}</p><h3>Core areas</h3><div className="chips"><span>React</span><span>TypeScript</span><span>JavaScript</span><span>Node.js</span><span>MongoDB</span><span>UI/UX</span></div><h3>Links</h3><p><a href={settings.github} target="_blank">GitHub</a> · <a href={settings.linkedin} target="_blank">LinkedIn</a> · <a href={"mailto:"+settings.email}>{settings.email}</a></p><button className="primary" onClick={()=>window.print()}>Print / Save PDF</button></div></motion.div>}

function Admin({onClose,settings,setSettings}:{onClose:()=>void;settings:Settings;setSettings:(s:Settings)=>void}){
 const [admin,setAdmin]=useState<Admin|null>(()=>get(KEY.admin,null)),[auth,setAuth]=useState(false),[email,setEmail]=useState(""),[pass,setPass]=useState(""),[tab,setTab]=useState("dashboard"),[msg,setMsg]=useState("");
 const [articles,setArticles]=useState<Article[]>(()=>get(KEY.articles,seedArticles)),[projects,setProjects]=useState<Project[]>(()=>get(KEY.projects,seedProjects)),[labs,setLabs]=useState<Lab[]>(()=>get(KEY.labs,seedLabs));
 const [editing,setEditing]=useState<Article|null>(null);
 const login=async()=>{if(!admin){if(!email||pass.length<8)return setMsg("Create a password of at least 8 characters.");const salt=uid();const hash=await hashPassword(pass,salt);const a={email,hash,salt};set(KEY.admin,a);setAdmin(a);setAuth(true);setPass("");return}const h=await hashPassword(pass,admin.salt);if(email===admin.email&&h===admin.hash){setAuth(true);setPass("");setMsg("")}else setMsg("Invalid credentials.")};
 const saveArticles=(v:Article[])=>{setArticles(v);set(KEY.articles,v)},saveProjects=(v:Project[])=>{setProjects(v);set(KEY.projects,v)},saveLabs=(v:Lab[])=>{setLabs(v);set(KEY.labs,v)};
 const exportData=()=>{const payload={version:1,exportedAt:new Date().toISOString(),articles,projects,labs,settings};const blob=new Blob([JSON.stringify(payload,null,2)],{type:"application/json"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="faisal-dev-backup.json";a.click();URL.revokeObjectURL(a.href)};
 const importData=(file:File)=>{const r=new FileReader();r.onload=()=>{try{const x=JSON.parse(String(r.result));if(x.articles)saveArticles(x.articles);if(x.projects)saveProjects(x.projects);if(x.labs)saveLabs(x.labs);if(x.settings)setSettings(x.settings);setMsg("Backup restored.")}catch{setMsg("Invalid backup file.")}};r.readAsText(file)};
 return <div className="admin-overlay"><div className="admin-shell">{!auth?<div className="login-card"><button className="close" onClick={onClose}><X/></button><div className="logo-mark big">F</div><LockKeyhole/><h1>{admin?"Admin access":"Create admin account"}</h1><p>{admin?"Sign in to manage your local site.":"This account is stored locally in this browser."}</p><input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Admin email" type="email"/><input value={pass} onChange={e=>setPass(e.target.value)} placeholder="Password (8+ characters)" type="password"/><button className="primary full" onClick={login}>{admin?"Enter dashboard":"Create account"} <ArrowRight/></button>{msg&&<div className="notice">{msg}</div>}<small>Browser-only authentication is not server-side security.</small></div>:<><aside className="admin-side"><div className="admin-brand"><span className="logo-mark">F</span><b>Local CMS</b></div>{["dashboard","articles","projects","labs","settings","backup"].map(x=><button className={tab===x?"selected":""} onClick={()=>setTab(x)} key={x}>{x==="dashboard"?<AdminHome/>:x==="articles"?<FileText/>:x==="projects"?<Layers3/>:x==="labs"?<FlaskConical/>:x==="settings"?<Settings/>:<Save/>}{x}</button>)}<button className="logout" onClick={()=>setAuth(false)}><LogOut/>Logout</button></aside><section className="admin-main"><header><div><span className="eyebrow">Local CMS</span><h1>{tab}</h1></div><button className="icon-btn" onClick={onClose}><X/></button></header>{tab==="dashboard"&&<div className="admin-content"><div className="stats"><div><FileText/><b>{articles.length}</b><span>Articles</span></div><div><Layers3/><b>{projects.length}</b><span>Projects</span></div><div><FlaskConical/><b>{labs.length}</b><span>Labs</span></div></div><div className="admin-panel"><h2>Quick actions</h2><div className="actions"><button className="primary" onClick={()=>{setTab("articles");setEditing({id:uid(),title:"",slug:"",excerpt:"",content:"# New article\\n\\nStart writing...",category:"Web Development",tags:[],published:false,featured:false,createdAt:new Date().toISOString().slice(0,10),updatedAt:new Date().toISOString().slice(0,10),readingTime:1})}}><Plus/> New article</button><button className="secondary" onClick={exportData}><Download/> Export backup</button></div></div></div>}{tab==="articles"&&<div className="admin-content"><div className="admin-toolbar"><button className="primary" onClick={()=>setEditing({id:uid(),title:"",slug:"",excerpt:"",content:"# New article\\n\\nStart writing...",category:"Web Development",tags:[],published:false,featured:false,createdAt:new Date().toISOString().slice(0,10),updatedAt:new Date().toISOString().slice(0,10),readingTime:1})}><Plus/> New article</button></div>{editing?<ArticleEditor article={editing} onCancel={()=>setEditing(null)} onSave={a=>{saveArticles([a,...articles.filter(x=>x.id!==a.id)]);setEditing(null)}}/>:<div className="admin-list">{articles.map(a=><div className="admin-item" key={a.id}><div><span className="tag">{a.published?"Published":"Draft"}</span><h3>{a.title||"Untitled"}</h3><small>{a.category} · {a.readingTime} min</small></div><div className="item-actions"><button onClick={()=>setEditing(a)}><Pencil/></button><button onClick={()=>saveArticles(articles.filter(x=>x.id!==a.id))}><Trash2/></button></div></div>)}</div>}</div>}{tab==="projects"&&<CrudSimple title="Projects" items={projects.map(p=>p.title)} onDelete={i=>saveProjects(projects.filter((_,x)=>x!==i))}/>} {tab==="labs"&&<CrudSimple title="Labs" items={labs.map(l=>l.title)} onDelete={i=>saveLabs(labs.filter((_,x)=>x!==i))}/>} {tab==="settings"&&<div className="admin-content"><div className="form-grid"><label>Site name<input value={settings.siteName} onChange={e=>setSettings({...settings,siteName:e.target.value})}/></label><label>Tagline<input value={settings.tagline} onChange={e=>setSettings({...settings,tagline:e.target.value})}/></label><label className="wide">Bio<textarea value={settings.bio} onChange={e=>setSettings({...settings,bio:e.target.value})}/></label><label>Accent<input type="color" value={settings.accent} onChange={e=>setSettings({...settings,accent:e.target.value})}/></label><label>Email<input value={settings.email} onChange={e=>setSettings({...settings,email:e.target.value})}/></label><label>GitHub<input value={settings.github} onChange={e=>setSettings({...settings,github:e.target.value})}/></label><label>LinkedIn<input value={settings.linkedin} onChange={e=>setSettings({...settings,linkedin:e.target.value})}/></label></div><button className="primary" onClick={()=>set(KEY.settings,settings)}><Save/> Save settings</button></div>}{tab==="backup"&&<div className="admin-content"><div className="admin-panel"><h2>Backup & restore</h2><p>Keep your local content safe by exporting a JSON backup regularly.</p><div className="actions"><button className="primary" onClick={exportData}><Download/> Export JSON</button><label className="secondary file-btn"><Upload/> Import JSON<input type="file" accept="application/json" onChange={e=>e.target.files?.[0]&&importData(e.target.files[0])}/></label></div>{msg&&<div className="notice">{msg}</div>}</div><div className="warning"><RotateCcw/> All content lives in this browser. Clearing site data can erase it. Always keep a backup.</div></div>}</section></>}</div></div>
}
function ArticleEditor({article,onCancel,onSave}:{article:Article;onCancel:()=>void;onSave:(a:Article)=>void}){const [a,setA]=useState(article);return <div className="editor"><div className="form-grid"><label className="wide">Title<input value={a.title} onChange={e=>setA({...a,title:e.target.value,slug:e.target.value.toLowerCase().trim().replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"")})}/></label><label>Category<input value={a.category} onChange={e=>setA({...a,category:e.target.value})}/></label><label>Reading minutes<input type="number" min="1" value={a.readingTime} onChange={e=>setA({...a,readingTime:+e.target.value})}/></label><label className="wide">Excerpt<textarea value={a.excerpt} onChange={e=>setA({...a,excerpt:e.target.value})}/></label><label className="wide">Markdown content<textarea className="content-editor" value={a.content} onChange={e=>setA({...a,content:e.target.value})}/></label><label>Published <input type="checkbox" checked={a.published} onChange={e=>setA({...a,published:e.target.checked})}/></label><label>Featured <input type="checkbox" checked={a.featured} onChange={e=>setA({...a,featured:e.target.checked})}/></label></div><div className="actions"><button className="secondary" onClick={onCancel}>Cancel</button><button className="primary" onClick={()=>onSave({...a,updatedAt:new Date().toISOString().slice(0,10)})}><Save/> Save article</button></div></div>}
function CrudSimple({title,items,onDelete}:{title:string;items:string[];onDelete:(i:number)=>void}){return <div className="admin-content"><div className="admin-panel"><h2>{title}</h2>{items.map((x,i)=><div className="admin-item" key={i}><b>{x}</b><button onClick={()=>onDelete(i)}><Trash2/></button></div>)}</div></div>}

createRoot(document.getElementById("root")!).render(<App/>);
