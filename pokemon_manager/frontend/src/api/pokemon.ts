import axios from "axios";
import type { PokemonListResponse, PokemonDetail } from "../types/pokemon";

const POKEAPI = axios.create({
  baseURL: "https://pokeapi.co/api/v2",
});

export async function getPokemonList(offset: number, limit = 20) {
  const { data } = await POKEAPI.get<PokemonListResponse>(
    `/pokemon?limit=${limit}&offset=${offset}`,
  );
  return data;
}

export async function getPokemonDetail(nameOrId: string | number) {
  const { data } = await POKEAPI.get<PokemonDetail>(`/pokemon/${nameOrId}`);
  return data;
}
