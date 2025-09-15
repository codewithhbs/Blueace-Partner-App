import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import React from 'react';
import { Calendar } from 'lucide-react-native';
import { colors } from '~/colors/Colors';
import TimeSlot from './TimeSlot';

interface DayCardProps {
    day: {
        day: string;
        morningSlot: string;
        afternoonSlot: string;
        eveningSlot: string;
        is_active: boolean;
    };
    index: number;
}

const DayCard = ({ day, index }: DayCardProps) => {
    const translateY = React.useRef(new Animated.Value(50)).current;
    const opacity = React.useRef(new Animated.Value(0)).current;
    const scale = React.useRef(new Animated.Value(0.9)).current;

    React.useEffect(() => {
        Animated.parallel([
            Animated.timing(translateY, {
                toValue: 0,
                duration: 600,
                delay: index * 100,
                useNativeDriver: true,
            }),
            Animated.timing(opacity, {
                toValue: 1,
                duration: 500,
                delay: index * 100,
                useNativeDriver: true,
            }),
            Animated.spring(scale, {
                toValue: 1,
                friction: 8,
                tension: 40,
                delay: index * 100,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    transform: [{ translateY }, { scale }],
                    opacity,
                },
            ]}
        >
            <View style={styles.header}>
                <Text style={styles.dayText} numberOfLines={1} ellipsizeMode="tail">
                    {day.day}
                </Text>
                <Calendar size={20} color={colors.text} />
            </View>
            <View style={styles.slotsContainer}>
                <TimeSlot
                    type="morning"
                    time={day.morningSlot}
                    isActive={day.is_active}
                    animationDelay={index * 150}
                />
                <TimeSlot
                    type="afternoon"
                    time={day.afternoonSlot}
                    isActive={day.is_active}
                    animationDelay={index * 200}
                />
                <TimeSlot
                    type="evening"
                    time={day.eveningSlot}
                    isActive={day.is_active}
                    animationDelay={index * 250}
                />
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.white,
        borderRadius: 16,
        padding: 16,
        width: 280,
        ...Platform.select({
            ios: {
                shadowColor: colors.shadow,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
            },
            android: {
                elevation: 4,
            },
        }),
        marginRight: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
        backgroundColor: colors.background,
        padding: 12,
        borderRadius: 12,
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
    dayText: {
        fontSize: 18,
        fontWeight: Platform.OS === 'ios' ? '600' : 'bold',
        color: colors.primary,
        marginLeft: 8,
        flex: 1,
    },
    slotsContainer: {
        flexDirection: 'column',
        gap: 8,
    },
});

export default DayCard;