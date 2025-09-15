import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Order } from '../types';
import OrderCard from './OrderCard';

interface OrderListProps {
    orders: Order[];
    onShowPreview: (url: string) => void;
    onRefresh: void
}

export default function OrderList({ orders, onShowPreview,onRefresh }: OrderListProps) {
    return (
        <ScrollView contentContainerStyle={styles.scrollContent}>
            {orders.map((order) => (
                <OrderCard
                    key={order._id}
                    order={order}
                    onShowPreview={onShowPreview}
                    onRefresh= {onRefresh}
                />
            ))}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scrollContent: {
        padding: 16
    }
});