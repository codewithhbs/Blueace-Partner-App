import React, { useState, useRef, useEffect } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { Camera } from 'expo-camera';
import { Video } from 'expo-av';
import * as MediaLibrary from 'expo-media-library';
import { Circle, StopCircle, FlipCamera, Save } from 'lucide-react-native';
import { colors } from '~/colors/Colors';
import { CameraType } from 'expo-image-picker';

interface VideoRecorderProps {
    onVideoRecorded: (videoUri: string) => void;
    onClose: () => void;
}

export default function VideoRecorder({ onVideoRecorded, onClose }) {
    const [hasPermission, setHasPermission] = useState(null);
    const [cameraType, setCameraType] = useState(CameraType?.back);
    const [isRecording, setIsRecording] = useState(false);
    const [video, setVideo] = useState(null);
    const cameraRef = useRef(null);
    // console.log("back", CameraType)
    useEffect(() => {
        (async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            const audioStatus = await Camera.requestMicrophonePermissionsAsync();
            setHasPermission(status === 'granted' && audioStatus.status === 'granted');
        })();
    }, []);

    const startRecording = async () => {
        if (cameraRef.current) {
            try {
                setIsRecording(true);
                const videoRecordPromise = cameraRef.current.recordAsync({
                    maxDuration: 60, // Maximum recording duration in seconds
                    quality: Camera.Constants.VideoQuality['720p'],
                });

                const data = await videoRecordPromise;
                setVideo(data.uri);
            } catch (error) {
                console.error('Failed to record:', error);
            }
            setIsRecording(false);
        }
    };

    const stopRecording = () => {
        if (cameraRef.current && isRecording) {
            cameraRef.current.stopRecording();
        }
    };

    const toggleCameraType = () => {
        setCameraType(
            cameraType === Camera.Constants.Type.back
                ? Camera.Constants.Type.front
                : Camera.Constants.Type.back
        );
    };

    const saveVideo = async () => {
        if (video) {
            try {
                const asset = await MediaLibrary.createAssetAsync(video);
                Alert.alert(
                    'Success',
                    'Video saved to camera roll!',
                    [{ text: 'OK', onPress: () => onVideoRecorded(video) }]
                );
            } catch (error) {
                console.error('Failed to save video:', error);
                Alert.alert('Error', 'Failed to save video to camera roll');
            }
        }
    };

    if (hasPermission === null) {
        return <View />;
    }

    if (hasPermission === false) {
        return <Text>No access to camera</Text>;
    }

    return (
        <View style={styles.container}>
            {video ? (
                <Camera
                    ref={cameraRef}
                    style={styles.camera}
                    type={cameraType}
                    ratio="16:9"
                >
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={styles.flipButton}
                            onPress={toggleCameraType}
                        >
                            <FlipCamera color={colors.white} size={24} />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.recordButton, isRecording && styles.recording]}
                            onPress={isRecording ? stopRecording : startRecording}
                        >
                            {isRecording ? (
                                <StopCircle color={colors.white} size={48} />
                            ) : (
                                <Circle color={colors.white} size={48} fill={colors.red} />
                            )}
                        </TouchableOpacity>
                    </View>
                </Camera>
            ) : (
                <View style={styles.preview}>
                    <Video
                        source={{ uri: video }}
                        style={styles.video}
                        useNativeControls
                        resizeMode="contain"
                    />
                    <View style={styles.previewButtons}>
                        <TouchableOpacity
                            style={styles.button}
                            onPress={() => setVideo(null)}
                        >
                            <Text style={styles.buttonText}>Retake</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.button, styles.saveButton]}
                            onPress={saveVideo}
                        >
                            <Save color={colors.white} size={24} />
                            <Text style={styles.buttonText}>Save</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </View>

    )
}




const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
    },
    camera: {
        flex: 1,
        aspectRatio: 9 / 16,
    },
    buttonContainer: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: 'transparent',
        justifyContent: 'center',
        alignItems: 'flex-end',
        marginBottom: 35,
    },
    flipButton: {
        position: 'absolute',
        left: 30,
        bottom: 10,
        padding: 15,
    },
    recordButton: {
        padding: 15,
        borderRadius: 50,
        backgroundColor: 'transparent',
    },
    recording: {
        backgroundColor: colors.red,
    },
    preview: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    video: {
        flex: 1,
    },
    previewButtons: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 20,
    },
    button: {
        padding: 15,
        borderRadius: 10,
        backgroundColor: colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    saveButton: {
        backgroundColor: colors.green,
    },
    buttonText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: '600',
    },
});