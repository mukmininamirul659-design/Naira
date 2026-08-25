/* ============================================================
   NAIRA VOICE UPLOAD API
   Upload Audio -> ElevenLabs Instant Voice Clone
   Formidable v3
============================================================ */

import formidable from "formidable";
import fs from "fs";


/* ============================================================
   VERCEL CONFIG
============================================================ */

export const config = {
  api: {
    bodyParser: false
  }
};


/* ============================================================
   CONFIG
============================================================ */

const ELEVENLABS_CLONE_URL =
  "https://api.elevenlabs.io/v1/voices/add";

const MAX_FILE_SIZE =
  25 * 1024 * 1024;


/* ============================================================
   ALLOWED FILE TYPES

   NOTE:
   ElevenLabs voice cloning needs AUDIO.

   Video upload can be added later by extracting
   the audio track first.

   For this step:
   MP3 / WAV / M4A / AAC / OGG / WEBM audio.
============================================================ */

const ALLOWED_MIME_TYPES = [
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/x-wav",
  "audio/mp4",
  "audio/m4a",
  "audio/x-m4a",
  "audio/aac",
  "audio/ogg",
  "audio/webm"
];


/* ============================================================
   GET FIRST VALUE
============================================================ */

function getFirstValue(value) {

  if (Array.isArray(value)) {
    return value[0];
  }

  return value;

}


/* ============================================================
   GET FIRST FILE
============================================================ */

function getFirstFile(files) {

  if (!files) {
    return null;
  }


  /*
   * Preferred:
   *
   * file
   */

  if (files.file) {

    return Array.isArray(files.file)
      ? files.file[0]
      : files.file;

  }


  /*
   * Also accept:
   *
   * audio
   * voice
   */

  const possibleFields = [
    "audio",
    "voice"
  ];


  for (const field of possibleFields) {

    if (files[field]) {

      return Array.isArray(files[field])
        ? files[field][0]
        : files[field];

    }

  }


  /*
   * Fallback:
   * first uploaded file.
   */

  const keys =
    Object.keys(files);


  if (!keys.length) {
    return null;
  }


  const first =
    files[keys[0]];


  return Array.isArray(first)
    ? first[0]
    : first;

}


/* ============================================================
   DELETE TEMP FILE
============================================================ */

async function removeTempFile(filepath) {

  if (!filepath) {
    return;
  }


  try {

    await fs.promises.unlink(
      filepath
    );

  } catch (error) {

    console.warn(
      "TEMP FILE CLEANUP:",
      error?.message
    );

  }

}


/* ============================================================
   CLEAN VOICE NAME
============================================================ */

function createVoiceName(
  requestedName,
  originalFilename
) {

  /*
   * If frontend sends a name,
   * use it.
   */

  const customName =
    String(
      requestedName || ""
    )
      .trim()
      .slice(0, 100);


  if (customName) {
    return customName;
  }


  /*
   * Otherwise build name from filename.
   */

  const baseName =
    String(
      originalFilename ||
      "Uploaded Voice"
    )
      .replace(
        /\.[^/.]+$/,
        ""
      )
      .trim()
      .slice(0, 60);


  return (
    "Naira - " +
    (
      baseName ||
      "Uploaded Voice"
    )
  );

}


/* ============================================================
   MAIN HANDLER
============================================================ */

