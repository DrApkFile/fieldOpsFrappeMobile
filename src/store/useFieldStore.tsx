import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import {
  Outlet, OutletSale, OutletOrder, OutletSurvey, SkipRecord, Product, Campaign,
  StockMovement, StockMovementType, Draft, OutletPhotoCapture,
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
  movements: StockMovement[];
  drafts: Draft[];
  photoCaptures: OutletPhotoCapture[];
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
  | { type: 'DECREMENT_STOCK'; productId: string; qty: number; outletId?: string }
  | { type: 'ADJUST_STOCK'; productId: string; qtyChange: number; reason: string; movementType: Extract<StockMovementType, 'adjustment' | 'reconciliation'> }
  | { type: 'SAVE_DRAFT'; draft: Draft }
  | { type: 'DELETE_DRAFT'; draftId: string }
  | { type: 'ADD_PHOTO_CAPTURE'; capture: OutletPhotoCapture }
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

    case 'DECREMENT_STOCK': {
      const product = state.products.find((p: Product) => p.id === action.productId);
      // Safety net only — callers must pre-check stock via getStockShortfalls
      // before dispatching. Never floor to 0; a would-go-negative decrement
      // is silently rejected here rather than partially applied.
      if (!product || product.stock < action.qty) {
        return state;
      }
      const outlet = action.outletId ? state.outlets.find((o) => o.id === action.outletId) : undefined;
      const movement: StockMovement = {
        id: `mv-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        productId: product.id,
        productName: product.name,
        type: 'sale',
        qtyChange: -action.qty,
        outletId: outlet?.id,
        outletName: outlet?.name,
        timestamp: new Date().toLocaleString('en-US', {
          month: 'numeric', day: 'numeric', year: 'numeric',
          hour: 'numeric', minute: '2-digit', hour12: true,
        }),
      };
      return {
        ...state,
        products: state.products.map((p: Product) =>
          p.id === action.productId ? { ...p, stock: p.stock - action.qty } : p
        ),
        movements: [movement, ...state.movements],
      };
    }

    case 'ADJUST_STOCK': {
      const product = state.products.find((p: Product) => p.id === action.productId);
      if (!product) return state;
      const nextStock = product.stock + action.qtyChange;
      if (nextStock < 0) return state;
      const movement: StockMovement = {
        id: `mv-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        productId: product.id,
        productName: product.name,
        type: action.movementType,
        qtyChange: action.qtyChange,
        reason: action.reason,
        timestamp: new Date().toLocaleString('en-US', {
          month: 'numeric', day: 'numeric', year: 'numeric',
          hour: 'numeric', minute: '2-digit', hour12: true,
        }),
      };
      return {
        ...state,
        products: state.products.map((p: Product) =>
          p.id === action.productId ? { ...p, stock: nextStock } : p
        ),
        movements: [movement, ...state.movements],
      };
    }

    case 'SAVE_DRAFT': {
      const exists = state.drafts.some((d) => d.id === action.draft.id);
      return {
        ...state,
        drafts: exists
          ? state.drafts.map((d) => (d.id === action.draft.id ? action.draft : d))
          : [action.draft, ...state.drafts],
      };
    }

    case 'DELETE_DRAFT':
      return {
        ...state,
        drafts: state.drafts.filter((d) => d.id !== action.draftId),
      };

    case 'ADD_PHOTO_CAPTURE':
      return {
        ...state,
        photoCaptures: [action.capture, ...state.photoCaptures],
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
  activeCampaign: mockCampaigns[1] || mockCampaigns[0],
  movements: [],
  drafts: [],
  photoCaptures: [],
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
  getMovementsForProduct: (productId: string) => StockMovement[];
  getDraftsList: () => Draft[];
  getPhotoCapturesForOutlet: (outletId: string) => OutletPhotoCapture[];
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

  const getMovementsForProduct = (productId: string) =>
    state.movements.filter((m: StockMovement) => m.productId === productId);

  const getDraftsList = () => state.drafts;

  const getPhotoCapturesForOutlet = (outletId: string) =>
    state.photoCaptures.filter((c: OutletPhotoCapture) => c.outletId === outletId);

  return (
    <FieldContext.Provider
      value={{
        state, dispatch, getSalesForOutlet, getOrdersForOutlet, getSurveysForOutlet,
        getSkipForOutlet, getOutlet, getMovementsForProduct, getDraftsList, getPhotoCapturesForOutlet,
      }}
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
