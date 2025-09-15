import { View, StyleSheet, ActivityIndicator, Text, Linking, Platform } from 'react-native';
import React from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native';
import * as Location from 'expo-location'; // Import expo-location for current location

import { colors } from '~/colors/Colors';
import OrderServiceCard from './OrderServiceCard';
import OrderUserCard from './OrderUserCard';
import OrderAddressCard from './OrderAddressCard';
import PartnerHead from '~/components/PartnerHead/PartnerHead';
import Headers from '~/components/Header/Header';
import Show_Route from './Show_Route';
import Button from '~/components/form/Button';
import VoicePlay from './VoicePlay';

export default function DetailsOrder() {
    const route = useRoute();
    const { order } = route.params || {};
    const [loading, setLoading] = React.useState(true);
    const [currentLocation, setCurrentLocation] = React.useState(null);
    const navigation = useNavigation();

    React.useEffect(() => {
        // Simulate loading state
        const timer = setTimeout(() => setLoading(false), 1000);
        // Get current location
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status === 'granted') {
                let location = await Location.getCurrentPositionAsync({});
                setCurrentLocation(location.coords);
            }
        })();
        return () => clearTimeout(timer);
    }, []);

    const openGoogleMaps = () => {
        if (order?.RangeWhereYouWantService?.[0]?.location?.coordinates) {
            const [longitude, latitude] = order.RangeWhereYouWantService[0].location.coordinates;
            const url = Platform.select({
                ios: `maps://?q=${latitude},${longitude}`,
                android: `geo:${latitude},${longitude}?q=${latitude},${longitude}`,
                default: `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`,
            });
            Linking.openURL(url).catch((err) => console.error('Error opening Google Maps:', err));
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    if (!order) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>No Order Found</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <Headers />
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {order && (
                    <View>
                        <OrderServiceCard
                            service={order.serviceId}
                            workingDay={order.workingDay}
                            workingTime={order.workingTime}
                        />
                        <OrderUserCard
                            fullName={order.fullName}
                            phoneNumber={order.phoneNumber}
                            createdAt={order.createdAt}
                        />
                        <OrderAddressCard
                            houseNo={order.houseNo}
                            address={order.address}
                            nearByLandMark={order.nearByLandMark}
                        />
                        <VoicePlay
                            voiceUrl={order?.voiceNote?.url}
                        />
                        {/* <Show_Route
                            range={order?.RangeWhereYouWantService}
                            currentLocation={currentLocation}
                        /> */}
                    </View>
                )}
            </ScrollView>
            <View style={styles.buttonContainer}>
                <Button
                    onPress={() => navigation.navigate('all_member', {
                        alreadyAlloted: order?.AllowtedVendorMember || 'false',
                        id: order?._id,
                    })}
                    variant="secondary"
                    style={styles.button}
                >
                    Assigned Member
                </Button>
                <Button
                    onPress={openGoogleMaps}
                    variant="primary"
                    style={styles.button}
                >
                    Open in Google Maps
                </Button>
            </View>
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
        backgroundColor: colors.background,
    },
    errorText: {
        fontSize: 16,
        color: colors.error,
        textAlign: 'center',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 8,
    },
    button: {
        flex: 1,
        marginHorizontal: 4,
    },
});