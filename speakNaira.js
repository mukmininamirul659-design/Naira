/* ============================================================
   NAIRA VOICE CENTER
   ElevenLabs Voice Engine
   iPhone / Safari Compatible
============================================================ */

"use strict";


/* ============================================================
   CONFIG
============================================================ */

const ELEVENLABS_MODEL =
  "eleven_multilingual_v2";

const VOICE_API_BASE =
  "https://naira-tawny.vercel.app";

const VOICE_STORAGE_PREFIX =
  "naira_character_voice_";


/* ============================================================
   VOICE SETTINGS
============================================================ */

const voiceSettings = {

  voiceName:
    localStorage.getItem(
      "naira_voice_name"
    ) || "",

  voiceId:
    localStorage.getItem(
      "naira_eleven_voice_id"
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
    ) || 1.00,

  volume:
    Number(
      localStorage.getItem(
        "naira_voice_volume"
      )
    ) || 1.00

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
   EMOTIONS
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
  }

];


/* ============================================================
   STATE
============================================================ */

window.elevenLabsVoices =
  window.elevenLabsVoices || [];

window.nairaSpeaking =
  window.nairaSpeaking || false;


/* ============================================================
   REUSABLE AUDIO PLAYER
   IMPORTANT FOR IPHONE SAFARI
============================================================ */

window.nairaAudio =
  window.nairaAudio instanceof Audio
    ? window.nairaAudio
    : new Audio();

window.nairaAudio.preload =
  "auto";

window.nairaAudio.playsInline =
  true;

window.nairaAudioUnlocked =
  window.nairaAudioUnlocked ||
  false;


/* ============================================================
   CHARACTER -> VOICE MAP
============================================================ */

const characterVoiceMap =
  {};


/* ============================================================
   DOM
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
   STATUS
============================================================ */

function setVoiceStatus(
  message
) {

  if (!voiceCenterStatus) {
    return;
  }

  voiceCenterStatus.textContent =
    message || "";

}


/* ============================================================
   UNLOCK AUDIO FOR IPHONE / SAFARI
============================================================ */

async function unlockNairaAudio() {

  if (
    window.nairaAudioUnlocked
  ) {
    return true;
  }

  try {

    const audio =
      window.nairaAudio;

    const oldVolume =
      audio.volume;

    /*
     * Very small silent-ish mp3.
     */

    audio.src =
      "data:audio/mp3;base64,//uQxAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAACAAACcQCA";

    audio.volume =
      0.01;

    await audio.play();

    audio.pause();

    try {
      audio.currentTime = 0;
    } catch (error) {}

    audio.volume =
      Number(
        voiceSettings.volume
      ) || oldVolume || 1;

    window.nairaAudioUnlocked =
      true;

    console.log(
      "🔓 Naira audio unlocked"
    );

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
   GET SAVED CHARACTER VOICE
============================================================ */

function getSavedCharacterVoice(
  characterId
) {

  return (
    localStorage.getItem(
      VOICE_STORAGE_PREFIX +
      characterId
    ) || ""
  );

}


/* ============================================================
   SAVE CHARACTER VOICE
============================================================ */

function saveCharacterVoice(
  characterId,
  voiceId
) {

  if (
    !characterId ||
    !voiceId
  ) {
    return;
  }

  localStorage.setItem(
    VOICE_STORAGE_PREFIX +
    characterId,
    voiceId
  );

}


/* ============================================================
   BUILD CHARACTER VOICE MAP
============================================================ */

function buildCharacterVoiceMap(
  voices
) {

  if (
    !Array.isArray(voices) ||
    !voices.length
  ) {
    return;
  }


  /*
   * Load existing saved mappings.
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
              voice.voice_id ===
              saved
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
   * Remaining voice IDs.
   */

  const usedIds =
    Object.values(
      characterVoiceMap
    );

  const availableVoices =
    voices.filter(
      function(voice) {

        return (
          voice &&
          voice.voice_id &&
          !usedIds.includes(
            voice.voice_id
          )
        );

      }
    );


  /*
   * Assign different voice where possible.
   */

  let voiceIndex =
    0;

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
        availableVoices[
          voiceIndex
        ];

      if (!voice) {
        return;
      }

      characterVoiceMap[
        character.id
      ] =
        voice.voice_id;

      saveCharacterVoice(
        character.id,
        voice.voice_id
      );

      voiceIndex++;

    }
  );


  /*
   * If fewer voices than characters,
   * reuse existing voices.
   */

  voiceCharacters.forEach(
    function(character) {

      if (
        characterVoiceMap[
          character.id
        ]
      ) {
        return;
      }

      const fallback =
        voices[
          voiceIndex %
          voices.length
        ];

      if (!fallback) {
        return;
      }

      characterVoiceMap[
        character.id
      ] =
        fallback.voice_id;

      saveCharacterVoice(
        character.id,
        fallback.voice_id
      );

      voiceIndex++;

    }
  );

}


