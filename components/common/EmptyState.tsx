import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export function EmptyState() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>📦 No New Orders Yet!</Text>
            <Text style={styles.subtitle}>
                Stay tuned! We'll notify you as soon as a new order comes in. 🚀
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#FF6B6B',
        marginBottom: 10
    },
    subtitle: {
        fontSize: 16,
        color: '#555555',
        textAlign: 'center'
    }
});