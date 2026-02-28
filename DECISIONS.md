# Decisiones de Arquitectura y Tecnología

## 1. ¿Por qué elegí estas librerías?

### Express.js
Elegí Express por su madurez y ecosistema. Es el framework HTTP más utilizado en Node.js, con documentación extensa y compatibilidad garantizada con todas las librerías del stack. Alternativas como Fastify serían más performantes, pero Express reduce la curva de aprendizaje y es más predecible para una prueba técnica donde la claridad del código importa tanto como el rendimiento.

### Prisma ORM
Prisma fue elegido sobre raw SQL (`pg`) o TypeORM por tres razones concretas:

1. **Seguridad out-of-the-box:** Todas las queries son parametrizadas automáticamente, eliminando SQL injection sin esfuerzo adicional.
2. **Tipado generado automáticamente:** Al correr `prisma generate`, se generan tipos TypeScript del modelo `User` directamente desde el schema. No hay sincronización manual entre tipos y base de datos.
3. **Migraciones como código:** El historial de `prisma/migrations/` es reproducible y versionable, lo que facilita el onboarding de nuevos desarrolladores.

La desventaja de Prisma es que oculta el SQL, lo que puede ser un problema en queries complejas o de alto rendimiento. Para esta escala de proyecto, no es una limitación relevante.

### bcryptjs
bcrypt es el estándar de la industria para hashing de contraseñas. Elegí `bcryptjs` (implementación JavaScript pura) sobre `bcrypt` (bindings nativos C++) porque:
- No requiere compilación nativa, lo que simplifica el proceso de instalación en cualquier OS.
- El rendimiento es suficiente para la carga esperada.
- El cost factor de 12 rounds (~250ms por hash) es el equilibrio recomendado por OWASP entre seguridad y experiencia de usuario.

### jsonwebtoken
La librería estándar para JWT en Node.js. Elegí JWT sobre sessions por su naturaleza stateless: el servidor no necesita almacenar estado de sesión, lo que facilita la escalabilidad horizontal.

El payload incluye `userId`, `email` y `role` para que el middleware pueda tomar decisiones de autorización sin consultar la base de datos en cada request.

### Joi
Joi fue elegido sobre `express-validator` o `zod` por su API declarativa y legible. La definición de un schema Joi describe exactamente qué se espera del input, y los mensajes de error personalizados en español se configuran de forma centralizada en el mismo schema. Esto evita tener lógica de validación dispersa en los controladores.

---

## 2. Arquitectura elegida: Controller → Service → Repository

### Por qué esta separación

**Controller (capa HTTP):**
Solo conoce `Request` y `Response`. Su única responsabilidad es extraer datos del request, llamar al servicio apropiado, y devolver la respuesta HTTP. No contiene lógica de negocio.

**Service (lógica de negocio):**
No conoce Express. Contiene las reglas del dominio: "no se pueden registrar dos usuarios con el mismo email", "las credenciales inválidas devuelven el mismo mensaje para email y password". Al estar desacoplado de HTTP, es testeable de forma unitaria sin necesidad de mocks de Express.

**Repository (acceso a datos):**
Es el único módulo que importa Prisma. Si en el futuro se cambia de Prisma a TypeORM o a raw SQL, solo se reescribe esta capa. La regla más importante: `password: false` en todos los `select` excepto en `findByEmailWithPassword`, garantizando que el hash nunca aparezca en respuestas.

Esta separación facilita:
- **Testing:** cada capa se puede testear de forma aislada.
- **Mantenimiento:** un cambio de ORM no afecta a controllers ni services.
- **Escalabilidad del código:** agregar nuevas entidades sigue el mismo patrón.

---

## 3. Decisiones de seguridad

### Error vago en login
`authService.login` devuelve `'Credenciales inválidas'` tanto si el email no existe como si la contraseña es incorrecta. Esto previene *user enumeration attacks*, donde un atacante podría determinar si un email está registrado basándose en el mensaje de error.

