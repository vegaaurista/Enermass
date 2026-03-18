import { inr, fmtN, mGen, aGen, bomQty, numberToIndianCurrencyWords } from './helpers';
import { SD, DEFAULT_BRANCHES } from '../data/defaults';

/* ─── DESIGN TOKENS ─────────────────────────────────────────────────
   Navy  #0B2545   Gold  #D4A017   Teal  #0E9F82   Green #1E8449
   Blue  #1B6CA8   BG    #F5F7FA   Bdr   #DDE3ED
   T1    #0D1B2A   T2    #3A4A5C   T3    #6E7F94   White #FFFFFF
   ───────────────────────────────────────────────────────────────── */
const NV='#0B2545', NV2='#122E54', GD='#D4A017', GL='#FEF9EC',
      TL='#0E9F82', TLL='#E6F9F5', GR='#1E8449', GRL='#EBF8F0',
      BL='#1B6CA8', BLL='#EBF3FB', BG='#F5F7FA', BD='#DDE3ED',
      T1='#0D1B2A', T2='#3A4A5C', T3='#6E7F94', WH='#FFFFFF';

// Inline-style builder
const S = o => Object.entries(o).map(([k,v])=>`${k}:${v}`).join(';');

// ─── REUSABLE COMPONENTS ──────────────────────────────────────────────

// Section header with numbered badge + gradient rule
const secH = (num, title, accent=GD) => `
<div style="${S({display:'flex','align-items':'center',gap:'14px','margin-bottom':'22px','padding-bottom':'14px','border-bottom':`3px solid ${BD}`})}">
  <div style="${S({width:'36px',height:'36px','border-radius':'10px',background:`linear-gradient(135deg,${NV},${NV2})`,display:'flex','align-items':'center','justify-content':'center','flex-shrink':'0','box-shadow':`0 4px 12px rgba(11,37,69,.25)`})}">
    <span style="${S({'font-family':"'Space Mono',monospace",'font-size':'.6rem',color:accent,'font-weight':'700','letter-spacing':'0'})}">${num}</span>
  </div>
  <span style="${S({'font-family':"'Outfit',sans-serif",'font-size':'1.08rem','font-weight':'700',color:NV,'letter-spacing':'-0.3px'})}">${title}</span>
  <div style="${S({flex:'1',height:'2px',background:`linear-gradient(to right,${accent}60,transparent)`,'margin-left':'4px'})}"></div>
</div>`;

// KPI stat card
const kpi = (val, unit, label, accent=NV) => `
<div style="${S({background:WH,border:`1px solid ${BD}`,'border-radius':'12px',padding:'14px 10px','text-align':'center','border-top':`4px solid ${accent}`})}">
  <div style="${S({'font-family':"'Space Mono',monospace",'font-size':'1.05rem','font-weight':'700',color:accent,'line-height':'1.1','margin-bottom':'3px'})}">${val}</div>
  <div style="${S({'font-size':'.58rem',color:T3,'text-transform':'uppercase','letter-spacing':'.7px','margin-bottom':'5px'})}">${unit}</div>
  <div style="${S({'font-size':'.72rem',color:T2,'font-weight':'500','line-height':'1.3'})}">${label}</div>
</div>`;

// Info row (label + value pair)
const row = (lbl, val, last=false, accent='') => `
<div style="${S({display:'flex','justify-content':'space-between','align-items':'flex-start',padding:'7px 0','border-bottom':last?'none':`1px solid ${BD}`,gap:'10px'})}">
  <span style="${S({'font-size':'.73rem',color:T3,'min-width':'140px','flex-shrink':'0','line-height':'1.5'})}">${lbl}</span>
  <span style="${S({'font-size':'.77rem',color:accent||T1,'font-weight':'600','text-align':'right','line-height':'1.5',flex:'1'})}">${val}</span>
</div>`;

