import { useState, useEffect } from 'react';
import { useApp } from '../store/AppContext';
import { Btn, Alert } from '../components/UI';
import { exportToPDF } from '../utils/pdfExport';

export default function Preview({ D, docHtml }) {
  const { nav, notify } = useApp();
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress]   = useState('');

  useEffect(() => {
    const el = document.getElementById('q-doc');
    if (el && docHtml) el.innerHTML = docHtml;
  }, [docHtml]);

  const handlePDF = async () => {
    if (!D) { notify('Generate a proposal first', 'e'); return; }
    setExporting(true);
    setProgress('Measuring sections…');
    notify('⏳ Generating PDF — please wait 15–20 seconds…', 'i');
    try {
      setProgress('Rendering pages…');
      await exportToPDF('q-doc', D);
      notify('✅ PDF downloaded!');
    } catch (e) {
      console.error(e);
      notify('PDF export failed. Please try again.', 'e');
    } finally {
      setExporting(false);
      setProgress('');
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3 bg-white rounded-2xl px-5 py-4 shadow-card border border-[#e9ecef]/60">
        <div>
          <h2 className="text-lg font-bold text-[#0f2744] flex items-center gap-2"
            style={{ fontFamily: 'Outfit, sans-serif' }}>
            📄 Solar Power Plant Proposal
          </h2>
          <p className="text-sm text-[#6c757d] mt-0.5">
            {D ? `${D.refno} · ${D.sal} ${D.cust}` : 'No proposal generated yet'}
          </p>
        </div>
        <div className="flex gap-2.5 flex-wrap items-center">
          <Btn variant="outline" onClick={() => nav('quotform')}>← Edit</Btn>
          <Btn
            variant="sky"
            onClick={handlePDF}
            disabled={exporting || !D}
            className={exporting ? 'opacity-75 cursor-wait' : ''}
          >
            {exporting
              ? <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  {progress || 'Generating PDF…'}
                </span>
              : '⬇️ Download as PDF'
            }
          </Btn>
        </div>
      </div>

      {exporting && (
        <div className="mb-4 bg-[#fdf3e3] border border-[#c8933a]/30 rounded-xl px-4 py-3 text-sm text-[#7d5000]">
          ⏳ <strong>Generating PDF…</strong> This takes 15–20 seconds. Please do not close this window.
          Each section is being rendered individually to ensure perfect quality with no blank spaces.
        </div>
      )}

      {!D && (
        <Alert type="warn">⚠️ No proposal generated yet. Fill out the form and click "Generate Proposal".</Alert>
      )}

      <div className="qdw">
        <div className="qd" id="q-doc" />
      </div>

      {D && (
        <div className="mt-6 flex justify-center gap-3 pb-6">
          <Btn variant="outline" onClick={() => nav('quotform')}>← Back to Edit</Btn>
          <Btn variant="sky" onClick={handlePDF} disabled={exporting}>
            {exporting ? '⏳ Generating…' : '⬇️ Download as PDF'}
          </Btn>
          <Btn variant="outline" onClick={() => nav('saved')}>📂 Saved Proposals</Btn>
        </div>
      )}
    </div>
  );
}
