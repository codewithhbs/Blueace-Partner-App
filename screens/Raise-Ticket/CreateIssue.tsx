
import { useState, useEffect } from "react"
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    Modal,
    FlatList,
    Platform,
    KeyboardAvoidingView,
    Dimensions,
} from "react-native"
import * as ImagePicker from "expo-image-picker"
import * as VideoRecorder from "expo-camera"
import { Video } from "expo-av"
import { Picker } from "@react-native-picker/picker"
import axios from "axios"
import { FetchUserDetails, GetDataOfVendor } from "../../utils/api/Api"
import { MaterialIcons } from "@expo/vector-icons"

// Define valid subjects
const VALID_SUBJECTS = [
    "Order Related Issue",
    "Profile Related Issue",
    "App not work",
    "Order Not Come",
    "Update Profile Information",
    "Other",
    "Account Blocked",
]

// Define subjects that require attachments
const SUBJECTS_REQUIRING_ATTACHMENT = ["App not work", "Other"]

// Define screen dimensions
const { width } = Dimensions.get("window")

export default function CreateIssue() {
    // Form state
    const [subject, setSubject] = useState("")
    const [orderId, setOrderId] = useState("")
    const [message, setMessage] = useState("")
    const [attachment, setAttachment] = useState(null)
    const [attachmentType, setAttachmentType] = useState(null) // 'image' or 'video'
    const [loading, setLoading] = useState(false)
    const [submitting, setSubmitting] = useState(false)

    // Orders state
    const [orders, setOrders] = useState([])
    const [showOrderModal, setShowOrderModal] = useState(false)
    const [loadingOrders, setLoadingOrders] = useState(false)

    // Media picker state
    const [showMediaOptions, setShowMediaOptions] = useState(false)
    const [videoPermission, setVideoPermission] = useState(null)
    const [cameraPermission, setCameraPermission] = useState(null)

    // Validation state
    const [errors, setErrors] = useState({
        subject: "",
        orderId: "",
        message: "",
        attachment: "",
    })

    // Fetch orders when component mounts
    useEffect(() => {
        if (subject === "Order Related Issue") {
            fetchOrders()
        }
    }, [subject])

    // Request permissions when component mounts
    useEffect(() => {
        ; (async () => {
            const cameraStatus = await VideoRecorder.Camera.requestCameraPermissionsAsync()
            setCameraPermission(cameraStatus.status === "granted")

            const micStatus = await VideoRecorder.Camera.requestMicrophonePermissionsAsync()
            setVideoPermission(cameraStatus.status === "granted" && micStatus.status === "granted")
        })()
    }, [])

    // Fetch orders from API
    const fetchOrders = async () => {
        try {
            setLoadingOrders(true)
            const response = await GetDataOfVendor("All")
            if (response.data.orders) {
                setOrders(response.data.orders)
            }
        } catch (error) {
            console.error("Error fetching orders:", error)
            Alert.alert("Error", "Failed to fetch orders. Please try again.")
        } finally {
            setLoadingOrders(false)
        }
    }

    // Handle image picking
    const handlePickImage = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync()
        if (permissionResult.granted === false) {
            Alert.alert("Permission Required", "Permission to access media is required!")
            return
        }

        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                quality: 0.7,
                aspect: [4, 3],
            })

            if (!result.canceled) {
                const asset = result.assets[0]
                setAttachment(asset)
                setAttachmentType("image")
                setErrors((prev) => ({ ...prev, attachment: "" }))
            }
        } catch (error) {
            console.error("Error picking image:", error)
            Alert.alert("Error", "Failed to pick image. Please try again.")
        }
    }

    // Handle video picking
    const handlePickVideo = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync()
        if (permissionResult.granted === false) {
            Alert.alert("Permission Required", "Permission to access media is required!")
            return
        }

        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Videos,
                allowsEditing: true,
                quality: 0.7,
                videoMaxDuration: 60,
            })

            if (!result.canceled) {
                const asset = result.assets[0]
                setAttachment(asset)
                setAttachmentType("video")
                setErrors((prev) => ({ ...prev, attachment: "" }))
            }
        } catch (error) {
            console.error("Error picking video:", error)
            Alert.alert("Error", "Failed to pick video. Please try again.")
        }
    }

    // Handle recording video
    const handleRecordVideo = async () => {
        if (!videoPermission) {
            Alert.alert("Permission Required", "Camera and microphone permissions are required to record video.")
            return
        }

        try {
            // Navigate to video recording screen
            // This would typically be implemented with navigation
            Alert.alert("Record Video", "This would navigate to a video recording screen.")
            // For demonstration purposes, we'll just simulate picking a video
            handlePickVideo()
        } catch (error) {
            console.error("Error recording video:", error)
            Alert.alert("Error", "Failed to record video. Please try again.")
        }
    }

    // Handle order selection
    const handleSelectOrder = (order) => {
        setOrderId(order._id)
        setShowOrderModal(false)
        setErrors((prev) => ({ ...prev, orderId: "" }))
    }

    // Validate form
    const validateForm = () => {
        let isValid = true
        const newErrors = {
            subject: "",
            orderId: "",
            message: "",
            attachment: "",
        }

        // Validate subject
        if (!subject) {
            newErrors.subject = "Please select a subject"
            isValid = false
        }

        // Validate order ID for order-related issues
        if (subject === "Order Related Issue" && !orderId) {
            newErrors.orderId = "Please select an order"
            isValid = false
        }

        // Validate message
        if (!message.trim()) {
            newErrors.message = "Please enter a message"
            isValid = false
        } else if (message.trim().length < 10) {
            newErrors.message = "Message should be at least 10 characters"
            isValid = false
        }

        // Validate attachment for subjects that require it
        if (SUBJECTS_REQUIRING_ATTACHMENT.includes(subject) && !attachment) {
            newErrors.attachment = "Attachment is required for this issue type"
            isValid = false
        }

        setErrors(newErrors)
        return isValid
    }

    // Handle form submission
    const handleSubmit = async () => {
        if (!validateForm()) {
            return
        }
        const vendor_id = await FetchUserDetails()
       if (!vendor_id?._id){
            return alert("Login First")
        }

        const formData = new FormData()
        formData.append("vendor", vendor_id._id) // Replace with actual vendor ID
        formData.append("subject", subject)

        if (subject === "Order Related Issue") {
            formData.append("order_id", orderId)
        }

        formData.append("message", message)

        if (attachment) {
            const fileExtension = attachment.uri.split(".").pop()
            const mimeType = attachmentType === "video" ? `video/${fileExtension}` : `image/${fileExtension}`

            formData.append("file", {
                uri: attachment.uri,
                name: `attachment.${fileExtension}`,
                type: mimeType,
            })
        }

        try {
            setSubmitting(true)
            const res = await axios.post("https://api.blueaceindia.com/api/v1/create-ticket", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            })

            Alert.alert("Success", "Your ticket has been created successfully! Our support team will review it shortly.", [
                { text: "OK", onPress: resetForm },
            ])
        } catch (err) {
            console.error("Error creating ticket:", err)
            Alert.alert("Error", "Failed to create ticket. Please try again later.")
        } finally {
            setSubmitting(false)
        }
    }

    // Reset form after submission
    const resetForm = () => {
        setSubject("")
        setOrderId("")
        setMessage("")
        setAttachment(null)
        setAttachmentType(null)
        setErrors({
            subject: "",
            orderId: "",
            message: "",
            attachment: "",
        })
    }

    // Render order item in the order selection modal
    const renderOrderItem = ({ item }) => (
        <TouchableOpacity style={styles.orderItem} onPress={() => handleSelectOrder(item)}>
            <View style={styles.orderItemContent}>
                <View style={styles.orderIdContainer}>
                    <Text style={styles.orderIdLabel}>Order ID:</Text>
                    <Text style={styles.orderId}>{item._id.substring(0, 10) + '...'}</Text>
                </View>
                <View style={styles.orderIdContainer}>
                    <Text style={styles.orderIdLabel}>Order ID:</Text>
                    <Text style={styles.orderId}>{item.serviceType}</Text>
                </View>

                <View style={styles.orderDetails}>
                    <Text style={styles.orderDate}>
                        <MaterialIcons name="date-range" size={14} color="#666" /> {new Date(item.createdAt).toLocaleDateString()}
                    </Text>
                    <Text style={styles.orderStatus}>
                        <MaterialIcons name="info" size={14} color="#666" /> {item.status || "Processing"}
                    </Text>
                </View>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#007bff" />
        </TouchableOpacity>
    )

    return (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
            <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
                <View style={styles.header}>
                    <Text style={styles.title}>Create Support Ticket</Text>
                    <Text style={styles.subtitle}>Tell us about your issue and we'll help you resolve it</Text>
                </View>

                {/* Subject Selection */}
                <View style={styles.formGroup}>
                    <Text style={styles.label}>
                        Subject <Text style={styles.required}>*</Text>
                    </Text>
                    <View style={[styles.inputContainer, errors.subject ? styles.inputError : null]}>
                        <MaterialIcons name="subject" size={20} color="#666" style={styles.inputIcon} />
                        <View style={styles.pickerWrapper}>
                            <Picker
                                selectedValue={subject}
                                onValueChange={(itemValue) => {
                                    setSubject(itemValue)
                                    setErrors((prev) => ({ ...prev, subject: "" }))
                                    if (itemValue !== "Order Related Issue") {
                                        setOrderId("")
                                    }
                                }}
                                style={styles.picker}
                            >
                                <Picker.Item label="Select Subject" value="" color="#999" />
                                {VALID_SUBJECTS.map((s, i) => (
                                    <Picker.Item key={i} label={s} value={s} />
                                ))}
                            </Picker>
                        </View>
                    </View>
                    {errors.subject ? <Text style={styles.errorText}>{errors.subject}</Text> : null}
                </View>

                {/* Order Selection (only for Order Related Issues) */}
                {subject === "Order Related Issue" && (
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>
                            Select Order <Text style={styles.required}>*</Text>
                        </Text>
                        <TouchableOpacity
                            style={[styles.inputContainer, styles.orderSelector, errors.orderId ? styles.inputError : null]}
                            onPress={() => setShowOrderModal(true)}
                        >
                            <MaterialIcons name="shopping-cart" size={20} color="#666" style={styles.inputIcon} />
                            <Text style={orderId ? styles.orderText : styles.placeholderText}>
                                {orderId ? `Order ID: ${orderId}` : "Tap to select an order"}
                            </Text>
                            <MaterialIcons name="arrow-drop-down" size={24} color="#666" />
                        </TouchableOpacity>
                        {errors.orderId ? <Text style={styles.errorText}>{errors.orderId}</Text> : null}
                    </View>
                )}

                {/* Message Input */}
                <View style={styles.formGroup}>
                    <Text style={styles.label}>
                        Message <Text style={styles.required}>*</Text>
                    </Text>
                    <View style={[styles.inputContainer, styles.textAreaContainer, errors.message ? styles.inputError : null]}>
                        <MaterialIcons
                            name="message"
                            size={20}
                            color="#666"
                            style={[styles.inputIcon, { alignSelf: "flex-start", marginTop: 12 }]}
                        />
                        <TextInput
                            value={message}
                            onChangeText={(text) => {
                                setMessage(text)
                                if (text.trim().length >= 10) {
                                    setErrors((prev) => ({ ...prev, message: "" }))
                                }
                            }}
                            style={styles.textArea}
                            placeholder="Describe your issue in detail..."
                            placeholderTextColor="#999"
                            multiline
                            numberOfLines={6}
                            textAlignVertical="top"
                        />
                    </View>
                    {errors.message ? (
                        <Text style={styles.errorText}>{errors.message}</Text>
                    ) : (
                        <Text style={styles.helperText}>Please provide as much detail as possible</Text>
                    )}
                </View>

                {/* Attachment Section */}
                <View style={styles.formGroup}>
                    <Text style={styles.label}>
                        Attachment
                        {SUBJECTS_REQUIRING_ATTACHMENT.includes(subject) && <Text style={styles.required}> *</Text>}
                    </Text>

                    {!attachment ? (
                        <>
                            <TouchableOpacity
                                style={[styles.attachmentButton, errors.attachment ? styles.inputError : null]}
                                onPress={() => setShowMediaOptions(true)}
                            >
                                <MaterialIcons name="attach-file" size={24} color="#007bff" />
                                <Text style={styles.attachmentButtonText}>
                                    {SUBJECTS_REQUIRING_ATTACHMENT.includes(subject)
                                        ? "Attachment required - Tap to add"
                                        : "Tap to add image or video (optional)"}
                                </Text>
                            </TouchableOpacity>
                            {errors.attachment ? <Text style={styles.errorText}>{errors.attachment}</Text> : null}
                        </>
                    ) : (
                        <View style={styles.attachmentPreviewContainer}>
                            {attachmentType === "image" ? (
                                <Image source={{ uri: attachment.uri }} style={styles.attachmentPreview} resizeMode="cover" />
                            ) : (
                                <Video
                                    source={{ uri: attachment.uri }}
                                    style={styles.attachmentPreview}
                                    useNativeControls
                                    resizeMode="contain"
                                    isLooping
                                />
                            )}

                            <View style={styles.attachmentInfo}>
                                <View style={styles.attachmentDetails}>
                                    <Text style={styles.attachmentType}>{attachmentType === "image" ? "Image" : "Video"} attached</Text>
                                    <Text style={styles.attachmentName} numberOfLines={1}>
                                        {attachment.fileName || attachment.uri.split("/").pop()}
                                    </Text>
                                </View>

                                <TouchableOpacity
                                    style={styles.removeAttachmentButton}
                                    onPress={() => {
                                        setAttachment(null)
                                        setAttachmentType(null)
                                    }}
                                >
                                    <MaterialIcons name="close" size={20} color="#fff" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                    style={[styles.submitButton, submitting && styles.disabledButton]}
                    onPress={handleSubmit}
                    disabled={submitting}
                >
                    {submitting ? (
                        <ActivityIndicator color="#fff" size="small" />
                    ) : (
                        <>
                            <MaterialIcons name="send" size={20} color="#fff" style={{ marginRight: 8 }} />
                            <Text style={styles.submitText}>Submit Ticket</Text>
                        </>
                    )}
                </TouchableOpacity>

                {/* Order Selection Modal */}
                <Modal
                    visible={showOrderModal}
                    transparent={true}
                    animationType="slide"
                    onRequestClose={() => setShowOrderModal(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Select an Order</Text>
                                <TouchableOpacity style={styles.modalCloseButton} onPress={() => setShowOrderModal(false)}>
                                    <MaterialIcons name="close" size={24} color="#000" />
                                </TouchableOpacity>
                            </View>

                            {loadingOrders ? (
                                <View style={styles.loadingContainer}>
                                    <ActivityIndicator size="large" color="#007bff" />
                                    <Text style={styles.loadingText}>Loading orders...</Text>
                                </View>
                            ) : orders.length > 0 ? (
                                <FlatList
                                    data={orders}
                                    renderItem={renderOrderItem}
                                    keyExtractor={(item) => item._id}
                                    contentContainerStyle={styles.orderList}
                                    showsVerticalScrollIndicator={false}
                                />
                            ) : (
                                <View style={styles.noOrdersContainer}>
                                    <MaterialIcons name="info" size={48} color="#ccc" />
                                    <Text style={styles.noOrdersText}>No orders found</Text>
                                    <Text style={styles.noOrdersSubtext}>You don't have any orders to report an issue about</Text>
                                </View>
                            )}
                        </View>
                    </View>
                </Modal>

                {/* Media Options Modal */}
                <Modal
                    visible={showMediaOptions}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={() => setShowMediaOptions(false)}
                >
                    <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowMediaOptions(false)}>
                        <View style={styles.mediaOptionsContainer}>
                            <TouchableOpacity
                                style={styles.mediaOption}
                                onPress={() => {
                                    setShowMediaOptions(false)
                                    handlePickImage()
                                }}
                            >
                                <MaterialIcons name="photo" size={28} color="#007bff" />
                                <Text style={styles.mediaOptionText}>Choose Image from Gallery</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.mediaOption}
                                onPress={() => {
                                    setShowMediaOptions(false)
                                    handlePickVideo()
                                }}
                            >
                                <MaterialIcons name="video-library" size={28} color="#007bff" />
                                <Text style={styles.mediaOptionText}>Choose Video from Gallery</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.mediaOption}
                                onPress={() => {
                                    setShowMediaOptions(false)
                                    handleRecordVideo()
                                }}
                            >
                                <MaterialIcons name="videocam" size={28} color="#007bff" />
                                <Text style={styles.mediaOptionText}>Record New Video</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.mediaOption, styles.cancelOption]}
                                onPress={() => setShowMediaOptions(false)}
                            >
                                <Text style={styles.cancelOptionText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                </Modal>
            </ScrollView>
        </KeyboardAvoidingView>
    )
}

