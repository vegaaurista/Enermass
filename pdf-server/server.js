const express   = require('express');
const puppeteer = require('puppeteer');
const cors      = require('cors');
const app       = express();

app.use(cors());
app.use(express.json({ limit: '20mb' }));

const BASE_CSS = `
  *, *::before, *::after {
    box-sizing: border-box;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
    color-adjust: exact !important;
  }
  html, body {
    margin: 0; padding: 0;
    font-family: 'DM Sans', 'Outfit', sans-serif;
    font-size: 11px;
    color: #0D1B2A;
    background: #fff;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  .qd { background: #fff; width: 100%; }

  /* Page breaks */
  [data-sec]                 { page-break-inside: avoid; break-inside: avoid; }
  [data-sec="bom"],
  [data-sec="tnc"],
  [data-sec="financial"],
  [data-sec="solar-info"]    { page-break-inside: auto !important; break-inside: auto !important; }
  tr    { page-break-inside: avoid; break-inside: avoid; }
  thead { display: table-header-group; }
  table { border-collapse: collapse; }

  /* Add bottom padding on every page so content doesn't overlap footer */
  @page { margin: 10mm 12mm 20mm 12mm; }
`;

// Footer template (rendered by Puppeteer on every page)
// Uses Puppeteer's special classes: pageNumber, totalPages, date, url, title
const FOOTER_TEMPLATE = `
<div style="
  width: 100%;
  background: #0B2545;
  color: #ffffff;
  font-family: 'DM Sans', sans-serif;
  font-size: 8.5px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 7px 14mm;
  box-sizing: border-box;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
">
  <span style="color: rgba(255,255,255,0.55); font-family: 'Courier New', monospace; font-size: 7.5px; letter-spacing: 0.3px;">
    __REFNO__ &nbsp;·&nbsp; __DATE__ &nbsp;·&nbsp; Valid: __VALID__
  </span>
  <span style="color: #D4A017; font-weight: 600; font-size: 8px;">
    __CONAME__ &nbsp;·&nbsp; __WEB__
  </span>
</div>`;

app.post('/generate-pdf', async (req, res) => {
  const { html, filename, meta } = req.body;
  if (!html) return res.status(400).json({ error: 'No HTML received' });

  const safeFilename = (filename || 'Proposal')
    .replace(/[–—]/g, '-')
    .replace(/[^\w\s\-\.]/g, '')
    .replace(/\s+/g, '_')
    .trim() || 'Proposal';

  // Build footer with dynamic values from meta
  const m = meta || {};
  const footer = FOOTER_TEMPLATE
    .replace('__REFNO__',  m.refno  || 'Proposal')
    .replace('__DATE__',   m.date   || '')
    .replace('__VALID__',  m.valid  || '')
    .replace('__CONAME__', m.coname || 'Enermass Power Solutions Pvt. Ltd.')
    .replace('__WEB__',    m.web    || 'www.enermass.in');

  console.log('\n→ Generating:', safeFilename);
  console.log('  HTML size:', Math.round(html.length / 1024), 'KB');

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
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
</head>
<body>
  <div class="qd">${html}</div>
</body>
</html>`;

    await page.setContent(fullHtml, { waitUntil: 'networkidle0', timeout: 60000 });
    await page.addStyleTag({ content: BASE_CSS });
    await page.evaluateHandle('document.fonts.ready');
    await new Promise(r => setTimeout(r, 2000));

    const pdf = await page.pdf({
      format:               'A4',
      margin:               { top: '10mm', bottom: '20mm', left: '12mm', right: '12mm' },
      printBackground:      true,
      preferCSSPageSize:    false,
      displayHeaderFooter:  true,
      headerTemplate:       '<div></div>',
      footerTemplate:       footer,
    });

    await browser.close();
    console.log('  PDF size:', Math.round(pdf.length / 1024), 'KB ✅');

    res.set({
      'Content-Type':        'application/pdf',
      'Content-Disposition': 'attachment; filename="' + safeFilename + '.pdf"',
      'Content-Length':      pdf.length,
    });
    res.end(pdf);

  } catch (err) {
    if (browser) await browser.close().catch(() => {});
    console.error('  Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get('/health', (_, res) => res.json({ status: 'ok' }));
app.listen(3001, () => {
  console.log('\n================================');
  console.log('  PDF Server: http://localhost:3001');
  console.log('================================\n');
});
