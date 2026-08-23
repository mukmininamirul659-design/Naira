/* ============================================================
   VOICE CENTER ENGINE
============================================================ */

const voiceSettings = {
  voiceName: localStorage.getItem("naira_voice_name") || "",
  character: localStorage.getItem("naira_voice_character") || "Naira",
  emotion: localStorage.getItem("naira_voice_emotion") || "calm",
  rate: Number(localStorage.getItem("naira_voice_rate")) || 0.90,
  pitch: Number(localStorage.getItem("naira_voice_pitch")) || 1.08,
  volume: Number(localStorage.getItem("naira_voice_volume")) || 1
};


/* ============================================================
   CHARACTER LIBRARY
============================================================ */

const voiceCharacters = [
  { id: "Naira", label: "🌸 Naira" },
  { id: "female", label: "👩 Female" },
  { id: "male", label: "👨 Male" },
  { id: "child", label: "🧒 Child" },
  { id: "elderly", label: "👵 Elderly" },
  { id: "robot", label: "🤖 Robot" },
  { id: "cartoon", label: "🎭 Cartoon" },
  { id: "villain", label: "🦹 Villain" },
  { id: "narrator", label: "🎙️ Narrator" },
  { id: "cool", label: "😎 Cool" },
  { id: "cute", label: "🥰 Cute" },
  { id: "horror", label: "👻 Horror" }
];


/* ============================================================
   EMOTION LIBRARY
============================================================ */

const voiceEmotions = [
  { id: "happy", label: "😊 Happy" },
  { id: "calm", label: "😌 Calm" },
  { id: "sad", label: "😢 Sad" },
  { id: "angry", label: "😡 Angry" },
  { id: "scared", label: "😱 Scared" },
  { id: "excited", label: "🤩 Excited" },
  { id: "sarcastic", label: "😏 Sarcastic" },
  { id: "affectionate", label: "❤️ Affectionate" },
  { id: "sleepy", label: "😴 Sleepy" },
  { id: "dramatic", label: "🎭 Dramatic" },
  { id: "singing", label: "🎵 Singing" }
];


/* ============================================================
   VOICE CENTER DOM
============================================================ */

const voiceCenterButton =
  document.getElementById("voiceCenterButton");

const voiceCenterPanel =
  document.getElementById("voiceCenterPanel");

const closeVoiceCenter =
  document.getElementById("closeVoiceCenter");

const voiceSearch =
  document.getElementById("voiceSearch");

const characterList =
  document.getElementById("characterList");

const emotionList =
  document.getElementById("emotionList");

const voiceSelect =
  document.getElementById("voiceSelect");

const rateControl =
  document.getElementById("rateControl");

const pitchControl =
  document.getElementById("pitchControl");

const volumeControl =
  document.getElementById("volumeControl");

const rateValue =
  document.getElementById("rateValue");

const pitchValue =
  document.getElementById("pitchValue");

const volumeValue =
  document.getElementById("volumeValue");

const voicePreviewText =
  document.getElementById("voicePreviewText");

const previewVoice =
  document.getElementById("previewVoice");

const saveVoiceSettings =
  document.getElementById("saveVoiceSettings");

const voiceCenterStatus =
  document.getElementById("voiceCenterStatus");


/* ============================================================
   CHARACTER RENDER
============================================================ */

function renderCharacters() {

  if (!characterList) return;

  characterList.innerHTML = "";

  const search =
    voiceSearch
      ? voiceSearch.value.trim().toLowerCase()
      : "";

  voiceCharacters
    .filter(function(character) {

      if (!search) return true;

      return (
        character.label.toLowerCase().includes(search) ||
        character.id.toLowerCase().includes(search)
      );

    })
    .forEach(function(character) {

      const button =
        document.createElement("button");

      button.type = "button";
      button.className = "voice-chip";

      if (
        voiceSettings.character === character.id
      ) {
        button.classList.add("active");
      }

      button.textContent = character.label;

      button.addEventListener(
        "click",
        function() {

          voiceSettings.character =
            character.id;

          renderCharacters();

          applyCharacterSettings();

        }
      );

      characterList.appendChild(button);

    });
}


/* ============================================================
   EMOTION RENDER
============================================================ */

function renderEmotions() {

  if (!emotionList) return;

  emotionList.innerHTML = "";

  const search =
    voiceSearch
      ? voiceSearch.value.trim().toLowerCase()
      : "";

  voiceEmotions
    .filter(function(emotion) {

      if (!search) return true;

      return (
        emotion.label.toLowerCase().includes(search) ||
        emotion.id.toLowerCase().includes(search)
      );

    })
    .forEach(function(emotion) {

      const button =
        document.createElement("button");

      button.type = "button";
      button.className = "voice-chip";

      if (
        voiceSettings.emotion === emotion.id
      ) {
        button.classList.add("active");
      }

      button.textContent = emotion.label;

      button.addEventListener(
        "click",
        function() {

          voiceSettings.emotion =
            emotion.id;

          renderEmotions();

          applyEmotionSettings();

        }
      );

      emotionList.appendChild(button);

    });
}


