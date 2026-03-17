import { safe } from './helpers';

export async function exportToPDF(elementId, D) {
  const element = document.getElementById(elementId);
  if (!element) { alert('Proposal not found.'); return; }

  const filename = safe(`${D.refno || 'Proposal'} – ${D.cust || 'Customer'}`);

  // Send ONLY the inner HTML — CSS is handled by server via page.addStyleTag()
  const html = element.innerHTML;

  try {
    const response = await fetch('http://localhost:3001/generate-pdf', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ html, filename }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || 'Server error ' + response.status);
    }

    const blob = await response.blob();
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = filename + '.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

  } catch (e) {
    console.error(e);
    alert('❌ PDF server not running!\n\nPlease:\n1. Open a new terminal\n2. cd "D:\\ENERMASS SOFT\\solar-epc-pro\\pdf-server"\n3. Run: node server.js\n4. Try again');
  }
}
