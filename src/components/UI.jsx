import { useApp } from '../store/AppContext';
import { useEffect } from 'react';

/* ── NOTIFICATION TOAST ── */
export function Notification() {
  const { state } = useApp();
  const n = state.notification;
  if (!n) return null;
  const colors = {
    s: 'bg-green-600 text-white',
    e: 'bg-red-600 text-white',
    i: 'bg-[#0f2744] text-white',
  };
  return (
    <div className={`fixed top-16 right-4 z-[1000] px-4 py-3 rounded-xl shadow-lg text-sm font-semibold animate-notif-in max-w-xs ${colors[n.type] || colors.i}`}>
      {n.msg}
    </div>
  );
}

/* ── MODAL WRAPPER ── */
export function Modal({ open, onClose, title, children, maxW = 'max-w-lg' }) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 bg-black/50 z-[600] flex items-center justify-center p-4 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className={`bg-white rounded-2xl p-6 ${maxW} w-full max-h-[88vh] overflow-y-auto shadow-2xl animate-slide-up`}>
        <div className="font-['Playfair_Display'] text-base text-[#0f2744] mb-4 pb-3 border-b-2 border-[#c8933a]">{title}</div>
        {children}
      </div>
    </div>
  );
}

/* ── PAGE HEADER ── */
export function PageHeader({ icon, title, sub, children }) {
  return (
    <div className="flex items-start justify-between gap-3 mb-5 flex-wrap">
      <div>
        <h2 className="text-xl font-['Outfit'] font-bold text-[#0f2744] flex items-center gap-2">
          {icon && <span className="text-xl">{icon}</span>}
          {title}
        </h2>
        {sub && <p className="text-sm text-[#6c757d] mt-1">{sub}</p>}
      </div>
      {children && <div className="flex gap-2 flex-wrap">{children}</div>}
    </div>
  );
}

/* ── CARD ── */
export function Card({ children, className = '', noPad = false }) {
  return (
    <div className={`bg-white rounded-2xl shadow-card border border-[#e9ecef]/60 ${noPad ? '' : 'p-5'} ${className}`}>
      {children}
    </div>
  );
}

/* ── CARD TITLE ── */
export function CardTitle({ children, icon }) {
  return (
    <div className="flex items-center gap-2 mb-4 pb-3 border-b-2 border-[#c8933a] font-['Outfit'] font-semibold text-[#0f2744] text-[.9rem]">
      {icon && <span>{icon}</span>}{children}
    </div>
  );
}

