export default async function handler(req, res) {
  // =========================================================
  // METHOD CHECK
  // =========================================================

  if (req.method !== "POST") {
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
      error: "ELEVENLABS_API_KEY belum diset di Vercel."
    });
  }

  // =========================================================
  // REQUEST DATA
  // =========================================================

  const {
    text,
    voiceId,
    modelId
  } = req.body || {};

  if (!text || !text.trim()) {
    return res.status(400).json({
      error: "Text diperlukan."
    });
  }

  // =========================================================
  // DEFAULT VOICE / MODEL
  // =========================================================

  const selectedVoice =
    voiceId ||
    "EXAVITQu4vr4xnSDxMaL";

  const selectedModel =
    modelId ||
    "eleven_multilingual_v2";

  // =========================================================
  // CALL ELEVENLABS
  // =========================================================

  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${selectedVoice}`,
      {
        method: "POST",

        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
          "Accept": "audio/mpeg"
        },

        body: JSON.stringify({
          text: text.trim(),

          model_id: selectedModel,

          voice_settings: {
            stability: 0.45,
            similarity_boost: 0.80,
            style: 0.25,
            use_speaker_boost: true
          }
        })
      }
    );

    // =======================================================
    // ELEVENLABS ERROR
    // =======================================================

    if (!response.ok) {
      const errorText =
        await response.text();

      console.error(
        "ElevenLabs error:",
        response.status,
        errorText
      );

      return res.status(response.status).json({
        error:
          "ElevenLabs gagal menghasilkan suara.",
        details: errorText
      });
    }

    // =======================================================
    // AUDIO RESULT
    // =======================================================

    const audioBuffer =
      Buffer.from(
        await response.arrayBuffer()
      );

    res.setHeader(
      "Content-Type",
      "audio/mpeg"
    );

    res.setHeader(
      "Content-Length",
      audioBuffer.length
    );

    res.setHeader(
      "Cache-Control",
      "no-store"
    );

    return res.status(200).send(
      audioBuffer
    );

  } catch (error) {

    console.error(
      "TTS server error:",
      error
    );

    return res.status(500).json({
      error:
        "Server gagal berhubung dengan ElevenLabs."
    });
  }
}