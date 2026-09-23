import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";

type ShowdownViewProps = {
    onClose: () => void;
};

export default function ShowdownView({ onClose }: ShowdownViewProps) {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Pokémon Showdown</Text>
                <TouchableOpacity onPress={onClose} activeOpacity={0.8}>
                    <Text style={styles.backButton}>Voltar</Text>
                </TouchableOpacity>
            </View>
            <WebView
                source={{ uri: "https://play.pokemonshowdown.com/" }}
                style={styles.webView}
                originWhitelist={["*"]}
                startInLoadingState
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f5f7",
    },
    header: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    title: {
        color: "#121214",
        fontSize: 20,
        fontWeight: "bold",
    },
    backButton: {
        color: "#2f6fed",
        fontSize: 16,
        fontWeight: "600",
    },
    webView: {
        flex: 1,
    },
});