import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Pressable,
  TextInput,
  Image,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { theme } from '../theme/theme';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Icon } from '../components/Icon';
import { useFieldStore } from '../store/useFieldStore';
import { mockSurveyQuestions } from '../services/mockService';
import { RouteName, DynamicSurveyQuestion, SurveyAnswer, OutletSurvey } from '../types';

interface NewSurveyScreenProps {
  routeData?: { outletId?: string; mode?: string };
  onNavigate: (route: RouteName, data?: any) => void;
}

export const NewSurveyScreen: React.FC<NewSurveyScreenProps> = ({ routeData, onNavigate }) => {
  const { state, dispatch } = useFieldStore();
  const outletId = routeData?.outletId;
  const outlet = state.outlets.find((o) => o.id === outletId);

  if (!outlet) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="New Survey" subtitle="Outlet missing" onNavigate={onNavigate} onBackPress={() => onNavigate('outlets')} />
        <View style={styles.missingContainer}>
          <Icon name="alert-circle" size={44} color={theme.colors.amber} />
          <Text style={styles.missingTitle}>Surveys belong to an outlet.</Text>
          <Button title="Go to Outlets List" onPress={() => onNavigate('outlets')} variant="primary" />
        </View>
      </SafeAreaView>
    );
  }

  const questions: DynamicSurveyQuestion[] = mockSurveyQuestions;
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [photoUris, setPhotoUris] = useState<Record<string, string>>({});
  const [validationErrors, setValidationErrors] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleAnswerChange = (qId: string, val: any) => {
    setAnswers((prev) => ({ ...prev, [qId]: val }));
    if (validationErrors[qId]) {
      setValidationErrors((prev) => ({ ...prev, [qId]: false }));
    }
  };

  const handleCapturePhoto = async (qId: string) => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        const fallback = 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=500';
        setPhotoUris((prev) => ({ ...prev, [qId]: fallback }));
        handleAnswerChange(qId, fallback);
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.7,
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        const uri = result.assets[0].uri;
        setPhotoUris((prev) => ({ ...prev, [qId]: uri }));
        handleAnswerChange(qId, uri);
      }
    } catch (e) {
      const fallback = 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=500';
      setPhotoUris((prev) => ({ ...prev, [qId]: fallback }));
      handleAnswerChange(qId, fallback);
    }
  };

  const validate = (): boolean => {
    const errors: Record<string, boolean> = {};
    let valid = true;

    questions.forEach((q) => {
      if (q.required) {
        const val = answers[q.id];
        if (val === undefined || val === null || val === '') {
          errors[q.id] = true;
          valid = false;
        }
      }
    });

    setValidationErrors(errors);
    return valid;
  };

  const handleSubmit = (isDraft = false) => {
    if (!isDraft && !validate()) {
      Alert.alert(
        'Incomplete Survey',
        'Please answer all required questions highlighted in red before submitting.'
      );
      return;
    }

    setSubmitting(true);

    const nowStr = new Date().toLocaleString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });

    const surveyAnswers: SurveyAnswer[] = questions.map((q) => ({
      questionId: q.id,
      question: q.question,
      answer: answers[q.id] || null,
    }));

    const newSurvey: OutletSurvey = {
      id: `surv-${Date.now()}`,
      outletId: outlet.id,
      campaignId: state.activeCampaign?.id || 'c2',
      answers: surveyAnswers,
      isDraft,
      timestamp: nowStr,
    };

    dispatch({ type: 'ADD_SURVEY', survey: newSurvey });

    if (!isDraft) {
      dispatch({ type: 'MARK_OUTLET_VISITED', outletId: outlet.id });
    }

    setTimeout(() => {
      setSubmitting(false);
      if (isDraft) {
        Alert.alert('Draft Saved', 'Your survey draft has been saved locally.');
        onNavigate('outletDetail', { outletId: outlet.id });
      } else {
        onNavigate('surveySuccess', { survey: newSurvey, outletId: outlet.id });
      }
    }, 400);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Field Survey"
        subtitle={outlet.name}
        onNavigate={onNavigate}
        onBackPress={() => onNavigate('outletDetail', { outletId: outlet.id })}
      />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* OUTLET CARD */}
        <Card style={styles.readOnlyOutletCard}>
          <View style={styles.outletCardHeader}>
            <Icon name="store" size={18} color={theme.colors.amber} />
            <Text style={styles.readOnlyLabel}>OUTLET CONTEXT</Text>
          </View>
          <Text style={styles.outletName}>{outlet.name}</Text>
          <Text style={styles.outletSub}>{outlet.area} · {outlet.type} · {outlet.address}</Text>
        </Card>

        {/* DYNAMIC QUESTIONS */}
        {questions.map((q, idx) => {
          const hasError = validationErrors[q.id];
          return (
            <Card
              key={q.id}
              style={[styles.questionCard, hasError && styles.questionCardError]}
            >
              <View style={styles.qHeader}>
                <Text style={styles.qNum}>Q{idx + 1}</Text>
                <Text style={styles.qText}>
                  {q.question} {q.required ? <Text style={styles.reqAsterisk}>*</Text> : null}
                </Text>
              </View>

              {/* Single Choice */}
              {q.type === 'choice' && q.options && (
                <View style={styles.optionsList}>
                  {q.options.map((opt) => {
                    const isSelected = answers[q.id] === opt;
                    return (
                      <Pressable
                        key={opt}
                        onPress={() => handleAnswerChange(q.id, opt)}
                        style={[styles.optionItem, isSelected && styles.optionItemSelected]}
                      >
                        <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                          {isSelected && <View style={styles.radioDot} />}
                        </View>
                        <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                          {opt}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              )}

              {/* Rating (1 to 5 Stars / Buttons) */}
              {q.type === 'rating' && (
                <View style={styles.ratingRow}>
                  {[1, 2, 3, 4, 5].map((star) => {
                    const isSelected = answers[q.id] === star;
                    return (
                      <Pressable
                        key={star}
                        onPress={() => handleAnswerChange(q.id, star)}
                        style={[styles.ratingBtn, isSelected && styles.ratingBtnSelected]}
                      >
                        <Text style={[styles.ratingNum, isSelected && styles.ratingNumSelected]}>
                          {star}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              )}

              {/* Text Input */}
              {q.type === 'text' && (
                <TextInput
                  style={styles.textInput}
                  placeholder="Type your observations..."
                  placeholderTextColor={theme.colors.darkMuted}
                  value={answers[q.id] || ''}
                  onChangeText={(val) => handleAnswerChange(q.id, val)}
                  multiline
                  numberOfLines={2}
                />
              )}

              {/* Number Input */}
              {q.type === 'number' && (
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter numeric quantity"
                  placeholderTextColor={theme.colors.darkMuted}
                  value={answers[q.id]?.toString() || ''}
                  onChangeText={(val) => handleAnswerChange(q.id, val)}
                  keyboardType="numeric"
                />
              )}

              {/* Photo Input */}
              {q.type === 'photo' && (
                <View style={styles.photoSection}>
                  {photoUris[q.id] ? (
                    <View style={styles.photoPreviewBox}>
                      <Image source={{ uri: photoUris[q.id] }} style={styles.photoPreview} />
                      <Pressable onPress={() => handleCapturePhoto(q.id)} style={styles.retakePill}>
                        <Icon name="camera" size={12} color="#FFF" />
                        <Text style={styles.retakeText}>Retake Photo</Text>
                      </Pressable>
                    </View>
                  ) : (
                    <Pressable onPress={() => handleCapturePhoto(q.id)} style={styles.photoBox}>
                      <Icon name="camera" size={24} color={theme.colors.amber} />
                      <Text style={styles.photoBoxText}>Tap to take display photo</Text>
                    </Pressable>
                  )}
                </View>
              )}

              {hasError && (
                <Text style={styles.errorText}>* This question is required</Text>
              )}
            </Card>
          );
        })}

        {/* ACTIONS ROW */}
        <View style={styles.actionButtonsRow}>
          <Button
            title="Save Local Draft"
            onPress={() => handleSubmit(true)}
            variant="outline"
            style={styles.draftBtn}
          />

          <Button
            title={submitting ? 'Submitting...' : 'Submit Survey'}
            onPress={() => handleSubmit(false)}
            variant="primary"
            loading={submitting}
            style={styles.submitBtn}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.darkBg },
  scroll: { padding: theme.spacing.lg, gap: theme.spacing.md, paddingBottom: 60 },
  missingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: theme.spacing.md, padding: theme.spacing.xl },
  missingTitle: { fontFamily: theme.fonts.bold, fontSize: 18, color: theme.colors.darkText },
  readOnlyOutletCard: { backgroundColor: theme.colors.darkCard, borderColor: theme.colors.darkBorder, gap: 4 },
  outletCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  readOnlyLabel: { fontFamily: theme.fonts.bold, fontSize: 10, color: theme.colors.amber, letterSpacing: 0.8 },
  outletName: { fontFamily: theme.fonts.bold, fontSize: 18, color: theme.colors.darkText },
  outletSub: { fontFamily: theme.fonts.regular, fontSize: 12, color: theme.colors.darkMuted },
  questionCard: { backgroundColor: theme.colors.darkCard, borderColor: theme.colors.darkBorder, gap: theme.spacing.sm, padding: theme.spacing.lg },
  questionCardError: { borderColor: theme.colors.red },
  qHeader: { flexDirection: 'row', gap: theme.spacing.xs },
  qNum: { fontFamily: theme.fonts.bold, fontSize: 13, color: theme.colors.amber },
  qText: { flex: 1, fontFamily: theme.fonts.bold, fontSize: 15, color: theme.colors.darkText, lineHeight: 20 },
  reqAsterisk: { color: theme.colors.red },
  optionsList: { gap: theme.spacing.xs, marginTop: 4 },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    backgroundColor: theme.colors.darkSurface,
    borderWidth: 1,
    borderColor: theme.colors.darkBorder,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
  },
  optionItemSelected: { borderColor: theme.colors.amber, backgroundColor: '#35260A' },
  radioCircle: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: theme.colors.darkMuted, alignItems: 'center', justifyContent: 'center' },
  radioCircleSelected: { borderColor: theme.colors.amber },
  radioDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: theme.colors.amber },
  optionText: { fontFamily: theme.fonts.semibold, fontSize: 14, color: theme.colors.darkText },
  optionTextSelected: { color: theme.colors.amber, fontFamily: theme.fonts.bold },
  ratingRow: { flexDirection: 'row', justifyContent: 'space-between', gap: theme.spacing.xs, marginTop: 4 },
  ratingBtn: { flex: 1, height: 44, borderRadius: theme.radius.md, backgroundColor: theme.colors.darkSurface, borderWidth: 1, borderColor: theme.colors.darkBorder, alignItems: 'center', justifyContent: 'center' },
  ratingBtnSelected: { backgroundColor: theme.colors.amber, borderColor: theme.colors.amber },
  ratingNum: { fontFamily: theme.fonts.bold, fontSize: 16, color: theme.colors.darkText },
  ratingNumSelected: { color: '#000' },
  textInput: {
    backgroundColor: theme.colors.darkInputBg,
    borderWidth: 1,
    borderColor: theme.colors.darkBorder,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    fontFamily: theme.fonts.regular,
    fontSize: 14,
    color: theme.colors.darkText,
    marginTop: 4,
  },
  photoSection: { marginTop: 4 },
  photoBox: { height: 100, borderRadius: theme.radius.md, borderWidth: 1.5, borderColor: theme.colors.darkBorder, borderStyle: 'dashed', backgroundColor: theme.colors.darkSurface, alignItems: 'center', justifyContent: 'center', gap: 6 },
  photoBoxText: { fontFamily: theme.fonts.semibold, fontSize: 13, color: theme.colors.darkText },
  photoPreviewBox: { position: 'relative', width: '100%', height: 140, borderRadius: theme.radius.md, overflow: 'hidden' },
  photoPreview: { width: '100%', height: '100%' },
  retakePill: { position: 'absolute', bottom: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.7)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: theme.radius.full, flexDirection: 'row', alignItems: 'center', gap: 4 },
  retakeText: { fontFamily: theme.fonts.bold, fontSize: 11, color: '#FFF' },
  errorText: { fontFamily: theme.fonts.semibold, fontSize: 11, color: theme.colors.red, marginTop: 2 },
  actionButtonsRow: { flexDirection: 'row', gap: theme.spacing.sm, marginTop: theme.spacing.sm },
  draftBtn: { flex: 1 },
  submitBtn: { flex: 1.5 },
});
