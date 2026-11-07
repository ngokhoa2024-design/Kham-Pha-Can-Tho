(() => {
  "use strict";

  const scriptUrl = new URL(document.currentScript.src, window.location.href);
  const asset = (path) => new URL(path, scriptUrl).href;

  if (document.getElementById("chatbot-toggle")) return;

  const style = document.createElement("link");
  style.rel = "stylesheet";
  style.href = asset("chatbot.css");
  document.head.appendChild(style);

  document.body.insertAdjacentHTML("beforeend", `
    <button id="chatbot-toggle" type="button" aria-label="Mở trợ lý du lịch">
      <span class="chatbot-toggle-icon" aria-hidden="true">✦</span>
      <span>Chat với AI</span>
    </button>
    <div id="chatbot-panel" class="chatbot-panel" hidden>
      <div class="chatbot-header">
        <div class="chatbot-avatar chatbot-avatar-header">
          <img src="${asset("images/logo Cần Thơ.png")}" alt="Logo Khám Phá Cần Thơ">
        </div>
        <div class="chatbot-heading">
          <strong>Trợ lý Khám Phá Cần Thơ</strong>
          <p><span class="chatbot-online-dot"></span>Hỏi AI để khám phá Cần Thơ</p>
        </div>
        <button id="chatbot-close" type="button" aria-label="Đóng chatbot">×</button>
      </div>
      <div id="chatbot-messages" class="chatbot-messages">
        <div class="chatbot-welcome">
          <div class="chatbot-avatar chatbot-avatar-small">
            <img src="${asset("images/logo Cần Thơ.png")}" alt="Logo trợ lý">
          </div>
          <div class="bot-message">Xin chào! Mình là trợ lý du lịch Cần Thơ. Bạn muốn khám phá miền Tây như thế nào?</div>
        </div>
        <div class="chatbot-quick-replies" aria-label="Gợi ý câu hỏi">
          <button type="button" class="chatbot-quick-reply">🛶 Lịch trình 1 ngày</button>
          <button type="button" class="chatbot-quick-reply">🍜 Ăn gì ở Bến Ninh Kiều?</button>
          <button type="button" class="chatbot-quick-reply">💰 Du lịch tiết kiệm</button>
        </div>
      </div>
      <form id="chatbot-form" class="chatbot-form">
        <input id="chatbot-input" type="text" placeholder="Hỏi gì về Cần Thơ nhỉ?" maxlength="2000" autocomplete="off" aria-label="Nhập câu hỏi" required>
        <button id="chatbot-send" type="submit">
          <span>Gửi</span>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M22 2 11 13"></path><path d="m22 2-7 20-4-9-9-4Z"></path>
          </svg>
        </button>
      </form>
    </div>
  `);

  const loadScript = (src) => new Promise((resolve, reject) => {
    const existing = [...document.scripts].find((script) => script.src === src);
    if (existing) {
      if (existing.dataset.loaded === "true") return resolve();
      existing.addEventListener("load", resolve, { once: true });
      existing.addEventListener("error", reject, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.onload = () => {
      script.dataset.loaded = "true";
      resolve();
    };
    script.onerror = reject;
    document.body.appendChild(script);
  });

  (async () => {
    try {
      if (!window.supabase) {
        await loadScript("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2");
      }
      if (!window.supabaseClient) {
        await loadScript(asset("js/supabase-client.js"));
      }
      await loadScript(asset("chatbot.js"));
    } catch (error) {
      console.error("Không thể tải trợ lý AI:", error);
    }
  })();
})();
