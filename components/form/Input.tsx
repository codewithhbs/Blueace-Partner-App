import React from "react";
import { View, TextInput, StyleSheet, Text } from "react-native";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from "~/colors/Colors";


interface InputProps {
    icon: string;
    placeholder: string;
    secureTextEntry?: boolean;
    onChangeText: (text: string) => void;
    value: string;
    keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
    error?: string;
}

const Input: React.FC<InputProps> = ({
    icon,
    placeholder,
    secureTextEntry = false,
    onChangeText,
    value,
    keyboardType = "default",
    error
}) => {
    return (
        <View>
            <View style={[styles.inputContainer, error && styles.inputError]}>
                <Icon 
                    name={icon} 
                    size={14} 
                    color={error ? colors.error : colors.primary} 
                    style={styles.icon}
                />
                <TextInput
                    style={styles.input}
                    placeholder={placeholder}
                    secureTextEntry={secureTextEntry}
                    onChangeText={onChangeText}
                    value={value}
                    keyboardType={keyboardType}
                    placeholderTextColor={colors.placeholder}
                    autoCapitalize="none"
                />
            </View>
            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginVertical: 8,
        borderWidth: 1,
        borderColor: colors.border,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    inputError: {
        borderColor: colors.error,
        borderWidth: 1,
    },
    icon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: colors.text,
        padding: 0,
    },
    errorText: {
        color: colors.error,
        fontSize: 12,
        marginLeft: 16,
        marginTop: 4,
    }
});

export default Input;