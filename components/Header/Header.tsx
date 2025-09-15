import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import { BellIcon, MenuIcon, User } from 'lucide-react-native';
import { colors } from '~/colors/Colors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { FetchUserDetails, handleChangeReadyToWork } from '~/utils/api/Api';
import SideHeader from './SideHeader';
import { SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function Headers() {
    const [status, setStatus] = useState<boolean>(false);
    const [userData, setUserData] = useState<object>({});
    const [loading, setLoading] = useState<boolean>(true);
    const [toggling, setToggling] = useState<boolean>(false);
    const [openmenu, setOpenmenu] = useState<boolean>(false);
    const navigation = useNavigation()
    const fetchStatus = async () => {
        try {
            setLoading(true);
            const userDetails = await FetchUserDetails();
            setStatus(userDetails?.readyToWork || false);
            setUserData(userDetails);
        } catch (error) {
            console.error('Error fetching status:', error);
        } finally {
            setLoading(false);
        }
    };

    const statusToggle = async () => {
        try {
            setToggling(true);
            const data = await handleChangeReadyToWork(!status);
            setStatus(data.data?.readyToWork);
        } catch (error) {
            console.error('Error toggling status:', error);
        } finally {
            setToggling(false);
        }
    };

    const closeMenu = () => {
        setOpenmenu(false);
    };

    const fopen = () => {
        setOpenmenu(true);
        console.log(" i am click")
    }
    useEffect(() => {
        fetchStatus();
    }, []);

    return (
        <>
            <View style={styles.container}>
                {/* Header Section */}
                <View style={styles.header}>
                    <TouchableOpacity
                        activeOpacity={0.9}
                        disabled={toggling}
                        style={styles.toggleContainer}
                    >
                        <MenuIcon onPress={() => fopen()} style={styles.menuIcon} color={"#000"} />
                        <TouchableOpacity onPress={statusToggle}>
                            {toggling ? (
                                <ActivityIndicator size="small" color={colors.secondary} />
                            ) : status ? (
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                    <Icon style={styles.toggleIcon} color={colors.secondary} size={36} name="toggle-switch-outline" />
                                    <Text style={styles.toggleText}>Online</Text>
                                </View>
                            ) : (
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                    <Icon style={styles.toggleIcon} color="#d64444" size={36} name="toggle-switch-off-outline" />
                                    <Text style={styles.toggleText}>Offline</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    </TouchableOpacity>

                    {/* Notification Section */}
                    <TouchableOpacity onPress={()=>navigation.navigate('Profile')} style={styles.notificationContainer}>
                        <User style={styles.bellIcon} color={"#000"} size={24} />
                      
                    </TouchableOpacity>
                </View>
            </View>
            <SideHeader isClosed={closeMenu} Open={openmenu} />
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        elevation: 2,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    toggleContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    menuIcon: {
        marginRight: 18,
    },
    toggleIcon: {
        fontSize: 36,
    },
    notificationContainer: {
        position: "relative",
        flexDirection: "row",
        alignItems: "center",
    },
    bellIcon: {
        fontSize: 24,
        color: "#000",
    },
    notificationBadge: {
        position: "absolute",
        top: -5,
        right: -5,
        backgroundColor: colors.error,
        borderRadius: 12,
        width: 15,
        height: 15,
        justifyContent: "center",
        alignItems: "center",
    },
    notificationCount: {
        color: colors.white,
        fontSize: 8,
        fontWeight: "bold",
    },
    toggleText: {
        color: colors.text,
        fontWeight: "bold",
        fontSize: 14,
    },
});
