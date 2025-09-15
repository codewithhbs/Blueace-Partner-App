import React, { useEffect, useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, Image, ScrollView, StyleSheet,
    ActivityIndicator, Alert
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { PlusCircle, Trash2, UploadCloud } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Headers from '~/components/Header/Header';
import { colors } from '~/colors/Colors';
import MainHeading from '~/components/Heading/Main_Heading';
import { FetchUserDetails } from '~/utils/api/Api';



const AddVendorMember = () => {
    const [user, setUser] = useState({})
    const [members, setMembers] = useState([
        { name: '', memberAdharImage: null }
    ]);
    const [loading, setLoading] = useState(false);
    const fetchStatus = async () => {
        try {
            setLoading(true);
            const userDetails = await FetchUserDetails();

            setUser(userDetails);
        } catch (error) {
            console.error('Error fetching status:', error);
        } finally {
            setLoading(false);
        }
    };
    const handleInputChange = (index, value) => {
        const updatedMembers = [...members];
        updatedMembers[index].name = value;
        setMembers(updatedMembers);
    };

    useEffect(() => {
        fetchStatus()
    }, [])
    // Handle image selection
    const handleImagePick = async (index) => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'Allow access to the gallery to upload images.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            const updatedMembers = [...members];
            updatedMembers[index].memberAdharImage = result.assets[0];
            setMembers(updatedMembers);
        }
    };

    // Add new member field
    const addMemberField = () => {
        setMembers([...members, { name: '', memberAdharImage: null }]);
    };

    // Remove member
    const removeMemberField = (index) => {
        const updatedMembers = members.filter((_, i) => i !== index);
        setMembers(updatedMembers);
    };

    // Handle form submission
    const handleSubmit = async () => {
        if (members.length === 0) {
            Alert.alert('Error', 'Please add at least one member.');
            return;
        }

        setLoading(true);
        const formData = new FormData();

        members.forEach((member, index) => {
            formData.append(`members[${index}][name]`, member.name);
            if (member.memberAdharImage) {
                formData.append(`memberAdharImage`, {
                    uri: member.memberAdharImage.uri,
                    name: `aadhar_${index}.jpg`,
                    type: 'image/jpeg',
                });
            }
        });

        try {
            const response = await axios.post(
                `https://api.blueaceindia.com/api/v1/register-vendor-member/${user?._id}`,
                formData,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            );
            console.log(response.data)
            Alert.alert('Success', 'Members added successfully!');
            setMembers([
                { name: '', memberAdharImage: null },
            ]);
        } catch (error) {
            console.log(error?.response)
            Alert.alert('Error', 'Failed to add members. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            <Headers />
            <ScrollView style={styles.container}>
                <MainHeading text='Add Members' size='small' />
                {members.map((member, index) => (
                    <View key={index} style={styles.memberCard}>
                        <Text style={styles.memberHeading}>Member {index + 1}</Text>
                        <TextInput
                            placeholder="Name"
                            placeholderTextColor={colors.placeholder}
                            style={styles.input}
                            value={member.name}
                            onChangeText={(value) => handleInputChange(index, value)}
                        />
                        <TouchableOpacity style={styles.imagePicker} onPress={() => handleImagePick(index)}>
                            {member.memberAdharImage ? (
                                <Image source={{ uri: member.memberAdharImage.uri }} style={styles.image} />
                            ) : (
                                <View style={styles.imagePlaceholder}>
                                    <UploadCloud color={colors.placeholder} size={32} />
                                    <Text style={styles.imageText}>Upload Aadhar</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => removeMemberField(index)} style={styles.removeButton}>
                            <Trash2 color={colors.error} size={24} />
                        </TouchableOpacity>
                    </View>
                ))}
                <TouchableOpacity activeOpacity={0.9} style={styles.addButton} onPress={addMemberField}>
                    <PlusCircle color={colors.white} size={24} />
                    <Text style={styles.addText}>Add Another Member</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.submitButton, { opacity: loading ? 0.7 : 1 }]}
                    onPress={handleSubmit}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color={colors.white} />
                    ) : (
                        <Text style={styles.submitText}>Submit</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16 },
    heading: { fontSize: colors.bigFont, fontWeight: '700', color: colors.text, textAlign: 'center', marginBottom: 16 },
    memberCard: { backgroundColor: colors.white, padding: 16, marginBottom: 12, borderRadius: 8, shadowColor: colors.shadow, elevation: 3 },
    memberHeading: { fontSize: colors.fontSize, fontWeight: '600', marginBottom: 8, color: colors.text },
    input: {
        borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: 10, marginBottom: 12, color: colors.text, backgroundColor: colors.white
    },
    imagePicker: {
        borderWidth: 1, borderColor: colors.border, borderRadius: 8, justifyContent: 'center', alignItems: 'center', height: 150, backgroundColor: colors.background
    },
    imagePlaceholder: { alignItems: 'center' },
    imageText: { color: colors.placeholder, marginTop: 8 },
    image: { width: '100%', height: '100%', borderRadius: 8 },
    removeButton: { position: 'absolute', top: 10, right: 10 },
    addButton: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.secondary, padding: 12, borderRadius: 8, marginBottom: 16
    },
    addText: { marginLeft: 8, color: colors.white, fontSize: colors.fontSize, fontWeight: '600' },
    submitButton: { backgroundColor: colors.primary, padding: 16, borderRadius: 8, alignItems: 'center' },
    submitText: { color: colors.white, fontSize: colors.bigFont, fontWeight: '600' },
});

export default AddVendorMember;
