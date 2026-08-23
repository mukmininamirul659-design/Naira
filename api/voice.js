export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: "ELEVENLABS_API_KEY belum diset."
    });
  }
  try {
    const response = await fetch(
      "https://api.elevenlabs.io/v1/voices",
      {
        method: "GET",
        headers: {
          "xi-api-key": apiKey,
          "Accept": "application/json"
        }
      }
    );
    const data = await response.json();
    if (!response.ok) {
      console.error("ElevenLabs Voices Error:", data);
      return res.status(response.status).json({
        error: "Gagal mendapatkan senarai voice.",
        details: data
      });
    }
    return res.status(200).json({
      voices: data.voices || []
    });
  } catch (error) {
    console.error("Voice API Error:", error);
    return res.status(500).json({
      error: "Server gagal mendapatkan voices."
    });
  }
}