export function buildDoc(D) {
  const sd  = D.sd || SD[D.state];
  const co  = D.co || {};
  const fromAddr = (co.branches||{})[D.state] || DEFAULT_BRANCHES[D.state] || co.addr || '';
  const sysLabel = D.stype==='hybrid'
    ? 'Hybrid Solar Power Plant (Grid-Tied + Battery Backup)'
    : 'Grid-Connected Rooftop Solar Power Plant (Net Metering)';
  const logoHTML = co.logo
    ? `<img src="${co.logo}" style="height:54px;max-width:170px;object-fit:contain;display:block" alt="${co.name||'Logo'}" crossorigin="anonymous">`
    : `<div style="${S({'font-size':'1.8rem','line-height':'1'})}">⚡</div>`;

  // ── BOM rows ──────────────────────────────────────────────────────
  let bomHTML='', lastCat='', sn=0;
  (D.bom||[]).filter(x=>x.sys==='all'||x.sys===D.stype).forEach(item=>{
    if(item.cat!==lastCat){
      bomHTML+=`<tr><td colspan="5" style="${S({background:NV,color:GD,'font-size':'.62rem','font-weight':'700','text-transform':'uppercase','letter-spacing':'1.2px',padding:'7px 14px'})}">  ${item.cat}</td></tr>`;
      lastCat=item.cat;
    }
    sn++;
    const qty=bomQty(item,D), bg=sn%2===0?BG:WH;
    bomHTML+=`<tr style="background:${bg}">
      <td style="${S({padding:'8px 10px','text-align':'center',color:T3,'font-size':'.69rem','font-family':"'Space Mono',monospace",'border-bottom':`1px solid ${BD}`})}">${String(sn).padStart(2,'0')}</td>
      <td style="${S({padding:'8px 12px','font-weight':'600',color:T1,'font-size':'.78rem','border-bottom':`1px solid ${BD}`,'line-height':'1.45'})}">${item.desc}</td>
      <td style="${S({padding:'8px 12px','font-size':'.71rem',color:T2,'border-bottom':`1px solid ${BD}`,'line-height':'1.5'})}">${item.spec}</td>
      <td style="${S({padding:'8px 10px','text-align':'center','font-weight':'700',color:NV,'font-family':"'Space Mono',monospace",'font-size':'.75rem','border-bottom':`1px solid ${BD}`})}">${qty}</td>
      <td style="${S({padding:'8px 10px','text-align':'center',color:T3,'font-size':'.71rem','border-bottom':`1px solid ${BD}`})}">${item.unit}</td>
    </tr>`;
  });

  // ── Financial 10yr rows ───────────────────────────────────────────
  let finRows='', cum=0;
  for(let y=1;y<=10;y++){
    const yb=D.annBen*Math.pow(1+(sd.tariffEsc/100),y-1)*Math.pow(0.995,y);
    cum+=yb; const net=cum-D.commit, bg=y%2===0?BG:WH;
    finRows+=`<tr style="background:${bg}">
      <td style="${S({padding:'8px 12px','font-weight':'600',color:T1,'font-size':'.78rem','border-bottom':`1px solid ${BD}`})}">Year ${y}</td>
      <td style="${S({padding:'8px 12px','text-align':'right','font-family':"'Space Mono',monospace",'font-size':'.73rem',color:T2,'border-bottom':`1px solid ${BD}`})}">${fmtN(Math.round(D.agen*Math.pow(0.995,y)))} kWh</td>
      <td style="${S({padding:'8px 12px','text-align':'right','font-family':"'Space Mono',monospace",'font-size':'.73rem',color:T1,'font-weight':'600','border-bottom':`1px solid ${BD}`})}">${inr(yb)}</td>
      <td style="${S({padding:'8px 12px','text-align':'right','font-family':"'Space Mono',monospace",'font-size':'.73rem',color:BL,'font-weight':'600','border-bottom':`1px solid ${BD}`})}">${inr(cum)}</td>
      <td style="${S({padding:'8px 12px','text-align':'right','font-family':"'Space Mono',monospace",'font-size':'.73rem','font-weight':'700',color:net>0?GR:T3,'border-bottom':`1px solid ${BD}`})}">${net>0?inr(net):'—'}</td>
    </tr>`;
  }

  // ── T&C lines ─────────────────────────────────────────────────────
  const tnc=D.tnc||{};
  const tncRaw=[...(tnc.common||'').split('\n').filter(l=>l.trim()),...(tnc[D.state]||'').split('\n').filter(l=>l.trim())];
  const ltrBody=D.lbody||'We are pleased to present this Solar Power Plant Proposal for your consideration.';
  const incHTML=(sd.inc||[]).map((x,i,a)=>row(x.i,`<span style="color:${TL};font-weight:700">${x.v}</span>`,i===a.length-1)).join('');

  // ── Subsidy section ───────────────────────────────────────────────
  const subSection = D.subon ? `
<div style="${S({background:`linear-gradient(135deg,${NV},${NV2})`,'border-radius':'12px',padding:'18px 22px','margin-bottom':'14px',display:'flex','justify-content':'space-between','align-items':'center','flex-wrap':'wrap',gap:'14px'})}">
  <div>
    <div style="${S({'font-size':'.6rem',color:'rgba(255,255,255,.5)','text-transform':'uppercase','letter-spacing':'1.2px','margin-bottom':'5px'})}">Central Financial Assistance — MNRE</div>
    <div style="${S({'font-family':"'Outfit',sans-serif",'font-size':'1rem',color:WH,'font-weight':'700','margin-bottom':'3px'})}">PM Surya Ghar: Muft Bijli Yojana (CFA)</div>
    <div style="${S({'font-size':'.65rem',color:'rgba(255,255,255,.38)'})}">Formula: 30,000×min(S,2) + 18,000×max(0,min(S−2,1))</div>
  </div>
  <div style="text-align:right">
    <div style="${S({'font-family':"'Space Mono',monospace",'font-size':'1.5rem',color:GD,'font-weight':'700'})}">${D.cfa>0?inr(D.cfa):'N/A'}</div>
    <div style="${S({'font-size':'.62rem',color:'rgba(255,255,255,.38)','margin-top':'3px'})}">${D.ptype==='Residential'?'CFA Applicable':'Not Applicable'}</div>
  </div>
</div>
<div style="${S({display:'grid','grid-template-columns':'1fr 1fr',gap:'12px'})}">
  <div style="${S({background:BG,'border-radius':'12px',padding:'16px 18px',border:`1px solid ${BD}`,'border-top':`4px solid ${GD}`})}">
    <div style="${S({'font-size':'.65rem','font-weight':'700',color:T3,'text-transform':'uppercase','letter-spacing':'.8px','margin-bottom':'12px'})}">MNRE CFA Structure</div>
    ${row('Up to 2 kWp',`<span style="color:${GD};font-weight:700">₹30,000/kW</span>`)}
    ${row('2–3 kWp (incremental)',`<span style="color:${GD};font-weight:700">₹18,000/kW</span>`)}
    ${row('Max for individual',`<span style="color:${GD};font-weight:700">₹78,000</span>`)}
    ${row('System Size',`${D.cap} kWp`)}
    ${row('Proposal Type',D.ptype,true)}
    <div style="${S({'margin-top':'12px',padding:'9px 12px',background:`linear-gradient(135deg,${GL},#FFFDF5)`,'border-radius':'8px','border-left':`4px solid ${GD}`,display:'flex','justify-content':'space-between','align-items':'center'})}">
      <span style="${S({'font-size':'.74rem','font-weight':'700',color:NV})}">CFA Subsidy</span>
      <span style="${S({'font-family':"'Space Mono',monospace",'font-size':'.88rem','font-weight':'700',color:GD})}">${D.cfa>0?inr(D.cfa):'Not Applicable'}</span>
    </div>
  </div>
  <div style="${S({background:BG,'border-radius':'12px',padding:'16px 18px',border:`1px solid ${BD}`,'border-top':`4px solid ${TL}`})}">
    <div style="${S({'font-size':'.65rem','font-weight':'700',color:T3,'text-transform':'uppercase','letter-spacing':'.8px','margin-bottom':'10px'})}">${sd.name} — State Incentives</div>
    <div style="${S({'font-size':'.71rem',color:T2,'margin-bottom':'10px','padding-bottom':'8px','border-bottom':`1px solid ${BD}`})}"><strong>Nodal Agency:</strong> ${sd.agency}</div>
    ${incHTML}
    ${D.ssub>0?`<div style="${S({'margin-top':'12px',padding:'9px 12px',background:TLL,'border-radius':'8px','border-left':`4px solid ${TL}`,display:'flex','justify-content':'space-between','align-items':'center'})}"><span style="${S({'font-size':'.74rem','font-weight':'700',color:NV})}">State Subsidy</span><span style="${S({'font-family':"'Space Mono',monospace",'font-size':'.88rem','font-weight':'700',color:TL})}">${inr(D.ssub)}</span></div>`:''}
  </div>
</div>` : `<div style="${S({background:BLL,'border-left':`4px solid ${BL}`,'border-radius':'0 10px 10px 0',padding:'13px 18px','font-size':'.8rem',color:BL})}">Subsidy not included — ${D.ptype} project.</div>`;

  // ── COST SUMMARY (corrected per spec) ────────────────────────────
  const plantNetAfterDisc = D.price; // Already net of discount (disc is display only)
  const addCostAmt        = D.addCostAmt || 0;
  const totalProjectCost  = D.totalProj; // plantNet + addCost
  const taxableVal        = D.taxableVal;
  const totalGST          = D.totalGST;
  const discDisplay       = D.disc || 0;
  const totalSubsidy      = D.subon ? (D.tsub || 0) : 0;
  const custCommit        = D.commit;

  // Dark row helper (white text on dark bg)
  const dRow = (lbl, val, borderTop=false, highlight=false) => `
<div style="${S({display:'flex','justify-content':'space-between','align-items':'center',padding:'9px 0',
  'border-top':borderTop?`1px solid rgba(255,255,255,.1)`:'none',
  background:highlight?'rgba(255,255,255,.06)':'transparent',
  margin:highlight?'0 -10px':'0',padding:highlight?'9px 10px':'9px 0','border-radius':highlight?'6px':'0'
})}">
  <span style="${S({'font-size':'.75rem',color:'rgba(255,255,255,.72)','font-weight':highlight?'600':'400'})}">${lbl}</span>
  <span style="${S({'font-family':"'Space Mono',monospace",'font-size':'.78rem',color:WH,'font-weight':highlight?'700':'500'})}">${val}</span>
