import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
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
    stats?: { name: string; value: number }[];
    weight?: number;
    height?: number;
    abilities?: string[];
    evolution_chain?: Array<{ name: string; image: string; id: number }>;
};

const formatStatName = (statName: string) => {
    const labels: Record<string, string> = {
        hp: "HP",
        attack: "ATK",
        defense: "DEF",
        "special-attack": "Sp. Atk",
        "special-defense": "Sp. Def",
        speed: "SPD"
    };

    return labels[statName] || statName.replace(/-/g, " ").toUpperCase();
};

type PokemonListItem = {
    pokemon_name: string;
    pokemon_id: number;
    pokemon_image: string;
};

export default function PokemonSearch() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [pokemon, setPokemon] = useState<PokemonData | null>(null);
    const [allPokemonList, setAllPokemonList] = useState<PokemonListItem[]>([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [pageInput, setPageInput] = useState("1");
    const [activeFilter, setActiveFilter] = useState<string | null>(null);

    const filterOptions = [
        { label: "Todos", value: "all" },
        { label: "Mega", value: "mega" },
        { label: "Lendário", value: "legendary" },
        { label: "Mítico", value: "mythical" },
        { label: "Gen 1", value: "gen1" },
        { label: "Gen 2", value: "gen2" },
    ];

    const getFilteredPokemonList = (items: PokemonListItem[]) => {
        if (!activeFilter || activeFilter === "all") return items;

        if (activeFilter === "mega") {
            return items.filter((item) => item.pokemon_name.includes("mega"));
        }

        if (activeFilter === "legendary") {
            return items.filter((item) => item.pokemon_id >= 144 && item.pokemon_id <= 151);
        }

        if (activeFilter === "mythical") {
            return items.filter((item) => item.pokemon_id >= 151 && item.pokemon_id <= 161);
        }

        if (activeFilter === "gen1") {
            return items.filter((item) => item.pokemon_id <= 151);
        }

        if (activeFilter === "gen2") {
            return items.filter((item) => item.pokemon_id > 151 && item.pokemon_id <= 251);
        }

        return items;
    };

    const loadPokemonPage = async (page: number) => {
        const safePage = Math.max(0, page);
        setLoading(true);
        setErrorMsg("");

        try {
            const result = await PokemonRequests.fetchPokemonList(0, 1025);
            const normalizedList = (result ?? [])
                .filter((item): item is Required<typeof item> => typeof item.pokemon_id === "number")
                .map((item) => ({
                    pokemon_name: item.pokemon_name,
                    pokemon_id: item.pokemon_id,
                    pokemon_image: item.pokemon_image,
                }));

            setAllPokemonList(normalizedList);
            const filteredList = getFilteredPokemonList(normalizedList);
            const totalPages = Math.max(1, Math.ceil(filteredList.length / 20));
            const clampedPage = Math.min(safePage, totalPages - 1);

            setCurrentPage(clampedPage);
            setPageInput(String(clampedPage + 1));
        } catch (error) {
            setErrorMsg("Erro ao carregar a lista de Pokémon.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handlePageJump = () => {
        const parsedPage = Number(pageInput) - 1;
        const filteredList = getFilteredPokemonList(allPokemonList);
        const totalPages = Math.max(1, Math.ceil(filteredList.length / 20));

        if (!Number.isInteger(parsedPage) || parsedPage < 0) {
            setErrorMsg("Digite um número de página válido.");
            return;
        }

        if (parsedPage >= totalPages) {
            setErrorMsg(`A página máxima para este filtro é ${totalPages}.`);
            return;
        }

        setCurrentPage(parsedPage);
        setPageInput(String(parsedPage + 1));
    };

    useEffect(() => {
        loadPokemonPage(0);
    }, []);

    useEffect(() => {
        const filteredList = getFilteredPokemonList(allPokemonList);
        const totalPages = Math.max(1, Math.ceil(filteredList.length / 20));
        const safeCurrentPage = Math.min(currentPage, totalPages - 1);

        if (safeCurrentPage !== currentPage) {
            setCurrentPage(safeCurrentPage);
            setPageInput(String(safeCurrentPage + 1));
        }
    }, [activeFilter, allPokemonList]);

    const handleSearch = async (value?: string) => {
        const query = (value ?? searchQuery).trim();

        if (!query) return;

        setLoading(true);
        setErrorMsg("");
        setPokemon(null);
        Keyboard.dismiss();

        try {
            const result = await PokemonRequests.fetchPokemonData(query);

            if (result) {
                console.log("=========================================");
                console.log("POKÉMON ENCONTRADO!");
                console.log(`- Nome: ${result.pokemon_name}`);
                console.log(`- ID: ${result.pokemon_id}`);
                console.log(`- URL da Imagem: ${result.pokemon_image}`);
                console.log(`- Tipagem: ${result.types.join(", ")}`);
                console.log(`- Descrição: ${result.description || "Nenhuma descrição encontrada."}`);
                console.log(`- Peso: ${result.weight ?? "N/A"} kg`);
                console.log(`- Altura: ${result.height ?? "N/A"} m`);
                console.log(`- Habilidades: ${result.abilities?.join(", ") || "Nenhuma habilidade disponível."}`);
                console.log(`- Estatísticas: ${result.stats?.map((stat) => `${formatStatName(stat.name)}: ${stat.value}`).join(" | ") || "Nenhuma estatística encontrada."}`);
                console.log(`- Evolução: ${result.evolution_chain?.map((step) => step.name).join(" -> ") || "Sem cadeia de evolução."}`);
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

    const handleRandomPokemon = async () => {
        const randomId = Math.floor(Math.random() * 1025) + 1;
        await handleSearch(String(randomId));
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
                    onSubmitEditing={() => handleSearch(searchQuery)}
                />

                {/* Botão de busca */}
                <View style={styles.buttonRow}>
                    <TouchableOpacity style={[styles.button, styles.primaryButton]} onPress={() => handleSearch()} activeOpacity={0.8}>
                        <Text style={styles.buttonText}>Buscar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={handleRandomPokemon} activeOpacity={0.8}>
                        <Text style={styles.buttonText}>Aleatório</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={styles.showdownButton}
                    onPress={() => router.push("/battles")}
                    activeOpacity={0.8}
                >
                    <Text style={styles.showdownButtonText}>Lista de Pokémon</Text>
                    {/* <Text style={styles.showdownButtonCaption}>Abrir página de batalhas</Text> */}
                </TouchableOpacity>

                {errorMsg ? <Text style={{ color: "red", marginTop: 10 }}>{errorMsg}</Text> : null}

                {loading && <ActivityIndicator size="large" color="#CC0000" style={{ marginTop: 24 }} />}

                {allPokemonList.length > 0 && !pokemon && !loading && (
                    <View style={styles.listSection}>
                        {/* <Text style={styles.sectionTitle}>Lista de Pokémon</Text> */}

                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
                            {filterOptions.map((option) => (
                                <TouchableOpacity
                                    key={option.value}
                                    style={[styles.filterButton, activeFilter === option.value && styles.filterButtonActive]}
                                    onPress={() => {
                                        setActiveFilter(option.value);
                                        setCurrentPage(0);
                                        setPageInput("1");
                                    }}
                                >
                                    <Text style={[styles.filterButtonText, activeFilter === option.value && styles.filterButtonTextActive]}>{option.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        <View style={styles.listGrid}>
                            {(() => {
                                const filteredList = getFilteredPokemonList(allPokemonList);
                                const startIndex = currentPage * 20;
                                const paginatedList = filteredList.slice(startIndex, startIndex + 20);

                                if (paginatedList.length === 0) {
                                    return (
                                        <Text style={styles.emptyFilterText}>
                                            Nenhum Pokémon encontrado para este filtro.
                                        </Text>
                                    );
                                }

                                return paginatedList.map((item) => (
                                    <TouchableOpacity
                                        key={item.pokemon_id}
                                        style={styles.listItem}
                                        onPress={() => handleSearch(item.pokemon_name)}
                                        activeOpacity={0.8}
                                    >
                                        <Image source={{ uri: item.pokemon_image }} style={styles.listImage} resizeMode="contain" />
                                        <Text style={styles.listItemName}>
                                            #{String(item.pokemon_id).padStart(3, "0")} {item.pokemon_name}
                                        </Text>
                                    </TouchableOpacity>
                                ));
                            })()}
                        </View>

                        <View style={styles.paginationRow}>
                            <TouchableOpacity
                                style={[styles.pageButton, currentPage === 0 && styles.pageButtonDisabled]}
                                onPress={() => currentPage > 0 && setCurrentPage((prev) => prev - 1)}
                                disabled={currentPage === 0}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.pageButtonText}>Anterior</Text>
                            </TouchableOpacity>

                            <View style={styles.pageJumpRow}>
                                <TextInput
                                    style={styles.pageInput}
                                    value={pageInput}
                                    onChangeText={setPageInput}
                                    keyboardType="numeric"
                                    placeholder="Página"
                                    placeholderTextColor="#8d8d99"
                                    onSubmitEditing={handlePageJump}
                                />
                                <TouchableOpacity style={styles.goButton} onPress={handlePageJump} activeOpacity={0.8}>
                                    <Text style={styles.goButtonText}>Ir</Text>
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity
                                style={styles.pageButton}
                                onPress={() => {
                                    const filteredList = getFilteredPokemonList(allPokemonList);
                                    const totalPages = Math.max(1, Math.ceil(filteredList.length / 20));
                                    if (currentPage + 1 < totalPages) {
                                        setCurrentPage((prev) => prev + 1);
                                        setPageInput(String(currentPage + 2));
                                    }
                                }}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.pageButtonText}>Próxima</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {/* Exibir as informações aqui */}
                {pokemon && !loading && (
                    <View style={styles.card}>
                        <TouchableOpacity style={styles.backButton} onPress={() => setPokemon(null)} activeOpacity={0.8}>
                            <Text style={styles.backButtonText}>Voltar para lista</Text>
                        </TouchableOpacity>

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

                        <View style={styles.infoBlock}>
                            <Text style={styles.infoLabel}>Peso</Text>
                            <Text style={styles.infoText}>
                                {pokemon.weight != null ? `${pokemon.weight.toFixed(1)} kg` : "Peso não disponível"}
                            </Text>
                        </View>

                        <View style={styles.infoBlock}>
                            <Text style={styles.infoLabel}>Altura</Text>
                            <Text style={styles.infoText}>
                                {pokemon.height != null ? `${pokemon.height.toFixed(1)} m` : "Altura não disponível"}
                            </Text>
                        </View>

                        <View style={styles.infoBlock}>
                            <Text style={styles.infoLabel}>Habilidades</Text>
                            <View style={styles.abilitiesRow}>
                                {pokemon.abilities && pokemon.abilities.length > 0 ? (
                                    pokemon.abilities.map((ability) => (
                                        <View key={ability} style={styles.typeBadge}>
                                            <Text style={styles.typeText}>{ability}</Text>
                                        </View>
                                    ))
                                ) : (
                                    <Text style={styles.infoText}>Habilidades não disponíveis</Text>
                                )}
                            </View>
                        </View>

                        <View style={styles.infoBlock}>
                            <Text style={styles.infoLabel}>Status</Text>
                            <View style={styles.statsList}>
                                {pokemon.stats && pokemon.stats.length > 0 ? (
                                    pokemon.stats.map((stat) => (
                                        <View key={stat.name} style={styles.statRow}>
                                            <Text style={styles.statName}>{formatStatName(stat.name)}</Text>
                                            <Text style={styles.statValue}>{stat.value}</Text>
                                        </View>
                                    ))
                                ) : (
                                    <Text style={styles.infoText}>Status não disponíveis</Text>
                                )}
                            </View>
                        </View>

                        <View style={styles.infoBlock}>
                            <Text style={styles.infoLabel}>Evoluções</Text>
                            <View style={styles.evolutionRow}>
                                {pokemon.evolution_chain && pokemon.evolution_chain.length > 0 ? (
                                    pokemon.evolution_chain.map((stage) => (
                                        <View key={`${stage.id}-${stage.name}`} style={styles.evolutionCard}>
                                            <Image
                                                source={{ uri: stage.image }}
                                                style={styles.evolutionImage}
                                                resizeMode="contain"
                                            />
                                            <Text style={styles.evolutionName}>{stage.name}</Text>
                                        </View>
                                    ))
                                ) : (
                                    <Text style={styles.infoText}>Sem evolução disponível</Text>
                                )}
                            </View>
                        </View>
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
    buttonRow: {
        flexDirection: "row",
        gap: 10,
        marginBottom: 12,
    },
    button: {
        flex: 1,
        borderRadius: 6,
        padding: 16,
        alignItems: "center",
    },
    primaryButton: {
        backgroundColor: "#CC0000",
    },
    secondaryButton: {
        backgroundColor: "#323238",
    },
    buttonText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16,
    },
    showdownButton: {
        backgroundColor: "#CC0000",
        borderRadius: 6,
        padding: 14,
        marginBottom: 8,
        alignItems: "center",
    },
    showdownButtonText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16,
    },
    showdownButtonCaption: {
        color: "#dce7ff",
        fontSize: 12,
        marginTop: 4,
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
    infoBlock: {
        width: "100%",
        marginTop: 14,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: "#c4c4c8",
    },
    infoLabel: {
        fontSize: 12,
        fontWeight: "700",
        color: "#8d8d99",
        textTransform: "uppercase",
        marginBottom: 4,
    },
    infoText: {
        fontSize: 15,
        color: "#121214",
        fontWeight: "600",
    },
    abilitiesRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginTop: 6,
    },
    statsList: {
        width: "100%",
        marginTop: 8,
    },
    statRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 6,
        borderBottomWidth: 1,
        borderBottomColor: "#d4d4d8",
    },
    statName: {
        fontSize: 14,
        color: "#323238",
        fontWeight: "600",
        textTransform: "capitalize",
    },
    statValue: {
        fontSize: 14,
        color: "#121214",
        fontWeight: "700",
    },
    evolutionRow: {
        width: "100%",
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: 10,
        marginTop: 8,
    },
    evolutionCard: {
        alignItems: "center",
        padding: 8,
        borderRadius: 8,
        backgroundColor: "#f5f5f5",
        minWidth: 80,
    },
    evolutionImage: {
        width: 60,
        height: 60,
    },
    evolutionName: {
        fontSize: 12,
        color: "#121214",
        fontWeight: "600",
        textTransform: "capitalize",
        marginTop: 4,
    },
    listSection: {
        marginTop: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "700",
        marginBottom: 12,
    },
    filterScroll: {
        marginBottom: 12,
    },
    filterButton: {
        backgroundColor: "#e1e1e6",
        borderRadius: 999,
        paddingHorizontal: 14,
        paddingVertical: 8,
        marginRight: 8,
        borderWidth: 1,
        borderColor: "#d4d4d8",
    },
    filterButtonActive: {
        backgroundColor: "#CC0000",
        borderColor: "#CC0000",
    },
    filterButtonText: {
        color: "#323238",
        fontSize: 12,
        fontWeight: "700",
    },
    filterButtonTextActive: {
        color: "#fff",
    },
    emptyFilterText: {
        color: "#323238",
        fontSize: 14,
        textAlign: "center",
        marginTop: 12,
    },
    listGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        gap: 10,
    },
    listItem: {
        width: "48%",
        backgroundColor: "#f3f3f5",
        borderRadius: 10,
        padding: 10,
        alignItems: "center",
        marginBottom: 10,
    },
    listImage: {
        width: 70,
        height: 70,
        marginBottom: 8,
    },
    listItemName: {
        fontSize: 12,
        color: "#121214",
        fontWeight: "600",
        textAlign: "center",
        textTransform: "capitalize",
    },
    paginationRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 18,
        marginBottom: 8,
        gap: 8,
    },
    pageButton: {
        backgroundColor: "#CC0000",
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 8,
    },
    pageButtonDisabled: {
        backgroundColor: "#d0d0d7",
    },
    pageButtonText: {
        color: "#fff",
        fontWeight: "700",
        fontSize: 12,
    },
    pageJumpRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    pageInput: {
        width: 60,
        backgroundColor: "#fff",
        borderRadius: 6,
        borderWidth: 1,
        borderColor: "#c4c4c8",
        paddingHorizontal: 8,
        paddingVertical: 8,
        textAlign: "center",
        fontWeight: "600",
        color: "#121214",
    },
    goButton: {
        backgroundColor: "#323238",
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderRadius: 6,
    },
    goButtonText: {
        color: "#fff",
        fontSize: 12,
        fontWeight: "700",
    },
    pageText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#323238",
    },
    backButton: {
        alignSelf: "flex-start",
        backgroundColor: "#323238",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        marginBottom: 12,
    },
    backButtonText: {
        color: "#fff",
        fontSize: 12,
        fontWeight: "700",
    },
});