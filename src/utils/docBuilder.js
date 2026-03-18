import { inr, fmtN, mGen, aGen, bomQty, numberToIndianCurrencyWords } from './helpers';
import { SD, DEFAULT_BRANCHES } from '../data/defaults';

/* ─── PROFESSIONAL SOLAR PROPOSAL — DESIGN SYSTEM ────────────────────
   Philosophy: Clean, confident, data-forward. Think McKinsey meets Tesla.
   - Deep navy authority + warm gold accent + clean white space
   - Strong typographic hierarchy — no decoration for its own sake
   - Every element earns its place on the page
   ─────────────────────────────────────────────────────────────────── */

const C = {
  navy:   '#0A1F3C',   navyM: '#0F2D56',   navyL: '#1A3D6B',
  gold:   '#C9940A',   goldL: '#F5E9C8',   goldB: '#E8AB1A',
  teal:   '#0B8C74',   tealL: '#D4F0EB',
  green:  '#1A7A42',   greenL:'#D5EFDF',
  blue:   '#1458A6',   blueL: '#D8E8F8',
  red:    '#B91C1C',
  bg:     '#F6F8FB',   bg2:   '#ECEEF2',
  border: '#D1D9E6',
  t1:     '#0A1520',   t2:    '#2E3D52',   t3:    '#64748B',
  white:  '#FFFFFF',
};

// Inline style builder
const $ = o => Object.entries(o).map(([k,v])=>`${k}:${v}`).join(';');

// ─── ATOM COMPONENTS ─────────────────────────────────────────────────

// Section heading with number badge + line
const SH = (n,t,accent=C.gold) => `
<div style="${$({display:'flex','align-items':'center',gap:'12px','margin-bottom':'22px','padding-bottom':'14px','border-bottom':`2px solid ${C.border}`})}">
  <div style="${$({width:'32px',height:'32px','border-radius':'8px',background:C.navy,display:'flex','align-items':'center','justify-content':'center','flex-shrink':'0'})}">
    <span style="${$({'font-size':'9px','font-weight':'700',color:accent,'letter-spacing':'0','font-family':'Arial, sans-serif'})}">${n}</span>
  </div>
  <span style="${$({'font-size':'15px','font-weight':'700',color:C.navy,'letter-spacing':'-0.3px','font-family':'Georgia, serif'})}">${t}</span>
  <div style="${$({flex:'1',height:'1px',background:`linear-gradient(to right,${accent}80,transparent)`,'margin-left':'8px'})}"></div>
</div>`;

// KPI stat box — fixed function signature
const KPI = (val, unit, label, accent=C.navy) => `
<div style="${$({background:C.white,border:`1px solid ${C.border}`,'border-radius':'10px',padding:'16px 12px','text-align':'center','border-top':`3px solid ${accent}`})}">
  <div style="${$({'font-size':'18px','font-weight':'700',color:accent,'line-height':'1','margin-bottom':'4px','font-family':'Arial, sans-serif'})}">${val}</div>
  <div style="${$({'font-size':'8px',color:C.t3,'text-transform':'uppercase','letter-spacing':'0.8px','margin-bottom':'6px','font-family':'Arial, sans-serif'})}">${unit}</div>
  <div style="${$({'font-size':'10px',color:C.t2,'font-weight':'600','font-family':'Arial, sans-serif'})}">${label}</div>
</div>`;

// Info pair row
const IR = (lbl, val, last=false) => `
<div style="${$({display:'flex','justify-content':'space-between','align-items':'flex-start',padding:'7px 0','border-bottom':last?'none':`1px solid ${C.border}`,gap:'8px'})}">
  <span style="${$({'font-size':'10px',color:C.t3,'min-width':'130px','flex-shrink':'0','font-family':'Arial, sans-serif'})}">${lbl}</span>
  <span style="${$({'font-size':'10.5px',color:C.t1,'font-weight':'600','text-align':'right','line-height':'1.4','font-family':'Arial, sans-serif'})}">${val}</span>
</div>`;

// ─── PAGE FOOTER (injected on every page via server footerTemplate) ──
// Footer is handled by Puppeteer — see server.js

