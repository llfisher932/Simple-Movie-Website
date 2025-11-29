import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

//just connects to the database based on .env
export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});
