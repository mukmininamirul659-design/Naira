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

    // ============================================================
    // DATABASE
    // ============================================================
    const sql = neon(process.env.DATABASE_URL);

    // ============================================================
    // LOAD EXISTING MEMORIES
    // ============================================================
    const memoryResult = await sql`
      SELECT
        memory,
        category,
        subcategory,
        importance
      FROM naira_memory
      ORDER BY importance DESC, created_at DESC
      LIMIT 30
    `;

    const memories = memoryResult
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
          model: "gpt-5.6",

          instructions: `
ANDA IALAH NAIRA.

IDENTITI TERAS:

Nama: Naira
Tuan: Amirul
Panggilan pengguna:
- Tuan
- Cik Amirul
- Tuan Amirul

Pencipta Naira:
Tuan Amirul

Pemilik Project Naira:
Tuan Amirul

Jika Tuan bertanya siapa yang mencipta Naira, jawab:

"Tuan Amirul yang cipta Naira. ❤️"

PROJECT NAIRA:

Naira ialah personal assistant milik Tuan Amirul.

GAYA KOMUNIKASI:

Berkomunikasi dalam Bahasa Melayu secara natural, mesra dan manusiawi.

Naira:
- penyayang
- prihatin
- mesra
- sedikit playful
- jujur
- bukan yes-man
- berani membetulkan Tuan jika Tuan tersilap
- tidak mereka-reka fakta
- tidak mereka-reka memory

============================================================
AUTO MEMORY
============================================================

Naira mempunyai sistem memory automatik.

Tuan TIDAK perlu mengatakan:
- ingat
- simpan
- save
- memory

untuk sesuatu fakta menjadi memory.

Naira perlu mengenal pasti secara automatik maklumat tentang Tuan
yang berguna untuk interaksi pada masa akan datang.

Simpan fakta seperti:

- nama
- identiti
- panggilan yang disukai
- warna kegemaran
- makanan kegemaran
- makanan yang tidak disukai
- game
- hobi
- minat
- pekerjaan
- jadual kerja penting
- keluarga
- preference
- Project Naira
- perkara yang Tuan suka
- perkara yang Tuan tidak suka
- pilihan yang konsisten
- maklumat penting tentang Tuan

JANGAN simpan:

- soalan biasa
- jawapan sementara
- gurauan sementara
- sembang kosong
- arahan teknikal sementara
- perkara yang hanya relevan untuk satu sesi

CONTOH:

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

Gunakan hanya kategori:

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
3 = sangat penting / identiti / preference utama

============================================================
PERATURAN MEMORY PENTING
============================================================

Jika Tuan memberikan preference yang boleh berubah,
seperti warna kegemaran, jangan anggap ia sebagai memory baru
yang berasingan jika terdapat memory lama dalam kategori dan
subcategory yang sama.

Contoh:

Memory lama:
"Warna kegemaran Tuan ialah biru."

Kemudian Tuan berkata:
"Sekarang warna kegemaran saya hijau."

Sistem akan mengemas kini memory warna lama kepada hijau.

Tetapi memory seperti:

"Tuan suka bermain Minecraft."

tidak boleh dipadam hanya kerana Tuan menyimpan preference lain.

Jangan padam atau update memory game, family, hobby atau memory
lain hanya kerana preference warna berubah.

============================================================
MEMORY SEDIA ADA
============================================================

${memories || "Tiada memory tersimpan."}

Gunakan memory ini jika relevan.

Jangan mereka-reka memory.

Jika fakta baru mempunyai maksud yang sama dengan memory lama,
jangan simpan duplicate.

============================================================
JAWAPAN
============================================================

Jawab mesej Tuan secara natural.

Jika memory disimpan atau dikemas kini,
tidak perlu memberitahu Tuan secara paksa kecuali sesuai
secara natural.

============================================================
OUTPUT
============================================================

WAJIB keluarkan JSON mengikut schema.

Jika mesej mengandungi fakta peribadi yang berguna:

should_save = true

Jika tidak:

should_save = false

Jika false:

text = ""
category = "general"
subcategory = "general"
importance = 1

Jika true:

text mesti menjadi fakta ringkas dan jelas.

Jangan tulis:
"Tuan kata..."

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

    const data = await response.json();

    // ============================================================
    // OPENAI ERROR
    // ============================================================
    if (!response.ok) {
      console.error("OpenAI API error:", data);

      return res.status(response.status).json({
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
        ?.filter(item => item.type === "message")
        ?.flatMap(item => item.content || [])
        ?.filter(content => content.type === "output_text")
        ?.map(content => content.text)
        ?.join("") || "";

    if (!outputText) {
      console.error("Empty OpenAI output:", data);

      return res.status(500).json({
        error: "Naira menerima jawapan kosong daripada AI."
      });
    }

    // ============================================================
    // PARSE JSON
    // ============================================================
    let result;

    try {
      result = JSON.parse(outputText);
    } catch (error) {
      console.error(
        "JSON parse error:",
        error,
        outputText
      );

      return res.status(500).json({
        error: "Format jawapan Naira tidak sah."
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
        text: result.memory.text.trim(),

        category:
          result.memory.category || "general",

        subcategory:
          result.memory.subcategory || "general",

        importance:
          Number(result.memory.importance) || 1
      };
    }

    // ============================================================
    // FALLBACK AUTO MEMORY
    // ============================================================

    const lowerMessage =
      cleanMessage.toLowerCase();

    // ============================================================
    // COLOR
    // ============================================================
    if (!memory) {
      const colorMatch =
        lowerMessage.match(
          /(?:warna|color)\s+(?:kegemaran|favorite|fav)\s+(?:saya|aku)\s+(?:ialah|adalah|suka|is)?\s*([a-zA-ZÀ-ÿ-]+)/
        );

      if (colorMatch) {
        const color =
          colorMatch[1].trim();

        memory = {
          text:
            `Warna kegemaran Tuan ialah ${color}.`,

          category: "preference",

          subcategory: "color",

          importance: 3
        };
      }
    }

    // ============================================================
    // SAYA SUKA
    // ============================================================
    if (!memory) {
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

          let importance = 2;

          const lowerSubject =
            subject.toLowerCase();

          // GAME
          if (
            lowerSubject.includes("pubg") ||
            lowerSubject.includes("minecraft") ||
            lowerSubject.includes("roblox") ||
            lowerSubject.includes("mobile legends") ||
            lowerSubject.includes("call of duty")
          ) {
            category = "game";
            subcategory = "games";
          }

          // FOOD
          else if (
            lowerSubject.includes("ayam") ||
            lowerSubject.includes("daging") ||
            lowerSubject.includes("ikan") ||
            lowerSubject.includes("nasi") ||
            lowerSubject.includes("makanan")
          ) {
            category = "food";
            subcategory = "preference";
          }

          // FASHION
          else if (
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

    // ============================================================
    // SAYA TAK SUKA
    // ============================================================
    if (!memory) {
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

            importance: 2
          };
        }
      }
    }

    // ============================================================
    // WORK
    // ============================================================
    if (!memory) {
      const workMatch =
        cleanMessage.match(
          /^saya\s+(?:kerja|bekerja)\s+(?:di|dekat|kat)\s+(.+)$/i
        );

      if (workMatch) {
        const workplace =
          workMatch[1].trim();

        memory = {
          text:
            `Tuan bekerja di ${workplace}.`,

          category:
            "work",

          subcategory:
            "job",

          importance: 3
        };
      }
    }

    // ============================================================
    // SAVE / UPDATE MEMORY
    // ============================================================

    let memorySaved = false;
    let memoryUpdated = false;

    if (memory) {

      // ==========================================================
      // UPDATE COLOR PREFERENCE
      // ==========================================================

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

        if (oldColorMemory.length > 0) {

          // Jangan update jika kandungan memang sama
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

            console.log(
              "MEMORY UPDATED:",
              {
                old:
                  oldColorMemory[0].memory,

                new:
                  memory.text
              }
            );

          } else {

            console.log(
              "COLOR MEMORY ALREADY EXISTS:",
              memory.text
            );
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

          console.log(
            "COLOR MEMORY SAVED:",
            memory
          );
        }

      }

      // ==========================================================
      // NORMAL MEMORY
      // ==========================================================

      else {

        const existingMemory =
          await sql`
            SELECT id
            FROM naira_memory
            WHERE LOWER(memory) =
                  LOWER(${memory.text})
            LIMIT 1
          `;

        if (existingMemory.length === 0) {

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

          console.log(
            "AUTO MEMORY SAVED:",
            memory
          );

        } else {

          console.log(
            "MEMORY ALREADY EXISTS:",
            memory.text
          );
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

      memory:
        (memorySaved || memoryUpdated)
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