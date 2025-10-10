import React from 'react';
import { View, Text, StyleSheet, StatusBar,
} from 'react-native';
import { Colors, Sizes } from '../../constants/theme';

const PaymentManagementScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Payment Management</Text>
      <Text style={styles.subtitle}>Payment management features coming soon</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: Colors.kbrBlue,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Sizes.screenPadding,
  },
  title: {
    fontSize: Sizes.title,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: Sizes.sm,
  },
  subtitle: {
    fontSize: Sizes.regular,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});

export default PaymentManagementScreen;