</div>`;

  return `
<!-- ══════════════════ COVER PAGE ══════════════════ -->
<div style="${S({background:`linear-gradient(150deg,${NV} 0%,#0D2A4F 55%,#071B38 100%)`,position:'relative',overflow:'hidden'})}">

  <!-- Decorative circles -->
  <div style="position:absolute;top:-70px;right:-70px;width:300px;height:300px;border-radius:50%;background:radial-gradient(circle,rgba(212,160,23,.1),transparent 65%)"></div>
  <div style="position:absolute;bottom:-90px;left:-50px;width:340px;height:340px;border-radius:50%;background:radial-gradient(circle,rgba(14,159,130,.07),transparent 60%)"></div>
  <div style="position:absolute;top:0;left:0;right:0;height:4px;background:linear-gradient(90deg,${GD},rgba(212,160,23,.2),transparent)"></div>

  <!-- Top bar: logo + ref box -->
  <div style="${S({padding:'30px 46px 0',display:'flex','justify-content':'space-between','align-items':'flex-start',position:'relative','z-index':'1'})}">
    <div style="${S({display:'flex','align-items':'center',gap:'16px'})}">
      ${logoHTML}
      <div>
        <div style="${S({'font-family':"'Outfit',sans-serif",'font-size':'1.22rem',color:WH,'font-weight':'800','letter-spacing':'-0.4px','line-height':'1.15'})}">${co.name||'Enermass Power Solutions Pvt. Ltd.'}</div>
        <div style="${S({'font-size':'.58rem',color:GD,'letter-spacing':'2.4px','text-transform':'uppercase','margin-top':'5px','opacity':'.9'})}">${co.tag||'Integrated Solar & Power Engineering Solutions'}</div>
        <div style="${S({'font-size':'.6rem',color:'rgba(255,255,255,.28)','margin-top':'7px','line-height':'1.75'})}">${fromAddr?fromAddr.replace(/\n/g,' · ')+'<br>':''}${co.phone||''}${co.email?' · '+co.email:''}${co.web?' · '+co.web:''}</div>
      </div>
    </div>
    <!-- Ref box: gold gradient -->
    <div style="${S({background:`linear-gradient(135deg,${GD},#E8B84B)`,color:NV,'border-radius':'10px',padding:'13px 18px','text-align':'right','flex-shrink':'0','min-width':'160px','box-shadow':'0 8px 28px rgba(212,160,23,.35)'})}">
      <div style="${S({'font-size':'.54rem','font-weight':'700','text-transform':'uppercase','letter-spacing':'1.3px',color:NV,'opacity':'.6'})}">Proposal Ref.</div>
      <div style="${S({'font-family':"'Space Mono',monospace",'font-size':'.76rem','font-weight':'700',color:NV,'margin-top':'5px','line-height':'1.3'})}">${D.refno}</div>
      <div style="${S({'font-size':'.59rem',color:NV,'opacity':'.6','margin-top':'6px'})}">Date: ${D.qdateStr}</div>
      <div style="${S({'font-size':'.59rem',color:NV,'opacity':'.6','margin-top':'2px'})}">Valid: ${D.duedateStr}</div>
    </div>
  </div>

  <!-- Main headline -->
  <div style="${S({padding:'34px 46px 38px',position:'relative','z-index':'1'})}">
    <div style="${S({'font-size':'.6rem',color:GD,'letter-spacing':'3.2px','text-transform':'uppercase','font-weight':'600','margin-bottom':'12px','opacity':'.85'})}">Techno-Commercial Proposal &nbsp;·&nbsp; ${sd.name} &nbsp;·&nbsp; ${D.ptype}</div>
    <!-- BIG title -->
    <div style="${S({'font-family':"'Outfit',sans-serif",'font-size':'2.4rem',color:WH,'font-weight':'900','line-height':'1.0','letter-spacing':'-1px'})}">Solar Power</div>
    <div style="${S({'font-family':"'Outfit',sans-serif",'font-size':'2.4rem',color:GD,'font-weight':'900','line-height':'1.0','letter-spacing':'-1px','margin-bottom':'12px'})}">Plant Proposal</div>
    <div style="${S({'font-size':'.82rem',color:'rgba(255,255,255,.4)','max-width':'480px','line-height':'1.7','margin-bottom':'22px'})}">${sysLabel}</div>

    <!-- Pills row -->
    <div style="${S({display:'flex',gap:'8px','flex-wrap':'wrap'})}">
      ${[`${D.cap} kWp System`,sd.name,`${D.sal} ${D.cust}`,D.ptype,...(D.stype==='hybrid'?[`${D.bkwh} kWh Battery`]:[]),`Valid ${D.validity} Days`]
        .map(t=>`<div style="${S({background:'rgba(255,255,255,.09)',border:'1px solid rgba(255,255,255,.16)',padding:'4px 13px','border-radius':'20px','font-size':'.65rem',color:'rgba(255,255,255,.88)',display:'inline-flex','align-items':'center',gap:'7px'})}"><span style="width:5px;height:5px;border-radius:50%;background:${GD};flex-shrink:0;display:inline-block"></span>${t}</div>`).join('')}
    </div>
  </div>
