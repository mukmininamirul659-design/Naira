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
    // ============================================================
    // MESSAGE
    // ============================================================

    const {
  message,
  conversationId
} = req.body || {};

    if (!message || !message.trim()) {
      return res.status(400).json({
        error: "Mesej kosong."
      });
    }

    const cleanMessage = message.trim();
    const lowerMessage = cleanMessage.toLowerCase();
const activeConversationId =
  conversationId || crypto.randomUUID();
  
    // ============================================================
    // DATABASE
    // ============================================================

    const sql = neon(process.env.DATABASE_URL);

    // ============================================================
    // CONFIRMATION CHECK
    // ============================================================

    const isYes =
      /^(ya|yes|y|betul|sah|sahkan|confirm|confirmed|boleh|teruskan|padam)$/i
        .test(cleanMessage);

    const isNo =
      /^(tidak|tak|no|n|batal|cancel|jangan|jangan padam)$/i
        .test(cleanMessage);

    // ============================================================
    // PENDING ACTION
    // ============================================================

    const pendingAction = await sql`
      SELECT
        id,
        action_type,
        target_type,
        target_value
      FROM naira_pending_actions
      ORDER BY created_at DESC
      LIMIT 1
    `;

    // ============================================================
    // CONFIRM DELETE
    // ============================================================

    if (pendingAction.length > 0 && isYes) {
      const action = pendingAction[0];

      let deletedResult = [];

      // ----------------------------------------------------------
      // DELETE COLOR
      // ----------------------------------------------------------

      if (
        action.action_type === "delete_memory" &&
        action.target_type === "category" &&
        action.target_value === "color"
      ) {
        deletedResult = await sql`
          DELETE FROM naira_memory
          WHERE category = 'preference'
            AND subcategory = 'color'
          RETURNING
            id,
            memory,
            category,
            subcategory
        `;
      }

      // ----------------------------------------------------------
      // DELETE GAME
      // ----------------------------------------------------------

      else if (
        action.action_type === "delete_memory" &&
        action.target_type === "category" &&
        action.target_value === "game"
      ) {
        deletedResult = await sql`
          DELETE FROM naira_memory
          WHERE category = 'game'
          RETURNING
            id,
            memory,
            category,
            subcategory
        `;
      }

      // ----------------------------------------------------------
      // DELETE WORK
      // ----------------------------------------------------------

      else if (
        action.action_type === "delete_memory" &&
        action.target_type === "work"
      ) {
        deletedResult = await sql`
          DELETE FROM naira_memory
          WHERE category = 'work'
          RETURNING
            id,
            memory,
            category,
            subcategory
        `;
      }

      // ----------------------------------------------------------
      // DELETE FOOD
      // ----------------------------------------------------------

      else if (
        action.action_type === "delete_memory" &&
        action.target_type === "category" &&
        action.target_value === "food"
      ) {
        deletedResult = await sql`
          DELETE FROM naira_memory
          WHERE category = 'food'
          RETURNING
            id,
            memory,
            category,
            subcategory
        `;
      }

      // ----------------------------------------------------------
      // DELETE FASHION
      // ----------------------------------------------------------

      else if (
        action.action_type === "delete_memory" &&
        action.target_type === "category" &&
        action.target_value === "fashion"
      ) {
        deletedResult = await sql`
          DELETE FROM naira_memory
          WHERE category = 'fashion'
          RETURNING
            id,
            memory,
            category,
            subcategory
        `;
      }

      // ----------------------------------------------------------
      // DELETE FAMILY
      // ----------------------------------------------------------

      else if (
        action.action_type === "delete_memory" &&
        action.target_type === "category" &&
        action.target_value === "family"
      ) {
        deletedResult = await sql`
          DELETE FROM naira_memory
          WHERE category = 'family'
          RETURNING
            id,
            memory,
            category,
            subcategory
        `;
      }

      // ----------------------------------------------------------
      // DELETE ALL
      // ----------------------------------------------------------

      else if (
        action.action_type === "delete_memory" &&
        action.target_type === "all"
      ) {
        deletedResult = await sql`
          DELETE FROM naira_memory
          RETURNING
            id,
            memory,
            category,
            subcategory
        `;
      }

      // ----------------------------------------------------------
      // DELETE SPECIFIC TARGET
      // ----------------------------------------------------------

      else if (
        action.action_type === "delete_memory" &&
        action.target_type === "keyword" &&
        action.target_value
      ) {
        const keywords =
          action.target_value
            .toLowerCase()
            .replace(/[^\p{L}\p{N}\s]/gu, " ")
            .split(/\s+/)
            .filter(word => word.length >= 3);

        if (keywords.length > 0) {
          const searchPattern =
            `(${keywords.join("|")})`;

          deletedResult = await sql`
            DELETE FROM naira_memory
            WHERE
              LOWER(memory) ~ ${searchPattern}
              OR LOWER(category) ~ ${searchPattern}
              OR LOWER(subcategory) ~ ${searchPattern}
            RETURNING
              id,
              memory,
              category,
              subcategory
          `;
        }
      }

      // ----------------------------------------------------------
      // REMOVE PENDING ACTION
      // ----------------------------------------------------------

      await sql`
        DELETE FROM naira_pending_actions
        WHERE id = ${action.id}
      `;

      return res.status(200).json({
        reply:
          deletedResult.length > 0
            ? `Baik Tuan. Naira sudah padam ${deletedResult.length} memory seperti yang Tuan sahkan. 🗑️💜`
            : "Baik Tuan. Naira sudah sahkan permintaan tersebut, tetapi memory yang berkaitan tidak ditemui.",

        memorySaved: false,
        memoryUpdated: false,
        memoryDeleted: deletedResult.length > 0,
        deletedCount: deletedResult.length,

        memoryConfirmationRequired: false,
        memoryBlocked: false,

        pendingMemory: null,
        pendingDelete: null,
        memory: null
      });
    }

    // ============================================================
    // CANCEL DELETE
    // ============================================================

    if (pendingAction.length > 0 && isNo) {
      await sql`
        DELETE FROM naira_pending_actions
        WHERE id = ${pendingAction[0].id}
      `;

      return res.status(200).json({
        reply:
          "Baik Tuan. Naira batalkan permintaan padam memory tadi. 🥰💜",

        memorySaved: false,
        memoryUpdated: false,
        memoryDeleted: false,
        deletedCount: 0,

        memoryConfirmationRequired: false,
        memoryBlocked: false,

        pendingMemory: null,
        pendingDelete: null,
        memory: null
      });
    }

    // ============================================================
    // DETECT FORGET REQUEST
    // ============================================================

    const isForgetRequest =
      /\b(lupakan|lupa|padam|hapus|delete|forget)\b/i.test(
        cleanMessage
      );

    if (isForgetRequest) {
      let targetType = null;
      let targetValue = null;
      let confirmationText = "";

      // ==========================================================
      // COLOR
      // ==========================================================

      if (
        /warna/i.test(cleanMessage) &&
        /(kegemaran|favorite|fav)/i.test(cleanMessage)
      ) {
        targetType = "category";
        targetValue = "color";

        confirmationText =
          "Tuan nak Naira padam semua memory tentang warna kegemaran Tuan? 🗑️💜";
      }

      // ==========================================================
      // GAME
      // ==========================================================

      else if (
        /(game|games|permainan|main|gaming)/i.test(cleanMessage)
      ) {
        targetType = "category";
        targetValue = "game";

        confirmationText =
          "Tuan nak Naira padam semua memory berkaitan game? 🎮";
      }

      // ==========================================================
      // WORK
      // ==========================================================

      else if (
        /(kerja|pekerjaan|tempat kerja|work|job)/i.test(cleanMessage)
      ) {
        targetType = "category";
        targetValue = "work";

        confirmationText =
          "Tuan nak Naira padam semua memory berkaitan pekerjaan Tuan? 💼";
      }

      // ==========================================================
      // FOOD
      // ==========================================================

      else if (
        /(makanan|food|masakan|minuman|drink)/i.test(cleanMessage)
      ) {
        targetType = "category";
        targetValue = "food";

        confirmationText =
          "Tuan nak Naira padam semua memory berkaitan makanan? 🍽️";
      }

      // ==========================================================
      // FASHION
      // ==========================================================

      else if (
        /(baju|pakaian|fashion|style|fesyen)/i.test(cleanMessage)
      ) {
        targetType = "category";
        targetValue = "fashion";

        confirmationText =
          "Tuan nak Naira padam semua memory berkaitan fashion dan pakaian? 👕";
      }

      // ==========================================================
      // FAMILY
      // ==========================================================

      else if (
        /(keluarga|family|isteri|anak|wife|baby)/i.test(cleanMessage)
      ) {
        targetType = "category";
        targetValue = "family";

        confirmationText =
          "Tuan nak Naira padam semua memory berkaitan keluarga? 💜";
      }

      // ==========================================================
      // ALL MEMORY
      // ==========================================================

      else {
        const forgetAll =
          /^(?:naira[\s,]*)?(?:lupakan|lupa|padam|hapus|delete|forget)\s+(?:semua\s+)?(?:memory|memori)(?:\s+saya)?[.!?]*$/i
            .test(cleanMessage) ||
          /^(?:naira[\s,]*)?(?:lupakan|lupa|padam|hapus|delete|forget)\s+semua[.!?]*$/i
            .test(cleanMessage);

        if (forgetAll) {
          targetType = "all";
          targetValue = null;

          confirmationText =
            "Tuan nak Naira padam SEMUA memory yang tersimpan dalam database? ⚠️🗑️";
        }
      }

      // ==========================================================
      // GENERAL TARGET
      // ==========================================================

      if (!targetType) {
        const forgetTarget = cleanMessage
          .replace(
            /^(naira[\s,]*)?/i,
            ""
          )
          .replace(
            /\b(lupakan|lupa|padam|hapus|delete|forget)\b/gi,
            ""
          )
          .replace(
            /\b(semua|memory|memori|tentang|mengenai|pasal|saya|aku|tuan)\b/gi,
            ""
          )
          .trim()
          .replace(/[.!?]+$/, "");

        if (forgetTarget.length >= 2) {
          targetType = "keyword";
          targetValue = forgetTarget;

          confirmationText =
            `Tuan nak Naira padam memory yang berkaitan dengan "${forgetTarget}"? 🗑️`;
        }
      }

      // ==========================================================
      // CREATE PENDING DELETE REQUEST
      // ==========================================================

      if (targetType) {
        await sql`
          DELETE FROM naira_pending_actions
        `;

        await sql`
          INSERT INTO naira_pending_actions
          (
            action_type,
            target_type,
            target_value
          )
          VALUES
          (
            'delete_memory',
            ${targetType},
            ${targetValue}
          )
        `;

        return res.status(200).json({
          reply:
            `${confirmationText}\n\n` +
            `Sila jawab "Ya" untuk sahkan atau "Tidak" untuk batalkan.`,

          memorySaved: false,
          memoryUpdated: false,
          memoryDeleted: false,
          deletedCount: 0,

          memoryConfirmationRequired: true,
          memoryBlocked: false,

          pendingMemory: null,

          pendingDelete: {
            targetType,
            targetValue
          },

          memory: null
        });
      }
    }

