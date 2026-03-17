import { safe } from './helpers';

export async function exportToPDF(elementId, D) {
  const element = document.getElementById(elementId);
  if (!element) { alert('Proposal document not found.'); return; }

  const html2pdf = (await import('html2pdf.js')).default;
  const filename = safe(`${D.refno || 'Proposal'} – ${D.cust || 'Customer'}`);

  const clone = element.cloneNode(true);

  const style = document.createElement('style');
  style.textContent = `
    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    .qs { page-break-before: auto !important; break-before: auto !important; }
    .qs { page-break-after: auto !important; break-after: auto !important; }
    .qs[data-sec="letter"]    { page-break-inside: avoid !important; break-inside: avoid !important; }
    .qs[data-sec="company"]   { page-break-inside: avoid !important; break-inside: avoid !important; }
    .qs[data-sec="customer"]  { page-break-inside: avoid !important; break-inside: avoid !important; }
    .qs[data-sec="sysdesign"] { page-break-inside: avoid !important; break-inside: avoid !important; }
    .qs[data-sec="subsidy"]   { page-break-inside: avoid !important; break-inside: avoid !important; }
    .qs[data-sec="netmetering"]{ page-break-inside: avoid !important; break-inside: avoid !important; }
    .qs[data-sec="cost"]      { page-break-inside: avoid !important; break-inside: avoid !important; }
    .qs[data-sec="tnc"]       { page-break-inside: auto !important; break-inside: auto !important; }
    tr   { page-break-inside: avoid !important; break-inside: avoid !important; }
    thead{ display: table-header-group !important; }
    .sig  { page-break-inside: avoid !important; break-inside: avoid !important; }
    .qfoot{ page-break-inside: avoid !important; break-inside: avoid !important; }
    .scards, .fcards, .sub-grid, .tgrid,
    .pgrid, .cgrid, .pval, .sub-hl, .tnc-l,
    .cov-pills, .cov-body, .cov-hdr {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }
    .qcov, .sc, .pbox, .bom-t th, .ft th,
    .sp-t th, .sub-hero, .qfoot, .qsn, .pill {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .qd { box-shadow: none !important; }
  `;
  clone.prepend(style);

  const wrapper = document.createElement('div');
  wrapper.style.cssText = 'width:794px;background:#fff;';
  wrapper.appendChild(clone);
  document.body.appendChild(wrapper);

  const opt = {
    margin:      [8, 8, 8, 8],
    filename:    filename + '.pdf',
    image:       { type: 'jpeg', quality: 0.98 },
    html2canvas: {
      scale:           2.5,
      useCORS:         true,
      logging:         false,
      allowTaint:      true,
      backgroundColor: '#ffffff',
      width:           794,
      windowWidth:     794,
    },
    jsPDF: {
      unit:        'mm',
      format:      'a4',
      orientation: 'portrait',
      compress:    true,
    },
    pagebreak: {
      mode: ['css', 'legacy'],
    },
  };

  try {
    await html2pdf().set(opt).from(wrapper).save();
  } catch (err) {
    console.error('PDF export failed:', err);
    alert('PDF export failed. Please try again.');
  } finally {
    document.body.removeChild(wrapper);
  }
}