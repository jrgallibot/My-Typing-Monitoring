import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {NativeModules, Platform, Linking} from 'react-native';
import Logo from '../components/Logo';

const {TypingMonitor} = NativeModules;

// Helper to check if native module is available
const isNativeModuleAvailable = (): boolean => {
  try {
    return !!(
      TypingMonitor &&
      typeof TypingMonitor.getStats === 'function' &&
      typeof TypingMonitor.testSendEmail === 'function'
    );
  } catch (e) {
    return false;
  }
};

// Fallback for when native module is not available (Expo Go, missing native code)
const TypingMonitorFallback = {
  getStats: async () => ({
    totalChars: 0,
    totalLogs: 0,
    charsPerMinute: 0,
    mostUsedApp: null,
    mostUsedAppCount: 0,
    uniqueLocations: 0,
    activeHours: {},
  }),
  getLogs: async () => [],
  sendLogs: async () => {
    // Don't throw, return a rejection that can be handled
    return Promise.reject(new Error('DEVELOPMENT_BUILD_REQUIRED'));
  },
  testSendEmail: async () => {
    return Promise.reject(new Error('DEVELOPMENT_BUILD_REQUIRED'));
  },
  triggerEmailWorker: async () => {
    return Promise.reject(new Error('DEVELOPMENT_BUILD_REQUIRED'));
  },
  openKeyboardSettings: () => {
    if (Platform.OS === 'android') {
      // Try to open settings
      try {
        Linking.openSettings();
      } catch (e) {
        console.warn('Could not open settings');
      }
    }
  },
  clearLogs: async () => {},
};

// Safely get the module with fallback
const getTypingMonitorModule = () => {
  try {
    return TypingMonitor && typeof TypingMonitor.getStats === 'function' 
      ? TypingMonitor 
      : TypingMonitorFallback;
  } catch (e) {
    return TypingMonitorFallback;
  }
};

const TypingMonitorModule = getTypingMonitorModule();

interface TypingStats {
  totalChars: number;
  totalLogs: number;
  charsPerMinute: number;
  mostUsedApp: string | null;
  mostUsedAppCount: number;
  uniqueLocations: number;
  activeHours: {[key: string]: number};
}

