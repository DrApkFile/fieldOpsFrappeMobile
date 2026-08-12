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
import { mockLeads, mockCampaigns } from './src/services/mockService';
import { FieldProvider } from './src/store/useFieldStore';
import { BottomTabs } from './src/components/BottomTabs';

// Screens
import { SplashScreen } from './src/screens/SplashScreen';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { ForgotPasswordScreen } from './src/screens/ForgotPasswordScreen';
import { CampaignSelectScreen } from './src/screens/CampaignSelectScreen';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { CampaignsScreen } from './src/screens/CampaignsScreen';
import { CampaignDetailScreen } from './src/screens/CampaignDetailScreen';
import { AttendanceScreen } from './src/screens/AttendanceScreen';
import { BeatScreen } from './src/screens/BeatScreen';
import { SurveysScreen } from './src/screens/SurveysScreen';
import { SurveyFormScreen } from './src/screens/SurveyFormScreen';
import { LeadsScreen } from './src/screens/LeadsScreen';
import { LeadFormScreen } from './src/screens/LeadFormScreen';
import { LeadDetailScreen } from './src/screens/LeadDetailScreen';
import { LeadUpdateScreen } from './src/screens/LeadUpdateScreen';
import { SalesScreen } from './src/screens/SalesScreen';
import { InventoryScreen } from './src/screens/InventoryScreen';
import { ReconcileScreen } from './src/screens/ReconcileScreen';
import { NotificationsScreen } from './src/screens/NotificationsScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { SyncScreen } from './src/screens/SyncScreen';
import { SuccessScreen } from './src/screens/SuccessScreen';
import { EODSummaryScreen } from './src/screens/EODSummaryScreen';

// Outlet Workspace Screens
import { OutletsScreen } from './src/screens/OutletsScreen';
import { AddOutletScreen } from './src/screens/AddOutletScreen';
import { OutletDetailScreen } from './src/screens/OutletDetailScreen';
import { EditOutletScreen } from './src/screens/EditOutletScreen';
import { NewSaleScreen } from './src/screens/NewSaleScreen';
import { CustomerSelectScreen } from './src/screens/CustomerSelectScreen';
import { SaleReceiptScreen } from './src/screens/SaleReceiptScreen';
import { NewOrderScreen } from './src/screens/NewOrderScreen';
import { OrderReviewScreen } from './src/screens/OrderReviewScreen';
import { OrderSuccessScreen } from './src/screens/OrderSuccessScreen';
import { NewSurveyScreen } from './src/screens/NewSurveyScreen';
import { SurveySuccessScreen } from './src/screens/SurveySuccessScreen';

export default function App() {
  return (
    <ThemeProvider>
      <AppInner />
    </ThemeProvider>
  );
}

