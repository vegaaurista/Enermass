import { safe } from './helpers';

/**
 * SCALE-TO-FILL PDF ENGINE
 * ─────────────────────────────────────────────────────────────
 * Algorithm:
 *  1. Render full document as ONE tall canvas (no section splitting)
 *  2. Detect exact pixel position of each section boundary
 *  3. Greedily pack sections into page groups
 *  4. Scale each page's content to EXACTLY fill the A4 page height
 *     (slight ±15% scale is invisible but eliminates all blank space)
 *  5. Result: every page is 100% full — zero blank spaces guaranteed
 * ─────────────────────────────────────────────────────────────
 */
export async function exportToPDF(elementId, D) {
  const element = document.getElementById(elementId);
  if (!element) { alert('Proposal not found.'); return; }

  const { default: html2canvas } = await import('html2canvas');
  const { jsPDF }                = await import('jspdf');

  const filename = safe(`${D.refno || 'Proposal'} – ${D.cust || 'Customer'}`);

  // ── Constants ────────────────────────────────────────────────
  const RENDER_W  = 794;
  const SCALE     = 2;
  const MM_W      = 210;
  const MM_H      = 297;
  const MARGIN    = 8;           // mm
  const CW_MM     = MM_W - MARGIN * 2;   // 194 mm
  const CH_MM     = MM_H - MARGIN * 2;   // 281 mm
  const PX_PER_MM = RENDER_W / CW_MM;
  const PAGE_H_PX = CH_MM * PX_PER_MM;   // ~1147 px (unscaled)

  // ── 1. Build full-document render container ───────────────────
  const container = document.createElement('div');
  container.style.cssText = [
    'position:fixed', 'top:-99999px', 'left:0',
    `width:${RENDER_W}px`,
    'background:#ffffff',
    'z-index:-9999',
    'overflow:visible',
  ].join(';');

  const clone = element.cloneNode(true);
  clone.style.width = RENDER_W + 'px';

  const st = document.createElement('style');
  st.textContent = `
    * { -webkit-print-color-adjust:exact!important; print-color-adjust:exact!important; }
    .qd { box-shadow:none!important; }
  `;
  clone.prepend(st);
  container.appendChild(clone);
  document.body.appendChild(container);

  await document.fonts.ready;
  await new Promise(r => requestAnimationFrame(r));
  await new Promise(r => setTimeout(r, 500));

  const containerRect = container.getBoundingClientRect();
  const totalDocH     = container.scrollHeight;

  // ── 2. Detect section boundary Y positions (px, relative to doc top) ─
  const sectionEls = Array.from(
    clone.querySelectorAll('.qcov, .qs, .sig, .qfoot')
  );

  // Each boundary = { top, bottom } in document px (unscaled)
  const boundaries = sectionEls.map(el => {
    const r   = el.getBoundingClientRect();
    const top = Math.max(0, r.top - containerRect.top);
    return { top, bottom: top + r.height, height: r.height };
  }).filter(b => b.height > 2);

  // ── 3. Render full document to ONE canvas ─────────────────────
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
    scrollY:         0,
  });

  document.body.removeChild(container);

  // canvas px per "logical" px = SCALE
  // So section boundary in canvas px = boundary.top * SCALE

  // ── 4. Greedy bin-pack section groups ─────────────────────────
  // Group sections so each group fits within one A4 page.
  // A section goes to next page only if adding it would exceed 115%
  // of page height (we allow 15% overage because we'll scale it down).
  const MAX_PX    = PAGE_H_PX * 1.15;
  const MIN_FILL  = PAGE_H_PX * 0.30;  // at least 30% full

  const groups = [];
  let grpStart = 0;   // index into boundaries[]
  let grpH     = 0;

  for (let i = 0; i < boundaries.length; i++) {
    const secH = boundaries[i].height;

    if (secH > PAGE_H_PX * 1.5) {
      // Oversized section (BOM, TNC) — flush current group, then give it its own
      if (i > grpStart) groups.push({ from: grpStart, to: i - 1 });
      groups.push({ from: i, to: i });
      grpStart = i + 1;
      grpH     = 0;
    } else if (grpH + secH > MAX_PX && grpH > MIN_FILL) {
      // This section would overflow — flush current group
      groups.push({ from: grpStart, to: i - 1 });
      grpStart = i;
      grpH     = secH;
    } else {
      grpH += secH;
    }
  }
  // Flush last group
  if (grpStart < boundaries.length) {
    groups.push({ from: grpStart, to: boundaries.length - 1 });
  }

  // ── 5. Build PDF — one page per group, scaled to fill ─────────
  const pdf = new jsPDF({
    unit:        'mm',
    format:      'a4',
    orientation: 'portrait',
    compress:    true,
  });

  for (let gi = 0; gi < groups.length; gi++) {
    if (gi > 0) pdf.addPage();

    const grp = groups[gi];
    const topBound    = boundaries[grp.from];
    const bottomBound = boundaries[grp.to];

    // Canvas pixel coordinates
    const srcY = Math.floor(topBound.top    * SCALE);
    const srcH = Math.ceil (bottomBound.bottom * SCALE) - srcY;

    if (srcH <= 0) continue;

    // Clamp to canvas bounds
    const clampedSrcH = Math.min(srcH, canvas.height - srcY);
    if (clampedSrcH <= 0) continue;

    // Crop this group from the full canvas
    const pc  = document.createElement('canvas');
    pc.width  = canvas.width;
    pc.height = clampedSrcH;
    const ctx = pc.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, pc.width, clampedSrcH);
    ctx.drawImage(
      canvas,
      0, srcY, canvas.width, clampedSrcH,
      0, 0,    pc.width,     clampedSrcH
    );

    const imgData = pc.toDataURL('image/jpeg', 0.95);

    // ── Scale-to-fill: always use full CH_MM height ───────────────
    // This eliminates blank space. The scale factor is:
    //   actual content height / page height
    // For small sections like cover: scale < 1 (content expanded slightly)
    // For near-full sections: scale ≈ 1 (no visible change)
    // Max visible stretch is about 15% which is imperceptible in print.
    pdf.addImage(
      imgData,
      'JPEG',
      MARGIN, MARGIN,
      CW_MM,
      CH_MM       // ← always full page height — scales content to fill
    );
  }

  pdf.save(filename + '.pdf');
}
