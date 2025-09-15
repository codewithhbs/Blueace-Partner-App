import { View, Text, Image, TouchableOpacity, Linking, StyleSheet } from 'react-native';
import React from 'react';
import image from './image.png';
import { ScanEye, Handshake } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

export default function Onboarding() {
    const navigation = useNavigation();

    return (
        <View style={styles.container}>

            <View style={styles.imageContainer}>
                <Image source={image} resizeMode="contain" style={styles.image} />
            </View>

            <Text style={styles.title}>
                Welcome To Blueace India Partner App !!
            </Text>

            <View style={styles.buttonContainer}>

                <TouchableOpacity onPress={() => navigation.navigate('login')} style={styles.loginButton}>
                    <ScanEye color={'#3b82f6'} size={24} />
                    <Text style={styles.loginText}>Login With Credentials</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => Linking.openURL('https://blueaceindia.com/vendor-registration?loginvia=App')} style={styles.registerButton}>
                    <Handshake color={'#fff'} size={24} />
                    <Text style={styles.registerText}>Register As a Partner</Text>
                </TouchableOpacity>

            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#bfdbfe', // bg-blue-200
    },
    imageContainer: {
        width: '100%',
        height: '60%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#bfdbfe',
    },
    image: {
        width: 300,
        height: '100%',
    },
    title: {
        paddingHorizontal: 16,
        textAlign: 'center',
        color: '#1f2937', // text-gray-900
        fontWeight: '800', // font-extrabold
        fontSize: 24, // text-3xl
        paddingVertical: 24,
    },
    buttonContainer: {
        paddingHorizontal: 24,
        gap: 24,
    },
    loginButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        padding: 16,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        borderWidth: 1,
        borderColor: '#d1d5db', // border-gray-300
        marginBottom: 20,
    },
    loginText: {
        marginLeft: 16,
        color: '#374151', // text-gray-700
        fontSize: 18,
        fontWeight: '500',
    },
    registerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#3b82f6', // bg-blue-500
        padding: 16,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    registerText: {
        marginLeft: 8,
        color: '#ffffff',
        fontSize: 18,
        fontWeight: '600',
    },
});
