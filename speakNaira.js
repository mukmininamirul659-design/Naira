/* ============================================================
   NAIRA VOICE ENGINE
   ElevenLabs + Custom Voice Upload
   iPhone / Safari Compatible

   File:
   /speakNaira.js
============================================================ */

"use strict";


/* ============================================================
   CONFIG
============================================================ */

const ELEVENLABS_MODEL =
  "eleven_multilingual_v2";

const VOICE_API_BASE =
  "https://naira-tawny.vercel.app";

const VOICE_LIST_ENDPOINT =
  VOICE_API_BASE + "/api/voice";

const VOICE_SPEAK_ENDPOINT =
  VOICE_API_BASE + "/api/speak";

const VOICE_CLONE_ENDPOINT =
  VOICE_API_BASE + "/api/voice-clone";

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
    ) || 1,

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
  }

];


/* ============================================================
   GLOBAL STATE
============================================================ */

window.elevenLabsVoices =
  Array.isArray(
    window.elevenLabsVoices
  )
    ? window.elevenLabsVoices
    : [];

window.nairaSpeaking =
  false;

window.nairaAudio =
  window.nairaAudio instanceof Audio
    ? window.nairaAudio
    : new Audio();

window.nairaAudio.preload =
  "auto";

window.nairaAudio.playsInline =
  true;

window.nairaAudioUnlocked =
  false;

window.nairaVoiceUploading =
  false;

let currentAudioUrl =
  null;


/* ============================================================
   CHARACTER → VOICE MAP
============================================================ */

const characterVoiceMap =
  {};


/* ============================================================
   MAIN VOICE CENTER DOM
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
   CUSTOM VOICE UPLOAD DOM
   Elemen ini akan kita tambah ke index.html selepas ini.

   Script ini SELAMAT walaupun elemen belum wujud.
============================================================ */

const customVoiceName =
  document.getElementById(
    "customVoiceName"
  );

const customVoiceDescription =
  document.getElementById(
    "customVoiceDescription"
  );

const customVoiceFiles =
  document.getElementById(
    "customVoiceFiles"
  );

const customVoiceUploadButton =
  document.getElementById(
    "customVoiceUploadButton"
  );

const customVoiceUploadStatus =
  document.getElementById(
    "customVoiceUploadStatus"
  );

const customVoiceFileInfo =
  document.getElementById(
    "customVoiceFileInfo"
  );


/* ============================================================
   STATUS HELPERS
============================================================ */

function setVoiceCenterStatus(
  message
) {

  if (
    voiceCenterStatus
  ) {

    voiceCenterStatus.textContent =
      message || "";

  }

}


function setMainVoiceStatus(
  message
) {

  const element =
    document.getElementById(
      "voiceStatus"
    );


  if (element) {

    element.textContent =
      message || "";

  }

}


function setUploadStatus(
  message
) {

  if (
    customVoiceUploadStatus
  ) {

    customVoiceUploadStatus.textContent =
      message || "";

  }


  /*
   * Kalau UI upload belum ada,
   * status masih boleh dilihat
   * dalam Voice Center utama.
   */

  if (
    !customVoiceUploadStatus
  ) {

    setVoiceCenterStatus(
      message
    );

  }

}


/* ============================================================
   UPDATE MAIN VOICE UI
============================================================ */

function updateMainVoiceUI() {

  try {

    if (
      typeof window.updateVoiceUI ===
      "function"
    ) {

      window.updateVoiceUI();

      return;

    }

  } catch (error) {}


  try {

    if (
      typeof updateVoiceUI ===
      "function"
    ) {

      updateVoiceUI();

    }

  } catch (error) {}

}


/* ============================================================
   IPHONE / SAFARI AUDIO PREPARE
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


    audio.playsInline =
      true;


    audio.preload =
      "auto";


    /*
     * Kita tidak cuba main silent MP3
     * kerana sesetengah Safari akan
     * anggap data URI itu media invalid.
     *
     * Audio sebenar masih dimainkan melalui
     * user interaction / speaker button.
     */


    window.nairaAudioUnlocked =
      true;


    console.log(
      "🔓 Naira audio prepared"
    );


    return true;


  } catch (error) {

    console.warn(
      "NAIRA AUDIO PREPARE ERROR:",
      error
    );


    return false;

  }

}


