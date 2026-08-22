// ============================================================
// NAIRA APP
// CHAT + API CONFIGURATION
// ============================================================
const API_BASE = "https://naira-tawny.vercel.app";
// ============================================================
// CONVERSATION STATE
// ============================================================
let currentConversationId = null;
// ============================================================
// DOM
// ============================================================
const input = document.getElementById("messageInput");
const sendButton = document.getElementById("sendButton");
const chat = document.getElementById("chat");
const micButton = document.getElementById("micButton");
// ============================================================
// ADD MESSAGE
// ============================================================
function addMessage(text, type) {
  const message = document.createElement("div");
  message.className =
    "message " + type;
  message.textContent = text;
  chat.appendChild(message);
  window.scrollTo({
    top: document.body.scrollHeight,
    behavior: "smooth"
  });
  return message;
}
// ============================================================
// TYPING INDICATOR
// ============================================================
function createTypingIndicator() {
  const loading =
    document.createElement("div");
  loading.className =
    "message naira-message typing-indicator";
  loading.innerHTML = `
    <span></span>
    <span></span>
    <span></span>
  `;
  chat.appendChild(loading);
  window.scrollTo({
    top: document.body.scrollHeight,
    behavior: "smooth"
  });
  return loading;
}
// ============================================================
// SEND MESSAGE
// ============================================================
async function sendMessage() {
  const text =
    input.value.trim();
  if (!text) return;
  addMessage(
    text,
    "user-message"
  );
  input.value = "";
  const loading =
    createTypingIndicator();
  try {
    // ========================================================
    // REQUEST BODY
    // ========================================================
    const requestBody = {
      message: text
    };
    // Hantar conversation ID jika conversation sedang aktif
    if (currentConversationId) {
      requestBody.conversationId =
        currentConversationId;
    }
    // ========================================================
    // API REQUEST
    // ========================================================
    const response =
      await fetch(
        API_BASE + "/api/chat",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json"
          },
          body:
            JSON.stringify(
              requestBody
            )
        }
      );
    const data =
      await response.json();
    loading.remove();
    // ========================================================
    // ERROR
    // ========================================================
    if (!response.ok) {
      addMessage(
        data.error ||
          "Maaf Tuan, Naira mengalami masalah.",
        "naira-message"
      );
      return;
    }
    // ========================================================
    // SAVE CONVERSATION ID
    // ========================================================
    if (
      data.conversationId
    ) {
      currentConversationId =
        data.conversationId;
      // Simpan supaya conversation
      // kekal selepas page refresh
      try {
        localStorage.setItem(
          "nairaConversationId",
          currentConversationId
        );
      } catch (storageError) {
        console.warn(
          "LOCAL STORAGE ERROR:",
          storageError
        );
      }
    }
    // ========================================================
    // ADD NAIRA RESPONSE
    // ========================================================
    addMessage(
      data.reply ||
        "Maaf Tuan, Naira tak dapat menghasilkan jawapan.",
      "naira-message"
    );
    // ========================================================
    // HISTORY REFRESH
    // ========================================================
    window.dispatchEvent(
      new CustomEvent(
        "naira:conversation-created",
        {
          detail: {
            conversationId:
              currentConversationId
          }
        }
      )
    );
  } catch (error) {
    console.error(
      "CHAT ERROR:",
      error
    );
    loading.remove();
    addMessage(
      "Maaf Tuan ❤️ Naira tak dapat menyambung ke server sekarang.",
      "naira-message"
    );
  }
}
// ============================================================
// LOAD SAVED CONVERSATION ID
// ============================================================
function loadConversationId() {
  try {
    const savedId =
      localStorage.getItem(
        "nairaConversationId"
      );
    if (savedId) {
      currentConversationId =
        savedId;
    }
  } catch (error) {
    console.warn(
      "LOAD CONVERSATION ID ERROR:",
      error
    );
  }
}
// ============================================================
// NEW CONVERSATION
// ============================================================
function newConversation() {
  currentConversationId =
    null;
  try {
    localStorage.removeItem(
      "nairaConversationId"
    );
  } catch (error) {
    console.warn(
      "CLEAR CONVERSATION ERROR:",
      error
    );
  }
  if (chat) {
    chat.innerHTML = "";
  }
  window.dispatchEvent(
    new CustomEvent(
      "naira:new-conversation"
    )
  );
}
// ============================================================
// OPEN EXISTING CONVERSATION
// ============================================================
function setConversationId(
  conversationId
) {
  if (!conversationId) {
    return;
  }
  currentConversationId =
    conversationId;
  try {
    localStorage.setItem(
      "nairaConversationId",
      currentConversationId
    );
  } catch (error) {
    console.warn(
      "SAVE CONVERSATION ERROR:",
      error
    );
  }
}
// ============================================================
// GET CURRENT CONVERSATION ID
// ============================================================
function getConversationId() {
  return currentConversationId;
}
// ============================================================
// EXPOSE APP FUNCTIONS
// ============================================================
window.nairaApp = {
  sendMessage,
  newConversation,
  setConversationId,
  getConversationId
};
// ============================================================
// SEND BUTTON
// ============================================================
if (sendButton) {
  sendButton.addEventListener(
    "click",
    sendMessage
  );
}
// ============================================================
// ENTER KEY
// ============================================================
if (input) {
  input.addEventListener(
    "keydown",
    function (event) {
      if (
        event.key === "Enter" &&
        !event.shiftKey
      ) {
        event.preventDefault();
        sendMessage();
      }
    }
  );
}
// ============================================================
// VOICE
// ============================================================
if (micButton) {
  micButton.addEventListener(
    "click",
    function () {
      if (
        !(
          "webkitSpeechRecognition"
          in window
        ) &&
        !(
          "SpeechRecognition"
          in window
        )
      ) {
        addMessage(
          "Voice recognition belum disokong oleh browser ini.",
          "naira-message"
        );
        return;
      }
      const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;
      const recognition =
        new SpeechRecognition();
      recognition.lang =
        "ms-MY";
      recognition.interimResults =
        false;
      recognition.continuous =
        false;
      try {
        recognition.start();
        micButton.textContent =
          "🔴";
      } catch (error) {
        console.error(
          "VOICE START ERROR:",
          error
        );
        micButton.textContent =
          "🎙️";
      }
      recognition.onresult =
        function (event) {
          const transcript =
            event.results[0][0]
              .transcript;
          if (input) {
            input.value =
              transcript;
            input.focus();
          }
          micButton.textContent =
            "🎙️";
        };
      recognition.onerror =
        function (event) {
          console.error(
            "VOICE ERROR:",
            event
          );
          micButton.textContent =
            "🎙️";
        };
      recognition.onend =
        function () {
          micButton.textContent =
            "🎙️";
        };
    }
  );
}
// ============================================================
// INITIALIZE
// ============================================================
loadConversationId();