const express   = require('express');
const puppeteer = require('puppeteer');
const cors      = require('cors');
const fs        = require('fs');
const path      = require('path');
const os        = require('os');
const app       = express();

app.use(cors());
app.use(express.json({ limit: '20mb' }));

// ── Full CSS injected via page.addStyleTag (bypasses @import parsing bug) ──
const PROPOSAL_CSS = `
* { box-sizing:border-box; -webkit-print-color-adjust:exact!important; print-color-adjust:exact!important; }
html,body { margin:0; padding:0; font-family:'DM Sans',sans-serif; font-size:11px; color:#0d1117; background:#fff; }
.qd { background:#fff; width:100%; }

.qcov { background:linear-gradient(160deg,#0f2744 0%,#0d2235 60%,#081520 100%)!important; padding:40px 48px; position:relative; overflow:hidden; }
.qcov::before { content:''; position:absolute; top:-45px; right:-45px; width:200px; height:200px; background:radial-gradient(circle,rgba(200,147,58,.18),transparent 70%); border-radius:50%; }
.cov-hdr { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:30px; position:relative; z-index:1; }
.cov-logo-area { display:flex; align-items:flex-start; gap:12px; }
.cov-logo { width:120px; height:55px; object-fit:contain; }
.cov-co-name { font-family:'Poppins',sans-serif; font-size:22pt; color:#ffffff!important; font-weight:700; line-height:1.2; }
.cov-co-tag  { font-size:7pt; color:#e8b96a!important; letter-spacing:2px; text-transform:uppercase; margin-top:4px; }
.cov-co-cont { font-size:7.5pt; color:rgba(255,255,255,0.4)!important; margin-top:7px; line-height:1.6; }
.cov-ref { background:linear-gradient(135deg,#c8933a,#e8b96a)!important; color:#0f2744!important; padding:10px 14px; border-radius:4px; text-align:center; flex-shrink:0; }
.cov-ref .rl { font-size:7pt; font-weight:700; text-transform:uppercase; letter-spacing:1px; color:#0f2744!important; }
.cov-ref .rn { font-family:'Space Mono',monospace; font-size:9pt; font-weight:700; margin-top:3px; color:#0f2744!important; }
.cov-ref .rd { font-size:7.5pt; margin-top:3px; opacity:.8; color:#0f2744!important; }
.cov-body { position:relative; z-index:1; }
.cov-eyebrow { font-size:7pt; color:#e8b96a!important; letter-spacing:2.5px; text-transform:uppercase; font-weight:600; margin-bottom:8px; }
.cov-title { font-family:'Poppins',sans-serif; font-size:20pt; color:#ffffff!important; font-weight:700; line-height:1.15; }
.cov-title span { color:#e8b96a!important; display:block; }
.cov-sub { color:rgba(255,255,255,0.45)!important; font-size:9pt; margin-top:6px; line-height:1.5; }
.cov-pills { display:flex; gap:6px; margin-top:14px; flex-wrap:wrap; }
.pill { background:rgba(255,255,255,0.12)!important; border:1px solid rgba(255,255,255,0.2); padding:3px 10px; border-radius:50px; color:rgba(255,255,255,0.9)!important; font-size:7.5pt; display:inline-flex; align-items:center; gap:4px; }
.pill .dot { width:4px; height:4px; border-radius:50%; background:#e8b96a!important; flex-shrink:0; display:inline-block; }

.qs { padding:18px 30px; border-bottom:1px solid #e9ecef; }
.qs:last-child { border-bottom:none; }
.qsh { display:flex; align-items:center; gap:8px; margin-bottom:14px; }
.qsn { width:22px; height:22px; border-radius:50%; background:linear-gradient(135deg,#0f2744,#1a3a5c)!important; color:#fff!important; font-family:'Space Mono',monospace; font-size:7pt; display:inline-flex; align-items:center; justify-content:center; font-weight:700; flex-shrink:0; }
.qst { font-family:'Playfair Display',serif; font-size:12pt; color:#0f2744; font-weight:700; }
.qsd { flex:1; height:2px; background:linear-gradient(to right,#c8933a,transparent)!important; margin-left:6px; }

.qltr { background:#fdf3e3!important; border-left:4px solid #c8933a; padding:16px 20px; line-height:1.75; color:#343a40; }
.qltr p { margin-bottom:9px; font-size:10pt; }

.pgrid { display:grid; grid-template-columns:1fr 1fr; gap:8px; }
.cgrid { display:grid; grid-template-columns:repeat(3,1fr); gap:8px; }
.pi { background:#f8f9fa!important; padding:9px 11px; border-left:3px solid #c8933a; }
.pi .pl { font-size:7pt; color:#6c757d; text-transform:uppercase; letter-spacing:.4px; margin-bottom:2px; }
.pi .pv { font-size:10pt; color:#0d1117; font-weight:500; line-height:1.35; }
.ci .cl { font-size:7pt; color:#6c757d; text-transform:uppercase; letter-spacing:.35px; margin-bottom:2px; }
.ci .cv { font-size:10pt; color:#0d1117; font-weight:500; }

.scards { display:grid; grid-template-columns:repeat(4,1fr); gap:8px; margin-bottom:12px; }
.sc { background:linear-gradient(135deg,#0f2744,#1a3a5c)!important; padding:10px 8px; text-align:center; }
.scv { font-family:'Space Mono',monospace; font-size:12pt; color:#e8b96a!important; font-weight:700; }
.scu { font-size:7pt; color:rgba(255,255,255,0.5)!important; text-transform:uppercase; }
.scl { font-size:8pt; color:rgba(255,255,255,0.75)!important; margin-top:2px; }

.sp-t { width:100%; border-collapse:collapse; font-size:10pt; }
.sp-t th { background:#0f2744!important; color:#fff!important; padding:7px 10px; text-align:left; font-size:8pt; text-transform:uppercase; }
.sp-t td { padding:6px 10px; border-bottom:1px solid #e9ecef; }
.sp-t td:first-child { font-weight:600; }
.sp-t tr:nth-child(even) td { background:#f8f9fa!important; }

.bom-t { width:100%; border-collapse:collapse; font-size:9.5pt; table-layout:fixed; }
.bom-t th { background:#0f2744!important; color:#fff!important; padding:7px 9px; text-align:left; font-size:8pt; text-transform:uppercase; }
.bom-t td { padding:5px 9px; border:1px solid #d7d7d7; font-size:9.5pt; overflow-wrap:break-word; word-break:break-word; }
.bom-t .bc td { background:#fdf3e3!important; font-weight:700; color:#0f2744; font-size:8pt; text-transform:uppercase; padding:4px 9px; }
.bom-t tr:nth-child(even):not(.bc) td { background:#f8f9fa!important; }
.bom-t td.bo { font-weight:600; color:#0f2744; }

.sub-hero { background:linear-gradient(135deg,#0f2744,#1a3a5c)!important; padding:14px 18px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; margin-bottom:9px; }
.sub-hero h3 { font-family:'Playfair Display',serif; font-size:10pt; color:#fff!important; }
.sub-hero p  { font-size:8pt; color:rgba(255,255,255,0.5)!important; margin-top:2px; }
.sha  { font-family:'Space Mono',monospace; font-size:14pt; color:#7ec8ff!important; font-weight:700; }
.shal { font-size:7.5pt; color:rgba(255,255,255,0.4)!important; text-align:right; }
.sub-grid { display:grid; grid-template-columns:1fr 1fr; gap:8px; }
.sub-card { background:#f8f9fa!important; padding:10px; border-top:3px solid #4a90d9; }
.sub-card.state { border-top-color:#2d8c5a!important; }
.sub-card h4 { font-size:7.5pt; text-transform:uppercase; color:#6c757d; margin-bottom:5px; }
.sr { display:flex; justify-content:space-between; padding:3px 0; border-bottom:1px dashed #e9ecef; font-size:9.5pt; }
.sr:last-child { border-bottom:none; }
.sr .sv2 { font-weight:600; color:#2d8c5a!important; }

.nm-box { background:#e8f7ef!important; border-radius:8px; padding:14px 16px; margin-bottom:11px; border-left:4px solid #2d8c5a; }
.tgrid { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
.tcard { background:#f8f9fa!important; padding:12px; }
.tcard h4 { font-family:'Playfair Display',serif; font-size:9.5pt; color:#0f2744; margin-bottom:7px; padding-bottom:4px; border-bottom:2px solid #c8933a; }
.tr2 { display:flex; justify-content:space-between; padding:3px 0; border-bottom:1px solid #d7d7d7; font-size:9.5pt; flex-wrap:wrap; gap:2px; }
.tr2:last-child { border-bottom:none; }
.tr2 .rate { font-family:'Space Mono',monospace; font-size:8.5pt; font-weight:700; color:#0f2744; }

.fcards { display:grid; grid-template-columns:repeat(4,1fr); gap:9px; margin-bottom:14px; }
.fcard { background:#fff!important; border-radius:8px; padding:12px; border:1px solid #e9ecef; }
.fcard.c1 { border-top:3px solid #0f2744; }
.fcard.c2 { border-top:3px solid #2d8c5a; }
.fcard.c3 { border-top:3px solid #c8933a; }
.fcard.c4 { border-top:3px solid #4a90d9; }
.fv { font-family:'Space Mono',monospace; font-size:11pt; font-weight:700; color:#0f2744; }
.fl { font-size:7pt; color:#6c757d; text-transform:uppercase; margin-top:3px; }
.ft { width:100%; border-collapse:collapse; font-size:10pt; }
.ft th { background:#e9ecef!important; color:#0f2744; padding:7px 10px; text-align:right; font-size:8.5pt; text-transform:uppercase; }
.ft th:first-child { text-align:left; }
.ft td { padding:6px 10px; border-bottom:1px solid #e9ecef; text-align:right; font-size:10pt; }
.ft td:first-child { text-align:left; font-weight:500; }
.ft td.m { font-family:'Space Mono',monospace; font-size:9.5pt; }
.ft td.pos { color:#2d8c5a!important; font-weight:700; }
.ft tr:nth-child(even) td { background:#f8f9fa!important; }

.pbox { background:linear-gradient(145deg,#0f2744 0%,#1a3a5c 60%,#0d2235 100%)!important; border-radius:10px; padding:18px 20px; position:relative; overflow:hidden; }

.tnc-l { display:flex; flex-direction:column; gap:4px; }
.tnc-i { display:flex; gap:8px; font-size:9.5pt; color:#495057; line-height:1.55; padding:4px 0; border-bottom:1px dashed #e9ecef; }
.tnc-i:last-child { border-bottom:none; }
.tnc-n { font-family:'Space Mono',monospace; font-size:8pt; color:#adb5bd; min-width:22px; }

.sub-hl { background:#e3f0ff!important; border:1.5px solid #90caf9; border-radius:8px; padding:12px 16px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:9px; margin-top:10px; }
.sub-hl-l { font-weight:700; color:#1565c0!important; font-size:9.5pt; }
.sub-hl-n { font-size:8pt; color:#495057; margin-top:3px; }
.sub-hl-a { font-family:'Space Mono',monospace; font-size:13pt; font-weight:700; color:#1565c0!important; }
.sub-hl-s { font-size:7.5pt; color:#6c757d; }

.qs[data-sec="solar-info"] { background:linear-gradient(135deg,#f0f7ff,#e8f7ef)!important; }

.sig { padding:18px 30px; display:flex; justify-content:space-between; align-items:flex-end; border-top:2px solid #e9ecef; }
.qfoot { padding:10px 30px; background:#0f2744!important; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:5px; }

.alert { border-radius:6px; padding:9px 12px; font-size:9.5pt; display:flex; align-items:flex-start; gap:7px; }
.ai { background:#e8f4fd!important; border-left:3px solid #4a90d9; color:#1a5276; }

.qs  { page-break-inside:avoid; break-inside:avoid; }
.qs[data-sec="bom"],.qs[data-sec="tnc"],.qs[data-sec="financial"],.qs[data-sec="solar-info"] { page-break-inside:auto; break-inside:auto; }
.qsh { page-break-after:avoid; break-after:avoid; }
.sig,.qfoot { page-break-inside:avoid; break-inside:avoid; }
.scards,.fcards,.pgrid,.cgrid,.sub-hero,.tgrid,.sub-grid,.pbox,.sub-hl,.fcard { page-break-inside:avoid; break-inside:avoid; }
tr { page-break-inside:avoid; break-inside:avoid; }
thead { display:table-header-group; }
`;

