import axios from 'axios';
import React, { useState } from 'react';
import { Modal, StyleSheet, Text, Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '~/colors/Colors';
import Input from '~/components/form/Input';

export default function Password_Change({ userId, isShow, OnClose }) {
    const [oldPassword, setOldPassword] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handlePasswordChange = () => {
        if (!oldPassword || !password || !confirmPassword) {
            setErrorMessage('All fields are required.');
            setSuccessMessage('');
            return false;
        }
        if (password !== confirmPassword) {
            setErrorMessage('Passwords do not match.');
            setSuccessMessage('');
            return false;
        }
        if (password.length < 6) {
            setErrorMessage('Password must be at least 6 characters long.');
            setSuccessMessage('');
            return false;
        }
        setErrorMessage('');
        return true;
    };

    const handleSubmit = async () => {
        const isValid = handlePasswordChange();
        if (!isValid) return;

        try {
            const res = await axios.put(
                `https://api.blueaceindia.com/api/v1/update-vendor-old-password/${userId}`,
                {
                    Password: oldPassword, 
                    NewPassword: confirmPassword, 
                    
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );
            console.log(res.data);
            setSuccessMessage('Password changed successfully!');
            setTimeout(() => {
                setSuccessMessage('');
                OnClose();
            }, 2000);
        } catch (error) {
            const errorMsg = error?.response?.data?.msg || 'An error occurred. Please try again.';
            setErrorMessage(errorMsg);
            console.error('Error:', errorMsg);
        }
    };

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <Modal
                visible={isShow}
                onRequestClose={OnClose}
                animationType="slide"
                transparent={true}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalText}>Change Your Password</Text>

                        <View style={{ width: '100%' }}>
                            <Input
                                icon="lock"
                                value={oldPassword}
                                onChangeText={setOldPassword}
                                placeholder="Old Password"
                                keyboardType="default"
                                secureTextEntry={true}
                            />
                            <Input
                                icon="lock"
                                value={password}
                                onChangeText={setPassword}
                                placeholder="New Password"
                                keyboardType="default"
                                secureTextEntry={true}
                            />
                            <Input
                                icon="lock"
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                placeholder="Confirm Password"
                                keyboardType="default"
                                secureTextEntry={true}
                            />
                        </View>

                        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
                        {successMessage ? (
                            <Text style={styles.successText}>{successMessage}</Text>
                        ) : null}

                        <View style={{ flexDirection: 'row', width: '100%' }}>
                            <Pressable style={styles.button} onPress={handleSubmit}>
                                <Text style={styles.buttonText}>Submit</Text>
                            </Pressable>
                            <Pressable
                                style={[styles.button, styles.buttonClose]}
                                onPress={OnClose}
                            >
                                <Text style={styles.buttonText}>Cancel</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}


const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: colors.shadow,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        width: '90%',
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalText: {
        marginBottom: 15,
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: 18,
    },
    button: {
        backgroundColor: colors.primary,
        borderRadius: 10,
        padding: 10,
        marginHorizontal: 5,
        marginVertical: 10,
        width: '47%',
        alignItems: 'center',
    },
    buttonClose: {
        backgroundColor: colors.error,
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    errorText: {
        color: colors.error,
        fontSize: 14,
        marginTop: 5,
    },
    successText: {
        color: colors.success,
        fontSize: 14,
        marginTop: 5,
    },
});
