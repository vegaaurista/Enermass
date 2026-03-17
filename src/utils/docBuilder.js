import { inr, fmtN, mGen, aGen, bomQty, numberToIndianCurrencyWords } from './helpers';
import { SD, DEFAULT_BRANCHES } from '../data/defaults';

const D0='#0B1F3A',D1='#112844',D2='#1A3A5C',GD='#E8A020',GL='#FDF3DC',TL='#1ABC9C',TLL='#E8F8F5',GR='#27AE60',GRL='#EAFAF1',BL='#2980B9',BLL='#EBF5FB',BG='#F4F7FB',BD='#E2E8F0',T1='#1A202C',T2='#4A5568',T3='#718096',WH='#FFFFFF';
const S=o=>Object.entries(o).map(([k,v])=>`${k}:${v}`).join(';');

export function buildDoc(D) {
  const sd=D.sd||SD[D.state], co=D.co||{};
  const fromAddr=(co.branches||{})[D.state]||DEFAULT_BRANCHES[D.state]||co.addr||'';
  const sysLabel=D.stype==='hybrid'?'Hybrid Solar Power Plant (Grid-Tied + Battery Backup)':'Grid-Connected Rooftop Solar Power Plant (Net Metering)';
  const logoHTML=co.logo?`<img src="${co.logo}" style="height:52px;max-width:160px;object-fit:contain;display:block" alt="${co.name||'Logo'}" crossorigin="anonymous">`:`<div style="font-size:1.6rem">⚡</div>`;

  // BOM
  let bomHTML='',lastCat='',sn=0;
  (D.bom||[]).filter(x=>x.sys==='all'||x.sys===D.stype).forEach(item=>{
    if(item.cat!==lastCat){bomHTML+=`<tr><td colspan="5" style="${S({'background':D0,'color':GD,'font-size':'.63rem','font-weight':'700','text-transform':'uppercase','letter-spacing':'1px','padding':'6px 12px'})}">${item.cat}</td></tr>`;lastCat=item.cat;}
    sn++;const qty=bomQty(item,D);const bg=sn%2===0?BG:WH;
    bomHTML+=`<tr style="background:${bg}"><td style="${S({'padding':'7px 10px','text-align':'center','color':T3,'font-size':'.7rem','font-family':"'Space Mono',monospace",'border-bottom':`1px solid ${BD}`})}">${String(sn).padStart(2,'0')}</td><td style="${S({'padding':'7px 10px','font-weight':'600','color':T1,'font-size':'.79rem','border-bottom':`1px solid ${BD}`})}">${item.desc}</td><td style="${S({'padding':'7px 10px','font-size':'.72rem','color':T2,'line-height':'1.45','border-bottom':`1px solid ${BD}`})}">${item.spec}</td><td style="${S({'padding':'7px 10px','text-align':'center','font-weight':'700','color':D0,'font-family':"'Space Mono',monospace",'font-size':'.77rem','border-bottom':`1px solid ${BD}`})}">${qty}</td><td style="${S({'padding':'7px 10px','text-align':'center','color':T3,'font-size':'.72rem','border-bottom':`1px solid ${BD}`})}">${item.unit}</td></tr>`;
  });

  // Financial
  let finRows='',cum=0;
  for(let y=1;y<=10;y++){
    const yb=D.annBen*Math.pow(1+(sd.tariffEsc/100),y-1)*Math.pow(0.995,y);cum+=yb;const net=cum-D.commit;const bg=y%2===0?BG:WH;
    const netCell=net>0?`<td style="${S({'padding':'8px 12px','text-align':'right','font-family':"'Space Mono',monospace",'font-size':'.75rem','font-weight':'700','color':GR,'border-bottom':`1px solid ${BD}`})}">${inr(net)}</td>`:`<td style="${S({'padding':'8px 12px','text-align':'right','color':T3,'font-size':'.75rem','border-bottom':`1px solid ${BD}`})}">—</td>`;
    finRows+=`<tr style="background:${bg}"><td style="${S({'padding':'8px 12px','font-weight':'600','color':T1,'font-size':'.79rem','border-bottom':`1px solid ${BD}`})}">Year ${y}</td><td style="${S({'padding':'8px 12px','text-align':'right','font-family':"'Space Mono',monospace",'font-size':'.75rem','color':T2,'border-bottom':`1px solid ${BD}`})}">${fmtN(Math.round(D.agen*Math.pow(0.995,y)))} kWh</td><td style="${S({'padding':'8px 12px','text-align':'right','font-family':"'Space Mono',monospace",'font-size':'.75rem','color':T1,'font-weight':'600','border-bottom':`1px solid ${BD}`})}">${inr(yb)}</td><td style="${S({'padding':'8px 12px','text-align':'right','font-family':"'Space Mono',monospace",'font-size':'.75rem','color':BL,'font-weight':'600','border-bottom':`1px solid ${BD}`})}">${inr(cum)}</td>${netCell}</tr>`;
  }

  // T&C
  const tnc=D.tnc||{};
  const tncRaw=[...(tnc.common||'').split('\n').filter(l=>l.trim()),...(tnc[D.state]||'').split('\n').filter(l=>l.trim())];
  const ltrBodyText=D.lbody||'We are pleased to present this Solar Power Plant Proposal for your consideration.';
  const incHTML=(sd.inc||[]).map((x,i,a)=>`<div style="${S({'display':'flex','justify-content':'space-between','align-items':'flex-start','padding':'6px 0','border-bottom':i<a.length-1?`1px solid ${BD}`:'none','gap':'8px'})}"><span style="${S({'font-size':'.72rem','color':T3,'min-width':'120px','flex-shrink':'0'})}">${x.i}</span><span style="${S({'font-size':'.75rem','color':TL,'font-weight':'600','text-align':'right'})}">${x.v}</span></div>`).join('');

  const secH=(n,t,c=GD)=>`<div style="${S({'display':'flex','align-items':'center','gap':'12px','margin-bottom':'20px','padding-bottom':'12px','border-bottom':`2px solid ${BD}`})}"><div style="${S({'width':'34px','height':'34px','border-radius':'8px','background':D0,'display':'flex','align-items':'center','justify-content':'center','flex-shrink':'0'})}"><span style="${S({'font-family':"'Space Mono',monospace",'font-size':'.62rem','color':c,'font-weight':'700'})}">${n}</span></div><div style="${S({'font-family':"'Outfit',sans-serif",'font-size':'1.05rem','font-weight':'700','color':D0,'letter-spacing':'-0.2px'})}">${t}</div><div style="${S({'flex':'1','height':'2px','background':`linear-gradient(to right,${c},transparent)`,'margin-left':'4px'})}"></div></div>`;

  const kpi=(v,u,l,c=D0)=>`<div style="${S({'background':WH,'border':'1px solid ${BD}','border-radius':'10px','padding':'14px 10px','text-align':'center','border-top':`3px solid ${c}`})}"><div style="${S({'font-family':"'Space Mono',monospace",'font-size':'1rem','font-weight':'700','color':c,'line-height':'1.1','margin-bottom':'2px'})}">${v}</div><div style="${S({'font-size':'.58rem','color':T3,'text-transform':'uppercase','letter-spacing':'.6px','margin-bottom':'3px'})}">${u}</div><div style="${S({'font-size':'.7rem','color':T2,'font-weight':'500'})}">${l}</div></div>`;

  const row=(l,v,last=false)=>`<div style="${S({'display':'flex','justify-content':'space-between','align-items':'flex-start','padding':'7px 0','border-bottom':last?'none':`1px solid ${BD}`,'gap':'12px'})}"><span style="${S({'font-size':'.72rem','color':T3,'min-width':'130px','flex-shrink':'0'})}">${l}</span><span style="${S({'font-size':'.77rem','color':T1,'font-weight':'600','text-align':'right','line-height':'1.4'})}">${v}</span></div>`;

  const subSection=D.subon?`
<div style="${S({'background':`linear-gradient(135deg,${D0},${D1})`,'border-radius':'10px','padding':'16px 20px','margin-bottom':'14px','display':'flex','justify-content':'space-between','align-items':'center','flex-wrap':'wrap','gap':'12px'})}">
  <div><div style="${S({'font-size':'.62rem','color':'rgba(255,255,255,.45)','text-transform':'uppercase','letter-spacing':'1px','margin-bottom':'4px'})}">PM Surya Ghar: Muft Bijli Yojana (CFA)</div><div style="${S({'font-family':"'Outfit',sans-serif",'font-size':'.95rem','color':WH,'font-weight':'700'})}">Central Financial Assistance — MNRE</div><div style="${S({'font-size':'.65rem','color':'rgba(255,255,255,.38)','margin-top':'3px'})}">CFA = 30,000×min(S,2) + 18,000×max(0,min(S−2,1))</div></div>
  <div style="text-align:right"><div style="${S({'font-family':"'Space Mono',monospace",'font-size':'1.45rem','color':GD,'font-weight':'700'})}">${D.cfa>0?inr(D.cfa):'N/A'}</div><div style="${S({'font-size':'.62rem','color':'rgba(255,255,255,.38)','margin-top':'2px'})}">${D.ptype==='Residential'?'CFA Applicable':'Not applicable'}</div></div>
</div>
<div style="${S({'display':'grid','grid-template-columns':'1fr 1fr','gap':'12px'})}">
  <div style="${S({'background':BG,'border-radius':'10px','padding':'14px 16px','border':'1px solid ${BD}','border-top':`3px solid ${GD}`})}">
    <div style="${S({'font-size':'.65rem','font-weight':'700','color':T3,'text-transform':'uppercase','letter-spacing':'.7px','margin-bottom':'10px'})}">MNRE CFA Structure</div>
    ${row('Up to 2 kWp',`<span style="color:${GD};font-weight:700">₹30,000/kW</span>`)}
    ${row('2–3 kWp (incremental)',`<span style="color:${GD};font-weight:700">₹18,000/kW</span>`)}
    ${row('Max for individual',`<span style="color:${GD};font-weight:700">₹78,000</span>`)}
    ${row('System Size',`${D.cap} kWp`)}
    ${row('Proposal Type',D.ptype,true)}
    <div style="${S({'margin-top':'10px','padding':'8px 10px','background':`linear-gradient(135deg,${GL},#FFF8EC)`,'border-radius':'7px','border-left':`3px solid ${GD}`,'display':'flex','justify-content':'space-between','align-items':'center'})}"><span style="${S({'font-size':'.73rem','font-weight':'700','color':D0})}">CFA Subsidy</span><span style="${S({'font-family':"'Space Mono',monospace",'font-size':'.85rem','font-weight':'700','color':GD})}">${D.cfa>0?inr(D.cfa):'Not Applicable'}</span></div>
  </div>
  <div style="${S({'background':BG,'border-radius':'10px','padding':'14px 16px','border':'1px solid ${BD}','border-top':`3px solid ${TL}`})}">
    <div style="${S({'font-size':'.65rem','font-weight':'700','color':T3,'text-transform':'uppercase','letter-spacing':'.7px','margin-bottom':'8px'})}">${sd.name} — State Incentives</div>
    <div style="${S({'font-size':'.7rem','color':T2,'margin-bottom':'8px','padding-bottom':'8px','border-bottom':`1px solid ${BD}`})}"><strong>Nodal Agency:</strong> ${sd.agency}</div>
    ${incHTML}
    ${D.ssub>0?`<div style="${S({'margin-top':'10px','padding':'8px 10px','background':TLL,'border-radius':'7px','border-left':`3px solid ${TL}`,'display':'flex','justify-content':'space-between','align-items':'center'})}"><span style="${S({'font-size':'.73rem','font-weight':'700','color':D0})}">State Subsidy</span><span style="${S({'font-family':"'Space Mono',monospace",'font-size':'.85rem','font-weight':'700','color':TL})}">${inr(D.ssub)}</span></div>`:''}
  </div>
</div>`:`<div style="${S({'background':BLL,'border-left':`4px solid ${BL}`,'border-radius':'0 8px 8px 0','padding':'12px 16px','font-size':'.8rem','color':BL})}">Subsidy not included — ${D.ptype} project (CFA not applicable or excluded).</div>`;

  return `
<!-- COVER -->
<div style="${S({'background':`linear-gradient(155deg,${D0} 0%,#0D2845 55%,#091929 100%)`,'position':'relative','overflow':'hidden'})}">
  <div style="position:absolute;top:-60px;right:-60px;width:280px;height:280px;border-radius:50%;background:radial-gradient(circle,rgba(232,160,32,.12),transparent 65%)"></div>
  <div style="position:absolute;bottom:-80px;left:-40px;width:300px;height:300px;border-radius:50%;background:radial-gradient(circle,rgba(26,188,156,.07),transparent 60%)"></div>
  <div style="position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(to right,${GD},rgba(232,160,32,.2),transparent)"></div>
  <div style="${S({'padding':'28px 44px 0','display':'flex','justify-content':'space-between','align-items':'flex-start','position':'relative','z-index':'1'})}">
    <div style="${S({'display':'flex','align-items':'center','gap':'14px'})}">
      ${logoHTML}
      <div>
        <div style="${S({'font-family':"'Outfit',sans-serif",'font-size':'1.2rem','color':WH,'font-weight':'800','letter-spacing':'-0.3px','line-height':'1.1'})}">${co.name||'Enermass Power Solutions Pvt. Ltd.'}</div>
        <div style="${S({'font-size':'.57rem','color':GD,'letter-spacing':'2.2px','text-transform':'uppercase','margin-top':'4px','opacity':'.85'})}">${co.tag||'Integrated Solar & Power Engineering Solutions'}</div>
        <div style="${S({'font-size':'.58rem','color':'rgba(255,255,255,.32)','margin-top':'6px','line-height':'1.7'})}">${fromAddr?fromAddr.replace(/\n/g,' · ')+'<br>':''}${co.phone||''} ${co.email?'· '+co.email:''} ${co.web?'· '+co.web:''}</div>
      </div>
    </div>
    <div style="${S({'background':`linear-gradient(135deg,${GD},#F0B429)`,'border-radius':'8px','padding':'12px 16px','text-align':'right','flex-shrink':'0','min-width':'155px','box-shadow':'0 8px 24px rgba(232,160,32,.3)'})}">
      <div style="${S({'font-size':'.54rem','font-weight':'700','text-transform':'uppercase','letter-spacing':'1.2px','color':D0,'opacity':'.65'})}">Proposal Ref.</div>
      <div style="${S({'font-family':"'Space Mono',monospace",'font-size':'.76rem','font-weight':'700','color':D0,'margin-top':'4px'})}">${D.refno}</div>
      <div style="${S({'font-size':'.58rem','color':D0,'opacity':'.6','margin-top':'5px'})}">Date: ${D.qdateStr}</div>
      <div style="${S({'font-size':'.58rem','color':D0,'opacity':'.6','margin-top':'1px'})}">Valid: ${D.duedateStr}</div>
    </div>
  </div>
  <div style="${S({'padding':'30px 44px 36px','position':'relative','z-index':'1'})}">
    <div style="${S({'font-size':'.6rem','color':GD,'letter-spacing':'3px','text-transform':'uppercase','font-weight':'600','margin-bottom':'10px','opacity':'.8'})}">Techno-Commercial Proposal &nbsp;·&nbsp; ${sd.name} &nbsp;·&nbsp; ${D.ptype}</div>
    <div style="${S({'font-family':"'Outfit',sans-serif",'font-size':'2.2rem','color':WH,'font-weight':'800','line-height':'1.05','letter-spacing':'-0.8px'})}">Solar Power</div>
    <div style="${S({'font-family':"'Outfit',sans-serif",'font-size':'2.2rem','color':GD,'font-weight':'800','line-height':'1.05','letter-spacing':'-0.8px','margin-bottom':'10px'})}">Plant Proposal</div>
    <div style="${S({'font-size':'.78rem','color':'rgba(255,255,255,.42)','max-width':'460px','line-height':'1.65'})}">${sysLabel}</div>
    <div style="${S({'display':'flex','gap':'8px','margin-top':'20px','flex-wrap':'wrap'})}">
      ${[`${D.cap} kWp System`,sd.name,`${D.sal} ${D.cust}`,D.ptype,...(D.stype==='hybrid'?[`${D.bkwh} kWh Battery`]:[]),`Valid ${D.validity} Days`].map(t=>`<div style="${S({'background':'rgba(255,255,255,.08)','border':'1px solid rgba(255,255,255,.14)','padding':'4px 12px','border-radius':'20px','font-size':'.63rem','color':'rgba(255,255,255,.85)','display':'inline-flex','align-items':'center','gap':'6px'})}"><span style="width:5px;height:5px;border-radius:50%;background:${GD};flex-shrink:0;display:inline-block"></span>${t}</div>`).join('')}
    </div>
  </div>
</div>

<!-- 01 LETTER -->
<div data-sec="letter" style="${S({'padding':'28px 44px','background':WH,'border-bottom':`1px solid ${BD}`})}">
  ${secH('01','Introduction Letter',GD)}
  <div style="${S({'background':GL,'border-left':`4px solid ${GD}`,'border-radius':'0 8px 8px 0','padding':'20px 24px','line-height':'1.85','color':T1,'font-size':'.82rem'})}">
    <div style="${S({'margin-bottom':'14px'})}"><div style="${S({'font-weight':'700','font-size':'.84rem'})}">To,</div><div style="${S({'margin-top':'3px','color':T2})}">${D.sal} ${D.cust}${D.billaddr?'<br>'+D.billaddr.replace(/\n/g,'<br>'):''}</div></div>
    <div style="${S({'font-size':'.72rem','color':T3,'margin-bottom':'14px','padding-bottom':'12px','border-bottom':`1px dashed ${BD}`})}">Date: <strong style="color:${T1}">${D.qdateStr}</strong> &nbsp;|&nbsp; Ref: <strong style="color:${T1}">${D.refno}</strong> &nbsp;|&nbsp; Valid Until: <strong style="color:${T1}">${D.duedateStr}</strong></div>
    <div style="${S({'font-weight':'700','font-size':'.83rem','color':D0,'margin-bottom':'12px'})}">Sub: Solar Power Plant Proposal — ${D.cap} kWp ${D.stype==='hybrid'?'Hybrid':'On-Grid'} System — ${sd.name}</div>
    <div style="${S({'font-weight':'700','margin-bottom':'12px'})}">Dear ${D.sal} ${(D.cust||'').split(' ')[0]||'Sir/Madam'},</div>
    ${ltrBodyText.split('\n').filter(l=>l.trim()).map(p=>`<p style="${S({'margin-bottom':'10px','line-height':'1.8','font-size':'.82rem'})}">${p}</p>`).join('')}
    <div style="${S({'margin-top':'22px','padding-top':'16px','border-top':`1px solid rgba(232,160,32,.3)`})}">
      <div style="${S({'margin-bottom':'22px','font-size':'.82rem'})}">Yours faithfully,</div>
      ${co.sigImg?`<div style="margin-bottom:8px"><img src="${co.sigImg}" style="max-height:46px;width:auto;display:block" alt="Signature"></div>`:'<div style="height:40px"></div>'}
      <div style="${S({'display':'inline-block','border-top':`2px solid ${D0}`,'padding-top':'6px'})}">
        <div style="${S({'font-weight':'800','color':D0,'font-size':'.88rem','font-family':"'Outfit',sans-serif"})}">Mr. Manoj M S</div>
        <div style="${S({'font-size':'.73rem','color':T2,'margin-top':'1px'})}">Chief Executive Officer</div>
        <div style="${S({'font-size':'.7rem','color':T3,'margin-top':'1px'})}">${co.name||'Enermass Power Solutions Pvt. Ltd.'}</div>
      </div>
    </div>
  </div>
</div>

<!-- 02 COMPANY -->
<div data-sec="company" style="${S({'padding':'28px 44px','background':BG,'border-bottom':`1px solid ${BD}`})}">
  ${secH('02','Company Profile',TL)}
  <div style="${S({'display':'grid','grid-template-columns':'1fr 1fr','gap':'8px','margin-bottom':'14px'})}">
    ${[['Company',co.name||'—'],['CIN / Reg. No.',co.cin||'—'],['GST Number',co.gst||'—'],['PAN',co.pan||'—'],['Phone',co.phone||'—'],['Email',co.email||'—'],['Website',co.web||'—'],['Address',(fromAddr||co.addr||'').replace(/\n/g,', ')]].map(([l,v])=>`<div style="${S({'background':WH,'border':'1px solid ${BD}','border-radius':'8px','padding':'10px 13px'})}"><div style="${S({'font-size':'.58rem','color':T3,'text-transform':'uppercase','letter-spacing':'.6px','font-weight':'600','margin-bottom':'3px'})}">${l}</div><div style="${S({'font-size':'.8rem','color':T1,'font-weight':'600','line-height':'1.4'})}">${v}</div></div>`).join('')}
  </div>
  <div style="${S({'background':WH,'border':'1px solid ${BD}','border-radius':'8px','padding':'14px 16px','margin-bottom':'14px'})}">
    <div style="${S({'font-weight':'700','color':D0,'font-size':'.78rem','margin-bottom':'7px','font-family':"'Outfit',sans-serif"})}">Business Activities</div>
    <div style="${S({'font-size':'.77rem','color':T2,'line-height':'1.7'})}">${co['cp-biz']||''}${co['cp-areas']?`<br><strong>Service Areas:</strong> ${co['cp-areas']}`:''}${co['cp-certs']?`<br><strong>Certifications:</strong> ${co['cp-certs']}`:''}${co['cp-notes']?`<br>${co['cp-notes']}`:''}</div>
  </div>
  <div style="${S({'display':'grid','grid-template-columns':'repeat(3,1fr)','gap':'10px'})}">
    ${[[co['cp-exp']?.split(' ')[0]||'10+','Experience','Years',GD],[co['cp-proj']?.split(' ')[0]||'500+','Projects','Commissioned',TL],[co['cp-mw']?.split(' ')[0]||'15+','Capacity','MW Installed',BL]].map(([v,l,u,c])=>`<div style="${S({'background':`linear-gradient(135deg,${D0},${D1})`,'border-radius':'10px','padding':'16px','text-align':'center'})}"><div style="${S({'font-family':"'Space Mono',monospace",'font-size':'1.3rem','color':c,'font-weight':'700'})}">${v}</div><div style="${S({'font-size':'.62rem','color':'rgba(255,255,255,.4)','text-transform':'uppercase','letter-spacing':'.5px','margin-top':'1px'})}">${u}</div><div style="${S({'font-size':'.72rem','color':'rgba(255,255,255,.65)','margin-top':'3px'})}">${l}</div></div>`).join('')}
  </div>
</div>

<!-- 03 CUSTOMER -->
<div data-sec="customer" style="${S({'padding':'28px 44px','background':WH,'border-bottom':`1px solid ${BD}`})}">
  ${secH('03','Customer Profile',BL)}
  <div style="${S({'display':'grid','grid-template-columns':'repeat(3,1fr)','gap':'0','border':'1px solid ${BD}','border-radius':'10px','overflow':'hidden'})}">
    ${[['Name',`${D.sal} ${D.cust}`],['Phone',D.phone||'—'],['Email',D.email||'—'],['State / District',`${sd.name}${D.dist?' / '+D.dist:''}`],['Pin Code',D.pin||'—'],['DISCOM',D.discom||sd.discom],['Address',D.billaddr?.replace(/\n/g,', ')||'—'],['Site Address',D.site?.replace(/\n/g,', ')||'—'],['Meter / Consumer No.',D.meter||'—'],['Consumer Category',D.categ||'—'],['System Type',D.ptype],['Installation State',sd.name]].map(([l,v],i,a)=>`<div style="${S({'padding':'10px 14px','background':i%6<3?WH:BG,'border-bottom':i<a.length-3?`1px solid ${BD}`:'none','border-right':i%3<2?`1px solid ${BD}`:'none'})}"><div style="${S({'font-size':'.58rem','color':T3,'text-transform':'uppercase','letter-spacing':'.55px','margin-bottom':'3px'})}">${l}</div><div style="${S({'font-size':'.8rem','color':T1,'font-weight':'600','line-height':'1.3'})}">${v}</div></div>`).join('')}
  </div>
</div>

<!-- 04 SYSTEM DESIGN -->
<div data-sec="sysdesign" style="${S({'padding':'28px 44px','background':BG,'border-bottom':`1px solid ${BD}`})}">
  ${secH('04','System Design & Specifications',GD)}
  <div style="${S({'display':'grid','grid-template-columns':'repeat(4,1fr)','gap':'10px','margin-bottom':'16px'})}">
    ${kpi(`${D.cap} kWp`,'DC Peak','System Capacity',D0)}
    ${kpi(fmtN(mGen(D.cap)),'kWh/Month','Est. Generation',TL)}
    ${kpi(fmtN(aGen(D.cap)),'kWh/Year','Annual Output',GR)}
    ${kpi(D.area,'sq.ft','Roof Area',BL)}
    ${D.stype==='hybrid'?kpi(`${D.bkwh} kWh`,'Battery',D.btype||'LiFePO4',GD):''}
  </div>
  <div style="${S({'background':WH,'border':'1px solid ${BD}','border-radius':'10px','overflow':'hidden'})}">
    <table style="${S({'width':'100%','border-collapse':'collapse'})}">
      <thead><tr style="${S({'background':D0})}">
        ${['Component','Specification'].map(h=>`<th style="${S({'padding':'9px 14px','text-align':'left','font-size':'.63rem','text-transform':'uppercase','letter-spacing':'.7px','color':'rgba(255,255,255,.65)','font-weight':'600'})}">${h}</th>`).join('')}
      </tr></thead>
      <tbody>
        ${[['Solar PV Module',`${D.pbrand||'As per approved make'} — ${D.pwp} Wp × ${D.pcount} Nos`],['Inverter',`${D.inv?D.inv.brand+' — '+D.inv.cap:'As per approved make'}`],['System Type',sysLabel],...(D.stype==='hybrid'?[['Battery Bank',`${D.bkwh} kWh — ${D.btype||'LiFePO4'} — ${D.bhrs}h Backup`]]:[]),['Monthly Consumption',`${D.cons} kWh/Month`]].map(([c,s],i)=>`<tr style="${S({'background':i%2===0?WH:BG})}"><td style="${S({'padding':'9px 14px','font-weight':'700','color':D0,'font-size':'.8rem','border-bottom':`1px solid ${BD}`,'width':'35%'})}">${c}</td><td style="${S({'padding':'9px 14px','color':T2,'font-size':'.8rem','border-bottom':`1px solid ${BD}`})}">${s}</td></tr>`).join('')}
      </tbody>
    </table>
  </div>
</div>

<!-- 05 BOM -->
<div data-sec="bom" style="${S({'padding':'28px 44px','background':WH,'border-bottom':`1px solid ${BD}`})}">
  ${secH('05','Bill of Materials',GD)}
  <div style="${S({'border':'1px solid ${BD}','border-radius':'10px','overflow':'hidden'})}">
    <table style="${S({'width':'100%','border-collapse':'collapse'})}">
      <thead><tr style="${S({'background':D0})}">
        ${['#','Description','Specification','Qty','Unit'].map((h,i)=>`<th style="${S({'padding':'9px 12px','text-align':i>2?'center':'left','font-size':'.62rem','text-transform':'uppercase','letter-spacing':'.7px','color':'rgba(255,255,255,.65)','font-weight':'600'})}">${h}</th>`).join('')}
      </tr></thead>
      <tbody>${bomHTML}</tbody>
    </table>
  </div>
</div>

<!-- 06 SUBSIDY -->
<div data-sec="subsidy" style="${S({'padding':'28px 44px','background':BG,'border-bottom':`1px solid ${BD}`})}">
  ${secH('06','Government Subsidy & Incentives',GD)}
  ${subSection}
</div>

<!-- 07 NET METERING -->
<div data-sec="netmetering" style="${S({'padding':'28px 44px','background':WH,'border-bottom':`1px solid ${BD}`})}">
  ${secH('07','Net Metering & Grid Connection',TL)}
  <div style="${S({'display':'grid','grid-template-columns':'1fr 1fr','gap':'14px'})}">
    <div style="${S({'background':BG,'border-radius':'10px','padding':'16px','border':'1px solid ${BD}','border-top':`3px solid ${TL}`})}">
      <div style="${S({'font-weight':'700','color':D0,'font-size':'.78rem','margin-bottom':'12px','font-family':"'Outfit',sans-serif"})}">Grid Connection — ${sd.name}</div>
      ${row('DISCOM',D.discom||sd.discom)}
      ${row('Nodal Agency',`<span style="font-size:.68rem">${sd.agency}</span>`)}
      ${row('Net Metering Limit',sd.netMeteringLimit)}
      ${row('Connection Time',sd.connTime)}
      ${row('Settlement',`<span style="font-size:.67rem;white-space:normal;word-break:break-word">${sd.nmSettle}</span>`)}
      ${row('Export Tariff (APPC)',`<span style="color:${GR};font-weight:700">₹${D.exportRate}/unit</span>`,true)}
    </div>
    <div style="${S({'background':BG,'border-radius':'10px','padding':'16px','border':'1px solid ${BD}','border-top':`3px solid ${GD}`})}">
      <div style="${S({'font-weight':'700','color':D0,'font-size':'.78rem','margin-bottom':'12px','font-family':"'Outfit',sans-serif"})}">${sd.name} — Electricity Tariff Slabs</div>
      ${(sd.tariff||[]).map((t,i,a)=>row(t.s,`<span style="font-family:'Space Mono',monospace;font-size:.74rem;color:${D0};font-weight:700">${t.r}</span>`,i===a.length-1)).join('')}
      <div style="${S({'margin-top':'10px','padding':'8px 10px','background':GL,'border-radius':'7px','display':'flex','justify-content':'space-between','align-items':'center'})}"><span style="${S({'font-size':'.73rem','font-weight':'700','color':D0})}">Avg. Grid Tariff</span><span style="${S({'font-family':"'Space Mono',monospace",'font-size':'.85rem','font-weight':'700','color':GD})}">${D.tariff}/unit</span></div>
    </div>
  </div>
</div>

<!-- 08 FINANCIAL -->
<div data-sec="financial" style="${S({'padding':'28px 44px','background':BG,'border-bottom':`1px solid ${BD}`})}">
  ${secH('08','Financial Analysis',GR)}
  <div style="${S({'display':'grid','grid-template-columns':'repeat(4,1fr)','gap':'10px','margin-bottom':'14px'})}">
    ${kpi(inr(D.annSave),'Annual','Bill Savings',D0)}
    ${kpi(inr(D.annExport),'Annual','Export Income',TL)}
    ${kpi(inr(D.annBen),'Total Annual','Benefit',GR)}
    ${kpi(`${D.payback} yrs`,'Payback','Period',GD)}
  </div>
  <div style="${S({'display':'grid','grid-template-columns':'repeat(3,1fr)','gap':'10px','margin-bottom':'16px'})}">
    ${[[inr(D.cum25),'25-Year Cumulative Returns','📈',GR],[`${D.roi25}%`,'25-Year Return on Investment','💹',TL],[`${sd.tariffEsc}% p.a.`,'Tariff Escalation Rate','📊',GD]].map(([v,l,ic,c])=>`<div style="${S({'background':WH,'border':'1px solid ${BD}','border-radius':'10px','padding':'14px 16px','display':'flex','align-items':'center','gap':'12px'})}"><div style="${S({'width':'38px','height':'38px','border-radius':'8px','background':`linear-gradient(135deg,${D0},${D1})`,'display':'flex','align-items':'center','justify-content':'center','flex-shrink':'0','font-size':'.9rem'})}">${ic}</div><div><div style="${S({'font-family':"'Space Mono',monospace",'font-size':'.95rem','font-weight':'700','color':c})}">${v}</div><div style="${S({'font-size':'.68rem','color':T3,'margin-top':'2px'})}">${l}</div></div></div>`).join('')}
  </div>
  <div style="${S({'background':WH,'border':'1px solid ${BD}','border-radius':'10px','overflow':'hidden'})}">
    <table style="${S({'width':'100%','border-collapse':'collapse'})}">
      <thead><tr style="${S({'background':D0})}">
        ${['Year','Generation','Annual Benefit','Cumulative','Net (After Investment)'].map((h,i)=>`<th style="${S({'padding':'10px 12px','text-align':i===0?'left':'right','font-size':'.62rem','text-transform':'uppercase','letter-spacing':'.7px','color':'rgba(255,255,255,.65)','font-weight':'600'})}">${h}</th>`).join('')}
      </tr></thead>
      <tbody>${finRows}</tbody>
    </table>
  </div>
</div>

<!-- 09 COST SUMMARY -->
<div data-sec="cost" style="${S({'padding':'28px 44px','background':WH,'border-bottom':`1px solid ${BD}`})}">
  ${secH('09','Cost Summary',GD)}
  <div style="${S({'background':`linear-gradient(150deg,${D0} 0%,#0D2845 60%,#091929 100%)`,'border-radius':'12px','padding':'22px 26px','position':'relative','overflow':'hidden'})}">
    <div style="position:absolute;top:-40px;right:-40px;width:160px;height:160px;background:radial-gradient(circle,rgba(232,160,32,.15),transparent 65%);border-radius:50%"></div>
    ${[
      ['Total Plant Price (Incl. GST)',inr(D.totalProj),'rgba(255,255,255,.95)','1rem',true],
      ...(D.addCostAmt>0?[['Plant Price Alone',inr(D.pricePaid),'rgba(255,255,255,.5)','.78rem',false],[(D.addCostDesc||'Additional Cost'),inr(D.addCostAmt),'rgba(255,255,255,.5)','.78rem',false]]:[]),
      ['Taxable Value (÷ 1.089)',inr(D.taxableVal),'rgba(255,255,255,.45)','.77rem',false],
      ['GST @ 8.9% Blended',inr(D.totalGST),'rgba(255,255,255,.45)','.77rem',false],
      ...(D.disc>0?[['Discount (Display Only)',`−${inr(D.disc)}`,'#FF9A9A','.77rem',false]]:[]),
      ...(D.subon&&D.tsub>0?[[`Govt. Subsidy (CFA + State)`,`−${inr(D.tsub)}`,'#7ECFFF','.8rem',false]]:[]),
    ].map(([l,v,c,fs,bold],i,arr)=>`
      <div style="${S({'display':'flex','justify-content':'space-between','align-items':'center','padding':'8px 0','position':'relative','z-index':'1'})}">
        <span style="${S({'font-size':fs,'color':c,'font-weight':bold?'700':'400'})}">${l}</span>
        <span style="${S({'font-family':"'Space Mono',monospace",'font-size':fs,'color':c,'font-weight':bold?'700':'400'})}">${v}</span>
      </div>
      ${i<arr.length-1?`<div style="height:1px;background:rgba(255,255,255,.07)"></div>`:''}`).join('')}
    <div style="${S({'margin-top':'14px','background':'rgba(39,174,96,.15)','border':'1.5px solid rgba(39,174,96,.35)','border-radius':'10px','padding':'14px 18px','position':'relative','z-index':'1'})}">
      <div style="${S({'display':'flex','justify-content':'space-between','align-items':'center'})}">
        <div><div style="${S({'font-size':'.63rem','text-transform':'uppercase','letter-spacing':'1px','color':'rgba(165,214,167,.8)','font-weight':'700','margin-bottom':'3px'})}">💰 Customer Financial Commitment</div><div style="${S({'font-size':'.6rem','color':'rgba(255,255,255,.3)'})}">${D.addCostAmt>0?'Plant Price + Additional Cost − Subsidy':'Total Plant Price − Subsidy'}</div></div>
        <div style="${S({'font-family':"'Space Mono',monospace",'font-size':'1.25rem','font-weight':'700','color':'#A5D6A7'})}">${inr(D.commit)}</div>
      </div>
      <div style="${S({'font-size':'.62rem','font-style':'italic','color':'rgba(165,214,167,.65)','text-align':'right','margin-top':'5px'})}">${numberToIndianCurrencyWords(D.commit)}</div>
    </div>
    <div style="${S({'margin-top':'10px','font-size':'.6rem','color':'rgba(255,255,255,.3)','line-height':'1.6','position':'relative','z-index':'1','padding-top':'10px','border-top':'1px dashed rgba(255,255,255,.1)'})}">GST @ 8.9% blended per MNRE Govt. notification. Discount included in Total Plant Price. Subsidy reduces customer commitment only. All prices in INR.</div>
    <div style="${S({'margin-top':'8px','display':'flex','align-items':'center','gap':'8px','background':'rgba(255,255,255,.05)','border-radius':'6px','padding':'7px 10px','position':'relative','z-index':'1'})}"><span style="${S({'font-size':'.63rem','color':'rgba(255,255,255,.4)'})}">📅 Proposal Valid Until</span><strong style="${S({'font-size':'.67rem','color':'rgba(255,255,255,.75)'})}">${D.duedateStr} (${D.validity} Days)</strong></div>
  </div>
  ${D.subon&&D.tsub>0?`<div style="${S({'margin-top':'12px','background':BLL,'border':'1.5px solid #90CAF9','border-radius':'10px','padding':'14px 18px','display':'flex','justify-content':'space-between','align-items':'center','flex-wrap':'wrap','gap':'8px'})}"><div><div style="${S({'font-weight':'700','color':BL,'font-size':'.8rem','margin-bottom':'3px'})}">🏛 Government Subsidy (CFA + State)</div><div style="${S({'font-size':'.7rem','color':T2})}">Credited directly to customer by Government post-commissioning.</div></div><div style="text-align:right"><div style="${S({'font-family':"'Space Mono',monospace",'font-size':'1.15rem','font-weight':'700','color':BL})}">${inr(D.tsub)}</div><div style="${S({'font-size':'.62rem','color':T3})}">CFA ${inr(D.cfa)} + State ${inr(D.ssub)}</div></div></div>`:''}
</div>

<!-- 10 T&C -->
<div data-sec="tnc" style="${S({'padding':'28px 44px','background':BG,'border-bottom':`1px solid ${BD}`})}">
  ${secH('10','Terms & Conditions',T3)}
  <div style="${S({'background':WH,'border':'1px solid ${BD}','border-radius':'10px','padding':'4px 16px 8px'})}">
    <div style="${S({'font-size':'.68rem','color':T3,'padding':'8px 0','border-bottom':`1px dashed ${BD}`,'margin-bottom':'4px'})}">General T&amp;C applicable to all projects · ${sd.name}-specific T&amp;C additionally applicable</div>
    ${tncRaw.map((l,i)=>`<div style="${S({'display':'flex','gap':'12px','font-size':'.76rem','color':T2,'line-height':'1.6','padding':'6px 0','border-bottom':`1px dashed ${BD}`})}"><span style="${S({'font-family':"'Space Mono',monospace",'font-size':'.64rem','color':T3,'min-width':'24px','padding-top':'2px','flex-shrink':'0'})}">${String(i+1).padStart(2,'0')}</span><span>${l.replace(/^\d+\.\s*/,'')}</span></div>`).join('')}
  </div>
</div>

<!-- 11 WHY SOLAR -->
<div data-sec="solar-info" style="${S({'padding':'28px 44px','background':`linear-gradient(135deg,#EBF5FB,#EAFAF1)`,'border-bottom':`1px solid ${BD}`})}">
  ${secH('11','Why Solar Power? Why Enermass?',GR)}
  <div style="${S({'display':'grid','grid-template-columns':'1fr 1fr','gap':'12px','margin-bottom':'14px'})}">
    ${[['☀️','Benefits of Solar Power',GD,['Reduce electricity bills by 70–90%','25-year system lifespan, minimal maintenance','Protection against rising electricity tariffs','Earn income via net metering / grid export','Increase property value significantly','Zero carbon emissions — clean energy']],['🏅','Why Choose Enermass?',TL,['MNRE Empanelled EPC Contractor',`${co['cp-exp']||'10+ Years'} of solar expertise`,`${co['cp-proj']||'500+'} successful installations`,`${co['cp-mw']||'15 MW+'} capacity commissioned`,'End-to-end DISCOM liaison & net metering','ISO 9001:2015 certified quality processes']],['🔧','Warranty & Performance',BL,['Solar panels: 25-year linear power warranty','Inverter: 5–10 years manufacturer warranty','Structure: 10-year structural warranty','Workmanship: 2-year installation warranty','MNRE certified Tier-1 manufacturers','BIS / IEC certified components']],['🤝','Customer Support',GR,['Dedicated project manager per installation','Timely DISCOM application & NM support','Post-installation commissioning & testing','Annual performance monitoring report','Responsive — call / WhatsApp support',co.phone||'Contact us for service queries']]].map(([ic,t,c,items])=>`<div style="${S({'background':WH,'border-radius':'10px','padding':'14px 16px','border':'1px solid ${BD}','border-top':`3px solid ${c}`})}"><div style="${S({'font-weight':'700','color':D0,'font-size':'.8rem','margin-bottom':'10px','display':'flex','align-items':'center','gap':'7px','font-family':"'Outfit',sans-serif"})}"><span>${ic}</span>${t}</div>${items.map(item=>`<div style="${S({'display':'flex','align-items':'flex-start','gap':'8px','font-size':'.73rem','color':T2,'line-height':'1.55','padding':'3px 0'})}"><span style="${S({'color':c,'flex-shrink':'0'})}">✓</span><span>${item}</span></div>`).join('')}</div>`).join('')}
  </div>
  <div style="${S({'background':`linear-gradient(135deg,${D0},${D1})`,'border-radius':'10px','padding':'13px 20px','display':'flex','justify-content':'space-between','align-items':'center','flex-wrap':'wrap','gap':'8px'})}">
    <div style="${S({'color':WH,'font-size':'.72rem','font-weight':'600'})}">🌱 Site Survey → System Design → DISCOM Application → Installation → Net Metering → Commissioning</div>
    <div style="${S({'color':GD,'font-size':'.72rem','font-weight':'700'})}">${co.phone||''} ${co.email?'· '+co.email:''}</div>
  </div>
</div>

<!-- SIGNATURE -->
<div style="${S({'padding':'22px 44px','display':'flex','justify-content':'space-between','align-items':'flex-end','background':WH,'border-top':`2px solid ${BD}`})}">
  <div><div style="height:38px"></div><div style="${S({'display':'inline-block','border-top':`2px solid ${D0}`,'padding-top':'7px'})}"><div style="${S({'font-weight':'700','color':D0,'font-size':'.85rem','font-family':"'Outfit',sans-serif"})}">${D.sal} ${D.cust}</div><div style="${S({'font-size':'.72rem','color':T3,'margin-top':'1px'})}">Customer Acceptance</div></div></div>
  <div style="text-align:center"><div style="font-size:1.8rem;line-height:1">☀️</div><div style="${S({'font-size':'.65rem','color':GD,'font-weight':'700','margin-top':'4px','font-family':"'Outfit',sans-serif"})}">Solar Power Plant Proposal</div><div style="${S({'font-size':'.6rem','color':T3,'margin-top':'1px','font-family':"'Space Mono',monospace"})}">${D.refno}</div></div>
  <div style="text-align:right"><div style="height:38px"></div><div style="${S({'display':'inline-block','border-top':`2px solid ${D0}`,'padding-top':'7px','text-align':'left'})}">${D.salesExec?`<div style="${S({'font-weight':'700','color':D0,'font-size':'.85rem','font-family':"'Outfit',sans-serif"})}">${D.salesExec.name}</div><div style="${S({'font-size':'.73rem','color':T2,'margin-top':'1px'})}">${D.salesExec.desig||'Sales Executive'}</div><div style="${S({'font-size':'.7rem','color':T3,'margin-top':'1px'})}">${co.name||'Enermass Power Solutions Pvt. Ltd.'}</div>${D.salesExec.phone?`<div style="${S({'font-size':'.68rem','color':T3,'margin-top':'2px'})}">${D.salesExec.phone}</div>`:''}`:`<div style="${S({'font-weight':'700','color':D0,'font-size':'.85rem','font-family':"'Outfit',sans-serif"})}">Authorised Signatory</div><div style="${S({'font-size':'.7rem','color':T3,'margin-top':'1px'})}">${co.name||'Enermass Power Solutions Pvt. Ltd.'}</div>`}</div></div>
</div>

<!-- FOOTER -->
<div style="${S({'padding':'10px 44px','background':D0,'display':'flex','justify-content':'space-between','align-items':'center','flex-wrap':'wrap','gap':'6px'})}">
  <span style="${S({'font-size':'.6rem','color':'rgba(255,255,255,.38)','font-family':"'Space Mono',monospace"})}">Ref: ${D.refno} · ${D.qdateStr} · Valid: ${D.duedateStr}</span>
  <span style="${S({'font-size':'.65rem','color':GD,'font-weight':'600'})}">${co.name||'Enermass Power Solutions Pvt. Ltd.'} ${co.web?'· '+co.web:''}</span>
</div>`;
}
