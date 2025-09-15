import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Video } from 'expo-av';
import axios from 'axios';
import { CircleX, Upload } from 'lucide-react-native';
import { colors } from '~/colors/Colors';
import { Loader } from '~/components/Loader/Loader';
import VideoPreview from './VideoPreview';
import { useNavigation } from '@react-navigation/native';

interface VideoUploaderProps {
    orderId: string;
    beforeWorkVideo: any;
    afterWorkVideo: any;
    setBeforeWorkVideo: (video: any) => void;
    setAfterWorkVideo: (video: any) => void;
    estimatedBillStatus: string;
    userDetail: boolean 
}

export default function VideoUploader({
    orderId,
    beforeWorkVideo,
    afterWorkVideo,
    setBeforeWorkVideo,
    setAfterWorkVideo,
    estimatedBillStatus,
    userDetail
}: VideoUploaderProps) {

    const navigation = useNavigation()
    const [loading, setLoading] = useState(false)
    const [urls, setUrls] = useState({
        beforeWorkVideo: '',
        afterWorkVideo: '',
        state: false
    })
    // console.log("urls from urls",beforeWorkVideo)
    const handleSelectVideo = async (type: 'before' | 'after') => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Videos,
            allowsEditing: true,
            quality: 1,
        });

        if (!result.canceled && result.assets) {
            if (type === 'before') {
                setBeforeWorkVideo(result.assets[0]);
            } else {
                setAfterWorkVideo(result.assets[0]);
            }
        }
    };

    const handleUpload = async (type: 'before' | 'after') => {
        const video = type === 'before' ? beforeWorkVideo : afterWorkVideo;
        const formData = new FormData();
        setLoading(true)
        formData.append(`${type}WorkVideo`, {
            uri: video.uri,
            type: video.mimeType,
            name: `${type}_work_video_${orderId.substring(0, 5)}.mp4`,
        });

        try {
            const endpoint = `https://api.blueaceindia.com/api/v1/update-${type}-work-video/${orderId}`;
            const data = await axios.put(endpoint, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            console.log("data", data)

            setLoading(false)

            if (type === 'after') {
                setUrls({
                    afterWorkVideo: data.data.data?.afterWorkVideo?.url,
                    state: true
                });
            } else {
                setUrls({
                    beforeWorkVideo: data.data.data?.beforeWorkVideo?.url,
                    state: true
                });
            }
        } catch (error) {
            console.error('Upload failed:', error.response);
            setLoading(false)

        }
    };

    console.log("userDetail",userDetail)

    if (loading) {
        return <Loader message='Please Wait Video is Uploading' />
    }

    return (
        <>
            <View style={styles.container}>
                {estimatedBillStatus === 'Accepted' || beforeWorkVideo?.url ? (
                    <TouchableOpacity
                        style={styles.uploadButton}
                        onPress={() => navigation.navigate('record-video', {
                            type: 'after',
                            orderId: orderId
                        })}
                    >
                        <Text style={styles.buttonText}>
                            Upload After Work Video
                        </Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        style={styles.uploadButton}
                        onPress={() => navigation.navigate('record-video', {
                            type: 'before',
                            orderId: orderId
                        })}

                    >
                        <Text style={styles.buttonText}>
                            Uploads Before Work Video
                        </Text>
                    </TouchableOpacity>
                )}

               

             

            </View>
            {urls.state && (
                <VideoPreview
                    onClose={() => setUrls({ state: false, beforeWorkVideo: '', afterWorkVideo: '' })}
                    url={urls.beforeWorkVideo.url || urls.afterWorkVideo.url}
                />
            )}
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: 10
    },
    uploadButton: {
        backgroundColor: colors.primary,
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginVertical: 5
    },
    buttonText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: '600'
    }
});