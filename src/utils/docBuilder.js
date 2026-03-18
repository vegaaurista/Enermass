import { inr, fmtN, mGen, aGen, bomQty, numberToIndianCurrencyWords } from './helpers';
import { SD, DEFAULT_BRANCHES } from '../data/defaults';

/* ═══════════════════════════════════════════════════════════════════
   PROFESSIONAL SOLAR EPC PROPOSAL — v4
   Structure:
     01 Cover Page          07 Environmental Impact
     02 Executive Summary   08 Govt Subsidy & Incentives
     03 Company Profile     09 Net Metering & Grid
     04 Project Overview    10 Execution Timeline
     05 Technical Specs/BOM 11 Terms & Conditions
     06 Financial Analysis  12 Why Solar / Contact
   ═══════════════════════════════════════════════════════════════════ */

// ── Design tokens ───────────────────────────────────────────────────
const C = {
  nv:  '#0A1F3C',  nv2: '#0F2D56',  nv3: '#1A3D6B',
  gd:  '#C9940A',  gd2: '#E8AB1A',  gdL: '#FEF9EC',  gdD: '#7A5700',
  tl:  '#0B8C74',  tlL: '#D4F0EB',
  gr:  '#1A7A42',  grL: '#D5EFDF',
  bl:  '#1458A6',  blL: '#D8E8F8',
  or:  '#D4580A',  orL: '#FDE8DC',
  bg:  '#F5F7FB',  bg2: '#ECEEF4',
  bd:  '#D1D9E6',  bd2: '#E8EDF5',
  t1:  '#0A1520',  t2:  '#2E3D52',  t3:  '#64748B',  t4: '#94A3B8',
  wh:  '#FFFFFF',
};
const $ = o => Object.entries(o).map(([k,v])=>`${k}:${v}`).join(';');

// ── Atom helpers ─────────────────────────────────────────────────────

// Solid section divider badge + title + gradient rule
const SEC = (n, title, accent=C.gd) => `
<div style="${$({display:'flex','align-items':'center',gap:'13px','margin-bottom':'22px','padding-bottom':'13px','border-bottom':`2px solid ${C.bd}`})}">
  <div style="${$({width:'34px',height:'34px','border-radius':'8px',background:C.nv,display:'flex','align-items':'center','justify-content':'center','flex-shrink':'0','box-shadow':`0 3px 10px rgba(10,31,60,.3)`})}">
    <span style="${$({'font-size':'9.5px','font-weight':'700',color:accent,'font-family':'Arial,sans-serif'})}">${n}</span>
  </div>
  <div style="${$({'font-size':'15px','font-weight':'700',color:C.nv,'letter-spacing':'-0.3px','font-family':'Georgia,serif'})}">${title}</div>
  <div style="${$({flex:'1',height:'2px',background:`linear-gradient(to right,${accent}70,transparent)`,'margin-left':'6px'})}"></div>
</div>`;

// KPI metric card
const KPI = (v,u,l,a=C.nv) => `
<div style="${$({background:C.wh,border:`1px solid ${C.bd}`,'border-radius':'10px',padding:'16px 12px','text-align':'center','border-top':`4px solid ${a}`})}">
  <div style="${$({'font-size':'20px','font-weight':'700',color:a,'line-height':'1.1','margin-bottom':'3px','font-family':'Georgia,serif'})}">${v}</div>
  <div style="${$({'font-size':'7.5px',color:C.t3,'text-transform':'uppercase','letter-spacing':'.8px','margin-bottom':'5px'})}">${u}</div>
  <div style="${$({'font-size':'10.5px',color:C.t2,'font-weight':'600','line-height':'1.3'})}">${l}</div>
</div>`;

// Info row pair
const IR = (l,v,last=false) => `
<div style="${$({display:'flex','justify-content':'space-between','align-items':'flex-start',padding:'7px 0','border-bottom':last?'none':`1px solid ${C.bd}`,gap:'8px'})}">
  <span style="${$({'font-size':'10px',color:C.t3,'flex-shrink':'0','min-width':'135px'})}">${l}</span>
  <span style="${$({'font-size':'10.5px',color:C.t1,'font-weight':'600','text-align':'right','line-height':'1.45','flex':'1'})}">${v}</span>
</div>`;

// Dark row inside navy box
const DR = (l,v,dim=false,accent='') => `
<div style="${$({display:'flex','justify-content':'space-between','align-items':'center','padding':'9px 0'})}">
  <span style="${$({'font-size':'10.5px',color:dim?'rgba(255,255,255,.5)':accent||'rgba(255,255,255,.82)','font-family':'Arial,sans-serif'})}">${l}</span>
  <span style="${$({'font-size':'11px','font-weight':'600',color:accent||C.wh,'font-family':'Arial,sans-serif'})}">${v}</span>
</div>
<div style="height:1px;background:rgba(255,255,255,.07)"></div>`;

// Icon stat block (used in env section etc)
const ISTAT = (icon,val,label,color=C.nv) => `
<div style="${$({background:C.wh,border:`1px solid ${C.bd}`,'border-radius':'12px',padding:'16px 14px','text-align':'center'})}">
  <div style="${$({'font-size':'28px','margin-bottom':'8px','line-height':'1'})}">${icon}</div>
  <div style="${$({'font-size':'18px','font-weight':'700',color,margin:'0 0 4px','font-family':'Georgia,serif'})}">${val}</div>
  <div style="${$({'font-size':'9px',color:C.t3,'text-transform':'uppercase','letter-spacing':'.7px'})}">${label}</div>
</div>`;

