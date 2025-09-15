import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import { calculateTotals } from '~/utils/api/calculations';
import { colors } from '~/colors/Colors';
import ItemRow from './ItemRow';
import SummaryCard from './SummaryCard';
import { SafeAreaView } from 'react-native-safe-area-context';
import Headers from '~/components/Header/Header';



const EstimatedBudget = () => {
    const route = useRoute();
    const { orderId, vendorId } = route.params || {};

    const [formData, setFormData] = useState({
        orderId: orderId || '',
        vendor: vendorId || '',
        EstimatedTotalPrice: 0,
        overallDiscount: 0,
        Items: [{ name: '', quantity: 1, price: 0, Discount: 0 }],
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigation = useNavigation()
    const handleChange = (index: number, field: string, value: string) => {
        const newItems = [...formData.Items];
        newItems[index][field] = field === 'name' ? value : Number(value);
        const { total } = calculateTotals(newItems);

        setFormData(prev => ({
            ...prev,
            Items: newItems,
            EstimatedTotalPrice: total
        }));
    };

    const handleAddItems = () => {
        setFormData(prev => ({
            ...prev,
            Items: [...prev.Items, { name: '', quantity: 1, price: 0, Discount: 0 }],
        }));
    };

    const handleRemoveItems = (index: number) => {
        if (formData.Items.length === 1) {
            Alert.alert('Cannot Remove', 'At least one item is required');
            return;
        }
        const newItems = formData.Items.filter((_, i) => i !== index);
        const { total } = calculateTotals(newItems);

        setFormData(prev => ({
            ...prev,
            Items: newItems,
            EstimatedTotalPrice: total
        }));
    };

    const handleSubmit = async () => {
        if (!formData.orderId || !formData.vendor) {
            setError('Order ID and Vendor ID are required.');
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post(
                'https://api.blueaceindia.com/api/v1/make-Estimated-bills',
                formData,
                { headers: { 'Content-Type': 'application/json' } }
            );

            if (response.status === 201) {
                Alert.alert('Success', 'Estimated budget submitted successfully');
                navigation.navigate('ongoing_order')
            }
        } catch (err) {
            Alert.alert('Error', err.response?.data?.message || 'Failed to submit budget');
            setError(err.response?.data?.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const { subtotal, gst, total } = calculateTotals(formData.Items);

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <Headers />
            <ScrollView style={styles.container}>
                <View style={styles.header}>
                    <Icon name="calculator-variant" size={15} color={colors.primary} />
                    <Text style={styles.title}>Estimated Budget</Text>
                </View>



                {error && (
                    <View style={styles.errorContainer}>
                        <Icon name="alert-circle" size={20} color={colors.error} />
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                )}

                {formData.Items.map((item, index) => (
                    <View key={index} style={styles.itemCard}>
                        <View style={styles.itemHeader}>
                            <Text style={styles.itemTitle}>Item #{index + 1}</Text>
                            <TouchableOpacity
                                onPress={() => handleRemoveItems(index)}
                                style={styles.removeButton}
                            >
                                <Icon name="delete-outline" size={24} color={colors.error} />
                            </TouchableOpacity>
                        </View>
                        <ItemRow
                            index={index}
                            item={item}
                            onChange={handleChange}
                        />
                    </View>
                ))}

                <TouchableOpacity style={styles.addButton} onPress={handleAddItems}>
                    <Icon name="plus-circle" size={24} color={colors.white} />
                    <Text style={styles.addButtonText}>Add New Item</Text>
                </TouchableOpacity>

                <SummaryCard
                    subtotal={subtotal}
                    gst={gst}
                    total={total}
                />

                <TouchableOpacity
                    style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                    onPress={handleSubmit}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color={colors.white} />
                    ) : (
                        <>
                            <Icon name="check-circle" size={24} color={colors.white} />
                            <Text style={styles.submitButtonText}>Submit Budget</Text>
                        </>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {

        backgroundColor: colors.background,
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.primary,
        marginLeft: 12,
    },
    orderCard: {
        backgroundColor: colors.white,
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
        elevation: 2,
    },
    orderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    orderInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    orderLabel: {
        fontSize: 16,
        color: colors.text,
        marginLeft: 8,
        marginRight: 4,
    },
    orderValue: {
        fontSize: 16,
        color: colors.primary,
        fontWeight: 'bold',
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.errorLight,
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
    },
    errorText: {
        color: colors.error,
        marginLeft: 8,
        flex: 1,
    },
    itemCard: {
        backgroundColor: colors.white,
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
        elevation: 2,
    },
    itemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    itemTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.primary,
    },
    removeButton: {
        padding: 8,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.secondary,
        padding: 16,
        borderRadius: 12,
        marginBottom: 24,
    },
    addButtonText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    submitButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.primary,
        padding: 16,
        borderRadius: 12,
        marginBottom: 32,
    },
    submitButtonDisabled: {
        opacity: 0.7,
    },
    submitButtonText: {
        color: colors.white,
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 8,
    },
});

export default EstimatedBudget;