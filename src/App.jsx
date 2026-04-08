import { useState, useRef, useEffect } from "react";

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap');`;

// ── DEFAULT SERVICES (studio owner can edit) ──────────────────────────────────
const DEFAULT_SERVICES = [
  { id:"s1", category:"Real Estate", name:"Standard Photos", desc:"HDR interior & exterior photography", price:199, unit:"per property", turnaround:"24h", active:true, icon:"📷" },
  { id:"s2", category:"Real Estate", name:"Drone Aerial",    desc:"FAA-certified aerial photography & video", price:149, unit:"add-on", turnaround:"24h", active:true, icon:"🚁" },
  { id:"s3", category:"Real Estate", name:"Photos + Video",  desc:"Full property photo & walkthrough video", price:399, unit:"per property", turnaround:"48h", active:true, icon:"🎬" },
  { id:"s4", category:"Real Estate", name:"3D Walkthrough",  desc:"Matterport 3D virtual tour", price:249, unit:"per property", turnaround:"48h", active:true, icon:"🏠" },
  { id:"s5", category:"Real Estate", name:"Twilight Shoot",  desc:"Golden hour & dusk exterior photography", price:99,  unit:"add-on", turnaround:"24h", active:true, icon:"🌆" },
  { id:"s6", category:"Real Estate", name:"Floor Plan",      desc:"2D & 3D architectural floor plan", price:79,  unit:"add-on", turnaround:"48h", active:true, icon:"📐" },
  { id:"s7", category:"Events",      name:"Event Coverage",  desc:"Full-day event photography", price:799, unit:"per event", turnaround:"7 days", active:true, icon:"🎉" },
  { id:"s8", category:"Events",      name:"Event + Video",   desc:"Photography & highlight reel", price:1299, unit:"per event", turnaround:"10 days", active:true, icon:"🎥" },
  { id:"s9", category:"Events",      name:"Photo Booth",     desc:"2-hour staffed photo booth setup", price:349, unit:"add-on", turnaround:"Same day", active:true, icon:"🎭" },
  { id:"s10",category:"Commercial",  name:"Product Shoot",   desc:"Studio product photography", price:299, unit:"half day", turnaround:"48h", active:true, icon:"📦" },
];

const TAX = 0.08;
const fmt = n => `$${Number(n).toLocaleString()}`;
const fmtD = d => d ? new Date(d+"T12:00:00").toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}) : "—";
const genNum = id => `INV-${String(id).padStart(4,"0")}-2026`;
const makeInvoice = (project, lineItems) => {
  const subtotal = lineItems.reduce((s,l)=>s+l.rate,0);
  return { number:genNum(project.id), issuedDate:"2026-03-21", dueDate:"2026-03-28", lineItems, subtotal, tax:Math.round(subtotal*TAX), total:Math.round(subtotal*(1+TAX)), paid:false, paidDate:null, sentAt:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}) };
};

const SM = {
  pending:   { label:"Pending",   color:"#c9a84c", bg:"rgba(201,168,76,0.12)",  icon:"○" },
  shooting:  { label:"On Set",    color:"#5b8dd9", bg:"rgba(91,141,217,0.12)",  icon:"◎" },
  editing:   { label:"Editing",   color:"#a07bd4", bg:"rgba(160,123,212,0.12)", icon:"◈" },
  delivered: { label:"Delivered", color:"#4caf82", bg:"rgba(76,175,130,0.12)",  icon:"✓" },
};

// Demo clients with linked projects
const DEMO_CLIENTS = [
  { id:"c1", name:"Marcus Webb",       email:"marcus@webb.com",    password:"demo", initials:"MW", color:"#5b8dd9", company:"Webb Realty" },
  { id:"c2", name:"Sofia Chen",        email:"sofia@chen.com",     password:"demo", initials:"SC", color:"#a07bd4", company:"Chen Events" },
  { id:"c3", name:"Priya Nair",        email:"priya@harbor.com",   password:"demo", initials:"PN", color:"#4caf82", company:"Harbor Properties" },
  { id:"c4", name:"Rockfield Tech",    email:"hello@rockfield.com",password:"demo", initials:"RT", color:"#e0a450", company:"Rockfield Tech" },
];

const DEMO_PROJECTS = [
  { id:1, clientId:"c1", type:"Real Estate", services:["s1","s2","s3"], client:"Marcus Webb", property:"2847 Lakeview Drive", status:"editing", progress:65, price:697,
    scheduledDate:"2026-03-18", scheduledTime:"10:00",
    media:[
      {id:1,name:"Front Exterior.jpg",url:"https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",approved:true},
      {id:2,name:"Living Room.jpg",   url:"https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800",approved:false},
      {id:3,name:"Kitchen.jpg",       url:"https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800",approved:false},
    ],
    messages:[
      {id:1,sender:"Marcus Webb",  avatar:"MW",text:"Looking forward to seeing the drone shots!",time:"2:34 PM",mine:false},
      {id:2,sender:"Elev8 Studios",avatar:"E8",text:"Aerial footage is stunning — sending previews by EOD.",time:"3:10 PM",mine:true},
    ], invoice:null },
  { id:2, clientId:"c2", type:"Events", services:["s7"], client:"Sofia & James Chen", property:"The Grand Pavilion — Wedding", status:"shooting", progress:30, price:799,
    scheduledDate:"2026-03-22", scheduledTime:"14:00", media:[],
    messages:[{id:1,sender:"Sofia Chen",avatar:"SC",text:"Can we add a golden hour session?",time:"11:00 AM",mine:false}], invoice:null },
  { id:3, clientId:"c3", type:"Real Estate", services:["s1"], client:"Priya Nair", property:"Suite 402, Harbor Condos", status:"delivered", progress:100, price:199,
    scheduledDate:"2026-03-14", scheduledTime:"09:00",
    media:[
      {id:1,name:"Main View.jpg",url:"https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",approved:true},
      {id:2,name:"Balcony.jpg",  url:"https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800",approved:true},
    ],
    messages:[], invoice:{number:"INV-0003-2026",issuedDate:"2026-03-14",dueDate:"2026-03-21",lineItems:[{desc:"Standard Photos — Suite 402",rate:199}],subtotal:199,tax:16,total:215,paid:true,paidDate:"2026-03-15",sentAt:"9:45 AM"} },
  { id:4, clientId:"c4", type:"Events", services:["s7","s9"], client:"Rockfield Tech", property:"Annual Product Launch", status:"pending", progress:0, price:1148,
    scheduledDate:"2026-03-28", scheduledTime:"09:00", media:[], messages:[], invoice:null },
];

const PLANS = [
  { id:"starter", name:"Starter", price:29, annual:19, color:"#5b8dd9", tagline:"Perfect for solo photographers", limits:"10 projects/mo",
    features:["Up to 10 active projects","Client portal (free for clients)","Auto invoicing & payment gate","Media delivery & approvals","Scheduling calendar","Custom services & pricing","Email support"] },
  { id:"pro", name:"Pro", price:59, annual:39, popular:true, color:"#c9a84c", tagline:"For growing studios", limits:"Unlimited",
    features:["Unlimited projects","Everything in Starter","Custom branding & logo","Revenue analytics","1 team seat","Priority support","Client recurring bookings"] },
  { id:"studio", name:"Studio", price:119, annual:79, color:"#a07bd4", tagline:"Full-scale studio operations", limits:"Unlimited + Team",
    features:["Everything in Pro","5 team seats","White-label client portal","API access","Dedicated account manager","Contract templates","Advanced reporting"] },
];

// ── STYLES ────────────────────────────────────────────────────────────────────
const BASE_CSS = `
${FONTS}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
:root{
  --bg:#0c0c0e;--surface:#13131a;--surface2:#1a1a24;--border:rgba(255,255,255,0.07);
  --gold:#c9a84c;--gl:#e2c880;--text:#f0ede8;--muted:rgba(240,237,232,0.45);
  --green:#4caf82;--red:#e07070;--blue:#5b8dd9;--purple:#a07bd4;
  --fd:'Cormorant Garamond',serif;--fb:'DM Sans',sans-serif;
}
body{background:var(--bg);color:var(--text);font-family:var(--fb);font-size:14px;line-height:1.6;}
::-webkit-scrollbar{width:4px;} ::-webkit-scrollbar-thumb{background:var(--border);border-radius:2px;}
/* LAYOUT */
.app{display:flex;flex-direction:column;height:100vh;overflow:hidden;}
.main{flex:1;overflow-y:auto;}
.page{padding:28px 36px;max-width:1280px;margin:0 auto;}
/* TOP NAV */
.topnav{flex-shrink:0;background:var(--surface);border-bottom:1px solid var(--border);display:flex;align-items:center;padding:0 20px;height:56px;gap:14px;position:relative;z-index:50;}
.sb-logo{display:flex;align-items:baseline;gap:7px;}
.sb-logo h1{font-family:var(--fd);font-size:22px;font-weight:600;background:linear-gradient(135deg,var(--gold),var(--gl));-webkit-background-clip:text;-webkit-text-fill-color:transparent;line-height:1;}
.sb-logo p{font-size:9px;color:var(--muted);letter-spacing:2px;text-transform:uppercase;}
.hbtn{width:36px;height:36px;border-radius:8px;background:transparent;border:1px solid var(--border);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;cursor:pointer;transition:all .2s;flex-shrink:0;}
.hbtn:hover{border-color:rgba(201,168,76,0.4);}
.hbar{width:16px;height:1.5px;background:var(--muted);border-radius:2px;transition:all .25s;}
.hbtn.open .hbar:nth-child(1){transform:translateY(6.5px) rotate(45deg);background:var(--gold);}
.hbtn.open .hbar:nth-child(2){opacity:0;}
.hbtn.open .hbar:nth-child(3){transform:translateY(-6.5px) rotate(-45deg);background:var(--gold);}
.dropmenu{position:absolute;top:56px;left:0;right:0;background:var(--surface);border-bottom:1px solid var(--border);display:flex;flex-direction:column;padding:8px 0 12px;transform:translateY(-8px);opacity:0;pointer-events:none;transition:all .22s cubic-bezier(.4,0,.2,1);box-shadow:0 12px 40px rgba(0,0,0,0.4);z-index:49;}
.dropmenu.open{transform:translateY(0);opacity:1;pointer-events:all;}
.ni{display:flex;align-items:center;gap:12px;padding:11px 24px;cursor:pointer;color:var(--muted);font-size:14px;transition:all .15s;border-left:3px solid transparent;}
.ni:hover{color:var(--text);background:rgba(255,255,255,0.03);}
.ni.active{color:var(--gold);border-left-color:var(--gold);background:rgba(201,168,76,0.05);}
.nav-pills{display:flex;align-items:center;gap:4px;}
.npill{display:flex;align-items:center;gap:6px;padding:6px 12px;border-radius:20px;cursor:pointer;color:var(--muted);font-size:12px;font-weight:500;transition:all .18s;white-space:nowrap;}
.npill:hover{color:var(--text);background:rgba(255,255,255,0.05);}
.npill.active{color:var(--gold);background:rgba(201,168,76,0.1);}
.av{border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:600;color:#fff;flex-shrink:0;}
.sb-foot{display:flex;align-items:center;gap:8px;padding-left:12px;border-left:1px solid var(--border);}
.menu-overlay{position:fixed;inset:0;top:56px;background:rgba(0,0,0,0.4);z-index:40;opacity:0;pointer-events:none;transition:opacity .22s;}
.menu-overlay.open{opacity:1;pointer-events:all;}
/* CARDS */
.card{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:20px;}
.g2{display:grid;grid-template-columns:1fr 1fr;gap:16px;}
.g3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px;}
.g4{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;}
/* STAT */
.sc{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:18px;}
.sl{font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:1.5px;margin-bottom:7px;}
.sv{font-family:var(--fd);font-size:30px;font-weight:300;line-height:1;}
.ss{font-size:11px;color:var(--muted);margin-top:5px;}
/* BADGE */
.badge{display:inline-flex;align-items:center;gap:5px;padding:3px 9px;border-radius:20px;font-size:11px;font-weight:500;}
/* BUTTONS */
.btn{display:inline-flex;align-items:center;gap:7px;padding:9px 18px;border-radius:8px;font-family:var(--fb);font-size:13px;font-weight:500;cursor:pointer;border:none;transition:all .2s;}
.bg{background:linear-gradient(135deg,var(--gold),var(--gl));color:#0c0c0e;}
.bg:hover{opacity:.9;transform:translateY(-1px);}
.bgh{background:transparent;color:var(--muted);border:1px solid var(--border);}
.bgh:hover{color:var(--text);border-color:rgba(255,255,255,0.15);}
.bs{padding:6px 12px;font-size:12px;}
.btn-ok{background:rgba(76,175,130,0.15);color:var(--green);border:1px solid rgba(76,175,130,0.3);}
.btn-ok:hover{background:rgba(76,175,130,0.25);}
.btn-del{background:rgba(224,112,112,0.12);color:var(--red);border:1px solid rgba(224,112,112,0.25);}
.btn:disabled{opacity:.4;cursor:not-allowed;transform:none!important;}
/* PROJECT CARD */
.pc{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:18px;cursor:pointer;transition:all .25s;}
.pc:hover{border-color:rgba(201,168,76,0.3);transform:translateY(-2px);box-shadow:0 8px 28px rgba(0,0,0,0.3);}
.pn{font-family:var(--fd);font-size:18px;font-weight:400;}
.prb{height:3px;background:rgba(255,255,255,0.06);border-radius:2px;margin:12px 0 8px;overflow:hidden;}
.prf{height:100%;border-radius:2px;transition:width .5s;background:linear-gradient(90deg,var(--gold),var(--gl));}
/* TABS */
.tabs{display:flex;border-bottom:1px solid var(--border);margin-bottom:22px;}
.tab{padding:9px 18px;font-size:13px;color:var(--muted);cursor:pointer;border-bottom:2px solid transparent;margin-bottom:-1px;transition:all .2s;}
.tab:hover{color:var(--text);}
.tab.active{color:var(--gold);border-bottom-color:var(--gold);}
/* MEDIA */
.mg{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:11px;}
.mt{border-radius:8px;overflow:hidden;aspect-ratio:4/3;position:relative;background:var(--surface2);border:1px solid var(--border);cursor:pointer;}
.mt img{width:100%;height:100%;object-fit:cover;transition:transform .3s;}
.mt:hover img{transform:scale(1.04);}
.mto{position:absolute;inset:0;background:rgba(0,0,0,.5);opacity:0;transition:opacity .2s;display:flex;align-items:center;justify-content:center;}
.mt:hover .mto{opacity:1;}
.ma{position:absolute;top:7px;right:7px;width:20px;height:20px;background:#4caf82;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:10px;color:#fff;}
/* LOCK GATE */
.lock-gate{background:var(--surface);border:1px solid rgba(224,112,112,0.22);border-radius:14px;padding:52px 32px;text-align:center;}
/* MESSAGES */
.ml{display:flex;flex-direction:column;gap:13px;max-height:300px;overflow-y:auto;}
.msg{display:flex;gap:10px;}
.msg.mine{flex-direction:row-reverse;}
.mav{width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:600;color:#fff;flex-shrink:0;}
.mb{max-width:72%;background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:9px 13px;}
.msg.mine .mb{background:rgba(201,168,76,0.1);border-color:rgba(201,168,76,0.2);}
.mi{flex:1;background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:9px 13px;font-size:13px;color:var(--text);font-family:var(--fb);outline:none;transition:border-color .2s;}
.mi:focus{border-color:rgba(201,168,76,0.4);}
/* INVOICE */
.inv-doc{background:var(--surface);border:1px solid var(--border);border-radius:12px;overflow:hidden;}
.inv-head{background:linear-gradient(135deg,#0f0f17,#1a1a28);padding:26px 30px;border-bottom:1px solid var(--border);}
.inv-body{padding:26px 30px;}
.inv-logo{font-family:var(--fd);font-size:26px;font-weight:600;background:linear-gradient(135deg,var(--gold),var(--gl));-webkit-background-clip:text;-webkit-text-fill-color:transparent;}
.inv-table{width:100%;border-collapse:collapse;}
.inv-table th{font-size:10px;text-transform:uppercase;letter-spacing:1px;color:var(--muted);padding:7px 0;border-bottom:1px solid var(--border);text-align:left;}
.inv-table th:last-child{text-align:right;}
.inv-table td{padding:11px 0;font-size:13px;border-bottom:1px solid rgba(255,255,255,0.04);}
.inv-table td:last-child{text-align:right;color:var(--gold);font-family:var(--fd);font-size:15px;}
.inv-paid{display:inline-flex;align-items:center;gap:6px;background:rgba(76,175,130,0.12);border:1px solid rgba(76,175,130,0.3);color:#4caf82;padding:5px 14px;border-radius:6px;font-size:12px;font-weight:500;}
.inv-unpaid{display:inline-flex;align-items:center;gap:6px;background:rgba(224,112,112,0.1);border:1px solid rgba(224,112,112,0.3);color:var(--red);padding:5px 14px;border-radius:6px;font-size:12px;font-weight:500;}
.due-note{background:rgba(201,168,76,0.08);border:1px solid rgba(201,168,76,0.18);border-radius:7px;padding:11px 14px;font-size:12px;color:var(--gold);}
/* PROC BAR */
.proc-bar{height:3px;background:var(--border);border-radius:2px;overflow:hidden;}
.proc-fill{height:100%;background:linear-gradient(90deg,var(--gold),var(--gl));border-radius:2px;transition:width .1s linear;}
/* PAY MODAL */
.pay-opt{flex:1;padding:9px;border:1px solid var(--border);border-radius:8px;text-align:center;cursor:pointer;font-size:12px;transition:all .2s;color:var(--muted);}
.pay-opt.active{border-color:var(--gold);color:var(--gold);background:rgba(201,168,76,0.06);}
/* TL */
.tl{display:flex;flex-direction:column;}
.tli{display:flex;gap:13px;padding-bottom:18px;position:relative;}
.tli:not(:last-child)::before{content:'';position:absolute;left:9px;top:20px;bottom:0;width:1px;background:var(--border);}
.tld{width:20px;height:20px;border-radius:50%;flex-shrink:0;margin-top:2px;display:flex;align-items:center;justify-content:center;font-size:9px;}
/* CAL */
.cg{display:grid;grid-template-columns:repeat(7,1fr);gap:3px;}
.cd{aspect-ratio:1;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:11px;cursor:pointer;transition:all .15s;position:relative;}
.cd:hover{background:var(--surface2);}
.cd.today{background:rgba(201,168,76,0.15);color:var(--gold);font-weight:600;}
.cd.evt::after{content:'';position:absolute;bottom:3px;width:4px;height:4px;border-radius:50%;background:var(--gold);}
.cd.om{color:var(--muted);opacity:.4;}
.chd{font-size:10px;color:var(--muted);text-align:center;padding:3px 0;text-transform:uppercase;}
/* FORM */
.fg{margin-bottom:14px;}
.fl{font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:1px;margin-bottom:5px;display:block;}
.fi{width:100%;background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:9px 13px;font-size:13px;color:var(--text);font-family:var(--fb);outline:none;transition:border-color .2s;}
.fi:focus{border-color:rgba(201,168,76,0.4);}
select.fi{cursor:pointer;}
/* SERVICE CARDS */
.svc-card{background:var(--surface);border:1px solid var(--border);border-radius:11px;padding:18px;transition:all .2s;position:relative;}
.svc-card:hover{border-color:rgba(201,168,76,0.25);}
.svc-card.inactive{opacity:.5;}
.svc-icon{font-size:24px;margin-bottom:10px;}
.svc-name{font-size:15px;font-weight:500;margin-bottom:3px;}
.svc-desc{font-size:12px;color:var(--muted);margin-bottom:10px;line-height:1.6;}
.svc-price{font-family:var(--fd);font-size:22px;color:var(--gold);}
.svc-meta{font-size:11px;color:var(--muted);margin-top:4px;}
.svc-toggle{position:absolute;top:14px;right:14px;width:34px;height:18px;border-radius:9px;cursor:pointer;transition:background .2s;border:none;}
/* MODAL */
.mo{position:fixed;inset:0;background:rgba(0,0,0,.75);display:flex;align-items:center;justify-content:center;z-index:100;backdrop-filter:blur(4px);}
.md{background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:26px;width:min(520px,93vw);max-height:92vh;overflow-y:auto;}
/* LB */
.lb{position:fixed;inset:0;background:rgba(0,0,0,.92);display:flex;align-items:center;justify-content:center;z-index:200;cursor:pointer;}
.lb img{max-width:90vw;max-height:90vh;border-radius:8px;object-fit:contain;}
/* UPLOAD */
.upload-z{border:2px dashed var(--border);border-radius:9px;padding:28px;text-align:center;color:var(--muted);}
/* MISC */
.dv{height:1px;background:var(--border);margin:14px 0;}
.nd{width:6px;height:6px;border-radius:50%;background:var(--gold);display:inline-block;}
.st{font-family:var(--fd);font-size:20px;font-weight:300;margin-bottom:12px;}
.row{display:flex;gap:11px;align-items:center;}
.rb{display:flex;justify-content:space-between;align-items:center;}
.tm{color:var(--muted);} .tg{color:var(--gold);} .ts{font-size:12px;} .tx{font-size:11px;} .fw{font-weight:500;}
.mts{margin-top:7px;} .mtm{margin-top:14px;} .mbm{margin-bottom:14px;}
.ph{margin-bottom:24px;}
.pt{font-family:var(--fd);font-size:34px;font-weight:300;line-height:1.1;}
.pt em{font-style:italic;color:var(--gold);}
.ps{color:var(--muted);font-size:13px;margin-top:5px;}
.tt{display:flex;background:var(--surface2);border-radius:8px;padding:3px;gap:3px;}
.tb{flex:1;padding:7px;border-radius:6px;font-size:12px;font-weight:500;cursor:pointer;text-align:center;transition:all .2s;color:var(--muted);}
.tb.active{background:var(--surface);color:var(--text);box-shadow:0 1px 4px rgba(0,0,0,.3);}
.sb2{display:flex;gap:6px;margin-bottom:18px;}
.ss2{flex:1;height:3px;border-radius:2px;transition:background .3s;}
/* CLIENT PORTAL specific */
.cp-accent{background:linear-gradient(135deg,rgba(91,141,217,0.08),rgba(160,123,212,0.06));border:1px solid rgba(91,141,217,0.2);}
.cp-header{background:linear-gradient(135deg,#0e0e1a,#141428);padding:32px 36px;border-bottom:1px solid var(--border);}
/* SAAS LANDING */
.saas-bg{min-height:100vh;background:var(--bg);color:var(--text);font-family:var(--fb);overflow-y:auto;}
.saas-nav{display:flex;align-items:center;justify-content:space-between;padding:18px 48px;border-bottom:1px solid var(--border);position:sticky;top:0;background:rgba(12,12,14,0.92);backdrop-filter:blur(12px);z-index:50;}
.saas-logo{display:flex;align-items:baseline;gap:8px;}
.saas-logo h1{font-family:var(--fd);font-size:24px;font-weight:600;background:linear-gradient(135deg,var(--gold),var(--gl));-webkit-background-clip:text;-webkit-text-fill-color:transparent;}
.saas-logo span{font-size:9px;color:var(--muted);letter-spacing:2.5px;text-transform:uppercase;}
.saas-nav-links{display:flex;gap:6px;align-items:center;}
.snl{padding:7px 14px;border-radius:20px;font-size:13px;color:var(--muted);cursor:pointer;transition:all .18s;}
.snl:hover{color:var(--text);background:rgba(255,255,255,0.05);}
.hero{text-align:center;padding:80px 24px 60px;max-width:860px;margin:0 auto;}
.hero-eyebrow{display:inline-flex;align-items:center;gap:8px;background:rgba(201,168,76,0.1);border:1px solid rgba(201,168,76,0.25);border-radius:20px;padding:5px 14px;font-size:11px;color:var(--gold);letter-spacing:1px;text-transform:uppercase;margin-bottom:28px;}
.hero h2{font-family:var(--fd);font-size:clamp(40px,6vw,68px);font-weight:300;line-height:1.1;margin-bottom:18px;}
.hero h2 em{font-style:italic;color:var(--gold);}
.hero p{font-size:16px;color:var(--muted);max-width:520px;margin:0 auto 32px;line-height:1.8;}
.hero-btns{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;}
.section-eyebrow{font-size:11px;text-transform:uppercase;letter-spacing:2px;color:var(--gold);margin-bottom:10px;}
.section-title-lg{font-family:var(--fd);font-size:clamp(26px,4vw,42px);font-weight:300;line-height:1.2;margin-bottom:12px;}
.section-title-lg em{font-style:italic;color:var(--gold);}
.feat-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:14px;}
.feat-card{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:20px;transition:all .25s;}
.feat-card:hover{border-color:rgba(201,168,76,0.3);transform:translateY(-3px);}
.feat-icon{width:38px;height:38px;border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:17px;margin-bottom:12px;background:rgba(201,168,76,0.1);}
.plan-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px;}
.plan-card{background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:26px;position:relative;transition:all .25s;display:flex;flex-direction:column;}
.plan-card:hover{transform:translateY(-4px);box-shadow:0 16px 48px rgba(0,0,0,.35);}
.plan-card.popular{border-color:var(--gold);}
.pop-tag{position:absolute;top:-11px;left:50%;transform:translateX(-50%);background:linear-gradient(135deg,var(--gold),var(--gl));color:#0c0c0e;font-size:11px;font-weight:600;padding:3px 14px;border-radius:10px;white-space:nowrap;}
.plan-name{font-size:12px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:6px;}
.plan-price{font-family:var(--fd);font-size:44px;font-weight:300;line-height:1;}
.plan-price sup{font-size:18px;vertical-align:top;margin-top:10px;display:inline-block;}
.plan-price sub{font-size:13px;color:var(--muted);}
.plan-feat{display:flex;align-items:flex-start;gap:8px;font-size:13px;margin-bottom:8px;color:var(--muted);}
.plan-feat-check{color:var(--green);flex-shrink:0;}
.tog{width:40px;height:22px;border-radius:11px;background:var(--surface2);border:1px solid var(--border);cursor:pointer;position:relative;transition:background .2s;}
.tog.on{background:var(--gold);}
.tog-knob{width:16px;height:16px;border-radius:50%;background:#fff;position:absolute;top:2px;left:2px;transition:transform .2s;}
.tog.on .tog-knob{transform:translateX(18px);}
.save-badge{background:rgba(76,175,130,0.15);color:#4caf82;border:1px solid rgba(76,175,130,0.3);border-radius:10px;padding:2px 8px;font-size:11px;font-weight:600;}
.testi-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(270px,1fr));gap:14px;}
.testi-card{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:20px;}
.saas-footer{border-top:1px solid var(--border);padding:28px 48px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:14px;}
/* AUTH */
.auth-wrap{min-height:100vh;background:var(--bg);display:flex;align-items:center;justify-content:center;}
.auth-card{background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:34px;width:min(440px,92vw);}
.auth-logo{text-align:center;margin-bottom:26px;}
.auth-logo h1{font-family:var(--fd);font-size:30px;font-weight:600;background:linear-gradient(135deg,var(--gold),var(--gl));-webkit-background-clip:text;-webkit-text-fill-color:transparent;}
.auth-logo p{font-size:10px;color:var(--muted);letter-spacing:3px;text-transform:uppercase;margin-top:3px;}
.auth-title{font-family:var(--fd);font-size:22px;font-weight:300;margin-bottom:5px;}
.auth-sub{font-size:13px;color:var(--muted);margin-bottom:22px;}
.social-btn{display:flex;align-items:center;justify-content:center;gap:9px;width:100%;padding:10px;background:var(--surface2);border:1px solid var(--border);border-radius:8px;font-size:13px;font-weight:500;cursor:pointer;transition:all .2s;color:var(--text);margin-bottom:8px;}
.social-btn:hover{border-color:rgba(255,255,255,0.15);}
.divider-text{display:flex;align-items:center;gap:10px;color:var(--muted);font-size:11px;margin:14px 0;}
.divider-text::before,.divider-text::after{content:'';flex:1;height:1px;background:var(--border);}
.role-picker{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:20px;}
.role-opt{border:1px solid var(--border);border-radius:10px;padding:16px 12px;text-align:center;cursor:pointer;transition:all .2s;}
.role-opt:hover{border-color:rgba(201,168,76,0.3);}
.role-opt.active{border-color:var(--gold);background:rgba(201,168,76,0.06);}
.role-opt-icon{font-size:26px;margin-bottom:7px;}
.role-opt-name{font-size:13px;font-weight:500;margin-bottom:3px;}
.role-opt-desc{font-size:11px;color:var(--muted);}
.free-badge{background:rgba(76,175,130,0.12);border:1px solid rgba(76,175,130,0.25);color:var(--green);padding:2px 8px;border-radius:8px;font-size:11px;font-weight:600;}
@keyframes fi{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}
.fi-anim{animation:fi .3s ease;}
@keyframes fadeSlide{from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:translateY(0);}}
.fade-slide{animation:fadeSlide .4s ease;}
@keyframes pulse{0%,100%{opacity:1;}50%{opacity:.6;}}
.pulse{animation:pulse 2s infinite;}
`;

