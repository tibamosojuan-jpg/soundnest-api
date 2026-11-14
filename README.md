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

## Frontend

El frontend está en `public/` y lo sirve la misma API. Con `npm start`, la aplicación queda en `http://localhost:3000`.

```
public/
├── index.html, register.html, home.html
├── css/styles.css        Colores, tipografía y componentes del prototipo
├── assets/               Imágenes (fondo de las pantallas de acceso)
└── js/
    ├── config.js         URL de la API y valores configurables
    ├── apiClient.js      Única forma de llamar a la API
    ├── feedback.js       Estados de carga, error, vacío y confirmación
    ├── layout.js         Barra lateral, barra superior y reproductor
    ├── player.js         Reproductor y registro del historial
    ├── session.js        Usuario con sesión iniciada
    └── pages/            Lógica de cada pantalla
```

### Crear una pantalla nueva

1. Crear el HTML con solo la hoja de estilos y su script:

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Canciones | SoundNest</title>
  <link rel="stylesheet" href="/css/styles.css">
</head>
<body>
  <script type="module" src="/js/pages/songs.js"></script>
</body>
</html>
```

2. En `js/pages/`, dibujar la estructura con `renderAppShell` y cargar los datos con `renderAsync`, que ya muestra la carga, el error con botón de reintentar y el mensaje de lista vacía:

```js
import { apiClient } from '../apiClient.js';
import { renderAsync } from '../feedback.js';
import { renderAppShell } from '../layout.js';

const shell = renderAppShell('songs');

if (shell) {
  const container = document.createElement('div');
  shell.pageContent.append(container);

  renderAsync(container, {
    load: async () => (await apiClient.get('/songs')).data.items,
    render: (songs) => { /* devolver el elemento con la lista */ },
    emptyMessage: 'No hay canciones disponibles',
    loadingMessage: 'Cargando canciones...'
  });
}
```

Para las confirmaciones se usa `showToast`, para preguntar antes de eliminar `confirmAction`, y para reproducir una canción `playSong` de `player.js`.

## Contraseñas

Las contraseñas se guardan como hash bcrypt con salt. Para convertir las contraseñas en texto plano que ya existan en la base de datos (por ejemplo, después de ejecutar `seed.sql`):

```bash
npm run migrate:passwords
```

El script solo convierte las que aún no tienen hash, así que se puede ejecutar más de una vez sin dañar nada. Requiere `BCRYPT_SALT_ROUNDS` en el `.env` (ver `.env.example`).
