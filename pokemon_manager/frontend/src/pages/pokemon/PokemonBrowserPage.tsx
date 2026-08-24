import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "../../hooks/useAuth";
import { getPokemonList } from "../../api/pokemon";
import client from "../../api/client";
import { PokemonCard } from "../../components/PokemonCard";
import type { PokemonListItem, Favorite } from "../../types/pokemon";

const PokemonBrowserPage = () => {
  const [pokemon, setPokemon] = useState<PokemonListItem[]>([]);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const { token } = useAuth();

  useEffect(() => {
    getPokemonList(page * 20)
      .then((data) => setPokemon(data.results))
      .catch(() => setError("Error al cargar Pokémon"))
      .finally(() => setLoading(false));
  }, [page]);

  useEffect(() => {
    client
      .get("/pokemon")
      .then((res) => {
        const ids = res.data.items.map((fav: Favorite) => fav.pokemonApiId);
        setFavorites(new Set(ids));
      })
      .catch(() => {});
  }, [token]);

  const toggleFavorite = useCallback(
    async (pokemonApiId: number) => {
      if (favorites.has(pokemonApiId)) {
        try {
          const res = await client.get("/pokemon");
          const fav = res.data.items.find(
            (f: Favorite) => f.pokemonApiId === pokemonApiId,
          );
          if (fav) {
            await client.delete(`/pokemon/${fav.id}`);
            setFavorites((prev) => {
              const next = new Set(prev);
              next.delete(pokemonApiId);
              return next;
            });
          }
        } catch {
          setError("Error al eliminar de favoritos");
        }
      } else {
        try {
          await client.post("/pokemon", { pokemonApiId });
          setFavorites((prev) => new Set(prev).add(pokemonApiId));
        } catch {
          setError("Error al agregar a favoritos");
        }
      }
    },
    [favorites],
  );

  const filtered = useMemo(
    () =>
      pokemon.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase()),
      ),
    [pokemon, search],
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Pokédex</h1>

      <input
        type="text"
        placeholder="Buscar Pokémon..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border border-gray-300 rounded px-3 py-2 mb-4 w-full max-w-sm"
      />

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((p) => (
            <PokemonCard
              key={p.name}
              name={p.name}
              url={p.url}
              isFavorite={favorites.has(
                Number(p.url.split("/").filter(Boolean).pop()),
              )}
              onToggleFavorite={toggleFavorite}
            />
          ))}
        </div>
      )}

      <div className="flex justify-center gap-4 mt-6">
        <button
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          disabled={page === 0}
          className="border border-gray-300 rounded px-4 py-2 disabled:opacity-50"
        >
          ← Anterior
        </button>
        <span className="self-center">Página {page + 1}</span>
        <button
          onClick={() => setPage((p) => p + 1)}
          className="border border-gray-300 rounded px-4 py-2"
        >
          Siguiente →
        </button>
      </div>
    </div>
  );
};

export default PokemonBrowserPage;
