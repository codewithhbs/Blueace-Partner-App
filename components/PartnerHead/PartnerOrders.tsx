import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
    FadeInUp,
    FadeOutDown,
    withSpring,
    useAnimatedStyle,
    useSharedValue,
} from 'react-native-reanimated';
import { Skeleton } from 'react-native-skeletons';
import { fetchMemeber, FetchNewOrder, GetDataOfVendor } from '~/utils/api/Api';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

interface PartnerOrdersProps {
    reload: boolean;
}

interface StatCard {
    id: string;
    title: string;
    value: string | number;
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
    route?: string;
    prefix?: string;
}

export default function PartnerOrders({ reload }: PartnerOrdersProps) {
    const router = useNavigation();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [stats, setStats] = useState<StatCard[]>([]);
    const [ordersData, setOrdersData] = useState<any[]>([]);
    const [membersData, setMembersData] = useState<any[]>([]);
    const [vendorInfo, setVendorInfo] = useState<any>({});
    const scale = useSharedValue(1);

    // Optimized animation styles
    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }]
    }));

    const handlePressIn = useCallback(() => {
        scale.value = withSpring(0.95);
    }, [scale]);

    const handlePressOut = useCallback(() => {
        scale.value = withSpring(1);
    }, [scale]);

    // Fetch raw data
    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);

            const [orders = [], members = [], vendorData = {}] = await Promise.all([
                FetchNewOrder().catch(() => []),
                fetchMemeber().catch(() => []),
                GetDataOfVendor().catch(() => ({}))
            ]);

            console.log(
                `orders: ${Array.isArray(orders) ? orders.length : 0}, members: ${members.length}, vendorData: ${vendorData?.data?.totalOrders || 0}`
            );

            setOrdersData(Array.isArray(orders) ? orders : []);
            setMembersData(Array.isArray(members) ? members : []);
            setVendorInfo(vendorData || {});
        } catch (err) {
            setError('Failed to fetch data. Please try again.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Process data with useMemo at component level
    const newOrders = useMemo(() => {
        return ordersData.filter((item) =>
            item.OrderStatus === 'Vendor Assigned' &&
            (!item.AllowtedVendorMember || item.AllowtedVendorMember == null)
        );
    }, [ordersData]);

    const ongoingOrders = useMemo(() => {
        return ordersData.filter((item) =>
            item.OrderStatus !== 'Service Done' &&
            item.AllowtedVendorMember
        );
    }, [ordersData]);

    const completedOrders = useMemo(() => {
        return ordersData.filter((item) =>
            item.OrderStatus === 'Service Done'
        );
    }, [ordersData]);

    // Generate stats based on processed data
    const generatedStats = useMemo(() => [
        {
            id: 'new',
            title: 'New Orders',
            value: newOrders.length || 0,
            icon: 'cart-outline',
            color: '#4F46E5',
            route: 'New_order'
        },
        {
            id: 'ongoing',
            title: 'Running Tasks',
            value: ongoingOrders.length || 0,
            icon: 'timer-outline',
            color: '#059669',
            route: 'ongoing_order'
        },
        {
            id: 'completed',
            title: 'Completed Orders',
            value: vendorInfo?.data?.totalOrders || completedOrders.length || 0,
            icon: 'checkmark-circle-outline',
            color: '#0EA5E9',
            route: 'all_completed'
        },
        {
            id: 'earnings',
            title: 'Total Earnings',
            value: vendorInfo?.data?.earning || 0,
            prefix: '₹',
            icon: 'wallet-outline',
            color: '#8B5CF6'
        },
        {
            id: 'hours',
            title: 'Working Hours',
            value: '8h',
            icon: 'time-outline',
            color: '#EC4899'
        },
        {
            id: 'members',
            title: 'Team Members',
            value: membersData?.length || 0,
            icon: 'people-outline',
            color: '#F59E0B',
            route: 'all_member'
        }
    ], [newOrders, ongoingOrders, completedOrders, vendorInfo, membersData]);

    // Update stats whenever generated stats change
    useEffect(() => {
        setStats(generatedStats);
    }, [generatedStats]);

    useEffect(() => {
        fetchData();
    }, [reload, fetchData]);

    // Memoized render function
    const renderStatCard = useCallback((item: StatCard, index: number) => (
        <Animated.View
            key={item.id}
            entering={FadeInUp.delay(index * 100)}
            exiting={FadeOutDown}
            style={[styles.cardContainer, animatedStyle]}
        >
            <TouchableOpacity
                style={[styles.card, { borderColor: `${item.color}20` }]}
                onPress={() => item.route && router.navigate(item.route as never)}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                activeOpacity={0.9}
                disabled={!item.route}
            >
                <View style={[styles.iconContainer, { backgroundColor: `${item.color}15` }]}>
                    <Ionicons name={item.icon} size={24} color={item.color} />
                </View>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={[styles.value, { color: item.color }]}>
                    {item.prefix}{item.value}
                </Text>
            </TouchableOpacity>
        </Animated.View>
    ), [animatedStyle, handlePressIn, handlePressOut, router]);

    // Memoize skeleton cards
    const skeletonCards = useMemo(() => (
        Array(6).fill(null).map((_, index) => (
            <View key={`skeleton-${index}`} style={styles.cardContainer}>
                <View style={[styles.card, styles.skeletonCard]}>
                    <Skeleton width={40} height={40} radius={20} />
                    <Skeleton width={80} height={20} radius={4} style={{ marginTop: 12 }} />
                    <Skeleton width={60} height={24} radius={4} style={{ marginTop: 8 }} />
                </View>
            </View>
        ))
    ), []);

    return (
        <View style={styles.container}>
            {error ? (
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle-outline" size={24} color="#EF4444" />
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={fetchData}>
                        <Text style={styles.retryText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <View style={styles.grid}>
                    {isLoading ? skeletonCards : stats.map(renderStatCard)}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
        padding: 16,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
        alignItems: 'flex-start',
    },
    cardContainer: {
        width: CARD_WIDTH,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3.84,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    title: {
        fontSize: 14,
        fontWeight: '500',
        color: '#64748B',
        marginBottom: 4,
    },
    value: {
        fontSize: 24,
        fontWeight: '700',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    errorText: {
        fontSize: 16,
        color: '#64748B',
        textAlign: 'center',
        marginTop: 12,
        marginBottom: 16,
    },
    retryButton: {
        backgroundColor: '#4F46E5',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    retryText: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
    skeletonCard: {
        alignItems: 'flex-start',
        justifyContent: 'center',
        borderColor: '#E2E8F0',
    },
});