/* ============================================================
   CHARACTER VOICE STORAGE
============================================================ */

function getSavedCharacterVoice(
  characterId
) {

  if (!characterId) {
    return "";
  }


  return (
    localStorage.getItem(
      VOICE_STORAGE_PREFIX +
      characterId
    ) || ""
  );

}


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
   * Restore mapping yang pernah disimpan.
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
   * Assign voice kepada character
   * yang belum ada mapping.
   */

  let index =
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
        voices[
          index %
          voices.length
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


      index++;

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
   GET VOICE BY ID
============================================================ */

function getVoiceById(
  voiceId
) {

  return (
    (
      window.elevenLabsVoices ||
      []
    ).find(
      function(voice) {

        return (
          voice.voice_id ===
          voiceId
        );

      }
    ) ||
    null
  );

}


/* ============================================================
   GET CURRENT VOICE ID
============================================================ */

function getCurrentVoiceId() {

  /*
   * Voice yang user pilih secara manual
   * diberikan priority.
   */

  if (
    voiceSettings.voiceId
  ) {

    const exists =
      getVoiceById(
        voiceSettings.voiceId
      );


    if (exists) {

      return (
        voiceSettings.voiceId
      );

    }

  }


  /*
   * Character mapping.
   */

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


  /*
   * Last fallback.
   */

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
    getVoiceById(
      voiceId
    );


  return (
    voice
      ? voice.name
      : voiceId
  );

}


/* ============================================================
   SET ACTIVE VOICE
============================================================ */

function setActiveElevenLabsVoice(
  voiceId,
  options = {}
) {

  if (!voiceId) {
    return false;
  }


  const voice =
    getVoiceById(
      voiceId
    );


  /*
   * Voice mungkin baru dicipta tetapi
   * list belum refresh lagi.
   * Jadi voiceId tetap dibenarkan.
   */

  voiceSettings.voiceId =
    voiceId;


  voiceSettings.voiceName =
    voice
      ? voice.name
      : (
          options.name ||
          voiceSettings.voiceName ||
          "Custom Voice"
        );


  localStorage.setItem(
    "naira_eleven_voice_id",
    voiceId
  );


  localStorage.setItem(
    "naira_voice_name",
    voiceSettings.voiceName
  );


  /*
   * Voice ini juga jadi voice untuk
   * character yang sedang aktif.
   */

  characterVoiceMap[
    voiceSettings.character
  ] =
    voiceId;


  saveCharacterVoice(
    voiceSettings.character,
    voiceId
  );


  if (
    voiceSelect
  ) {

    voiceSelect.value =
      voiceId;

  }


  return true;

}


/* ============================================================
   LOAD ELEVENLABS VOICES
============================================================ */

async function loadElevenLabsVoices(
  options = {}
) {

  const silent =
    Boolean(
      options.silent
    );


  try {

    if (!silent) {

      setVoiceCenterStatus(
        "⏳ Loading ElevenLabs voices..."
      );

    }


    const response =
      await fetch(
        VOICE_LIST_ENDPOINT,
        {

          method:
            "GET",

          cache:
            "no-store",

          headers: {
            "Accept":
              "application/json"
          }

        }
      );


    const raw =
      await response.text();


    let data =
      {};


    try {

      data =
        raw
          ? JSON.parse(raw)
          : {};

    } catch (error) {

      throw new Error(
        "Voice API memberi response yang tidak sah."
      );

    }


    if (
      !response.ok
    ) {

      throw new Error(
        data.error ||
        data.message ||
        (
          "Voice API gagal (" +
          response.status +
          ")"
        )
      );

    }


    const voices =
      Array.isArray(data)
        ? data
        : data.voices;


    if (
      !Array.isArray(voices)
    ) {

      throw new Error(
        "Response Voice API tidak mempunyai senarai voices."
      );

    }


    window.elevenLabsVoices =
      voices;


    buildCharacterVoiceMap(
      voices
    );


    /*
     * Restore current selected voice.
     */

    const savedVoiceId =
      localStorage.getItem(
        "naira_eleven_voice_id"
      );


    if (
      savedVoiceId &&
      getVoiceById(
        savedVoiceId
      )
    ) {

      voiceSettings.voiceId =
        savedVoiceId;


      voiceSettings.voiceName =
        getVoiceName(
          savedVoiceId
        );

    }


    /*
     * Kalau langsung belum pernah pilih,
     * guna first voice.
     */

    if (
      !voiceSettings.voiceId &&
      voices[0]
    ) {

      setActiveElevenLabsVoice(
        voices[0].voice_id,
        {
          name:
            voices[0].name
        }
      );

    }


    console.log(
      "✅ ElevenLabs voices loaded:",
      voices
    );


    if (!silent) {

      setVoiceCenterStatus(
        voices.length
          ? (
              "✅ " +
              voices.length +
              " ElevenLabs voice tersedia."
            )
          : "⚠️ Tiada ElevenLabs voice dijumpai."
      );

    }


    return voices;


  } catch (error) {

    console.error(
      "ELEVENLABS VOICES ERROR:",
      error
    );


    if (!silent) {

      setVoiceCenterStatus(
        "❌ " +
        (
          error.message ||
          "Voice list gagal dimuat."
        )
      );

    }


    return [];

  }

}


/* ============================================================
   REFRESH VOICES
============================================================ */

async function refreshElevenLabsVoices(
  preferredVoiceId = null
) {

  const voices =
    await loadElevenLabsVoices({
      silent: true
    });


  buildCharacterVoiceMap(
    voices
  );


  if (
    preferredVoiceId
  ) {

    const found =
      voices.find(
        function(voice) {

          return (
            voice.voice_id ===
            preferredVoiceId
          );

        }
      );


    if (found) {

      setActiveElevenLabsVoice(
        found.voice_id,
        {
          name:
            found.name
        }
      );

    }

  }


  renderVoiceSelect();

  renderCharacters();


  return voices;

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


            const mappedVoiceId =
              characterVoiceMap[
                character.id
              ];


            if (
              mappedVoiceId
            ) {

              setActiveElevenLabsVoice(
                mappedVoiceId
              );

            }


            applyCharacterSettings();

            renderCharacters();

            renderVoiceSelect();


            setVoiceCenterStatus(
              mappedVoiceId
                ? (
                    character.label +
                    " • " +
                    getVoiceName(
                      mappedVoiceId
                    )
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


  const currentVoiceId =
    getCurrentVoiceId();


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
          currentVoiceId
        ) {

          option.selected =
            true;

        }


        voiceSelect.appendChild(
          option
        );

      }
    );


  if (
    currentVoiceId
  ) {

    voiceSelect.value =
      currentVoiceId;

  }

}


