import { useState, useEffect, useCallback, useRef } from 'react';
import { useApp } from '../store/AppContext';
import { PageHeader, Card, CardTitle, Field, inputCls, roCls, roSubCls, Btn, Alert, TypeCard, Divider } from '../components/UI';
import { SD } from '../data/defaults';
import { getRefNo, calcCFA, mGen } from '../utils/helpers';

const inr = n => '₹' + Math.round(n || 0).toLocaleString('en-IN');

function calcDue(date, validity) {
  const d = new Date(date || new Date());
  d.setDate(d.getDate() + +(validity || 30));
  return d.toISOString().split('T')[0];
}

function calcPanelCount(cap, wp, padj) {
  if (!cap || !wp) return '';
  return String(Math.max(0, Math.ceil(cap * 1000 / wp) + (+padj || 0)));
}

function computeCosts(f) {
  const P = +f.price || 0;
  const addAmt = +f.addCostAmt || 0;
  const cfaVal = f.subon ? +f.cfa || 0 : 0;
  const ssubVal = f.subon ? +f.ssub || 0 : 0;
  const tsub = cfaVal + ssubVal;
  const total = P + addAmt;
  const taxable = total / 1.089;
  const gstAmt = total - taxable;
  const commit = total - tsub;
  return {
    price: Math.round(P), add: Math.round(addAmt), tot: Math.round(total),
    epc: Math.round(taxable), gst: Math.round(gstAmt), sub: Math.round(tsub), com: Math.round(commit),
  };
}

const today = new Date().toISOString().split('T')[0];

const BLANK = {
  refno: '', qdate: today, validity: '30', duedate: '',
  ptype: 'Residential', sal: 'Mr.', cust: '', phone: '', email: '', billaddr: '',
  state: 'kerala', dist: '', pin: '', site: '', discom: '', meter: '', categ: 'Residential',
  stype: 'ongrid',
  cap: 10, cons: 400, area: 1500,
  pbrand: '', pwp: '', pcount: '', padj: 0,
  inv: '',
  bkwh: 10, btype: 'LiFePO4 (Lithium Iron Phosphate)', bhrs: 4,
  price: 500000, disc: 0, tariff: 5.5,
  addCostDesc: '', addCostAmt: 0,
  subon: true, cfa: 0, ssub: 0, tsub: 0,
  sales: '',
};

