import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Video } from 'expo-av';
import { CircleX } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '~/colors/Colors';

interface VideoPreviewProps {
    url: string;
    onClose: () => void;
}

export default function VideoPreview({ url, onClose }: VideoPreviewProps) {
    const navigation = useNavigation();

    const handleClose = () => {
        onClose(); 
        navigation.navigate(navigation.getState().routes[navigation.getState().index].name);
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.closeButton}
                onPress={handleClose}
            >
                <CircleX color={colors.white} />
            </TouchableOpacity>
            <Video
                source={{ uri: url }}
                style={styles.video}
                shouldPlay={true}
                useNativeControls
                resizeMode="contain"
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    closeButton: {
        position: 'absolute',
        top: 40,
        right: 20,
        zIndex: 1,
        padding: 10
    },
    video: {
        width: '100%',
        height: 300
    }
});
