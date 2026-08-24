import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="flex justify-between items-center p-4 bg-gray-800 text-white">
      <div className="flex gap-4">
        <Link to="/" className="hover:text-blue-400">Pokédex</Link>
        <Link to="/favorites" className="hover:text-blue-400">Favoritos</Link>
      </div>
      <div className="flex gap-4 items-center">
        <span>{user?.name}</span>
        <button onClick={logout} className="text-sm">Salir</button>
      </div>
    </nav>
  );
};
