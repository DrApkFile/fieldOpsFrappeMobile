import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {
  useFonts,
  SourceSans3_400Regular,
  SourceSans3_600SemiBold,
  SourceSans3_700Bold,
} from '@expo-google-fonts/source-sans-3';

import { ThemeProvider, useTheme } from './src/theme/ThemeContext';
import { RouteName, Lead, Campaign } from './src/types';
import { mockLeads } from './src/services/mockService';
import { FieldProvider, useFieldStore } from './src/store/useFieldStore';
import { BottomTabs } from './src/components/BottomTabs';

// Screens
import { SplashScreen } from './src/screens/SplashScreen';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { ForgotPasswordScreen } from './src/screens/ForgotPasswordScreen';
import { CampaignSelectScreen } from './src/screens/CampaignSelectScreen';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { AgentDashboardScreen } from './src/screens/AgentDashboardScreen';
import { CampaignsScreen } from './src/screens/CampaignsScreen';
import { CampaignDetailScreen } from './src/screens/CampaignDetailScreen';
import { AttendanceScreen } from './src/screens/AttendanceScreen';
import { LeadsScreen } from './src/screens/LeadsScreen';
import { LeadFormScreen } from './src/screens/LeadFormScreen';
import { LeadDetailScreen } from './src/screens/LeadDetailScreen';
import { LeadUpdateScreen } from './src/screens/LeadUpdateScreen';
import { PipelineOverviewScreen } from './src/screens/PipelineOverviewScreen';
import { InventoryScreen } from './src/screens/InventoryScreen';
import { ReconcileScreen } from './src/screens/ReconcileScreen';
import { ProductCatalogScreen } from './src/screens/ProductCatalogScreen';
import { ProductDetailScreen } from './src/screens/ProductDetailScreen';
import { NotificationsScreen } from './src/screens/NotificationsScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { DraftsListScreen } from './src/screens/DraftsListScreen';
import { SuccessScreen } from './src/screens/SuccessScreen';
import { EODSummaryScreen } from './src/screens/EODSummaryScreen';

// Outlet Workspace Screens
import { OutletsScreen } from './src/screens/OutletsScreen';
import { AddOutletScreen } from './src/screens/AddOutletScreen';
import { OutletDetailScreen } from './src/screens/OutletDetailScreen';
import { EditOutletScreen } from './src/screens/EditOutletScreen';
import { OutletActivityScreen } from './src/screens/outletActivity/OutletActivityScreen';
import { CustomerSelectScreen } from './src/screens/CustomerSelectScreen';
import { SaleReceiptScreen } from './src/screens/SaleReceiptScreen';
import { OrderSuccessScreen } from './src/screens/OrderSuccessScreen';
import { SurveySuccessScreen } from './src/screens/SurveySuccessScreen';
import { OrdersListScreen } from './src/screens/OrdersListScreen';
import { TransactionDetailScreen } from './src/screens/TransactionDetailScreen';

export default function App() {
  return (
    <ThemeProvider>
      <FieldProvider>
        <AppInner />
      </FieldProvider>
    </ThemeProvider>
  );
}

