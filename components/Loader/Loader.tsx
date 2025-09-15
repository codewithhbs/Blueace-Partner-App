import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';

interface LoaderProps {
    message?: string;
    size?: 'small' | 'large';
    color?: string;
}

export const Loader: React.FC<LoaderProps> = ({ 
    message = 'Loading...', 
    size = 'small',
    color = '#ffffff' 
}) => {
    return (
        <View className="flex items-center justify-center">
            <ActivityIndicator 
                busy={true} 
                className={`mb-2 ${color}`}
                size={size}
            />
            {message && (
                <Text className={`text-sm ${color}`}>
                    {message}
                </Text>
            )}
        </View>
    );
};