# Cheat Sheet - Prueba Técnica Pokémon Manager

## Orden de trabajo (4-6 horas)

```
1. Backend (2h)    → Auth + CRUD + PokéAPI
2. Frontend (2h)   → Login + Browser + Favoritos
3. Infra (1h)      → Docker + CI/CD
4. Docs (30min)    → README + .env.example
5. Extras (30min)  → TypeScript strict + Optimizaciones
```

---

## BACKEND (NestJS)

### Paso 1: Setup (15 min)

```bash
# Crear proyecto
npx @nestjs/cli new backend --package-manager npm
cd backend

# Instalar dependencias
npm install @nestjs/config @nestjs/typeorm typeorm mysql2
npm install @nestjs/jwt @nestjs/passport passport passport-jwt
npm install bcryptjs class-validator class-transformer axios
npm install @nestjs/cache-manager cache-manager
npm install -D @types/bcryptjs @types/passport-jwt
```

### Paso 2: Configuración (.env)

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=pokemon_user
DB_PASS=pokemon_password
DB_NAME=pokemon_db
JWT_SECRET=tu_secreto_aqui
JWT_EXPIRES=3600
CORS_ORIGIN=http://localhost:5173
```

### Paso 3: User Entity

```typescript
// src/users/users.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  password: string;

  @CreateDateColumn()
  createdAt: Date;
}
```

### Paso 4: Auth Service

```typescript
// src/auth/auth.service.ts
import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.services';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(email: string, password: string, name: string) {
    const existing = await this.usersService.findByEmail(email);
    if (existing) throw new ConflictException('Email ya registrado');

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.usersService.create({ email, password: hashedPassword, name });
    const token = this.generateToken(user);
    return { user: this.sanitizeUser(user), access_token: token };
  }

  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Credenciales inválidas');

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new UnauthorizedException('Credenciales inválidas');

    const token = this.generateToken(user);
    return { user: this.sanitizeUser(user), access_token: token };
  }

  private generateToken(user: any) {
    return this.jwtService.sign({ sub: user.id, email: user.email });
  }

  private sanitizeUser(user: any) {
    const { password, ...result } = user;
    return result;
  }
}
```

### Paso 5: Pokemon Entity

```typescript
// src/pokemon/pokemon.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('pokemon_favorites')
export class Pokemon {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  pokemonApiId: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 500 })
  image: string;

  @Column({ type: 'json' })
  types: string[];

  @Column({ type: 'json' })
  stats: Record<string, number>;

  @Column({ type: 'varchar', length: 500, nullable: true })
  notes: string;

  @Column({ type: 'int' })
  userId: number;

  @CreateDateColumn()
  createdAt: Date;
}
```

### Paso 6: Pokemon Service con caché

```typescript
// src/pokemon/pokemon.service.ts
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from '@nestjs/cache-manager';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';
import { Pokemon } from './pokemon.entity';
import { CreatePokemonDto } from './dto/create-pokemon.dto';

@Injectable()
export class PokemonService {
  constructor(
    @InjectRepository(Pokemon)
    private readonly pokemonRepository: Repository<Pokemon>,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
  ) {}

