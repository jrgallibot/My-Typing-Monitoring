import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {NativeModules} from 'react-native';

const {TypingMonitor} = NativeModules;

interface TypingLog {
  id: string;
  text: string;
  appPackage: string;
  timestamp: number;
  latitude?: number;
  longitude?: number;
  isSent: boolean;
}

const Logs = () => {
  const [logs, setLogs] = useState<TypingLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const logsData = await TypingMonitor.getLogs();
      setLogs(logsData);
    } catch (error) {
      console.error('Error loading logs:', error);
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
        <Text style={styles.title}>Typing Logs</Text>
        <Text style={styles.subtitle}>{logs.length} entries</Text>
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
    padding: 16,
    paddingTop: 48,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    color: '#fff',
    marginTop: 4,
    opacity: 0.9,
  },
  logItem: {
    backgroundColor: '#fff',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#6200ee',
  },
  logHeader: {
    marginBottom: 8,
  },
  logText: {
    fontSize: 16,
    color: '#333',
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


