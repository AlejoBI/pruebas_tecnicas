# Preguntas Técnicas - Respuestas

## 1. ¿Cómo manejarías la concurrencia al actualizar pokémon favoritos?

### Situación actual
Cada usuario solo puede ver y modificar sus propios favoritos (filtado por `userId` en cada consulta). Esto significa que dos usuarios diferentes no interfieren entre sí.

### Problema potencial
Si el mismo usuario abre múltiples pestañas y modifica el mismo favorito simultáneamente, podría haber conflictos.

### Solución implementada
```typescript
// El filtro por userId aísla los datos de cada usuario
async findOne(id: number, userId: number) {
  const pokemon = await this.pokemonRepository.findOne({
    where: { id, userId },  // Solo busca en favoritos del usuario actual
  });
}
```

### Mejora para producción
- **Optimistic Locking**: Agregar una columna `version` a la entity y verificar que no cambió antes de guardar
- **Transacciones explícitas**: Usar `QueryRunner` para operaciones críticas
- **Cola de operaciones**: Usar Redis + Bull para serializar actualizaciones del mismo registro

---

## 2. ¿Qué estrategias implementarías para optimizar el rendimiento?

### Backend
| Estrategia | Implementación |
|------------|----------------|
| Caché de API externa | `@nestjs/cache-manager` con TTL de 5 minutos para PokéAPI |
| Paginación | `findAndCount()` con `skip` y `take` para no cargar todo de golpe |
| Mínimo round-trips | Una sola consulta para obtener datos + total de registros |

### Frontend
| Estrategia | Implementación |
|------------|----------------|
| Lazy initializer | `useState(() => Boolean(localStorage.getItem("token")))` evita render innecesario |
| Cancelación de effects | `cancelled` flag en useEffect para evitar updates en componentes desmontados |
| Búsqueda local | Filtra en memoria sin llamar a la API en cada tecla |
| Memoización pendiente | `React.memo` en PokemonCard, `useMemo` para lista filtrada |

