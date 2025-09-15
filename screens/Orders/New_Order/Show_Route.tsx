import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MapPin } from 'lucide-react-native';
import { colors } from '~/colors/Colors';
import MapComponent from './MapComponent';
import usePermissions from '~/utils/Permission/All_Permission';

interface Props {
    range: any;
}

export default function Show_Route({ range }: Props) {
    const location = usePermissions();

    if (!location) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading location...</Text>
            </View>
        );
    }

    // Extract range location coordinates
    const rangeLocation = range[0]?.location.coordinates;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <MapPin size={24} color={colors.primary} />
                <Text style={styles.title}>Location</Text>
            </View>

            <View style={styles.mapContainer}>
                <MapComponent
                    userLatitude={location.latitude}
                    userLongitude={location.longitude}
                    rangeLatitude={rangeLocation[1]}
                    rangeLongitude={rangeLocation[0]}
                    zoom={15}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        padding: 5,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.text,
        marginLeft: 8,
    },
    
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 16,
        color: colors.placeholder,
    },
});
