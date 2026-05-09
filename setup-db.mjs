import { Client } from "pg"
import { readFileSync } from "fs"

const sql = readFileSync("./supabase/schema.sql", "utf-8")

async function main() {
  const client = new Client({
    host: "aws-0-eu-west-1.pooler.supabase.com",
    port: 6543,
    user: "postgres.kupzsqdlduvyrzthtpam",
    password: process.env.DB_PASSWORD,
    database: "postgres",
    ssl: { rejectUnauthorized: false },
  })

  try {
    await client.connect()
    console.log("Connected. Running schema...")

    await client.query(sql)
    console.log("Schema applied successfully.")

    const { rows } = await client.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name"
    )
    console.log("Tables:", rows.map((r) => r.table_name).join(", "))

    const { rows: policies } = await client.query(
      "SELECT policyname FROM pg_policies WHERE schemaname = 'public' ORDER BY policyname"
    )
    console.log("Policies:", policies.map((p) => p.policyname).join(", "))

    const { rows: triggers } = await client.query(
      "SELECT trigger_name FROM information_schema.triggers WHERE trigger_schema = 'public'"
    )
    console.log("Triggers:", triggers.map((t) => t.trigger_name).join(", "))
  } catch (err) {
    if (err.code === "42P07" || err.message.includes("already exists")) {
      console.log("Schema already exists, skipping.")
    } else {
      console.error("Error:", err.message)
    }
  } finally {
    await client.end()
  }
}

main()
