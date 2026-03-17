import { useApp } from '../store/AppContext';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
  { id: 'company', label: 'Company', icon: '🏢' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
  { id: 'bom', label: 'BOM', icon: '📦' },
  { id: 'tnc', label: 'T&C', icon: '📋' },
  { id: 'saved', label: 'Saved', icon: '📂' },
];

const nb = 'px-2.5 py-1.5 rounded-lg border-0 text-[.74rem] font-medium cursor-pointer transition-all whitespace-nowrap flex items-center gap-1.5';

export default function Navbar({ onNewForm }) {
  const { state, nav } = useApp();

  return (
    <nav className="bg-[#0a1f3d] flex items-center px-4 gap-1 sticky top-0 z-[300] shadow-[0_2px_20px_rgba(0,0,0,.35)] flex-shrink-0 h-[52px]">
      <div className="flex items-center gap-2.5 mr-4 flex-shrink-0">
        <div className="w-7 h-7 bg-gradient-to-br from-[#c8933a] to-[#e8b96a] rounded-lg flex items-center justify-center text-sm">☀️</div>
        <div className="text-white">
          <div className="font-bold text-[.76rem] leading-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>Enermass Power Solutions</div>
          <div className="text-[.57rem] text-white/40 tracking-wide">Solar Power Plant Proposal</div>
        </div>
      </div>

      <div className="flex items-center gap-0.5 flex-1 overflow-x-auto">
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            onClick={() => nav(item.id)}
            className={nb + ' ' + (
              state.screen === item.id
                ? 'bg-[rgba(200,147,58,.2)] text-[#e8b96a]'
                : 'bg-transparent text-white/55 hover:bg-white/10 hover:text-white'
            )}
          >
            <span className="text-xs">{item.icon}</span>
            {item.label}
          </button>
        ))}

        <div className="w-px h-5 bg-white/10 mx-1 flex-shrink-0" />

        <button
          onClick={onNewForm}
          className={nb + ' bg-[rgba(192,57,43,.18)] text-[#ff9880] hover:bg-[#c0392b] hover:text-white'}
        >
          <span className="text-xs">🔄</span> New Form
        </button>

        <button
          onClick={() => nav('quotform')}
          className={nb + ' ml-1 font-bold bg-gradient-to-br from-[#c8933a] to-[#e8b96a] text-[#0f2744] hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(200,147,58,.35)]'}
        >
          <span className="text-xs">⚡</span> New Proposal
        </button>
      </div>
    </nav>
  );
}