export function buildDoc(D) {
  const sd  = D.sd || SD[D.state];
  const co  = D.co || {};
  const fromAddr = (co.branches||{})[D.state] || DEFAULT_BRANCHES[D.state] || co.addr || '';
  const addrLine = fromAddr.replace(/\n/g,' · ');
  const sysLabel = D.stype==='hybrid'
    ? 'Hybrid Solar Power Plant (Grid-Tied + Battery Backup)'
    : 'Grid-Connected Rooftop Solar Power Plant (Net Metering)';
  const logoHTML = co.logo
    ? `<img src="${co.logo}" style="height:52px;max-width:165px;object-fit:contain;display:block" alt="${co.name||''}" crossorigin="anonymous">`
    : '';

  // ── Derived values ────────────────────────────────────────────────
  const annGen     = aGen(D.cap);
  const co2PerKwh  = 0.72; // kg CO2 per kWh (India grid emission factor)
  const co2Annual  = Math.round(annGen * co2PerKwh / 1000 * 10) / 10; // tonnes/yr
  const co2Life    = Math.round(co2Annual * 25);
  const treesAnnual= Math.round(co2Annual * 1000 / 21); // 21kg CO2 per tree/yr
  const treesLife  = Math.round(co2Life * 1000 / 21);
  const unitsYear  = Math.round(annGen);

  // ── BOM ──────────────────────────────────────────────────────────
  let bomHTML='', lastCat='', sn=0;
  (D.bom||[]).filter(x=>x.sys==='all'||x.sys===D.stype).forEach(item=>{
    if(item.cat!==lastCat){
      bomHTML+=`<tr><td colspan="5" style="${$({background:C.nv,color:C.gd2,'font-size':'8px','font-weight':'700','text-transform':'uppercase','letter-spacing':'1.2px',padding:'7px 14px'})}">${item.cat}</td></tr>`;
      lastCat=item.cat;
    }
    sn++;
    const qty=bomQty(item,D), bg=sn%2===0?C.bg:C.wh;
    bomHTML+=`<tr style="background:${bg}">
      <td style="${$({padding:'8px 10px','text-align':'center',color:C.t4,'font-size':'9px','border-bottom':`1px solid ${C.bd}`})}">${String(sn).padStart(2,'0')}</td>
      <td style="${$({padding:'8px 12px','font-weight':'600',color:C.t1,'font-size':'10px','border-bottom':`1px solid ${C.bd}`,'line-height':'1.4'})}">${item.desc}</td>
      <td style="${$({padding:'8px 12px','font-size':'9.5px',color:C.t2,'border-bottom':`1px solid ${C.bd}`,'line-height':'1.5'})}">${item.spec}</td>
      <td style="${$({padding:'8px 10px','text-align':'center','font-weight':'700',color:C.nv,'font-size':'10.5px','border-bottom':`1px solid ${C.bd}`})}">${qty}</td>
      <td style="${$({padding:'8px 10px','text-align':'center',color:C.t3,'font-size':'9.5px','border-bottom':`1px solid ${C.bd}`})}">${item.unit}</td>
    </tr>`;
  });

  // ── Financial projection ───────────────────────────────────────────
  let finRows='', cum=0;
  for(let y=1;y<=10;y++){
    const yb=D.annBen*Math.pow(1+(sd.tariffEsc/100),y-1)*Math.pow(0.995,y);
    cum+=yb; const net=cum-D.commit, bg=y%2===0?C.bg:C.wh;
    finRows+=`<tr style="background:${bg}">
      <td style="${$({padding:'8px 12px',color:C.t1,'font-size':'10.5px','border-bottom':`1px solid ${C.bd}`,'font-weight':'600'})}">Year ${y}</td>
      <td style="${$({padding:'8px 12px','text-align':'right',color:C.t2,'font-size':'10px','border-bottom':`1px solid ${C.bd}`})}">${fmtN(Math.round(annGen*Math.pow(0.995,y)))} kWh</td>
      <td style="${$({padding:'8px 12px','text-align':'right',color:C.t1,'font-size':'10px','border-bottom':`1px solid ${C.bd}`,'font-weight':'600'})}">${inr(yb)}</td>
      <td style="${$({padding:'8px 12px','text-align':'right',color:C.bl,'font-size':'10px','border-bottom':`1px solid ${C.bd}`,'font-weight':'600'})}">${inr(cum)}</td>
      <td style="${$({padding:'8px 12px','text-align':'right','font-size':'10px','border-bottom':`1px solid ${C.bd}`,'font-weight':'700',color:net>0?C.gr:C.t3})}">${net>0?inr(net):'—'}</td>
    </tr>`;
  }

  // ── T&C ──────────────────────────────────────────────────────────
  const tnc    = D.tnc||{};
  const tncRaw = [...(tnc.common||'').split('\n').filter(l=>l.trim()),...(tnc[D.state]||'').split('\n').filter(l=>l.trim())];

  // ── Letter body ───────────────────────────────────────────────────
  const ltrBody = D.lbody||`We, ${co.name||'Enermass Power Solutions Pvt. Ltd.'}, are pleased to present this comprehensive Techno-Commercial Solar Power Plant Proposal for your premises at ${D.site||D.billaddr||sd.name}.\n\nThis proposal has been prepared after careful analysis of your energy requirements, site conditions, and applicable state solar regulations. Our solution is engineered to significantly reduce your electricity bills, provide energy security, and ensure full compliance with MNRE and ${D.discom||sd.discom} requirements.\n\nWe design this system to maximise your benefits under the PM Surya Ghar: Muft Bijli Yojana and applicable state incentives. Our MNRE-empanelled team ensures a seamless end-to-end experience from system design to net metering commissioning.\n\nWe invite you to review this proposal and look forward to the opportunity to serve you.`;

  // ── Incentives ────────────────────────────────────────────────────
  const incHTML = (sd.inc||[]).map((x,i,a)=>IR(x.i,`<span style="color:${C.tl};font-weight:700">${x.v}</span>`,i===a.length-1)).join('');

  // ── Cost data ─────────────────────────────────────────────────────
  const plantNet   = D.price;
  const addAmt     = D.addCostAmt||0;
  const totalProj  = D.totalProj;
  const taxableVal = D.taxableVal;
  const totalGST   = D.totalGST;
  const disc       = D.disc||0;
  const totalSub   = D.subon?(D.tsub||0):0;
  const custCommit = D.commit;

  // ── Subsidy block ─────────────────────────────────────────────────
  const subSection = D.subon ? `
<div style="${$({background:C.nv,'border-radius':'10px',padding:'18px 22px','margin-bottom':'14px',display:'flex','justify-content':'space-between','align-items':'center','flex-wrap':'wrap',gap:'14px'})}">
  <div>
    <div style="${$({'font-size':'8px',color:'rgba(255,255,255,.45)','text-transform':'uppercase','letter-spacing':'1.5px','margin-bottom':'5px'})}">Central Financial Assistance — MNRE</div>
    <div style="${$({'font-size':'15px',color:C.wh,'font-weight':'700','margin-bottom':'4px','font-family':'Georgia,serif'})}">PM Surya Ghar: Muft Bijli Yojana</div>
    <div style="${$({'font-size':'8.5px',color:'rgba(255,255,255,.38)'})}">CFA = 30,000×min(S,2) + 18,000×max(0,min(S−2,1))</div>
  </div>
  <div style="text-align:right">
    <div style="${$({'font-size':'26px',color:C.gd2,'font-weight':'700','font-family':'Georgia,serif'})}">${D.cfa>0?inr(D.cfa):'N/A'}</div>
    <div style="${$({'font-size':'8.5px',color:'rgba(255,255,255,.4)','margin-top':'3px'})}">${D.ptype==='Residential'?'CFA Applicable':'Not Applicable'}</div>
  </div>
</div>
<div style="${$({display:'grid','grid-template-columns':'1fr 1fr',gap:'12px'})}">
  <div style="${$({background:C.bg,'border-radius':'10px',padding:'16px',border:`1px solid ${C.bd}`,'border-top':`3px solid ${C.gd}`})}">
    <div style="${$({'font-size':'8px','font-weight':'700',color:C.t3,'text-transform':'uppercase','letter-spacing':'1px','margin-bottom':'12px'})}">MNRE CFA Structure</div>
    ${IR('Up to 2 kWp',`<span style="color:${C.gd};font-weight:700">₹30,000/kW</span>`)}
    ${IR('2–3 kWp (incremental)',`<span style="color:${C.gd};font-weight:700">₹18,000/kW</span>`)}
    ${IR('Max for Individual',`<span style="color:${C.gd};font-weight:700">₹78,000</span>`)}
    ${IR('System Size',`${D.cap} kWp`)}
    ${IR('Proposal Type',D.ptype,true)}
    <div style="${$({'margin-top':'12px',padding:'10px 12px',background:C.gdL,'border-radius':'8px','border-left':`4px solid ${C.gd}`,display:'flex','justify-content':'space-between','align-items':'center'})}">
      <span style="${$({'font-size':'10.5px','font-weight':'700',color:C.nv})}">CFA Subsidy</span>
      <span style="${$({'font-size':'14px','font-weight':'700',color:C.gd})}">${D.cfa>0?inr(D.cfa):'Not Applicable'}</span>
    </div>
  </div>
  <div style="${$({background:C.bg,'border-radius':'10px',padding:'16px',border:`1px solid ${C.bd}`,'border-top':`3px solid ${C.tl}`})}">
    <div style="${$({'font-size':'8px','font-weight':'700',color:C.t3,'text-transform':'uppercase','letter-spacing':'1px','margin-bottom':'10px'})}">${sd.name} — State Incentives</div>
    <div style="${$({'font-size':'10px',color:C.t2,'margin-bottom':'10px','padding-bottom':'8px','border-bottom':`1px solid ${C.bd}`})}"><strong>Nodal Agency:</strong> ${sd.agency}</div>
    ${incHTML}
    ${D.ssub>0?`<div style="${$({'margin-top':'12px',padding:'10px 12px',background:C.tlL,'border-radius':'8px','border-left':`4px solid ${C.tl}`,display:'flex','justify-content':'space-between','align-items':'center'})}"><span style="${$({'font-size':'10.5px','font-weight':'700',color:C.nv})}">State Subsidy</span><span style="${$({'font-size':'14px','font-weight':'700',color:C.tl})}">${inr(D.ssub)}</span></div>`:''}
  </div>
</div>` : `<div style="${$({background:C.blL,'border-left':`4px solid ${C.bl}`,'border-radius':'0 8px 8px 0',padding:'12px 16px','font-size':'10.5px',color:C.bl})}">Subsidy not applicable for this project category.</div>`;

  // ─────────────────────────────────────────────────────────────────
  return `

<!-- ████████████████████████████████████████████████
     01 — COVER PAGE
████████████████████████████████████████████████ -->
<div style="${$({background:C.nv,position:'relative',overflow:'hidden'})}">

  <!-- Radial accents -->
  <div style="position:absolute;top:-100px;right:-100px;width:380px;height:380px;border-radius:50%;background:rgba(201,148,10,.09);pointer-events:none"></div>
  <div style="position:absolute;bottom:-80px;left:-60px;width:300px;height:300px;border-radius:50%;background:rgba(20,88,166,.08);pointer-events:none"></div>
  <!-- Gold top stripe -->
  <div style="position:absolute;top:0;left:0;right:0;height:5px;background:linear-gradient(90deg,${C.gd},${C.gd2},rgba(201,148,10,.15))"></div>

  <!-- Top bar -->
  <div style="${$({padding:'28px 46px 0',display:'flex','justify-content':'space-between','align-items':'flex-start',position:'relative','z-index':'1'})}">
    <!-- Logo + company -->
    <div style="${$({display:'flex','align-items':'center',gap:'16px'})}">
      ${logoHTML?`<div style="flex-shrink:0">${logoHTML}</div>`:''}
      <div>
        <div style="${$({'font-size':'17px',color:C.wh,'font-weight':'700','letter-spacing':'-0.4px','line-height':'1.2','font-family':'Georgia,serif'})}">${co.name||'Enermass Power Solutions Pvt. Ltd.'}</div>
        <div style="${$({'font-size':'7.5px',color:C.gd2,'letter-spacing':'2.5px','text-transform':'uppercase','margin-top':'6px','font-weight':'600'})}">${co.tag||'Integrated Solar & Power Engineering Solutions'}</div>
        <div style="${$({'font-size':'8.5px',color:'rgba(255,255,255,.28)','margin-top':'8px','line-height':'1.85'})}">
          ${addrLine}${addrLine?'<br>':''}${co.phone||''}${co.email?' &nbsp;·&nbsp; '+co.email:''}${co.web?' &nbsp;·&nbsp; '+co.web:''}
        </div>
      </div>
    </div>
    <!-- Ref box -->
    <div style="${$({background:`linear-gradient(135deg,${C.gd},${C.gd2})`,'border-radius':'10px',padding:'14px 20px','text-align':'right','flex-shrink':'0','min-width':'168px','box-shadow':'0 8px 32px rgba(201,148,10,.38)'})}">
      <div style="${$({'font-size':'7px','font-weight':'700','text-transform':'uppercase','letter-spacing':'1.5px',color:C.nv,'opacity':'.6','margin-bottom':'5px'})}">Proposal Ref.</div>
      <div style="${$({'font-size':'11.5px','font-weight':'700',color:C.nv,'font-family':'Arial,sans-serif'})}">${D.refno}</div>
      <div style="height:1px;background:rgba(10,31,60,.2);margin:8px 0 6px"></div>
      <div style="${$({'font-size':'8.5px',color:C.nv,'opacity':'.65'})}">Date:&nbsp; ${D.qdateStr}</div>
      <div style="${$({'font-size':'8.5px',color:C.nv,'opacity':'.65','margin-top':'2px'})}">Valid:&nbsp; ${D.duedateStr}</div>
    </div>
  </div>

  <!-- Hero -->
  <div style="${$({padding:'36px 46px 44px',position:'relative','z-index':'1'})}">
    <div style="${$({'font-size':'8px',color:C.gd2,'letter-spacing':'3.2px','text-transform':'uppercase','font-weight':'600','margin-bottom':'14px','opacity':'.8'})}">
      Techno-Commercial Proposal &nbsp;·&nbsp; ${sd.name} &nbsp;·&nbsp; ${D.ptype}
    </div>
    <div style="${$({'font-size':'42px',color:C.wh,'font-weight':'900','line-height':'.95','letter-spacing':'-1.5px','font-family':'Georgia,serif'})}">Solar Power</div>
    <div style="${$({'font-size':'42px',color:C.gd2,'font-weight':'900','line-height':'.95','letter-spacing':'-1.5px','font-family':'Georgia,serif','margin-bottom':'14px'})}">Plant Proposal</div>
    <div style="${$({'font-size':'11px',color:'rgba(255,255,255,.42)','line-height':'1.7','max-width':'480px','margin-bottom':'26px'})}">${sysLabel}</div>

    <!-- Pills -->
    <div style="${$({display:'flex',gap:'8px','flex-wrap':'wrap','margin-bottom':'30px'})}">
      ${[`${D.cap} kWp`,sd.name,`${D.sal} ${D.cust}`,D.ptype,...(D.stype==='hybrid'?[`${D.bkwh} kWh Battery`]:[]),`Valid ${D.validity} Days`]
        .map(t=>`<span style="${$({background:'rgba(255,255,255,.1)',border:'1px solid rgba(255,255,255,.18)',padding:'5px 14px','border-radius':'20px','font-size':'9px',color:'rgba(255,255,255,.9)',display:'inline-flex','align-items':'center',gap:'7px'})}"><span style="width:5px;height:5px;border-radius:50%;background:${C.gd2};display:inline-block;flex-shrink:0"></span>${t}</span>`).join('')}
    </div>

    <!-- Quick stats strip -->
    <div style="${$({display:'grid','grid-template-columns':'repeat(4,1fr)',gap:'10px'})}">
      ${[
        [inr(D.annSave),  'Annual Savings',  C.gd],
        [`${D.payback} yrs`,'Payback Period', C.tl],
        [inr(D.cum25),    '25-Yr Returns',   C.bl],
        [`${co2Annual}T`, 'CO₂ Saved/Year',  C.gr],
      ].map(([v,l,c])=>`
      <div style="${$({background:'rgba(255,255,255,.08)',border:'1px solid rgba(255,255,255,.14)','border-radius':'10px',padding:'12px 10px','text-align':'center'})}">
        <div style="${$({'font-size':'16px','font-weight':'700',color:c,'font-family':'Georgia,serif'})}">${v}</div>
        <div style="${$({'font-size':'8px',color:'rgba(255,255,255,.45)','text-transform':'uppercase','letter-spacing':'.6px','margin-top':'4px'})}">${l}</div>
      </div>`).join('')}
    </div>
  </div>
</div>


<!-- ████████████████████████████████████████████████
     02 — EXECUTIVE SUMMARY
████████████████████████████████████████████████ -->
<div data-sec="exec" style="${$({padding:'30px 46px',background:C.wh,'border-bottom':`1px solid ${C.bd}`})}">
  ${SEC('02','Executive Summary',C.gd)}

  <!-- Opening paragraph -->
  <div style="${$({background:C.bg,'border-radius':'10px',padding:'16px 20px','margin-bottom':'18px','border-left':`5px solid ${C.gd}`})}">
    <p style="${$({'font-size':'11px',color:C.t2,'line-height':'1.85','margin':'0'})}">
      This proposal presents a <strong>${D.cap} kWp ${D.stype==='hybrid'?'Hybrid':'On-Grid'} Solar Power Plant</strong> for
      <strong>${D.sal} ${D.cust}</strong> at ${D.site||D.billaddr||sd.name}.
      The system is designed to generate approximately <strong>${fmtN(Math.round(mGen(D.cap)))} kWh per month</strong>,
      significantly offsetting electricity consumption of ${D.cons} kWh/month.
      With a customer financial commitment of <strong>${inr(custCommit)}</strong> (after subsidy),
      the project delivers a payback of <strong>${D.payback} years</strong> and a
      25-year cumulative return of <strong>${inr(D.cum25)}</strong>.
    </p>
  </div>

  <!-- 6 icon stat cards -->
  <div style="${$({display:'grid','grid-template-columns':'repeat(3,1fr)',gap:'10px','margin-bottom':'16px'})}">
    ${[
      ['⚡',`${D.cap} kWp`,    'System Capacity',  C.nv],
      ['💡',fmtN(Math.round(mGen(D.cap)))+' kWh','Monthly Generation',C.tl],
      ['💰',inr(D.annSave),   'Annual Bill Savings',C.gr],
      ['📈',inr(D.cum25),     '25-Year Returns',   C.bl],
      ['⏱',`${D.payback} yrs`,'Simple Payback',   C.gd],
      ['🌱',`${co2Annual}T/yr`,'CO₂ Reduction',    C.gr],
    ].map(([ic,v,l,c])=>`
    <div style="${$({background:C.bg,border:`1px solid ${C.bd}`,'border-radius':'10px',padding:'14px 16px',display:'flex','align-items':'center',gap:'12px'})}">
      <div style="${$({width:'42px',height:'42px','border-radius':'10px',background:C.nv,display:'flex','align-items':'center','justify-content':'center','flex-shrink':'0','font-size':'18px'})}">${ic}</div>
      <div>
        <div style="${$({'font-size':'14px','font-weight':'700',color:c,'font-family':'Georgia,serif'})}">${v}</div>
        <div style="${$({'font-size':'8.5px',color:C.t3,'margin-top':'2px'})}">${l}</div>
      </div>
    </div>`).join('')}
  </div>

  <!-- Why choose Enermass (brief) -->
  <div style="${$({background:C.nv,'border-radius':'10px',padding:'16px 22px',display:'flex','justify-content':'space-between','align-items':'center','flex-wrap':'wrap',gap:'12px'})}">
    <span style="${$({'font-size':'10.5px',color:C.wh,'font-weight':'600','font-family':'Georgia,serif'})}">Why ${co.name||'Enermass'}?</span>
    ${['MNRE Empanelled','ISO 9001:2015','500+ Projects','25-Yr Warranty','End-to-End EPC'].map(t=>`
    <span style="${$({background:'rgba(255,255,255,.1)',border:'1px solid rgba(255,255,255,.15)',padding:'4px 12px','border-radius':'20px','font-size':'8.5px',color:'rgba(255,255,255,.85)'})}">✓ ${t}</span>`).join('')}
  </div>
</div>


<!-- ████████████████████████████████████████████████
     01 — INTRODUCTION LETTER
████████████████████████████████████████████████ -->
<div data-sec="letter" style="${$({padding:'30px 46px',background:C.bg,'border-bottom':`1px solid ${C.bd}`})}">
  ${SEC('01','Introduction Letter',C.gd)}
  <div style="${$({background:C.gdL,'border-left':`5px solid ${C.gd}`,'border-radius':'0 10px 10px 0',padding:'22px 28px'})}">
    <div style="${$({'margin-bottom':'16px'})}">
      <div style="${$({'font-weight':'700','font-size':'11px',color:C.t1})}">To,</div>
      <div style="${$({'margin-top':'4px',color:C.t2,'font-size':'11px','line-height':'1.7'})}">${D.sal} ${D.cust}${D.billaddr?'<br>'+D.billaddr.replace(/\n/g,'<br>'):''}</div>
    </div>
    <div style="${$({'font-size':'9.5px',color:C.t3,'margin-bottom':'16px','padding-bottom':'13px','border-bottom':`1px dashed ${C.bd}`})}">
      Date: <strong style="color:${C.t1}">${D.qdateStr}</strong> &nbsp;|&nbsp;
      Ref: <strong style="color:${C.t1}">${D.refno}</strong> &nbsp;|&nbsp;
      Valid Until: <strong style="color:${C.t1}">${D.duedateStr}</strong>
    </div>
    <div style="${$({'font-weight':'700','font-size':'11.5px',color:C.nv,'margin-bottom':'14px','font-family':'Georgia,serif'})}">
      Sub: Solar Power Plant Proposal — ${D.cap} kWp ${D.stype==='hybrid'?'Hybrid':'On-Grid'} System — ${sd.name}
    </div>
    <div style="${$({'font-weight':'700','margin-bottom':'14px','font-size':'11px',color:C.t1})}">Dear ${D.sal} ${(D.cust||'').split(' ')[0]||'Sir/Madam'},</div>
    ${ltrBody.split('\n').filter(l=>l.trim()).map(p=>`<p style="${$({'margin-bottom':'12px','line-height':'1.88','font-size':'11px',color:C.t2})}">${p}</p>`).join('')}
    <div style="${$({'margin-top':'26px','padding-top':'18px','border-top':`1px solid rgba(201,148,10,.35)`})}">
      <div style="${$({'margin-bottom':'26px','font-size':'11px',color:C.t2})}">Yours faithfully,</div>
      ${co.sigImg?`<div style="margin-bottom:10px"><img src="${co.sigImg}" style="max-height:48px;width:auto;display:block" alt="Signature"></div>`:'<div style="height:44px"></div>'}
      <div style="${$({display:'inline-block','border-top':`2px solid ${C.nv}`,'padding-top':'8px'})}">
        <div style="${$({'font-weight':'700',color:C.nv,'font-size':'12px','font-family':'Georgia,serif'})}">Mr. Manoj M S</div>
        <div style="${$({'font-size':'10px',color:C.t2,'margin-top':'2px'})}">Chief Executive Officer</div>
        <div style="${$({'font-size':'9.5px',color:C.t3,'margin-top':'2px'})}">${co.name||'Enermass Power Solutions Pvt. Ltd.'}</div>
      </div>
    </div>
  </div>
</div>


<!-- ████████████████████████████████████████████████
     03 — COMPANY PROFILE
████████████████████████████████████████████████ -->
<div data-sec="company" style="${$({padding:'30px 46px',background:C.wh,'border-bottom':`1px solid ${C.bd}`})}">
  ${SEC('03','About the Company',C.tl)}
  <div style="${$({display:'grid','grid-template-columns':'1fr 1fr',gap:'8px','margin-bottom':'14px'})}">
    ${[['Company',co.name||'—'],['CIN / Reg. No.',co.cin||'—'],['GST Number',co.gst||'—'],['PAN',co.pan||'—'],['Phone',co.phone||'—'],['Email',co.email||'—'],['Website',co.web||'—'],['Address',(fromAddr||co.addr||'').replace(/\n/g,', ')]].map(([l,v])=>`
    <div style="${$({background:C.bg,border:`1px solid ${C.bd}`,'border-radius':'8px',padding:'11px 14px'})}">
      <div style="${$({'font-size':'7.5px',color:C.t3,'text-transform':'uppercase','letter-spacing':'.8px','font-weight':'700','margin-bottom':'4px'})}">${l}</div>
      <div style="${$({'font-size':'11px',color:C.t1,'font-weight':'600','line-height':'1.45'})}">${v}</div>
    </div>`).join('')}
  </div>
  <div style="${$({background:C.bg,border:`1px solid ${C.bd}`,'border-radius':'8px',padding:'14px 18px','margin-bottom':'14px'})}">
    <div style="${$({'font-weight':'700',color:C.nv,'font-size':'11.5px','margin-bottom':'8px','font-family':'Georgia,serif'})}">Business Activities</div>
    <div style="${$({'font-size':'10.5px',color:C.t2,'line-height':'1.8'})}">${co['cp-biz']||'Design, Supply, Installation, Testing & Commissioning of Grid-Tied, Hybrid & Off-Grid Solar Power Systems. Net Metering Facilitation & DISCOM Liaison.'}${co['cp-areas']?`<br><strong>Service Areas:</strong> ${co['cp-areas']}`:''}${co['cp-certs']?`<br><strong>Certifications:</strong> ${co['cp-certs']}`:''}${co['cp-notes']?`<br>${co['cp-notes']}`:''}</div>
  </div>
  <!-- 3 stat bars -->
  <div style="${$({display:'grid','grid-template-columns':'repeat(3,1fr)',gap:'10px'})}">
    ${[[co['cp-exp']?.split(' ')[0]||'10+','Years','Experience',C.gd],[co['cp-proj']?.split(' ')[0]||'500+','Projects','Commissioned',C.tl],[co['cp-mw']?.split(' ')[0]||'15','MW','Installed',C.bl]].map(([v,u,l,c])=>`
    <div style="${$({background:C.nv,'border-radius':'10px',padding:'20px 14px','text-align':'center'})}">
      <div style="${$({'font-size':'26px','font-weight':'700',color:c,'font-family':'Georgia,serif'})}">${v}</div>
      <div style="${$({'font-size':'8px',color:'rgba(255,255,255,.4)','text-transform':'uppercase','letter-spacing':'.7px','margin-top':'3px'})}">${u}</div>
      <div style="${$({'font-size':'10.5px',color:'rgba(255,255,255,.65)','margin-top':'5px'})}">${l}</div>
    </div>`).join('')}
  </div>
</div>


<!-- ████████████████████████████████████████████████
     04 — PROJECT OVERVIEW
████████████████████████████████████████████████ -->
<div data-sec="overview" style="${$({padding:'30px 46px',background:C.bg,'border-bottom':`1px solid ${C.bd}`})}">
  ${SEC('04','Project Overview',C.gd)}
  <div style="${$({display:'grid','grid-template-columns':'1fr 1fr',gap:'14px','margin-bottom':'16px'})}">
    <!-- Client info -->
    <div style="${$({background:C.wh,border:`1px solid ${C.bd}`,'border-radius':'10px',padding:'16px 18px'})}">
      <div style="${$({'font-size':'8px','font-weight':'700',color:C.t3,'text-transform':'uppercase','letter-spacing':'1px','margin-bottom':'12px'})}">Client Details</div>
      ${IR('Client Name',`${D.sal} ${D.cust}`)}
      ${IR('Location',`${D.dist?D.dist+', ':''} ${sd.name}`)}
      ${IR('DISCOM',D.discom||sd.discom||'—')}
      ${IR('Consumer Category',D.categ||'—')}
      ${IR('Monthly Consumption',`${D.cons} kWh`,true)}
    </div>
    <!-- Project scope -->
    <div style="${$({background:C.wh,border:`1px solid ${C.bd}`,'border-radius':'10px',padding:'16px 18px'})}">
      <div style="${$({'font-size':'8px','font-weight':'700',color:C.t3,'text-transform':'uppercase','letter-spacing':'1px','margin-bottom':'12px'})}">Project Scope</div>
      ${IR('System Type',D.stype==='hybrid'?'Hybrid On-Grid':'Grid-Connected On-Grid')}
      ${IR('Plant Capacity',`${D.cap} kWp`)}
      ${IR('Roof Area Required',`${D.area} sq.ft`)}
      ${IR('Expected Annual Output',`${fmtN(Math.round(aGen(D.cap)))} kWh`)}
      ${IR('System Validity',`${D.validity} Days from ${D.qdateStr}`,true)}
    </div>
  </div>
  <!-- Objectives -->
  <div style="${$({background:C.wh,border:`1px solid ${C.bd}`,'border-radius':'10px',padding:'16px 18px'})}">
    <div style="${$({'font-size':'8px','font-weight':'700',color:C.t3,'text-transform':'uppercase','letter-spacing':'1px','margin-bottom':'12px'})}">Project Objectives</div>
    <div style="${$({display:'grid','grid-template-columns':'repeat(3,1fr)',gap:'10px'})}">
      ${[
        ['💰','Cost Savings','Reduce electricity bills by 70–90% through solar generation and net metering'],
        ['🔋','Energy Security','Ensure uninterrupted power supply '+(D.stype==='hybrid'?'with battery backup':'with grid backup')],
        ['🌍','Sustainability','Reduce carbon footprint by '+co2Annual+' tonnes CO₂ per year'],
      ].map(([ic,t,d])=>`
      <div style="${$({'text-align':'center',padding:'12px 10px'})}">
        <div style="${$({'font-size':'24px','margin-bottom':'8px'})}">${ic}</div>
        <div style="${$({'font-size':'10.5px','font-weight':'700',color:C.nv,'margin-bottom':'5px'})}">${t}</div>
        <div style="${$({'font-size':'9.5px',color:C.t2,'line-height':'1.6'})}">${d}</div>
      </div>`).join('')}
    </div>
  </div>
</div>


<!-- ████████████████████████████████████████████████
     05 — TECHNICAL SPECIFICATIONS
████████████████████████████████████████████████ -->
<div data-sec="sysdesign" style="${$({padding:'30px 46px',background:C.wh,'border-bottom':`1px solid ${C.bd}`})}">
  ${SEC('05','Technical Specifications',C.gd)}
  <!-- 4 KPI cards -->
  <div style="${$({display:'grid','grid-template-columns':'repeat(4,1fr)',gap:'10px','margin-bottom':'16px'})}">
    ${KPI(`${D.cap} kWp`, 'DC Peak', 'System Capacity', C.nv)}
    ${KPI(fmtN(Math.round(mGen(D.cap))), 'kWh/Month', 'Est. Monthly Generation', C.tl)}
    ${KPI(fmtN(Math.round(aGen(D.cap))), 'kWh/Year', 'Annual Output', C.gr)}
    ${KPI(String(D.area), 'sq.ft', 'Roof Area Required', C.bl)}
    ${D.stype==='hybrid'?KPI(`${D.bkwh} kWh`,'Battery',D.btype||'LiFePO4',C.gd):''}
  </div>
  <!-- Component specs -->
  <div style="${$({background:C.bg,border:`1px solid ${C.bd}`,'border-radius':'10px',overflow:'hidden','margin-bottom':'14px'})}">
    <table style="width:100%;border-collapse:collapse">
      <thead><tr style="background:${C.nv}">
        <th style="${$({padding:'10px 14px','text-align':'left','font-size':'8px','text-transform':'uppercase','letter-spacing':'1px',color:'rgba(255,255,255,.6)','font-weight':'600',width:'30%'})}">Component</th>
        <th style="${$({padding:'10px 14px','text-align':'left','font-size':'8px','text-transform':'uppercase','letter-spacing':'1px',color:'rgba(255,255,255,.6)','font-weight':'600',width:'45%'})}">Specification</th>
        <th style="${$({padding:'10px 14px','text-align':'center','font-size':'8px','text-transform':'uppercase','letter-spacing':'1px',color:'rgba(255,255,255,.6)','font-weight':'600'})}">Warranty</th>
      </tr></thead>
      <tbody>
        ${[
          ['Solar PV Module',   `${D.pbrand||'As per approved make'} — ${D.pwp} Wp × ${D.pcount} Nos`, '10 yr Product + 25 yr Linear'],
          ['Inverter',          `${D.inv?D.inv.brand+' — '+D.inv.cap:'As per approved make'}`, '5–10 Year Manufacturer'],
          ['Mounting Structure','Hot-dip galvanized MS / Aluminium alloy, IS:875, wind-rated', '5 Year Structural'],
          ['DC Cables',         'TÜV certified, UV-resistant, 1500V, double insulation', 'As per IS:694'],
          ['Monitoring System', 'Wi-Fi/GSM data logger, real-time dashboard, mobile alerts', '1 Year'],
          ...(D.stype==='hybrid'?[['Battery Bank',`${D.bkwh} kWh — ${D.btype||'LiFePO4'} — ${D.bhrs}h Backup`,'5–10 Year']]:[]),
        ].map(([c,s,w],i)=>`
        <tr style="background:${i%2===0?C.wh:C.bg}">
          <td style="${$({padding:'10px 14px','font-weight':'700',color:C.nv,'font-size':'10.5px','border-bottom':`1px solid ${C.bd}`})}">${c}</td>
          <td style="${$({padding:'10px 14px',color:C.t2,'font-size':'10px','border-bottom':`1px solid ${C.bd}`,'line-height':'1.45'})}">${s}</td>
          <td style="${$({padding:'10px 14px','text-align':'center','font-size':'9px',color:C.gr,'font-weight':'600','border-bottom':`1px solid ${C.bd}`})}">${w}</td>
        </tr>`).join('')}
      </tbody>
    </table>
  </div>
  <!-- BOM -->
  <div style="${$({'font-size':'8px','font-weight':'700',color:C.t3,'text-transform':'uppercase','letter-spacing':'1px','margin-bottom':'10px'})}">Complete Bill of Materials</div>
  <div style="${$({border:`1px solid ${C.bd}`,'border-radius':'10px',overflow:'hidden'})}">
    <table style="width:100%;border-collapse:collapse">
      <thead><tr style="background:${C.nv}">
        ${['#','Description','Specification','Qty','Unit'].map((h,i)=>`
        <th style="${$({padding:'9px 12px','text-align':i>2?'center':'left','font-size':'8px','text-transform':'uppercase','letter-spacing':'1px',color:'rgba(255,255,255,.6)','font-weight':'600'})}">${h}</th>`).join('')}
      </tr></thead>
      <tbody>${bomHTML}</tbody>
    </table>
  </div>
</div>


<!-- ████████████████████████████████████████████████
     06 — FINANCIAL ANALYSIS
████████████████████████████████████████████████ -->
<div data-sec="financial" style="${$({padding:'30px 46px',background:C.bg,'border-bottom':`1px solid ${C.bd}`})}">
  ${SEC('06','Financial Analysis',C.gr)}

  <!-- 4 KPI cards -->
  <div style="${$({display:'grid','grid-template-columns':'repeat(4,1fr)',gap:'10px','margin-bottom':'14px'})}">
    ${KPI(inr(D.annSave),    'Annual', 'Bill Savings',  C.nv)}
    ${KPI(inr(D.annExport),  'Annual', 'Export Income', C.tl)}
    ${KPI(inr(D.annBen),     'Total Annual', 'Benefit', C.gr)}
    ${KPI(`${D.payback} yrs`,'Payback','Period',        C.gd)}
  </div>

  <!-- Long-term returns -->
  <div style="${$({display:'grid','grid-template-columns':'repeat(3,1fr)',gap:'10px','margin-bottom':'16px'})}">
    ${[[inr(D.cum25),'25-Year Cumulative Returns',C.gr],[`${D.roi25}%`,'25-Year Return on Investment',C.tl],[`${sd.tariffEsc}% p.a.`,'Electricity Tariff Escalation',C.gd]].map(([v,l,c])=>`
    <div style="${$({background:C.wh,border:`1px solid ${C.bd}`,'border-radius':'10px',padding:'14px 18px',display:'flex','align-items':'center',gap:'12px'})}">
      <div style="${$({width:'42px',height:'42px','border-radius':'8px',background:C.nv,display:'flex','align-items':'center','justify-content':'center','flex-shrink':'0','font-size':'18px'})}">📈</div>
      <div>
        <div style="${$({'font-size':'16px','font-weight':'700',color:c,'font-family':'Georgia,serif'})}">${v}</div>
        <div style="${$({'font-size':'9px',color:C.t3,'margin-top':'3px'})}">${l}</div>
      </div>
    </div>`).join('')}
  </div>

  <!-- Bill before/after comparison -->
  <div style="${$({background:C.wh,border:`1px solid ${C.bd}`,'border-radius':'10px',padding:'16px 20px','margin-bottom':'14px'})}">
    <div style="${$({'font-size':'8px','font-weight':'700',color:C.t3,'text-transform':'uppercase','letter-spacing':'1px','margin-bottom':'14px'})}">Monthly Bill Comparison</div>
    <div style="${$({display:'grid','grid-template-columns':'1fr auto 1fr',gap:'12px','align-items':'center'})}">
      <div>
        <div style="${$({'font-size':'8.5px',color:C.t3,'margin-bottom':'6px'})}">BEFORE SOLAR</div>
        <div style="${$({'font-size':'20px','font-weight':'700',color:C.or,'font-family':'Georgia,serif'})}">${inr(D.cons*(D.tariff||sd.avgTariff||5.5))}</div>
        <div style="${$({'font-size':'8.5px',color:C.t3,'margin-top':'3px'})}">per month @ ${D.tariff}/unit</div>
        <div style="${$({'margin-top':'10px',height:'20px',background:C.orL,'border-radius':'4px',position:'relative',overflow:'hidden'})}">
          <div style="position:absolute;left:0;top:0;bottom:0;width:100%;background:${C.or};border-radius:4px;opacity:0.8"></div>
        </div>
      </div>
      <div style="${$({'text-align':'center','font-size':'18px',color:C.gr,'font-weight':'700'})}">→</div>
      <div>
        <div style="${$({'font-size':'8.5px',color:C.t3,'margin-bottom':'6px'})}">AFTER SOLAR</div>
        <div style="${$({'font-size':'20px','font-weight':'700',color:C.gr,'font-family':'Georgia,serif'})}">${inr(Math.max(0,(D.cons-Math.round(mGen(D.cap)))*(D.tariff||sd.avgTariff||5.5)))}</div>
        <div style="${$({'font-size':'8.5px',color:C.t3,'margin-top':'3px'})}">estimated net bill</div>
        <div style="${$({'margin-top':'10px',height:'20px',background:C.grL,'border-radius':'4px',position:'relative',overflow:'hidden'})}">
          <div style="${$({position:'absolute',left:'0',top:'0',bottom:'0',width:Math.round(Math.max(0,(D.cons-Math.round(mGen(D.cap)))/D.cons)*100)+'%',background:C.gr,'border-radius':'4px',opacity:'0.8'})}"></div>
        </div>
      </div>
    </div>
  </div>

  <!-- 10-year projection table -->
  <div style="${$({background:C.wh,border:`1px solid ${C.bd}`,'border-radius':'10px',overflow:'hidden'})}">
    <div style="${$({padding:'10px 16px',background:C.bg,'border-bottom':`1px solid ${C.bd}`,'font-size':'8px','font-weight':'700',color:C.t3,'text-transform':'uppercase','letter-spacing':'1px'})}">10-Year Financial Projection</div>
    <table style="width:100%;border-collapse:collapse">
      <thead><tr style="background:${C.nv}">
        ${['Year','Generation','Annual Benefit','Cumulative','Net After Investment'].map((h,i)=>`
        <th style="${$({padding:'9px 12px','text-align':i===0?'left':'right','font-size':'8px','text-transform':'uppercase','letter-spacing':'1px',color:'rgba(255,255,255,.6)','font-weight':'600'})}">${h}</th>`).join('')}
      </tr></thead>
      <tbody>${finRows}</tbody>
    </table>
  </div>
</div>


<!-- ████████████████████████████████████████████████
     07 — ENVIRONMENTAL IMPACT
████████████████████████████████████████████████ -->
<div data-sec="env" style="${$({padding:'30px 46px',background:C.wh,'border-bottom':`1px solid ${C.bd}`})}">
  ${SEC('07','Environmental Impact',C.gr)}
  <div style="${$({display:'grid','grid-template-columns':'repeat(4,1fr)',gap:'12px','margin-bottom':'16px'})}">
    ${ISTAT('🌿',`${co2Annual}T`,'CO₂ Saved / Year',C.gr)}
    ${ISTAT('🌳',`${treesAnnual}`,'Trees Equivalent / Year',C.tl)}
    ${ISTAT('💚',`${co2Life}T`,'CO₂ Saved Over 25 Years',C.gr)}
    ${ISTAT('🌲',`${treesLife}`,'Trees Equivalent (25 Years)',C.tl)}
  </div>
  <div style="${$({background:`linear-gradient(135deg,${C.grL},${C.tlL})`,border:`1px solid ${C.bd}`,'border-radius':'10px',padding:'18px 22px'})}">
    <div style="${$({'font-size':'11px','font-weight':'700',color:C.nv,'margin-bottom':'12px','font-family':'Georgia,serif'})}">Your Contribution to a Greener India</div>
    <div style="${$({display:'grid','grid-template-columns':'repeat(3,1fr)',gap:'14px'})}">
      ${[
        ['☀️','Clean Energy',`${fmtN(Math.round(aGen(D.cap)*25))} kWh of clean electricity over 25 years — powering your premises without fossil fuels.`],
        ['🏭','Carbon Reduction',`Equivalent to removing ${Math.round(co2Annual/2.3)} cars off the road every year. A tangible contribution to India's climate goals.`],
        ['🌱','Green Legacy',`${co2Life} tonnes of CO₂ avoided and ${treesLife} trees equivalent planted — a legacy of sustainability.`],
      ].map(([ic,t,d])=>`
      <div>
        <div style="${$({'font-size':'20px','margin-bottom':'6px'})}">${ic}</div>
        <div style="${$({'font-size':'10.5px','font-weight':'700',color:C.gr,'margin-bottom':'5px'})}">${t}</div>
        <div style="${$({'font-size':'9.5px',color:C.t2,'line-height':'1.65'})}">${d}</div>
      </div>`).join('')}
    </div>
  </div>
