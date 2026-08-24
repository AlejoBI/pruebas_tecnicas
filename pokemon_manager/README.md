# Prueba Técnica: Sistema de Gestión de Pokémon

Sistema full-stack de gestión de Pokémon favoritos con autenticación JWT,
integración con PokéAPI y despliegue con Docker.

---

## Stack Tecnológico

### Frontend
- **Framework:** React 19 + TypeScript 6
- **Bundler:** Vite 8
- **State Management:** React Context API
- **Routing:** React Router DOM 7
- **Styling:** TailwindCSS v4
- **HTTP Client:** Axios

### Backend
- **Framework:** NestJS 11 + TypeScript
- **ORM:** TypeORM 1.1
- **Base de datos:** MySQL (via Docker)
- **Autenticación:** JWT + Passport
- **Validación:** class-validator + class-transformer
- **Caché:** @nestjs/cache-manager

### Infraestructura
- **Contenedores:** Docker + Docker Compose
- **CI/CD:** GitHub Actions
- **Servidor web:** Nginx (producción)

---

## Requisitos de la Prueba - Estado

### Backend (50 puntos)

| Criterio | Puntos | Estado | Detalle |
|----------|--------|--------|---------|
| Arquitectura | 10 | ✅ | Estructura modular: auth, users, pokemon, common, config |
| Calidad Código | 10 | ✅ | TypeScript estricto, decoradores personalizados, comentarios |
| Funcionalidad | 15 | ✅ | CRUD completo, JWT, validación, hashing bcrypt |
| Integración API | 10 | ✅ | PokéAPI con caché 5min, paginación |
| Documentación | 5 | ✅ | Este README, .env.example, screenshots |

### Frontend (50 puntos)

| Criterio | Puntos | Estado | Detalle |
|----------|--------|--------|---------|
| Arquitectura React | 10 | ✅ | Componentes, hooks, context, separación de capas |
| UI/UX | 10 | ✅ | TailwindCSS, responsive, loading states, feedback |
| Funcionalidad | 15 | ✅ | CRUD completo, validaciones, manejo de errores |
| Calidad Código | 10 | ✅ | TypeScript, código reutilizable, interceptores |
| Performance | 5 | ✅ | lazy initializer, cancelled flag en effects |

### Bonus Points

| Feature | Puntos | Estado |
|---------|--------|--------|
| Tests unitarios/integración | +5 | ⬜ Pendiente |
| Configuración Docker | +3 | ✅ |
| CI/CD básico | +3 | ✅ |
| Feature adicional | +5 | ⬜ Pendiente |
| TypeScript strict mode | +2 | ✅ |
| Error boundaries | +2 | ⬜ Pendiente |

---

## Pré-requisitos

- Node.js 20+
- Docker + Docker Compose
- Git

---

## Instalación y Ejecución

### 1. Levantar base de datos

```bash
docker-compose up -d mysql
```

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env
npm run migration:run
npm run start:dev
```

El backend corre en `http://localhost:3000`.

### 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

El frontend corre en `http://localhost:5173`.

### Todo junto (Docker)

```bash
docker-compose up --build
```

- Frontend: `http://localhost`
- Backend: `http://localhost:3000`
- MySQL: `localhost:3306`

---

## Variables de Entorno

### Backend (.env)

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

### Frontend (.env)

```env
VITE_API_URL=http://localhost:3000
```

---

## API Endpoints

### Auth

| Método | Ruta | Auth | Descripción | Body |
|--------|------|------|-------------|------|
| POST | `/auth/register` | No | Registrar usuario | `{ name, email, password }` |
| POST | `/auth/login` | No | Iniciar sesión | `{ email, password }` |
| GET | `/auth/profile` | Sí | Obtener perfil | - |

### Pokemon (Favoritos)

| Método | Ruta | Auth | Descripción | Body |
|--------|------|------|-------------|------|
| GET | `/pokemon?page=1&limit=20` | Sí | Listar favoritos | - |
| GET | `/pokemon/:id` | Sí | Obtener un favorito | - |
| POST | `/pokemon` | Sí | Agregar a favoritos | `{ pokemonApiId, notes? }` |
| PUT | `/pokemon/:id` | Sí | Actualizar notas | `{ notes }` |
| DELETE | `/pokemon/:id` | Sí | Eliminar favorito | - |

### Ejemplos de Uso

**Registrar usuario:**
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name": "Ash", "email": "ash@pokemon.com", "password": "123456"}'
```

**Login:**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "ash@pokemon.com", "password": "123456"}'
```

**Agregar favorito:**
```bash
curl -X POST http://localhost:3000/pokemon \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"pokemonApiId": 25}'
```

**Listar favoritos:**
```bash
curl http://localhost:3000/pokemon?page=1&limit=20 \
  -H "Authorization: Bearer <token>"
```

---

## Arquitectura

```
pokemon_manager/
├── backend/
│   └── src/
│       ├── auth/           # JWT + register/login/profile
│       ├── common/         # @UserId decorator personalizado
│       ├── config/         # Validación de env + database config
│       ├── migrations/     # Migraciones de TypeORM
│       ├── pokemon/        # CRUD favoritos + PokéAPI + cache
│       └── users/          # Entidad de usuarios
├── frontend/
│   └── src/
│       ├── api/            # Clientes axios (backend + PokéAPI)
│       ├── components/     # Navbar, ProtectedRoute, PokemonCard
│       ├── contexts/       # AuthContext (estado de autenticación)
│       ├── hooks/          # useAuth custom hook
│       ├── pages/          # Login, Register, Pokédex, Favoritos
│       └── types/          # Definiciones TypeScript por dominio
├── .github/workflows/      # CI pipeline (lint + build)
├── docker-compose.yml      # MySQL + Backend + Frontend
└── README.md
```

---

## Decisiones Técnicas

| Decisión | Razón |
|----------|-------|
| React Context vs Redux | Scope del proyecto, simplicidad |
| axios directo vs HttpModule | Bug conocido NestJS v11 + axios v4 |
| @nestjs/cache-manager vs Map | Patrón oficial NestJS |
| Migrations vs synchronize | Producción, control de versiones de BD |
| Nginx en Docker | Estándar de la industria para React SPA |
| UserId decorator | Extracción type-safe, reutilizable |
| CORS configurable | Flexible para desarrollo y producción |

---

## Scripts Disponibles

### Backend

| Comando | Descripción |
|---------|-------------|
| `npm run start:dev` | Desarrollo con hot-reload |
| `npm run build` | Compilar para producción |
| `npm run lint` | Verificar código con ESLint |
| `npm run test` | Ejecutar tests con Jest |
| `npm run migration:run` | Ejecutar migraciones |
| `npm run migration:generate` | Generar nueva migración |

### Frontend

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Desarrollo con Vite |
| `npm run build` | Compilar para producción |
| `npm run lint` | Verificar código con ESLint |

---

## CI/CD

GitHub Actions ejecuta automáticamente en cada push a `main`:

1. **Backend:** `npm ci` → `lint` → `build`
2. **Frontend:** `npm ci` → `lint` → `build`

Si alguno falla, el pipeline se marca como fallido.
