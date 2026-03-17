import { useState, useEffect, useCallback } from 'react';
import { useApp } from './store/AppContext';
import Navbar from './components/Navbar';
import { Notification } from './components/UI';
import Dashboard from './screens/Dashboard';
import Company from './screens/Company';
import Settings from './screens/Settings';
import BOM from './screens/BOM';
import TNC from './screens/TNC';
import Saved from './screens/Saved';
import QuotForm from './screens/QuotForm';
import Preview from './screens/Preview';
import { buildDoc } from './utils/docBuilder';
import { SD, DEFAULT_BRANCHES } from './data/defaults';
import { mGen, aGen, fmtD, getRefNo } from './utils/helpers';

export default function App() {
  const { state, nav, notify, getCo, saveCo, getBOM, getTNC, getSaved, getSettings, LS } = useApp();
  const [lastD, setLastD] = useState(null);
  const [docHtml, setDocHtml] = useState('');
  const [editData, setEditData] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const newForm = useCallback(() => {
    if (!confirm('Clear all form fields and start fresh?')) return;
    setEditData(null);
    setEditingId(null);
    nav('quotform');
    notify('Form reset', 'i');
  }, [nav, notify]);

  useEffect(() => {
    const handler = () => newForm();
    window.addEventListener('newform', handler);
    return () => window.removeEventListener('newform', handler);
  }, [newForm]);

  const recalcD = useCallback((D) => {
    const sd = SD[D.state];
    const enriched = { ...D };
    enriched.sd = sd;
    enriched.co = getCo();
    enriched.fromAddr = (enriched.co.branches || {})[D.state] || DEFAULT_BRANCHES[D.state] || enriched.co.addr || '';
    enriched.pricePaid = enriched.price || 0;
    enriched.totalProj = (enriched.price || 0) + (enriched.addCostAmt || 0);
    enriched.taxableVal = enriched.totalProj / 1.089;
    enriched.totalGST = enriched.totalProj - enriched.taxableVal;
    enriched.commit = enriched.totalProj - (enriched.tsub || 0);
    enriched.mgen = mGen(enriched.cap);
    enriched.agen = aGen(enriched.cap);
    enriched.mexport = Math.max(0, enriched.mgen - enriched.cons);
    const s = getSettings();
    const exportRate = (s.nmExport || {})[D.state] || sd.exportRate;
    enriched.exportRate = exportRate;
    enriched.annSave = enriched.agen * enriched.tariff;
    enriched.annExport = enriched.mexport * 12 * exportRate;
    enriched.annBen = enriched.annSave + enriched.annExport;
    enriched.payback = enriched.annBen > 0 ? (enriched.commit / enriched.annBen).toFixed(1) : 0;
    let c25 = 0;
    for (let y = 1; y <= 25; y++) c25 += enriched.annBen * Math.pow(1 + sd.tariffEsc / 100, y - 1) * Math.pow(0.995, y);
    enriched.cum25 = c25;
    enriched.roi25 = enriched.commit > 0 ? ((c25 - enriched.commit) / enriched.commit * 100).toFixed(1) : 0;
    enriched.bom = getBOM();
    enriched.tnc = getTNC();
    enriched.qdateStr = fmtD(enriched.qdate);
    enriched.duedateStr = fmtD(enriched.duedate);
    enriched.lbody = LS.g('eps_lbody', '');
    return enriched;
  }, [getCo, getBOM, getTNC, getSettings, LS]);

  const handleGenerate = useCallback((formData) => {
    const D = recalcD({ ...formData });

    // Save proposal
    const saved = getSaved();
    if (editingId) {
      const idx = saved.findIndex(x => x.id === editingId);
      if (idx >= 0) {
        saved[idx] = { ...saved[idx], data: D, custname: D.cust, cap: D.cap, date: D.qdate, ptype: D.ptype, refno: D.refno, sal: D.sal };
        LS.s('eps_saved', saved);
        notify('✅ Proposal updated');
      }
      setEditingId(null);
    } else {
      const co = getCo();
      const num = +(co.num || 1);
      co.num = num + 1;
      saveCo(co);
      const id = Date.now().toString(36);
      saved.push({ id, refno: D.refno, baseRef: D.refno, revision: 0, custname: D.cust, cap: D.cap, date: D.qdate, ptype: D.ptype, sal: D.sal, data: D });
      LS.s('eps_saved', saved);
      notify('✅ Proposal saved!');
    }

    const html = buildDoc(D);
    setLastD(D);
    setDocHtml(html);
    nav('preview');
  }, [recalcD, getSaved, editingId, getCo, saveCo, LS, notify, nav]);

  const viewSaved = useCallback((id) => {
    const q = getSaved().find(x => x.id === id);
    if (!q) return;
    const D = recalcD({ ...q.data });
    const html = buildDoc(D);
    setLastD(D);
    setDocHtml(html);
    nav('preview');
  }, [getSaved, recalcD, nav]);

  const editSaved = useCallback((id) => {
    const q = getSaved().find(x => x.id === id);
    if (!q) return;
    setEditingId(id);
    setEditData({ ...q.data });
    nav('quotform');
    notify('Loaded for editing', 'i');
  }, [getSaved, nav, notify]);

  const reviseSaved = useCallback((id) => {
    const saved = getSaved();
    const q = saved.find(x => x.id === id);
    if (!q) return;
    const baseRef = q.baseRef || q.refno;
    const allRevs = saved.filter(x => (x.baseRef || x.refno) === baseRef);
    const maxRev = Math.max(...allRevs.map(x => x.revision || 0));
    const newRev = maxRev + 1;
    const newRefno = `${baseRef} – R${newRev}`;
    const newId = Date.now().toString(36) + 'r';
    const newD = { ...q.data, refno: newRefno };
    saved.push({ id: newId, refno: newRefno, baseRef, revision: newRev, custname: q.custname, cap: q.cap, date: new Date().toISOString().split('T')[0], ptype: q.ptype, sal: q.sal, data: newD });
    LS.s('eps_saved', saved);
    notify(`Revision R${newRev} created`, 'i');
    setEditingId(newId);
    setEditData({ ...newD });
    nav('quotform');
  }, [getSaved, LS, notify, nav]);

  const deleteSaved = useCallback((id) => {
    if (!confirm('Delete this saved proposal?')) return;
    const saved = getSaved().filter(x => x.id !== id);
    LS.s('eps_saved', saved);
    notify('Deleted', 'i');
    // Force re-render of Saved screen by naivigating away and back
    nav('dashboard');
    setTimeout(() => nav('saved'), 50);
  }, [getSaved, LS, notify, nav]);

  const screen = state.screen;

  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#f1f4f8' }}>
      <Navbar onNewForm={newForm} />
      <Notification />
      <main className="flex-1 overflow-y-auto px-4 py-5 md:px-6 md:py-6">
        <div className="max-w-6xl mx-auto">
          {screen === 'dashboard' && <Dashboard onNewForm={newForm} />}
          {screen === 'company'   && <Company />}
          {screen === 'settings'  && <Settings />}
          {screen === 'bom'       && <BOM />}
          {screen === 'tnc'       && <TNC />}
          {screen === 'saved'     && <Saved onView={viewSaved} onEdit={editSaved} onRevise={reviseSaved} onDelete={deleteSaved} />}
          {screen === 'quotform'  && <QuotForm onGenerate={handleGenerate} editData={editData} key={editingId || 'new'} />}
          {screen === 'preview'   && <Preview D={lastD} docHtml={docHtml} />}
        </div>
      </main>
    </div>
  );
}