/* ============================================================
   VOICE SELECT EVENT
============================================================ */

if (
  voiceSelect
) {

  voiceSelect.addEventListener(
    "change",
    function() {

      const voiceId =
        voiceSelect.value;


      if (!voiceId) {
        return;
      }


      setActiveElevenLabsVoice(
        voiceId
      );


      setVoiceCenterStatus(
        "🎙️ Voice aktif: " +
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
        1;

      break;

  }


  persistVoiceSettings();

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


  persistVoiceSettings();

  syncVoiceControls();

}


/* ============================================================
   SAVE ALL SETTINGS
============================================================ */

function persistVoiceSettings() {

  localStorage.setItem(
    "naira_voice_name",
    voiceSettings.voiceName || ""
  );


  localStorage.setItem(
    "naira_eleven_voice_id",
    voiceSettings.voiceId || ""
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

}


/* ============================================================
   SYNC CONTROLS
============================================================ */

function syncVoiceControls() {

  if (
    rateControl
  ) {

    rateControl.value =
      voiceSettings.rate;

  }


  if (
    pitchControl
  ) {

    pitchControl.value =
      voiceSettings.pitch;

  }


  if (
    volumeControl
  ) {

    volumeControl.value =
      voiceSettings.volume;

  }


  if (
    rateValue
  ) {

    rateValue.textContent =
      Number(
        voiceSettings.rate
      ).toFixed(2);

  }


  if (
    pitchValue
  ) {

    pitchValue.textContent =
      Number(
        voiceSettings.pitch
      ).toFixed(2);

  }


  if (
    volumeValue
  ) {

    volumeValue.textContent =
      Number(
        voiceSettings.volume
      ).toFixed(2);

  }

}


/* ============================================================
   RANGE CONTROLS
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


      persistVoiceSettings();


      if (
        rateValue
      ) {

        rateValue.textContent =
          voiceSettings.rate
            .toFixed(2);

      }


      /*
       * Tukar playback speed
       * audio yang sedang dimainkan.
       */

      if (
        window.nairaAudio
      ) {

        window.nairaAudio.playbackRate =
          Math.max(
            0.5,
            Math.min(
              2,
              voiceSettings.rate
            )
          );

      }

    }
  );

}


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


      persistVoiceSettings();


      if (
        pitchValue
      ) {

        pitchValue.textContent =
          voiceSettings.pitch
            .toFixed(2);

      }

    }
  );

}


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


      persistVoiceSettings();


      if (
        volumeValue
      ) {

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
   OPEN VOICE CENTER
============================================================ */

if (
  voiceCenterButton
) {

  voiceCenterButton.addEventListener(
    "click",
    async function() {

      /*
       * Direct interaction membantu Safari.
       */

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


      if (
        !window.elevenLabsVoices.length
      ) {

        await loadElevenLabsVoices();

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
   SAVE VOICE SETTINGS BUTTON
============================================================ */

if (
  saveVoiceSettings
) {

  saveVoiceSettings.addEventListener(
    "click",
    function() {

      /*
       * Pastikan selected dropdown
       * menjadi voice aktif.
       */

      if (
        voiceSelect &&
        voiceSelect.value
      ) {

        setActiveElevenLabsVoice(
          voiceSelect.value
        );

      }


      persistVoiceSettings();


      setVoiceCenterStatus(
        "✅ Voice settings disimpan."
      );


      setTimeout(
        function() {

          setVoiceCenterStatus(
            ""
          );

        },
        1800
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


  if (
    audio
  ) {

    try {

      audio.pause();

      audio.currentTime =
        0;

    } catch (error) {}

  }


  if (
    currentAudioUrl
  ) {

    try {

      URL.revokeObjectURL(
        currentAudioUrl
      );

    } catch (error) {}


    currentAudioUrl =
      null;

  }


  window.nairaSpeaking =
    false;


  try {

    speaking =
      false;

  } catch (error) {}


  setMainVoiceStatus(
    ""
  );


  updateMainVoiceUI();

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
    String(text)
      .trim();


  const audio =
    window.nairaAudio;


  /*
   * Stop audio lama.
   */

  stopNairaSpeech();


  /*
   * Load voice list jika perlu.
   */

  if (
    !window.elevenLabsVoices.length
  ) {

    setMainVoiceStatus(
      "⏳ Loading voice..."
    );


    await loadElevenLabsVoices({
      silent: true
    });

  }


  const activeVoiceId =
    voiceId ||
    getCurrentVoiceId();


  if (
    !activeVoiceId
  ) {

    setMainVoiceStatus(
      "❌ Tiada ElevenLabs voice tersedia."
    );


    setVoiceCenterStatus(
      "❌ Tiada ElevenLabs voice tersedia."
    );


    console.error(
      "NAIRA: Voice ID tidak tersedia."
    );


    return false;

  }


  const activeVoiceName =
    getVoiceName(
      activeVoiceId
    );


  window.nairaSpeaking =
    true;


  try {

    speaking =
      true;

  } catch (error) {}


  updateMainVoiceUI();


  setMainVoiceStatus(
    "🎙️ Naira sedang menyediakan suara..."
  );


  console.log(
    "🎙️ NAIRA SPEAK:",
    activeVoiceName,
    activeVoiceId
  );


  try {

    const response =
      await fetch(
        VOICE_SPEAK_ENDPOINT,
        {

          method:
            "POST",

          headers: {

            "Content-Type":
              "application/json",

            "Accept":
              "audio/mpeg"

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
     * API error.
     */

    if (
      !response.ok
    ) {

      const raw =
        await response.text();


      let message =
        raw;


      try {

        const parsed =
          JSON.parse(raw);


        message =
          parsed.error ||
          parsed.message ||
          raw;

      } catch (error) {}


      throw new Error(
        message ||
        (
          "Voice API gagal (" +
          response.status +
          ")"
        )
      );

    }


    /*
     * Jangan cuba main JSON sebagai audio.
     */

    const contentType =
      response.headers.get(
        "content-type"
      ) || "";


    if (
      contentType.includes(
        "application/json"
      )
    ) {

      const data =
        await response.json();


      throw new Error(
        data.error ||
        data.message ||
        "Speak API tidak memulangkan audio."
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


    /*
     * Cleanup previous URL.
     */

    if (
      currentAudioUrl
    ) {

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
     * Prepare reusable audio.
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


    /* ========================================================
       EVENTS
    ======================================================== */

    audio.onplay =
      function() {

        window.nairaSpeaking =
          true;


        try {

          speaking =
            true;

        } catch (error) {}


        setMainVoiceStatus(
          "🔊 Naira sedang bercakap..."
        );


        setVoiceCenterStatus(
          "🔊 " +
          activeVoiceName
        );


        updateMainVoiceUI();

      };


    audio.onended =
      function() {

        window.nairaSpeaking =
          false;


        try {

          speaking =
            false;

        } catch (error) {}


        setMainVoiceStatus(
          ""
        );


        updateMainVoiceUI();


        /*
         * Jangan revoke terlalu awal
         * jika browser masih cleanup media.
         */

        const finishedUrl =
          currentAudioUrl;


        currentAudioUrl =
          null;


        setTimeout(
          function() {

            if (
              finishedUrl
            ) {

              try {

                URL.revokeObjectURL(
                  finishedUrl
                );

              } catch (error) {}

            }

          },
          500
        );

      };


    audio.onerror =
      function(event) {

        console.error(
          "NAIRA AUDIO ERROR:",
          event
        );


        window.nairaSpeaking =
          false;


        try {

          speaking =
            false;

        } catch (error) {}


        setMainVoiceStatus(
          "❌ Audio gagal dimainkan."
        );


        updateMainVoiceUI();

      };


    /*
     * Explicit load.
     */

    audio.load();


    /*
     * PLAY
     */

    try {

      await audio.play();


      return true;


    } catch (playError) {

      console.warn(
        "AUDIO AUTOPLAY BLOCKED:",
        playError
      );


      window.nairaSpeaking =
        false;


      try {

        speaking =
          false;

      } catch (error) {}


      updateMainVoiceUI();


      /*
       * Audio masih loaded.
       * User boleh tekan speaker semula.
       */

      setMainVoiceStatus(
        "🔊 Tekan speaker sekali lagi untuk dengar."
      );


      return false;

    }


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

    } catch (e) {}


    updateMainVoiceUI();


    const message =
      error.message ||
      "Voice gagal dimainkan.";


    setMainVoiceStatus(
      "❌ " +
      message
    );


    setVoiceCenterStatus(
      "❌ " +
      message
    );


    return false;

  }

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
          ? voicePreviewText.value
              .trim()
          : "";


      if (!text) {

        setVoiceCenterStatus(
          "⚠️ Masukkan teks dahulu."
        );

        return;

      }


      if (
        voiceSelect &&
        voiceSelect.value
      ) {

        setActiveElevenLabsVoice(
          voiceSelect.value
        );

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
   CUSTOM VOICE FILE VALIDATION
============================================================ */

function validateCustomVoiceFiles(
  files
) {

  const fileList =
    Array.from(
      files || []
    );


  if (
    !fileList.length
  ) {

    return {
      valid: false,
      message:
        "Pilih sekurang-kurangnya satu fail audio."
    };

  }


  if (
    fileList.length > 5
  ) {

    return {
      valid: false,
      message:
        "Maksimum 5 fail audio."
    };

  }


  /*
   * Backend clone sekarang dibuat
   * untuk AUDIO.
   *
   * Video akan kita tambah selepas
   * audio upload stabil.
   */

  const allowedExtensions =
    [
      "mp3",
      "wav",
      "m4a",
      "aac",
      "ogg",
      "webm"
    ];


  const maxSize =
    25 * 1024 * 1024;


  for (
    const file of fileList
  ) {

    const extension =
      String(
        file.name || ""
      )
        .split(".")
        .pop()
        .toLowerCase();


    if (
      !allowedExtensions.includes(
        extension
      )
    ) {

      return {
        valid: false,
        message:
          "Format tidak disokong: " +
          file.name
      };

    }


    if (
      file.size >
      maxSize
    ) {

      return {
        valid: false,
        message:
          "Fail terlalu besar: " +
          file.name
      };

    }

  }


  return {
    valid: true,
    files:
      fileList
  };

}


/* ============================================================
   SHOW SELECTED CUSTOM FILES
============================================================ */

function updateCustomVoiceFileInfo() {

  if (
    !customVoiceFiles ||
    !customVoiceFileInfo
  ) {

    return;

  }


  const files =
    Array.from(
      customVoiceFiles.files ||
      []
    );


  if (
    !files.length
  ) {

    customVoiceFileInfo.textContent =
      "Belum ada audio dipilih.";

    return;

  }


  const totalSize =
    files.reduce(
      function(total, file) {

        return (
          total +
          Number(
            file.size || 0
          )
        );

      },
      0
    );


  const megabytes =
    totalSize /
    1024 /
    1024;


  customVoiceFileInfo.textContent =
    files.length +
    " file • " +
    megabytes.toFixed(1) +
    " MB";

}


/* ============================================================
   UPLOAD / CLONE CUSTOM VOICE
============================================================ */

async function uploadCustomVoice(
  options = {}
) {

  /*
   * Function boleh dipanggil terus:
   *
   * window.uploadCustomVoice({
   *   name: "...",
   *   description: "...",
   *   files: [...]
   * })
   *
   * atau melalui UI index.html.
   */


  if (
    window.nairaVoiceUploading
  ) {

    return {
      success: false,
      error:
        "Upload sedang berjalan."
    };

  }


  const name =
    String(
      options.name ??
      (
        customVoiceName
          ? customVoiceName.value
          : ""
      )
    )
      .trim();


  const description =
    String(
      options.description ??
      (
        customVoiceDescription
          ? customVoiceDescription.value
          : ""
      )
    )
      .trim();


  const files =
    options.files ||
    (
      customVoiceFiles
        ? customVoiceFiles.files
        : []
    );


  if (!name) {

    setUploadStatus(
      "⚠️ Masukkan nama voice."
    );


    return {
      success: false,
      error:
        "Nama voice diperlukan."
    };

  }


  const validation =
    validateCustomVoiceFiles(
      files
    );


  if (
    !validation.valid
  ) {

    setUploadStatus(
      "⚠️ " +
      validation.message
    );


    return {
      success: false,
      error:
        validation.message
    };

  }


  const formData =
    new FormData();


  formData.append(
    "name",
    name
  );


  if (
    description
  ) {

    formData.append(
      "description",
      description
    );

  }


  validation.files.forEach(
    function(file) {

      formData.append(
        "files[]",
        file,
        file.name
      );

    }
  );


  window.nairaVoiceUploading =
    true;


  if (
    customVoiceUploadButton
  ) {

    customVoiceUploadButton.disabled =
      true;


    customVoiceUploadButton.textContent =
      "⏳ Creating Voice...";

  }


  setUploadStatus(
    "⏳ Uploading audio & creating voice..."
  );


  try {

    const response =
      await fetch(
        VOICE_CLONE_ENDPOINT,
        {

          method:
            "POST",

          body:
            formData

        }
      );


    const raw =
      await response.text();


    let data =
      {};


    try {

      data =
        raw
          ? JSON.parse(raw)
          : {};

    } catch (error) {

      data = {
        raw:
          raw
      };

    }


    if (
      !response.ok
    ) {

      let detail =
        data.error ||
        data.message ||
        "Voice clone gagal.";


      if (
        data.details &&
        typeof data.details ===
        "string"
      ) {

        detail +=
          " " +
          data.details;

      }


      throw new Error(
        detail
      );

    }


    const newVoiceId =
      data.voice_id ||
      data.voice?.voice_id ||
      "";


    if (
      !newVoiceId
    ) {

      throw new Error(
        "Voice berjaya diproses tetapi voice_id tidak diterima."
      );

    }


    setUploadStatus(
      "✅ Voice dibuat. Refreshing Voice Center..."
    );


    /*
     * Refresh dari ElevenLabs.
     */

    const voices =
      await refreshElevenLabsVoices(
        newVoiceId
      );


    /*
     * Kalau voice belum terus muncul
     * dalam GET response, voiceId masih
     * disimpan sebagai voice aktif.
     */

    const newVoice =
      voices.find(
        function(voice) {

          return (
            voice.voice_id ===
            newVoiceId
          );

        }
      );


    setActiveElevenLabsVoice(
      newVoiceId,
      {
        name:
          newVoice
            ? newVoice.name
            : (
                data.name ||
                data.voice?.name ||
                name
              )
      }
    );


    renderVoiceSelect();


    if (
      voiceSelect
    ) {

      voiceSelect.value =
        newVoiceId;

    }


    persistVoiceSettings();


    /*
     * Reset form.
     */

    if (
      customVoiceName
    ) {

      customVoiceName.value =
        "";

    }


    if (
      customVoiceDescription
    ) {

      customVoiceDescription.value =
        "";

    }


    if (
      customVoiceFiles
    ) {

      customVoiceFiles.value =
        "";

    }


    if (
      customVoiceFileInfo
    ) {

      customVoiceFileInfo.textContent =
        "Belum ada audio dipilih.";

    }


    setUploadStatus(
      "✅ Custom voice \"" +
      (
        newVoice
          ? newVoice.name
          : name
      ) +
      "\" sekarang aktif."
    );


    setVoiceCenterStatus(
      "✅ Voice aktif: " +
      (
        newVoice
          ? newVoice.name
          : name
      )
    );


    console.log(
      "✅ CUSTOM VOICE CREATED:",
      newVoiceId
    );


    return {
      success: true,
      voiceId:
        newVoiceId,
      data:
        data
    };


  } catch (error) {

    console.error(
      "CUSTOM VOICE UPLOAD ERROR:",
      error
    );


    setUploadStatus(
      "❌ " +
      (
        error.message ||
        "Custom voice gagal dibuat."
      )
    );


    return {
      success: false,
      error:
        error.message ||
        "Custom voice gagal dibuat."
    };


  } finally {

    window.nairaVoiceUploading =
      false;


    if (
      customVoiceUploadButton
    ) {

      customVoiceUploadButton.disabled =
        false;


      customVoiceUploadButton.textContent =
        "✨ Create Voice";

    }

  }

}


/* ============================================================
   CUSTOM VOICE UI EVENTS
============================================================ */

if (
  customVoiceFiles
) {

  customVoiceFiles.addEventListener(
    "change",
    function() {

      updateCustomVoiceFileInfo();


      const validation =
        validateCustomVoiceFiles(
          customVoiceFiles.files
        );


      if (
        !validation.valid
      ) {

        setUploadStatus(
          "⚠️ " +
          validation.message
        );

        return;

      }


      setUploadStatus(
        "✅ Audio ready."
      );

    }
  );

}


if (
  customVoiceUploadButton
) {

  customVoiceUploadButton.addEventListener(
    "click",
    async function() {

      await uploadCustomVoice();

    }
  );

}


/* ============================================================
   INITIALIZE VOICE CENTER
============================================================ */

async function initializeVoiceCenter() {

  renderCharacters();

  renderEmotions();

  syncVoiceControls();


  try {

    const voices =
      await loadElevenLabsVoices({
        silent: true
      });


    if (
      voices.length
    ) {

      buildCharacterVoiceMap(
        voices
      );


      renderCharacters();

      renderEmotions();

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
      once:
        true,

      passive:
        true
    }
  );


  document.addEventListener(
    "click",
    unlock,
    {
      once:
        true
    }
  );

}


/* ============================================================
   GLOBAL API
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

window.refreshElevenLabsVoices =
  refreshElevenLabsVoices;

window.getCurrentVoiceId =
  getCurrentVoiceId;

window.getVoiceName =
  getVoiceName;

window.setActiveElevenLabsVoice =
  setActiveElevenLabsVoice;

window.uploadCustomVoice =
  uploadCustomVoice;

window.validateCustomVoiceFiles =
  validateCustomVoiceFiles;


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
  "=========================================="
);

console.log(
  "✅ NAIRA ELEVENLABS ENGINE LOADED"
);

console.log(
  "Voice List:",
  VOICE_LIST_ENDPOINT
);

console.log(
  "TTS:",
  VOICE_SPEAK_ENDPOINT
);

console.log(
  "Voice Clone:",
  VOICE_CLONE_ENDPOINT
);

console.log(
  "Custom Upload UI:",
  Boolean(
    customVoiceUploadButton
  )
);

console.log(
  "=========================================="
);