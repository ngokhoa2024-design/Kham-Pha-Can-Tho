/* ===================================================================
   newsfeed.js
   ---------------------------------------------------------------
   Lấy 2–3 bài viết mới nhất từ bảng "posts" (Supabase) — cùng
   database đang dùng cho forum.html — và render thành "Bảng Tin
   Cộng Đồng" trên trang chủ (index.html), thay cho phần ảnh tĩnh
   "Khoảnh Khắc Cần Thơ" trước đây.

   Yêu cầu trên trang HTML:
   - Đã include (theo đúng thứ tự, trước file này):
       <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
       <script src="JS/supabase.js"></script>
   - Có sẵn 1 khối:
       <section class="newsfeed" id="newsfeedSection">
           <div class="newsfeed-list" id="newsfeedList"></div>
       </section>

   Muốn đổi số lượng bài hiển thị (2 hoặc 3) → sửa NEWSFEED_LIMIT.
   =================================================================== */

document.addEventListener("DOMContentLoaded", async function () {
    var NEWSFEED_LIMIT = 3; // đổi thành 2 nếu muốn chỉ hiện 2 bài
    var EXCERPT_LENGTH = 140; // số ký tự tối đa của phần trích nội dung

    var container = document.getElementById("newsfeedList");
    if (!container) return; // trang không có khối newsfeed thì bỏ qua

    // --- UTILS (tối giản, không phụ thuộc forum.js) -------------------
    function escapeHtml(text) {
        return String(text == null ? "" : text)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function getInitials(name) {
        var parts = (name || "").trim().split(/\s+/).filter(Boolean);
        if (!parts.length) return "U";
        return parts.slice(0, 2).map(function (p) { return p.charAt(0).toUpperCase(); }).join("");
    }

    function truncateText(text, maxLength) {
        var clean = (text || "").trim();
        if (clean.length <= maxLength) return clean;
        return clean.slice(0, maxLength).trim() + "…";
    }

    function formatDate(dateValue) {
        var date = new Date(dateValue);
        if (isNaN(date.getTime())) return "";
        return date.toLocaleDateString("vi-VN", {
            day: "2-digit", month: "2-digit", year: "numeric"
        });
    }

    // Lấy ảnh đầu tiên trong mảng media (nếu có) để làm ảnh đại diện bài viết.
    // Video sẽ bị bỏ qua ở đây (New Feed chỉ hiện ảnh cho gọn).
    function getFirstImage(media) {
        if (!media || !media.length) return null;
        var found = media.find(function (item) { return item && item.type === "image" && item.src; });
        return found ? found.src : null;
    }

    function renderAvatar(name, avatarUrl) {
        if (avatarUrl) {
            return '<span class="nf-avatar"><img src="' + escapeHtml(avatarUrl) + '" alt="' + escapeHtml(name || "Người dùng") + '"></span>';
        }
        return '<span class="nf-avatar nf-avatar-fallback">' + escapeHtml(getInitials(name)) + '</span>';
    }

    function renderCard(post) {
        var authorName = (post.profiles && post.profiles.name) || "Người dùng";
        var authorAvatar = (post.profiles && post.profiles.avatar_url) || "";
        var thumbnail = getFirstImage(post.media);
        var topic = post.topic || "Câu chuyện cá nhân";
        var title = post.title || "(Không có tiêu đề)";
        var excerpt = truncateText(post.content, EXCERPT_LENGTH);

        return (
            '<a class="nf-card" href="forum.html" title="Xem bài viết trong Diễn Đàn">' +
                (thumbnail
                    ? '<div class="nf-thumb"><img src="' + thumbnail + '" alt="' + escapeHtml(title) + '" loading="lazy"></div>'
                    : '<div class="nf-thumb nf-thumb-empty"><i class="fa-solid fa-comments"></i></div>') +
                '<div class="nf-body">' +
                    '<span class="nf-topic-badge">' + escapeHtml(topic) + '</span>' +
                    '<h3 class="nf-title">' + escapeHtml(title) + '</h3>' +
                    '<p class="nf-excerpt">' + escapeHtml(excerpt) + '</p>' +
                    '<div class="nf-meta">' +
                        renderAvatar(authorName, authorAvatar) +
                        '<span class="nf-author">' + escapeHtml(authorName) + '</span>' +
                        '<span class="nf-dot">•</span>' +
                        '<span class="nf-date">' + formatDate(post.created_at) + '</span>' +
                    '</div>' +
                '</div>' +
            '</a>'
        );
    }

    function renderEmptyState(message) {
        container.innerHTML = '<p class="nf-empty">' + escapeHtml(message) + '</p>';
    }

    async function loadNewsfeed() {
        if (!window.supabaseClient) {
            console.error("newsfeed.js: chưa thấy window.supabaseClient — kiểm tra lại thứ tự script JS/supabase.js.");
            renderEmptyState("Không thể kết nối tới diễn đàn lúc này.");
            return;
        }

        try {
            var result = await window.supabaseClient
                .from("posts")
                .select("id, title, content, topic, created_at, media, profiles ( name, avatar_url )")
                .order("created_at", { ascending: false })
                .limit(NEWSFEED_LIMIT);

            if (result.error) throw result.error;

            var posts = result.data || [];
            if (!posts.length) {
                renderEmptyState("Chưa có bài viết nào trong Diễn Đàn. Hãy là người đầu tiên chia sẻ!");
                return;
            }

            container.innerHTML = posts.map(renderCard).join("");
        } catch (err) {
            console.error("newsfeed.js: lỗi tải bài viết mới nhất:", err);
            renderEmptyState("Không thể tải bài viết mới nhất lúc này. Vui lòng thử lại sau.");
        }
    }

    loadNewsfeed();
});
