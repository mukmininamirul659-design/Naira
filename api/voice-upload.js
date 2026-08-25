/* ============================================================
   NAIRA VOICE BLOB UPLOAD API
   File: /api/voice-upload.js

   Purpose:
   Generate a secure client-upload token for Vercel Blob.
   The actual 25MB file goes directly:
   Browser -> Vercel Blob
============================================================ */

import {
  handleUpload
} from "@vercel/blob/client";


/* ============================================================
   CONFIG
============================================================ */

const MAX_VOICE_FILE_SIZE =
  25 * 1024 * 1024;


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

  res.setHeader(
    "Cache-Control",
    "no-store"
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


  /* ==========================================================
     BLOB TOKEN CHECK
  ========================================================== */

  if (
    !process.env
      .BLOB_READ_WRITE_TOKEN
  ) {

    return res
      .status(500)
      .json({
        success: false,
        error:
          "BLOB_READ_WRITE_TOKEN tidak dijumpai."
      });

  }


  try {

    /* ========================================================
       BODY

       Client-upload handshake uses JSON,
       NOT multipart/form-data.
    ======================================================== */

    const body =
      req.body;


    if (!body) {

      return res
        .status(400)
        .json({
          success: false,
          error:
            "Upload request kosong."
        });

    }


    /* ========================================================
       HANDLE VERCEL BLOB CLIENT UPLOAD
    ======================================================== */

    const jsonResponse =
      await handleUpload({
        body: body,

        request: req,

        token:
          process.env
            .BLOB_READ_WRITE_TOKEN,


        /* ====================================================
           TOKEN GENERATION
        ==================================================== */

        onBeforeGenerateToken:
          async (
            pathname,
            clientPayload
          ) => {

            /*
             * Validate pathname.
             */

            if (!pathname) {

              throw new Error(
                "Nama fail tidak sah."
              );

            }


            /*
             * Allow audio only for clone flow.
             *
             * Video handling will be separate
             * because ElevenLabs cloning requires
             * an audio sample.
             */

            return {

              allowedContentTypes: [
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
              ],

              maximumSizeInBytes:
                MAX_VOICE_FILE_SIZE,

              addRandomSuffix:
                true,

              tokenPayload:
                clientPayload || ""

            };

          },


        /* ====================================================
           UPLOAD COMPLETE
        ==================================================== */

        onUploadCompleted:
          async ({
            blob,
            tokenPayload
          }) => {

            console.log(
              "========================================"
            );

            console.log(
              "✅ NAIRA VOICE BLOB UPLOAD COMPLETE"
            );

            console.log(
              "URL:",
              blob.url
            );

            console.log(
              "Pathname:",
              blob.pathname
            );

            console.log(
              "Size:",
              blob.size
            );

            console.log(
              "Payload:",
              tokenPayload
            );

            console.log(
              "========================================"
            );

          }

      });


    /* ========================================================
       SUCCESS
    ======================================================== */

    return res
      .status(200)
      .json(
        jsonResponse
      );


  } catch (error) {

    console.error(
      "NAIRA VOICE BLOB UPLOAD ERROR:",
      error
    );


    return res
      .status(500)
      .json({

        success: false,

        error:
          error?.message ||
          "Blob upload gagal."

      });

  }

}