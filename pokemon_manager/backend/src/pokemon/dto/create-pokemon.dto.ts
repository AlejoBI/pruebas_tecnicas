import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreatePokemonDto {
  @IsNumber()
  @Min(1)
  pokemonApiId!: number;

  @IsString()
  @IsOptional()
  notes?: string;
}
