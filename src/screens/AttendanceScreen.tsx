import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Image, Alert, ScrollView } from 'react-native';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../theme/ThemeContext';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Pill } from '../components/Pill';
import { Icon } from '../components/Icon';
import { RouteName, Campaign } from '../types';

interface AttendanceScreenProps {
  campaignData?: Campaign;
  onClockInSuccess: (campaign: Campaign) => void;
  onNavigate: (route: RouteName, data?: any) => void;
}

export const AttendanceScreen: React.FC<AttendanceScreenProps> = ({
  campaignData,
  onClockInSuccess,
  onNavigate,
}) => {
  const theme = useTheme();
  const styles = createStyles(theme);
  const [gpsLocation, setGpsLocation] = useState<string>('');
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsTimestamp, setGpsTimestamp] = useState<string>('');
  const [gpsError, setGpsError] = useState<string>('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [loadingGps, setLoadingGps] = useState(false);

  useEffect(() => {
    // Auto capture the device's real location on mount
    captureGps();
  }, []);

  const captureGps = async () => {
    setLoadingGps(true);
    setGpsError('');

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setGpsError('Location permission denied. Enable it in device settings to clock in.');
        setGpsLocation('');
        setGpsCoords(null);
        return;
      }

      const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      setGpsCoords({ lat, lng });

      const nowStr = new Date().toLocaleString('en-US', {
        month: 'numeric', day: 'numeric', year: 'numeric',
        hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true,
      });
      setGpsTimestamp(nowStr);

      let placeLabel = '';
      try {
        const places = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
        const place = places?.[0];
        if (place) {
          placeLabel = [place.district || place.subregion, place.city || place.region]
            .filter(Boolean)
            .join(', ');
        }
      } catch (geocodeErr) {
        // Reverse geocoding can fail offline — real coordinates still stand on their own.
      }

      setGpsLocation(
        placeLabel
          ? `${placeLabel} · ${lat.toFixed(4)}, ${lng.toFixed(4)}`
          : `${lat.toFixed(4)}, ${lng.toFixed(4)}`
      );
    } catch (e) {
      setGpsError('Could not read device location. Check GPS/location services and retry.');
      setGpsLocation('');
      setGpsCoords(null);
    } finally {
      setLoadingGps(false);
    }
  };

  const captureFace = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Camera Permission Needed', 'Enable camera access to take your shift selfie.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        quality: 0.7,
        cameraType: ImagePicker.CameraType.front,
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        setPhotoUri(result.assets[0].uri);
      }
    } catch (e) {
      Alert.alert('Camera Error', 'Could not open the camera. Please try again.');
    }
  };

  const handleFinishClockIn = () => {
    if (!gpsLocation) {
      Alert.alert('GPS Location Required', 'We need your real GPS location to verify your territory before clocking in.');
      return;
    }
    if (!photoUri) {
      Alert.alert('Selfie Required', 'Please take a selfie snapshot before completing attendance clock-in.');
      return;
    }
    const camp: Campaign = campaignData || {
      id: 'c2',
      name: 'FreshMart Retail Drive',
      type: 'Sales Drive',
      category: 'Mixed',
      progress: 42,
      target: '84 / 200 units',
      color: '#1A9B8F',
      beat: 'Victoria Island',
      modules: ['sales', 'orders', 'merchandising'],
      ctaType: 'outlets',
    };
    onClockInSuccess(camp);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Clock In & Selfie"
        subtitle={campaignData ? campaignData.name : 'Field Shift Verification'}
        onNavigate={onNavigate}
        onBackPress={() => onNavigate('campaignSelect')}
      />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.introCard}>
          <Text style={styles.introKicker}>AUTOMATED ATTENDANCE VERIFICATION</Text>
          <Text style={styles.introTitle}>Verify Territory & Identity</Text>
          <Text style={styles.introSub}>
            Your GPS coordinates are auto-captured in the background. Take a clear front selfie to confirm your shift.
          </Text>
        </View>

        {/* GPS Card */}
        <Card style={styles.sectionCard}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.iconBox}>
              <Icon name="map-pin" size={20} color={theme.colors.primaryLight} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardHeaderTitle}>GPS Location Tag</Text>
              <Text style={styles.cardHeaderSub}>Auto-captured background verification</Text>
            </View>
            <Pill color={gpsLocation ? theme.colors.emerald : gpsError ? theme.colors.red : theme.colors.amber}>
              {gpsLocation ? 'Captured' : gpsError ? 'Failed' : 'Acquiring...'}
            </Pill>
          </View>

          <View style={styles.gpsDisplayBox}>
            <Text style={styles.gpsLabel}>CURRENT LOCATION</Text>
            <Text style={styles.gpsValue}>
              {gpsLocation || gpsError || 'Fetching real-time GPS coordinates...'}
            </Text>
            {gpsTimestamp && gpsLocation ? <Text style={styles.gpsTime}>{gpsTimestamp}</Text> : null}
          </View>

          <Button
            title={loadingGps ? 'Refreshing Location...' : 'Re-verify GPS Location'}
            onPress={captureGps}
            variant="outline"
            loading={loadingGps}
            iconName="compass"
            style={styles.retakeBtn}
          />
        </Card>

        {/* Selfie Photo Card */}
        <Card style={styles.sectionCard}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.iconBox}>
              <Icon name="camera" size={20} color={theme.colors.primaryLight} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardHeaderTitle}>Take Selfie</Text>
              <Text style={styles.cardHeaderSub}>Front-camera snapshot, auto-fit — no cropping needed</Text>
            </View>
          </View>

          <View style={styles.photoContainer}>
            {photoUri ? (
              <View style={styles.previewBox}>
                <Image source={{ uri: photoUri }} style={styles.previewImage} resizeMode="cover" />
                <View style={styles.verifiedBadge}>
                  <Icon name="check" size={14} color="#FFF" />
                  <Text style={styles.verifiedText}>Ready</Text>
                </View>
              </View>
            ) : (
              <View style={styles.placeholderBox}>
                <Icon name="camera" size={36} color={theme.colors.darkMuted} />
                <Text style={styles.placeholderText}>Tap below to take your shift selfie</Text>
                <Text style={styles.placeholderSub}>Front camera will open automatically</Text>
              </View>
            )}
          </View>

          <Button
            title={photoUri ? 'Retake Selfie Photo' : 'Take Selfie Snapshot'}
            onPress={captureFace}
            variant={photoUri ? 'outline' : 'primary'}
            iconName="camera"
            style={styles.retakeBtn}
          />
        </Card>

        <Button
          title="Confirm & Start Shift →"
          onPress={handleFinishClockIn}
          variant="primary"
          size="large"
          disabled={!photoUri || !gpsLocation}
          style={styles.submitBtn}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.darkBg },
  scroll: { padding: theme.spacing.lg, gap: theme.spacing.md, paddingBottom: 40 },
  introCard: { gap: 4 },
  introKicker: { fontFamily: theme.fonts.bold, fontSize: 11, color: theme.colors.primaryLight, letterSpacing: 1 },
  introTitle: { fontFamily: theme.fonts.display, fontSize: 22, color: theme.colors.darkText },
  introSub: { fontFamily: theme.fonts.regular, fontSize: 13, color: theme.colors.darkMuted, lineHeight: 19 },
  sectionCard: { backgroundColor: theme.colors.darkCard, borderColor: theme.colors.darkBorder, gap: theme.spacing.md },
  cardHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
  iconBox: { width: 36, height: 36, borderRadius: 18, backgroundColor: theme.colors.darkSurface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.colors.darkBorder },
  cardHeaderTitle: { fontFamily: theme.fonts.bold, fontSize: 16, color: theme.colors.darkText },
  cardHeaderSub: { fontFamily: theme.fonts.regular, fontSize: 12, color: theme.colors.darkMuted },
  gpsDisplayBox: { backgroundColor: theme.colors.darkSurface, padding: theme.spacing.md, borderRadius: theme.radius.md, borderWidth: 1, borderColor: theme.colors.darkBorder, gap: 4 },
  gpsLabel: { fontFamily: theme.fonts.bold, fontSize: 10, color: theme.colors.darkMuted, letterSpacing: 0.8 },
  gpsValue: { fontFamily: theme.fonts.semibold, fontSize: 14, color: theme.colors.darkText },
  gpsTime: { fontFamily: theme.fonts.regular, fontSize: 11, color: theme.colors.darkMuted },
  photoContainer: { alignItems: 'center', justifyContent: 'center', marginVertical: 4 },
  previewBox: { position: 'relative', width: 140, height: 160, borderRadius: theme.radius.lg, overflow: 'hidden', borderWidth: 2, borderColor: theme.colors.primaryLight },
  previewImage: { width: '100%', height: '100%' },
  verifiedBadge: { position: 'absolute', bottom: 8, right: 8, backgroundColor: theme.colors.emerald, paddingHorizontal: 8, paddingVertical: 4, borderRadius: theme.radius.sm, flexDirection: 'row', alignItems: 'center', gap: 4 },
  verifiedText: { fontFamily: theme.fonts.bold, fontSize: 10, color: '#FFF' },
  placeholderBox: { width: '100%', height: 140, borderRadius: theme.radius.md, borderStyle: 'dashed', borderWidth: 1.5, borderColor: theme.colors.darkBorder, backgroundColor: theme.colors.darkSurface, alignItems: 'center', justifyContent: 'center', gap: 6 },
  placeholderText: { fontFamily: theme.fonts.semibold, fontSize: 13, color: theme.colors.darkText },
  placeholderSub: { fontFamily: theme.fonts.regular, fontSize: 11, color: theme.colors.darkMuted },
  retakeBtn: { width: '100%' },
  submitBtn: { marginTop: theme.spacing.sm },
});
