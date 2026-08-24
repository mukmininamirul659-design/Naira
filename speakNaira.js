/* ============================================================
   NAIRA VOICE CENTER
   ElevenLabs Voice Engine
   iPhone / Safari Compatible
============================================================ */

"use strict";


/* ============================================================
   CONFIG
============================================================ */

const ELEVENLABS_MODEL = "eleven_multilingual_v2";

const VOICE_API_BASE =
  "https://naira-tawny.vercel.app";

const VOICE_STORAGE_PREFIX =
  "naira_character_voice_";


/* ============================================================
   SETTINGS
============================================================ */

const voiceSettings = {

  voiceName:
    localStorage.getItem("naira_voice_name") || "",

  voiceId:
    localStorage.getItem("naira_eleven_voice_id") || "",

  character:
    localStorage.getItem("naira_voice_character") || "Naira",

  emotion:
    localStorage.getItem("naira_voice_emotion") || "calm",

  rate:
    Number(localStorage.getItem("naira_voice_rate")) || 0.90,

  pitch:
    Number(localStorage.getItem("naira_voice_pitch")) || 1,

  volume:
    Number(localStorage.getItem("naira_voice_volume")) || 1

};


/* ============================================================
   CHARACTERS
============================================================ */

const voiceCharacters = [

  { id:"Naira", label:"🌸 Naira" },
  { id:"female", label:"👩 Female" },
  { id:"male", label:"👨 Male" },
  { id:"child", label:"🧒 Child" },
  { id:"elderly", label:"👵 Elderly" },
  { id:"robot", label:"🤖 Robot" },
  { id:"cartoon", label:"🎭 Cartoon" },
  { id:"villain", label:"🦹 Villain" },
  { id:"narrator", label:"🎙️ Narrator" },
  { id:"cool", label:"😎 Cool" },
  { id:"cute", label:"🥰 Cute" },
  { id:"horror", label:"👻 Horror" }

];


/* ============================================================
   EMOTIONS
============================================================ */

const voiceEmotions = [

  { id:"happy", label:"😊 Happy" },
  { id:"calm", label:"😌 Calm" },
  { id:"sad", label:"😢 Sad" },
  { id:"angry", label:"😡 Angry" },
  { id:"scared", label:"😱 Scared" },
  { id:"excited", label:"🤩 Excited" },
  { id:"sarcastic", label:"😏 Sarcastic" },
  { id:"affectionate", label:"❤️ Affectionate" },
  { id:"sleepy", label:"😴 Sleepy" },
  { id:"dramatic", label:"🎭 Dramatic" }

];


/* ============================================================
   GLOBAL STATE
============================================================ */

window.elevenLabsVoices =
  window.elevenLabsVoices || [];

window.nairaSpeaking = false;

window.nairaAudio =
  window.nairaAudio instanceof Audio
    ? window.nairaAudio
    : new Audio();

window.nairaAudio.preload = "auto";
window.nairaAudio.playsInline = true;

window.nairaAudioUnlocked = false;

let currentAudioUrl = null;


/* ============================================================
   CHARACTER MAP
============================================================ */

const characterVoiceMap = {};


/* ============================================================
   DOM
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
   STATUS
============================================================ */

function setVoiceCenterStatus(message) {

  if (voiceCenterStatus) {
    voiceCenterStatus.textContent = message || "";
  }

}


/* ============================================================
   MAIN PAGE VOICE STATUS
============================================================ */

function setMainVoiceStatus(message) {

  const el =
    document.getElementById("voiceStatus");

  if (el) {
    el.textContent = message || "";
  }

}


/* ============================================================
   UPDATE MAIN UI
============================================================ */

function updateMainVoiceUI() {

  if (
    typeof window.updateVoiceUI === "function"
  ) {

    window.updateVoiceUI();
    return;

  }

  try {

    if (
      typeof updateVoiceUI === "function"
    ) {

      updateVoiceUI();

    }

  } catch (error) {}

}


/* ============================================================
   UNLOCK AUDIO
============================================================ */

async function unlockNairaAudio() {

  if (window.nairaAudioUnlocked) {
    return true;
  }

  /*
   * Audio playback on iPhone normally needs
   * a direct user interaction.
   *
   * We keep one reusable Audio object.
   */

  try {

    const audio = window.nairaAudio;

    audio.playsInline = true;

    window.nairaAudioUnlocked = true;

    console.log("🔓 Naira audio prepared");

    return true;

  } catch (error) {

    console.warn(
      "NAIRA AUDIO UNLOCK ERROR:",
      error
    );

    return false;

  }

}


