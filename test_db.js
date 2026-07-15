const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:admin1234EEE34AS@db.juszgfczxecdpfnddwka.supabase.co:5432/postgres',
});

async function main() {
  try {
    await client.connect();
    const res = await client.query('SELECT tablename FROM pg_tables WHERE schemaname = $1', ['public']);
    console.log("Tables in public schema:");
    res.rows.forEach(r => console.log(r.tablename));
    
    // Check users
    const users = await client.query('SELECT * FROM "User"');
    console.log("Users count:", users.rows.length);
  } catch (e) {
    console.error("DB Error:", e);
  } finally {
    await client.end();
  }
}

main();
