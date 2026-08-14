import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Alert } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Header } from '../../components/Header';
import { Icon } from '../../components/Icon';
import { Button } from '../../components/Button';
import { ScrollableTabs, TabItem } from '../../components/ScrollableTabs';
import { useFieldStore } from '../../store/useFieldStore';
import { mockCustomers, generateInvoiceRef, generateOrderRef } from '../../services/mockService';
import { RouteName, Customer, CartLine, Draft, OutletSale, OutletOrder } from '../../types';
import { getStockShortfalls } from '../../utils/cart';
import { useCart } from './useCart';
import { OrderWorkspace } from './OrderWorkspace';
import { StocksTab } from './tabs/StocksTab';
import { PhotoCaptureTab } from './tabs/PhotoCaptureTab';
import { SurveyTab } from './tabs/SurveyTab';
import { SummaryTab } from './tabs/SummaryTab';
import { DockedCartBar } from './components/DockedCartBar';
import { CartSheet } from './components/CartSheet';

interface OutletActivityScreenProps {
  routeData?: {
    outletId?: string;
    initialTab?: string;
    selectedCustomer?: Customer;
    saleCart?: CartLine[];
    orderCart?: CartLine[];
    resumeDraftId?: string;
  };
  onNavigate: (route: RouteName, data?: any) => void;
}

