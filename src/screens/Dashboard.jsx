import { useApp } from '../store/AppContext';
import { PageHeader } from '../components/UI';

const CARDS = [
  { id: 'company', icon: '🏢', label: 'Company', desc: 'Logo, details, branch addresses, CEO info.', color: 'from-[#0f2744] to-[#1a3a5c]' },
  { id: 'settings', icon: '⚙️', label: 'Settings', desc: 'Panels, inverters, subsidy & net metering data.', color: 'from-[#4a90d9] to-[#2970b8]' },
  { id: 'bom', icon: '📦', label: 'BOM Products', desc: 'Bill of Materials – add/edit/delete items.', color: 'from-[#c8933a] to-[#e8b96a]' },
  { id: 'tnc', icon: '📋', label: 'T&C', desc: 'State-wise Terms & Conditions.', color: 'from-[#2d8c5a] to-[#1e6e45]' },
  { id: 'saved', icon: '📂', label: 'Saved Proposals', desc: 'View, edit, revise & download past proposals.', color: 'from-[#7b1fa2] to-[#4a148c]' },
  { id: 'quotform', icon: '⚡', label: 'New Proposal', desc: 'Generate a Solar Power Plant Proposal.', color: 'from-[#c0392b] to-[#e74c3c]', gold: true },
];

export default function Dashboard({ onNewForm }) {
  const { nav, getSaved, getPanels, getCo } = useApp();

  const saved = getSaved();
  const panels = getPanels();
  const co = getCo();
  const fy = (() => { const d = new Date(), y = d.getFullYear(), m = d.getMonth() + 1; return m >= 4 ? `${y}–${y + 1}` : `${y - 1}–${y}`; })();

  const stats = [
    { val: String(co.num || 1).padStart(4, '0'), label: 'Next Proposal No.' },
    { val: saved.length, label: 'Saved Proposals' },
    { val: panels.length, label: 'Panel Options' },
    { val: fy, label: 'Financial Year' },
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader icon="☀️" title="Enermass Power Solutions Pvt. Ltd."
        sub="Manage company settings, BOM products, terms & conditions, and generate professional Solar Power Plant Proposals."
      />

      {/* Action Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-3 gap-4 mb-6">
        {CARDS.map((c, i) => (
          <button
            key={c.id}
            onClick={() => c.id === 'quotform' ? nav(c.id) : nav(c.id)}
            style={{ animationDelay: `${i * 0.04}s` }}
            className={`text-left p-5 rounded-2xl shadow-card border-2 cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-card-hover animate-fade-in group ${
              c.gold
                ? 'border-[#c8933a] bg-[#fdf3e3]'
                : 'border-transparent bg-white hover:border-[#c8933a]'
            } ${c.id === 'saved' ? 'border-[#4a90d9]/30' : ''}`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg mb-3 bg-gradient-to-br ${c.color} shadow-sm`}>
              {c.icon}
            </div>
            <div className="font-['Outfit'] font-bold text-[.9rem] text-[#0f2744] mb-1 group-hover:text-[#c8933a] transition-colors">{c.label}</div>
            <div className="text-[.71rem] text-[#6c757d] leading-relaxed">{c.desc}</div>
          </button>
        ))}
        {/* New/Reset Form – full width */}
        <button
          onClick={onNewForm}
          className="col-span-2 sm:col-span-3 lg:col-span-4 xl:col-span-3 text-left p-4 rounded-2xl shadow-card border-2 border-transparent bg-white hover:-translate-y-0.5 hover:shadow-card-hover hover:border-[#c8933a] cursor-pointer transition-all duration-200 flex items-center gap-3 group"
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg bg-gradient-to-br from-[#0f2744] to-[#1a3a5c] shadow-sm">🔄</div>
          <div>
            <div className="font-['Outfit'] font-bold text-[.9rem] text-[#0f2744] group-hover:text-[#c8933a] transition-colors">New / Reset Form</div>
            <div className="text-[.71rem] text-[#6c757d]">Clear all proposal form fields & start fresh.</div>
          </div>
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map((s, i) => (
          <div
            key={i}
            style={{ animationDelay: `${0.2 + i * 0.04}s` }}
            className="bg-white rounded-xl p-4 shadow-card text-center animate-fade-in border border-[#e9ecef]/60"
          >
            <div className="font-['Space_Mono'] text-lg font-bold text-[#0f2744]">{s.val}</div>
            <div className="text-[.63rem] text-[#6c757d] uppercase tracking-[.35px] mt-1">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
