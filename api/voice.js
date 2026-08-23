// ============================================================
// NAIRA PHASE 5 — VOICE
// ============================================================

(function () {

  "use strict";

  // ==========================================================
  // DOM
  // ==========================================================

  const micButton =
    document.getElementById("micButton");

  const input =
    document.getElementById("messageInput");

  // ==========================================================
  // STATE
  // ==========================================================

  let recognition = null;
  let listening = false;

  // ==========================================================
  // SPEECH RECOGNITION
  // ==========================================================

  function setupRecognition() {

    const Recognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!Recognition) {

      console.warn(
        "🎙️ Naira Voice: Speech Recognition tidak disokong."
      );

      return;
    }

    recognition =
      new Recognition();

    recognition.lang =
      "ms-MY";

    recognition.interimResults =
      false;

    recognition.continuous =
      false;

    recognition.onstart =
      function () {

        listening = true;

        if (micButton) {
          micButton.textContent =
            "🔴";
        }

        console.log(
          "🎙️ Naira sedang mendengar..."
        );
      };

    recognition.onresult =
      function (event) {

        const transcript =
          event.results?.[0]?.[0]?.transcript
            ?.trim();

        if (!transcript) {
          return;
        }

        console.log(
          "🎙️ Tuan:",
          transcript
        );

        if (input) {

          input.value =
            transcript;

          input.focus();
        }

        // ----------------------------------------------------
        // Hantar terus kepada sistem chat sedia ada
        // ----------------------------------------------------

        if (
          typeof window.sendMessage ===
          "function"
        ) {

          window.sendMessage();

        }

      };

    recognition.onerror =
      function (event) {

        console.error(
          "🎙️ Naira Voice Error:",
          event.error
        );

        listening = false;

        resetMicButton();
      };

    recognition.onend =
      function () {

        listening = false;

        resetMicButton();

      };
  }

  // ==========================================================
  // START LISTENING
  // ==========================================================

  function startListening() {

    if (!recognition) {

      console.warn(
        "🎙️ Speech Recognition belum tersedia."
      );

      return;
    }

    if (listening) {
      return;
    }

    try {

      recognition.start();

    } catch (error) {

      console.error(
        "🎙️ Gagal memulakan microphone:",
        error
      );

    }
  }

  // ==========================================================
  // STOP LISTENING
  // ==========================================================

  function stopListening() {

    if (!recognition) {
      return;
    }

    try {

      recognition.stop();

    } catch (error) {

      console.error(
        "🎙️ Gagal menghentikan microphone:",
        error
      );

    }
  }

  // ==========================================================
  // BUTTON
  // ==========================================================

  function resetMicButton() {

    if (!micButton) {
      return;
    }

    micButton.textContent =
      "🎙️";
  }

  if (micButton) {

    micButton.addEventListener(
      "click",
      function () {

        if (listening) {

          stopListening();

        } else {

          startListening();

        }

      }
    );

  } else {

    console.warn(
      "🎙️ Naira Voice: #micButton tidak dijumpai."
    );

  }

  // ==========================================================
  // TEXT TO SPEECH
  // ==========================================================

  function speak(text) {

    if (
      !text ||
      !window.speechSynthesis
    ) {
      return;
    }

    window.speechSynthesis.cancel();

    const utterance =
      new SpeechSynthesisUtterance(
        text
      );

    utterance.lang =
      "ms-MY";

    utterance.rate =
      1;

    utterance.pitch =
      1;

    utterance.volume =
      1;

    utterance.onstart =
      function () {

        console.log(
          "🔊 Naira sedang bercakap..."
        );

      };

    utterance.onend =
      function () {

        console.log(
          "🔊 Naira selesai bercakap."
        );

      };

    utterance.onerror =
      function (error) {

        console.error(
          "🔊 TTS ERROR:",
          error
        );

      };

    window.speechSynthesis.speak(
      utterance
    );
  }

  // ==========================================================
  // GLOBAL
  // ==========================================================

  window.NairaVoice = {

    start:
      startListening,

    stop:
      stopListening,

    speak:
      speak

  };

  // ==========================================================
  // INIT
  // ==========================================================

  setupRecognition();

  console.log(
    "🎙️ NAIRA PHASE 5 VOICE LOADED"
  );

})();