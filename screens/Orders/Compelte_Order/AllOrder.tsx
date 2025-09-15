import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    TextInput,
    ActivityIndicator,
    Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Animated from 'react-native-reanimated'; // Import Reanimated
import { GetDataOfVendor } from '~/utils/api/Api';
import { Linking } from 'react-native';

const ITEMS_PER_PAGE = 10;

interface Order {
    _id: string;
    fullName: string;
    serviceType: string;
    OrderStatus: string;
    PaymentStatus?: string;
    workingDate: string;
    totalAmount?: number;
    EstimatedBill?: {
        EstimatedTotalPrice?: number;
        BillStatus?: string;
        Items?: Array<{
            name: string;
            quantity: number;
            price: number;
            Discount: number;
            _id: string;
        }>;
    };
    address: string;
    nearByLandMark?: string;
    workingDay?: string;
    workingTime?: string;
    AllowtedVendorMember?: string;
    adminCommissionAmount?: number;
    commissionPercent?: number;
    vendorCommissionAmount?: number;
    RangeWhereYouWantService?: {
        location: {
            type: string;
            coordinates: [number, number];
        };
        _id: string;
    }[];
    beforeWorkVideo?: { url: string };
    afterWorkVideo?: { url: string };
    userId?: {
        isAMCUser?: boolean;
        [key: string]: any;
    };
    isInvetorAc?: boolean;
    errorCode?: string[];
    morningSlot?: string;
    afternoonSlot?: string;
    eveningSlot?: string;
    day?: string;
    is_active?: boolean;
    [key: string]: any;
}

interface ErrorCode {
    _id: string;
    code: string;
    description: string;
    Heading: {
        _id: string;
        title: string;
    };
}

