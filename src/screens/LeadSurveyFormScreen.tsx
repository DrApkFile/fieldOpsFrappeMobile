import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Pressable, TextInput, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../theme/ThemeContext';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Icon } from '../components/Icon';
import { OptionPickerSheet } from '../components/OptionPickerSheet';
import { mockLeads, mockLeadSurveys } from '../services/mockService';
import { RouteName, Lead, LeadSurveyConfig, DynamicSurveyQuestion } from '../types';

interface LeadSurveyFormScreenProps {
  onNavigate: (route: RouteName, data?: any) => void;
  routeData?: { lead?: Lead; survey?: LeadSurveyConfig };
}

export const LeadSurveyFormScreen: React.FC<LeadSurveyFormScreenProps> = ({ onNavigate, routeData }) => {
  const theme = useTheme();
  const styles = createStyles(theme);
  const lead = routeData?.lead || mockLeads[0];
  const survey = routeData?.survey || mockLeadSurveys[0];

  const allQuestions = survey.sections.flatMap((s) => s.questions);

  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [photoUris, setPhotoUris] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [pickerQuestion, setPickerQuestion] = useState<DynamicSurveyQuestion | null>(null);

  const answeredCount = allQuestions.filter((q) => {
    const v = answers[q.id];
    return v !== undefined && v !== null && v !== '' && !(Array.isArray(v) && v.length === 0);
  }).length;

  const setAnswer = (qId: string, val: any) => {
    setAnswers((prev) => ({ ...prev, [qId]: val }));
    if (errors[qId]) setErrors((prev) => ({ ...prev, [qId]: false }));
  };

  const handleCapturePhoto = async (qId: string) => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Camera Permission Needed', 'Enable camera access to capture this photo.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.7 });
      if (!result.canceled && result.assets?.[0]?.uri) {
        const uri = result.assets[0].uri;
        setPhotoUris((prev) => ({ ...prev, [qId]: uri }));
        setAnswer(qId, uri);
      }
    } catch (e) {
      Alert.alert('Camera Error', 'Could not open the camera. Please try again.');
    }
  };

  const handleReview = () => {
    const nextErrors: Record<string, boolean> = {};
    let valid = true;
    allQuestions.forEach((q) => {
      if (q.required) {
        const v = answers[q.id];
        const empty = v === undefined || v === null || v === '' || (Array.isArray(v) && v.length === 0);
        if (empty) {
          nextErrors[q.id] = true;
          valid = false;
        }
      }
    });
    setErrors(nextErrors);
    if (!valid) {
      Alert.alert('Incomplete Survey', 'Please answer all required questions highlighted in red before continuing.');
      return;
    }
    onNavigate('leadSurveyReview', { lead, survey, answers, photoUris });
  };

  let questionNumber = 0;

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title={survey.name}
        subtitle={`${answeredCount} of ${allQuestions.length} answered`}
        onNavigate={onNavigate}
        onBackPress={() => onNavigate('leadSurveyDetail', { lead, survey })}
      />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.introCard}>
          <Text style={styles.introKicker}>SURVEY</Text>
          <Text style={styles.introDesc}>{survey.description}</Text>
        </Card>

        {survey.sections.map((section, sIdx) => (
          <View key={section.id} style={styles.section}>
            <Text style={styles.sectionTitle}>SECTION {sIdx + 1}</Text>
            <Text style={styles.sectionName}>{section.name}</Text>
            {section.description ? <Text style={styles.sectionDesc}>{section.description}</Text> : null}

            {section.questions.map((q) => {
              questionNumber += 1;
              const num = questionNumber;
              const hasError = errors[q.id];
              const isYesNo = q.type === 'choice' && q.options?.length === 2 && q.options[0] === 'Yes' && q.options[1] === 'No';

              return (
                <Card key={q.id} style={[styles.qCard, hasError && styles.qCardError]}>
                  <Text style={styles.qText}>
                    {num}. {q.question} {q.required ? <Text style={styles.reqMark}>*</Text> : null}
                  </Text>

                  {q.type === 'choice' && q.options && isYesNo && (
                    <View style={styles.yesNoRow}>
                      {q.options.map((opt) => {
                        const selected = answers[q.id] === opt;
                        return (
                          <Pressable key={opt} onPress={() => setAnswer(q.id, opt)} style={[styles.yesNoBtn, selected && styles.yesNoBtnActive]}>
                            <Text style={[styles.yesNoText, selected && styles.yesNoTextActive]}>{opt}</Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  )}

                  {q.type === 'choice' && q.options && !isYesNo && (
                    <View style={styles.optionsList}>
                      {q.options.map((opt) => {
                        const selected = answers[q.id] === opt;
                        return (
                          <Pressable key={opt} onPress={() => setAnswer(q.id, opt)} style={[styles.optionRow, selected && styles.optionRowActive]}>
                            <View style={[styles.radioCircle, selected && styles.radioCircleActive]}>
                              {selected && <View style={styles.radioDot} />}
                            </View>
                            <Text style={[styles.optionText, selected && styles.optionTextActive]}>{opt}</Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  )}

                  {q.type === 'multi' && q.options && (
                    <View style={styles.optionsList}>
                      {q.options.map((opt) => {
                        const list: string[] = Array.isArray(answers[q.id]) ? answers[q.id] : [];
                        const selected = list.includes(opt);
                        return (
                          <Pressable
                            key={opt}
                            onPress={() => setAnswer(q.id, selected ? list.filter((o) => o !== opt) : [...list, opt])}
                            style={[styles.optionRow, selected && styles.optionRowActive]}
                          >
                            <View style={[styles.checkbox, selected && styles.checkboxActive]}>
                              {selected && <Icon name="check" size={12} color="#FFFFFF" />}
                            </View>
                            <Text style={[styles.optionText, selected && styles.optionTextActive]}>{opt}</Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  )}

                  {q.type === 'rating' && (
                    <View style={styles.starsRow}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Pressable key={star} onPress={() => setAnswer(q.id, star)}>
                          <Icon
                            name="star"
                            size={28}
                            color={(answers[q.id] || 0) >= star ? theme.colors.amber : theme.colors.darkBorder}
                          />
                        </Pressable>
                      ))}
                    </View>
                  )}

                  {q.type === 'select' && q.options && (
                    <Pressable onPress={() => setPickerQuestion(q)} style={styles.selectTrigger}>
                      <Text style={styles.selectTriggerText}>{answers[q.id] || `Select ${q.question.toLowerCase()}`}</Text>
                      <Icon name="chevron-down" size={18} color={theme.colors.darkMuted} />
                    </Pressable>
                  )}

                  {q.type === 'number' && (
                    <View style={styles.numberInputWrapper}>
                      <TextInput
                        style={styles.numberInput}
                        value={answers[q.id]?.toString() || ''}
                        onChangeText={(t) => setAnswer(q.id, t.replace(/[^0-9]/g, ''))}
                        keyboardType="number-pad"
                        placeholder="0"
                        placeholderTextColor={theme.colors.darkMuted}
                      />
                      {q.unit ? <Text style={styles.unitSuffix}>{q.unit}</Text> : null}
                    </View>
                  )}

                  {q.type === 'text' && (
                    <TextInput
                      style={styles.textInput}
                      value={answers[q.id] || ''}
                      onChangeText={(t) => setAnswer(q.id, t)}
                      placeholder="Optional note..."
                      placeholderTextColor={theme.colors.darkMuted}
                      multiline
                    />
                  )}

                  {q.type === 'photo' && (
                    photoUris[q.id] ? (
                      <View style={styles.photoPreviewBox}>
                        <Image source={{ uri: photoUris[q.id] }} style={styles.photoPreview} resizeMode="cover" />
                        <Pressable onPress={() => handleCapturePhoto(q.id)} style={styles.retakePill}>
                          <Icon name="camera" size={12} color="#FFF" />
                          <Text style={styles.retakeText}>Retake</Text>
                        </Pressable>
                      </View>
                    ) : (
                      <Pressable onPress={() => handleCapturePhoto(q.id)} style={styles.photoBox}>
                        <Icon name="camera" size={20} color={theme.colors.darkMuted} />
                        <Text style={styles.photoBoxText}>Capture photo</Text>
                      </Pressable>
                    )
                  )}

                  {hasError && <Text style={styles.errorText}>This question is required</Text>}
                </Card>
              );
            })}
          </View>
        ))}

        <Button title="Review answers" onPress={handleReview} size="large" style={styles.reviewBtn} />
      </ScrollView>

      <OptionPickerSheet
        visible={!!pickerQuestion}
        title={pickerQuestion?.question || ''}
        options={pickerQuestion?.options || []}
        selected={pickerQuestion ? answers[pickerQuestion.id] ?? null : null}
        required={pickerQuestion?.required}
        onConfirm={(val) => pickerQuestion && setAnswer(pickerQuestion.id, val)}
        onClose={() => setPickerQuestion(null)}
      />
    </SafeAreaView>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.darkBg },
  content: { padding: theme.spacing.lg, paddingBottom: 60, gap: theme.spacing.sm },
  introCard: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary, gap: 4 },
  introKicker: { fontFamily: theme.fonts.bold, fontSize: 10, color: 'rgba(255,255,255,0.75)', letterSpacing: 0.8 },
  introDesc: { fontFamily: theme.fonts.semibold, fontSize: 13, color: '#FFFFFF', lineHeight: 18 },
  section: { gap: theme.spacing.sm, marginTop: theme.spacing.sm },
  sectionTitle: { fontFamily: theme.fonts.bold, fontSize: 10, color: theme.colors.primaryLight, letterSpacing: 0.8 },
  sectionName: { fontFamily: theme.fonts.display, fontSize: 17, color: theme.colors.darkText, marginTop: 1 },
  sectionDesc: { fontFamily: theme.fonts.regular, fontSize: 12, color: theme.colors.darkMuted, lineHeight: 16 },
  qCard: { backgroundColor: theme.colors.darkCard, borderColor: theme.colors.darkBorder, gap: theme.spacing.sm },
  qCardError: { borderColor: theme.colors.red },
  qText: { fontFamily: theme.fonts.bold, fontSize: 14, color: theme.colors.darkText, lineHeight: 20 },
  reqMark: { color: theme.colors.red },
  yesNoRow: { flexDirection: 'row', gap: theme.spacing.sm },
  yesNoBtn: { flex: 1, height: 44, borderRadius: theme.radius.md, backgroundColor: theme.colors.darkSurface, borderWidth: 1, borderColor: theme.colors.darkBorder, alignItems: 'center', justifyContent: 'center' },
  yesNoBtnActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  yesNoText: { fontFamily: theme.fonts.bold, fontSize: 14, color: theme.colors.darkMuted },
  yesNoTextActive: { color: '#FFFFFF' },
  optionsList: { gap: theme.spacing.xs },
  optionRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, backgroundColor: theme.colors.darkSurface, borderWidth: 1, borderColor: theme.colors.darkBorder, borderRadius: theme.radius.md, padding: theme.spacing.md },
  optionRowActive: { borderColor: theme.colors.primary, backgroundColor: theme.colors.primaryBg },
  radioCircle: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: theme.colors.darkMuted, alignItems: 'center', justifyContent: 'center' },
  radioCircleActive: { borderColor: theme.colors.primary },
  radioDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: theme.colors.primary },
  checkbox: { width: 20, height: 20, borderRadius: 5, borderWidth: 2, borderColor: theme.colors.darkMuted, alignItems: 'center', justifyContent: 'center' },
  checkboxActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  optionText: { fontFamily: theme.fonts.semibold, fontSize: 14, color: theme.colors.darkText },
  optionTextActive: { color: theme.colors.primaryLight, fontFamily: theme.fonts.bold },
  starsRow: { flexDirection: 'row', gap: theme.spacing.sm },
  selectTrigger: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: theme.colors.darkSurface, borderWidth: 1, borderColor: theme.colors.darkBorder, borderRadius: theme.radius.md, paddingHorizontal: theme.spacing.md, paddingVertical: 14 },
  selectTriggerText: { flex: 1, fontFamily: theme.fonts.semibold, fontSize: 14, color: theme.colors.darkText },
  numberInputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.darkSurface, borderWidth: 1, borderColor: theme.colors.darkBorder, borderRadius: theme.radius.md, paddingHorizontal: theme.spacing.md },
  numberInput: { flex: 1, fontFamily: theme.fonts.bold, fontSize: 16, color: theme.colors.darkText, paddingVertical: 14 },
  unitSuffix: { fontFamily: theme.fonts.semibold, fontSize: 12, color: theme.colors.darkMuted },
  textInput: { backgroundColor: theme.colors.darkSurface, borderWidth: 1, borderColor: theme.colors.darkBorder, borderRadius: theme.radius.md, padding: theme.spacing.md, fontFamily: theme.fonts.regular, fontSize: 14, color: theme.colors.darkText, minHeight: 48 },
  photoBox: { height: 90, borderRadius: theme.radius.md, borderWidth: 1.5, borderStyle: 'dashed', borderColor: theme.colors.darkBorder, backgroundColor: theme.colors.darkSurface, alignItems: 'center', justifyContent: 'center', gap: 4 },
  photoBoxText: { fontFamily: theme.fonts.semibold, fontSize: 12, color: theme.colors.darkMuted },
  photoPreviewBox: { position: 'relative', width: '100%', height: 130, borderRadius: theme.radius.md, overflow: 'hidden' },
  photoPreview: { width: '100%', height: '100%' },
  retakePill: { position: 'absolute', bottom: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.7)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: theme.radius.full, flexDirection: 'row', alignItems: 'center', gap: 4 },
  retakeText: { fontFamily: theme.fonts.bold, fontSize: 11, color: '#FFF' },
  errorText: { fontFamily: theme.fonts.semibold, fontSize: 11, color: theme.colors.red },
  reviewBtn: { marginTop: theme.spacing.md },
});
