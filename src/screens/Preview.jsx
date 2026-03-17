import { useState, useEffect } from 'react';
import { useApp } from '../store/AppContext';
import { Btn, Alert } from '../components/UI';
import { exportToPDF } from '../utils/pdfExport';

export default function Preview({ D, docHtml }) {
  const { nav, notify } = useApp();
  const [exporting, setExporting] = useState(false);

  // Inject HTML into the doc container after mount/update
  useEffect(() => {
    const el = document.getElementById('q-doc');
    if (el && docHtml) el.innerHTML = docHtml;
  }, [docHtml]);

  const handlePDF = async () => {
    if (!D) { notify('Generate a proposal first', 'e'); return; }
    setExporting(true);
    notify('⏳ Preparing PDF… this may take a moment', 'i');
    try {
      await exportToPDF('q-doc', D);
      notify('✅ PDF downloaded!');
    } catch (e) {
      console.error(e);
      notify('PDF export failed. Please try again.', 'e');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3 bg-white rounded-2xl px-5 py-3.5 shadow-card border border-[#e9ecef]/60">
        <div>
          <h2 className="text-lg font-bold text-[#0f2744] flex items-center gap-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
            📄 Solar Power Plant Proposal
          </h2>
          <p className="text-sm text-[#6c757d] mt-0.5">
            {D ? `Reference: ${D.refno} · ${D.cust}` : 'Reference: —'}
          </p>
        </div>
        <div className="flex gap-2.5 flex-wrap">
          <Btn variant="outline" onClick={() => nav('quotform')}>← Edit</Btn>
          <Btn
            variant="sky"
            onClick={handlePDF}
            disabled={exporting || !D}
            className={`gap-2 ${exporting ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {exporting
              ? <><span className="inline-block animate-spin">⏳</span> Preparing…</>
              : <>⬇️ Download as PDF</>
            }
          </Btn>
        </div>
      </div>

      {!D && (
        <Alert type="warn">⚠️ No proposal generated yet. Fill out the form and click "Generate Proposal".</Alert>
      )}

      {/* Document Wrapper */}
      <div className="qdw">
        <div className="qd" id="q-doc" />
      </div>

      {/* Bottom action bar */}
      {D && (
        <div className="mt-6 flex justify-center gap-3 pb-4">
          <Btn variant="outline" onClick={() => nav('quotform')}>← Back to Edit</Btn>
          <Btn
            variant="sky"
            onClick={handlePDF}
            disabled={exporting}
            className={exporting ? 'opacity-70 cursor-not-allowed' : ''}
          >
            {exporting ? '⏳ Preparing…' : '⬇️ Download as PDF'}
          </Btn>
          <Btn variant="outline" onClick={() => nav('saved')}>📂 View Saved</Btn>
        </div>
      )}
    </div>
  );
}