/* ============================================================
   SAVED CHARACTER VOICE
============================================================ */

function getSavedCharacterVoice(characterId) {

  return (
    localStorage.getItem(
      VOICE_STORAGE_PREFIX + characterId
    ) || ""
  );

}


function saveCharacterVoice(
  characterId,
  voiceId
) {

  if (!characterId || !voiceId) {
    return;
  }

  localStorage.setItem(
    VOICE_STORAGE_PREFIX + characterId,
    voiceId
  );

}


/* ============================================================
   BUILD CHARACTER MAP
============================================================ */

function buildCharacterVoiceMap(voices) {

  if (
    !Array.isArray(voices) ||
    !voices.length
  ) {
    return;
  }


  /*
   * First load saved mappings.
   */

  voiceCharacters.forEach(
    function(character) {

      const saved =
        getSavedCharacterVoice(
          character.id
        );

      if (!saved) {
        return;
      }

      const exists =
        voices.some(
          function(voice) {

            return (
              voice.voice_id === saved
            );

          }
        );

      if (exists) {

        characterVoiceMap[
          character.id
        ] = saved;

      }

    }
  );


  /*
   * Assign voices to characters
   * where no saved mapping exists.
   */

  let index = 0;

  voiceCharacters.forEach(
    function(character) {

      if (
        characterVoiceMap[
          character.id
        ]
      ) {
        return;
      }

      const voice =
        voices[
          index % voices.length
        ];

      if (!voice) {
        return;
      }

      characterVoiceMap[
        character.id
      ] = voice.voice_id;

      saveCharacterVoice(
        character.id,
        voice.voice_id
      );

      index++;

    }
  );

}


/* ============================================================
   CURRENT CHARACTER
============================================================ */

function getCurrentCharacter() {

  return (
    voiceCharacters.find(
      function(character) {

        return (
          character.id ===
          voiceSettings.character
        );

      }
    ) ||
    voiceCharacters[0]
  );

}


/* ============================================================
   CURRENT VOICE
============================================================ */

function getCurrentVoiceId() {

  /*
   * Explicit selected voice first.
   */

  if (voiceSettings.voiceId) {

    const exists =
      (
        window.elevenLabsVoices || []
      ).some(
        function(voice) {

          return (
            voice.voice_id ===
            voiceSettings.voiceId
          );

        }
      );

    if (exists) {
      return voiceSettings.voiceId;
    }

  }


  const character =
    getCurrentCharacter();


  if (
    character &&
    characterVoiceMap[
      character.id
    ]
  ) {

    return characterVoiceMap[
      character.id
    ];

  }


  if (
    window.elevenLabsVoices &&
    window.elevenLabsVoices.length
  ) {

    return (
      window.elevenLabsVoices[0]
        .voice_id
    );

  }


  return "";

}


/* ============================================================
   VOICE NAME
============================================================ */

function getVoiceName(voiceId) {

  const voice =
    (
      window.elevenLabsVoices || []
    ).find(
      function(item) {

        return (
          item.voice_id === voiceId
        );

      }
    );

  return voice
    ? voice.name
    : voiceId;

}


/* ============================================================
   LOAD ELEVENLABS VOICES
============================================================ */

async function loadElevenLabsVoices() {

  try {

    setVoiceCenterStatus(
      "⏳ Loading ElevenLabs voices..."
    );


    const response =
      await fetch(
        VOICE_API_BASE + "/api/voice",
        {
          method: "GET",
          cache: "no-store"
        }
      );


    if (!response.ok) {

      const errorText =
        await response.text();

      throw new Error(
        "Voice API " +
        response.status +
        ": " +
        errorText
      );

    }


    const data =
      await response.json();


    /*
     * Accept either:
     *
     * { voices:[...] }
     *
     * OR directly [...]
     */

    const voices =
      Array.isArray(data)
        ? data
        : data.voices;


    if (
      !Array.isArray(voices)
    ) {

      throw new Error(
        "Response /api/voice tidak mengandungi voices."
      );

    }


    window.elevenLabsVoices =
      voices;


    buildCharacterVoiceMap(
      voices
    );


    /*
     * If no saved voice exists,
     * use first available voice.
     */

    if (
      !voiceSettings.voiceId &&
      voices[0]
    ) {

      voiceSettings.voiceId =
        voices[0].voice_id;

      voiceSettings.voiceName =
        voices[0].name || "";

      localStorage.setItem(
        "naira_eleven_voice_id",
        voiceSettings.voiceId
      );

      localStorage.setItem(
        "naira_voice_name",
        voiceSettings.voiceName
      );

    }


    console.log(
      "✅ ElevenLabs voices:",
      voices
    );


    setVoiceCenterStatus(
      voices.length
        ? "✅ ElevenLabs voices ready."
        : "⚠️ Tiada ElevenLabs voice dijumpai."
    );


    return voices;


  } catch (error) {

    console.error(
      "ELEVENLABS VOICES ERROR:",
      error
    );


    window.elevenLabsVoices = [];


    setVoiceCenterStatus(
      "❌ " + error.message
    );


    return [];

  }

}


