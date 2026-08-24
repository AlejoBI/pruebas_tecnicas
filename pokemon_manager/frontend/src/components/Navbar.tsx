import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-gray-900 text-white">
      <div className="flex gap-6">
        <Link to="/" className="text-lg font-bold hover:text-blue-400">
          Pokédex
        </Link>
        <Link to="/favorites" className="hover:text-blue-400">
          Favoritos
        </Link>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-300">{user?.name}</span>
        <button
          onClick={logout}
          className="px-3 py-1 text-sm bg-red-600 rounded hover:bg-red-700"
        >
          Cerrar sesión
        </button>
      </div>
    </nav>
  );
};
