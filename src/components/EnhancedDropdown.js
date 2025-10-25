import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  StyleSheet 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Enhanced Dropdown Component with proper scroll isolation
 * Prevents parent scroll interference when dropdown is open
 */
const EnhancedDropdown = ({
  field,
  value,
  placeholder,
  options = [],
  isOpen,
  onToggle,
  onSelect,
  labelKey = 'label',
  valueKey = 'value',
  style,
  dropdownStyle,
  optionStyle,
  textStyle,
  maxHeight = 200,
  disabled = false,
}) => {
  const renderOption = (option, index) => {
    const optionValue = typeof option === 'object' ? option[valueKey] : option;
    const optionLabel = typeof option === 'object' ? option[labelKey] : option;
    
    return (
      <TouchableOpacity
        key={`${field}-${index}-${optionValue}`}
        style={[
          styles.dropdownOption,
          optionStyle,
          index === options.length - 1 && styles.lastDropdownOption
        ]}
        onPress={() => onSelect(optionValue, optionLabel)}
        activeOpacity={0.7}
      >
        <Text style={[styles.dropdownOptionText, textStyle]}>
          {optionLabel}
        </Text>
        {option.description && (
          <Text style={styles.dropdownOptionDescription}>
            {option.description}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.dropdownContainer, style]} pointerEvents={disabled ? 'none' : 'auto'}>
      {/* Dropdown Button */}
      <TouchableOpacity
        style={[styles.dropdownButton, disabled && styles.disabledButton]}
        onPress={onToggle}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <Text style={[styles.dropdownText, !value && styles.placeholderText, textStyle]}>
          {value || placeholder || `Select ${field}`}
        </Text>
        <Ionicons 
          name={isOpen ? "chevron-up" : "chevron-down"} 
          size={16} 
          color={disabled ? "#D1D5DB" : "#666"} 
        />
      </TouchableOpacity>
      
      {/* Dropdown Options */}
      {isOpen && !disabled && (
        <View 
          style={[styles.dropdownOptions, dropdownStyle]}
          onStartShouldSetResponder={() => true}
          onMoveShouldSetResponder={() => true}
          onResponderGrant={() => true}
          onResponderMove={() => true}
          onResponderTerminate={() => false}
          onResponderRelease={() => false}
        >
          {options && Array.isArray(options) && options.length > 0 ? (
            <ScrollView 
              style={[styles.dropdownScrollView, { maxHeight }]}
              nestedScrollEnabled={true}
              showsVerticalScrollIndicator={true}
              keyboardShouldPersistTaps="always"
              scrollEventThrottle={1}
              bounces={true}
              overScrollMode="always"
              contentContainerStyle={{ flexGrow: 1 }}
              removeClippedSubviews={false}
            >
              {options.map(renderOption)}
            </ScrollView>
          ) : (
            <View style={styles.emptyDropdownOption}>
              <Text style={styles.emptyDropdownText}>
                No options available
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  dropdownContainer: {
    position: 'relative',
    zIndex: 1000,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    minHeight: 44,
  },
  disabledButton: {
    backgroundColor: '#F9FAFB',
    borderColor: '#E5E7EB',
  },
  dropdownText: {
    fontSize: 16,
    color: '#1F2937',
    flex: 1,
  },
  placeholderText: {
    color: '#9CA3AF',
  },
  dropdownOptions: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    marginTop: 4,
    zIndex: 9999,
    elevation: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  dropdownScrollView: {
    flex: 1,
  },
  dropdownOption: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    backgroundColor: '#FFFFFF',
    minHeight: 44,
    justifyContent: 'center',
  },
  lastDropdownOption: {
    borderBottomWidth: 0,
  },
  dropdownOptionText: {
    fontSize: 16,
    color: '#1F2937',
  },
  dropdownOptionDescription: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  emptyDropdownOption: {
    paddingHorizontal: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  emptyDropdownText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
});

export default EnhancedDropdown;