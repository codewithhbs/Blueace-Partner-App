import { View, StyleSheet, ActivityIndicator, Text, Button, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native';
import { Audio } from 'expo-av';
import { colors } from '~/colors/Colors';

import Headers from '~/components/Header/Header';
import { FetchNewOrder } from '~/utils/api/Api';

interface parmsProps {
    order: any[];
}

export default function New_Order() {
    const route = useRoute();
    const [order, setOrder] = useState([])
    const [loading, setLoading] = React.useState(true);
    const navigation = useNavigation()
    React.useEffect(() => {
        const fetchData = async () => {
            const data = await FetchNewOrder();
            const NewOrder = data.filter(
                (item: any) =>
                    item.OrderStatus === 'Vendor Assigned' &&
                    (!item.hasOwnProperty('AllowtedVendorMember') || item.AllowtedVendorMember == null)
            );

            setOrder(NewOrder);
        };

        fetchData()
        const timer = setTimeout(() => setLoading(false), 1000);
        return () => clearTimeout(timer);

    }, []);

    async function componentDidMount() {
        try {
            // Set the audio mode
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: false,
                interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
                interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DUCK_OTHERS,
                playThroughEarpieceAndroid: true,
                staysActiveInBackground: true,
                playsInSilentModeIOS: true,
                shouldDuckAndroid: true,
            });
            console.log('Audio mode successfully set.');
    
            const sound = new Audio.Sound();
            await sound.loadAsync(require('./preview.wav'), { shouldPlay: true });
            console.log('Audio loaded and playing.');
    
        
            this.sound = sound;
    
        } catch (error) {
            console.error('Error setting audio mode or loading sound:', error);
        }
    }

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    if (!order || order.length === 0) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>📦 No New Orders Yet!</Text>
                <Text style={styles.subText}>
                    Stay tuned! We’ll notify you as soon as a new order comes in. 🚀
                </Text>
                <TouchableOpacity onPress={()=>componentDidMount()}>
                    <Text>Play Sound</Text>
                </TouchableOpacity>
            </View>
        );
    }


    const handleViewOrder = (item: object) => {
        navigation.navigate('details_order', { order: item })

    };

    return (
        <SafeAreaView style={styles.container}>
            <Headers />
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {order.map((item: object, index: number) => (
                    <TouchableOpacity activeOpacity={0.9} onPress={() => navigation.navigate('details_order', { order: item })} key={index} style={styles.orderContainer}>
                        <Text style={styles.orderTitle}># Order {index + 1}</Text>
                        <Text style={styles.orderDetail}>Service: {item.serviceId?.name}</Text>
                        <Text style={styles.orderDetail}>Address: {item.address}</Text>
                        <Text style={styles.orderDetail}>Date and Time: {item.workingDay} {item.workingTime}</Text>

                        <Button
                            title="View Order"
                            color={colors.primary}
                            onPress={() => handleViewOrder(item)}
                        />
                    </TouchableOpacity>
                ))}
              
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollContent: {
        padding: 8,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FF6B6B', // Soft red for error text
        textAlign: 'center',
        marginBottom: 10,
    },
    subText: {
        fontSize: 16,
        color: '#555555', // Neutral gray for subtext
        textAlign: 'center',
    },
    orderContainer: {
        marginBottom: 16,
        padding: 16,
        backgroundColor: colors.white,
        borderRadius: 8,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    orderTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.text,
    },
    orderDetail: {
        fontSize: 16,
        color: colors.text,
        marginTop: 4,
        marginBottom: 4,
    },
});
