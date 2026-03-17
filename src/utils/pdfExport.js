import { safe } from './helpers';

/**
 * PRINT-WINDOW PDF EXPORT
 * ─────────────────────────────────────────────────────────────
 * Opens a dedicated print window with the proposal rendered using
 * the browser's native print engine — the only approach that gives:
 *   • Vector-quality text (not rasterised canvas)
 *   • Zero blank spaces (browser packs content naturally)
 *   • Zero content splits (CSS break-inside:avoid works perfectly)
 *   • Correct colours (no colour-adjust guessing)
 * ─────────────────────────────────────────────────────────────
 */
export async function exportToPDF(elementId, D) {
  const element = document.getElementById(elementId);
  if (!element) { alert('Proposal not found. Please generate first.'); return; }

  const filename = safe(`${D.refno || 'Proposal'} – ${D.cust || 'Customer'}`);
  const docHtml  = element.innerHTML;

  // ── All proposal styles (self-contained, no external deps except fonts) ──
  const CSS = `
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&family=Space+Mono:wght@400;700&display=swap');

    :root {
      --navy:#0f2744; --navy2:#1a3a5c; --gold:#c8933a; --gold2:#e8b96a;
      --gold-pale:#fdf3e3; --green:#2d8c5a; --green-light:#e8f7ef;
      --sky:#4a90d9; --sub:#1565c0; --sub-bg:#e3f0ff;
      --g100:#f8f9fa; --g200:#e9ecef; --g300:#dee2e6;
      --g400:#adb5bd; --g500:#6c757d; --g700:#495057; --g800:#343a40;
      --ink:#0d1117;
    }

    *  { box-sizing:border-box; margin:0; padding:0; }
    body { font-family:'DM Sans',sans-serif; font-size:10pt; color:#0d1117;
           background:#fff; -webkit-print-color-adjust:exact; print-color-adjust:exact; }

    /* ── DOCUMENT WRAPPER ── */
    .qd  { background:#fff; width:100%; }

    /* ── COVER ── */
    .qcov { background:linear-gradient(160deg,#0f2744 0%,#0d2235 60%,#081520 100%);
            padding:36px 44px; position:relative; overflow:hidden;
            -webkit-print-color-adjust:exact; print-color-adjust:exact; }
    .qcov::before { content:''; position:absolute; top:-45px; right:-45px; width:200px;
            height:200px; background:radial-gradient(circle,rgba(200,147,58,.16),transparent 70%);
            border-radius:50%; }
    .cov-hdr { display:flex; justify-content:space-between; align-items:flex-start;
               margin-bottom:28px; position:relative; z-index:1; }
    .cov-logo-area { display:flex; align-items:flex-start; gap:12px; }
    .cov-logo { width:120px; height:55px; object-fit:contain; }
    .cov-co-name { font-family:'Poppins',sans-serif; font-size:20pt; color:#fff;
                   font-weight:700; line-height:1.2; }
    .cov-co-tag  { font-size:6.5pt; color:#e8b96a; letter-spacing:2.2px;
                   text-transform:uppercase; margin-top:4px; }
    .cov-co-cont { font-size:7pt; color:rgba(255,255,255,.38); margin-top:7px; line-height:1.65; }
    .cov-ref { background:linear-gradient(135deg,#c8933a,#e8b96a); color:#0f2744;
               padding:8px 12px; border-radius:4px; text-align:center; flex-shrink:0; }
    .cov-ref .rl { font-size:6pt; font-weight:700; text-transform:uppercase; letter-spacing:1px; }
    .cov-ref .rn { font-family:'Space Mono',monospace; font-size:8pt; font-weight:700; margin-top:3px; }
    .cov-ref .rd { font-size:6.5pt; margin-top:3px; opacity:.75; }
    .cov-body { position:relative; z-index:1; }
    .cov-eyebrow { font-size:6.5pt; color:#e8b96a; letter-spacing:2.8px;
                   text-transform:uppercase; font-weight:600; margin-bottom:8px; }
    .cov-title { font-family:'Poppins',sans-serif; font-size:18pt; color:#fff;
                 font-weight:700; line-height:1.15; }
    .cov-title span { color:#e8b96a; display:block; }
    .cov-sub { color:rgba(255,255,255,.45); font-size:8.5pt; margin-top:6px; line-height:1.5; }
    .cov-pills { display:flex; gap:5px; margin-top:14px; flex-wrap:wrap; }
    .pill { background:rgba(255,255,255,.1); border:1px solid rgba(255,255,255,.15);
            padding:3px 9px; border-radius:50px; color:rgba(255,255,255,.85); font-size:7pt;
            display:inline-flex; align-items:center; gap:4px;
            -webkit-print-color-adjust:exact; print-color-adjust:exact; }
    .pill .dot { width:4px; height:4px; border-radius:50%; background:#e8b96a; flex-shrink:0; }

    /* ── SECTIONS ── */
    .qs { padding:16px 26px; border-bottom:1px solid #e9ecef; }
    .qs:last-child { border-bottom:none; }
    .qsh { display:flex; align-items:center; gap:8px; margin-bottom:12px; }
    .qsn { width:22px; height:22px; border-radius:50%;
           background:linear-gradient(135deg,#0f2744,#1a3a5c); color:#fff;
           font-family:'Space Mono',monospace; font-size:7pt; display:flex;
           align-items:center; justify-content:center; font-weight:700; flex-shrink:0;
           -webkit-print-color-adjust:exact; print-color-adjust:exact; }
    .qst { font-family:'Playfair Display',serif; font-size:11pt; color:#0f2744; font-weight:700; }
    .qsd { flex:1; height:2px; background:linear-gradient(to right,#c8933a,transparent);
           margin-left:6px; -webkit-print-color-adjust:exact; print-color-adjust:exact; }

    /* ── INTRO LETTER ── */
    .qltr { background:#fdf3e3; border-left:4px solid #c8933a; padding:14px 18px;
            line-height:1.7; color:#343a40; font-size:9pt;
            -webkit-print-color-adjust:exact; print-color-adjust:exact; }
    .qltr p { margin-bottom:8px; font-size:9pt; }

    /* ── PROFILE GRIDS ── */
    .pgrid { display:grid; grid-template-columns:1fr 1fr; gap:7px; }
    .pi { background:#f8f9fa; padding:8px 10px; border-left:3px solid #c8933a;
          -webkit-print-color-adjust:exact; print-color-adjust:exact; }
    .pi .pl { font-size:7pt; color:#6c757d; text-transform:uppercase;
              letter-spacing:.4px; margin-bottom:2px; }
    .pi .pv { font-size:9pt; color:#0d1117; font-weight:500; line-height:1.35; }
    .cgrid { display:grid; grid-template-columns:repeat(3,1fr); gap:7px; }
    .ci .cl { font-size:7pt; color:#6c757d; text-transform:uppercase;
              letter-spacing:.35px; margin-bottom:2px; }
    .ci .cv { font-size:9pt; color:#0d1117; font-weight:500; }

    /* ── SPEC CARDS ── */
    .scards { display:grid; grid-template-columns:repeat(4,1fr); gap:8px; margin-bottom:10px; }
    .sc { background:linear-gradient(135deg,#0f2744,#1a3a5c); padding:9px 7px;
          text-align:center; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
    .scv { font-family:'Space Mono',monospace; font-size:11pt; color:#e8b96a; font-weight:700; }
    .scu { font-size:6.5pt; color:rgba(255,255,255,.45); text-transform:uppercase; }
    .scl { font-size:7pt; color:rgba(255,255,255,.7); margin-top:2px; }

    /* ── SPEC TABLE ── */
    .sp-t { width:100%; border-collapse:collapse; font-size:9pt; }
    .sp-t th { background:#0f2744; color:#fff; padding:6px 9px; text-align:left;
               font-size:7.5pt; text-transform:uppercase; letter-spacing:.3px;
               -webkit-print-color-adjust:exact; print-color-adjust:exact; }
    .sp-t td { padding:5px 9px; border-bottom:1px solid #e9ecef; }
    .sp-t td:first-child { font-weight:600; }
    .sp-t tr:nth-child(even) td { background:#f8f9fa;
               -webkit-print-color-adjust:exact; print-color-adjust:exact; }

    /* ── BOM TABLE ── */
    .bom-t { width:100%; border-collapse:collapse; font-size:8.5pt; table-layout:fixed; }
    .bom-t th { background:#0f2744; color:#fff; padding:6px 8px; text-align:left;
                font-size:7pt; text-transform:uppercase; letter-spacing:.3px;
                -webkit-print-color-adjust:exact; print-color-adjust:exact; }
    .bom-t td { padding:4px 8px; border:1px solid #d7d7d7; font-size:8.5pt;
                overflow-wrap:break-word; word-break:break-word; }
    .bom-t .bc td { background:#fdf3e3; font-weight:700; color:#0f2744; font-size:7.5pt;
                    text-transform:uppercase; padding:3px 8px;
                    -webkit-print-color-adjust:exact; print-color-adjust:exact; }
    .bom-t tr:nth-child(even):not(.bc) td { background:#f8f9fa;
                    -webkit-print-color-adjust:exact; print-color-adjust:exact; }
    .bom-t td.bo { font-weight:600; color:#0f2744; }

    /* ── SUBSIDY ── */
    .sub-hero { background:linear-gradient(135deg,#0f2744,#1a3a5c); padding:12px 16px;
                display:flex; justify-content:space-between; align-items:center;
                flex-wrap:wrap; gap:8px; margin-bottom:8px;
                -webkit-print-color-adjust:exact; print-color-adjust:exact; }
    .sub-hero h3 { font-family:'Playfair Display',serif; font-size:9.5pt; color:#fff; }
    .sub-hero p  { font-size:7.5pt; color:rgba(255,255,255,.5); margin-top:2px; }
    .sha  { font-family:'Space Mono',monospace; font-size:13pt; color:#7ec8ff; font-weight:700; }
    .shal { font-size:7pt; color:rgba(255,255,255,.35); text-align:right; }
    .sub-grid { display:grid; grid-template-columns:1fr 1fr; gap:7px; }
    .sub-card { background:#f8f9fa; padding:9px; border-top:3px solid #4a90d9;
                -webkit-print-color-adjust:exact; print-color-adjust:exact; }
    .sub-card.state { border-top-color:#2d8c5a; }
    .sub-card h4 { font-size:7pt; text-transform:uppercase; letter-spacing:.35px;
                   color:#6c757d; margin-bottom:5px; }
    .sr  { display:flex; justify-content:space-between; padding:2.5px 0;
           border-bottom:1px dashed #e9ecef; font-size:8.5pt; }
    .sr:last-child { border-bottom:none; }
    .sr .sv2 { font-weight:600; color:#2d8c5a; }

    /* ── NET METERING ── */
    .tgrid { display:grid; grid-template-columns:1fr 1fr; gap:9px; }
    .tcard { background:#f8f9fa; padding:10px;
             -webkit-print-color-adjust:exact; print-color-adjust:exact; }
    .tcard h4 { font-family:'Playfair Display',serif; font-size:9pt; color:#0f2744;
                margin-bottom:6px; padding-bottom:3px; border-bottom:2px solid #c8933a; }
    .tr2 { display:flex; justify-content:space-between; padding:2.5px 0;
           border-bottom:1px solid #d7d7d7; font-size:8.5pt; flex-wrap:wrap; gap:2px; }
    .tr2:last-child { border-bottom:none; }
    .tr2 .rate { font-family:'Space Mono',monospace; font-size:7.5pt;
                 font-weight:700; color:#0f2744; text-align:right; max-width:55%; word-break:break-word; }

    /* ── FINANCIAL ── */
    .fcards { display:grid; grid-template-columns:repeat(4,1fr); gap:8px; margin-bottom:12px; }
    .ft { width:100%; border-collapse:collapse; font-size:9pt; }
    .ft th { background:#e9ecef; color:#0f2744; padding:6px 9px; text-align:right;
             font-size:8pt; text-transform:uppercase; letter-spacing:.3px;
             -webkit-print-color-adjust:exact; print-color-adjust:exact; }
    .ft th:first-child { text-align:left; }
    .ft td { padding:5px 9px; border-bottom:1px solid #e9ecef; text-align:right; font-size:9pt; }
    .ft td:first-child { text-align:left; font-weight:500; }
    .ft td.m { font-family:'Space Mono',monospace; font-size:8.5pt; }
    .ft td.pos { color:#2d8c5a; font-weight:700; }

    /* ── T&C ── */
    .tnc-l { display:flex; flex-direction:column; gap:3px; }
    .tnc-i { display:flex; gap:7px; font-size:8.5pt; color:#495057; line-height:1.5;
             padding:3px 0; border-bottom:1px dashed #e9ecef; }
    .tnc-i:last-child { border-bottom:none; }
    .tnc-n { font-family:'Space Mono',monospace; font-size:7.5pt; color:#adb5bd;
             min-width:20px; padding-top:1px; }

    /* ── PRICE BOX ── */
    .pbox { -webkit-print-color-adjust:exact; print-color-adjust:exact; }

    /* ── SIG & FOOTER ── */
    .sig  { padding:16px 26px; display:flex; justify-content:space-between;
            align-items:flex-end; border-top:2px solid #e9ecef; }
    .qfoot { padding:8px 26px; background:#0f2744; display:flex;
             justify-content:space-between; align-items:center; flex-wrap:wrap; gap:5px;
             -webkit-print-color-adjust:exact; print-color-adjust:exact; }

    /* ── UTILITY ── */
    .fcard { -webkit-print-color-adjust:exact; print-color-adjust:exact; }
    .nm-box { -webkit-print-color-adjust:exact; print-color-adjust:exact; }
    .sub-hl { -webkit-print-color-adjust:exact; print-color-adjust:exact; }
    .alert  { border-radius:5px; padding:8px 11px; font-size:8.5pt;
              display:flex; align-items:flex-start; gap:7px; }
    .ai { background:#e8f4fd; border-left:3px solid #4a90d9; color:#1a5276;
          -webkit-print-color-adjust:exact; print-color-adjust:exact; }

    /* ════════════════════════════════════════
       PRINT-SPECIFIC RULES
       These control page breaks in the PDF
       ════════════════════════════════════════ */
    @page {
      size: A4;
      margin: 10mm 12mm;
    }

    @media print {
      * { -webkit-print-color-adjust:exact!important; print-color-adjust:exact!important; }

      body { font-size:10pt; }

      /* ── Cover always its own page ── */
      .qcov {
        page-break-after: always;
        break-after: page;
      }

      /* ── Each section stays together — NO splits ── */
      .qs {
        page-break-inside: avoid !important;
        break-inside:      avoid !important;
        orphans: 4;
        widows:  4;
      }

      /* ── Large sections can span pages (they're too big for one page) ── */
      .qs[data-sec="bom"],
      .qs[data-sec="tnc"],
      .qs[data-sec="financial"],
      .qs[data-sec="solar-info"] {
        page-break-inside: auto !important;
        break-inside:      auto !important;
      }

      /* ── Rows in tables stay together ── */
      tr     { page-break-inside: avoid!important; break-inside: avoid!important; }
      thead  { display: table-header-group!important; }
      tfoot  { display: table-footer-group!important; }

      /* ── Section heading always stays with first content line ── */
      .qsh { page-break-after: avoid!important; break-after: avoid!important; }

      /* ── Keep signature + footer together ── */
      .sig   { page-break-inside: avoid!important; break-inside: avoid!important; }
      .qfoot { page-break-inside: avoid!important; break-inside: avoid!important; }

      /* ── These small blocks never split ── */
      .scards, .pgrid, .cgrid, .sub-grid, .tgrid,
      .fcards, .sub-hero, .pbox, .sub-hl, .cov-pills,
      .cov-hdr, .cov-body { 
        page-break-inside: avoid!important; 
        break-inside:      avoid!important; 
      }

      /* ── No decoration ── */
      .qd { box-shadow: none!important; }
    }
  `;

  // ── Open print window ────────────────────────────────────────
  const win = window.open('', '_blank', 'width=860,height=700,scrollbars=yes');
  if (!win) {
    alert('⚠️ Pop-up blocked!\n\nPlease allow pop-ups for this site:\n1. Click the pop-up icon in your browser address bar\n2. Select "Always allow"\n3. Click "Download as PDF" again');
    return;
  }

  win.document.write(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${filename}</title>
<style>${CSS}</style>
</head>
<body>
<div class="qd">${docHtml}</div>
<script>
  // Auto-print after fonts load
  document.fonts.ready.then(function() {
    setTimeout(function() {
      window.focus();
      window.print();
    }, 800);
  });
<\/script>
</body>
</html>`);

  win.document.close();
}
