import { StyleSheet } from 'react-native';
import { Colors, Sizes } from '../constants/theme';

// Common styles used across multiple components
export const commonStyles = StyleSheet.create({
  // Common container styles
  outerContainer: {
    flex: 1,
    backgroundColor: Colors.kbrBlue,
  },
  
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  
  // Common header styles
  headerRow: {
    backgroundColor: Colors.kbrBlue,
    paddingHorizontal: Sizes.screenPadding,
    paddingVertical: Sizes.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: Sizes.md,
  },
  
  headerLogoImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: Sizes.sm,
  },
  
  headerTitle: {
    fontSize: Sizes.medium,
    fontWeight: 'bold',
    color: Colors.white,
  },
  
  headerSubtitle: {
    fontSize: Sizes.small,
    color: Colors.white,
    opacity: 0.9,
  },
  
  // Common button styles
  primaryButton: {
    backgroundColor: Colors.kbrBlue,
    borderRadius: Sizes.radiusMedium,
    paddingVertical: Sizes.md,
    paddingHorizontal: Sizes.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  primaryButtonText: {
    color: Colors.white,
    fontSize: Sizes.medium,
    fontWeight: '600',
  },
  
  // Common card styles
  card: {
    backgroundColor: Colors.white,
    borderRadius: Sizes.radiusLarge,
    padding: Sizes.lg,
    marginBottom: Sizes.md,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  // Common text styles
  sectionTitle: {
    fontSize: Sizes.large,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: Sizes.md,
  },
  
  sectionSubtitle: {
    fontSize: Sizes.regular,
    color: Colors.textSecondary,
    marginBottom: Sizes.lg,
  },
  
  // Common icon container
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Sizes.md,
  },
  
  // Common flex layouts
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  rowSpaceBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Common spacing
  marginBottomMd: {
    marginBottom: Sizes.md,
  },
  
  marginBottomLg: {
    marginBottom: Sizes.lg,
  },
  
  paddingHorizontal: {
    paddingHorizontal: Sizes.screenPadding,
  },
});

// Common inline styles that can be reused
export const inlineStyles = {
  kbrBlueBackground: { backgroundColor: Colors.kbrBlue },
  whiteText: { color: Colors.white },
  centerText: { textAlign: 'center' },
  flexRow: { flexDirection: 'row', alignItems: 'center' },
  flex1: { flex: 1 },
};

export default commonStyles;