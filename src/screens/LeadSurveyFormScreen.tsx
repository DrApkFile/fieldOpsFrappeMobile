import React, { useState } from 'react';
import { StyleSheet, SafeAreaView, ScrollView, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../theme/ThemeContext';
import { Header } from '../components/Header';
import { DynamicSurveyForm } from '../components/DynamicSurveyForm';
import { mockLeads, mockLeadSurveys } from '../services/mockService';
import { RouteName, Lead, LeadSurveyConfig } from '../types';

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

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title={survey.name}
        subtitle={`${answeredCount} of ${allQuestions.length} answered`}
        onNavigate={onNavigate}
        onBackPress={() => onNavigate('leadSurveyDetail', { lead, survey })}
      />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <DynamicSurveyForm
          description={survey.description}
          sections={survey.sections}
          answers={answers}
          photoUris={photoUris}
          errors={errors}
          answeredCount={answeredCount}
          totalCount={allQuestions.length}
          onAnswerChange={setAnswer}
          onCapturePhoto={handleCapturePhoto}
          onSubmit={handleReview}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.appBg },
  content: { padding: theme.spacing.lg, paddingBottom: 60, gap: theme.spacing.sm },
});
