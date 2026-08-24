import formidable from "formidable";
import fs from "fs";


/* ============================================================
   VERCEL CONFIG
   IMPORTANT:
   Disable default body parser supaya multipart/form-data
   boleh dibaca oleh formidable.
============================================================ */

export const config = {
  api: {
    bodyParser: false
  }
};


/* ============================================================
   HELPERS
============================================================ */

function firstValue(value) {

  if (Array.isArray(value)) {
    return value[0] || "";
  }

  return value || "";
}


function getFiles(value) {

  if (!value) {
    return [];
  }

  return Array.isArray(value)
    ? value
    : [value];
}


function parseForm(req) {

  return new Promise(
    function(resolve, reject) {

      const form =
        formidable({
          multiples: true,

          keepExtensions: true,

          maxFiles: 5,

          /*
           * 50 MB per file.
           * Boleh kecilkan kemudian kalau perlu.
           */

          maxFileSize:
            50 * 1024 * 1024,

          maxTotalFileSize:
            100 * 1024 * 1024
        });


      form.parse(
        req,
        function(error, fields, files) {

          if (error) {
            reject(error);
            return;
          }

          resolve({
            fields,
            files
          });

        }
      );

    }
  );

}


/* ============================================================
   GET VOICES
============================================================ */

async function handleGet(
  req,
  res,
  apiKey
) {

  try {

    const response =
      await fetch(
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


    if (!response.ok) {

      const errorText =
        await response.text();


      console.error(
        "ELEVENLABS VOICES ERROR:",
        response.status,
        errorText
      );


      return res
        .status(response.status)
        .json({
          success: false,

          error:
            "Gagal mendapatkan senarai voice ElevenLabs.",

          details:
            errorText
        });

    }


    const data =
      await response.json();


    if (
      !data ||
      !Array.isArray(data.voices)
    ) {

      return res
        .status(500)
        .json({
          success: false,

          error:
            "Response ElevenLabs tidak mengandungi senarai voices."
        });

    }


    const voices =
      data.voices.map(
        function(voice) {

          return {

            voice_id:
              voice.voice_id || "",

            name:
              voice.name ||
              "Unnamed Voice",

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


    res.setHeader(
      "Cache-Control",
      "no-store"
    );


    return res
      .status(200)
      .json({

        success: true,

        count:
          voices.length,

        voices:
          voices

      });


  } catch (error) {

    console.error(
      "VOICE LIST SERVER ERROR:",
      error
    );


    return res
      .status(500)
      .json({

        success: false,

        error:
          "Server gagal berhubung dengan ElevenLabs.",

        details:
          error.message ||
          "Unknown error"

      });

  }

}


/* ============================================================
   CREATE / CLONE VOICE
============================================================ */

async function handlePost(
  req,
  res,
  apiKey
) {

  let parsed;


  try {

    parsed =
      await parseForm(req);

  } catch (error) {

    console.error(
      "MULTIPART PARSE ERROR:",
      error
    );


    return res
      .status(400)
      .json({

        success: false,

        error:
          "Fail audio tidak dapat dibaca.",

        details:
          error.message ||
          "Multipart parsing failed."

      });

  }


  const fields =
    parsed.fields || {};


  const uploadedFiles =
    parsed.files || {};


  /* ==========================================================
     VOICE NAME
  ========================================================== */

  const voiceName =
    String(
      firstValue(
        fields.name
      )
    ).trim();


  if (!voiceName) {

    return res
      .status(400)
      .json({

        success: false,

        error:
          "Nama voice diperlukan."

      });

  }


  if (
    voiceName.length > 100
  ) {

    return res
      .status(400)
      .json({

        success: false,

        error:
          "Nama voice terlalu panjang."

      });

  }


  /* ==========================================================
     DESCRIPTION
  ========================================================== */

  const description =
    String(
      firstValue(
        fields.description
      )
    )
      .trim()
      .slice(
        0,
        500
      );


  /* ==========================================================
     REMOVE BACKGROUND NOISE
  ========================================================== */

  const removeNoiseValue =
    String(
      firstValue(
        fields.remove_background_noise
      )
    ).toLowerCase();


  const removeBackgroundNoise =
    (
      removeNoiseValue === "true" ||
      removeNoiseValue === "1" ||
      removeNoiseValue === "yes"
    );


  /* ==========================================================
     CONSENT
  ========================================================== */

  const consentValue =
    String(
      firstValue(
        fields.consent
      )
    ).toLowerCase();


  const consent =
    (
      consentValue === "true" ||
      consentValue === "1" ||
      consentValue === "yes"
    );


  /*
   * App kita hanya benarkan cloning apabila
   * pengguna mengesahkan mereka mempunyai
   * hak / kebenaran terhadap suara tersebut.
   */

  if (!consent) {

    return res
      .status(400)
      .json({

        success: false,

        error:
          "Pengesahan kebenaran pemilik suara diperlukan."

      });

  }


  /* ==========================================================
     GET AUDIO FILES

     Frontend nanti akan menggunakan field:
     files
  ========================================================== */

  let audioFiles =
    getFiles(
      uploadedFiles.files
    );


  /*
   * Compatibility:
   * accept "file" too.
   */

  if (!audioFiles.length) {

    audioFiles =
      getFiles(
        uploadedFiles.file
      );

  }


  if (!audioFiles.length) {

    return res
      .status(400)
      .json({

        success: false,

        error:
          "Pilih sekurang-kurangnya satu fail audio."

      });

  }


  /* ==========================================================
     VALIDATE FILES
  ========================================================== */

  const allowedMimeTypes =
    new Set([

      "audio/mpeg",
      "audio/mp3",
      "audio/wav",
      "audio/x-wav",
      "audio/wave",
      "audio/mp4",
      "audio/x-m4a",
      "audio/aac",
      "audio/ogg",
      "audio/webm"

    ]);


  const allowedExtensions =
    new Set([

      "mp3",
      "wav",
      "m4a",
      "aac",
      "ogg",
      "webm",
      "mp4"

    ]);


  for (
    const file of audioFiles
  ) {

    if (
      !file ||
      !file.filepath
    ) {

      return res
        .status(400)
        .json({

          success: false,

          error:
            "Fail audio tidak sah."

        });

    }


    const filename =
      String(
        file.originalFilename ||
        ""
      );


    const extension =
      filename
        .split(".")
        .pop()
        .toLowerCase();


    const mimeType =
      String(
        file.mimetype ||
        ""
      )
        .toLowerCase();


    const validMime =
      allowedMimeTypes.has(
        mimeType
      );


    const validExtension =
      allowedExtensions.has(
        extension
      );


    if (
      !validMime &&
      !validExtension
    ) {

      return res
        .status(400)
        .json({

          success: false,

          error:
            "Format fail tidak disokong: " +
            filename

        });

    }

  }


  /* ==========================================================
     BUILD ELEVENLABS FORM DATA
  ========================================================== */

  try {

    const formData =
      new FormData();


    formData.append(
      "name",
      voiceName
    );


    if (description) {

      formData.append(
        "description",
        description
      );

    }


    formData.append(
      "remove_background_noise",
      removeBackgroundNoise
        ? "true"
        : "false"
    );


    /* ========================================================
       AUDIO FILES
    ======================================================== */

    for (
      const file of audioFiles
    ) {

      const buffer =
        await fs.promises.readFile(
          file.filepath
        );


      const blob =
        new Blob(
          [buffer],
          {
            type:
              file.mimetype ||
              "audio/mpeg"
          }
        );


      formData.append(
        "files",
        blob,
        file.originalFilename ||
        "voice-sample.mp3"
      );

    }


    /* ========================================================
       CALL ELEVENLABS
    ======================================================== */

    console.log(
      "Creating ElevenLabs voice:",
      voiceName,
      "Samples:",
      audioFiles.length
    );


    const response =
      await fetch(
        "https://api.elevenlabs.io/v1/voices/add",
        {

          method:
            "POST",

          headers: {

            /*
             * JANGAN letak Content-Type manual.
             *
             * fetch akan bina multipart boundary
             * secara automatik.
             */

            "xi-api-key":
              apiKey,

            "Accept":
              "application/json"

          },

          body:
            formData

        }
      );


    const responseText =
      await response.text();


    let data = {};


    try {

      data =
        responseText
          ? JSON.parse(
              responseText
            )
          : {};

    } catch (error) {

      data = {
        raw:
          responseText
      };

    }


    /* ========================================================
       ELEVENLABS ERROR
    ======================================================== */

    if (!response.ok) {

      console.error(
        "ELEVENLABS CLONE ERROR:",
        response.status,
        responseText
      );


      return res
        .status(response.status)
        .json({

          success: false,

          error:
            "ElevenLabs gagal mencipta voice.",

          details:
            data.detail ||
            data.error ||
            data.message ||
            responseText

        });

    }


    /* ========================================================
       VALIDATE RESULT
    ======================================================== */

    if (
      !data.voice_id
    ) {

      console.error(
        "VOICE CREATED BUT NO VOICE ID:",
        data
      );


      return res
        .status(502)
        .json({

          success: false,

          error:
            "ElevenLabs tidak memulangkan voice_id.",

          details:
            data

        });

    }


    /* ========================================================
       SUCCESS
    ======================================================== */

    console.log(
      "VOICE CREATED:",
      data.voice_id
    );


    res.setHeader(
      "Cache-Control",
      "no-store"
    );


    return res
      .status(200)
      .json({

        success: true,

        message:
          "Voice berjaya dicipta.",

        voice: {

          voice_id:
            data.voice_id,

          name:
            voiceName,

          requires_verification:
            Boolean(
              data.requires_verification
            )

        }

      });


  } catch (error) {

    console.error(
      "VOICE CLONE SERVER ERROR:",
      error
    );


    return res
      .status(500)
      .json({

        success: false,

        error:
          "Server gagal mencipta voice.",

        details:
          error.message ||
          "Unknown error"

      });

  }

}


/* ============================================================
   MAIN HANDLER
============================================================ */

export default async function handler(
  req,
  res
) {

  /* ==========================================================
     CORS / BASIC HEADERS
  ========================================================== */

  res.setHeader(
    "Cache-Control",
    "no-store"
  );


  /* ==========================================================
     API KEY
  ========================================================== */

  const apiKey =
    process.env
      .ELEVENLABS_API_KEY;


  if (!apiKey) {

    return res
      .status(500)
      .json({

        success: false,

        error:
          "ELEVENLABS_API_KEY belum diset di Vercel."

      });

  }


  /* ==========================================================
     GET
     List voices
  ========================================================== */

  if (
    req.method === "GET"
  ) {

    return handleGet(
      req,
      res,
      apiKey
    );

  }


  /* ==========================================================
     POST
     Upload sample + create Instant Voice Clone
  ========================================================== */

  if (
    req.method === "POST"
  ) {

    return handlePost(
      req,
      res,
      apiKey
    );

  }


  /* ==========================================================
     METHOD NOT ALLOWED
  ========================================================== */

  res.setHeader(
    "Allow",
    "GET, POST"
  );


  return res
    .status(405)
    .json({

      success: false,

      error:
        "Method not allowed"

    });

}