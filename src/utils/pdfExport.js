import { safe } from './helpers';

/**
 * GROUP-RENDER PDF ENGINE
 * ─────────────────────────────────────────────────────────────
 * Algorithm:
 *   1. Measure every section height (no rendering yet)
 *   2. Greedily bin-pack sections into A4 pages
 *   3. For each page-group, render ONLY those sections together
 *      in one container → one canvas → one PDF page
 *   4. Result: pages are always full, zero splits, zero blank spaces
 * ─────────────────────────────────────────────────────────────
 */
export async function exportToPDF(elementId, D) {
  const element = document.getElementById(elementId);
  if (!element) { alert('Proposal not found. Please generate first.'); return; }

  const { default: html2canvas } = await import('html2canvas');
  const { jsPDF }                = await import('jspdf');

  const filename = safe(`${D.refno || 'Proposal'} – ${D.cust || 'Customer'}`);

  // ── Page constants ──────────────────────────────────────────
  const RENDER_W  = 794;   // px — exact A4 width at 96dpi
  const SCALE     = 2.5;   // render scale for sharpness
  const MM_W      = 210;
  const MM_H      = 297;
  const MARGIN_MM = 8;
  const CW_MM     = MM_W - MARGIN_MM * 2;   // 194 mm
  const CH_MM     = MM_H - MARGIN_MM * 2;   // 281 mm per page

  // px per mm at render width
  const PX_PER_MM = RENDER_W / CW_MM;
  // max px height for one A4 page of content
  const PAGE_H_PX = CH_MM * PX_PER_MM;     // ≈ 1150 px

  // ── Shared html2canvas options ──────────────────────────────
  const H2C = (h) => ({
    scale:           SCALE,
    width:           RENDER_W,
    height:          h,
    backgroundColor: '#ffffff',
    useCORS:         true,
    logging:         false,
    allowTaint:      true,
    windowWidth:     RENDER_W,
    scrollX:         0,
    scrollY:         0,
  });

  // ── Helper: clone + style-fix element in an isolated wrapper ─
  function wrapClone(el) {
    const wrap = document.createElement('div');
    wrap.style.cssText = [
      'position:fixed', 'top:-99999px', 'left:0',
      `width:${RENDER_W}px`,
      'background:#ffffff',
      'z-index:-9999',
      'overflow:visible',
    ].join(';');

    const clone = el.cloneNode(true);
    clone.style.width = RENDER_W + 'px';

    const st = document.createElement('style');
    st.textContent = [
      '* { -webkit-print-color-adjust:exact!important;',
      '    print-color-adjust:exact!important; }',
      '.qd { box-shadow:none!important; }',
    ].join(' ');
    clone.prepend(st);
    wrap.appendChild(clone);
    return wrap;
  }

  // ── 1. MEASURE each section height (fast — no canvas render) ─
  // We put all sections into one measuring container at RENDER_W
  const measureWrap = document.createElement('div');
  measureWrap.style.cssText = [
    'position:fixed', 'top:-99999px', 'left:0',
    `width:${RENDER_W}px`, 'background:#fff', 'z-index:-9999',
    'visibility:hidden',
  ].join(';');

  const measureClone = element.cloneNode(true);
  measureClone.style.width = RENDER_W + 'px';
  measureWrap.appendChild(measureClone);
  document.body.appendChild(measureWrap);

  await new Promise(r => requestAnimationFrame(r));
  await new Promise(r => setTimeout(r, 300));

  // Collect sections in DOM order
  const sectionEls = Array.from(
    element.querySelectorAll('.qcov, .qs, .sig, .qfoot')
  );

  // Measure corresponding cloned sections
  const clonedSections = Array.from(
    measureClone.querySelectorAll('.qcov, .qs, .sig, .qfoot')
  );

  const sectionHeights = clonedSections.map(el => {
    const r = el.getBoundingClientRect();
    return Math.ceil(r.height);
  });

  document.body.removeChild(measureWrap);

  // ── 2. BIN-PACK sections into page groups ──────────────────
  const groups = [];  // each group = array of section indices
  let   curGroup = [];
  let   curH     = 0;
  const GAP_PX   = 0; // no extra gap between sections

  for (let i = 0; i < sectionEls.length; i++) {
    const h = sectionHeights[i];

    if (h > PAGE_H_PX) {
      // Section taller than 1 page → flush current, give it own group(s)
      if (curGroup.length > 0) { groups.push({ indices: curGroup, height: curH }); }
      curGroup = [i]; curH = h;
      groups.push({ indices: curGroup, height: curH });
      curGroup = []; curH = 0;
    } else if (curH + h > PAGE_H_PX * 0.97) {
      // Doesn't fit → flush current group, start fresh
      if (curGroup.length > 0) groups.push({ indices: curGroup, height: curH });
      curGroup = [i]; curH = h;
    } else {
      curGroup.push(i); curH += h + GAP_PX;
    }
  }
  if (curGroup.length > 0) groups.push({ indices: curGroup, height: curH });

  // ── 3. RENDER each group into its own canvas ───────────────
  const pdf = new jsPDF({
    unit: 'mm', format: 'a4', orientation: 'portrait', compress: true,
  });

  for (let gi = 0; gi < groups.length; gi++) {
    const grp = groups[gi];

    // Build a wrapper containing ONLY the sections in this group
    const grpWrap = document.createElement('div');
    grpWrap.style.cssText = [
      'position:fixed', 'top:-99999px', 'left:0',
      `width:${RENDER_W}px`,
      'background:#ffffff',
      'z-index:-9999',
      'overflow:visible',
    ].join(';');

    // Inject colour-print styles once
    const st = document.createElement('style');
    st.textContent = '* { -webkit-print-color-adjust:exact!important; print-color-adjust:exact!important; }';
    grpWrap.appendChild(st);

    // Clone each section in this group and append
    for (const idx of grp.indices) {
      const secClone = sectionEls[idx].cloneNode(true);
      secClone.style.width  = RENDER_W + 'px';
      secClone.style.margin = '0';
      secClone.style.padding = secClone.style.padding || '';
      grpWrap.appendChild(secClone);
    }

    document.body.appendChild(grpWrap);

    // Let layout settle
    await new Promise(r => requestAnimationFrame(r));
    await new Promise(r => setTimeout(r, 60));

    const totalH = grpWrap.scrollHeight;

    const canvas = await html2canvas(grpWrap, {
      ...H2C(totalH),
    });

    document.body.removeChild(grpWrap);

    if (gi > 0) pdf.addPage();

    // canvas.width = RENDER_W * SCALE → CW_MM
    // canvas.height = totalH * SCALE  → height_mm
    const imgH_mm = (canvas.height / (RENDER_W * SCALE)) * CW_MM;

    // If this group is taller than one page, slice it
    if (imgH_mm > CH_MM + 2) {
      const pxPerPage = Math.floor(CH_MM * (RENDER_W * SCALE) / CW_MM);
      let sliceY = 0;
      let first  = true;

      while (sliceY < canvas.height) {
        if (!first) pdf.addPage();
        first = false;

        const sliceH = Math.min(pxPerPage, canvas.height - sliceY);
        const pc = document.createElement('canvas');
        pc.width  = canvas.width;
        pc.height = sliceH;
        const ctx = pc.getContext('2d');
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, pc.width, sliceH);
        ctx.drawImage(canvas, 0, sliceY, canvas.width, sliceH, 0, 0, canvas.width, sliceH);

        const sliceH_mm = (sliceH / (RENDER_W * SCALE)) * CW_MM;
        pdf.addImage(pc.toDataURL('image/jpeg', 0.96), 'JPEG',
          MARGIN_MM, MARGIN_MM, CW_MM, sliceH_mm);
        sliceY += sliceH;
      }
    } else {
      // Normal page — place at top, section fills naturally
      pdf.addImage(
        canvas.toDataURL('image/jpeg', 0.96),
        'JPEG',
        MARGIN_MM, MARGIN_MM,
        CW_MM, imgH_mm
      );
    }
  }

  pdf.save(filename + '.pdf');
}
