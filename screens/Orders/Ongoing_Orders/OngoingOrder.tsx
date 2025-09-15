import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FetchNewOrder } from '~/utils/api/Api';
import { colors } from '~/colors/Colors';
import Headers from '~/components/Header/Header';
import { Order } from './types';
import { EmptyState } from '~/components/common/EmptyState';
import OrderList from './OrderList';
import VideoPreview from './VideoPreview';
import LoadingSpinner from '~/components/common/LoadingSpinner';

export default function OngoingOrder() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false); // Added for refresh state
    const [previewUrl, setPreviewUrl] = useState<string | null>(null); // Separate state for URL

    // Fetch data function
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const data = await FetchNewOrder();


            const runningOrder = data.filter(
                (item: Order) =>
                    item.OrderStatus !== 'Service Done' &&
                    item.hasOwnProperty('AllowtedVendorMember')
            );
            setOrders(runningOrder);

        } catch (error) {
            // console.error('Error fetching orders:', error.response);
        } finally {
            setLoading(false);
            setRefreshing(false); // Stop refresh control
        }
    }, []);

    // Initial data fetch
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Handle preview close
    const handlePreviewClose = () => setPreviewUrl(null);

    if (loading) {
        return <LoadingSpinner />;
    }

    if (orders.length === 0) {
        return <EmptyState />;
    }

    return (
        <SafeAreaView style={styles.container}>
            <Headers />
            <ScrollView
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={() => {
                        setRefreshing(true); // Show refresh spinner
                        fetchData();
                    }} />
                }
            >
                <OrderList
                    orders={orders}
                    onShowPreview={(url) => setPreviewUrl(url)}
                    onRefresh={() => {
                        fetchData();
                    }}
                />
            </ScrollView>
            {previewUrl && (
                <VideoPreview
                    url={previewUrl}
                    onClose={handlePreviewClose}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
});
