import React, {useEffect, useMemo, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  NativeModules,
  Platform,
  Linking,
} from 'react-native';
import Logo from '../components/Logo';

const {TypingMonitor} = NativeModules;

const emptyStats: TypingStats = {
  totalChars: 0,
  totalLogs: 0,
  charsPerMinute: 0,
  mostUsedApp: null,
  mostUsedAppCount: 0,
  uniqueLocations: 0,
  activeHours: {},
};

const isNativeModuleAvailable = (): boolean => {
  try {
    return !!TypingMonitor && typeof TypingMonitor.getStats === 'function';
  } catch {
    return false;
  }
};

const TypingMonitorFallback = {
  getStats: async () => emptyStats,
  sendLogs: async () => Promise.reject(new Error('NATIVE_MODULE_UNAVAILABLE')),
  testSendEmail: async () => Promise.reject(new Error('NATIVE_MODULE_UNAVAILABLE')),
  scheduleBackgroundEmail: async () => Promise.reject(new Error('NATIVE_MODULE_UNAVAILABLE')),
  openBatteryOptimizationSettings: () => {
    if (Platform.OS === 'android') {
      Linking.openSettings().catch(() => undefined);
    }
  },
  openKeyboardSettings: () => {
    if (Platform.OS === 'android') {
      Linking.openSettings().catch(() => undefined);
    }
  },
};

const getTypingMonitorModule = () => {
  try {
    return TypingMonitor && typeof TypingMonitor.getStats === 'function'
      ? TypingMonitor
      : TypingMonitorFallback;
  } catch {
    return TypingMonitorFallback;
  }
};

interface TypingStats {
  totalChars: number;
  totalLogs: number;
  charsPerMinute: number;
  mostUsedApp: string | null;
  mostUsedAppCount: number;
  uniqueLocations: number;
  activeHours: {[key: string]: number};
}

type DashboardProps = {
  navigation?: {
    navigate: (screen: string) => void;
  };
};

const Dashboard = ({navigation}: DashboardProps) => {
  const [stats, setStats] = useState<TypingStats>(emptyStats);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const nativeReady = useMemo(() => isNativeModuleAvailable(), []);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const module = getTypingMonitorModule();
      const statsData = await module.getStats();
      setStats({...emptyStats, ...(statsData || {})});
    } catch (error) {
      console.warn('TypingMonitor stats unavailable:', error);
      setStats(emptyStats);
    } finally {
      setLoading(false);
    }
  };

  const showNativeUnavailable = () => {
    Alert.alert(
      'Feature not ready',
      'The native monitor is not available in this build yet. Build and install the APK from this project, then enable the MyTypingMonitor keyboard in Android settings.',
      [{text: 'OK'}],
    );
  };

  const handleSendLogs = async () => {
    if (!nativeReady) {
      showNativeUnavailable();
      return;
    }

    try {
      setSending(true);
      const result = await getTypingMonitorModule().sendLogs();
      Alert.alert('Report sent', result || 'Your logs report was emailed successfully.');
    } catch (error: any) {
      Alert.alert('Report failed', error?.message || 'Could not generate the logs report.');
    } finally {
      setSending(false);
    }
  };

  const handleOpenKeyboardSettings = () => {
    getTypingMonitorModule().openKeyboardSettings();
  };

  const handleOpenBatterySettings = () => {
    const module = getTypingMonitorModule();
    if (typeof module.openBatteryOptimizationSettings === 'function') {
      module.openBatteryOptimizationSettings();
      return;
    }
    Linking.openSettings().catch(() => undefined);
  };

  const handleScheduleBackgroundEmail = async () => {
    if (!nativeReady) {
      showNativeUnavailable();
      return;
    }

    try {
      const module = getTypingMonitorModule();
      if (typeof module.scheduleBackgroundEmail !== 'function') {
        throw new Error('Please rebuild and reinstall the APK to enable background scheduling.');
      }
      const result = await module.scheduleBackgroundEmail();
      Alert.alert('Background enabled', result || 'Email checks are scheduled.');
    } catch (error: any) {
      Alert.alert('Schedule failed', error?.message || 'Could not schedule background email checks.');
    }
  };

  const handleTestEmail = async () => {
    if (!nativeReady) {
      showNativeUnavailable();
      return;
    }

    try {
      setSending(true);
      const result = await getTypingMonitorModule().testSendEmail();
      Alert.alert('Test email', result || 'Email sent. Please check the configured inbox.');
    } catch (error: any) {
      Alert.alert('Email test failed', error?.message || 'Could not send the test email.');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Logo size="large" showText variant="light" />
        <Text style={styles.subtitle}>Private typing insights for this device</Text>
        <View style={[styles.statusPill, nativeReady ? styles.readyPill : styles.setupPill]}>
          <Text style={styles.statusText}>{nativeReady ? 'Monitor connected' : 'Setup needed'}</Text>
        </View>
      </View>

      <View style={styles.overviewBand}>
        <Text style={styles.bandLabel}>Today at a glance</Text>
        <Text style={styles.bandValue}>{stats.totalChars.toLocaleString()}</Text>
        <Text style={styles.bandCaption}>characters captured locally</Text>
      </View>

      <View style={styles.grid}>
        <StatCard label="Logs" value={stats.totalLogs.toString()} tone="blue" />
        <StatCard label="Chars/min" value={stats.charsPerMinute.toString()} tone="green" />
        <StatCard label="Locations" value={stats.uniqueLocations.toString()} tone="orange" />
        <StatCard
          label="Top app"
          value={stats.mostUsedApp || 'None'}
          subtitle={`${stats.mostUsedAppCount} logs`}
          tone="slate"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Actions</Text>
        <ActionButton title="View logs" detail="Review captured entries" onPress={() => navigation?.navigate('Logs')} />
        <ActionButton title="Keyboard settings" detail="Enable the monitor keyboard" onPress={handleOpenKeyboardSettings} />
        <ActionButton title="Background email" detail="Schedule noon and midnight sends" onPress={handleScheduleBackgroundEmail} />
        <ActionButton title="Battery access" detail="Allow background work on this phone" onPress={handleOpenBatterySettings} />
        <ActionButton
          title="Send logs report"
          detail="Email the encrypted PDF now"
          onPress={handleSendLogs}
          busy={sending}
          primary
        />
        <ActionButton title="Privacy notice" detail="See how local data is handled" onPress={() => navigation?.navigate('Privacy')} />
        <ActionButton title="Test email" detail="Check configured SMTP sending" onPress={handleTestEmail} disabled={sending} />
      </View>
    </ScrollView>
  );
};

