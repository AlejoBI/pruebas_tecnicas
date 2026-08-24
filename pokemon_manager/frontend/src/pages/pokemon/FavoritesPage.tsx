import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import client from "../../api/client";
import type { Favorite } from "../../types/pokemon";

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editNotes, setEditNotes] = useState("");

  useEffect(() => {
    let cancelled = false;

    client
      .get(`/pokemon?page=${page}&limit=12`)
      .then((res) => {
        if (!cancelled) {
          setFavorites(res.data.items);
          setTotalPages(res.data.totalPages);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError("Error al cargar favoritos");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [page]);

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    try {
      setLoading(true);
      await client.delete(`/pokemon/${id}`);
      const res = await client.get(`/pokemon?page=${page}&limit=12`);
      setFavorites(res.data.items);
      setTotalPages(res.data.totalPages);
    } catch {
      setError("Error al eliminar");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotes = async (id: number) => {
    try {
      setLoading(true);
      await client.put(`/pokemon/${id}`, { notes: editNotes });
      setEditingId(null);
      const res = await client.get(`/pokemon?page=${page}&limit=12`);
      setFavorites(res.data.items);
      setTotalPages(res.data.totalPages);
    } catch {
      setError("Error al guardar notas");
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (nextPage: number) => {
    setLoading(true);
    setPage(nextPage);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Mis Favoritos</h1>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {loading ? (
        <p>Cargando...</p>
      ) : favorites.length === 0 ? (
        <p className="text-gray-500">No tienes favoritos aún</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {favorites.map((fav) => (
            <Link
              key={fav.id}
              to={`/pokemon/${fav.pokemonApiId}`}
              className="block border border-gray-300 rounded-lg p-4 hover:bg-gray-50"
            >
              <div className="flex items-center gap-3 mb-3">
                <img src={fav.image} alt={fav.name} className="w-12 h-12" />
                <div>
                  <p className="capitalize font-bold">{fav.name}</p>
                  <div className="flex gap-1">
                    {fav.types.map((type) => (
                      <span key={type} className="text-xs bg-gray-200 px-2 py-0.5 rounded">
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {editingId === fav.id ? (
                <div className="flex flex-col gap-2" onClick={(e) => e.preventDefault()}>
                  <textarea
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    className="border border-gray-300 rounded px-2 py-1 text-sm"
                    rows={2}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSaveNotes(fav.id)}
                      className="bg-green-500 text-white px-3 py-1 rounded text-sm"
                    >
                      Guardar
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="bg-gray-300 px-3 py-1 rounded text-sm"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div onClick={(e) => e.preventDefault()}>
                  <p className="text-gray-500 text-sm mb-2">{fav.notes || "Sin notas"}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setEditingId(fav.id); setEditNotes(fav.notes || ""); }}
                      className="text-sm border border-gray-300 rounded px-3 py-1"
                    >
                      Editar
                    </button>
                    <button
                      onClick={(e) => handleDelete(e, fav.id)}
                      className="text-sm text-red-500 border border-red-300 rounded px-3 py-1"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              )}
            </Link>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-4 mt-6">
          <button
            onClick={() => handlePageChange(Math.max(1, page - 1))}
            disabled={page === 1}
            className="border border-gray-300 rounded px-4 py-2 disabled:opacity-50"
          >
            ← Anterior
          </button>
          <span className="self-center">Página {page}</span>
          <button
            onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="border border-gray-300 rounded px-4 py-2 disabled:opacity-50"
          >
            Siguiente →
          </button>
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;
