/* ============================================================
   VOICE CENTER ENGINE
============================================================ */

const voiceSettings = {
  voiceName:
    localStorage.getItem(
      "naira_voice_name"
    ) || "",

  character:
    localStorage.getItem(
      "naira_voice_character"
    ) || "Naira",

  emotion:
    localStorage.getItem(
      "naira_voice_emotion"
    ) || "calm",

  rate:
    Number(
      localStorage.getItem(
        "naira_voice_rate"
      )
    ) || 0.90,

  pitch:
    Number(
      localStorage.getItem(
        "naira_voice_pitch"
      )
    ) || 1.08,

  volume:
    Number(
      localStorage.getItem(
        "naira_voice_volume"
      )
    ) || 1
};


/* ============================================================
   CHARACTER LIBRARY
============================================================ */

const voiceCharacters = [
  {
    id: "Naira",
    label: "🌸 Naira"
  },
  {
    id: "female",
    label: "👩 Female"
  },
  {
    id: "male",
    label: "👨 Male"
  },
  {
    id: "child",
    label: "🧒 Child"
  },
  {
    id: "elderly",
    label: "👵 Elderly"
  },
  {
    id: "robot",
    label: "🤖 Robot"
  },
  {
    id: "cartoon",
    label: "🎭 Cartoon"
  },
  {
    id: "villain",
    label: "🦹 Villain"
  },
  {
    id: "narrator",
    label: "🎙️ Narrator"
  },
  {
    id: "cool",
    label: "😎 Cool"
  },
  {
    id: "cute",
    label: "🥰 Cute"
  },
  {
    id: "horror",
    label: "👻 Horror"
  }
];


/* ============================================================
   EMOTION LIBRARY
============================================================ */

const voiceEmotions = [
  {
    id: "happy",
    label: "😊 Happy"
  },
  {
    id: "calm",
    label: "😌 Calm"
  },
  {
    id: "sad",
    label: "😢 Sad"
  },
  {
    id: "angry",
    label: "😡 Angry"
  },
  {
    id: "scared",
    label: "😱 Scared"
  },
  {
    id: "excited",
    label: "🤩 Excited"
  },
  {
    id: "sarcastic",
    label: "😏 Sarcastic"
  },
  {
    id: "affectionate",
    label: "❤️ Affectionate"
  },
  {
    id: "sleepy",
    label: "😴 Sleepy"
  },
  {
    id: "dramatic",
    label: "🎭 Dramatic"
  },
  {
    id: "singing",
    label: "🎵 Singing"
  }
];


/* ============================================================
   VOICE CENTER DOM
============================================================ */

const voiceCenterButton =
  document.getElementById(
    "voiceCenterButton"
  );

const voiceCenterPanel =
  document.getElementById(
    "voiceCenterPanel"
  );

const closeVoiceCenter =
  document.getElementById(
    "closeVoiceCenter"
  );

const voiceSearch =
  document.getElementById(
    "voiceSearch"
  );

const characterList =
  document.getElementById(
    "characterList"
  );

const emotionList =
  document.getElementById(
    "emotionList"
  );

const voiceSelect =
  document.getElementById(
    "voiceSelect"
  );

const rateControl =
  document.getElementById(
    "rateControl"
  );

const pitchControl =
  document.getElementById(
    "pitchControl"
  );

const volumeControl =
  document.getElementById(
    "volumeControl"
  );

const rateValue =
  document.getElementById(
    "rateValue"
  );

const pitchValue =
  document.getElementById(
    "pitchValue"
  );

const volumeValue =
  document.getElementById(
    "volumeValue"
  );

const voicePreviewText =
  document.getElementById(
    "voicePreviewText"
  );

const previewVoice =
  document.getElementById(
    "previewVoice"
  );

const saveVoiceSettings =
  document.getElementById(
    "saveVoiceSettings"
  );

const voiceCenterStatus =
  document.getElementById(
    "voiceCenterStatus"
  );


/* ============================================================
   CHARACTER RENDER
============================================================ */

function renderCharacters() {

  characterList.innerHTML = "";

  const search =
    voiceSearch.value
      .trim()
      .toLowerCase();

  voiceCharacters
    .filter(function(character) {

      if (!search) {
        return true;
      }

      return (
        character.label
          .toLowerCase()
          .includes(search) ||
        character.id
          .toLowerCase()
          .includes(search)
      );

    })
    .forEach(function(character) {

      const button =
        document.createElement(
          "button"
        );

      button.type = "button";

      button.className =
        "voice-chip";

      if (
        voiceSettings.character ===
        character.id
      ) {
        button.classList.add(
          "active"
        );
      }

      button.textContent =
        character.label;

      button.addEventListener(
        "click",
        function() {

          voiceSettings.character =
            character.id;

          renderCharacters();

          applyCharacterSettings();

        }
      );

      characterList.appendChild(
        button
      );

    });
}


/* ============================================================
   EMOTION RENDER
============================================================ */

