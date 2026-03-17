import { SD } from '../data/defaults';

export const inr = n => '₹' + Math.round(n).toLocaleString('en-IN');
export const fmtN = n => Math.round(n).toLocaleString('en-IN');
export const getFY = () => {
  const d = new Date(), y = d.getFullYear(), m = d.getMonth() + 1;
  return m >= 4 ? String(y).slice(-2) + String(y + 1).slice(-2) : String(y - 1).slice(-2) + String(y).slice(-2);
};
export const fmtD = s => {
  try { return new Date(s).toLocaleDateString('en-IN', { day:'2-digit', month:'long', year:'numeric' }); }
  catch { return s; }
};
export const safe = s => (s || '').replace(/[/\\:*?"<>|]/g, '_').trim();

export function numberToIndianCurrencyWords(amount) {
  const n = Math.round(+amount || 0);
  if (n === 0) return 'Rupees Zero Only';
  const ones = ['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen'];
  const tens = ['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];
  function twoDigits(x) { if (x < 20) return ones[x]; return tens[Math.floor(x/10)] + (x%10 ? ' '+ones[x%10] : ''); }
  function threeDigits(x) { if (x >= 100) return ones[Math.floor(x/100)] + ' Hundred' + (x%100 ? ' '+twoDigits(x%100) : ''); return twoDigits(x); }
  const crore=Math.floor(n/10000000), lakh=Math.floor((n%10000000)/100000), thousand=Math.floor((n%100000)/1000), remainder=n%1000;
  let words = '';
  if (crore) words += threeDigits(crore) + ' Crore ';
  if (lakh) words += twoDigits(lakh) + ' Lakh ';
  if (thousand) words += twoDigits(thousand) + ' Thousand ';
  if (remainder) words += threeDigits(remainder) + ' ';
  return 'Rupees ' + words.trim() + ' Only';
}

export function getRefNo(state, num, prefix = 'EPS') {
  const code = (SD[state] || {}).code || 'XX';
  const n = parseInt(num || 1);
  return `${prefix}-CO${code}-${String(n).padStart(5, '0')}${getFY()}`;
}

export function calcCFA(S, ptype, settings = {}) {
  if (ptype === 'Commercial') return 0;
  const r2 = settings.c2 || 30000;
  const r3 = settings.c3 || 18000;
  return r2 * Math.min(S, 2) + r3 * Math.max(0, Math.min(S - 2, 1));
}

export const mGen = c => c * 4 * 30;
export const aGen = c => c * 4 * 365;

export function bomQty(item, D) {
  const wp = D.pwp || 545;
  const finalPanels = D.pcount || (Math.ceil(D.cap * 1000 / wp) + (D.padj || 0));
  switch (item.qb) {
    case 'panel_count': return `${finalPanels}`;
    case 'capacity': return D.cap;
    case 'battery_kwh': return D.bkwh;
    case 'fixed_1': return 1;
    case 'fixed_2': return 2;
    case 'fixed_3': return 3;
    case 'cable_dc': return Math.round(D.cap * 8);
    case 'cable_ac': return Math.round(D.cap * 5);
    case 'custom': return Math.round(D.cap * (item.cq || 1));
    default: return 1;
  }
}

export function deriveCosts(D) {
  const addAmt = D.addCostAmt || 0;
  const total = D.price + addAmt;
  const taxableVal = total / 1.089;
  const totalGST = total - taxableVal;
  const commit = total - (D.tsub || 0);
  return { totalProj: total, taxableVal, totalGST, commit };
}
