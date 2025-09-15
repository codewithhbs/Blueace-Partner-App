import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
        backgroundColor: "#f8d7da", // Light red background for error message
    },
    errorText: {
        fontSize: 18,
        color: "#d32f2f", // Red color for error text
        marginBottom: 10,
        textAlign: "center",
        fontWeight: "bold",
    },
    retryButton: {
        backgroundColor: "#d32f2f", // Red button
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        marginTop: 10,
    },
    retryButtonText: {
        color: "#ffffff",
        fontSize: 16,
        fontWeight: "bold",
    },
});

export default styles;
