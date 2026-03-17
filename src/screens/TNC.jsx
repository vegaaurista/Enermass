import { useState } from 'react';
import { useApp } from '../store/AppContext';
import { PageHeader, Card, Field, inputCls, Btn, Tabs } from '../components/UI';
import { DEF_TNC } from '../data/defaults';

const TABS = [
  { id: 'common', label: '📌 Common' },
  { id: 'kerala', label: '🌴 Kerala' },
  { id: 'rajasthan', label: '🏜 Rajasthan' },
  { id: 'uttarakhand', label: '🏔 Uttarakhand' },
  { id: 'uttarpradesh', label: '🏛 Uttar Pradesh' },
  { id: 'tamilnadu', label: '☀️ Tamil Nadu' },
];

export default function TNC() {
  const { getTNC, notify, LS } = useApp();
  const tnc = getTNC();
  const [tab, setTab] = useState('common');
  const [values, setValues] = useState(tnc);

  const save = () => {
    LS.s('eps_tnc', values);
    notify('✅ T&C saved!');
  };

  return (
    <div className="animate-fade-in">
      <PageHeader icon="📋" title="Terms & Conditions" sub="State-wise T&C – auto-applied in proposals.">
        <Btn variant="gold" onClick={save}>💾 Save T&C</Btn>
      </PageHeader>

      <Card>
        <Tabs tabs={TABS} active={tab} onChange={setTab} />
        {TABS.map(t => (
          <div key={t.id} className={tab === t.id ? 'block' : 'hidden'}>
            <Field label={t.label}>
              <textarea
                className={inputCls}
                rows={14}
                style={{ fontSize: '.82rem', lineHeight: '1.7', resize: 'vertical' }}
                value={values[t.id] || ''}
                onChange={e => setValues(v => ({ ...v, [t.id]: e.target.value }))}
              />
            </Field>
          </div>
        ))}
        <div className="flex justify-end mt-4">
          <Btn variant="gold" onClick={save}>💾 Save All T&C</Btn>
        </div>
      </Card>
    </div>
  );
}