function renderEmotions() {

  emotionList.innerHTML = "";

  const search =
    voiceSearch.value
      .trim()
      .toLowerCase();

  voiceEmotions
    .filter(function(emotion) {

      if (!search) {
        return true;
      }

      return (
        emotion.label
          .toLowerCase()
          .includes(search) ||
        emotion.id
          .toLowerCase()
          .includes(search)
      );

    })
    .forEach(function(emotion) {

      const button =
        document.createElement(
          "button"
        );

      button.type = "button";

      button.className =
        "voice-chip";

      if (
        voiceSettings.emotion ===
        emotion.id
      ) {
        button.classList.add(
          "active"
        );
      }

      button.textContent =
        emotion.label;

      button.addEventListener(
        "click",
        function() {

          voiceSettings.emotion =
            emotion.id;

          renderEmotions();

          applyEmotionSettings();

        }
      );

      emotionList.appendChild(
        button
      );

    });
}


/* ============================================================
   LOAD REAL DEVICE VOICES
============================================================ */

function renderVoiceSelect() {

  voiceSelect.innerHTML = "";

  if (!voices.length) {

    const option =
      document.createElement(
        "option"
      );

    option.value = "";

    option.textContent =
      "Tiada voice tersedia";

    voiceSelect.appendChild(
      option
    );

    return;
  }

  voices
    .slice()
    .sort(function(a, b) {

      return (
        (a.lang || "")
          .localeCompare(
            b.lang || ""
          ) ||
        (a.name || "")
          .localeCompare(
            b.name || ""
          )
      );

    })
    .forEach(function(voice) {

      const option =
        document.createElement(
          "option"
        );

      option.value =
        voice.name;

      option.textContent =
        `${voice.name} — ${voice.lang}`;

      if (
        voice.name ===
        voiceSettings.voiceName
      ) {
        option.selected =
          true;
      }

      voiceSelect.appendChild(
        option
      );

    });

  if (
    !voiceSettings.voiceName &&
    voices.length
  ) {

    const best =
      findBestVoice();

    if (best) {

      voiceSettings.voiceName =
        best.name;

      voiceSelect.value =
        best.name;

    }

  }

}


/* ============================================================
   CHARACTER SETTINGS
============================================================ */

function applyCharacterSettings() {

  switch (
    voiceSettings.character
  ) {

    case "child":

      voiceSettings.pitch =
        1.45;

      voiceSettings.rate =
        1.05;

      break;

    case "elderly":

      voiceSettings.pitch =
        0.75;

      voiceSettings.rate =
        0.82;

      break;

    case "robot":

      voiceSettings.pitch =
        0.65;

      voiceSettings.rate =
        0.92;

      break;

    case "villain":

      voiceSettings.pitch =
        0.55;

      voiceSettings.rate =
        0.82;

      break;

    case "narrator":

      voiceSettings.pitch =
        0.90;

      voiceSettings.rate =
        0.82;

      break;

    case "cool":

      voiceSettings.pitch =
        0.82;

      voiceSettings.rate =
        0.88;

      break;

    case "cute":

      voiceSettings.pitch =
        1.35;

      voiceSettings.rate =
        0.98;

      break;

    case "horror":

      voiceSettings.pitch =
        0.45;

      voiceSettings.rate =
        0.68;

      break;

    case "male":

      voiceSettings.pitch =
        0.78;

      voiceSettings.rate =
        0.90;

      break;

    case "female":

      voiceSettings.pitch =
        1.12;

      voiceSettings.rate =
        0.92;

      break;

    case "cartoon":

      voiceSettings.pitch =
        1.30;

      voiceSettings.rate =
        1.08;

      break;

    default:

      voiceSettings.pitch =
        1.08;

      voiceSettings.rate =
        0.90;

      break;
  }

  syncVoiceControls();

}


/* ============================================================
   EMOTION SETTINGS
============================================================ */

function applyEmotionSettings() {

  switch (
    voiceSettings.emotion
  ) {

    case "happy":

      voiceSettings.rate =
        1.04;

      voiceSettings.pitch =
        Math.min(
          2,
          voiceSettings.pitch +
          0.12
        );

      break;

    case "sad":

      voiceSettings.rate =
        0.72;

      voiceSettings.pitch =
        Math.max(
          0.3,
          voiceSettings.pitch -
          0.15
        );

      break;

    case "angry":

      voiceSettings.rate =
        1.12;

      voiceSettings.pitch =
        Math.max(
          0.4,
          voiceSettings.pitch -
          0.05
        );

      break;

    case "scared":

      voiceSettings.rate =
        1.22;

      voiceSettings.pitch =
        Math.min(
          2,
          voiceSettings.pitch +
          0.20
        );

      break;

    case "excited":

      voiceSettings.rate =
        1.18;

      voiceSettings.pitch =
        Math.min(
          2,
          voiceSettings.pitch +
          0.16
        );

      break;

    case "sarcastic":

      voiceSettings.rate =
        0.86;

      voiceSettings.pitch =
        1.16;

      break;

    case "affectionate":

      voiceSettings.rate =
        0.82;

      voiceSettings.pitch =
        1.14;

      break;

    case "sleepy":

      voiceSettings.rate =
        0.62;

      voiceSettings.pitch =
        0.82;

      break;

    case "dramatic":

      voiceSettings.rate =
        0.76;

      voiceSettings.pitch =
        1.05;

      break;

    case "singing":

      voiceSettings.rate =
        0.72;

      voiceSettings.pitch =
        1.20;

      break;

    default:

      voiceSettings.rate =
        0.90;

      break;
  }

  syncVoiceControls();

}


