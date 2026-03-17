const express   = require('express');
const puppeteer = require('puppeteer');
const cors      = require('cors');
const app       = express();

app.use(cors());
app.use(express.json({ limit: '20mb' }));

// Minimal CSS — new design uses 100% inline styles
const BASE_CSS = `
  *, *::before, *::after {
    box-sizing: border-box;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
    color-adjust: exact !important;
  }
  html, body {
    margin: 0; padding: 0;
    font-family: 'DM Sans', sans-serif;
    font-size: 11px;
    color: #1A202C;
    background: #fff;
  }
  .qd { background: #fff; width: 100%; }

  /* Page breaks for PDF */
  [data-sec]            { page-break-inside: avoid; break-inside: avoid; }
  [data-sec="bom"],
  [data-sec="tnc"],
  [data-sec="financial"],
  [data-sec="solar-info"] { page-break-inside: auto !important; break-inside: auto !important; }
  tr     { page-break-inside: avoid; break-inside: avoid; }
  thead  { display: table-header-group; }
  table  { border-collapse: collapse; }
`;

app.post('/generate-pdf', async (req, res) => {
  const { html, filename } = req.body;
  if (!html) return res.status(400).json({ error: 'No HTML received' });

  const safeFilename = (filename || 'Proposal')
    .replace(/[–—]/g, '-')
    .replace(/[^\w\s\-\.]/g, '')
    .replace(/\s+/g, '_')
    .trim() || 'Proposal';

  console.log('\nGenerating:', safeFilename);
  console.log('HTML size:', Math.round(html.length / 1024), 'KB');

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

    // CRITICAL: screen media keeps all backgrounds/gradients
    await page.emulateMediaType('screen');
    await page.setViewport({ width: 794, height: 1200, deviceScaleFactor: 2 });

    // Load fonts + minimal structure
    const pageHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
</head>
<body>
  <div class="qd">${html}</div>
</body>
</html>`;

    await page.setContent(pageHtml, { waitUntil: 'networkidle0', timeout: 60000 });

    // Inject CSS via addStyleTag — most reliable method
    await page.addStyleTag({ content: BASE_CSS });

    // Wait for fonts
    await page.evaluateHandle('document.fonts.ready');
    await new Promise(r => setTimeout(r, 2000));

    // Quick check
    const coverBg = await page.evaluate(() => {
      const el = document.querySelector('[data-sec="letter"]') || document.body;
      return el ? 'found' : 'not found';
    });
    console.log('Document check:', coverBg);

    const pdf = await page.pdf({
      format:              'A4',
      margin:              { top: '10mm', bottom: '10mm', left: '12mm', right: '12mm' },
      printBackground:     true,
      preferCSSPageSize:   false,
      displayHeaderFooter: false,
    });

    await browser.close();
    console.log('PDF size:', Math.round(pdf.length / 1024), 'KB ✅');

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
