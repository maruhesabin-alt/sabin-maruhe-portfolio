/* SABIN MARUHE — PORTFOLIO / ADMIN V2 */
const ADMIN_CODE="9811702344";

const defaultContent={
  heroTitle:"Ni donu formon al viaj ideoj.",
  heroText:"Grafika dezajno, video, foto, retejoj kaj ciferecaj spertoj — kreitaj kun zorgo, karaktero kaj klara celo.",
  collabTitle:"Ni realigu projekton kune.",
  collabText:"Ĉu vi havas ideon? Rakontu ĝin. La kunlaboro estas proponata senpage; volontula kontribuo povas helpi subteni la teknikajn kostojn, ekipaĵon, Interreton kaj teamon."
};
const defaultSettings={accent:"#caff38",animations:true,glass:true,live:true};
const defaultProjects=[
 {title:'PORTRETO / 026',cat:'photo',catLabel:'Fotografio',desc:'Portreta serio kaj fotografia prezento.',tags:["Portfolio","Projet"],image:"url(\'images/projets-realises/portrait/_MG_9963.jpg\')"},
 {title:'BEMI EN AFRIKO',cat:'design',catLabel:'Grafika dezajno',desc:'Vida identeco kaj komunikaj materialoj por BEMI en Afriko.',tags:["Portfolio","Projet"],image:"url(\'images/projets-realises/bemi/bemi.jpg\')"},
 {title:'DIGITALA KREAĴO',cat:'design',catLabel:'Krea dezajno',desc:'Persona kreiva kaj teknologia bildo por prezento.',tags:["Portfolio","Projet"],image:"url(\'images/projets-realises/digital/digital.jpg\')"},
 {title:'EBOLA KAMPANJO',cat:'design',catLabel:'Kampanja dezajno',desc:'Informkampanjo kaj socia konsciigo kun forta vida mesaĝo.',tags:["Portfolio","Projet"],image:"url(\'images/projets-realises/ebola/ebola.jpg\')"},
 {title:'GOGA KARANGA',cat:'design',catLabel:'Branding',desc:'Etikedo kaj marka prezento por produkto.',tags:["Portfolio","Projet"],image:"url(\'images/projets-realises/goga/goga-karanga.jpg\')"},
 {title:'ETIMARKI GRAPHIX ACADEMY',cat:'design',catLabel:'Grafika dezajno',desc:'Promocia afiŝo por profesia grafika dezajna trejnado.',tags:["Portfolio","Projet"],image:"url(\'images/projets-realises/graphix/graphix.jpg\')"},
 {title:'SALONGO SPECIAL',cat:'design',catLabel:'Kampanja dezajno',desc:'Eventa afiŝo pri pureco, medio kaj komunuma agado.',tags:["Portfolio","Projet"],image:"url(\'images/projets-realises/salongo/salongo.jpg\')"},
 {title:'UEA BRANDING',cat:'design',catLabel:'Branding',desc:'Identeco kaj aplikoj de Universala Esperanto-Asocio.',tags:["Portfolio","Projet"],image:"url(\'images/projets-realises/uea/uea.png\')"},
 {title:'TEJO BRANDING',cat:'design',catLabel:'Branding',desc:'Identeco kaj aplikoj de Tutmonda Esperantista Junulara Organizo.',tags:["Portfolio","Projet"],image:"url(\'images/projets-realises/tejo/tejo.png\')"}
];

const load=(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}};
let content=load("sabin_content",defaultContent);
let settings=load("sabin_settings",defaultSettings);
let projects=load("sabin_projects",defaultProjects);

const $=s=>document.querySelector(s);
const $$=s=>document.querySelectorAll(s);
const esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));

function save(k,v){localStorage.setItem(k,JSON.stringify(v))}
function applyContent(){
  const h=$(".hero-copy h1"); if(h) h.innerHTML=esc(content.heroTitle).replace(/\s(formon|formo)\s/i,m=>` <em>${m.trim()}</em>`);
  const ht=$(".hero-text"); if(ht) ht.textContent=content.heroText;
  const ct=$(".collab-copy h2"); if(ct) ct.textContent=content.collabTitle;
  const cp=$(".collab-copy>p:not(.eyebrow)"); if(cp) cp.textContent=content.collabText;
}
function applySettings(){
 document.documentElement.style.setProperty("--accent",settings.accent);
 document.documentElement.style.setProperty("--accent-soft",settings.accent+"22");
 document.body.classList.toggle("reduced-effects",!settings.animations);
 document.body.classList.toggle("no-glass",!settings.glass);
 $(".pulse")?.classList.toggle("disabled",!settings.live);
}
applyContent(); applySettings();