/* ============================================================
   LOAD REAL DEVICE VOICES
============================================================ */

function renderVoiceSelect() {

  if (!voiceSelect) return;

  voiceSelect.innerHTML = "";

  if (
    typeof voices === "undefined" ||
    !voices.length
  ) {

    const option =
      document.createElement("option");

    option.value = "";
    option.textContent = "Tiada voice tersedia";

    voiceSelect.appendChild(option);

    return;
  }

  voices
    .slice()
    .sort(function(a, b) {

      return (
        (a.lang || "").localeCompare(b.lang || "") ||
        (a.name || "").localeCompare(b.name || "")
      );

    })
    .forEach(function(voice) {

      const option =
        document.createElement("option");

      option.value = voice.name;

      option.textContent =
        `${voice.name} — ${voice.lang}`;

      if (
        voice.name === voiceSettings.voiceName
      ) {
        option.selected = true;
      }

      voiceSelect.appendChild(option);

    });

  if (
    !voiceSettings.voiceName &&
    voices.length &&
    typeof findBestVoice === "function"
  ) {

    const best = findBestVoice();

    if (best) {

      voiceSettings.voiceName = best.name;

      voiceSelect.value = best.name;

    }

  }

}


/* ============================================================
   CHARACTER SETTINGS
============================================================ */

function applyCharacterSettings() {

  switch (voiceSettings.character) {

    case "child":
      voiceSettings.pitch = 1.45;
      voiceSettings.rate = 1.05;
      break;

    case "elderly":
      voiceSettings.pitch = 0.75;
      voiceSettings.rate = 0.82;
      break;

    case "robot":
      voiceSettings.pitch = 0.65;
      voiceSettings.rate = 0.92;
      break;

    case "villain":
      voiceSettings.pitch = 0.55;
      voiceSettings.rate = 0.82;
      break;

    case "narrator":
      voiceSettings.pitch = 0.90;
      voiceSettings.rate = 0.82;
      break;

    case "cool":
      voiceSettings.pitch = 0.82;
      voiceSettings.rate = 0.88;
      break;

    case "cute":
      voiceSettings.pitch = 1.35;
      voiceSettings.rate = 0.98;
      break;

    case "horror":
      voiceSettings.pitch = 0.45;
      voiceSettings.rate = 0.68;
      break;

    case "male":
      voiceSettings.pitch = 0.78;
      voiceSettings.rate = 0.90;
      break;

    case "female":
      voiceSettings.pitch = 1.12;
      voiceSettings.rate = 0.92;
      break;

    case "cartoon":
      voiceSettings.pitch = 1.30;
      voiceSettings.rate = 1.08;
      break;

    default:
      voiceSettings.pitch = 1.08;
      voiceSettings.rate = 0.90;
      break;
  }

  syncVoiceControls();
}


/* ============================================================
   EMOTION SETTINGS
============================================================ */

function applyEmotionSettings() {

  switch (voiceSettings.emotion) {

    case "happy":
      voiceSettings.rate = 1.04;
      voiceSettings.pitch =
        Math.min(2, voiceSettings.pitch + 0.12);
      break;

    case "sad":
      voiceSettings.rate = 0.72;
      voiceSettings.pitch =
        Math.max(0.3, voiceSettings.pitch - 0.15);
      break;

    case "angry":
      voiceSettings.rate = 1.12;
      voiceSettings.pitch =
        Math.max(0.4, voiceSettings.pitch - 0.05);
      break;

    case "scared":
      voiceSettings.rate = 1.22;
      voiceSettings.pitch =
        Math.min(2, voiceSettings.pitch + 0.20);
      break;

    case "excited":
      voiceSettings.rate = 1.18;
      voiceSettings.pitch =
        Math.min(2, voiceSettings.pitch + 0.16);
      break;

    case "sarcastic":
      voiceSettings.rate = 0.86;
      voiceSettings.pitch = 1.16;
      break;

    case "affectionate":
      voiceSettings.rate = 0.82;
      voiceSettings.pitch = 1.14;
      break;

    case "sleepy":
      voiceSettings.rate = 0.62;
      voiceSettings.pitch = 0.82;
      break;

    case "dramatic":
      voiceSettings.rate = 0.76;
      voiceSettings.pitch = 1.05;
      break;

    case "singing":
      voiceSettings.rate = 0.72;
      voiceSettings.pitch = 1.20;
      break;

    default:
      voiceSettings.rate = 0.90;
      break;
  }

  syncVoiceControls();
}


