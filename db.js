import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
    connectionString: "postgresql://postgres:hOVPbvvtjgAFPqoowcXCdxkckemgSDyO@maglev.proxy.rlwy.net:30043/railway",
});

export default pool;