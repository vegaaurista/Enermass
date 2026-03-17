import { useState } from 'react';
import { useApp } from '../store/AppContext';
import { PageHeader, Card, Field, inputCls, Btn, Alert, TableWrap, thCls, tdCls, Badge, Modal } from '../components/UI';
import { DEF_BOM } from '../data/defaults';

const CATS = ['A. Solar PV Modules','B. Inverter','C. Module Mounting Structure','D. DC Electrical','E. AC Electrical & Protection','F. Battery Bank','G. Metering & Monitoring','H. Civil & Installation','I. Documentation & Liaison','Other'];

const QTY_BASIS_OPTIONS = [
  { value: 'panel_count', label: 'Panel Count (kWp÷Wp)' },
  { value: 'capacity', label: '= Capacity kWp' },
  { value: 'battery_kwh', label: '= Battery kWh' },
  { value: 'fixed_1', label: 'Fixed: 1' },
  { value: 'fixed_2', label: 'Fixed: 2' },
  { value: 'fixed_3', label: 'Fixed: 3' },
  { value: 'cable_dc', label: 'DC Cable (cap×8 m)' },
  { value: 'cable_ac', label: 'AC Cable (cap×5 m)' },
  { value: 'custom', label: 'Custom per kWp' },
];

export default function BOM() {
  const { getBOM, notify, LS } = useApp();
  const [items, setItems] = useState(getBOM());
  const [modal, setModal] = useState({ open: false, idx: -1, data: { cat: CATS[0], sys: 'all', qb: 'fixed_1' } });

  const save = () => {
    const d = modal.data;
    if (!d.desc?.trim()) { notify('Description required', 'e'); return; }
    const updated = [...items];
    const item = { cat: d.cat, sys: d.sys, desc: d.desc, spec: d.spec || '', unit: d.unit || '', qb: d.qb, cq: +d.cq || 1 };
    if (modal.idx >= 0) updated[modal.idx] = item; else updated.push(item);
    setItems(updated); LS.s('eps_bom', updated);
    setModal({ open: false, idx: -1, data: { cat: CATS[0], sys: 'all', qb: 'fixed_1' } });
    notify(modal.idx >= 0 ? 'Updated' : 'Added');
  };

  const del = (i) => {
    if (!confirm('Delete?')) return;
    const updated = items.filter((_, idx) => idx !== i);
    setItems(updated); LS.s('eps_bom', updated);
  };

  const reset = () => {
    if (!confirm('Reset BOM to defaults?')) return;
    setItems(DEF_BOM); LS.s('eps_bom', DEF_BOM);
    notify('BOM reset');
  };

  const setD = (k, v) => setModal(m => ({ ...m, data: { ...m.data, [k]: v } }));

  const sysVariant = (sys) => sys === 'hybrid' ? 'green' : sys === 'ongrid' ? 'gold' : 'navy';

  return (
    <div className="animate-fade-in">
      <PageHeader icon="📦" title="BOM Products" sub="No prices in proposal – only description, spec, qty, unit.">
        <Btn variant="outline" size="sm" onClick={reset}>↺ Reset Default</Btn>
        <Btn variant="primary" size="sm" onClick={() => setModal({ open: true, idx: -1, data: { cat: CATS[0], sys: 'all', qb: 'fixed_1' } })}>+ Add Item</Btn>
      </PageHeader>

      <Alert type="warn">⚠️ Quantities auto-calculated. Mark "Hybrid Only" for battery items.</Alert>

      <Card noPad>
        <TableWrap>
          <thead><tr>
            {['Cat.','Description','Specification','Unit','Qty Basis','System','Actions'].map(h => <th key={h} className={thCls}>{h}</th>)}
          </tr></thead>
          <tbody>
            {items.map((x, i) => (
              <tr key={i} className="hover:bg-[#f8f9fa] transition-colors">
                <td className={tdCls}><Badge variant="navy">{(x.cat || '').split('.')[0]}</Badge></td>
                <td className={tdCls + ' font-semibold text-sm max-w-[180px]'}>{x.desc}</td>
                <td className={tdCls + ' text-xs text-[#6c757d] max-w-[200px]'}>{x.spec}</td>
                <td className={tdCls}>{x.unit}</td>
                <td className={tdCls}><Badge variant="gold">{x.qb}</Badge></td>
                <td className={tdCls}><Badge variant={sysVariant(x.sys)}>{x.sys === 'all' ? 'All' : x.sys}</Badge></td>
                <td className={tdCls}>
                  <div className="flex gap-1">
                    <Btn variant="outline" size="xs" onClick={() => setModal({ open: true, idx: i, data: { ...x } })}>✏️</Btn>
                    <Btn variant="danger" size="xs" onClick={() => del(i)}>🗑</Btn>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
      </Card>

      <Modal open={modal.open} onClose={() => setModal({ open: false, idx: -1, data: { cat: CATS[0], sys: 'all', qb: 'fixed_1' } })} title={modal.idx >= 0 ? 'Edit BOM Item' : 'Add BOM Item'} maxW="max-w-2xl">
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Field label="Category">
            <select className={inputCls} value={modal.data.cat || CATS[0]} onChange={e => setD('cat', e.target.value)}>
              {CATS.map(c => <option key={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="System">
            <select className={inputCls} value={modal.data.sys || 'all'} onChange={e => setD('sys', e.target.value)}>
              <option value="all">All Systems</option>
              <option value="ongrid">On-Grid Only</option>
              <option value="hybrid">Hybrid Only</option>
            </select>
          </Field>
          <Field label="Description" span={2}>
            <input className={inputCls} value={modal.data.desc || ''} onChange={e => setD('desc', e.target.value)} placeholder="Item description" />
          </Field>
          <Field label="Specification" span={2}>
            <input className={inputCls} value={modal.data.spec || ''} onChange={e => setD('spec', e.target.value)} placeholder="Technical specifications" />
          </Field>
          <Field label="Unit">
            <input className={inputCls} value={modal.data.unit || ''} onChange={e => setD('unit', e.target.value)} placeholder="Nos, Lot, Meters, Set" />
          </Field>
          <Field label="Qty Basis">
            <select className={inputCls} value={modal.data.qb || 'fixed_1'} onChange={e => setD('qb', e.target.value)}>
              {QTY_BASIS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </Field>
          {modal.data.qb === 'custom' && (
            <Field label="Qty per kWp">
              <input className={inputCls} type="number" value={modal.data.cq || 1} step="0.1" onChange={e => setD('cq', e.target.value)} />
            </Field>
          )}
        </div>
        <div className="flex gap-2">
          <Btn variant="primary" onClick={save}>💾 Save</Btn>
          <Btn variant="outline" onClick={() => setModal({ open: false, idx: -1, data: { cat: CATS[0], sys: 'all', qb: 'fixed_1' } })}>Cancel</Btn>
        </div>
      </Modal>
    </div>
  );
}
