/* ============================================================
   NAIRA VOICE UPLOAD API
   Step 1: Receive Audio / Video File
============================================================ */

export const config = {
  api: {
    bodyParser: false
  }
};


/* ============================================================
   MAIN HANDLER
============================================================ */

export default async function handler(req, res) {

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

  if (req.method === "OPTIONS") {

    return res
      .status(200)
      .end();

  }


  /* ==========================================================
     METHOD CHECK
  ========================================================== */

  if (req.method !== "POST") {

    return res
      .status(405)
      .json({
        success: false,
        error: "Method not allowed"
      });

  }


  try {

    /* ========================================================
       CONTENT TYPE
    ======================================================== */

    const contentType =
      req.headers["content-type"] || "";


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
       READ RAW REQUEST
    ======================================================== */

    const chunks = [];


    for await (
      const chunk of req
    ) {

      chunks.push(chunk);

    }


    const buffer =
      Buffer.concat(chunks);


    /* ========================================================
       EMPTY FILE CHECK
    ======================================================== */

    if (!buffer.length) {

      return res
        .status(400)
        .json({
          success: false,
          error:
            "Tiada data audio/video diterima."
        });

    }


    /* ========================================================
       SIZE CHECK
       25 MB maximum for this first version
    ======================================================== */

    const MAX_FILE_SIZE =
      25 * 1024 * 1024;


    if (
      buffer.length >
      MAX_FILE_SIZE
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
       SUCCESS

       IMPORTANT:
       At this stage we only confirm that the server
       successfully receives the multipart upload.

       Next step:
       Parse the multipart file and send the actual audio
       sample to ElevenLabs Voice API.
    ======================================================== */

    console.log(
      "========================================"
    );

    console.log(
      "🎤 NAIRA VOICE UPLOAD RECEIVED"
    );

    console.log(
      "Content-Type:",
      contentType
    );

    console.log(
      "Request size:",
      buffer.length,
      "bytes"
    );

    console.log(
      "========================================"
    );


    return res
      .status(200)
      .json({

        success: true,

        message:
          "Naira berjaya menerima fail audio/video.",

        receivedBytes:
          buffer.length

      });


  } catch (error) {

    /* ========================================================
       SERVER ERROR
    ======================================================== */

    console.error(
      "NAIRA VOICE UPLOAD ERROR:",
      error
    );


    return res
      .status(500)
      .json({

        success: false,

        error:
          "Server gagal menerima fail audio/video.",

        details:
          error?.message ||
          "Unknown error"

      });

  }

}