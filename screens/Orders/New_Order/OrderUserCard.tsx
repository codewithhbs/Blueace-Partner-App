import { View, Text, StyleSheet, Animated, TouchableOpacity, Linking } from 'react-native';
import React, { useEffect } from 'react';
import { User, Phone } from 'lucide-react-native';
import { colors } from '~/colors/Colors';

interface OrderUserCardProps {
    fullName: string;
    phoneNumber: string;
    createdAt: string;
    index: number;
}

const OrderUserCard = ({ fullName, phoneNumber, createdAt, index }: OrderUserCardProps) => {
    const slideAnim = React.useRef(new Animated.Value(-100)).current;
    const opacityAnim = React.useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 500,
                delay: index * 100,
                useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
                toValue: 1,
                duration: 500,
                delay: index * 100,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    transform: [{ translateX: slideAnim }],
                    opacity: opacityAnim,
                },
            ]}
        >
            <View style={styles.userInfo}>
                <User size={20} color={colors.primary} />
                <Text style={styles.name}>{fullName}</Text>
            </View>
            <View style={styles.contactInfo}>
                <View style={styles.infoRow}>
                    <Phone size={16} color={colors.text} />
                    <TouchableOpacity onPress={() => Linking.openURL(`tel:${phoneNumber}`)} style={styles.infoText}>
                        <Text>
                            {phoneNumber}

                        </Text>
                    </TouchableOpacity>
                </View>
                <Text style={styles.dateText}>
                    Order placed on {new Date(createdAt).toDateString()}
                </Text>
            </View>
        </Animated.View>
    );
};

export default OrderUserCard
const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.white,
        borderRadius: 4,
        padding: 16,
        marginBottom: 16,
        // shadowColor: colors.shadow,
        // shadowOffset: { width: 0, height: 2 },
        // shadowOpacity: 0.1,
        // shadowRadius: 4,
        // elevation: 3,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    name: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.text,
        marginLeft: 8,
    },
    contactInfo: {
        backgroundColor: colors.background,
        padding: 12,
        borderRadius: 8,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    infoText: {
        marginLeft: 8,
        color: colors.text,
        fontSize: 14,
    },
    dateText: {
        color: colors.placeholder,
        fontSize: 12,
        fontStyle: 'italic',
    },
});