</div>

<!-- ══════════════════ 01 INTRODUCTION LETTER ══════════════════ -->
<div data-sec="letter" style="${S({padding:'28px 46px',background:WH,'border-bottom':`1px solid ${BD}`})}">
  ${secH('01','Introduction Letter',GD)}
  <div style="${S({background:GL,'border-left':`5px solid ${GD}`,'border-radius':'0 10px 10px 0',padding:'22px 26px','line-height':'1.9',color:T1,'font-size':'.82rem'})}">
    <div style="${S({'margin-bottom':'16px'})}">
      <div style="${S({'font-weight':'700','font-size':'.85rem',color:T1})}">To,</div>
      <div style="${S({'margin-top':'4px',color:T2,'font-size':'.82rem'})}">${D.sal} ${D.cust}${D.billaddr?'<br>'+D.billaddr.replace(/\n/g,'<br>'):''}</div>
    </div>
    <div style="${S({'font-size':'.72rem',color:T3,'margin-bottom':'16px','padding-bottom':'13px','border-bottom':`1px dashed ${BD}`})}">Date: <strong style="color:${T1}">${D.qdateStr}</strong> &nbsp;|&nbsp; Ref: <strong style="color:${T1}">${D.refno}</strong> &nbsp;|&nbsp; Valid Until: <strong style="color:${T1}">${D.duedateStr}</strong></div>
    <div style="${S({'font-weight':'700','font-size':'.84rem',color:NV,'margin-bottom':'14px'})}">Sub: Solar Power Plant Proposal — ${D.cap} kWp ${D.stype==='hybrid'?'Hybrid':'On-Grid'} System — ${sd.name}</div>
    <div style="${S({'font-weight':'700','margin-bottom':'14px','font-size':'.84rem'})}">Dear ${D.sal} ${(D.cust||'').split(' ')[0]||'Sir/Madam'},</div>
    ${ltrBody.split('\n').filter(l=>l.trim()).map(p=>`<p style="${S({'margin-bottom':'11px','line-height':'1.85','font-size':'.82rem'})}">${p}</p>`).join('')}
    <div style="${S({'margin-top':'24px','padding-top':'18px','border-top':`1px solid rgba(212,160,23,.35)`})}">
      <div style="${S({'margin-bottom':'24px','font-size':'.82rem'})}">Yours faithfully,</div>
      ${co.sigImg?`<div style="margin-bottom:10px"><img src="${co.sigImg}" style="max-height:48px;width:auto;display:block" alt="Signature"></div>`:'<div style="height:42px"></div>'}
      <div style="${S({display:'inline-block','border-top':`2px solid ${NV}`,'padding-top':'7px'})}">
        <div style="${S({'font-family':"'Outfit',sans-serif",'font-weight':'700',color:NV,'font-size':'.9rem'})}">Mr. Manoj M S</div>
        <div style="${S({'font-size':'.73rem',color:T2,'margin-top':'2px'})}">Chief Executive Officer</div>
        <div style="${S({'font-size':'.7rem',color:T3,'margin-top':'2px'})}">${co.name||'Enermass Power Solutions Pvt. Ltd.'}</div>
      </div>
    </div>
  </div>
</div>

<!-- ══════════════════ 02 COMPANY PROFILE ══════════════════ -->
<div data-sec="company" style="${S({padding:'28px 46px',background:BG,'border-bottom':`1px solid ${BD}`})}">
  ${secH('02','Company Profile',TL)}
  <div style="${S({display:'grid','grid-template-columns':'1fr 1fr',gap:'8px','margin-bottom':'14px'})}">
    ${[['Company',co.name||'—'],['CIN / Reg. No.',co.cin||'—'],['GST Number',co.gst||'—'],['PAN',co.pan||'—'],['Phone',co.phone||'—'],['Email',co.email||'—'],['Website',co.web||'—'],['Address',(fromAddr||co.addr||'').replace(/\n/g,', ')]].map(([l,v])=>`
    <div style="${S({background:WH,border:`1px solid ${BD}`,'border-radius':'10px',padding:'11px 14px'})}">
      <div style="${S({'font-size':'.58rem',color:T3,'text-transform':'uppercase','letter-spacing':'.7px','font-weight':'600','margin-bottom':'4px'})}">${l}</div>
      <div style="${S({'font-size':'.8rem',color:T1,'font-weight':'600','line-height':'1.45'})}">${v}</div>
    </div>`).join('')}
  </div>
  <div style="${S({background:WH,border:`1px solid ${BD}`,'border-radius':'10px',padding:'14px 18px','margin-bottom':'14px'})}">
    <div style="${S({'font-family':"'Outfit',sans-serif",'font-weight':'700',color:NV,'font-size':'.82rem','margin-bottom':'8px'})}">Business Activities</div>
    <div style="${S({'font-size':'.77rem',color:T2,'line-height':'1.75'})}">${co['cp-biz']||''}${co['cp-areas']?`<br><strong>Service Areas:</strong> ${co['cp-areas']}`:''}${co['cp-certs']?`<br><strong>Certifications:</strong> ${co['cp-certs']}`:''}${co['cp-notes']?`<br>${co['cp-notes']}`:''}</div>
  </div>
  <!-- Stats bar -->
  <div style="${S({display:'grid','grid-template-columns':'repeat(3,1fr)',gap:'10px'})}">
    ${[[co['cp-exp']?.split(' ')[0]||'10+','Years','Experience',GD],[co['cp-proj']?.split(' ')[0]||'500+','Projects','Commissioned',TL],[co['cp-mw']?.split(' ')[0]||'15+','MW','Installed',BL]].map(([v,u,l,c])=>`
    <div style="${S({background:`linear-gradient(140deg,${NV},${NV2})`,'border-radius':'12px',padding:'18px 14px','text-align':'center'})}">
      <div style="${S({'font-family':"'Space Mono',monospace",'font-size':'1.35rem',color:c,'font-weight':'700'})}">${v}</div>
      <div style="${S({'font-size':'.6rem',color:'rgba(255,255,255,.38)','text-transform':'uppercase','letter-spacing':'.6px','margin-top':'2px'})}">${u}</div>
      <div style="${S({'font-size':'.73rem',color:'rgba(255,255,255,.65)','margin-top':'4px'})}">${l}</div>
    </div>`).join('')}
  </div>
