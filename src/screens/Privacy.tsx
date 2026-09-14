import React from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity} from 'react-native';
import Logo from '../components/Logo';

type PrivacyProps = {
  navigation?: {
    navigate?: (screen: string) => void;
    goBack?: () => void;
  };
};

const dataCollection = [
  'Typed text captured only while the custom keyboard is selected.',
  'Timestamps used for personal activity summaries.',
  'Foreground app package names for app-level analytics.',
  'Optional location points cached for battery-friendly reporting.',
];

const dataStorage = [
  'Logs are stored on this device in the local database.',
  'Sensitive values are protected with Android security features.',
  'Reports are generated locally before you choose to share them.',
];

const dataSharing = [
  'The app does not upload logs to a cloud service.',
  'Email sending only uses the configured report action.',
  'You stay in control of when reports leave the device.',
];

const Privacy = ({navigation}: PrivacyProps) => {
  const goBack = () => navigation?.goBack?.() || navigation?.navigate?.('Dashboard');

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={goBack}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <View style={styles.titleRow}>
          <Logo size="small" showText={false} />
          <View style={styles.titleBlock}>
            <Text style={styles.title}>Privacy Notice</Text>
            <Text style={styles.subtitle}>Local-first monitoring</Text>
          </View>
        </View>
      </View>

      <View style={styles.summary}>
        <Text style={styles.summaryTitle}>Your data stays on your device.</Text>
        <Text style={styles.summaryText}>
          MyTypingMonitor records activity only when its custom keyboard is selected.
          Logs are used for personal analytics and report generation.
        </Text>
      </View>

      <PrivacySection title="Data collection" items={dataCollection} />
      <PrivacySection title="Data storage" items={dataStorage} />
      <PrivacySection title="Data sharing" items={dataSharing} />

      <Text style={styles.footer}>Last updated: September 14, 2026</Text>
    </ScrollView>
  );
};

const PrivacySection = ({title, items}: {title: string; items: string[]}) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {items.map(item => (
      <View style={styles.itemRow} key={item}>
        <View style={styles.itemDot} />
        <Text style={styles.itemText}>{item}</Text>
      </View>
    ))}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    paddingBottom: 28,
  },
  header: {
    backgroundColor: '#0f172a',
    paddingHorizontal: 18,
    paddingTop: 52,
    paddingBottom: 22,
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: 16,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleBlock: {
    marginLeft: 12,
    flex: 1,
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '900',
  },
  subtitle: {
    color: '#cbd5e1',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
  },
  summary: {
    margin: 16,
    padding: 18,
    borderRadius: 8,
    backgroundColor: '#2563eb',
  },
  summaryTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 8,
  },
  summaryText: {
    color: '#dbeafe',
    fontSize: 15,
    lineHeight: 23,
    fontWeight: '600',
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  sectionTitle: {
    color: '#0f172a',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  itemDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#2563eb',
    marginTop: 7,
    marginRight: 10,
  },
  itemText: {
    flex: 1,
    color: '#475569',
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '600',
  },
  footer: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 12,
  },
});

export default Privacy;
