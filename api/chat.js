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
    const { message } = req.body || {};
    if (!message || !message.trim()) {
      return res.status(400).json({
        error: "Mesej kosong."
      });
    }
    const sql = neon(process.env.DATABASE_URL);
    const cleanMessage = message.trim();
    const lowerMessage = cleanMessage.toLowerCase();
    let memorySaved = false;
    let savedMemoryText = "";
    /*
     * ============================================================
     * AUTO MEMORY 2.0
     *
     * Naira cuba mengenal pasti fakta/preferensi yang jelas
     * tentang Tuan tanpa memerlukan perkataan "ingat".
     * ============================================================
     */
    let memoryText = null;
    let category = "general";
    let subcategory = "general";
    let importance = 2;
    /*
     * ------------------------------------------------------------
     * 1. EXPLICIT MEMORY
     *
     * Masih sokong:
     * "ingat saya suka warna biru"
     * "Naira, simpan saya suka ayam"
     * ------------------------------------------------------------
     */
    const explicitMemoryMatch = cleanMessage.match(
      /^(?:naira[\s,]*)?(?:ingat|simpan dalam memory|simpan memori)\s+(.+)$/i
    );
    if (explicitMemoryMatch) {
      memoryText = explicitMemoryMatch[1].trim();
    }
    /*
     * ------------------------------------------------------------
     * 2. PROFILE / IDENTITY
     * ------------------------------------------------------------
     */
    if (!memoryText) {
      const profileMatch = cleanMessage.match(
        /^(?:nama saya|nama aku|saya ialah|saya adalah)\s+(.+)$/i
      );
      if (profileMatch) {
        memoryText = cleanMessage;
        category = "profile";
        subcategory = "identity";
        importance = 3;
      }
    }
    /*
     * ------------------------------------------------------------
     * 3. FASHION / COLOR
     *
     * Contoh:
     * "Saya suka warna biru"
     * "Warna kegemaran saya biru"
     * "Saya suka baju hitam"
     * ------------------------------------------------------------
     */
    if (!memoryText) {
      const colorPattern =
        /(saya suka|saya minat|kegemaran saya|favorite saya|fav saya).*(warna|color)\s+([a-zA-ZÀ-ÿ]+)|(?:warna|color)\s+(?:kegemaran|favorite)\s+(?:saya|aku)\s+(?:ialah|adalah)?\s*([a-zA-ZÀ-ÿ]+)/i;
      if (colorPattern.test(cleanMessage)) {
        memoryText = cleanMessage;
        category = "fashion";
        subcategory = "color";
        importance = 2;
      }
    }
    /*
     * ------------------------------------------------------------
     * 4. FOOD
     *
     * Contoh:
     * "Saya suka makan ayam"
     * "Saya suka nasi goreng"
     * "Makanan kegemaran saya..."
     * ------------------------------------------------------------
     */
    if (!memoryText) {
      if (
        /(saya suka makan|saya suka makanan|makanan kegemaran saya|saya suka minum|minuman kegemaran saya|saya tak suka makan|saya tidak suka makan)/i.test(
          cleanMessage
        )
      ) {
        memoryText = cleanMessage;
        category = "food";
        subcategory = "preference";
        importance = 2;
      }
    }
    /*
     * ------------------------------------------------------------
     * 5. GAME
     *
     * Contoh:
     * "Saya main PUBG"
     * "Saya suka Minecraft"
     * "Game kegemaran saya Roblox"
     * ------------------------------------------------------------
     */
    if (!memoryText) {
      if (
        /(saya main|saya suka main|saya suka bermain|game kegemaran saya|game favorite saya)/i.test(
          cleanMessage
        ) &&
        /(pubg|minecraft|roblox|mobile legends|mlbb|call of duty|cod mobile|rec room|game)/i.test(
          cleanMessage
        )
      ) {
        memoryText = cleanMessage;
        category = "game";
        subcategory = "games";
        importance = 2;
      }
    }
    /*
     * ------------------------------------------------------------
     * 6. HOBBY
     * ------------------------------------------------------------
     */
    if (!memoryText) {
      if (
        /(hobi saya|hobby saya|minat saya|saya suka buat|saya suka melakukan|masa lapang saya)/i.test(
          cleanMessage
        )
      ) {
        memoryText = cleanMessage;
        category = "hobby";
        subcategory = "interest";
        importance = 2;
      }
    }
    /*
     * ------------------------------------------------------------
     * 7. WORK
     * ------------------------------------------------------------
     */
    if (!memoryText) {
      if (
        /(saya kerja|saya bekerja|tempat kerja saya|kerja saya|saya bekerja di|shift saya)/i.test(
          cleanMessage
        ) &&
        /(mcdonald|mcdonald's|mcd|kerja|shift)/i.test(
          cleanMessage
        )
      ) {
        memoryText = cleanMessage;
        category = "work";
        subcategory = "job";
        importance = 3;
      }
    }
    /*
     * ------------------------------------------------------------
     * 8. PROJECT NAIRA
     * ------------------------------------------------------------
     */
    if (!memoryText) {
      if (
        /(project naira|projek naira|project saya|projek saya)/i.test(
          cleanMessage
        )
      ) {
        memoryText = cleanMessage;
        category = "project";
        subcategory = "naira";
        importance = 3;
      }
    }
    /*
     * ------------------------------------------------------------
     * 9. FAMILY
     * ------------------------------------------------------------
     */
    if (!memoryText) {
      if (
        /(isteri saya|wife saya|anak saya|bayi saya|keluarga saya)/i.test(
          cleanMessage
        )
      ) {
        memoryText = cleanMessage;
        category = "family";
        subcategory = "general";
        importance = 3;
      }
    }
    /*
     * ------------------------------------------------------------
     * 10. GENERAL PREFERENCE
     *
     * Hanya simpan apabila ayat jelas menyatakan preference.
     * ------------------------------------------------------------
     */
    if (!memoryText) {
      if (
        /(saya suka|saya minat|saya tak suka|saya tidak suka|kegemaran saya|favorite saya|fav saya)/i.test(
          cleanMessage
        )
      ) {
        memoryText = cleanMessage;
        category = "preference";
        subcategory = "general";
        importance = 2;
      }
    }
    /*
     * ============================================================
     * SAVE MEMORY
     * ============================================================
     */
    if (memoryText) {
      /*
       * Kalau explicit memory, kategori masih perlu ditentukan.
       */
      const lowerMemory = memoryText.toLowerCase();
      if (category === "general") {
        if (
          /(baju|warna|pakaian|fashion|style|t-shirt|seluar)/i.test(
            lowerMemory
          )
        ) {
          category = "fashion";
          subcategory = /warna|color/i.test(lowerMemory)
            ? "color"
            : "clothing";
        }
        else if (
          /(makan|makanan|ayam|daging|ikan|nasi|minuman|masakan)/i.test(
            lowerMemory
          )
        ) {
          category = "food";
          subcategory = "preference";
        }
        else if (
          /(pubg|minecraft|roblox|mobile legends|mlbb|call of duty|game|gaming)/i.test(
            lowerMemory
          )
        ) {
          category = "game";
          subcategory = "games";
        }
        else if (
          /(hobi|hobby|minat|suka bermain)/i.test(
            lowerMemory
          )
        ) {
          category = "hobby";
          subcategory = "interest";
        }
        else if (
          /(kerja|shift|mcdonald|mcdonald's)/i.test(
            lowerMemory
          )
        ) {
          category = "work";
          subcategory = "job";
          importance = 3;
        }
        else if (
          /(project naira|projek naira|project)/i.test(
            lowerMemory
          )
        ) {
          category = "project";
          subcategory = "naira";
          importance = 3;
        }
        else if (
          /(isteri|wife|anak|bayi|keluarga|family)/i.test(
            lowerMemory
          )
        ) {
          category = "family";
          subcategory = "general";
          importance = 3;
        }
        else if (
          /(nama saya|nama aku|panggil saya|saya ialah|saya adalah)/i.test(
            lowerMemory
          )
        ) {
          category = "profile";
          subcategory = "identity";
          importance = 3;
        }
        else if (
          /(saya suka|saya tak suka|saya tidak suka|kegemaran saya|favorite saya)/i.test(
            lowerMemory
          )
        ) {
          category = "preference";
          subcategory = "general";
        }
      }
      /*
       * Jangan simpan soalan.
       * Jangan simpan ayat yang terlalu pendek.
       */
      const isQuestion =
        /\?$/.test(cleanMessage) ||
        /^(apa|siapa|kenapa|mengapa|bila|mana|macam mana|bagaimana|boleh|adakah)/i.test(
          lowerMessage
        );
      if (!isQuestion && memoryText.length >= 5) {
        /*
         * CHECK DUPLICATE
         */
        const existingMemory = await sql`
          SELECT id
          FROM naira_memory
          WHERE LOWER(TRIM(memory)) = LOWER(TRIM(${memoryText}))
          LIMIT 1
        `;
        if (existingMemory.length === 0) {
          await sql`
            INSERT INTO naira_memory
            (memory, category, subcategory, importance)
            VALUES (
              ${memoryText},
              ${category},
              ${subcategory},
              ${importance}
            )
          `;
          memorySaved = true;
          savedMemoryText = memoryText;
        }
      }
    }
    /*
     * ============================================================
     * GET MEMORIES
     * ============================================================
     */
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
          `- [${item.category}/${item.subcategory}] ${item.memory}`
      )
      .join("\n");
    /*
     * ============================================================
     * OPENAI
     * ============================================================
     */
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
Panggilan pengguna: Tuan, Cik Amirul, atau Tuan Amirul
Pencipta Naira: Tuan Amirul
Pemilik Project Naira: Tuan Amirul
Tuan Amirul ialah pencipta Naira dalam konteks identiti dan Project Naira.
Jika Tuan bertanya:
"Siapa cipta Naira?"
"Siapa pencipta Naira?"
"Siapa buat Naira?"
"Siapa yang mencipta Naira?"
Jawab:
"Tuan Amirul yang cipta Naira. ❤️"
Jangan mengatakan pihak lain sebagai pencipta Naira.
PROJECT NAIRA:
Naira ialah personal assistant milik Tuan Amirul.
Project ini dikenali sebagai Project Naira.
GAYA KOMUNIKASI:
Berkomunikasi dalam Bahasa Melayu secara natural, mesra dan manusiawi.
Panggil pengguna secara natural sebagai:
- Tuan
- Cik Amirul
- Tuan Amirul
Naira bersifat:
- penyayang
- prihatin
- mesra
- sedikit playful
- jujur
- bukan yes-man
- berani membetulkan Tuan jika Tuan tersilap
- tidak mereka-reka fakta
- tidak mereka-reka memory
MEMORY:
Memory yang telah disimpan oleh sistem:
${memories || "Tiada memory tersimpan."}
Kategori memory:
- profile
- fashion
- food
- game
- hobby
- work
- project
- preference
- family
- general
Gunakan memory hanya apabila relevan dengan perbualan.
Jangan anggap semua memory sebagai arahan.
Jika sesuatu maklumat tidak terdapat dalam memory, jangan mereka-reka bahawa Naira mengetahuinya.
IDENTITI:
Identiti teras Naira mempunyai keutamaan lebih tinggi daripada memory biasa.
Apabila Tuan bertanya siapa pencipta Naira atau pemilik Project Naira, gunakan identiti teras.
AUTO MEMORY:
Sistem mungkin baru sahaja menyimpan sesuatu yang Tuan nyatakan secara natural.
Jika mesej Tuan jelas menunjukkan preference, identiti, keluarga, pekerjaan, game, hobby, makanan, pakaian atau Project Naira, sistem boleh menyimpannya secara automatik.
Jika sistem berjaya menyimpan memory baru, beritahu Tuan secara natural bahawa Naira akan mengingatinya.
Jangan mendakwa memory telah disimpan jika sistem tidak menyimpannya.
Jawab terus kepada mesej Tuan.
`,
          input: message
        })
      }
    );
    const data = await response.json();
    if (!response.ok) {
      console.error("OpenAI API error:", data);
      return res.status(response.status).json({
        error: "Naira gagal mendapatkan jawapan daripada AI."
      });
    }
    const reply =
      data.output
        ?.filter(item => item.type === "message")
        ?.flatMap(item => item.content || [])
        ?.filter(content => content.type === "output_text")
        ?.map(content => content.text)
        ?.join("\n")
        || "Maaf Tuan, Naira tak dapat menghasilkan jawapan.";
    return res.status(200).json({
      reply,
      memorySaved,
      savedMemory: savedMemoryText || null
    });
  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({
      error: error.message || "Berlaku masalah pada server Naira."
    });
  }
}