export default async function handler(
  req,
  res
) {

  /* ==========================================================
     CORS
  ========================================================== */

  res.setHeader(
    "Access-Control-Allow-Origin",
    "*"
  );

  res.setHeader(
    "Access-Control-Allow-Methods",
    "POST, OPTIONS"
  );

  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type"
  );


  /* ==========================================================
     OPTIONS
  ========================================================== */

  if (
    req.method === "OPTIONS"
  ) {

    return res
      .status(200)
      .end();

  }


  /* ==========================================================
     METHOD CHECK
  ========================================================== */

  if (
    req.method !== "POST"
  ) {

    return res
      .status(405)
      .json({

        success: false,

        error:
          "Method not allowed"

      });

  }


  /* ==========================================================
     ELEVENLABS API KEY
  ========================================================== */

  const apiKey =
    process.env.ELEVENLABS_API_KEY;


  if (!apiKey) {

    return res
      .status(500)
      .json({

        success: false,

        error:
          "ELEVENLABS_API_KEY belum diset di Vercel."

      });

  }


  let uploadedFile = null;


  try {

    /* ========================================================
       CONTENT TYPE CHECK
    ======================================================== */

    const contentType =
      req.headers[
        "content-type"
      ] || "";


    if (
      !contentType.includes(
        "multipart/form-data"
      )
    ) {

      return res
        .status(400)
        .json({

          success: false,

          error:
            "Request mesti menggunakan multipart/form-data."

        });

    }


    /* ========================================================
       FORMIDABLE
    ======================================================== */

    const form =
      formidable({

        multiples: false,

        maxFiles: 1,

        maxFileSize:
          MAX_FILE_SIZE,

        allowEmptyFiles:
          false,

        minFileSize: 1,

        keepExtensions:
          true

      });


    /* ========================================================
       PARSE UPLOAD
    ======================================================== */

    const [
      fields,
      files
    ] =
      await form.parse(req);


    uploadedFile =
      getFirstFile(files);


    /* ========================================================
       FILE CHECK
    ======================================================== */

    if (!uploadedFile) {

      return res
        .status(400)
        .json({

          success: false,

          error:
            "Tiada fail audio diterima."

        });

    }


    /* ========================================================
       FILE INFORMATION
    ======================================================== */

    const originalFilename =
      uploadedFile.originalFilename ||
      "voice-sample.mp3";


    const mimetype =
      uploadedFile.mimetype ||
      "application/octet-stream";


    const size =
      Number(
        uploadedFile.size
      ) || 0;


    const filepath =
      uploadedFile.filepath;


    /* ========================================================
       FILE SIZE VALIDATION
    ======================================================== */

    if (
      !size ||
      size > MAX_FILE_SIZE
    ) {

      await removeTempFile(
        filepath
      );


      uploadedFile = null;


      return res
        .status(400)
        .json({

          success: false,

          error:
            "Saiz fail tidak sah."

        });

    }


    /* ========================================================
       MIME VALIDATION
    ======================================================== */

    if (
      mimetype &&
      !ALLOWED_MIME_TYPES.includes(
        mimetype
      )
    ) {

      await removeTempFile(
        filepath
      );


      uploadedFile = null;


      return res
        .status(415)
        .json({

          success: false,

          error:
            "Format audio tidak disokong.",

          mimetype:
            mimetype

        });

    }


    /* ========================================================
       READ ACTUAL AUDIO
    ======================================================== */

    const fileBuffer =
      await fs.promises.readFile(
        filepath
      );


    if (
      !fileBuffer ||
      !fileBuffer.length
    ) {

      await removeTempFile(
        filepath
      );


      uploadedFile = null;


      return res
        .status(400)
        .json({

          success: false,

          error:
            "Fail audio kosong."

        });

    }


    /* ========================================================
       VOICE NAME
    ======================================================== */

    const requestedVoiceName =
      getFirstValue(
        fields?.name
      );


    const voiceName =
      createVoiceName(
        requestedVoiceName,
        originalFilename
      );


    /* ========================================================
       OPTIONAL DESCRIPTION
    ======================================================== */

    const requestedDescription =
      getFirstValue(
        fields?.description
      );


    const description =
      String(
        requestedDescription ||
        "Voice uploaded through Naira Voice Center."
      )
        .trim()
        .slice(0, 500);


    /* ========================================================
       OPTIONAL BACKGROUND NOISE REMOVAL
    ======================================================== */

    const removeNoiseValue =
      String(
        getFirstValue(
          fields?.remove_background_noise
        ) || "false"
      )
        .toLowerCase();


    const removeBackgroundNoise =
      removeNoiseValue === "true";


    /* ========================================================
       LOG UPLOAD
    ======================================================== */

    console.log(
      "========================================"
    );

    console.log(
      "🎙️ NAIRA VOICE CLONE START"
    );

    console.log(
      "Voice Name:",
      voiceName
    );

    console.log(
      "Filename:",
      originalFilename
    );

    console.log(
      "MIME:",
      mimetype
    );

    console.log(
      "Size:",
      size,
      "bytes"
    );

    console.log(
      "Remove Noise:",
      removeBackgroundNoise
    );

    console.log(
      "========================================"
    );


    /* ========================================================
       CREATE FORM DATA FOR ELEVENLABS
    ======================================================== */

    const elevenForm =
      new FormData();


    /*
     * Required:
     * voice name
     */

    elevenForm.append(
      "name",
      voiceName
    );


    /*
     * Optional:
     * description
     */

    elevenForm.append(
      "description",
      description
    );


    /*
     * Optional:
     * background noise removal
     */

    elevenForm.append(
      "remove_background_noise",
      String(
        removeBackgroundNoise
      )
    );


    /*
     * Required:
     * audio sample
     *
     * Node/Vercel supports Blob + FormData.
     */

    const audioBlob =
      new Blob(
        [fileBuffer],
        {
          type:
            mimetype ||
            "audio/mpeg"
        }
      );


    /*
     * ElevenLabs endpoint expects:
     *
     * files
     */

    elevenForm.append(
      "files",
      audioBlob,
      originalFilename
    );


    /* ========================================================
       SEND TO ELEVENLABS
    ======================================================== */

    console.log(
      "📤 Sending voice sample to ElevenLabs..."
    );


    const elevenResponse =
      await fetch(
        ELEVENLABS_CLONE_URL,
        {

          method: "POST",

          headers: {

            /*
             * IMPORTANT:
             *
             * Do NOT manually set
             * Content-Type here.
             *
             * fetch automatically creates
             * multipart boundary.
             */

            "xi-api-key":
              apiKey,

            "Accept":
              "application/json"

          },

          body:
            elevenForm

        }
      );


    /* ========================================================
       READ ELEVENLABS RESPONSE
    ======================================================== */

    const elevenRaw =
      await elevenResponse.text();


    let elevenData = {};


    try {

      elevenData =
        elevenRaw
          ? JSON.parse(
              elevenRaw
            )
          : {};

    } catch (error) {

      elevenData = {};

    }


    /* ========================================================
       ELEVENLABS ERROR
    ======================================================== */

    if (
      !elevenResponse.ok
    ) {

      console.error(
        "========================================"
      );

      console.error(
        "❌ ELEVENLABS CLONE ERROR"
      );

      console.error(
        "Status:",
        elevenResponse.status
      );

      console.error(
        "Response:",
        elevenRaw
      );

      console.error(
        "========================================"
      );


      await removeTempFile(
        filepath
      );


      uploadedFile = null;


      return res
        .status(
          elevenResponse.status
        )
        .json({

          success: false,

          error:
            "ElevenLabs gagal mencipta voice clone.",

          elevenLabsStatus:
            elevenResponse.status,

          details:
            elevenData?.detail ||
            elevenData?.error ||
            elevenData?.message ||
            elevenRaw ||
            "Unknown ElevenLabs error"

        });

    }


    /* ========================================================
       GET VOICE ID
    ======================================================== */

    const voiceId =
      elevenData?.voice_id;


    if (!voiceId) {

      console.error(
        "ElevenLabs response missing voice_id:",
        elevenData
      );


      await removeTempFile(
        filepath
      );


      uploadedFile = null;


      return res
        .status(502)
        .json({

          success: false,

          error:
            "ElevenLabs tidak memulangkan voice_id.",

          details:
            elevenData

        });

    }


    /* ========================================================
       CLEAN TEMP FILE
    ======================================================== */

    await removeTempFile(
      filepath
    );


    uploadedFile = null;


    /* ========================================================
       SUCCESS LOG
    ======================================================== */

    console.log(
      "========================================"
    );

    console.log(
      "✅ NAIRA VOICE CLONE CREATED"
    );

    console.log(
      "Voice Name:",
      voiceName
    );

    console.log(
      "Voice ID:",
      voiceId
    );

    console.log(
      "Requires Verification:",
      elevenData?.requires_verification
    );

    console.log(
      "========================================"
    );


    /* ========================================================
       RETURN TO FRONTEND
    ======================================================== */

    return res
      .status(200)
      .json({

        success: true,

        message:
          "Voice berjaya dicipta di ElevenLabs.",

        voice: {

          voice_id:
            voiceId,

          name:
            voiceName,

          requires_verification:
            Boolean(
              elevenData
                ?.requires_verification
            )

        },

        file: {

          name:
            originalFilename,

          type:
            mimetype,

          size:
            size

        }

      });


  } catch (error) {

    /* ========================================================
       CLEANUP AFTER ERROR
    ======================================================== */

    if (
      uploadedFile?.filepath
    ) {

      await removeTempFile(
        uploadedFile.filepath
      );

    }


    console.error(
      "========================================"
    );

    console.error(
      "❌ NAIRA UPLOAD VOICE ERROR"
    );

    console.error(
      error
    );

    console.error(
      "========================================"
    );


    /* ========================================================
       FILE TOO LARGE
    ======================================================== */

    if (
      error?.code === 1009 ||
      String(
        error?.message || ""
      )
        .toLowerCase()
        .includes(
          "maxfilesize"
        )
    ) {

      return res
        .status(413)
        .json({

          success: false,

          error:
            "Fail terlalu besar. Maksimum 25MB."

        });

    }


    /* ========================================================
       SERVER ERROR
    ======================================================== */

    return res
      .status(500)
      .json({

        success: false,

        error:
          "Server gagal memproses voice clone.",

        details:
          error?.message ||
          "Unknown error"

      });

  }

}