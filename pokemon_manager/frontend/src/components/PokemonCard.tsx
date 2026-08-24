import { getPokemonDetail } from "../api/pokemon";
import { useState, useEffect, memo } from "react";
import { Link } from "react-router-dom";

interface PokemonCardProps {
  name: string;
  url: string;
  isFavorite: boolean;
  onToggleFavorite: (pokemonApiId: number) => void;
}

export const PokemonCard = memo(
  ({ name, isFavorite, onToggleFavorite }: PokemonCardProps) => {
    const [sprite, setSprite] = useState("");
    const [pokemonId, setPokemonId] = useState(0);

    useEffect(() => {
      getPokemonDetail(name).then((data) => {
        setSprite(data.sprites.front_default);
        setPokemonId(data.id);
      });
    }, [name]);

    return (
      <Link
        to={`/pokemon/${pokemonId}`}
        className="block border border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50"
      >
        <img src={sprite} alt={name} className="w-16 h-16 mx-auto" />
        <p className="capitalize mt-2">{name}</p>
        <button
          onClick={(e) => {
            e.preventDefault();
            onToggleFavorite(pokemonId);
          }}
          className={`text-2xl mt-2 ${isFavorite ? "text-red-500" : "text-gray-400"}`}
        >
          {isFavorite ? "♥" : "♡"}
        </button>
      </Link>
    );
  },
);
