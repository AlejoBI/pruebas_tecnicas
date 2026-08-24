// =============================================================================
// pokemon.service.ts — LÓGICA DE POKÉMON FAVORITOS
// =============================================================================
// CRUD de favoritos + integración con PokéAPI + caché con cache-manager.
//
// CACHÉ (con @nestjs/cache-manager):
// Usamos el sistema de caché oficial de NestJS que internamente usa Keyv.
// Por defecto almacena en memoria (no necesita Redis ni nada externo).
//
// FLUJO DE CACHÉ:
// 1. fetchFromPokeApi() primero busca en this.cache (key: "pokeapi_25")
// 2. Si encuentra → retorna datos sin consultar PokéAPI (respuesta instantánea)
// 3. Si no encuentra → consulta PokéAPI → guarda en caché con TTL de 5 minutos
// =============================================================================

import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from '@nestjs/cache-manager';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';
import { Pokemon } from './pokemon.entity';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';

interface PokeApiData {
  name: string;
  image: string;
  types: string[];
  stats: {
    hp: number;
    attack: number;
    defense: number;
    specialAttack: number;
    specialDefense: number;
    speed: number;
  };
}

@Injectable()
export class PokemonService {
  constructor(
    @InjectRepository(Pokemon)
    private readonly pokemonRepository: Repository<Pokemon>,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
  ) {}

  // ===========================================================================
  // CRUD — Operaciones con la BD
  // ===========================================================================

  async findAll(userId: number, page = 1, limit = 20) {
    const [items, total] = await this.pokemonRepository.findAndCount({
      where: { userId },
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number, userId: number) {
    const pokemon = await this.pokemonRepository.findOne({
      where: { id, userId },
    });

    if (!pokemon) {
      throw new NotFoundException(
        `Pokemon con ID ${id} no encontrado para este usuario`,
      );
    }

    return pokemon;
  }

  async create(dto: CreatePokemonDto, userId: number) {
    const pokeData = await this.fetchFromPokeApi(dto.pokemonApiId);

    const newPokemon = this.pokemonRepository.create({
      pokemonApiId: dto.pokemonApiId,
      name: pokeData.name,
      image: pokeData.image,
      types: pokeData.types,
      stats: pokeData.stats,
      notes: dto.notes || null,
      userId,
    });

    return this.pokemonRepository.save(newPokemon);
  }

  async update(id: number, dto: UpdatePokemonDto, userId: number) {
    const pokemon = await this.findOne(id, userId);
    Object.assign(pokemon, dto);
    return this.pokemonRepository.save(pokemon);
  }

  async remove(id: number, userId: number): Promise<void> {
    const pokemon = await this.findOne(id, userId);
    await this.pokemonRepository.remove(pokemon);
  }

  // ===========================================================================
  // PokéAPI — Consumo de API externa con caché
  // ===========================================================================

  private async fetchFromPokeApi(pokeApiId: number): Promise<PokeApiData> {
    const cacheKey = `pokeapi_${pokeApiId}`;

    // 1. Intentar leer del caché
    const cached = await this.cache.get<PokeApiData>(cacheKey);
    if (cached) {
      return cached;
    }

    // 2. Consultar PokéAPI si no está en caché
    const { data } = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokeApiId}`);

    const pokeData: PokeApiData = {
      name: data.name,
      image:
        data.sprites.other['official-artwork'].front_default ||
        data.sprites.front_default,
      types: data.types.map((t: { type: { name: string } }) => t.type.name),
      stats: {
        hp: data.stats[0].base_stat,
        attack: data.stats[1].base_stat,
        defense: data.stats[2].base_stat,
        specialAttack: data.stats[3].base_stat,
        specialDefense: data.stats[4].base_stat,
        speed: data.stats[5].base_stat,
      },
    };

    // 3. Guardar en caché por 5 minutos (300,000 ms)
    await this.cache.set(cacheKey, pokeData, 300000);

    return pokeData;
  }
}