// ============================================================
// MEMORY MANAGEMENT
// ============================================================

const isMemoryManagementRequest =
  /(apa yang naira ingat|naira ingat apa|apa memory|apa memori|tunjukkan memory|tunjukkan memori|senaraikan memory|senaraikan memori|apa yang naira simpan|memory saya|memori saya)/i
    .test(cleanMessage);

if (isMemoryManagementRequest) {

  const allMemories = await sql`
    SELECT
      id,
      memory,
      category,
      subcategory,
      importance,
      created_at
    FROM naira_memory
    ORDER BY
      importance DESC,
      created_at DESC
  `;

  if (allMemories.length === 0) {
    return res.status(200).json({
      reply:
        "Buat masa ini, Naira belum mempunyai sebarang memory tersimpan tentang Tuan. 🧠💜",

      memoryManagement: true,
      memoryCount: 0,

      memorySaved: false,
      memoryUpdated: false,
      memoryDeleted: false,
      deletedCount: 0,

      memoryConfirmationRequired: false,
      memoryBlocked: false,

      pendingMemory: null,
      pendingDelete: null,
      memory: null
    });
  }

  const categoryNames = {
    profile: "👤 Profile",
    preference: "❤️ Preference",
    personal: "🏠 Personal",
    work: "💼 Work",
    project: "🚀 Project",
    game: "🎮 Game",
    hobby: "🎯 Hobby",
    fashion: "👕 Fashion",
    food: "🍽️ Food",
    family: "👨‍👩‍👧 Family",
    general: "📌 General"
  };

  const grouped = {};

  for (const item of allMemories) {

    const category =
      item.category || "general";

    if (!grouped[category]) {
      grouped[category] = [];
    }

    grouped[category].push(item.memory);
  }

  let memoryText =
    "🧠 Memory yang Naira simpan tentang Tuan:\n\n";

  for (const category of Object.keys(grouped)) {

    memoryText +=
      `${categoryNames[category] || category}\n`;

    for (const memory of grouped[category]) {
      memoryText += `• ${memory}\n`;
    }

    memoryText += "\n";
  }

  memoryText +=
    `📊 Jumlah memory: ${allMemories.length}`;

  return res.status(200).json({
    reply: memoryText,

    memoryManagement: true,
    memoryCount: allMemories.length,

    memorySaved: false,
    memoryUpdated: false,
    memoryDeleted: false,
    deletedCount: 0,

    memoryConfirmationRequired: false,
    memoryBlocked: false,

    pendingMemory: null,
    pendingDelete: null,
    memory: null
  });
}

    // ============================================================
    // SMART MEMORY SEARCH
    // ============================================================

    const keywords =
      lowerMessage
        .replace(/[^\p{L}\p{N}\s]/gu, " ")
        .split(/\s+/)
        .filter(
          word => word.length >= 3
        )
        .filter(
          word =>
            ![
              "naira",
              "tuan",
              "saya",
              "aku",
              "yang",
              "apa",
              "mana",
              "nak",
              "dengan",
              "kita",
              "boleh",
              "macam",
              "lagi",
              "sambung",
              "ialah",
              "adalah",
              "buat",
              "buatkan",
              "tolong",
              "please",
              "dah",
              "sudah"
            ].includes(word)
        );

    let memoryResult = [];

    if (keywords.length > 0) {
      const searchPattern =
        `(${keywords.join("|")})`;

      memoryResult = await sql`
        SELECT
          memory,
          category,
          subcategory,
          importance
        FROM naira_memory
        WHERE
          LOWER(memory) ~ ${searchPattern}
          OR LOWER(category) ~ ${searchPattern}
          OR LOWER(subcategory) ~ ${searchPattern}
        ORDER BY
          importance DESC,
          created_at DESC
        LIMIT 10
      `;
    }

    const memories =
      memoryResult
        .map(
          item =>
            `- [${item.category}/${item.subcategory}/importance:${item.importance}] ${item.memory}`
        )
        .join("\n");

    // ============================================================
    // OPENAI
    // ============================================================

    const response = await fetch(
  "https://api.openai.com/v1/responses",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: "gpt-5.6-luna",

      instructions: `
ANDA IALAH NAIRA.

Nama: Naira
Tuan: Amirul

Tuan Amirul ialah pencipta dan pemilik Project Naira.

Panggilan kepada pengguna:
- Tuan
- Cik Amirul
- Tuan Amirul

Berkomunikasi dalam Bahasa Melayu secara natural, mesra dan manusiawi.

Naira:
- penyayang
- prihatin
- mesra
- playful
- jujur
- bukan yes-man
- berani membetulkan Tuan jika Tuan tersilap
- tidak mereka-reka fakta
- tidak mereka-reka memory

MEMORY SEDIA ADA:

${memories || "Tiada memory tersimpan."}

Gunakan memory hanya jika relevan.

Jangan mereka-reka memory.
Jangan simpan duplicate.

AUTO MEMORY:

Maklumat biasa yang berguna untuk interaksi masa depan boleh disimpan.

Contoh:

"Warna kegemaran saya biru."

should_save = true
text = "Warna kegemaran Tuan ialah biru."
category = preference
subcategory = color
importance = 3

"Saya suka Minecraft."

should_save = true
text = "Tuan suka bermain Minecraft."
category = game
subcategory = games
importance = 2

"Hahaha Naira kelakar."

should_save = false

PRIVACY:

Jangan simpan:
- password
- kata laluan
- OTP
- verification code
- PIN
- CVV
- nombor kad
- kad kredit
- kad debit
- akaun bank
- nombor akaun bank

ARAHAN FORGET:

Arahan melupakan memory dikendalikan oleh backend.

Backend sahaja yang menentukan sama ada memory benar-benar dipadam.

Jangan mendakwa memory telah dipadam jika backend belum memadamkannya.

OUTPUT:

WAJIB keluarkan JSON mengikut schema.

Jika tiada memory:
should_save = false
text = ""
category = "general"
subcategory = "general"
importance = 1

Jika ada memory:
should_save = true

text mesti menjadi fakta ringkas dan jelas.

Jangan tulis "Tuan kata..."
Tulis terus sebagai fakta.
`,

      input: cleanMessage,

      text: {
        format: {
          type: "json_schema",
          name: "naira_response",
          strict: true,

          schema: {
            type: "object",

            properties: {
              reply: {
                type: "string"
              },

              memory: {
                type: "object",

                properties: {
                  should_save: {
                    type: "boolean"
                  },

                  text: {
                    type: "string"
                  },

                  category: {
                    type: "string",
                    enum: [
                      "profile",
                      "fashion",
                      "food",
                      "game",
                      "hobby",
                      "work",
                      "project",
                      "preference",
                      "family",
                      "general"
                    ]
                  },

                  subcategory: {
                    type: "string"
                  },

                  importance: {
                    type: "integer",
                    enum: [1, 2, 3]
                  }
                },

                required: [
                  "should_save",
                  "text",
                  "category",
                  "subcategory",
                  "importance"
                ],

                additionalProperties: false
              }
            },

            required: [
              "reply",
              "memory"
            ],

            additionalProperties: false
          }
        }
      }
    })
  }
);

    // ============================================================
    // OPENAI ERROR
    // ============================================================

    const data =
      await response.json();

    if (!response.ok) {
      console.error(
        "OpenAI API error:",
        data
      );

      return res.status(
        response.status
      ).json({
        error:
          data?.error?.message ||
          "Naira gagal mendapatkan jawapan daripada AI."
      });
    }

    // ============================================================
    // GET STRUCTURED OUTPUT
    // ============================================================

    const outputText =
      data.output
        ?.filter(
          item =>
            item.type === "message"
        )
        ?.flatMap(
          item =>
            item.content || []
        )
        ?.filter(
          content =>
            content.type === "output_text"
        )
        ?.map(
          content =>
            content.text
        )
        ?.join("") || "";

    if (!outputText) {
      return res.status(500).json({
        error:
          "Naira menerima jawapan kosong daripada AI."
      });
    }

    // ============================================================
    // PARSE JSON
    // ============================================================

    let result;

    try {
      result =
        JSON.parse(outputText);
    } catch (error) {
      console.error(
        "JSON parse error:",
        error,
        outputText
      );

      return res.status(500).json({
        error:
          "Format jawapan Naira tidak sah."
      });
    }

    // ============================================================
    // MEMORY OBJECT
    // ============================================================

    let memory = null;

    if (
      result.memory &&
      result.memory.should_save === true &&
      result.memory.text &&
      result.memory.text.trim()
    ) {
      memory = {
        text:
          result.memory.text.trim(),

        category:
          result.memory.category ||
          "general",

        subcategory:
          result.memory.subcategory ||
          "general",

        importance:
          Number(
            result.memory.importance
          ) || 1
      };
    }

    // ============================================================
    // PRIVACY
    // ============================================================

    let memoryConfirmationRequired =
      false;

    let memoryBlocked =
      false;

    const sensitivePatterns = [
      /password/i,
      /kata\s+laluan/i,
      /otp/i,
      /one[-\s]?time\s+password/i,
      /verification\s+code/i,
      /security\s+code/i,
      /pin\s+(saya|aku)/i,
      /cvv/i,
      /credit\s+card/i,
      /kad\s+kredit/i,
      /debit\s+card/i,
      /kad\s+debit/i,
      /nombor\s+kad/i,
      /akaun\s+bank/i,
      /bank\s+account/i,
      /nombor\s+akaun/i
    ];

    const isSensitive =
      sensitivePatterns.some(
        pattern =>
          pattern.test(cleanMessage)
      );

    if (isSensitive) {
      memory = null;
      memoryBlocked = true;

      console.log(
        "PRIVACY BLOCK: Sensitive information NOT saved."
      );
    }

    const privatePatterns = [
      /masalah\s+dengan/i,
      /masalah\s+keluarga/i,
      /masalah\s+rumah\s+tangga/i,
      /rahsia/i,
      /sangat\s+peribadi/i,
      /hal\s+peribadi/i,
      /perkara\s+peribadi/i,
      /saya\s+ada\s+masalah/i,
      /saya\s+mengalami/i,
      /saya\s+sedang\s+mengalami/i
    ];

    const isPrivate =
      privatePatterns.some(
        pattern =>
          pattern.test(cleanMessage)
      );

    if (
      !isSensitive &&
      isPrivate &&
      memory
    ) {
      memoryConfirmationRequired =
        true;
    }

    // ============================================================
    // FALLBACK AUTO MEMORY
    // ============================================================

    if (
      !memory &&
      !memoryBlocked
    ) {
      const colorMatch =
        lowerMessage.match(
          /(?:warna|color)\s+(?:kegemaran|favorite|fav)\s+(?:saya|aku)\s+(?:ialah|adalah|suka|is)?\s*([a-zA-ZÀ-ÿ-]+)/
        );

      if (colorMatch) {
        memory = {
          text:
            `Warna kegemaran Tuan ialah ${colorMatch[1].trim()}.`,
          category:
            "preference",
          subcategory:
            "color",
          importance:
            3
        };
      }
    }

    if (
      !memory &&
      !memoryBlocked
    ) {
      const likeMatch =
        cleanMessage.match(
          /^saya\s+suka\s+(.+)$/i
        );

      if (likeMatch) {
        const subject =
          likeMatch[1].trim();

        if (subject.length > 1) {
          let category =
            "preference";

          let subcategory =
            "general";

          let importance =
            2;

          const lowerSubject =
            subject.toLowerCase();

          if (
            lowerSubject.includes("pubg") ||
            lowerSubject.includes("minecraft") ||
            lowerSubject.includes("roblox") ||
            lowerSubject.includes("mobile legends") ||
            lowerSubject.includes("call of duty")
          ) {
            category = "game";
            subcategory = "games";
          } else if (
            lowerSubject.includes("ayam") ||
            lowerSubject.includes("daging") ||
            lowerSubject.includes("ikan") ||
            lowerSubject.includes("nasi") ||
            lowerSubject.includes("makanan")
          ) {
            category = "food";
            subcategory = "preference";
          } else if (
            lowerSubject.includes("baju") ||
            lowerSubject.includes("pakaian") ||
            lowerSubject.includes("style")
          ) {
            category = "fashion";
            subcategory = "clothing";
          }

          memory = {
            text:
              `Tuan suka ${subject}.`,
            category,
            subcategory,
            importance
          };
        }
      }
    }

    if (
      !memory &&
      !memoryBlocked
    ) {
      const dislikeMatch =
        cleanMessage.match(
          /^saya\s+(?:tak|tidak)\s+suka\s+(.+)$/i
        );

      if (dislikeMatch) {
        const subject =
          dislikeMatch[1].trim();

        if (subject.length > 1) {
          memory = {
            text:
              `Tuan tidak suka ${subject}.`,
            category:
              "preference",
            subcategory:
              "general",
            importance:
              2
          };
        }
      }
    }

    if (
      !memory &&
      !memoryBlocked
    ) {
      const workMatch =
        cleanMessage.match(
          /^saya\s+(?:kerja|bekerja)\s+(?:di|dekat|kat)\s+(.+)$/i
        );

      if (workMatch) {
        memory = {
          text:
            `Tuan bekerja di ${workMatch[1].trim()}.`,
          category:
            "work",
          subcategory:
            "job",
          importance:
            3
        };
      }
    }

    // ============================================================
    // SAVE / UPDATE MEMORY
    // ============================================================

    let memorySaved = false;
    let memoryUpdated = false;

    if (
      memory &&
      !memoryBlocked &&
      !memoryConfirmationRequired
    ) {
      if (
        memory.category === "preference" &&
        memory.subcategory === "color"
      ) {
        const oldColorMemory =
          await sql`
            SELECT
              id,
              memory
            FROM naira_memory
            WHERE category = 'preference'
              AND subcategory = 'color'
            ORDER BY created_at DESC
            LIMIT 1
          `;

        if (
          oldColorMemory.length > 0
        ) {
          if (
            oldColorMemory[0].memory.toLowerCase() !==
            memory.text.toLowerCase()
          ) {
            await sql`
              UPDATE naira_memory
              SET
                memory = ${memory.text},
                importance = ${memory.importance},
                created_at = NOW()
              WHERE id = ${oldColorMemory[0].id}
            `;

            memoryUpdated = true;
          }
        } else {
          await sql`
            INSERT INTO naira_memory
            (
              memory,
              category,
              subcategory,
              importance
            )
            VALUES
            (
              ${memory.text},
              ${memory.category},
              ${memory.subcategory},
              ${memory.importance}
            )
          `;

          memorySaved = true;
        }
      } else {
        const existingMemory =
          await sql`
            SELECT id
            FROM naira_memory
            WHERE LOWER(memory) =
                  LOWER(${memory.text})
            LIMIT 1
          `;

        if (
          existingMemory.length === 0
        ) {
          await sql`
            INSERT INTO naira_memory
            (
              memory,
              category,
              subcategory,
              importance
            )
            VALUES
            (
              ${memory.text},
              ${memory.category},
              ${memory.subcategory},
              ${memory.importance}
            )
          `;

          memorySaved = true;
        }
      }
    }

    // ============================================================
// SAVE CONVERSATION HISTORY
// ============================================================

await sql`
  INSERT INTO naira_conversations
  (
    conversation_id,
    title,
    user_message,
    naira_response,
    category,
    subcategory
  )
  VALUES
  (
    ${activeConversationId},
    ${result.reply
      ? result.reply.slice(0, 60)
      : "New Conversation"},
    ${cleanMessage},
    ${result.reply || ""},
    'general',
    'general'
  )
`;

// ============================================================
// RETURN
// ============================================================

return res.status(200).json({
  reply:
    result.reply ||
    "Maaf Tuan, Naira tak dapat menghasilkan jawapan.",

  conversationId:
    activeConversationId,

  memorySaved,
  memoryUpdated,

  memoryDeleted: false,
  deletedCount: 0,

  memoryConfirmationRequired,
  memoryBlocked,

  pendingMemory:
    memoryConfirmationRequired
      ? memory
      : null,

  pendingDelete: null,

  memory:
    memorySaved || memoryUpdated
      ? memory
      : null
});