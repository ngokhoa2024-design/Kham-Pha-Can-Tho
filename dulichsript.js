const GUEST_USER_KEY = "travel_guest_user_id";
const ADMIN_MODE_KEY = "travel_admin_mode";
let currentUser = null;
let isAdmin = false;

async function initTravelPage() {
    try {
        const { data: { user }, error } = await supabaseClient.auth.getUser();
        if (error) {
            console.warn("Supabase auth error:", error);
        }

        if (user && user.id) {
            const { data: profile, error: profileError } = await supabaseClient
                .from("profiles")
                .select("name, role, avatar")
                .eq("id", user.id)
                .single();

            if (profileError) {
                console.warn("Supabase profile error:", profileError);
            }

            currentUser = {
                id: user.id,
                name: profile?.name || user.email?.split("@")[0] || "Người dùng",
                email: user.email,
                role: profile?.role || "member",
                avatar: profile?.avatar || ""
            };
            isAdmin = currentUser.role === "admin";
        }
    } catch (error) {
        console.warn("Supabase init error:", error);
    }

    if (!currentUser) {
        let guestId = localStorage.getItem(GUEST_USER_KEY);
        if (!guestId) {
            guestId = "guest-" + Date.now() + "-" + Math.random().toString(16).slice(2);
            localStorage.setItem(GUEST_USER_KEY, guestId);
        }
        currentUser = { id: guestId, name: "Ẩn danh", role: "guest" };
    }

    isAdmin = isAdmin || localStorage.getItem(ADMIN_MODE_KEY) === "true";
}

document.addEventListener("DOMContentLoaded", async function () {
    await initTravelPage();

    document.querySelectorAll(".card").forEach(async (card) => {
        const id = card.dataset.id;
        createRating(id);
        createCommentBox(card, id);
        await loadRating(id);
        await loadComments(id);
    });
});

function toggleAdmin() {
    if (!isAdmin) {
        const password = prompt("Nhập mật khẩu admin:");

        if (password === "123456") {
            localStorage.setItem(ADMIN_MODE_KEY, "true");
            alert("Đã bật chế độ Admin 👑");
        } else {
            alert("Sai mật khẩu!");
            return;
        }
    } else {
        localStorage.removeItem(ADMIN_MODE_KEY);
        alert("Đã tắt chế độ Admin");
    }

    location.reload();
}

function createRating(id) {
    const ratingDiv = document.getElementById("rating-" + id);
    ratingDiv.innerHTML = "";

    for (let i = 1; i <= 5; i++) {
        const star = document.createElement("span");
        star.innerHTML = "★";
        star.dataset.value = i;

        star.addEventListener("mouseover", () => highlightStars(id, i));
        star.addEventListener("mouseout", () => loadRating(id));
        star.addEventListener("click", () => toggleRating(id, i));

        ratingDiv.appendChild(star);
    }
}

function highlightStars(id, value) {
    const stars = document.querySelectorAll("#rating-" + id + " span");
    stars.forEach((star, index) => {
        star.classList.toggle("active", index < value);
    });
}

async function toggleRating(id, value) {
    const current = await getRating(id);

    if (current === value) {
        await deleteRating(id);
    } else {
        await saveRating(id, value);
    }

    await loadRating(id);
}

async function getRating(id) {
    try {
        const { data, error } = await supabaseClient
            .from("travel_ratings")
            .select("rating")
            .eq("location_id", String(id))
            .eq("user_id", currentUser.id)
            .single();

        if (error && error.code !== "PGRST116") {
            console.warn("Supabase getRating error:", error);
        }

        return data?.rating || 0;
    } catch (error) {
        console.warn("Supabase getRating exception:", error);
        return 0;
    }
}

async function saveRating(id, value) {
    try {
        const { data, error } = await supabaseClient
            .from("travel_ratings")
            .update({ rating: value })
            .eq("location_id", String(id))
            .eq("user_id", currentUser.id);

        if (error) {
            console.warn("Supabase updateRating error:", error);
        }

        if (!data || data.length === 0) {
            const { error: insertError } = await supabaseClient
                .from("travel_ratings")
                .insert({
                    location_id: String(id),
                    user_id: currentUser.id,
                    rating: value
                });
            if (insertError) {
                console.warn("Supabase insertRating error:", insertError);
            }
        }
    } catch (error) {
        console.warn("Supabase saveRating exception:", error);
    }
}

