import { View, Text } from 'react-native';
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FetchNewOrder } from '~/utils/api/Api';
import PartnerHead from '~/components/PartnerHead/PartnerHead';

export default function Home() {
    const [order, setOrder] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        const fnc = async () => {
            console.log("i am hit")
            setLoading(true);
            try {
                const order = await FetchNewOrder();
                console.log("order",order)
                if (order && order.length > 0) {
                    setOrder(order);
                } else {
                    setOrder([]);
                    // setError('No Order Found');
                }
                setLoading(false);
            } catch (err) {
                setError('Failed to fetch orders');
            } finally {
                setLoading(false); // Ensure loading is stopped in both success & error cases
            }
        };
        fnc();
    }, []);

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text>Loading...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text>{error}</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <PartnerHead />

        </SafeAreaView>
    );
}
