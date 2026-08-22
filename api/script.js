// ============================================================
// NAIRA HISTORY CONVERSATION
// ============================================================

const HISTORY_API =
  "https://naira-tawny.vercel.app";

// ============================================================
// DOM
// ============================================================

const historyButton =
  document.getElementById("historyButton");

const historyPanel =
  document.getElementById("historyPanel");

const closeHistory =
  document.getElementById("closeHistory");

const historyList =
  document.getElementById("historyList");

const historySearch =
  document.getElementById("historySearch");

const historyCategory =
  document.getElementById("historyCategory");

const refreshHistory =
  document.getElementById("refreshHistory");

const newConversationButton =
  document.getElementById("newConversation");

const historyStatus =
  document.getElementById("historyStatus");

// ============================================================
// STATE
// ============================================================

let allConversations = [];

// ============================================================
// OPEN HISTORY
// ============================================================

if (historyButton) {
  historyButton.addEventListener(
    "click",
    function () {
      historyPanel.classList.add("active");
      loadHistory();
    }
  );
}

// ============================================================
// CLOSE HISTORY
// ============================================================

if (closeHistory) {
  closeHistory.addEventListener(
    "click",
    function () {
      historyPanel.classList.remove("active");
    }
  );
}

// ============================================================
// REFRESH
// ============================================================

if (refreshHistory) {
  refreshHistory.addEventListener(
    "click",
    loadHistory
  );
}

// ============================================================
// SEARCH
// ============================================================

if (historySearch) {
  historySearch.addEventListener(
    "input",
    function () {
      renderHistory(filterHistory());
    }
  );
}

// ============================================================
// CATEGORY
// ============================================================

if (historyCategory) {
  historyCategory.addEventListener(
    "change",
    function () {
      renderHistory(filterHistory());
    }
  );
}

// ============================================================
// NEW CONVERSATION
// ============================================================

if (newConversationButton) {
  newConversationButton.addEventListener(
    "click",
    function () {
      historyPanel.classList.remove("active");

      const chat =
        document.getElementById("chat");

      if (chat) {
        chat.innerHTML = `
          <div class="message naira-message">
            Hai Tuan ❤️ Saya Naira. Apa yang Tuan nak buat hari ini?
          </div>
        `;
      }

      const input =
        document.getElementById("messageInput");

      if (input) {
        input.focus();
      }
    }
  );
}

// ============================================================
// AUTO REFRESH
// ============================================================

window.addEventListener(
  "naira:conversation-created",
  function () {
    if (
      historyPanel &&
      historyPanel.classList.contains("active")
    ) {
      loadHistory();
    }
  }
);

// ============================================================
// LOAD HISTORY
// ============================================================

async function loadHistory() {

  if (!historyStatus) return;

  historyStatus.textContent =
    "Memuatkan conversation history...";

  if (historyList) {
    historyList.innerHTML = "";
  }

  try {

    const response =
      await fetch(
        HISTORY_API +
        "/api/conversations"
      );

    const data =
      await response.json();

    if (!response.ok) {
      throw new Error(
        data.error ||
        "History gagal dimuatkan."
      );
    }

    allConversations =
      data.conversations || [];

    historyStatus.textContent =
      `${allConversations.length} conversation`;

    renderHistory(
      filterHistory()
    );

  } catch (error) {

    console.error(
      "HISTORY ERROR:",
      error
    );

    historyStatus.textContent =
      "Gagal memuatkan history.";

    if (historyList) {

      historyList.innerHTML = `
        <div class="history-empty">
          ❌ ${escapeHistoryHTML(
            error.message
          )}
        </div>
      `;

    }

  }
}

// ============================================================
// FILTER
// ============================================================

function filterHistory() {

  const search =
    historySearch
      ? historySearch.value
          .trim()
          .toLowerCase()
      : "";

  const category =
    historyCategory
      ? historyCategory.value
      : "all";

  return allConversations.filter(
    function (conversation) {

      const searchable =
        (
          String(
            conversation.title || ""
          ) +
          " " +
          String(
            conversation.user_message || ""
          ) +
          " " +
          String(
            conversation.naira_response || ""
          ) +
          " " +
          String(
            conversation.category || ""
          ) +
          " " +
          String(
            conversation.subcategory || ""
          )
        ).toLowerCase();

      const matchesSearch =
        !search ||
        searchable.includes(search);

      const matchesCategory =
        category === "all" ||
        conversation.category === category;

      return (
        matchesSearch &&
        matchesCategory
      );
    }
  );
}

// ============================================================
// RENDER HISTORY
// ============================================================

