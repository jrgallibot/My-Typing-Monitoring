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
import {NativeModules} from 'react-native';

const {TypingMonitor} = NativeModules;

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
      const statsData = await TypingMonitor.getStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error loading stats:', error);
      Alert.alert('Error', 'Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  const handleSendLogs = async () => {
    try {
      setSending(true);
      await TypingMonitor.sendLogs();
      Alert.alert('Success', 'Logs report generated. Check notification to send.');
    } catch (error) {
      console.error('Error sending logs:', error);
      Alert.alert('Error', 'Failed to generate report');
    } finally {
      setSending(false);
    }
  };

  const handleOpenKeyboardSettings = () => {
    TypingMonitor.openKeyboardSettings();
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
        <Text style={styles.title}>MyTypingMonitor</Text>
        <Text style={styles.subtitle}>Typing Analytics Dashboard</Text>
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
    paddingTop: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    marginTop: 4,
    opacity: 0.9,
  },
  section: {
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  statCard: {
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statSubtitle: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  button: {
    backgroundColor: '#6200ee',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#6200ee',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#6200ee',
  },
});

export default Dashboard;

