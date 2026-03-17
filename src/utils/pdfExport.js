import { safe } from './helpers';

export async function exportToPDF(elementId, D) {
  const element = document.getElementById(elementId);
  if (!element) { alert('Proposal not found.'); return; }

  const filename = safe(`${D.refno || 'Proposal'} – ${D.cust || 'Customer'}`);

  const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
    .map(el => el.outerHTML).join('\n');

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  ${styles}
  <style>
    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    body { margin: 0; padding: 0; background: white; }
    .qdw { width: 100% !important; max-width: 100% !important; }
    .qd  { box-shadow: none !important; border-radius: 0 !important; }
    .qs  { page-break-inside: avoid; break-inside: avoid; }
    .qs[data-sec="bom"], .qs[data-sec="tnc"], .qs[data-sec="financial"] {
      page-break-inside: auto; break-inside: auto;
    }
    .qsh { page-break-after: avoid; break-after: avoid; }
    tr   { page-break-inside: avoid; break-inside: avoid; }
    thead { display: table-header-group; }
    .sig, .qfoot { page-break-inside: avoid; break-inside: avoid; }
    .scards, .fcards, .pgrid, .cgrid, .sub-hero, .tgrid, .sub-grid {
      page-break-inside: avoid; break-inside: avoid;
    }
  </style>
</head>
<body>
  <div class="qd">${element.innerHTML}</div>
</body>
</html>`;

  try {
    const response = await fetch('http://localhost:3001/generate-pdf', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ html, filename }),
    });

    if (!response.ok) throw new Error('Server error');

    const blob = await response.blob();
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = filename + '.pdf';
    a.click();
    URL.revokeObjectURL(url);

  } catch (e) {
    alert('❌ PDF server not running!\n\nPlease:\n1. Open a new terminal\n2. Go to D:\\ENERMASS SOFT\\pdf-server\n3. Run: node server.js\n4. Then try downloading again.');
  }
}