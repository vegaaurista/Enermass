import { safe } from './helpers';

export async function exportToPDF(elementId, D) {
  const element = document.getElementById(elementId);
  if (!element) { alert('Proposal document not found.'); return; }

  const html2pdf = (await import('html2pdf.js')).default;

  const filename = safe(`${D.refno || 'Proposal'} – ${D.cust || 'Customer'}`);

  const opt = {
    margin: [8, 6, 8, 6],
    filename: filename + '.pdf',
    image: { type: 'jpeg', quality: 0.88 },
    html2canvas: {
      scale: 1.6,
      useCORS: true,
      logging: false,
      allowTaint: true,
      backgroundColor: '#ffffff',
    },
    jsPDF: {
      unit: 'mm',
      format: 'a4',
      orientation: 'portrait',
      compress: true,
    },
    pagebreak: {
      mode: ['avoid-all', 'css', 'legacy'],
      before: '[data-sec="letter"],[data-sec="bom"],[data-sec="financial"],[data-sec="cost"],[data-sec="tnc"],[data-sec="solar-info"]',
    },
  };

  try {
    await html2pdf().set(opt).from(element).save();
  } catch (err) {
    console.error('PDF export failed:', err);
    alert('PDF export failed. Please try again.');
  }
}
