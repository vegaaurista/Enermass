import { safe } from './helpers';

// A4 dimensions at 96 DPI
const A4_W_PX   = 794;
const A4_H_PX   = 1122;
const MARGIN_PX = 36;
const PAGE_H    = A4_H_PX - MARGIN_PX * 2; // ~1050px usable per page

// PDF output (mm)
const PDF_W_MM     = 210;
const MARGIN_MM    = 8;
const CONTENT_W_MM = PDF_W_MM - MARGIN_MM * 2; // 194mm

/**
 * Smart page builder:
 * Groups sections so each page is filled from top.
 * NO blank spaces at top of pages.
 * Sections are never split mid-content.
 */
function buildPages(sections) {
  const pages = [];
  let pageStartY = 0;
  let pageUsedH  = 0;
  let pageEndY   = 0;

  sections.forEach(sec => {
    if (sec.height > PAGE_H) {
      // Section taller than a full page — close current, then multi-page split
      if (pageUsedH > 0) {
        pages.push({ start: pageStartY, end: pageEndY });
        pageUsedH = 0;
      }
      let y = sec.top;
      while (y < sec.bottom) {
        const end = Math.min(y + PAGE_H, sec.bottom);
        pages.push({ start: y, end });
        y = end;
      }
      pageStartY = sec.bottom;
      pageEndY   = sec.bottom;
      pageUsedH  = 0;
    } else if (pageUsedH > 0 && pageUsedH + sec.height > PAGE_H) {
      // Doesn't fit — close current page, start fresh
      pages.push({ start: pageStartY, end: pageEndY });
      pageStartY = sec.top;
      pageEndY   = sec.bottom;
      pageUsedH  = sec.height;
    } else {
      // Fits on current page
      if (pageUsedH === 0) pageStartY = sec.top;
      pageEndY  = sec.bottom;
      pageUsedH += sec.height;
    }
  });

  if (pageUsedH > 0) pages.push({ start: pageStartY, end: pageEndY });
  return pages;
}

export async function exportToPDF(elementId, D) {
  const element = document.getElementById(elementId);
  if (!element) { alert('Proposal document not found.'); return; }

  const { default: html2canvas } = await import('html2canvas');
  const { jsPDF }                = await import('jspdf');

  const filename = safe(`${D.refno || 'Proposal'} – ${D.cust || 'Customer'}`);
  const SCALE    = 2.5;

  /* ── 1. Build isolated rendering container ── */
  const container = document.createElement('div');
  container.style.cssText = [
    'position:fixed', 'top:-99999px', 'left:0',
    `width:${A4_W_PX}px`, 'background:#fff', 'z-index:-9999',
  ].join(';');

  const clone = element.cloneNode(true);
  clone.style.width = A4_W_PX + 'px';

  // Force colour-exact rendering (dark backgrounds, gradients)
  const printStyle = document.createElement('style');
  printStyle.textContent = `
    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }
    /* Remove box-shadows for cleaner PDF */
    .qd { box-shadow: none !important; }
  `;
  clone.prepend(printStyle);
  container.appendChild(clone);
  document.body.appendChild(container);

  // Wait for layout & fonts
  await document.fonts.ready;
  await new Promise(r => requestAnimationFrame(r));
  await new Promise(r => setTimeout(r, 400));

  /* ── 2. Measure section positions (relative to container top) ── */
  const containerRect = container.getBoundingClientRect();
  const sectionEls    = Array.from(clone.querySelectorAll('.qcov, .qs, .sig, .qfoot'));

  const sections = sectionEls.map(el => {
    const r = el.getBoundingClientRect();
    const top    = r.top    - containerRect.top;
    const height = r.height;
    return { top, height, bottom: top + height };
  }).filter(s => s.height > 0);

  /* ── 3. Render full document to one canvas ── */
  const fullCanvas = await html2canvas(container, {
    scale:       SCALE,
    width:       A4_W_PX,
    height:      container.scrollHeight,
    backgroundColor: '#ffffff',
    useCORS:     true,
    logging:     false,
    allowTaint:  true,
    windowWidth: A4_W_PX,
  });

  document.body.removeChild(container);

  /* ── 4. Group sections into pages ── */
  const pages = buildPages(sections);

  /* ── 5. Build PDF — slice canvas per page ── */
  const pdf = new jsPDF({
    unit:        'mm',
    format:      'a4',
    orientation: 'portrait',
    compress:    true,
  });

  for (let i = 0; i < pages.length; i++) {
    if (i > 0) pdf.addPage();

    const pg   = pages[i];
    const srcY = Math.max(0, Math.floor(pg.start * SCALE));
    const srcH = Math.min(
      Math.ceil((pg.end - pg.start) * SCALE),
      fullCanvas.height - srcY
    );

    if (srcH <= 0) continue;

    // Crop canvas slice for this page
    const pageCanvas          = document.createElement('canvas');
    pageCanvas.width          = fullCanvas.width;
    pageCanvas.height         = srcH;
    const ctx                 = pageCanvas.getContext('2d');
    ctx.fillStyle             = '#ffffff';
    ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
    ctx.drawImage(fullCanvas, 0, srcY, fullCanvas.width, srcH, 0, 0, fullCanvas.width, srcH);

    const imgData   = pageCanvas.toDataURL('image/jpeg', 0.95);
    const imgH_MM   = (srcH / fullCanvas.width) * CONTENT_W_MM;

    pdf.addImage(imgData, 'JPEG', MARGIN_MM, MARGIN_MM, CONTENT_W_MM, imgH_MM);
  }

  pdf.save(filename + '.pdf');
}