export function buildDoc(D) {
  const sd  = D.sd || SD[D.state];
  const co  = D.co || {};
  const fromAddr = (co.branches||{})[D.state] || DEFAULT_BRANCHES[D.state] || co.addr || '';
  const addrLine = fromAddr ? fromAddr.replace(/\n/g,' · ') : (co.addr||'').replace(/\n/g,' · ');
  const sysLabel = D.stype === 'hybrid'
    ? 'Hybrid Solar Power Plant (Grid-Tied + Battery Backup)'
    : 'Grid-Connected Rooftop Solar Power Plant (Net Metering)';

  const logoHTML = co.logo
    ? `<img src="${co.logo}" style="height:50px;max-width:160px;object-fit:contain;display:block" alt="${co.name||''}" crossorigin="anonymous">`
    : '';

  // ── BOM ────────────────────────────────────────────────────────────
  let bomHTML='', lastCat='', sn=0;
  (D.bom||[]).filter(x=>x.sys==='all'||x.sys===D.stype).forEach(item=>{
    if(item.cat!==lastCat){
      bomHTML+=`<tr><td colspan="5" style="${$({background:C.navy,color:C.goldB,'font-size':'8.5px','font-weight':'700','text-transform':'uppercase','letter-spacing':'1.2px',padding:'7px 14px'})}">  ${item.cat}</td></tr>`;
      lastCat=item.cat;
    }
    sn++;
    const qty=bomQty(item,D), bg=sn%2===0?C.bg:C.white;
    bomHTML+=`<tr style="background:${bg}">
      <td style="${$({padding:'8px 10px','text-align':'center',color:C.t3,'font-size':'9px','border-bottom':`1px solid ${C.border}`})}">${String(sn).padStart(2,'0')}</td>
      <td style="${$({padding:'8px 12px','font-weight':'600',color:C.t1,'font-size':'10px','border-bottom':`1px solid ${C.border}`,'line-height':'1.4'})}">${item.desc}</td>
      <td style="${$({padding:'8px 12px','font-size':'9.5px',color:C.t2,'border-bottom':`1px solid ${C.border}`,'line-height':'1.5'})}">${item.spec}</td>
      <td style="${$({padding:'8px 10px','text-align':'center','font-weight':'700',color:C.navy,'font-size':'10px','border-bottom':`1px solid ${C.border}`})}">${qty}</td>
      <td style="${$({padding:'8px 10px','text-align':'center',color:C.t3,'font-size':'9.5px','border-bottom':`1px solid ${C.border}`})}">${item.unit}</td>
    </tr>`;
  });

  // ── Financial rows ─────────────────────────────────────────────────
  let finRows='', cum=0;
  for(let y=1;y<=10;y++){
    const yb=D.annBen*Math.pow(1+(sd.tariffEsc/100),y-1)*Math.pow(0.995,y);
    cum+=yb; const net=cum-D.commit, bg=y%2===0?C.bg:C.white;
    finRows+=`<tr style="background:${bg}">
      <td style="${$({padding:'8px 12px',color:C.t1,'font-size':'10px','border-bottom':`1px solid ${C.border}`,'font-weight':'600'})}">Year ${y}</td>
      <td style="${$({padding:'8px 12px','text-align':'right',color:C.t2,'font-size':'10px','border-bottom':`1px solid ${C.border}`})}">${fmtN(Math.round(D.agen*Math.pow(0.995,y)))} kWh</td>
      <td style="${$({padding:'8px 12px','text-align':'right',color:C.t1,'font-size':'10px','border-bottom':`1px solid ${C.border}`,'font-weight':'600'})}">${inr(yb)}</td>
      <td style="${$({padding:'8px 12px','text-align':'right',color:C.blue,'font-size':'10px','border-bottom':`1px solid ${C.border}`,'font-weight':'600'})}">${inr(cum)}</td>
      <td style="${$({padding:'8px 12px','text-align':'right','font-size':'10px','border-bottom':`1px solid ${C.border}`,'font-weight':'700',color:net>0?C.green:C.t3})}">${net>0?inr(net):'—'}</td>
    </tr>`;
  }

  // ── T&C ────────────────────────────────────────────────────────────
  const tnc=D.tnc||{};
  const tncRaw=[...(tnc.common||'').split('\n').filter(l=>l.trim()),...(tnc[D.state]||'').split('\n').filter(l=>l.trim())];

  // ── Letter body ────────────────────────────────────────────────────
  const ltrBody=D.lbody||`We, ${co.name||'Enermass Power Solutions Pvt. Ltd.'}, are pleased to present this comprehensive techno-commercial Solar Power Plant Proposal for your premises. This proposal has been prepared after careful analysis of your energy requirements, site conditions, and prevailing regulations under applicable state solar regulations.\n\nOur solution is engineered to significantly reduce your electricity bills, provide energy security, and ensure full compliance with the local DISCOM and the Ministry of New and Renewable Energy (MNRE), Government of India. The system is designed to maximise benefits under the PM Surya Ghar: Muft Bijli Yojana and applicable state incentives.\n\nEnermass Power Solutions Pvt. Ltd. brings extensive experience and hundreds of successful installations across India. Our qualified engineers and MNRE-empanelled technicians ensure a seamless end-to-end experience from system design to net metering connectivity.\n\nWe invite you to review this Solar Power Plant Proposal and look forward to the opportunity to serve you. Please feel free to contact us for any clarifications.`;

  // ── Incentives ─────────────────────────────────────────────────────
  const incHTML=(sd.inc||[]).map((x,i,a)=>IR(x.i,`<span style="color:${C.teal};font-weight:700">${x.v}</span>`,i===a.length-1)).join('');

  // ── Subsidy section ────────────────────────────────────────────────
  const subSection = D.subon ? `
<div style="${$({background:C.navy,'border-radius':'10px',padding:'18px 22px','margin-bottom':'14px',display:'flex','justify-content':'space-between','align-items':'center','flex-wrap':'wrap',gap:'14px'})}">
  <div>
    <div style="${$({'font-size':'8px',color:'rgba(255,255,255,0.5)','text-transform':'uppercase','letter-spacing':'1.5px','margin-bottom':'6px'})}">Central Financial Assistance — MNRE</div>
    <div style="${$({'font-size':'14px',color:C.white,'font-weight':'700','margin-bottom':'4px','font-family':'Georgia, serif'})}">PM Surya Ghar: Muft Bijli Yojana (CFA)</div>
    <div style="${$({'font-size':'9px',color:'rgba(255,255,255,0.4)'})}">Formula: 30,000×min(S,2) + 18,000×max(0,min(S−2,1))</div>
  </div>
  <div style="text-align:right">
    <div style="${$({'font-size':'24px',color:C.goldB,'font-weight':'700','font-family':'Arial, sans-serif'})}">${D.cfa>0?inr(D.cfa):'N/A'}</div>
    <div style="${$({'font-size':'8.5px',color:'rgba(255,255,255,0.4)','margin-top':'3px'})}">${D.ptype==='Residential'?'CFA Applicable':'Not Applicable'}</div>
  </div>
</div>
<div style="${$({display:'grid','grid-template-columns':'1fr 1fr',gap:'12px'})}">
  <div style="${$({background:C.bg,'border-radius':'10px',padding:'16px',border:`1px solid ${C.border}`,'border-top':`3px solid ${C.gold}`})}">
    <div style="${$({'font-size':'8px','font-weight':'700',color:C.t3,'text-transform':'uppercase','letter-spacing':'1px','margin-bottom':'12px'})}">MNRE CFA Structure</div>
    ${IR('Up to 2 kWp',`<span style="color:${C.gold};font-weight:700">₹30,000/kW</span>`)}
    ${IR('2–3 kWp (incremental)',`<span style="color:${C.gold};font-weight:700">₹18,000/kW</span>`)}
    ${IR('Max for individual',`<span style="color:${C.gold};font-weight:700">₹78,000</span>`)}
    ${IR('System Size',`${D.cap} kWp`)}
    ${IR('Proposal Type',D.ptype,true)}
    <div style="${$({'margin-top':'12px',padding:'10px 12px',background:C.goldL,'border-radius':'8px','border-left':`4px solid ${C.gold}`,display:'flex','justify-content':'space-between','align-items':'center'})}">
      <span style="${$({'font-size':'10px','font-weight':'700',color:C.navy})}">CFA Subsidy</span>
      <span style="${$({'font-size':'13px','font-weight':'700',color:C.gold})}">${D.cfa>0?inr(D.cfa):'Not Applicable'}</span>
    </div>
  </div>
  <div style="${$({background:C.bg,'border-radius':'10px',padding:'16px',border:`1px solid ${C.border}`,'border-top':`3px solid ${C.teal}`})}">
    <div style="${$({'font-size':'8px','font-weight':'700',color:C.t3,'text-transform':'uppercase','letter-spacing':'1px','margin-bottom':'10px'})}">${sd.name} — State Incentives</div>
    <div style="${$({'font-size':'10px',color:C.t2,'margin-bottom':'10px','padding-bottom':'8px','border-bottom':`1px solid ${C.border}`})}"><strong>Nodal Agency:</strong> ${sd.agency}</div>
    ${incHTML}
    ${D.ssub>0?`<div style="${$({'margin-top':'12px',padding:'10px 12px',background:C.tealL,'border-radius':'8px','border-left':`4px solid ${C.teal}`,display:'flex','justify-content':'space-between','align-items':'center'})}"><span style="${$({'font-size':'10px','font-weight':'700',color:C.navy})}">State Subsidy</span><span style="${$({'font-size':'13px','font-weight':'700',color:C.teal})}">${inr(D.ssub)}</span></div>`:''}
  </div>
</div>` : `<div style="${$({background:C.blueL,'border-left':`4px solid ${C.blue}`,'border-radius':'0 8px 8px 0',padding:'12px 16px','font-size':'11px',color:C.blue})}">Subsidy not applicable for this project type.</div>`;

  // ── Cost data ──────────────────────────────────────────────────────
  const plantNet    = D.price;             // net after discount
  const addAmt      = D.addCostAmt || 0;
  const totalProj   = D.totalProj;         // plant + add
  const taxableVal  = D.taxableVal;
  const totalGST    = D.totalGST;
  const disc        = D.disc || 0;
  const totalSub    = D.subon ? (D.tsub||0) : 0;
  const custCommit  = D.commit;

  // Dark cost row (white text)
  const DR = (lbl, val, dim=false, accent='') => `
<div style="${$({display:'flex','justify-content':'space-between','align-items':'center',padding:'9px 0'})}">
  <span style="${$({'font-size':'10.5px',color:dim?'rgba(255,255,255,0.5)':accent||'rgba(255,255,255,0.85)'})}}">${lbl}</span>
  <span style="${$({'font-size':'11px',color:accent||C.white,'font-weight':dim?'400':'600','font-family':'Arial, sans-serif'})}">${val}</span>
</div>
<div style="height:1px;background:rgba(255,255,255,0.07)"></div>`;

  return `
<!-- ════════════════════════════════════════════════
     COVER PAGE
════════════════════════════════════════════════ -->
<div style="${$({background:C.navy,position:'relative',overflow:'hidden','min-height':'320px'})}">

  <!-- Subtle geometric accent -->
  <div style="position:absolute;top:-80px;right:-80px;width:320px;height:320px;border-radius:50%;background:rgba(201,148,10,0.08);pointer-events:none"></div>
  <div style="position:absolute;bottom:-60px;left:-60px;width:260px;height:260px;border-radius:50%;background:rgba(255,255,255,0.03);pointer-events:none"></div>
  <!-- Gold top line -->
  <div style="position:absolute;top:0;left:0;right:0;height:4px;background:linear-gradient(90deg,${C.gold},${C.goldB},rgba(201,148,10,0.1))"></div>

  <!-- Header: logo + company + ref box -->
  <div style="${$({padding:'28px 44px 0',display:'flex','justify-content':'space-between','align-items':'flex-start',position:'relative','z-index':'1'})}">
    <div style="${$({display:'flex','align-items':'flex-start',gap:'14px'})}">
      ${logoHTML ? `<div style="flex-shrink:0">${logoHTML}</div>` : ''}
      <div>
        <div style="${$({'font-size':'16px',color:C.white,'font-weight':'700','letter-spacing':'-0.3px','line-height':'1.2','font-family':'Georgia, serif'})}">${co.name||'Enermass Power Solutions Pvt. Ltd.'}</div>
        <div style="${$({'font-size':'8px',color:C.goldB,'letter-spacing':'2.5px','text-transform':'uppercase','margin-top':'5px','font-weight':'600'})}">${co.tag||'Integrated Solar & Power Engineering Solutions'}</div>
        <div style="${$({'font-size':'8.5px',color:'rgba(255,255,255,0.3)','margin-top':'7px','line-height':'1.8'})}">
          ${addrLine}${addrLine?'<br>':''}${co.phone||''}${co.email?' &nbsp;·&nbsp; '+co.email:''}${co.web?' &nbsp;·&nbsp; '+co.web:''}
        </div>
      </div>
    </div>

    <!-- Reference box: gold -->
    <div style="${$({background:`linear-gradient(135deg,${C.gold},${C.goldB})`,'border-radius':'10px',padding:'14px 18px','text-align':'right','flex-shrink':'0','min-width':'155px','box-shadow':'0 8px 32px rgba(201,148,10,0.4)'})}">
      <div style="${$({'font-size':'7px','font-weight':'700','text-transform':'uppercase','letter-spacing':'1.5px',color:C.navy,'opacity':'0.6','margin-bottom':'5px'})}">Proposal Ref.</div>
      <div style="${$({'font-size':'11px','font-weight':'700',color:C.navy,'line-height':'1.3','letter-spacing':'-0.2px','font-family':'Arial, sans-serif'})}">${D.refno}</div>
      <div style="${$({'font-size':'8.5px',color:C.navy,'margin-top':'8px','opacity':'0.65'})}">Date: ${D.qdateStr}</div>
      <div style="${$({'font-size':'8.5px',color:C.navy,'opacity':'0.65','margin-top':'2px'})}">Valid: ${D.duedateStr}</div>
    </div>
  </div>

  <!-- Main hero content -->
  <div style="${$({padding:'36px 44px 40px',position:'relative','z-index':'1'})}">
    <div style="${$({'font-size':'8px',color:C.goldB,'letter-spacing':'3px','text-transform':'uppercase','font-weight':'600','margin-bottom':'14px','opacity':'0.85'})}">
      Techno-Commercial Proposal &nbsp;·&nbsp; ${sd.name} &nbsp;·&nbsp; ${D.ptype}
    </div>

    <!-- BIG bold title -->
    <div style="${$({'font-size':'38px',color:C.white,'font-weight':'900','line-height':'1.0','letter-spacing':'-1.5px','font-family':'Georgia, serif','margin-bottom':'0'})}">Solar Power</div>
    <div style="${$({'font-size':'38px',color:C.goldB,'font-weight':'900','line-height':'1.0','letter-spacing':'-1.5px','font-family':'Georgia, serif','margin-bottom':'14px'})}">Plant Proposal</div>

    <div style="${$({'font-size':'11px',color:'rgba(255,255,255,0.45)','max-width':'500px','line-height':'1.7','margin-bottom':'24px'})}">${sysLabel}</div>

    <!-- Tags / pills -->
    <div style="${$({display:'flex',gap:'8px','flex-wrap':'wrap'})}">
      ${[`${D.cap} kWp System`, sd.name, `${D.sal} ${D.cust}`, D.ptype,
         ...(D.stype==='hybrid'?[`${D.bkwh} kWh Battery`]:[]),
         `Valid ${D.validity} Days`].map(t=>`
        <div style="${$({background:'rgba(255,255,255,0.1)',border:'1px solid rgba(255,255,255,0.18)',padding:'5px 14px','border-radius':'20px','font-size':'9px',color:'rgba(255,255,255,0.9)',display:'inline-flex','align-items':'center',gap:'7px'})}">
          <span style="width:5px;height:5px;border-radius:50%;background:${C.goldB};display:inline-block;flex-shrink:0"></span>${t}
        </div>`).join('')}
    </div>
  </div>
</div>


<!-- ════════════════════════════════════════════════
     01 — INTRODUCTION LETTER
════════════════════════════════════════════════ -->
<div data-sec="letter" style="${$({padding:'30px 44px',background:C.white,'border-bottom':`1px solid ${C.border}`})}">
  ${SH('01','Introduction Letter',C.gold)}
  <div style="${$({background:C.goldL,'border-left':`5px solid ${C.gold}`,'border-radius':'0 10px 10px 0',padding:'22px 26px'})}">
    <div style="${$({'margin-bottom':'16px','font-size':'11px',color:C.t1,'line-height':'1.9'})}">
      <div style="${$({'font-weight':'700','font-size':'11px',color:C.t1})}">To,</div>
      <div style="${$({'margin-top':'4px',color:C.t2})}">${D.sal} ${D.cust}${D.billaddr?'<br>'+D.billaddr.replace(/\n/g,'<br>'):''}</div>
    </div>
    <div style="${$({'font-size':'9.5px',color:C.t3,'margin-bottom':'16px','padding-bottom':'14px','border-bottom':`1px dashed ${C.border}`})}">
      Date: <strong style="color:${C.t1}">${D.qdateStr}</strong> &nbsp;|&nbsp;
      Ref: <strong style="color:${C.t1}">${D.refno}</strong> &nbsp;|&nbsp;
      Valid Until: <strong style="color:${C.t1}">${D.duedateStr}</strong>
    </div>
    <div style="${$({'font-weight':'700','font-size':'11px',color:C.navy,'margin-bottom':'14px','font-family':'Georgia, serif'})}">
      Sub: Solar Power Plant Proposal — ${D.cap} kWp ${D.stype==='hybrid'?'Hybrid':'On-Grid'} System — ${sd.name}
    </div>
    <div style="${$({'font-weight':'700','margin-bottom':'14px','font-size':'11px',color:C.t1})}">Dear ${D.sal} ${(D.cust||'').split(' ')[0]||'Sir/Madam'},</div>
    ${ltrBody.split('\n').filter(l=>l.trim()).map(p=>`<p style="${$({'margin-bottom':'12px','line-height':'1.85','font-size':'11px',color:C.t2})}">${p}</p>`).join('')}
    <div style="${$({'margin-top':'26px','padding-top':'18px','border-top':`1px solid rgba(201,148,10,0.4)`})}">
      <div style="${$({'margin-bottom':'26px','font-size':'11px',color:C.t2})}">Yours faithfully,</div>
      ${co.sigImg?`<div style="margin-bottom:10px"><img src="${co.sigImg}" style="max-height:48px;width:auto;display:block" alt="Signature"></div>`:'<div style="height:44px"></div>'}
      <div style="${$({display:'inline-block','border-top':`2px solid ${C.navy}`,'padding-top':'8px'})}">
        <div style="${$({'font-weight':'700',color:C.navy,'font-size':'12px','font-family':'Georgia, serif'})}">Mr. Manoj M S</div>
        <div style="${$({'font-size':'10px',color:C.t2,'margin-top':'2px'})}">Chief Executive Officer</div>
        <div style="${$({'font-size':'9.5px',color:C.t3,'margin-top':'2px'})}">${co.name||'Enermass Power Solutions Pvt. Ltd.'}</div>
      </div>
    </div>
  </div>
</div>


<!-- ════════════════════════════════════════════════
     02 — COMPANY PROFILE
════════════════════════════════════════════════ -->
<div data-sec="company" style="${$({padding:'30px 44px',background:C.bg,'border-bottom':`1px solid ${C.border}`})}">
  ${SH('02','Company Profile',C.teal)}
  <div style="${$({display:'grid','grid-template-columns':'1fr 1fr',gap:'8px','margin-bottom':'14px'})}">
    ${[
      ['Company',        co.name||'—'],
      ['CIN / Reg. No.', co.cin||'—'],
      ['GST Number',     co.gst||'—'],
      ['PAN',            co.pan||'—'],
      ['Phone',          co.phone||'—'],
      ['Email',          co.email||'—'],
      ['Website',        co.web||'—'],
      ['Address',        (fromAddr||co.addr||'').replace(/\n/g,', ')],
    ].map(([l,v])=>`
    <div style="${$({background:C.white,border:`1px solid ${C.border}`,'border-radius':'8px',padding:'11px 14px'})}">
      <div style="${$({'font-size':'7.5px',color:C.t3,'text-transform':'uppercase','letter-spacing':'0.8px','font-weight':'700','margin-bottom':'4px'})}">${l}</div>
      <div style="${$({'font-size':'11px',color:C.t1,'font-weight':'600','line-height':'1.45'})}">${v}</div>
    </div>`).join('')}
  </div>
  <div style="${$({background:C.white,border:`1px solid ${C.border}`,'border-radius':'8px',padding:'14px 18px','margin-bottom':'14px'})}">
    <div style="${$({'font-weight':'700',color:C.navy,'font-size':'11px','margin-bottom':'8px','font-family':'Georgia, serif'})}">Business Activities</div>
    <div style="${$({'font-size':'10.5px',color:C.t2,'line-height':'1.8'})}">${co['cp-biz']||''}${co['cp-areas']?`<br><strong>Service Areas:</strong> ${co['cp-areas']}`:''}${co['cp-certs']?`<br><strong>Certifications:</strong> ${co['cp-certs']}`:''}${co['cp-notes']?`<br>${co['cp-notes']}`:''}</div>
  </div>
  <div style="${$({display:'grid','grid-template-columns':'repeat(3,1fr)',gap:'10px'})}">
    ${[
      [co['cp-exp']?.split(' ')[0]||'10+',  'Years',    'Experience',   C.gold],
      [co['cp-proj']?.split(' ')[0]||'500+','Projects', 'Commissioned', C.teal],
      [co['cp-mw']?.split(' ')[0]||'15',    'MW',       'Installed',    C.blue],
    ].map(([v,u,l,c])=>`
    <div style="${$({background:C.navy,'border-radius':'10px',padding:'18px 14px','text-align':'center'})}">
      <div style="${$({'font-size':'24px',color:c,'font-weight':'700','line-height':'1','font-family':'Georgia, serif'})}">${v}</div>
      <div style="${$({'font-size':'8px',color:'rgba(255,255,255,0.4)','text-transform':'uppercase','letter-spacing':'0.7px','margin-top':'3px'})}">${u}</div>
      <div style="${$({'font-size':'10px',color:'rgba(255,255,255,0.65)','margin-top':'4px'})}">${l}</div>
    </div>`).join('')}
  </div>
</div>


<!-- ════════════════════════════════════════════════
     03 — CUSTOMER PROFILE
════════════════════════════════════════════════ -->
<div data-sec="customer" style="${$({padding:'30px 44px',background:C.white,'border-bottom':`1px solid ${C.border}`})}">
  ${SH('03','Customer Profile',C.blue)}
  <div style="${$({border:`1px solid ${C.border}`,'border-radius':'10px',overflow:'hidden'})}">
    <div style="${$({display:'grid','grid-template-columns':'repeat(3,1fr)'})}">
      ${[
        ['Name',             `${D.sal} ${D.cust}`],
        ['Phone',            D.phone||'—'],
        ['Email',            D.email||'—'],
        ['State / District', `${sd.name}${D.dist?' / '+D.dist:''}`],
        ['Pin Code',         D.pin||'—'],
        ['DISCOM',           D.discom||sd.discom||'—'],
        ['Address',          D.billaddr?.replace(/\n/g,', ')||'—'],
        ['Site Address',     D.site?.replace(/\n/g,', ')||'—'],
        ['Meter / Consumer No.', D.meter||'—'],
        ['Consumer Category', D.categ||'—'],
        ['System Type',      D.ptype],
        ['Installation State', sd.name],
      ].map(([l,v],i)=>`
      <div style="${$({padding:'11px 15px',background:Math.floor(i/3)%2===0?C.white:C.bg,'border-right':i%3<2?`1px solid ${C.border}`:'none','border-bottom':i<9?`1px solid ${C.border}`:'none'})}">
        <div style="${$({'font-size':'7.5px',color:C.t3,'text-transform':'uppercase','letter-spacing':'0.7px','margin-bottom':'4px'})}">${l}</div>
        <div style="${$({'font-size':'11px',color:C.t1,'font-weight':'600','line-height':'1.35'})}">${v}</div>
      </div>`).join('')}
    </div>
  </div>
</div>


<!-- ════════════════════════════════════════════════
     04 — SYSTEM DESIGN
════════════════════════════════════════════════ -->
<div data-sec="sysdesign" style="${$({padding:'30px 44px',background:C.bg,'border-bottom':`1px solid ${C.border}`})}">
  ${SH('04','System Design & Specifications',C.gold)}
  <div style="${$({display:'grid','grid-template-columns':'repeat(4,1fr)',gap:'10px','margin-bottom':'16px'})}">
    ${KPI(`${D.cap} kWp`, 'DC Peak', 'System Capacity', C.navy)}
    ${KPI(fmtN(mGen(D.cap)), 'kWh/Month', 'Est. Generation', C.teal)}
    ${KPI(fmtN(aGen(D.cap)), 'kWh/Year', 'Annual Output', C.green)}
    ${KPI(String(D.area), 'sq.ft', 'Roof Area', C.blue)}
    ${D.stype==='hybrid' ? KPI(`${D.bkwh} kWh`, 'Battery', D.btype||'LiFePO4', C.gold) : ''}
  </div>
  <div style="${$({background:C.white,border:`1px solid ${C.border}`,'border-radius':'10px',overflow:'hidden'})}">
    <table style="width:100%;border-collapse:collapse">
      <thead><tr style="background:${C.navy}">
        <th style="${$({padding:'10px 14px','text-align':'left','font-size':'8px','text-transform':'uppercase','letter-spacing':'1px',color:'rgba(255,255,255,0.6)','font-weight':'600',width:'35%'})}">Component</th>
        <th style="${$({padding:'10px 14px','text-align':'left','font-size':'8px','text-transform':'uppercase','letter-spacing':'1px',color:'rgba(255,255,255,0.6)','font-weight':'600'})}">Specification</th>
      </tr></thead>
      <tbody>
        ${[
          ['Solar PV Module',   `${D.pbrand||'As per approved make'} — ${D.pwp} Wp × ${D.pcount} Nos`],
          ['Inverter',          `${D.inv?D.inv.brand+' — '+D.inv.cap:'As per approved make'}`],
          ['System Type',       sysLabel],
          ...(D.stype==='hybrid'?[['Battery Bank',`${D.bkwh} kWh — ${D.btype||'LiFePO4'} — ${D.bhrs}h Backup`]]:[]),
          ['Monthly Consumption',`${D.cons} kWh/Month`],
        ].map(([c,s],i)=>`
        <tr style="background:${i%2===0?C.white:C.bg}">
          <td style="${$({padding:'10px 14px','font-weight':'700',color:C.navy,'font-size':'10.5px','border-bottom':`1px solid ${C.border}`})}">${c}</td>
          <td style="${$({padding:'10px 14px',color:C.t2,'font-size':'10.5px','border-bottom':`1px solid ${C.border}`})}">${s}</td>
        </tr>`).join('')}
      </tbody>
    </table>
  </div>
</div>


<!-- ════════════════════════════════════════════════
     05 — BILL OF MATERIALS
════════════════════════════════════════════════ -->
<div data-sec="bom" style="${$({padding:'30px 44px',background:C.white,'border-bottom':`1px solid ${C.border}`})}">
  ${SH('05','Bill of Materials',C.gold)}
  <div style="${$({border:`1px solid ${C.border}`,'border-radius':'10px',overflow:'hidden'})}">
    <table style="width:100%;border-collapse:collapse">
      <thead><tr style="background:${C.navy}">
        ${['#','Description','Specification','Qty','Unit'].map((h,i)=>`
        <th style="${$({padding:'10px 12px','text-align':i>2?'center':'left','font-size':'8px','text-transform':'uppercase','letter-spacing':'1px',color:'rgba(255,255,255,0.6)','font-weight':'600'})}">${h}</th>`).join('')}
      </tr></thead>
      <tbody>${bomHTML}</tbody>
    </table>
  </div>
</div>


<!-- ════════════════════════════════════════════════
     06 — GOVERNMENT SUBSIDY
════════════════════════════════════════════════ -->
<div data-sec="subsidy" style="${$({padding:'30px 44px',background:C.bg,'border-bottom':`1px solid ${C.border}`})}">
  ${SH('06','Government Subsidy & Incentives',C.gold)}
  ${subSection}
</div>


<!-- ════════════════════════════════════════════════
     07 — NET METERING
════════════════════════════════════════════════ -->
<div data-sec="netmetering" style="${$({padding:'30px 44px',background:C.white,'border-bottom':`1px solid ${C.border}`})}">
  ${SH('07','Net Metering & Grid Connection',C.teal)}
  <div style="${$({display:'grid','grid-template-columns':'1fr 1fr',gap:'14px'})}">
    <div style="${$({background:C.bg,'border-radius':'10px',padding:'18px',border:`1px solid ${C.border}`,'border-top':`3px solid ${C.teal}`})}">
      <div style="${$({'font-weight':'700',color:C.navy,'font-size':'11px','margin-bottom':'14px','font-family':'Georgia, serif'})}">Grid Connection — ${sd.name}</div>
      ${IR('DISCOM', D.discom||sd.discom||'—')}
      ${IR('Nodal Agency', `<span style="font-size:9.5px;line-height:1.4">${sd.agency}</span>`)}
      ${IR('Net Metering Limit', sd.netMeteringLimit)}
      ${IR('Connection Time', sd.connTime)}
      ${IR('Settlement', `<span style="font-size:9px;line-height:1.5">${sd.nmSettle}</span>`)}
      ${IR('Export Tariff (APPC)', `<span style="color:${C.green};font-weight:700">₹${D.exportRate}/unit</span>`, true)}
    </div>
    <div style="${$({background:C.bg,'border-radius':'10px',padding:'18px',border:`1px solid ${C.border}`,'border-top':`3px solid ${C.gold}`})}">
      <div style="${$({'font-weight':'700',color:C.navy,'font-size':'11px','margin-bottom':'14px','font-family':'Georgia, serif'})}">${sd.name} — Electricity Tariff Slabs</div>
      ${(sd.tariff||[]).map((t,i,a)=>IR(t.s,`<span style="font-weight:700;color:${C.navy}">${t.r}</span>`,i===a.length-1)).join('')}
      <div style="${$({'margin-top':'12px',padding:'10px 12px',background:C.goldL,'border-radius':'8px',display:'flex','justify-content':'space-between','align-items':'center'})}">
        <span style="${$({'font-size':'10px','font-weight':'700',color:C.navy})}">Avg. Grid Tariff</span>
        <span style="${$({'font-size':'14px','font-weight':'700',color:C.gold})}">${D.tariff}/unit</span>
      </div>
    </div>
  </div>
</div>


<!-- ════════════════════════════════════════════════
     08 — FINANCIAL ANALYSIS
════════════════════════════════════════════════ -->
<div data-sec="financial" style="${$({padding:'30px 44px',background:C.bg,'border-bottom':`1px solid ${C.border}`})}">
  ${SH('08','Financial Analysis',C.green)}

  <!-- 4 KPI cards -->
  <div style="${$({display:'grid','grid-template-columns':'repeat(4,1fr)',gap:'10px','margin-bottom':'14px'})}">
    ${KPI(inr(D.annSave),  'Annual',       'Bill Savings',   C.navy)}
    ${KPI(inr(D.annExport),'Annual',       'Export Income',  C.teal)}
    ${KPI(inr(D.annBen),   'Total Annual', 'Benefit',        C.green)}
    ${KPI(`${D.payback} yrs`, 'Payback',   'Period',         C.gold)}
  </div>

  <!-- Summary metrics -->
  <div style="${$({display:'grid','grid-template-columns':'repeat(3,1fr)',gap:'10px','margin-bottom':'16px'})}">
    ${[
      [inr(D.cum25),    '25-Year Returns',  C.green],
      [`${D.roi25}%`,   '25-Year ROI',      C.teal],
      [`${sd.tariffEsc}% p.a.`,'Tariff Escalation', C.gold],
    ].map(([v,l,c])=>`
    <div style="${$({background:C.white,border:`1px solid ${C.border}`,'border-radius':'10px',padding:'14px 16px',display:'flex','align-items':'center',gap:'13px'})}">
      <div style="${$({width:'40px',height:'40px','border-radius':'8px',background:C.navy,display:'flex','align-items':'center','justify-content':'center','flex-shrink':'0','font-size':'16px'})}">📈</div>
      <div>
        <div style="${$({'font-size':'16px','font-weight':'700',color:c,'font-family':'Georgia, serif'})}">${v}</div>
        <div style="${$({'font-size':'8.5px',color:C.t3,'text-transform':'uppercase','letter-spacing':'0.5px','margin-top':'2px'})}">${l}</div>
      </div>
    </div>`).join('')}
  </div>

  <!-- 10yr table -->
  <div style="${$({background:C.white,border:`1px solid ${C.border}`,'border-radius':'10px',overflow:'hidden'})}">
    <table style="width:100%;border-collapse:collapse">
      <thead><tr style="background:${C.navy}">
        ${['Year','Generation','Annual Benefit','Cumulative','Net (After Investment)'].map((h,i)=>`
        <th style="${$({padding:'10px 12px','text-align':i===0?'left':'right','font-size':'8px','text-transform':'uppercase','letter-spacing':'1px',color:'rgba(255,255,255,0.6)','font-weight':'600'})}">${h}</th>`).join('')}
      </tr></thead>
      <tbody>${finRows}</tbody>
    </table>
  </div>
</div>


<!-- ════════════════════════════════════════════════
     09 — COST SUMMARY
════════════════════════════════════════════════ -->
<div data-sec="cost" style="${$({padding:'30px 44px',background:C.white,'border-bottom':`1px solid ${C.border}`})}">
  ${SH('09','Cost Summary',C.gold)}

  <!-- SECTION A: Project Cost -->
  <div style="${$({'margin-bottom':'16px'})}">
    <div style="${$({'font-size':'9px','font-weight':'700',color:C.navy,'text-transform':'uppercase','letter-spacing':'1.2px','margin-bottom':'10px',padding:'7px 14px',background:C.bg,'border-radius':'6px','border-left':`4px solid ${C.navy}`})}">
      A — Project Cost (Payable to Enermass)
    </div>
    <div style="${$({background:C.white,border:`1px solid ${C.border}`,'border-radius':'10px',padding:'16px 20px'})}">
      ${IR('Plant Cost (Net after Discount)', inr(plantNet))}
      ${addAmt>0 ? IR(`Additional Cost${D.addCostDesc?' — '+D.addCostDesc:''}`, inr(addAmt)) : ''}
      <!-- Total Project Cost — dark highlight -->
      <div style="${$({'margin-top':'12px',padding:'13px 18px',background:C.navy,'border-radius':'8px',display:'flex','justify-content':'space-between','align-items':'center'})}">
        <span style="${$({'font-size':'11px',color:C.white,'font-weight':'700'})}">Total Project Cost</span>
        <span style="${$({'font-size':'16px','font-weight':'700',color:C.goldB,'font-family':'Georgia, serif'})}">${inr(totalProj)}</span>
      </div>
    </div>
  </div>

  <!-- SECTION B: Customer Commitment -->
  <div>
    <div style="${$({'font-size':'9px','font-weight':'700',color:C.green,'text-transform':'uppercase','letter-spacing':'1.2px','margin-bottom':'10px',padding:'7px 14px',background:C.greenL,'border-radius':'6px','border-left':`4px solid ${C.green}`})}">
      B — Customer Financial Commitment
    </div>

    <!-- Dark gradient box -->
    <div style="${$({background:C.navy,'border-radius':'12px',padding:'22px 24px',position:'relative',overflow:'hidden'})}">
      <div style="position:absolute;top:-40px;right:-40px;width:150px;height:150px;border-radius:50%;background:rgba(201,148,10,0.1)"></div>

      ${DR('Plant Price (Net after Discount + Additional Costs)', inr(totalProj))}
      ${DR('Taxable Value', inr(taxableVal), true)}
      ${DR('GST (Blended @ 8.9%)', inr(totalGST), true)}
      ${disc>0 ? DR('Effective Discount Allowed', `− ${inr(disc)}`, false, '#FFAAAA') : ''}
      ${totalSub>0 ? DR(`Government Subsidy (CFA ${inr(D.cfa)} + State ${inr(D.ssub||0)})`, `− ${inr(totalSub)}`, false, '#7DD3FC') : ''}

      <!-- Commitment highlight -->
      <div style="${$({'margin-top':'16px',padding:'16px 20px',background:'rgba(26,122,66,0.2)',border:'2px solid rgba(26,122,66,0.4)','border-radius':'10px',position:'relative','z-index':'1'})}">
        <div style="${$({display:'flex','justify-content':'space-between','align-items':'center'})}">
          <div>
            <div style="${$({'font-size':'8px','text-transform':'uppercase','letter-spacing':'1.2px',color:'rgba(134,239,172,0.9)','font-weight':'700','margin-bottom':'4px'})}">💰 Customer Financial Commitment</div>
            <div style="${$({'font-size':'8.5px',color:'rgba(255,255,255,0.35)'})}">${addAmt>0?'Plant Price + Additional Cost − Subsidy − Discount':'Total Plant Price − Subsidy'}</div>
          </div>
          <div style="${$({'font-size':'22px','font-weight':'700',color:'#86EFAC','font-family':'Georgia, serif'})}">${inr(custCommit)}</div>
        </div>
        <div style="${$({'font-size':'8.5px','font-style':'italic',color:'rgba(134,239,172,0.65)','text-align':'right','margin-top':'6px'})}">${numberToIndianCurrencyWords(custCommit)}</div>
      </div>

      <!-- Note -->
      <div style="${$({'margin-top':'12px','font-size':'8.5px',color:'rgba(255,255,255,0.3)','line-height':'1.7','padding-top':'12px','border-top':'1px dashed rgba(255,255,255,0.1)'})}">
        GST @ 8.9% blended per MNRE Govt. notification. Discount included in Total Plant Price. Subsidy reduces customer commitment only. All prices in INR.
      </div>
    </div>

    <!-- Validity -->
    <div style="${$({'margin-top':'12px',padding:'10px 16px',background:C.goldL,'border-radius':'8px',display:'flex','align-items':'center',gap:'10px'})}">
      <span style="${$({'font-size':'9px',color:C.t3})}">📅 Proposal Valid Until</span>
      <strong style="${$({'font-size':'11px',color:C.navy})}">${D.duedateStr} (${D.validity} Days)</strong>
    </div>
  </div>

  <!-- Subsidy info card -->
  ${D.subon&&totalSub>0?`
  <div style="${$({'margin-top':'14px',background:C.blueL,border:`1.5px solid #93C5FD`,'border-radius':'10px',padding:'15px 20px',display:'flex','justify-content':'space-between','align-items':'center','flex-wrap':'wrap',gap:'10px'})}">
    <div>
      <div style="${$({'font-weight':'700',color:C.blue,'font-size':'11px','margin-bottom':'4px'})}">🏛 Government Subsidy (CFA + State)</div>
      <div style="${$({'font-size':'10px',color:C.t2})}">Credited directly by Government post-commissioning. Reduces only customer financial commitment.</div>
    </div>
    <div style="text-align:right">
      <div style="${$({'font-size':'20px','font-weight':'700',color:C.blue,'font-family':'Georgia, serif'})}">${inr(totalSub)}</div>
      <div style="${$({'font-size':'8.5px',color:C.t3})}">CFA ${inr(D.cfa)} + State ${inr(D.ssub||0)}</div>
    </div>
  </div>`:''}
</div>


<!-- ════════════════════════════════════════════════
     10 — TERMS & CONDITIONS
════════════════════════════════════════════════ -->
<div data-sec="tnc" style="${$({padding:'30px 44px',background:C.bg,'border-bottom':`1px solid ${C.border}`})}">
  ${SH('10','Terms & Conditions',C.t3)}
  <div style="${$({background:C.white,border:`1px solid ${C.border}`,'border-radius':'10px',padding:'8px 18px'})}">
    <div style="${$({'font-size':'9px',color:C.t3,padding:'8px 0','border-bottom':`1px dashed ${C.border}`,'margin-bottom':'4px'})}">
      General T&amp;C applicable to all projects &nbsp;·&nbsp; ${sd.name}-specific T&amp;C additionally applicable
    </div>
    ${tncRaw.map((l,i)=>`
    <div style="${$({display:'flex',gap:'14px','font-size':'10.5px',color:C.t2,'line-height':'1.7',padding:'6px 0','border-bottom':`1px dashed ${C.border}`})}">
      <span style="${$({'font-size':'8.5px',color:C.t3,'min-width':'22px','padding-top':'2px','flex-shrink':'0','font-family':'Arial, sans-serif'})}">${String(i+1).padStart(2,'0')}</span>
      <span>${l.replace(/^\d+\.\s*/,'')}</span>
    </div>`).join('')}
  </div>
</div>


<!-- ════════════════════════════════════════════════
     11 — WHY SOLAR / WHY ENERMASS
════════════════════════════════════════════════ -->
<div data-sec="solar-info" style="${$({padding:'30px 44px',background:`linear-gradient(145deg,#EBF5FB,#EAFAF1)`,'border-bottom':`1px solid ${C.border}`})}">
  ${SH('11','Why Solar Power? Why Enermass?',C.green)}
  <div style="${$({display:'grid','grid-template-columns':'1fr 1fr',gap:'12px','margin-bottom':'14px'})}">
    ${[
      ['☀️','Benefits of Solar Power', C.gold, ['Reduce electricity bills by 70–90%','25-year lifespan, minimal maintenance','Protection against rising tariffs','Earn via net metering / grid export','Increase property value','Zero carbon emissions']],
      ['🏅','Why Choose Enermass?',   C.teal, ['MNRE Empanelled EPC Contractor',`${co['cp-exp']||'10+ Years'} of solar expertise`,`${co['cp-proj']||'500+'} successful installations`,`${co['cp-mw']||'15 MW+'} capacity commissioned`,'End-to-end DISCOM & net metering','ISO 9001:2015 quality certified']],
      ['🔧','Warranty & Performance', C.blue, ['25-year solar panel power warranty','5–10 years inverter manufacturer warranty','10-year structural warranty','2-year installation workmanship warranty','MNRE certified Tier-1 manufacturers','BIS / IEC certified components']],
      ['🤝','Customer Support',       C.green,['Dedicated project manager assigned','Timely DISCOM & net metering support','Post-installation commissioning','Annual performance monitoring report','Responsive — call / WhatsApp support',co.phone||'Contact us for support']],
    ].map(([ic,t,c,items])=>`
    <div style="${$({background:C.white,'border-radius':'10px',padding:'16px 18px',border:`1px solid ${C.border}`,'border-top':`3px solid ${c}`})}">
      <div style="${$({'font-weight':'700',color:C.navy,'font-size':'11px','margin-bottom':'12px',display:'flex','align-items':'center',gap:'8px','font-family':'Georgia, serif'})}"><span>${ic}</span>${t}</div>
      ${items.map(item=>`
      <div style="${$({display:'flex','align-items':'flex-start',gap:'9px','font-size':'10px',color:C.t2,'line-height':'1.65',padding:'3px 0'})}">
        <span style="${$({color:c,'flex-shrink':'0','font-weight':'700','margin-top':'1px'})}">✓</span>
        <span>${item}</span>
      </div>`).join('')}
    </div>`).join('')}
  </div>

  <!-- Process bar (dark) -->
  <div style="${$({background:C.navy,'border-radius':'10px',padding:'14px 22px',display:'flex','justify-content':'space-between','align-items':'center','flex-wrap':'wrap',gap:'10px'})}">
    <span style="${$({'font-size':'10px',color:C.white,'font-weight':'600'})}">🌱 Site Survey → System Design → DISCOM Application → Installation → Net Metering → Commissioning</span>
    <span style="${$({'font-size':'10px',color:C.goldB,'font-weight':'700'})}">${co.phone||''} ${co.email?'&nbsp;·&nbsp; '+co.email:''}</span>
  </div>
</div>


<!-- ════════════════════════════════════════════════
     SIGNATURE BLOCK
════════════════════════════════════════════════ -->
<div style="${$({padding:'24px 44px',display:'flex','justify-content':'space-between','align-items':'flex-end',background:C.white,'border-top':`2px solid ${C.border}`})}">
  <div>
    <div style="height:42px"></div>
    <div style="${$({display:'inline-block','border-top':`2px solid ${C.navy}`,'padding-top':'8px'})}">
      <div style="${$({'font-weight':'700',color:C.navy,'font-size':'12px','font-family':'Georgia, serif'})}">${D.sal} ${D.cust}</div>
      <div style="${$({'font-size':'10px',color:C.t3,'margin-top':'2px'})}">Customer Acceptance</div>
    </div>
  </div>
  <div style="text-align:center">
    <div style="font-size:28px;line-height:1">☀️</div>
    <div style="${$({'font-size':'9px',color:C.gold,'font-weight':'700','margin-top':'5px','font-family':'Georgia, serif'})}">Solar Power Plant Proposal</div>
    <div style="${$({'font-size':'8.5px',color:C.t3,'margin-top':'2px','font-family':'Arial, sans-serif'})}">${D.refno}</div>
  </div>
  <div style="text-align:right">
    <div style="height:42px"></div>
    <div style="${$({display:'inline-block','border-top':`2px solid ${C.navy}`,'padding-top':'8px','text-align':'left'})}">
      ${D.salesExec ? `
      <div style="${$({'font-weight':'700',color:C.navy,'font-size':'12px','font-family':'Georgia, serif'})}">${D.salesExec.name}</div>
      <div style="${$({'font-size':'10px',color:C.t2,'margin-top':'2px'})}">${D.salesExec.desig||'Sales Executive'}</div>
      <div style="${$({'font-size':'9.5px',color:C.t3,'margin-top':'2px'})}">${co.name||'Enermass Power Solutions Pvt. Ltd.'}</div>
      ${D.salesExec.phone?`<div style="${$({'font-size':'9px',color:C.t3,'margin-top':'2px'})}">${D.salesExec.phone}</div>`:''}
      ` : `
      <div style="${$({'font-weight':'700',color:C.navy,'font-size':'12px','font-family':'Georgia, serif'})}">Authorised Signatory</div>
      <div style="${$({'font-size':'9.5px',color:C.t3,'margin-top':'2px'})}">${co.name||'Enermass Power Solutions Pvt. Ltd.'}</div>
      `}
    </div>
  </div>
</div>`;
}
