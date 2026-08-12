import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Pressable, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { theme } from '../theme/theme';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Icon } from '../components/Icon';
import { mockSurveyQuestions, submitMockData } from '../services/mockService';
import { RouteName } from '../types';

interface SurveyFormScreenProps {
  onNavigate: (route: RouteName, data?: any) => void;
}

export const SurveyFormScreen: React.FC<SurveyFormScreenProps> = ({ onNavigate }) => {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [gps, setGps] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  const q = mockSurveyQuestions[index];

  const handleAnswer = (val: any) => {
    setAnswers({ ...answers, [q.id]: val });
  };

  const captureShelfPhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Camera Permission', 'Allow camera access to capture survey shelf photo.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.7,
      });
      if (!result.canceled && result.assets?.[0]?.uri) {
        setPhotoUri(result.assets[0].uri);
        handleAnswer(result.assets[0].uri);
      }
    } catch (e) {
      const mockUri = 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=300';
      setPhotoUri(mockUri);
      handleAnswer(mockUri);
    }
  };

  const captureGps = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const pos = await Location.getCurrentPositionAsync({});
        setGps(`${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`);
      } else {
        setGps('6.4474, 3.4723 (Lekki Phase 1)');
      }
    } catch (e) {
      setGps('6.4474, 3.4723 (Lekki Phase 1)');
    }
  };

  const handleNext = async () => {
    if (index < mockSurveyQuestions.length - 1) {
      setIndex(index + 1);
    } else {
      setSubmitting(true);
      await submitMockData();
      setSubmitting(false);
      onNavigate('surveySuccess');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Customer Pulse"
        subtitle={`Question ${index + 1} of ${mockSurveyQuestions.length}`}
        onNavigate={onNavigate}
      />
      <ScrollView contentContainerStyle={styles.content}>
        {/* Progress Bar */}
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${((index + 1) / mockSurveyQuestions.length) * 100}%` }]} />
        </View>

        <Card style={styles.questionCard}>
          <Text style={styles.questionText}>{q.question}</Text>

          {/* Choice Type */}
          {q.type === 'choice' && q.options && (
            <View style={styles.choiceGroup}>
              {q.options.map((opt) => {
                const isSelected = answers[q.id] === opt;
                return (
                  <Pressable
                    key={opt}
                    onPress={() => handleAnswer(opt)}
                    style={[styles.optionItem, isSelected && styles.optionSelected]}
                  >
                    <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>{opt}</Text>
                    <Icon
                      name={isSelected ? 'check-circle' : 'circle'}
                      size={20}
                      color={isSelected ? theme.colors.primary : theme.colors.textMuted}
                    />
                  </Pressable>
                );
              })}
            </View>
          )}

          {/* Rating Type */}
          {q.type === 'rating' && (
            <View style={styles.ratingRow}>
              {[1, 2, 3, 4, 5].map((num) => {
                const isStarred = (answers[q.id] || 0) >= num;
                return (
                  <Pressable key={num} onPress={() => handleAnswer(num)}>
                    <Icon
                      name="star"
                      size={36}
                      color={isStarred ? theme.colors.amber : theme.colors.cardBorder}
                    />
                  </Pressable>
                );
              })}
            </View>
          )}

          {/* Text Type */}
          {q.type === 'text' && (
            <Input
              label="Observation Notes"
              value={answers[q.id] || ''}
              onChangeText={handleAnswer}
              placeholder="Enter details on competitor pricing or positioning..."
              multiline
            />
          )}

          {/* Photo Type */}
          {q.type === 'photo' && (
            <View style={styles.photoContainer}>
              {photoUri ? (
                <Image source={{ uri: photoUri }} style={styles.photoPreview} />
              ) : (
                <Pressable onPress={captureShelfPhoto} style={styles.photoPlaceholder}>
                  <Icon name="camera" size={32} color={theme.colors.primary} />
                  <Text style={styles.photoText}>Tap to Capture Shelf Photo</Text>
                </Pressable>
              )}
              {photoUri && (
                <Button title="Retake Photo" onPress={captureShelfPhoto} variant="outline" size="small" />
              )}
            </View>
          )}
        </Card>

        {/* GPS Auto Tag Card */}
        <Card style={styles.gpsRow}>
          <Icon name="map-pin" size={18} color={theme.colors.teal} />
          <Text style={styles.gpsText}>GPS Tag: {gps || 'Location captured automatically'}</Text>
          {!gps && (
            <Pressable onPress={captureGps}>
              <Text style={styles.gpsAction}>Tag Now</Text>
            </Pressable>
          )}
        </Card>

        {/* Navigation Actions */}
        <View style={styles.navRow}>
          <Button
            title="Previous"
            onPress={() => setIndex(Math.max(0, index - 1))}
            variant="outline"
            disabled={index === 0}
            style={styles.halfBtn}
          />
          <Button
            title={index === mockSurveyQuestions.length - 1 ? 'Submit Survey' : 'Next Question'}
            onPress={handleNext}
            loading={submitting}
            style={styles.halfBtn}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.appBg },
  content: { padding: theme.spacing.lg, paddingBottom: 100, gap: theme.spacing.md },
  track: { height: 6, backgroundColor: theme.colors.cardBorder, borderRadius: 3, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: theme.colors.primary, borderRadius: 3 },
  questionCard: { padding: theme.spacing.xl, gap: theme.spacing.md },
  questionText: { fontFamily: theme.fonts.bold, fontSize: 18, color: theme.colors.textDark, lineHeight: 24 },
  choiceGroup: { gap: theme.spacing.xs, marginTop: theme.spacing.xs },
  optionItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: theme.spacing.md, borderWidth: 1, borderColor: theme.colors.cardBorder, borderRadius: theme.radius.md, backgroundColor: theme.colors.cardWhite },
  optionSelected: { borderColor: theme.colors.primary, backgroundColor: theme.colors.primaryBg },
  optionText: { fontFamily: theme.fonts.semibold, fontSize: 14, color: theme.colors.textDark },
  optionTextSelected: { color: theme.colors.primary, fontFamily: theme.fonts.bold },
  ratingRow: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: theme.spacing.lg },
  photoContainer: { alignItems: 'center', gap: theme.spacing.md, marginVertical: theme.spacing.sm },
  photoPlaceholder: { width: '100%', height: 140, borderRadius: theme.radius.md, borderWidth: 1.5, borderColor: theme.colors.primary, borderStyle: 'dashed', backgroundColor: theme.colors.primaryBg, alignItems: 'center', justifyContent: 'center', gap: theme.spacing.xs },
  photoText: { fontFamily: theme.fonts.bold, fontSize: 13, color: theme.colors.primary },
  photoPreview: { width: '100%', height: 160, borderRadius: theme.radius.md },
  gpsRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs, paddingVertical: theme.spacing.md },
  gpsText: { flex: 1, fontFamily: theme.fonts.regular, fontSize: 12, color: theme.colors.textMuted },
  gpsAction: { fontFamily: theme.fonts.bold, fontSize: 12, color: theme.colors.primary },
  navRow: { flexDirection: 'row', gap: theme.spacing.md, marginTop: theme.spacing.sm },
  halfBtn: { flex: 1 },
});
