import { Pool } from 'pg';
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Hash compatible avec Better Auth (scrypt)
async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${salt}:${buf.toString('hex')}`;
}

async function initUsers() {
  try {
    // Vérifier si le test user existe
    const result = await pool.query(
      'SELECT id FROM "user" WHERE email = $1',
      ['test@example.com']
    );

    if (result.rows.length === 0) {
      // Hasher le mot de passe avec scrypt (compatible Better Auth)
      const hashedPassword = await hashPassword('password123');

      // Créer l'utilisateur
      const userResult = await pool.query(
        `INSERT INTO "user" (id, name, email, "emailVerified", "createdAt", "updatedAt", role)
         VALUES (gen_random_uuid(), $1, $2, $3, NOW(), NOW(), $4)
         RETURNING id`,
        ['Test User', 'test@example.com', false, 'admin']
      );

      const userId = userResult.rows[0].id;

      // Créer l'account pour Better Auth
      await pool.query(
        `INSERT INTO account (id, "userId", "accountId", "providerId", password, "createdAt", "updatedAt")
         VALUES (gen_random_uuid(), $1, $2, $3, $4, NOW(), NOW())`,
        [userId, 'test@example.com', 'credential', hashedPassword]
      );

      console.log('✅ Test user créé: test@example.com (admin)');
    } else {
      console.log('✅ Test user déjà existant');
    }
  } catch (error) {
    console.error('❌ Erreur initialisation:', error instanceof Error ? error.message : error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

initUsers();
