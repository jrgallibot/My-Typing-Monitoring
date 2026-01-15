import React from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity} from 'react-native';
import Logo from '../components/Logo';

const Privacy = ({navigation}: {navigation?: {navigate?: (screen: string) => void; goBack?: () => void}}) => {
  return (
    <ScrollView style={styles.container}>
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
            <Text style={styles.title}>Privacy Notice</Text>
            <View style={styles.titleUnderline} />
          </View>
        </View>
        <View style={styles.headerBadge}>
          <Text style={styles.badgeText}>🛡️ Your Data is Secure</Text>
        </View>
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
  headerBadge: {
    marginTop: 8,
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
  content: {
    padding: 16,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 26,
    color: '#444',
    marginBottom: 18,
    fontWeight: '400',
  },
  section: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#6200ee',
    marginBottom: 16,
    letterSpacing: 0.3,
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