### password excluido a nivel de query
El campo `password` se excluye con `select: { password: false }` directamente en Prisma, no en la serialización. Esto es más seguro que filtrar el campo en el controlador, ya que el hash nunca llega a la capa de aplicación.

### Fail-fast en variables de entorno
`src/config/env.ts` valida que `DATABASE_URL` y `JWT_SECRET` existan al arrancar el servidor. Si faltan, el servidor no inicia. Esto previene errores silenciosos en producción.

---

## 4. ¿Qué desafíos enfrenté?

### Tipado de Request con usuario autenticado
Express no incluye en su tipo `Request` un campo `user`. Tuve que crear la interfaz `AuthRequest` que extiende `Request` y declarar el campo `user?: JwtPayload`. El casting necesario en las rutas (`as (req: AuthRequest, ...) => void`) es un tradeoff: mantiene la seguridad de tipos sin requerir augmentación global del namespace de Express.

### Route shadowing en /users/me vs /:id
En Express, las rutas se evalúan en orden de registro. Si `/:id` se registra antes que `/me`, Express interpreta "me" como un ID de usuario. La solución es registrar `/me` primero en `user.routes.ts`, antes de cualquier ruta parametrizada.

### Prisma select con TypeScript strict
Con `strict: true` en TypeScript, los tipos de retorno de Prisma con `select` son muy específicos. El tipo de retorno de `prisma.user.findUnique({ select: { password: false } })` es diferente al tipo `User` completo. Resolví creando la interfaz `UserResponse` que representa explícitamente el subconjunto de campos seguros.

---

## 5. ¿Qué mejoraría con más tiempo?

### Testing
Agregar tests unitarios para services (mockeando el repository) y tests de integración para los endpoints con una base de datos de prueba. Herramientas: Jest + Supertest.

### Refresh tokens
El JWT actual expira y el usuario debe hacer login nuevamente. Un sistema de refresh tokens permitiría renovar el token sin pedir credenciales, mejorando la experiencia en el frontend.

### Rate limiting
Protección contra ataques de fuerza bruta en `/api/auth/login` con `express-rate-limit`. Configurar un máximo de intentos por IP en un ventana de tiempo.

### Paginación en GET /api/users
El endpoint actual devuelve todos los usuarios. Con grandes volúmenes de datos, se necesita paginación con parámetros `?page=1&limit=10`.

### Logging estructurado
Reemplazar `console.error` por una librería como `winston` o `pino` que permita logs en formato JSON, niveles configurables, y rotación de archivos. Esto es imprescindible en producción.

### Soft delete
En lugar de eliminar usuarios directamente, agregar un campo `deletedAt` y filtrar registros activos en las queries. Permite recuperar datos borrados accidentalmente.

### Variables de entorno tipadas con Zod
Reemplazar la validación manual en `config/env.ts` por `zod` para parsear y tipar el objeto `process.env` de forma más robusta y expresiva.

---

## 6. ¿Cómo escalaría esta solución?

### Escalabilidad horizontal
El uso de JWT stateless permite correr múltiples instancias del servidor detrás de un load balancer sin necesidad de sesiones compartidas. Solo se necesita que todas las instancias compartan el mismo `JWT_SECRET` (vía variables de entorno o un secret manager como AWS Secrets Manager).

### Separación de bases de datos
Para alta carga de lectura, se puede configurar una réplica de lectura de PostgreSQL. El `PrismaClient` admite configuración de múltiples conexiones para separar writes (primary) de reads (replica).

### Caché
Para endpoints de solo lectura frecuentes como `GET /api/users`, se puede agregar Redis como caché con una TTL corta. Esto reduce la carga sobre PostgreSQL en picos de tráfico.

### Microservicios
Si el proyecto crece, la capa de `auth` (registro/login) podría extraerse como un microservicio independiente. El patrón Repository facilita esto, ya que la lógica de negocio está desacoplada del acceso a datos.

### CI/CD
Configurar GitHub Actions para:
1. Ejecutar `tsc --noEmit` en cada pull request.
2. Correr los tests automáticamente.
3. Construir y publicar la imagen Docker al aprobar el PR.
