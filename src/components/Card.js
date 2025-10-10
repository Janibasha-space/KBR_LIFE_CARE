import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Sizes } from '../constants/theme';

// Helper function to create transparent colors
const getTransparentColor = (color, opacity) => `${color}${opacity}`;

const Card = ({
  children,
  style,
  title,
  subtitle,
  onPress,
  showArrow = false,
  icon,
  iconColor = Colors.primary,
  shadow = true,
  ...props
}) => {
  const CardComponent = onPress ? TouchableOpacity : View;

  return (
    <CardComponent
      style={[
        styles.card,
        shadow && styles.cardShadow,
        style
      ]}
      onPress={onPress}
      {...props}
    >
      {(title || subtitle || icon) && (
        <View style={styles.header}>
          <View style={styles.headerContent}>
            {icon && (
              <View style={[styles.iconContainer, { backgroundColor: getTransparentColor(iconColor, '15') }]}>
                <Ionicons name={icon} size={20} color={iconColor} />
              </View>
            )}
            <View style={styles.headerText}>
              {title && <Text style={styles.title}>{title}</Text>}
              {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
            </View>
          </View>
          {showArrow && (
            <Ionicons name="chevron-forward-outline" size={16} color={Colors.textSecondary} />
          )}
        </View>
      )}
      
      {children && (
        <View style={styles.content}>
          {children}
        </View>
      )}
    </CardComponent>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: Sizes.radiusMedium,
    padding: Sizes.md,
    marginBottom: Sizes.sm,
  },
  cardShadow: {
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Sizes.md,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: Sizes.regular,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: Sizes.medium,
    color: Colors.textSecondary,
  },
  content: {
    marginTop: Sizes.sm,
  },
});

export default Card;