export default function AllOrder() {
    const navigation = useNavigation();
    const [orders, setOrders] = useState<Order[]>([]);
    const [errorCodes, setErrorCodes] = useState<ErrorCode[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
    const [dateFilter, setDateFilter] = useState('');
    const [serviceFilter, setServiceFilter] = useState('');

    useEffect(() => {
        fetchOrders();
        fetchErrorCodes();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await GetDataOfVendor();
            if (response.data.orders) {
                setOrders(response.data.orders);
            }
        } catch (err) {
            setError('Failed to fetch orders');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchErrorCodes = async () => {
        try {
            const response = await fetch('/get-all-error-code'); // Adjust URL as needed
            const data = await response.json();
            setErrorCodes(data.data || []);
        } catch (err) {
            console.error('Failed to fetch error codes:', err);
        }
    };

    const filteredOrders = orders.filter(order => {
        const orderDate = new Date(order.workingDate).toLocaleDateString();
        const matchesDate = dateFilter ? orderDate.includes(dateFilter) : true;
        const matchesService = serviceFilter
            ? order.serviceType.toLowerCase().includes(serviceFilter.toLowerCase())
            : true;
        return matchesDate && matchesService;
    });

    const paginatedOrders = filteredOrders.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'service done':
                return '#059669';
            case 'vendor assigned':
                return '#0EA5E9';
            default:
                return '#6B7280';
        }
    };

    const openGoogleMaps = (order: Order) => {
        let mapUrl = '';
        if (order.RangeWhereYouWantService?.[0]?.location?.coordinates) {
            const [longitude, latitude] = order.RangeWhereYouWantService[0].location.coordinates;
            mapUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
        } else {
            const encodedAddress = encodeURIComponent(order.address || '');
            mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
        }
        Linking.openURL(mapUrl).catch(err => console.error('Error opening Google Maps:', err));
    };

    const renderOrderCard = (order: Order) => {
        const isExpanded = expandedOrder === order._id;
        const statusColor = getStatusColor(order.OrderStatus);
        const orderDate = new Date(order.workingDate).toLocaleDateString();
        const isAMCUser = order.userId?.isAMCUser || false;
        const isInvetorAc = order.isInvetorAc || false;

        return (
            <Animated.View key={order._id} style={styles.orderCard}>
                <TouchableOpacity
                    style={styles.orderHeader}
                    onPress={() => setExpandedOrder(isExpanded ? null : order._id)}
                >
                    <View style={styles.orderMain}>
                        <Text style={styles.orderName}>{order.fullName}</Text>
                        <View style={[styles.statusBadge, { backgroundColor: `${statusColor}15` }]}>
                            <Text style={[styles.statusText, { color: statusColor }]}>
                                {order.OrderStatus}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.orderInfo}>
                        <Text style={styles.serviceType}>{order.serviceType}</Text>
                        <Text style={styles.orderDate}>{orderDate}</Text>
                    </View>

                    <View style={styles.expandButton}>
                        <Ionicons
                            name={isExpanded ? 'chevron-up' : 'chevron-down'}
                            size={24}
                            color="#64748B"
                        />
                    </View>
                </TouchableOpacity>

                {isExpanded && (
                    <Animated.View style={styles.expandedContent}>
                        {isAMCUser ? (
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>User Status</Text>
                                <Text style={styles.detailValue}>AMC User</Text>
                            </View>
                        ) : (
                            <>
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Payment Status</Text>
                                    <Text
                                        style={[
                                            styles.detailValue,
                                            {
                                                color:
                                                    order.PaymentStatus === 'paid'
                                                        ? '#059669'
                                                        : '#DC2626',
                                            },
                                        ]}
                                    >
                                        {order.PaymentStatus}
                                    </Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Total Amount</Text>
                                    <Text style={styles.detailValue}>
                                        ₹{order.EstimatedBill?.EstimatedTotalPrice || order.totalAmount}
                                    </Text>
                                </View>
                            </>
                        )}

                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Address</Text>
                            <Text style={styles.detailValue}>{order.address}</Text>
                        </View>

                        {order.nearByLandMark && (
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Nearby Landmark</Text>
                                <Text style={styles.detailValue}>{order.nearByLandMark}</Text>
                            </View>
                        )}

                        {order.workingDay && (
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Working Day</Text>
                                <Text style={styles.detailValue}>{order.workingDay}</Text>
                            </View>
                        )}

                        {order.workingTime && (
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Working Time</Text>
                                <Text style={styles.detailValue}>{order.workingTime}</Text>
                            </View>
                        )}

                        {order.morningSlot && (
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Morning Slot</Text>
                                <Text style={styles.detailValue}>{order.morningSlot}</Text>
                            </View>
                        )}

                        {order.afternoonSlot && (
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Afternoon Slot</Text>
                                <Text style={styles.detailValue}>{order.afternoonSlot}</Text>
                            </View>
                        )}

                        {order.eveningSlot && (
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Evening Slot</Text>
                                <Text style={styles.detailValue}>{order.eveningSlot}</Text>
                            </View>
                        )}

                        {order.is_active !== undefined && (
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Slot Active</Text>
                                <Text style={styles.detailValue}>{order.is_active ? 'Yes' : 'No'}</Text>
                            </View>
                        )}

                        {order.AllowtedVendorMember && (
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Assigned Vendor</Text>
                                <Text style={styles.detailValue}>{order.AllowtedVendorMember}</Text>
                            </View>
                        )}

                        {order.EstimatedBill?.BillStatus && (
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Bill Status</Text>
                                <Text style={styles.detailValue}>{order.EstimatedBill.BillStatus}</Text>
                            </View>
                        )}

                        {!isAMCUser && order.adminCommissionAmount !== undefined && (
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Admin Commission</Text>
                                <Text style={styles.detailValue}>₹{order.adminCommissionAmount}</Text>
                            </View>
                        )}

                        {!isAMCUser && order.commissionPercent !== undefined && (
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Commission Percent</Text>
                                <Text style={styles.detailValue}>{order.commissionPercent}%</Text>
                            </View>
                        )}

                        {!isAMCUser && order.vendorCommissionAmount !== undefined && (
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Vendor Commission</Text>
                                <Text style={styles.detailValue}>₹{order.vendorCommissionAmount}</Text>
                            </View>
                        )}

                        {!isInvetorAc && order.errorCode?.length > 0 && (
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Error Codes</Text>
                                <View style={styles.errorCodeContainer}>
                                    {order.errorCode.map((codeId) => {
                                        const error = errorCodes.find((e) => e._id === codeId);
                                        return error ? (
                                            <Text key={codeId} style={styles.detailValue}>
                                                {error.code}: {error.description}
                                            </Text>
                                        ) : null;
                                    })}
                                </View>
                            </View>
                        )}

                        <TouchableOpacity style={styles.mapButton} onPress={() => openGoogleMaps(order)}>
                            <Ionicons name="map" size={20} color="#FFFFFF" />
                            <Text style={styles.mapButtonText}>Show on Google Maps</Text>
                        </TouchableOpacity>

                        {(order.beforeWorkVideo || order.afterWorkVideo) && (
                            <View style={styles.videoSection}>
                                <Text style={styles.videoLabel}>Work Videos</Text>
                                <View style={styles.videoButtons}>
                                    {order.beforeWorkVideo && (
                                        <TouchableOpacity
                                            style={styles.videoButton}
                                            onPress={() => Linking.openURL(order.beforeWorkVideo?.url)}
                                        >
                                            <Ionicons name="play-circle" size={20} color="#4F46E5" />
                                            <Text style={styles.videoButtonText}>Before Work</Text>
                                        </TouchableOpacity>
                                    )}
                                    {order.afterWorkVideo && (
                                        <TouchableOpacity
                                            style={styles.videoButton}
                                            onPress={() => Linking.openURL(order.afterWorkVideo?.url)}
                                        >
                                            <Ionicons name="play-circle" size={20} color="#4F46E5" />
                                            <Text style={styles.videoButtonText}>After Work</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>
                        )}
                    </Animated.View>
                )}
            </Animated.View>
        );
    };

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#4F46E5" />
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={fetchOrders}>
                    <Text style={styles.retryText}>Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.filters}>
                <TextInput
                    style={styles.filterInput}
                    placeholder="Filter by date"
                    value={dateFilter}
                    onChangeText={setDateFilter}
                />
                <TextInput
                    style={styles.filterInput}
                    placeholder="Filter by service"
                    value={serviceFilter}
                    onChangeText={setServiceFilter}
                />
            </View>

            <ScrollView style={styles.ordersList}>
                {paginatedOrders.map(renderOrderCard)}
            </ScrollView>

            <View style={styles.pagination}>
                <TouchableOpacity
                    style={[styles.pageButton, currentPage === 1 && styles.pageButtonDisabled]}
                    onPress={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                >
                    <Ionicons name="chevron-back" size={24} color={currentPage === 1 ? '#CBD5E1' : '#1E293B'} />
                </TouchableOpacity>

                <Text style={styles.pageText}>
                    Page {currentPage} of {totalPages}
                </Text>

                <TouchableOpacity
                    style={[styles.pageButton, currentPage === totalPages && styles.pageButtonDisabled]}
                    onPress={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                >
                    <Ionicons name="chevron-forward" size={24} color={currentPage === totalPages ? '#CBD5E1' : '#1E293B'} />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
    },
    filters: {
        padding: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
        gap: 12,
    },
    filterInput: {
        height: 40,
        backgroundColor: '#F1F5F9',
        borderRadius: 8,
        paddingHorizontal: 12,
        fontSize: 16,
    },
    ordersList: {
        flex: 1,
        padding: 16,
    },
    orderCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        marginBottom: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        ...Platform.select({
            web: {
                cursor: 'pointer',
            },
            default: {
                elevation: 2,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
            }
        })
    },
    orderHeader: {
        padding: 16,
    },
    orderMain: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    orderName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1E293B',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '500',
    },
    orderInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    serviceType: {
        fontSize: 14,
        color: '#64748B',
    },
    orderDate: {
        fontSize: 14,
        color: '#64748B',
    },
    expandButton: {
        alignItems: 'center',
        marginTop: 8,
    },
    expandedContent: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
        backgroundColor: '#F8FAFC',
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    detailLabel: {
        fontSize: 14,
        color: '#64748B',
    },
    detailValue: {
        fontSize: 14,
        fontWeight: '500',
        color: '#1E293B',
    },
    errorCodeContainer: {
        flexDirection: 'column',
        gap: 8,
    },
    mapButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        padding: 10,
        backgroundColor: '#4F46E5',
        borderRadius: 6,
        marginBottom: 12,
    },
    mapButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '500',
    },
    videoSection: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
    },
    videoLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: '#1E293B',
        marginBottom: 8,
    },
    videoButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    videoButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        padding: 8,
        backgroundColor: '#EEF2FF',
        borderRadius: 6,
    },
    videoButtonText: {
        fontSize: 14,
        color: '#4F46E5',
        fontWeight: '500',
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
        gap: 16,
    },
    pageButton: {
        padding: 8,
        borderRadius: 6,
        backgroundColor: '#F1F5F9',
    },
    pageButtonDisabled: {
        backgroundColor: '#F8FAFC',
    },
    pageText: {
        fontSize: 14,
        color: '#1E293B',
        fontWeight: '500',
    },
    errorText: {
        fontSize: 16,
        color: '#EF4444',
        marginBottom: 16,
    },
    retryButton: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        backgroundColor: '#4F46E5',
        borderRadius: 8,
    },
    retryText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});