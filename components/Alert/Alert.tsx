import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '~/colors/Colors';

interface AlertProps {
    message: string;
    type: 'success' | 'error' | 'info';
    onClose: () => void;
}

const Alert: React.FC<AlertProps> = ({ message, type, onClose }) => {
    const getAlertStyle = () => {
        switch (type) {
            case 'success':
                return {
                    backgroundColor: colors.success,
                    icon: 'check-circle-outline',
                };
            case 'error':
                return {
                    backgroundColor: colors.error,
                    icon: 'close-circle-outline',
                };
            case 'info':
                return {
                    backgroundColor: colors.secondary,
                    icon: 'information-circle-outline',
                };
            default:
                return {};
        }
    };

    const { backgroundColor, icon } = getAlertStyle();

    // Auto close the alert after 4 seconds
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose(); // Close the alert after 4 seconds
        }, 4000);

        // Cleanup timeout when the component unmounts
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <View
            style={[
                {
                    backgroundColor,
                    padding: 16,
                    borderRadius: 8,
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 16,
                },
            ]}
        >
            <Icon
                name={icon}
                size={24}
                color={colors.white}
                style={{ marginRight: 12 }}
            />
            <Text style={{ color: colors.white, flex: 1 }}>{message}</Text>
            <TouchableOpacity onPress={onClose}>
                <Icon
                    name="close-circle-outline"
                    size={24}
                    color={colors.white}
                />
            </TouchableOpacity>
        </View>
    );
};

export default Alert;
