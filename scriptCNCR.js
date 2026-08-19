const SUPABASE_URL = "https://lkearyxyyblhivsbpgaq.supabase.co";
const SUPABASE_KEY = "sb_publishable_vfMZX2dCXTen-0S-9D7eTg_x1rLKAVW";
const COMMENTS_TABLE = "cncr_comments";
const RATINGS_TABLE = "cncr_ratings";
const USER_PROFILE_TABLE = "profiles";
const GUEST_USER_KEY = "cncr_guest_user_id";

let currentUser = null;
let supabaseReady = false;

function loadSupabaseLib() {
    return new Promise((resolve, reject) => {
        if (window.supabase) return resolve();

        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
        script.onload = resolve;
        script.onerror = () => reject(new Error("Không tải được thư viện Supabase."));
        document.head.appendChild(script);
    });
}

async function ensureSupabaseReady() {
    if (supabaseReady) return;
    if (!window.supabase) {
        await loadSupabaseLib();
    }
    if (!window.supabaseClient) {
        window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    }
    supabaseReady = true;
}

function getGuestUserId() {
    let guestId = localStorage.getItem(GUEST_USER_KEY);
    if (!guestId) {
        guestId = "guest-" + Date.now() + "-" + Math.random().toString(16).slice(2);
        localStorage.setItem(GUEST_USER_KEY, guestId);
    }
    return guestId;
}

function getInitials(name) {
    const parts = (name || "").trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return "U";
    return parts.slice(0, 2).map((part) => part.charAt(0).toUpperCase()).join("");
}