</div>

<!-- ══════════════════ 03 CUSTOMER PROFILE ══════════════════ -->
<div data-sec="customer" style="${S({padding:'28px 46px',background:WH,'border-bottom':`1px solid ${BD}`})}">
  ${secH('03','Customer Profile',BL)}
  <div style="${S({border:`1px solid ${BD}`,'border-radius':'12px',overflow:'hidden'})}">
    <div style="${S({display:'grid','grid-template-columns':'repeat(3,1fr)'})}">
      ${[['Name',`${D.sal} ${D.cust}`],['Phone',D.phone||'—'],['Email',D.email||'—'],['State / District',`${sd.name}${D.dist?' / '+D.dist:''}`],['Pin Code',D.pin||'—'],['DISCOM',D.discom||sd.discom||'—'],['Address',D.billaddr?.replace(/\n/g,', ')||'—'],['Site Address',D.site?.replace(/\n/g,', ')||'—'],['Meter / Consumer No.',D.meter||'—'],['Consumer Category',D.categ||'—'],['System Type',D.ptype],['Installation State',sd.name]].map(([l,v],i)=>`
      <div style="${S({padding:'11px 15px',background:Math.floor(i/3)%2===0?WH:BG,'border-right':i%3<2?`1px solid ${BD}`:'none','border-bottom':i<9?`1px solid ${BD}`:'none'})}">
        <div style="${S({'font-size':'.58rem',color:T3,'text-transform':'uppercase','letter-spacing':'.6px','margin-bottom':'3px'})}">${l}</div>
        <div style="${S({'font-size':'.8rem',color:T1,'font-weight':'600','line-height':'1.35'})}">${v}</div>
      </div>`).join('')}
    </div>
  </div>
</div>

<!-- ══════════════════ 04 SYSTEM DESIGN ══════════════════ -->
<div data-sec="sysdesign" style="${S({padding:'28px 46px',background:BG,'border-bottom':`1px solid ${BD}`})}">
  ${secH('04','System Design & Specifications',GD)}
  <div style="${S({display:'grid','grid-template-columns':'repeat(4,1fr)',gap:'10px','margin-bottom':'16px'})}">
    ${kpi(`${D.cap} kWp`,'DC Peak','System Capacity',NV)}
    ${kpi(fmtN(mGen(D.cap)),'kWh/Month','Est. Generation',TL)}
    ${kpi(fmtN(aGen(D.cap)),'kWh/Year','Annual Output',GR)}
    ${kpi(`${D.area}','sq.ft','Roof Area`,BL)}
    ${D.stype==='hybrid'?kpi(`${D.bkwh} kWh`,'Battery',D.btype||'LiFePO4',GD):''}
  </div>
  <div style="${S({background:WH,border:`1px solid ${BD}`,'border-radius':'12px',overflow:'hidden'})}">
    <table style="${S({width:'100%','border-collapse':'collapse'})}">
      <thead><tr style="${S({background:NV})}">
        <th style="${S({padding:'10px 14px','text-align':'left','font-size':'.64rem','text-transform':'uppercase','letter-spacing':'.8px',color:'rgba(255,255,255,.65)','font-weight':'600',width:'35%'})}">Component</th>
        <th style="${S({padding:'10px 14px','text-align':'left','font-size':'.64rem','text-transform':'uppercase','letter-spacing':'.8px',color:'rgba(255,255,255,.65)','font-weight':'600'})}">Specification</th>
      </tr></thead>
      <tbody>
        ${[['Solar PV Module',`${D.pbrand||'As per approved make'} — ${D.pwp} Wp × ${D.pcount} Nos`],['Inverter',`${D.inv?D.inv.brand+' — '+D.inv.cap:'As per approved make'}`],['System Type',sysLabel],...(D.stype==='hybrid'?[['Battery Bank',`${D.bkwh} kWh — ${D.btype||'LiFePO4'} — ${D.bhrs}h Backup`]]:[]),['Monthly Consumption',`${D.cons} kWh/Month`]].map(([c,s],i)=>`
        <tr style="${S({background:i%2===0?WH:BG})}">
          <td style="${S({padding:'10px 14px','font-weight':'700',color:NV,'font-size':'.8rem','border-bottom':`1px solid ${BD}`})}">${c}</td>
          <td style="${S({padding:'10px 14px',color:T2,'font-size':'.8rem','border-bottom':`1px solid ${BD}`})}">${s}</td>
        </tr>`).join('')}
      </tbody>
    </table>
  </div>
</div>

<!-- ══════════════════ 05 BOM ══════════════════ -->
<div data-sec="bom" style="${S({padding:'28px 46px',background:WH,'border-bottom':`1px solid ${BD}`})}">
  ${secH('05','Bill of Materials',GD)}
  <div style="${S({border:`1px solid ${BD}`,'border-radius':'12px',overflow:'hidden'})}">
    <table style="${S({width:'100%','border-collapse':'collapse'})}">
      <thead><tr style="${S({background:NV})}">
        ${['#','Description','Specification','Qty','Unit'].map((h,i)=>`<th style="${S({padding:'10px 12px','text-align':i>2?'center':'left','font-size':'.63rem','text-transform':'uppercase','letter-spacing':'.8px',color:'rgba(255,255,255,.65)','font-weight':'600'})}">${h}</th>`).join('')}
      </tr></thead>
      <tbody>${bomHTML}</tbody>
    </table>
  </div>
</div>

<!-- ══════════════════ 06 SUBSIDY ══════════════════ -->
<div data-sec="subsidy" style="${S({padding:'28px 46px',background:BG,'border-bottom':`1px solid ${BD}`})}">
  ${secH('06','Government Subsidy & Incentives',GD)}
  ${subSection}