let visible=6,currentFilter="all";
const grid=$("#projectGrid");
function renderProjects(){
 const list=projects.filter(p=>currentFilter==="all"||p.cat===currentFilter).slice(0,visible);
 grid.innerHTML=list.map((p,i)=>`<article class="project-card reveal visible" data-project="${projects.indexOf(p)}">
  <div class="project-image" style="background-image:${p.image}"></div>
  <div class="project-overlay"><span class="project-cat">${esc(p.catLabel)}</span><h3 class="project-title">${esc(p.title)}</h3><p class="project-desc">${esc(p.desc)}</p></div>
  <div class="project-arrow">↗</div></article>`).join("");
 $$(".project-card").forEach(c=>c.onclick=()=>openProject(+c.dataset.project));
}
renderProjects();

$$(".filter").forEach(btn=>btn.onclick=()=>{$$(".filter").forEach(b=>b.classList.remove("active"));btn.classList.add("active");currentFilter=btn.dataset.filter;visible=6;renderProjects();$("#loadMore").style.display=projects.filter(p=>currentFilter==="all"||p.cat===currentFilter).length>6?"":"none"});
$("#loadMore")?.addEventListener("click",()=>{visible=projects.length;renderProjects();$("#loadMore").style.display="none"});

function openProject(i){
 const p=projects[i];$("#modalImage").style.backgroundImage=p.image;$("#modalCategory").textContent=p.catLabel;$("#modalTitle").textContent=p.title;$("#modalDescription").textContent=p.desc;$("#modalTags").innerHTML=p.tags.map(t=>`<span>${esc(t)}</span>`).join("");$("#projectModal").classList.add("open");document.body.style.overflow="hidden";
}
$$("[data-close]").forEach(x=>x.onclick=()=>{$("#projectModal").classList.remove("open");document.body.style.overflow=""});

const header=$(".site-header"); addEventListener("scroll",()=>header.classList.toggle("scrolled",scrollY>30));
const observer=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)e.target.classList.add("visible")}),{threshold:.12}); $$(".reveal").forEach(e=>observer.observe(e));
$(".menu-toggle")?.addEventListener("click",()=>$("#nav").classList.toggle("open")); $$("#nav a").forEach(a=>a.onclick=()=>$("#nav").classList.remove("open"));
document.addEventListener("mousemove",e=>{const g=$(".cursor-glow");if(g){g.style.left=e.clientX+"px";g.style.top=e.clientY+"px"}});
$$(".magnetic").forEach(b=>{b.onmousemove=e=>{const r=b.getBoundingClientRect();b.style.transform=`translate(${(e.clientX-r.left-r.width/2)*.08}px,${(e.clientY-r.top-r.height/2)*.08}px)`};b.onmouseleave=()=>b.style.transform=""});

const form=$("#projectForm");
form?.addEventListener("submit",e=>{
 e.preventDefault();const data=Object.fromEntries(new FormData(form).entries());data.date=new Date().toLocaleString("eo");const req=load("sabin_requests",[]);req.unshift(data);save("sabin_requests",req);form.reset();showToast();updateRequestCount();
});
function showToast(){const t=$("#toast");t.classList.add("show");setTimeout(()=>t.classList.remove("show"),4000)}
function updateRequestCount(){const n=load("sabin_requests",[]).length; if($("#requestCount"))$("#requestCount").textContent=n;if($("#statRequests"))$("#statRequests").textContent=n}

const adminModal=$("#adminModal"),dashboard=$("#dashboard");
$("#adminLink")?.addEventListener("click",e=>{e.preventDefault();adminModal.classList.add("open")});
$$("[data-admin-close]").forEach(x=>x.onclick=()=>adminModal.classList.remove("open"));
$("#adminEnter")?.addEventListener("click",()=>{
 if($("#adminCode").value===ADMIN_CODE){adminModal.classList.remove("open");dashboard.classList.add("open");document.body.style.overflow="hidden";loadAdmin()}
 else $("#adminCode").animate([{transform:"translateX(-5px)"},{transform:"translateX(5px)"},{transform:"translateX(0)"}],{duration:250});
});
$("#closeDashboard")?.addEventListener("click",()=>{dashboard.classList.remove("open");document.body.style.overflow=""});