const Dashboard = ({navigation}: {navigation?: {navigate: (screen: string) => void}}) => {
  const [stats, setStats] = useState<TypingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const module = getTypingMonitorModule();
      const statsData = await module.getStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error loading stats:', error);
      // Use fallback stats if native module fails
      setStats({
        totalChars: 0,
        totalLogs: 0,
        charsPerMinute: 0,
        mostUsedApp: null,
        mostUsedAppCount: 0,
        uniqueLocations: 0,
        activeHours: {},
      });
      // Silent fail - don't show error if module not available
      console.warn('TypingMonitor native module not available, using fallback');
    } finally {
      setLoading(false);
    }
  };

  const handleSendLogs = async () => {
    // Check if native module is available first
    if (!isNativeModuleAvailable()) {
      Alert.alert(
        'Development Build Required',
        'This feature requires a development build with native code.\n\n' +
        'To use this feature:\n' +
        '1. Run: npx expo run:android\n' +
        '2. Or build with: eas build --profile development --platform android\n\n' +
        'Expo Go does not support custom native modules.',
        [{text: 'OK'}]
      );
      return;
    }

    try {
      setSending(true);
      const module = getTypingMonitorModule();
      await module.sendLogs();
      Alert.alert('Success', 'Logs report generated. Check notification to send.');
    } catch (error: any) {
      console.error('Error sending logs:', error);
      if (error.message === 'DEVELOPMENT_BUILD_REQUIRED') {
        Alert.alert(
          'Development Build Required',
          'This feature requires a development build.\n\n' +
          'Run: npx expo run:android\n' +
          'Or: eas build --profile development --platform android',
          [{text: 'OK'}]
        );
      } else {
        Alert.alert(
          'Error',
          error.message || 'Failed to generate logs report. Check logs for details.'
        );
      }
    } finally {
      setSending(false);
    }
  };

  const handleOpenKeyboardSettings = () => {
    const module = getTypingMonitorModule();
    module.openKeyboardSettings();
  };

  const handleTestEmail = async () => {
    // Check if native module is available first
    if (!isNativeModuleAvailable()) {
      Alert.alert(
        'Development Build Required',
        'This feature requires a development build with native code.\n\n' +
        'To test email sending:\n' +
        '1. Run: npx expo run:android\n' +
        '2. Or build with: eas build --profile development --platform android\n\n' +
        'Expo Go does not support custom native modules.',
        [{text: 'OK'}]
      );
      return;
    }

    try {
      setSending(true);
      const module = getTypingMonitorModule();
      
      // Check if testSendEmail method exists
      if (module && typeof module.testSendEmail === 'function') {
        const result = await module.testSendEmail();
        Alert.alert('Test Email', result || 'Email sent! Check ffgallibot@dswd.gov.ph');
      } else {
        Alert.alert(
          'Method Not Available',
          'testSendEmail method not found. Please rebuild the app with native code.'
        );
      }
    } catch (error: any) {
      console.error('Error testing email:', error);
      const errorMessage = error.message || 'Failed to send test email. Check logs for details.';
      
      // Check if it's the native module error
      if (errorMessage === 'DEVELOPMENT_BUILD_REQUIRED' || 
          errorMessage.includes('Native module not available') ||
          errorMessage.includes('Build a development build')) {
        Alert.alert(
          'Development Build Required',
          'This feature requires a development build.\n\n' +
          'Run: npx expo run:android\n' +
          'Or: eas build --profile development --platform android',
          [{text: 'OK'}]
        );
      } else {
        Alert.alert('Test Email Error', errorMessage);
      }
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text style={styles.loadingText}>Loading statistics...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Logo size="large" showText={true} variant="light" />
        <Text style={styles.subtitle}>Typing Analytics Dashboard</Text>
        <View style={styles.headerBadge}>
          <Text style={styles.badgeText}>📊 Real-time Analytics</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Statistics</Text>
        {stats && (
          <>
            <StatCard
              label="Total Characters"
              value={stats.totalChars.toLocaleString()}
            />
            <StatCard label="Total Logs" value={stats.totalLogs.toString()} />
            <StatCard
              label="Characters per Minute"
              value={stats.charsPerMinute.toString()}
            />
            <StatCard
              label="Most Used App"
              value={stats.mostUsedApp || 'N/A'}
              subtitle={`${stats.mostUsedAppCount} logs`}
            />
            <StatCard
              label="Unique Locations"
              value={stats.uniqueLocations.toString()}
            />
          </>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Actions</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Logs')}>
          <Text style={styles.buttonText}>View Logs</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={handleSendLogs}
          disabled={sending}>
          {sending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Send Logs Report</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={handleOpenKeyboardSettings}>
          <Text style={[styles.buttonText, styles.secondaryButtonText]}>
            Keyboard Settings
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={() => navigation.navigate('Privacy')}>
          <Text style={[styles.buttonText, styles.secondaryButtonText]}>
            Privacy Notice
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.testButton]}
          onPress={handleTestEmail}
          disabled={sending}>
          {sending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>🧪 Test Email Send</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const StatCard = ({
  label,
  value,
  subtitle,
}: {
  label: string;
  value: string;
  subtitle?: string;
}) => (
  <View style={styles.statCard}>
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={styles.statValue}>{value}</Text>
    {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: '#6200ee',
    padding: 24,
    paddingTop: 56,
    paddingBottom: 32,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  icon: {
    fontSize: 32,
  },
  titleWrapper: {
    flex: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: {width: 0, height: 2},
    textShadowRadius: 4,
  },
  titleUnderline: {
    width: 60,
    height: 4,
    backgroundColor: '#fff',
    borderRadius: 2,
    marginTop: 6,
    opacity: 0.9,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    marginTop: 8,
    opacity: 0.95,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  headerBadge: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  badgeText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  section: {
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 20,
    color: '#333',
    letterSpacing: 0.3,
  },
  statCard: {
    padding: 18,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 14,
    borderLeftWidth: 4,
    borderLeftColor: '#6200ee',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  statLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 6,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#6200ee',
    letterSpacing: 0.5,
  },
  statSubtitle: {
    fontSize: 12,
    color: '#888',
    marginTop: 6,
    fontWeight: '500',
    fontStyle: 'italic',
  },
  button: {
    backgroundColor: '#6200ee',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 14,
    shadowColor: '#6200ee',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#6200ee',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  secondaryButtonText: {
    color: '#6200ee',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  testButton: {
    backgroundColor: '#4caf50',
    marginTop: 8,
  },
});

export default Dashboard;

