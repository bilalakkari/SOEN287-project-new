import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
    connectionString: 'postgresql://postgres:sapassword@localhost:5432/db_soen_287'
});

export default pool;