### Ejemplo de caché
```typescript
// Primero busca en caché (respuesta instantánea)
const cached = await this.cache.get<PokeApiData>(cacheKey);
if (cached) return cached;

// Si no está, consulta PokéAPI y guarda por 5 minutos
const { data } = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokeApiId}`);
await this.cache.set(cacheKey, pokeData, 300000);
```

---

## 3. ¿Cómo diseñarías el testing para esta aplicación?

### Backend (Jest + Supertest)

| Nivel | Qué testear | Ejemplo |
|-------|-------------|---------|
| **Unit** | Servicios aislados | `AuthService.login()` retorna token, `PokemonService.create()` guarda en BD |
| **Integration** | Endpoints completos | POST /auth/login con credenciales válidas/inválidas |
| **E2E** | Flujo completo | Registrar → Login → Agregar favorito → Verificar en BD |

```typescript
// Ejemplo: Test unitario de AuthService
describe('AuthService', () => {
  it('deberíahashear el password al registrar', async () => {
    const user = await authService.register('test@email.com', 'password123', 'Test');
    expect(user.password).not.toBe('password123'); // Nunca guardar plain text
  });
});
```

### Frontend (Vitest + React Testing Library)

| Nivel | Qué testear | Ejemplo |
|-------|-------------|---------|
| **Unit** | Hooks | `useAuth()` retorna login/logout correctly |
| **Component** | UI básica | `LoginPage` muestra error con credenciales inválidas |
| **Integration** | Flujos | Login → Navegación a página protegida |

```typescript
// Ejemplo: Test de componente
test('muestra error con credenciales inválidas', async () => {
  render(<LoginPage />);
  fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'wrong@email.com' } });
  fireEvent.change(screen.getByPlaceholderText('Contraseña'), { target: { value: 'wrong' } });
  fireEvent.click(screen.getByText('Iniciar sesión'));
  expect(await screen.findByText('Error al iniciar sesión')).toBeInTheDocument();
});
```

---

## 4. ¿Qué cambios harías para escalar esta solución a miles de usuarios?

### Infraestructura
| Cambio | Por qué |
|--------|---------|
| **PostgreSQL** | Mejor manejo de concurrencia que MySQL |
| **Redis** | Caché distribuido (no solo en memoria de una instancia) |
| **Kubernetes** | Auto-escalado horizontal según carga |
| **Load Balancer** | Distribuir tráfico entre múltiples instancias del backend |

### Backend
| Cambio | Por qué |
|--------|---------|
| **Rate limiting** | `@nestjs/throttler` para evitar abuso |
| **Colas** | Bull + Redis para procesar tareas pesadas async |
| **Connection pooling** | Reutilizar conexiones a BD |
| **Compresión gzip** | Reducir tamaño de respuestas HTTP |

### Frontend
| Cambio | Por qué |
|--------|---------|
| **Lazy loading** | `React.lazy()` para cargar rutas bajo demanda |
| **Paggination infinita** | En vez de paginación tradicional |
| **Service Worker** | caché de assets estáticos offline |
| **CDN** | Servir assets desde ubicación geográfica cercana al usuario |

### Base de datos
```sql
-- Índices para queries frecuentes
CREATE INDEX idx_pokemon_user ON pokemon_favorites(user_id);
CREATE INDEX idx_pokemon_api ON pokemon_favorites(pokemon_api_id);
```

---

## 5. ¿Cómo manejarías el rate limiting de la Pokémon API?

### Estrategia actual: Caché
```typescript
// Cada Pokémon se cachea por 5 minutos
// Si 1000 usuarios piden a Bulbasurur, solo se hace 1 llamada a PokéAPI
await this.cache.set(cacheKey, pokeData, 300000);
```

### Estrategias adicionales

| Estrategia | Implementación |
|------------|----------------|
| **Cola de peticiones** | Bull + Redis para serializar llamadas (máx 5/segundo) |
| **Retry con backoff** | Si PokéAPI devuelve 429, esperar 1s, 2s, 4s... antes de reintentar |
| **Fallback** | Si PokéAPI está caído, mostrar datos en caché o mensaje de error |
| **Pre-caching** | Cargar los 151 Pokémon iniciales en background al iniciar el servidor |

### Ejemplo de retry con backoff
```typescript
async fetchWithRetry(url: string, retries = 3): Promise<any> {
  try {
    const { data } = await axios.get(url);
    return data;
  } catch (error) {
    if (retries > 0 && error.response?.status === 429) {
      const delay = Math.pow(2, 4 - retries) * 1000; // 1s, 2s, 4s
      await new Promise(resolve => setTimeout(resolve, delay));
      return this.fetchWithRetry(url, retries - 1);
    }
    throw error;
  }
}
```

### Monitoreo
- Loggear cuántas llamadas se hacen a PokéAPI por minuto
- Alertar si se acerca al límite (100 requests/segundo en PokéAPI)
- Dashboard con métricas de caché hit/miss ratio

---

## Notas adicionales

### Decisiones técnicas justificadas
| Decisión | Alternativa descartada | Razón |
|----------|----------------------|-------|
| React Context | Redux Toolkit | Más simple para un proyecto de este tamaño |
| TypeORM migrations | synchronize:true | Más seguro para producción |
| @nestjs/cache-manager | Map manual | Solución oficial de NestJS, más mantenible |
| axios directo | HttpModule | Bug de resolución en NestJS v11 + axios v4 |
| JWT en localStorage | cookies | Más simple de implementar, suficiente para demo |

### Lo que haría diferente con más tiempo
1. **Tests completos** - Cubrir 80%+ de código con tests unitarios
2. **Error boundaries** - Manejar errores de React gracefully
3. **Storybook** - Documentar componentes visualmente
4. **CI/CD pipeline** - Deploy automático a producción
5. **Monitoring** - Sentry para errores, Analytics para uso
