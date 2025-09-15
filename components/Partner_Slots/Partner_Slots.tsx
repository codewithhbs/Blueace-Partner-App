import { View, ScrollView, StyleSheet, Animated, Platform } from 'react-native';
import React, { useEffect, useState } from 'react';
import { FetchUserDetails } from '~/utils/api/Api';
import DayCard from './DayCard';

export default function Partner_Slots({ reload }) {
  const [userData, setUserData] = useState<any[]>([]);
  const scrollX = React.useRef(new Animated.Value(0)).current;

  const fetchStatus = async () => {
    try {
      const userDetails = await FetchUserDetails();
      console.log(userDetails?.workingHour?.schedule)
      setUserData(userDetails?.workingHour?.schedule || []);
    } catch (error) {
      console.error('Error fetching status:', error);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  if (reload === true) {
    fetchStatus();
  }

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        scrollEventThrottle={16}
        decelerationRate={Platform.OS === 'ios' ? 0.992 : 0.98}
        snapToInterval={Platform.OS === 'ios' ? 296 : undefined}
      >
        {userData.map((day, index) => (
          <DayCard key={day.day} day={day} index={index} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    ...Platform.select({
      ios: {
        paddingBottom: 16,
      },
      android: {
        paddingBottom: 12,
      },
    }),
  },
});