// ── SHARED COMPONENTS ─────────────────────────────────────────────────────────
const SBadge = ({s}) => { const m=SM[s]; return <span className="badge" style={{color:m.color,background:m.bg}}>{m.icon} {m.label}</span>; };
const PBar = ({v}) => <div className="prb"><div className="prf" style={{width:`${v}%`}} /></div>;

function MiniCal({projects=[]}) {
  const [mo,setMo]=useState(2); const yr=2026;
  const first=new Date(yr,mo,1).getDay(), days=new Date(yr,mo+1,0).getDate();
  const evts=new Set(projects.filter(p=>p.scheduledDate?.startsWith(`${yr}-${String(mo+1).padStart(2,"0")}`)).map(p=>parseInt(p.scheduledDate.split("-")[2])));
  const wk=["Su","Mo","Tu","We","Th","Fr","Sa"], cells=[];
  for(let i=0;i<first;i++) cells.push(null);
  for(let d=1;d<=days;d++) cells.push(d);
  return (
    <div>
      <div className="rb mbm">
        <span className="st" style={{fontSize:16}}>{new Date(yr,mo).toLocaleString("default",{month:"long"})} {yr}</span>
        <div className="row" style={{gap:5}}>
          <button className="btn bgh bs" onClick={()=>setMo(m=>Math.max(0,m-1))}>‹</button>
          <button className="btn bgh bs" onClick={()=>setMo(m=>Math.min(11,m+1))}>›</button>
        </div>
      </div>
      <div className="cg">
        {wk.map(w=><div key={w} className="chd">{w}</div>)}
        {cells.map((d,i)=><div key={i} className={`cd ${!d?"om":""} ${d===21&&mo===2?"today":""} ${d&&evts.has(d)?"evt":""}`}>{d||""}</div>)}
      </div>
    </div>
  );
}

function InvDoc({inv, project, onPay, brand}) {
  if (!inv) return null;
  const b = brand || DEFAULT_BRAND;
  const displayName = b.businessName || "Elev8 Studios";
  const displayTagline = b.tagline || "Photography Services";
  const displayEmail = b.email || "hello@elev8studios.app";
  const displayPhone = b.phone || "";
  const displayWebsite = b.website || "";
  const displayAddress = b.address || "";
  const accentColor = b.accentColor || "#c9a84c";
  const initials = b.logoInitials || displayName.split(" ").map(w=>w[0]).join("").slice(0,3).toUpperCase();

  return (
    <div className="inv-doc">
      <div className="inv-head">
        <div className="rb" style={{alignItems:"flex-start"}}>
          {/* Logo / Business Name */}
          <div style={{display:"flex",alignItems:"center",gap:14}}>
            <div style={{width:48,height:48,borderRadius:10,background:`linear-gradient(135deg,${accentColor},${accentColor}99)`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"var(--fd)",fontSize:16,fontWeight:600,color:"#fff",flexShrink:0,letterSpacing:"1px"}}>
              {initials}
            </div>
            <div>
              <div style={{fontFamily:"var(--fd)",fontSize:22,fontWeight:600,color:accentColor,lineHeight:1}}>{displayName}</div>
              <div style={{fontSize:10,color:"var(--muted)",letterSpacing:"2px",textTransform:"uppercase",marginTop:3}}>{displayTagline}</div>
            </div>
          </div>
          {/* Invoice number & dates */}
          <div style={{textAlign:"right"}}>
            <div style={{fontFamily:"var(--fd)",fontSize:18,color:accentColor}}>{inv.number}</div>
            <div className="tx tm mts">Issued: {fmtD(inv.issuedDate)}</div>
            <div className="tx tm">Due: {fmtD(inv.dueDate)}</div>
          </div>
        </div>
        <div className="dv"/>
        <div className="g2" style={{gap:24}}>
          <div>
            <div className="tx tm mbm" style={{textTransform:"uppercase",letterSpacing:"1px"}}>Billed To</div>
            <div className="fw">{project.client}</div>
            <div className="ts tm">{project.property}</div>
          </div>
          <div>
            <div className="tx tm mbm" style={{textTransform:"uppercase",letterSpacing:"1px"}}>From</div>
            <div className="fw">{displayName}</div>
            {displayEmail   && <div className="ts tm">{displayEmail}</div>}
            {displayPhone   && <div className="ts tm">{displayPhone}</div>}
            {displayWebsite && <div className="ts tm">{displayWebsite}</div>}
            {displayAddress && <div className="ts tm" style={{marginTop:3,fontSize:11}}>{displayAddress}</div>}
          </div>
        </div>
      </div>
      <div className="inv-body">
        <table className="inv-table">
          <thead><tr><th>Description</th><th style={{textAlign:"right"}}>Amount</th></tr></thead>
          <tbody>{inv.lineItems.map((li,i)=><tr key={i}><td>{li.desc}</td><td>{li.rate>0?fmt(li.rate):<span style={{color:"var(--muted)",fontSize:12}}>Included</span>}</td></tr>)}</tbody>
        </table>
        <div style={{display:"flex",justifyContent:"flex-end",marginTop:14}}>
          <div style={{width:230}}>
            <div className="rb ts" style={{padding:"3px 0"}}><span className="tm">Subtotal</span><span>{fmt(inv.subtotal)}</span></div>
            <div className="rb ts" style={{padding:"3px 0"}}><span className="tm">Tax (8%)</span><span>{fmt(inv.tax)}</span></div>
            <div className="rb" style={{borderTop:"1px solid var(--border)",marginTop:8,paddingTop:11}}>
              <span className="fw">Total Due</span>
              <span style={{fontFamily:"var(--fd)",fontSize:22,color:accentColor}}>{fmt(inv.total)}</span>
            </div>
          </div>
        </div>
        <div className="dv"/>
        <div className="rb">
          {inv.paid
            ? <div className="inv-paid">✓ PAID · {fmtD(inv.paidDate)}</div>
            : <div className="inv-unpaid pulse">⚑ PAYMENT REQUIRED</div>}
          {!inv.paid && onPay && <button className="btn bg" style={{background:`linear-gradient(135deg,${accentColor},${accentColor}cc)`}} onClick={onPay}>Pay {fmt(inv.total)} Now →</button>}
        </div>
        {!inv.paid && <div className="due-note mts" style={{borderColor:`${accentColor}30`,color:accentColor}}>⚠ Your media gallery unlocks immediately upon payment. Due {fmtD(inv.dueDate)}.</div>}
        {b.invoiceNote && <div style={{marginTop:16,fontSize:12,color:"var(--muted)",fontStyle:"italic",textAlign:"center",paddingTop:14,borderTop:"1px solid var(--border)"}}>{b.invoiceNote}</div>}
      </div>
    </div>
  );
}

// ── BRANDING CONFIG ───────────────────────────────────────────────────────────
const BRAND_KEY = "elev8_branding";
const DEFAULT_BRAND = {
  businessName: "",
  tagline: "",
  email: "",
  phone: "",
  website: "",
  address: "",
  invoiceNote: "Thank you for your business!",
  logoInitials: "",
  accentColor: "#c9a84c",
};
const loadBranding = () => {
  try { return { ...DEFAULT_BRAND, ...JSON.parse(localStorage.getItem(BRAND_KEY)||"{}") }; } catch { return DEFAULT_BRAND; }
};
const saveBranding = b => {
  try { localStorage.setItem(BRAND_KEY, JSON.stringify(b)); } catch {}
};
const loadStripeConfig = () => {
  try { return JSON.parse(localStorage.getItem(STRIPE_CONFIG_KEY)||"{}"); } catch { return {}; }
};
const saveStripeConfig = cfg => {
  try { localStorage.setItem(STRIPE_CONFIG_KEY, JSON.stringify(cfg)); } catch {}
};
let stripePromise = null;