const styles = 
StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5",
    },
    contentContainer: {
        padding: 20,
    },
    header: {
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: "#666",
    },
    formGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 8,
    },
    required: {
        color: "red",
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: 8,
        paddingHorizontal: 15,
       
        borderWidth: 1,
        borderColor: "#ddd",
    },
    inputIcon: {
        marginRight: 12,
    },
    pickerWrapper: {
        flex: 1,
    },
    picker: {
        height: 50,
        color: "#333",
    },
    input: {
        flex: 1,
        height: 48,
        fontSize: 16,
        color: "#333",
    },
    textAreaContainer: {
        paddingBottom: 12,
    },
    textArea: {
        flex: 1,
        fontSize: 16,
        color: "#333",
        paddingTop: 12,
        paddingBottom: 12,
        minHeight: 120,
    },
    orderSelector: {
        height:50,
        justifyContent: "space-between",
    },
    orderText: {
        flex: 1,
        fontSize: 16,
        color: "#333",
    },
    placeholderText: {
        flex: 1,
        fontSize: 16,
        color: "#999",
    },
    attachmentButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#f0f0ff",
        borderRadius: 8,
        padding: 12,
        borderWidth: 1,
        borderColor: "#ddd",
        justifyContent: "center",
    },
    attachmentButtonText: {
        color: "#007bff",
        marginLeft: 8,
        fontSize: 16,
    },
    attachmentPreviewContainer: {
        backgroundColor: "#fff",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#ddd",
        overflow: "hidden",
    },
    attachmentPreview: {
        width: "100%",
        height: 200,
    },
    attachmentInfo: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 12,
        backgroundColor: "#f0f0f0",
    },
    attachmentDetails: {
        flex: 1,
    },
    attachmentType: {
        fontSize: 14,
        color: "#666",
    },
    attachmentName: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#333",
    },
    removeAttachmentButton: {
        backgroundColor: "#dc3545",
        borderRadius: 20,
        width: 32,
        height: 32,
        alignItems: "center",
        justifyContent: "center",
    },
    submitButton: {
        backgroundColor: "#007bff",
        borderRadius: 8,
        paddingVertical: 14,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
    },
    submitText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
    },
    disabledButton: {
        backgroundColor: "#007bff",
        opacity: 0.7,
    },
    errorText: {
        color: "red",
        marginTop: 4,
        fontSize: 14,
    },
    helperText: {
        color: "#666",
        marginTop: 4,
        fontSize: 14,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContent: {
        backgroundColor: "#fff",
        borderRadius: 12,
        width: "90%",
        maxHeight: "80%",
        overflow: "hidden",
    },
    modalHeader: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#ddd",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#333",
    },
    modalCloseButton: {
        padding: 8,
    },
    orderList: {
        padding: 16,
    },
    orderItem: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    orderItemContent: {
        flex: 1,
    },
    orderIdContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 4,
    },
    orderIdLabel: {
        fontSize: 14,
        color: "#666",
        marginRight: 4,
    },
    orderId: {
        fontSize: 12,
        fontWeight: "bold",
        color: "#333",
    },
    orderDetails: {
        flexDirection: "row",
        alignItems: "center",
    },
    orderDate: {
        fontSize: 12,
        color: "#666",
        marginRight: 12,
    },
    orderStatus: {
        fontSize: 12,
        color: "#666",
    },
    loadingContainer: {
        padding: 20,
        alignItems: "center",
    },
    loadingText: {
        marginTop: 8,
        fontSize: 16,
        color: "#666",
    },
    noOrdersContainer: {
        padding: 20,
        alignItems: "center",
    },
    noOrdersText: {
        marginTop: 12,
        fontSize: 18,
        fontWeight: "bold",
        color: "#666",
        textAlign: "center",
    },
    noOrdersSubtext: {
        marginTop: 8,
        fontSize: 14,
        color: "#999",
        textAlign: "center",
    },
    mediaOptionsContainer: {
        backgroundColor: "#fff",
        borderRadius: 12,
        width: "80%",
        overflow: "hidden",
    },
    mediaOption: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    mediaOptionText: {
        fontSize: 16,
        color: "#333",
        marginLeft: 12,
    },
    cancelOption: {
        borderBottomWidth: 0,
    },
    cancelOptionText: {
        fontSize: 18,
        color: "#007bff",
        textAlign: "center",
    },
    inputError: {
        borderColor: "red",
    },
})
