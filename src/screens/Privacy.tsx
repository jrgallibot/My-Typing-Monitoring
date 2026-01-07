import React from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';

const Privacy = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Privacy Notice</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.paragraph}>
          MyTypingMonitor is a personal productivity application.
        </Text>
        <Text style={styles.paragraph}>
          This app records typing activity only when its custom keyboard is
          selected.
        </Text>
        <Text style={styles.paragraph}>
          All data is stored locally on your device and encrypted using
          AES-256 encryption with Android Keystore.
        </Text>
        <Text style={styles.paragraph}>
          No data is sent automatically without your action. Reports are only
          generated when you manually trigger them or when scheduled tasks run
          (12:00 PM and 12:00 AM).
        </Text>
        <Text style={styles.paragraph}>
          Location data is captured only for personal analytics and is cached
          to preserve battery life.
        </Text>
        <Text style={styles.paragraph}>
          No data is shared with third parties. All logs remain on your device
          until you choose to send them via email.
        </Text>
        <Text style={styles.paragraph}>
          By using this app, you consent to local data collection for personal
          use.
        </Text>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Collection</Text>
          <Text style={styles.bulletPoint}>
            • Typed text (encrypted locally)
          </Text>
          <Text style={styles.bulletPoint}>
            • Timestamp of each keystroke
          </Text>
          <Text style={styles.bulletPoint}>
            • Foreground app package name
          </Text>
          <Text style={styles.bulletPoint}>
            • GPS location (cached, battery-optimized)
          </Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Storage</Text>
          <Text style={styles.bulletPoint}>
            • All data stored in local SQLite database
          </Text>
          <Text style={styles.bulletPoint}>
            • Encryption using Android Keystore
          </Text>
          <Text style={styles.bulletPoint}>
            • No cloud storage or external servers
          </Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Transmission</Text>
          <Text style={styles.bulletPoint}>
            • Reports only sent when you explicitly choose to send
          </Text>
          <Text style={styles.bulletPoint}>
            • Scheduled reports trigger notifications (you choose to send)
          </Text>
          <Text style={styles.bulletPoint}>
            • No automatic background transmission
          </Text>
        </View>
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Last updated: {new Date().toLocaleDateString()}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
  content: {
    padding: 16,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    marginBottom: 16,
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  bulletPoint: {
    fontSize: 14,
    lineHeight: 22,
    color: '#666',
    marginBottom: 8,
    marginLeft: 8,
  },
  footer: {
    marginTop: 32,
    marginBottom: 32,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#999',
  },
});

export default Privacy;


