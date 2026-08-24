# 🧪 Prueba Técnica: Sistema de Gestión de Pokémon

## 📋 Información General

**Duración:** 4-6 horas  
**Nivel:** Desarrolladores Mod Level  
**Stack:** React (Frontend) + NestJS/C# (Backend)  
**Integración:** Pokémon API

---

## 🎯 Objetivos

- Evaluar habilidades en React con TypeScript
- Evaluar competencias en NestJS o C# para backend
- Medir capacidad de integración con APIs externas
- Valorar buenas prácticas de código, arquitectura y testing

---

## 🛠️ Stack Tecnológico

### Frontend
- **Framework:** React 18+ con TypeScript
- **State Management:** Context API o Redux Toolkit
- **Routing:** React Router v6+
- **Styling:** CSS Modules, Styled Components o TailwindCSS
- **HTTP Client:** Axios o Fetch API
- **Formularios:** React Hook Form o Formik

### Backend (Elegir una opción)

#### Opción 1: NestJS
- **Framework:** NestJS con TypeScript
- **ORM:** TypeORM o Prisma
- **Base de datos:** PostgreSQL/MySQL/SQLite
- **Autenticación:** JWT
- **Validación:** class-validator

#### Opción 2: C#
- **Framework:** ASP.NET Core Web API
- **ORM:** Entity Framework Core
- **Base de datos:** SQL Server/PostgreSQL
- **Autenticación:** JWT Bearer
- **Mapeo:** AutoMapper
- **Validación:** FluentValidation

---

## 📝 Requisitos Funcionales

### Parte 1: Backend API

#### 1. Autenticación
```
POST   /auth/register    - Registro de nuevo usuario
POST   /auth/login       - Login y obtener token JWT
```

#### 2. CRUD Pokémon Favoritos
```
GET    /pokemon          - Listar pokémon favoritos (paginado)
GET    /pokemon/:id      - Obtener detalle de pokémon favorito
POST   /pokemon          - Agregar pokémon a favoritos
PUT    /pokemon/:id      - Actualizar notas/comentarios
DELETE /pokemon/:id      - Eliminar de favoritos
```

#### 3. Integración con Pokémon API
- Consumir: `https://pokeapi.co/api/v2/pokemon/`
- Cachear: id, nombre, imagen, tipos, estadísticas básicas
- Implementar paginación (límite: 20 por página)

---

### Parte 2: Frontend React

#### Páginas Requeridas
1. **Login/Register** - Autenticación de usuarios
2. **Dashboard** - Lista de pokémon favoritos
3. **Pokemon Detail** - Vista detallada con información
4. **Add/Edit Pokemon** - Formulario para gestionar favoritos

#### Funcionalidades
- ✅ Sistema de autenticación con persistencia (localStorage/sessionStorage)
- ✅ CRUD completo interactuando con la API backend
- ✅ Búsqueda y filtrado por nombre/tipo
- ✅ Validación de formularios
- ✅ Manejo de loading states y errores
- ✅ Diseño responsive (mobile-first)
- ✅ Notificaciones/feedback al usuario

---

## 📊 Criterios de Evaluación (100 puntos)

### Backend (50 puntos)

| Criterio | Puntos | Descripción |
|----------|--------|-------------|
| **Arquitectura** | 10 | Estructura clara, separación de capas, patrones de diseño |
| **Calidad Código** | 10 | Nomenclatura, comentarios, manejo de errores, TypeScript bien usado |
| **Funcionalidad** | 15 | Endpoints completos, validación, seguridad (JWT, hashing) |
| **Integración API** | 10 | Consumo correcto Pokémon API, caché, paginación |
| **Documentación** | 5 | README claro, variables de entorno, ejemplos de uso |

### Frontend (50 puntos)

| Criterio | Puntos | Descripción |
|----------|--------|-------------|
| **Arquitectura React** | 10 | Componentes bien estructurados, hooks, state management |
| **UI/UX** | 10 | Diseño limpio, responsive, feedback visual adecuado |
| **Funcionalidad** | 15 | CRUD completo, validaciones, manejo errores |
| **Calidad Código** | 10 | TypeScript, código reutilizable, buenas prácticas |
| **Performance** | 5 | Optimización renders, manejo eficiente datos |

---

## 🎁 Bonus Points (Opcional)

| Feature | Puntos |
|---------|--------|
| Tests unitarios/integración | +5 |
| Configuración Docker | +3 |
| Implementación CI/CD básico | +3 |
| Feature adicional (ej: comparación pokémon) | +5 |
| TypeScript strict mode | +2 |
| Error boundaries (React) | +2 |

---

## 📦 Entregables

1. **Repositorio Git** con:
   - Todo el código fuente
   - Commits significativos y organizados
   - Branches si aplica

2. **README.md** incluyendo:
   - Instrucciones de instalación y ejecución
   - Variables de entorno necesarias
   - Ejemplos de uso de la API
   - Capturas de pantalla de la UI

3. **Postman Collection** con:
   - Todos los endpoints documentados
   - Ejemplos de requests/responses

4. **Demo funcional** (opcional):
   - Deploy en Vercel/Netlify (frontend)
   - Deploy en Railway/Render/Heroku (backend)

---

## 🚀 Setup Inicial

### Backend
```bash
# NestJS
npm install
npm run start:dev

# C#
dotnet restore
dotnet run
```

### Frontend
```bash
npm install
npm run dev
```

---

## 🔍 Preguntas Técnicas para Entrevista

1. ¿Cómo manejarías la concurrencia al actualizar pokémon favoritos?
2. ¿Qué estrategias implementarías para optimizar el rendimiento?
3. ¿Cómo diseñarías el testing para esta aplicación?
4. ¿Qué cambios harías para escalar esta solución a miles de usuarios?
5. ¿Cómo manejarías el rate limiting de la Pokémon API?

---

## 📚 Recursos

- **Pokémon API:** https://pokeapi.co/
- **Documentación React:** https://react.dev/
- **Documentación NestJS:** https://docs.nestjs.com/
- **Documentación ASP.NET Core:** https://learn.microsoft.com/aspnet/core/

---

## ⏰ Timeline Sugerido

| Actividad | Tiempo Estimado |
|-----------|-----------------|
| Setup proyecto | 30 min |
| Backend - Autenticación | 1 hora |
| Backend - CRUD + Integración | 1.5 horas |
| Frontend - Estructura base | 30 min |
| Frontend - Páginas y componentes | 1.5 horas |
| Testing y bug fixing | 45 min |
| Documentación | 30 min |
| **TOTAL** | **5-6 horas** |

---

## ✅ Checklist de Verificación

- [ ] Todos los endpoints funcionales
- [ ] Autenticación JWT implementada
- [ ] CRUD completo operativo
- [ ] Integración con Pokémon API
- [ ] Frontend responsive
- [ ] Manejo de errores en ambos lados
- [ ] README completo y claro
- [ ] Código limpio y bien estructurado
- [ ] TypeScript correctamente tipado
- [ ] Git history organizado
