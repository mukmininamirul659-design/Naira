import { neon } from "@neondatabase/serverless";

export default async function handler(req, res) {
  res.setHeader(
    "Access-Control-Allow-Origin",
    "https://mukmininamirul659-design.github.io"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "POST, OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const { action, memory, category, importance } = req.body || {};

    const sql = neon(process.env.DATABASE_URL);

    // SAVE MEMORY
    if (action === "save") {
      if (!memory || !memory.trim()) {
        return res.status(400).json({
          error: "Memory kosong."
        });
      }

      await sql.query(
        `INSERT INTO naira_memory
        (memory, category, importance)
        VALUES ($1, $2, $3)`,
        [
          memory.trim(),
          category || "general",
          importance || 1
        ]
      );

      return res.status(200).json({
        success: true,
        message: "Memory berjaya disimpan."
      });
    }

    // SEARCH MEMORY
    if (action === "search") {
      const result = await sql.query(
        `SELECT id, memory, category, importance, created_at
         FROM naira_memory
         ORDER BY importance DESC, created_at DESC
         LIMIT 20`
      );

      return res.status(200).json({
        success: true,
        memories: result
      });
    }

    return res.status(400).json({
      error: "Action tidak sah."
    });

  } catch (error) {
    console.error("Memory error:", error);

    return res.status(500).json({
      error: error.message || "Memory system gagal."
    });
  }
}