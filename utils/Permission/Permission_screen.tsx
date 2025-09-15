import { SafeAreaView, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import usePermissions from './All_Permission';

const PermissionsScreen = () => {
    const permissions = usePermissions();


    const handlePermissions = () => {
        // alert('Media Library permissions cannot be tested in Expo Go. Please create a development build.');
        permissions.reCall();
    };

    return (
        <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff', padding: 16 }}>
            <View style={{ alignItems: 'center', textAlign: 'center' }}>
                <Ionicons name="shield-checkmark" size={64} color="#2563EB" />
                <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#2563EB', marginBottom: 16 }}>Hello Partner</Text>
                <Text style={{ fontSize: 18, marginBottom: 16, textAlign: 'center' }}>
                    Please Grant All Required Permissions For Better Experience
                </Text>
                <Text style={{ fontSize: 14, color: '#6B7280', textAlign: 'center', marginBottom: 16 }}>
                    Click On App Icon {'->'} Go To Settings {'->'} Check Permissions {'->'} Grant All Permissions
                </Text>
                <TouchableOpacity onPress={handlePermissions} style={{ padding: 16, borderRadius: 8, backgroundColor: '#2563EB' }}>
                    <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#ffffff' }}>Grant Permissions</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

export default PermissionsScreen;
