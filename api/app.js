// ============================================================
// NAIRA APP
// CHAT + API CONFIGURATION
// ============================================================
const API_BASE = "https://naira-tawny.vercel.app";
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
  message.className = "message " + type;
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
  const loading = document.createElement("div");
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
  const text = input.value.trim();
  if (!text) return;
  addMessage(text, "user-message");
  input.value = "";
  const loading = createTypingIndicator();
  try {
    const response = await fetch(
      API_BASE + "/api/chat",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: text
        })
      }
    );
    const data = await response.json();
    loading.remove();
    if (!response.ok) {
      addMessage(
        data.error ||
          "Maaf Tuan, Naira mengalami masalah.",
        "naira-message"
      );
      return;
    }
    addMessage(
      data.reply ||
        "Maaf Tuan, Naira tak dapat menghasilkan jawapan.",
      "naira-message"
    );
    // Beritahu History Center supaya refresh
    window.dispatchEvent(
      new CustomEvent("naira:conversation-created")
    );
  } catch (error) {
    console.error("CHAT ERROR:", error);
    loading.remove();
    addMessage(
      "Maaf Tuan ❤️ Naira tak dapat menyambung ke server sekarang.",
      "naira-message"
    );
  }
}
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
      if (event.key === "Enter") {
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
        !("webkitSpeechRecognition" in window) &&
        !("SpeechRecognition" in window)
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
      recognition.lang = "ms-MY";
      recognition.interimResults = false;
      recognition.continuous = false;
      recognition.start();
      micButton.textContent = "🔴";
      recognition.onresult = function (event) {
        input.value =
          event.results[0][0].transcript;
        micButton.textContent = "🎙️";
      };
      recognition.onerror = function () {
        micButton.textContent = "🎙️";
      };
      recognition.onend = function () {
        micButton.textContent = "🎙️";
      };
    }
  );
}