function escapeHtml(text) {
    return String(text || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function isSupabaseMissingTableError(error) {
    if (!error) return false;
    const message = error.message || String(error);
    return error.code === "PGRST205" || error.code === "42P01" || /Could not find the table/i.test(message) || /does not exist/i.test(message) || /schema cache/i.test(message);
}

function getLocalStorageValue(key, fallback) {
    try {
        const raw = localStorage.getItem(key);
        return raw === null ? fallback : JSON.parse(raw);
    } catch (error) {
        return fallback;
    }
}

function setLocalStorageValue(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        return false;
    }
}

function getLocalRatingKey(id) {
    return "cncr_rating_" + String(id);
}

function getLocalCommentKey(id) {
    return "cncr_comments_" + String(id);
}

function getLocalRating(id) {
    const value = Number(getLocalStorageValue(getLocalRatingKey(id), 0));
    return Number.isFinite(value) ? Math.min(5, Math.max(0, value)) : 0;
}

function saveLocalRating(id, value) {
    const safeValue = Math.min(5, Math.max(0, Number(value) || 0));
    setLocalStorageValue(getLocalRatingKey(id), safeValue);
}

function clearLocalRating(id) {
    localStorage.removeItem(getLocalRatingKey(id));
}

function getLocalComments(id) {
    const comments = getLocalStorageValue(getLocalCommentKey(id), []);
    return Array.isArray(comments) ? comments : [];
}

function saveLocalComments(id, comments) {
    setLocalStorageValue(getLocalCommentKey(id), Array.isArray(comments) ? comments : []);
}

function renderAvatarHtml(comment) {
    const avatar = comment.avatar_url || comment.avatar || "";
    if (avatar) {
        return `<span class="comment-avatar"><img src="${escapeHtml(avatar)}" alt="${escapeHtml(comment.user_name || "Ảnh người dùng")}"></span>`;
    }
    const name = comment.user_name || "Ẩn danh";
    return `<span class="comment-avatar fallback">${escapeHtml(getInitials(name))}</span>`;
}

async function getCurrentUser() {
    await ensureSupabaseReady();

    if (!window.supabaseClient || !window.supabaseClient.auth) {
        return { id: getGuestUserId(), role: "guest", name: "Ẩn danh", avatar: "", status: "active" };
    }

    const { data: { user }, error } = await window.supabaseClient.auth.getUser();
    if (error || !user) {
        return { id: getGuestUserId(), role: "guest", name: "Ẩn danh", avatar: "", status: "active" };
    }

    const { data: profile, error: profileError } = await window.supabaseClient
        .from(USER_PROFILE_TABLE)
        .select("name, avatar_url, role, status")
        .eq("id", user.id)
        .single();

    if (profileError && profileError.code !== "PGRST116") {
        console.warn("Không lấy được profile người dùng:", profileError);
    }

    return {
        id: user.id,
        email: user.email,
        name: profile?.name || user.email?.split("@")[0] || "Ẩn danh",
        avatar: profile?.avatar_url || "",
        role: profile?.role || "member",
        status: profile?.status || "active"
    };
}

function isAdminUser() {
    return currentUser && currentUser.role === "admin" && currentUser.status !== "banned";
}

function getCommentSectionById(id) {
    if (!id && id !== 0) return null;
    const safeId = String(id);
    return document.querySelector(`.comment-section[data-id="${CSS.escape(safeId)}"]`) ||
        document.querySelector(`.card.comment-section[data-id="${CSS.escape(safeId)}"]`) ||
        document.querySelector(`#danh-gia[data-id="${CSS.escape(safeId)}"]`);
}

async function getRating(id) {
    const localValue = getLocalRating(id);

    if (!window.supabaseClient || !window.supabaseClient.from) {
        return localValue;
    }

    try {
        const { data, error } = await window.supabaseClient
            .from(RATINGS_TABLE)
            .select("rating")
            .eq("location_id", String(id))
            .eq("user_id", currentUser.id)
            .single();

        if (error && error.code !== "PGRST116") {
            if (isSupabaseMissingTableError(error)) return localValue;
            console.warn("Không lấy được xếp hạng:", error);
        }

        return Number(data?.rating) || localValue;
    } catch (error) {
        if (isSupabaseMissingTableError(error)) return localValue;
        console.warn("Không lấy được xếp hạng:", error);
        return localValue;
    }
}

async function saveRating(id, value) {
    const safeValue = Math.min(5, Math.max(0, Number(value) || 0));
    saveLocalRating(id, safeValue);

    if (!window.supabaseClient || !window.supabaseClient.from) return;

    try {
        const { data, error } = await window.supabaseClient
            .from(RATINGS_TABLE)
            .select("id")
            .eq("location_id", String(id))
            .eq("user_id", currentUser.id)
            .single();

        if (error && error.code !== "PGRST116") {
            if (isSupabaseMissingTableError(error)) return;
            console.warn("Không kiểm tra xếp hạng hiện tại:", error);
            return;
        }

        if (data && data.id) {
            const { error: updateError } = await window.supabaseClient
                .from(RATINGS_TABLE)
                .update({ rating: safeValue })
                .eq("id", data.id);

            if (updateError) {
                if (isSupabaseMissingTableError(updateError)) return;
                console.warn("Không cập nhật xếp hạng:", updateError);
            }
            return;
        }

        const { error: insertError } = await window.supabaseClient
            .from(RATINGS_TABLE)
            .insert([{ location_id: String(id), user_id: currentUser.id, rating: safeValue }]);

        if (insertError) {
            if (isSupabaseMissingTableError(insertError)) return;
            console.warn("Không lưu xếp hạng:", insertError);
        }
    } catch (error) {
        if (isSupabaseMissingTableError(error)) return;
        console.warn("Không lưu xếp hạng:", error);
    }
}

async function deleteRating(id) {
    clearLocalRating(id);

    if (!window.supabaseClient || !window.supabaseClient.from) return;

    try {
        const { error } = await window.supabaseClient
            .from(RATINGS_TABLE)
            .delete()
            .eq("location_id", String(id))
            .eq("user_id", currentUser.id);

        if (error) {
            if (isSupabaseMissingTableError(error)) return;
            console.warn("Không xóa xếp hạng:", error);
        }
    } catch (error) {
        if (isSupabaseMissingTableError(error)) return;
        console.warn("Không xóa xếp hạng:", error);
    }
}

async function loadRating(id) {
    const value = await getRating(id);
    const section = getCommentSectionById(id);
    if (!section) return;

    const stars = section.querySelectorAll(".rating span");
    stars.forEach((star, index) => {
        star.classList.toggle("active", index < value);
    });
}

function createRating(section, id) {
    let ratingContainer = section.querySelector(".rating");
    if (!ratingContainer) {
        ratingContainer = document.createElement("div");
        ratingContainer.className = "rating";
        ratingContainer.id = "rating-" + id;
        section.appendChild(ratingContainer);
    }

    ratingContainer.innerHTML = "";

    for (let i = 1; i <= 5; i++) {
        const star = document.createElement("span");
        star.textContent = "★";
        star.dataset.value = i;
        star.setAttribute("role", "button");
        star.setAttribute("tabindex", "0");
        star.setAttribute("aria-label", `${i} sao`);
        star.style.pointerEvents = "auto";

        star.onclick = async function () {
            await toggleRating(id, i);
            await loadRating(id);
        };

        star.onkeydown = async function (event) {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                await toggleRating(id, i);
                await loadRating(id);
            }
        };

        ratingContainer.appendChild(star);
    }
}

