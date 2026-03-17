import { safe } from './helpers';

export async function exportToPDF(elementId, D) {
  const element = document.getElementById(elementId);
  if (!element) { alert('Proposal document not found.'); return; }

  const { default: html2canvas } = await import('html2canvas');
  const { jsPDF } = await import('jspdf');

  const filename = safe(`${D.refno || 'Proposal'} – ${D.cust || 'Customer'}`);

  // ── A4 page dimensions ────────────────────────────────────
  const MM_W     = 210;
  const MM_H     = 297;
  const MARGIN   = 10;       // mm all sides
  const CW_MM    = MM_W - MARGIN * 2;  // 190 mm usable width
  const CH_MM    = MM_H - MARGIN * 2;  // 277 mm usable height per page
  const RENDER_W = 900;      // px render width (wider = sharper text)
  const SCALE    = 2;        // canvas scale

  // ── Common html2canvas options ────────────────────────────
  const H2C_OPTS = {
    scale:           SCALE,
    useCORS:         true,
    logging:         false,
    allowTaint:      true,
    backgroundColor: '#ffffff',
    width:           RENDER_W,
    windowWidth:     RENDER_W,
  };

  // ── Helper: render a DOM element to canvas ────────────────
  async function renderEl(el) {
    // Clone into an isolated fixed container at RENDER_W
    const wrap = document.createElement('div');
    wrap.style.cssText = [
      'position:fixed', 'top:-99999px', 'left:0',
      `width:${RENDER_W}px`, 'background:#fff', 'z-index:-1',
    ].join(';');

    const clone = el.cloneNode(true);
    clone.style.width = RENDER_W + 'px';

    // Inject colour-print style
    const st = document.createElement('style');
    st.textContent = '*{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;}';
    clone.prepend(st);

    wrap.appendChild(clone);
    document.body.appendChild(wrap);

    // Let layout settle
    await new Promise(r => requestAnimationFrame(r));
    await new Promise(r => setTimeout(r, 80));

    const canvas = await html2canvas(wrap, {
      ...H2C_OPTS,
      height: wrap.scrollHeight,
    });
    document.body.removeChild(wrap);
    return canvas;
  }

  // ── 1. Collect all top-level sections in document order ───
  //    .qcov  = cover page
  //    .qs    = numbered sections 01-11
  //    .sig   = signature block
  //    .qfoot = footer strip
  const sectionEls = Array.from(
    element.querySelectorAll('.qcov, .qs, .sig, .qfoot')
  );

  if (!sectionEls.length) {
    alert('No proposal sections found. Please generate the proposal first.');
    return;
  }

  // ── 2. Render every section to its own canvas ─────────────
  //    Show progress in button (handled by caller)
  const sections = [];
  for (const el of sectionEls) {
    const canvas = await renderEl(el);
    // Convert canvas height to mm
    // canvas.width  = RENDER_W * SCALE  →  CW_MM
    // canvas.height = ?                 →  height_mm
    const pxPerMM = (RENDER_W * SCALE) / CW_MM;
    const height_mm = canvas.height / pxPerMM;
    sections.push({ canvas, height_mm, pxPerMM });
  }

  // ── 3. Pack sections onto pages (greedy bin packing) ──────
  //    A section that is taller than one page gets its own page(s).
  //    Otherwise it goes on current page; if it doesn't fit a new page starts.
  const pdf = new jsPDF({
    unit:        'mm',
    format:      'a4',
    orientation: 'portrait',
    compress:    true,
  });

  let curY   = MARGIN;   // current Y cursor on page (mm)
  let isFirst = true;

  for (const sec of sections) {
    const { canvas, height_mm, pxPerMM } = sec;

    if (height_mm > CH_MM) {
      // Section taller than one page – slice it across pages
      if (!isFirst) { pdf.addPage(); curY = MARGIN; }

      let sliceTop_px = 0;
      const totalH_px = canvas.height;

      while (sliceTop_px < totalH_px) {
        const availH_mm = CH_MM - (curY - MARGIN);
        const availH_px = Math.floor(availH_mm * pxPerMM);
        const sliceH_px = Math.min(availH_px, totalH_px - sliceTop_px);
        if (sliceH_px <= 0) { pdf.addPage(); curY = MARGIN; continue; }

        const pc  = document.createElement('canvas');
        pc.width  = canvas.width;
        pc.height = sliceH_px;
        const ctx = pc.getContext('2d');
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, pc.width, sliceH_px);
        ctx.drawImage(canvas, 0, sliceTop_px, canvas.width, sliceH_px, 0, 0, canvas.width, sliceH_px);

        const sliceH_mm = sliceH_px / pxPerMM;
        pdf.addImage(pc.toDataURL('image/jpeg', 0.95), 'JPEG', MARGIN, curY, CW_MM, sliceH_mm);

        sliceTop_px += sliceH_px;
        curY += sliceH_mm;

        if (sliceTop_px < totalH_px) { pdf.addPage(); curY = MARGIN; }
      }
      isFirst = false;

    } else {
      // Normal section – fits on one page
      const remaining = CH_MM - (curY - MARGIN);

      if (!isFirst && height_mm > remaining) {
        // Doesn't fit on current page → new page
        pdf.addPage();
        curY = MARGIN;
      }

      pdf.addImage(
        canvas.toDataURL('image/jpeg', 0.95),
        'JPEG',
        MARGIN, curY,
        CW_MM, height_mm
      );

      curY += height_mm;
      isFirst = false;
    }
  }

  pdf.save(filename + '.pdf');
}