// ── PAY MODAL — STABLE CRASH-PROOF VERSION ────────────────────────────────────
function PayModal({inv, project, onClose, onPaid, stripeKey}) {
  const [method, setMethod]   = useState("card");
  const [proc,   setProc]     = useState(false);
  const [pct,    setPct]      = useState(0);
  const [done,   setDone]     = useState(false);
  const [error,  setError]    = useState("");
  const [name,   setName]     = useState("");
  const [email,  setEmail]    = useState("");
  const [cardNum,setCardNum]  = useState("");
  const [expiry, setExpiry]   = useState("");
  const [cvc,    setCvc]      = useState("");

  const hasStripe = !!(stripeKey && stripeKey.startsWith("pk_"));
  const isLive    = !!(stripeKey && stripeKey.startsWith("pk_live_"));
  const isTest    = !!(stripeKey && stripeKey.startsWith("pk_test_"));

  const fmtCardNum = v => v.replace(/\D/g,"").slice(0,16).replace(/(.{4})/g,"$1 ").trim();
  const fmtExpiry  = v => { const d=v.replace(/\D/g,"").slice(0,4); return d.length>2?d.slice(0,2)+"/"+d.slice(2):d; };

  // Animated progress bar payment simulation
  const runProgress = (onFinish) => {
    setProc(true); setPct(0); setError("");
    let p = 0;
    const iv = setInterval(() => {
      p += Math.random() * 15 + 6;
      if (p >= 100) {
        clearInterval(iv);
        setPct(100);
        setTimeout(() => { setDone(true); setTimeout(onFinish, 800); }, 300);
      } else {
        setPct(Math.min(Math.round(p), 99));
      }
    }, 150);
  };

  const handlePay = () => {
    if (proc || done) return;
    setError("");

    // Zelle — just confirm manually
    if (method === "zelle") {
      setDone(true);
      setTimeout(onPaid, 1000);
      return;
    }

    // Card validation
    if (method === "card") {
      if (!name.trim())           { setError("Please enter the name on your card."); return; }
      if (cardNum.replace(/\s/g,"").length < 16) { setError("Please enter a valid 16-digit card number."); return; }
      if (expiry.length < 5)      { setError("Please enter a valid expiry date (MM/YY)."); return; }
      if (cvc.length < 3)         { setError("Please enter a valid CVC."); return; }
    }

    if (method === "ach") {
      setError("ACH payments require backend setup. Use card or Zelle for now.");
      return;
    }

    // Run simulated payment flow (works in demo AND with Stripe key)
    // When backend is ready, replace runProgress with real Stripe confirmCardPayment
    runProgress(onPaid);
  };

  if (!inv) return null;

  return (
    <div
      style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.78)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:300,backdropFilter:"blur(4px)"}}
      onClick={e => { if (e.target === e.currentTarget && !proc) onClose(); }}
    >
      <div style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:16,padding:28,width:"min(480px,94vw)",maxHeight:"92vh",overflowY:"auto",fontFamily:"var(--fb)"}}>

        {/* Header */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
          <div>
            <div style={{fontFamily:"var(--fd)",fontSize:22,fontWeight:300,color:"var(--text)"}}>
              {done ? "✓ Payment Confirmed" : `Pay ${fmt(inv.total)}`}
            </div>
            {!done && (
              <div style={{display:"flex",alignItems:"center",gap:6,marginTop:4}}>
                <span style={{fontSize:10,fontWeight:600,padding:"2px 8px",borderRadius:4,
                  background: isLive?"rgba(76,175,130,0.12)": isTest?"rgba(201,168,76,0.1)":"rgba(255,255,255,0.06)",
                  color:      isLive?"var(--green)":          isTest?"var(--gold)":          "var(--muted)",
                  border:`1px solid ${isLive?"rgba(76,175,130,0.3)":isTest?"rgba(201,168,76,0.25)":"var(--border)"}`}}>
                  {isLive?"🟢 LIVE": isTest?"🟡 TEST":"⚪ DEMO"}
                </span>
                {!hasStripe && <span style={{fontSize:11,color:"var(--muted)"}}>Configure Stripe in Settings for live payments</span>}
              </div>
            )}
          </div>
          {!proc && <button onClick={onClose} style={{background:"transparent",border:"1px solid var(--border)",borderRadius:8,padding:"5px 10px",color:"var(--muted)",cursor:"pointer",fontSize:13}}>✕</button>}
        </div>

        {/* Done */}
        {done ? (
          <div style={{textAlign:"center",padding:"32px 0"}}>
            <div style={{fontSize:56,marginBottom:16}}>🎉</div>
            <div style={{fontSize:16,fontWeight:500,marginBottom:8,color:"var(--text)"}}>Payment Received!</div>
            <div style={{fontSize:13,color:"var(--green)",marginBottom:6}}>✓ Invoice {inv.number} paid</div>
            <div style={{fontSize:13,color:"var(--muted)"}}>Your media gallery is now unlocked.</div>
          </div>
        ) : (
          <>
            {/* Invoice summary box */}
            <div style={{background:"rgba(201,168,76,0.07)",border:"1px solid rgba(201,168,76,0.18)",borderRadius:8,padding:"12px 14px",marginBottom:18,fontSize:13}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{color:"var(--muted)"}}>Invoice</span><span>{inv.number}</span></div>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:8,fontSize:12}}><span style={{color:"var(--muted)"}}>Project</span><span style={{fontSize:11}}>{project?.property}</span></div>
              {inv.lineItems?.map((li,i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",fontSize:12,color:"var(--muted)",marginBottom:3}}>
                  <span>{li.desc}</span><span style={{color:"var(--text)"}}>{li.rate>0?fmt(li.rate):"Incl."}</span>
                </div>
              ))}
              <div style={{height:1,background:"var(--border)",margin:"10px 0"}}/>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:"var(--muted)",marginBottom:4}}><span>Tax (8%)</span><span>{fmt(inv.tax)}</span></div>
              <div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontWeight:500}}>Total Due</span><span style={{fontFamily:"var(--fd)",fontSize:20,color:"var(--gold)"}}>{fmt(inv.total)}</span></div>
            </div>

            {/* Payment method tabs */}
            <div style={{fontSize:11,color:"var(--muted)",textTransform:"uppercase",letterSpacing:"1px",marginBottom:8}}>Payment Method</div>
            <div style={{display:"flex",gap:7,marginBottom:18}}>
              {[{k:"card",l:"💳 Card"},{k:"zelle",l:"⚡ Zelle"}].map(m=>(
                <div key={m.k} onClick={()=>{setMethod(m.k);setError("");}}
                  style={{flex:1,padding:"9px",border:`1px solid ${method===m.k?"var(--gold)":"var(--border)"}`,borderRadius:8,textAlign:"center",cursor:"pointer",fontSize:12,color:method===m.k?"var(--gold)":"var(--muted)",background:method===m.k?"rgba(201,168,76,0.06)":"transparent",transition:"all .15s"}}>
                  {m.l}
                </div>
              ))}
            </div>

            {/* Card form */}
            {method==="card" && (
              <div>
                <div style={{marginBottom:12}}>
                  <label style={{fontSize:11,color:"var(--muted)",textTransform:"uppercase",letterSpacing:"1px",display:"block",marginBottom:5}}>Name on Card</label>
                  <input value={name} onChange={e=>setName(e.target.value)} placeholder="Alex Lee"
                    style={{width:"100%",background:"var(--surface2)",border:"1px solid var(--border)",borderRadius:8,padding:"9px 13px",fontSize:13,color:"var(--text)",fontFamily:"var(--fb)",outline:"none"}}/>
                </div>
                <div style={{marginBottom:12}}>
                  <label style={{fontSize:11,color:"var(--muted)",textTransform:"uppercase",letterSpacing:"1px",display:"block",marginBottom:5}}>Email</label>
                  <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@email.com" type="email"
                    style={{width:"100%",background:"var(--surface2)",border:"1px solid var(--border)",borderRadius:8,padding:"9px 13px",fontSize:13,color:"var(--text)",fontFamily:"var(--fb)",outline:"none"}}/>
                </div>
                <div style={{marginBottom:12}}>
                  <label style={{fontSize:11,color:"var(--muted)",textTransform:"uppercase",letterSpacing:"1px",display:"block",marginBottom:5}}>Card Number</label>
                  <input value={cardNum} onChange={e=>setCardNum(fmtCardNum(e.target.value))} placeholder="4242 4242 4242 4242" maxLength={19}
                    style={{width:"100%",background:"var(--surface2)",border:"1px solid var(--border)",borderRadius:8,padding:"9px 13px",fontSize:13,color:"var(--text)",fontFamily:"monospace",outline:"none",letterSpacing:"1px"}}/>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
                  <div>
                    <label style={{fontSize:11,color:"var(--muted)",textTransform:"uppercase",letterSpacing:"1px",display:"block",marginBottom:5}}>Expiry</label>
                    <input value={expiry} onChange={e=>setExpiry(fmtExpiry(e.target.value))} placeholder="MM/YY" maxLength={5}
                      style={{width:"100%",background:"var(--surface2)",border:"1px solid var(--border)",borderRadius:8,padding:"9px 13px",fontSize:13,color:"var(--text)",fontFamily:"var(--fb)",outline:"none"}}/>
                  </div>
                  <div>
                    <label style={{fontSize:11,color:"var(--muted)",textTransform:"uppercase",letterSpacing:"1px",display:"block",marginBottom:5}}>CVC</label>
                    <input value={cvc} onChange={e=>setCvc(e.target.value.replace(/\D/g,"").slice(0,4))} placeholder="123" type="password"
                      style={{width:"100%",background:"var(--surface2)",border:"1px solid var(--border)",borderRadius:8,padding:"9px 13px",fontSize:13,color:"var(--text)",fontFamily:"var(--fb)",outline:"none"}}/>
                  </div>
                </div>
                {isTest && (
                  <div style={{background:"rgba(201,168,76,0.07)",border:"1px solid rgba(201,168,76,0.2)",borderRadius:7,padding:"8px 12px",fontSize:11,color:"var(--gold)",marginBottom:12}}>
                    🟡 Test mode — use card: <strong>4242 4242 4242 4242</strong> · Exp: <strong>12/34</strong> · CVC: <strong>123</strong>
                  </div>
                )}
              </div>
            )}

            {/* Zelle */}
            {method==="zelle" && (
              <div style={{background:"var(--surface2)",border:"1px solid rgba(91,141,217,0.25)",borderRadius:8,padding:18,textAlign:"center",marginBottom:14}}>
                <div style={{fontSize:11,color:"var(--muted)",marginBottom:6,textTransform:"uppercase",letterSpacing:"1px"}}>Send Zelle Payment To</div>
                <div style={{fontFamily:"var(--fd)",fontSize:20,marginBottom:4,color:"var(--text)"}}>payments@elev8studios.app</div>
                <div style={{fontFamily:"var(--fd)",fontSize:26,color:"var(--gold)",marginBottom:8}}>{fmt(inv.total)}</div>
                <div style={{fontSize:11,color:"var(--muted)"}}>Memo: <strong style={{color:"var(--text)"}}>{inv.number}</strong></div>
                <div style={{marginTop:10,fontSize:12,color:"var(--muted)"}}>Click confirm below after sending — studio will verify and unlock your gallery.</div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div style={{background:"rgba(224,112,112,0.1)",border:"1px solid rgba(224,112,112,0.3)",borderRadius:7,padding:"9px 13px",fontSize:12,color:"var(--red)",marginBottom:12}}>
                ⚠ {error}
              </div>
            )}

            {/* Progress bar */}
            {proc && (
              <div style={{marginBottom:14}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:"var(--muted)",marginBottom:6}}>
                  <span>Processing payment…</span><span>{pct}%</span>
                </div>
                <div style={{height:4,background:"var(--border)",borderRadius:2,overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${pct}%`,background:"linear-gradient(90deg,var(--gold),var(--gl))",borderRadius:2,transition:"width .2s"}}/>
                </div>
              </div>
            )}

            {/* Pay button */}
            <button
              onClick={handlePay}
              disabled={proc}
              style={{width:"100%",padding:"12px",background:"linear-gradient(135deg,#c9a84c,#e2c880)",border:"none",borderRadius:8,color:"#0c0c0e",fontSize:14,fontWeight:600,cursor:proc?"not-allowed":"pointer",opacity:proc?0.7:1,fontFamily:"var(--fb)",display:"flex",alignItems:"center",justifyContent:"center",gap:8,marginBottom:12}}>
              {proc ? `Processing… ${pct}%` : method==="zelle" ? "✓ I've Sent the Payment" : `🔒 Pay ${fmt(inv.total)} Securely`}
            </button>

            {/* Trust row */}
            <div style={{display:"flex",justifyContent:"center",gap:20,flexWrap:"wrap"}}>
              {[{i:"🔒",t:"256-bit SSL"},{i:"🛡",t:"Secure Checkout"},{i:"⚡",t:"Instant Unlock"}].map(b=>(
                <div key={b.t} style={{display:"flex",alignItems:"center",gap:5,fontSize:11,color:"var(--muted)"}}>
                  <span>{b.i}</span><span>{b.t}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── SERVICES MANAGER (studio owner) ──────────────────────────────────────────
function ServicesManager({services,setServices}) {
  const [showAdd,setShowAdd]=useState(false);
  const [editSvc,setEditSvc]=useState(null);
  const [form,setForm]=useState({category:"Real Estate",name:"",desc:"",price:"",unit:"per property",turnaround:"24h",icon:"📷"});
  const categories=["Real Estate","Events","Commercial","Video","Other"];
  const icons=["📷","🚁","🎬","🏠","🌆","📐","🎉","🎥","🎭","📦","🎞","💡","🖼","🎵","✨"];

  const openAdd=()=>{ setForm({category:"Real Estate",name:"",desc:"",price:"",unit:"per property",turnaround:"24h",icon:"📷"}); setEditSvc(null); setShowAdd(true); };
  const openEdit=svc=>{ setForm({...svc,price:String(svc.price)}); setEditSvc(svc.id); setShowAdd(true); };
  const saveService=()=>{
    if(!form.name||!form.price) return;
    const svcData={...form,price:parseFloat(form.price)||0,active:true};
    if(editSvc){ setServices(s=>s.map(sv=>sv.id===editSvc?{...sv,...svcData}:sv)); }
    else { setServices(s=>[...s,{...svcData,id:`s${Date.now()}`}]); }
    setShowAdd(false);
  };
  const toggleActive=id=>setServices(s=>s.map(sv=>sv.id===id?{...sv,active:!sv.active}:sv));
  const deleteService=id=>setServices(s=>s.filter(sv=>sv.id!==id));

  const grouped=categories.reduce((acc,cat)=>{ acc[cat]=services.filter(s=>s.category===cat); return acc; },{});

  return (
    <div className="page fi-anim">
      {showAdd&&(
        <div className="mo" onClick={e=>e.target===e.currentTarget&&setShowAdd(false)}>
          <div className="md">
            <div className="rb mbm"><span style={{fontFamily:"var(--fd)",fontSize:20,fontWeight:300}}>{editSvc?"Edit Service":"Add Service"}</span><button className="btn bgh bs" onClick={()=>setShowAdd(false)}>✕</button></div>
            <div className="g2"><div className="fg"><label className="fl">Icon</label><div className="row" style={{flexWrap:"wrap",gap:6}}>{icons.map(ic=><span key={ic} onClick={()=>setForm(f=>({...f,icon:ic}))} style={{fontSize:20,cursor:"pointer",padding:"4px 6px",borderRadius:6,background:form.icon===ic?"rgba(201,168,76,0.15)":"transparent",border:form.icon===ic?"1px solid var(--gold)":"1px solid transparent"}}>{ic}</span>)}</div></div>
            <div className="fg"><label className="fl">Category</label><select className="fi" value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))}>{categories.map(c=><option key={c}>{c}</option>)}</select></div></div>
            <div className="fg"><label className="fl">Service Name</label><input className="fi" placeholder="e.g. Drone Aerial Photography" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} /></div>
            <div className="fg"><label className="fl">Description</label><input className="fi" placeholder="Short description for clients" value={form.desc} onChange={e=>setForm(f=>({...f,desc:e.target.value}))} /></div>
            <div className="g2">
              <div className="fg"><label className="fl">Price ($)</label><input className="fi" type="number" placeholder="299" value={form.price} onChange={e=>setForm(f=>({...f,price:e.target.value}))} /></div>
              <div className="fg"><label className="fl">Unit</label><input className="fi" placeholder="per property" value={form.unit} onChange={e=>setForm(f=>({...f,unit:e.target.value}))} /></div>
            </div>
            <div className="fg"><label className="fl">Turnaround</label><input className="fi" placeholder="24h, 48h, 5 days…" value={form.turnaround} onChange={e=>setForm(f=>({...f,turnaround:e.target.value}))} /></div>
            <div className="row" style={{gap:8,marginTop:4}}>
              <button className="btn bgh" style={{flex:1,justifyContent:"center"}} onClick={()=>setShowAdd(false)}>Cancel</button>
              <button className="btn bg" style={{flex:2,justifyContent:"center"}} onClick={saveService} disabled={!form.name||!form.price}>✓ Save Service</button>
            </div>
          </div>
        </div>
      )}
      <div className="ph">
        <div className="rb">
          <div><h2 className="pt">Services & <em>Pricing</em></h2><p className="ps">Manage the products clients can book — these appear in your booking form</p></div>
          <button className="btn bg" onClick={openAdd}>+ Add Service</button>
        </div>
      </div>
      {categories.filter(cat=>grouped[cat]?.length>0).map(cat=>(
        <div key={cat} style={{marginBottom:32}}>
          <div className="row mbm" style={{gap:10}}>
            <span className="st" style={{fontSize:17,margin:0}}>{cat}</span>
            <span className="tx tm">({grouped[cat].length} services)</span>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:13}}>
            {grouped[cat].map(svc=>(
              <div key={svc.id} className={`svc-card ${!svc.active?"inactive":""}`}>
                <div className="rb" style={{marginBottom:8}}>
                  <div style={{fontSize:22}}>{svc.icon}</div>
                  <div className="row" style={{gap:6}}>
                    <button className="btn bgh bs" style={{fontSize:11,padding:"4px 9px"}} onClick={()=>openEdit(svc)}>Edit</button>
                    <button className="btn btn-del bs" style={{fontSize:11,padding:"4px 9px"}} onClick={()=>deleteService(svc.id)}>✕</button>
                  </div>
                </div>
                <div className="svc-name">{svc.name}</div>
                <div className="svc-desc">{svc.desc}</div>
                <div className="svc-price">{fmt(svc.price)}</div>
                <div className="svc-meta">{svc.unit} · {svc.turnaround} turnaround</div>
                <div className="dv" style={{margin:"10px 0"}}/>
                <div className="rb">
                  <span className="tx" style={{color:svc.active?"var(--green)":"var(--muted)"}}>{svc.active?"● Active":"○ Hidden"}</span>
                  <div className={`tog ${svc.active?"on":""}`} style={{width:34,height:18}} onClick={()=>toggleActive(svc.id)}><div className="tog-knob" style={{width:13,height:13,top:2,left:2}}/></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      {services.length===0&&<div className="upload-z" style={{padding:"60px 30px",textAlign:"center"}}><div style={{fontSize:36,marginBottom:12}}>📷</div><div className="fw">No services yet</div><div className="tm ts mts">Add your photography packages and pricing</div><button className="btn bg" style={{marginTop:16}} onClick={openAdd}>+ Add First Service</button></div>}
    </div>
  );
}

// ── NEW BOOKING MODAL (uses live services) ─────────────────────────────────────
function NewBookingModal({services,clients,onClose,onCreate}) {
  const [step,setStep]=useState(1);
  const [selectedServices,setSelectedServices]=useState([]);
  const [clientMode,setClientMode]=useState("existing");
  const [selectedClient,setSelectedClient]=useState(clients[0]?.id||"");
  const [newClient,setNewClient]=useState({name:"",email:"",company:""});
  const [form,setForm]=useState({property:"",date:"",time:"10:00",type:"Real Estate"});

  const activeServices=services.filter(s=>s.active);
  const toggleSvc=id=>setSelectedServices(ss=>ss.includes(id)?ss.filter(x=>x!==id):[...ss,id]);
  const selectedTotal=selectedServices.reduce((s,id)=>{ const sv=services.find(x=>x.id===id); return s+(sv?.price||0); },0);
  const clientName = clientMode==="existing" ? (clients.find(c=>c.id===selectedClient)?.name||"") : newClient.name;

  const finish=()=>{
    if(!selectedServices.length||!form.property) return;
    const lineItems=selectedServices.map(id=>{ const sv=services.find(x=>x.id===id); return {desc:`${sv.icon} ${sv.name}`,rate:sv.price}; });
    const clientId = clientMode==="existing" ? selectedClient : `c${Date.now()}`;
    onCreate({ clientId, type:form.type, services:selectedServices, client:clientName, property:form.property, status:"pending", progress:0, price:selectedTotal, scheduledDate:form.date, scheduledTime:form.time, media:[], messages:[], invoice:null, lineItems });
    onClose();
  };

  const categories=[...new Set(activeServices.map(s=>s.category))];
  const [catFilter,setCatFilter]=useState("All");

  return (
    <div className="mo" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="md fade-slide" style={{width:"min(600px,95vw)"}}>
        <div className="rb mbm"><span style={{fontFamily:"var(--fd)",fontSize:20,fontWeight:300}}>New Booking</span><button className="btn bgh bs" onClick={onClose}>✕</button></div>
        <div className="sb2">{[1,2,3].map(s=><div key={s} className="ss2" style={{background:step>=s?"var(--gold)":"var(--border)"}}/>)}</div>

        {step===1&&(
          <div className="fi-anim">
            <p className="tm ts mbm">Select services for this booking</p>
            <div className="row mbm" style={{gap:6,flexWrap:"wrap"}}>
              {["All",...categories].map(c=><button key={c} className={`btn bs ${catFilter===c?"bg":"bgh"}`} onClick={()=>setCatFilter(c)}>{c}</button>)}
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:8,maxHeight:340,overflowY:"auto"}}>
              {activeServices.filter(s=>catFilter==="All"||s.category===catFilter).map(svc=>{
                const sel=selectedServices.includes(svc.id);
                return (
                  <div key={svc.id} onClick={()=>toggleSvc(svc.id)} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",background:sel?"rgba(201,168,76,0.07)":"var(--surface2)",border:`1px solid ${sel?"var(--gold)":"var(--border)"}`,borderRadius:9,cursor:"pointer",transition:"all .2s"}}>
                    <span style={{fontSize:20,flexShrink:0}}>{svc.icon}</span>
                    <div style={{flex:1}}>
                      <div className="fw" style={{fontSize:13}}>{svc.name}</div>
                      <div className="tx tm">{svc.desc} · {svc.turnaround}</div>
                    </div>
                    <div style={{textAlign:"right",flexShrink:0}}>
                      <div style={{fontFamily:"var(--fd)",fontSize:18,color:"var(--gold)"}}>{fmt(svc.price)}</div>
                      <div className="tx tm">{svc.unit}</div>
                    </div>
                    <div style={{width:18,height:18,borderRadius:4,border:`2px solid ${sel?"var(--gold)":"var(--border)"}`,background:sel?"var(--gold)":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:10,color:"#0c0c0e"}}>{sel?"✓":""}</div>
                  </div>
                );
              })}
            </div>
            {selectedServices.length>0&&<div style={{background:"rgba(201,168,76,0.07)",border:"1px solid rgba(201,168,76,0.18)",borderRadius:8,padding:"10px 14px",marginTop:12,display:"flex",justifyContent:"space-between",alignItems:"center"}}><span className="ts tm">{selectedServices.length} service{selectedServices.length>1?"s":""} selected</span><span style={{fontFamily:"var(--fd)",fontSize:20,color:"var(--gold)"}}>{fmt(selectedTotal)}</span></div>}
            <button className="btn bg" style={{width:"100%",marginTop:14,justifyContent:"center"}} onClick={()=>selectedServices.length&&setStep(2)} disabled={!selectedServices.length}>Continue →</button>
          </div>
        )}

        {step===2&&(
          <div className="fi-anim">
            <p className="tm ts mbm">Client details</p>
            <div className="tt mbm">
              <div className={`tb ${clientMode==="existing"?"active":""}`} onClick={()=>setClientMode("existing")}>Existing Client</div>
              <div className={`tb ${clientMode==="new"?"active":""}`} onClick={()=>setClientMode("new")}>New Client</div>
            </div>
            {clientMode==="existing"?(
              <div className="fg">
                <label className="fl">Select Client</label>
                <select className="fi" value={selectedClient} onChange={e=>setSelectedClient(e.target.value)}>
                  {clients.map(c=>{
                    const locked=projects.some(p=>p.clientId===c.id&&p.bookingLocked&&p.invoice&&!p.invoice.paid);
                    return <option key={c.id} value={c.id} disabled={locked}>{c.name} — {c.company}{locked?" 🔒 (booking locked)":""}</option>;
                  })}
                </select>
                {projects.some(p=>p.clientId===selectedClient&&p.bookingLocked&&p.invoice&&!p.invoice.paid)&&(
                  <div style={{fontSize:11,color:"var(--red)",marginTop:5}}>🔒 This client has a locked booking due to an overdue invoice. Resolve payment first.</div>
                )}
              </div>
            ):(
              <>
                <div className="fg"><label className="fl">Client Name</label><input className="fi" placeholder="Jane Smith" value={newClient.name} onChange={e=>setNewClient(n=>({...n,name:e.target.value}))} /></div>
                <div className="fg"><label className="fl">Email</label><input className="fi" type="email" placeholder="jane@company.com" value={newClient.email} onChange={e=>setNewClient(n=>({...n,email:e.target.value}))} /></div>
                <div className="fg"><label className="fl">Company (optional)</label><input className="fi" placeholder="Smith Realty" value={newClient.company} onChange={e=>setNewClient(n=>({...n,company:e.target.value}))} /></div>
              </>
            )}
            <div className="fg"><label className="fl">Property / Event Name</label><input className="fi" placeholder="123 Oak Street or Annual Gala" value={form.property} onChange={e=>setForm(f=>({...f,property:e.target.value}))} /></div>
            <div className="g2">
              <div className="fg"><label className="fl">Date</label><input className="fi" type="date" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))} /></div>
              <div className="fg"><label className="fl">Time</label><input className="fi" type="time" value={form.time} onChange={e=>setForm(f=>({...f,time:e.target.value}))} /></div>
            </div>
            <div className="row" style={{gap:8,marginTop:4}}>
              <button className="btn bgh" style={{flex:1,justifyContent:"center"}} onClick={()=>setStep(1)}>← Back</button>
              <button className="btn bg" style={{flex:2,justifyContent:"center"}} onClick={()=>form.property&&setStep(3)} disabled={!form.property||(!newClient.name&&clientMode==="new")}>Continue →</button>
            </div>
          </div>
        )}

        {step===3&&(
          <div className="fi-anim">
            <p className="tm ts mbm">Review & confirm</p>
            <div className="card" style={{padding:16,marginBottom:13}}>
              <div className="rb ts mbm"><span className="tm">Client</span><span>{clientName}</span></div>
              <div className="rb ts mbm"><span className="tm">Location</span><span style={{fontSize:12}}>{form.property}</span></div>
              <div className="rb ts mbm"><span className="tm">Date</span><span>{form.date?fmtD(form.date):"—"} · {form.time}</span></div>
              <div className="dv"/>
              {selectedServices.map(id=>{ const sv=services.find(x=>x.id===id); return <div key={id} className="rb ts" style={{marginBottom:5}}><span>{sv?.icon} {sv?.name}</span><span style={{color:"var(--gold)"}}>{fmt(sv?.price||0)}</span></div>; })}
              <div className="dv"/>
              <div className="rb ts mbm"><span className="tm">Tax (8%)</span><span>{fmt(Math.round(selectedTotal*0.08))}</span></div>
              <div className="rb"><span className="fw">Invoice Total</span><span style={{fontFamily:"var(--fd)",fontSize:20,color:"var(--gold)"}}>{fmt(Math.round(selectedTotal*1.08))}</span></div>
            </div>
            <div className="tx tm" style={{marginBottom:12,lineHeight:1.7}}>📋 Invoice auto-sends when marked Delivered. Media locked until payment confirmed.</div>
            <div className="row" style={{gap:8}}>
              <button className="btn bgh" style={{flex:1,justifyContent:"center"}} onClick={()=>setStep(2)}>← Back</button>
              <button className="btn bg" style={{flex:2,justifyContent:"center"}} onClick={finish}>✓ Confirm Booking</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── PROJECT DETAIL (shared logic, different views) ───────────────────────────
// ── DOWNLOAD HELPERS ──────────────────────────────────────────────────────────
const downloadFile = async (url, filename) => {
  try {
    const res = await fetch(url, { mode: "cors" });
    const blob = await res.blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename || "elev8-photo.jpg";
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); document.body.removeChild(a); }, 1000);
  } catch {
    // Fallback: open in new tab if CORS blocks direct download
    window.open(url, "_blank");
  }
};

const downloadAll = async (media, projectName, setProgress) => {
  for (let i = 0; i < media.length; i++) {
    setProgress(Math.round(((i) / media.length) * 100));
    const m = media[i];
    await downloadFile(m.url, m.name || `${projectName}-${i + 1}.jpg`);
    await new Promise(r => setTimeout(r, 400)); // stagger downloads
  }
  setProgress(100);
  setTimeout(() => setProgress(null), 2000);
};

// ── ENHANCED LIGHTBOX WITH DOWNLOAD ──────────────────────────────────────────
function Lightbox({ media, initialIndex, onClose, canDownload }) {
  const [idx, setIdx] = useState(initialIndex || 0);
  const [downloading, setDownloading] = useState(false);
  const m = media[idx];

  useEffect(() => {
    const handler = e => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setIdx(i => Math.min(i + 1, media.length - 1));
      if (e.key === "ArrowLeft") setIdx(i => Math.max(i - 1, 0));
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [media.length]);

  const handleDownload = async () => {
    setDownloading(true);
    await downloadFile(m.url, m.name || `elev8-photo-${idx + 1}.jpg`);
    setDownloading(false);
  };

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.95)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",zIndex:200}} onClick={e=>e.target===e.currentTarget&&onClose()}>
      {/* Top bar */}
      <div style={{position:"absolute",top:0,left:0,right:0,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 20px",background:"linear-gradient(to bottom,rgba(0,0,0,0.7),transparent)",zIndex:10}}>
        <div style={{color:"rgba(255,255,255,0.7)",fontSize:13}}>{m?.name || `Photo ${idx+1}`}</div>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <span style={{color:"rgba(255,255,255,0.4)",fontSize:12}}>{idx+1} / {media.length}</span>
          {canDownload && (
            <button
              onClick={handleDownload}
              disabled={downloading}
              style={{display:"flex",alignItems:"center",gap:7,background:"linear-gradient(135deg,#c9a84c,#e2c880)",border:"none",borderRadius:8,padding:"8px 16px",color:"#0c0c0e",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",opacity:downloading?0.7:1}}>
              {downloading ? "↓ Saving…" : "↓ Download"}
            </button>
          )}
          <button onClick={onClose} style={{width:34,height:34,borderRadius:"50%",background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.15)",color:"#fff",fontSize:16,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
        </div>
      </div>

      {/* Prev / Next */}
      {idx > 0 && <button onClick={()=>setIdx(i=>i-1)} style={{position:"absolute",left:16,top:"50%",transform:"translateY(-50%)",width:44,height:44,borderRadius:"50%",background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.2)",color:"#fff",fontSize:20,cursor:"pointer",zIndex:10}}>‹</button>}
      {idx < media.length-1 && <button onClick={()=>setIdx(i=>i+1)} style={{position:"absolute",right:16,top:"50%",transform:"translateY(-50%)",width:44,height:44,borderRadius:"50%",background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.2)",color:"#fff",fontSize:20,cursor:"pointer",zIndex:10}}>›</button>}

      {/* Image */}
      <img src={m?.url} alt={m?.name} style={{maxWidth:"90vw",maxHeight:"82vh",objectFit:"contain",borderRadius:8,boxShadow:"0 20px 60px rgba(0,0,0,0.5)"}} onClick={e=>e.stopPropagation()}/>

      {/* Thumbnails strip */}
      {media.length > 1 && (
        <div style={{position:"absolute",bottom:0,left:0,right:0,display:"flex",gap:6,padding:"12px 20px",overflowX:"auto",background:"linear-gradient(to top,rgba(0,0,0,0.7),transparent)"}}>
          {media.map((item,i)=>(
            <div key={item.id||i} onClick={()=>setIdx(i)} style={{width:54,height:40,borderRadius:6,overflow:"hidden",flexShrink:0,cursor:"pointer",border:`2px solid ${i===idx?"var(--gold)":"transparent"}`,opacity:i===idx?1:0.55,transition:"all .15s"}}>
              <img src={item.url} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── MEDIA GALLERY PANEL ───────────────────────────────────────────────────────
function MediaGalleryPanel({ media, isClient, projectName, paid, onApprove, onLightbox }) {
  const [selected, setSelected] = useState(new Set());
  const [lbIdx, setLbIdx] = useState(null);
  const [dlProgress, setDlProgress] = useState(null);
  const [viewMode, setViewMode] = useState("grid"); // grid | list
  const canDownload = isClient && paid;
  const allSelected = selected.size === media.length && media.length > 0;

  const toggleSelect = id => setSelected(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleAll = () => setSelected(allSelected ? new Set() : new Set(media.map(m => m.id)));

  const downloadSelected = async () => {
    const toDownload = media.filter(m => selected.has(m.id));
    await downloadAll(toDownload, projectName, setDlProgress);
  };

  const downloadSingle = async (m, e) => {
    e.stopPropagation();
    await downloadFile(m.url, m.name || `${projectName}.jpg`);
  };

  return (
    <div>
      {lbIdx !== null && (
        <Lightbox media={media} initialIndex={lbIdx} onClose={() => setLbIdx(null)} canDownload={canDownload} />
      )}

      {/* Toolbar */}
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:18,flexWrap:"wrap"}}>
        <div className="st" style={{margin:0,flex:1}}>{isClient ? "My Photos" : "Media"} — {media.length} files</div>

        {canDownload && media.length > 0 && (
          <>
            <button className="btn bgh bs" onClick={toggleAll} style={{fontSize:12}}>
              {allSelected ? "✓ All Selected" : `Select All (${media.length})`}
            </button>
            {selected.size > 0 && (
              <button className="btn bg bs" onClick={downloadSelected} style={{fontSize:12}}>
                ↓ Download {selected.size} {selected.size===1?"File":"Files"}
              </button>
            )}
            <button className="btn bg" onClick={()=>downloadAll(media,projectName,setDlProgress)} style={{fontSize:12,background:"linear-gradient(135deg,#5b8dd9,#7ba8e8)",color:"#fff"}}>
              ↓ Download All ({media.length})
            </button>
          </>
        )}

        {!isClient && <button className="btn bgh bs">↑ Upload</button>}

        <div style={{display:"flex",gap:3,background:"var(--surface2)",borderRadius:7,padding:3}}>
          {["grid","list"].map(v=><div key={v} onClick={()=>setViewMode(v)} style={{padding:"5px 10px",borderRadius:5,cursor:"pointer",fontSize:12,background:viewMode===v?"var(--surface)":"transparent",color:viewMode===v?"var(--text)":"var(--muted)",transition:"all .15s"}}>{v==="grid"?"⊞":"☰"}</div>)}
        </div>
      </div>

      {/* Download progress bar */}
      {dlProgress !== null && (
        <div style={{marginBottom:14}}>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:"var(--muted)",marginBottom:5}}>
            <span>{dlProgress < 100 ? `Downloading… ${dlProgress}%` : "✓ All downloads complete!"}</span>
            <span>{dlProgress}%</span>
          </div>
          <div style={{height:4,background:"var(--border)",borderRadius:2,overflow:"hidden"}}>
            <div style={{height:"100%",width:`${dlProgress}%`,background:"linear-gradient(90deg,var(--gold),var(--gl))",borderRadius:2,transition:"width .3s"}}/>
          </div>
        </div>
      )}

      {/* Paid download banner for clients */}
      {canDownload && (
        <div style={{display:"flex",alignItems:"center",gap:10,background:"rgba(76,175,130,0.07)",border:"1px solid rgba(76,175,130,0.2)",borderRadius:9,padding:"11px 16px",marginBottom:16,fontSize:13}}>
          <span style={{fontSize:16}}>✅</span>
          <span style={{color:"var(--green)",fontWeight:500}}>Gallery unlocked</span>
          <span className="tm ts">— click any photo to view & download, or use the buttons above to download multiple files</span>
        </div>
      )}

      {media.length === 0 ? (
        <div className="upload-z" style={{padding:"50px 30px"}}><div style={{fontSize:28,marginBottom:8}}>📷</div><div className="fw">No media yet</div><div className="tm ts mts">Files appear after editing is complete</div></div>
      ) : viewMode === "grid" ? (
        <div className="mg">
          {media.map((m, i) => (
            <div key={m.id} style={{position:"relative",borderRadius:8,overflow:"hidden",aspectRatio:"4/3",background:"var(--surface2)",border:`2px solid ${selected.has(m.id)?"var(--gold)":"var(--border)"}`,cursor:"pointer",transition:"border-color .15s",flexShrink:0}}>
              <img src={m.url} alt={m.name} style={{width:"100%",height:"100%",objectFit:"cover",transition:"transform .3s"}} onClick={()=>setLbIdx(i)}/>

              {/* Approved badge */}
              {m.approved && <div style={{position:"absolute",top:7,right:7,width:20,height:20,background:"#4caf82",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:"#fff"}}>✓</div>}

              {/* Selection checkbox (client download mode) */}
              {canDownload && (
                <div onClick={e=>{e.stopPropagation();toggleSelect(m.id);}} style={{position:"absolute",top:7,left:7,width:22,height:22,borderRadius:5,background:selected.has(m.id)?"var(--gold)":"rgba(0,0,0,0.5)",border:`2px solid ${selected.has(m.id)?"var(--gold)":"rgba(255,255,255,0.4)"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:"#0c0c0e",cursor:"pointer",transition:"all .15s"}}>
                  {selected.has(m.id)?"✓":""}
                </div>
              )}

              {/* Hover overlay */}
              <div className="mto">
                {canDownload ? (
                  <div style={{display:"flex",flexDirection:"column",gap:7,alignItems:"center"}}>
                    <button className="btn bs" style={{background:"rgba(255,255,255,0.15)",color:"#fff",fontSize:11,backdropFilter:"blur(4px)"}} onClick={e=>{e.stopPropagation();setLbIdx(i);}}>🔍 View</button>
                    <button className="btn bs" style={{background:"linear-gradient(135deg,#c9a84c,#e2c880)",color:"#0c0c0e",fontSize:11}} onClick={e=>downloadSingle(m,e)}>↓ Download</button>
                  </div>
                ) : (
                  <button className="btn bs" style={{background:m.approved?"#4caf82":"rgba(255,255,255,0.18)",color:"#fff",fontSize:11}} onClick={e=>{e.stopPropagation();onApprove(m.id);}}>
                    {m.approved?"✓ Approved":"Approve"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        // List view
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {media.map((m, i) => (
            <div key={m.id} style={{display:"flex",alignItems:"center",gap:14,background:"var(--surface)",border:`1px solid ${selected.has(m.id)?"var(--gold)":"var(--border)"}`,borderRadius:10,padding:"10px 14px",cursor:"pointer",transition:"all .15s"}} onClick={()=>setLbIdx(i)}>
              <div style={{width:56,height:42,borderRadius:6,overflow:"hidden",flexShrink:0}}>
                <img src={m.url} alt={m.name} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:500}}>{m.name || `Photo ${i+1}`}</div>
                <div style={{fontSize:11,color:"var(--muted)",marginTop:2,display:"flex",gap:10}}>
                  {m.approved && <span style={{color:"var(--green)"}}>✓ Approved</span>}
                  <span>JPG · High Resolution</span>
                </div>
              </div>
              <div style={{display:"flex",gap:8,alignItems:"center"}}>
                {canDownload && (
                  <>
                    <div onClick={e=>{e.stopPropagation();toggleSelect(m.id);}} style={{width:20,height:20,borderRadius:4,background:selected.has(m.id)?"var(--gold)":"transparent",border:`2px solid ${selected.has(m.id)?"var(--gold)":"var(--border)"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:"#0c0c0e",cursor:"pointer"}}>
                      {selected.has(m.id)?"✓":""}
                    </div>
                    <button className="btn bg bs" style={{fontSize:11}} onClick={e=>downloadSingle(m,e)}>↓ Download</button>
                  </>
                )}
                {!isClient && (
                  <button className="btn bs" style={{background:m.approved?"rgba(76,175,130,0.15)":"rgba(255,255,255,0.06)",color:m.approved?"var(--green)":"var(--muted)",border:`1px solid ${m.approved?"rgba(76,175,130,0.3)":"var(--border)"}`,fontSize:11}} onClick={e=>{e.stopPropagation();onApprove(m.id);}}>
                    {m.approved?"✓ Approved":"Approve"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ProjectDetail({project,onBack,onUpdate,isClient=false,clientName="",stripeKey="",brand=DEFAULT_BRAND,onCashPayment=null}) {
  const [tab,setTab]=useState("overview");
  const [lbIdx,setLbIdx]=useState(null);
  const [msg,setMsg]=useState("");
  const [p,setP]=useState(project);
  const [showPay,setShowPay]=useState(false);
  const msgEnd=useRef(null);
  const save=u=>{setP(u);onUpdate(u);};
  const nextS={pending:"shooting",shooting:"editing",editing:"delivered"};

  const advance=()=>{
    const ns=nextS[p.status]; if(!ns) return;
    const np={shooting:30,editing:65,delivered:100}[ns];
    let u={...p,status:ns,progress:np};
    if(ns==="delivered"&&!p.invoice){
      const lineItems=p.lineItems||[{desc:p.property,rate:p.price}];
      u={...u,invoice:makeInvoice(p,lineItems)};
    }
    save(u); if(ns==="delivered") setTab("payment");
  };
  const sendMsg=()=>{ if(!msg.trim()) return; const u={...p,messages:[...p.messages,{id:Date.now(),sender:isClient?clientName:"Elev8 Studios",avatar:isClient?clientName.slice(0,2).toUpperCase():"E8",text:msg.trim(),time:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}),mine:isClient?false:true}]}; save(u); setMsg(""); setTimeout(()=>msgEnd.current?.scrollIntoView({behavior:"smooth"}),50); };
  const approveMed=mid=>save({...p,media:p.media.map(m=>m.id===mid?{...m,approved:!m.approved}:m)});
  const handlePaid=()=>{save({...p,invoice:{...p.invoice,paid:true,paidDate:"2026-03-21"}});setShowPay(false);setTab("media");};
  const locked=p.status==="delivered"&&p.invoice&&!p.invoice.paid;

  return (
    <div className="page fi-anim">
      {lbIdx !== null && <Lightbox media={p.media} initialIndex={lbIdx} onClose={()=>setLbIdx(null)} canDownload={isClient && !!p.invoice?.paid}/>}
      {showPay&&<PayModal inv={p.invoice} project={p} onClose={()=>setShowPay(false)} onPaid={handlePaid} stripeKey={stripeKey}/>}

      <div className="row" style={{gap:13,marginBottom:24}}>
        <button style={{width:34,height:34,borderRadius:"50%",background:"var(--surface2)",border:"1px solid var(--border)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:15,color:"var(--muted)"}} onClick={onBack}>←</button>
        <div style={{flex:1}}>
          <div className="row" style={{gap:9,marginBottom:2}}>
            <span style={{fontFamily:"var(--fd)",fontSize:24,fontWeight:300}}>{p.property}</span>
            <SBadge s={p.status}/>
            {p.invoice&&!p.invoice.paid&&<span className="badge" style={{color:"var(--red)",background:"rgba(224,112,112,0.1)"}}>⚑ Invoice Unpaid</span>}
          </div>
          <span className="tm ts">{p.client} · {p.type}</span>
        </div>
        {!isClient&&nextS[p.status]&&<button className="btn bg bs" onClick={advance}>→ Mark as {SM[nextS[p.status]]?.label}{nextS[p.status]==="delivered"?" & Send Invoice":""}</button>}
      </div>

      {p.invoice&&!p.invoice.paid&&<div style={{display:"flex",alignItems:"center",gap:12,background:"rgba(224,112,112,0.06)",border:"1px solid rgba(224,112,112,0.18)",borderRadius:10,padding:"12px 16px",marginBottom:18,fontSize:13}}><span style={{fontSize:18}}>🔒</span><div style={{flex:1}}><span className="fw" style={{color:"var(--red)"}}>Invoice {p.invoice.number} unpaid</span><span className="tm ts" style={{marginLeft:8}}>— media is locked until payment received</span></div><button className="btn bg bs" onClick={()=>setTab("payment")}>View Invoice</button></div>}
      {p.invoice?.paid&&<div style={{display:"flex",alignItems:"center",gap:11,background:"rgba(76,175,130,0.06)",border:"1px solid rgba(76,175,130,0.18)",borderRadius:10,padding:"11px 16px",marginBottom:18,fontSize:13}}><span>✓</span><span style={{color:"var(--green)",fontWeight:500}}>Payment of {fmt(p.invoice.total)} confirmed · {fmtD(p.invoice.paidDate)}</span><span className="tm ts" style={{marginLeft:4}}>· Gallery unlocked</span></div>}

      <div className="tabs">
        {["overview","media","messages","payment","schedule"].map(t=>(
          <div key={t} className={`tab ${tab===t?"active":""}`} onClick={()=>setTab(t)}>
            {t.charAt(0).toUpperCase()+t.slice(1)}
            {t==="media"&&locked&&<span style={{marginLeft:5,fontSize:11}}>🔒</span>}
            {t==="payment"&&p.invoice&&!p.invoice.paid&&<span className="nd" style={{marginLeft:6}}/>}
          </div>
        ))}
      </div>

      {tab==="overview"&&<div className="g2" style={{gap:18}}>
        <div className="card">
          <div className="st" style={{fontSize:16}}>Progress</div>
          <div className="rb" style={{marginBottom:6}}><span className="tm ts">Completion</span><span style={{color:"var(--gold)",fontWeight:500}}>{p.progress}%</span></div>
          <PBar v={p.progress}/>
          <div className="tl" style={{marginTop:16}}>
            {[{label:"Booking Confirmed",done:true,time:fmtD(p.scheduledDate)},{label:"On-Site Shoot",done:["shooting","editing","delivered"].includes(p.status),time:p.scheduledTime},{label:"Editing",done:["editing","delivered"].includes(p.status),time:"Post-shoot"},{label:"Invoice Sent",done:!!p.invoice,time:p.invoice?`Sent at ${p.invoice.sentAt}`:"Upon delivery",c:"#e0a450"},{label:"Payment Received",done:p.invoice?.paid,time:p.invoice?.paid?fmtD(p.invoice.paidDate):"Awaiting",c:"#4caf82"},{label:"Media Released",done:p.invoice?.paid,time:p.invoice?.paid?"Unlocked":"After payment",c:"#4caf82"}].map((step,i)=>(
              <div key={i} className="tli">
                <div className="tld" style={{background:step.done?"rgba(76,175,130,0.18)":"var(--surface2)",border:`1px solid ${step.done?(step.c||"#4caf82"):"var(--border)"}`}}><span style={{color:step.done?(step.c||"#4caf82"):"var(--muted)",fontSize:9}}>{step.done?"✓":"○"}</span></div>
                <div><div style={{fontSize:13,fontWeight:500,color:step.done?"var(--text)":"var(--muted)"}}>{step.label}</div><div style={{fontSize:11,color:"var(--muted)"}}>{step.time}</div></div>
              </div>
            ))}
          </div>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div className="card">
            <div className="st" style={{fontSize:16}}>Services Booked</div>
            {(p.lineItems||[{desc:p.property,rate:p.price}]).map((li,i)=>(
              <div key={i} className="rb ts" style={{marginBottom:8,padding:"8px 10px",background:"var(--surface2)",borderRadius:7}}><span>{li.desc}</span><span style={{color:"var(--gold)",fontFamily:"var(--fd)",fontSize:15}}>{li.rate>0?fmt(li.rate):"Incl."}</span></div>
            ))}
            <div className="dv"/>
            <div className="rb"><span className="fw">Total</span><span style={{fontFamily:"var(--fd)",fontSize:22,color:"var(--gold)"}}>{fmt(p.price)}</span></div>
          </div>
          <div className="card">
            <div className="st" style={{fontSize:16}}>Session Info</div>
            <div className="rb ts mbm"><span className="tm">Date</span><span>{fmtD(p.scheduledDate)}</span></div>
            <div className="rb ts mbm"><span className="tm">Time</span><span>{p.scheduledTime}</span></div>
            <div className="rb ts"><span className="tm">Location</span><span style={{fontSize:12}}>{p.property}</span></div>
          </div>
        </div>
      </div>}

      {tab==="media"&&(locked?(
        <div className="lock-gate">
          <div style={{fontSize:52,marginBottom:16}}>🔒</div>
          <div style={{fontFamily:"var(--fd)",fontSize:28,fontWeight:300,marginBottom:10}}>Media Locked</div>
          <p style={{color:"var(--muted)",fontSize:13,maxWidth:360,margin:"0 auto 22px",lineHeight:1.8}}>Your {p.media.length} photos are ready! Payment of <strong style={{color:"var(--gold)"}}>{fmt(p.invoice.total)}</strong> is required to unlock the gallery and enable downloads.</p>
          <button className="btn bg" onClick={()=>setShowPay(true)}>Pay Invoice & Unlock Gallery →</button>
          <div className="tx tm" style={{marginTop:10}}>Invoice {p.invoice.number} · Due {fmtD(p.invoice.dueDate)}</div>
        </div>
      ):(<MediaGalleryPanel media={p.media} isClient={isClient} projectName={p.property} paid={!!p.invoice?.paid} onApprove={approveMed} onLightbox={setLbIdx}/>))}


      {tab==="messages"&&(
        <div className="card" style={{maxWidth:640}}>
          <div className="st" style={{fontSize:16,marginBottom:15}}>Messages</div>
          {p.messages.length===0?<div style={{textAlign:"center",padding:"28px 0",color:"var(--muted)"}}>No messages yet — start the conversation.</div>:(
            <div className="ml">{p.messages.map(m=><div key={m.id} className={`msg ${isClient?(!m.mine?"mine":""):m.mine?"mine":""}`}><div className="mav" style={{background:"linear-gradient(135deg,#c9a84c,#5b8dd9)"}}>{m.avatar}</div><div className="mb">{<div style={{fontSize:10,color:"var(--muted)",marginBottom:2}}>{m.sender}</div>}<div style={{fontSize:13}}>{m.text}</div><div style={{fontSize:10,color:"var(--muted)",marginTop:3}}>{m.time}</div></div></div>)}<div ref={msgEnd}/></div>
          )}
          <div className="row" style={{marginTop:13}}><input className="mi" placeholder="Type a message…" value={msg} onChange={e=>setMsg(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendMsg()}/><button className="btn bg bs" onClick={sendMsg}>Send</button></div>
        </div>
      )}

      {tab==="payment"&&(
        <div style={{maxWidth:560}}>
          {!p.invoice?(
            <div className="card" style={{textAlign:"center",padding:"40px 30px"}}>
              <div style={{fontSize:34,marginBottom:11}}>📋</div>
              <div className="fw" style={{fontSize:15,marginBottom:7}}>No Invoice Yet</div>
              <p className="tm ts" style={{maxWidth:300,margin:"0 auto 18px",lineHeight:1.7}}>Invoice auto-generates when the project is marked Delivered.</p>
              {!isClient&&nextS[p.status]&&<button className="btn bg" onClick={advance}>Mark as {SM[nextS[p.status]]?.label} & Generate Invoice</button>}
            </div>
          ):(
            <>
              <InvDoc inv={p.invoice} project={p} onPay={()=>setShowPay(true)} brand={brand}/>
              {!isClient&&!p.invoice.paid&&(
                <>
                  {p.bookingLocked&&<div style={{background:"rgba(224,112,112,0.07)",border:"1px solid rgba(224,112,112,0.2)",borderRadius:8,padding:"10px 14px",marginBottom:10,fontSize:13,display:"flex",alignItems:"center",gap:10}}><span>🔒</span><span style={{color:"var(--red)"}}>Client booking is locked due to overdue payment</span></div>}
                  <div className="row" style={{gap:8,marginTop:11,flexWrap:"wrap"}}>
                    <button className="btn bgh bs">↓ Download PDF</button>
                    <button className="btn bgh bs">✉ Resend</button>
                    <button className="btn bs" style={{background:"rgba(76,175,130,0.12)",border:"1px solid rgba(76,175,130,0.3)",color:"var(--green)"}}
                      onClick={()=>onCashPayment&&onCashPayment(p)}>💵 Record Cash/Check</button>
                    <button className="btn btn-ok bs" onClick={()=>{const u={...p,invoice:{...p.invoice,paid:true,paidDate:new Date().toISOString().split("T")[0]}};save(u);}}>✓ Mark Paid</button>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      )}

      {tab==="schedule"&&(
        <div className="g2" style={{gap:18}}>
          <div className="card"><MiniCal projects={[p]}/></div>
          <div className="card">
            <div className="st" style={{fontSize:16}}>Session Details</div>
            <div className="rb ts mbm"><span className="tm">Date</span><span>{fmtD(p.scheduledDate)}</span></div>
            <div className="rb ts mbm"><span className="tm">Time</span><span>{p.scheduledTime}</span></div>
            <div className="rb ts mbm"><span className="tm">Location</span><span style={{fontSize:12}}>{p.property}</span></div>
            <div className="rb ts"><span className="tm">Duration</span><span>{p.type==="Events"?"Full day":"2–3 hours"}</span></div>
            <div className="dv"/>
            {!isClient&&<button className="btn bgh bs">✏ Reschedule</button>}
          </div>
        </div>
      )}
    </div>
  );
}

// ── CLIENT PORTAL ─────────────────────────────────────────────────────────────
function ClientPortal({client,projects,onUpdateProject,onLogout,stripeKey="",brand=DEFAULT_BRAND}) {
  const [nav,setNav]=useState("home");
  const [selId,setSelId]=useState(null);
  const [menuOpen,setMenuOpen]=useState(false);
  const myProjects=projects.filter(p=>p.clientId===client.id);
  const sel=myProjects.find(p=>p.id===selId);
  const open=id=>{setSelId(id);setNav("detail");};
  const closeMenu=()=>setMenuOpen(false);
  const navItems=[{id:"home",icon:"⬡",label:"My Projects"},{id:"media",icon:"◈",label:"My Gallery"},{id:"invoices",icon:"📋",label:"Invoices"},{id:"rebook",icon:"＋",label:"Request Booking"}];
  const unpaid=myProjects.filter(p=>p.invoice&&!p.invoice.paid).length;

  // Rebook: simple service request
  const [rbForm,setRbForm]=useState({property:"",date:"",notes:""});
  const [rbSent,setRbSent]=useState(false);

  const allMedia=myProjects.filter(p=>p.invoice?.paid||!p.invoice).flatMap(p=>p.media);
  const [cpLbIdx,setCpLbIdx]=useState(null);

  return (
    <>
      <style>{BASE_CSS}</style>
      <div className="app">
        {cpLbIdx!==null&&<Lightbox media={allMedia} initialIndex={cpLbIdx} onClose={()=>setCpLbIdx(null)} canDownload={true}/>}
        <nav className="topnav">
          <button className={`hbtn ${menuOpen?"open":""}`} onClick={()=>setMenuOpen(o=>!o)}><div className="hbar"/><div className="hbar"/><div className="hbar"/></button>
          <div className="sb-logo"><h1>ELEV8</h1><p>Studios</p></div>
          <div className="nav-pills">
            {navItems.map(n=><div key={n.id} className={`npill ${nav===n.id?"active":""}`} onClick={()=>{setNav(n.id);setSelId(null);closeMenu();}}>
              <span>{n.icon}</span>{n.label}
              {n.id==="invoices"&&unpaid>0&&<span style={{background:"var(--red)",color:"#fff",fontSize:10,fontWeight:600,padding:"1px 6px",borderRadius:10}}>{unpaid}</span>}
            </div>)}
          </div>
          <div className="sb-foot" style={{marginLeft:"auto"}}>
            <div style={{textAlign:"right",marginRight:2}}><div className="fw" style={{fontSize:12}}>{client.name}</div><div className="tx" style={{color:"var(--green)",fontSize:10}}>Free Account</div></div>
            <div className="av" style={{width:30,height:30,fontSize:11,background:client.color||"linear-gradient(135deg,#5b8dd9,#a07bd4)"}}>{client.initials}</div>
          </div>
          <div className={`dropmenu ${menuOpen?"open":""}`}>
            {navItems.map(n=><div key={n.id} className={`ni ${nav===n.id?"active":""}`} onClick={()=>{setNav(n.id);setSelId(null);closeMenu();}}><span style={{width:20,textAlign:"center"}}>{n.icon}</span>{n.label}</div>)}
            <div className="dv" style={{margin:"8px 16px"}}/>
            <div className="ni" onClick={onLogout} style={{color:"var(--muted)"}}><span style={{width:20,textAlign:"center"}}>←</span>Sign Out</div>
          </div>
        </nav>
        <div className={`menu-overlay ${menuOpen?"open":""}`} onClick={closeMenu}/>

        <main className="main">
          {nav==="home"&&!sel&&(
            <div className="page fi-anim">
              <div className="ph">
                <h2 className="pt">Hello, <em>{client.name.split(" ")[0]}</em></h2>
                <p className="ps">{client.company} · Your project portal — 100% free</p>
              </div>
              <div className="g3" style={{marginBottom:22}}>
                {[{label:"Active Projects",value:myProjects.filter(p=>["pending","shooting","editing"].includes(p.status)).length,color:"var(--gold)"},{label:"Delivered",value:myProjects.filter(p=>p.status==="delivered").length,color:"var(--green)"},{label:"Outstanding",value:fmt(myProjects.filter(p=>p.invoice&&!p.invoice.paid).reduce((s,p)=>s+p.invoice.total,0)),color:unpaid>0?"var(--red)":"var(--muted)"}].map(s=><div key={s.label} className="sc"><div className="sl">{s.label}</div><div className="sv" style={{color:s.color,fontSize:28}}>{s.value}</div></div>)}
              </div>
              {unpaid>0&&<div style={{display:"flex",alignItems:"center",gap:11,background:"rgba(224,112,112,0.06)",border:"1px solid rgba(224,112,112,0.18)",borderRadius:10,padding:"12px 16px",marginBottom:20,fontSize:13,cursor:"pointer"}} onClick={()=>setNav("invoices")}><span style={{fontSize:18}}>⚑</span><span style={{color:"var(--red)",fontWeight:500}}>{unpaid} invoice{unpaid>1?"s":""} awaiting payment</span><span className="tm ts">— media locked until paid</span></div>}
              <div className="st">Your Projects</div>
              {myProjects.length===0?<div className="upload-z" style={{padding:"50px",textAlign:"center"}}><div style={{fontSize:32,marginBottom:10}}>📷</div><div className="fw">No projects yet</div><div className="tm ts mts">Your studio will create your first booking</div></div>:(
                <div style={{display:"flex",flexDirection:"column",gap:11}}>
                  {myProjects.map(p=>(
                    <div key={p.id} className="pc" onClick={()=>open(p.id)}>
                      <div className="rb" style={{marginBottom:8}}>
                        <div><div className="ts tm mbm">{p.type}</div><div className="pn">{p.property}</div><div className="ts tm">{fmtD(p.scheduledDate)} · {p.scheduledTime}</div></div>
                        <SBadge s={p.status}/>
                      </div>
                      <PBar v={p.progress}/>
                      <div className="rb" style={{fontSize:11,color:"var(--muted)"}}>
                        <span>{p.progress}% complete</span>
                        {p.invoice?<span style={{color:p.invoice.paid?"var(--green)":"var(--red)"}}>{p.invoice.paid?`✓ Paid ${fmt(p.invoice.total)}`:`⚑ ${fmt(p.invoice.total)} due`}</span>:<span>{fmt(p.price)}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {nav==="detail"&&sel&&<ProjectDetail project={sel} onBack={()=>setNav("home")} onUpdate={onUpdateProject} isClient={true} clientName={client.name} stripeKey={stripeKey} brand={brand}/>}
          {nav==="media"&&(
            <div className="page fi-anim">
              <div className="ph"><h2 className="pt">My <em>Gallery</em></h2><p className="ps">{allMedia.length} photos · All available to download</p></div>
              {allMedia.length===0?<div className="upload-z" style={{padding:"56px",textAlign:"center"}}><div style={{fontSize:36,marginBottom:11}}>🖼</div><div className="fw">No media available yet</div><div className="tm ts mts">Photos appear here after delivery and payment</div></div>:(
                <MediaGalleryPanel media={allMedia} isClient={true} projectName={client.name} paid={true} onApprove={()=>{}} onLightbox={setCpLbIdx}/>
              )}
            </div>
          )}
          {nav==="invoices"&&(
            <div className="page fi-anim">
              <div className="ph"><h2 className="pt">My <em>Invoices</em></h2><p className="ps">{myProjects.filter(p=>p.invoice).length} invoices</p></div>
              {myProjects.filter(p=>p.invoice).length===0?<div className="upload-z" style={{padding:"50px",textAlign:"center"}}><div style={{fontSize:32,marginBottom:10}}>📋</div><div className="fw">No invoices yet</div></div>:(
                <div style={{display:"flex",flexDirection:"column",gap:12}}>
                  {myProjects.filter(p=>p.invoice).map(p=>(
                    <div key={p.id} className="pc" onClick={()=>{open(p.id);setNav("detail");}}>
                      <div className="rb">
                        <div><div className="ts tm mbm">{p.invoice.number}</div><div className="pn" style={{fontSize:16}}>{p.property}</div><div className="ts tm">{fmtD(p.invoice.issuedDate)}</div></div>
                        <div style={{textAlign:"right"}}><div style={{fontFamily:"var(--fd)",fontSize:22,color:"var(--gold)"}}>{fmt(p.invoice.total)}</div><div className="tx" style={{color:p.invoice.paid?"var(--green)":"var(--red)",marginTop:4}}>{p.invoice.paid?"✓ Paid":"⚑ Due"}</div></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {nav==="rebook"&&(
            <div className="page fi-anim" style={{maxWidth:560}}>
              <div className="ph"><h2 className="pt">Request a <em>Booking</em></h2><p className="ps">Submit a new shoot request — your studio will confirm and send details</p></div>
              {rbSent?(
                <div className="card" style={{textAlign:"center",padding:"44px 30px"}}>
                  <div style={{fontSize:48,marginBottom:14}}>✅</div>
                  <div className="fw" style={{fontSize:16,marginBottom:8}}>Request Sent!</div>
                  <p className="tm ts" style={{lineHeight:1.8}}>Your studio has been notified. They'll confirm your booking and send details shortly.</p>
                  <button className="btn bg" style={{marginTop:18}} onClick={()=>setRbSent(false)}>Submit Another</button>
                </div>
              ):(
                <div className="card">
                  <div className="fg"><label className="fl">Property / Event Name</label><input className="fi" placeholder="e.g. 456 Maple Street or Spring Gala" value={rbForm.property} onChange={e=>setRbForm(f=>({...f,property:e.target.value}))} /></div>
                  <div className="g2">
                    <div className="fg"><label className="fl">Preferred Date</label><input className="fi" type="date" value={rbForm.date} onChange={e=>setRbForm(f=>({...f,date:e.target.value}))} /></div>
                    <div className="fg"><label className="fl">Preferred Time</label><input className="fi" type="time" value={rbForm.time||"10:00"} onChange={e=>setRbForm(f=>({...f,time:e.target.value}))} /></div>
                  </div>
                  <div className="fg"><label className="fl">Notes / Special Requests</label><textarea className="fi" rows={3} placeholder="Anything your studio should know…" value={rbForm.notes} onChange={e=>setRbForm(f=>({...f,notes:e.target.value}))} style={{resize:"vertical"}}/></div>
                  <div className="tx tm" style={{marginBottom:14,lineHeight:1.7}}>📋 Your studio will confirm services, pricing, and scheduling. You'll receive an invoice upon delivery.</div>
                  <button className="btn bg" style={{width:"100%",justifyContent:"center"}} onClick={()=>rbForm.property&&setRbSent(true)} disabled={!rbForm.property}>Send Booking Request →</button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </>
  );
}

// ── BRANDING SETTINGS PAGE ────────────────────────────────────────────────────
function BrandingSettings({brand, setBrand}) {
  const [form, setForm] = useState({...brand});
  const [saved, setSaved] = useState(false);
  const f = (k,v) => setForm(p => ({...p,[k]:v}));

  const save = () => {
    setBrand(form);
    saveBranding(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const previewBrand = form;
  const previewProject = { client:"Jane Client", property:"123 Sample Street" };
  const previewInv = {
    number:"INV-0001-2026", issuedDate:"2026-03-21", dueDate:"2026-03-28",
    lineItems:[{desc:"📷 Standard Photos",rate:199},{desc:"🚁 Drone Aerial",rate:149}],
    subtotal:348, tax:28, total:376, paid:false, paidDate:null,
  };

  const COLORS = ["#c9a84c","#5b8dd9","#a07bd4","#4caf82","#e07070","#e0a450","#2dd4bf","#f472b6","#64748b","#000000"];

  return (
    <div className="page fi-anim">
      <div className="ph">
        <h2 className="pt">Studio <em>Branding</em></h2>
        <p className="ps">Your business name and contact info appear on every invoice your clients receive</p>
      </div>

      <div className="g2" style={{gap:20,alignItems:"flex-start"}}>

        {/* LEFT — Form */}
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div className="card">
            <div className="st" style={{fontSize:17,marginBottom:16}}>Business Identity</div>

            <div className="fg">
              <label className="fl">Business Name <span style={{color:"var(--red)"}}>*</span></label>
              <input className="fi" placeholder="e.g. Webb Vision Photography" value={form.businessName} onChange={e=>f("businessName",e.target.value)}/>
              <div style={{fontSize:11,color:"var(--muted)",marginTop:4}}>This replaces "Elev8 Studios" on all invoices</div>
            </div>

            <div className="fg">
              <label className="fl">Tagline / Service Description</label>
              <input className="fi" placeholder="e.g. Real Estate & Event Photography" value={form.tagline} onChange={e=>f("tagline",e.target.value)}/>
            </div>

            <div className="fg">
              <label className="fl">Logo Initials (shown in logo box)</label>
              <input className="fi" placeholder="e.g. WVP or JK" value={form.logoInitials} onChange={e=>f("logoInitials",e.target.value.slice(0,4).toUpperCase())} maxLength={4}/>
              <div style={{fontSize:11,color:"var(--muted)",marginTop:4}}>Up to 4 characters — appears in the colored logo square on invoices</div>
            </div>

            <div className="fg" style={{marginBottom:0}}>
              <label className="fl">Brand Accent Color</label>
              <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:4}}>
                {COLORS.map(c=>(
                  <div key={c} onClick={()=>f("accentColor",c)} style={{width:28,height:28,borderRadius:6,background:c,cursor:"pointer",border:`3px solid ${form.accentColor===c?"var(--text)":"transparent"}`,transition:"border .15s",flexShrink:0}}/>
                ))}
                <input type="color" value={form.accentColor} onChange={e=>f("accentColor",e.target.value)} style={{width:28,height:28,borderRadius:6,border:"1px solid var(--border)",cursor:"pointer",background:"transparent",padding:1}}/>
              </div>
              <div style={{fontSize:11,color:"var(--muted)",marginTop:6}}>Used for invoice header, totals, and pay button</div>
            </div>
          </div>

          <div className="card">
            <div className="st" style={{fontSize:17,marginBottom:16}}>Contact Information</div>
            <div className="fg">
              <label className="fl">Business Email</label>
              <input className="fi" type="email" placeholder="photos@yourstudio.com" value={form.email} onChange={e=>f("email",e.target.value)}/>
            </div>
            <div className="fg">
              <label className="fl">Phone Number</label>
              <input className="fi" placeholder="+1 (555) 000-0000" value={form.phone} onChange={e=>f("phone",e.target.value)}/>
            </div>
            <div className="fg">
              <label className="fl">Website</label>
              <input className="fi" placeholder="www.yourstudio.com" value={form.website} onChange={e=>f("website",e.target.value)}/>
            </div>
            <div className="fg" style={{marginBottom:0}}>
              <label className="fl">Business Address</label>
              <input className="fi" placeholder="123 Main St, City, State 12345" value={form.address} onChange={e=>f("address",e.target.value)}/>
            </div>
          </div>

          <div className="card">
            <div className="st" style={{fontSize:17,marginBottom:16}}>Invoice Footer Message</div>
            <div className="fg" style={{marginBottom:0}}>
              <label className="fl">Custom Note (appears at bottom of every invoice)</label>
              <textarea className="fi" rows={3} placeholder="e.g. Thank you for choosing Webb Vision Photography! All sales final." value={form.invoiceNote} onChange={e=>f("invoiceNote",e.target.value)} style={{resize:"vertical"}}/>
            </div>
          </div>

          <button className="btn bg" style={{width:"100%",justifyContent:"center",padding:12,fontSize:14}} onClick={save}>
            {saved ? "✓ Branding Saved!" : "Save Branding"}
          </button>

          {saved && (
            <div style={{background:"rgba(76,175,130,0.08)",border:"1px solid rgba(76,175,130,0.25)",borderRadius:8,padding:"10px 14px",fontSize:13,color:"var(--green)",textAlign:"center"}}>
              ✅ All future invoices will show <strong>{form.businessName||"your business name"}</strong>
            </div>
          )}
        </div>

        {/* RIGHT — Live Preview */}
        <div>
          <div style={{fontSize:11,color:"var(--muted)",textTransform:"uppercase",letterSpacing:"1px",marginBottom:10}}>Live Invoice Preview</div>
          <div style={{transform:"scale(0.85)",transformOrigin:"top left",width:"118%"}}>
            <InvDoc inv={previewInv} project={previewProject} onPay={null} brand={previewBrand}/>
          </div>
          <div style={{fontSize:11,color:"var(--muted)",marginTop:8,textAlign:"center"}}>
            ↑ This is exactly how your invoice will look to clients
          </div>
        </div>
      </div>
    </div>
  );
}

// ── STRIPE SETTINGS PAGE ──────────────────────────────────────────────────────
function StripeSettings({stripeKey, setStripeKey}) {
  const [pk, setPk] = useState(stripeKey || "");
  const [saved, setSaved] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const isLive = pk.startsWith("pk_live_");
  const isTest = pk.startsWith("pk_test_");
  const isValid = isLive || isTest;

  const save = () => {
    setStripeKey(pk.trim());
    saveStripeConfig({ publishableKey: pk.trim() });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
    stripePromise = null;
  };

  const subs = [
    { name:"Starter", id:"price_starter_monthly", amount: 29 },
    { name:"Pro",     id:"price_pro_monthly",     amount: 59 },
    { name:"Studio",  id:"price_studio_monthly",  amount: 119 },
  ];

  return (
    <div className="page fi-anim" style={{maxWidth:740}}>
      <div className="ph">
        <h2 className="pt">Stripe <em>Payments</em></h2>
        <p className="ps">Connect Stripe to collect real payments — client invoices and studio subscriptions</p>
      </div>

      {/* Status */}
      <div style={{background:isLive?"rgba(76,175,130,0.07)":isTest?"rgba(201,168,76,0.07)":"rgba(91,141,217,0.07)",border:`1px solid ${isLive?"rgba(76,175,130,0.25)":isTest?"rgba(201,168,76,0.25)":"rgba(91,141,217,0.25)"}`,borderRadius:10,padding:"14px 18px",marginBottom:22,display:"flex",alignItems:"center",gap:14}}>
        <div style={{fontSize:26}}>{isLive?"✅":isTest?"🟡":"⚪"}</div>
        <div>
          <div className="fw" style={{fontSize:14,color:isLive?"var(--green)":isTest?"var(--gold)":"var(--muted)"}}>
            {isLive?"Live Mode — Real payments enabled":isTest?"Test Mode — No real charges":"Not Configured — Demo mode active"}
          </div>
          <div className="tx tm" style={{marginTop:2}}>
            {isLive?"Clients are charged real money. Payouts deposit to your Stripe bank account.":isTest?"Use card 4242 4242 4242 4242 · Exp 12/34 · CVC 123 to test.":"Add your Stripe Publishable Key below to enable payments."}
          </div>
        </div>
      </div>

      {/* Key input */}
      <div className="card" style={{marginBottom:16}}>
        <div className="st" style={{fontSize:17}}>API Keys</div>
        <div style={{fontSize:13,color:"var(--muted)",marginBottom:14,lineHeight:1.8}}>
          Get your key at <strong style={{color:"var(--gold)"}}>dashboard.stripe.com → Developers → API Keys</strong>.<br/>
          Copy your <strong style={{color:"var(--text)"}}>Publishable Key</strong> — starts with <code style={{color:"var(--blue)",fontSize:11}}>pk_live_</code> or <code style={{color:"var(--gold)",fontSize:11}}>pk_test_</code>
        </div>
        <div className="fg">
          <label className="fl">Publishable Key (safe for browser)</label>
          <div style={{position:"relative"}}>
            <input className="fi" type={showKey?"text":"password"} placeholder="pk_live_xxxxxxxxxxxxxxxxxxxx" value={pk} onChange={e=>{setPk(e.target.value);setSaved(false);}} style={{paddingRight:80,fontFamily:pk?"monospace":"var(--fb)",fontSize:pk?11:13}}/>
            <button onClick={()=>setShowKey(s=>!s)} style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",background:"transparent",border:"none",cursor:"pointer",color:"var(--muted)",fontSize:12}}>{showKey?"Hide":"Show"}</button>
          </div>
          {pk&&!isValid&&<div style={{fontSize:11,color:"var(--red)",marginTop:5}}>⚠ Must start with pk_live_ or pk_test_</div>}
          {isTest&&<div style={{fontSize:11,color:"var(--gold)",marginTop:5}}>🟡 Test key — switch to pk_live_ when ready for real payments</div>}
          {isLive&&<div style={{fontSize:11,color:"var(--green)",marginTop:5}}>✅ Live key — real cards will be charged</div>}
        </div>
        <div style={{fontSize:11,color:"var(--red)",background:"rgba(224,112,112,0.07)",border:"1px solid rgba(224,112,112,0.2)",borderRadius:7,padding:"9px 12px",marginBottom:14}}>
          🔴 <strong>Never</strong> paste your Secret Key (sk_...) here. Secret keys must stay server-side only.
        </div>
        <div className="row" style={{gap:8}}>
          <button className="btn bg" onClick={save} disabled={pk.length>0&&!isValid}>{saved?"✓ Saved & Active!":"Save Stripe Key"}</button>
          {stripeKey&&<button className="btn btn-del bs" onClick={()=>{setStripeKey("");setPk("");saveStripeConfig({});stripePromise=null;}}>Remove</button>}
        </div>
      </div>

      {/* Backend required */}
      <div className="card" style={{marginBottom:16,borderColor:"rgba(201,168,76,0.2)"}}>
        <div className="st" style={{fontSize:17}}>⚠️ Backend Endpoint Required</div>
        <div style={{fontSize:13,color:"var(--muted)",marginBottom:14,lineHeight:1.8}}>
          The Stripe card form runs in the browser, but to actually charge cards you need one server-side endpoint. Deploy this to Vercel, Supabase Edge Functions, or any Node server:
        </div>
        <div style={{background:"#080810",border:"1px solid rgba(255,255,255,0.08)",borderRadius:8,padding:"14px 16px",fontFamily:"monospace",fontSize:12,color:"#a0c4ff",lineHeight:2,overflowX:"auto"}}>
          <div style={{color:"#6a737d"}}>{"// POST /api/create-payment-intent"}</div>
          <div><span style={{color:"#c792ea"}}>const</span> stripe = <span style={{color:"#c792ea"}}>require</span>(<span style={{color:"#c3e88d"}}>'stripe'</span>)(process.env.STRIPE_SECRET_KEY);</div>
          <div style={{marginTop:4}}><span style={{color:"#c792ea"}}>const</span> intent = <span style={{color:"#c792ea"}}>await</span> stripe.paymentIntents.create{"({"}</div>
          <div style={{paddingLeft:18}}>amount: req.body.amountCents, <span style={{color:"#6a737d"}}>{"// e.g. 21500 = $215.00"}</span></div>
          <div style={{paddingLeft:18}}>currency: <span style={{color:"#c3e88d"}}>'usd'</span>,</div>
          <div style={{paddingLeft:18}}>payment_method: req.body.paymentMethodId,</div>
          <div style={{paddingLeft:18}}>confirm: <span style={{color:"#f78c6c"}}>true</span>,</div>
          <div style={{paddingLeft:18}}>metadata: {"{ invoiceNumber: req.body.invoiceNumber }"}</div>
          <div>{"});"}</div>
          <div style={{color:"#6a737d",marginTop:4}}>{"// res.json({ clientSecret: intent.client_secret })"}</div>
        </div>
      </div>

      {/* Subscription products */}
      <div className="card" style={{marginBottom:16}}>
        <div className="st" style={{fontSize:17}}>Subscription Products</div>
        <div style={{fontSize:13,color:"var(--muted)",marginBottom:14,lineHeight:1.8}}>Create these in <strong style={{color:"var(--gold)"}}>Stripe → Products</strong> so studio owners can subscribe to your SaaS plans:</div>
        {subs.map(p=>(
          <div key={p.name} style={{display:"flex",alignItems:"center",gap:14,background:"var(--surface2)",border:"1px solid var(--border)",borderRadius:8,padding:"11px 14px",marginBottom:8}}>
            <div style={{flex:1}}><div className="fw" style={{fontSize:13}}>{p.name} Plan · ${p.amount}/mo</div></div>
            <div style={{fontFamily:"monospace",fontSize:11,color:"var(--blue)",background:"rgba(91,141,217,0.1)",border:"1px solid rgba(91,141,217,0.2)",borderRadius:4,padding:"2px 8px"}}>{p.id}</div>
          </div>
        ))}
      </div>

      {/* Webhook */}
      <div className="card">
        <div className="st" style={{fontSize:17}}>Webhook Endpoint</div>
        <div style={{fontSize:13,color:"var(--muted)",marginBottom:12,lineHeight:1.8}}>Add in <strong style={{color:"var(--gold)"}}>Stripe → Developers → Webhooks</strong> to auto-unlock media on payment, cancel subscriptions, etc.</div>
        <div style={{background:"var(--surface2)",border:"1px solid var(--border)",borderRadius:8,padding:"11px 14px",fontFamily:"monospace",fontSize:13,color:"var(--blue)",display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,marginBottom:10}}>
          <span>https://yourdomain.com/api/stripe-webhook</span>
          <button className="btn bgh bs" style={{fontSize:11,fontFamily:"var(--fb)"}} onClick={()=>navigator.clipboard?.writeText("https://yourdomain.com/api/stripe-webhook")}>Copy</button>
        </div>
        <div style={{fontSize:12,color:"var(--muted)"}}>
          Events to listen for: <code style={{color:"var(--gold)",fontSize:11}}>payment_intent.succeeded</code> · <code style={{color:"var(--gold)",fontSize:11}}>invoice.paid</code> · <code style={{color:"var(--gold)",fontSize:11}}>customer.subscription.deleted</code>
        </div>
      </div>
    </div>
  );
}

// ── HELPERS ───────────────────────────────────────────────────────────────────
const daysSince = dateStr => {
  if (!dateStr) return 0;
  return Math.floor((Date.now() - new Date(dateStr+"T12:00:00").getTime()) / 86400000);
};
const isOverdue7  = inv => inv && !inv.paid && daysSince(inv.issuedDate) >= 7;
const isOverdue30 = inv => inv && !inv.paid && daysSince(inv.issuedDate) >= 30;

// ── CASH PAYMENT MODAL ────────────────────────────────────────────────────────
function CashPaymentModal({ project, onClose, onConfirm }) {
  const [amount,  setAmount]  = useState(String(project.invoice?.total || project.price));
  const [note,    setNote]    = useState("");
  const [method,  setMethod]  = useState("cash");
  const [date,    setDate]    = useState(new Date().toISOString().split("T")[0]);

  const confirm = () => {
    if (!amount) return;
    onConfirm({ method, amount: parseFloat(amount), note, date });
    onClose();
  };

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200,backdropFilter:"blur(4px)"}}
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:16,padding:28,width:"min(440px,94vw)",fontFamily:"var(--fb)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <span style={{fontFamily:"var(--fd)",fontSize:22,fontWeight:300}}>Record Payment</span>
          <button onClick={onClose} style={{background:"transparent",border:"1px solid var(--border)",borderRadius:8,padding:"5px 10px",color:"var(--muted)",cursor:"pointer",fontSize:13}}>✕</button>
        </div>

        <div style={{background:"rgba(76,175,130,0.07)",border:"1px solid rgba(76,175,130,0.2)",borderRadius:8,padding:"10px 14px",marginBottom:18,fontSize:13}}>
          <div style={{display:"flex",justifyContent:"space-between"}}><span style={{color:"var(--muted)"}}>Client</span><span>{project.client}</span></div>
          <div style={{display:"flex",justifyContent:"space-between",marginTop:4}}><span style={{color:"var(--muted)"}}>Project</span><span style={{fontSize:12}}>{project.property}</span></div>
          <div style={{height:1,background:"var(--border)",margin:"8px 0"}}/>
          <div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontWeight:500}}>Invoice Total</span><span style={{fontFamily:"var(--fd)",fontSize:18,color:"var(--gold)"}}>{fmt(project.invoice?.total||project.price)}</span></div>
        </div>

        <div style={{marginBottom:12}}>
          <label style={{fontSize:11,color:"var(--muted)",textTransform:"uppercase",letterSpacing:"1px",display:"block",marginBottom:5}}>Payment Method</label>
          <div style={{display:"flex",gap:8}}>
            {["cash","check","venmo","other"].map(m=>(
              <div key={m} onClick={()=>setMethod(m)}
                style={{flex:1,padding:"8px 4px",border:`1px solid ${method===m?"var(--green)":"var(--border)"}`,borderRadius:7,textAlign:"center",cursor:"pointer",fontSize:11,color:method===m?"var(--green)":"var(--muted)",background:method===m?"rgba(76,175,130,0.08)":"transparent",transition:"all .15s",textTransform:"capitalize"}}>
                {m==="cash"?"💵":m==="check"?"📄":m==="venmo"?"📱":"💰"} {m}
              </div>
            ))}
          </div>
        </div>

        <div style={{marginBottom:12}}>
          <label style={{fontSize:11,color:"var(--muted)",textTransform:"uppercase",letterSpacing:"1px",display:"block",marginBottom:5}}>Amount Received ($)</label>
          <input value={amount} onChange={e=>setAmount(e.target.value)} type="number"
            style={{width:"100%",background:"var(--surface2)",border:"1px solid var(--border)",borderRadius:8,padding:"9px 13px",fontSize:15,color:"var(--text)",fontFamily:"var(--fb)",outline:"none",fontWeight:500}}/>
        </div>

        <div style={{marginBottom:12}}>
          <label style={{fontSize:11,color:"var(--muted)",textTransform:"uppercase",letterSpacing:"1px",display:"block",marginBottom:5}}>Date Received</label>
          <input value={date} onChange={e=>setDate(e.target.value)} type="date"
            style={{width:"100%",background:"var(--surface2)",border:"1px solid var(--border)",borderRadius:8,padding:"9px 13px",fontSize:13,color:"var(--text)",fontFamily:"var(--fb)",outline:"none"}}/>
        </div>

        <div style={{marginBottom:18}}>
          <label style={{fontSize:11,color:"var(--muted)",textTransform:"uppercase",letterSpacing:"1px",display:"block",marginBottom:5}}>Note (optional)</label>
          <input value={note} onChange={e=>setNote(e.target.value)} placeholder="e.g. Paid in full at session" maxLength={100}
            style={{width:"100%",background:"var(--surface2)",border:"1px solid var(--border)",borderRadius:8,padding:"9px 13px",fontSize:13,color:"var(--text)",fontFamily:"var(--fb)",outline:"none"}}/>
        </div>

        <button onClick={confirm}
          style={{width:"100%",padding:"12px",background:"linear-gradient(135deg,#4caf82,#6dcfa0)",border:"none",borderRadius:8,color:"#fff",fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:"var(--fb)"}}>
          ✓ Confirm {method.charAt(0).toUpperCase()+method.slice(1)} Payment of {amount?fmt(parseFloat(amount)||0):"$0"}
        </button>
        <div style={{textAlign:"center",marginTop:10,fontSize:11,color:"var(--muted)"}}>This will mark the invoice as paid and unlock the client's media gallery</div>
      </div>
    </div>
  );
}

// ── AUTO REMINDERS PANEL ──────────────────────────────────────────────────────
function RemindersPanel({ projects, onUpdate }) {
  const [sent,     setSent]     = useState({});
  const [showLock, setShowLock] = useState(null);

  const overdue7  = projects.filter(p=>p.invoice&&!p.invoice.paid&&isOverdue7(p.invoice));
  const overdue30 = projects.filter(p=>p.invoice&&!p.invoice.paid&&isOverdue30(p.invoice));

  const sendReminder = (p) => {
    const days = daysSince(p.invoice.issuedDate);
    const msg = `Hi ${p.client.split(" ")[0]}, this is a reminder that invoice ${p.invoice.number} for ${fmt(p.invoice.total)} (${p.property}) is ${days} days past due. Please pay to retain access to your media gallery and future booking privileges. Pay here: [your payment link]. Thank you! — ${p.client}`;
    const updated = { ...p, messages: [...(p.messages||[]), { id:Date.now(), sender:"Elev8 Studios", avatar:"E8", text:`📧 Auto-reminder sent: "${msg.slice(0,80)}…"`, time:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}), mine:true, isSystem:true }] };
    onUpdate(updated);
    setSent(s=>({...s,[p.id]:true}));
  };

  const sendAllReminders = () => overdue7.forEach(p=>!sent[p.id]&&sendReminder(p));

  const lockClient = (p) => {
    const updated = { ...p, bookingLocked:true, lockReason:"Outstanding invoice over 30 days" };
    onUpdate(updated);
    setShowLock(null);
  };

  return (
    <div className="page fi-anim" style={{maxWidth:800}}>
      {showLock && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200}}>
          <div style={{background:"var(--surface)",border:"1px solid rgba(224,112,112,0.3)",borderRadius:14,padding:28,width:"min(400px,92vw)"}}>
            <div style={{fontFamily:"var(--fd)",fontSize:20,fontWeight:300,marginBottom:10}}>Lock New Bookings?</div>
            <p style={{fontSize:13,color:"var(--muted)",marginBottom:18,lineHeight:1.7}}>This will prevent <strong style={{color:"var(--text)"}}>{showLock.client}</strong> from submitting new booking requests until their outstanding invoice of <strong style={{color:"var(--red)"}}>{fmt(showLock.invoice?.total)}</strong> is paid.</p>
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>setShowLock(null)} style={{flex:1,padding:"10px",background:"transparent",border:"1px solid var(--border)",borderRadius:8,color:"var(--muted)",cursor:"pointer",fontSize:13}}>Cancel</button>
              <button onClick={()=>lockClient(showLock)} style={{flex:2,padding:"10px",background:"rgba(224,112,112,0.15)",border:"1px solid rgba(224,112,112,0.3)",borderRadius:8,color:"var(--red)",cursor:"pointer",fontSize:13,fontWeight:600}}>🔒 Lock Bookings</button>
            </div>
          </div>
        </div>
      )}

      <div className="ph">
        <h2 className="pt">Auto <em>Reminders</em></h2>
        <p className="ps">Manage overdue invoices, auto-messages, and booking locks</p>
      </div>

      {/* Settings info */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:24}}>
        {[
          {icon:"📧",title:"7-Day Reminder",desc:"Auto-message sent to clients with invoices 7+ days overdue",color:"var(--gold)"},
          {icon:"🔒",title:"30-Day Lock",desc:"Clients with 30+ day overdue invoices are blocked from new bookings",color:"var(--red)"},
        ].map(c=>(
          <div key={c.title} style={{background:"var(--surface)",border:`1px solid ${c.color}33`,borderRadius:10,padding:18}}>
            <div style={{fontSize:24,marginBottom:8}}>{c.icon}</div>
            <div style={{fontWeight:500,fontSize:14,marginBottom:4,color:c.color}}>{c.title}</div>
            <div style={{fontSize:12,color:"var(--muted)",lineHeight:1.7}}>{c.desc}</div>
          </div>
        ))}
      </div>

      {/* 7-day overdue */}
      {overdue7.length > 0 ? (
        <div style={{marginBottom:28}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
            <div style={{fontFamily:"var(--fd)",fontSize:18,fontWeight:300,color:"var(--gold)"}}>⚑ 7+ Days Overdue ({overdue7.length})</div>
            <button onClick={sendAllReminders} style={{background:"rgba(201,168,76,0.12)",border:"1px solid rgba(201,168,76,0.3)",borderRadius:8,padding:"7px 14px",color:"var(--gold)",cursor:"pointer",fontSize:12,fontWeight:600}}>
              📧 Send All Reminders
            </button>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {overdue7.map(p=>(
              <div key={p.id} style={{background:"var(--surface)",border:"1px solid rgba(201,168,76,0.2)",borderRadius:10,padding:"16px 18px"}}>
                <div style={{display:"flex",alignItems:"center",gap:14}}>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:500,marginBottom:3}}>{p.client}</div>
                    <div style={{fontSize:12,color:"var(--muted)"}}>{p.property} · Invoice {p.invoice.number}</div>
                    <div style={{fontSize:11,marginTop:4,color:"var(--gold)"}}>⏱ {daysSince(p.invoice.issuedDate)} days overdue · {fmt(p.invoice.total)} outstanding</div>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:6,alignItems:"flex-end"}}>
                    {sent[p.id]
                      ? <span style={{fontSize:12,color:"var(--green)"}}>✓ Reminder sent</span>
                      : <button onClick={()=>sendReminder(p)} style={{background:"rgba(201,168,76,0.1)",border:"1px solid rgba(201,168,76,0.3)",borderRadius:7,padding:"6px 12px",color:"var(--gold)",cursor:"pointer",fontSize:12,fontWeight:600}}>📧 Send Reminder</button>
                    }
                    {isOverdue30(p.invoice) && (
                      <button onClick={()=>setShowLock(p)} style={{background:"rgba(224,112,112,0.1)",border:"1px solid rgba(224,112,112,0.25)",borderRadius:7,padding:"6px 12px",color:"var(--red)",cursor:"pointer",fontSize:12}}>
                        {p.bookingLocked?"🔒 Locked":"🔒 Lock Bookings"}
                      </button>
                    )}
                  </div>
                </div>
                {/* Reminder message preview */}
                <div style={{marginTop:12,background:"var(--surface2)",border:"1px solid var(--border)",borderRadius:7,padding:"10px 12px",fontSize:12,color:"var(--muted)",lineHeight:1.7}}>
                  <strong style={{color:"var(--text)"}}>Auto-message preview:</strong> Hi {p.client.split(" ")[0]}, invoice {p.invoice.number} for {fmt(p.invoice.total)} ({p.property}) is {daysSince(p.invoice.issuedDate)} days past due. Please pay to retain access to your gallery and future booking privileges.
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{background:"rgba(76,175,130,0.06)",border:"1px solid rgba(76,175,130,0.2)",borderRadius:10,padding:"28px",textAlign:"center",marginBottom:24}}>
          <div style={{fontSize:28,marginBottom:8}}>✅</div>
          <div style={{fontWeight:500,marginBottom:4,color:"var(--green)"}}>No overdue invoices</div>
          <div style={{fontSize:12,color:"var(--muted)"}}>All invoices are within the 7-day window</div>
        </div>
      )}

      {/* 30-day locked clients */}
      {overdue30.length > 0 && (
        <div>
          <div style={{fontFamily:"var(--fd)",fontSize:18,fontWeight:300,color:"var(--red)",marginBottom:14}}>🔒 30+ Days Overdue — Eligible for Booking Lock</div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {overdue30.map(p=>(
              <div key={p.id} style={{background:"var(--surface)",border:"1px solid rgba(224,112,112,0.25)",borderRadius:10,padding:"16px 18px",display:"flex",alignItems:"center",gap:14}}>
                <div style={{flex:1}}>
                  <div style={{fontWeight:500,marginBottom:3}}>{p.client}</div>
                  <div style={{fontSize:12,color:"var(--muted)"}}>{p.property} · {daysSince(p.invoice.issuedDate)} days overdue</div>
                  {p.bookingLocked && <div style={{fontSize:11,color:"var(--red)",marginTop:4}}>🔒 Booking locked</div>}
                </div>
                <div style={{fontFamily:"var(--fd)",fontSize:18,color:"var(--gold)"}}>{fmt(p.invoice.total)}</div>
                {!p.bookingLocked
                  ? <button onClick={()=>setShowLock(p)} style={{background:"rgba(224,112,112,0.1)",border:"1px solid rgba(224,112,112,0.3)",borderRadius:7,padding:"7px 12px",color:"var(--red)",cursor:"pointer",fontSize:12,fontWeight:600}}>🔒 Lock Now</button>
                  : <button onClick={()=>onUpdate({...p,bookingLocked:false,lockReason:""})} style={{background:"rgba(76,175,130,0.1)",border:"1px solid rgba(76,175,130,0.3)",borderRadius:7,padding:"7px 12px",color:"var(--green)",cursor:"pointer",fontSize:12}}>🔓 Unlock</button>
                }
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── MONTHLY STATEMENTS ────────────────────────────────────────────────────────
function MonthlyStatements({ projects, clients }) {
  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const [selMonth, setSelMonth] = useState(2); // March
  const [selYear,  setSelYear]  = useState(2026);
  const [selClient,setSelClient]= useState("all");

  const inMonth = p => {
    if (!p.invoice) return false;
    const d = new Date(p.invoice.issuedDate+"T12:00:00");
    return d.getMonth()===selMonth && d.getFullYear()===selYear;
  };

  const filtered = projects.filter(p=>inMonth(p) && (selClient==="all"||p.clientId===selClient));
  const paid      = filtered.filter(p=>p.invoice?.paid);
  const unpaid    = filtered.filter(p=>p.invoice&&!p.invoice.paid);
  const totalPaid = paid.reduce((s,p)=>s+(p.invoice?.total||0),0);
  const totalOwed = unpaid.reduce((s,p)=>s+(p.invoice?.total||0),0);
  const cashPaid  = paid.filter(p=>p.invoice?.paymentMethod==="cash"||p.invoice?.paymentMethod==="check");
  const digitalPaid=paid.filter(p=>!p.invoice?.paymentMethod||p.invoice?.paymentMethod==="card"||p.invoice?.paymentMethod==="zelle");

  const printStatement = () => window.print();

  return (
    <div className="page fi-anim" style={{maxWidth:900}}>
      <div className="ph">
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:12}}>
          <div><h2 className="pt">Monthly <em>Statements</em></h2><p className="ps">Client activity and payment status by month</p></div>
          <button onClick={printStatement} style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:8,padding:"8px 16px",color:"var(--muted)",cursor:"pointer",fontSize:13,display:"flex",alignItems:"center",gap:7}}>🖨 Print Statement</button>
        </div>
      </div>

      {/* Filters */}
      <div style={{display:"flex",gap:10,marginBottom:22,flexWrap:"wrap"}}>
        <div style={{display:"flex",gap:6,alignItems:"center"}}>
          <select value={selMonth} onChange={e=>setSelMonth(Number(e.target.value))}
            style={{background:"var(--surface2)",border:"1px solid var(--border)",borderRadius:8,padding:"8px 12px",color:"var(--text)",fontSize:13,fontFamily:"var(--fb)",outline:"none",cursor:"pointer"}}>
            {months.map((m,i)=><option key={i} value={i}>{m}</option>)}
          </select>
          <select value={selYear} onChange={e=>setSelYear(Number(e.target.value))}
            style={{background:"var(--surface2)",border:"1px solid var(--border)",borderRadius:8,padding:"8px 12px",color:"var(--text)",fontSize:13,fontFamily:"var(--fb)",outline:"none",cursor:"pointer"}}>
            {[2025,2026,2027].map(y=><option key={y}>{y}</option>)}
          </select>
        </div>
        <select value={selClient} onChange={e=>setSelClient(e.target.value)}
          style={{background:"var(--surface2)",border:"1px solid var(--border)",borderRadius:8,padding:"8px 12px",color:"var(--text)",fontSize:13,fontFamily:"var(--fb)",outline:"none",cursor:"pointer",flex:1,minWidth:160}}>
          <option value="all">All Clients</option>
          {clients.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {/* Summary stats */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:13,marginBottom:22}}>
        {[
          {label:"Total Invoiced", value:fmt(totalPaid+totalOwed), color:"var(--gold)"},
          {label:"Collected",      value:fmt(totalPaid),           color:"var(--green)"},
          {label:"Outstanding",    value:fmt(totalOwed),           color:totalOwed>0?"var(--red)":"var(--muted)"},
          {label:"Invoices Sent",  value:filtered.length,          color:"var(--text)"},
        ].map(s=>(
          <div key={s.label} style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:10,padding:16}}>
            <div style={{fontSize:10,color:"var(--muted)",textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:7}}>{s.label}</div>
            <div style={{fontFamily:"var(--fd)",fontSize:26,fontWeight:300,color:s.color,lineHeight:1}}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Payment method breakdown */}
      {paid.length > 0 && (
        <div style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:10,padding:18,marginBottom:22}}>
          <div style={{fontWeight:500,marginBottom:14,fontSize:14}}>Payment Method Breakdown</div>
          <div style={{display:"flex",gap:16,flexWrap:"wrap"}}>
            {[
              {label:"Card / Zelle / Digital", count:digitalPaid.length, total:digitalPaid.reduce((s,p)=>s+(p.invoice?.total||0),0), color:"var(--blue)"},
              {label:"Cash / Check / In-Person", count:cashPaid.length, total:cashPaid.reduce((s,p)=>s+(p.invoice?.total||0),0), color:"var(--green)"},
            ].map(m=>(
              <div key={m.label} style={{flex:1,minWidth:160,background:"var(--surface2)",borderRadius:8,padding:"12px 14px",border:`1px solid ${m.color}33`}}>
                <div style={{fontSize:11,color:"var(--muted)",marginBottom:4}}>{m.label}</div>
                <div style={{fontFamily:"var(--fd)",fontSize:22,color:m.color}}>{fmt(m.total)}</div>
                <div style={{fontSize:11,color:"var(--muted)",marginTop:2}}>{m.count} payment{m.count!==1?"s":""}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detailed table */}
      {filtered.length === 0 ? (
        <div style={{textAlign:"center",padding:"44px",background:"var(--surface)",borderRadius:10,border:"1px solid var(--border)"}}>
          <div style={{fontSize:32,marginBottom:10}}>📋</div>
          <div style={{fontWeight:500,marginBottom:6}}>No invoices for {months[selMonth]} {selYear}</div>
          <div style={{fontSize:12,color:"var(--muted)"}}>Try selecting a different month or client</div>
        </div>
      ) : (
        <div style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:10,overflow:"hidden"}}>
          <div style={{display:"grid",gridTemplateColumns:"2fr 1.5fr 1fr 1fr 1fr",gap:0,padding:"10px 18px",background:"var(--surface2)",borderBottom:"1px solid var(--border)"}}>
            {["Client / Project","Invoice #","Amount","Method","Status"].map(h=>(
              <div key={h} style={{fontSize:10,color:"var(--muted)",textTransform:"uppercase",letterSpacing:"1px"}}>{h}</div>
            ))}
          </div>
          {filtered.map((p,i)=>(
            <div key={p.id} style={{display:"grid",gridTemplateColumns:"2fr 1.5fr 1fr 1fr 1fr",gap:0,padding:"13px 18px",borderBottom:i<filtered.length-1?"1px solid var(--border)":"none",alignItems:"center"}}>
              <div>
                <div style={{fontSize:13,fontWeight:500}}>{p.client}</div>
                <div style={{fontSize:11,color:"var(--muted)",marginTop:2}}>{p.property}</div>
              </div>
              <div style={{fontSize:12,color:"var(--muted)"}}>{p.invoice?.number}</div>
              <div style={{fontFamily:"var(--fd)",fontSize:16,color:"var(--gold)"}}>{fmt(p.invoice?.total)}</div>
              <div style={{fontSize:11,color:"var(--muted)",textTransform:"capitalize"}}>{p.invoice?.paymentMethod||"—"}</div>
              <div>
                {p.invoice?.paid
                  ? <span style={{fontSize:11,color:"var(--green)",background:"rgba(76,175,130,0.1)",border:"1px solid rgba(76,175,130,0.25)",borderRadius:4,padding:"2px 8px"}}>✓ Paid {fmtD(p.invoice.paidDate)}</span>
                  : <span style={{fontSize:11,color:"var(--red)",background:"rgba(224,112,112,0.1)",border:"1px solid rgba(224,112,112,0.25)",borderRadius:4,padding:"2px 8px"}}>⚑ Overdue {daysSince(p.invoice?.issuedDate)}d</span>
                }
              </div>
            </div>
          ))}
          {/* Totals row */}
          <div style={{display:"grid",gridTemplateColumns:"2fr 1.5fr 1fr 1fr 1fr",gap:0,padding:"13px 18px",background:"var(--surface2)",borderTop:"1px solid var(--border)"}}>
            <div style={{fontWeight:600,fontSize:13}}>TOTALS</div>
            <div style={{fontSize:11,color:"var(--muted)"}}>{filtered.length} invoices</div>
            <div style={{fontFamily:"var(--fd)",fontSize:16,color:"var(--gold)"}}>{fmt(totalPaid+totalOwed)}</div>
            <div/>
            <div style={{fontSize:11}}>
              <span style={{color:"var(--green)"}}>{fmt(totalPaid)} paid</span>
              {totalOwed>0&&<span style={{color:"var(--red)",marginLeft:8}}>{fmt(totalOwed)} owed</span>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── STUDIO APP ─────────────────────────────────────────────────────────────────
function StudioApp({user,onLogout,services,setServices}) {
  const [projects,setProjects]=useState([]);
  const [clients,setClients]=useState([]);
  const [nav,setNav]=useState("dashboard");
  const [selId,setSelId]=useState(null);
  const [showBook,setShowBook]=useState(false);
  const [menuOpen,setMenuOpen]=useState(false);
  const [stripeKey,setStripeKey]=useState(()=>loadStripeConfig().publishableKey||"");
  const [brand,setBrand]=useState(()=>loadBranding());
  const [cashModal,setCashModal]=useState(null); // project to record cash payment for

  const sel=projects.find(p=>p.id===selId);
  const update=u=>setProjects(ps=>ps.map(p=>p.id===u.id?u:p));
  const create=d=>setProjects(ps=>[...ps,{...d,id:Date.now()}]);
  const open=id=>{setSelId(id);setNav("detail");};
  const unpaid=projects.filter(p=>p.invoice&&!p.invoice.paid).length;
  const overdue7Count=projects.filter(p=>p.invoice&&!p.invoice.paid&&isOverdue7(p.invoice)).length;
  const closeMenu=()=>setMenuOpen(false);
  const navigate=id=>{setNav(id);setSelId(null);closeMenu();};
  const initials=user.name.split(" ").map(n=>n[0]).join("").slice(0,2).toUpperCase();
  const stripeActive = stripeKey && (stripeKey.startsWith("pk_live_")||stripeKey.startsWith("pk_test_"));

  // Record cash/offline payment
  const handleCashPayment = (project, {method, amount, note, date}) => {
    const updatedInv = { ...project.invoice, paid:true, paidDate:date, paymentMethod:method, paymentNote:note, cashAmount:amount };
    update({ ...project, invoice:updatedInv });
    setCashModal(null);
  };

  const navItems=[
    {id:"dashboard", icon:"⬡", label:"Dashboard"},
    {id:"projects",  icon:"◫", label:"Projects"},
    {id:"invoices",  icon:"📋", label:"Invoices",   badge:unpaid},
    {id:"reminders", icon:"🔔", label:"Reminders",  badge:overdue7Count, badgeColor:"var(--gold)"},
    {id:"statements",icon:"📊", label:"Statements"},
    {id:"schedule",  icon:"◷", label:"Schedule"},
    {id:"media",     icon:"◈", label:"Media"},
    {id:"services",  icon:"⚙", label:"Services"},
    {id:"clients",   icon:"👥", label:"Clients"},
    {id:"branding",  icon:"🎨", label:"Branding",   badge:brand.businessName?0:1, badgeColor:"var(--purple)"},
    {id:"stripe",    icon:"💳", label:"Stripe",      badge:stripeActive?0:1, badgeColor:"var(--blue)"},
  ];

  // Dashboard
  const collected=projects.filter(p=>p.invoice?.paid).reduce((s,p)=>s+p.invoice.total,0);
  const outstanding=projects.filter(p=>p.invoice&&!p.invoice.paid).reduce((s,p)=>s+p.invoice.total,0);

  return (
    <>
      <style>{BASE_CSS}</style>
      <div className="app">
        {showBook&&<NewBookingModal services={services} clients={clients} onClose={()=>setShowBook(false)} onCreate={d=>{create(d);setShowBook(false);}}/>}
        {cashModal&&<CashPaymentModal project={cashModal} onClose={()=>setCashModal(null)} onConfirm={(data)=>handleCashPayment(cashModal,data)}/>}
        <nav className="topnav">
          <button className={`hbtn ${menuOpen?"open":""}`} onClick={()=>setMenuOpen(o=>!o)}><div className="hbar"/><div className="hbar"/><div className="hbar"/></button>
          <div className="sb-logo"><h1>ELEV8</h1><p>Studios</p></div>
          <div className="nav-pills">
            {navItems.map(n=><div key={n.id} className={`npill ${nav===n.id?"active":""}`} onClick={()=>navigate(n.id)}>
              <span>{n.icon}</span>{n.label}
              {n.badge>0&&<span style={{background:n.badgeColor||"var(--red)",color:"#fff",fontSize:10,fontWeight:600,padding:"1px 6px",borderRadius:10}}>{n.badge}</span>}
            </div>)}
          </div>
          <div className="sb-foot" style={{marginLeft:"auto"}}>
            <div style={{textAlign:"right",marginRight:2}}><div className="fw" style={{fontSize:12}}>{user.studio||user.name}</div><div className="tx tm" style={{cursor:"pointer",color:"var(--gold)",fontSize:10}} onClick={onLogout}>← Sign Out</div></div>
            <div className="av" style={{width:30,height:30,fontSize:11,background:"linear-gradient(135deg,#c9a84c,#5b8dd9)"}}>{initials}</div>
          </div>
          <div className={`dropmenu ${menuOpen?"open":""}`}>
            {navItems.map(n=><div key={n.id} className={`ni ${nav===n.id?"active":""}`} onClick={()=>navigate(n.id)}><span style={{width:20,textAlign:"center"}}>{n.icon}</span>{n.label}{n.badge>0&&<span style={{marginLeft:"auto",background:n.badgeColor||"var(--red)",color:"#fff",fontSize:10,fontWeight:600,padding:"1px 6px",borderRadius:10}}>{n.badge}</span>}</div>)}
            <div className="dv" style={{margin:"8px 16px"}}/>
            <div className="ni" onClick={onLogout} style={{color:"var(--muted)"}}><span style={{width:20,textAlign:"center"}}>←</span>Sign Out</div>
          </div>
        </nav>
        <div className={`menu-overlay ${menuOpen?"open":""}`} onClick={closeMenu}/>

        <main className="main">
          {nav==="dashboard"&&(
            <div className="page fi-anim">
              <div className="ph"><div className="rb"><div><h2 className="pt">Good morning, <em>{user.name.split(" ")[0]}</em></h2><p className="ps">Saturday, March 21 · Studio overview</p></div><button className="btn bg" onClick={()=>setShowBook(true)}>+ New Booking</button></div></div>
              {/* Stripe setup nudge */}
              {!stripeActive&&<div style={{display:"flex",alignItems:"center",gap:12,background:"rgba(91,141,217,0.07)",border:"1px solid rgba(91,141,217,0.22)",borderRadius:10,padding:"12px 16px",marginBottom:18,fontSize:13,cursor:"pointer"}} onClick={()=>navigate("stripe")}><span style={{fontSize:18}}>💳</span><div style={{flex:1}}><span className="fw" style={{color:"var(--blue)"}}>Connect Stripe to collect real payments</span><span className="tm ts" style={{marginLeft:8}}>— currently running in demo mode</span></div><span style={{color:"var(--blue)",fontSize:12}}>Set up →</span></div>}
              <div className="g4" style={{marginBottom:20}}>
                {[{label:"Revenue Collected",value:fmt(collected),color:"var(--gold)",sub:"Paid invoices"},{label:"Outstanding",value:fmt(outstanding),color:outstanding>0?"var(--red)":"var(--green)",sub:outstanding>0?"Awaiting payment":"All clear"},{label:"Active Projects",value:projects.filter(p=>["pending","shooting","editing"].includes(p.status)).length,color:"var(--gold)",sub:`${projects.filter(p=>p.status==="pending").length} pending`},{label:"Clients",value:clients.length,color:"var(--gold)",sub:"Registered"}].map(s=><div key={s.label} className="sc"><div className="sl">{s.label}</div><div className="sv" style={{color:s.color}}>{s.value}</div><div className="ss">{s.sub}</div></div>)}
              </div>
              {outstanding>0&&<div style={{display:"flex",alignItems:"center",gap:11,background:"rgba(224,112,112,0.06)",border:"1px solid rgba(224,112,112,0.18)",borderRadius:10,padding:"12px 16px",marginBottom:20,fontSize:13}}><span style={{fontSize:18}}>⚑</span><span className="fw" style={{color:"var(--red)"}}>{projects.filter(p=>p.invoice&&!p.invoice.paid).length} invoice(s) awaiting payment</span><span className="tm ts"> — media locked until paid</span></div>}
              <div className="g2" style={{gap:18}}>
                <div>
                  <div className="st">Active Projects</div>
                  <div style={{display:"flex",flexDirection:"column",gap:10}}>
                    {projects.filter(p=>p.status!=="delivered").map(p=><div key={p.id} className="pc" onClick={()=>open(p.id)}><div className="rb" style={{marginBottom:8}}><div><div className="ts tm mbm">{p.type}</div><div className="pn">{p.property}</div><div className="ts tm">{p.client}</div></div><SBadge s={p.status}/></div><PBar v={p.progress}/><div className="rb" style={{fontSize:11,color:"var(--muted)"}}><span>{p.progress}% complete</span>{p.invoice?<span style={{color:p.invoice.paid?"var(--green)":"var(--red)"}}>{p.invoice.paid?`✓ Paid ${fmt(p.invoice.total)}`:`⚑ ${fmt(p.invoice.total)}`}</span>:<span>{fmt(p.price)}</span>}</div></div>)}
                  </div>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:16}}>
                  <div className="card"><MiniCal projects={projects}/></div>
                  <div className="card"><div className="st" style={{marginBottom:13,fontSize:17}}>Upcoming Shoots</div><div className="tl">{projects.filter(p=>p.scheduledDate&&p.status!=="delivered").sort((a,b)=>a.scheduledDate.localeCompare(b.scheduledDate)).slice(0,4).map(p=><div key={p.id} className="tli" onClick={()=>open(p.id)} style={{cursor:"pointer"}}><div className="tld" style={{background:SM[p.status].bg,border:`1px solid ${SM[p.status].color}`}}><span style={{color:SM[p.status].color,fontSize:9}}>{SM[p.status].icon}</span></div><div><div style={{fontSize:13,fontWeight:500}}>{p.property}</div><div style={{fontSize:11,color:"var(--muted)"}}>{fmtD(p.scheduledDate)} · {p.client}</div></div></div>)}</div></div>
                </div>
              </div>
            </div>
          )}
          {nav==="projects"&&!sel&&(
            <div className="page fi-anim">
              <div className="ph"><div className="rb"><div><h2 className="pt">All <em>Projects</em></h2><p className="ps">{projects.length} total</p></div><button className="btn bg" onClick={()=>setShowBook(true)}>+ New Booking</button></div></div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(270px,1fr))",gap:13}}>
                {projects.map(p=><div key={p.id} className="pc" onClick={()=>open(p.id)}><div className="rb" style={{marginBottom:7}}><div><div className="ts tm mbm">{p.type}</div><div className="pn">{p.property}</div><div className="ts tm">{p.client}</div></div><SBadge s={p.status}/></div><PBar v={p.progress}/><div className="rb" style={{fontSize:11,color:"var(--muted)",marginBottom:8}}><span>{fmtD(p.scheduledDate)}</span>{p.invoice?<span style={{color:p.invoice.paid?"var(--green)":"var(--red)"}}>{p.invoice.paid?"✓ Paid":"⚑ Invoice Sent"}</span>:<span>No invoice</span>}</div><div className="dv" style={{margin:"7px 0"}}/><div className="rb"><span className="ts tm">{p.type}</span><span style={{fontFamily:"var(--fd)",fontSize:16,color:"var(--gold)"}}>{fmt(p.price)}</span></div></div>)}
              </div>
            </div>
          )}
          {nav==="detail"&&sel&&<ProjectDetail project={sel} onBack={()=>setNav("projects")} onUpdate={update} stripeKey={stripeKey} brand={brand} onCashPayment={p=>setCashModal(p)}/>}
          {nav==="invoices"&&(
            <div className="page fi-anim">
              <div className="ph"><h2 className="pt">Invoices & <em>Payments</em></h2><p className="ps">{projects.filter(p=>p.invoice).length} invoices</p></div>
              <div className="g4" style={{marginBottom:22}}>
                {[
                  {label:"Total Invoiced",value:fmt(collected+outstanding),color:"var(--gold)"},
                  {label:"Collected",     value:fmt(collected),            color:"var(--green)"},
                  {label:"Outstanding",   value:fmt(outstanding),          color:outstanding>0?"var(--red)":"var(--muted)"},
                  {label:"Invoices",      value:projects.filter(p=>p.invoice).length, color:"var(--text)"}
                ].map(s=><div key={s.label} className="sc"><div className="sl">{s.label}</div><div className="sv" style={{color:s.color,fontSize:26}}>{s.value}</div></div>)}
              </div>
              {/* Outstanding */}
              {projects.filter(p=>p.invoice&&!p.invoice.paid).length>0&&(
                <>
                  <div style={{fontFamily:"var(--fd)",fontSize:16,fontWeight:300,color:"var(--red)",marginBottom:11}}>⚑ Outstanding</div>
                  <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:22}}>
                    {projects.filter(p=>p.invoice&&!p.invoice.paid).map(p=>(
                      <div key={p.id} style={{background:"var(--surface)",border:"1px solid rgba(224,112,112,0.2)",borderRadius:12,padding:"16px 18px"}}>
                        <div style={{display:"flex",alignItems:"center",gap:14}}>
                          <div style={{flex:1,cursor:"pointer"}} onClick={()=>open(p.id)}>
                            <div style={{fontSize:11,color:"var(--muted)",marginBottom:3}}>{p.invoice.number}</div>
                            <div style={{fontFamily:"var(--fd)",fontSize:17,fontWeight:400}}>{p.property}</div>
                            <div style={{fontSize:12,color:"var(--muted)"}}>{p.client}</div>
                            <div style={{fontSize:11,marginTop:5,display:"flex",gap:10,flexWrap:"wrap"}}>
                              <span style={{color:"var(--red)"}}>Due {fmtD(p.invoice.dueDate)}</span>
                              {isOverdue7(p.invoice)&&<span style={{color:"var(--gold)"}}>⏱ {daysSince(p.invoice.issuedDate)}d overdue</span>}
                              {p.bookingLocked&&<span style={{color:"var(--red)"}}>🔒 Booking locked</span>}
                              <span style={{color:"var(--muted)"}}>🔒 Media locked</span>
                            </div>
                          </div>
                          <div style={{textAlign:"right"}}>
                            <div style={{fontFamily:"var(--fd)",fontSize:20,color:"var(--gold)",marginBottom:8}}>{fmt(p.invoice.total)}</div>
                            <button onClick={()=>setCashModal(p)}
                              style={{display:"block",width:"100%",marginBottom:5,background:"rgba(76,175,130,0.12)",border:"1px solid rgba(76,175,130,0.3)",borderRadius:7,padding:"6px 10px",color:"var(--green)",cursor:"pointer",fontSize:11,fontWeight:600,textAlign:"center"}}>
                              💵 Record Payment
                            </button>
                            <button onClick={()=>{const u={...p,invoice:{...p.invoice,paid:true,paidDate:new Date().toISOString().split("T")[0]}};update(u);}}
                              style={{display:"block",width:"100%",background:"rgba(255,255,255,0.04)",border:"1px solid var(--border)",borderRadius:7,padding:"5px 10px",color:"var(--muted)",cursor:"pointer",fontSize:11}}>
                              ✓ Mark Paid
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
              {/* Paid */}
              {projects.filter(p=>p.invoice?.paid).length>0&&(
                <>
                  <div style={{fontFamily:"var(--fd)",fontSize:16,fontWeight:300,color:"var(--green)",marginBottom:11}}>✓ Paid</div>
                  <div style={{display:"flex",flexDirection:"column",gap:10}}>
                    {projects.filter(p=>p.invoice?.paid).map(p=>(
                      <div key={p.id} className="pc" onClick={()=>open(p.id)} style={{borderColor:"rgba(76,175,130,0.14)"}}>
                        <div className="rb">
                          <div>
                            <div className="ts tm mbm">{p.invoice.number}</div>
                            <div className="pn" style={{fontSize:16}}>{p.property}</div>
                            <div className="ts tm">{p.client} · Paid {fmtD(p.invoice.paidDate)}{p.invoice.paymentMethod&&` · via ${p.invoice.paymentMethod}`}</div>
                          </div>
                          <div style={{textAlign:"right"}}>
                            <div style={{fontFamily:"var(--fd)",fontSize:20,color:"var(--gold)"}}>{fmt(p.invoice.total)}</div>
                            <div className="tx" style={{color:"var(--green)",marginTop:3}}>✓ Collected</div>
                            {p.invoice.paymentNote&&<div className="tx tm" style={{marginTop:2,fontSize:10}}>{p.invoice.paymentNote}</div>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
          {nav==="reminders"&&<RemindersPanel projects={projects} onUpdate={update}/>}
          {nav==="statements"&&<MonthlyStatements projects={projects} clients={clients}/>}
          {nav==="schedule"&&<div className="page fi-anim"><div className="ph"><h2 className="pt">Schedule</h2></div><div className="g2" style={{gap:18}}><div className="card"><MiniCal projects={projects}/></div><div style={{display:"flex",flexDirection:"column",gap:10}}>{[...projects].filter(p=>p.scheduledDate).sort((a,b)=>a.scheduledDate.localeCompare(b.scheduledDate)).map(p=><div key={p.id} className="pc" onClick={()=>open(p.id)}><div className="rb"><div><div className="ts tm mbm">{fmtD(p.scheduledDate)} · {p.scheduledTime}</div><div className="pn">{p.property}</div><div className="ts tm">{p.client}</div></div><SBadge s={p.status}/></div></div>)}</div></div></div>}
          {nav==="media"&&(()=>{
            const all=projects.filter(p=>!p.invoice||p.invoice.paid).flatMap(p=>p.media.map(m=>({...m,proj:p.property,client:p.client})));
            return (
              <div className="page fi-anim">
                <div className="ph"><h2 className="pt">Media <em>Gallery</em></h2><p className="ps">{all.length} delivered files</p></div>
                {all.length===0
                  ? <div className="upload-z" style={{padding:"56px",textAlign:"center"}}><div style={{fontSize:36,marginBottom:11}}>📷</div><div className="fw">No accessible media</div></div>
                  : <MediaGalleryPanel media={all} isClient={false} projectName="Studio" paid={false} onApprove={()=>{}} onLightbox={()=>{}}/>
                }
              </div>
            );
          })()}
          {nav==="services"&&<ServicesManager services={services} setServices={setServices}/>}
          {nav==="branding"&&<BrandingSettings brand={brand} setBrand={setBrand}/>}
          {nav==="stripe"&&<StripeSettings stripeKey={stripeKey} setStripeKey={setStripeKey}/>}
          {nav==="clients"&&(
            <div className="page fi-anim">
              <div className="ph"><div className="rb"><div><h2 className="pt">Clients</h2><p className="ps">{clients.length} registered · All have free portal access</p></div></div></div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:13}}>
                {clients.map(c=>{const cProjects=projects.filter(p=>p.clientId===c.id); return (<div key={c.id} className="card" style={{border:"1px solid var(--border)"}}>
                  <div className="row mbm" style={{gap:12}}><div className="av" style={{width:40,height:40,fontSize:14,background:c.color||"linear-gradient(135deg,#5b8dd9,#a07bd4)"}}>{c.initials}</div><div><div className="fw">{c.name}</div><div className="ts tm">{c.company}</div><div className="tx" style={{color:"var(--green)"}}>● Free Portal</div></div></div>
                  <div className="dv"/>
                  <div className="rb ts mbm"><span className="tm">Email</span><span style={{fontSize:11}}>{c.email}</span></div>
                  <div className="rb ts mbm"><span className="tm">Projects</span><span>{cProjects.length}</span></div>
                  <div className="rb ts"><span className="tm">Total Billed</span><span style={{color:"var(--gold)"}}>{fmt(cProjects.reduce((s,p)=>s+p.price,0))}</span></div>
                </div>); })}
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}

// ── LANDING PAGE ──────────────────────────────────────────────────────────────
function LandingPage({onStudioSignup,onStudioLogin,onClientLogin}) {
  const [annual,setAnnual]=useState(false);
  const feats=[
    {icon:"📷",name:"Custom Services & Pricing",desc:"Add your own packages — standard photos, drone, 3D walkthrough, video, and more. Set your prices, toggle visibility."},
    {icon:"🔒",name:"Invoice Gate",desc:"Media stays locked until payment confirmed. Auto-invoices generate the moment a job is marked complete."},
    {icon:"👤",name:"Free Client Portal",desc:"Clients get their own free login to track projects, view progress, approve media, pay invoices, and request new bookings."},
    {icon:"💬",name:"Messaging",desc:"Built-in threaded messaging tied directly to each project. No more lost emails or texts."},
    {icon:"🗓",name:"Scheduling",desc:"Calendar view of all shoots. Clients can submit new booking requests directly from their portal."},
    {icon:"📊",name:"Revenue Analytics",desc:"Track collected vs outstanding, invoice history, and business performance in real time."},
  ];
  return (
    <div className="saas-bg fade-slide">
      <style>{BASE_CSS}</style>
      <nav className="saas-nav">
        <div className="saas-logo"><h1>ELEV8</h1><span>Studios</span></div>
        <div className="saas-nav-links">
          <span className="snl" onClick={()=>document.getElementById("pricing")?.scrollIntoView({behavior:"smooth"})}>Pricing</span>
          <span className="snl" onClick={onClientLogin} style={{color:"var(--green)"}}>Client Login <span style={{fontSize:10}}>Free</span></span>
          <span className="snl" onClick={onStudioLogin} style={{color:"var(--text)"}}>Studio Login</span>
          <button className="btn bg bs" onClick={()=>onStudioSignup(null)}>Start Free Trial</button>
        </div>
      </nav>
      <div className="hero">
        <div className="hero-eyebrow">⬡ Built for Media Professionals</div>
        <h2>Run your studio like a <em>business.</em><br/>Give clients a portal they'll <em>love.</em></h2>
        <p>The all-in-one platform for photographers — bookings, custom services, invoicing, media delivery, and a free client portal in one place.</p>
        <div className="hero-btns">
          <button className="btn bg" style={{fontSize:14,padding:"12px 26px"}} onClick={()=>onStudioSignup(null)}>Start Free 14-Day Trial</button>
          <button className="btn bgh" style={{fontSize:14,padding:"12px 26px",color:"var(--green)",borderColor:"rgba(76,175,130,0.3)"}} onClick={onClientLogin}>Client Login — Always Free</button>
        </div>
      </div>

      <div style={{padding:"60px 48px",maxWidth:1100,margin:"0 auto"}}>
        <div className="section-eyebrow">Everything You Need</div>
        <div className="section-title-lg">Tools built for how <em>photographers</em> actually work</div>
        <div className="feat-grid" style={{marginTop:32}}>
          {feats.map(f=><div key={f.name} className="feat-card"><div className="feat-icon">{f.icon}</div><div style={{fontSize:14,fontWeight:500,marginBottom:6}}>{f.name}</div><div style={{fontSize:13,color:"var(--muted)",lineHeight:1.7}}>{f.desc}</div></div>)}
        </div>
      </div>

      <div style={{padding:"60px 48px",maxWidth:1100,margin:"0 auto"}} id="pricing">
        <div className="section-eyebrow">Pricing</div>
        <div className="section-title-lg">Simple pricing for studios.<br/><em>Always free</em> for clients.</div>
        <div className="row" style={{gap:12,margin:"20px 0 32px",flexWrap:"wrap"}}>
          <span style={{fontSize:13,color:!annual?"var(--text)":"var(--muted)"}}>Monthly</span>
          <div className={`tog ${annual?"on":""}`} onClick={()=>setAnnual(a=>!a)}><div className="tog-knob"/></div>
          <span style={{fontSize:13,color:annual?"var(--text)":"var(--muted)"}}>Annual</span>
          <span className="save-badge">Save 35%</span>
        </div>
        <div className="plan-grid">
          {PLANS.map(plan=>(
            <div key={plan.id} className={`plan-card ${plan.popular?"popular":""}`}>
              {plan.popular&&<div className="pop-tag">⭐ Most Popular</div>}
              <div className="plan-name" style={{color:plan.color}}>{plan.name}</div>
              <div className="plan-price"><sup>$</sup>{annual?plan.annual:plan.price}<sub>/mo</sub></div>
              <div style={{fontSize:12,color:"var(--muted)",margin:"8px 0 16px",lineHeight:1.6}}>{plan.tagline}</div>
              <div className="dv"/>
              {plan.features.map(f=><div key={f} className="plan-feat"><span className="plan-feat-check">✓</span><span>{f}</span></div>)}
              <div style={{marginTop:"auto",paddingTop:18}}>
                <button className={`btn ${plan.popular?"bg":"bgh"}`} style={{width:"100%",justifyContent:"center",borderColor:plan.popular?undefined:plan.color,color:plan.popular?undefined:plan.color}} onClick={()=>onStudioSignup(plan)}>{plan.popular?"Start Free Trial →":`Get ${plan.name}`}</button>
              </div>
            </div>
          ))}
          {/* Free client card */}
          <div className="plan-card" style={{borderColor:"rgba(76,175,130,0.3)",background:"rgba(76,175,130,0.04)"}}>
            <div className="plan-name" style={{color:"var(--green)"}}>Client Portal</div>
            <div className="plan-price" style={{color:"var(--green)"}}>Free<sub> forever</sub></div>
            <div style={{fontSize:12,color:"var(--muted)",margin:"8px 0 16px",lineHeight:1.6}}>For clients of any Elev8 Studio</div>
            <div className="dv"/>
            {["Track project progress","View & approve media","Pay invoices securely","Download delivered files","Request new bookings","Message your studio"].map(f=><div key={f} className="plan-feat"><span className="plan-feat-check" style={{color:"var(--green)"}}>✓</span><span>{f}</span></div>)}
            <div style={{marginTop:"auto",paddingTop:18}}>
              <button className="btn bgh" style={{width:"100%",justifyContent:"center",borderColor:"rgba(76,175,130,0.35)",color:"var(--green)"}} onClick={onClientLogin}>Client Login →</button>
            </div>
          </div>
        </div>
        <div style={{textAlign:"center",marginTop:20,color:"var(--muted)",fontSize:13}}>All studio plans include 14-day free trial · No credit card required · Cancel anytime</div>
      </div>

      <footer className="saas-footer">
        <div style={{fontFamily:"var(--fd)",fontSize:18,fontWeight:600,background:"linear-gradient(135deg,var(--gold),var(--gl))",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>ELEV8 Studios</div>
        <div style={{color:"var(--muted)",fontSize:12}}>© 2026 Elev8 Studios · Built for media professionals</div>
        <div style={{display:"flex",gap:14,fontSize:12,color:"var(--muted)"}}><span style={{cursor:"pointer"}}>Privacy</span><span style={{cursor:"pointer"}}>Terms</span><span style={{cursor:"pointer"}}>Support</span></div>
      </footer>
    </div>
  );
}

// ── AUTH SCREENS ──────────────────────────────────────────────────────────────
function StudioSignup({plan,onComplete,onLogin}) {
  const [step,setStep]=useState(1);
  const [form,setForm]=useState({name:"",studio:"",email:"",password:""});
  const [selPlan,setSelPlan]=useState(plan||PLANS[1]);
  const [annual,setAnnual]=useState(false);
  const [proc,setProc]=useState(false);
  const [pct,setPct]=useState(0);
  const go=()=>{if(proc)return;setProc(true);let p=0;const iv=setInterval(()=>{p+=Math.random()*20+8;if(p>=100){p=100;clearInterval(iv);setTimeout(()=>onComplete({name:form.name,studio:form.studio,email:form.email,plan:selPlan,role:"studio"}),500);}setPct(Math.min(p,100));},100);};
  return (
    <div className="auth-wrap fade-slide"><style>{BASE_CSS}</style>
      <div className="auth-card" style={{width:"min(500px,95vw)"}}>
        <div className="auth-logo"><h1>ELEV8</h1><p>Studios</p></div>
        <div className="sb2">{[1,2,3].map(s=><div key={s} className="ss2" style={{background:step>=s?"var(--gold)":"var(--border)"}}/>)}</div>
        {step===1&&<div className="fade-slide">
          <div className="auth-title">Create your studio</div><div className="auth-sub">14-day free trial · No credit card yet</div>
          <div className="social-btn">G &nbsp; Continue with Google</div>
          <div className="divider-text">or with email</div>
          <div className="fg"><label className="fl">Your Name</label><input className="fi" placeholder="Alex Lee" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}/></div>
          <div className="fg"><label className="fl">Studio Name</label><input className="fi" placeholder="Elev8 Studios" value={form.studio} onChange={e=>setForm(f=>({...f,studio:e.target.value}))}/></div>
          <div className="fg"><label className="fl">Email</label><input className="fi" type="email" placeholder="you@studio.com" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))}/></div>
          <div className="fg"><label className="fl">Password</label><input className="fi" type="password" placeholder="8+ characters" value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))}/></div>
          <button className="btn bg" style={{width:"100%",justifyContent:"center"}} onClick={()=>(form.name&&form.email&&form.password)&&setStep(2)} disabled={!form.name||!form.email||!form.password}>Continue →</button>
          <div style={{textAlign:"center",marginTop:12,fontSize:13,color:"var(--muted)"}}>Have an account? <span style={{color:"var(--gold)",cursor:"pointer"}} onClick={onLogin}>Log in</span></div>
        </div>}
        {step===2&&<div className="fade-slide">
          <div className="auth-title">Choose your plan</div><div className="auth-sub">Switch anytime</div>
          <div className="row" style={{gap:10,marginBottom:16}}><span style={{fontSize:12,color:!annual?"var(--text)":"var(--muted)"}}>Monthly</span><div className={`tog ${annual?"on":""}`} style={{width:34,height:18}} onClick={()=>setAnnual(a=>!a)}><div className="tog-knob" style={{width:13,height:13}}/></div><span style={{fontSize:12,color:annual?"var(--text)":"var(--muted)"}}>Annual</span><span className="save-badge" style={{fontSize:10}}>35% off</span></div>
          {PLANS.map(p=><div key={p.id} onClick={()=>setSelPlan(p)} style={{background:"var(--surface2)",border:`1px solid ${selPlan.id===p.id?p.color:"var(--border)"}`,borderRadius:9,padding:"12px 14px",marginBottom:9,cursor:"pointer",transition:"all .2s"}}><div className="rb"><div><div style={{fontSize:13,fontWeight:600,color:p.color}}>{p.name}</div><div className="tx tm">{p.limits}</div></div><div><span style={{fontFamily:"var(--fd)",fontSize:20,color:"var(--gold)"}}>${annual?p.annual:p.price}</span><span className="tx tm">/mo</span></div></div></div>)}
          <div className="row" style={{gap:8,marginTop:6}}><button className="btn bgh" style={{flex:1,justifyContent:"center"}} onClick={()=>setStep(1)}>← Back</button><button className="btn bg" style={{flex:2,justifyContent:"center"}} onClick={()=>setStep(3)}>Continue →</button></div>
        </div>}
        {step===3&&<div className="fade-slide">
          <div className="auth-title">Start free trial</div>
          <div style={{background:"rgba(201,168,76,0.07)",border:"1px solid rgba(201,168,76,0.14)",borderRadius:8,padding:"10px 14px",marginBottom:16,fontSize:13}}>
            <div className="rb"><span className="tm">{selPlan.name} Plan</span><span style={{fontFamily:"var(--fd)",fontSize:18,color:"var(--gold)"}}>${annual?selPlan.annual:selPlan.price}/mo</span></div>
            <div className="tx tm mts">No charge for 14 days · Cancel anytime</div>
          </div>
          <div className="fg"><label className="fl">Card Number</label><input className="fi" placeholder="4242 4242 4242 4242"/></div>
          <div className="g2"><div className="fg"><label className="fl">Expiry</label><input className="fi" placeholder="MM/YY"/></div><div className="fg"><label className="fl">CVV</label><input className="fi" placeholder="•••" type="password"/></div></div>
          {proc&&<div style={{marginBottom:10}}><div className="tx tm" style={{marginBottom:5}}>Setting up your studio…</div><div className="proc-bar"><div className="proc-fill" style={{width:`${pct}%`}}/></div></div>}
          <div className="row" style={{gap:8,marginTop:4}}><button className="btn bgh" style={{flex:1,justifyContent:"center"}} onClick={()=>setStep(2)} disabled={proc}>← Back</button><button className="btn bg" style={{flex:2,justifyContent:"center"}} onClick={go} disabled={proc}>{proc?`Creating… ${Math.round(pct)}%`:"🚀 Launch My Studio"}</button></div>
          <div className="tx tm" style={{textAlign:"center",marginTop:9}}>🔒 SSL encrypted · Cancel anytime</div>
        </div>}
      </div>
    </div>
  );
}

function StudioLogin({onComplete,onSignup}) {
  const [form,setForm]=useState({email:"",password:""});
  const [loading,setLoading]=useState(false);
  const login=()=>{setLoading(true);setTimeout(()=>onComplete({name:"Alex Lee",studio:"Elev8 Studios",email:form.email||"alex@elev8.com",plan:PLANS[1],role:"studio"}),1000);};
  return (
    <div className="auth-wrap fade-slide"><style>{BASE_CSS}</style>
      <div className="auth-card">
        <div className="auth-logo"><h1>ELEV8</h1><p>Studios</p></div>
        <div className="auth-title">Studio Login</div><div className="auth-sub">Welcome back</div>
        <div className="social-btn" onClick={login}>G &nbsp; Continue with Google</div>
        <div className="divider-text">or</div>
        <div className="fg"><label className="fl">Email</label><input className="fi" type="email" placeholder="you@studio.com" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))}/></div>
        <div className="fg"><label className="fl">Password</label><input className="fi" type="password" placeholder="••••••••" value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))}/></div>
        <button className="btn bg" style={{width:"100%",justifyContent:"center"}} onClick={login} disabled={loading}>{loading?"Signing in…":"Log In →"}</button>
        <div style={{textAlign:"center",marginTop:12,fontSize:13,color:"var(--muted)"}}>Don't have an account? <span style={{color:"var(--gold)",cursor:"pointer"}} onClick={onSignup}>Start free trial</span></div>
      </div>
    </div>
  );
}

function ClientLogin({onComplete,onBack}) {
  const [form,setForm]=useState({email:"",password:""});
  const [err,setErr]=useState("");
  const [loading,setLoading]=useState(false);
  const login=()=>{
    setErr(""); setLoading(true);
    setTimeout(()=>{
      const found=null; // Demo mode disabled
      if(found){ onComplete(found); } else { setErr("Invalid email or password. Please contact your studio for login details."); setLoading(false); }
    },800);
  };
  const [showSignup,setShowSignup]=useState(false);
  const [sf,setSf]=useState({name:"",email:"",password:"",company:""});
  return (
    <div className="auth-wrap fade-slide"><style>{BASE_CSS}</style>
      <div className="auth-card">
        <div className="auth-logo"><h1>ELEV8</h1><p>Studios · Client Portal</p></div>
        {!showSignup?<>
          <div className="auth-title">Client Login</div>
          <div style={{background:"rgba(76,175,130,0.08)",border:"1px solid rgba(76,175,130,0.2)",borderRadius:8,padding:"9px 13px",marginBottom:18,fontSize:13,display:"flex",alignItems:"center",gap:8}}><span style={{color:"var(--green)"}}>✓</span><span>Your client account is <strong>always free</strong></span></div>
          <div className="fg"><label className="fl">Email</label><input className="fi" type="email" placeholder="your@email.com" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))}/></div>
          <div className="fg"><label className="fl">Password</label><input className="fi" type="password" placeholder="••••••••" value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))}/></div>
          {err&&<div style={{background:"rgba(224,112,112,0.1)",border:"1px solid rgba(224,112,112,0.25)",borderRadius:7,padding:"9px 13px",fontSize:12,color:"var(--red)",marginBottom:12}}>{err}</div>}
          <button className="btn bg" style={{width:"100%",justifyContent:"center"}} onClick={login} disabled={loading}>{loading?"Signing in…":"Log In to My Portal →"}</button>
          <div className="dv"/>
          <div style={{textAlign:"center",fontSize:13,color:"var(--muted)"}}>New client? <span style={{color:"var(--green)",cursor:"pointer"}} onClick={()=>setShowSignup(true)}>Create free account</span></div>
          <div style={{textAlign:"center",marginTop:8,fontSize:13,color:"var(--muted)"}}><span style={{color:"var(--gold)",cursor:"pointer"}} onClick={onBack}>← Back to home</span></div>
          <div className="dv"/>
          <div style={{fontSize:11,color:"var(--muted)",textAlign:"center",lineHeight:1.7}}>Client accounts are created by studio owners.</div>
        </>:<>
          <div className="auth-title">Create Client Account</div><div className="auth-sub">Free forever — no credit card needed</div>
          <div className="fg"><label className="fl">Your Name</label><input className="fi" placeholder="Jane Smith" value={sf.name} onChange={e=>setSf(f=>({...f,name:e.target.value}))}/></div>
          <div className="fg"><label className="fl">Email</label><input className="fi" type="email" placeholder="jane@company.com" value={sf.email} onChange={e=>setSf(f=>({...f,email:e.target.value}))}/></div>
          <div className="fg"><label className="fl">Company (optional)</label><input className="fi" placeholder="Smith Realty" value={sf.company} onChange={e=>setSf(f=>({...f,company:e.target.value}))}/></div>
          <div className="fg"><label className="fl">Password</label><input className="fi" type="password" value={sf.password} onChange={e=>setSf(f=>({...f,password:e.target.value}))}/></div>
          <button className="btn bg" style={{width:"100%",justifyContent:"center"}} onClick={()=>onComplete({id:`c${Date.now()}`,name:sf.name,email:sf.email,password:sf.password,initials:sf.name.split(" ").map(n=>n[0]).join("").slice(0,2).toUpperCase(),color:"#5b8dd9",company:sf.company})} disabled={!sf.name||!sf.email||!sf.password}>Create Free Account →</button>
          <div style={{textAlign:"center",marginTop:12,fontSize:13,color:"var(--muted)"}}><span style={{color:"var(--gold)",cursor:"pointer"}} onClick={()=>setShowSignup(false)}>← Back to login</span></div>
        </>}
      </div>
    </div>
  );
}

// ── ROOT APP ──────────────────────────────────────────────────────────────────
export default function App() {
  const [screen,setScreen]=useState("landing");
  const [signupPlan,setSignupPlan]=useState(null);
  const [user,setUser]=useState(null);
  const [client,setClient]=useState(null);
  const [services,setServices]=useState(DEFAULT_SERVICES);
  const [projects,setProjects]=useState([]);

  const updateProject=u=>setProjects(ps=>ps.map(p=>p.id===u.id?u:p));

  const handleStudioSignup=(plan)=>{setSignupPlan(plan);setScreen("studio-signup");};
  const handleStudioSignupDone=(u)=>{setUser(u);setScreen("studio");};
  const handleStudioLogin=()=>setScreen("studio-login");
  const handleStudioLoginDone=(u)=>{setUser(u);setScreen("studio");};
  const handleClientLogin=()=>setScreen("client-login");
  const handleClientLoginDone=(c)=>{setClient(c);setScreen("client");};
  const handleLogout=()=>{setUser(null);setClient(null);setScreen("landing");};

  if(screen==="landing") return <LandingPage onStudioSignup={handleStudioSignup} onStudioLogin={handleStudioLogin} onClientLogin={handleClientLogin}/>;
  if(screen==="studio-signup") return <StudioSignup plan={signupPlan} onComplete={handleStudioSignupDone} onLogin={handleStudioLogin}/>;
  if(screen==="studio-login") return <StudioLogin onComplete={handleStudioLoginDone} onSignup={()=>handleStudioSignup(null)}/>;
  if(screen==="client-login") return <ClientLogin onComplete={handleClientLoginDone} onBack={()=>setScreen("landing")}/>;
  if(screen==="studio"&&user) return <StudioApp user={user} onLogout={handleLogout} services={services} setServices={setServices}/>;
  if(screen==="client"&&client) return <ClientPortal client={client} projects={projects} onUpdateProject={updateProject} onLogout={handleLogout}/>;
  return <LandingPage onStudioSignup={handleStudioSignup} onStudioLogin={handleStudioLogin} onClientLogin={handleClientLogin}/>;
}