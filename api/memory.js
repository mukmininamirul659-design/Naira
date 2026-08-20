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
    const {
      action,
      id,
      memory,
      category,
      subcategory,
      importance
    } = req.body || {};
    const sql =
      neon(process.env.DATABASE_URL);
    /* ================================
       SAVE MEMORY
    ================================= */
    if (action === "save") {
      if (
        !memory ||
        !memory.trim()
      ) {
        return res.status(400).json({
          error: "Memory kosong."
        });
      }
      const result =
        await sql.query(
          `INSERT INTO naira_memory
          (
            memory,
            category,
            subcategory,
            importance
          )
          VALUES ($1, $2, $3, $4)
          RETURNING
            id,
            memory,
            category,
            subcategory,
            importance,
            created_at`,
          [
            memory.trim(),
            category || "general",
            subcategory || "general",
            importance || 1
          ]
        );
      return res.status(200).json({
        success: true,
        message:
          "Memory berjaya disimpan.",
        memory:
          result[0]
      });
    }
    /* ================================
       GET ALL MEMORIES
    ================================= */
    if (action === "list") {
      const result =
        await sql.query(
          `SELECT
            id,
            memory,
            category,
            subcategory,
            importance,
            created_at,
            updated_at
           FROM naira_memory
           ORDER BY
             importance DESC,
             created_at DESC`
        );
      return res.status(200).json({
        success: true,
        memories:
          result
      });
    }
    /* ================================
       SEARCH BY CATEGORY
    ================================= */
    if (action === "category") {
      const result =
        await sql.query(
          `SELECT
            id,
            memory,
            category,
            subcategory,
            importance,
            created_at,
            updated_at
           FROM naira_memory
           WHERE category = $1
           ORDER BY
             importance DESC,
             created_at DESC`,
          [
            category ||
            "general"
          ]
        );
      return res.status(200).json({
        success: true,
        memories:
          result
      });
    }
    /* ================================
       UPDATE MEMORY
    ================================= */
    if (action === "update") {
      if (!id) {
        return res.status(400).json({
          error:
            "ID memory diperlukan."
        });
      }
      if (
        !memory ||
        !memory.trim()
      ) {
        return res.status(400).json({
          error:
            "Memory kosong."
        });
      }
      const result =
        await sql.query(
          `UPDATE naira_memory
           SET
             memory = $1,
             category = $2,
             subcategory = $3,
             importance = $4,
             updated_at = NOW()
           WHERE id = $5
           RETURNING
             id,
             memory,
             category,
             subcategory,
             importance,
             created_at,
             updated_at`,
          [
            memory.trim(),
            category || "general",
            subcategory || "general",
            importance || 1,
            id
          ]
        );
      if (!result.length) {
        return res.status(404).json({
          error:
            "Memory tidak dijumpai."
        });
      }
      return res.status(200).json({
        success: true,
        message:
          "Memory berjaya dikemaskini.",
        memory:
          result[0]
      });
    }
    /* ================================
       DELETE MEMORY
    ================================= */
    if (action === "delete") {
      if (!id) {
        return res.status(400).json({
          error:
            "ID memory diperlukan."
        });
      }
      const result =
        await sql.query(
          `DELETE FROM naira_memory
           WHERE id = $1
           RETURNING id`,
          [
            id
          ]
        );
      if (!result.length) {
        return res.status(404).json({
          error:
            "Memory tidak dijumpai."
        });
      }
      return res.status(200).json({
        success: true,
        message:
          "Memory berjaya dipadam."
      });
    }
    return res.status(400).json({
      error:
        "Action tidak sah."
    });
  } catch (error) {
    console.error(
      "Memory error:",
      error
    );
    return res.status(500).json({
      error:
        error.message ||
        "Memory system gagal."
    });
  }
}