import { CameraView, Camera } from "expo-camera";
import { useState, useRef, useEffect } from "react";
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    SafeAreaView,
    Alert,
    ActivityIndicator,
    Modal,
    Platform,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Video } from "expo-av";
import axios from "axios";

export default function VideoRecorder() {
    const route = useRoute();
    const { type, orderId } = route.params || {};

    // Permissions
    const [cameraPermission, setCameraPermission] = useState();
    const [micPermission, setMicPermission] = useState();
    const [permissionError, setPermissionError] = useState("");

    // Camera states
    const [facing, setFacing] = useState("back");
    const [flashMode, setFlashMode] = useState("off");
    const [video, setVideo] = useState();

    // Recording states
    const [recording, setRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [timerInterval, setTimerInterval] = useState(null);

    // UI states
    const [showVideoPreview, setShowVideoPreview] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [fileLink, setFileLink] = useState('');

    // Refs
    const cameraRef = useRef();
    const videoRef = useRef(null);
    const navigation = useNavigation();

    // Request permissions on mount
    useEffect(() => {
        (async () => {
            try {
                const cameraPermission = await Camera.requestCameraPermissionsAsync();
                const microphonePermission = await Camera.requestMicrophonePermissionsAsync();

                setCameraPermission(cameraPermission.status === "granted");
                setMicPermission(microphonePermission.status === "granted");

                if (cameraPermission.status !== "granted") {
                    setPermissionError("Camera permission is required to record video.");
                } else if (microphonePermission.status !== "granted") {
                    setPermissionError("Microphone permission is required for video recording.");
                }
            } catch (error) {
                console.error("Error requesting permissions:", error);
                setPermissionError("An error occurred while requesting permissions. Please try again.");
            }
        })();
    }, []);

    // Cleanup timer
    useEffect(() => {
        return () => {
            if (timerInterval) clearInterval(timerInterval);
        };
    }, [timerInterval]);

    // Loading state
    if (cameraPermission === undefined || micPermission === undefined) {
        return (
            <View style={styles.permissionContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text style={styles.permissionText}>Requesting permissions...</Text>
            </View>
        );
    }

    // Permission error
    if (!cameraPermission || !micPermission) {
        return (
            <View style={styles.permissionContainer}>
                <Ionicons name="alert-circle-outline" size={60} color="#FF6B6B" />
                <Text style={styles.permissionErrorText}>{permissionError}</Text>
                <TouchableOpacity
                    style={styles.permissionButton}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.permissionButtonText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // Toggle camera facing
    const toggleCameraFacing = () => {
        setFacing((current) => (current === "back" ? "front" : "back"));
    };

    // Toggle flash
    const toggleFlash = () => {
        setFlashMode((current) => (current === "on" ? "off" : "on"));
    };

    // Format seconds to MM:SS
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Start recording
    async function startRecording() {
        try {
            setRecording(true);
            setRecordingTime(0);

            const interval = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
            setTimerInterval(interval);

            cameraRef.current.recordAsync({
                maxDuration: 60,
                quality: '720p',
                mute: false,
            })
                .then((newVideo) => {
                    setVideo(newVideo);
                    setRecording(false);
                    setShowVideoPreview(true);
                    clearInterval(interval);
                    setTimerInterval(null);
                })
                .catch(error => {
                    console.error("Error recording video:", error);
                    Alert.alert("Recording Error", "Failed to record video. Please try again.");
                    clearInterval(interval);
                    setTimerInterval(null);
                    setRecording(false);
                });
        } catch (error) {
            console.error("Error starting video recording:", error);
            Alert.alert("Error", "Failed to start video recording. Please try again.");
            setRecording(false);
            if (timerInterval) {
                clearInterval(timerInterval);
                setTimerInterval(null);
            }
        }
    }

    // Stop recording
    function stopRecording() {
        try {
            setRecording(false);
            cameraRef.current.stopRecording();
            if (timerInterval) {
                clearInterval(timerInterval);
                setTimerInterval(null);
            }
        } catch (error) {
            console.error("Error stopping recording:", error);
            Alert.alert("Error", "Failed to stop recording. Please try again.");
        }
    }

    // Upload video
    const handleUpload = async (uri) => {
        if (isUploading) return;
        console.log("type", type);

        const formData = new FormData();
        const fileName = `${type}_work_video_${orderId?.substring(0, 5) || 'video'}.mp4`;

        formData.append(`${type}WorkVideo`, {
            uri: uri,
            type: 'video/mp4',
            name: fileName,
        });

        setIsUploading(true);
        setUploadProgress(0);
        setUploadSuccess(false);

        try {
            const endpoint = `https://api.blueaceindia.com/api/v1/update-${type}-work-video/${orderId}`;

            const { data } = await axios.put(endpoint, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total
                    );
                    setUploadProgress(percentCompleted);
                },
            });

            setFileLink(data.fileLink || '');
            setUploadSuccess(true);

            setTimeout(() => {
                setIsUploading(false);
                navigation.goBack();
            }, 2000);
        } catch (error) {
            console.error('Upload failed:', error?.response?.data || error.message);
            setIsUploading(false);
            Alert.alert("Upload Failed", "Failed to upload video. Please try again.");
        }
    };

    // Video Preview Modal
    const VideoPreviewModal = () => {
        if (!video || !showVideoPreview) return null;

        return (
            <Modal
                animationType="fade"
                transparent={false}
                visible={showVideoPreview}
                onRequestClose={() => {
                    if (!isUploading) {
                        setShowVideoPreview(false);
                        setVideo(null);
                    }
                }}
            >
                <SafeAreaView style={styles.videoPreviewContainer}>
                    <View style={styles.videoPreviewHeader}>
                        {!isUploading && (
                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={() => {
                                    setShowVideoPreview(false);
                                    setVideo(null);
                                }}
                            >
                                <Ionicons name="close" size={28} color="#fff" />
                            </TouchableOpacity>
                        )}
                        <Text style={styles.videoPreviewTitle}>
                            {isUploading ? "Uploading Video" : uploadSuccess ? "Upload Complete" : "Video Preview"}
                        </Text>
                    </View>

                    <Video
                        ref={videoRef}
                        style={styles.videoPreview}
                        source={{ uri: video.uri }}
                        useNativeControls
                        resizeMode="contain"
                        isLooping
                        shouldPlay={!isUploading}
                    />

                    <View style={styles.videoPreviewActions}>
                        {isUploading ? (
                            <View style={styles.uploadProgressContainer}>
                                {uploadSuccess ? (
                                    <View style={styles.successContainer}>
                                        <Ionicons name="checkmark-circle" size={50} color="#4CAF50" />
                                        <Text style={styles.successText}>Upload Successful!</Text>
                                        <Text style={styles.successSubtext}>Returning to previous screen...</Text>
                                    </View>
                                ) : (
                                    <>
                                        <Text style={styles.uploadProgressText}>
                                            Uploading: {uploadProgress}%
                                        </Text>
                                        <View style={styles.progressBarContainer}>
                                            <View
                                                style={[
                                                    styles.progressBar,
                                                    { width: `${uploadProgress}%` }
                                                ]}
                                            />
                                        </View>
                                        <Text style={styles.uploadHint}>Please wait while your video uploads...</Text>
                                    </>
                                )}
                            </View>
                        ) : (
                            <View style={styles.actionButtonsContainer}>
                                <TouchableOpacity
                                    style={styles.videoActionButton}
                                    onPress={() => handleUpload(video.uri)}
                                >
                                    <Ionicons name="cloud-upload" size={24} color="#fff" />
                                    <Text style={styles.videoActionText}>Upload</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.videoActionButton}
                                    onPress={() => {
                                        setShowVideoPreview(false);
                                        setVideo(null);
                                    }}
                                >
                                    <Ionicons name="trash" size={24} color="#fff" />
                                    <Text style={styles.videoActionText}>Discard</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </SafeAreaView>
            </Modal>
        );
    };

    return (
        <View style={styles.container}>
            <CameraView
                style={styles.camera}
                facing={facing}
                ref={cameraRef}
                flash={flashMode}
                mode="video"
            >
                {recording && (
                    <View style={styles.recordingIndicator}>
                        <View style={styles.recordingDot} />
                        <Text style={styles.recordingTimer}>{formatTime(recordingTime)}</Text>
                    </View>
                )}

                <View style={styles.controlsContainer}>
                    <TouchableOpacity style={styles.controlButton} onPress={toggleCameraFacing}>
                        <Ionicons name="camera-reverse" size={24} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.controlButton} onPress={toggleFlash}>
                        <Ionicons
                            name={flashMode === "on" ? "flash" : "flash-off"}
                            size={24}
                            color="white"
                        />
                    </TouchableOpacity>
                </View>

                <View style={styles.recordButtonContainer}>
                    {recording ? (
                        <TouchableOpacity style={styles.stopButton} onPress={stopRecording}>
                            <View style={styles.stopIcon} />
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity style={styles.recordButton} onPress={startRecording}>
                            <View style={styles.recordIcon} />
                        </TouchableOpacity>
                    )}
                </View>

                {!recording && (
                    <View style={styles.instructionsContainer}>
                        <Text style={styles.instructionsText}>
                            Tap the button to start recording
                        </Text>
                    </View>
                )}

                <TouchableOpacity
                    style={styles.closeButtonCamera}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="close" size={28} color="white" />
                </TouchableOpacity>
            </CameraView>

            <VideoPreviewModal />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    camera: { flex: 1 },
    controlsContainer: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 50 : 30,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
    },
    controlButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    recordButtonContainer: {
        position: 'absolute',
        bottom: 40,
        alignSelf: 'center',
    },
    recordButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    recordIcon: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#FF3B30',
    },
    stopButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    stopIcon: {
        width: 36,
        height: 36,
        backgroundColor: '#FF3B30',
        borderRadius: 4,
    },
    recordingIndicator: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 50 : 30,
        alignSelf: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        zIndex: 10,
    },
    recordingDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#FF3B30',
        marginRight: 10,
    },
    recordingTimer: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    closeButtonCamera: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 50 : 30,
        right: 20,
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    instructionsContainer: {
        position: 'absolute',
        bottom: 140,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    instructionsText: {
        color: 'white',
        fontSize: 16,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    videoPreviewContainer: { flex: 1, backgroundColor: '#000' },
    videoPreviewHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
    },
    videoPreviewTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 16,
        flex: 1,
        textAlign: 'center',
    },
    closeButton: {
        padding: 4,
        position: 'absolute',
        left: 16,
        zIndex: 1,
    },
    videoPreview: { flex: 1, backgroundColor: '#000' },
    videoPreviewActions: { padding: 20, backgroundColor: 'rgba(0, 0, 0, 0.8)' },
    actionButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    videoActionButton: { alignItems: 'center', justifyContent: 'center', padding: 10 },
    videoActionText: { color: '#fff', marginTop: 8, fontSize: 14 },
    uploadProgressContainer: { width: '100%', alignItems: 'center', padding: 10 },
    uploadProgressText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    uploadHint: { color: '#ccc', fontSize: 14, marginTop: 15, textAlign: 'center' },
    progressBarContainer: {
        width: '100%',
        height: 12,
        backgroundColor: '#333',
        borderRadius: 6,
        overflow: 'hidden',
    },
    progressBar: { height: '100%', backgroundColor: '#4CAF50' },
    successContainer: { alignItems: 'center', padding: 20 },
    successText: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginTop: 15 },
    successSubtext: { color: '#ccc', fontSize: 14, marginTop: 10 },
    permissionContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#000',
    },
    permissionText: { fontSize: 16, color: '#fff', marginTop: 16, textAlign: 'center' },
    permissionErrorText: {
        fontSize: 16,
        color: '#fff',
        marginTop: 16,
        marginBottom: 24,
        textAlign: 'center',
        lineHeight: 24,
    },
    permissionButton: {
        backgroundColor: '#FF3B30',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
    },
    permissionButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
