export interface PokemonListItem {
  name: string;
  url: string;
}

export interface PokemonListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: PokemonListItem[];
}

export interface PokemonStat {
  base_stat: number;
  stat: { name: string };
}

export interface PokemonDetail {
  id: number;
  name: string;
  sprites: {
    front_default: string;
  };
  stats: PokemonStat[];
  types: { type: { name: string } }[];
}

export interface Favorite {
  id: number;
  pokemonApiId: number;
  name: string;
  image: string;
  types: string[];
  stats: Record<string, unknown>;
  notes: string | null;
  userId: number;
  createdAt: string;
}

export interface CreateFavoriteDto {
  pokemonApiId: number;
  notes?: string;
}

export interface UpdateFavoriteDto {
  notes?: string;
}
