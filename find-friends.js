(() => {
  "use strict";

  /*
   * BUDDY ĐỒNG HÀNH
   * - Không dùng Google Apps Script
   * - Không tạo chat nội bộ
   * - Dùng Supabase Auth + profiles + buddy_posts
   * - Ưu tiên window.supabaseClient nếu website đã tạo client
   */

  const SUPABASE_URL = "https://lkearyxyyblhivsbpgaq.supabase.co";
  const SUPABASE_KEY = "sb_publishable_vfMZX2dCXTen-0S-9D7eTg_x1rLKAVW";
  const TABLE = "buddy_posts";

  let client = null;
  let currentUser = null;
  let currentProfile = null;
  let allPosts = [];
  let activeFilter = "all";
  let myPostsOnly = false;
  let editingPostId = null;

  const $ = (id) => document.getElementById(id);

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function getInitials(name) {
    const parts = String(name || "U").trim().split(/\s+/).filter(Boolean);
    return parts.slice(0, 2).map((part) => part.charAt(0).toUpperCase()).join("") || "U";
  }

  /*
   * Ghép Title (danh hiệu) đang active vào sau tên người đăng, dùng chung cho
   * card Buddy. Dùng hệ thống Title đã có sẵn (titles / profiles.active_title_id),
   * không tạo hệ thống mới. Trả về "" nếu user không có active title.
   */
  function formatUserTitleBadgeHtml(title) {
    if (!title || !title.name) return "";
    const icon = title.icon ? escapeHtml(title.icon) + " " : "";
    const isValidColor = /^#[0-9a-fA-F]{3,8}$/.test(title.color || "");
    const styleAttr = isValidColor ? ` style="color:${title.color}"` : "";
    return `<span class="user-title-badge"${styleAttr}>- ${icon}${escapeHtml(title.name)}</span>`;
  }

  function normalize(value) {
    return String(value || "")
      .toLocaleLowerCase("vi")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d");
  }

  function getRelativeTime(dateString) {
    const time = new Date(dateString).getTime();
    if (!Number.isFinite(time)) return "";

    const diff = Math.max(0, Date.now() - time);
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return "Vừa xong";
    if (minutes < 60) return `${minutes} phút trước`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} giờ trước`;
    if (hours < 48) return "Hôm qua";

    return `${Math.floor(hours / 24)} ngày trước`;
  }

  function formatDate(value) {
    if (!value) return "";

    const date = new Date(`${value}T00:00:00`);
    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
  }

  function showFormMessage(message, isError = false) {
    const element = $("formMessage");
    if (!element) return;

    element.textContent = message || "";
    element.classList.toggle("error", Boolean(isError));
  }

  function showFeedState(type, message, detail = "") {
    const feed = $("buddyFeed");
    if (!feed) return;

    const icon =
      type === "loading"
        ? "fa-spinner fa-spin"
        : type === "error"
          ? "fa-triangle-exclamation"
          : "fa-compass";

    const detailHtml = detail
      ? `<br><small>${escapeHtml(detail)}</small>`
      : "";

    feed.innerHTML = `
      <div class="${type}-state">
        <i class="fa-solid ${icon}"></i>
        <br>
        ${escapeHtml(message)}
        ${detailHtml}
      </div>
    `;
  }

  /*
   * Không tạo client mới nếu website đã có window.supabaseClient.
   * Nếu trang Buddy tự chạy thì tạo một client duy nhất và gắn vào window.
   */
  function ensureClient() {
    if (window.supabaseClient) {
      client = window.supabaseClient;
      return client;
    }

    if (!window.supabase || typeof window.supabase.createClient !== "function") {
      throw new Error(
        "Chưa tải Supabase JS. Hãy đặt <script src=\"https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2\"></script> trước buddy.js."
      );
    }

    window.supabaseClient = window.supabase.createClient(
      SUPABASE_URL,
      SUPABASE_KEY
    );

    client = window.supabaseClient;
    return client;
  }

  async function getCurrentUser() {
    ensureClient();

    const { data, error } = await client.auth.getUser();

    if (error) {
      console.error("[Buddy] auth.getUser() lỗi:", error);
      return null;
    }

    return data?.user || null;
  }

  async function loadCurrentAccount() {
    currentUser = await getCurrentUser();

    const loginState = $("loginState");
    const loginRequired = $("loginRequired");
    const buddyForm = $("buddyForm");
    const accountPreview = $("accountPreview");

    if (!currentUser) {
      currentProfile = null;

      if (loginState) loginState.textContent = "Chưa đăng nhập";
      if (loginRequired) loginRequired.hidden = false;
      if (buddyForm) buddyForm.hidden = true;
      if (accountPreview) accountPreview.innerHTML = "";

      return;
    }

    const { data: profile, error } = await client
      .from("profiles")
      .select("id,name,avatar_url,facebook,role,status")
      .eq("id", currentUser.id)
      .maybeSingle();

    if (error) {
      console.error("[Buddy] Không lấy được profiles:", error);

      if (loginState) loginState.textContent = "Không đọc được hồ sơ";
      if (loginRequired) {
        loginRequired.hidden = false;
        loginRequired.innerHTML = `
          <i class="fa-solid fa-triangle-exclamation"></i>
          <div>
            <strong>Không thể đọc thông tin tài khoản.</strong>
            <p>${escapeHtml(error.message)}</p>
          </div>
        `;
      }
      if (buddyForm) buddyForm.hidden = true;
      return;
    }

    if (!profile) {
      console.error("[Buddy] Không tìm thấy profile cho user:", currentUser.id);

      if (loginRequired) {
        loginRequired.hidden = false;
        loginRequired.innerHTML = `
          <i class="fa-solid fa-user-slash"></i>
          <div>
            <strong>Tài khoản chưa có hồ sơ.</strong>
            <p>Hãy mở trang tài khoản và hoàn tất thông tin cá nhân trước.</p>
          </div>
          <a href="account.html" class="primary-btn small">Mở tài khoản</a>
        `;
      }

      if (buddyForm) buddyForm.hidden = true;
      return;
    }

    currentProfile = profile;

    const blocked = ["banned", "suspended"].includes(profile.status);

    if (blocked) {
      if (loginState) loginState.textContent = "Tài khoản đang bị hạn chế";

      if (loginRequired) {
        loginRequired.hidden = false;
        loginRequired.innerHTML = `
          <i class="fa-solid fa-ban"></i>
          <div>
            <strong>Tài khoản hiện không thể đăng Buddy.</strong>
            <p>Trạng thái tài khoản: ${escapeHtml(profile.status)}.</p>
          </div>
        `;
      }

      if (buddyForm) buddyForm.hidden = true;
      return;
    }

    if (loginRequired) loginRequired.hidden = true;
    if (buddyForm) buddyForm.hidden = false;

    if (loginState) {
      loginState.textContent = profile.name
        ? `Đang đăng bằng ${profile.name}`
        : "Đã đăng nhập";
    }

    renderAccountPreview(profile);
  }

  function renderAccountPreview(profile) {
    const preview = $("accountPreview");
    if (!preview) return;

    const avatar = profile?.avatar_url
      ? `<img class="mini-avatar" src="${escapeHtml(profile.avatar_url)}" alt="Avatar">`
      : `<div class="mini-avatar avatar-fallback">${escapeHtml(getInitials(profile?.name))}</div>`;

    preview.innerHTML = `
      <div class="account-preview-inner">
        ${avatar}
        <div>
          <strong>${escapeHtml(profile?.name || currentUser?.email || "Người dùng")}</strong>
          <br>
          <span>Facebook: ${escapeHtml(profile?.facebook || "Chưa cập nhật")}</span>
        </div>
      </div>
    `;
  }

  async function loadPosts() {
    showFeedState("loading", "Đang tải Buddy...");

    const { data, error } = await client
      .from(TABLE)
      .select("*")
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[Buddy] Không tải được buddy_posts:", error);

      const feedStatus = $("feedStatus");
      if (feedStatus) feedStatus.textContent = "Có lỗi khi tải dữ liệu Buddy.";

      showFeedState(
        "error",
        "Không thể tải danh sách Buddy.",
        error.message
      );
      return;
    }

    const posts = Array.isArray(data) ? data : [];

    /*
     * Đọc profiles riêng để kiểm tra banned/suspended.
     * Không tin name/avatar/facebook do client gửi lên.
     */
    const userIds = [...new Set(posts.map((post) => post.user_id).filter(Boolean))];

    let profiles = [];

    if (userIds.length) {
      const result = await client
        .from("profiles")
        .select("id,name,avatar_url,facebook,status,role,active_title_id")
        .in("id", userIds);

      if (result.error) {
        console.error(
          "[Buddy] Không tải được profiles của người đăng:",
          result.error
        );
      } else {
        profiles = result.data || [];
      }
    }

    /*
     * Preload Title (danh hiệu) active theo batch — một query duy nhất cho
     * mọi title_id khác nhau, tránh N+1 (không query title riêng từng post/user).
     */
    const titleIds = [
      ...new Set(profiles.map((profile) => profile.active_title_id).filter(Boolean))
    ];

    let titleMap = new Map();

    if (titleIds.length) {
      const titleResult = await client
        .from("titles")
        .select("id,name,slug,icon,color")
        .in("id", titleIds);

      if (titleResult.error) {
        console.error("[Buddy] Không tải được titles:", titleResult.error);
      } else {
        titleMap = new Map((titleResult.data || []).map((title) => [title.id, title]));
      }
    }

    const profileMap = new Map(
      profiles.map((profile) => [
        profile.id,
        { ...profile, activeTitle: titleMap.get(profile.active_title_id) || null }
      ])
    );

    allPosts = posts
      .map((post) => ({
        ...post,
        profile: profileMap.get(post.user_id) || null
      }))
      .filter(
        (post) =>
          post.profile &&
          !["banned", "suspended"].includes(post.profile.status)
      );

    renderFeed();
  }

  function getVisiblePosts() {
    const searchInput = $("searchInput");
    const keyword = normalize(searchInput?.value?.trim() || "");

    return allPosts.filter((post) => {
      const profile = post.profile || {};

      const typeOk =
        activeFilter === "all" || post.trip_type === activeFilter;

      const ownOk =
        !myPostsOnly || post.user_id === currentUser?.id;

      const searchableText = normalize(
        [
          post.title,
          post.destination,
          post.description,
          post.name,
          profile.name,
          post.trip_type,
          post.vibe
        ].join(" ")
      );

      return (
        typeOk &&
        ownOk &&
        (!keyword || searchableText.includes(keyword))
      );
    });
  }

  function renderFeed() {
    const feed = $("buddyFeed");
    if (!feed) return;

    const posts = getVisiblePosts();

    const feedStatus = $("feedStatus");
    if (feedStatus) {
      feedStatus.textContent = myPostsOnly
        ? `Tin của tôi · ${posts.length} bài`
        : `${posts.length} đang hoạt động`;
    }

    if (!posts.length) {
      feed.innerHTML = `
        <div class="empty-state">
          <i class="fa-solid fa-compass"></i>
          <br>
          <strong>
            ${myPostsOnly
              ? "Bạn chưa đăng tin nào, hãy đăng ngay để tìm người phù hợp."
              : "Chưa tìm thấy bạn đồng hành phù hợp?"}
          </strong>
          <br>
          <small>Thử đổi bộ lọc hoặc từ khóa tìm kiếm.</small>
        </div>
      `;
      return;
    }

    feed.innerHTML = posts.map(renderPostCard).join("");
    bindCardActions();
  }

  function renderPostCard(post) {
    const profile = post.profile || {};
    const isOwner = currentUser?.id === post.user_id;

    const name = profile.name || post.name || "Người dùng";
    const avatarUrl = profile.avatar_url || post.avatar_url || "";
    const facebook = profile.facebook || post.facebook || "";
    const titleBadge = formatUserTitleBadgeHtml(profile.activeTitle);

    const avatar = avatarUrl
      ? `<img class="avatar" src="${escapeHtml(avatarUrl)}" alt="Avatar của ${escapeHtml(name)}">`
      : `<div class="avatar avatar-fallback">${escapeHtml(getInitials(name))}</div>`;

    const facebookButton = facebook
      ? `
        <a
          class="facebook-btn"
          href="${escapeHtml(facebook)}"
          target="_blank"
          rel="noopener noreferrer"
        >
          <i class="fa-brands fa-facebook"></i>
          Xem Facebook
        </a>
      `
      : `
        <span class="facebook-btn disabled">
          <i class="fa-brands fa-facebook"></i>
          Chưa có Facebook
        </span>
      `;

    return `
      <article class="buddy-card" data-id="${escapeHtml(post.id)}">
        <div class="post-author">
          <div class="author-left">
            ${avatar}
            <div>
              <div class="author-name">${escapeHtml(name)}${titleBadge}</div>
              <div class="post-time">${escapeHtml(getRelativeTime(post.created_at))}</div>
            </div>
          </div>

          <span class="type-badge">
            ${escapeHtml(post.trip_type || "Buddy")}
          </span>
        </div>

        <h3>${escapeHtml(post.title)}</h3>

        <div class="post-meta">
          <span class="meta-chip">
            <i class="fa-solid fa-location-dot"></i>
            ${escapeHtml(post.destination)}
          </span>

          ${
            post.trip_date
              ? `
                <span class="meta-chip">
                  <i class="fa-regular fa-calendar"></i>
                  ${escapeHtml(formatDate(post.trip_date))}
                </span>
              `
              : ""
          }

          ${
            post.trip_time
              ? `
                <span class="meta-chip">
                  <i class="fa-regular fa-clock"></i>
                  ${escapeHtml(post.trip_time)}
                </span>
              `
              : ""
          }

          <span class="meta-chip">
            <i class="fa-solid fa-user-group"></i>
            Cần thêm ${escapeHtml(post.guest_count || 1)} người
          </span>

          ${
            post.vibe
              ? `
                <span class="meta-chip vibe-chip">
                  <i class="fa-solid fa-sparkles"></i>
                  ${escapeHtml(post.vibe)}
                </span>
              `
              : ""
          }
        </div>

        <p class="post-description">
          ${escapeHtml(
            post.description ||
            "Đang tìm những người bạn đồng hành phù hợp."
          )}
        </p>

        <div class="post-footer">
          ${facebookButton}

          ${!isOwner ? `
            <button class="rpt-trigger-btn report-buddy" type="button"
              data-id="${escapeHtml(post.id)}" data-user-id="${escapeHtml(post.user_id)}">
              <i class="fa-solid fa-flag"></i> Báo cáo
            </button>` : ""}

          ${
            isOwner
              ? `
                <div class="owner-actions">
                  <button
                    class="icon-btn edit-post"
                    data-id="${escapeHtml(post.id)}"
                    type="button"
                  >
                    <i class="fa-solid fa-pen"></i> Sửa
                  </button>

                  <button
                    class="icon-btn delete delete-post"
                    data-id="${escapeHtml(post.id)}"
                    type="button"
                  >
                    <i class="fa-solid fa-trash"></i> Xóa
                  </button>
                </div>
              `
              : ""
          }
        </div>
      </article>
    `;
  }

  function resetForm() {
    const form = $("buddyForm");
    if (form) form.reset();

    const guestCount = $("guestCountInput");
    if (guestCount) guestCount.value = 1;

    editingPostId = null;

    const submitButton = $("submitBuddyBtn");
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.innerHTML =
        `<i class="fa-solid fa-paper-plane"></i> Đăng tin Buddy`;
    }

    const cancelButton = $("cancelEditBtn");
    if (cancelButton) cancelButton.hidden = true;

    showFormMessage("");
  }

  async function submitPost(event) {
    event.preventDefault();

    if (!currentUser || !currentProfile) {
      showFormMessage("Bạn cần đăng nhập trước.", true);
      return;
    }

    if (["banned", "suspended"].includes(currentProfile.status)) {
      showFormMessage(
        "Tài khoản hiện không được phép đăng Buddy.",
        true
      );
      return;
    }

    const titleInput = $("titleInput");
    const destinationInput = $("destinationInput");
    const tripDateInput = $("tripDateInput");
    const tripTimeInput = $("tripTimeInput");
    const guestCountInput = $("guestCountInput");
    const tripTypeInput = $("tripTypeInput");
    const vibeInput = $("vibeInput");
    const descriptionInput = $("descriptionInput");

    const guestCount = Number(guestCountInput?.value);

    const payload = {
      /*
       * user_id chỉ là thông tin kỹ thuật để RLS kiểm tra.
       * Trigger SQL ở database vẫn ép user_id/name/avatar/facebook
       * theo auth.uid() + profiles, nên không thể giả mạo từ frontend.
       */
      user_id: currentUser.id,

      title: titleInput?.value.trim() || "",
      destination: destinationInput?.value.trim() || "",
      trip_date: tripDateInput?.value || null,
      trip_time: tripTimeInput?.value || null,
      guest_count: guestCount,
      trip_type: tripTypeInput?.value || "",
      vibe: vibeInput?.value || null,
      description: descriptionInput?.value.trim() || ""
    };

    if (
      !payload.title ||
      !payload.destination ||
      !payload.trip_type ||
      !payload.description
    ) {
      showFormMessage(
        "Vui lòng điền đầy đủ tiêu đề, điểm đến, loại chuyến đi và mô tả.",
        true
      );
      return;
    }

    if (
      !Number.isInteger(payload.guest_count) ||
      payload.guest_count < 1 ||
      payload.guest_count > 20
    ) {
      showFormMessage("Số người muốn tìm phải từ 1 đến 20.", true);
      return;
    }

    if (payload.title.length > 120) {
      showFormMessage("Tiêu đề tối đa 120 ký tự.", true);
      return;
    }

    if (payload.description.length > 1000) {
      showFormMessage("Mô tả tối đa 1000 ký tự.", true);
      return;
    }

    const submitButton = $("submitBuddyBtn");
    if (submitButton) submitButton.disabled = true;

    showFormMessage(
      editingPostId ? "Đang cập nhật tin..." : "Đang đăng tin..."
    );

    let result;

    try {
      if (editingPostId) {
        result = await client
          .from(TABLE)
          .update(payload)
          .eq("id", editingPostId)
          .eq("user_id", currentUser.id)
          .select()
          .single();
      } else {
        result = await client
          .from(TABLE)
          .insert(payload)
          .select()
          .single();
      }
    } catch (error) {
      console.error("[Buddy] Exception khi lưu bài:", error);
      showFormMessage("Có lỗi bất ngờ khi lưu tin Buddy.", true);

      if (submitButton) submitButton.disabled = false;
      return;
    }

    if (result.error) {
      console.error("[Buddy] Supabase lưu bài thất bại:", result.error);
      showFormMessage(
        `Không thể lưu bài: ${result.error.message}`,
        true
      );

      if (submitButton) submitButton.disabled = false;
      return;
    }

    showFormMessage(
      editingPostId
        ? "Đã cập nhật tin Buddy!"
        : "Đăng tin Buddy thành công!"
    );

    resetForm();

    await loadPosts();

    const feedSection = $("feedSection");
    if (feedSection) {
      feedSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }
  }

  function startEdit(postId) {
    const post = allPosts.find((item) => item.id === postId);

    if (!post || post.user_id !== currentUser?.id) return;

    editingPostId = post.id;

    if ($("titleInput")) $("titleInput").value = post.title || "";
    if ($("destinationInput")) $("destinationInput").value = post.destination || "";
    if ($("tripDateInput")) $("tripDateInput").value = post.trip_date || "";
    if ($("tripTimeInput")) $("tripTimeInput").value = post.trip_time || "";
    if ($("guestCountInput")) $("guestCountInput").value = post.guest_count || 1;
    if ($("tripTypeInput")) $("tripTypeInput").value = post.trip_type || "";
    if ($("vibeInput")) $("vibeInput").value = post.vibe || "";
    if ($("descriptionInput")) $("descriptionInput").value = post.description || "";

    const submitButton = $("submitBuddyBtn");
    if (submitButton) {
      submitButton.innerHTML =
        `<i class="fa-solid fa-floppy-disk"></i> Lưu thay đổi`;
    }

    const cancelButton = $("cancelEditBtn");
    if (cancelButton) cancelButton.hidden = false;

    const publishSection = $("publishSection");
    if (publishSection) {
      publishSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }
  }

  async function deletePost(postId) {
    const post = allPosts.find((item) => item.id === postId);

    if (!post || post.user_id !== currentUser?.id) return;

    const confirmed = window.confirm(
      "Bạn có chắc muốn xóa tin Buddy này không?"
    );

    if (!confirmed) return;

    const { error } = await client
      .from(TABLE)
      .delete()
      .eq("id", postId)
      .eq("user_id", currentUser.id);

    if (error) {
      console.error("[Buddy] Supabase xóa bài thất bại:", error);
      window.alert(`Không thể xóa bài: ${error.message}`);
      return;
    }

    allPosts = allPosts.filter((postItem) => postItem.id !== postId);
    renderFeed();
  }

  function bindCardActions() {
    document.querySelectorAll(".report-buddy").forEach((button) => {
      button.addEventListener("click", () => {
        window.ReportSystem?.open({
          reportedUserId: button.dataset.userId || null,
          sourceType: "buddy",
          sourceId: button.dataset.id || null,
          sourceName: "Tin tìm bạn",
          triggerBtn: button
        });
      });
    });

    document.querySelectorAll(".edit-post").forEach((button) => {
      button.addEventListener("click", () => {
        startEdit(button.dataset.id);
      });
    });

    document.querySelectorAll(".delete-post").forEach((button) => {
      button.addEventListener("click", () => {
        deletePost(button.dataset.id);
      });
    });
  }

  function initNavigation() {
    const currentPage =
      window.location.pathname.split("/").pop() ||
      "buddy-dong-hanh.html";

    document.querySelectorAll(".navbar a").forEach((link) => {
      const href = link.getAttribute("href");
      if (!href || href === "#") return;

      const page = href.split("/").pop();

      if (page === currentPage) {
        link.classList.add("active");
      }
    });
  }

  function bindEvents() {
    $("findBuddyBtn")?.addEventListener("click", () => {
      const feedSection = $("feedSection") || $("buddyWorkspace");

      if (feedSection) {
        feedSection.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      }
    });

    $("buddyForm")?.addEventListener("submit", submitPost);

    $("cancelEditBtn")?.addEventListener("click", resetForm);

    $("searchInput")?.addEventListener("input", renderFeed);

    document.querySelectorAll(".filter-chip").forEach((button) => {
      button.addEventListener("click", () => {
        activeFilter = button.dataset.filter || "all";
        myPostsOnly = false;

        document.querySelectorAll(".filter-chip").forEach((item) => {
          item.classList.toggle("active", item === button);
        });

        $("myPostsBtn")?.classList.remove("active");

        renderFeed();
      });
    });

    $("myPostsBtn")?.addEventListener("click", () => {
      if (!currentUser) {
        window.location.href = "account.html";
        return;
      }

      myPostsOnly = !myPostsOnly;

      $("myPostsBtn")?.classList.toggle("active", myPostsOnly);

      if (myPostsOnly) {
        activeFilter = "all";

        document.querySelectorAll(".filter-chip").forEach((button) => {
          button.classList.toggle(
            "active",
            button.dataset.filter === "all"
          );
        });
      }

      renderFeed();
    });
  }

  async function init() {
    initNavigation();
    bindEvents();

    try {
      ensureClient();
      await loadCurrentAccount();
      await loadPosts();
    } catch (error) {
      console.error("[Buddy] Khởi tạo thất bại:", error);

      showFeedState(
        "error",
        "Không thể khởi tạo Buddy.",
        error?.message || String(error)
      );
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