function renderHistory(
  conversations
) {

  if (!historyList) return;

  historyList.innerHTML = "";

  if (!conversations.length) {

    historyList.innerHTML = `
      <div class="history-empty">
        🗂️ Tiada conversation dijumpai.
      </div>
    `;

    return;
  }

  const groups = {};

  conversations.forEach(
    function (conversation) {

      const date =
        new Date(
          conversation.created_at
        );

      const dateKey =
        date.toLocaleDateString(
          "en-CA",
          {
            timeZone:
              "Asia/Singapore"
          }
        );

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }

      groups[dateKey].push(
        conversation
      );

    }
  );

  Object.keys(groups)
    .sort()
    .reverse()
    .forEach(
      function (dateKey) {

        const section =
          document.createElement(
            "section"
          );

        section.className =
          "history-date-group";

        const dateTitle =
          document.createElement(
            "div"
          );

        dateTitle.className =
          "history-date-title";

        dateTitle.innerHTML = `
          <span>
            ${formatHistoryDate(
              dateKey
            )}
          </span>

          <span class="history-date-count">
            ${groups[dateKey].length}
          </span>
        `;

        section.appendChild(
          dateTitle
        );

        groups[dateKey].forEach(
          function (conversation) {

            section.appendChild(
              createHistoryCard(
                conversation
              )
            );

          }
        );

        historyList.appendChild(
          section
        );

      }
    );
}

// ============================================================
// CREATE HISTORY CARD
// ============================================================

function createHistoryCard(
  conversation
) {

  const card =
    document.createElement(
      "article"
    );

  card.className =
    "history-card";

  const date =
    new Date(
      conversation.created_at
    );

  const title =
    conversation.title ||
    conversation.user_message ||
    "Conversation Naira";

  const message =
    conversation.user_message ||
    "";

  const category =
    conversation.category ||
    "general";

  const time =
    formatHistoryTime(date);

  const day =
    formatHistoryDay(date);

  card.innerHTML = `

    <div class="history-card-top">

      <div class="history-icon">
        💬
      </div>

      <div class="history-main">

        <div class="history-title">
          ${escapeHistoryHTML(title)}
        </div>

        <div class="history-preview">
          ${escapeHistoryHTML(message)}
        </div>

      </div>

    </div>

    <div class="history-meta">

      <span>
        🗓️ ${day}
      </span>

      <span>
        📅 ${formatHistoryDateShort(date)}
      </span>

      <span>
        🕐 ${time}
      </span>

      <span class="history-category">

        ${getHistoryCategoryIcon(category)}

        ${escapeHistoryHTML(category)}

      </span>

    </div>

    <div class="history-actions">

      <button
        class="history-open"
        type="button"
      >
        💬 Buka
      </button>

      <button
        class="history-edit"
        type="button"
      >
        ✏️ Edit
      </button>

      <button
        class="history-delete"
        type="button"
      >
        🗑️ Delete
      </button>

    </div>
  `;

  card
    .querySelector(".history-open")
    .addEventListener(
      "click",
      function () {
        openConversation(conversation);
      }
    );

  card
    .querySelector(".history-edit")
    .addEventListener(
      "click",
      function () {
        editConversationTitle(conversation);
      }
    );

  card
    .querySelector(".history-delete")
    .addEventListener(
      "click",
      function () {
        deleteConversation(conversation);
      }
    );

  return card;
}

// ============================================================
// OPEN COMPLETE CONVERSATION
// ============================================================

async function openConversation(
  conversation
) {

  historyPanel.classList.remove(
    "active"
  );

  const chat =
    document.getElementById("chat");

  if (!chat) return;

  chat.innerHTML = "";

  try {

    const response =
      await fetch(
        HISTORY_API +
        "/api/conversations?conversationId=" +
        encodeURIComponent(
          conversation.conversation_id
        )
      );

    const data =
      await response.json();

    if (!response.ok) {
      throw new Error(
        data.error ||
        "Conversation gagal dibuka."
      );
    }

    const messages =
      data.conversations || [];

    if (!messages.length) {
      addHistoryChatMessage(
        "Conversation kosong.",
        "naira-message"
      );
      return;
    }

    messages.forEach(
      function (item) {

        addHistoryChatMessage(
          item.user_message || "",
          "user-message"
        );

        addHistoryChatMessage(
          item.naira_response || "",
          "naira-message"
        );

      }
    );

    window.scrollTo({
      top:
        document.body.scrollHeight,
      behavior:
        "smooth"
    });

  } catch (error) {

    console.error(
      "OPEN HISTORY ERROR:",
      error
    );

    addHistoryChatMessage(
      "❌ " + error.message,
      "naira-message"
    );

  }
}