</div>

<!-- ══════════════════ 07 NET METERING ══════════════════ -->
<div data-sec="netmetering" style="${S({padding:'28px 46px',background:WH,'border-bottom':`1px solid ${BD}`})}">
  ${secH('07','Net Metering & Grid Connection',TL)}
  <div style="${S({display:'grid','grid-template-columns':'1fr 1fr',gap:'14px'})}">
    <div style="${S({background:BG,'border-radius':'12px',padding:'18px',border:`1px solid ${BD}`,'border-top':`4px solid ${TL}`})}">
      <div style="${S({'font-family':"'Outfit',sans-serif",'font-weight':'700',color:NV,'font-size':'.82rem','margin-bottom':'14px'})}">Grid Connection — ${sd.name}</div>
      ${row('DISCOM',D.discom||sd.discom||'—')}
      ${row('Nodal Agency',`<span style="font-size:.7rem;line-height:1.4">${sd.agency}</span>`)}
      ${row('Net Metering Limit',sd.netMeteringLimit)}
      ${row('Connection Time',sd.connTime)}
      ${row('Settlement',`<span style="font-size:.69rem;line-height:1.5">${sd.nmSettle}</span>`)}
      ${row('Export Tariff (APPC)',`<span style="color:${GR};font-weight:700">₹${D.exportRate}/unit</span>`,true)}
    </div>
    <div style="${S({background:BG,'border-radius':'12px',padding:'18px',border:`1px solid ${BD}`,'border-top':`4px solid ${GD}`})}">
      <div style="${S({'font-family':"'Outfit',sans-serif",'font-weight':'700',color:NV,'font-size':'.82rem','margin-bottom':'14px'})}">${sd.name} — Electricity Tariff</div>
      ${(sd.tariff||[]).map((t,i,a)=>row(t.s,`<span style="font-family:'Space Mono',monospace;font-size:.74rem;color:${NV};font-weight:700">${t.r}</span>`,i===a.length-1)).join('')}
      <div style="${S({'margin-top':'12px',padding:'9px 12px',background:GL,'border-radius':'8px',display:'flex','justify-content':'space-between','align-items':'center'})}">
        <span style="${S({'font-size':'.74rem','font-weight':'700',color:NV})}">Avg. Grid Tariff</span>
        <span style="${S({'font-family':"'Space Mono',monospace",'font-size':'.88rem','font-weight':'700',color:GD})}">${D.tariff}/unit</span>
      </div>
    </div>
  </div>
</div>

<!-- ══════════════════ 08 FINANCIAL ANALYSIS ══════════════════ -->
<div data-sec="financial" style="${S({padding:'28px 46px',background:BG,'border-bottom':`1px solid ${BD}`})}">
  ${secH('08','Financial Analysis',GR)}
  <div style="${S({display:'grid','grid-template-columns':'repeat(4,1fr)',gap:'10px','margin-bottom':'14px'})}">
    ${kpi(inr(D.annSave),'Annual','Bill Savings',NV)}
    ${kpi(inr(D.annExport),'Annual','Export Income',TL)}
    ${kpi(inr(D.annBen),'Total Annual','Benefit',GR)}
    ${kpi(`${D.payback} yrs`,'Payback','Period',GD)}
  </div>
  <div style="${S({display:'grid','grid-template-columns':'repeat(3,1fr)',gap:'10px','margin-bottom':'16px'})}">
    ${[[inr(D.cum25),'25-Year Cumulative','Returns',GR],[`${D.roi25}%`,'25-Year ROI','Return',TL],[`${sd.tariffEsc}% p.a.`,'Escalation','Rate',GD]].map(([v,u,l,c])=>`
    <div style="${S({background:WH,border:`1px solid ${BD}`,'border-radius':'12px',padding:'14px 18px',display:'flex','align-items':'center',gap:'13px'})}">
      <div style="${S({width:'42px',height:'42px','border-radius':'10px',background:`linear-gradient(140deg,${NV},${NV2})`,display:'flex','align-items':'center','justify-content':'center','flex-shrink':'0','font-size':'.95rem'})}">📈</div>
      <div>
        <div style="${S({'font-family':"'Space Mono',monospace",'font-size':'1rem','font-weight':'700',color:c})}">${v}</div>
        <div style="${S({'font-size':'.62rem',color:T3,'text-transform':'uppercase','letter-spacing':'.5px','margin-top':'2px'})}">${u} · ${l}</div>
      </div>
    </div>`).join('')}
  </div>
  <div style="${S({background:WH,border:`1px solid ${BD}`,'border-radius':'12px',overflow:'hidden'})}">
    <table style="${S({width:'100%','border-collapse':'collapse'})}">
      <thead><tr style="${S({background:NV})}">
        ${['Year','Generation','Annual Benefit','Cumulative','Net (After Investment)'].map((h,i)=>`<th style="${S({padding:'10px 12px','text-align':i===0?'left':'right','font-size':'.63rem','text-transform':'uppercase','letter-spacing':'.8px',color:'rgba(255,255,255,.65)','font-weight':'600'})}">${h}</th>`).join('')}
      </tr></thead>
      <tbody>${finRows}</tbody>
    </table>
  </div>
</div>

