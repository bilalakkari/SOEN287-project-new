import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
    connectionString: " ",
});

export default pool;