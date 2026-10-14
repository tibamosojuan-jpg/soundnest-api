# SoundNest API

API REST de SoundNest, una plataforma web de streaming musical. Desarrollada con Node.js, Express y MySQL como parte del proyecto de Bases de Datos Multimedia de la Universidad de San Buenaventura, sede Bogotá.

## Módulos

| Módulo | Recursos |
|---|---|
| Usuarios y sesión | `/users`, `/sessions` |
| Catálogo | `/genres`, `/artists`, `/albums`, `/songs` |
| Playlists | `/users/:userId/playlists`, `/playlists` |
| Reseñas | `/songs/:songId/reviews`, `/reviews` |
| Reproducciones | `/users/:userId/play-events` |

Todas las rutas usan el prefijo `/api`.

## Requisitos

- Node.js 20.6 o superior
- MySQL 8 o superior

## Instalación

1. Clonar el repositorio e instalar las dependencias:

```bash
git clone https://github.com/tibamosojuan-jpg/soundnest-api.git
cd soundnest-api
npm install
```

2. Crear la base de datos ejecutando en MySQL, en este orden:
   - `database/schema.sql`
   - `database/seed.sql` (datos de prueba)

3. Copiar `.env.example` como `.env` y completar los datos de conexión a MySQL.

4. Iniciar la API:

```bash
npm start
```

La API queda disponible en `http://localhost:3000/api`.

## Documentación

La documentación de los 34 endpoints está en `docs/openapi.yaml` (OpenAPI 3.0) y se puede consultar de dos formas:

- **Interactiva, con la API corriendo:** `http://localhost:3000/api-docs`. Permite ejecutar cada endpoint con el botón *Try it out*.
- **Publicada:** https://tibamosojuan-jpg.github.io/soundnest-api/

## Pruebas

La carpeta `postman/` contiene la colección `soundnest.postman_collection.json` con 80 peticiones que cubren los 34 endpoints, cada uno con al menos un caso de éxito y uno de error. Cada petición verifica automáticamente el código de estado esperado.

Para ejecutarla, cargar de nuevo `schema.sql` y `seed.sql`, iniciar la API e importar la colección en Postman o Thunder Client. Las peticiones deben ejecutarse en orden, porque algunas usan registros creados por las anteriores.

## Usuarios de prueba

| Correo | Contraseña | Rol | Estado |
|---|---|---|---|
| admin@soundnest.com | Admin12345 | admin | activo |
| juan@soundnest.com | Juan12345 | user | activo |
| laura@soundnest.com | Laura12345 | user | activo |
| carlos@soundnest.com | Carlos12345 | user | suspendido |

## Estructura del proyecto

```
src/
├── config/          Conexión a MySQL
├── routes/          URIs y verbos HTTP
├── validators/      Validación de datos de entrada
├── controllers/     Manejo de la petición y la respuesta
├── services/        Reglas de negocio
├── repositories/    Consultas SQL
├── middlewares/     Manejo de errores
├── errors/          Error HTTP personalizado
└── utils/           Paginación, SQL y transacciones
database/
├── schema.sql       Estructura de la base de datos
└── seed.sql         Datos de prueba
docs/
├── openapi.yaml     Documentación OpenAPI de la API
└── index.html       Página de la documentación publicada
postman/
└── soundnest.postman_collection.json   Colección de pruebas
```
