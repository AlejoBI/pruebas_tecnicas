import { getPokemonDetail } from "../api/pokemon";
import { useState, useEffect } from "react";

interface PokemonCardProps {
  name: string;
  url: string;
  isFavorite: boolean;
  onToggleFavorite: (pokemonApiId: number) => void;
}

export function PokemonCard({
  name,
  isFavorite,
  onToggleFavorite,
}: PokemonCardProps) {
  const [sprite, setSprite] = useState("");
  const [pokemonId, setPokemonId] = useState(0);

  useEffect(() => {
    getPokemonDetail(name).then((data) => {
      setSprite(data.sprites.front_default);
      setPokemonId(data.id);
    });
  }, [name]);

  return (
    <div className="bg-gray-900 rounded-lg p-4 flex flex-col items-center gap-2">
      <img src={sprite} alt={name} className="w-24 h-24" />
      <p className="text-white capitalize">{name}</p>
      <button
        onClick={() => onToggleFavorite(pokemonId)}
        className={`text-2xl ${isFavorite ? "text-red-500" : "text-gray-500"}`}
      >
        {isFavorite ? "♥" : "♡"}
      </button>
    </div>
  );
}