</div>


<!-- ████████████████████████████████████████████████
     08 — GOVERNMENT SUBSIDY & INCENTIVES
████████████████████████████████████████████████ -->
<div data-sec="subsidy" style="${$({padding:'30px 46px',background:C.bg,'border-bottom':`1px solid ${C.bd}`})}">
  ${SEC('08','Government Subsidy & Incentives',C.gd)}
  ${subSection}
</div>


<!-- ████████████████████████████████████████████████
     09 — NET METERING & GRID CONNECTION
████████████████████████████████████████████████ -->
<div data-sec="netmetering" style="${$({padding:'30px 46px',background:C.wh,'border-bottom':`1px solid ${C.bd}`})}">
  ${SEC('09','Net Metering & Grid Connection',C.tl)}
  <div style="${$({display:'grid','grid-template-columns':'1fr 1fr',gap:'14px'})}">
    <div style="${$({background:C.bg,'border-radius':'10px',padding:'18px',border:`1px solid ${C.bd}`,'border-top':`3px solid ${C.tl}`})}">
      <div style="${$({'font-weight':'700',color:C.nv,'font-size':'11.5px','margin-bottom':'14px','font-family':'Georgia,serif'})}">Grid Connection — ${sd.name}</div>
      ${IR('DISCOM',D.discom||sd.discom||'—')}
      ${IR('Nodal Agency',`<span style="font-size:9.5px;line-height:1.4">${sd.agency}</span>`)}
      ${IR('Net Metering Limit',sd.netMeteringLimit)}
      ${IR('Connection Time',sd.connTime)}
      ${IR('Settlement',`<span style="font-size:9.5px;line-height:1.5">${sd.nmSettle}</span>`)}
      ${IR('Export Tariff (APPC)',`<span style="color:${C.gr};font-weight:700">₹${D.exportRate}/unit</span>`,true)}
    </div>
    <div style="${$({background:C.bg,'border-radius':'10px',padding:'18px',border:`1px solid ${C.bd}`,'border-top':`3px solid ${C.gd}`})}">
      <div style="${$({'font-weight':'700',color:C.nv,'font-size':'11.5px','margin-bottom':'14px','font-family':'Georgia,serif'})}">${sd.name} — Tariff Slabs</div>
      ${(sd.tariff||[]).map((t,i,a)=>IR(t.s,`<span style="font-weight:700;color:${C.nv}">${t.r}</span>`,i===a.length-1)).join('')}
      <div style="${$({'margin-top':'12px',padding:'10px 13px',background:C.gdL,'border-radius':'8px',display:'flex','justify-content':'space-between','align-items':'center'})}">
        <span style="${$({'font-size':'10.5px','font-weight':'700',color:C.nv})}">Avg. Grid Tariff</span>
        <span style="${$({'font-size':'15px','font-weight':'700',color:C.gd})}">${D.tariff}/unit</span>
      </div>
    </div>
  </div>
