import { neon } from "@neondatabase/serverless";
import { randomUUID } from "node:crypto";
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
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type"
  );
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  try {
    const sql = neon(process.env.DATABASE_URL);
    // ============================================================
    // GET
    // ============================================================
    // GET /api/conversations
    //
    // Digunakan untuk:
    // - Load semua history
    // - Search history
    // - Load satu conversation
    // ============================================================
    if (req.method === "GET") {
      const {
        id,
        search,
        category
      } = req.query || {};
      // ----------------------------------------------------------
      // GET SINGLE CONVERSATION
      // ----------------------------------------------------------
      if (id) {
        const conversation = await sql`
          SELECT
            conversation_id,
            title,
            user_message,
            naira_response,
            category,
            subcategory,
            created_at
          FROM naira_conversations
          WHERE conversation_id = ${id}
          ORDER BY created_at ASC
        `;
        return res.status(200).json({
          success: true,
          conversationId: id,
          messages: conversation
        });
      }
      // ----------------------------------------------------------
      // SEARCH HISTORY
      // ----------------------------------------------------------
      let conversations;
      if (search && search.trim()) {
        const searchText = `%${search.trim()}%`;
        conversations = await sql`
          SELECT
            conversation_id,
            MAX(title) AS title,
            MAX(category) AS category,
            MAX(subcategory) AS subcategory,
            MAX(created_at) AS created_at,
            COUNT(*) AS message_count
          FROM naira_conversations
          WHERE
            title ILIKE ${searchText}
            OR user_message ILIKE ${searchText}
            OR naira_response ILIKE ${searchText}
          GROUP BY conversation_id
          ORDER BY MAX(created_at) DESC
        `;
      }
      // ----------------------------------------------------------
      // FILTER CATEGORY
      // ----------------------------------------------------------
      else if (category && category.trim()) {
        conversations = await sql`
          SELECT
            conversation_id,
            MAX(title) AS title,
            MAX(category) AS category,
            MAX(subcategory) AS subcategory,
            MAX(created_at) AS created_at,
            COUNT(*) AS message_count
          FROM naira_conversations
          WHERE category = ${category.trim()}
          GROUP BY conversation_id
          ORDER BY MAX(created_at) DESC
        `;
      }
      // ----------------------------------------------------------
      // ALL HISTORY
      // ----------------------------------------------------------
      else {
        conversations = await sql`
          SELECT
            conversation_id,
            MAX(title) AS title,
            MAX(category) AS category,
            MAX(subcategory) AS subcategory,
            MAX(created_at) AS created_at,
            COUNT(*) AS message_count
          FROM naira_conversations
          GROUP BY conversation_id
          ORDER BY MAX(created_at) DESC
        `;
      }
      // ----------------------------------------------------------
      // FORMAT HISTORY
      // ----------------------------------------------------------
      const history = conversations.map(item => ({
        conversationId: item.conversation_id,
        title:
          item.title ||
          "New Conversation",
        category:
          item.category ||
          "general",
        subcategory:
          item.subcategory ||
          "general",
        createdAt:
          item.created_at,
        messageCount:
          Number(item.message_count) || 0
      }));
      return res.status(200).json({
        success: true,
        count: history.length,
        conversations: history
      });
    }
    // ============================================================
    // POST
    // ============================================================
    // POST /api/conversations
    //
    // Digunakan untuk create NEW conversation
    // ============================================================
    if (req.method === "POST") {
      const body = req.body || {};
      const conversationId =
        body.conversationId ||
        randomUUID();
      const title =
        body.title?.trim() ||
        "New Conversation";
      const category =
        body.category ||
        "general";
      const subcategory =
        body.subcategory ||
        "general";
      return res.status(200).json({
        success: true,
        conversationId,
        title,
        category,
        subcategory
      });
    }
    // ============================================================
    // PUT
    // ============================================================
    // PUT /api/conversations
    //
    // Digunakan untuk EDIT TITLE
    // ============================================================
    if (req.method === "PUT") {
      const {
        conversationId,
        title
      } = req.body || {};
      if (!conversationId) {
        return res.status(400).json({
          error:
            "conversationId diperlukan."
        });
      }
      if (!title || !title.trim()) {
        return res.status(400).json({
          error:
            "Title tidak boleh kosong."
        });
      }
      const cleanTitle =
        title.trim().slice(0, 100);
      const updated =
        await sql`
          UPDATE naira_conversations
          SET title = ${cleanTitle}
          WHERE conversation_id = ${conversationId}
          RETURNING
            conversation_id,
            title
        `;
      if (updated.length === 0) {
        return res.status(404).json({
          error:
            "Conversation tidak ditemui."
        });
      }
      return res.status(200).json({
        success: true,
        conversationId:
          updated[0].conversation_id,
        title:
          updated[0].title
      });
    }
    // ============================================================
    // DELETE
    // ============================================================
    // DELETE /api/conversations
    //
    // Digunakan untuk DELETE SATU conversation
    // ============================================================
    if (req.method === "DELETE") {
      const {
        conversationId
      } = req.body || {};
      if (!conversationId) {
        return res.status(400).json({
          error:
            "conversationId diperlukan."
        });
      }
      const deleted =
        await sql`
          DELETE FROM naira_conversations
          WHERE conversation_id = ${conversationId}
          RETURNING conversation_id
        `;
      if (deleted.length === 0) {
        return res.status(404).json({
          error:
            "Conversation tidak ditemui."
        });
      }
      return res.status(200).json({
        success: true,
        deleted: true,
        conversationId
      });
    }
    // ============================================================
    // METHOD NOT ALLOWED
    // ============================================================
    return res.status(405).json({
      error:
        "Method not allowed."
    });
  } catch (error) {
    console.error(
      "CONVERSATION API ERROR:",
      error
    );
    return res.status(500).json({
      error:
        error.message ||
        "Berlaku masalah pada Conversation History Naira."
    });
  }
}