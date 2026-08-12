import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Pressable,
  Image,
  Alert,
} from 'react-native';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { theme } from '../theme/theme';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Icon } from '../components/Icon';
import { useFieldStore } from '../store/useFieldStore';
import { RouteName, Outlet } from '../types';

interface AddOutletScreenProps {
  onNavigate: (route: RouteName, data?: any) => void;
}

const OUTLET_TYPES = ['Supermarket', 'Kiosk', 'Pharmacy', 'Wholesale', 'Mini-mart', 'Retail Store'];

export const AddOutletScreen: React.FC<AddOutletScreenProps> = ({ onNavigate }) => {
  const { state, dispatch } = useFieldStore();
  const activeCampaignId = state.activeCampaign?.id || 'c2';

  const [outletType, setOutletType] = useState('Supermarket');
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [outletName, setOutletName] = useState('QuickShop Express');
  const [phone, setPhone] = useState('+234 801 000 0000');
  const [ownerName, setOwnerName] = useState('Mr. Emeka Obi');
  const [ownerMobile, setOwnerMobile] = useState('+234 802 000 0000');
  const [address, setAddress] = useState('12 Marine Rd, Oniru, Lekki');

  // Location Auto-Captured
  const [gpsLocation, setGpsLocation] = useState('Lekki Phase 1, Lagos · 6.4442, 3.4501');
  const [gpsTime, setGpsTime] = useState('');
  const [loadingGps, setLoadingGps] = useState(false);

  // Photo
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    autoCaptureGps();
  }, []);

  const autoCaptureGps = async () => {
    setLoadingGps(true);
    const nowStr = new Date().toLocaleString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
    setGpsTime(nowStr);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        const lat = position.coords.latitude.toFixed(4);
        const lng = position.coords.longitude.toFixed(4);
        setGpsLocation(`Lekki Phase 1, Lagos · ${lat}, ${lng}`);
      }
    } catch (e) {
      // simulated default fallback as shown in screenshot
      setGpsLocation('Lekki Phase 1, Lagos · 6.4442, 3.4501');
    } finally {
      setLoadingGps(false);
    }
  };

  const handleTakePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        // Fallback sample image
        setPhotoUri('https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=500');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.7,
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        setPhotoUri(result.assets[0].uri);
      }
    } catch (e) {
      setPhotoUri('https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=500');
    }
  };

  const handleSubmit = () => {
    if (!outletName.trim()) {
      Alert.alert('Required', 'Please enter an outlet name.');
      return;
    }
    if (!address.trim()) {
      Alert.alert('Required', 'Please enter the outlet address.');
      return;
    }

    setSubmitting(true);
    const newId = `o-${Date.now().toString().slice(-4)}`;
    const newOutlet: Outlet = {
      id: newId,
      name: outletName.trim(),
      type: outletType,
      area: address.includes('Oniru') ? 'Oniru' : address.includes('Ikoyi') ? 'Ikoyi' : 'Lekki Phase 1',
      address: address.trim(),
      phone: phone.trim() || '+234 801 000 0000',
      ownerName: ownerName.trim(),
      ownerPhone: ownerMobile.trim(),
      isOpen: true,
      distance: '1.2 km',
      status: 'pending',
      gps: gpsLocation,
      photoUri: photoUri || undefined,
      campaignId: activeCampaignId,
    };

    dispatch({ type: 'ADD_OUTLET', outlet: newOutlet });

    setTimeout(() => {
      setSubmitting(false);
      onNavigate('outlets');
    }, 400);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Add Outlet"
        subtitle="Register new territory outlet"
        onNavigate={onNavigate}
        onBackPress={() => onNavigate('outlets')}
      />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* CARD 1: OUTLET INFORMATION */}
        <Card style={styles.sectionCard}>
          <Text style={styles.cardSectionTitle}>OUTLET INFORMATION</Text>

          {/* Outlet Type Dropdown */}
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Outlet type</Text>
            <Pressable
              onPress={() => setShowTypeDropdown(!showTypeDropdown)}
              style={styles.dropdownBtn}
            >
              <Text style={styles.dropdownText}>{outletType}</Text>
              <Icon name="chevron-down" size={18} color={theme.colors.darkMuted} />
            </Pressable>

            {showTypeDropdown && (
              <View style={styles.dropdownMenu}>
                {OUTLET_TYPES.map((t) => (
                  <Pressable
                    key={t}
                    onPress={() => {
                      setOutletType(t);
                      setShowTypeDropdown(false);
                    }}
                    style={[styles.dropdownItem, outletType === t && styles.dropdownItemActive]}
                  >
                    <Text style={[styles.dropdownItemText, outletType === t && styles.dropdownItemTextActive]}>
                      {t}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>

          {/* Outlet Name Input */}
          <Input
            label="Outlet name"
            value={outletName}
            onChangeText={setOutletName}
            placeholder="QuickShop Express"
            dark
          />
        </Card>

        {/* CARD 2: CONTACT INFORMATION */}
        <Card style={styles.sectionCard}>
          <Text style={styles.cardSectionTitle}>CONTACT INFORMATION</Text>

          <Input
            label="Phone number"
            value={phone}
            onChangeText={setPhone}
            placeholder="+234 801 000 0000"
            keyboardType="phone-pad"
            dark
          />

          <Input
            label="Owner name"
            value={ownerName}
            onChangeText={setOwnerName}
            placeholder="Mr. Emeka Obi"
            dark
          />

          <Input
            label="Owner mobile"
            value={ownerMobile}
            onChangeText={setOwnerMobile}
            placeholder="+234 802 000 0000"
            keyboardType="phone-pad"
            dark
          />
        </Card>

        {/* CARD 3: LOCATION */}
        <Card style={styles.sectionCard}>
          <Text style={styles.cardSectionTitle}>LOCATION</Text>

          <Input
            label="Address"
            value={address}
            onChangeText={setAddress}
            placeholder="12 Marine Rd, Oniru, Lekki"
            dark
          />

          {/* Auto-Captured Box (Matching Image 3) */}
          <View style={styles.autoCapturedBox}>
            <View style={styles.pinCircle}>
              <Icon name="map-pin" size={18} color={theme.colors.primaryLight} />
            </View>
            <View style={styles.autoCapturedTextCol}>
              <Text style={styles.autoCapturedTag}>AUTO-CAPTURED</Text>
              <Text style={styles.autoCapturedCoords}>{gpsLocation}</Text>
              {gpsTime ? <Text style={styles.autoCapturedTime}>{gpsTime}</Text> : null}
            </View>
          </View>
        </Card>

        {/* CARD 4: PHOTO */}
        <Card style={styles.sectionCard}>
          <Text style={styles.cardSectionTitle}>PHOTO</Text>

          <Pressable onPress={handleTakePhoto} style={styles.photoBox}>
            {photoUri ? (
              <Image source={{ uri: photoUri }} style={styles.photoPreview} />
            ) : (
              <View style={styles.photoEmpty}>
                <View style={styles.cameraIconCircle}>
                  <Icon name="camera" size={24} color={theme.colors.primaryLight} />
                </View>
                <Text style={styles.tapToTake}>Tap to take photo</Text>
                <Text style={styles.photoSub}>Outlet front image · compressed automatically</Text>
              </View>
            )}
          </Pressable>
        </Card>

        {/* Save Button */}
        <Button
          title={submitting ? 'Saving Outlet...' : 'Save Outlet'}
          onPress={handleSubmit}
          variant="primary"
          size="large"
          loading={submitting}
          style={styles.saveBtn}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.darkBg },
  scroll: { padding: theme.spacing.lg, gap: theme.spacing.md, paddingBottom: 60 },
  sectionCard: { backgroundColor: theme.colors.darkCard, borderColor: theme.colors.darkBorder, gap: theme.spacing.sm },
  cardSectionTitle: { fontFamily: theme.fonts.bold, fontSize: 11, color: theme.colors.darkMuted, letterSpacing: 0.8, marginBottom: 4 },
  inputWrapper: { gap: 6 },
  label: { fontFamily: theme.fonts.semibold, fontSize: 13, color: theme.colors.darkText },
  dropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.darkInputBg,
    borderWidth: 1,
    borderColor: theme.colors.darkBorder,
    borderRadius: theme.radius.md,
    height: 48,
    paddingHorizontal: theme.spacing.md,
  },
  dropdownText: { fontFamily: theme.fonts.regular, fontSize: 14, color: theme.colors.darkText },
  dropdownMenu: {
    backgroundColor: theme.colors.darkSurface,
    borderWidth: 1,
    borderColor: theme.colors.darkBorder,
    borderRadius: theme.radius.md,
    overflow: 'hidden',
    marginTop: 4,
  },
  dropdownItem: { paddingHorizontal: theme.spacing.md, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.colors.darkBorder },
  dropdownItemActive: { backgroundColor: theme.colors.primaryBg },
  dropdownItemText: { fontFamily: theme.fonts.regular, fontSize: 14, color: theme.colors.darkMuted },
  dropdownItemTextActive: { color: theme.colors.primaryLight, fontFamily: theme.fonts.bold },
  autoCapturedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    backgroundColor: theme.colors.darkSurface,
    borderWidth: 1,
    borderColor: theme.colors.darkBorder,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    marginTop: 4,
  },
  pinCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: theme.colors.darkCard, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.colors.darkBorder },
  autoCapturedTextCol: { flex: 1, gap: 2 },
  autoCapturedTag: { fontFamily: theme.fonts.bold, fontSize: 10, color: theme.colors.primaryLight, letterSpacing: 0.8 },
  autoCapturedCoords: { fontFamily: theme.fonts.bold, fontSize: 13, color: theme.colors.darkText },
  autoCapturedTime: { fontFamily: theme.fonts.regular, fontSize: 11, color: theme.colors.darkMuted },
  photoBox: {
    width: '100%',
    height: 140,
    borderRadius: theme.radius.lg,
    borderWidth: 1.5,
    borderColor: theme.colors.darkBorder,
    borderStyle: 'dashed',
    backgroundColor: theme.colors.darkSurface,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoPreview: { width: '100%', height: '100%', resizeMode: 'cover' },
  photoEmpty: { alignItems: 'center', justifyContent: 'center', gap: 6 },
  cameraIconCircle: { width: 48, height: 48, borderRadius: 24, backgroundColor: theme.colors.darkCard, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.colors.darkBorder },
  tapToTake: { fontFamily: theme.fonts.bold, fontSize: 14, color: theme.colors.darkText },
  photoSub: { fontFamily: theme.fonts.regular, fontSize: 12, color: theme.colors.darkMuted },
  saveBtn: { marginTop: theme.spacing.sm },
});
