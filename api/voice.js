// ============================================================
// NAIRA PHASE 5 — VOICE SCRIPT
// ============================================================

const Voice = {

  recognition: null,
  speaking: false,
  listening: false,

  // ==========================================================
  // INIT
  // ==========================================================

  init() {

    console.log(
      "🎙️ NAIRA VOICE: Initializing..."
    );

    this.setupSpeechRecognition();

    console.log(
      "🎙️ NAIRA VOICE: Ready."
    );
  },

  // ==========================================================
  // SPEECH RECOGNITION
  // ==========================================================

  setupSpeechRecognition() {

    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {

      console.warn(
        "🎙️ Speech Recognition tidak disokong browser."
      );

      return;
    }

    this.recognition =
      new SpeechRecognition();

    this.recognition.lang =
      "ms-MY";

    this.recognition.continuous =
      false;

    this.recognition.interimResults =
      false;

    // --------------------------------------------------------
    // START
    // --------------------------------------------------------

    this.recognition.onstart =
      () => {

        this.listening =
          true;

        console.log(
          "🎙️ NAIRA: Listening..."
        );

        this.updateVoiceUI(
          "listening"
        );
      };

    // --------------------------------------------------------
    // RESULT
    // --------------------------------------------------------

    this.recognition.onresult =
      (event) => {

        const result =
          event.results[
            event.results.length - 1
          ];

        if (!result) return;

        const transcript =
          result[0]?.transcript
            ?.trim();

        if (!transcript) return;

        console.log(
          "🎙️ USER:",
          transcript
        );

        this.sendToNaira(
          transcript
        );
      };

    // --------------------------------------------------------
    // END
    // --------------------------------------------------------

    this.recognition.onend =
      () => {

        this.listening =
          false;

        console.log(
          "🎙️ NAIRA: Listening stopped."
        );

        this.updateVoiceUI(
          "idle"
        );
      };

    // --------------------------------------------------------
    // ERROR
    // --------------------------------------------------------

    this.recognition.onerror =
      (event) => {

        this.listening =
          false;

        console.error(
          "🎙️ VOICE ERROR:",
          event.error
        );

        this.updateVoiceUI(
          "error"
        );
      };
  },

  // ==========================================================
  // START LISTENING
  // ==========================================================

  startListening() {

    if (!this.recognition) {

      console.warn(
        "🎙️ Speech Recognition belum tersedia."
      );

      return;
    }

    if (this.listening) {
      return;
    }

    try {

      this.recognition.start();

    } catch (error) {

      console.error(
        "🎙️ START VOICE ERROR:",
        error
      );

    }
  },

  // ==========================================================
  // STOP LISTENING
  // ==========================================================

  stopListening() {

    if (
      !this.recognition ||
      !this.listening
    ) {
      return;
    }

    try {

      this.recognition.stop();

    } catch (error) {

      console.error(
        "🎙️ STOP VOICE ERROR:",
        error
      );

    }
  },

  // ==========================================================
  // SEND USER VOICE TO NAIRA
  // ==========================================================

  async sendToNaira(
    text
  ) {

    console.log(
      "🤖 Sending voice message to Naira..."
    );

    const input =
      document.getElementById(
        "messageInput"
      );

    if (input) {

      input.value =
        text;
    }

    // --------------------------------------------------------
    // Gunakan fungsi chat sedia ada
    // --------------------------------------------------------

    if (
      typeof window.sendMessage ===
      "function"
    ) {

      await window.sendMessage(
        text
      );

      return;
    }

    console.warn(
      "⚠️ window.sendMessage tidak dijumpai."
    );
  },

  // ==========================================================
  // TEXT TO SPEECH
  // ==========================================================

  speak(
    text
  ) {

    if (
      !text ||
      !window.speechSynthesis
    ) {
      return;
    }

    this.stopSpeaking();

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
      () => {

        this.speaking =
          true;

        this.updateVoiceUI(
          "speaking"
        );

      };

    utterance.onend =
      () => {

        this.speaking =
          false;

        this.updateVoiceUI(
          "idle"
        );

      };

    utterance.onerror =
      (error) => {

        this.speaking =
          false;

        console.error(
          "🔊 TTS ERROR:",
          error
        );

        this.updateVoiceUI(
          "error"
        );

      };

    window.speechSynthesis.speak(
      utterance
    );
  },

  // ==========================================================
  // STOP SPEAKING
  // ==========================================================

  stopSpeaking() {

    if (
      !window.speechSynthesis
    ) {
      return;
    }

    window.speechSynthesis.cancel();

    this.speaking =
      false;
  },

  // ==========================================================
  // VOICE UI
  // ==========================================================

  updateVoiceUI(
    state
  ) {

    const button =
      document.getElementById(
        "voiceButton"
      );

    if (!button) {
      return;
    }

    button.classList.remove(
      "voice-listening",
      "voice-speaking",
      "voice-error"
    );

    if (
      state ===
      "listening"
    ) {

      button.classList.add(
        "voice-listening"
      );

      button.textContent =
        "🔴";

      return;
    }

    if (
      state ===
      "speaking"
    ) {

      button.classList.add(
        "voice-speaking"
      );

      button.textContent =
        "🔊";

      return;
    }

    if (
      state ===
      "error"
    ) {

      button.classList.add(
        "voice-error"
      );

      button.textContent =
        "⚠️";

      return;
    }

    button.textContent =
      "🎙️";
  }
};

// ============================================================
// VOICE BUTTON
// ============================================================

const voiceButton =
  document.getElementById(
    "voiceButton"
  );

if (voiceButton) {

  voiceButton.addEventListener(
    "click",
    function () {

      if (
        Voice.listening
      ) {

        Voice.stopListening();

        return;
      }

      Voice.startListening();

    }
  );
}

// ============================================================
// AUTO INIT
// ============================================================

if (
  document.readyState ===
  "loading"
) {

  document.addEventListener(
    "DOMContentLoaded",
    function () {

      Voice.init();

    }
  );

} else {

  Voice.init();

}

// ============================================================
// GLOBAL
// ============================================================

window.NairaVoice =
  Voice;

console.log(
  "🎙️ NAIRA PHASE 5 VOICE LOADED"
);