/* ============================================================
   CONTROL SYNC
============================================================ */

function syncVoiceControls() {

  rateControl.value =
    voiceSettings.rate;

  pitchControl.value =
    voiceSettings.pitch;

  volumeControl.value =
    voiceSettings.volume;

  rateValue.textContent =
    Number(
      voiceSettings.rate
    ).toFixed(2);

  pitchValue.textContent =
    Number(
      voiceSettings.pitch
    ).toFixed(2);

  volumeValue.textContent =
    Number(
      voiceSettings.volume
    ).toFixed(2);

}


/* ============================================================
   OPEN VOICE CENTER
============================================================ */

voiceCenterButton.addEventListener(
  "click",
  function() {

    unlockSpeech();

    voiceCenterPanel.classList.add(
      "active"
    );

    renderCharacters();
    renderEmotions();
    renderVoiceSelect();
    syncVoiceControls();

  }
);


/* ============================================================
   CLOSE VOICE CENTER
============================================================ */

closeVoiceCenter.addEventListener(
  "click",
  function() {

    voiceCenterPanel.classList.remove(
      "active"
    );

  }
);


/* ============================================================
   SEARCH
============================================================ */

voiceSearch.addEventListener(
  "input",
  function() {

    renderCharacters();
    renderEmotions();

  }
);


/* ============================================================
   VOICE SELECT
============================================================ */

voiceSelect.addEventListener(
  "change",
  function() {

    voiceSettings.voiceName =
      voiceSelect.value;

  }
);


/* ============================================================
   RANGE CONTROLS
============================================================ */

rateControl.addEventListener(
  "input",
  function() {

    voiceSettings.rate =
      Number(
        rateControl.value
      );

    rateValue.textContent =
      Number(
        voiceSettings.rate
      ).toFixed(2);

  }
);

pitchControl.addEventListener(
  "input",
  function() {

    voiceSettings.pitch =
      Number(
        pitchControl.value
      );

    pitchValue.textContent =
      Number(
        voiceSettings.pitch
      ).toFixed(2);

  }
);

volumeControl.addEventListener(
  "input",
  function() {

    voiceSettings.volume =
      Number(
        volumeControl.value
      );

    volumeValue.textContent =
      Number(
        voiceSettings.volume
      ).toFixed(2);

  }
);


/* ============================================================
   PREVIEW
============================================================ */

previewVoice.addEventListener(
  "click",
  function() {

    const text =
      voicePreviewText.value.trim();

    if (!text) {
      return;
    }

    unlockSpeech();

    speakNaira(text);

  }
);


/* ============================================================
   SAVE SETTINGS
============================================================ */

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

    voiceCenterStatus.textContent =
      "✅ Voice settings disimpan.";

    setTimeout(
      function() {

        voiceCenterStatus.textContent =
          "";

      },
      2500
    );

  }
);


/* ============================================================
   NEW SPEAK ENGINE
============================================================ */

function speakNaira(text) {

  if (!text) {
    return;
  }

  if (
    !("speechSynthesis" in window)
  ) {

    setVoiceStatus(
      "❌ Browser tidak menyokong voice."
    );

    return;
  }

  loadVoices();

  try {

    window.speechSynthesis.cancel();

  } catch (error) {}

  const utterance =
    new SpeechSynthesisUtterance(
      text
    );

  nairaSpeech =
    utterance;

  utterance.lang =
    "ms-MY";

  utterance.rate =
    voiceSettings.rate;

  utterance.pitch =
    voiceSettings.pitch;

  utterance.volume =
    voiceSettings.volume;


  /* ========================================================
     SELECT SAVED DEVICE VOICE
  ======================================================== */

  let selectedVoice = null;

  if (
    voiceSettings.voiceName
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

  if (!selectedVoice) {

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


  utterance.onstart =
    function() {

      speaking = true;

      updateVoiceUI();

    };


  utterance.onend =
    function() {

      speaking = false;

      nairaSpeech = null;

      updateVoiceUI();

    };


  utterance.onerror =
    function(event) {

      speaking = false;

      nairaSpeech = null;

      updateVoiceUI();

      console.error(
        "TTS ERROR:",
        event.error
      );

    };


  try {

    window.speechSynthesis.speak(
      utterance
    );

  } catch (error) {

    console.error(
      "SPEAK ERROR:",
      error
    );

    speaking = false;

    updateVoiceUI();

  }

}