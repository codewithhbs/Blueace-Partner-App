import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { DeleteBill, getBill } from '~/utils/api/Api';
import { CheckCircle, XCircle, ClipboardList, IndianRupee, ArrowLeft } from 'lucide-react-native';
import { colors } from '~/colors/Colors';
import Animated, { FadeInDown, FadeInUp, SlideInRight } from 'react-native-reanimated';

interface RouteParams {
    orderId: string;
}

type EstimatedSeeRouteProp = RouteProp<{ params: RouteParams }, 'params'>;

export default function EstimatedSee() {
    const route = useRoute<EstimatedSeeRouteProp>();
    const { orderId } = route.params || { orderId: '' };
    const [billDetails, setBillDetails] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const navigation = useNavigation();

    useEffect(() => {
        const fetchBill = async () => {
            try {
                const response = await getBill(orderId);
                setBillDetails(response.bills);
            } catch (error) {
                console.error('Error fetching bill:', error);
                Alert.alert('Error', 'Failed to fetch bill details');
            } finally {
                setLoading(false);
            }
        };
        fetchBill();
    }, [orderId]);

    const deleteBill = async (Billid: string) => {
        try {
            Alert.alert(
                'Confirm Delete',
                'Are you sure you want to delete this bill and generate a new one?',
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Delete',
                        style: 'destructive',
                        onPress: async () => {
                            setLoading(true);
                            await DeleteBill(Billid);
                            Alert.alert('Success', 'Bill deleted successfully');
                            navigation.navigate('ongoing_order');
                        }
                    }
                ]
            );
        } catch (error) {
            console.error('Error deleting bill:', error);
            Alert.alert('Error', 'Failed to delete bill');
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Pending':
                return colors.warning;
            case 'Accepted':
                return colors.success;
            case 'Rejected':
                return colors.error;
            default:
                return colors.text;
        }
    };

    const renderBillCard = (item: any, index: number) => (
        <Animated.View
            key={item._id}
            entering={SlideInRight.delay(index * 100)}
            style={styles.card}
        >
            <View style={styles.cardHeader}>
                <View style={styles.headerLeft}>
                    <ClipboardList color={colors.primary} size={24} />
                    <Text style={styles.billHeaderText}>Order ID: {item.orderId.substring(0, 5) + '...'}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.BillStatus) + '20' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(item.BillStatus) }]}>
                        {item.BillStatus}
                    </Text>
                </View>
            </View>

            <View style={styles.priceContainer}>
                <Text style={styles.priceLabel}>Total Amount:</Text>
                <View style={styles.priceWrapper}>
                    <IndianRupee size={20} color={colors.primary} />
                    <Text style={styles.price}>{item.EstimatedTotalPrice}</Text>
                </View>
            </View>

            <View style={styles.itemsContainer}>
                <Text style={styles.itemsHeader}>Items</Text>
                <View style={styles.itemsList}>
                    {item.Items.map((subItem: any, subIndex: number) => (
                        <Animated.View
                            key={subItem._id || subIndex}
                            entering={FadeInUp.delay(subIndex * 50)}
                            style={styles.itemRow}
                        >
                            <View style={styles.itemLeft}>
                                <Text style={styles.itemName}>{subItem.name}</Text>
                                <Text style={styles.itemQuantity}>Qty: {subItem.quantity}</Text>
                            </View>
                            <View style={styles.itemRight}>
                                <View style={styles.priceWrapper}>
                                    <IndianRupee size={14} color={colors.text} />
                                    <Text style={styles.itemPrice}>{subItem.price}</Text>
                                </View>
                                <Text style={styles.itemDiscount}>{subItem.Discount}% off</Text>
                            </View>
                        </Animated.View>
                    ))}
                </View>
            </View>

            {item.BillStatus !== 'Accepted' && (
                <TouchableOpacity
                    onPress={() => deleteBill(item._id)}
                    style={styles.deleteButton}
                    activeOpacity={0.7}
                >
                    <XCircle color={colors.white} size={20} />
                    <Text style={styles.deleteButtonText}>
                        Delete & Regenerate Bill
                    </Text>
                </TouchableOpacity>
            )}
        </Animated.View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <Animated.View
                entering={FadeInDown}
                style={styles.header}
            >
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                >
                    <ArrowLeft color={colors.primary} size={24} />
                </TouchableOpacity>
                <Text style={styles.title}>Estimated Bills</Text>
                <View style={{ width: 24 }} />
            </Animated.View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={styles.loadingText}>Loading bill details...</Text>
                </View>
            ) : billDetails.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No bills found</Text>
                </View>
            ) : (
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {billDetails.map((item, index) => renderBillCard(item, index))}
                </ScrollView>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    backButton: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: colors.background,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.primary,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: colors.text,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: colors.placeholder,
    },
    card: {
        backgroundColor: colors.white,
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: colors.shadow,
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 8,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    billHeaderText: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
        marginLeft: 8,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    statusText: {
        fontSize: 14,
        fontWeight: '600',
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    priceWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    priceLabel: {
        fontSize: 16,
        color: colors.text,
    },
    price: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.primary,
    },
    itemsContainer: {
        marginTop: 16,
    },
    itemsHeader: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 12,
    },
    itemsList: {
        gap: 8,
    },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: colors.border + '30',
    },
    itemLeft: {
        flex: 1,
    },
    itemName: {
        fontSize: 15,
        fontWeight: '500',
        color: colors.text,
        marginBottom: 4,
    },
    itemQuantity: {
        fontSize: 14,
        color: colors.placeholder,
    },
    itemRight: {
        alignItems: 'flex-end',
    },
    itemPrice: {
        fontSize: 15,
        fontWeight: '500',
        color: colors.text,
    },
    itemDiscount: {
        fontSize: 13,
        color: colors.success,
        marginTop: 4,
    },
    deleteButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 16,
        padding: 12,
        backgroundColor: colors.error,
        borderRadius: 12,
    },
    deleteButtonText: {
        color: colors.white,
        fontWeight: '600',
        marginLeft: 8,
    },
});