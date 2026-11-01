import { Pool } from "pg"

const pool = new Pool({
  host: process.env.RDS_HOST!,
  port: parseInt(process.env.RDS_PORT || "5432"),
  database: process.env.RDS_DATABASE || "huddle",
  user: process.env.RDS_USER!,
  password: process.env.RDS_PASSWORD!,
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
})

export { pool }

export async function query(text: string, params?: (string | number | boolean | null | undefined)[]) {
  const client = await pool.connect()
  try {
    return await client.query(text, params)
  } finally {
    client.release()
  }
}