function AppInner() {
  const theme = useTheme();
  const styles = createStyles(theme);
  const statusBarStyle = theme.mode === 'dark' ? 'light' : 'dark';

  // Active campaign lives in the shared store so every screen (Dashboard,
  // Attendance, Outlet Activity's module gating) reads the same value instead
  // of silently diverging.
  const { state, dispatch } = useFieldStore();
  const activeCampaign = state.activeCampaign;
  const setActiveCampaign = (campaign: Campaign) => dispatch({ type: 'SET_ACTIVE_CAMPAIGN', campaign });

  const [fontsLoaded] = useFonts({
    SourceSans3_400Regular,
    SourceSans3_600SemiBold,
    SourceSans3_700Bold,
  });

  const [appStage, setAppStage] = useState<'splash' | 'onboarding' | 'login' | 'campaignSelect' | 'app'>('splash');
  const [route, setRoute] = useState<RouteName>('home');
  const [routeData, setRouteData] = useState<any>(null);
  const [leadsList, setLeadsList] = useState<Lead[]>(mockLeads);

  const navigate = (nextRoute: RouteName, data?: any) => {
    if (data !== undefined) setRouteData(data);
    setRoute(nextRoute);
  };

  const handleAddLead = (newLead: Lead) => {
    setLeadsList((prev) => [newLead, ...prev]);
  };

  const handleClockInComplete = (selectedCampaign: Campaign) => {
    setActiveCampaign(selectedCampaign);
    setAppStage('app');
    setRoute('home');
  };

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primaryLight} />
      </View>
    );
  }

  // 1. Animated Splash Stage
  if (appStage === 'splash') {
    return (
      <>
        <SplashScreen onComplete={() => setAppStage('onboarding')} />
        <StatusBar style={statusBarStyle} />
      </>
    );
  }

  // 2. Native Swipe Onboarding Stage
  if (appStage === 'onboarding') {
    return (
      <>
        <OnboardingScreen onFinish={() => setAppStage('login')} />
        <StatusBar style={statusBarStyle} />
      </>
    );
  }

  // 3. Auth Stage (Login & Forgot Password)
  if (appStage === 'login') {
    if (route === 'forgot') {
      return (
        <>
          <ForgotPasswordScreen onNavigate={navigate} />
          <StatusBar style={statusBarStyle} />
        </>
      );
    }

    return (
      <>
        <LoginScreen
          onSuccess={() => setAppStage('campaignSelect')}
          onNavigate={navigate}
        />
        <StatusBar style={statusBarStyle} />
      </>
    );
  }

  // 4. Post-Login Campaign Selection & Clock-in Stage
  if (appStage === 'campaignSelect') {
    if (route === 'attendance') {
      return (
        <>
          <AttendanceScreen
            campaignData={routeData?.campaign || activeCampaign}
            onClockInSuccess={handleClockInComplete}
            onNavigate={navigate}
          />
          <StatusBar style={statusBarStyle} />
        </>
      );
    }

    return (
      <>
        <CampaignSelectScreen
          onClockInSuccess={handleClockInComplete}
          onNavigate={navigate}
        />
        <StatusBar style={statusBarStyle} />
      </>
    );
  }

  // 5. Main App Screens (with Bottom Tab Bar for Main Tabs)
  const isMainTab = ['home', 'draftsList', 'inventory', 'eodSummary', 'profile'].includes(route);

  const renderCurrentScreen = () => {
    switch (route) {
      case 'home':
        return <DashboardScreen onNavigate={navigate} />;
      case 'dashboard':
        return <AgentDashboardScreen onNavigate={navigate} leadsList={leadsList} />;
      case 'outlets':
        return <OutletsScreen onNavigate={navigate} />;
      case 'addOutlet':
        return <AddOutletScreen onNavigate={navigate} />;
      case 'outletDetail':
        return <OutletDetailScreen onNavigate={navigate} outletData={routeData} />;
      case 'editOutlet':
        return <EditOutletScreen onNavigate={navigate} routeData={routeData} />;
      case 'outletActivity':
        return <OutletActivityScreen onNavigate={navigate} routeData={routeData} />;
      case 'customerSelect':
        return <CustomerSelectScreen onNavigate={navigate} routeData={routeData} />;
      case 'saleReceipt':
        return <SaleReceiptScreen onNavigate={navigate} routeData={routeData} />;
      case 'orderSuccess':
        return <OrderSuccessScreen onNavigate={navigate} routeData={routeData} />;
      case 'surveySuccess':
        return <SurveySuccessScreen onNavigate={navigate} routeData={routeData} />;
      case 'campaigns':
        return <CampaignsScreen onNavigate={navigate} />;
      case 'campaignDetail':
        return <CampaignDetailScreen onNavigate={navigate} campaignData={routeData} />;
      case 'attendance':
        return (
          <AttendanceScreen
            campaignData={routeData?.campaign || activeCampaign}
            onClockInSuccess={handleClockInComplete}
            onNavigate={navigate}
          />
        );
      case 'leads':
        return <LeadsScreen onNavigate={navigate} leadsList={leadsList} />;
      case 'leadForm':
        return <LeadFormScreen onNavigate={navigate} onAddLead={handleAddLead} />;
      case 'leadDetail':
        return <LeadDetailScreen onNavigate={navigate} leadData={routeData} />;
      case 'leadUpdate':
        return <LeadUpdateScreen onNavigate={navigate} leadData={routeData} />;
      case 'pipelineOverview':
        return <PipelineOverviewScreen onNavigate={navigate} leadsList={leadsList} />;
      case 'ordersList':
        return <OrdersListScreen onNavigate={navigate} />;
      case 'transactionDetail':
        return <TransactionDetailScreen onNavigate={navigate} routeData={routeData} />;
      case 'inventory':
        return <InventoryScreen onNavigate={navigate} />;
      case 'reconcile':
        return <ReconcileScreen onNavigate={navigate} />;
      case 'productCatalog':
        return <ProductCatalogScreen onNavigate={navigate} />;
      case 'productDetail':
        return <ProductDetailScreen onNavigate={navigate} routeData={routeData} />;
      case 'draftsList':
        return <DraftsListScreen onNavigate={navigate} />;
      case 'notifications':
        return <NotificationsScreen onNavigate={navigate} />;
      case 'profile':
        return (
          <ProfileScreen
            onNavigate={navigate}
            onLogout={() => {
              setAppStage('login');
              setRoute('home');
            }}
          />
        );
      case 'eodSummary':
        return <EODSummaryScreen onNavigate={navigate} />;
      default:
        return <DashboardScreen onNavigate={navigate} />;
    }
  };

  return (
    <SafeAreaView style={styles.appContainer}>
      {renderCurrentScreen()}
      {isMainTab && <BottomTabs activeRoute={route} onNavigate={navigate} />}
      <StatusBar style={statusBarStyle} />
    </SafeAreaView>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: theme.colors.darkBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appContainer: {
    flex: 1,
    backgroundColor: theme.colors.darkBg,
  },
});
