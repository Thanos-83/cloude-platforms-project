import { Pool } from 'pg';

const pool = new Pool({
  user: 'user',
  password: 'password',
  host: 'postgres',
  port: 5432,
  database: 'invoice_db',
});

export default pool;
