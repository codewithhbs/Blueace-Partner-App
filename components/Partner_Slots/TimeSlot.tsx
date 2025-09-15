import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import React from 'react';
import { Clock, Sun, Moon } from 'lucide-react-native';
import { colors } from '~/colors/Colors';

interface TimeSlotProps {
  time: string;
  isActive: boolean;
  type: 'morning' | 'afternoon' | 'evening';
  animationDelay: number;
}

const TimeSlot = ({ time, isActive, type, animationDelay }: TimeSlotProps) => {
  const scaleAnim = React.useRef(new Animated.Value(0)).current;
  const translateX = React.useRef(new Animated.Value(-20)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        delay: animationDelay,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(translateX, {
        toValue: 0,
        duration: 400,
        delay: animationDelay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const getIcon = () => {
    const iconColor = isActive ? colors.primary : colors.placeholder;
    const iconSize = Platform.OS === 'ios' ? 14 : 16;

    switch (type) {
      case 'morning':
        return <Sun size={iconSize} color={iconColor} />;
      case 'afternoon':
        return <Clock size={iconSize} color={iconColor} />;
      case 'evening':
        return <Moon size={iconSize} color={iconColor} />;
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        !isActive && styles.inactive,
        { transform: [{ scale: scaleAnim }, { translateX }] }
      ]}
    >
      <View style={styles.iconContainer}>{getIcon()}</View>
      <Text 
        style={[styles.time, !isActive && styles.inactiveText]}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {time}
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: Platform.OS === 'ios' ? 12 : 10,
    borderWidth: Platform.OS === 'ios' ? 1 : 0,
    borderColor: colors.border,
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  inactive: {
    backgroundColor: colors.border,
    opacity: 0.7,
    ...Platform.select({
      ios: {
        shadowOpacity: 0,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  iconContainer: {
    marginRight: 8,
    padding: 4,
    backgroundColor: Platform.OS === 'ios' ? colors.white : 'transparent',
    borderRadius: 8,
  },
  time: {
    fontSize: Platform.OS === 'ios' ? 14 : 13,
    color: colors.text,
    fontWeight: Platform.OS === 'ios' ? '500' : 'bold',
    flex: 1,
  },
  inactiveText: {
    color: colors.placeholder,
  },
});

export default TimeSlot;