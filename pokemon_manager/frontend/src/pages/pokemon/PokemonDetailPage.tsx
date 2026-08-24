import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPokemonDetail } from "../../api/pokemon";
import client from "../../api/client";
import type { PokemonDetail } from "../../types/pokemon";

const PokemonDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [pokemon, setPokemon] = useState<PokemonDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  const [notes, setNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);

  useEffect(() => {
    if (!id) return;

    getPokemonDetail(id)
      .then((data) => {
        setPokemon(data);
        // Verificar si es favorito
        client
          .get("/pokemon")
          .then((res) => {
            const fav = res.data.items.find(
              (f: { pokemonApiId: number }) => f.pokemonApiId === data.id,
            );
            if (fav) {
              setIsFavorite(true);
              setNotes(fav.notes || "");
            }
          })
          .catch(() => {});
      })
      .catch(() => setError("Error al cargar Pokémon"))
      .finally(() => setLoading(false));
  }, [id]);

  const toggleFavorite = async () => {
    if (!pokemon) return;

    try {
      if (isFavorite) {
        // Buscar y eliminar favorito
        const res = await client.get("/pokemon");
        const fav = res.data.items.find(
          (f: { pokemonApiId: number }) => f.pokemonApiId === pokemon.id,
        );
        if (fav) {
          await client.delete(`/pokemon/${fav.id}`);
          setIsFavorite(false);
          setNotes("");
        }
      } else {
        // Agregar favorito
        await client.post("/pokemon", { pokemonApiId: pokemon.id });
        setIsFavorite(true);
      }
    } catch {
      setError("Error al modificar favorito");
    }
  };

  const saveNotes = async () => {
    if (!pokemon) return;

    setSavingNotes(true);
    try {
      const res = await client.get("/pokemon");
      const fav = res.data.items.find(
        (f: { pokemonApiId: number }) => f.pokemonApiId === pokemon.id,
      );
      if (fav) {
        await client.put(`/pokemon/${fav.id}`, { notes });
      }
    } catch {
      setError("Error al guardar notas");
    } finally {
      setSavingNotes(false);
    }
  };

  if (loading) return <p className="p-6">Cargando...</p>;
  if (error) return <p className="p-6 text-red-500">{error}</p>;
  if (!pokemon) return <p className="p-6">Pokémon no encontrado</p>;

  return (
    <div className="p-6">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 text-blue-500 hover:underline"
      >
        ← Volver
      </button>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="border border-gray-300 rounded-lg p-6 text-center">
          <img
            src={pokemon.sprites.front_default}
            alt={pokemon.name}
            className="w-32 h-32 mx-auto"
          />
          <h1 className="text-2xl font-bold capitalize mt-4">{pokemon.name}</h1>
          <p className="text-gray-500">ID: {pokemon.id}</p>

          <div className="flex justify-center gap-2 mt-4">
            {pokemon.types.map((t) => (
              <span
                key={t.type.name}
                className="bg-gray-200 px-3 py-1 rounded text-sm"
              >
                {t.type.name}
              </span>
            ))}
          </div>

          <button
            onClick={toggleFavorite}
            className={`mt-4 px-4 py-2 rounded ${
              isFavorite ? "bg-red-500 text-white" : "bg-gray-200 text-gray-700"
            }`}
          >
            {isFavorite ? "♥ En favoritos" : "♡ Agregar a favoritos"}
          </button>
        </div>

        <div className="flex-1">
          <h2 className="text-xl font-bold mb-4">Estadísticas</h2>
          <div className="space-y-2">
            {pokemon.stats.map((s) => (
              <div key={s.stat.name} className="flex items-center gap-2">
                <span className="w-32 text-sm capitalize">
                  {s.stat.name.replace("-", " ")}:
                </span>
                <div className="flex-1 bg-gray-200 rounded h-4">
                  <div
                    className="bg-blue-500 h-4 rounded"
                    style={{ width: `${(s.base_stat / 255) * 100}%` }}
                  />
                </div>
                <span className="w-8 text-right text-sm">{s.base_stat}</span>
              </div>
            ))}
          </div>

          {isFavorite && (
            <div className="mt-6">
              <h2 className="text-xl font-bold mb-2">Mis notas</h2>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2"
                rows={3}
                placeholder="Agregar notas sobre este Pokémon..."
              />
              <button
                onClick={saveNotes}
                disabled={savingNotes}
                className="mt-2 bg-green-500 text-white px-4 py-2 rounded disabled:opacity-50"
              >
                {savingNotes ? "Guardando..." : "Guardar notas"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PokemonDetailPage;
