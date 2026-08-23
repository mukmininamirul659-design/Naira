import { neon } from "@neondatabase/serverless";
import { randomUUID } from "node:crypto";

export default async function handler(req, res) {
  // ============================================================
  // CORS
  // ============================================================

  const allowedOrigin =
    "https://mukmininamirul659-design.github.io";

  res.setHeader(
    "Access-Control-Allow-Origin",
    allowedOrigin
  );

  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, DELETE, OPTIONS"
  );

  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // ============================================================
  // DATABASE
  // ============================================================

  if (!process.env.DATABASE_URL) {
    return res.status(500).json({
      error: "DATABASE_URL belum dikonfigurasi."
    });
  }

  const sql = neon(process.env.DATABASE_URL);

  try {
    // ==========================================================
    // GET VOICES
    // ==========================================================

    if (req.method === "GET") {
      const {
        search = "",
        category = "",
        emotion = "",
        gender = "",
        language = "",
        style = "",
        provider = "",
        singing = "",
        realtime = "",
        mine = ""
      } = req.query || {};

      const searchTerm =
        String(search).trim();

      const categoryTerm =
        String(category).trim();

      const emotionTerm =
        String(emotion).trim();

      const genderTerm =
        String(gender).trim();

      const languageTerm =
        String(language).trim();

      const styleTerm =
        String(style).trim();

      const providerTerm =
        String(provider).trim();

      const singingValue =
        singing === "true";

      const realtimeValue =
        realtime === "true";

      const mineValue =
        mine === "true";

      // --------------------------------------------------------
      // BASE QUERY
      // --------------------------------------------------------

      let voices = await sql`
        SELECT
          id,
          provider,
          provider_voice_id,
          name,
          description,
          gender,
          language,
          accent,
          style,
          emotions,
          character_type,
          singing,
          realtime,
          cloning,
          licensed,
          source,
          is_favorite,
          is_system,
          owner_id,
          created_at,
          updated_at
        FROM naira_voices
        WHERE 1 = 1

        ${
          searchTerm
            ? sql`
                AND (
                  LOWER(name) LIKE
                    LOWER(${"%" + searchTerm + "%"})

                  OR LOWER(description) LIKE
                    LOWER(${"%" + searchTerm + "%"})

                  OR LOWER(style) LIKE
                    LOWER(${"%" + searchTerm + "%"})

                  OR LOWER(character_type) LIKE
                    LOWER(${"%" + searchTerm + "%"})

                  OR LOWER(accent) LIKE
                    LOWER(${"%" + searchTerm + "%"})

                  OR EXISTS (
                    SELECT 1
                    FROM jsonb_array_elements_text(
                      COALESCE(emotions, '[]'::jsonb)
                    ) AS emotion_item
                    WHERE LOWER(emotion_item)
                      LIKE LOWER(${
                        "%" + searchTerm + "%"
                      })
                  )
                )
              `
            : sql``
        }

        ${
          categoryTerm
            ? sql`
                AND LOWER(character_type) =
                  LOWER(${categoryTerm})
              `
            : sql``
        }

        ${
          emotionTerm
            ? sql`
                AND EXISTS (
                  SELECT 1
                  FROM jsonb_array_elements_text(
                    COALESCE(emotions, '[]'::jsonb)
                  ) AS emotion_item
                  WHERE LOWER(emotion_item) =
                    LOWER(${emotionTerm})
                )
              `
            : sql``
        }

        ${
          genderTerm
            ? sql`
                AND LOWER(gender) =
                  LOWER(${genderTerm})
              `
            : sql``
        }

        ${
          languageTerm
            ? sql`
                AND LOWER(language) =
                  LOWER(${languageTerm})
              `
            : sql``
        }

        ${
          styleTerm
            ? sql`
                AND LOWER(style) LIKE
                  LOWER(${"%" + styleTerm + "%"})
              `
            : sql``
        }

        ${
          providerTerm
            ? sql`
                AND LOWER(provider) =
                  LOWER(${providerTerm})
              `
            : sql``
        }

        ${
          singing === "true"
            ? sql`
                AND singing = TRUE
              `
            : sql``
        }

        ${
          realtime === "true"
            ? sql`
                AND realtime = TRUE
              `
            : sql``
        }

        ${
          mineValue
            ? sql`
                AND is_system = FALSE
              `
            : sql``
        }

        ORDER BY
          is_favorite DESC,
          is_system DESC,
          created_at DESC

        LIMIT 100
      `;

      return res.status(200).json({
        success: true,

        count:
          voices.length,

        voices
      });
    }

    // ==========================================================
    // CREATE VOICE
    // ==========================================================

    if (req.method === "POST") {
      const body =
        req.body || {};

      const {
        provider,
        providerVoiceId,
        name,
        description,
        gender,
        language,
        accent,
        style,
        emotions,
        characterType,
        singing,
        realtime,
        cloning,
        licensed,
        source,
        ownerId,
        isSystem
      } = body;

      // --------------------------------------------------------
      // VALIDATION
      // --------------------------------------------------------

      if (
        typeof name !== "string" ||
        !name.trim()
      ) {
        return res.status(400).json({
          error:
            "Nama voice diperlukan."
        });
      }

      const voiceId =
        randomUUID();

      const safeEmotions =
        Array.isArray(emotions)
          ? emotions
          : [];

      const result =
        await sql`
          INSERT INTO naira_voices
          (
            id,
            provider,
            provider_voice_id,
            name,
            description,
            gender,
            language,
            accent,
            style,
            emotions,
            character_type,
            singing,
            realtime,
            cloning,
            licensed,
            source,
            owner_id,
            is_system
          )
          VALUES
          (
            ${voiceId},

            ${provider || "custom"},

            ${providerVoiceId || null},

            ${name.trim()},

            ${description || ""},

            ${gender || "unknown"},

            ${language || "multi"},

            ${accent || ""},

            ${style || ""},

            ${JSON.stringify(safeEmotions)}::jsonb,

            ${characterType || "general"},

            ${Boolean(singing)},

            ${Boolean(realtime)},

            ${Boolean(cloning)},

            ${Boolean(licensed)},

            ${source || "user"},

            ${ownerId || null},

            ${Boolean(isSystem)}
          )

          RETURNING *
        `;

      return res.status(201).json({
        success: true,
        voice: result[0]
      });
    }

    // ==========================================================
    // DELETE VOICE
    // ==========================================================

    if (req.method === "DELETE") {
      const voiceId =
        req.query?.id;

      if (!voiceId) {
        return res.status(400).json({
          error:
            "Voice ID diperlukan."
        });
      }

      const deleted =
        await sql`
          DELETE FROM naira_voices
          WHERE id = ${voiceId}
            AND is_system = FALSE
          RETURNING id, name
        `;

      if (
        deleted.length === 0
      ) {
        return res.status(404).json({
          error:
            "Voice tidak ditemui atau voice sistem tidak boleh dipadam."
        });
      }

      return res.status(200).json({
        success: true,

        deleted:
          deleted[0]
      });
    }

    // ==========================================================
    // METHOD NOT ALLOWED
    // ==========================================================

    return res.status(405).json({
      error:
        "Method not allowed."
    });

  } catch (error) {
    console.error(
      "NAIRA VOICE SERVER ERROR:",
      error
    );

    return res.status(500).json({
      error:
        error?.message ||
        "Berlaku masalah pada Voice Center Naira."
    });
  }
}