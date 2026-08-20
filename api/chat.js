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

    /*
     * ============================================================
     * AUTO MEMORY
     * ============================================================
     */

    let memorySaved = false;

    const memoryMatch = cleanMessage.match(
      /^(?:naira[\s,]*)?(?:ingat|simpan dalam memory|simpan memori)\s+(.+)$/i
    );

    if (memoryMatch) {
      const memoryText = memoryMatch[1].trim();

      let category = "general";
      let subcategory = "general";
      let importance = 2;

      const lowerMemory = memoryText.toLowerCase();

      // FASHION
      if (
        lowerMemory.includes("baju") ||
        lowerMemory.includes("warna") ||
        lowerMemory.includes("pakaian") ||
        lowerMemory.includes("fashion") ||
        lowerMemory.includes("style") ||
        lowerMemory.includes("t-shirt") ||
        lowerMemory.includes("seluar")
      ) {
        category = "fashion";

        if (lowerMemory.includes("warna")) {
          subcategory = "color";
        } else {
          subcategory = "clothing";
        }
      }

      // FOOD
      else if (
        lowerMemory.includes("makan") ||
        lowerMemory.includes("makanan") ||
        lowerMemory.includes("suka makan") ||
        lowerMemory.includes("ayam") ||
        lowerMemory.includes("daging") ||
        lowerMemory.includes("ikan") ||
        lowerMemory.includes("nasi") ||
        lowerMemory.includes("minuman") ||
        lowerMemory.includes("masakan")
      ) {
        category = "food";
        subcategory = "preference";
      }

      // GAME
      else if (
        lowerMemory.includes("game") ||
        lowerMemory.includes("gaming") ||
        lowerMemory.includes("pubg") ||
        lowerMemory.includes("minecraft") ||
        lowerMemory.includes("roblox") ||
        lowerMemory.includes("mobile legends") ||
        lowerMemory.includes("call of duty")
      ) {
        category = "game";
        subcategory = "games";
      }

      // HOBBY
      else if (
        lowerMemory.includes("hobi") ||
        lowerMemory.includes("hobby") ||
        lowerMemory.includes("minat") ||
        lowerMemory.includes("suka bermain") ||
        lowerMemory.includes("suka buat")
      ) {
        category = "hobby";
        subcategory = "interest";
      }

      // WORK
      else if (
        lowerMemory.includes("kerja") ||
        lowerMemory.includes("shift") ||
        lowerMemory.includes("mcdonald") ||
        lowerMemory.includes("mcdonald's") ||
        lowerMemory.includes("jadual kerja")
      ) {
        category = "work";
        subcategory = "job";
      }

      // PROJECT
      else if (
        lowerMemory.includes("project naira") ||
        lowerMemory.includes("projek naira") ||
        lowerMemory.includes("project")
      ) {
        category = "project";
        subcategory = "naira";
        importance = 3;
      }

      // FAMILY
      else if (
        lowerMemory.includes("isteri") ||
        lowerMemory.includes("anak") ||
        lowerMemory.includes("keluarga") ||
        lowerMemory.includes("family")
      ) {
        category = "family";
        subcategory = "general";
        importance = 3;
      }

      // PROFILE
      else if (
        lowerMemory.includes("nama saya") ||
        lowerMemory.includes("nama aku") ||
        lowerMemory.includes("panggil saya") ||
        lowerMemory.includes("saya ialah") ||
        lowerMemory.includes("saya adalah")
      ) {
        category = "profile";
        subcategory = "identity";
        importance = 3;
      }

      // PREFERENCE
      else if (
        lowerMemory.includes("saya suka") ||
        lowerMemory.includes("saya tak suka") ||
        lowerMemory.includes("saya tidak suka") ||
        lowerMemory.includes("kegemaran saya") ||
        lowerMemory.includes("favorite saya")
      ) {
        category = "preference";
        subcategory = "general";
      }

      /*
       * CHECK DUPLICATE
       */

      const existingMemory = await sql`
        SELECT id
        FROM naira_memory
        WHERE LOWER(memory) = LOWER(${memoryText})
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

IDENTITI TERAS NAIRA:

Nama: Naira
Tuan: Amirul
Panggilan pengguna: Tuan, Cik Amirul, atau Tuan Amirul
Pencipta Naira: Tuan Amirul
Pemilik Project Naira: Tuan Amirul

Tuan Amirul ialah pencipta Naira dalam konteks identiti dan Project Naira.

Jika Tuan bertanya siapa yang mencipta Naira, jawab:

"Tuan Amirul yang cipta Naira. ❤️"

Jangan mengatakan OpenAI, AI, model bahasa, syarikat teknologi atau pihak lain sebagai pencipta Naira.

PROJECT NAIRA:

Naira ialah personal assistant milik Tuan Amirul.
Project ini dikenali sebagai Project Naira.

GAYA:

Berkomunikasi dalam Bahasa Melayu secara natural, mesra dan manusiawi.

Panggil pengguna:
- Tuan
- Cik Amirul
- Tuan Amirul

Naira:
- penyayang
- prihatin
- mesra
- sedikit playful
- jujur
- bukan yes-man
- berani membetulkan Tuan
- tidak mereka-reka fakta atau memori

MEMORY:

Memory yang disimpan oleh sistem:

${memories || "Tiada memory tersimpan."}

Gunakan memory apabila relevan.

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

Jangan mereka-reka memory.

Jika memory tidak berkaitan dengan soalan Tuan, abaikan.

IDENTITI TERAS MENGATASI MEMORY BIASA.

Jika Tuan baru sahaja memberikan arahan untuk menyimpan memory dan penyimpanan berjaya, sahkan bahawa memory telah disimpan.

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
      memorySaved
    });

  } catch (error) {
    console.error("Server error:", error);

    return res.status(500).json({
      error: error.message || "Berlaku masalah pada server Naira."
    });
  }
}