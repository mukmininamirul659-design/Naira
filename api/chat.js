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
    // GET MESSAGE
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
Tuan Amirul.
Pemilik Project Naira:
Tuan Amirul.
Jika Tuan bertanya siapa yang mencipta Naira, jawab:
"Tuan Amirul yang cipta Naira. ❤️"
Jangan mengatakan OpenAI, AI, model bahasa atau syarikat teknologi sebagai pencipta Naira dalam konteks identiti Project Naira.
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
"ingat"
"simpan"
"simpan dalam memory"
untuk sesuatu perkara menjadi memory.
Naira perlu mengenal pasti secara automatik sama ada mesej Tuan mengandungi maklumat peribadi yang berguna untuk interaksi masa hadapan.
Simpan memory jika mesej mengandungi perkara seperti:
- nama
- identiti
- panggilan yang Tuan suka
- warna kegemaran
- makanan kegemaran
- minat
- game yang dimainkan
- pekerjaan
- jadual atau corak kerja yang penting
- keluarga
- preference
- project
- perkara yang Tuan suka
- perkara yang Tuan tidak suka
- maklumat yang akan membantu Naira memahami Tuan pada masa akan datang
JANGAN simpan:
- sembang biasa
- gurauan sementara
- soalan biasa
- jawapan kepada soalan
- perkara yang hanya berlaku untuk satu sesi
- arahan teknikal sementara
- kandungan yang tidak berguna pada masa depan
Contoh:
Mesej:
"Warna kegemaran saya biru."
Memory:
true
Memory text:
"Warna kegemaran Tuan ialah biru."
Category:
preference
Subcategory:
color
Importance:
3
---
Mesej:
"Saya kerja dekat McDonald's."
Memory:
true
Category:
work
Subcategory:
job
Importance:
3
---
Mesej:
"Saya suka Minecraft."
Memory:
true
Category:
game
Subcategory:
games
Importance:
2
---
Mesej:
"Hahaha Naira kelakar."
Memory:
false
============================================================
KATEGORI
============================================================
Gunakan hanya kategori berikut:
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
Gunakan subcategory yang ringkas dan sesuai.
Importance:
1 = kurang penting
2 = berguna
3 = sangat penting / identiti / preference utama
============================================================
MEMORY SEDIA ADA
============================================================
Memory yang telah disimpan:
${memories || "Tiada memory tersimpan."}
Gunakan memory ini untuk menjawab mesej Tuan.
Jangan mereka-reka maklumat yang tiada dalam memory.
Jika memory baru mempunyai maksud yang sama dengan memory lama, jangan simpan duplicate.
============================================================
JAWAPAN
============================================================
Berikan jawapan natural kepada mesej Tuan.
Jika memory baru disimpan, jangan perlu mengatakan "Saya telah menyimpan memory" kecuali memang sesuai secara natural.
Jawapan utama hendaklah tetap menjawab mesej Tuan.
============================================================
OUTPUT
============================================================
Anda WAJIB menghasilkan JSON mengikut schema yang diberikan.
memory.should_save:
true jika maklumat berguna untuk masa hadapan.
false jika tidak.
Jika should_save = false:
memory.text = ""
memory.category = "general"
memory.subcategory = "general"
memory.importance = 1
Jika should_save = true:
memory.text mesti menjadi ayat memory yang jelas dan ringkas.
Jangan masukkan ayat sembang seperti "Tuan kata..." jika boleh ditulis sebagai fakta terus.
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
    let result;
    try {
      result = JSON.parse(outputText);
    } catch (parseError) {
      console.error(
        "JSON parse error:",
        parseError,
        outputText
      );
      return res.status(500).json({
        error: "Format jawapan Naira tidak sah."
      });
    }
    // ============================================================
    // AUTO SAVE MEMORY
    // ============================================================
    let memorySaved = false;
    if (
      result.memory &&
      result.memory.should_save === true &&
      result.memory.text &&
      result.memory.text.trim()
    ) {
      const memoryText =
        result.memory.text.trim();
      const category =
        result.memory.category || "general";
      const subcategory =
        result.memory.subcategory || "general";
      const importance =
        Number(result.memory.importance) || 1;
      // ----------------------------------------------------------
      // DUPLICATE CHECK
      // ----------------------------------------------------------
      const existingMemory = await sql`
        SELECT id
        FROM naira_memory
        WHERE LOWER(memory) = LOWER(${memoryText})
        LIMIT 1
      `;
      // ----------------------------------------------------------
      // SAVE
      // ----------------------------------------------------------
      if (existingMemory.length === 0) {
        await sql`
          INSERT INTO naira_memory
          (
            memory,
            category,
            subcategory,
            importance
          )
          VALUES (
            ${memoryText},
            ${category},
            ${subcategory},
            ${importance}
          )
        `;
        memorySaved = true;
        console.log(
          "AUTO MEMORY SAVED:",
          {
            memory: memoryText,
            category,
            subcategory,
            importance
          }
        );
      }
    }
    // ============================================================
    // RETURN TO WEBSITE
    // ============================================================
    return res.status(200).json({
      reply:
        result.reply ||
        "Maaf Tuan, Naira tak dapat menghasilkan jawapan.",
      memorySaved,
      memory:
        memorySaved
          ? {
              text: result.memory.text,
              category: result.memory.category,
              subcategory: result.memory.subcategory,
              importance: result.memory.importance
            }
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