async function deleteRating(id) {
    try {
        const { error } = await supabaseClient
            .from("travel_ratings")
            .delete()
            .eq("location_id", String(id))
            .eq("user_id", currentUser.id);
        if (error) {
            console.warn("Supabase deleteRating error:", error);
        }
    } catch (error) {
        console.warn("Supabase deleteRating exception:", error);
    }
}

async function loadRating(id) {
    const value = await getRating(id);
    const stars = document.querySelectorAll("#rating-" + id + " span");
    stars.forEach((star, index) => {
        star.classList.toggle("active", index < value);
    });
}

function createCommentBox(card, id) {
    const box = card.querySelector(".comment-box");

    box.innerHTML = `
        <input type="text" id="name-${id}" placeholder="Tên của bạn (tuỳ chọn)">
        <textarea id="comment-${id}" placeholder="Chia sẻ trải nghiệm..."></textarea>
        <button onclick="addComment(${id})">Gửi</button>
        <div id="comment-list-${id}"></div>
    `;
}

async function addComment(id) {
    const name = document.getElementById("name-" + id).value || "Ẩn danh";
    const content = document.getElementById("comment-" + id).value;
    const rating = await getRating(id);

    if (content.trim() === "") return;

    try {
        const { data, error } = await supabaseClient
            .from("travel_comments")
            .insert([
                {
                    location_id: String(id),
                    user_id: currentUser.id,
                    user_name: name,
                    content: content.trim(),
                    rating: rating
                }
            ]);

        if (error) {
            console.error("Supabase addComment error:", error);
            return;
        }

        const comment = data?.[0];
        if (comment) {
            displayComment(id, {
                id: comment.id,
                user_name: comment.user_name,
                content: comment.content,
                rating: comment.rating,
                created_at: comment.created_at,
                user_id: comment.user_id
            });
        }

        document.getElementById("comment-" + id).value = "";
    } catch (error) {
        console.error("Supabase addComment exception:", error);
    }
}

async function loadComments(id) {
    try {
        const { data, error } = await supabaseClient
            .from("travel_comments")
            .select("id, user_id, user_name, content, rating, created_at")
            .eq("location_id", String(id))
            .order("created_at", { ascending: true });

        if (error) {
            console.error("Supabase loadComments error:", error);
            return;
        }

        const container = document.getElementById("comment-list-" + id);
        container.innerHTML = "";

        (data || []).forEach((comment) => displayComment(id, comment));
    } catch (error) {
        console.error("Supabase loadComments exception:", error);
    }
}

function displayComment(id, comment) {
    const container = document.getElementById("comment-list-" + id);

    const div = document.createElement("div");
    div.classList.add("comment-item");

    const createdAt = comment.created_at ? new Date(comment.created_at).toLocaleString("vi-VN") : "Không rõ thời gian";
    const stars = "⭐".repeat(Math.max(0, Number(comment.rating) || 0));

    const canDelete = isAdmin || comment.user_id === currentUser.id;

    div.innerHTML = `
        <p><strong>${escapeHtml(comment.user_name || "Ẩn danh")}</strong> - ${escapeHtml(createdAt)}</p>
        <p>${stars}</p>
        <p>${escapeHtml(comment.content)}</p>
    `;

    if (canDelete) {
        const removeButton = document.createElement("button");
        removeButton.textContent = "Xóa";
        removeButton.addEventListener("click", () => deleteComment(id, comment.id));
        div.appendChild(removeButton);
    }

    container.appendChild(div);
}

async function deleteComment(id, commentId) {
    try {
        const { data, error } = await supabaseClient
            .from("travel_comments")
            .select("user_id")
            .eq("id", commentId)
            .single();

        if (error && error.code !== "PGRST116") {
            console.error("Supabase deleteComment select error:", error);
            return;
        }

        const ownerId = data?.user_id;
        if (!isAdmin && ownerId !== currentUser.id) {
            alert("Bạn chỉ có thể xóa bình luận của chính mình hoặc khi là Admin.");
            return;
        }

        const { error: deleteError } = await supabaseClient
            .from("travel_comments")
            .delete()
            .eq("id", commentId);

        if (deleteError) {
            console.error("Supabase deleteComment error:", deleteError);
            return;
        }

        await loadComments(id);
    } catch (error) {
        console.error("Supabase deleteComment exception:", error);
    }
}

function escapeHtml(text) {
    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
