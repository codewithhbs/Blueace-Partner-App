import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Video } from 'expo-av';

import { colors } from '~/colors/Colors';
import { Order } from './types';

import ActionButtons from './ActionButtons';
import VideoUploader from './VideoUploader';

interface OrderCardProps {
    order: Order;
    onShowPreview: (url: string) => void;
    onRefresh: void
}

export default function OrderCard({ order, onShowPreview, onRefresh }: OrderCardProps) {
    const navigation = useNavigation();

    const openGoogleMaps = () => {
        const { RangeWhereYouWantService, address } = order;
        let mapUrl = '';
        
        // Try to use coordinates if available
        if (RangeWhereYouWantService?.[0]?.location?.coordinates) {
            const [longitude, latitude] = RangeWhereYouWantService[0].location.coordinates;
            mapUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
        } else {
            // Fallback to address if coordinates are not available
            const encodedAddress = encodeURIComponent(address || '');
            mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
        }

        Linking.openURL(mapUrl).catch(err => console.error('Error opening Google Maps:', err));
    };

    return (
        <View style={styles.container}>
    <Text style={styles.title}>
        # Order: {order._id.substring(0, 5)}...
    </Text>
    <Text style={styles.detail}>
        Service: {order.serviceId?.name || order.serviceType}
    </Text>
    <Text style={styles.detail}>
        Address: {order.address}
    </Text>
    <Text style={styles.detail}>
        Date and Time: {order.workingDay || order.workingDateUserWant} {order.workingTime}
    </Text>
    <Text style={styles.detail}>
        User Name: {order?.fullName}
    </Text>
    <Text style={styles.detail}>
        Contact Number: {order.phoneNumber || order.userId?.ContactNumber}
    </Text>
    <Text style={styles.detail}>
        User Type: {order.userId?.UserType} {order.userId?.isAMCUser ? "(AMC User)" : "(Non-AMC User)"}
    </Text>
    {order.message && (
        <Text style={styles.detail}>
            Message: {order.message}
        </Text>
    )}
    <Text style={styles.detail}>
        Inverter AC: {order.isInvetorAc ? "Yes" : "No"}
    </Text>

    <TouchableOpacity 
        style={styles.mapButton}
        onPress={openGoogleMaps}
    >
        <Text style={styles.mapButtonText}>Show on Google Maps</Text>
    </TouchableOpacity>

    <ActionButtons
        order={order}
        navigation={navigation}
        onShowPreview={onShowPreview}
        onRefresh={onRefresh}
    />
    <VideoUploader
        orderId={order._id}
        beforeWorkVideo={order?.beforeWorkVideo}
        afterWorkVideo={order?.afterWorkVideo}
        userDetail={order?.userId?.isAMCUser}
        estimatedBillStatus={order.EstimatedBill?.BillStatus}
    />
</View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 20,
        padding: 16,
        backgroundColor: colors.white,
        borderRadius: 12,
        elevation: 5,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.primary,
        marginBottom: 8
    },
    detail: {
        fontSize: 14,
        color: '#444444',
        marginVertical: 2
    },
    mapButton: {
        backgroundColor: colors.primary,
        padding: 10,
        borderRadius: 8,
        marginTop: 10,
        alignItems: 'center',
    },
    mapButtonText: {
        color: colors.white,
        fontSize: 14,
        fontWeight: '600',
    }
});