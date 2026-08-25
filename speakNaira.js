/* ============================================================
   NAIRA VOICE CLONE API
   ElevenLabs Instant Voice Cloning
   File: /api/voice-clone.js
============================================================ */

import formidable from "formidable";
import fs from "fs";


/* ============================================================
   VERCEL CONFIG
   Disable default body parser because we accept file upload.
============================================================ */

export const config = {
  api: {
    bodyParser: false
  }
};


/* ============================================================
   CONSTANTS
============================================================ */

const ELEVENLABS_CLONE_URL =
  "https://api.elevenlabs.io/v1/voices/add";

const MAX_FILE_SIZE =
  25 * 1024 * 1024;


/* ============================================================
   HELPER
============================================================ */

function getFirst(value) {

  if (Array.isArray(value)) {
    return value[0];
  }

  return value;

}


function getUploadedFiles(files) {

  if (!files) {
    return [];
  }


  /*
   * Frontend will normally send:
   *
   * files[]
   *
   * But these fallbacks make the API
   * more forgiving.
   */

  const possible =
    files["files[]"] ||
    files.files ||
    files.file ||
    files.audio;


  if (!possible) {
    return [];
  }


  return Array.isArray(possible)
    ? possible
    : [possible];

}


function safeDelete(filePath) {

  if (!filePath) {
    return;
  }


  try {

    if (fs.existsSync(filePath)) {

      fs.unlinkSync(filePath);

    }

  } catch (error) {

    console.warn(
      "TEMP FILE DELETE ERROR:",
      error
    );

  }

}


/* ============================================================
   HANDLER
============================================================ */

export default async function handler(req, res) {

  /* ==========================================================
     CORS / HEADERS
  ========================================================== */

  res.setHeader(
    "Cache-Control",
    "no-store"
  );


  /* ==========================================================
     METHOD
  ========================================================== */

  if (req.method !== "POST") {

    return res.status(405).json({
      success: false,
      error: "Method not allowed"
    });

  }


  /* ==========================================================
     ELEVENLABS API KEY
  ========================================================== */

  const apiKey =
    process.env.ELEVENLABS_API_KEY;


  if (!apiKey) {

    return res.status(500).json({
      success: false,
      error:
        "ELEVENLABS_API_KEY belum diset di Vercel."
    });

  }


  let uploadedFiles = [];


  try {

    /* ========================================================
       PARSE MULTIPART FORM
    ======================================================== */

    const form =
      formidable({

        multiples: true,

        keepExtensions: true,

        maxFileSize:
          MAX_FILE_SIZE,

        maxFiles: 5

      });


    const [
      fields,
      files
    ] =
      await form.parse(req);


    uploadedFiles =
      getUploadedFiles(
        files
      );


    /* ========================================================
       FIELDS
    ======================================================== */

    const voiceName =
      String(
        getFirst(
          fields.name
        ) ||
        "Naira Custom Voice"
      ).trim();


    const description =
      String(
        getFirst(
          fields.description
        ) ||
        "Custom voice uploaded from Naira Voice Center"
      ).trim();


    /* ========================================================
       VALIDATE NAME
    ======================================================== */

    if (!voiceName) {

      return res.status(400).json({
        success: false,
        error:
          "Nama voice diperlukan."
      });

    }


    /* ========================================================
       VALIDATE FILE
    ======================================================== */

    if (!uploadedFiles.length) {

      return res.status(400).json({
        success: false,
        error:
          "Tiada fail audio diterima."
      });

    }


    /* ========================================================
       BUILD ELEVENLABS FORM DATA
    ======================================================== */

    const elevenForm =
      new FormData();


    elevenForm.append(
      "name",
      voiceName
    );


    elevenForm.append(
      "description",
      description
    );


    /*
     * Optional ElevenLabs noise removal.
     */

    elevenForm.append(
      "remove_background_noise",
      "true"
    );


    /* ========================================================
       ADD AUDIO FILES
    ======================================================== */

    for (
      const uploadedFile
      of uploadedFiles
    ) {

      if (
        !uploadedFile ||
        !uploadedFile.filepath
      ) {
        continue;
      }


      const buffer =
        fs.readFileSync(
          uploadedFile.filepath
        );


      const mimeType =
        uploadedFile.mimetype ||
        "audio/mpeg";


      const originalName =
        uploadedFile.originalFilename ||
        "voice-sample.mp3";


      const blob =
        new Blob(
          [buffer],
          {
            type:
              mimeType
          }
        );


      elevenForm.append(
        "files",
        blob,
        originalName
      );

    }


    /* ========================================================
       SEND TO ELEVENLABS
    ======================================================== */

    console.log(
      "🎙️ Creating ElevenLabs voice:",
      voiceName,
      uploadedFiles.length +
        " sample(s)"
    );


    const elevenResponse =
      await fetch(
        ELEVENLABS_CLONE_URL,
        {

          method: "POST",

          headers: {

            "xi-api-key":
              apiKey

          },

          body:
            elevenForm

        }
      );


    /* ========================================================
       READ RESPONSE
    ======================================================== */

    const raw =
      await elevenResponse.text();


    let data = {};


    try {

      data =
        raw
          ? JSON.parse(raw)
          : {};

    } catch (error) {

      data = {
        raw: raw
      };

    }


    /* ========================================================
       ELEVENLABS ERROR
    ======================================================== */

    if (!elevenResponse.ok) {

      console.error(
        "ELEVENLABS CLONE ERROR:",
        elevenResponse.status,
        data
      );


      return res
        .status(
          elevenResponse.status
        )
        .json({

          success: false,

          error:
            data?.detail?.message ||
            data?.detail ||
            data?.message ||
            "ElevenLabs gagal menghasilkan custom voice.",

          details:
            data

        });

    }


    /* ========================================================
       VOICE ID
    ======================================================== */

    const voiceId =
      data.voice_id ||
      data.voiceId ||
      "";


    if (!voiceId) {

      console.error(
        "ELEVENLABS RETURNED NO VOICE ID:",
        data
      );


      return res.status(502).json({

        success: false,

        error:
          "ElevenLabs berjaya menjawab tetapi Voice ID tidak diterima.",

        details:
          data

      });

    }


    /* ========================================================
       SUCCESS
    ======================================================== */

    console.log(
      "✅ ElevenLabs custom voice created:",
      voiceId
    );


    return res.status(200).json({

      success: true,

      message:
        "Custom voice berjaya dibuat.",

      voice: {

        voice_id:
          voiceId,

        name:
          voiceName

      },

      voice_id:
        voiceId,

      name:
        voiceName

    });


  } catch (error) {

    /* ========================================================
       SERVER ERROR
    ======================================================== */

    console.error(
      "NAIRA VOICE CLONE SERVER ERROR:",
      error
    );


    if (
      error?.code ===
      1009 ||
      String(
        error?.message || ""
      )
        .toLowerCase()
        .includes(
          "maxfilesize"
        )
    ) {

      return res.status(413).json({

        success: false,

        error:
          "Fail audio terlalu besar."

      });

    }


    return res.status(500).json({

      success: false,

      error:
        "Server gagal memproses voice upload.",

      details:
        error?.message ||
        "Unknown error"

    });


  } finally {

    /* ========================================================
       DELETE TEMP FILES
    ======================================================== */

    uploadedFiles.forEach(
      function(file) {

        safeDelete(
          file?.filepath
        );

      }
    );

  }

}