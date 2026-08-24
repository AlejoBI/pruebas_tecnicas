import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { ProtectedRoute } from "./components/ProtectedRoute";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import PokemonBrowserPage from "./pages/pokemon/PokemonBrowserPage";
import FavoritesPage from "./pages/pokemon/FavoritesPage";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Publicas */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protegidas */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Navbar />
              <PokemonBrowserPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/favorites"
          element={
            <ProtectedRoute>
              <Navbar />
              <FavoritesPage />
            </ProtectedRoute>
          }
        />

        {/* Redirección por defecto */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
