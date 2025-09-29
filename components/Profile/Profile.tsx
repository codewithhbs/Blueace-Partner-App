import React, { useEffect, useState } from "react";
import { StyleSheet, View, Text, Image, TouchableOpacity, ScrollView, RefreshControl } from "react-native";
import { User, LogOut, Edit, Lock } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Headers from "../Header/Header";
import { FetchUserDetails } from "~/utils/api/Api";
import { colors } from "~/colors/Colors";
import Password_Change from "./Password_Change/Password_Change";
import { useNavigation } from "@react-navigation/native";
// import { clearStroge } from "~/utils/Service/SecureStore";



export default function Profile({handleLogout}) {
    const [user, setUser] = useState({})
    const [refreshing, setRefreshing] = useState(false);
    const [modelShow, setModelShow] = useState(false)
    const navigation = useNavigation()
    useEffect(() => {
        const fetchDetails = async () => {
            try {

                const userDetails = await FetchUserDetails();
                console.log(userDetails)
                setUser(userDetails);
            } catch (error) {
                console.error('Error fetching status:', error);
            }
        }
        fetchDetails()
    }, [])

    // const handleLogout = async() => {
    //     await clearStroge()
    //     console.log("Logging out...");
    // };

    const handleChangePassword = () => {
        setModelShow(true)
    };
    const handleClose = () => {
        setModelShow(false)
    };
    const handleEditProfile = (id: any) => {
        navigation.navigate('Edit_Profile', { id: id })
    };


    const onRefresh = async () => {
        setRefreshing(true);
        try {
            const userDetails = await FetchUserDetails();
            setUser(userDetails); // Update the state here
        } catch (error) {
            console.error("Error refreshing details:", error);
        } finally {
            setRefreshing(false);
        }
    };


    return (
        <>
            <SafeAreaView style={{ flex: 1 }}>
                <Headers />
                <ScrollView refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                } style={styles.background}>
                    <View style={styles.container}>
                        {/* Profile Header */}
                        <View style={styles.header}>
                            <Image
                                source={{
                                    uri: `https://ui-avatars.com/api/?name=${user.ownerName}&background=6366F1&color=fff`
                                }}
                                style={styles.profileImage}
                            />
                            <Text style={styles.name}>{user?.ownerName}</Text>
                            <Text style={styles.company}>{user.companyName}</Text>
                            <Text style={styles.rating}>Rating: {user.averageRating}/5</Text>
                        </View>

                        {/* Action Buttons */}
                        <View style={styles.actionButtons}>
                            <TouchableOpacity style={styles.actionButton} onPress={() => handleEditProfile(user?._id)}>
                                <Edit size={20} color={colors.white} />
                                <Text style={styles.buttonText}>Edit Profile</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.actionButton} onPress={handleChangePassword}>
                                <Lock size={20} color={colors.white} />
                                <Text style={styles.buttonText}>Change Password</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Profile Information */}
                        <View style={styles.infoSection}>
                            <Text style={styles.sectionTitle}>Contact Information</Text>
                            <View style={styles.infoItem}>
                                <Text style={styles.infoLabel}>Email:</Text>
                                <Text style={styles.infoValue}>{user.Email}</Text>
                            </View>
                            <View style={styles.infoItem}>
                                <Text style={styles.infoLabel}>Phone:</Text>
                                <Text style={styles.infoValue}>{user.ContactNumber}</Text>
                            </View>
                            <View style={styles.infoItem}>
                                <Text style={styles.infoLabel}>Address:</Text>
                                <Text style={styles.infoValue}>{user.address}</Text>
                            </View>
                        </View>
                        <View style={styles.infoSection}>
                            <Text style={styles.sectionTitle}>Documents Details</Text>
                            <View style={styles.infoItem}>
                                <Text style={styles.infoLabel}>Pan No:</Text>
                                <Text style={styles.infoValue}>{user?.panNo || "No Pan"}</Text>
                            </View>
                            <View style={styles.infoItem}>
                                <Text style={styles.infoLabel}>Gst:</Text>
                                <Text style={styles.infoValue}>{user?.gstNo || 'No Gst'}</Text>
                            </View>
                            <View style={styles.infoItem}>
                                <Text style={styles.infoLabel}>Aadhar:</Text>
                                <Text style={styles.infoValue}>{user?.adharNo || 'No Aadhar'}</Text>
                            </View>
                        </View>s
                        {/* Membership Information */}
                        <View style={styles.infoSection}>
                            <Text style={styles.sectionTitle}>Membership Details</Text>
                            <View style={styles.infoItem}>
                                <Text style={styles.infoLabel}>Plan:</Text>
                                <Text style={styles.infoValue}>{user?.memberShipPlan?.name || "No Name"}</Text>
                            </View>
                            <View style={styles.infoItem}>
                                <Text style={styles.infoLabel}>Price:</Text>
                                <Text style={styles.infoValue}>₹{user?.memberShipPlan?.price || 'No Price'}</Text>
                            </View>
                        </View>

                        {/* Logout Button */}
                        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                            <LogOut size={20} color={colors.error} />
                            <Text style={styles.logoutText}>Logout</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
                {modelShow && <Password_Change OnClose={handleClose} userId={user?._id} isShow={modelShow} />}
            </SafeAreaView>

        </>
    );
}

const styles = StyleSheet.create({
    background: {
        backgroundColor: colors.background,
        flex: 1
    },
    container: {
        padding: 16,
    },
    header: {
        alignItems: "center",
        padding: 20,
        backgroundColor: colors.white,
        borderRadius: 12,
        marginBottom: 16,
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 12,
    },
    name: {
        fontSize: 24,
        fontWeight: "bold",
        color: colors.text,
        marginBottom: 4,
    },
    company: {
        fontSize: colors.fontSize,
        color: colors.text,
        marginBottom: 8,
    },
    rating: {
        fontSize: colors.fontSize,
        color: colors.primary,
    },
    actionButtons: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 16,
    },
    actionButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.primary,
        padding: 12,
        borderRadius: 8,
        flex: 0.48,
    },
    buttonText: {
        color: colors.white,
        marginLeft: 8,
        fontSize: colors.fontSize,
    },
    infoSection: {
        backgroundColor: colors.white,
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: colors.bigFont,
        fontWeight: "bold",
        color: colors.text,
        marginBottom: 12,
    },
    infoItem: {
        flexDirection: "row",
        marginBottom: 8,
    },
    infoLabel: {
        fontSize: colors.fontSize,
        color: colors.placeholder,
        width: "30%",
    },
    infoValue: {
        fontSize: colors.fontSize,
        color: colors.text,
        flex: 1,
    },
    logoutButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.white,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.error,
    },
    logoutText: {
        color: colors.error,
        marginLeft: 8,
        fontSize: colors.fontSize,
        fontWeight: "bold",
    },
});
