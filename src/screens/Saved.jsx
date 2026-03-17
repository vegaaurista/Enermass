import { useApp } from '../store/AppContext';
import { PageHeader, Card, Btn, Badge, Alert } from '../components/UI';
import { fmtD } from '../utils/helpers';

export default function Saved({ onView, onEdit, onRevise, onDelete }) {
  const { getSaved, nav } = useApp();
  const saved = getSaved();

  if (!saved.length) return (
    <div className="animate-fade-in">
      <PageHeader icon="📂" title="Saved Proposals" sub="View, edit, revise and download all saved Solar Power Plant Proposals.">
        <Btn variant="gold" onClick={() => nav('quotform')}>⚡ New Proposal</Btn>
      </PageHeader>
      <Card className="text-center py-16">
        <div className="text-5xl mb-3">☀️</div>
        <div className="text-base font-semibold text-[#6c757d]">No saved proposals yet.</div>
        <div className="text-sm mt-1 text-[#adb5bd]">Create your first Solar Power Plant Proposal!</div>
        <div className="mt-5">
          <Btn variant="gold" onClick={() => nav('quotform')}>⚡ New Proposal</Btn>
        </div>
      </Card>
    </div>
  );

  return (
    <div className="animate-fade-in">
      <PageHeader icon="📂" title="Saved Proposals" sub="View, edit, revise and download all saved Solar Power Plant Proposals.">
        <Btn variant="gold" onClick={() => nav('quotform')}>⚡ New Proposal</Btn>
      </PageHeader>

      <Alert type="info">
        📌 Use <strong>Edit</strong> to reload &amp; update. Use <strong>Revise</strong> to create a new revision (R1, R2…). Original is preserved.
      </Alert>

      <Card noPad>
        {saved.slice().reverse().map(q => (
          <div key={q.id} className="flex items-center gap-3 px-5 py-4 border-b border-[#e9ecef] last:border-b-0 hover:bg-[#f8f9fa] transition-colors group">
            {/* Color strip */}
            <div className={`w-1 h-12 rounded-full flex-shrink-0 ${q.ptype === 'Residential' ? 'bg-[#2d8c5a]' : 'bg-[#c8933a]'}`} />

            <div className="flex-1 min-w-0">
              <div className="font-mono text-[.78rem] font-bold text-[#0f2744] tracking-tight">
                {q.refno}{q.revision ? ` – R${q.revision}` : ''}
              </div>
              <div className="text-[.88rem] font-semibold text-[#0d1117] mt-0.5 truncate">
                {q.sal || ''} {q.custname || '—'}
              </div>
              <div className="text-[.71rem] text-[#6c757d] mt-1 flex items-center gap-2 flex-wrap">
                <span>{fmtD(q.date)}</span>
                <span className="text-[#dee2e6]">·</span>
                <span>{q.cap} kWp</span>
                <Badge variant={q.ptype === 'Residential' ? 'green' : 'gold'}>{q.ptype || '—'}</Badge>
              </div>
            </div>

            <div className="flex gap-1.5 flex-shrink-0 flex-wrap justify-end">
              <Btn variant="sky" size="xs" onClick={() => onView(q.id)}>👁 View</Btn>
              <Btn variant="outline" size="xs" onClick={() => onEdit(q.id)}>✏️ Edit</Btn>
              <Btn variant="primary" size="xs" onClick={() => onRevise(q.id)}>🔁 Revise</Btn>
              <Btn variant="danger" size="xs" onClick={() => onDelete(q.id)}>🗑</Btn>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}
