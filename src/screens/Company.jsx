import { useState, useEffect, useRef } from 'react';
import { useApp } from '../store/AppContext';
import { PageHeader, Card, CardTitle, Field, inputCls, Btn, Alert, Divider } from '../components/UI';
import { DEF_COMPANY, DEFAULT_BRANCHES, STATES, SL } from '../data/defaults';

export default function Company() {
  const { getCo, saveCo, notify, LS } = useApp();
  const [form, setForm] = useState({ ...DEF_COMPANY, ...getCo() });
  const logoRef = useRef();
  const sigRef = useRef();

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setBranch = (state, v) => setForm(f => ({ ...f, branches: { ...(f.branches || {}), [state]: v } }));

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => set('logo', ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSigUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => set('sigImg', ev.target.result);
    reader.readAsDataURL(file);
  };

  const qpPreview = () => {
    const pfx = form.prefix || 'EPS';
    const num = String(form.num || 1).padStart(5, '0');
    const d = new Date(), y = d.getFullYear(), m = d.getMonth() + 1;
    const fy = m >= 4 ? String(y).slice(-2) + String(y + 1).slice(-2) : String(y - 1).slice(-2) + String(y).slice(-2);
    return `${pfx}-COKL-${num}${fy}`;
  };

  const handleSave = () => {
    const existing = getCo();
    saveCo({ ...existing, ...form });
    notify('✅ Company settings saved!');
  };

  const fields = [
    ['Company Name', 'name', 'col-span-2'],
    ['Tagline', 'tag'],
    ['CIN / Reg. No.', 'cin'],
    ['GST Number', 'gst'],
    ['PAN', 'pan'],
    ['Phone', 'phone'],
    ['Email', 'email'],
    ['Website', 'web'],
  ];

  const profileFields = [
    ['Years of Experience', 'cp-exp'],
    ['Projects Completed', 'cp-proj'],
    ['Capacity Commissioned', 'cp-mw'],
    ['MNRE / Empanelment', 'cp-mnre'],
    ['Service Areas', 'cp-areas'],
    ['Certifications (comma-separated)', 'cp-certs'],
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader icon="🏢" title="Company Settings" sub="Logo, details, branch addresses and company profile.">
        <Btn variant="gold" onClick={handleSave}>💾 Save All</Btn>
      </PageHeader>

      {/* Logo & Identity */}
      <Card className="mb-4">
        <CardTitle icon="🖼">Logo & Identity</CardTitle>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Logo (Transparent PNG)">
            <div
              onClick={() => logoRef.current.click()}
              className="border-2 border-dashed border-[#dee2e6] rounded-xl p-4 text-center cursor-pointer hover:border-[#c8933a] hover:bg-[#fdf3e3] transition-all"
            >
              {form.logo
                ? <img src={form.logo} className="h-16 object-contain mx-auto" alt="Logo" />
                : <><div className="text-3xl mb-1">🖼</div><div className="text-sm text-[#6c757d]">Click to upload logo</div><div className="text-xs text-[#adb5bd] mt-1">PNG with transparent background recommended</div></>
              }
            </div>
            <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
          </Field>
          <div className="flex flex-col gap-3">
            <Field label="Proposal No. Prefix">
              <input className={inputCls} value={form.prefix || 'EPS'} maxLength={5} onChange={e => set('prefix', e.target.value)} />
              <span className="text-[.65rem] text-[#adb5bd]">Preview: <span className="font-mono text-[#0f2744]">{qpPreview()}</span></span>
            </Field>
            <Field label="Next Proposal Number">
              <input className={inputCls} type="number" value={form.num || 1} min={1} onChange={e => set('num', +e.target.value)} />
            </Field>
            <Field label="CEO Signature Image (transparent PNG)">
              <div onClick={() => sigRef.current.click()} className="border-2 border-dashed border-[#dee2e6] rounded-xl p-2 text-center cursor-pointer hover:border-[#c8933a] hover:bg-[#fdf3e3] transition-all">
                {form.sigImg
                  ? <img src={form.sigImg} className="max-h-12 w-auto mx-auto" alt="Signature" />
                  : <div className="text-sm text-[#6c757d] py-1">Click to upload signature PNG</div>
                }
              </div>
              <input ref={sigRef} type="file" accept="image/png,image/svg+xml" className="hidden" onChange={handleSigUpload} />
            </Field>
          </div>
        </div>
      </Card>

      {/* Company Details */}
      <Card className="mb-4">
        <CardTitle icon="🏢">Company Details</CardTitle>
        <div className="grid grid-cols-2 gap-3">
          {fields.map(([lbl, key, span]) => (
            <Field key={key} label={lbl} span={span === 'col-span-2' ? 2 : undefined}>
              <input className={inputCls} value={form[key] || ''} onChange={e => set(key, e.target.value)} />
            </Field>
          ))}
          <Field label="Registered Address" span={2}>
            <textarea className={inputCls} rows={3} value={form.addr || ''} onChange={e => set('addr', e.target.value)} style={{ resize: 'vertical' }} />
          </Field>
        </div>
      </Card>

      {/* Branch Addresses */}
      <Card className="mb-4">
        <CardTitle icon="📍">State Branch Addresses</CardTitle>
        <Alert type="info">ℹ️ Leave blank to use Registered Address. Branch address appears on proposal cover page.</Alert>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {STATES.map(st => (
            <Field key={st} label={`${SL[st]} Branch`}>
              <textarea className={inputCls} rows={3} value={(form.branches || {})[st] || ''} onChange={e => setBranch(st, e.target.value)} placeholder={DEFAULT_BRANCHES[st]} style={{ resize: 'vertical' }} />
            </Field>
          ))}
        </div>
      </Card>

      {/* Company Profile */}
      <Card className="mb-4">
        <CardTitle icon="🏆">Company Profile</CardTitle>
        <div className="grid grid-cols-2 gap-3">
          {profileFields.map(([lbl, key]) => (
            <Field key={key} label={lbl}>
              <input className={inputCls} value={form[key] || ''} onChange={e => set(key, e.target.value)} />
            </Field>
          ))}
          <Field label="Business Activities" span={2}>
            <textarea className={inputCls} rows={2} value={form['cp-biz'] || ''} onChange={e => set('cp-biz', e.target.value)} style={{ resize: 'vertical' }} />
          </Field>
          <Field label="Additional Notes" span={2}>
            <textarea className={inputCls} rows={2} value={form['cp-notes'] || ''} onChange={e => set('cp-notes', e.target.value)} style={{ resize: 'vertical' }} />
          </Field>
        </div>
      </Card>

      <div className="flex justify-end mt-2">
        <Btn variant="gold" onClick={handleSave}>💾 Save All Company Settings</Btn>
      </div>
    </div>
  );
}