function createCommentBox(card, id) {
    let box = card.querySelector(".comment-box");
    if (!box) {
        box = document.createElement("div");
        box.className = "comment-box";
        card.appendChild(box);
    }

    const isBanned = currentUser && currentUser.status === "banned";
    const readonly = currentUser && currentUser.role !== "guest" ? "readonly" : "";

    box.innerHTML = `
        <input type="text" id="name-${id}" placeholder="Tên của bạn" value="${escapeHtml(currentUser && currentUser.role !== "guest" ? currentUser.name : "")}" ${readonly}>
        <textarea id="comment-${id}" placeholder="Chia sẻ trải nghiệm..." ${isBanned ? "disabled" : ""}></textarea>
        <button type="button" id="submit-comment-${id}" ${isBanned ? "disabled" : ""}>Gửi</button>
        <div id="list-${id}"></div>
    `;

    const submitButton = card.querySelector("#submit-comment-" + id);
    if (submitButton) {
        submitButton.addEventListener("click", function () {
            addComment(id);
        });
    }
}

async function toggleRating(id, value) {
    const currentValue = await getRating(id);
    if (currentValue === value) {
        await deleteRating(id);
    } else {
        await saveRating(id, value);
    }
    await loadRating(id);
}

async function addComment(id) {
    if (currentUser && currentUser.status === "banned") return;

    const nameInput = document.getElementById("name-" + id);
    const contentInput = document.getElementById("comment-" + id);
    const name = (currentUser && currentUser.role !== "guest") ? currentUser.name : (nameInput ? nameInput.value.trim() : "");
    const content = contentInput ? contentInput.value.trim() : "";
    const rating = await getRating(id);

    if (!content) return;

    const newComment = {
        id: "local-" + Date.now() + "-" + Math.random().toString(16).slice(2),
        location_id: String(id),
        user_id: currentUser.id,
        user_name: name || "Ẩn danh",
        avatar_url: currentUser.avatar || "",
        content: content,
        rating: rating,
        created_at: new Date().toISOString()
    };

    if (!window.supabaseClient || !window.supabaseClient.from) {
        const comments = getLocalComments(id);
        comments.push(newComment);
        saveLocalComments(id, comments);
        await loadComments(id);
        if (contentInput) contentInput.value = "";
        return;
    }

    const { error } = await window.supabaseClient.from(COMMENTS_TABLE).insert([{
        location_id: String(id),
        user_id: currentUser.id,
        user_name: name || "Ẩn danh",
        avatar_url: currentUser.avatar || "",
        content: content,
        rating: rating,
        created_at: new Date().toISOString()
    }]);

    if (error) {
        if (isSupabaseMissingTableError(error)) {
            const comments = getLocalComments(id);
            comments.push(newComment);
            saveLocalComments(id, comments);
            await loadComments(id);
            if (contentInput) contentInput.value = "";
            return;
        }
        console.error("Không thêm bình luận:", error);
        return;
    }

    await loadComments(id);
    if (contentInput) contentInput.value = "";
}

