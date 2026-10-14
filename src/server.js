import app from './app.js';
import pool from './config/database.js';

const port = Number(process.env.PORT);

async function startServer() {
  try {
    await pool.query('SELECT 1');
    app.listen(port, () => {
      console.log(`SoundNest API escuchando en http://localhost:${port}/api`);
    });
  } catch (error) {
    console.error(`No fue posible conectar con la base de datos: ${error.message}`);
    process.exit(1);
  }
}

startServer();
