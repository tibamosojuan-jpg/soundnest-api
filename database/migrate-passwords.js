import pool from '../src/config/database.js';
import { hashPassword, isPasswordHash } from '../src/utils/passwordHasher.js';

async function findPlainTextPasswords(connection) {
  const [users] = await connection.query('SELECT id, password FROM users FOR UPDATE');
  return users.filter((user) => !isPasswordHash(user.password));
}

async function migratePasswords() {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();
    const pendingUsers = await findPlainTextPasswords(connection);

    for (const user of pendingUsers) {
      const passwordHash = await hashPassword(user.password);
      await connection.query('UPDATE users SET password = ? WHERE id = ?', [passwordHash, user.id]);
    }

    await connection.commit();
    console.log(`Contraseñas migradas a hash: ${pendingUsers.length}`);
  } catch (error) {
    await connection.rollback();
    console.error(`La migración se canceló y no se modificó ningún usuario: ${error.message}`);
    process.exitCode = 1;
  } finally {
    connection.release();
    await pool.end();
  }
}

migratePasswords();
