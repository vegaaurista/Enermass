const express   = require('express');
const puppeteer = require('puppeteer');
const cors      = require('cors');
const app       = express();

app.use(cors());
app.use(express.json({ limit: '20mb' }));

// Base CSS — system fonts guarantee rendering works 100%
const BASE_CSS = `
  *, *::before, *::after {
    box-sizing: border-box;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
    color-adjust: exact !important;
  }
  html, body {
    margin: 0; padding: 0;
    font-family: -apple-system, 'Helvetica Neue', Arial, sans-serif;
    font-size: 11px;
    color: #0A1520;
    background: #fff;
    -webkit-font-smoothing: antialiased;
  }
  .qd { background: #fff; width: 100%; }

  /* Page breaks */
  [data-sec]                      { page-break-inside: avoid; break-inside: avoid; }
  [data-sec="bom"],
  [data-sec="tnc"],
  [data-sec="financial"],
  [data-sec="solar-info"]         { page-break-inside: auto !important; break-inside: auto !important; }
  tr    { page-break-inside: avoid; break-inside: avoid; }
  thead { display: table-header-group; }
  table { border-collapse: collapse; }
`;

const buildFooter = (meta) => {
  const m = meta || {};
  const coname = (m.coname || 'Enermass Power Solutions Pvt. Ltd.').replace(/'/g, "\\'");
  const web    = (m.web    || 'www.enermass.in').replace(/'/g, "\\'");
  const refno  = (m.refno  || '').replace(/'/g, "\\'");
  const date   = (m.date   || '').replace(/'/g, "\\'");
  const valid  = (m.valid  || '').replace(/'/g, "\\'");

  return `<div style="
    width:100%; background:#0A1F3C;
    display:flex; justify-content:space-between; align-items:center;
    padding:6px 12mm; box-sizing:border-box;
    -webkit-print-color-adjust:exact; print-color-adjust:exact;
    font-family:-apple-system,Helvetica Neue,Arial,sans-serif;
  ">
    <span style="color:rgba(255,255,255,0.5);font-size:7.5px;letter-spacing:0.3px;">
      ${refno} &nbsp;·&nbsp; ${date} &nbsp;·&nbsp; Valid: ${valid}
    </span>
    <span style="color:#E8AB1A;font-weight:600;font-size:8px;">
      ${coname} &nbsp;·&nbsp; ${web}
    </span>
  </div>`;
};

app.post('/generate-pdf', async (req, res) => {
  const { html, filename, meta } = req.body;
  if (!html) return res.status(400).json({ error: 'No HTML received' });

  const safeFilename = (filename || 'Proposal')
    .replace(/[–—]/g, '-')
    .replace(/[^\w\s\-\.]/g, '')
    .replace(/\s+/g, '_')
    .trim() || 'Proposal';

  console.log('\n→ Generating:', safeFilename, '| Size:', Math.round(html.length/1024)+'KB');

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

    const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    @font-face {
      font-family: 'Georgia';
      font-style: normal;
    }
  </style>
</head>
<body>
  <div class="qd">${html}</div>
</body>
</html>`;

    await page.setContent(fullHtml, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.addStyleTag({ content: BASE_CSS });
    await new Promise(r => setTimeout(r, 800));

    const footer = buildFooter(meta);

    const pdf = await page.pdf({
      format:               'A4',
      margin:               { top: '10mm', bottom: '18mm', left: '12mm', right: '12mm' },
      printBackground:      true,
      preferCSSPageSize:    false,
      displayHeaderFooter:  true,
      headerTemplate:       '<div></div>',
      footerTemplate:       footer,
    });

    await browser.close();
    console.log('  ✅ PDF:', Math.round(pdf.length/1024)+'KB');

    res.set({
      'Content-Type':        'application/pdf',
      'Content-Disposition': 'attachment; filename="' + safeFilename + '.pdf"',
      'Content-Length':      pdf.length,
    });
    res.end(pdf);

  } catch (err) {
    if (browser) await browser.close().catch(() => {});
    console.error('  ❌ Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get('/health', (_, res) => res.json({ status: 'ok' }));
app.listen(3001, () => {
  console.log('\n================================');
  console.log('  PDF Server: http://localhost:3001');
  console.log('================================\n');
});
