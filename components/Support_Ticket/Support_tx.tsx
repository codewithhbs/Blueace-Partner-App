import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import React from 'react';
import { HelpCircle } from 'lucide-react-native'; // Importing lucide-react-native icon
import { colors } from '~/colors/Colors';
import { useNavigation } from '@react-navigation/native';

export default function Support_tx() {
    const navigation = useNavigation()
    return (
        <View style={styles.container}>
            {/* Header section */}
            <View style={styles.headerContainer}>
                <HelpCircle size={32} color={colors.primary} />
                <Text style={styles.headerText}>Any Problem With an Order?</Text>
            </View>

            {/* Instructions Text */}
            <Text style={styles.subText}>
                Raise a ticket for fast problem solving
            </Text>

            {/* Raise a Ticket Button */}
            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Raise-Ticket')}>
                <Text style={styles.buttonText}>Raise a Ticket</Text>
            </TouchableOpacity>

            {/* Customer Support Section */}
            <View style={styles.supportContainer}>
                <Text style={styles.supportText}>Call our Customer Support</Text>
                <Text style={styles.contactNumber}>+91 9311539090</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    headerText: {
        fontSize: colors.bigFont,
        fontWeight: 'bold',
        marginLeft: 10,
        color: colors.text,
    },
    subText: {
        fontSize: 16,
        color: '#555',
        marginBottom: 20,
        textAlign: 'center',
    },
    button: {
        backgroundColor: colors.error,
        paddingVertical: 8,
        paddingHorizontal: 30,
        borderRadius: 8,
        marginBottom: 20,
    },
    buttonText: {
        fontSize: colors.fontSize,
        color: '#fff',
        fontWeight: 'bold',
    },
    supportContainer: {
        alignItems: 'center',
    },
    supportText: {
        fontSize: 16,
        color: '#333',
        marginBottom: 8,
    },
    contactNumber: {
        fontSize: 12,
        fontWeight: 'bold',
        color: colors.primary,
    },
});
