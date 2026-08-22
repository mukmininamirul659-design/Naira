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
    "GET, PATCH, DELETE, OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type"
  );
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  try {
    // ============================================================
    // DATABASE
    // ============================================================
    if (!process.env.DATABASE_URL) {
      return res.status(500).json({
        success: false,
        error: "DATABASE_URL belum ditetapkan di Vercel."
      });
    }
    const sql = neon(process.env.DATABASE_URL);
    // ============================================================
    // GET — HISTORY
    // ============================================================
    if (req.method === "GET") {
      const {
        category,
        conversationId,
        search
      } = req.query || {};
      // ========================================================
      // OPEN SINGLE CONVERSATION
      // ========================================================
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
      // ========================================================
      // SEARCH
      // ========================================================
      if (search && search.trim()) {
        const searchText = `%${search.trim()}%`;
        const conversations = await sql`
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
            OR category ILIKE ${searchText}
            OR subcategory ILIKE ${searchText}
          ORDER BY created_at DESC
          LIMIT 100
        `;
        return res.status(200).json({
          success: true,
          count: conversations.length,
          conversations
        });
      }
      // ========================================================
      // CATEGORY FILTER
      // ========================================================
      if (
        category &&
        category !== "all"
      ) {
        const conversations = await sql`
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
        return res.status(200).json({
          success: true,
          count: conversations.length,
          conversations
        });
      }
      // ========================================================
      // ALL HISTORY
      // ========================================================
      const conversations = await sql`
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
      return res.status(200).json({
        success: true,
        count: conversations.length,
        conversations
      });
    }
    // ============================================================
    // PATCH — EDIT CONVERSATION TITLE
    // ============================================================
    if (req.method === "PATCH") {
      const {
        conversationId,
        title
      } = req.body || {};
      if (!conversationId) {
        return res.status(400).json({
          success: false,
          error: "conversationId diperlukan."
        });
      }
      if (
        typeof title !== "string" ||
        !title.trim()
      ) {
        return res.status(400).json({
          success: false,
          error: "Title tidak boleh kosong."
        });
      }
      const cleanTitle = title.trim();
      const updated = await sql`
        UPDATE naira_conversations
        SET title = ${cleanTitle}
        WHERE conversation_id = ${conversationId}
        RETURNING
          id,
          conversation_id,
          title,
          user_message,
          naira_response,
          category,
          subcategory,
          created_at
      `;
      if (!updated.length) {
        return res.status(404).json({
          success: false,
          error: "Conversation tidak dijumpai."
        });
      }
      return res.status(200).json({
        success: true,
        message: "Conversation title berjaya dikemaskini.",
        conversation: updated[0]
      });
    }
    // ============================================================
    // DELETE — DELETE ENTIRE CONVERSATION
    // ============================================================
    if (req.method === "DELETE") {
      const {
        conversationId
      } = req.body || {};
      if (!conversationId) {
        return res.status(400).json({
          success: false,
          error: "conversationId diperlukan."
        });
      }
      const deleted = await sql`
        DELETE FROM naira_conversations
        WHERE conversation_id = ${conversationId}
        RETURNING id
      `;
      if (!deleted.length) {
        return res.status(404).json({
          success: false,
          error: "Conversation tidak dijumpai."
        });
      }
      return res.status(200).json({
        success: true,
        message: "Conversation berjaya dipadam.",
        deletedCount: deleted.length
      });
    }
    // ============================================================
    // METHOD NOT ALLOWED
    // ============================================================
    return res.status(405).json({
      success: false,
      error: "Method not allowed."
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
        "Gagal menguruskan conversation history."
    });
  }
}