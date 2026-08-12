import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import {
  Outlet, OutletSale, OutletOrder, OutletSurvey, SkipRecord, Product, Campaign,
} from '../types';
import { mockOutlets, mockProducts, mockCampaigns } from '../services/mockService';

let AsyncStorage: any = null;
try {
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
} catch (e) {
  const memoryStore = new Map<string, string>();
  AsyncStorage = {
    getItem: async (key: string) => memoryStore.get(key) || null,
    setItem: async (key: string, val: string) => { memoryStore.set(key, val); },
  };
}

// ─── State Shape ──────────────────────────────────────────────────────────────
interface FieldState {
  outlets: Outlet[];
  sales: OutletSale[];
  orders: OutletOrder[];
  surveys: OutletSurvey[];
  skipRecords: SkipRecord[];
  products: Product[];
  activeCampaign: Campaign;
}

// ─── Actions ──────────────────────────────────────────────────────────────────
type Action =
  | { type: 'SET_ACTIVE_CAMPAIGN'; campaign: Campaign }
  | { type: 'ADD_OUTLET'; outlet: Outlet }
  | { type: 'UPDATE_OUTLET'; outlet: Outlet }
  | { type: 'MARK_OUTLET_VISITED'; outletId: string }
  | { type: 'SKIP_OUTLET'; outletId: string; skipRecord: SkipRecord }
  | { type: 'ADD_SALE'; sale: OutletSale }
  | { type: 'ADD_ORDER'; order: OutletOrder }
  | { type: 'ADD_SURVEY'; survey: OutletSurvey }
  | { type: 'DECREMENT_STOCK'; productId: string; qty: number }
  | { type: 'HYDRATE'; state: Partial<FieldState> };

// ─── Reducer ──────────────────────────────────────────────────────────────────
function reducer(state: FieldState, action: Action): FieldState {
  switch (action.type) {
    case 'HYDRATE':
      return { ...state, ...action.state };

    case 'SET_ACTIVE_CAMPAIGN':
      return { ...state, activeCampaign: action.campaign };

    case 'ADD_OUTLET':
      return { ...state, outlets: [action.outlet, ...state.outlets] };

    case 'UPDATE_OUTLET':
      return {
        ...state,
        outlets: state.outlets.map((o: Outlet) => (o.id === action.outlet.id ? action.outlet : o)),
      };

    case 'MARK_OUTLET_VISITED':
      return {
        ...state,
        outlets: state.outlets.map((o: Outlet) =>
          o.id === action.outletId ? { ...o, status: 'visited' } : o
        ),
      };

    case 'SKIP_OUTLET':
      return {
        ...state,
        outlets: state.outlets.map((o: Outlet) =>
          o.id === action.outletId ? { ...o, status: 'skipped' } : o
        ),
        skipRecords: [action.skipRecord, ...state.skipRecords],
      };

    case 'ADD_SALE':
      return {
        ...state,
        sales: [action.sale, ...state.sales],
      };

    case 'ADD_ORDER':
      return {
        ...state,
        orders: [action.order, ...state.orders],
      };

    case 'ADD_SURVEY':
      return {
        ...state,
        surveys: [action.survey, ...state.surveys],
      };

    case 'DECREMENT_STOCK':
      return {
        ...state,
        products: state.products.map((p: Product) =>
          p.id === action.productId
            ? { ...p, stock: Math.max(0, p.stock - action.qty) }
            : p
        ),
      };

    default:
      return state;
  }
}

// ─── Initial State ────────────────────────────────────────────────────────────
const initialState: FieldState = {
  outlets: mockOutlets,
  sales: [],
  orders: [],
  surveys: [],
  skipRecords: [],
  products: mockProducts,
  activeCampaign: mockCampaigns[0],
};

// ─── Context ──────────────────────────────────────────────────────────────────
interface FieldContextValue {
  state: FieldState;
  dispatch: React.Dispatch<Action>;
  getSalesForOutlet: (outletId: string) => OutletSale[];
  getOrdersForOutlet: (outletId: string) => OutletOrder[];
  getSurveysForOutlet: (outletId: string) => OutletSurvey[];
  getSkipForOutlet: (outletId: string) => SkipRecord | undefined;
  getOutlet: (outletId: string) => Outlet | undefined;
}

const FieldContext = createContext<FieldContextValue | null>(null);

const STORAGE_KEY = '@fieldops:state';

// ─── Provider ─────────────────────────────────────────────────────────────────
export const FieldProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Hydrate from AsyncStorage on mount
  useEffect(() => {
    if (AsyncStorage?.getItem) {
      AsyncStorage.getItem(STORAGE_KEY).then((raw: string | null) => {
        if (raw) {
          try {
            const saved: Partial<FieldState> = JSON.parse(raw);
            dispatch({ type: 'HYDRATE', state: saved });
          } catch (_) {
            // ignore parse errors
          }
        }
      }).catch(() => {});
    }
  }, []);

  // Persist on state change
  useEffect(() => {
    if (AsyncStorage?.setItem) {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {});
    }
  }, [state]);

  const getSalesForOutlet = (outletId: string) =>
    state.sales.filter((s: OutletSale) => s.outletId === outletId);

  const getOrdersForOutlet = (outletId: string) =>
    state.orders.filter((o: OutletOrder) => o.outletId === outletId);

  const getSurveysForOutlet = (outletId: string) =>
    state.surveys.filter((s: OutletSurvey) => s.outletId === outletId && !s.isDraft);

  const getSkipForOutlet = (outletId: string) =>
    state.skipRecords.find((s: SkipRecord) => s.outletId === outletId);

  const getOutlet = (outletId: string) =>
    state.outlets.find((o: Outlet) => o.id === outletId);

  return (
    <FieldContext.Provider
      value={{ state, dispatch, getSalesForOutlet, getOrdersForOutlet, getSurveysForOutlet, getSkipForOutlet, getOutlet }}
    >
      {children}
    </FieldContext.Provider>
  );
};

// ─── Hook ─────────────────────────────────────────────────────────────────────
export const useFieldStore = (): FieldContextValue => {
  const ctx = useContext(FieldContext);
  if (!ctx) throw new Error('useFieldStore must be used inside <FieldProvider>');
  return ctx;
};