export default function QuotForm({ onGenerate, editData }) {
  const { getCo, getPanels, getInvs, getSalesExecs, getSettings, notify } = useApp();
  const [form, setForm] = useState(BLANK);
  const initialised = useRef(false);

  const panels    = getPanels();
  const invs      = getInvs();
  const salesExecs = getSalesExecs();

  const brands     = [...new Set(panels.map(p => p.brand))];
  const filteredWps = form.pbrand ? panels.filter(p => p.brand === form.pbrand) : panels;
  const uniqueWps   = [...new Set(filteredWps.map(p => p.wp))];

  // Initialise once on mount
  useEffect(() => {
    if (initialised.current) return;
    initialised.current = true;

    if (editData) {
      // Load edit data
      const inv_idx = invs.findIndex(v => v.brand === (editData.inv || {}).brand);
      const sales_idx = salesExecs.findIndex(v => v.name === (editData.salesExec || {}).name);
      setForm({
        ...BLANK, ...editData,
        inv: inv_idx >= 0 ? String(inv_idx) : '',
        sales: sales_idx >= 0 ? String(sales_idx) : '',
      });
    } else {
      const co  = getCo();
      const sd  = SD['kerala'];
      const s   = getSettings();
      const cfa = calcCFA(10, 'Residential', s);
      setForm(f => ({
        ...f,
        refno:  getRefNo('kerala', co.num || 1, co.prefix || 'EPS'),
        duedate: calcDue(today, 30),
        discom: sd.discom,
        tariff: sd.avgTariff,
        cfa:    Math.round(cfa),
        tsub:   Math.round(cfa),
        pcount: calcPanelCount(10, '', 0),
      }));
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const upd = (patch) => setForm(f => ({ ...f, ...patch }));

  const onStateChange = (state) => {
    const sd  = SD[state];
    const co  = getCo();
    const ref = getRefNo(state, co.num || 1, co.prefix || 'EPS');
    upd({ state, discom: sd.discom, tariff: sd.avgTariff, refno: ref });
  };

  const onPTypeChange = (ptype) => {
    const s   = getSettings();
    const cfa = ptype === 'Commercial' ? 0 : calcCFA(+form.cap || 0, ptype, s);
    const subon = ptype !== 'Commercial';
    upd({ ptype, subon, cfa: Math.round(cfa), tsub: Math.round(cfa + (subon ? +form.ssub || 0 : 0)) });
  };

  const onCapChange = (cap) => {
    const s   = getSettings();
    const cfa = calcCFA(+cap || 0, form.ptype, s);
    upd({
      cap: +cap || 0,
      cfa: Math.round(cfa),
      tsub: Math.round(cfa + (+form.ssub || 0)),
      pcount: calcPanelCount(cap, form.pwp, form.padj),
    });
  };

  const onWpChange = (wp) => {
    upd({ pwp: wp, pcount: calcPanelCount(form.cap, wp, form.padj) });
  };

  const onPadjChange = (padj) => {
    upd({ padj, pcount: calcPanelCount(form.cap, form.pwp, padj) });
  };

  const onBrandChange = (brand) => {
    upd({ pbrand: brand, pwp: '', pcount: '' });
  };

  const onSubToggle = (checked) => {
    const s   = getSettings();
    const cfa = checked ? calcCFA(+form.cap || 0, form.ptype, s) : 0;
    upd({ subon: checked, cfa: Math.round(cfa), tsub: checked ? Math.round(cfa + (+form.ssub || 0)) : 0 });
  };

  const handleGenerate = () => {
    if (!form.cust.trim()) { notify('Customer name is required', 'e'); return; }
    const invData   = form.inv !== '' ? invs[+form.inv]     : { brand: 'As per approved make', cap: 'As per system design', type: '' };
    const salesData = form.sales !== '' ? salesExecs[+form.sales] : null;
    onGenerate({ ...form, inv: invData, salesExec: salesData });
  };

  const costs = computeCosts(form);

  return (
    <div className="animate-fade-in">
      <PageHeader icon="⚡" title="Solar Power Plant Proposal" sub="Fill all details to generate a professional proposal.">
        <Btn variant="outline" onClick={() => window.dispatchEvent(new CustomEvent('newform'))}>🔄 Reset</Btn>
        <Btn variant="gold" size="lg" onClick={handleGenerate}>🚀 Generate Proposal</Btn>
      </PageHeader>

      {/* ── Proposal Reference ── */}
      <Card className="mb-4">
        <CardTitle icon="📎">Proposal Reference</CardTitle>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Field label="Proposal No. (Auto)">
            <input className={roCls} style={{ fontFamily: 'monospace', fontWeight: 700 }} value={form.refno} readOnly />
          </Field>
          <Field label="Date">
            <input className={inputCls} type="date" value={form.qdate}
              onChange={e => upd({ qdate: e.target.value, duedate: calcDue(e.target.value, form.validity) })} />
          </Field>
          <Field label="Validity">
            <select className={inputCls} value={form.validity}
              onChange={e => upd({ validity: e.target.value, duedate: calcDue(form.qdate, e.target.value) })}>
              {['15','30','45','60','90'].map(v => <option key={v} value={v}>{v} Days</option>)}
            </select>
          </Field>
          <Field label="Valid Until" hint="Auto-calculated; editable">
            <input className={inputCls} type="date" value={form.duedate} onChange={e => upd({ duedate: e.target.value })} />
          </Field>
        </div>
      </Card>

      {/* ── Proposal Type ── */}
      <Card className="mb-4">
        <CardTitle icon="🏷">Proposal Type</CardTitle>
        <div className="grid grid-cols-2 gap-3">
          <TypeCard name="ptype" value="Residential" checked={form.ptype === 'Residential'} onChange={() => onPTypeChange('Residential')}
            title="🏠 Residential" sub="PM Surya Ghar CFA subsidy applicable." />
          <TypeCard name="ptype" value="Commercial" checked={form.ptype === 'Commercial'} onChange={() => onPTypeChange('Commercial')}
            title="🏗 Commercial / Industrial" sub="No CFA subsidy. Accelerated depreciation benefits." />
        </div>
      </Card>

      {/* ── Customer Details ── */}
      <Card className="mb-4">
        <CardTitle icon="👤">Customer Details</CardTitle>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Salutation">
            <select className={inputCls} value={form.sal} onChange={e => upd({ sal: e.target.value })}>
              {['Mr.','Mrs.','Ms.','Dr.','Er.','Prof.','M/s.'].map(s => <option key={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Customer / Organisation Name">
            <input className={inputCls} value={form.cust} onChange={e => upd({ cust: e.target.value })} placeholder="Full name or organisation" />
          </Field>
          <Field label="Phone">
            <input className={inputCls} type="tel" value={form.phone} onChange={e => upd({ phone: e.target.value })} placeholder="+91-XXXXXXXXXX" />
          </Field>
          <Field label="Email">
            <input className={inputCls} type="email" value={form.email} onChange={e => upd({ email: e.target.value })} placeholder="customer@email.com" />
          </Field>
          <Field label="Billing / Communication Address" span={2}>
            <textarea className={inputCls} rows={2} value={form.billaddr} onChange={e => upd({ billaddr: e.target.value })} style={{ resize: 'vertical' }} />
          </Field>
        </div>
      </Card>

      {/* ── State & Site ── */}
      <Card className="mb-4">
        <CardTitle icon="📍">State & Installation Site</CardTitle>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <Field label="State">
            <select className={inputCls} value={form.state} onChange={e => onStateChange(e.target.value)}>
              <option value="kerala">Kerala</option>
              <option value="rajasthan">Rajasthan</option>
              <option value="uttarakhand">Uttarakhand</option>
              <option value="uttarpradesh">Uttar Pradesh</option>
              <option value="tamilnadu">Tamil Nadu</option>
            </select>
          </Field>
          <Field label="District / City">
            <input className={inputCls} value={form.dist} onChange={e => upd({ dist: e.target.value })} placeholder="e.g. Thiruvananthapuram" />
          </Field>
          <Field label="Pin Code">
            <input className={inputCls} value={form.pin} onChange={e => upd({ pin: e.target.value })} placeholder="6-digit pin code" />
          </Field>
          <Field label="Exact Installation Address" span={3}>
            <textarea className={inputCls} rows={2} value={form.site} onChange={e => upd({ site: e.target.value })} placeholder="Complete site address" style={{ resize: 'vertical' }} />
          </Field>
          <Field label="DISCOM / Electricity Board">
            <input className={inputCls} value={form.discom} onChange={e => upd({ discom: e.target.value })} placeholder="e.g. KSEB, TANGEDCO" />
          </Field>
          <Field label="Consumer / Meter No.">
            <input className={inputCls} value={form.meter} onChange={e => upd({ meter: e.target.value })} placeholder="Existing meter number" />
          </Field>
          <Field label="Consumer Category">
            <select className={inputCls} value={form.categ} onChange={e => upd({ categ: e.target.value })}>
              {['Residential','Commercial','Industrial','Institution / School','Agricultural'].map(c => <option key={c}>{c}</option>)}
            </select>
          </Field>
        </div>
      </Card>

      {/* ── System Configuration ── */}
      <Card className="mb-4">
        <CardTitle icon="⚙️">System Configuration</CardTitle>
        <div className="mb-4">
          <label className="block text-[.67rem] font-bold text-[#0f2744] uppercase tracking-[.55px] mb-2">System Type</label>
          <div className="grid grid-cols-2 gap-3">
            <TypeCard name="stype" value="ongrid"  checked={form.stype === 'ongrid'}  onChange={() => upd({ stype: 'ongrid' })}
              title="🔌 On-Grid / Grid-Tied (Net Metering)" sub="Solar + Grid. Best savings via net metering." />
            <TypeCard name="stype" value="hybrid" checked={form.stype === 'hybrid'} onChange={() => upd({ stype: 'hybrid' })}
              title="🔋 Hybrid (Grid + Battery)" sub="Solar + Battery + Grid. Backup + net metering." />
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
          <Field label="System Capacity (kWp)">
            <input className={inputCls} type="number" value={form.cap} min={1} onChange={e => onCapChange(e.target.value)} />
          </Field>
          <Field label="Avg. Monthly Consumption (kWh)">
            <input className={inputCls} type="number" value={form.cons} onChange={e => upd({ cons: +e.target.value })} />
          </Field>
          <Field label="Available Area (sq.ft)">
            <input className={inputCls} type="number" value={form.area} onChange={e => upd({ area: +e.target.value })} />
          </Field>
        </div>

        <Divider />
        <div className="text-[.86rem] font-semibold text-[#0f2744] mb-3">🔧 Equipment Selection</div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <Field label="Solar Panel Brand">
            <select className={inputCls} value={form.pbrand} onChange={e => onBrandChange(e.target.value)}>
              <option value="">-- Select Brand --</option>
              {brands.map(b => <option key={b}>{b}</option>)}
            </select>
          </Field>
          <Field label="Panel Capacity (Wp)">
            <select className={inputCls} value={form.pwp} onChange={e => onWpChange(e.target.value)}>
              <option value="">-- Select Wp --</option>
              {uniqueWps.map(w => <option key={w} value={w}>{w} Wp</option>)}
            </select>
          </Field>
          <Field label="No. of Panels (Auto)" hint="= kWp × 1000 ÷ Wp">
            <input className={roCls} value={form.pcount} readOnly placeholder="Auto-calculated" />
          </Field>
          <Field label="Panel Adjustment (+ / −)" hint="Final = Auto + Adjustment">
            <input className={inputCls} type="number" value={form.padj} onChange={e => onPadjChange(e.target.value)} />
          </Field>
          <Field label="Inverter">
            <select className={inputCls} value={form.inv} onChange={e => upd({ inv: e.target.value })}>
              <option value="">-- Select Inverter --</option>
              {invs.map((v, i) => <option key={i} value={i}>{v.brand} – {v.cap}</option>)}
            </select>
          </Field>
          <Field label="Avg. Grid Tariff (₹/unit)" hint="Auto-filled from state; editable">
            <input className={inputCls} type="number" step="0.01" value={form.tariff} onChange={e => upd({ tariff: +e.target.value })} />
          </Field>
          <Field label="Sales Executive" hint="Appears in proposal signatory">
            <select className={inputCls} value={form.sales} onChange={e => upd({ sales: e.target.value })}>
              <option value="">-- Select Sales Executive --</option>
              {salesExecs.map((x, i) => (
                <option key={i} value={i}>
                  {x.name}{x.desig && x.desig !== 'Sales Executive' ? ` (${x.desig})` : ''}
                </option>
              ))}
            </select>
          </Field>
        </div>

        {form.stype === 'hybrid' && (
          <div className="mt-4 pt-4 border-t-2 border-dashed border-[#dee2e6]">
            <div className="text-[.86rem] font-semibold text-[#0f2744] mb-3">🔋 Battery Configuration</div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <Field label="Battery Capacity (kWh)">
                <input className={inputCls} type="number" value={form.bkwh} onChange={e => upd({ bkwh: +e.target.value })} />
              </Field>
              <Field label="Battery Technology">
                <select className={inputCls} value={form.btype} onChange={e => upd({ btype: e.target.value })}>
                  <option>LiFePO4 (Lithium Iron Phosphate)</option>
                  <option>Li-Ion NMC</option>
                  <option>VRLA / Lead Acid</option>
                </select>
              </Field>
              <Field label="Backup Duration (hrs)">
                <input className={inputCls} type="number" value={form.bhrs} onChange={e => upd({ bhrs: +e.target.value })} />
              </Field>
            </div>
          </div>
        )}
      </Card>

      {/* ── Project Cost & Subsidy ── */}
      <Card className="mb-4">
        <CardTitle icon="💰">Project Cost & Subsidy</CardTitle>
        <Alert type="info">
          ℹ️ Enter the <strong>Total Plant Price including GST</strong>. The system will automatically derive the taxable value and GST amount. Discount is for display only and does not affect calculations.
        </Alert>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-1">
          <Field label="Total Plant Price (Including GST) ₹" span={2} hint="Enter the final quoted price to the customer — already inclusive of all taxes.">
            <input className={inputCls} type="number" value={form.price} onChange={e => upd({ price: +e.target.value })}
              style={{ fontSize: '1rem', fontWeight: 700, borderColor: '#c8933a' }} />
          </Field>
          <Field label={<>Discount ₹ <span className="font-normal text-[#6c757d] text-[.62rem]">(display only)</span></>}
            hint="Shown for transparency. Not deducted from calculations.">
            <input className={inputCls} type="number" value={form.disc} onChange={e => upd({ disc: +e.target.value })} />
          </Field>
        </div>

        <Divider />
        <div className="text-[.86rem] font-semibold text-[#0f2744] mb-3">➕ Additional Cost (Optional)</div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Additional Cost Description">
            <input className={inputCls} value={form.addCostDesc} onChange={e => upd({ addCostDesc: e.target.value })} placeholder="e.g. Earthing Electrode, Cable Trays…" />
          </Field>
          <Field label="Additional Cost Amount ₹" hint="Included in Customer Financial Commitment">
            <input className={inputCls} type="number" value={form.addCostAmt} onChange={e => upd({ addCostAmt: +e.target.value })} />
          </Field>
        </div>

        <Divider />
        <label className="flex items-center gap-2 cursor-pointer mb-4 select-none">
          <input type="checkbox" checked={form.subon} onChange={e => onSubToggle(e.target.checked)}
            className="w-4 h-4 accent-[#0f2744] cursor-pointer" />
          <span className="text-[.83rem] font-medium text-[#0d1117]">✅ Subsidy Eligible</span>
        </label>

        {form.subon && (
          <div className="grid grid-cols-3 gap-3 mb-4">
            <Field label="CFA – PM Surya Ghar (₹)" hint="MNRE formula – auto-calculated from system size">
              <input className={roCls} value={form.cfa} readOnly />
            </Field>
            <Field label="State Subsidy (₹)">
              <input className={inputCls} type="number" value={form.ssub}
                onChange={e => { const ssub = +e.target.value; upd({ ssub, tsub: Math.round(form.cfa + ssub) }); }} />
            </Field>
            <Field label="Total Subsidy (₹)">
              <input className={roSubCls} value={form.tsub} readOnly />
            </Field>
          </div>
        )}

        {/* Live Cost Summary */}
        <div className="bg-gradient-to-br from-[#f8f9fa] to-[#f0f2f5] rounded-xl p-4 border border-[#e9ecef] mt-2">
          <div className="text-[.73rem] font-bold text-[#0f2744] uppercase tracking-[.45px] mb-3 flex items-center gap-2">
            <span className="w-1.5 h-4 bg-[#c8933a] rounded-full inline-block" />
            Live Cost Summary
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { label: 'Plant Price (Incl. GST)', val: inr(costs.price), cls: roCls, border: '#c8933a' },
              { label: 'Additional Cost', val: inr(costs.add), cls: roCls },
              { label: 'Total Plant Price', val: inr(costs.tot), cls: roCls, border: '#c8933a', bold: true },
              { label: 'Taxable Value (÷ 1.089)', val: inr(costs.epc), cls: roCls },
              { label: 'GST @ 8.9% Blended', val: inr(costs.gst), cls: roCls },
              { label: 'Subsidy (CFA + State)', val: inr(costs.sub), cls: roSubCls },
            ].map(({ label, val, cls, border, bold }) => (
              <Field key={label} label={label}>
                <input className={cls} value={val} readOnly
                  style={{ ...(border ? { borderColor: border } : {}), ...(bold ? { fontWeight: 700 } : {}) }} />
              </Field>
            ))}
            <Field label={<span className="text-[#2d8c5a] font-bold">Customer Financial Commitment</span>}
              hint="Total Plant Price − Subsidy">
              <input className={roCls} value={inr(costs.com)} readOnly
                style={{ borderColor: '#2d8c5a', color: '#2d8c5a', fontWeight: 700, fontSize: '1rem' }} />
            </Field>
          </div>
        </div>
      </Card>

      <div className="flex justify-end gap-3 mt-2 pb-4">
        <Btn variant="outline" onClick={() => window.dispatchEvent(new CustomEvent('newform'))}>🔄 Reset</Btn>
        <Btn variant="gold" size="lg" onClick={handleGenerate}>🚀 Generate Solar Power Plant Proposal</Btn>
      </div>
    </div>
  );
}
