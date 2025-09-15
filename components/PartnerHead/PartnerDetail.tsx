import { View, Text, StyleSheet, Image, ScrollView, RefreshControl } from 'react-native';
import React, { useState, useMemo } from 'react';
import PartnerOrders from './PartnerOrders';
import Partner_Slots from '../Partner_Slots/Partner_Slots';
import Support_tx from '../Support_Ticket/Support_tx';
import MainHeading from '../Heading/Main_Heading';

export default function PartnerDetail({ user }: { user: any }) {
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = () => {
        setRefreshing(true);
        setTimeout(() => setRefreshing(false), 2000); 
    };

  
    const partnerOrdersComponent = useMemo(() => <PartnerOrders reload={refreshing} />, [refreshing]);
    const partnerSlotsComponent = useMemo(() => <Partner_Slots reload={refreshing} />, [refreshing]);
    const supportTxComponent = useMemo(() => <Support_tx reload={refreshing} />, [refreshing]);

    return (
        <ScrollView
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            style={styles.container}
        >
            <View style={styles.header}>
                <View style={styles.profileSection}>
                    <Image
                        source={{
                            uri: `https://ui-avatars.com/api/?name=${user.ownerName}&background=6366F1&color=fff`
                        }}
                        style={styles.profileImage}
                    />
                    <View style={styles.nameSection}>
                        <Text style={styles.ownerName}>{user.ownerName}</Text>
                        <Text style={styles.companyName}>{user.companyName}</Text>
                        <Text style={styles.plan}>Plan: {user.memberShipPlan?.name}</Text>
                    </View>
                </View>
            </View>

            {/* Render memoized components */}
            {partnerOrdersComponent}
            <MainHeading text='Working Hours' size='small' />
            {partnerSlotsComponent}
            {supportTxComponent}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    header: {
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    profileSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    profileImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
        marginRight: 16,
    },
    nameSection: {
        flex: 1,
    },
    ownerName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1E293B',
        marginBottom: 4,
    },
    companyName: {
        fontSize: 16,
        color: '#64748B',
    },
    plan: {
        fontSize: 14,
        color: '#64748B',
    },
    statusBadge: {
        backgroundColor: '#F0FDF4',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    statusText: {
        color: '#166534',
        fontWeight: '600',
    },
});
