/* ============================================================
   NAIRA VOICE UPLOAD API
   Audio Upload Parser
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
   ALLOWED FILE TYPES
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
  "audio/webm",
  "video/mp4",
  "video/quicktime",
  "video/webm"
];


const MAX_FILE_SIZE =
  25 * 1024 * 1024;


/* ============================================================
   GET FIRST FILE
============================================================ */

function getFirstFile(files) {

  if (!files) {
    return null;
  }


  /*
   * Preferred field name:
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
   * video
   */

  const possibleFields = [
    "audio",
    "voice",
    "video"
  ];


  for (
    const field of possibleFields
  ) {

    if (files[field]) {

      return Array.isArray(
        files[field]
      )
        ? files[field][0]
        : files[field];

    }

  }


  /*
   * Fallback:
   * take first uploaded file.
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

async function removeTempFile(
  filepath
) {

  if (!filepath) {
    return;
  }


  try {

    await fs.promises.unlink(
      filepath
    );

  } catch (error) {

    /*
     * Ignore cleanup errors.
     */

    console.warn(
      "TEMP FILE CLEANUP:",
      error?.message
    );

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
     METHOD
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
            "Tiada fail audio atau video diterima."

        });

    }


    /* ========================================================
       FILE INFO
    ======================================================== */

    const originalFilename =
      uploadedFile.originalFilename ||
      "voice-file";


    const mimetype =
      uploadedFile.mimetype ||
      "";


    const size =
      Number(
        uploadedFile.size
      ) || 0;


    const filepath =
      uploadedFile.filepath;


    /* ========================================================
       SIZE VALIDATION
    ======================================================== */

    if (
      !size ||
      size >
        MAX_FILE_SIZE
    ) {

      await removeTempFile(
        filepath
      );


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


      return res
        .status(415)
        .json({

          success: false,

          error:
            "Format fail tidak disokong.",

          mimetype:
            mimetype

        });

    }


    /* ========================================================
       READ ACTUAL FILE
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


      return res
        .status(400)
        .json({

          success: false,

          error:
            "Fail yang diterima kosong."

        });

    }


    /* ========================================================
       LOG
    ======================================================== */

    console.log(
      "========================================"
    );

    console.log(
      "🎙️ NAIRA VOICE FILE RECEIVED"
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
      "Buffer:",
      fileBuffer.length,
      "bytes"
    );

    console.log(
      "========================================"
    );


    /* ========================================================
       CLEAN TEMP FILE
    ======================================================== */

    await removeTempFile(
      filepath
    );


    uploadedFile = null;


    /* ========================================================
       SUCCESS

       IMPORTANT:
       We have now confirmed that the actual uploaded
       audio/video file can be parsed and read.

       Next step will send the sample to ElevenLabs
       to create a usable voice.
    ======================================================== */

    return res
      .status(200)
      .json({

        success: true,

        message:
          "Naira berjaya membaca fail suara.",

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
      "NAIRA UPLOAD VOICE ERROR:",
      error
    );


    /* ========================================================
       FORMIDABLE FILE TOO LARGE
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
          "Server gagal memproses fail suara.",

        details:
          error?.message ||
          "Unknown error"

      });

  }

}