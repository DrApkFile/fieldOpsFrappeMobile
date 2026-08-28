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
import { logout } from './src/services/api';
import { FieldProvider, useFieldStore } from './src/store/useFieldStore';
import { BottomTabs } from './src/components/BottomTabs';

// Screens
import { SplashScreen } from './src/screens/SplashScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { ForgotPasswordScreen } from './src/screens/ForgotPasswordScreen';
import { CampaignSelectScreen } from './src/screens/CampaignSelectScreen';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { AgentDashboardScreen } from './src/screens/AgentDashboardScreen';
import { CampaignsScreen } from './src/screens/CampaignsScreen';
import { CampaignDetailScreen } from './src/screens/CampaignDetailScreen';
import { AttendanceScreen } from './src/screens/AttendanceScreen';
import { AttendanceSuccessScreen } from './src/screens/AttendanceSuccessScreen';
import { LeadsScreen } from './src/screens/LeadsScreen';
import { LeadFormScreen } from './src/screens/LeadFormScreen';
import { LeadDetailScreen } from './src/screens/LeadDetailScreen';
import { LeadUpdateScreen } from './src/screens/LeadUpdateScreen';
import { EditLeadScreen } from './src/screens/EditLeadScreen';
import { LeadSurveysScreen } from './src/screens/LeadSurveysScreen';
import { LeadSurveyDetailScreen } from './src/screens/LeadSurveyDetailScreen';
import { LeadSurveyFormScreen } from './src/screens/LeadSurveyFormScreen';
import { LeadSurveyReviewScreen } from './src/screens/LeadSurveyReviewScreen';
import { PipelineOverviewScreen } from './src/screens/PipelineOverviewScreen';
import { InventoryScreen } from './src/screens/InventoryScreen';
import { ReconcileScreen } from './src/screens/ReconcileScreen';
import { ProductCatalogScreen } from './src/screens/ProductCatalogScreen';
import { ProductDetailScreen } from './src/screens/ProductDetailScreen';
import { NotificationsScreen } from './src/screens/NotificationsScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { ProfileDetailScreen } from './src/screens/ProfileDetailScreen';
import { DraftsListScreen } from './src/screens/DraftsListScreen';
import { SyncScreen } from './src/screens/SyncScreen';
import { SuccessScreen } from './src/screens/SuccessScreen';
import { EODSummaryScreen } from './src/screens/EODSummaryScreen';

// Outlet Workspace Screens
import { OutletsScreen } from './src/screens/OutletsScreen';
import { AddOutletScreen } from './src/screens/AddOutletScreen';
import { OutletDetailScreen } from './src/screens/OutletDetailScreen';
import { EditOutletScreen } from './src/screens/EditOutletScreen';
import { OutletActivityScreen } from './src/screens/outletActivity/OutletActivityScreen';
import { SaleReceiptScreen } from './src/screens/SaleReceiptScreen';
import { OrderSuccessScreen } from './src/screens/OrderSuccessScreen';
import { SurveySuccessScreen } from './src/screens/SurveySuccessScreen';
import { OrdersListScreen } from './src/screens/OrdersListScreen';
import { TransactionDetailScreen } from './src/screens/TransactionDetailScreen';
import { OutletTransactionsScreen } from './src/screens/OutletTransactionsScreen';
import { OutletSurveysScreen } from './src/screens/OutletSurveysScreen';
import { OutletSurveyFormScreen } from './src/screens/OutletSurveyFormScreen';
import { OutletSurveyReviewScreen } from './src/screens/OutletSurveyReviewScreen';

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

  const [appStage, setAppStage] = useState<'splash' | 'login' | 'campaignSelect' | 'app'>('splash');
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

  const handleUpdateLead = (updated: Lead) => {
    setLeadsList((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
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
        <SplashScreen onComplete={() => setAppStage('login')} />
        <StatusBar style={statusBarStyle} />
      </>
    );
  }

  // 2. Auth Stage (Login & Forgot Password)
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

  // 3. Post-Login Campaign Selection & Clock-in Stage
  if (appStage === 'campaignSelect') {
    if (route === 'attendance') {
      return (
        <>
          <AttendanceScreen
            campaignData={routeData?.campaign || activeCampaign}
            onNavigate={navigate}
          />
          <StatusBar style={statusBarStyle} />
        </>
      );
    }

    if (route === 'attendanceSuccess') {
      return (
        <>
          <AttendanceSuccessScreen
            onNavigate={navigate}
            onClockInSuccess={handleClockInComplete}
            routeData={routeData}
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
          onBackToLogin={() => setAppStage('login')}
        />
        <StatusBar style={statusBarStyle} />
      </>
    );
  }

  // 4. Main App Screens (with Bottom Tab Bar for Main Tabs)
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
            onNavigate={navigate}
          />
        );
      case 'attendanceSuccess':
        return (
          <AttendanceSuccessScreen
            onNavigate={navigate}
            onClockInSuccess={handleClockInComplete}
            routeData={routeData}
          />
        );
      case 'leads':
        return <LeadsScreen onNavigate={navigate} leadsList={leadsList} />;
      case 'leadForm':
        return <LeadFormScreen onNavigate={navigate} onAddLead={handleAddLead} />;
      case 'leadDetail':
        return <LeadDetailScreen onNavigate={navigate} leadData={routeData} />;
      case 'leadUpdate':
        return <LeadUpdateScreen onNavigate={navigate} leadData={routeData} onUpdateLead={handleUpdateLead} />;
      case 'editLead':
        return <EditLeadScreen onNavigate={navigate} leadData={routeData} onUpdateLead={handleUpdateLead} />;
      case 'leadSurveys':
        return <LeadSurveysScreen onNavigate={navigate} leadData={routeData} />;
      case 'leadSurveyDetail':
        return <LeadSurveyDetailScreen onNavigate={navigate} routeData={routeData} />;
      case 'leadSurveyForm':
        return <LeadSurveyFormScreen onNavigate={navigate} routeData={routeData} />;
      case 'leadSurveyReview':
        return <LeadSurveyReviewScreen onNavigate={navigate} routeData={routeData} />;
      case 'pipelineOverview':
        return <PipelineOverviewScreen onNavigate={navigate} leadsList={leadsList} />;
      case 'ordersList':
        return <OrdersListScreen onNavigate={navigate} />;
      case 'transactionDetail':
        return <TransactionDetailScreen onNavigate={navigate} routeData={routeData} />;
      case 'outletTransactions':
        return <OutletTransactionsScreen onNavigate={navigate} outletData={routeData} />;
      case 'outletSurveys':
        return <OutletSurveysScreen onNavigate={navigate} routeData={routeData} />;
      case 'outletSurveyForm':
        return <OutletSurveyFormScreen onNavigate={navigate} routeData={routeData} />;
      case 'outletSurveyReview':
        return <OutletSurveyReviewScreen onNavigate={navigate} routeData={routeData} />;
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
      case 'sync':
        return <SyncScreen onNavigate={navigate} />;
      case 'notifications':
        return <NotificationsScreen onNavigate={navigate} />;
      case 'profile':
        return (
          <ProfileScreen
            onNavigate={navigate}
            onLogout={() => {
              logout();
              setAppStage('login');
              setRoute('home');
            }}
          />
        );
      case 'profileDetail':
        return <ProfileDetailScreen onNavigate={navigate} />;
      case 'eodSummary':
        return <EODSummaryScreen onNavigate={navigate} leadsList={leadsList} />;
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
