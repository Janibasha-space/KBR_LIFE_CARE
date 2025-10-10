import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Sizes } from '../constants/theme';

const Input = ({
  label,
  placeholder,
  value,
  onChangeText,
  style,
  inputStyle,
  labelStyle,
  error,
  icon,
  rightIcon,
  onRightIconPress,
  secureTextEntry = false,
  multiline = false,
  numberOfLines = 1,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  editable = true,
  ...props
}) => {
  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text style={[styles.label, labelStyle]}>{label}</Text>
      )}
      
      <View style={[
        styles.inputContainer,
        error && styles.inputContainerError,
        !editable && styles.inputContainerDisabled
      ]}>
        {icon && (
          <Ionicons
            name={icon}
            size={20}
            color={Colors.textSecondary}
            style={styles.leftIcon}
          />
        )}
        
        <TextInput
          style={[
            styles.input,
            multiline && styles.multilineInput,
            inputStyle
          ]}
          placeholder={placeholder}
          placeholderTextColor={Colors.textSecondary}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          multiline={multiline}
          numberOfLines={numberOfLines}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          editable={editable}
          textAlignVertical={multiline ? 'top' : 'center'}
          {...props}
        />
        
        {rightIcon && (
          <TouchableOpacity
            onPress={onRightIconPress}
            style={styles.rightIcon}
          >
            <Ionicons
              name={rightIcon}
              size={20}
              color={Colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>
      
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Sizes.md,
  },
  label: {
    fontSize: Sizes.medium,
    color: Colors.textPrimary,
    fontWeight: '500',
    marginBottom: Sizes.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Sizes.radiusMedium,
    backgroundColor: Colors.white,
    paddingHorizontal: Sizes.md,
    minHeight: Sizes.inputHeight,
  },
  inputContainerError: {
    borderColor: Colors.danger,
  },
  inputContainerDisabled: {
    backgroundColor: Colors.lightGray,
    opacity: 0.7,
  },
  input: {
    flex: 1,
    fontSize: Sizes.regular,
    color: Colors.textPrimary,
    paddingVertical: Sizes.sm,
  },
  multilineInput: {
    paddingVertical: Sizes.md,
    minHeight: 80,
  },
  leftIcon: {
    marginRight: Sizes.sm,
  },
  rightIcon: {
    marginLeft: Sizes.sm,
    padding: Sizes.xs,
  },
  errorText: {
    fontSize: Sizes.small,
    color: Colors.danger,
    marginTop: Sizes.xs,
  },
});

export default Input;