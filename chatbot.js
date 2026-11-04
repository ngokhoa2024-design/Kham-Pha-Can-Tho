/* =========================================
   KHÁM PHÁ CẦN THƠ - AI CHATBOT
   Frontend Logic
   ========================================= */
(() => {
  "use strict";

  // ── DOM Elements ──────────────────────────
  const toggle     = document.getElementById("chatbot-toggle");
  const panel      = document.getElementById("chatbot-panel");
  const closeBtn   = document.getElementById("chatbot-close");
  const form       = document.getElementById("chatbot-form");
  const input      = document.getElementById("chatbot-input");
  const messagesEl = document.getElementById("chatbot-messages");
  const sendBtn    = document.getElementById("chatbot-send");
  const quickBox   = document.querySelector(".chatbot-quick-replies");

  if (!toggle || !panel || !form || !input || !messagesEl) return;

  // ── Config ────────────────────────────────
  const FUNCTION_NAME = "smooth-action";
  const MAX_HISTORY   = 20;   // 10 cặp user + assistant

  // ── State ─────────────────────────────────
  const history = [];
  let busy = false;

  // ═══════════════════════════════════════════
  //  TOGGLE PANEL
  // ═══════════════════════════════════════════
  toggle.addEventListener("click", () => {
    panel.hidden = !panel.hidden;
    if (!panel.hidden) input.focus();
  });

  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      panel.hidden = true;
    });
  }

  // ═══════════════════════════════════════════
  //  QUICK REPLIES
  // ═══════════════════════════════════════════
  if (quickBox) {
    quickBox.addEventListener("click", (e) => {
      const btn = e.target.closest(".chatbot-quick-reply");
      if (!btn || busy || input.disabled) return;

      // Bỏ emoji ở đầu, lấy text thuần
      input.value = btn.textContent
        .replace(/^[^\p{L}\p{N}]+\s*/u, "")
        .trim();

      if (typeof form.requestSubmit === "function") {
        form.requestSubmit();
      } else {
        form.dispatchEvent(
          new Event("submit", { bubbles: true, cancelable: true })
        );
      }
    });
  }

  // ═══════════════════════════════════════════
  //  UTILITIES
  // ═══════════════════════════════════════════

  /** Escape HTML để chống XSS trước khi render Markdown */
  function escapeHtml(text) {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  /** Inline formatting: **bold** → <strong>, *italic* → <em> */
  function inlineFormat(text) {
    return text
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>");
  }

  /**
   * Render Markdown đơn giản → HTML
   * Hỗ trợ: ## heading, ### heading, **bold**, *italic*,
   * - danh sách, * danh sách, 1. danh sách có số, đoạn văn
   */
  function renderMarkdown(rawText) {
    var escaped = escapeHtml(rawText);
    var lines = escaped.split("\n");
    var output = [];
    var inUl = false;
    var inOl = false;

    function closeLists() {
      if (inUl) { output.push("</ul>"); inUl = false; }
      if (inOl) { output.push("</ol>"); inOl = false; }
    }

    for (var i = 0; i < lines.length; i++) {
      var line = lines[i].trim();

      // ── Heading ### ──
      if (line.indexOf("### ") === 0) {
        closeLists();
        output.push("<h4>" + inlineFormat(line.slice(4)) + "</h4>");
        continue;
      }

      // ── Heading ## ──
      if (line.indexOf("## ") === 0) {
        closeLists();
        output.push("<h3>" + inlineFormat(line.slice(3)) + "</h3>");
        continue;
      }

      // ── Unordered list: - item, * item, • item ──
      var ulMatch = line.match(/^[-*•]\s+(.*)/);
      if (ulMatch) {
        if (inOl) closeLists();
        if (!inUl) { output.push("<ul>"); inUl = true; }
        output.push("<li>" + inlineFormat(ulMatch[1]) + "</li>");
        continue;
      }

      // ── Ordered list: 1. item, 2) item ──
      var olMatch = line.match(/^\d+[.)]\s+(.*)/);
      if (olMatch) {
        if (inUl) closeLists();
        if (!inOl) { output.push("<ol>"); inOl = true; }
        output.push("<li>" + inlineFormat(olMatch[1]) + "</li>");
        continue;
      }

      // ── Empty line ──
      closeLists();
      if (line === "") continue;

      // ── Regular paragraph ──
      output.push("<p>" + inlineFormat(line) + "</p>");
    }

    closeLists();
    return output.join("");
  }

  /** Cuộn mượt xuống cuối vùng tin nhắn */
  function scrollToBottom() {
    messagesEl.scrollTo({
      top: messagesEl.scrollHeight,
      behavior: "smooth",
    });
  }

  /** Ẩn nút gợi ý nhanh sau lần chat đầu tiên */
  function hideQuickReplies() {
    if (quickBox) quickBox.classList.add("hidden");
  }

  // ═══════════════════════════════════════════
  //  ADD MESSAGE
  // ═══════════════════════════════════════════

  /**
   * Thêm bong bóng tin nhắn vào vùng chat
   * @param {string}  content  - Nội dung tin nhắn
   * @param {string}  role     - "user" hoặc "assistant"
   * @param {boolean} isError  - true nếu là thông báo lỗi
   * @returns {HTMLDivElement}  Element vừa tạo
   */
  function addMessage(content, role, isError) {
    var div = document.createElement("div");

    if (role === "user") {
      div.className = "user-message";
      div.textContent = content;
    } else {
      div.className = "bot-message" + (isError ? " error-message" : "");
      div.innerHTML = isError
        ? "<p>" + escapeHtml(content) + "</p>"
        : renderMarkdown(content);
    }

    messagesEl.appendChild(div);
    scrollToBottom();
    return div;
  }

  // ═══════════════════════════════════════════
  //  TYPING INDICATOR (3 dấu chấm)
  // ═══════════════════════════════════════════

  /**
   * Hiển thị animation 3 dấu chấm nhảy
   * @returns {HTMLDivElement} Element typing (dùng để remove sau)
   */
  function showTyping() {
    var div = document.createElement("div");
    div.className = "bot-message typing-message";
    div.innerHTML =
      '<div class="typing-indicator">' +
        "<span></span><span></span><span></span>" +
      "</div>";
    messagesEl.appendChild(div);
    scrollToBottom();
    return div;
  }

  // ═══════════════════════════════════════════
  //  GỬI TIN NHẮN (Form Submit)
  // ═══════════════════════════════════════════
  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    var text = input.value.trim();
    if (!text || busy) return;

    // Kiểm tra Supabase client
    var client = window.supabaseClient;
    if (!client || !client.functions || !client.functions.invoke) {
      addMessage(
        "⚠ Chưa tìm thấy Supabase client. Hãy kiểm tra kết nối mạng và tải lại trang.",
        "assistant",
        true
      );
      return;
    }

    // ── Khóa giao diện ──
    busy = true;
    if (sendBtn) sendBtn.disabled = true;
    input.disabled = true;
    input.value = "";

    // ── Hiển thị tin nhắn người dùng ──
    addMessage(text, "user");
    hideQuickReplies();

    // ── Hiển thị typing indicator ──
    var typingEl = showTyping();

    // ── Chuẩn bị lịch sử hội thoại ──
    var nextHistory = history
      .concat([{ role: "user", content: text }])
      .slice(-MAX_HISTORY);

    try {
      var result = await client.functions.invoke(
        FUNCTION_NAME,
        { body: { messages: nextHistory } }
      );

      var data = result.data;
      var invokeError = result.error;

      // Xóa typing indicator
      if (typingEl.parentNode) typingEl.remove();

      // ── Lỗi mạng / gọi function thất bại ──
      if (invokeError) {
        throw new Error(
          invokeError.message || "Không thể kết nối đến máy chủ."
        );
      }

      // ── Edge Function trả về lỗi ──
      if (data && data.error) {
        addMessage("⚠ " + data.error, "assistant", true);
        return;
      }

      // ── Không có phản hồi ──
      if (!data || typeof data.reply !== "string" || !data.reply.trim()) {
        addMessage(
          "⚠ AI không trả về nội dung. Vui lòng thử lại.",
          "assistant",
          true
        );
        return;
      }

      // ── Thành công: hiển thị phản hồi ──
      addMessage(data.reply, "assistant", false);

      // ── Cập nhật lịch sử hội thoại ──
      history.push(
        { role: "user", content: text },
        { role: "assistant", content: data.reply }
      );

      // Giữ lịch sử không quá MAX_HISTORY
      if (history.length > MAX_HISTORY) {
        history.splice(0, history.length - MAX_HISTORY);
      }

    } catch (err) {
      // Xóa typing indicator nếu chưa xóa
      if (typingEl.parentNode) typingEl.remove();

      console.error("Chatbot error:", err);
      addMessage(
        "⚠ Xin lỗi, không thể kết nối đến trợ lý AI. Bạn hãy kiểm tra mạng và thử lại.",
        "assistant",
        true
      );

    } finally {
      // ── Mở khóa giao diện ──
      busy = false;
      if (sendBtn) sendBtn.disabled = false;
      input.disabled = false;
      input.focus();
    }
  });
})();
