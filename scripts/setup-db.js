const { Pool } = require('@vercel/postgres');
const { hash } = require('bcryptjs');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function setup() {
  console.log('🔧 Setting up the database...');

  try {
    // Check if we can connect to the database
    await pool.query('SELECT NOW()');
    console.log('✅ Database connection successful!');

    // Check if the test user exists
    const userResult = await pool.query(
      "SELECT * FROM \"User\" WHERE email = 'test@example.com'"
    );

    if (userResult.rows.length === 0) {
      console.log('📝 Creating test user...');
      
      // Create a test user
      const hashedPassword = await hash('password123', 10);
      await pool.query(
        `INSERT INTO "User" (id, name, email, password, "tokenBalance", "createdAt", "updatedAt") 
         VALUES (gen_random_uuid(), 'Test User', 'test@example.com', $1, 100, NOW(), NOW())`,
        [hashedPassword]
      );
      
      console.log('✅ Test user created successfully!');
    } else {
      console.log('✅ Test user already exists!');
    }

    // Verify the schema
    const tables = await pool.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
    );
    
    console.log('📊 Database tables:');
    tables.rows.forEach(table => {
      console.log(`- ${table.table_name}`);
    });

    console.log('🎉 Database setup complete!');
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

setup(); 