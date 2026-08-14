import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, Pressable, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../../../theme/ThemeContext';
import { Card } from '../../../components/Card';
import { Button } from '../../../components/Button';
import { Icon } from '../../../components/Icon';
import { useFieldStore } from '../../../store/useFieldStore';

interface PhotoCaptureTabProps {
  outletId: string;
  campaignId: string;
}

export const PhotoCaptureTab: React.FC<PhotoCaptureTabProps> = ({ outletId, campaignId }) => {
  const theme = useTheme();
  const styles = createStyles(theme);
  const { dispatch, getPhotoCapturesForOutlet } = useFieldStore();

  const existingCaptures = getPhotoCapturesForOutlet(outletId);
  const [localUri, setLocalUri] = useState<string | null>(existingCaptures[0]?.photoUri || null);

  const handleCapture = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Camera Permission Needed', 'Enable camera access to capture a customer photo.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.7 });
      if (!result.canceled && result.assets?.[0]?.uri) {
        setLocalUri(result.assets[0].uri);
      }
    } catch (e) {
      Alert.alert('Camera Error', 'Could not open the camera. Please try again.');
    }
  };

  const handleRemove = () => setLocalUri(null);

  const handleSave = () => {
    if (!localUri) return;
    dispatch({
      type: 'ADD_PHOTO_CAPTURE',
      capture: {
        id: `photo-${Date.now()}`,
        outletId,
        campaignId,
        photoUri: localUri,
        timestamp: new Date().toLocaleString('en-US', {
          month: 'numeric', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true,
        }),
      },
    });
    Alert.alert('Photo Saved', 'Customer photo capture stored for this visit.');
  };

  return (
    <View style={styles.container}>
      <Card style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>CUSTOMER PHOTO CAPTURE</Text>
        <Text style={styles.hint}>Capture a reference photo of the storefront or customer for this visit.</Text>

        {localUri ? (
          <View style={styles.previewBox}>
            <Image source={{ uri: localUri }} style={styles.previewImage} resizeMode="cover" />
            <Pressable onPress={handleRemove} style={styles.removeBadge}>
              <Icon name="x" size={14} color="#FFF" />
            </Pressable>
          </View>
        ) : (
          <View style={styles.placeholderBox}>
            <Icon name="camera" size={32} color={theme.colors.darkMuted} />
            <Text style={styles.placeholderText}>No photo captured yet</Text>
          </View>
        )}

        <View style={styles.actionsRow}>
          <Button
            title={localUri ? 'Replace Photo' : 'Capture Photo'}
            onPress={handleCapture}
            variant={localUri ? 'outline' : 'primary'}
            iconName="camera"
            style={{ flex: 1 }}
          />
          {localUri && (
            <Button title="Save" onPress={handleSave} variant="primary" style={{ flex: 1 }} />
          )}
        </View>
      </Card>

      {existingCaptures.length > 0 && (
        <Text style={styles.savedNote}>{existingCaptures.length} photo{existingCaptures.length === 1 ? '' : 's'} saved for this outlet.</Text>
      )}
    </View>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: { gap: theme.spacing.sm },
  sectionCard: { backgroundColor: theme.colors.darkCard, borderColor: theme.colors.darkBorder, gap: theme.spacing.sm },
  sectionTitle: { fontFamily: theme.fonts.bold, fontSize: 11, color: theme.colors.darkMuted, letterSpacing: 0.8 },
  hint: { fontFamily: theme.fonts.regular, fontSize: 12, color: theme.colors.darkMuted, marginTop: -4 },
  previewBox: { position: 'relative', width: '100%', height: 180, borderRadius: theme.radius.lg, overflow: 'hidden' },
  previewImage: { width: '100%', height: '100%' },
  removeBadge: {
    position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center',
  },
  placeholderBox: {
    width: '100%', height: 160, borderRadius: theme.radius.md, borderStyle: 'dashed', borderWidth: 1.5,
    borderColor: theme.colors.darkBorder, backgroundColor: theme.colors.darkSurface,
    alignItems: 'center', justifyContent: 'center', gap: 6,
  },
  placeholderText: { fontFamily: theme.fonts.semibold, fontSize: 13, color: theme.colors.darkMuted },
  actionsRow: { flexDirection: 'row', gap: theme.spacing.sm },
  savedNote: { fontFamily: theme.fonts.regular, fontSize: 12, color: theme.colors.darkMuted, textAlign: 'center' },
});
