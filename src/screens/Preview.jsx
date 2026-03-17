import { useState } from 'react';
import { useApp } from '../store/AppContext';
import { Btn, Alert } from '../components/UI';
import { exportToPDF } from '../utils/pdfExport';

export default function Preview({ D, docHtml }) {
  const { nav, notify } = useApp();
  const [printing, setPrinting] = useState(false);

  // Inject HTML after mount
  const injectDoc = (el) => {
    if (el && docHtml) el.innerHTML = docHtml;
  };

  const handlePDF = async () => {
    if (!D) { notify('Generate a proposal first', 'e'); return; }
    setPrinting(true);
    notify('📄 Opening print window…', 'i');
    try {
      await exportToPDF('q-doc', D);
      notify('✅ Print window opened — choose "Save as PDF"');
    } catch (e) {
      console.error(e);
      notify('Failed to open print window', 'e');
    } finally {
      setPrinting(false);
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3 bg-white rounded-2xl px-5 py-4 shadow-card border border-[#e9ecef]/60">
        <div>
          <h2 className="text-lg font-bold text-[#0f2744] flex items-center gap-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
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
            disabled={printing || !D}
            className={printing ? 'opacity-70 cursor-not-allowed' : ''}
          >
            {printing ? '⏳ Opening…' : '🖨 Download / Print PDF'}
          </Btn>
        </div>
      </div>

      {/* PDF instructions */}
      {D && (
        <div className="mb-4 bg-[#e8f4fd] border border-[#4a90d9]/30 rounded-xl px-4 py-3 text-sm text-[#1a5276] flex items-start gap-2">
          <span className="text-base mt-0.5">ℹ️</span>
          <div>
            <strong>How to save as PDF:</strong> Click the button above → a print window opens → 
            in the print dialog choose <strong>Destination: Save as PDF</strong> → click <strong>Save</strong>.
            <span className="block mt-1 text-xs text-[#4a90d9]">
              Make sure pop-ups are allowed for this site. The PDF will be perfectly formatted with no blank spaces.
            </span>
          </div>
        </div>
      )}

      {!D && (
        <Alert type="warn">⚠️ No proposal generated yet. Fill out the form and click "Generate Proposal".</Alert>
      )}

      {/* Document Preview */}
      <div className="qdw">
        <div className="qd" id="q-doc" ref={injectDoc} />
      </div>

      {D && (
        <div className="mt-6 flex justify-center gap-3 pb-4">
          <Btn variant="outline" onClick={() => nav('quotform')}>← Back to Edit</Btn>
          <Btn variant="sky" onClick={handlePDF} disabled={printing}>
            {printing ? '⏳ Opening…' : '🖨 Download / Print PDF'}
          </Btn>
          <Btn variant="outline" onClick={() => nav('saved')}>📂 Saved Proposals</Btn>
        </div>
      )}
    </div>
  );
}
