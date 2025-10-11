import { StyleSheet } from 'react-native';
import { Colors, Sizes } from '../constants/theme';

export const bookingStyles = StyleSheet.create({
  // Header styles
  header: {
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
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: Sizes.sm,
    paddingVertical: Sizes.xs,
    borderRadius: Sizes.radiusSmall,
  },
  loginText: {
    color: Colors.white,
    marginLeft: 4,
    fontSize: Sizes.small,
  },

  // Progress section
  progressSection: {
    paddingHorizontal: Sizes.screenPadding,
    paddingVertical: Sizes.lg,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  progressTitle: {
    fontSize: Sizes.large,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  progressStep: {
    fontSize: Sizes.medium,
    color: Colors.textSecondary,
    marginTop: 4,
  },

  // Section titles
  sectionTitleContainer: {
    paddingHorizontal: Sizes.screenPadding,
    paddingTop: Sizes.xl,
    paddingBottom: Sizes.lg,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: Sizes.title,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: Sizes.sm,
  },
  sectionSubtitle: {
    fontSize: Sizes.regular,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  subSectionTitle: {
    fontSize: Sizes.large,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: Sizes.md,
    marginTop: Sizes.lg,
  },

  // Service cards (Step 1)
  serviceCard: {
    backgroundColor: Colors.white,
    borderRadius: Sizes.radiusLarge,
    padding: Sizes.lg,
    marginBottom: Sizes.md,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  serviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  serviceIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.kbrBlue + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Sizes.md,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceTitle: {
    fontSize: Sizes.large,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: Sizes.xs,
  },
  serviceDescription: {
    fontSize: Sizes.medium,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  serviceDuration: {
    fontSize: Sizes.medium,
    color: Colors.textSecondary,
    fontWeight: '500',
  },

  // Doctor cards (Step 2)
  selectedServiceBadge: {
    backgroundColor: Colors.kbrBlue,
    paddingHorizontal: Sizes.md,
    paddingVertical: Sizes.xs,
    borderRadius: Sizes.radiusMedium,
    marginTop: Sizes.sm,
  },
  selectedServiceText: {
    color: Colors.white,
    fontSize: Sizes.medium,
    fontWeight: '600',
  },
  doctorCard: {
    backgroundColor: Colors.white,
    borderRadius: Sizes.radiusLarge,
    padding: Sizes.lg,
    marginBottom: Sizes.md,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  doctorAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.kbrBlue,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Sizes.md,
  },
  doctorAvatarText: {
    color: Colors.white,
    fontSize: Sizes.large,
    fontWeight: 'bold',
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: Sizes.large,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  doctorSpecialization: {
    fontSize: Sizes.medium,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  doctorFellowship: {
    fontSize: Sizes.small,
    color: Colors.textSecondary,
    marginBottom: Sizes.sm,
  },
  doctorMetrics: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Sizes.sm,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: Sizes.md,
  },
  ratingText: {
    fontSize: Sizes.medium,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginLeft: 4,
  },
  experienceText: {
    fontSize: Sizes.medium,
    color: Colors.textSecondary,
  },
  doctorFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  doctorFees: {
    fontSize: Sizes.large,
    fontWeight: 'bold',
    color: Colors.success,
  },
  doctorAvailability: {
    fontSize: Sizes.small,
    color: Colors.textSecondary,
  },

  // Date and Time selection (Step 3)
  selectedDoctorText: {
    color: Colors.kbrBlue,
    fontSize: Sizes.medium,
    fontWeight: '600',
    marginTop: Sizes.sm,
  },
  dateCard: {
    backgroundColor: Colors.white,
    borderRadius: Sizes.radiusMedium,
    padding: Sizes.md,
    marginBottom: Sizes.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  selectedDateCard: {
    borderColor: Colors.kbrRed,
    backgroundColor: Colors.kbrRed + '05',
  },
  dateLeft: {
    flex: 1,
  },
  dateDay: {
    fontSize: Sizes.medium,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  dateNumber: {
    fontSize: Sizes.small,
    color: Colors.textSecondary,
  },
  availableText: {
    fontSize: Sizes.small,
    color: Colors.success,
    fontWeight: '600',
  },
  selectedAvailableText: {
    color: Colors.kbrRed,
  },
  timeSlotGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Sizes.sm,
    marginBottom: Sizes.lg,
  },
  timeSlot: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Sizes.radiusMedium,
    paddingHorizontal: Sizes.md,
    paddingVertical: Sizes.sm,
    minWidth: '45%',
    alignItems: 'center',
  },
  selectedTimeSlot: {
    backgroundColor: Colors.kbrBlue,
    borderColor: Colors.kbrBlue,
  },
  timeSlotText: {
    fontSize: Sizes.medium,
    color: Colors.textPrimary,
  },
  selectedTimeSlotText: {
    color: Colors.white,
    fontWeight: '600',
  },
  tokenInfo: {
    backgroundColor: Colors.white,
    padding: Sizes.md,
    borderRadius: Sizes.radiusMedium,
    marginBottom: Sizes.lg,
  },
  tokenInfoText: {
    fontSize: Sizes.medium,
    color: Colors.kbrBlue,
    textAlign: 'center',
    fontWeight: '600',
  },

  // Patient Details Form (Step 4)
  formContainer: {
    backgroundColor: Colors.white,
    borderRadius: Sizes.radiusLarge,
    padding: Sizes.lg,
    margin: Sizes.md,
  },
  fieldLabel: {
    fontSize: Sizes.medium,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Sizes.xs,
    marginTop: Sizes.md,
  },
  bookingForContainer: {
    flexDirection: 'row',
    marginBottom: Sizes.md,
  },
  bookingForOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: Sizes.xl,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.border,
    marginRight: Sizes.sm,
  },
  selectedRadio: {
    borderColor: Colors.kbrBlue,
    backgroundColor: Colors.kbrBlue,
  },
  bookingForText: {
    fontSize: Sizes.medium,
    color: Colors.textPrimary,
  },
  inputField: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Sizes.radiusMedium,
    paddingHorizontal: Sizes.md,
    paddingVertical: Sizes.sm,
    fontSize: Sizes.medium,
    color: Colors.textPrimary,
    backgroundColor: Colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowContainer: {
    flexDirection: 'row',
    gap: Sizes.md,
  },
  halfWidth: {
    flex: 1,
  },
  placeholderText: {
    color: Colors.textSecondary,
  },
  selectedGenderText: {
    color: Colors.textPrimary,
  },

  // Mobile Verification (Step 5)
  verifyMobileContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Sizes.screenPadding,
  },
  sendOtpButton: {
    backgroundColor: Colors.kbrBlue,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Sizes.xl,
    paddingVertical: Sizes.md,
    borderRadius: Sizes.radiusMedium,
    marginTop: Sizes.xl,
    marginBottom: Sizes.lg,
  },
  sendOtpButtonText: {
    color: Colors.white,
    fontSize: Sizes.regular,
    fontWeight: 'bold',
    marginLeft: Sizes.sm,
  },
  backToDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backToDetailsText: {
    color: Colors.kbrBlue,
    fontSize: Sizes.medium,
    marginLeft: 4,
  },

  // Payment (Step 6)
  bookingSummaryCard: {
    backgroundColor: Colors.kbrBlue + '10',
    borderRadius: Sizes.radiusLarge,
    padding: Sizes.lg,
    marginBottom: Sizes.xl,
  },
  summaryTitle: {
    fontSize: Sizes.large,
    fontWeight: 'bold',
    color: Colors.kbrBlue,
    marginBottom: Sizes.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Sizes.sm,
  },
  summaryLabel: {
    fontSize: Sizes.medium,
    color: Colors.textSecondary,
  },
  summaryValue: {
    fontSize: Sizes.medium,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Sizes.sm,
    marginTop: Sizes.sm,
  },
  totalLabel: {
    fontSize: Sizes.large,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  totalValue: {
    fontSize: Sizes.large,
    fontWeight: 'bold',
    color: Colors.kbrBlue,
  },
  paymentMethodTitle: {
    fontSize: Sizes.large,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: Sizes.md,
  },
  paymentOption: {
    backgroundColor: Colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    padding: Sizes.lg,
    borderRadius: Sizes.radiusMedium,
    marginBottom: Sizes.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  paymentOptionText: {
    fontSize: Sizes.regular,
    color: Colors.textPrimary,
    marginLeft: Sizes.md,
    fontWeight: '600',
  },

  // Confirmation (Step 7)
  confirmationContainer: {
    alignItems: 'center',
    paddingVertical: Sizes.xl,
  },
  successIcon: {
    marginBottom: Sizes.lg,
  },
  confirmationTitle: {
    fontSize: Sizes.title,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: Sizes.sm,
  },
  confirmationSubtitle: {
    fontSize: Sizes.regular,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Sizes.xl,
  },
  appointmentDetailsCard: {
    backgroundColor: Colors.success + '10',
    borderRadius: Sizes.radiusLarge,
    padding: Sizes.lg,
    width: '100%',
    marginBottom: Sizes.lg,
  },
  detailsTitle: {
    fontSize: Sizes.large,
    fontWeight: 'bold',
    color: Colors.success,
    marginBottom: Sizes.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Sizes.sm,
  },
  detailLabel: {
    fontSize: Sizes.medium,
    color: Colors.textSecondary,
  },
  detailValue: {
    fontSize: Sizes.medium,
    color: Colors.textPrimary,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  notesCard: {
    backgroundColor: Colors.kbrBlue + '10',
    borderRadius: Sizes.radiusLarge,
    padding: Sizes.lg,
    width: '100%',
    marginBottom: Sizes.xl,
  },
  notesTitle: {
    fontSize: Sizes.regular,
    fontWeight: 'bold',
    color: Colors.kbrBlue,
    marginBottom: Sizes.md,
  },
  noteItem: {
    marginBottom: Sizes.sm,
  },
  noteText: {
    fontSize: Sizes.small,
    color: Colors.textPrimary,
    lineHeight: 18,
  },

  // Buttons
  backButton: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.kbrBlue,
    borderRadius: Sizes.radiusMedium,
    paddingVertical: Sizes.md,
    paddingHorizontal: Sizes.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginRight: Sizes.sm,
  },
  backButtonText: {
    color: Colors.kbrBlue,
    fontSize: Sizes.medium,
    fontWeight: '600',
  },
  continueButton: {
    backgroundColor: Colors.kbrBlue,
    borderRadius: Sizes.radiusMedium,
    paddingVertical: Sizes.md,
    paddingHorizontal: Sizes.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 2,
  },
  continueButtonText: {
    color: Colors.white,
    fontSize: Sizes.medium,
    fontWeight: 'bold',
  },
  payNowButton: {
    backgroundColor: Colors.kbrBlue,
    borderRadius: Sizes.radiusMedium,
    paddingVertical: Sizes.md,
    paddingHorizontal: Sizes.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 2,
  },
  payNowButtonText: {
    color: Colors.white,
    fontSize: Sizes.medium,
    fontWeight: 'bold',
    marginLeft: Sizes.sm,
  },
  buttonContainer: {
    flexDirection: 'row',
    paddingHorizontal: Sizes.screenPadding,
    paddingVertical: Sizes.lg,
  },
  bookAnotherButton: {
    backgroundColor: Colors.kbrBlue,
    borderRadius: Sizes.radiusMedium,
    paddingVertical: Sizes.md,
    paddingHorizontal: Sizes.xl,
    marginBottom: Sizes.md,
    width: '100%',
    alignItems: 'center',
  },
  bookAnotherButtonText: {
    color: Colors.white,
    fontSize: Sizes.regular,
    fontWeight: 'bold',
  },
  goHomeButton: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.kbrBlue,
    borderRadius: Sizes.radiusMedium,
    paddingVertical: Sizes.md,
    paddingHorizontal: Sizes.xl,
    width: '100%',
    alignItems: 'center',
  },
  goHomeButtonText: {
    color: Colors.kbrBlue,
    fontSize: Sizes.regular,
    fontWeight: '600',
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: Colors.white,
    borderRadius: Sizes.radiusLarge,
    padding: Sizes.xl,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: Sizes.large,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Sizes.sm,
  },
  modalSubtitle: {
    fontSize: Sizes.medium,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Sizes.lg,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Sizes.radiusMedium,
    paddingHorizontal: Sizes.md,
    paddingVertical: Sizes.sm,
    fontSize: Sizes.medium,
    marginBottom: Sizes.md,
  },
  modalButtonRow: {
    flexDirection: 'row',
    gap: Sizes.md,
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.textSecondary,
    borderRadius: Sizes.radiusMedium,
    paddingVertical: Sizes.md,
    alignItems: 'center',
  },
  modalCancelText: {
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  modalConfirmButton: {
    flex: 1,
    backgroundColor: Colors.kbrBlue,
    borderRadius: Sizes.radiusMedium,
    paddingVertical: Sizes.md,
    alignItems: 'center',
  },
  modalConfirmText: {
    color: Colors.white,
    fontWeight: 'bold',
  },
  otpButton: {
    backgroundColor: Colors.kbrBlue,
    borderRadius: Sizes.radiusMedium,
    paddingVertical: Sizes.md,
    alignItems: 'center',
    width: '100%',
  },
  otpButtonText: {
    color: Colors.white,
    fontSize: Sizes.medium,
    fontWeight: 'bold',
  },
});