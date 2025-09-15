import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Image,
    FlatList,
    Modal,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '~/colors/Colors';
import { AllotMeber, fetchMemeber, FetchNewOrder } from '~/utils/api/Api';

const Memeber: React.FC = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { alreadyAlloted, id } = route.params || {};

    const [members, setMembers] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [selectedAdharImage, setSelectedAdharImage] = useState<string | null>(null);

    useEffect(() => {
        const getMembers = async () => {
            try {
                const response = await fetchMemeber();
                setMembers(response);
            } catch (error) {
                console.error("Error fetching members:", error);
            } finally {
                setLoading(false);
            }
        };
        getMembers();
    }, []);

    const handleAllot = async (member: any) => {
        try {
            const data = await AllotMeber(id, member);

            if (data.success) {
                Alert.alert('Success', 'Member allotted successfully!');
                navigation.navigate('home');
            }
        } catch (error) {
            console.error("Error allotting member:", error);
        }
    };

    const handleAdharClick = (url: string) => {
        setSelectedAdharImage(url);
        setModalVisible(true);
    };

    const handleGoBack = () => {
        navigation.goBack();
    };

    const renderHeader = () => (
        <View style={styles.header}>
            <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
                <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>All Members</Text>
            <View style={styles.headerRight}>
                <Text style={styles.memberCount}>{members.length} Members</Text>
            </View>
        </View>
    );

    const renderMemberItem = ({ item }: { item: any }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <Image
                    source={{ uri: `https://ui-avatars.com/api/?name=${item.name}&background=4F46E5&color=fff` }}
                    style={styles.avatar}
                />
                <View style={styles.memberInfo}>
                    <Text style={styles.memberName}>{item.name}</Text>
                    <Text style={styles.memberEmail}>{item.email}</Text>
                </View>
                <View style={styles.statusContainer}>
                    {alreadyAlloted && item.name === alreadyAlloted && (
                        <View style={styles.statusBadge}>
                            <Text style={styles.statusText}>Allotted</Text>
                        </View>
                    )}
                </View>
            </View>

            <View style={styles.cardBody}>
                <TouchableOpacity 
                    onPress={() => handleAdharClick(item.memberAdharImage.url)}
                    style={styles.adharButton}
                >
                    <Text style={styles.adharButtonText}>📄 View Aadhaar</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.cardFooter}>
                {alreadyAlloted ? (
                    item.name === alreadyAlloted ? (
                        <TouchableOpacity style={styles.allottedButton} disabled>
                            <Text style={styles.allottedButtonText}>Already Allotted</Text>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            onPress={() => handleAllot(item.name)}
                            style={styles.allotButton}
                        >
                            <Text style={styles.buttonText}>Allot This Member</Text>
                        </TouchableOpacity>
                    )
                ) : (
                    <TouchableOpacity
                        onPress={() => handleAllot(item._id)}
                        style={styles.allotButton}
                    >
                        <Text style={styles.buttonText}>Allot This Member</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>👥</Text>
            <Text style={styles.emptyTitle}>No Members Found</Text>
            <Text style={styles.emptySubtitle}>There are no members available at the moment.</Text>
        </View>
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
                {renderHeader()}
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={styles.loadingText}>Loading members...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
            {renderHeader()}
            
            <FlatList
                data={members}
                renderItem={renderMemberItem}
                keyExtractor={(item) => item._id}
                showsVerticalScrollIndicator={false}
                removeClippedSubviews={false}
                contentContainerStyle={styles.listContainer}
                ListEmptyComponent={renderEmptyState}
            />

            <Modal
                visible={modalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Aadhaar Document</Text>
                            <TouchableOpacity 
                                onPress={() => setModalVisible(false)}
                                style={styles.closeButton}
                            >
                                <Text style={styles.closeButtonText}>✕</Text>
                            </TouchableOpacity>
                        </View>
                        {selectedAdharImage && (
                            <Image 
                                source={{ uri: selectedAdharImage }} 
                                style={styles.modalImage}
                                resizeMode="contain"
                            />
                        )}
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    backButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: colors.primary + '15',
    },
    backButtonText: {
        fontSize: 20,
        color: colors.primary,
        fontWeight: 'bold',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        flex: 1,
        textAlign: 'center',
    },
    headerRight: {
        alignItems: 'flex-end',
    },
    memberCount: {
        fontSize: 12,
        color: colors.gray,
        backgroundColor: colors.primary + '15',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    listContainer: {
        padding: 16,
        paddingBottom: 32,
    },
    card: {
        backgroundColor: '#fff',
        padding: 16,
        marginBottom: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 12,
    },
    memberInfo: {
        flex: 1,
    },
    memberName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 2,
    },
    memberEmail: {
        fontSize: 14,
        color: colors.gray,
    },
    statusContainer: {
        alignItems: 'flex-end',
    },
    statusBadge: {
        backgroundColor: '#e8f5e8',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 12,
        color: '#28a745',
        fontWeight: '600',
    },
    cardBody: {
        marginBottom: 12,
    },
    adharButton: {
        backgroundColor: '#f8f9fa',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e9ecef',
        alignSelf: 'flex-start',
    },
    adharButtonText: {
        color: colors.primary,
        fontSize: 14,
        fontWeight: '500',
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    allotButton: {
        backgroundColor: colors.primary,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        elevation: 2,
    },
    buttonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
    allottedButton: {
        backgroundColor: '#6c757d',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    allottedButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: colors.gray,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 100,
    },
    emptyText: {
        fontSize: 48,
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        color: colors.gray,
        textAlign: 'center',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 12,
        width: '90%',
        maxHeight: '80%',
        overflow: 'hidden',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    closeButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: '#f8f9fa',
    },
    closeButtonText: {
        fontSize: 16,
        color: '#6c757d',
        fontWeight: 'bold',
    },
    modalImage: {
        width: '100%',
        height: 400,
    },
});

export default Memeber;