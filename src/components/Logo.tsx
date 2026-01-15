import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
  variant?: 'light' | 'dark';
}

const Logo: React.FC<LogoProps> = ({size = 'medium', showText = true, variant = 'dark'}) => {
  const sizeMap = {
    small: {icon: 24, text: 14, container: 40},
    medium: {icon: 48, text: 18, container: 80},
    large: {icon: 72, text: 24, container: 120},
  };

  const dimensions = sizeMap[size];
  const textColor = variant === 'light' ? '#fff' : '#1a1a1a';
  const taglineColor = variant === 'light' ? 'rgba(255, 255, 255, 0.8)' : '#666';

  return (
    <View style={styles.container}>
      <View style={[styles.logoContainer, {width: dimensions.container, height: dimensions.container}]}>
        <View style={styles.keyboardIcon}>
          <Text style={[styles.iconText, {fontSize: dimensions.icon}]}>⌨️</Text>
        </View>
        <View style={styles.monitorIcon}>
          <Text style={[styles.monitorText, {fontSize: dimensions.icon * 0.6}]}>📊</Text>
        </View>
      </View>
      {showText && (
        <View style={styles.textContainer}>
          <Text style={[styles.appName, {fontSize: dimensions.text, color: textColor}]}>MyTypingMonitor</Text>
          <Text style={[styles.tagline, {fontSize: dimensions.text * 0.7, color: taglineColor}]}>Track • Analyze • Secure</Text>
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
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  keyboardIcon: {
    position: 'absolute',
    zIndex: 2,
  },
  iconText: {
    textAlign: 'center',
  },
  monitorIcon: {
    position: 'absolute',
    top: 8,
    right: -8,
    zIndex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  monitorText: {
    textAlign: 'center',
  },
  textContainer: {
    alignItems: 'center',
    marginTop: 4,
  },
  appName: {
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  tagline: {
    marginTop: 2,
    fontWeight: '500',
  },
});

export default Logo;

