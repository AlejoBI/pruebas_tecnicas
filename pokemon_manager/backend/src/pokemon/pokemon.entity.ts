import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('pokemon_favorites')
export class Pokemon {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int' })
  pokemonApiId!: number;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', length: 500 })
  image!: string;

  @Column({ type: 'simple-json' })
  types!: string[];

  @Column({ type: 'simple-json' })
  stats!: object;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  @Column({ type: 'int' })
  userId!: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;
}