/* ============================================================
   GET CURRENT CHARACTER
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
   GET CURRENT VOICE ID
============================================================ */

function getCurrentVoiceId() {

  const character =
    getCurrentCharacter();

  if (
    character &&
    characterVoiceMap[
      character.id
    ]
  ) {

    return (
      characterVoiceMap[
        character.id
      ]
    );

  }


  if (
    voiceSettings.voiceId
  ) {

    return (
      voiceSettings.voiceId
    );

  }


  if (
    window.elevenLabsVoices &&
    window.elevenLabsVoices[0]
  ) {

    return (
      window.elevenLabsVoices[0]
        .voice_id
    );

  }


  return "";

}


/* ============================================================
   GET VOICE NAME
============================================================ */

function getVoiceName(
  voiceId
) {

  const voice =
    (
      window.elevenLabsVoices ||
      []
    ).find(
      function(item) {

        return (
          item.voice_id ===
          voiceId
        );

      }
    );

  return (
    voice
      ? voice.name
      : voiceId
  );

}


/* ============================================================
   LOAD ELEVENLABS VOICES
============================================================ */

async function loadElevenLabsVoices() {

  try {

    const response =
      await fetch(
        VOICE_API_BASE +
"/api/voice"
        {
          method:
            "GET",

          cache:
            "no-store"
        }
      );


    if (!response.ok) {

      throw new Error(
        "API voices gagal: " +
        response.status
      );

    }


    const data =
      await response.json();


    if (
      !data.voices ||
      !Array.isArray(
        data.voices
      )
    ) {

      throw new Error(
        "Response voices tidak sah."
      );

    }


    window.elevenLabsVoices =
      data.voices;


    buildCharacterVoiceMap(
      data.voices
    );


    console.log(
      "🎙️ ElevenLabs voices loaded:",
      data.voices
    );


    return data.voices;

  } catch (error) {

    console.error(
      "ELEVENLABS VOICES ERROR:",
      error
    );


    window.elevenLabsVoices =
      [];


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


  characterList.innerHTML =
    "";


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


        button.type =
          "button";


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


            const voiceId =
              characterVoiceMap[
                character.id
              ] || "";


            if (voiceId) {

              voiceSettings.voiceId =
                voiceId;


              localStorage.setItem(
                "naira_eleven_voice_id",
                voiceId
              );


              if (voiceSelect) {
                voiceSelect.value =
                  voiceId;
              }

            }


            renderCharacters();

            renderVoiceSelect();

            syncVoiceControls();


            setVoiceStatus(
              voiceId
                ? character.label +
                  " → " +
                  getVoiceName(
                    voiceId
                  )
                : "⚠️ Voice belum tersedia."
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


  emotionList.innerHTML =
    "";


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


        button.type =
          "button";


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


            renderEmotions();

            applyEmotionSettings();


            setVoiceStatus(
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
   RENDER VOICE SELECT
============================================================ */

function renderVoiceSelect() {

  if (!voiceSelect) {
    return;
  }


  voiceSelect.innerHTML =
    "";


  const voices =
    window.elevenLabsVoices ||
    [];


  if (!voices.length) {

    const option =
      document.createElement(
        "option"
      );


    option.value =
      "";


    option.textContent =
      "ElevenLabs voice belum dimuat";


    voiceSelect.appendChild(
      option
    );


    return;

  }


  voices
    .slice()
    .sort(
      function(a, b) {

        return (
          (
            a.name || ""
          ).localeCompare(
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
          getCurrentVoiceId()
        ) {

          option.selected =
            true;

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


      localStorage.setItem(
        "naira_eleven_voice_id",
        voiceId
      );


      saveCharacterVoice(
        voiceSettings.character,
        voiceId
      );


      characterVoiceMap[
        voiceSettings.character
      ] =
        voiceId;


      setVoiceStatus(
        "🎙️ Voice: " +
        getVoiceName(
          voiceId
        )
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

      voiceSettings.rate =
        1.05;

      voiceSettings.pitch =
        1.15;

      break;


    case "elderly":

      voiceSettings.rate =
        0.82;

      voiceSettings.pitch =
        0.90;

      break;


    case "robot":

      voiceSettings.rate =
        0.92;

      voiceSettings.pitch =
        0.85;

      break;


    case "villain":

      voiceSettings.rate =
        0.82;

      voiceSettings.pitch =
        0.85;

      break;


    case "narrator":

      voiceSettings.rate =
        0.82;

      voiceSettings.pitch =
        0.95;

      break;


    case "cool":

      voiceSettings.rate =
        0.88;

      voiceSettings.pitch =
        0.95;

      break;


    case "cute":

      voiceSettings.rate =
        0.98;

      voiceSettings.pitch =
        1.10;

      break;


    case "horror":

      voiceSettings.rate =
        0.68;

      voiceSettings.pitch =
        0.80;

      break;


    case "male":

      voiceSettings.rate =
        0.90;

      voiceSettings.pitch =
        0.95;

      break;


    case "female":

      voiceSettings.rate =
        0.92;

      voiceSettings.pitch =
        1.05;

      break;


    case "cartoon":

      voiceSettings.rate =
        1.08;

      voiceSettings.pitch =
        1.15;

      break;


    default:

      voiceSettings.rate =
        0.90;

      voiceSettings.pitch =
        1.00;

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

      break;


    case "sad":

      voiceSettings.rate =
        0.78;

      break;


    case "angry":

      voiceSettings.rate =
        1.08;

      break;


    case "scared":

      voiceSettings.rate =
        1.15;

      break;


    case "excited":

      voiceSettings.rate =
        1.12;

      break;


    case "sarcastic":

      voiceSettings.rate =
        0.86;

      break;


    case "affectionate":

      voiceSettings.rate =
        0.82;

      break;


    case "sleepy":

      voiceSettings.rate =
        0.65;

      break;


    case "dramatic":

      voiceSettings.rate =
        0.76;

      break;


    default:

      voiceSettings.rate =
        0.90;

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

if (
  voiceCenterButton
) {

  voiceCenterButton.addEventListener(
    "click",
    async function() {

      await unlockNairaAudio();


      if (
        voiceCenterPanel
      ) {

        voiceCenterPanel.classList.add(
          "active"
        );

      }


      renderCharacters();

      renderEmotions();

      syncVoiceControls();


      setVoiceStatus(
        "⏳ Loading ElevenLabs voices..."
      );


      const voices =
        await loadElevenLabsVoices();


      renderCharacters();

      renderVoiceSelect();


      setVoiceStatus(
        voices.length
          ? "✅ ElevenLabs Voice Center ready."
          : "❌ ElevenLabs voices gagal dimuat."
      );

    }
  );

}


/* ============================================================
   CLOSE VOICE CENTER
============================================================ */

if (
  closeVoiceCenter
) {

  closeVoiceCenter.addEventListener(
    "click",
    function() {

      if (
        voiceCenterPanel
      ) {

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

if (
  voiceSearch
) {

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

if (
  rateControl
) {

  rateControl.addEventListener(
    "input",
    function() {

      voiceSettings.rate =
        Number(
          rateControl.value
        );


      localStorage.setItem(
        "naira_voice_rate",
        voiceSettings.rate
      );


      if (rateValue) {

        rateValue.textContent =
          voiceSettings.rate
            .toFixed(2);

      }

    }
  );

}


/* ============================================================
   PITCH
============================================================ */

if (
  pitchControl
) {

  pitchControl.addEventListener(
    "input",
    function() {

      voiceSettings.pitch =
        Number(
          pitchControl.value
        );


      localStorage.setItem(
        "naira_voice_pitch",
        voiceSettings.pitch
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

if (
  volumeControl
) {

  volumeControl.addEventListener(
    "input",
    function() {

      voiceSettings.volume =
        Number(
          volumeControl.value
        );


      localStorage.setItem(
        "naira_voice_volume",
        voiceSettings.volume
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

if (
  saveVoiceSettings
) {

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


      localStorage.setItem(
        "naira_eleven_voice_id",
        voiceSettings.voiceId
      );


      if (
        voiceSettings.voiceId
      ) {

        saveCharacterVoice(
          voiceSettings.character,
          voiceSettings.voiceId
        );

      }


      setVoiceStatus(
        "✅ Voice settings disimpan."
      );


      setTimeout(
        function() {

          setVoiceStatus(
            ""
          );

        },
        2500
      );

    }
  );

}


/* ============================================================
   PREVIEW
============================================================ */

if (
  previewVoice
) {

  previewVoice.addEventListener(
    "click",
    async function() {

      await unlockNairaAudio();


      const text =
        voicePreviewText
          ? voicePreviewText.value.trim()
          : "";


      if (!text) {

        setVoiceStatus(
          "⚠️ Masukkan teks dahulu."
        );

        return;

      }


      await speakNaira(
        text
      );

    }
  );

}


/* ============================================================
   STOP NAIRA SPEECH
============================================================ */

function stopNairaSpeech() {

  const audio =
    window.nairaAudio;


  if (audio) {

    try {

      audio.pause();

      audio.currentTime =
        0;

    } catch (error) {}

  }


  window.nairaSpeaking =
    false;


  try {

    speaking =
      false;

  } catch (error) {}


  if (
    typeof updateVoiceUI ===
    "function"
  ) {

    updateVoiceUI();

  }

}


/* ============================================================
   MAIN ELEVENLABS SPEAK ENGINE
============================================================ */

async function speakNaira(
  text,
  voiceId = null
) {

  if (
    !text ||
    !text.trim()
  ) {

    return;

  }


  /*
   * Reuse same audio element.
   */

  const audio =
    window.nairaAudio;


  /*
   * Stop old audio.
   */

  stopNairaSpeech();


  /*
   * Load voices if needed.
   */

  if (
    !window.elevenLabsVoices ||
    !window.elevenLabsVoices.length
  ) {

    await loadElevenLabsVoices();

  }


  /*
   * Determine voice.
   */

  const activeVoiceId =
    voiceId ||
    getCurrentVoiceId();


  if (!activeVoiceId) {

    console.error(
      "NAIRA: Tiada ElevenLabs Voice ID."
    );


    setVoiceStatus(
      "⚠️ Tiada ElevenLabs Voice ID."
    );


    return;

  }


  const activeVoiceName =
    getVoiceName(
      activeVoiceId
    );


  console.log(
    "🎙️ NAIRA SPEAK:",
    activeVoiceName,
    activeVoiceId
  );


  try {

    window.nairaSpeaking =
      true;


    try {

      speaking =
        true;

    } catch (error) {}


    if (
      typeof updateVoiceUI ===
      "function"
    ) {

      updateVoiceUI();

    }


    /*
     * ElevenLabs request.
     */

    const response =
      await fetch(
        VOICE_API_BASE +
"/api/speak"
        {

          method:
            "POST",

          headers: {

            "Content-Type":
              "application/json"

          },

          body:
            JSON.stringify({

              text:
                text.trim(),

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


    if (!response.ok) {

      const errorText =
        await response.text();


      console.error(
        "NAIRA ELEVENLABS API ERROR:",
        errorText
      );


      throw new Error(
        "ElevenLabs API gagal."
      );

    }


    /*
     * Audio blob.
     */

    const audioBlob =
      await response.blob();


    if (
      !audioBlob ||
      audioBlob.size === 0
    ) {

      throw new Error(
        "Audio kosong diterima."
      );

    }


    const audioUrl =
      URL.createObjectURL(
        audioBlob
      );


    /*
     * IMPORTANT:
     * Reuse unlocked audio element.
     */

    audio.pause();

    audio.src =
      audioUrl;

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
          ) || 1
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


    audio.onplay =
      function() {

        window.nairaSpeaking =
          true;


        try {

          speaking =
            true;

        } catch (error) {}


        if (
          typeof updateVoiceUI ===
          "function"
        ) {

          updateVoiceUI();

        }

      };


    audio.onended =
      function() {

        window.nairaSpeaking =
          false;


        try {

          speaking =
            false;

        } catch (error) {}


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


    audio.onerror =
      function(error) {

        console.error(
          "NAIRA AUDIO ERROR:",
          error
        );


        window.nairaSpeaking =
          false;


        try {

          speaking =
            false;

        } catch (error) {}


        URL.revokeObjectURL(
          audioUrl
        );


        setVoiceStatus(
          "❌ Audio gagal dimainkan."
        );


        if (
          typeof updateVoiceUI ===
          "function"
        ) {

          updateVoiceUI();

        }

      };


    /*
     * Play audio.
     */

    await audio.play();


  } catch (error) {

    console.error(
      "NAIRA SPEAK ERROR:",
      error
    );


    window.nairaSpeaking =
      false;


    try {

      speaking =
        false;

    } catch (error) {}


    setVoiceStatus(
      "❌ Voice gagal dimainkan."
    );


    if (
      typeof updateVoiceUI ===
      "function"
    ) {

      updateVoiceUI();

    }

  }

}


/* ============================================================
   INITIALIZE
============================================================ */

async function initializeVoiceCenter() {

  renderCharacters();

  renderEmotions();

  syncVoiceControls();


  const voices =
    await loadElevenLabsVoices();


  if (
    voices.length
  ) {

    buildCharacterVoiceMap(
      voices
    );

    renderCharacters();

    renderVoiceSelect();


    console.log(
      "✅ Naira Voice Center initialized."
    );

  } else {

    console.warn(
      "⚠️ ElevenLabs voices belum tersedia."
    );

  }

}


/* ============================================================
   IPHONE AUDIO UNLOCK EVENTS
============================================================ */

function setupAudioUnlock() {

  const unlock =
    async function() {

      await unlockNairaAudio();

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


/* ============================================================
   START
============================================================ */

setupAudioUnlock();

initializeVoiceCenter();