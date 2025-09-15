import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import { useRoute } from '@react-navigation/native';

export default function ErrorCode() {
    const route = useRoute();
    const { id } = route.params || {};
    const [allError, setAllError] = useState([]);
    const [selectedHeading, setSelectedHeading] = useState('');
    const [selectedErrors, setSelectedErrors] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const handleFetchError = async () => {
        try {
            const response = await axios.get('https://api.blueaceindia.com/api/v1/get-all-error-code');
            setAllError(response.data.data);
            setError('');
        } catch (err) {
            setError('Failed to fetch error codes. Please try again.');
            Alert.alert('Error', 'Failed to fetch error codes');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        handleFetchError();
    }, []);

    const uniqueHeadings = [...new Set(allError.map(error => error.Heading.title))];
    const filteredErrors = allError.filter(error => error.Heading.title === selectedHeading);

    const handleAddError = (errorId) => {
        const error = filteredErrors.find(err => err._id === errorId);
        if (error && !selectedErrors.find(e => e._id === error._id)) {
            setSelectedErrors([...selectedErrors, error]);
        }
    };

    const handleRemoveError = (errorId) => {
        setSelectedErrors(selectedErrors.filter(error => error._id !== errorId));
    };

    const handleSubmitError = async () => {
        setIsSubmitting(true);
        try {
            const errorCodes = selectedErrors.map(error => error._id);
            await axios.put(
                `https://api.blueaceindia.com/api/v1/update-error-code-order/${id}`,
                { errorCode: errorCodes }
            );
            Alert.alert('Success', 'Error codes updated successfully');
            setSelectedErrors([]);
            setSelectedHeading('');
        } catch (err) {
            Alert.alert('Error', 'Failed to update error codes');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2563eb" />
                <Text style={styles.loadingText}>Loading error codes...</Text>
            </View>
        );
    }

    return (
        <LinearGradient
            colors={['#fff', '#fff']}
            style={styles.gradient}
        >
            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.card}>
                    <View style={styles.header}>
                        <MaterialCommunityIcons name="alert-circle-outline" size={28} color="#2563eb" />
                        <Text style={styles.headerText}>Error Code</Text>
                    </View>

                    {error ? (
                        <View style={styles.errorContainer}>
                            <MaterialCommunityIcons name="alert" size={24} color="#ef4444" />
                            <Text style={styles.errorText}>{error}</Text>
                        </View>
                    ) : null}

                    <View style={styles.pickerContainer}>
                        <Text style={styles.label}>Select Device Type</Text>
                        <View style={styles.pickerWrapper}>
                            <Picker
                                selectedValue={selectedHeading}
                                onValueChange={(value) => setSelectedHeading(value)}
                                style={styles.picker}
                            >
                                <Picker.Item label="Choose device type..." value="" />
                                {uniqueHeadings.map((heading) => (
                                    <Picker.Item key={heading} label={heading} value={heading} />
                                ))}
                            </Picker>
                        </View>
                    </View>

                    <View style={styles.pickerContainer}>
                        <Text style={styles.label}>Select Error Code</Text>
                        <View style={styles.pickerWrapper}>
                            <Picker
                                selectedValue=""
                                onValueChange={(value) => handleAddError(value)}
                                enabled={!!selectedHeading}
                                style={styles.picker}
                            >
                                <Picker.Item label="Choose error code..." value="" />
                                {filteredErrors.map((error) => (
                                    <Picker.Item
                                        key={error._id}
                                        label={`${error.code} - ${error.description}`}
                                        value={error._id}
                                    />
                                ))}
                            </Picker>
                        </View>
                    </View>

                    {selectedErrors.length > 0 && (
                        <View style={styles.selectedErrorsContainer}>
                            <Text style={styles.selectedErrorsTitle}>Selected Error Codes</Text>
                            {selectedErrors.map((error) => (
                                <View key={error._id} style={styles.errorItem}>
                                    <Text style={styles.errorItemText}>
                                        {error.code} - {error.description}
                                    </Text>
                                    <TouchableOpacity
                                        onPress={() => handleRemoveError(error._id)}
                                        style={styles.removeButton}
                                    >
                                        <MaterialCommunityIcons name="close-circle" size={24} color="#ef4444" />
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                    )}

                    <TouchableOpacity
                        style={[
                            styles.submitButton,
                            (isSubmitting || selectedErrors.length === 0) && styles.submitButtonDisabled
                        ]}
                        onPress={handleSubmitError}
                        disabled={isSubmitting || selectedErrors.length === 0}
                    >
                        <LinearGradient
                            colors={isSubmitting ? ['#94a3b8', '#cbd5e1'] : ['#1d4ed8', '#2563eb']}
                            style={styles.submitButtonGradient}
                        >
                            {isSubmitting ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <>
                                    <MaterialCommunityIcons name="check-circle" size={24} color="#fff" />
                                    <Text style={styles.submitButtonText}>Submit Error Codes</Text>
                                </>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    gradient: {
        flex: 1,
    },
    container: {
        flexGrow: 1,
        padding: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#64748b',
    },
    card: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 20,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    headerText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1e3a8a',
        marginLeft: 12,
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fef2f2',
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
    },
    errorText: {
        color: '#ef4444',
        marginLeft: 8,
        flex: 1,
    },
    pickerContainer: {
        marginBottom: 16,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 8,
    },
    pickerWrapper: {
        backgroundColor: '#f8fafc',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        overflow: 'hidden',
    },
    picker: {
        height: 50,
    },
    selectedErrorsContainer: {
        marginTop: 24,
    },
    selectedErrorsTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 12,
    },
    errorItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        padding: 16,
        borderRadius: 12,
        marginBottom: 8,
    },
    errorItemText: {
        flex: 1,
        fontSize: 16,
        color: '#1e293b',
    },
    removeButton: {
        padding: 4,
    },
    submitButton: {
        marginTop: 24,
        overflow: 'hidden',
        borderRadius: 12,
    },
    submitButtonDisabled: {
        opacity: 0.7,
    },
    submitButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 8,
    },
});