import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React, { useState } from "react";
import { Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ShowdownView from "../components/ShowdownView";

const SHOWDOWN_URL = "https://play.pokemonshowdown.com/";

export default function Battles() {
    const router = useRouter();
    const [showShowdown, setShowShowdown] = useState(false);

    const handleOpenShowdown = async () => {
        if (Platform.OS === "web") {
            await WebBrowser.openBrowserAsync(SHOWDOWN_URL);
            return;
        }

        setShowShowdown(true);
    };

    if (showShowdown) {
        return <ShowdownView onClose={() => setShowShowdown(false)} />;
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>Pokémon</Text>
                <Text style={styles.description}>
                    Monte seu time e enfrente outros treinadores no Pokémon Showdown.
                </Text>

                <TouchableOpacity
                    style={styles.playButton}
                    onPress={handleOpenShowdown}
                    activeOpacity={0.8}
                >
                    <Text style={styles.playButtonText}>Abrir </Text>
                    <Text style={styles.playButtonCaption}>Batalhas simulador</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                    activeOpacity={0.8}
                >
                    <Text style={styles.backButtonText}>Voltar para a busca</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f5f7",
        padding: 20,
    },
    content: {
        flex: 1,
        justifyContent: "center",
    },
    title: {
        color: "#121214",
        fontSize: 28,
        fontWeight: "bold",
        marginBottom: 12,
        textAlign: "center",
    },
    description: {
        color: "#52525b",
        fontSize: 16,
        lineHeight: 23,
        marginBottom: 28,
        textAlign: "center",
    },
    playButton: {
        alignItems: "center",
        backgroundColor: "#2f6fed",
        borderRadius: 8,
        padding: 16,
    },
    playButtonText: {
        color: "#fff",
        fontSize: 17,
        fontWeight: "bold",
    },
    playButtonCaption: {
        color: "#dce7ff",
        fontSize: 12,
        marginTop: 5,
    },
    backButton: {
        alignItems: "center",
        borderColor: "#c4c4c8",
        borderRadius: 8,
        borderWidth: 1,
        marginTop: 14,
        padding: 14,
    },
    backButtonText: {
        color: "#323238",
        fontSize: 15,
        fontWeight: "600",
    },
});