  async findAll(userId: number, page = 1, limit = 20) {
    const [items, total] = await this.pokemonRepository.findAndCount({
      where: { userId },
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async create(dto: CreatePokemonDto, userId: number) {
    const pokeData = await this.fetchFromPokeApi(dto.pokemonApiId);
    const newPokemon = this.pokemonRepository.create({
      pokemonApiId: dto.pokemonApiId,
      name: pokeData.name,
      image: pokeData.image,
      types: pokeData.types,
      stats: pokeData.stats,
      notes: dto.notes || null,
      userId,
    });
    return this.pokemonRepository.save(newPokemon);
  }

  async remove(id: number, userId: number): Promise<void> {
    const pokemon = await this.pokemonRepository.findOne({ where: { id, userId } });
    if (!pokemon) throw new NotFoundException('Pokémon no encontrado');
    await this.pokemonRepository.remove(pokemon);
  }

  private async fetchFromPokeApi(pokeApiId: number) {
    const cacheKey = `pokeapi_${pokeApiId}`;
    const cached = await this.cache.get<any>(cacheKey);
    if (cached) return cached;

    const { data } = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokeApiId}`);
    const pokeData = {
      name: data.name,
      image: data.sprites.other['official-artwork'].front_default || data.sprites.front_default,
      types: data.types.map((t: any) => t.type.name),
      stats: {
        hp: data.stats[0].base_stat,
        attack: data.stats[1].base_stat,
        defense: data.stats[2].base_stat,
        specialAttack: data.stats[3].base_stat,
        specialDefense: data.stats[4].base_stat,
        speed: data.stats[5].base_stat,
      },
    };

    await this.cache.set(cacheKey, pokeData, 300000);
    return pokeData;
  }
}
```

---

## FRONTEND (React + Vite)

### Paso 1: Setup (10 min)

```bash
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install axios react-router-dom
npm install -D tailwindcss @tailwindcss/vite
```

### Paso 2: Tipos

```typescript
// src/types/auth.ts
export interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  access_token: string;
}

// src/types/pokemon.ts
export interface PokemonListItem {
  name: string;
  url: string;
}

export interface PokemonDetail {
  id: number;
  name: string;
  sprites: { front_default: string };
  stats: { base_stat: number; stat: { name: string } }[];
  types: { type: { name: string } }[];
}

export interface Favorite {
  id: number;
  pokemonApiId: number;
  name: string;
  image: string;
  types: string[];
  notes: string | null;
}
```

### Paso 3: API Client con interceptor

```typescript
// src/api/client.ts
import axios from "axios";

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || "";
    const isAuthRoute = url.includes("/auth/login") || url.includes("/auth/register");
    if (error.response?.status === 401 && !isAuthRoute) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default client;
```

### Paso 4: AuthContext

```typescript
// src/contexts/auth-context.ts
import { createContext } from "react";
import type { User } from "../types/auth";

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);
```

```tsx
// src/contexts/AuthContext.tsx
import { useState, useEffect, type ReactNode } from "react";
import client from "../api/client";
import type { User, AuthResponse } from "../types/auth";
import { AuthContext } from "../contexts/auth-context";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [loading, setLoading] = useState<boolean>(() => Boolean(localStorage.getItem("token")));

  useEffect(() => {
    if (!token) return;
    client.get("/auth/profile")
      .then((res) => setUser(res.data))
      .catch(() => { localStorage.removeItem("token"); setToken(null); })
      .finally(() => setLoading(false));
  }, [token]);

  const login = async (email: string, password: string) => {
    const res = await client.post<AuthResponse>("/auth/login", { email, password });
    localStorage.setItem("token", res.data.access_token);
    setToken(res.data.access_token);
    setUser(res.data.user);
  };

  const register = async (email: string, password: string, name: string) => {
    const res = await client.post<AuthResponse>("/auth/register", { email, password, name });
    localStorage.setItem("token", res.data.access_token);
    setToken(res.data.access_token);
    setUser(res.data.user);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
```

### Paso 5: ProtectedRoute

```tsx
// src/components/ProtectedRoute.tsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <p className="text-center mt-10">Cargando...</p>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
```

---

## DOCKER

### docker-compose.yml

```yaml
services:
  mysql:
    image: mysql:8
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: pokemon_db
      MYSQL_USER: pokemon_user
      MYSQL_PASSWORD: pokemon_password
    ports:
      - "3306:3306"

  backend:
    build: ./backend
    ports:
      - "3000:3000"
    depends_on:
      - mysql
    environment:
      NODE_ENV: development
      DB_HOST: mysql
      DB_PORT: 3306
      DB_USER: pokemon_user
      DB_PASS: pokemon_password
      DB_NAME: pokemon_db
      JWT_SECRET: tu_secreto
      CORS_ORIGIN: http://localhost:5173

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
```

### Backend Dockerfile

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY --from=builder /app/dist ./dist
EXPOSE 3000
CMD ["node", "dist/main.js"]
```

### Frontend Dockerfile

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

---

## CONCEPTOS PARA EXPLICAR

### TypeScript Strict Mode

**Qué es:** Opción en `tsconfig.json` que activa todas las verificaciones estrictas del compilador.

```json
{
  "compilerOptions": {
    "strict": true
  }
}
```

**Qué controla:**
- `strictNullChecks` — No puedes asignar `null` a un tipo sin declararlo
- `noImplicitAny` — No puedes usar `any` implícitamente
- `strictFunctionTypes` — Tipos más estrictos en funciones

**Por qué usarlo:** Detecta errores en tiempo de compilación, no en runtime. Código más seguro.

---

### Optimizaciones React

#### React.memo

```tsx
// Sin memo: cada render crea nueva referencia del componente
// Con memo: solo re-renderiza si sus props cambian
export const PokemonCard = memo(({ name, isFavorite }: Props) => {
  return <div>...</div>;
});
```

#### useCallback

```tsx
// Sin useCallback: función nueva en cada render
const toggleFavorite = async (id: number) => { ... };

// Con useCallback: misma referencia de función
const toggleFavorite = useCallback(async (id: number) => {
  // lógica
}, [dependencies]);
```

#### useMemo

```tsx
// Sin useMemo: recalcula en cada render
const filtered = pokemon.filter(p => p.name.includes(search));

// Con useMemo: solo recalcula cuando cambian las dependencias
const filtered = useMemo(
  () => pokemon.filter(p => p.name.includes(search)),
  [pokemon, search]
);
```

**Por qué:** Evita re-renders innecesarios. Mejora performance en listas grandes.

---

### Caché con @nestjs/cache-manager

```typescript
// Buscar en caché
const cached = await this.cache.get('key');
if (cached) return cached;

// Guardar con TTL (5 minutos)
await this.cache.set('key', data, 300000);
```

**Por qué:** Reduce llamadas a APIs externas. PokéAPI se llama una vez cada 5 minutos, no cada vez que un usuario pide el mismo Pokémon.

---

### Migrations vs synchronize

```typescript
// database.config.ts — Patrón correcto
synchronize: process.env.NODE_ENV !== 'production', // true en dev, false en prod

// synchronize: true — Crea/modifica tablas automáticamente (solo para desarrollo)
// synchronize: false — En producción, usar migrations
// Migration — Archivo .ts con SQL explícito (recomendado para producción)
```

**Por qué:** En producción, synchronize puede borrar datos. Las migraciones son controladas y reversibles.

---

### JWT Auth Flow

```
1. Usuario envía email + password → POST /auth/login
2. Backend valida credenciales → retorna { user, access_token }
3. Frontend guarda token en localStorage
4. Cada petición envía header: Authorization: Bearer <token>
5. JwtAuthGuard valida el token en cada endpoint protegido
```

---

### Interceptor de Axios (Frontend)

```typescript
// Request: agrega token a cada petición
client.interceptors.request.use((config) => {
  config.headers.Authorization = `Bearer ${localStorage.getItem("token")}`;
  return config;
});

// Response: si 401, redirige a login (excepto en auth routes)
client.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 && !isAuthRoute) {
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
```

---

### CORS

```typescript
// Backend: habilitar CORS
app.enableCors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
});
```

**Por qué:** Sin CORS, el navegador bloquea peticiones del frontend (puerto 5173) al backend (puerto 3000).

---

### Lazy Initializer

```tsx
// Sin lazy initializer: loading = true siempre al recargar
const [loading, setLoading] = useState(true);

// Con lazy initializer: loading = true solo si hay token en localStorage
const [loading, setLoading] = useState(() => Boolean(localStorage.getItem("token")));
```

**Por qué:** Evita mostrar "Cargando..." innecesariamente cuando no hay sesión.

---

### Cancelación de Effects

```tsx
useEffect(() => {
  let cancelled = false;

  fetchData().then((data) => {
    if (!cancelled) setData(data);  // No actualizar si el componente ya se desmontó
  });

  return () => { cancelled = true; };  // Cleanup
}, []);
```

**Por qué:** Evita "Can't perform a React state update on an unmounted component".

---

## PREGUNTAS DE ENTREVISTA (resumen rápido)

| Pregunta | Respuesta clave |
|----------|-----------------|
| Concurrencia | Cada usuario tiene sus favoritos (userId). Para producción: optimistic locking + transacciones |
| Rendimiento | Caché (cache-manager), memo, useCallback, paginación |
| Testing | Jest+Supertest (backend), Vitest+RTL (frontend), unit/integration/e2e |
| Escalabilidad | Redis, PostgreSQL, rate limiting, lazy loading, CDN |
| Rate limiting PokéAPI | Caché (5min TTL), cola con Bull, retry con backoff, fallback |

---

## CHECKLIST RÁPIDO PARA LA PRUEBA

```
□ Backend
  □ NestJS scaffold
  □ Config con .env + validación
  □ User entity + Auth (register/login/JWT)
  □ Pokemon entity + CRUD
  □ PokéAPI integration + caché
  □ ValidationPipe global
  □ CORS habilitado

□ Frontend
  □ React + Vite + TypeScript
  □ Login + Register
  □ Navegación protegida
  □ Pokédex (browse + search)
  □ Favoritos (CRUD + notas)
  □ Interceptor JWT
  □ Error handling

□ Infra
  □ Docker Compose
  □ CI/CD GitHub Actions
  □ README

□ Extras (si alcanza)
  □ TypeScript strict
  □ Optimizaciones (memo/useCallback/useMemo)
  □ Pantalla detalle
  □ Tests básicos
```

---

## ERRORES COMUNES Y SOLUCIONES

| Error | Solución |
|-------|----------|
| `npm ci` falla en Docker | Cambiar a `npm install` en Dockerfile |
| `process.env` es undefined | ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }) |
| JWT strategy no lee .env | Usar registerAsync en JwtModule |
| CORS blocked | Agregar `app.enableCors()` en main.ts |
| TypeORM sync no funciona | Verificar que DB_HOST sea el nombre del servicio Docker, no localhost |
| `req.user.id` es undefined | Usar `req.user.userId` (el strategy retorna `{ userId: payload.sub }`) |
| Frontend no conecta al backend | Verificar VITE_API_URL=http://localhost:3000 |
