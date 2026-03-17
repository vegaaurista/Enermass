import { safe } from './helpers';

export async function exportToPDF(elementId, D) {
  const element = document.getElementById(elementId);
  if (!element) { alert('Proposal document not found.'); return; }

  const { default: html2canvas } = await import('html2canvas');
  const { jsPDF }                = await import('jspdf');

  const filename = safe(`${D.refno || 'Proposal'} – ${D.cust || 'Customer'}`);

  // ── Constants ──────────────────────────────────────────────
  const RENDER_W  = 794;    // px – document render width
  const SCALE     = 2;      // canvas scale factor
  const MM_W      = 210;    // A4 width mm
  const MM_H      = 297;    // A4 height mm
  const MARGIN    = 8;      // mm page margin
  const CW        = MM_W - MARGIN * 2;  // 194mm content width
  const CH        = MM_H - MARGIN * 2;  // 281mm content height

  // ── 1. Build isolated off-screen render container ──────────
  const container = document.createElement('div');
  container.style.cssText = [
    'position:fixed', 'top:-9999px', 'left:0',
    `width:${RENDER_W}px`, 'background:#fff', 'z-index:-9999',
  ].join(';');

  const clone = element.cloneNode(true);
  clone.style.width = RENDER_W + 'px';

  const pStyle = document.createElement('style');
  pStyle.textContent = `
    * { -webkit-print-color-adjust:exact!important; print-color-adjust:exact!important; color-adjust:exact!important; }
    .qd { box-shadow:none!important; }
  `;
  clone.prepend(pStyle);
  container.appendChild(clone);
  document.body.appendChild(container);

  // Wait for fonts + layout
  await document.fonts.ready;
  await new Promise(r => requestAnimationFrame(r));
  await new Promise(r => setTimeout(r, 600));

  const totalDocH = container.scrollHeight;

  // ── 2. Measure section HEADER positions for smart breaks ──
  // We detect .qsh (section number+title) and .qcov so we never
  // cut a page right through a section heading.
  const containerTop = container.getBoundingClientRect().top;

  const headerPositions = Array.from(
    clone.querySelectorAll('.qsh, .qcov')
  ).map(el => {
    const r = el.getBoundingClientRect();
    // Position in document pixels (relative to container top)
    return (r.top - containerTop);
  }).filter(pos => pos > 10);   // ignore the very first element

  // ── 3. Render full document canvas ────────────────────────
  const canvas = await html2canvas(container, {
    scale:           SCALE,
    width:           RENDER_W,
    height:          totalDocH,
    backgroundColor: '#ffffff',
    useCORS:         true,
    logging:         false,
    allowTaint:      true,
    windowWidth:     RENDER_W,
    scrollX:         0,
    scrollY:         -window.scrollY,
  });

  document.body.removeChild(container);

  // ── 4. Calculate A4 page height in canvas pixels ──────────
  // CW mm → RENDER_W * SCALE px, so:  1 mm = (RENDER_W * SCALE) / CW px
  const pxPerMM  = (RENDER_W * SCALE) / CW;
  const pageH_px = Math.floor(CH * pxPerMM);   // canvas px per page

  // ── 5. Smart page breaks ───────────────────────────────────
  // Strategy: use fixed page-height slices BUT if a section header
  // falls within the bottom 18% of a page, push the break to just
  // BEFORE that header (so the header starts fresh on the next page).
  // This eliminates blank spaces while keeping headings intact.

  function calcBreaks(canvasH, pgH, docHeaders, docScale) {
    const breaks = [0];
    let pos = 0;

    while (pos + pgH < canvasH) {
      let breakAt = pos + pgH;
      const threshold = pos + pgH * 0.82;  // last 18% of page

      // Find header that lands in the danger zone
      for (const hPos of docHeaders) {
        const hCanvasPos = hPos * docScale;  // convert to canvas px
        if (hCanvasPos >= threshold && hCanvasPos < pos + pgH) {
          // This header would appear in the last 18% – push it to next page
          breakAt = Math.max(pos + pgH * 0.5, hCanvasPos - 4 * docScale);
          break;
        }
      }

      if (breakAt <= pos) breakAt = pos + pgH;
      breaks.push(Math.floor(breakAt));
      pos = Math.floor(breakAt);
    }

    breaks.push(canvasH);
    return breaks;
  }

  const breaks = calcBreaks(canvas.height, pageH_px, headerPositions, SCALE);

  // ── 6. Build PDF ───────────────────────────────────────────
  const pdf = new jsPDF({
    unit:        'mm',
    format:      'a4',
    orientation: 'portrait',
    compress:    true,
  });

  for (let i = 0; i < breaks.length - 1; i++) {
    if (i > 0) pdf.addPage();

    const srcY  = breaks[i];
    const srcH  = Math.min(breaks[i + 1] - srcY, canvas.height - srcY);
    if (srcH <= 0) continue;

    // Slice canvas
    const pc  = document.createElement('canvas');
    pc.width  = canvas.width;
    pc.height = srcH;
    const ctx = pc.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, pc.width, srcH);
    ctx.drawImage(canvas, 0, srcY, canvas.width, srcH, 0, 0, canvas.width, srcH);

    const imgH_mm = (srcH / (RENDER_W * SCALE)) * CW;
    pdf.addImage(
      pc.toDataURL('image/jpeg', 0.93),
      'JPEG',
      MARGIN, MARGIN,
      CW, imgH_mm
    );
  }

  pdf.save(filename + '.pdf');
}
