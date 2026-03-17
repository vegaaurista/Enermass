import { safe } from './helpers';

export async function exportToPDF(elementId, D) {
  const element = document.getElementById(elementId);
  if (!element) { alert('Proposal document not found.'); return; }

  const { default: html2canvas } = await import('html2canvas');
  const { jsPDF }                = await import('jspdf');

  const filename = safe(`${D.refno || 'Proposal'} – ${D.cust || 'Customer'}`);

  // ── A4 constants ──────────────────────────────────────────
  const RENDER_W  = 794;   // document width in px
  const SCALE     = 2;     // canvas render scale
  const MM_W      = 210;
  const MM_H      = 297;
  const MARGIN    = 8;     // mm
  const CW        = MM_W - MARGIN * 2;   // 194 mm content width
  const CH        = MM_H - MARGIN * 2;   // 281 mm content height

  // ── 1. Build off-screen render container ─────────────────
  const container = document.createElement('div');
  container.style.cssText = [
    'position:fixed', 'top:-99999px', 'left:0',
    `width:${RENDER_W}px`,
    'background:#fff',
    'z-index:-9999',
    'overflow:visible',
  ].join(';');

  const clone = element.cloneNode(true);
  clone.style.cssText += `;width:${RENDER_W}px;`;

  // Force colour printing
  const pStyle = document.createElement('style');
  pStyle.textContent = `
    *{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;}
    .qd{box-shadow:none!important;}
  `;
  clone.prepend(pStyle);
  container.appendChild(clone);
  document.body.appendChild(container);

  // Wait for fonts + layout to fully settle
  await document.fonts.ready;
  await new Promise(r => requestAnimationFrame(r));
  await new Promise(r => setTimeout(r, 800));

  const totalH = container.scrollHeight;

  // ── 2. Render entire document to ONE canvas ───────────────
  const canvas = await html2canvas(container, {
    scale:           SCALE,
    width:           RENDER_W,
    height:          totalH,
    backgroundColor: '#ffffff',
    useCORS:         true,
    logging:         false,
    allowTaint:      true,
    windowWidth:     RENDER_W,
    scrollX:         0,
    scrollY:         0,
  });

  document.body.removeChild(container);

  // ── 3. Calculate page height in canvas pixels ─────────────
  // 194 mm wide content = RENDER_W * SCALE canvas px wide
  // => 1 mm = (RENDER_W * SCALE) / 194 canvas px
  const pxPerMM  = (RENDER_W * SCALE) / CW;
  const pageH_px = Math.round(CH * pxPerMM);  // canvas px per A4 page

  // ── 4. Pure fixed slices – NO smart breaks, NO blank gaps ─
  const pdf = new jsPDF({
    unit:        'mm',
    format:      'a4',
    orientation: 'portrait',
    compress:    true,
  });

  let y = 0;
  let pageIndex = 0;

  while (y < canvas.height) {
    if (pageIndex > 0) pdf.addPage();

    const sliceH = Math.min(pageH_px, canvas.height - y);
    if (sliceH <= 0) break;

    // Crop exactly one A4-worth of canvas
    const pageCanvas  = document.createElement('canvas');
    pageCanvas.width  = canvas.width;
    pageCanvas.height = sliceH;

    const ctx = pageCanvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, pageCanvas.width, sliceH);
    ctx.drawImage(
      canvas,
      0, y, canvas.width, sliceH,
      0, 0, canvas.width, sliceH
    );

    // sliceH canvas px → mm height on page
    const imgH_mm = (sliceH / (RENDER_W * SCALE)) * CW;

    pdf.addImage(
      pageCanvas.toDataURL('image/jpeg', 0.92),
      'JPEG',
      MARGIN, MARGIN,
      CW, imgH_mm
    );

    y += sliceH;
    pageIndex++;
  }

  pdf.save(filename + '.pdf');
}
