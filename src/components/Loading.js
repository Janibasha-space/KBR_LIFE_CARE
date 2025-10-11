import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Colors, Sizes } from '../constants/theme';

// Loading overlay component
export const LoadingOverlay = ({ visible = false, message = 'Loading...' }) => {
  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.kbrBlue} />
          <Text style={styles.loadingText}>{message}</Text>
        </View>
      </View>
    </Modal>
  );
};

// Inline loading component
export const LoadingInline = ({ 
  size = 'small', 
  color = Colors.kbrBlue, 
  message = null,
  style = {} 
}) => {
  return (
    <View style={[styles.inlineContainer, style]}>
      <ActivityIndicator size={size} color={color} />
      {message && <Text style={styles.inlineText}>{message}</Text>}
    </View>
  );
};

// Loading placeholder for lists
export const LoadingPlaceholder = ({ count = 3, height = 80 }) => {
  return (
    <View style={styles.placeholderContainer}>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={[styles.placeholderItem, { height }]}>
          <View style={styles.placeholderIcon} />
          <View style={styles.placeholderContent}>
            <View style={styles.placeholderLine} />
            <View style={[styles.placeholderLine, styles.placeholderLineShort]} />
          </View>
        </View>
      ))}
    </View>
  );
};

// Full screen loading
export const LoadingScreen = ({ message = 'Loading...' }) => {
  return (
    <View style={styles.fullScreenContainer}>
      <ActivityIndicator size="large" color={Colors.kbrBlue} />
      <Text style={styles.fullScreenText}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  // Overlay styles
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  loadingContainer: {
    backgroundColor: Colors.white,
    padding: Sizes.xl,
    borderRadius: Sizes.radiusLarge,
    alignItems: 'center',
    minWidth: 120,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  loadingText: {
    marginTop: Sizes.md,
    fontSize: Sizes.regular,
    color: Colors.textPrimary,
    textAlign: 'center',
  },

  // Inline styles
  inlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Sizes.md,
  },
  inlineText: {
    marginLeft: Sizes.sm,
    fontSize: Sizes.medium,
    color: Colors.textSecondary,
  },

  // Placeholder styles
  placeholderContainer: {
    padding: Sizes.screenPadding,
  },
  placeholderItem: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: Sizes.radiusMedium,
    padding: Sizes.md,
    marginBottom: Sizes.sm,
    alignItems: 'center',
  },
  placeholderIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.lightGray,
    marginRight: Sizes.md,
  },
  placeholderContent: {
    flex: 1,
  },
  placeholderLine: {
    height: 12,
    backgroundColor: Colors.lightGray,
    borderRadius: 6,
    marginBottom: Sizes.sm,
  },
  placeholderLineShort: {
    width: '60%',
    marginBottom: 0,
  },

  // Full screen styles
  fullScreenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: Sizes.screenPadding,
  },
  fullScreenText: {
    marginTop: Sizes.lg,
    fontSize: Sizes.large,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
});

export default {
  LoadingOverlay,
  LoadingInline,
  LoadingPlaceholder,
  LoadingScreen,
};