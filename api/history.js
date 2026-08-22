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

      // ==========================================================
      // OPEN ONE COMPLETE CONVERSATION
      // ==========================================================
      if (conversationId) {
        const messages = await sql`
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
          ORDER BY created_at ASC, id ASC
        `;

        return res.status(200).json({
          success: true,
          conversationId,
          count: messages.length,
          conversations: messages
        });
      }

      // ==========================================================
      // SEARCH — ONE CARD PER CONVERSATION
      // ==========================================================
      if (search && search.trim()) {
        const searchText = `%${search.trim()}%`;

        const conversations = await sql`
          SELECT DISTINCT ON (conversation_id)
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
          ORDER BY
            conversation_id,
            created_at DESC,
            id DESC
        `;

        conversations.sort(
          (a, b) =>
            new Date(b.created_at) -
            new Date(a.created_at)
        );

        return res.status(200).json({
          success: true,
          count: conversations.length,
          conversations
        });
      }

      // ==========================================================
      // CATEGORY FILTER — ONE CARD PER CONVERSATION
      // ==========================================================
      if (
        category &&
        category !== "all"
      ) {
        const conversations = await sql`
          SELECT DISTINCT ON (conversation_id)
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
          ORDER BY
            conversation_id,
            created_at DESC,
            id DESC
        `;

        conversations.sort(
          (a, b) =>
            new Date(b.created_at) -
            new Date(a.created_at)
        );

        return res.status(200).json({
          success: true,
          count: conversations.length,
          conversations
        });
      }

      // ==========================================================
      // ALL HISTORY
      //
      // IMPORTANT:
      // DISTINCT ON memastikan:
      // 1 conversation = 1 history card
      // ==========================================================
      const conversations = await sql`
        SELECT DISTINCT ON (conversation_id)
          id,
          conversation_id,
          title,
          user_message,
          naira_response,
          category,
          subcategory,
          created_at
        FROM naira_conversations
        ORDER BY
          conversation_id,
          created_at DESC,
          id DESC
      `;

      // Sort conversation terbaru dahulu
      conversations.sort(
        (a, b) =>
          new Date(b.created_at) -
          new Date(a.created_at)
      );

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

      const cleanTitle =
        title.trim();

      // Update SEMUA row dalam conversation
      // supaya title kekal sama untuk keseluruhan conversation.
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
        message:
          "Conversation title berjaya dikemaskini.",
        conversation: {
          conversationId,
          title: cleanTitle,
          messageCount:
            updated.length
        }
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
        message:
          "Conversation berjaya dipadam.",
        conversationId,
        deletedCount:
          deleted.length
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