/* ============================================================
   CONTROL SYNC
============================================================ */

function syncVoiceControls() {

  if (rateControl)
    rateControl.value = voiceSettings.rate;

  if (pitchControl)
    pitchControl.value = voiceSettings.pitch;

  if (volumeControl)
    volumeControl.value = voiceSettings.volume;

  if (rateValue)
    rateValue.textContent =
      Number(voiceSettings.rate).toFixed(2);

  if (pitchValue)
    pitchValue.textContent =
      Number(voiceSettings.pitch).toFixed(2);

  if (volumeValue)
    volumeValue.textContent =
      Number(voiceSettings.volume).toFixed(2);
}


/* ============================================================
   OPEN VOICE CENTER
============================================================ */

if (voiceCenterButton) {

  voiceCenterButton.addEventListener(
    "click",
    function() {

      if (typeof unlockSpeech === "function") {
        unlockSpeech();
      }

      if (voiceCenterPanel) {
        voiceCenterPanel.classList.add("active");
      }

      renderCharacters();
      renderEmotions();

      if (typeof loadVoices === "function") {
        loadVoices();
      }

      renderVoiceSelect();
      syncVoiceControls();

    }
  );

}


/* ============================================================
   CLOSE VOICE CENTER
============================================================ */

if (closeVoiceCenter) {

  closeVoiceCenter.addEventListener(
    "click",
    function() {

      if (voiceCenterPanel) {
        voiceCenterPanel.classList.remove("active");
      }

    }
  );

}


/* ============================================================
   SEARCH
============================================================ */

if (voiceSearch) {

  voiceSearch.addEventListener(
    "input",
    function() {

      renderCharacters();
      renderEmotions();

    }
  );

}


/* ============================================================
   VOICE SELECT
============================================================ */

if (voiceSelect) {

  voiceSelect.addEventListener(
    "change",
    function() {

      voiceSettings.voiceName =
        voiceSelect.value;

    }
  );

}


/* ============================================================
   RANGE CONTROLS
============================================================ */

if (rateControl) {

  rateControl.addEventListener(
    "input",
    function() {

      voiceSettings.rate =
        Number(rateControl.value);

      if (rateValue) {
        rateValue.textContent =
          Number(voiceSettings.rate).toFixed(2);
      }

    }
  );

}

if (pitchControl) {

  pitchControl.addEventListener(
    "input",
    function() {

      voiceSettings.pitch =
        Number(pitchControl.value);

      if (pitchValue) {
        pitchValue.textContent =
          Number(voiceSettings.pitch).toFixed(2);
      }

    }
  );

}

if (volumeControl) {

  volumeControl.addEventListener(
    "input",
    function() {

      voiceSettings.volume =
        Number(volumeControl.value);

      if (volumeValue) {
        volumeValue.textContent =
          Number(voiceSettings.volume).toFixed(2);
      }

    }
  );

}


/* ============================================================
   PREVIEW
============================================================ */

if (previewVoice) {

  previewVoice.addEventListener(
    "click",
    function() {

      const text =
        voicePreviewText
          ? voicePreviewText.value.trim()
          : "";

      if (!text) return;

      if (typeof unlockSpeech === "function") {
        unlockSpeech();
      }

      speakNaira(text);

    }
  );

}


/* ============================================================
   SAVE SETTINGS
============================================================ */

if (saveVoiceSettings) {

  saveVoiceSettings.addEventListener(
    "click",
    function() {

      localStorage.setItem(
        "naira_voice_name",
        voiceSettings.voiceName
      );

      localStorage.setItem(
        "naira_voice_character",
        voiceSettings.character
      );

      localStorage.setItem(
        "naira_voice_emotion",
        voiceSettings.emotion
      );

      localStorage.setItem(
        "naira_voice_rate",
        voiceSettings.rate
      );

      localStorage.setItem(
        "naira_voice_pitch",
        voiceSettings.pitch
      );

      localStorage.setItem(
        "naira_voice_volume",
        voiceSettings.volume
      );

      if (voiceCenterStatus) {

        voiceCenterStatus.textContent =
          "✅ Voice settings disimpan.";

        setTimeout(
          function() {

            voiceCenterStatus.textContent = "";

          },
          2500
        );

      }

    }
  );

}


/* ============================================================
   SPEAK NAIRA ENGINE
============================================================ */

