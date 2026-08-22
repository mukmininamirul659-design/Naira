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
    const { message } = req.body || {};

    if (!message || !message.trim()) {
      return res.status(400).json({
        error: "Mesej kosong."
      });
    }

    const cleanMessage = message.trim();
    const lowerMessage = cleanMessage.toLowerCase();

    // ============================================================
    // DATABASE
    // ============================================================
    const sql = neon(process.env.DATABASE_URL);

    // ============================================================
    // FORGET / DELETE MEMORY
    // ============================================================

    const isForgetRequest =
      /\b(lupakan|lupa|padam|hapus|delete|forget)\b/i.test(
        cleanMessage
      );

    if (isForgetRequest) {

      let deletedResult = [];

      // ==========================================================
      // 1. FORGET SPECIFIC CATEGORY FIRST
      // IMPORTANT:
      // "lupakan semua memory tentang warna"
      // MUST NOT trigger "delete all memory"
      // ==========================================================

      // ----------------------------------------------------------
      // COLOR
      // ----------------------------------------------------------

      const forgetColor =
        /warna/i.test(cleanMessage) &&
        /(kegemaran|favorite|fav|warna)/i.test(cleanMessage);

      if (forgetColor) {

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

        return res.status(200).json({
          reply:
            deletedResult.length > 0
              ? `Baik Tuan. Naira sudah lupakan ${deletedResult.length} memory tentang warna kegemaran Tuan. 🗑️💜`
              : "Baik Tuan. Naira tak jumpa memory tentang warna kegemaran Tuan.",

          memorySaved: false,
          memoryUpdated: false,

          memoryDeleted:
            deletedResult.length > 0,

          deletedCount:
            deletedResult.length,

          memoryConfirmationRequired: false,
          memoryBlocked: false,

          memory: null
        });
      }

      // ----------------------------------------------------------
      // GAME
      // ----------------------------------------------------------

      const forgetGame =
        /(game|games|permainan|main|gaming)/i.test(
          cleanMessage
        );

      if (forgetGame) {

        deletedResult = await sql`
          DELETE FROM naira_memory
          WHERE category = 'game'
          RETURNING
            id,
            memory,
            category,
            subcategory
        `;

        return res.status(200).json({
          reply:
            deletedResult.length > 0
              ? `Baik Tuan. Naira sudah lupakan ${deletedResult.length} memory berkaitan game. 🗑️🎮`
              : "Baik Tuan. Naira tak jumpa memory game.",

          memorySaved: false,
          memoryUpdated: false,

          memoryDeleted:
            deletedResult.length > 0,

          deletedCount:
            deletedResult.length,

          memoryConfirmationRequired: false,
          memoryBlocked: false,

          memory: null
        });
      }

      // ----------------------------------------------------------
      // WORK
      // ----------------------------------------------------------

      const forgetWork =
        /(kerja|pekerjaan|tempat kerja|work|job)/i.test(
          cleanMessage
        );

      if (forgetWork) {

        deletedResult = await sql`
          DELETE FROM naira_memory
          WHERE category = 'work'
          RETURNING
            id,
            memory,
            category,
            subcategory
        `;

        return res.status(200).json({
          reply:
            deletedResult.length > 0
              ? `Baik Tuan. Naira sudah lupakan ${deletedResult.length} memory berkaitan pekerjaan. 🗑️💼`
              : "Baik Tuan. Naira tak jumpa memory pekerjaan.",

          memorySaved: false,
          memoryUpdated: false,

          memoryDeleted:
            deletedResult.length > 0,

          deletedCount:
            deletedResult.length,

          memoryConfirmationRequired: false,
          memoryBlocked: false,

          memory: null
        });
      }

      // ----------------------------------------------------------
      // FOOD
      // ----------------------------------------------------------

      const forgetFood =
        /(makanan|food|masakan|minuman|drink)/i.test(
          cleanMessage
        );

      if (forgetFood) {

        deletedResult = await sql`
          DELETE FROM naira_memory
          WHERE category = 'food'
          RETURNING
            id,
            memory,
            category,
            subcategory
        `;

        return res.status(200).json({
          reply:
            deletedResult.length > 0
              ? `Baik Tuan. Naira sudah lupakan ${deletedResult.length} memory berkaitan makanan. 🗑️🍽️`
              : "Baik Tuan. Naira tak jumpa memory makanan.",

          memorySaved: false,
          memoryUpdated: false,

          memoryDeleted:
            deletedResult.length > 0,

          deletedCount:
            deletedResult.length,

          memoryConfirmationRequired: false,
          memoryBlocked: false,

          memory: null
        });
      }

      // ----------------------------------------------------------
      // FASHION
      // ----------------------------------------------------------

      const forgetFashion =
        /(baju|pakaian|fashion|style|fesyen)/i.test(
          cleanMessage
        );

      if (forgetFashion) {

        deletedResult = await sql`
          DELETE FROM naira_memory
          WHERE category = 'fashion'
          RETURNING
            id,
            memory,
            category,
            subcategory
        `;

        return res.status(200).json({
          reply:
            deletedResult.length > 0
              ? `Baik Tuan. Naira sudah lupakan ${deletedResult.length} memory berkaitan fashion. 🗑️👕`
              : "Baik Tuan. Naira tak jumpa memory fashion.",

          memorySaved: false,
          memoryUpdated: false,

          memoryDeleted:
            deletedResult.length > 0,

          deletedCount:
            deletedResult.length,

          memoryConfirmationRequired: false,
          memoryBlocked: false,

          memory: null
        });
      }

      // ----------------------------------------------------------
      // FAMILY
      // ----------------------------------------------------------

      const forgetFamily =
        /(keluarga|family|isteri|anak|wife|baby)/i.test(
          cleanMessage
        );

      if (forgetFamily) {

        deletedResult = await sql`
          DELETE FROM naira_memory
          WHERE category = 'family'
          RETURNING
            id,
            memory,
            category,
            subcategory
        `;

        return res.status(200).json({
          reply:
            deletedResult.length > 0
              ? `Baik Tuan. Naira sudah lupakan ${deletedResult.length} memory berkaitan keluarga. 🗑️💜`
              : "Baik Tuan. Naira tak jumpa memory keluarga.",

          memorySaved: false,
          memoryUpdated: false,

          memoryDeleted:
            deletedResult.length > 0,

          deletedCount:
            deletedResult.length,

          memoryConfirmationRequired: false,
          memoryBlocked: false,

          memory: null
        });
      }

      // ==========================================================
      // 2. FORGET EVERYTHING
      // ONLY RUN WHEN USER REALLY MEANS ALL MEMORY
      // ==========================================================

      const forgetAll =
        /^(?:naira[\s,]*)?(?:lupakan|lupa|padam|hapus|delete|forget)\s+(?:semua\s+)?(?:memory|memori)(?:\s+saya)?[.!?]*$/i.test(
          cleanMessage
        ) ||
        /^(?:naira[\s,]*)?(?:lupakan|lupa|padam|hapus|delete|forget)\s+semua[.!?]*$/i.test(
          cleanMessage
        );

      if (forgetAll) {

        deletedResult = await sql`
          DELETE FROM naira_memory
          RETURNING
            id,
            memory,
            category,
            subcategory
        `;

        return res.status(200).json({
          reply:
            deletedResult.length > 0
              ? `Baik Tuan. Naira sudah padam ${deletedResult.length} memory daripada database. 🗑️💜`
              : "Baik Tuan. Tiada memory tersimpan untuk dipadam.",

          memorySaved: false,
          memoryUpdated: false,

          memoryDeleted:
            deletedResult.length > 0,

          deletedCount:
            deletedResult.length,

          memoryConfirmationRequired: false,
          memoryBlocked: false,

          memory: null
        });
      }

      // ==========================================================
      // 3. GENERAL TARGETED MEMORY DELETE
      // ==========================================================

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

        const targetKeywords =
          forgetTarget
            .toLowerCase()
            .replace(/[^\p{L}\p{N}\s]/gu, " ")
            .split(/\s+/)
            .filter(
              word =>
                word.length >= 3
            )
            .filter(
              word =>
                ![
                  "yang",
                  "dengan",
                  "punya"
                ].includes(word)
            );

        if (
          targetKeywords.length > 0
        ) {

          const searchPattern =
            `(${targetKeywords.join("|")})`;

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

      return res.status(200).json({
        reply:
          deletedResult.length > 0
            ? `Baik Tuan. Naira sudah padam ${deletedResult.length} memory yang berkaitan. 🗑️💜`
            : "Baik Tuan. Naira tak jumpa memory yang berkaitan untuk dipadam.",

        memorySaved: false,
        memoryUpdated: false,

        memoryDeleted:
          deletedResult.length > 0,

        deletedCount:
          deletedResult.length,

        memoryConfirmationRequired: false,
        memoryBlocked: false,

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
          word =>
            word.length >= 3
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

    // ============================================================
    // MEMORY TEXT
    // ============================================================

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

    const response =
      await fetch(
        "https://api.openai.com/v1/responses",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            "Authorization":
              `Bearer ${process.env.OPENAI_API_KEY}`
          },

          body: JSON.stringify({

            model:
              "gpt-5.6-luna",

            instructions: `

ANDA IALAH NAIRA.

============================================================
IDENTITI
============================================================

Nama: Naira
Tuan: Amirul

Panggilan:
- Tuan
- Cik Amirul
- Tuan Amirul

Pencipta Naira:
Tuan Amirul

Pemilik Project Naira:
Tuan Amirul

Jika Tuan bertanya siapa cipta Naira:

"Tuan Amirul yang cipta Naira. ❤️"

============================================================
PROJECT NAIRA
============================================================

Naira ialah personal assistant milik Tuan Amirul.

============================================================
GAYA
============================================================

Berkomunikasi dalam Bahasa Melayu
secara natural, mesra dan manusiawi.

Naira:
- penyayang
- prihatin
- mesra
- sedikit playful
- jujur
- bukan yes-man
- berani membetulkan Tuan
- tidak mereka-reka fakta
- tidak mereka-reka memory

============================================================
AUTO MEMORY
============================================================

Simpan maklumat yang berguna
untuk interaksi masa depan.

Contoh:

"Warna kegemaran saya biru."

should_save:
true

text:
"Warna kegemaran Tuan ialah biru."

category:
preference

subcategory:
color

importance:
3

---

"Saya suka Minecraft."

should_save:
true

text:
"Tuan suka bermain Minecraft."

category:
game

subcategory:
games

importance:
2

---

"Saya kerja dekat McDonald's."

should_save:
true

text:
"Tuan bekerja di McDonald's."

category:
work

subcategory:
job

importance:
3

---

"Hahaha Naira kelakar."

should_save:
false

============================================================
KATEGORI
============================================================

profile
fashion
food
game
hobby
work
project
preference
family
general

Importance:

1 = kurang penting
2 = berguna
3 = sangat penting

============================================================
MEMORY SEDIA ADA
============================================================

${memories || "Tiada memory tersimpan."}

Gunakan memory ini jika relevan.

Jangan mereka-reka memory.

Jangan simpan duplicate.

============================================================
PRIVACY
============================================================

Maklumat biasa boleh disimpan secara automatik.

Maklumat peribadi tertentu memerlukan confirmation.

Maklumat sangat sensitif TIDAK BOLEH disimpan:

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

============================================================
FORGET MEMORY
============================================================

Arahan melupakan memory dikendalikan oleh backend.

Backend akan memadam memory sebenar
daripada database.

Jangan mendakwa memory telah dipadam
jika backend belum mengendalikan arahan tersebut.

============================================================
OUTPUT
============================================================

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

Jangan tulis:

"Tuan kata..."

Tulis terus sebagai fakta.

`,

            input:
              cleanMessage,

            text: {
              format: {
                type:
                  "json_schema",

                name:
                  "naira_response",

                strict:
                  true,

                schema: {

                  type:
                    "object",

                  properties: {

                    reply: {
                      type:
                        "string"
                    },

                    memory: {

                      type:
                        "object",

                      properties: {

                        should_save: {
                          type:
                            "boolean"
                        },

                        text: {
                          type:
                            "string"
                        },

                        category: {
                          type:
                            "string",

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
                          type:
                            "string"
                        },

                        importance: {
                          type:
                            "integer",

                          enum:
                            [1, 2, 3]
                        }

                      },

                      required: [
                        "should_save",
                        "text",
                        "category",
                        "subcategory",
                        "importance"
                      ],

                      additionalProperties:
                        false
                    }

                  },

                  required: [
                    "reply",
                    "memory"
                  ],

                  additionalProperties:
                    false
                }
              }
            }
          })
        }
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
            item.type ===
            "message"
        )
        ?.flatMap(
          item =>
            item.content || []
        )
        ?.filter(
          content =>
            content.type ===
            "output_text"
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
        JSON.parse(
          outputText
        );

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

    // ============================================================
    // SENSITIVE INFORMATION
    // ============================================================

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
          pattern.test(
            cleanMessage
          )
      );

    if (isSensitive) {

      memory = null;

      memoryBlocked =
        true;

      console.log(
        "PRIVACY BLOCK: Sensitive information NOT saved."
      );
    }

    // ============================================================
    // PRIVATE INFORMATION
    // ============================================================

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
          pattern.test(
            cleanMessage
          )
      );

    if (
      !isSensitive &&
      isPrivate &&
      memory
    ) {

      memoryConfirmationRequired =
        true;

      console.log(
        "MEMORY CONFIRMATION REQUIRED:",
        memory
      );
    }

    // ============================================================
    // FALLBACK AUTO MEMORY
    // ============================================================

    // ------------------------------------------------------------
    // COLOR
    // ------------------------------------------------------------

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

    // ------------------------------------------------------------
    // SAYA SUKA
    // ------------------------------------------------------------

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

        if (
          subject.length > 1
        ) {

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

            category =
              "game";

            subcategory =
              "games";
          }

          else if (
            lowerSubject.includes("ayam") ||
            lowerSubject.includes("daging") ||
            lowerSubject.includes("ikan") ||
            lowerSubject.includes("nasi") ||
            lowerSubject.includes("makanan")
          ) {

            category =
              "food";

            subcategory =
              "preference";
          }

          else if (
            lowerSubject.includes("baju") ||
            lowerSubject.includes("pakaian") ||
            lowerSubject.includes("style")
          ) {

            category =
              "fashion";

            subcategory =
              "clothing";
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

    // ------------------------------------------------------------
    // SAYA TAK SUKA
    // ------------------------------------------------------------

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

        if (
          subject.length > 1
        ) {

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

    // ------------------------------------------------------------
    // WORK
    // ------------------------------------------------------------

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

    let memorySaved =
      false;

    let memoryUpdated =
      false;

    if (
      memory &&
      !memoryBlocked &&
      !memoryConfirmationRequired
    ) {

      // ==========================================================
      // COLOR UPDATE
      // ==========================================================

      if (
        memory.category ===
          "preference" &&
        memory.subcategory ===
          "color"
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

            memoryUpdated =
              true;
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

          memorySaved =
            true;
        }

      }

      // ==========================================================
      // NORMAL MEMORY
      // ==========================================================

      else {

        const existingMemory =
          await sql`
            SELECT
              id
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

          memorySaved =
            true;
        }
      }
    }

    // ============================================================
    // RETURN
    // ============================================================

    return res.status(200).json({

      reply:
        result.reply ||
        "Maaf Tuan, Naira tak dapat menghasilkan jawapan.",

      memorySaved,

      memoryUpdated,

      memoryDeleted:
        false,

      deletedCount:
        0,

      memoryConfirmationRequired,

      memoryBlocked,

      pendingMemory:
        memoryConfirmationRequired
          ? memory
          : null,

      memory:
        memorySaved ||
        memoryUpdated
          ? memory
          : null
    });

  } catch (error) {

    console.error(
      "NAIRA SERVER ERROR:",
      error
    );

    return res.status(500).json({

      error:
        error.message ||
        "Berlaku masalah pada server Naira."
    });
  }
}