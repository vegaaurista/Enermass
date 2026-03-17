const express    = require('express');
const puppeteer  = require('puppeteer');
const cors       = require('cors');
const app        = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.post('/generate-pdf', async (req, res) => {
  const { html, filename } = req.body;

  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page    = await browser.newPage();

  await page.setContent(html, { waitUntil: 'networkidle0' });

  const pdf = await page.pdf({
    format:               'A4',
    margin:               { top: '10mm', bottom: '10mm', left: '12mm', right: '12mm' },
    printBackground:      true,
    preferCSSPageSize:    false,
    displayHeaderFooter:  false,
  });

  await browser.close();

  res.set({
    'Content-Type':        'application/pdf',
    'Content-Disposition': `attachment; filename="${filename}.pdf"`,
    'Content-Length':      pdf.length,
  });
  res.end(pdf);
});

app.listen(3001, () => console.log('PDF server running on port 3001'));