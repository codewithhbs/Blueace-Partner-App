import { View, Text, StyleSheet, Platform } from 'react-native';
import React from 'react';
import { ChevronRight } from 'lucide-react-native';
import { colors } from '~/colors/Colors';

interface MainHeadingProps {
    text: string;
    icon?: React.ReactElement; // Restrict icon to valid React elements
    size?: 'small' | 'medium' | 'large';
    variant?: 'primary' | 'secondary';
}

export default function MainHeading({
    text,
    icon,
    size = 'medium',
    variant = 'primary'
}: MainHeadingProps) {
    const fontSize = {
        small: 16,
        medium: 20,
        large: 24
    }[size];

    const color = {
        primary: colors.text,
        secondary: '#6366F1'
    }[variant];

    return (
        <View style={styles.container}>
            {icon && <View style={[styles.icon, { color }]}>{icon}</View>}
            <Text
                style={[
                    styles.heading,
                    {
                        fontSize,
                        color
                    }
                ]}
            >
                {text}
            </Text>
            <ChevronRight
                size={fontSize}
                color={color}
                style={styles.chevron}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        marginVertical: 8,
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        ...Platform.select({
            android: {
                elevation: 1,
            },
            ios: {
                shadowColor: '#000000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
        }),
    },
    heading: {
        flex: 1,
        fontWeight: 'bold',
        textTransform: 'capitalize',
        overflow: 'hidden',
    },
    icon: {
        marginRight: 8,
    },
    chevron: {
        marginLeft: 8,
    }
});
