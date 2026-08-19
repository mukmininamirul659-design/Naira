import { neon } from "@neondatabase/serverless";

export default async function handler(req, res) {
  // Allow requests from the Naira website
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

  // Handle browser preflight request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Only accept POST
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const { comment } = req.body || {};

    if (!comment || !comment.trim()) {
      return res.status(400).json({
        error: "Komen kosong."
      });
    }

    // Connect to Neon
    const sql = neon(process.env.DATABASE_URL);

    // Save comment into PostgreSQL
    await sql(
      "INSERT INTO comments (comment) VALUES ($1)",
      [comment.trim()]
    );

    return res.status(200).json({
      success: true,
      message: "Komen berjaya disimpan."
    });

  } catch (error) {
    console.error("Database error:", error);

    return res.status(500).json({
      error: "Gagal menyimpan komen."
    });
  }
}