// ============================================================
// ADD HISTORY MESSAGE
// ============================================================

function addHistoryChatMessage(
  text,
  className
) {

  const chat =
    document.getElementById("chat");

  if (!chat) return;

  const message =
    document.createElement("div");

  message.className =
    "message " + className;

  message.textContent =
    text || "";

  chat.appendChild(
    message
  );
}

// ============================================================
// EDIT TITLE
// ============================================================

async function editConversationTitle(
  conversation
) {

  const currentTitle =
    conversation.title ||
    conversation.user_message ||
    "";

  const newTitle =
    prompt(
      "✏️ Edit tajuk conversation:",
      currentTitle
    );

  if (newTitle === null) {
    return;
  }

  const title =
    newTitle.trim();

  if (!title) {

    alert(
      "⚠️ Tajuk tidak boleh kosong."
    );

    return;
  }

  try {

    const response =
      await fetch(
        HISTORY_API +
        "/api/conversations",
        {
          method: "PATCH",

          headers: {
            "Content-Type":
              "application/json"
          },

          body:
            JSON.stringify({
              conversationId:
                conversation.conversation_id,

              title:
                title
            })
        }
      );

    const data =
      await response.json();

    if (!response.ok) {

      throw new Error(
        data.error ||
        "Tajuk gagal dikemaskini."
      );

    }

    conversation.title =
      title;

    renderHistory(
      filterHistory()
    );

  } catch (error) {

    console.error(
      "EDIT HISTORY ERROR:",
      error
    );

    alert(
      "❌ " +
      error.message
    );

  }
}

// ============================================================
// DELETE CONVERSATION
// ============================================================

async function deleteConversation(
  conversation
) {

  const confirmed =
    confirm(
      "Tuan pasti mahu padam conversation ini?\n\nConversation ini akan dipadam dari History."
    );

  if (!confirmed) {
    return;
  }

  try {

    const response =
      await fetch(
        HISTORY_API +
        "/api/conversations",
        {
          method: "DELETE",

          headers: {
            "Content-Type":
              "application/json"
          },

          body:
            JSON.stringify({
              conversationId:
                conversation.conversation_id
            })
        }
      );

    const data =
      await response.json();

    if (!response.ok) {

      throw new Error(
        data.error ||
        "Conversation gagal dipadam."
      );

    }

    allConversations =
      allConversations.filter(
        function (item) {

          return (
            String(
              item.conversation_id
            ) !==
            String(
              conversation.conversation_id
            )
          );

        }
      );

    historyStatus.textContent =
      `${allConversations.length} conversation`;

    renderHistory(
      filterHistory()
    );

  } catch (error) {

    console.error(
      "DELETE HISTORY ERROR:",
      error
    );

    alert(
      "❌ " +
      error.message
    );

  }
}

// ============================================================
// DATE FORMAT
// ============================================================

function formatHistoryDate(
  dateKey
) {

  const date =
    new Date(
      dateKey +
      "T00:00:00"
    );

  return date.toLocaleDateString(
    "ms-MY",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric"
    }
  );
}

function formatHistoryDateShort(
  date
) {

  return date.toLocaleDateString(
    "ms-MY",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone:
        "Asia/Singapore"
    }
  );
}

function formatHistoryDay(
  date
) {

  return date.toLocaleDateString(
    "ms-MY",
    {
      weekday: "long",
      timeZone:
        "Asia/Singapore"
    }
  );
}

function formatHistoryTime(
  date
) {

  return date.toLocaleTimeString(
    "ms-MY",
    {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone:
        "Asia/Singapore"
    }
  );
}

// ============================================================
// CATEGORY ICON
// ============================================================

function getHistoryCategoryIcon(
  category
) {

  const icons = {
    project: "🚀",
    game: "🎮",
    food: "🍔",
    work: "💼",
    fashion: "👕",
    hobby: "🎨",
    profile: "👤",
    preference: "❤️",
    family: "👨‍👩‍👧",
    general: "📁"
  };

  return (
    icons[category] ||
    "📁"
  );
}

// ============================================================
// HTML SAFETY
// ============================================================

function escapeHistoryHTML(
  value
) {

  return String(
    value || ""
  )
    .replace(
      /&/g,
      "&amp;"
    )
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    )
    .replace(
      /"/g,
      "&quot;"
    )
    .replace(
      /'/g,
      "&#039;"
    );
}

// ============================================================
// GLOBAL
// ============================================================

window.loadHistory =
  loadHistory;