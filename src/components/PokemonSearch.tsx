import React, { useState } from "react";
import {
    ActivityIndicator,
    Image,
    Keyboard,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import PokemonRequests from "../services/PokemonRequests";

type PokemonData = {
    pokemon_name: string;
    pokemon_id: number;
    pokemon_image: string;
    types: string[];
    description?: string;
};

export default function PokemonSearch() {
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [pokemon, setPokemon] = useState<PokemonData | null>(null);

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;

        setLoading(true);
        setErrorMsg("");
        setPokemon(null);
        Keyboard.dismiss();

        try {
            const result = await PokemonRequests.fetchPokemonData(searchQuery);

            if (result) {
                console.log("=========================================");
                console.log("POKÉMON ENCONTRADO!");
                console.log(`- Nome: ${result.pokemon_name}`);
                console.log(`- ID: ${result.pokemon_id}`);
                console.log(`- URL da Imagem: ${result.pokemon_image}`);
                console.log(`- Tipagem: ${result.types.join(", ")}`);
                console.log(`- Descrição: ${result.description || "Nenhuma descrição encontrada."}`);
                console.log("=========================================");

                setPokemon(result);
                setSearchQuery("");
            } else {
                setErrorMsg("Pokémon não encontrado. Verifique o nome ou número.");
            }
        } catch (error) {
            setErrorMsg("Erro ao buscar o Pokémon. Tente novamente.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, padding: 20 }}>
            <ScrollView>
                <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 10 }}>PokéSearch 🔍</Text>

                <Text style={{ marginBottom: 20 }}>
                    Atividade Avaliativa: busque um Pokémon pelo nome ou número.
                </Text>

                <TextInput
                    style={styles.input}
                    placeholder="Digite o nome ou ID (ex: bulbasaur ou 1)"
                    placeholderTextColor="#8d8d99"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    autoCapitalize="none"
                    autoCorrect={false}
                    onSubmitEditing={handleSearch}
                />

                {/* Botão de busca */}
                <TouchableOpacity style={styles.button} onPress={handleSearch} activeOpacity={0.8}>
                    <Text style={styles.buttonText}>Buscar</Text>
                </TouchableOpacity>

                {errorMsg ? <Text style={{ color: "red", marginTop: 10 }}>{errorMsg}</Text> : null}

                {loading && <ActivityIndicator size="large" color="#CC0000" style={{ marginTop: 24 }} />}

                {/* Exibir as informações aqui */}
                {pokemon && !loading && (
                    <View style={styles.card}>
                        <Image
                            source={{ uri: pokemon.pokemon_image }}
                            style={styles.sprite}
                            resizeMode="contain"
                        />
                        <Text style={styles.pokeName}>
                            {pokemon.pokemon_name.charAt(0).toUpperCase() + pokemon.pokemon_name.slice(1)}
                        </Text>
                        <Text style={styles.pokeId}>#{String(pokemon.pokemon_id).padStart(3, "0")}</Text>
                        <View style={styles.typesRow}>
                            {pokemon.types.map((type) => (
                                <View key={type} style={styles.typeBadge}>
                                    <Text style={styles.typeText}>{type}</Text>
                                </View>
                            ))}
                        </View>
                        <Text style={styles.description}>
                            {pokemon.description || "Sem descrição disponível."}
                        </Text>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    input: {
        backgroundColor: "#e1e1e6",
        color: "#121214",
        fontSize: 16,
        borderRadius: 6,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#323238",
    },
    button: {
        backgroundColor: "#CC0000",
        borderRadius: 6,
        padding: 16,
        alignItems: "center",
        marginBottom: 12,
    },
    buttonText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16,
    },
    card: {
        backgroundColor: "#e1e1e6",
        borderRadius: 10,
        padding: 20,
        marginTop: 20,
        alignItems: "center",
    },
    sprite: {
        width: 150,
        height: 150,
    },
    pokeName: {
        fontSize: 22,
        fontWeight: "bold",
        marginTop: 8,
    },
    pokeId: {
        fontSize: 14,
        color: "#8d8d99",
        marginBottom: 10,
    },
    typesRow: {
        flexDirection: "row",
        gap: 8,
        marginBottom: 12,
    },
    typeBadge: {
        backgroundColor: "#323238",
        paddingVertical: 4,
        paddingHorizontal: 14,
        borderRadius: 99,
    },
    typeText: {
        color: "#fff",
        fontSize: 12,
        fontWeight: "600",
        textTransform: "capitalize",
    },
    description: {
        fontSize: 13,
        color: "#323238",
        lineHeight: 20,
        textAlign: "center",
        marginTop: 8,
    },
});