/* ============================================================
   RENDER CHARACTERS
============================================================ */

function renderCharacters() {

  if (!characterList) {
    return;
  }


  characterList.innerHTML = "";


  const search =
    voiceSearch
      ? voiceSearch.value
          .trim()
          .toLowerCase()
      : "";


  voiceCharacters
    .filter(
      function(character) {

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

      }
    )
    .forEach(
      function(character) {

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


            localStorage.setItem(
              "naira_voice_character",
              character.id
            );


            const mappedVoice =
              characterVoiceMap[
                character.id
              ];


            if (mappedVoice) {

              voiceSettings.voiceId =
                mappedVoice;


              localStorage.setItem(
                "naira_eleven_voice_id",
                mappedVoice
              );


              if (voiceSelect) {

                voiceSelect.value =
                  mappedVoice;

              }

            }


            applyCharacterSettings();

            renderCharacters();

            renderVoiceSelect();


            setVoiceCenterStatus(
              mappedVoice
                ? character.label +
                  " • " +
                  getVoiceName(
                    mappedVoice
                  )
                : character.label
            );

          }
        );


        characterList.appendChild(
          button
        );

      }
    );

}


/* ============================================================
   RENDER EMOTIONS
============================================================ */

function renderEmotions() {

  if (!emotionList) {
    return;
  }


  emotionList.innerHTML = "";


  const search =
    voiceSearch
      ? voiceSearch.value
          .trim()
          .toLowerCase()
      : "";


  voiceEmotions
    .filter(
      function(emotion) {

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

      }
    )
    .forEach(
      function(emotion) {

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


            localStorage.setItem(
              "naira_voice_emotion",
              emotion.id
            );


            applyEmotionSettings();

            renderEmotions();


            setVoiceCenterStatus(
              "🎭 Emotion: " +
              emotion.label
            );

          }
        );


        emotionList.appendChild(
          button
        );

      }
    );

}


/* ============================================================
   VOICE SELECT
============================================================ */

function renderVoiceSelect() {

  if (!voiceSelect) {
    return;
  }


  voiceSelect.innerHTML = "";


  const voices =
    window.elevenLabsVoices || [];


  if (!voices.length) {

    const option =
      document.createElement(
        "option"
      );

    option.value = "";

    option.textContent =
      "ElevenLabs voice belum dimuat";

    voiceSelect.appendChild(
      option
    );

    return;

  }


  const currentVoice =
    getCurrentVoiceId();


  voices
    .slice()
    .sort(
      function(a,b) {

        return (
          (a.name || "")
            .localeCompare(
              b.name || ""
            )
        );

      }
    )
    .forEach(
      function(voice) {

        const option =
          document.createElement(
            "option"
          );


        option.value =
          voice.voice_id;


        option.textContent =
          voice.name ||
          "Unnamed Voice";


        if (
          voice.voice_id ===
          currentVoice
        ) {

          option.selected = true;

        }


        voiceSelect.appendChild(
          option
        );

      }
    );

}


/* ============================================================
   MANUAL VOICE SELECT
============================================================ */