async function loadComments(id) {
    const localComments = getLocalComments(id);
    const container = document.getElementById("list-" + id);
    if (!container) return;

    if (!window.supabaseClient || !window.supabaseClient.from) {
        container.innerHTML = "";
        localComments.forEach((comment) => displayComment(id, comment));
        return;
    }

    try {
        const { data, error } = await window.supabaseClient
            .from(COMMENTS_TABLE)
            .select("id, user_id, user_name, avatar_url, content, rating, created_at")
            .eq("location_id", String(id))
            .order("created_at", { ascending: true });

        if (error) {
            if (isSupabaseMissingTableError(error)) {
                container.innerHTML = "";
                localComments.forEach((comment) => displayComment(id, comment));
                return;
            }
            console.error("Không tải được bình luận:", error);
            return;
        }

        container.innerHTML = "";
        const mergedComments = [...(data || []), ...localComments.filter((localComment) => !(data || []).some((remoteComment) => remoteComment.id === localComment.id))];
        mergedComments.forEach((comment) => displayComment(id, comment));
    } catch (error) {
        if (isSupabaseMissingTableError(error)) {
            container.innerHTML = "";
            localComments.forEach((comment) => displayComment(id, comment));
            return;
        }
        console.error("Không tải được bình luận:", error);
    }
}

function displayComment(id, comment) {
    const container = document.getElementById("list-" + id);
    if (!container) return;

    const div = document.createElement("div");
    div.classList.add("comment-item");
    div.dataset.commentId = comment.id || "";

    const createdAt = comment.created_at ? new Date(comment.created_at).toLocaleString("vi-VN") : "Không rõ thời gian";
    const stars = "⭐".repeat(Math.max(0, Number(comment.rating) || 0));
    const canDelete = isAdminUser() || (currentUser && comment.user_id === currentUser.id);

    div.innerHTML = `
        <div class="comment-head">
            <div class="comment-author">
                ${renderAvatarHtml(comment)}
                <strong>${escapeHtml(comment.user_name || "Ẩn danh")}</strong>
            </div>
            <small>${escapeHtml(createdAt)}</small>
        </div>
        <div class="comment-rating">${stars || "Chưa đánh giá"}</div>
        <p>${escapeHtml(comment.content)}</p>
    `;

    if (canDelete) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "delete-btn";
        button.textContent = "Xóa";
        button.addEventListener("click", function () {
            deleteComment(id, comment.id);
        });
        div.appendChild(button);
    }

    container.appendChild(div);
}

async function deleteComment(id, commentId) {
    if (!window.supabaseClient || !window.supabaseClient.from) {
        const comments = getLocalComments(id).filter((comment) => String(comment.id) !== String(commentId));
        saveLocalComments(id, comments);
        await loadComments(id);
        return;
    }

    const { data, error } = await window.supabaseClient
        .from(COMMENTS_TABLE)
        .select("user_id")
        .eq("id", commentId)
        .single();

    if (error && error.code !== "PGRST116") {
        console.error("Không kiểm tra được bình luận:", error);
        return;
    }

    const ownerId = data?.user_id;
    if (!isAdminUser() && ownerId !== currentUser.id) {
        alert("Bạn chỉ có thể xóa bình luận của chính mình hoặc khi là Admin.");
        return;
    }

    const { error: deleteError } = await window.supabaseClient
        .from(COMMENTS_TABLE)
        .delete()
        .eq("id", commentId);

    if (deleteError) {
        console.error("Không xóa được bình luận:", deleteError);
        return;
    }

    await loadComments(id);
}

function initCommentSections() {
    const sections = document.querySelectorAll(".comment-section, .card.comment-section");

    sections.forEach((section) => {
        const id = section.dataset.id;
        if (!id) return;

        if (!section.querySelector(".rating")) {
            const ratingWrap = document.createElement("div");
            ratingWrap.className = "rating";
            ratingWrap.id = "rating-" + id;
            section.appendChild(ratingWrap);
        }

        if (!section.querySelector(".comment-box")) {
            const commentBox = document.createElement("div");
            commentBox.className = "comment-box";
            section.appendChild(commentBox);
        }

        createRating(section, id);
        createCommentBox(section, id);
        loadRating(id);
        loadComments(id);
    });
}

document.addEventListener("DOMContentLoaded", async function () {
    try {
        currentUser = {
            id: getGuestUserId(),
            role: "guest",
            name: "Ẩn danh",
            avatar: "",
            status: "active"
        };

        await ensureSupabaseReady();
        currentUser = await getCurrentUser();
        initCommentSections();
    } catch (error) {
        console.error("Lỗi khởi tạo hệ thống đánh giá:", error);
    }
});