</div>


<!-- ████████████████████████████████████████████████
     10 — COST SUMMARY
████████████████████████████████████████████████ -->
<div data-sec="cost" style="${$({padding:'30px 46px',background:C.bg,'border-bottom':`1px solid ${C.bd}`})}">
  ${SEC('10','Cost Summary',C.gd)}

  <!-- Section A -->
  <div style="${$({'margin-bottom':'16px'})}">
    <div style="${$({'font-size':'9px','font-weight':'700',color:C.nv,'text-transform':'uppercase','letter-spacing':'1.2px','margin-bottom':'10px',padding:'7px 14px',background:C.wh,'border-radius':'6px','border-left':`4px solid ${C.nv}`})}">
      A — Project Cost (Payable to Enermass)
    </div>
    <div style="${$({background:C.wh,border:`1px solid ${C.bd}`,'border-radius':'10px',padding:'16px 20px'})}">
      ${IR('Plant Cost (Net after Discount)', inr(plantNet))}
      ${addAmt>0?IR(`Additional Cost${D.addCostDesc?' — '+D.addCostDesc:''}`,inr(addAmt)):''}
      <div style="${$({'margin-top':'12px',padding:'13px 18px',background:C.nv,'border-radius':'8px',display:'flex','justify-content':'space-between','align-items':'center'})}">
        <span style="${$({'font-size':'11px',color:C.wh,'font-weight':'700'})}">Total Project Cost</span>
        <span style="${$({'font-size':'18px','font-weight':'700',color:C.gd2,'font-family':'Georgia,serif'})}">${inr(totalProj)}</span>
      </div>
    </div>
  </div>

  <!-- Section B -->
  <div>
    <div style="${$({'font-size':'9px','font-weight':'700',color:C.gr,'text-transform':'uppercase','letter-spacing':'1.2px','margin-bottom':'10px',padding:'7px 14px',background:C.grL,'border-radius':'6px','border-left':`4px solid ${C.gr}`})}">
      B — Customer Financial Commitment
    </div>
    <div style="${$({background:C.nv,'border-radius':'12px',padding:'22px 24px',position:'relative',overflow:'hidden'})}">
      <div style="position:absolute;top:-40px;right:-40px;width:160px;height:160px;border-radius:50%;background:rgba(201,148,10,.1)"></div>
      ${DR('Plant Price (Net after Discount + Additional Costs)', inr(totalProj))}
      ${DR('Taxable Value', inr(taxableVal), true)}
      ${DR('GST (Blended @ 8.9%)', inr(totalGST), true)}
      ${disc>0?DR('Effective Discount Allowed','− '+inr(disc),false,'#FFAAAA'):''}
      ${totalSub>0?DR(`Government Subsidy (CFA ${inr(D.cfa)} + State ${inr(D.ssub||0)})`,'− '+inr(totalSub),false,'#7DD3FC'):''}
      <div style="${$({'margin-top':'14px',padding:'16px 20px',background:'rgba(26,122,66,.2)',border:'2px solid rgba(26,122,66,.4)','border-radius':'10px'})}">
        <div style="${$({display:'flex','justify-content':'space-between','align-items':'center'})}">
          <div>
            <div style="${$({'font-size':'8px','text-transform':'uppercase','letter-spacing':'1.2px',color:'rgba(134,239,172,.9)','font-weight':'700','margin-bottom':'4px'})}">💰 Customer Financial Commitment</div>
            <div style="${$({'font-size':'8.5px',color:'rgba(255,255,255,.35)'})}">Total Project Cost − Subsidy − Discount</div>
          </div>
          <div style="${$({'font-size':'24px','font-weight':'700',color:'#86EFAC','font-family':'Georgia,serif'})}">${inr(custCommit)}</div>
        </div>
        <div style="${$({'font-size':'8.5px','font-style':'italic',color:'rgba(134,239,172,.65)','text-align':'right','margin-top':'6px'})}">${numberToIndianCurrencyWords(custCommit)}</div>
      </div>
      <div style="${$({'margin-top':'12px','font-size':'8.5px',color:'rgba(255,255,255,.3)','line-height':'1.7','padding-top':'12px','border-top':'1px dashed rgba(255,255,255,.1)'})}">
        GST @ 8.9% blended per MNRE Govt. notification. Discount included in Total Plant Price. Subsidy reduces customer commitment only. All prices in INR.
      </div>
    </div>
    <div style="${$({'margin-top':'12px',padding:'10px 16px',background:C.gdL,'border-radius':'8px',display:'flex','align-items':'center',gap:'10px'})}">
      <span style="${$({'font-size':'9px',color:C.t3})}">📅 Proposal Valid Until</span>
      <strong style="${$({'font-size':'11px',color:C.nv})}">${D.duedateStr} (${D.validity} Days)</strong>
    </div>
  </div>

  ${D.subon&&totalSub>0?`
  <div style="${$({'margin-top':'14px',background:C.blL,border:`1.5px solid #93C5FD`,'border-radius':'10px',padding:'15px 20px',display:'flex','justify-content':'space-between','align-items':'center','flex-wrap':'wrap',gap:'10px'})}">
    <div>
      <div style="${$({'font-weight':'700',color:C.bl,'font-size':'11px','margin-bottom':'4px'})}">🏛 Government Subsidy (CFA + State)</div>
      <div style="${$({'font-size':'10px',color:C.t2})}">Credited directly by Government post-commissioning. Reduces only customer financial commitment.</div>
    </div>
    <div style="text-align:right">
      <div style="${$({'font-size':'22px','font-weight':'700',color:C.bl,'font-family':'Georgia,serif'})}">${inr(totalSub)}</div>
      <div style="${$({'font-size':'8.5px',color:C.t3})}">CFA ${inr(D.cfa)} + State ${inr(D.ssub||0)}</div>
    </div>
  </div>`:''}
</div>


<!-- ████████████████████████████████████████████████
     11 — PROJECT EXECUTION TIMELINE
████████████████████████████████████████████████ -->
<div data-sec="execution" style="${$({padding:'30px 46px',background:C.wh,'border-bottom':`1px solid ${C.bd}`})}">
  ${SEC('11','Project Execution Plan',C.bl)}
  <!-- Timeline -->
  <div style="${$({'margin-bottom':'16px'})}">
    <div style="${$({display:'grid','grid-template-columns':'repeat(5,1fr)',gap:'0',position:'relative'})}">
      <!-- connecting line -->
      <div style="position:absolute;top:20px;left:10%;right:10%;height:2px;background:linear-gradient(to right,${C.gd},${C.tl},${C.bl});z-index:0"></div>
      ${[
        ['📋','Week 1–2',   'Site Survey & System Design','Detailed site assessment, structural analysis, SLD preparation'],
        ['🛒','Week 2–4',   'Material Procurement',       'Component ordering, quality check, factory testing'],
        ['🏗','Week 4–6',   'Installation',               'MMS, panels, inverter, DC/AC cabling, earthing'],
        ['⚡','Week 6–7',   'Testing & Commissioning',    'String test, IR test, inverter configuration, trial run'],
        ['📄','Week 7–10',  'Net Metering & Handover',    'DISCOM application, meter installation, owner training'],
      ].map(([ic,w,t,d],i)=>`
      <div style="${$({'text-align':'center',padding:'0 6px',position:'relative','z-index':'1'})}">
        <div style="${$({width:'40px',height:'40px','border-radius':'50%',background:C.nv,display:'flex','align-items':'center','justify-content':'center','margin':'0 auto 8px','font-size':'16px','box-shadow':'0 3px 10px rgba(10,31,60,.25)'})}">${ic}</div>
        <div style="${$({'font-size':'8px','font-weight':'700',color:C.gd,'margin-bottom':'4px'})}">${w}</div>
        <div style="${$({'font-size':'9.5px','font-weight':'700',color:C.nv,'margin-bottom':'4px','line-height':'1.3'})}">${t}</div>
        <div style="${$({'font-size':'8.5px',color:C.t3,'line-height':'1.5'})}">${d}</div>
      </div>`).join('')}
    </div>
  </div>

  <!-- Payment schedule table -->
  <div style="${$({'font-size':'8px','font-weight':'700',color:C.t3,'text-transform':'uppercase','letter-spacing':'1px','margin-bottom':'10px'})}">Payment Schedule</div>
  <div style="${$({border:`1px solid ${C.bd}`,'border-radius':'10px',overflow:'hidden'})}">
    <table style="width:100%;border-collapse:collapse">
      <thead><tr style="background:${C.nv}">
        <th style="${$({padding:'9px 14px','text-align':'left','font-size':'8px','text-transform':'uppercase','letter-spacing':'1px',color:'rgba(255,255,255,.6)','font-weight':'600'})}">Milestone</th>
        <th style="${$({padding:'9px 14px','text-align':'center','font-size':'8px','text-transform':'uppercase','letter-spacing':'1px',color:'rgba(255,255,255,.6)','font-weight':'600'})}">%</th>
        <th style="${$({padding:'9px 14px','text-align':'right','font-size':'8px','text-transform':'uppercase','letter-spacing':'1px',color:'rgba(255,255,255,.6)','font-weight':'600'})}">Amount</th>
        <th style="${$({padding:'9px 14px','text-align':'left','font-size':'8px','text-transform':'uppercase','letter-spacing':'1px',color:'rgba(255,255,255,.6)','font-weight':'600'})}">Timing</th>
      </tr></thead>
      <tbody>
        ${[
          ['Advance / Mobilization','50%',Math.round(custCommit*0.5),'On order confirmation'],
          ['Pre-Dispatch','40%',Math.round(custCommit*0.4),'Before material dispatch'],
          ['Commissioning & Handover','10%',Math.round(custCommit*0.1),'On successful commissioning'],
        ].map(([m,p,a,t],i)=>`
        <tr style="background:${i%2===0?C.wh:C.bg}">
          <td style="${$({padding:'9px 14px','font-weight':'600',color:C.t1,'font-size':'10.5px','border-bottom':`1px solid ${C.bd}`})}">${m}</td>
          <td style="${$({padding:'9px 14px','text-align':'center','font-weight':'700',color:C.gd,'font-size':'10.5px','border-bottom':`1px solid ${C.bd}`})}">${p}</td>
          <td style="${$({padding:'9px 14px','text-align':'right','font-weight':'700',color:C.nv,'font-size':'10.5px','border-bottom':`1px solid ${C.bd}`})}">${inr(a)}</td>
          <td style="${$({padding:'9px 14px',color:C.t2,'font-size':'10px','border-bottom':`1px solid ${C.bd}`})}">${t}</td>
        </tr>`).join('')}
      </tbody>
    </table>
  </div>
</div>


<!-- ████████████████████████████████████████████████
     12 — TERMS & CONDITIONS
████████████████████████████████████████████████ -->
<div data-sec="tnc" style="${$({padding:'30px 46px',background:C.bg,'border-bottom':`1px solid ${C.bd}`})}">
  ${SEC('12','Terms & Conditions',C.t3)}
  <div style="${$({background:C.wh,border:`1px solid ${C.bd}`,'border-radius':'10px',padding:'8px 18px'})}">
    <div style="${$({'font-size':'9px',color:C.t3,padding:'8px 0','border-bottom':`1px dashed ${C.bd}`,'margin-bottom':'4px'})}">
      General T&amp;C applicable to all projects &nbsp;·&nbsp; ${sd.name}-specific T&amp;C additionally applicable
    </div>
    ${tncRaw.map((l,i)=>`
    <div style="${$({display:'flex',gap:'14px','font-size':'10.5px',color:C.t2,'line-height':'1.7',padding:'6px 0','border-bottom':`1px dashed ${C.bd}`})}">
      <span style="${$({'font-size':'9px',color:C.t4,'min-width':'22px','flex-shrink':'0','padding-top':'2px'})}">${String(i+1).padStart(2,'0')}</span>
      <span>${l.replace(/^\d+\.\s*/,'')}</span>
    </div>`).join('')}
  </div>
</div>


<!-- ████████████████████████████████████████████████
     13 — WHY SOLAR / WHY ENERMASS
████████████████████████████████████████████████ -->
<div data-sec="solar-info" style="${$({padding:'30px 46px',background:`linear-gradient(145deg,#EBF5FB,#EAFAF1)`,'border-bottom':`1px solid ${C.bd}`})}">
  ${SEC('13','Why Solar Power? Why Enermass?',C.gr)}
  <div style="${$({display:'grid','grid-template-columns':'1fr 1fr',gap:'12px','margin-bottom':'14px'})}">
    ${[
      ['☀️','Benefits of Solar Power',C.gd,['Reduce electricity bills by 70–90%','25-year system lifespan, minimal maintenance','Protection against rising electricity tariffs','Earn income via net metering & grid export','Increase your property value significantly','Zero carbon emissions — clean energy future']],
      ['🏅','Why Choose Enermass?',   C.tl,['MNRE Empanelled EPC Contractor',`${co['cp-exp']||'10+'} years of solar expertise`,`${co['cp-proj']||'500+'} successful installations pan-India`,`${co['cp-mw']||'15 MW+'} aggregate capacity commissioned`,'End-to-end DISCOM liaison & net metering','ISO 9001:2015 certified quality processes']],
      ['🔧','Warranty & Performance', C.bl,['Solar panels: 25-year linear power warranty','Inverter: 5–10 years manufacturer warranty','Structure: 10-year structural warranty','Workmanship: 2-year installation warranty','MNRE certified Tier-1 manufacturers','BIS / IEC certified components']],
      ['🤝','Customer Support',       C.gr,['Dedicated project manager assigned','Timely DISCOM & net metering support','Post-installation commissioning & testing','Annual performance monitoring report','Responsive support via call / WhatsApp',co.phone||'Contact us for support queries']],
    ].map(([ic,t,c,items])=>`
    <div style="${$({background:C.wh,'border-radius':'10px',padding:'16px 18px',border:`1px solid ${C.bd}`,'border-top':`4px solid ${c}`})}">
      <div style="${$({'font-weight':'700',color:C.nv,'font-size':'11.5px','margin-bottom':'12px',display:'flex','align-items':'center',gap:'8px','font-family':'Georgia,serif'})}"><span>${ic}</span>${t}</div>
      ${items.map(it=>`
      <div style="${$({display:'flex','align-items':'flex-start',gap:'9px','font-size':'10.5px',color:C.t2,'line-height':'1.65',padding:'3px 0'})}">
        <span style="${$({color:c,'flex-shrink':'0','font-weight':'700','margin-top':'1px'})}">✓</span>
        <span>${it}</span>
      </div>`).join('')}
    </div>`).join('')}
  </div>
  <div style="${$({background:C.nv,'border-radius':'10px',padding:'14px 22px',display:'flex','justify-content':'space-between','align-items':'center','flex-wrap':'wrap',gap:'10px'})}">
    <span style="${$({'font-size':'10.5px',color:C.wh,'font-weight':'600'})}">🌱 Site Survey → System Design → DISCOM Application → Installation → Net Metering → Commissioning</span>
    <span style="${$({'font-size':'10.5px',color:C.gd2,'font-weight':'700'})}">${co.phone||''} ${co.email?'&nbsp;·&nbsp; '+co.email:''} ${co.web?'&nbsp;·&nbsp; '+co.web:''}</span>
  </div>
</div>


<!-- ████████████████████████████████████████████████
     SIGNATURE BLOCK
████████████████████████████████████████████████ -->
<div style="${$({padding:'24px 46px',display:'flex','justify-content':'space-between','align-items':'flex-end',background:C.wh,'border-top':`2px solid ${C.bd}`})}">
  <div>
    <div style="height:42px"></div>
    <div style="${$({display:'inline-block','border-top':`2px solid ${C.nv}`,'padding-top':'8px'})}">
      <div style="${$({'font-weight':'700',color:C.nv,'font-size':'12px','font-family':'Georgia,serif'})}">${D.sal} ${D.cust}</div>
      <div style="${$({'font-size':'10px',color:C.t3,'margin-top':'2px'})}">Customer Acceptance</div>
    </div>
  </div>
  <div style="text-align:center">
    <div style="font-size:30px;line-height:1">☀️</div>
    <div style="${$({'font-size':'9.5px',color:C.gd,'font-weight':'700','margin-top':'5px','font-family':'Georgia,serif'})}">Solar Power Plant Proposal</div>
    <div style="${$({'font-size':'8.5px',color:C.t3,'margin-top':'2px','font-family':'Arial,sans-serif'})}">${D.refno}</div>
    <div style="${$({'font-size':'8px',color:C.t4,'margin-top':'2px'})}">Valid: ${D.duedateStr}</div>
  </div>
  <div style="text-align:right">
    <div style="height:42px"></div>
    <div style="${$({display:'inline-block','border-top':`2px solid ${C.nv}`,'padding-top':'8px','text-align':'left'})}">
      ${D.salesExec?`
      <div style="${$({'font-weight':'700',color:C.nv,'font-size':'12px','font-family':'Georgia,serif'})}">${D.salesExec.name}</div>
      <div style="${$({'font-size':'10px',color:C.t2,'margin-top':'2px'})}">${D.salesExec.desig||'Sales Executive'}</div>
      <div style="${$({'font-size':'9.5px',color:C.t3,'margin-top':'2px'})}">${co.name||'Enermass Power Solutions Pvt. Ltd.'}</div>
      ${D.salesExec.phone?`<div style="${$({'font-size':'9px',color:C.t3,'margin-top':'2px'})}">${D.salesExec.phone}</div>`:''}
      `:`
      <div style="${$({'font-weight':'700',color:C.nv,'font-size':'12px','font-family':'Georgia,serif'})}">Authorised Signatory</div>
      <div style="${$({'font-size':'9.5px',color:C.t3,'margin-top':'2px'})}">${co.name||'Enermass Power Solutions Pvt. Ltd.'}</div>
      `}
    </div>
  </div>
</div>`;
}