function loadAdmin(){
 $("#editHeroTitle").value=content.heroTitle;$("#editHeroText").value=content.heroText;$("#editCollabTitle").value=content.collabTitle;$("#editCollabText").value=content.collabText;
 $("#editAccent").value=settings.accent; renderAdminProjects();renderRequests();updateRequestCount();
}
$("#saveContent")?.addEventListener("click",()=>{content={heroTitle:$("#editHeroTitle").value,heroText:$("#editHeroText").value,collabTitle:$("#editCollabTitle").value,collabText:$("#editCollabText").value};save("sabin_content",content);applyContent();alert("Enhavo konservita.")});
$("#saveSettings")?.addEventListener("click",()=>{settings.accent=$("#editAccent").value;save("sabin_settings",settings);applySettings();alert("Agordoj konservitaj.")});

function renderAdminProjects(){
 const box=$("#adminProjects");if(!box)return;
 box.innerHTML=projects.map((p,i)=>`<div class="admin-project-row">
 <input data-p-title="${i}" value="${esc(p.title)}"><select data-p-cat="${i}"><option value="design">Dezajno</option><option value="video">Video</option><option value="photo">Foto</option><option value="web">Retejo</option></select>
 <input data-p-img="${i}" value="${esc(p.image)}"><button class="delete-project" data-del="${i}">×</button></div>`).join("");
 projects.forEach((p,i)=>{const cat=$(`[data-p-cat="${i}"]`);if(cat)cat.value=p.cat});
 $$("[data-p-title]").forEach(el=>el.onchange=()=>{projects[+el.dataset.pTitle].title=el.value;save("sabin_projects",projects);renderProjects()});
 $$("[data-p-cat]").forEach(el=>el.onchange=()=>{projects[+el.dataset.pCat].cat=el.value;projects[+el.dataset.pCat].catLabel={design:"Grafika dezajno",video:"Video",photo:"Fotografio",web:"Retejo"}[el.value];save("sabin_projects",projects);renderProjects()});
 $$("[data-p-img]").forEach(el=>el.onchange=()=>{projects[+el.dataset.pImg].image=el.value;save("sabin_projects",projects);renderProjects()});
 $$("[data-del]").forEach(el=>el.onclick=()=>{projects.splice(+el.dataset.del,1);save("sabin_projects",projects);renderAdminProjects();renderProjects()});
}
$("#addAdminProject")?.addEventListener("click",()=>{projects.push({title:"NOVA PROJEKTO",cat:"design",catLabel:"Grafika dezajno",desc:"Nova projekto.",tags:["Nova"],image:"linear-gradient(135deg,#151a22,#27311d,#caff38)"});save("sabin_projects",projects);renderAdminProjects();renderProjects()});

function renderRequests(){
 const box=$("#requestList");if(!box)return;const req=load("sabin_requests",[]);
 box.innerHTML=req.length?req.map((r,i)=>`<article class="request-item"><strong>${esc(r.firstname)} ${esc(r.lastname)}</strong><small>${esc(r.email)} · ${esc(r.country)} · ${esc(r.service)} · ${esc(r.duration)}</small><p>${esc(r.message)}</p><small>Kontribuo: $${esc(r.contribution||"0")} · ${esc(r.date)}</small><button class="delete-request" data-r="${i}">Forigi</button></article>`).join(""):`<div class="admin-note">Ankoraŭ neniu kunlaborpeto.</div>`;
 $$(".delete-request").forEach(b=>b.onclick=()=>{const a=load("sabin_requests",[]);a.splice(+b.dataset.r,1);save("sabin_requests",a);renderRequests();updateRequestCount()});
}
$$(".dash-tab").forEach(btn=>btn.onclick=()=>{$$(".dash-tab").forEach(b=>b.classList.remove("active"));btn.classList.add("active");$$(".dash-panel").forEach(p=>p.classList.remove("active"));$("#tab-"+btn.dataset.tab)?.classList.add("active");if(btn.dataset.tab==="requests")renderRequests();if(btn.dataset.tab==="projects")renderAdminProjects()});
$$(".switch").forEach(s=>s.onclick=()=>{s.classList.toggle("on");settings[s.dataset.setting]=s.classList.contains("on");save("sabin_settings",settings);applySettings()});
updateRequestCount();
