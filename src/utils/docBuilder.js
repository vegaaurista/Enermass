import { inr, fmtN, mGen, aGen, bomQty, numberToIndianCurrencyWords } from './helpers';
import { SD, DEFAULT_BRANCHES } from '../data/defaults';

export function buildDoc(D) {
  const sd = D.sd || SD[D.state];
  const co = D.co || {};
  const sysLabel = D.stype === 'hybrid'
    ? 'Hybrid Solar Power Plant (Grid-Tied + Battery Backup)'
    : 'Grid-Connected Rooftop Solar Power Plant (Net Metering)';
  const logoHTML = co.logo
    ? `<img src="${co.logo}" class="cov-logo" alt="${co.name || 'Logo'}" crossorigin="anonymous">`
    : '';
  const revBadge = D.refno && D.refno.includes('–')
    ? `<span style="background:rgba(200,147,58,.9);color:#0f2744;font-size:.6rem;font-weight:700;padding:2px 8px;border-radius:20px;margin-left:6px">${D.refno.split('–').slice(-1)[0].trim()}</span>`
    : '';

  // BOM
  let bomHTML = ''; let lastCat = ''; let sn = 0;
  (D.bom || []).filter(x => x.sys === 'all' || x.sys === D.stype).forEach(item => {
    if (item.cat !== lastCat) { bomHTML += `<tr class="bc"><td colspan="5">${item.cat}</td></tr>`; lastCat = item.cat; }
    sn++;
    const qty = bomQty(item, D);
    bomHTML += `<tr><td style="text-align:center;color:#6c757d;font-size:.72rem">${sn}</td><td class="bo">${item.desc}</td><td style="font-size:.74rem;color:#6c757d">${item.spec}</td><td style="text-align:center">${qty}</td><td style="text-align:center">${item.unit}</td></tr>`;
  });

  // Financial 10yr
  let finRows = ''; let cum = 0;
  for (let y = 1; y <= 10; y++) {
    const yb = D.annBen * Math.pow(1 + (sd.tariffEsc / 100), y - 1) * Math.pow(0.995, y);
    cum += yb;
    const net = cum - D.commit;
    finRows += `<tr><td>Year ${y}</td><td class="m">${fmtN(Math.round(D.agen * Math.pow(0.995, y)))} kWh</td><td class="m">${inr(yb)}</td><td class="m">${inr(cum)}</td><td class="m ${net > 0 ? 'pos' : ''}">${net > 0 ? inr(net) : '—'}</td></tr>`;
  }

  // T&C
  const tnc = D.tnc || {};
  const tncRaw = [...(tnc.common || '').split('\n').filter(l => l.trim()), ...(tnc[D.state] || '').split('\n').filter(l => l.trim())];
  const tncHTML = tncRaw.map((l, i) => `<div class="tnc-i"><div class="tnc-n">${String(i + 1).padStart(2, '0')}</div><div>${l.replace(/^\d+\.\s*/, '')}</div></div>`).join('');

  // Incentives
  const incHTML = (sd.inc || []).map(x => `<div class="sr"><span>${x.i}</span><span class="sv2">${x.v}</span></div>`).join('');

  // Subsidy
  const subSection = D.subon ? `
  <div class="sub-hero">
    <div><h3>🇮🇳 PM Surya Ghar: Muft Bijli Yojana (CFA)</h3><p>Central Financial Assistance – MNRE | CFA = 30,000×min(S,2) + 18,000×max(0,min(S−2,1))</p></div>
    <div><div class="sha">${D.cfa > 0 ? inr(D.cfa) : 'N/A'}</div><div class="shal">${D.ptype === 'Residential' ? 'CFA Applicable' : 'Not applicable – ' + D.ptype}</div></div>
  </div>
  <div class="sub-grid">
    <div class="sub-card"><h4>🏛 MNRE CFA Structure</h4>
      <div class="sr"><span>Up to 2 kWp</span><span class="sv2">₹30,000/kW</span></div>
      <div class="sr"><span>2–3 kWp (incremental)</span><span class="sv2">₹18,000/kW</span></div>
      <div class="sr"><span>Max for individual</span><span class="sv2">₹78,000</span></div>
      <div class="sr"><span>System Size</span><span class="sv2">${D.cap} kWp</span></div>
      <div class="sr"><span>Proposal Type</span><span class="sv2">${D.ptype}</span></div>
      <div class="sr" style="background:#e3f0ff;border-radius:4px;padding:4px 6px;margin-top:5px"><span style="color:#1565c0;font-weight:700">CFA Subsidy</span><span style="color:#1565c0;font-weight:700;font-family:'Space Mono',monospace">${D.cfa > 0 ? inr(D.cfa) : 'Not Applicable'}</span></div>
    </div>
    <div class="sub-card state"><h4>🌿 ${sd.name} – State Incentives</h4>
      <div class="sr"><span>Nodal Agency</span><span class="sv2" style="font-size:.7rem">${sd.agency}</span></div>
      ${incHTML}
      ${D.ssub > 0 ? `<div class="sr" style="background:#e3f0ff;border-radius:4px;padding:4px 6px;margin-top:5px"><span style="color:#1565c0;font-weight:700">State Subsidy</span><span style="color:#1565c0;font-weight:700;font-family:'Space Mono',monospace">${inr(D.ssub)}</span></div>` : ''}
    </div>
  </div>` : `<div class="alert ai">Subsidy not included – ${D.ptype} project (CFA not applicable or excluded).</div>`;

  // Letter
  const ltrBodyText = D.lbody || 'We are pleased to present this Solar Power Plant Proposal for your consideration.';
  const ltrHTML = `
    <div style="margin-bottom:12px;font-size:.82rem;color:#343a40"><strong>To,</strong><br>${D.sal} ${D.cust}${D.billaddr ? '<br>' + D.billaddr.replace(/\n/g, '<br>') : ''}</div>
    <div style="margin-bottom:12px;font-size:.78rem;color:#6c757d">Date: <strong>${D.qdateStr}</strong> &nbsp;|&nbsp; Ref: <strong>${D.refno}</strong> &nbsp;|&nbsp; Valid Until: <strong>${D.duedateStr}</strong></div>
    <div style="margin-bottom:14px;font-size:.84rem"><strong>Sub: Solar Power Plant Proposal – ${D.cap} kWp ${D.stype === 'hybrid' ? 'Hybrid' : 'On-Grid'} System – ${sd.name}</strong></div>
    <div style="margin-bottom:10px;font-size:.84rem"><strong>Dear ${D.sal} ${(D.cust || '').split(' ')[0] || 'Sir/Madam'},</strong></div>
    ${ltrBodyText.split('\n').filter(l => l.trim()).map(p => `<p style="margin-bottom:10px;line-height:1.82;font-size:.83rem">${p}</p>`).join('')}
    <div style="margin-top:20px;font-size:.83rem;color:#343a40">
      <div style="margin-bottom:18px">Yours faithfully,</div>
      ${co.sigImg ? `<div style="margin-bottom:6px"><img src="${co.sigImg}" style="max-height:48px;width:auto;background:transparent;display:block" alt="Signature"></div>` : '<div style="height:44px"></div>'}
      <div style="display:inline-block;border-top:1px solid #0d1117;padding-top:5px">
        <div style="font-weight:700;color:#0f2744;font-size:.85rem;white-space:nowrap">Mr. Manoj M S</div>
        <div style="font-size:.76rem;color:#495057;margin-top:1px;white-space:nowrap">Chief Executive Officer</div>
        <div style="font-size:.73rem;color:#495057;margin-top:1px;white-space:nowrap">${co.name || 'Enermass Power Solutions Pvt. Ltd.'}</div>
      </div>
    </div>`;

  const fromAddr = (co.branches || {})[D.state] || DEFAULT_BRANCHES[D.state] || co.addr || '';

  return `
  <!-- COVER PAGE -->
  <div class="qcov">
    <div class="cov-hdr">
      <div class="cov-logo-area">
        ${logoHTML}
        <div>
          <div class="cov-co-name">${co.name || 'Enermass Power Solutions Pvt. Ltd.'}</div>
          <div class="cov-co-tag">${co.tag || 'Integrated Solar & Power Engineering Solutions'}</div>
          <div class="cov-co-cont">${fromAddr ? fromAddr.replace(/\n/g, ' · ') + '<br>' : ''}${co.phone || ''} ${co.email ? '| ' + co.email : ''} ${co.web ? '| ' + co.web : ''}</div>
        </div>
      </div>
      <div class="cov-ref">
        <div class="rl">Proposal Ref.</div>
        <div class="rn" style="font-size:${D.refno && D.refno.length > 22 ? '.62rem' : '.8rem'}">${D.refno}</div>
        <div class="rd">Date: ${D.qdateStr}</div>
        <div class="rd">Valid: ${D.duedateStr}</div>
      </div>
    </div>
    <div class="cov-body">
      <div class="cov-eyebrow">Techno-Commercial Proposal · ${sd.name} · ${D.ptype}</div>
      <div class="cov-title">Solar Power<span>Plant Proposal</span>${revBadge}</div>
      <div class="cov-sub">${sysLabel}</div>
    </div>
    <div class="cov-pills">
      <div class="pill"><div class="dot"></div>${D.cap} kWp System</div>
      <div class="pill"><div class="dot"></div>${sd.name}</div>
      <div class="pill"><div class="dot"></div>${D.sal} ${D.cust}</div>
      <div class="pill"><div class="dot"></div>${D.ptype}</div>
      ${D.stype === 'hybrid' ? `<div class="pill"><div class="dot"></div>${D.bkwh} kWh Battery</div>` : ''}
      <div class="pill"><div class="dot"></div>Valid ${D.validity} Days</div>
    </div>
  </div>

  <!-- 01 INTRODUCTION LETTER -->
  <div class="qs" data-sec="letter">
    <div class="qsh"><div class="qsn">01</div><div class="qst">Introduction Letter</div><div class="qsd"></div></div>
    <div class="qltr">${ltrHTML}</div>
  </div>

  <!-- 02 COMPANY PROFILE -->
  <div class="qs" data-sec="company">
    <div class="qsh"><div class="qsn">02</div><div class="qst">Company Profile</div><div class="qsd"></div></div>
    <div class="pgrid">
      <div class="pi"><div class="pl">Company</div><div class="pv">${co.name || 'Enermass Power Solutions Pvt. Ltd.'}</div></div>
      <div class="pi"><div class="pl">CIN / Reg. No.</div><div class="pv">${co.cin || '—'}</div></div>
      <div class="pi"><div class="pl">GST Number</div><div class="pv">${co.gst || '—'}</div></div>
      <div class="pi"><div class="pl">PAN</div><div class="pv">${co.pan || '—'}</div></div>
      <div class="pi"><div class="pl">Phone</div><div class="pv">${co.phone || '—'}</div></div>
      <div class="pi"><div class="pl">Email</div><div class="pv">${co.email || '—'}</div></div>
      <div class="pi"><div class="pl">Website</div><div class="pv">${co.web || '—'}</div></div>
      <div class="pi"><div class="pl">Address</div><div class="pv">${(fromAddr || co.addr || '').replace(/\n/g, ', ')}</div></div>
    </div>
    <div style="margin-top:10px;font-size:.7rem;background:#f8f9fa;border-radius:8px;padding:11px 14px;color:#495057;line-height:1.7">
      <div style="font-weight:700;color:#0f2744;margin-bottom:5px;font-size:.72rem">Business Activities</div>
      ${co['cp-biz'] || ''}
      ${co['cp-areas'] ? `<div style="margin-top:5px"><strong>Service Areas:</strong> ${co['cp-areas']}</div>` : ''}
      ${co['cp-certs'] ? `<div style="margin-top:5px"><strong>Certifications:</strong> ${co['cp-certs']}</div>` : ''}
      ${co['cp-notes'] ? `<div style="margin-top:5px">${co['cp-notes']}</div>` : ''}
    </div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:10px">
      ${co['cp-exp'] ? `<div style="background:linear-gradient(135deg,#0f2744,#1a3a5c);border-radius:8px;padding:10px;text-align:center"><div style="font-family:'Space Mono',monospace;font-size:.88rem;color:#e8b96a;font-weight:700">${co['cp-exp'].split(' ')[0]}</div><div style="font-size:.58rem;color:rgba(255,255,255,.55);margin-top:2px">Experience</div></div>` : ''}
      ${co['cp-proj'] ? `<div style="background:linear-gradient(135deg,#0f2744,#1a3a5c);border-radius:8px;padding:10px;text-align:center"><div style="font-family:'Space Mono',monospace;font-size:.88rem;color:#e8b96a;font-weight:700">${co['cp-proj'].split(' ')[0]}</div><div style="font-size:.58rem;color:rgba(255,255,255,.55);margin-top:2px">Projects</div></div>` : ''}
      ${co['cp-mw'] ? `<div style="background:linear-gradient(135deg,#0f2744,#1a3a5c);border-radius:8px;padding:10px;text-align:center"><div style="font-family:'Space Mono',monospace;font-size:.88rem;color:#e8b96a;font-weight:700">${co['cp-mw'].split(' ')[0]}</div><div style="font-size:.58rem;color:rgba(255,255,255,.55);margin-top:2px">Commissioned</div></div>` : ''}
    </div>
  </div>

  <!-- 03 CUSTOMER PROFILE -->
  <div class="qs" data-sec="customer">
    <div class="qsh"><div class="qsn">03</div><div class="qst">Customer Profile</div><div class="qsd"></div></div>
    <div class="cgrid">
      <div class="ci"><div class="cl">Name</div><div class="cv">${D.sal} ${D.cust}</div></div>
      <div class="ci"><div class="cl">Phone</div><div class="cv">${D.phone || '—'}</div></div>
      <div class="ci"><div class="cl">Email</div><div class="cv">${D.email || '—'}</div></div>
      <div class="ci"><div class="cl">State / District</div><div class="cv">${sd.name}${D.dist ? ' / ' + D.dist : ''}</div></div>
      <div class="ci"><div class="cl">Pin Code</div><div class="cv">${D.pin || '—'}</div></div>
      <div class="ci"><div class="cl">DISCOM</div><div class="cv">${D.discom || sd.discom}</div></div>
      ${D.billaddr ? `<div class="ci" style="grid-column:span 3"><div class="cl">Address</div><div class="cv">${D.billaddr.replace(/\n/g, ', ')}</div></div>` : ''}
      ${D.site ? `<div class="ci" style="grid-column:span 3"><div class="cl">Site Address</div><div class="cv">${D.site.replace(/\n/g, ', ')}</div></div>` : ''}
      <div class="ci"><div class="cl">Meter / Consumer No.</div><div class="cv">${D.meter || '—'}</div></div>
      <div class="ci"><div class="cl">Consumer Category</div><div class="cv">${D.categ || '—'}</div></div>
      <div class="ci"><div class="cl">System Type</div><div class="cv">${D.ptype}</div></div>
    </div>
  </div>

  <!-- 04 SYSTEM DESIGN -->
  <div class="qs" data-sec="sysdesign">
    <div class="qsh"><div class="qsn">04</div><div class="qst">System Design & Specifications</div><div class="qsd"></div></div>
    <div class="scards">
      <div class="sc"><div class="scv">${D.cap} kWp</div><div class="scu">System Capacity</div><div class="scl">DC Peak Power</div></div>
      <div class="sc"><div class="scv">${fmtN(mGen(D.cap))}</div><div class="scu">kWh/Month</div><div class="scl">Est. Generation</div></div>
      <div class="sc"><div class="scv">${fmtN(aGen(D.cap))}</div><div class="scu">kWh/Year</div><div class="scl">Annual Output</div></div>
      <div class="sc"><div class="scv">${D.area}</div><div class="scu">sq.ft</div><div class="scl">Roof Area</div></div>
      ${D.stype === 'hybrid' ? `<div class="sc"><div class="scv">${D.bkwh} kWh</div><div class="scu">Battery</div><div class="scl">${D.btype || 'LiFePO4'}</div></div>` : ''}
    </div>
    <table class="sp-t" style="width:100%;border-collapse:collapse;font-size:.78rem;margin-top:4px">
      <thead><tr><th style="background:#0f2744;color:#fff;padding:7px 10px;text-align:left;font-size:.65rem;text-transform:uppercase;letter-spacing:.35px">Component</th><th style="background:#0f2744;color:#fff;padding:7px 10px;text-align:left;font-size:.65rem;text-transform:uppercase;letter-spacing:.35px">Specification</th></tr></thead>
      <tbody>
        <tr><td style="padding:6px 10px;border-bottom:1px solid #dee2e6;font-weight:600">Solar PV Module</td><td style="padding:6px 10px;border-bottom:1px solid #dee2e6">${D.pbrand || 'As per approved make'} – ${D.pwp} Wp × ${D.pcount} Nos</td></tr>
        <tr><td style="padding:6px 10px;border-bottom:1px solid #dee2e6;background:#f8f9fa;font-weight:600">Inverter</td><td style="padding:6px 10px;border-bottom:1px solid #dee2e6;background:#f8f9fa">${D.inv ? D.inv.brand + ' – ' + D.inv.cap : 'As per approved make'}</td></tr>
        <tr><td style="padding:6px 10px;border-bottom:1px solid #dee2e6;font-weight:600">System Type</td><td style="padding:6px 10px;border-bottom:1px solid #dee2e6">${sysLabel}</td></tr>
        ${D.stype === 'hybrid' ? `<tr><td style="padding:6px 10px;border-bottom:1px solid #dee2e6;background:#f8f9fa;font-weight:600">Battery</td><td style="padding:6px 10px;border-bottom:1px solid #dee2e6;background:#f8f9fa">${D.bkwh} kWh – ${D.btype || 'LiFePO4'} – ${D.bhrs}h backup</td></tr>` : ''}
        <tr><td style="padding:6px 10px;font-weight:600">Monthly Consumption</td><td style="padding:6px 10px">${D.cons} kWh/month</td></tr>
      </tbody>
    </table>
  </div>

  <!-- 05 BILL OF MATERIALS -->
  <div class="qs" data-sec="bom">
    <div class="qsh"><div class="qsn">05</div><div class="qst">Bill of Materials</div><div class="qsd"></div></div>
    <table class="bom-t">
      <thead><tr><th style="width:36px">#</th><th>Description</th><th>Specification</th><th style="width:50px;text-align:center">Qty</th><th style="width:60px;text-align:center">Unit</th></tr></thead>
      <tbody>${bomHTML}</tbody>
    </table>
  </div>

  <!-- 06 SUBSIDY -->
  <div class="qs" data-sec="subsidy">
    <div class="qsh"><div class="qsn">06</div><div class="qst">Government Subsidy & Incentives</div><div class="qsd"></div></div>
    ${subSection}
  </div>

  <!-- 07 NET METERING -->
  <div class="qs" data-sec="netmetering">
    <div class="qsh"><div class="qsn">07</div><div class="qst">Net Metering & Grid Connection</div><div class="qsd"></div></div>
    <div class="nm-box" style="background:#e8f7ef;border-radius:8px;padding:13px 16px;margin-bottom:11px;border-left:4px solid #2d8c5a">
      <div style="font-weight:700;color:#0f2744;font-size:.78rem;margin-bottom:7px">🔄 Net Metering – ${sd.name}</div>
      <div class="tgrid">
        <div class="tcard">
          <h4>Grid Connection Details</h4>
          <div class="tr2"><span>DISCOM</span><span class="rate">${D.discom || sd.discom}</span></div>
          <div class="tr2"><span>Nodal Agency</span><span class="rate" style="font-size:.62rem">${sd.agency}</span></div>
          <div class="tr2"><span>Net Metering Limit</span><span class="rate">${sd.netMeteringLimit}</span></div>
          <div class="tr2"><span>Connection Time</span><span class="rate">${sd.connTime}</span></div>
          <div class="tr2"><span>Settlement</span><span class="rate" style="font-size:.6rem">${sd.nmSettle}</span></div>
          <div class="tr2"><span>Export Tariff (APPC)</span><span class="rate" style="color:#2d8c5a">₹${D.exportRate}/unit</span></div>
        </div>
        <div class="tcard">
          <h4>${sd.name} Tariff Slabs</h4>
          ${(sd.tariff || []).map(t => `<div class="tr2"><span>${t.s}</span><span class="rate">${t.r}</span></div>`).join('')}
          <div class="tr2" style="background:#e8f7ef;margin-top:5px;padding:4px 6px;border-radius:4px"><span style="font-weight:700;color:#0f2744">Avg. Grid Tariff</span><span class="rate" style="color:#2d8c5a">₹${D.tariff}/unit</span></div>
        </div>
      </div>
    </div>
  </div>

  <!-- 08 FINANCIAL ANALYSIS -->
  <div class="qs" data-sec="financial">
    <div class="qsh"><div class="qsn">08</div><div class="qst">Financial Analysis</div><div class="qsd"></div></div>
    <div class="fcards" style="display:grid;grid-template-columns:repeat(4,1fr);gap:9px;margin-bottom:14px">
      <div class="fcard c1" style="background:#fff;border-radius:8px;padding:12px;border-top:3px solid #0f2744;box-shadow:0 2px 8px rgba(15,39,68,.08)"><div class="fv" style="font-family:'Space Mono',monospace;font-size:1rem;font-weight:700;color:#0f2744">${inr(D.annSave)}</div><div class="fl" style="font-size:.6rem;color:#6c757d;text-transform:uppercase;letter-spacing:.3px;margin-top:3px">Annual Bill Savings</div></div>
      <div class="fcard c2" style="background:#fff;border-radius:8px;padding:12px;border-top:3px solid #2d8c5a;box-shadow:0 2px 8px rgba(15,39,68,.08)"><div class="fv" style="font-family:'Space Mono',monospace;font-size:1rem;font-weight:700;color:#0f2744">${inr(D.annExport)}</div><div class="fl" style="font-size:.6rem;color:#6c757d;text-transform:uppercase;letter-spacing:.3px;margin-top:3px">Export Income</div></div>
      <div class="fcard c3" style="background:#fff;border-radius:8px;padding:12px;border-top:3px solid #c8933a;box-shadow:0 2px 8px rgba(15,39,68,.08)"><div class="fv" style="font-family:'Space Mono',monospace;font-size:1rem;font-weight:700;color:#0f2744">${inr(D.annBen)}</div><div class="fl" style="font-size:.6rem;color:#6c757d;text-transform:uppercase;letter-spacing:.3px;margin-top:3px">Total Annual Benefit</div></div>
      <div class="fcard c4" style="background:#fff;border-radius:8px;padding:12px;border-top:3px solid #4a90d9;box-shadow:0 2px 8px rgba(15,39,68,.08)"><div class="fv" style="font-family:'Space Mono',monospace;font-size:1rem;font-weight:700;color:#0f2744">${D.payback} yrs</div><div class="fl" style="font-size:.6rem;color:#6c757d;text-transform:uppercase;letter-spacing:.3px;margin-top:3px">Payback Period</div></div>
    </div>
    <div style="margin-bottom:14px;background:#f8f9fa;border-radius:8px;padding:10px;display:flex;gap:14px;flex-wrap:wrap">
      <div><span style="font-size:.62rem;color:#6c757d;text-transform:uppercase;letter-spacing:.3px">25yr Cumulative</span><div style="font-family:'Space Mono',monospace;font-size:.92rem;font-weight:700;color:#2d8c5a">${inr(D.cum25)}</div></div>
      <div><span style="font-size:.62rem;color:#6c757d;text-transform:uppercase;letter-spacing:.3px">25yr ROI</span><div style="font-family:'Space Mono',monospace;font-size:.92rem;font-weight:700;color:#2d8c5a">${D.roi25}%</div></div>
      <div><span style="font-size:.62rem;color:#6c757d;text-transform:uppercase;letter-spacing:.3px">Tariff Escalation</span><div style="font-family:'Space Mono',monospace;font-size:.92rem;font-weight:700;color:#0f2744">${sd.tariffEsc}% p.a.</div></div>
    </div>
    <table class="ft" style="width:100%;border-collapse:collapse;font-size:.79rem">
      <thead><tr><th style="background:#e9ecef;color:#0f2744;padding:7px 10px;text-align:left;font-size:.67rem;text-transform:uppercase;letter-spacing:.35px">Year</th><th style="background:#e9ecef;color:#0f2744;padding:7px 10px;text-align:right;font-size:.67rem;text-transform:uppercase;letter-spacing:.35px">Generation</th><th style="background:#e9ecef;color:#0f2744;padding:7px 10px;text-align:right;font-size:.67rem;text-transform:uppercase;letter-spacing:.35px">Annual Benefit</th><th style="background:#e9ecef;color:#0f2744;padding:7px 10px;text-align:right;font-size:.67rem;text-transform:uppercase;letter-spacing:.35px">Cumulative</th><th style="background:#e9ecef;color:#0f2744;padding:7px 10px;text-align:right;font-size:.67rem;text-transform:uppercase;letter-spacing:.35px">Net (After Investment)</th></tr></thead>
      <tbody>
      ${finRows}
      </tbody>
    </table>
  </div>

  <!-- 09 COST SUMMARY -->
  <div class="qs" data-sec="cost">
    <div class="qsh"><div class="qsn">09</div><div class="qst">Cost Summary</div><div class="qsd"></div></div>
    <div class="pbox" style="background:linear-gradient(145deg,#0f2744 0%,#1a3a5c 60%,#0d2235 100%);border-radius:12px;padding:18px 20px;position:relative;overflow:hidden">
      <div style="position:absolute;top:-30px;right:-30px;width:140px;height:140px;background:radial-gradient(circle,rgba(200,147,58,.18),transparent 70%);border-radius:50%;z-index:0"></div>
      <div class="pr totr" style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.1);margin-bottom:6px;position:relative;z-index:1">
        <div><div class="pl" style="font-size:.66rem;text-transform:uppercase;letter-spacing:.55px;color:rgba(255,255,255,.55);font-weight:700">Total Plant Price (Incl. GST)</div></div>
        <div class="pv" style="font-family:'Space Mono',monospace;font-size:.92rem;font-weight:700;color:#e8b96a">${inr(D.totalProj)}</div>
      </div>
      ${D.addCostAmt > 0 ? `
      <div class="pr" style="display:flex;justify-content:space-between;align-items:center;padding:5px 0;border-bottom:1px solid rgba(255,255,255,.07);position:relative;z-index:1">
        <div class="pl" style="font-size:.66rem;color:rgba(255,255,255,.5)">Plant Price Alone</div>
        <div class="pv" style="font-size:.78rem;color:rgba(255,255,255,.75);font-family:'Space Mono',monospace">${inr(D.pricePaid)}</div>
      </div>
      <div class="pr" style="display:flex;justify-content:space-between;align-items:center;padding:5px 0;border-bottom:1px solid rgba(255,255,255,.07);position:relative;z-index:1">
        <div class="pl" style="font-size:.66rem;color:rgba(255,255,255,.5)">${D.addCostDesc || 'Additional Cost'}</div>
        <div class="pv" style="font-size:.78rem;color:rgba(255,255,255,.75);font-family:'Space Mono',monospace">${inr(D.addCostAmt)}</div>
      </div>` : ''}
      <div class="pr" style="display:flex;justify-content:space-between;align-items:center;padding:5px 0;border-bottom:1px solid rgba(255,255,255,.07);position:relative;z-index:1">
        <div class="pl" style="font-size:.66rem;color:rgba(255,255,255,.5)">Taxable Value (÷ 1.089)</div>
        <div class="pv" style="font-size:.78rem;color:rgba(255,255,255,.65);font-family:'Space Mono',monospace">${inr(D.taxableVal)}</div>
      </div>
      <div class="pr" style="display:flex;justify-content:space-between;align-items:center;padding:5px 0;border-bottom:1px solid rgba(255,255,255,.07);position:relative;z-index:1">
        <div class="pl" style="font-size:.66rem;color:rgba(255,255,255,.5)">GST @ 8.9% Blended</div>
        <div class="pv" style="font-size:.78rem;color:rgba(255,255,255,.65);font-family:'Space Mono',monospace">${inr(D.totalGST)}</div>
      </div>
      ${D.disc > 0 ? `
      <div class="pr" style="display:flex;justify-content:space-between;align-items:center;padding:5px 0;border-bottom:1px solid rgba(255,255,255,.07);position:relative;z-index:1">
        <div class="pl" style="font-size:.66rem;color:rgba(255,255,255,.5)">Discount (Display Only)</div>
        <div class="pv" style="font-size:.78rem;color:#ff9880;font-family:'Space Mono',monospace">−${inr(D.disc)}</div>
      </div>` : ''}
      ${D.subon && D.tsub > 0 ? `
      <div class="pr subr" style="display:flex;justify-content:space-between;align-items:center;padding:5px 0;border-bottom:1px solid rgba(255,255,255,.07);position:relative;z-index:1">
        <div class="pl" style="font-size:.66rem;color:#7ec8ff">Govt. Subsidy (CFA ${inr(D.cfa)} + State ${inr(D.ssub)})</div>
        <div class="pv" style="font-size:.82rem;color:#7ec8ff;font-family:'Space Mono',monospace">−${inr(D.tsub)}</div>
      </div>` : ''}
      <div class="pr comr" style="display:flex;justify-content:space-between;align-items:center;margin-top:10px;background:rgba(45,140,90,.18);border-radius:8px;padding:12px 14px;border:1px solid rgba(45,140,90,.35);position:relative;z-index:1">
        <div>
          <div class="pl" style="font-size:.78rem;font-weight:700;letter-spacing:.4px;color:rgba(165,214,167,.9)">💰 CUSTOMER FINANCIAL COMMITMENT</div>
          <div style="font-size:.6rem;color:rgba(255,255,255,.45)">${D.addCostAmt > 0 ? 'Plant Price + Additional Cost − Subsidy' : 'Total Plant Price − Subsidy'}</div>
        </div>
        <div class="pv" style="font-size:1.1rem;font-weight:700;font-family:'Space Mono',monospace;color:#a5d6a7">${inr(D.commit)}</div>
      </div>
      <div style="font-size:.62rem;font-style:italic;color:rgba(165,214,167,.9);text-align:right;margin-top:5px;line-height:1.4;position:relative;z-index:1">${numberToIndianCurrencyWords(D.commit)}</div>
      <div style="font-size:.63rem;color:rgba(255,255,255,.72);margin-top:8px;padding-top:6px;border-top:1px dashed rgba(255,255,255,.12);line-height:1.55;position:relative;z-index:1">
        GST @ 8.9% blended rate per MNRE Govt. notification. Discount is already included in the Total Plant Price. Subsidy reduces customer commitment only. All prices in INR.
      </div>
      <div style="margin-top:10px;display:flex;align-items:center;gap:9px;position:relative;z-index:1;background:rgba(255,255,255,.06);border-radius:6px;padding:7px 10px">
        <span style="font-size:.66rem;color:rgba(255,255,255,.55)">📅 Proposal Valid Until</span>
        <strong style="font-size:.68rem;color:rgba(255,255,255,.85)">${D.duedateStr} (${D.validity} Days)</strong>
      </div>
    </div>
    ${D.subon && D.tsub > 0 ? `<div class="sub-hl" style="background:#e3f0ff;border:1.5px solid #90caf9;border-radius:8px;padding:12px 16px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:9px;margin-top:10px">
      <div><div class="sub-hl-l" style="font-weight:700;color:#1565c0;font-size:.78rem">🏛 Government Subsidy (CFA + State)</div><div class="sub-hl-n" style="font-size:.65rem;color:#495057;margin-top:3px">Credited directly to customer by Government post-commissioning. Reduces only customer financial commitment.</div></div>
      <div style="text-align:right"><div class="sub-hl-a" style="font-family:'Space Mono',monospace;font-size:1.1rem;font-weight:700;color:#1565c0">${inr(D.tsub)}</div><div class="sub-hl-s" style="font-size:.6rem;color:#6c757d">CFA ${inr(D.cfa)} + State ${inr(D.ssub)}</div></div>
    </div>` : ''}
  </div>

  <!-- 10 T&C -->
  <div class="qs" data-sec="tnc">
    <div class="qsh"><div class="qsn">10</div><div class="qst">Terms & Conditions</div><div class="qsd"></div></div>
    <div style="margin-bottom:8px;font-size:.72rem;padding:6px 10px;background:#f8f9fa;border-radius:6px;color:#6c757d">General T&C applicable to all projects · ${sd.name}-specific T&C additionally applicable</div>
    <div class="tnc-l">${tncHTML}</div>
  </div>

  <!-- 11 WHY SOLAR -->
  <div class="qs" data-sec="solar-info" style="background:linear-gradient(135deg,#f0f7ff,#e8f7ef)">
    <div class="qsh"><div class="qsn" style="background:linear-gradient(135deg,#2d8c5a,#1e6e45)">11</div><div class="qst" style="color:#2d8c5a">Why Solar Power? Why Enermass?</div><div class="qsd" style="background:linear-gradient(to right,#2d8c5a,transparent)"></div></div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px">
      <div style="background:#fff;border-radius:0;padding:13px;border-left:3px solid #c8933a">
        <div style="font-weight:700;color:#0f2744;font-size:.76rem;margin-bottom:7px">☀️ Benefits of Solar Power</div>
        <div style="font-size:.67rem;color:#495057;line-height:1.7">✅ Significantly reduce electricity bills by 70–90%<br>✅ 25-year system lifespan with minimal maintenance<br>✅ Protection against rising electricity tariffs<br>✅ Earn income via net metering / export to grid<br>✅ Increase property value<br>✅ Zero carbon emissions – contribute to clean India</div>
      </div>
      <div style="background:#fff;border-radius:0;padding:13px;border-left:3px solid #2d8c5a">
        <div style="font-weight:700;color:#0f2744;font-size:.76rem;margin-bottom:7px">🏅 Why Choose Enermass?</div>
        <div style="font-size:.67rem;color:#495057;line-height:1.7">✅ MNRE Empanelled EPC Contractor<br>✅ ${co['cp-exp'] || '10+ Years'} of solar expertise<br>✅ ${co['cp-proj'] || '500+'} successful installations across India<br>✅ ${co['cp-mw'] || '15 MW+'} aggregate capacity commissioned<br>✅ End-to-end DISCOM liaison &amp; net metering<br>✅ ISO 9001:2015 certified quality processes</div>
      </div>
      <div style="background:#fff;border-radius:0;padding:13px;border-left:3px solid #4a90d9">
        <div style="font-weight:700;color:#0f2744;font-size:.76rem;margin-bottom:7px">🔧 Warranty &amp; Performance</div>
        <div style="font-size:.67rem;color:#495057;line-height:1.7">✅ Solar panels: 25-year linear power output warranty<br>✅ Inverter: 5–10 years manufacturer warranty<br>✅ Structure: 10-year structural warranty<br>✅ Workmanship: 2-year installation warranty<br>✅ MNRE certified equipment from Tier-1 manufacturers<br>✅ BIS / IEC certified components</div>
      </div>
      <div style="background:#fff;border-radius:0;padding:13px;border-left:3px solid #1565c0">
        <div style="font-weight:700;color:#0f2744;font-size:.76rem;margin-bottom:7px">🤝 Customer Support</div>
        <div style="font-size:.67rem;color:#495057;line-height:1.7">✅ Dedicated project manager for your installation<br>✅ Timely DISCOM application &amp; net metering support<br>✅ Post-installation commissioning &amp; testing<br>✅ Annual performance monitoring report<br>✅ Responsive service team – call / WhatsApp support<br>✅ ${co.phone || 'Contact us for service queries'}</div>
      </div>
    </div>
    <div style="background:linear-gradient(135deg,#0f2744,#1a3a5c);border-radius:0;padding:12px 16px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">
      <div style="color:#fff;font-size:.73rem;font-weight:600">🌱 Installation Process: Site Survey → System Design → DISCOM Application → Installation → Net Metering → Commissioning</div>
      <div style="color:#e8b96a;font-size:.7rem;font-weight:700">${co.phone || ''} ${co.email ? '| ' + co.email : ''}</div>
    </div>
  </div>

  <!-- SIGNATURE -->
  <div class="sig" style="padding:20px 30px;display:flex;justify-content:space-between;align-items:flex-end;border-top:2px solid #dee2e6">
    <div>
      <div style="height:36px"></div>
      <div style="display:inline-block;border-top:1px solid #0d1117;padding-top:5px">
        <div style="font-weight:700;color:#0f2744;font-size:.82rem;white-space:nowrap">${D.sal} ${D.cust}</div>
        <div style="font-size:.72rem;color:#6c757d;margin-top:1px;white-space:nowrap">Customer Acceptance</div>
      </div>
    </div>
    <div style="text-align:center;color:#dee2e6">
      <div style="font-size:1.6rem">☀️</div>
      <div style="font-size:.66rem;color:#c8933a;font-weight:600;margin-top:2px">Solar Power Plant Proposal</div>
      <div style="font-size:.6rem;color:#adb5bd">${D.refno}</div>
    </div>
    <div>
      <div style="height:36px"></div>
      <div style="display:inline-block;border-top:1px solid #0d1117;padding-top:5px">
        ${D.salesExec ? `
          <div style="font-weight:700;color:#0f2744;font-size:.82rem;white-space:nowrap">${D.salesExec.name}</div>
          <div style="font-size:.74rem;color:#495057;margin-top:1px;white-space:nowrap">${D.salesExec.desig || 'Sales Executive'}</div>
          <div style="font-size:.72rem;color:#6c757d;margin-top:1px;white-space:nowrap">${co.name || 'Enermass Power Solutions Pvt. Ltd.'}</div>
          ${D.salesExec.phone ? `<div style="font-size:.68rem;color:#adb5bd;margin-top:2px;white-space:nowrap">${D.salesExec.phone}</div>` : ''}
        ` : `
          <div style="font-weight:700;color:#0f2744;font-size:.82rem;white-space:nowrap">Authorised Signatory</div>
          <div style="font-size:.72rem;color:#6c757d;margin-top:1px;white-space:nowrap">${co.name || 'Enermass Power Solutions Pvt. Ltd.'}</div>
        `}
      </div>
    </div>
  </div>

  <!-- FOOTER -->
  <div class="qfoot" style="padding:10px 30px;background:#0f2744;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px">
    <span style="font-size:.63rem;color:rgba(255,255,255,.45)">Ref: ${D.refno} · ${D.qdateStr} · Valid: ${D.duedateStr}</span>
    <span style="font-size:.63rem;color:#e8b96a;font-weight:600">${co.name || 'Enermass Power Solutions Pvt. Ltd.'} · ${co.web || ''}</span>
  </div>`;
}
