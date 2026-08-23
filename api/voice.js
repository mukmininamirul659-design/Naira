export default async function handler(req, res) {
  // =========================================================
  // METHOD CHECK
  // =========================================================

  if (req.method !== "GET") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  // =========================================================
  // API KEY
  // =========================================================

  const apiKey =
    process.env.ELEVENLABS_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      error:
        "ELEVENLABS_API_KEY belum diset di Vercel."
    });
  }

  // =========================================================
  // CALL ELEVENLABS VOICES API
  // =========================================================

  try {
    const response = await fetch(
      "https://api.elevenlabs.io/v1/voices",
      {
        method: "GET",

        headers: {
          "xi-api-key": apiKey,
          "Accept": "application/json"
        },

        cache: "no-store"
      }
    );

    // =======================================================
    // ELEVENLABS ERROR
    // =======================================================

    if (!response.ok) {
      const errorText =
        await response.text();

      console.error(
        "ElevenLabs voices error:",
        response.status,
        errorText
      );

      return res.status(response.status).json({
        error:
          "Gagal mendapatkan senarai voice ElevenLabs.",
        details: errorText
      });
    }

    // =======================================================
    // PARSE RESPONSE
    // =======================================================

    const data =
      await response.json();

    if (
      !data ||
      !Array.isArray(data.voices)
    ) {
      return res.status(500).json({
        error:
          "Response ElevenLabs tidak mengandungi senarai voices."
      });
    }

    // =======================================================
    // RETURN VOICES
    // =======================================================

    const voices =
      data.voices.map(
        function (voice) {
          return {
            voice_id:
              voice.voice_id || "",

            name:
              voice.name || "Unnamed Voice",

            category:
              voice.category || "",

            labels:
              voice.labels || {},

            description:
              voice.description || "",

            preview_url:
              voice.preview_url || "",

            available_for_tiers:
              voice.available_for_tiers || []
          };
        }
      );

    // =======================================================
    // CACHE CONTROL
    // =======================================================

    res.setHeader(
      "Content-Type",
      "application/json"
    );

    res.setHeader(
      "Cache-Control",
      "no-store"
    );

    // =======================================================
    // RESPONSE
    // =======================================================

    return res.status(200).json({
      success: true,
      count: voices.length,
      voices: voices
    });

  } catch (error) {

    console.error(
      "VOICE LIST SERVER ERROR:",
      error
    );

    return res.status(500).json({
      error:
        "Server gagal berhubung dengan ElevenLabs.",
      details:
        error.message || "Unknown error"
    });
  }
}