<!-- ══════════════════ 09 COST SUMMARY ══════════════════ -->
<div data-sec="cost" style="${S({padding:'28px 46px',background:WH,'border-bottom':`1px solid ${BD}`})}">
  ${secH('09','Cost Summary',GD)}

  <!-- SECTION A: Project Cost (Payable to Enermass) -->
  <div style="${S({'margin-bottom':'16px'})}">
    <div style="${S({'font-family':"'Outfit',sans-serif",'font-size':'.72rem','font-weight':'700',color:NV,'text-transform':'uppercase','letter-spacing':'1px','margin-bottom':'10px',padding:'7px 14px',background:BG,'border-radius':'6px','border-left':`4px solid ${NV}`})}">A — Project Cost (Payable to Enermass)</div>
    <div style="${S({background:WH,border:`1px solid ${BD}`,'border-radius':'10px',padding:'14px 18px'})}">
      ${row('Plant Cost (Net after Discount)',inr(plantNetAfterDisc))}
      ${addCostAmt>0?row(`Additional Cost${D.addCostDesc?' — '+D.addCostDesc:''}`,inr(addCostAmt)):''}
      <!-- Total Project Cost highlighted -->
      <div style="${S({display:'flex','justify-content':'space-between','align-items':'center','margin-top':'10px',padding:'12px 16px',background:`linear-gradient(135deg,${NV},${NV2})`,'border-radius':'8px'})}">
        <span style="${S({'font-size':'.78rem',color:WH,'font-weight':'700'})}">Total Project Cost</span>
        <span style="${S({'font-family':"'Space Mono',monospace",'font-size':'1rem',color:GD,'font-weight':'700'})}">${inr(totalProjectCost)}</span>
      </div>
    </div>
  </div>

  <!-- SECTION B: Customer Financial Commitment -->
  <div>
    <div style="${S({'font-family':"'Outfit',sans-serif",'font-size':'.72rem','font-weight':'700',color:GR,'text-transform':'uppercase','letter-spacing':'1px','margin-bottom':'10px',padding:'7px 14px',background:GRL,'border-radius':'6px','border-left':`4px solid ${GR}`})}">B — Customer Financial Commitment</div>
    <div style="${S({background:`linear-gradient(150deg,${NV} 0%,#0D2A4F 60%,#071B38 100%)`,'border-radius':'12px',padding:'20px 22px',position:'relative',overflow:'hidden'})}">
      <!-- glow -->
      <div style="position:absolute;top:-40px;right:-40px;width:150px;height:150px;background:radial-gradient(circle,rgba(212,160,23,.14),transparent 65%);border-radius:50%"></div>

      ${dRow('Plant Price (Net after Discount + Additional Costs)',inr(totalProjectCost))}
      <div style="height:1px;background:rgba(255,255,255,.08)"></div>
      ${dRow('Taxable Value',inr(taxableVal))}
      <div style="height:1px;background:rgba(255,255,255,.08)"></div>
      ${dRow('GST (Blended @ 8.9%)',inr(totalGST))}
      <div style="height:1px;background:rgba(255,255,255,.08)"></div>
      ${discDisplay>0?`${dRow('Effective Discount Allowed','− '+inr(discDisplay))}<div style="height:1px;background:rgba(255,255,255,.08)"></div>`:''}
      ${totalSubsidy>0?`${dRow(`Government Subsidy (CFA ${inr(D.cfa)} + State ${inr(D.ssub||0)})`,'− '+inr(totalSubsidy))}<div style="height:1px;background:rgba(255,255,255,.08)"></div>`:''}

      <!-- Customer Commitment — big highlight box -->
      <div style="${S({'margin-top':'14px',padding:'16px 18px',background:'rgba(39,174,96,.18)',border:'2px solid rgba(39,174,96,.4)','border-radius':'10px',position:'relative','z-index':'1'})}">
        <div style="${S({display:'flex','justify-content':'space-between','align-items':'center'})}">
          <div>
            <div style="${S({'font-size':'.65rem','text-transform':'uppercase','letter-spacing':'1px',color:'rgba(165,214,167,.85)','font-weight':'700','margin-bottom':'3px'})}">💰 Customer Financial Commitment</div>
            <div style="${S({'font-size':'.6rem',color:'rgba(255,255,255,.3)'})}">${addCostAmt>0?'Plant Price + Additional Cost − Subsidy − Discount':'Total Plant Price − Subsidy'}</div>
          </div>
          <div style="${S({'font-family':"'Space Mono',monospace",'font-size':'1.3rem','font-weight':'700',color:'#A5D6A7'})}">${inr(custCommit)}</div>
        </div>
        <div style="${S({'font-size':'.63rem','font-style':'italic',color:'rgba(165,214,167,.7)','text-align':'right','margin-top':'6px'})}">${numberToIndianCurrencyWords(custCommit)}</div>
      </div>

      <!-- Footer note inside dark box — white text -->
      <div style="${S({'margin-top':'12px','font-size':'.62rem',color:'rgba(255,255,255,.32)','line-height':'1.7',padding:'10px 0 0','border-top':'1px dashed rgba(255,255,255,.1)',position:'relative','z-index':'1'})}">
        GST @ 8.9% blended per MNRE Govt. notification. Discount included in Total Plant Price. Subsidy reduces customer commitment only. All prices in INR.
      </div>
    </div>

    <!-- Validity alert -->
    <div style="${S({'margin-top':'12px',padding:'10px 16px',background:GL,'border-radius':'8px',display:'flex','align-items':'center',gap:'10px'})}">
      <span style="${S({'font-size':'.68rem',color:T3})}">📅 Proposal Valid Until</span>
      <strong style="${S({'font-size':'.75rem',color:NV})}">${D.duedateStr} (${D.validity} Days)</strong>
    </div>
  </div>

  ${D.subon&&totalSubsidy>0?`
  <div style="${S({'margin-top':'14px',background:BLL,border:`1.5px solid #90CAF9`,'border-radius':'12px',padding:'15px 20px',display:'flex','justify-content':'space-between','align-items':'center','flex-wrap':'wrap',gap:'10px'})}">
    <div>
      <div style="${S({'font-weight':'700',color:BL,'font-size':'.82rem','margin-bottom':'3px'})}">🏛 Government Subsidy (CFA + State)</div>
      <div style="${S({'font-size':'.71rem',color:T2})}">Credited directly to customer by Government post-commissioning. Reduces only customer financial commitment.</div>
    </div>
    <div style="text-align:right">
      <div style="${S({'font-family':"'Space Mono',monospace",'font-size':'1.2rem','font-weight':'700',color:BL})}">${inr(totalSubsidy)}</div>
      <div style="${S({'font-size':'.62rem',color:T3})}">CFA ${inr(D.cfa)} + State ${inr(D.ssub||0)}</div>
    </div>
  </div>`:''}
</div>

<!-- ══════════════════ 10 T&C ══════════════════ -->
<div data-sec="tnc" style="${S({padding:'28px 46px',background:BG,'border-bottom':`1px solid ${BD}`})}">
  ${secH('10','Terms & Conditions',T3)}
  <div style="${S({background:WH,border:`1px solid ${BD}`,'border-radius':'12px',padding:'8px 18px'})}">
    <div style="${S({'font-size':'.68rem',color:T3,padding:'8px 0','border-bottom':`1px dashed ${BD}`,'margin-bottom':'4px'})}">General T&amp;C applicable to all projects · ${sd.name}-specific T&amp;C additionally applicable</div>
    ${tncRaw.map((l,i)=>`
    <div style="${S({display:'flex',gap:'14px','font-size':'.76rem',color:T2,'line-height':'1.65',padding:'6px 0','border-bottom':`1px dashed ${BD}`})}">
      <span style="${S({'font-family':"'Space Mono',monospace",'font-size':'.64rem',color:T3,'min-width':'24px','padding-top':'2px','flex-shrink':'0'})}">${String(i+1).padStart(2,'0')}</span>
      <span>${l.replace(/^\d+\.\s*/,'')}</span>
    </div>`).join('')}
  </div>
</div>

<!-- ══════════════════ 11 WHY SOLAR ══════════════════ -->
<div data-sec="solar-info" style="${S({padding:'28px 46px',background:`linear-gradient(140deg,#EBF5FB,#EAFAF1)`,'border-bottom':`1px solid ${BD}`})}">
  ${secH('11','Why Solar Power? Why Enermass?',GR)}
  <div style="${S({display:'grid','grid-template-columns':'1fr 1fr',gap:'12px','margin-bottom':'14px'})}">
    ${[
      ['☀️','Benefits of Solar Power',GD,['Reduce electricity bills by 70–90%','25-year lifespan with minimal maintenance','Protection against rising electricity tariffs','Earn income via net metering / grid export','Increase property value significantly','Zero carbon emissions']],
      ['🏅','Why Choose Enermass?',TL,['MNRE Empanelled EPC Contractor',`${co['cp-exp']||'10+ Years'} of solar expertise`,`${co['cp-proj']||'500+'} successful installations`,`${co['cp-mw']||'15 MW+'} capacity commissioned`,'End-to-end DISCOM liaison & net metering','ISO 9001:2015 certified quality processes']],
      ['🔧','Warranty & Performance',BL,['Solar panels: 25-year linear power warranty','Inverter: 5–10 years manufacturer warranty','Structure: 10-year structural warranty','Workmanship: 2-year installation warranty','MNRE certified Tier-1 manufacturers','BIS / IEC certified components']],
      ['🤝','Customer Support',GR,['Dedicated project manager per installation','Timely DISCOM application & NM support','Post-installation commissioning & testing','Annual performance monitoring report','Responsive — call / WhatsApp support',co.phone||'Contact for service queries']],
    ].map(([ic,t,c,items])=>`
    <div style="${S({background:WH,'border-radius':'12px',padding:'16px 18px',border:`1px solid ${BD}`,'border-top':`4px solid ${c}`})}">
      <div style="${S({'font-family':"'Outfit',sans-serif",'font-weight':'700',color:NV,'font-size':'.82rem','margin-bottom':'11px',display:'flex','align-items':'center',gap:'8px'})}"><span>${ic}</span>${t}</div>
      ${items.map(item=>`<div style="${S({display:'flex','align-items':'flex-start',gap:'9px','font-size':'.74rem',color:T2,'line-height':'1.6',padding:'3px 0'})}"><span style="${S({color:c,'flex-shrink':'0','font-weight':'700','margin-top':'1px'})}">✓</span><span>${item}</span></div>`).join('')}
    </div>`).join('')}
  </div>
  <div style="${S({background:`linear-gradient(135deg,${NV},${NV2})`,'border-radius':'12px',padding:'14px 22px',display:'flex','justify-content':'space-between','align-items':'center','flex-wrap':'wrap',gap:'10px'})}">
    <span style="${S({'font-size':'.73rem',color:WH,'font-weight':'600'})}">🌱 Site Survey → System Design → DISCOM Application → Installation → Net Metering → Commissioning</span>
    <span style="${S({'font-size':'.73rem',color:GD,'font-weight':'700'})}">${co.phone||''} ${co.email?'· '+co.email:''}</span>
  </div>
</div>

<!-- ══════════════════ SIGNATURE ══════════════════ -->
<div style="${S({padding:'24px 46px',display:'flex','justify-content':'space-between','align-items':'flex-end',background:WH,'border-top':`2px solid ${BD}`})}">
  <div>
    <div style="height:40px"></div>
    <div style="${S({display:'inline-block','border-top':`2px solid ${NV}`,'padding-top':'8px'})}">
      <div style="${S({'font-family':"'Outfit',sans-serif",'font-weight':'700',color:NV,'font-size':'.88rem'})}">${D.sal} ${D.cust}</div>
      <div style="${S({'font-size':'.72rem',color:T3,'margin-top':'2px'})}">Customer Acceptance</div>
    </div>
  </div>
  <div style="text-align:center">
    <div style="font-size:2rem;line-height:1">☀️</div>
    <div style="${S({'font-family':"'Outfit',sans-serif",'font-size':'.68rem',color:GD,'font-weight':'700','margin-top':'5px'})}">Solar Power Plant Proposal</div>
    <div style="${S({'font-size':'.62rem',color:T3,'margin-top':'2px','font-family':"'Space Mono',monospace"})}">${D.refno}</div>
  </div>
  <div style="text-align:right">
    <div style="height:40px"></div>
    <div style="${S({display:'inline-block','border-top':`2px solid ${NV}`,'padding-top':'8px','text-align':'left'})}">
      ${D.salesExec?`
      <div style="${S({'font-family':"'Outfit',sans-serif",'font-weight':'700',color:NV,'font-size':'.88rem'})}">${D.salesExec.name}</div>
      <div style="${S({'font-size':'.73rem',color:T2,'margin-top':'2px'})}">${D.salesExec.desig||'Sales Executive'}</div>
      <div style="${S({'font-size':'.7rem',color:T3,'margin-top':'2px'})}">${co.name||'Enermass Power Solutions Pvt. Ltd.'}</div>
      ${D.salesExec.phone?`<div style="${S({'font-size':'.68rem',color:T3,'margin-top':'2px'})}">${D.salesExec.phone}</div>`:''}
      `:`
      <div style="${S({'font-family':"'Outfit',sans-serif",'font-weight':'700',color:NV,'font-size':'.88rem'})}">Authorised Signatory</div>
      <div style="${S({'font-size':'.7rem',color:T3,'margin-top':'2px'})}">${co.name||'Enermass Power Solutions Pvt. Ltd.'}</div>
      `}
    </div>
  </div>
</div>`;
}
