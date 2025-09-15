import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Platform } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import Animated, {
    useAnimatedStyle,
    withTiming,
    useSharedValue,
    withSpring,
    interpolate
} from 'react-native-reanimated';
import { useNavigation, Link } from '@react-navigation/native';
import { clearStorage } from '~/utils/Service/SecureStore';

const { height, width } = Dimensions.get('window');
const MENU_WIDTH = Math.min(width * 0.85, 320);

interface SideHeaderProps {
    Open: boolean;
    isClosed: () => void;
}

const menuItems = [
    {
        section: 'Main',
        items: [
            { title: 'Home', icon: 'home-outline', href: 'home' },
            { title: 'Orders', icon: 'cart-outline', href: 'all_completed' },
            { title: 'Members', icon: 'people-outline', href: 'all_member' },
        ]
    },
    {
        section: 'Management',
        items: [
            { title: 'Add Member', icon: 'person-add-outline', href: 'add_member' },
            { title: 'Time Slots', icon: 'time-outline', href: 'Edit_Time_Slots' },
            { title: 'Profile', icon: 'person-outline', href: 'Profile' },
        ]
    },
    {
        section: 'Support',
        items: [
            { title: 'Raise Ticket', icon: 'help-buoy-outline', href: 'Raise-Ticket' },
            // { title: 'About Us', icon: 'information-circle-outline', href: 'About' },
            { title: 'Legal', icon: 'document-text-outline', href: 'Legal' },
        ]
    }
];

export default function SideHeader({ Open, isClosed }: SideHeaderProps) {
    const router = useNavigation();
    const translateX = useSharedValue(-MENU_WIDTH);
    const opacity = useSharedValue(0);
    useEffect(() => {
        translateX.value = withSpring(Open ? 0 : -MENU_WIDTH, {
            damping: 20,
            stiffness: 90,
        });
        opacity.value = withTiming(Open ? 1 : 0, { duration: 200 });
    }, [Open]);

    const handleLogout = async () => {
        await clearStorage("token")
        await clearStorage("user")
        router.reset({
            index: 0,
            routes: [{ name: 'login' }]
        })
    }
    const menuStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }],
    }));

    const overlayStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        pointerEvents: opacity.value === 0 ? 'none' : 'auto',
    }));

    const handleNavigation = (href: string) => {
        isClosed();
        router.navigate(href)
    };

    return (
        <>
            <Animated.View style={[styles.overlay, overlayStyle]}>
                <TouchableOpacity style={styles.overlayTouch} onPress={isClosed} />
            </Animated.View>

            <Animated.View style={[styles.container, menuStyle]}>
                <View style={styles.header}>
                    <View style={styles.logoContainer}>
                        <Ionicons name="rocket" size={32} color="#4F46E5" />
                        <Text style={styles.logoText}>Blueace india</Text>
                    </View>
                    {Platform.OS === 'web' && (
                        <TouchableOpacity onPress={isClosed} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color="#64748B" />
                        </TouchableOpacity>
                    )}
                </View>

                <View style={styles.content}>
                    {menuItems.map((section, sectionIndex) => (
                        <View key={section.section} style={styles.section}>
                            <Text style={styles.sectionTitle}>{section.section}</Text>
                            {section.items.map((item, itemIndex) => (
                                <TouchableOpacity
                                    key={item.title}
                                    style={styles.menuItem}
                                    onPress={() => handleNavigation(item.href)}
                                >
                                    <View style={styles.menuItemContent}>
                                        <Ionicons name={item.icon as any} size={20} color="#64748B" />
                                        <Text style={styles.menuItemText}>{item.title}</Text>
                                    </View>
                                    {item.badge && (
                                        <View style={styles.badge}>
                                            <Text style={styles.badgeText}>{item.badge}</Text>
                                        </View>
                                    )}
                                </TouchableOpacity>
                            ))}
                            {sectionIndex < menuItems.length - 1 && <View style={styles.divider} />}
                        </View>
                    ))}
                </View>

                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={() => handleLogout()}
                >
                    <Ionicons name="log-out-outline" size={20} color="#EF4444" />
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
            </Animated.View>
        </>
    );
}

const styles = StyleSheet.create({
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        zIndex: 998,
    },
    overlayTouch: {
        width: '100%',
        height: '100%',
    },
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: MENU_WIDTH,
        height: '100%',
        backgroundColor: '#FFFFFF',
        zIndex: 999,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    logoText: {
        fontSize: 20,
        fontWeight: '600',
        color: '#1E293B',
    },
    closeButton: {
        padding: 8,
    },
    content: {
        flex: 1,
        paddingTop: 16,
    },
    section: {
        paddingBottom: 16,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: '#64748B',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        paddingHorizontal: 20,
        marginBottom: 8,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 20,
    },
    menuItemContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    menuItemText: {
        fontSize: 16,
        color: '#1E293B',
        fontWeight: '500',
    },
    badge: {
        backgroundColor: '#4F46E5',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
    },
    badgeText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '600',
    },
    divider: {
        height: 1,
        backgroundColor: '#E2E8F0',
        marginVertical: 16,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
    },
    logoutText: {
        color: '#EF4444',
        fontSize: 16,
        fontWeight: '500',
    },
});