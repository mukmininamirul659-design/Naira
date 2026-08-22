import { neon } from "@neondatabase/serverless";

export default async function handler(req, res) {
  // ============================================================
  // CORS
  // ============================================================

  res.setHeader(
    "Access-Control-Allow-Origin",
    "https://mukmininamirul659-design.github.io"
  );

  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, OPTIONS"
  );

  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    // ============================================================
    // DATABASE
    // ============================================================

    const sql = neon(process.env.DATABASE_URL);

    // ============================================================
    // QUERY PARAMETERS
    // ============================================================

    const {
      category,
      conversationId,
      search
    } = req.query || {};

    // ============================================================
    // GET SINGLE CONVERSATION
    // ============================================================

    if (conversationId) {
      const conversation = await sql`
        SELECT
          id,
          conversation_id,
          title,
          user_message,
          naira_response,
          category,
          subcategory,
          created_at
        FROM naira_conversations
        WHERE conversation_id = ${conversationId}
        ORDER BY created_at ASC
      `;

      return res.status(200).json({
        success: true,
        conversationId,
        count: conversation.length,
        conversations: conversation
      });
    }

    // ============================================================
    // SEARCH / CATEGORY FILTER
    // ============================================================

    let conversations;

    if (search && search.trim()) {

      const searchText =
        `%${search.trim()}%`;

      conversations = await sql`
        SELECT
          id,
          conversation_id,
          title,
          user_message,
          naira_response,
          category,
          subcategory,
          created_at
        FROM naira_conversations
        WHERE
          title ILIKE ${searchText}
          OR user_message ILIKE ${searchText}
          OR naira_response ILIKE ${searchText}
        ORDER BY created_at DESC
        LIMIT 100
      `;

    } else if (
      category &&
      category !== "all"
    ) {

      conversations = await sql`
        SELECT
          id,
          conversation_id,
          title,
          user_message,
          naira_response,
          category,
          subcategory,
          created_at
        FROM naira_conversations
        WHERE category = ${category}
        ORDER BY created_at DESC
        LIMIT 100
      `;

    } else {

      conversations = await sql`
        SELECT
          id,
          conversation_id,
          title,
          user_message,
          naira_response,
          category,
          subcategory,
          created_at
        FROM naira_conversations
        ORDER BY created_at DESC
        LIMIT 100
      `;
    }

    // ============================================================
    // RETURN
    // ============================================================

    return res.status(200).json({
      success: true,
      count: conversations.length,
      conversations
    });

  } catch (error) {

    console.error(
      "NAIRA HISTORY ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      error:
        error.message ||
        "Gagal mendapatkan conversation history."
    });
  }
}