app.post('/generate-pdf', async (req, res) => {
  const { html, filename } = req.body;
  if (!html) return res.status(400).json({ error: 'No HTML received' });

  const safeFilename = (filename || 'Proposal')
    .replace(/[–—]/g, '-')
    .replace(/[^\w\s\-\.]/g, '')
    .replace(/\s+/g, '_')
    .trim() || 'Proposal';

  console.log('Generating PDF:', safeFilename, '| HTML size:', Math.round(html.length/1024) + 'KB');

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--force-color-profile=srgb',
      ],
    });

    const page = await browser.newPage();
    await page.emulateMediaType('screen');
    await page.setViewport({ width: 794, height: 1200, deviceScaleFactor: 2 });

    // Load minimal HTML — just the content, no CSS
    const minimalHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
</head>
<body>
  <div class="qd">${html}</div>
</body>
</html>`;

    await page.setContent(minimalHtml, { waitUntil: 'networkidle0', timeout: 60000 });

    // ── KEY FIX: Inject CSS via page.addStyleTag AFTER page loads ──
    // This bypasses all @import / file:// / parsing issues
    await page.addStyleTag({ content: PROPOSAL_CSS });
    console.log('CSS injected via addStyleTag');

    // Wait for fonts and CSS to fully apply
    await page.evaluateHandle('document.fonts.ready');
    await new Promise(r => setTimeout(r, 2000));

    // Verify CSS is working — check cover background
    const coverBg = await page.evaluate(() => {
      const el = document.querySelector('.qcov');
      if (!el) return 'NOT FOUND';
      return window.getComputedStyle(el).background;
    });
    console.log('Cover background (should be dark navy):', coverBg.slice(0, 60));

    const pdf = await page.pdf({
      format:              'A4',
      margin:              { top: '10mm', bottom: '10mm', left: '12mm', right: '12mm' },
      printBackground:     true,
      preferCSSPageSize:   false,
      displayHeaderFooter: false,
    });

    await browser.close();
    console.log('PDF generated:', Math.round(pdf.length/1024) + 'KB');

    res.set({
      'Content-Type':        'application/pdf',
      'Content-Disposition': 'attachment; filename="' + safeFilename + '.pdf"',
      'Content-Length':      pdf.length,
    });
    res.end(pdf);

  } catch (err) {
    if (browser) await browser.close().catch(() => {});
    console.error('Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get('/health', (_, res) => res.json({ status: 'ok' }));
app.listen(3001, () => {
  console.log('\n================================');
  console.log('  PDF Server: http://localhost:3001');
  console.log('================================\n');
});
