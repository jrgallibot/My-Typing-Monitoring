import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
  variant?: 'light' | 'dark';
}

const Logo: React.FC<LogoProps> = ({
  size = 'medium',
  showText = true,
  variant = 'dark',
}) => {
  const sizeMap = {
    small: {mark: 38, text: 14},
    medium: {mark: 58, text: 18},
    large: {mark: 82, text: 25},
  };

  const dimensions = sizeMap[size];
  const textColor = variant === 'light' ? '#fff' : '#111827';
  const taglineColor = variant === 'light' ? 'rgba(255, 255, 255, 0.78)' : '#64748b';

  return (
    <View style={styles.container}>
      <View style={[styles.logoContainer, {width: dimensions.mark, height: dimensions.mark}]}>
        <View style={styles.keyRows}>
          <View style={styles.keyRow}>
            <View style={styles.key} />
            <View style={styles.keyWide} />
            <View style={styles.key} />
          </View>
          <View style={styles.keyRow}>
            <View style={styles.keyWide} />
            <View style={styles.key} />
            <View style={styles.keyWide} />
          </View>
        </View>
        <View style={styles.pulseLine} />
      </View>
      {showText && (
        <View style={styles.textContainer}>
          <Text style={[styles.appName, {fontSize: dimensions.text, color: textColor}]}>
            MyTypingMonitor
          </Text>
          <Text style={[styles.tagline, {fontSize: dimensions.text * 0.68, color: taglineColor}]}>
            Track. Analyze. Secure.
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.28)',
  },
  keyRows: {
    gap: 4,
  },
  keyRow: {
    flexDirection: 'row',
    gap: 4,
    justifyContent: 'center',
  },
  key: {
    width: 8,
    height: 6,
    borderRadius: 2,
    backgroundColor: '#fff',
    opacity: 0.92,
  },
  keyWide: {
    width: 14,
    height: 6,
    borderRadius: 2,
    backgroundColor: '#fff',
    opacity: 0.92,
  },
  pulseLine: {
    width: '52%',
    height: 3,
    borderRadius: 4,
    marginTop: 7,
    backgroundColor: '#38bdf8',
  },
  textContainer: {
    alignItems: 'center',
    marginTop: 4,
  },
  appName: {
    fontWeight: '800',
    letterSpacing: 0,
  },
  tagline: {
    marginTop: 2,
    fontWeight: '600',
    letterSpacing: 0,
  },
});

export default Logo;
