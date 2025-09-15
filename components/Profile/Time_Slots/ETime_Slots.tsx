import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  RefreshControl,
  Dimensions,
} from 'react-native';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { getValueFor } from '~/utils/Service/SecureStore';
import MainHeading from '~/components/Heading/Main_Heading';
import { colors } from '~/colors/Colors';

const { width } = Dimensions.get('window');

// Enhanced logging utility
const logger = {
  info: (message: string, data?: any) => {
    console.log(`[EditTimingSlot] INFO: ${message}`, data || '');
  },
  error: (message: string, error?: any) => {
    console.error(`[EditTimingSlot] ERROR: ${message}`, error || '');
  },
  warn: (message: string, data?: any) => {
    console.warn(`[EditTimingSlot] WARN: ${message}`, data || '');
  },
  debug: (message: string, data?: any) => {
    console.log(`[EditTimingSlot] DEBUG: ${message}`, data || '');
  }
};

interface TimeSlot {
  _id: string;
  time: string;
}

interface Schedule {
  _id?: string;
  day: string;
  morningSlot: string;
  afternoonSlot: string;
  eveningSlot: string;
  is_active: boolean;
}

interface User {
  _id: string;
  [key: string]: any;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const;

type DayOfWeek = typeof DAYS_OF_WEEK[number];

const API_BASE_URL = 'https://api.blueaceindia.com/api/v1';

const SLOT_TYPES = {
  MORNING: 'morningSlot',
  AFTERNOON: 'afternoonSlot',
  EVENING: 'eveningSlot',
} as const;

export default function EditTimingSlot() {
  const navigation = useNavigation();
  
  // State management
  const [formData, setFormData] = useState<Schedule[]>([]);
  const [allTimeSlots, setAllTimeSlots] = useState<TimeSlot[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0); // First item expanded by default
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [hasExistingSchedule, setHasExistingSchedule] = useState<boolean>(false);

  // Initialize user data
  const initializeUser = useCallback(async (): Promise<User> => {
    logger.info('Initializing user data');
    try {
      const userData = await getValueFor('user') as User;
      if (!userData?._id) {
        throw new Error('User authentication failed - no user ID found');
      }
      setUser(userData);
      logger.info('User initialized successfully', { userId: userData._id });
      return userData;
    } catch (err) {
      logger.error('User initialization failed', err);
      throw new Error('User not authenticated');
    }
  }, []);

  // Fetch existing schedule with enhanced error handling
  const fetchExistingSchedule = useCallback(async (userData: User): Promise<boolean> => {
    logger.info('Fetching existing schedule', { userId: userData._id });
    try {
      const response = await axios.get<ApiResponse<{ schedule: Schedule[] }>>(
        `${API_BASE_URL}/get-single-working-hours/${userData._id}`,
        {
          timeout: 10000,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      logger.debug('Schedule API response', response.data);

      if (response.data?.data?.schedule?.length > 0) {
        setFormData(response.data.data.schedule);
        logger.info('Schedule loaded successfully', { 
          scheduleCount: response.data.data.schedule.length 
        });
        return true; // Has existing schedule
      } else {
        logger.warn('No existing schedules found, initializing with empty schedule');
        setFormData([createEmptySchedule()]);
        return false; // No existing schedule
      }
    } catch (err) {
      logger.error('Failed to fetch existing schedule', err);
      const errorMessage = axios.isAxiosError(err) && err.response?.data?.message 
        ? err.response.data.message 
        : 'Failed to fetch existing schedule';
      
      // Initialize with empty schedule on error
      setFormData([createEmptySchedule()]);
      Alert.alert('Error', errorMessage);
      return false;
    }
  }, []);

  // Fetch time slots with enhanced error handling
  const fetchTimeSlots = useCallback(async (): Promise<void> => {
    logger.info('Fetching available time slots');
    try {
      const response = await axios.get<ApiResponse<TimeSlot[]>>(
        `${API_BASE_URL}/get-all-timing`,
        {
          timeout: 10000,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      logger.debug('Time slots API response', response.data);

      if (response.data?.data && Array.isArray(response.data.data)) {
        setAllTimeSlots(response.data.data);
        logger.info('Time slots loaded successfully', { 
          slotsCount: response.data.data.length 
        });
      } else {
        logger.warn('Invalid time slots response format');
        setAllTimeSlots([]);
      }
    } catch (err) {
      logger.error('Failed to fetch time slots', err);
      const errorMessage = axios.isAxiosError(err) && err.response?.data?.message 
        ? err.response.data.message 
        : 'Failed to fetch time slots';
      
      setAllTimeSlots([]);
      Alert.alert('Error', errorMessage);
      throw err;
    }
  }, []);

  // Create empty schedule object
  const createEmptySchedule = (): Schedule => ({
    day: '',
    morningSlot: '',
    afternoonSlot: '',
    eveningSlot: '',
    is_active: true,
  });

  // Initialize data on component mount
  const initializeData = useCallback(async (): Promise<void> => {
    logger.info('Starting data initialization');
    setIsLoading(true);
    setError(null);

    try {
      const userData = await initializeUser();
      await fetchTimeSlots();
      const hasSchedule = await fetchExistingSchedule(userData);
      setHasExistingSchedule(hasSchedule);
      logger.info('Data initialization completed successfully', { hasExistingSchedule: hasSchedule });
    } catch (err) {
      const errorMessage = axios.isAxiosError(err) && err.response?.data?.message 
        ? err.response.data.message 
        : err instanceof Error ? err.message : 'Failed to initialize data';
      
      logger.error('Data initialization failed', err);
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [initializeUser, fetchTimeSlots, fetchExistingSchedule]);

  // Refresh data
  const handleRefresh = useCallback(async (): Promise<void> => {
    logger.info('Refreshing data');
    setIsRefreshing(true);
    try {
      await initializeData();
    } finally {
      setIsRefreshing(false);
    }
  }, [initializeData]);

  // Handle form field changes with validation
  const handleChange = useCallback((
    value: string, 
    index: number, 
    field: keyof Schedule
  ): void => {
    logger.debug('Form field changed', { index, field, value });
    
    setFormData(prev => prev.map((schedule, i) => {
      if (i === index) {
        const updatedSchedule = { ...schedule, [field]: value };
        logger.debug('Schedule updated', updatedSchedule);
        return updatedSchedule;
      }
      return schedule;
    }));
  }, []);

  // Add new schedule item
  const handleAddMore = useCallback((): void => {
    logger.info('Adding new schedule item');
    const newSchedule = createEmptySchedule();
    setFormData(prev => {
      const updated = [...prev, newSchedule];
      logger.debug('New schedule added', { totalSchedules: updated.length });
      return updated;
    });
    // Expand the newly added item
    setExpandedIndex(formData.length);
  }, [formData.length]);

  // Remove schedule item with confirmation
  const handleRemove = useCallback((index: number): void => {
    logger.info('Attempting to remove schedule item', { index });
    
    if (formData.length <= 1) {
      Alert.alert('Warning', 'You must have at least one schedule item');
      return;
    }

    Alert.alert(
      'Confirm Deletion',
      'Are you sure you want to remove this schedule?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setFormData(prev => {
              const updated = prev.filter((_, i) => i !== index);
              logger.info('Schedule item removed', { 
                removedIndex: index, 
                remainingCount: updated.length 
              });
              return updated;
            });
            // Adjust expanded index if necessary
            if (expandedIndex === index) {
              setExpandedIndex(null);
            } else if (expandedIndex && expandedIndex > index) {
              setExpandedIndex(expandedIndex - 1);
            }
          }
        }
      ]
    );
  }, [formData.length, expandedIndex]);

  // Toggle accordion with enhanced UX
  const toggleAccordion = useCallback((index: number): void => {
    logger.debug('Toggling accordion', { index, currentExpanded: expandedIndex });
    setExpandedIndex(expandedIndex === index ? null : index);
  }, [expandedIndex]);

  // Validate form data
  const validateFormData = useCallback((): string | null => {
    logger.info('Validating form data');
    
    if (formData.length === 0) {
      return 'At least one schedule is required';
    }

    const usedDays = new Set<string>();
    
    for (let i = 0; i < formData.length; i++) {
      const schedule = formData[i];
      
      if (!schedule.day) {
        return `Day is required for schedule ${i + 1}`;
      }
      
      if (usedDays.has(schedule.day)) {
        return `Duplicate day found: ${schedule.day}`;
      }
      
      usedDays.add(schedule.day);
      
      if (!schedule.morningSlot && !schedule.afternoonSlot && !schedule.eveningSlot) {
        return `At least one time slot is required for ${schedule.day}`;
      }
    }
    
    logger.info('Form validation passed');
    return null;
  }, [formData]);

  // Submit form with enhanced error handling
  const handleSubmit = useCallback(async (): Promise<void> => {
    logger.info('Starting form submission', { hasExistingSchedule });
    
    // Validate form
    const validationError = validateFormData();
    if (validationError) {
      logger.warn('Form validation failed', validationError);
      Alert.alert('Validation Error', validationError);
      return;
    }

    if (!user?._id) {
      logger.error('User not available for submission');
      Alert.alert('Error', 'User authentication required');
      return;
    }

    setIsSubmitting(true);
    logger.debug('Submitting schedule data', { 
      schedules: formData.length, 
      isUpdate: hasExistingSchedule 
    });

    try {
      let response;
      
      if (hasExistingSchedule) {
        // Update existing schedule
        logger.info('Updating existing working hours');
        response = await axios.put(
          `${API_BASE_URL}/update-working-hours/${user._id}`,
          { schedule: formData },
          {
            headers: { 'Content-Type': 'application/json' },
            timeout: 15000,
          }
        );
      } else {
        // Create new schedule
        logger.info('Creating new working hours');
        response = await axios.post(
          `${API_BASE_URL}/create-working-hours/${user._id}`,
          { schedule: formData },
          {
            headers: { 'Content-Type': 'application/json' },
            timeout: 15000,
          }
        );
      }

      logger.info('Schedule operation completed successfully', response.data);
      
      const successMessage = hasExistingSchedule 
        ? 'Schedule updated successfully' 
        : 'Schedule created successfully';
        
      Alert.alert('Success', successMessage, [
        {
          text: 'OK',
          onPress: () => {
            logger.info('Navigating back to home');
            navigation.navigate('home' as never);
          }
        }
      ]);
      
      // Update the state to reflect that we now have a schedule
      setHasExistingSchedule(true);
      
    } catch (err) {
      logger.error('Schedule submission failed', err);
      
      const errorMessage = axios.isAxiosError(err) && err.response?.data?.message 
        ? err.response.data.message 
        : axios.isAxiosError(err) && err.message
        ? err.message
        : 'Failed to save schedule';
      
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, user, validateFormData, navigation, hasExistingSchedule]);

  // Initialize data on mount
  useEffect(() => {
    initializeData();
  }, [initializeData]);

  // Render individual schedule item with enhanced UI
  const renderScheduleItem = useCallback((schedule: Schedule, index: number) => {
    const isExpanded = expandedIndex === index;
    const hasData = schedule.day || schedule.morningSlot || schedule.afternoonSlot || schedule.eveningSlot;

    return (
      <View key={index} style={styles.accordionContainer}>
        <TouchableOpacity
          style={[
            styles.accordionHeader,
            isExpanded && styles.accordionHeaderExpanded
          ]}
          onPress={() => toggleAccordion(index)}
          activeOpacity={0.7}
        >
          <View style={styles.headerContent}>
            <Text style={styles.dayText}>
              {schedule.day || `Schedule ${index + 1}`}
            </Text>
            {hasData && (
              <View style={styles.statusIndicator}>
                <Text style={styles.statusText}>
                  {[schedule.morningSlot, schedule.afternoonSlot, schedule.eveningSlot]
                    .filter(Boolean).length} slots
                </Text>
              </View>
            )}
          </View>
          <Ionicons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={colors.white}
          />
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.accordionBody}>
            {/* Day Selection */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                <Ionicons name="calendar-outline" size={16} color={colors.primary} />
                {' '}Day *
              </Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={schedule.day}
                  onValueChange={(value) => handleChange(value, index, 'day')}
                  style={styles.picker}
                >
                  <Picker.Item label="Select a day" value="" />
                  {DAYS_OF_WEEK.map((day) => (
                    <Picker.Item key={day} label={day} value={day} />
                  ))}
                </Picker>
              </View>
            </View>

            {/* Time Slots */}
            {Object.entries(SLOT_TYPES).map(([label, field]) => (
              <View key={field} style={styles.inputGroup}>
                <Text style={styles.label}>
                  <Ionicons 
                    name={
                      label === 'MORNING' ? 'sunny-outline' :
                      label === 'AFTERNOON' ? 'partly-sunny-outline' :
                      'moon-outline'
                    } 
                    size={16} 
                    color={colors.primary} 
                  />
                  {' '}{label.charAt(0) + label.slice(1).toLowerCase()} Slot
                </Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={(schedule as any)[field]}
                    onValueChange={(value) => handleChange(value, index, field as keyof Schedule)}
                    style={styles.picker}
                  >
                    <Picker.Item label={`Select ${label.toLowerCase()} time`} value="" />
                    {allTimeSlots.map((slot) => (
                      <Picker.Item key={slot._id} label={slot.time} value={slot.time} />
                    ))}
                  </Picker>
                </View>
              </View>
            ))}

            {/* Remove Button */}
            {formData.length > 1 && (
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleRemove(index)}
                activeOpacity={0.7}
              >
                <Ionicons name="trash-outline" size={16} color="#fff" />
                <Text style={styles.removeButtonText}>Remove Schedule</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    );
  }, [expandedIndex, allTimeSlots, formData.length, toggleAccordion, handleChange, handleRemove]);

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading schedules...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          colors={[colors.primary]}
        />
      }
      showsVerticalScrollIndicator={false}
    >
      
      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={20} color={colors.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <View style={styles.contentContainer}>
        <Text style={styles.instructionText}>
          Configure your working hours by setting up time slots for each day of the week.
        </Text>

        {formData.map(renderScheduleItem)}

        <TouchableOpacity 
          style={styles.addButton} 
          onPress={handleAddMore}
          activeOpacity={0.7}
        >
          <Ionicons name="add-circle-outline" size={20} color="#fff" />
          <Text style={styles.addButtonText}>Add Another Day</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.submitButton, 
            isSubmitting && styles.disabledButton
          ]}
          onPress={handleSubmit}
          disabled={isSubmitting}
          activeOpacity={isSubmitting ? 1 : 0.7}
        >
          {isSubmitting ? (
            <View style={styles.submitButtonContent}>
              <ActivityIndicator color="#fff" size="small" />
              <Text style={styles.submitButtonText}>
                {hasExistingSchedule ? 'Updating...' : 'Creating...'}
              </Text>
            </View>
          ) : (
            <View style={styles.submitButtonContent}>
              <Ionicons name="save-outline" size={20} color="#fff" />
              <Text style={styles.submitButtonText}>
                {hasExistingSchedule ? 'Update Schedule' : 'Create Schedule'}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
  },
  contentContainer: {
    padding: 16,
  },
  instructionText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 24,
    lineHeight: 20,
    textAlign: 'center',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fee2e2',
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
  },
  errorText: {
    marginLeft: 8,
    color: colors.error,
    fontSize: 14,
    flex: 1,
  },
  accordionContainer: {
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.secondary,
    minHeight: 60,
  },
  accordionHeaderExpanded: {
    backgroundColor: colors.primary,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginRight: 12,
  },
  dayText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  statusIndicator: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: colors.white,
    fontWeight: '500',
  },
  accordionBody: {
    padding: 20,
    backgroundColor: '#fff',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pickerContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    backgroundColor: 'transparent',
  },
  removeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.error,
    padding: 14,
    borderRadius: 12,
    marginTop: 16,
  },
  removeButtonText: {
    marginLeft: 8,
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.success,
    padding: 16,
    borderRadius: 16,
    marginTop: 8,
    marginBottom: 24,
  },
  addButtonText: {
    marginLeft: 8,
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: colors.primary,
    padding: 18,
    borderRadius: 16,
    marginBottom: 32,
    alignItems: 'center',
   
  },
  submitButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  disabledButton: {
    backgroundColor: '#cbd5e1',
  },
});