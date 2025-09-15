import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text, Dimensions } from 'react-native';
import { Cloud, Ban, Eye, MonitorPlay, ReceiptText } from 'lucide-react-native';
import { colors } from '~/colors/Colors';
import { ScrollView } from 'react-native';
import axios from 'axios'

interface ActionButtonsProps {
    order: any;
    navigation: any;
    onShowPreview: (url: string) => void;
    onRefresh?: () => void | Promise<void>;
}

export default function ActionButtons({ order, navigation, onShowPreview, onRefresh }: ActionButtonsProps) {
    const hasEstimatedBill = order.hasOwnProperty('EstimatedBill');
    const hasBeforeVideo = order.hasOwnProperty('beforeWorkVideo');
    const hasAfterVideo = order.hasOwnProperty('afterWorkVideo');

    const handleUpdateIsInvetorAc = async (orderId: string, currentStatus: boolean) => {
        try {
            // console.log("currentStatus",currentStatus)
            const response = await axios.put(`https://api.blueaceindia.com/api/v1/update-is-InvetorAc/${orderId}`, {
                isInvetorAc: !currentStatus
            });
            if (response.status === 200) {
                alert("Is Invetor AC status updated successfully")
                if (onRefresh) {
                    onRefresh();
                }
            }
        } catch (error) {
            console.log("Internal Server Error", error);
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.buttonRow}
            >
                <TouchableOpacity
                    style={[styles.button, styles.inverterButton]}
                    onPress={() => handleUpdateIsInvetorAc(order._id, order?.isInvetorAc)}
                >
                    <MonitorPlay size={20} color={colors.white} />
                    <Text style={styles.buttonText}>
                        {order?.isInvetorAc ? 'Inverter' : 'Non-Inverter'}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, styles.estimateButton, order?.userId?.isAMCUser && styles.disabled]}
                    onPress={() => navigation.navigate('make-estimated', {
                        orderId: order._id,
                        vendorId: order.vendorAlloted,
                    })}
                    disabled={order?.userId?.isAMCUser}
                >
                    <ReceiptText size={20} color={colors.white} />
                    <Text style={styles.buttonText}>Make Estimate</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.button,
                        styles.viewButtonBill,
                        !hasEstimatedBill && styles.disabled
                    ]}
                    disabled={!hasEstimatedBill}
                    onPress={() => navigation.navigate('see-estimated', {
                        orderId: order._id
                    })}
                >
                    <Eye size={20} color={colors.white} />
                    <Text style={styles.buttonText}>View Bill</Text>
                </TouchableOpacity>
                {/* {order?.isInvetorAc ? ( */}
                <TouchableOpacity
                    style={[styles.button, styles.errorButton, order?.isInvetorAc && styles.disabled]}
                    onPress={() => navigation.navigate('error-codes', {
                        id: order._id
                    })}
                    disabled={order?.isInvetorAc}
                >
                    <Ban size={20} color={colors.white} />
                    <Text style={styles.buttonText}>Enter Error Code </Text>
                </TouchableOpacity>
                {/* ) : (
                    ""
                )} */}

                {/* {order?.isInvetorAc ? ( */}
                <TouchableOpacity
                    style={[styles.button, styles.cloudButton, order?.isInvetorAc && styles.disabled]}
                    onPress={() => navigation.navigate('watch_Codes', {
                        id: order._id
                    })}
                    disabled={order?.isInvetorAc}
                >
                    <Eye size={20} color={colors.white} />
                    <Text style={styles.buttonText}>View Error Codes</Text>
                </TouchableOpacity>
                {/* ) : (
               ""
             )} */}



            </ScrollView>

            {
                (hasBeforeVideo || hasAfterVideo) && (
                    <View style={styles.videoButtonsContainer}>
                        <Text style={styles.videoSectionTitle}>Work Videos</Text>
                        <View style={styles.videoButtonsRow}>
                            {hasBeforeVideo && (
                                <TouchableOpacity
                                    style={[styles.videoButton, styles.beforeButton]}
                                    onPress={() => onShowPreview(order.beforeWorkVideo?.url)}
                                >
                                    <MonitorPlay size={18} color={colors.white} />
                                    <Text style={styles.videoButtonText}>Before</Text>
                                </TouchableOpacity>
                            )}

                            {hasAfterVideo && (
                                <TouchableOpacity
                                    style={[styles.videoButton, styles.afterButton]}
                                    onPress={() => onShowPreview(order.afterWorkVideo?.url)}
                                >
                                    <MonitorPlay size={18} color={colors.white} />
                                    <Text style={styles.videoButtonText}>After</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                )
            }
        </View >
    );
}

const { width } = Dimensions.get('window');
const buttonWidth = 100;

const styles = StyleSheet.create({
    container: {
        marginVertical: 12,
        // paddingHorizontal: 12,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    button: {
        width: buttonWidth,
        height: 70,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        marginHorizontal: 4,
    },
    buttonText: {
        textAlign: 'center',
        color: colors.white,
        fontSize: 10,
        fontWeight: '600',
        marginTop: 6,
    },
    estimateButton: {
        backgroundColor: colors.success,
    },
    errorButton: {
        backgroundColor: colors.error,
    },
    viewButtonBill: {
        backgroundColor: colors.placeholder,
    },
    cloudButton: {
        backgroundColor: colors.secondary,
    },
    viewButton: {
        backgroundColor: '#6366f1',
    },
    disabled: {
        opacity: 0.5,
    },
    videoButtonsContainer: {
        marginTop: 16,
    },
    videoSectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#4b5563',
        marginBottom: 8,
        paddingHorizontal: 4,
    },
    videoButtonsRow: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
    },
    videoButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 10,
        marginRight: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    videoButtonText: {
        color: colors.white,
        fontSize: 13,
        fontWeight: '600',
        marginLeft: 8,
    },
    beforeButton: {
        backgroundColor: '#8b5cf6',
    },
    afterButton: {
        backgroundColor: '#6366f1',
    },
    inverterButton: {
        backgroundColor: '#0ea5e9', // A nice blue shade
    },
});
