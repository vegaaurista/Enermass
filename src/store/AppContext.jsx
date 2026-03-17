import { createContext, useContext, useReducer, useCallback } from 'react';
import { DEF_PANELS, DEF_INV, DEF_BOM, DEF_TNC, DEF_SETTINGS, DEF_COMPANY, DEF_SALES_EXECS } from '../data/defaults';

const LS = {
  g: (k, d) => { try { const v = localStorage.getItem(k); return v != null ? JSON.parse(v) : d; } catch { return d; } },
  s: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};

const AppContext = createContext(null);

const initialState = {
  screen: 'dashboard',
  notification: null,
  lastD: null,
  editingId: null,
  // Modal states
  modals: { panel: false, inverter: false, bom: false, sales: false },
  modalData: {},
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_SCREEN': return { ...state, screen: action.screen };
    case 'SET_NOTIF': return { ...state, notification: action.payload };
    case 'CLEAR_NOTIF': return { ...state, notification: null };
    case 'SET_LAST_D': return { ...state, lastD: action.data };
    case 'SET_EDITING_ID': return { ...state, editingId: action.id };
    case 'OPEN_MODAL': return { ...state, modals: { ...state.modals, [action.name]: true }, modalData: { ...state.modalData, [action.name]: action.data || {} } };
    case 'CLOSE_MODAL': return { ...state, modals: { ...state.modals, [action.name]: false } };
    default: return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const notify = useCallback((msg, type = 's') => {
    dispatch({ type: 'SET_NOTIF', payload: { msg, type } });
    setTimeout(() => dispatch({ type: 'CLEAR_NOTIF' }), 3000);
  }, []);

  const nav = useCallback((screen) => {
    dispatch({ type: 'SET_SCREEN', screen });
  }, []);

  // Data accessors
  const getCo = () => LS.g('eps_co', DEF_COMPANY);
  const saveCo = (data) => LS.s('eps_co', data);
  const getPanels = () => LS.g('eps_panels', DEF_PANELS);
  const getInvs = () => LS.g('eps_inv', DEF_INV);
  const getBOM = () => LS.g('eps_bom', DEF_BOM);
  const getTNC = () => LS.g('eps_tnc', DEF_TNC);
  const getSettings = () => LS.g('eps_settings', DEF_SETTINGS);
  const getSaved = () => LS.g('eps_saved', []);
  const getSalesExecs = () => LS.g('eps_sales', DEF_SALES_EXECS);
  const getLbody = () => LS.g('eps_lbody', '');

  const value = {
    state, dispatch, notify, nav, LS,
    getCo, saveCo, getPanels, getInvs, getBOM, getTNC, getSettings, getSaved, getSalesExecs, getLbody,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => useContext(AppContext);