function AppInner() {
  const theme = useTheme();
  const styles = createStyles(theme);
  const statusBarStyle = theme.mode === 'dark' ? 'light' : 'dark';

  const [fontsLoaded] = useFonts({
    SourceSans3_400Regular,
    SourceSans3_600SemiBold,
    SourceSans3_700Bold,
  });

  const [appStage, setAppStage] = useState<'splash' | 'onboarding' | 'login' | 'campaignSelect' | 'app'>('splash');
  const [route, setRoute] = useState<RouteName>('home');
  const [routeData, setRouteData] = useState<any>(null);
  const [activeCampaign, setActiveCampaign] = useState<Campaign>(mockCampaigns[1] || mockCampaigns[0]);
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
    const defaultRoute = selectedCampaign.ctaType === 'outlets' ? 'outlets' : 'home';
    setRoute(defaultRoute);
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
      <FieldProvider>
        <SplashScreen onComplete={() => setAppStage('onboarding')} />
        <StatusBar style={statusBarStyle} />
      </FieldProvider>
    );
  }

  // 2. Native Swipe Onboarding Stage
  if (appStage === 'onboarding') {
    return (
      <FieldProvider>
        <OnboardingScreen onFinish={() => setAppStage('login')} />
        <StatusBar style={statusBarStyle} />
      </FieldProvider>
    );
  }

  // 3. Auth Stage (Login & Forgot Password)
  if (appStage === 'login') {
    if (route === 'forgot') {
      return (
        <FieldProvider>
          <ForgotPasswordScreen onNavigate={navigate} />
          <StatusBar style={statusBarStyle} />
        </FieldProvider>
      );
    }

    return (
      <FieldProvider>
        <LoginScreen
          onSuccess={() => setAppStage('campaignSelect')}
          onNavigate={navigate}
        />
        <StatusBar style={statusBarStyle} />
      </FieldProvider>
    );
  }

  // 4. Post-Login Campaign Selection & Clock-in Stage
  if (appStage === 'campaignSelect') {
    if (route === 'attendance') {
      return (
        <FieldProvider>
          <AttendanceScreen
            campaignData={routeData?.campaign || activeCampaign}
            onClockInSuccess={handleClockInComplete}
            onNavigate={navigate}
          />
          <StatusBar style={statusBarStyle} />
        </FieldProvider>
      );
    }

    return (
      <FieldProvider>
        <CampaignSelectScreen
          onClockInSuccess={handleClockInComplete}
          onNavigate={navigate}
        />
        <StatusBar style={statusBarStyle} />
      </FieldProvider>
    );
  }

  // 5. Main App Screens (with Bottom Tab Bar for Main Tabs)
  const isMainTab = ['home', 'outlets', 'leads', 'sales', 'profile'].includes(route);

  const renderCurrentScreen = () => {
    switch (route) {
      case 'home':
        return (
          <DashboardScreen
            onNavigate={navigate}
            activeCampaign={activeCampaign}
            onSelectCampaign={(c) => setActiveCampaign(c)}
          />
        );
      case 'outlets':
        return <OutletsScreen onNavigate={navigate} />;
      case 'addOutlet':
        return <AddOutletScreen onNavigate={navigate} />;
      case 'outletDetail':
        return <OutletDetailScreen onNavigate={navigate} outletData={routeData} />;
      case 'editOutlet':
        return <EditOutletScreen onNavigate={navigate} routeData={routeData} />;
      case 'newSale':
        return <NewSaleScreen onNavigate={navigate} routeData={routeData} />;
      case 'customerSelect':
        return <CustomerSelectScreen onNavigate={navigate} routeData={routeData} />;
      case 'saleReceipt':
        return <SaleReceiptScreen onNavigate={navigate} routeData={routeData} />;
      case 'newOrder':
        return <NewOrderScreen onNavigate={navigate} routeData={routeData} />;
      case 'orderReview':
        return <OrderReviewScreen onNavigate={navigate} routeData={routeData} />;
      case 'orderSuccess':
        return <OrderSuccessScreen onNavigate={navigate} routeData={routeData} />;
      case 'newSurvey':
        return <NewSurveyScreen onNavigate={navigate} routeData={routeData} />;
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
      case 'beat':
        return <BeatScreen onNavigate={navigate} />;
      case 'surveys':
        return <SurveysScreen onNavigate={navigate} />;
      case 'surveyForm':
        return <SurveyFormScreen onNavigate={navigate} />;
      case 'leads':
        return <LeadsScreen onNavigate={navigate} leadsList={leadsList} />;
      case 'leadForm':
        return <LeadFormScreen onNavigate={navigate} onAddLead={handleAddLead} />;
      case 'leadDetail':
        return <LeadDetailScreen onNavigate={navigate} leadData={routeData} />;
      case 'leadUpdate':
        return <LeadUpdateScreen onNavigate={navigate} leadData={routeData} />;
      case 'sales':
        return <SalesScreen onNavigate={navigate} />;
      case 'inventory':
        return <InventoryScreen onNavigate={navigate} />;
      case 'reconcile':
        return <ReconcileScreen onNavigate={navigate} />;
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
      case 'sync':
        return <SyncScreen onNavigate={navigate} />;
      case 'eodSummary':
        return <EODSummaryScreen onNavigate={navigate} />;
      default:
        return (
          <DashboardScreen
            onNavigate={navigate}
            activeCampaign={activeCampaign}
            onSelectCampaign={(c) => setActiveCampaign(c)}
          />
        );
    }
  };

  return (
    <FieldProvider>
      <SafeAreaView style={styles.appContainer}>
        {renderCurrentScreen()}
        {isMainTab && <BottomTabs activeRoute={route} onNavigate={navigate} />}
        <StatusBar style={statusBarStyle} />
      </SafeAreaView>
    </FieldProvider>
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