export const OutletActivityScreen: React.FC<OutletActivityScreenProps> = ({ routeData, onNavigate }) => {
  const theme = useTheme();
  const styles = createStyles(theme);
  const { state, dispatch } = useFieldStore();

  const outletId = routeData?.outletId;
  const outlet = state.outlets.find((o) => o.id === outletId);
  const activeCampaign = state.activeCampaign;
  const modules = activeCampaign?.modules || [];
  const surveyConfigs = (activeCampaign?.surveys || []).filter((s) => modules.includes(s.module));

  const tabs: TabItem[] = [
    ...(modules.includes('stock') ? [{ id: 'stocks', label: 'Stocks' }] : []),
    ...(modules.includes('photo') ? [{ id: 'photo', label: 'Customer Photo Capture' }] : []),
    ...(modules.includes('sales') ? [{ id: 'sale', label: 'Sale' }] : []),
    ...(modules.includes('orders') ? [{ id: 'order', label: 'Order' }] : []),
    ...surveyConfigs.map((s) => ({ id: `survey:${s.id}`, label: s.name })),
    { id: 'summary', label: 'Summary' },
  ];

  const [activeTabId, setActiveTabId] = useState<string>(routeData?.initialTab || tabs[0]?.id || 'summary');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer>(routeData?.selectedCustomer || mockCustomers[0]);
  const saleCart = useCart(routeData?.saleCart || []);
  const orderCart = useCart(routeData?.orderCart || []);
  const [cartSheetMode, setCartSheetMode] = useState<'sale' | 'order'>('sale');
  const [cartSheetVisible, setCartSheetVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Hydrate a saved draft on first mount, if resuming one.
  useEffect(() => {
    if (routeData?.resumeDraftId) {
      const draft = state.drafts.find((d) => d.id === routeData.resumeDraftId);
      if (draft) {
        if (draft.mode === 'sale') saleCart.setCart(draft.cart);
        else orderCart.setCart(draft.cart);
        setActiveTabId(draft.mode);
        if (draft.customerId) {
          const cust = mockCustomers.find((c) => c.id === draft.customerId);
          if (cust) setSelectedCustomer(cust);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!outlet) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Outlet Activity" subtitle="Outlet missing" onNavigate={onNavigate} onBackPress={() => onNavigate('outlets')} />
        <View style={styles.missingContainer}>
          <Icon name="alert-circle" size={44} color={theme.colors.amber} />
          <Text style={styles.missingTitle}>This activity needs an outlet.</Text>
          <Button title="Go to Outlets List" onPress={() => onNavigate('outlets')} variant="primary" />
        </View>
      </SafeAreaView>
    );
  }

  const buildDraft = (mode: 'sale' | 'order', cart: CartLine[]): Draft => ({
    id: routeData?.resumeDraftId && cartSheetMode === mode ? routeData.resumeDraftId : `draft-${mode}-${outlet.id}-${Date.now()}`,
    mode,
    outletId: outlet.id,
    outletName: outlet.name,
    customerId: selectedCustomer.id,
    customerName: selectedCustomer.name,
    cart,
    updatedAt: new Date().toLocaleString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true }),
    pendingSync: true,
  });

  const handleBack = () => {
    const dirtyModes: ('sale' | 'order')[] = [];
    if (saleCart.cart.length > 0) dirtyModes.push('sale');
    if (orderCart.cart.length > 0) dirtyModes.push('order');

    if (dirtyModes.length === 0) {
      onNavigate('outletDetail', { outletId: outlet.id });
      return;
    }

    Alert.alert(
      'Unsaved Cart',
      `You have items in your ${dirtyModes.join(' and ')} cart. Save as a draft before leaving?`,
      [
        { text: 'Discard', style: 'destructive', onPress: () => onNavigate('outletDetail', { outletId: outlet.id }) },
        {
          text: 'Save Draft',
          onPress: () => {
            dirtyModes.forEach((mode) => {
              const cart = mode === 'sale' ? saleCart.cart : orderCart.cart;
              dispatch({ type: 'SAVE_DRAFT', draft: buildDraft(mode, cart) });
            });
            onNavigate('outletDetail', { outletId: outlet.id });
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleOpenCart = (mode: 'sale' | 'order') => {
    setCartSheetMode(mode);
    setCartSheetVisible(true);
  };

  const handleChangeCustomer = () => {
    setCartSheetVisible(false);
    onNavigate('customerSelect', {
      returnRoute: 'outletActivity',
      outletId: outlet.id,
      initialTab: activeTabId,
      saleCart: saleCart.cart,
      orderCart: orderCart.cart,
    });
  };

  const handleCheckout = () => {
    const mode = cartSheetMode;
    const activeCart = mode === 'sale' ? saleCart : orderCart;
    if (activeCart.cart.length === 0) return;

    if (mode === 'sale') {
      const shortfalls = getStockShortfalls(activeCart.cart, state.products);
      if (shortfalls.length > 0) return;
    }

    setSubmitting(true);
    const ref = mode === 'sale' ? generateInvoiceRef() : generateOrderRef();
    const nowStr = new Date().toLocaleString('en-US', {
      month: 'numeric', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true,
    });

    activeCart.cart.forEach((line) => {
      if (mode === 'sale') {
        const sale: OutletSale = {
          id: `sale-${Date.now()}-${line.productId}`,
          outletId: outlet.id,
          campaignId: activeCampaign?.id || 'c2',
          productId: line.productId,
          productName: line.productName,
          quantity: line.quantity,
          unitPrice: line.unitPrice,
          discount: line.discount,
          total: line.unitPrice * line.quantity - line.discount,
          customerId: selectedCustomer.id,
          customerName: selectedCustomer.name,
          promoLabel: line.promoLabel,
          timestamp: nowStr,
          invoiceRef: ref,
        };
        dispatch({ type: 'ADD_SALE', sale });
        dispatch({ type: 'DECREMENT_STOCK', productId: line.productId, qty: line.quantity, outletId: outlet.id });
      } else {
        const order: OutletOrder = {
          id: `order-${Date.now()}-${line.productId}`,
          outletId: outlet.id,
          campaignId: activeCampaign?.id || 'c2',
          productId: line.productId,
          productName: line.productName,
          quantity: line.quantity,
          unitPrice: line.unitPrice,
          discount: line.discount,
          total: line.unitPrice * line.quantity - line.discount,
          customerId: selectedCustomer.id,
          customerName: selectedCustomer.name,
          status: 'Pending',
          timestamp: nowStr,
          orderRef: ref,
        };
        dispatch({ type: 'ADD_ORDER', order });
      }
    });

    dispatch({ type: 'MARK_OUTLET_VISITED', outletId: outlet.id });
    if (routeData?.resumeDraftId) dispatch({ type: 'DELETE_DRAFT', draftId: routeData.resumeDraftId });

    activeCart.clear();
    setCartSheetVisible(false);

    setTimeout(() => {
      setSubmitting(false);
      if (mode === 'sale') {
        onNavigate('saleReceipt', { outletId: outlet.id, invoiceRef: ref });
      } else {
        onNavigate('orderSuccess', { outletId: outlet.id, orderRef: ref });
      }
    }, 350);
  };

  const activeCartForBar = activeTabId === 'sale' ? saleCart : activeTabId === 'order' ? orderCart : null;
  const activeSheetCart = cartSheetMode === 'sale' ? saleCart : orderCart;
  const activeSurveyConfig = activeTabId.startsWith('survey:')
    ? surveyConfigs.find((s) => `survey:${s.id}` === activeTabId)
    : undefined;

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Outlet Activity" subtitle={outlet.name} onNavigate={onNavigate} onBackPress={handleBack} />
      <ScrollableTabs tabs={tabs} activeId={activeTabId} onSelect={setActiveTabId} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {activeTabId === 'stocks' && <StocksTab products={state.products} />}
        {activeTabId === 'photo' && <PhotoCaptureTab outletId={outlet.id} campaignId={activeCampaign?.id || 'c2'} />}
        {activeTabId === 'sale' && (
          <OrderWorkspace mode="sale" products={state.products} onAddToCart={(p, q, promo) => saleCart.addProduct(p, q, promo)} />
        )}
        {activeTabId === 'order' && (
          <OrderWorkspace mode="order" products={state.products} onAddToCart={(p, q, promo) => orderCart.addProduct(p, q, promo)} />
        )}
        {activeSurveyConfig && (
          <SurveyTab
            outletId={outlet.id}
            campaignId={activeCampaign?.id || 'c2'}
            surveyConfig={activeSurveyConfig}
            onSubmitted={() => setActiveTabId('summary')}
          />
        )}
        {activeTabId === 'summary' && (
          <SummaryTab
            outletId={outlet.id}
            onOpenTransaction={(kind, ref) => onNavigate('transactionDetail', { kind, ref, outletId: outlet.id })}
          />
        )}
      </ScrollView>

      {activeCartForBar && activeCartForBar.itemCount > 0 && (
        <DockedCartBar
          mode={activeTabId as 'sale' | 'order'}
          itemCount={activeCartForBar.itemCount}
          total={activeCartForBar.total}
          onPress={() => handleOpenCart(activeTabId as 'sale' | 'order')}
        />
      )}

      <CartSheet
        visible={cartSheetVisible}
        mode={cartSheetMode}
        cart={activeSheetCart.cart}
        customer={selectedCustomer}
        subtotal={activeSheetCart.subtotal}
        discount={activeSheetCart.discount}
        total={activeSheetCart.total}
        stockShortfalls={cartSheetMode === 'sale' ? getStockShortfalls(activeSheetCart.cart, state.products) : []}
        submitting={submitting}
        onUpdateQty={activeSheetCart.updateQty}
        onRemoveLine={activeSheetCart.remove}
        onChangeCustomer={handleChangeCustomer}
        onClose={() => setCartSheetVisible(false)}
        onConfirmCheckout={handleCheckout}
      />
    </SafeAreaView>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.darkBg },
  scroll: { padding: theme.spacing.lg, gap: theme.spacing.md, paddingBottom: 120 },
  missingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: theme.spacing.md, padding: theme.spacing.xl },
  missingTitle: { fontFamily: theme.fonts.bold, fontSize: 18, color: theme.colors.darkText, textAlign: 'center' },
});
