import Pokemon from "@/src/interface/InterfacePokemon";

class Requests {
    private api_url;
    private image_url;

    constructor() {
        this.api_url = 'https://pokeapi.co/api/v2/pokemon/';
        this.image_url = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/';
    }

    async fetchPokemonList(offset = 0, limit = 20) {
        try {
            const pokemons: Pokemon[] = [];

            const api_response = await fetch(`${this.api_url}?offset=${offset}&limit=${limit}`);

            if (api_response.ok) {
                const jsonData = await api_response.json();
                jsonData.results.forEach((pokemon: any) => {
                    const urlParts = pokemon.url.split('/');
                    const idString = urlParts[urlParts.length - 2];
                    const id = parseInt(idString, 10);
                    pokemons.push({
                        pokemon_name: pokemon.name,
                        pokemon_image: `${this.image_url}${id}.gif`,
                        pokemon_id: id
                    });
                });

                return pokemons;
            }
        } catch (error) {
            console.error(`[service/Requests] Erro ao fazer requisição à API. ${error}`);
        }
    }

    async fetchPokemonData(pokemon_name: string) {
        try {
            const normalized_name = pokemon_name.toLowerCase().trim();
            const pokemon = {
                pokemon_name: '',
                pokemon_id: 0,
                pokemon_image: '',
                description: '',
                stats: [] as { name: string; value: number }[],
                types: [] as string[],
                weight: 0,
                height: 0,
                abilities: [] as string[],
                evolution_chain: [] as Array<{ name: string; image: string; id: number }>
            };
            const api_response = await fetch(`${this.api_url}${normalized_name}`);

            if (api_response.ok) {
                const pokemon_info = await api_response.json();
                pokemon.pokemon_name = pokemon_info.name;
                pokemon.pokemon_id = pokemon_info.id;
                pokemon.pokemon_image = `${this.image_url}${pokemon.pokemon_id}.gif`;
                pokemon.types = pokemon_info.types.map((t: any) => t.type.name);
                pokemon.stats = pokemon_info.stats.map((s: any) => ({
                    name: s.stat.name,
                    value: s.base_stat
                }));
                pokemon.height = pokemon_info.height / 10;
                pokemon.weight = pokemon_info.weight / 10;
                pokemon.abilities = pokemon_info.abilities.map((ability: any) => ability.ability.name);

                try {
                    const species_response = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemon.pokemon_id}`);
                    if (species_response.ok) {
                        const species_data = await species_response.json();
                        let entry = species_data.flavor_text_entries.find((e: any) => e.language.name === 'pt-BR' || e.language.name === 'pt');
                        if (!entry) {
                            entry = species_data.flavor_text_entries.find((e: any) => e.language.name === 'en');
                        }
                        if (entry) {
                            pokemon.description = entry.flavor_text.replace(/[\s\f\n\r]+/g, ' ').trim();
                        }

                        if (species_data.evolution_chain?.url) {
                            const evolution_response = await fetch(species_data.evolution_chain.url);
                            if (evolution_response.ok) {
                                const evolution_data = await evolution_response.json();
                                const collectChain = (chain: any): any[] => {
                                    const list: any[] = [{
                                        name: chain.species.name,
                                        id: Number(chain.species.url.split('/').filter(Boolean).pop()),
                                        image: `${this.image_url}${Number(chain.species.url.split('/').filter(Boolean).pop())}.gif`
                                    }];

                                    if (chain.evolves_to && chain.evolves_to.length > 0) {
                                        chain.evolves_to.forEach((next: any) => {
                                            list.push(...collectChain(next));
                                        });
                                    }

                                    return list;
                                };

                                pokemon.evolution_chain = collectChain(evolution_data.chain);
                            }
                        }
                    }
                } catch (species_error) {
                    console.error(`[service/Requests] Erro ao obter descrição ou evolução: ${species_error}`);
                }

                return pokemon;
            }

            console.log('Não foi possível obter os dados do Pokémon.');
            return;
        } catch (error) {
            console.error(`[service/Requests] Erro ao fazer requisição à API. ${error}`);
        }
    }
}

export default new Requests;