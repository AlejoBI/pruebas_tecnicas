import { useState, useEffect } from "react";
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

  const handleDelete = async (id: number) => {
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
      <h1 className="text-3xl font-bold text-white mb-6">Mis Favoritos</h1>
      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      {loading ? (
        <p className="text-white">Cargando...</p>
      ) : favorites.length === 0 ? (
        <p className="text-gray-400">No tienes favoritos aún</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {favorites.map((fav) => (
            <div key={fav.id} className="bg-gray-900 rounded-lg p-4">
              <div className="flex items-center gap-4 mb-3">
                <img src={fav.image} alt={fav.name} className="w-16 h-16" />
                <div>
                  <p className="text-white capitalize font-bold">{fav.name}</p>
                  <div className="flex gap-2 mt-1">
                    {fav.types.map((type) => (
                      <span
                        key={type}
                        className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded"
                      >
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              {editingId === fav.id ? (
                <div className="flex flex-col gap-2">
                  <textarea
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    className="bg-gray-800 text-white p-2 rounded text-sm"
                    rows={2}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSaveNotes(fav.id)}
                      className="bg-green-600 text-white px-3 py-1 rounded text-sm"
                    >
                      Guardar
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="bg-gray-700 text-white px-3 py-1 rounded text-sm"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-gray-400 text-sm mb-3">
                    {fav.notes || "Sin notas"}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingId(fav.id);
                        setEditNotes(fav.notes || "");
                      }}
                      className="bg-gray-700 text-white px-3 py-1 rounded text-sm"
                    >
                      Editar notas
                    </button>
                    <button
                      onClick={() => handleDelete(fav.id)}
                      className="bg-red-600 text-white px-3 py-1 rounded text-sm"
                    >
                      Eliminar
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
      {totalPages > 1 && (
        <div className="flex justify-center gap-4 mt-6">
          <button
            onClick={() => handlePageChange(Math.max(1, page - 1))}
            disabled={page === 1}
            className="bg-gray-700 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            ← Anterior
          </button>
          <span className="text-white self-center">Página {page}</span>
          <button
            onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="bg-gray-700 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            Siguiente →
          </button>
        </div>
      )}
    </div>
  );
};
export default FavoritesPage;
