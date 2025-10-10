import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Colors, Sizes } from '../constants/theme';

const Button = ({
  title,
  onPress,
  style,
  textStyle,
  disabled = false,
  loading = false,
  variant = 'primary',
  size = 'medium',
  ...props
}) => {
  const getButtonStyle = () => {
    const baseStyle = [styles.button];
    
    // Variant styles
    switch (variant) {
      case 'primary':
        baseStyle.push(styles.primaryButton);
        break;
      case 'secondary':
        baseStyle.push(styles.secondaryButton);
        break;
      case 'outline':
        baseStyle.push(styles.outlineButton);
        break;
      case 'danger':
        baseStyle.push(styles.dangerButton);
        break;
      default:
        baseStyle.push(styles.primaryButton);
    }
    
    // Size styles
    switch (size) {
      case 'small':
        baseStyle.push(styles.smallButton);
        break;
      case 'large':
        baseStyle.push(styles.largeButton);
        break;
      default:
        baseStyle.push(styles.mediumButton);
    }
    
    if (disabled) {
      baseStyle.push(styles.disabledButton);
    }
    
    return baseStyle;
  };

  const getTextStyle = () => {
    const baseTextStyle = [styles.buttonText];
    
    switch (variant) {
      case 'primary':
        baseTextStyle.push(styles.primaryButtonText);
        break;
      case 'secondary':
        baseTextStyle.push(styles.secondaryButtonText);
        break;
      case 'outline':
        baseTextStyle.push(styles.outlineButtonText);
        break;
      case 'danger':
        baseTextStyle.push(styles.dangerButtonText);
        break;
      default:
        baseTextStyle.push(styles.primaryButtonText);
    }
    
    switch (size) {
      case 'small':
        baseTextStyle.push(styles.smallButtonText);
        break;
      case 'large':
        baseTextStyle.push(styles.largeButtonText);
        break;
      default:
        baseTextStyle.push(styles.mediumButtonText);
    }
    
    return baseTextStyle;
  };

  return (
    <TouchableOpacity
      style={[...getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? Colors.primary : Colors.white} />
      ) : (
        <Text style={[...getTextStyle(), textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: Sizes.radiusMedium,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  
  // Variants
  primaryButton: {
    backgroundColor: Colors.primary,
  },
  secondaryButton: {
    backgroundColor: Colors.secondary,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  dangerButton: {
    backgroundColor: Colors.danger,
  },
  disabledButton: {
    opacity: 0.6,
  },
  
  // Sizes
  smallButton: {
    paddingHorizontal: Sizes.md,
    paddingVertical: Sizes.sm,
    height: 36,
  },
  mediumButton: {
    paddingHorizontal: Sizes.lg,
    paddingVertical: Sizes.md,
    height: Sizes.buttonHeight,
  },
  largeButton: {
    paddingHorizontal: Sizes.xl,
    paddingVertical: Sizes.lg,
    height: 56,
  },
  
  // Text styles
  buttonText: {
    fontWeight: '600',
    textAlign: 'center',
  },
  primaryButtonText: {
    color: Colors.white,
  },
  secondaryButtonText: {
    color: Colors.white,
  },
  outlineButtonText: {
    color: Colors.primary,
  },
  dangerButtonText: {
    color: Colors.white,
  },
  
  // Text sizes
  smallButtonText: {
    fontSize: Sizes.medium,
  },
  mediumButtonText: {
    fontSize: Sizes.regular,
  },
  largeButtonText: {
    fontSize: Sizes.large,
  },
});

export default Button;