if (voiceSelect) {

  voiceSelect.addEventListener(
    "change",
    function() {

      const voiceId =
        voiceSelect.value;


      if (!voiceId) {
        return;
      }


      voiceSettings.voiceId =
        voiceId;

      voiceSettings.voiceName =
        getVoiceName(
          voiceId
        );


      localStorage.setItem(
        "naira_eleven_voice_id",
        voiceId
      );


      localStorage.setItem(
        "naira_voice_name",
        voiceSettings.voiceName
      );


      characterVoiceMap[
        voiceSettings.character
      ] = voiceId;


      saveCharacterVoice(
        voiceSettings.character,
        voiceId
      );


      setVoiceCenterStatus(
        "🎙️ Voice: " +
        voiceSettings.voiceName
      );

    }
  );

}


/* ============================================================
   CHARACTER SETTINGS
============================================================ */

function applyCharacterSettings() {

  switch (
    voiceSettings.character
  ) {

    case "child":
      voiceSettings.rate = 1.05;
      voiceSettings.pitch = 1.15;
      break;

    case "elderly":
      voiceSettings.rate = 0.82;
      voiceSettings.pitch = 0.90;
      break;

    case "robot":
      voiceSettings.rate = 0.92;
      voiceSettings.pitch = 0.85;
      break;

    case "villain":
      voiceSettings.rate = 0.82;
      voiceSettings.pitch = 0.85;
      break;

    case "narrator":
      voiceSettings.rate = 0.82;
      voiceSettings.pitch = 0.95;
      break;

    case "cool":
      voiceSettings.rate = 0.88;
      voiceSettings.pitch = 0.95;
      break;

    case "cute":
      voiceSettings.rate = 0.98;
      voiceSettings.pitch = 1.10;
      break;

    case "horror":
      voiceSettings.rate = 0.68;
      voiceSettings.pitch = 0.80;
      break;

    case "male":
      voiceSettings.rate = 0.90;
      voiceSettings.pitch = 0.95;
      break;

    case "female":
      voiceSettings.rate = 0.92;
      voiceSettings.pitch = 1.05;
      break;

    case "cartoon":
      voiceSettings.rate = 1.08;
      voiceSettings.pitch = 1.15;
      break;

    default:
      voiceSettings.rate = 0.90;
      voiceSettings.pitch = 1;
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
      voiceSettings.rate = 1.04;
      break;

    case "sad":
      voiceSettings.rate = 0.78;
      break;

    case "angry":
      voiceSettings.rate = 1.08;
      break;

    case "scared":
      voiceSettings.rate = 1.15;
      break;

    case "excited":
      voiceSettings.rate = 1.12;
      break;

    case "sarcastic":
      voiceSettings.rate = 0.86;
      break;

    case "affectionate":
      voiceSettings.rate = 0.82;
      break;

    case "sleepy":
      voiceSettings.rate = 0.65;
      break;

    case "dramatic":
      voiceSettings.rate = 0.76;
      break;

    default:
      voiceSettings.rate = 0.90;
      break;

  }


  syncVoiceControls();

}


/* ============================================================
   SYNC CONTROLS
============================================================ */

function syncVoiceControls() {

  if (rateControl) {

    rateControl.value =
      voiceSettings.rate;

  }


  if (pitchControl) {

    pitchControl.value =
      voiceSettings.pitch;

  }


  if (volumeControl) {

    volumeControl.value =
      voiceSettings.volume;

  }


  if (rateValue) {

    rateValue.textContent =
      Number(
        voiceSettings.rate
      ).toFixed(2);

  }


  if (pitchValue) {

    pitchValue.textContent =
      Number(
        voiceSettings.pitch
      ).toFixed(2);

  }


  if (volumeValue) {

    volumeValue.textContent =
      Number(
        voiceSettings.volume
      ).toFixed(2);

  }

}


/* ============================================================
   OPEN VOICE CENTER
============================================================ */

