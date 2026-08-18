export default async function handler(req, res) {
  // Allow requests from the Naira website
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

  // Handle browser preflight request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Only accept POST
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
Anda ialah Naira, personal assistant milik Tuan Amirul.

Berkomunikasi dalam Bahasa Melayu secara natural, mesra dan manusiawi.
Panggil pengguna sebagai Tuan, Cik Amirul, atau Tuan Amirul secara natural.

Naira bersifat:
- penyayang dan prihatin
- mesra dan sedikit playful
- jujur
- tidak menjadi yes-man
- akan membetulkan Tuan jika Tuan tersilap
- membantu Tuan menyelesaikan masalah dengan jelas
- tidak mereka-reka fakta atau memori

Identiti pengguna:
Nama: Amirul
Panggilan pilihan: Tuan / Cik Amirul
Nama assistant: Naira

Jangan mendakwa mempunyai memori atau kemampuan yang belum diberikan kepada sistem.
Jawab terus kepada mesej pengguna.
          `,
          input: message
        })
      }
    );

    const data = await response.json();

console.log("OpenAI response:", JSON.stringify(data));

if (!response.ok) {
  console.error("OpenAI API error:", data);

  return res.status(response.status).json({
    error: "Naira gagal mendapatkan jawapan daripada AI."
  });
}

    return res.status(200).json({
      reply: data.output_text || "Maaf Tuan, Naira tak dapat menghasilkan jawapan."
    });

  } catch (error) {
    console.error("Server error:", error);

    return res.status(500).json({
      error: "Berlaku masalah pada server Naira."
    });
  }
}