/* ── BUTTON ── */
export function Btn({ variant = 'primary', size = 'md', children, className = '', ...props }) {
  const base = 'inline-flex items-center gap-1.5 font-semibold rounded-lg border-none cursor-pointer transition-all duration-200 font-["DM_Sans"]';
  const sizes = {
    md: 'px-4 py-2 text-sm',
    sm: 'px-3 py-1.5 text-xs',
    xs: 'px-2 py-1 text-[.7rem]',
    lg: 'px-6 py-3 text-base',
  };
  const variants = {
    primary: 'bg-gradient-to-br from-[#0f2744] to-[#1a3a5c] text-white hover:-translate-y-0.5 hover:shadow-[0_5px_14px_rgba(15,39,68,.3)]',
    gold: 'bg-gradient-to-br from-[#c8933a] to-[#e8b96a] text-[#0f2744] hover:-translate-y-0.5 hover:shadow-[0_5px_14px_rgba(200,147,58,.35)]',
    sky: 'bg-gradient-to-br from-[#4a90d9] to-[#2970b8] text-white hover:-translate-y-0.5 hover:shadow-[0_5px_14px_rgba(74,144,217,.3)]',
    outline: 'bg-transparent border border-[#dee2e6] text-[#495057] hover:border-[#0f2744] hover:text-[#0f2744]',
    danger: 'bg-[#fdf0ee] text-[#c0392b] border border-[rgba(192,57,43,.16)] hover:bg-[#c0392b] hover:text-white',
    green: 'bg-gradient-to-br from-[#2d8c5a] to-[#1e6e45] text-white hover:-translate-y-0.5 hover:shadow-[0_5px_14px_rgba(45,140,90,.3)]',
  };
  return (
    <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

/* ── FORM FIELD ── */
export function Field({ label, hint, children, span }) {
  const spanClass = span === 2 ? 'col-span-2' : span === 3 ? 'col-span-3' : span === 4 ? 'col-span-4' : '';
  return (
    <div className={`flex flex-col gap-1 ${spanClass}`}>
      {label && <label className="text-[.67rem] font-bold text-[#0f2744] uppercase tracking-[.55px]">{label}</label>}
      {children}
      {hint && <span className="text-[.65rem] text-[#adb5bd]">{hint}</span>}
    </div>
  );
}

/* ── INPUT / SELECT / TEXTAREA BASE CLASSES ── */
export const inputCls = 'border border-[#dee2e6] rounded-lg px-3 py-2 font-["DM_Sans"] text-sm text-[#0d1117] bg-[#f8f9fa] transition-all outline-none w-full focus:border-[#c8933a] focus:bg-white focus:shadow-[0_0_0_3px_rgba(200,147,58,.1)]';
export const roCls = `${inputCls} bg-[#fdf3e3] border-[rgba(200,147,58,.26)] cursor-default`;
export const roSubCls = `${inputCls} bg-[#e3f0ff] border-[rgba(21,101,192,.2)] text-[#1565c0] font-bold cursor-default`;

/* ── TABS ── */
export function Tabs({ tabs, active, onChange }) {
  return (
    <div className="flex gap-0.5 mb-4 border-b-2 border-[#e9ecef] overflow-x-auto">
      {tabs.map(t => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={`px-3.5 py-1.5 border-none text-xs font-semibold rounded-t-lg cursor-pointer transition-all whitespace-nowrap border-b-2 -mb-0.5 ${
            active === t.id
              ? 'text-[#0f2744] border-[#c8933a] bg-[#fdf3e3]'
              : 'text-[#6c757d] bg-transparent border-transparent hover:text-[#0f2744]'
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

/* ── BADGE ── */
export function Badge({ children, variant = 'navy' }) {
  const v = {
    navy: 'bg-[#0f2744] text-white',
    gold: 'bg-[#fdf3e3] text-[#c8933a] border border-[rgba(200,147,58,.26)]',
    green: 'bg-[#e8f7ef] text-[#2d8c5a]',
    blue: 'bg-[#e3f0ff] text-[#1565c0]',
    red: 'bg-[#fdf0ee] text-[#c0392b]',
  };
  return <span className={`px-2 py-0.5 rounded-full text-[.65rem] font-bold ${v[variant] || v.navy}`}>{children}</span>;
}

/* ── TYPE CARD (Radio) ── */
export function TypeCard({ id, name, value, checked, onChange, title, sub }) {
  return (
    <label
      className={`border-2 rounded-xl p-3 cursor-pointer transition-all ${
        checked ? 'border-[#c8933a] bg-[#fdf3e3] shadow-[0_0_0_3px_rgba(200,147,58,.1)]' : 'border-[#e9ecef] bg-[#f8f9fa] hover:border-[#c8933a]'
      }`}
      id={id}
    >
      <input type="radio" name={name} value={value} checked={checked} onChange={onChange} className="hidden" />
      <div className="font-semibold text-[.83rem] text-[#0f2744]">{title}</div>
      <div className="text-[.7rem] text-[#6c757d] mt-1">{sub}</div>
    </label>
  );
}

/* ── DIVIDER ── */
export function Divider() {
  return <div className="h-px bg-[#e9ecef] my-4" />;
}

/* ── ALERT ── */
export function Alert({ type = 'info', children }) {
  const styles = {
    info: 'bg-[#e8f4fd] border-l-4 border-[#4a90d9] text-[#1a5276]',
    warn: 'bg-[#fdf3e3] border-l-4 border-[#c8933a] text-[#7d5000]',
    success: 'bg-[#e8f7ef] border-l-4 border-[#2d8c5a] text-[#1a5235]',
  };
  return (
    <div className={`rounded-lg px-4 py-2.5 text-[.79rem] mb-3 ${styles[type] || styles.info}`}>
      {children}
    </div>
  );
}

/* ── TABLE WRAPPER ── */
export function TableWrap({ children }) {
  return (
    <div className="rounded-xl overflow-hidden border border-[#e9ecef]">
      <table className="w-full border-collapse text-[.81rem]">
        {children}
      </table>
    </div>
  );
}

export const thCls = 'bg-[#0f2744] text-white px-3 py-2 text-left text-[.68rem] uppercase tracking-[.4px] font-semibold first:rounded-tl-xl last:rounded-tr-xl';
export const tdCls = 'px-3 py-2 border-b border-[#e9ecef] text-sm';