if (voiceCenterButton) {

  voiceCenterButton.addEventListener(
    "click",
    async function() {

      /*
       * Important on iPhone:
       * this runs directly from click.
       */

      await unlockNairaAudio();


      if (voiceCenterPanel) {

        voiceCenterPanel.classList.add(
          "active"
        );

      }


      renderCharacters();

      renderEmotions();

      syncVoiceControls();


      /*
       * Only reload if voices
       * haven't been loaded.
       */

      if (
        !window.elevenLabsVoices.length
      ) {

        const voices =
          await loadElevenLabsVoices();

        buildCharacterVoiceMap(
          voices
        );

      }


      renderCharacters();

      renderEmotions();

      renderVoiceSelect();


      if (
        window.elevenLabsVoices.length
      ) {

        setVoiceCenterStatus(
          "✅ ElevenLabs Voice Center ready."
        );

      }

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

        voiceCenterPanel.classList.remove(
          "active"
        );

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
   RATE
============================================================ */

if (rateControl) {

  rateControl.addEventListener(
    "input",
    function() {

      voiceSettings.rate =
        Number(
          rateControl.value
        );


      localStorage.setItem(
        "naira_voice_rate",
        String(
          voiceSettings.rate
        )
      );


      if (rateValue) {

        rateValue.textContent =
          voiceSettings.rate
            .toFixed(2);

      }


      /*
       * Change current playing audio
       * immediately.
       */

      if (
        window.nairaAudio
      ) {

        window.nairaAudio.playbackRate =
          voiceSettings.rate;

      }

    }
  );

}


/* ============================================================
   PITCH
============================================================ */

if (pitchControl) {

  pitchControl.addEventListener(
    "input",
    function() {

      voiceSettings.pitch =
        Number(
          pitchControl.value
        );


      localStorage.setItem(
        "naira_voice_pitch",
        String(
          voiceSettings.pitch
        )
      );


      if (pitchValue) {

        pitchValue.textContent =
          voiceSettings.pitch
            .toFixed(2);

      }

    }
  );

}


/* ============================================================
   VOLUME
============================================================ */

if (volumeControl) {

  volumeControl.addEventListener(
    "input",
    function() {

      voiceSettings.volume =
        Number(
          volumeControl.value
        );


      localStorage.setItem(
        "naira_voice_volume",
        String(
          voiceSettings.volume
        )
      );


      if (volumeValue) {

        volumeValue.textContent =
          voiceSettings.volume
            .toFixed(2);

      }


      if (
        window.nairaAudio
      ) {

        window.nairaAudio.volume =
          Math.max(
            0,
            Math.min(
              1,
              voiceSettings.volume
            )
          );

      }

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

      const selectedVoiceId =
        voiceSelect
          ? voiceSelect.value
          : voiceSettings.voiceId;


      if (selectedVoiceId) {

        voiceSettings.voiceId =
          selectedVoiceId;

        voiceSettings.voiceName =
          getVoiceName(
            selectedVoiceId
          );


        characterVoiceMap[
          voiceSettings.character
        ] = selectedVoiceId;


        saveCharacterVoice(
          voiceSettings.character,
          selectedVoiceId
        );

      }


      localStorage.setItem(
        "naira_voice_name",
        voiceSettings.voiceName || ""
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
        String(
          voiceSettings.rate
        )
      );


      localStorage.setItem(
        "naira_voice_pitch",
        String(
          voiceSettings.pitch
        )
      );


      localStorage.setItem(
        "naira_voice_volume",
        String(
          voiceSettings.volume
        )
      );


      localStorage.setItem(
        "naira_eleven_voice_id",
        voiceSettings.voiceId || ""
      );


      setVoiceCenterStatus(
        "✅ Voice settings disimpan."
      );


      setTimeout(
        function() {

          setVoiceCenterStatus("");

        },
        2000
      );

    }
  );

}


/* ============================================================
   PREVIEW
============================================================ */

if (previewVoice) {

  previewVoice.addEventListener(
    "click",
    async function() {

      await unlockNairaAudio();


      const text =
        voicePreviewText
          ? voicePreviewText.value.trim()
          : "";


      if (!text) {

        setVoiceCenterStatus(
          "⚠️ Masukkan teks dahulu."
        );

        return;

      }


      setVoiceCenterStatus(
        "🎙️ Generating voice..."
      );


      await speakNaira(
        text
      );

    }
  );

}


/* ============================================================
   STOP SPEECH
============================================================ */

function stopNairaSpeech() {

  const audio =
    window.nairaAudio;


  if (audio) {

    try {

      audio.pause();

      audio.currentTime = 0;

    } catch (error) {}

  }


  if (currentAudioUrl) {

    try {

      URL.revokeObjectURL(
        currentAudioUrl
      );

    } catch (error) {}

    currentAudioUrl = null;

  }


  window.nairaSpeaking = false;


  /*
   * index.html has a `speaking`
   * variable. Because it's defined
   * in another script, access carefully.
   */

  try {

    speaking = false;

  } catch (error) {}


  updateMainVoiceUI();

  setMainVoiceStatus("");

}


/* ============================================================
   SPEAK NAIRA
============================================================ */

async function speakNaira(
  text,
  voiceId = null
) {

  if (
    !text ||
    !String(text).trim()
  ) {
    return false;
  }


  const cleanText =
    String(text).trim();


  const audio =
    window.nairaAudio;


  /*
   * Stop previous voice.
   */

  stopNairaSpeech();


  /*
   * Load voices if needed.
   */

  if (
    !window.elevenLabsVoices ||
    !window.elevenLabsVoices.length
  ) {

    setMainVoiceStatus(
      "⏳ Loading voice..."
    );


    await loadElevenLabsVoices();

  }


  const activeVoiceId =
    voiceId ||
    getCurrentVoiceId();


  if (!activeVoiceId) {

    console.error(
      "❌ Tiada ElevenLabs Voice ID"
    );


    setMainVoiceStatus(
      "❌ Tiada ElevenLabs voice tersedia."
    );


    setVoiceCenterStatus(
      "❌ Tiada ElevenLabs voice tersedia."
    );


    return false;

  }


  const activeVoiceName =
    getVoiceName(
      activeVoiceId
    );


  console.log(
    "🎙️ Naira speaking:",
    activeVoiceName,
    activeVoiceId
  );


  window.nairaSpeaking = true;


  try {

    speaking = true;

  } catch (error) {}


  updateMainVoiceUI();


  setMainVoiceStatus(
    "🎙️ Naira sedang menyediakan suara..."
  );


  try {

    /*
     * ==========================================
     * ELEVENLABS API REQUEST
     * ==========================================
     */

    const response =
      await fetch(
        VOICE_API_BASE + "/api/speak",
        {

          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body:
            JSON.stringify({

              text:
                cleanText,

              voiceId:
                activeVoiceId,

              modelId:
                ELEVENLABS_MODEL,

              character:
                voiceSettings.character,

              emotion:
                voiceSettings.emotion,

              rate:
                voiceSettings.rate,

              pitch:
                voiceSettings.pitch

            })

        }
      );


    /*
     * API error
     */

    if (!response.ok) {

      const errorText =
        await response.text();


      console.error(
        "ELEVENLABS API ERROR:",
        response.status,
        errorText
      );


      throw new Error(
        "Voice API gagal (" +
        response.status +
        ")"
      );

    }


    /*
     * Validate content type.
     */

    const contentType =
      response.headers.get(
        "content-type"
      ) || "";


    console.log(
      "🎧 Voice response:",
      response.status,
      contentType
    );


    /*
     * If API accidentally returned JSON,
     * show actual server error instead
     * of trying to play JSON as audio.
     */

    if (
      contentType.includes(
        "application/json"
      )
    ) {

      const json =
        await response.json();


      throw new Error(
        json.error ||
        json.message ||
        "API tidak memulangkan audio."
      );

    }


    /*
     * Get audio.
     */

    const audioBlob =
      await response.blob();


    if (
      !audioBlob ||
      audioBlob.size === 0
    ) {

      throw new Error(
        "Audio kosong diterima daripada server."
      );

    }


    console.log(
      "🎧 Audio size:",
      audioBlob.size
    );


    /*
     * Revoke previous object URL.
     */

    if (currentAudioUrl) {

      try {

        URL.revokeObjectURL(
          currentAudioUrl
        );

      } catch (error) {}

    }


    currentAudioUrl =
      URL.createObjectURL(
        audioBlob
      );


    /*
     * Prepare reusable player.
     */

    audio.pause();

    audio.src =
      currentAudioUrl;

    audio.preload =
      "auto";

    audio.playsInline =
      true;


    audio.volume =
      Math.max(
        0,
        Math.min(
          1,
          Number(
            voiceSettings.volume
          )
        )
      );


    audio.playbackRate =
      Math.max(
        0.5,
        Math.min(
          2,
          Number(
            voiceSettings.rate
          ) || 1
        )
      );


    /*
     * Audio events.
     */

    audio.onplay =
      function() {

        window.nairaSpeaking = true;


        try {

          speaking = true;

        } catch (error) {}


        setMainVoiceStatus(
          "🔊 Naira sedang bercakap..."
        );


        setVoiceCenterStatus(
          "🔊 Playing " +
          activeVoiceName
        );


        updateMainVoiceUI();

      };


    audio.onended =
      function() {

        window.nairaSpeaking = false;


        try {

          speaking = false;

        } catch (error) {}


        setMainVoiceStatus("");

        setVoiceCenterStatus("");


        updateMainVoiceUI();


        if (currentAudioUrl) {

          try {

            URL.revokeObjectURL(
              currentAudioUrl
            );

          } catch (error) {}

          currentAudioUrl = null;

        }

      };


    audio.onerror =
      function(event) {

        console.error(
          "NAIRA AUDIO ERROR:",
          event
        );


        window.nairaSpeaking = false;


        try {

          speaking = false;

        } catch (error) {}


        setMainVoiceStatus(
          "❌ Audio gagal dimainkan."
        );


        setVoiceCenterStatus(
          "❌ Audio gagal dimainkan."
        );


        updateMainVoiceUI();

      };


    /*
     * Wait until metadata is ready.
     */

    audio.load();


    /*
     * PLAY
     */

    try {

      await audio.play();

    } catch (playError) {

      console.error(
        "AUDIO PLAY ERROR:",
        playError
      );


      /*
       * iOS may block autoplay when
       * speakNaira was triggered after
       * an asynchronous network request.
       */

      window.nairaSpeaking = false;


      try {

        speaking = false;

      } catch (error) {}


      updateMainVoiceUI();


      setMainVoiceStatus(
        "🔊 Tekan ikon speaker untuk dengar suara."
      );


      setVoiceCenterStatus(
        "⚠️ Browser block autoplay. Tekan Test Voice sekali lagi."
      );


      return false;

    }


    return true;


  } catch (error) {

    console.error(
      "❌ NAIRA SPEAK ERROR:",
      error
    );


    window.nairaSpeaking = false;


    try {

      speaking = false;

    } catch (e) {}


    updateMainVoiceUI();


    setMainVoiceStatus(
      "❌ " +
      (
        error.message ||
        "Voice gagal dimainkan."
      )
    );


    setVoiceCenterStatus(
      "❌ " +
      (
        error.message ||
        "Voice gagal dimainkan."
      )
    );


    return false;

  }

}


/* ============================================================
   INITIALIZE VOICE CENTER
============================================================ */

async function initializeVoiceCenter() {

  renderCharacters();

  renderEmotions();

  syncVoiceControls();


  /*
   * Do not let failure here kill
   * the rest of the page.
   */

  try {

    const voices =
      await loadElevenLabsVoices();


    if (voices.length) {

      buildCharacterVoiceMap(
        voices
      );

      renderCharacters();

      renderVoiceSelect();


      console.log(
        "✅ Naira Voice Center initialized"
      );

    } else {

      console.warn(
        "⚠️ ElevenLabs voices unavailable"
      );

    }

  } catch (error) {

    console.error(
      "VOICE CENTER INIT ERROR:",
      error
    );

  }

}


/* ============================================================
   AUDIO UNLOCK EVENTS
============================================================ */

function setupAudioUnlock() {

  const unlock =
    function() {

      unlockNairaAudio();

    };


  document.addEventListener(
    "touchstart",
    unlock,
    {
      once: true,
      passive: true
    }
  );


  document.addEventListener(
    "click",
    unlock,
    {
      once: true
    }
  );

}


/* ============================================================
   GLOBAL ACCESS
============================================================ */

window.speakNaira =
  speakNaira;

window.stopNairaSpeech =
  stopNairaSpeech;

window.unlockNairaAudio =
  unlockNairaAudio;

window.voiceSettings =
  voiceSettings;

window.voiceCharacters =
  voiceCharacters;

window.voiceEmotions =
  voiceEmotions;

window.loadElevenLabsVoices =
  loadElevenLabsVoices;

window.getCurrentVoiceId =
  getCurrentVoiceId;

window.getVoiceName =
  getVoiceName;


/* ============================================================
   START
============================================================ */

setupAudioUnlock();

renderCharacters();

renderEmotions();

syncVoiceControls();


initializeVoiceCenter()
  .catch(
    function(error) {

      console.error(
        "NAIRA VOICE INITIALIZATION ERROR:",
        error
      );

    }
  );


console.log(
  "========================================"
);

console.log(
  "✅ speakNaira.js loaded"
);

console.log(
  "Voice API:",
  VOICE_API_BASE + "/api/voice"
);

console.log(
  "Speak API:",
  VOICE_API_BASE + "/api/speak"
);

console.log(
  "========================================"
);