const StatCard = ({
  label,
  value,
  subtitle,
  tone,
}: {
  label: string;
  value: string;
  subtitle?: string;
  tone: 'blue' | 'green' | 'orange' | 'slate';
}) => (
  <View style={styles.statCard}>
    <View style={[styles.statAccent, accentStyles[tone]]} />
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={styles.statValue} numberOfLines={1} adjustsFontSizeToFit>
      {value}
    </Text>
    {subtitle ? <Text style={styles.statSubtitle}>{subtitle}</Text> : null}
  </View>
);

const ActionButton = ({
  title,
  detail,
  onPress,
  busy,
  primary,
  disabled,
}: {
  title: string;
  detail: string;
  onPress: () => void;
  busy?: boolean;
  primary?: boolean;
  disabled?: boolean;
}) => (
  <TouchableOpacity
    activeOpacity={0.82}
    style={[styles.actionButton, primary && styles.primaryAction, disabled && styles.disabledAction]}
    onPress={onPress}
    disabled={busy || disabled}>
    <View style={styles.actionTextWrap}>
      <Text style={[styles.actionTitle, primary && styles.primaryActionText]}>{title}</Text>
      <Text style={[styles.actionDetail, primary && styles.primaryActionDetail]}>{detail}</Text>
    </View>
    {busy ? (
      <ActivityIndicator color={primary ? '#fff' : '#2563eb'} />
    ) : (
      <Text style={[styles.actionArrow, primary && styles.primaryActionText]}>&gt;</Text>
    )}
  </TouchableOpacity>
);

const accentStyles = {
  blue: {
    backgroundColor: '#2563eb',
  },
  green: {
    backgroundColor: '#16a34a',
  },
  orange: {
    backgroundColor: '#ea580c',
  },
  slate: {
    backgroundColor: '#475569',
  },
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    paddingBottom: 28,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 14,
    fontSize: 15,
    color: '#475569',
  },
  header: {
    backgroundColor: '#0f172a',
    paddingHorizontal: 24,
    paddingTop: 54,
    paddingBottom: 28,
    alignItems: 'center',
  },
  subtitle: {
    color: '#cbd5e1',
    fontSize: 15,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  statusPill: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
  },
  readyPill: {
    backgroundColor: '#16a34a',
  },
  setupPill: {
    backgroundColor: '#ea580c',
  },
  statusText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
  },
  overviewBand: {
    marginHorizontal: 16,
    marginTop: 18,
    padding: 20,
    borderRadius: 8,
    backgroundColor: '#2563eb',
  },
  bandLabel: {
    color: '#dbeafe',
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  bandValue: {
    color: '#fff',
    fontSize: 42,
    fontWeight: '900',
    marginTop: 6,
  },
  bandCaption: {
    color: '#dbeafe',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  statCard: {
    width: '48%',
    minHeight: 116,
    padding: 14,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  statAccent: {
    width: 30,
    height: 4,
    borderRadius: 4,
    marginBottom: 14,
  },
  statLabel: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  statValue: {
    color: '#0f172a',
    fontSize: 25,
    fontWeight: '900',
    marginTop: 6,
  },
  statSubtitle: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 16,
    paddingTop: 22,
  },
  sectionTitle: {
    color: '#0f172a',
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 12,
  },
  actionButton: {
    minHeight: 68,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  primaryAction: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  disabledAction: {
    opacity: 0.55,
  },
  actionTextWrap: {
    flex: 1,
  },
  actionTitle: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '900',
  },
  actionDetail: {
    color: '#64748b',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 3,
  },
  primaryActionText: {
    color: '#fff',
  },
  primaryActionDetail: {
    color: '#dbeafe',
  },
  actionArrow: {
    color: '#2563eb',
    fontSize: 28,
    fontWeight: '800',
    marginLeft: 12,
  },
});

export default Dashboard;
