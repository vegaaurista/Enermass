import { useState, useEffect } from 'react';
import { useApp } from '../store/AppContext';
import { PageHeader, Card, CardTitle, Field, inputCls, Btn, Alert, Tabs, Modal, TableWrap, thCls, tdCls, Divider } from '../components/UI';
import { STATES, SL, SD, DEF_SETTINGS } from '../data/defaults';

export default function Settings() {
  const { getSettings, getPanels, getInvs, getSalesExecs, getLbody, notify, LS, dispatch } = useApp();
  const [tab, setTab] = useState('panels');
  const [settings, setSettings] = useState({ ...DEF_SETTINGS, ...getSettings() });
  const [panels, setPanels] = useState(getPanels());
  const [invs, setInvs] = useState(getInvs());
  const [salesExecs, setSalesExecs] = useState(getSalesExecs());
  const [lbody, setLbody] = useState(getLbody() || '');
  const [panelModal, setPanelModal] = useState({ open: false, idx: -1, data: {} });
  const [invModal, setInvModal] = useState({ open: false, idx: -1, data: {} });
  const [salesModal, setSalesModal] = useState({ open: false, idx: -1, data: {} });

  const tabs = [
    { id: 'panels', label: '☀️ Solar Panels' },
    { id: 'inverters', label: '⚡ Inverters' },
    { id: 'subsidy', label: '🏛 Subsidy' },
    { id: 'nm', label: '🔄 Net Metering' },
    { id: 'sales', label: '👤 Sales Team' },
    { id: 'letter', label: '✉️ Intro Letter' },
  ];

  const saveSettings = () => {
    const s = { ...settings };
    STATES.forEach(st => {
      const sn = document.getElementById('ss-sn-' + st);
      const nm = document.getElementById('ss-nm-' + st);
      const ex = document.getElementById('ss-ex-' + st);
      s.subNotes = s.subNotes || {};
      s.nmNotes = s.nmNotes || {};
      s.nmExport = s.nmExport || {};
      if (sn) s.subNotes[st] = sn.value;
      if (nm) s.nmNotes[st] = nm.value;
      if (ex) s.nmExport[st] = +ex.value || SD[st].exportRate;
    });
    LS.s('eps_settings', s);
    notify('✅ Settings saved!');
  };

  const savePanels = () => { LS.s('eps_panels', panels); notify('Panels saved'); };
  const saveInvs = () => { LS.s('eps_inv', invs); notify('Inverters saved'); };
  const saveLetter = () => { LS.s('eps_lbody', lbody); notify('✅ Letter saved!'); };

  const savePanel = () => {
    const { idx, data } = panelModal;
    if (!data.brand || !data.wp) { notify('Brand and Wp required', 'e'); return; }
    const updated = [...panels];
    if (idx >= 0) updated[idx] = data; else updated.push(data);
    setPanels(updated); LS.s('eps_panels', updated);
    setPanelModal({ open: false, idx: -1, data: {} });
    notify(idx >= 0 ? 'Panel updated' : 'Panel added');
  };

  const delPanel = (i) => {
    if (!confirm('Delete?')) return;
    const updated = panels.filter((_, idx) => idx !== i);
    setPanels(updated); LS.s('eps_panels', updated);
  };

  const saveInv = () => {
    const { idx, data } = invModal;
    if (!data.brand) { notify('Brand required', 'e'); return; }
    const updated = [...invs];
    if (idx >= 0) updated[idx] = data; else updated.push(data);
    setInvs(updated); LS.s('eps_inv', updated);
    setInvModal({ open: false, idx: -1, data: {} });
    notify(idx >= 0 ? 'Inverter updated' : 'Inverter added');
  };

  const delInv = (i) => {
    if (!confirm('Delete?')) return;
    const updated = invs.filter((_, idx) => idx !== i);
    setInvs(updated); LS.s('eps_inv', updated);
  };

  const saveSalesExec = () => {
    const { idx, data } = salesModal;
    if (!data.name) { notify('Name required', 'e'); return; }
    const updated = [...salesExecs];
    const item = { name: data.name, desig: data.desig || 'Sales Executive', phone: data.phone || '', email: data.email || '' };
    if (idx >= 0) updated[idx] = item; else updated.push(item);
    setSalesExecs(updated); LS.s('eps_sales', updated);
    setSalesModal({ open: false, idx: -1, data: {} });
    notify(idx >= 0 ? 'Updated' : 'Executive added');
  };

  const delSalesExec = (i) => {
    if (!confirm('Delete?')) return;
    const updated = salesExecs.filter((_, idx) => idx !== i);
    setSalesExecs(updated); LS.s('eps_sales', updated);
  };

  const loaded = getSettings();

  return (
    <div className="animate-fade-in">
      <PageHeader icon="⚙️" title="Settings" sub="Solar panels, inverters, subsidy & net metering master data for proposals.">
        <Btn variant="gold" onClick={saveSettings}>💾 Save Settings</Btn>
      </PageHeader>

      <Card>
        <Tabs tabs={tabs} active={tab} onChange={setTab} />

        {/* PANELS TAB */}
        {tab === 'panels' && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-[#6c757d]">Panel options drive dropdowns in the proposal form. Panel count = kWp × 1000 ÷ Wp.</p>
              <Btn variant="primary" size="sm" onClick={() => setPanelModal({ open: true, idx: -1, data: {} })}>+ Add Panel</Btn>
            </div>
            <TableWrap>
              <thead><tr>
                {['#','Brand','Capacity (Wp)','Technology','Actions'].map(h => <th key={h} className={thCls}>{h}</th>)}
              </tr></thead>
              <tbody>
                {panels.map((p, i) => (
                  <tr key={i} className="hover:bg-[#f8f9fa] transition-colors">
                    <td className={tdCls + ' text-[#adb5bd]'}>{i+1}</td>
                    <td className={tdCls + ' font-semibold'}>{p.brand}</td>
                    <td className={tdCls}>{p.wp} Wp</td>
                    <td className={tdCls + ' text-xs text-[#6c757d]'}>{p.tech}</td>
                    <td className={tdCls}>
                      <div className="flex gap-1">
                        <Btn variant="outline" size="xs" onClick={() => setPanelModal({ open: true, idx: i, data: { ...p } })}>✏️</Btn>
                        <Btn variant="danger" size="xs" onClick={() => delPanel(i)}>🗑</Btn>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
          </div>
        )}

        {/* INVERTERS TAB */}
        {tab === 'inverters' && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-[#6c757d]">Inverter options drive dropdowns in the proposal form.</p>
              <Btn variant="primary" size="sm" onClick={() => setInvModal({ open: true, idx: -1, data: {} })}>+ Add Inverter</Btn>
            </div>
            <TableWrap>
              <thead><tr>
                {['#','Brand','Capacity','Type / Spec','Actions'].map(h => <th key={h} className={thCls}>{h}</th>)}
              </tr></thead>
              <tbody>
                {invs.map((v, i) => (
                  <tr key={i} className="hover:bg-[#f8f9fa] transition-colors">
                    <td className={tdCls + ' text-[#adb5bd]'}>{i+1}</td>
                    <td className={tdCls + ' font-semibold'}>{v.brand}</td>
                    <td className={tdCls}>{v.cap}</td>
                    <td className={tdCls + ' text-xs text-[#6c757d]'}>{v.type}</td>
                    <td className={tdCls}>
                      <div className="flex gap-1">
                        <Btn variant="outline" size="xs" onClick={() => setInvModal({ open: true, idx: i, data: { ...v } })}>✏️</Btn>
                        <Btn variant="danger" size="xs" onClick={() => delInv(i)}>🗑</Btn>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
          </div>
        )}

        {/* SUBSIDY TAB */}
        {tab === 'subsidy' && (
          <div>
            <Alert type="info">ℹ️ MNRE CFA = 30,000×min(S,2) + 18,000×max(0,min(S−2,1)). Residential only.</Alert>
            <div className="grid grid-cols-2 gap-3 mb-5">
              {[['CFA – Up to 2 kW (₹/kW)', 'c2'], ['CFA – 2–3 kW incremental (₹/kW)', 'c3'], ['Max CFA Individual (₹)', 'cmax'], ['Housing Society Rate (₹/kW)', 'crwa']].map(([lbl, key]) => (
                <Field key={key} label={lbl}>
                  <input className={inputCls} type="number" value={settings[key] || ''} onChange={e => setSettings(s => ({ ...s, [key]: +e.target.value }))} />
                </Field>
              ))}
            </div>
            <div className="font-bold text-[#0f2744] text-sm mb-3">State Subsidy Notes</div>
            <div className="flex flex-col gap-3">
              {STATES.map(st => (
                <Field key={st} label={`${SL[st]} – Subsidy Note`}>
                  <textarea id={`ss-sn-${st}`} rows={2} className={inputCls} defaultValue={(loaded.subNotes || {})[st] || ''} style={{ resize: 'vertical' }} />
                </Field>
              ))}
            </div>
          </div>
        )}

        {/* NET METERING TAB */}
        {tab === 'nm' && (
          <div>
            <Alert type="info">ℹ️ Edit export rates and net metering notes per state.</Alert>
            <div className="flex flex-col gap-4">
              {STATES.map(st => (
                <div key={st} className="bg-[#f8f9fa] rounded-xl p-4 border border-[#e9ecef]">
                  <div className="font-bold text-[#0f2744] text-sm mb-3">{SL[st]}</div>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Export Rate (₹/unit)">
                      <input id={`ss-ex-${st}`} type="number" className={inputCls} defaultValue={(loaded.nmExport || {})[st] || SD[st].exportRate} step="0.01" />
                    </Field>
                    <Field label="Net Metering Note">
                      <textarea id={`ss-nm-${st}`} rows={2} className={inputCls} defaultValue={(loaded.nmNotes || {})[st] || ''} style={{ resize: 'vertical' }} />
                    </Field>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SALES TEAM TAB */}
        {tab === 'sales' && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-[#6c757d]">Sales executives appear in the proposal signatory section.</p>
              <Btn variant="primary" size="sm" onClick={() => setSalesModal({ open: true, idx: -1, data: { desig: 'Sales Executive' } })}>+ Add Executive</Btn>
            </div>
            <TableWrap>
              <thead><tr>
                {['#','Name','Designation','Phone','Email','Actions'].map(h => <th key={h} className={thCls}>{h}</th>)}
              </tr></thead>
              <tbody>
                {salesExecs.map((x, i) => (
                  <tr key={i} className="hover:bg-[#f8f9fa] transition-colors">
                    <td className={tdCls + ' text-[#adb5bd]'}>{i+1}</td>
                    <td className={tdCls + ' font-semibold'}>{x.name}</td>
                    <td className={tdCls}>{x.desig || 'Sales Executive'}</td>
                    <td className={tdCls + ' text-xs'}>{x.phone || '—'}</td>
                    <td className={tdCls + ' text-xs'}>{x.email || '—'}</td>
                    <td className={tdCls}>
                      <div className="flex gap-1">
                        <Btn variant="outline" size="xs" onClick={() => setSalesModal({ open: true, idx: i, data: { ...x } })}>✏️</Btn>
                        <Btn variant="danger" size="xs" onClick={() => delSalesExec(i)}>🗑</Btn>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
          </div>
        )}

        {/* INTRO LETTER TAB */}
        {tab === 'letter' && (
          <div>
            <Alert type="info">ℹ️ This letter body is reused automatically in all proposals. The header (To, Date, Ref, Subject) and signatory are auto-generated.</Alert>
            <Field label="Introduction Letter Body (shared across all proposals)">
              <textarea className={inputCls} rows={12} value={lbody} onChange={e => setLbody(e.target.value)} style={{ fontSize: '.84rem', lineHeight: '1.8', resize: 'vertical' }} />
            </Field>
            <div className="mt-2 text-xs text-[#6c757d] bg-[#f8f9fa] rounded-lg px-3 py-2">
              <strong>Fixed signatory:</strong> Mr. Manoj M S | Chief Executive Officer | Enermass Power Solutions Pvt. Ltd.
            </div>
            <div className="mt-3">
              <Btn variant="gold" onClick={saveLetter}>💾 Save Letter</Btn>
            </div>
          </div>
        )}
      </Card>

      {/* Panel Modal */}
      <Modal open={panelModal.open} onClose={() => setPanelModal({ open: false, idx: -1, data: {} })} title={panelModal.idx >= 0 ? 'Edit Solar Panel' : 'Add Solar Panel Option'}>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Field label="Panel Brand">
            <input className={inputCls} value={panelModal.data.brand || ''} onChange={e => setPanelModal(m => ({ ...m, data: { ...m.data, brand: e.target.value } }))} placeholder="e.g. Waaree, Adani Solar" />
          </Field>
          <Field label="Capacity (Wp)">
            <input className={inputCls} type="number" value={panelModal.data.wp || ''} onChange={e => setPanelModal(m => ({ ...m, data: { ...m.data, wp: +e.target.value } }))} placeholder="e.g. 545, 550, 600" />
          </Field>
          <Field label="Technology / Specification" span={2}>
            <input className={inputCls} value={panelModal.data.tech || ''} onChange={e => setPanelModal(m => ({ ...m, data: { ...m.data, tech: e.target.value } }))} placeholder="e.g. Mono PERC, TOPCon, HJT – BIS Certified" />
          </Field>
        </div>
        <div className="flex gap-2">
          <Btn variant="primary" onClick={savePanel}>💾 Save</Btn>
          <Btn variant="outline" onClick={() => setPanelModal({ open: false, idx: -1, data: {} })}>Cancel</Btn>
        </div>
      </Modal>

      {/* Inverter Modal */}
      <Modal open={invModal.open} onClose={() => setInvModal({ open: false, idx: -1, data: {} })} title={invModal.idx >= 0 ? 'Edit Inverter' : 'Add Inverter Option'}>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Field label="Inverter Brand">
            <input className={inputCls} value={invModal.data.brand || ''} onChange={e => setInvModal(m => ({ ...m, data: { ...m.data, brand: e.target.value } }))} placeholder="e.g. Sungrow, Huawei, Delta" />
          </Field>
          <Field label="Capacity / Range">
            <input className={inputCls} value={invModal.data.cap || ''} onChange={e => setInvModal(m => ({ ...m, data: { ...m.data, cap: e.target.value } }))} placeholder="e.g. 10 kW, 3–10 kW" />
          </Field>
          <Field label="Type / Specification" span={2}>
            <input className={inputCls} value={invModal.data.type || ''} onChange={e => setInvModal(m => ({ ...m, data: { ...m.data, type: e.target.value } }))} placeholder="e.g. String Inverter, IP65, 5-yr warranty" />
          </Field>
        </div>
        <div className="flex gap-2">
          <Btn variant="primary" onClick={saveInv}>💾 Save</Btn>
          <Btn variant="outline" onClick={() => setInvModal({ open: false, idx: -1, data: {} })}>Cancel</Btn>
        </div>
      </Modal>

      {/* Sales Executive Modal */}
      <Modal open={salesModal.open} onClose={() => setSalesModal({ open: false, idx: -1, data: {} })} title={salesModal.idx >= 0 ? 'Edit Sales Executive' : 'Add Sales Executive'}>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Field label="Full Name" span={2}>
            <input className={inputCls} value={salesModal.data.name || ''} onChange={e => setSalesModal(m => ({ ...m, data: { ...m.data, name: e.target.value } }))} placeholder="e.g. Rahul Nair" />
          </Field>
          <Field label="Designation" span={2}>
            <input className={inputCls} value={salesModal.data.desig || 'Sales Executive'} onChange={e => setSalesModal(m => ({ ...m, data: { ...m.data, desig: e.target.value } }))} />
          </Field>
          <Field label="Phone (optional)">
            <input className={inputCls} type="tel" value={salesModal.data.phone || ''} onChange={e => setSalesModal(m => ({ ...m, data: { ...m.data, phone: e.target.value } }))} placeholder="+91-XXXXXXXXXX" />
          </Field>
          <Field label="Email (optional)">
            <input className={inputCls} type="email" value={salesModal.data.email || ''} onChange={e => setSalesModal(m => ({ ...m, data: { ...m.data, email: e.target.value } }))} placeholder="email@enermass.in" />
          </Field>
        </div>
        <div className="flex gap-2">
          <Btn variant="primary" onClick={saveSalesExec}>💾 Save</Btn>
          <Btn variant="outline" onClick={() => setSalesModal({ open: false, idx: -1, data: {} })}>Cancel</Btn>
        </div>
      </Modal>
    </div>
  );
}