async function speakNaira(text, voiceId = null) {

  if (!text || !text.trim()) {
    return;
  }

  try {

    // Hentikan audio sebelumnya
    if (window.nairaAudio) {
      window.nairaAudio.pause();
      window.nairaAudio.currentTime = 0;
      window.nairaAudio = null;
    }

    // UI speaking
    speaking = true;

    if (typeof updateVoiceUI === "function") {
      updateVoiceUI();
    }

    // Hantar text ke Vercel backend
    const response = await fetch("/api/speak", {

      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({

        text: text.trim(),

        // Kalau voiceId diberikan,
        // ElevenLabs akan guna voice tersebut
        voiceId: voiceId || null,

        modelId: "eleven_multilingual_v2"

      })

    });


    // Check error
    if (!response.ok) {

      const errorText =
        await response.text();

      console.error(
        "NAIRA ELEVENLABS ERROR:",
        errorText
      );

      throw new Error(
        "ElevenLabs request gagal."
      );
    }


    // Ambil audio
    const audioBlob =
      await response.blob();


    // Buat URL audio
    const audioUrl =
      URL.createObjectURL(
        audioBlob
      );


    // Create audio player
    const audio =
      new Audio(audioUrl);

    window.nairaAudio =
      audio;


    // Volume
    audio.volume =
      voiceSettings?.volume ?? 1;


    // Audio mula
    audio.onplay =
      function() {

        speaking = true;

        if (
          typeof updateVoiceUI ===
          "function"
        ) {
          updateVoiceUI();
        }

      };


    // Audio tamat
    audio.onended =
      function() {

        speaking = false;

        window.nairaAudio =
          null;

        URL.revokeObjectURL(
          audioUrl
        );

        if (
          typeof updateVoiceUI ===
          "function"
        ) {
          updateVoiceUI();
        }

      };


    // Audio error
    audio.onerror =
      function(error) {

        console.error(
          "NAIRA AUDIO ERROR:",
          error
        );

        speaking = false;

        window.nairaAudio =
          null;

        URL.revokeObjectURL(
          audioUrl
        );

        if (
          typeof updateVoiceUI ===
          "function"
        ) {
          updateVoiceUI();
        }

      };


    // Play
    await audio.play();


  } catch (error) {

    console.error(
      "NAIRA SPEAK ERROR:",
      error
    );

    speaking = false;

    window.nairaAudio =
      null;

    if (
      typeof updateVoiceUI ===
      "function"
    ) {
      updateVoiceUI();
    }

  }

}


  /* ========================================================
     SELECT SAVED DEVICE VOICE
  ======================================================== */

  let selectedVoice = null;

  if (
    voiceSettings.voiceName &&
    typeof voices !== "undefined"
  ) {

    selectedVoice =
      voices.find(
        function(voice) {

          return (
            voice.name ===
            voiceSettings.voiceName
          );

        }
      );

  }

  if (
    !selectedVoice &&
    typeof findBestVoice === "function"
  ) {

    selectedVoice =
      findBestVoice();

  }

  if (selectedVoice) {

    utterance.voice =
      selectedVoice;

    utterance.lang =
      selectedVoice.lang ||
      "ms-MY";

    console.log(
      "🎙️ Selected voice:",
      selectedVoice.name,
      selectedVoice.lang
    );

  }


  /* ========================================================
     EMOTION / CHARACTER MODIFIERS
  ======================================================== */

  if (
    voiceSettings.emotion ===
    "singing"
  ) {

    utterance.rate =
      Math.min(
        utterance.rate,
        0.78
      );

    utterance.pitch =
      Math.min(
        2,
        utterance.pitch + 0.12
      );

  }


  /* ========================================================
     EVENTS
  ======================================================== */

  utterance.onstart =
    function() {

      try {
        speaking = true;
      } catch (error) {}

      if (typeof updateVoiceUI === "function") {
        updateVoiceUI();
      }

    };


  utterance.onend =
    function() {

      try {
        speaking = false;
      } catch (error) {}

      try {
        nairaSpeech = null;
      } catch (error) {}

      if (typeof updateVoiceUI === "function") {
        updateVoiceUI();
      }

    };


  utterance.onerror =
    function(event) {

      try {
        speaking = false;
      } catch (error) {}

      try {
        nairaSpeech = null;
      } catch (error) {}

      if (typeof updateVoiceUI === "function") {
        updateVoiceUI();
      }

      console.error(
        "TTS ERROR:",
        event.error
      );

    };


  /* ========================================================
     SPEAK
  ======================================================== */

  try {

    window.speechSynthesis.speak(
      utterance
    );

  } catch (error) {

    console.error(
      "SPEAK ERROR:",
      error
    );

    try {
      speaking = false;
    } catch (e) {}

    if (typeof updateVoiceUI === "function") {
      updateVoiceUI();
    }

  }

}


/* ============================================================
   GLOBAL ACCESS
============================================================ */

window.speakNaira = speakNaira;
window.voiceSettings = voiceSettings;
window.voiceCharacters = voiceCharacters;
window.voiceEmotions = voiceEmotions;