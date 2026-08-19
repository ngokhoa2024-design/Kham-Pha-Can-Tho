const SUPABASE_URL = "https://lkearyxyyblhivsbpgaq.supabase.co";
const SUPABASE_KEY = "sb_publishable_vfMZX2dCXTen-0S-9D7eTg_x1rLKAVW";
const JOURNALS_TABLE = "travel_journals";

const journalForm = document.getElementById("journalForm");
const mediaInput = document.getElementById("mediaInput");
const mediaPreview = document.getElementById("mediaPreview");
const journalMessage = document.getElementById("journalMessage");
const timelineFields = document.getElementById("timelineFields");
const addTimelineBtn = document.getElementById("addTimelineBtn");
const privacyPill = document.getElementById("privacyPill");
const privacyText = document.getElementById("privacyText");
const privacyActions = document.getElementById("privacyActions");
const journalListContent = document.getElementById("journalListContent");
const journalCounter = document.getElementById("journalCounter");
const journalSearch = document.getElementById("journalSearch");

let pendingMedia = [];
let supabaseReady = false;

function loadSupabaseLib() {
    return new Promise(function (resolve, reject) {
        if (window.supabase) return resolve();

        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
        script.onload = resolve;
        script.onerror = function () {
            reject(new Error("Không tải được thư viện Supabase."));
        };
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

function normalizeText(text) {
    return (text || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/[^a-z0-9\s]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function escapeHtml(text) {
    return String(text || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

async function getCurrentUser() {
    await ensureSupabaseReady();

    const { data: { user }, error } = await window.supabaseClient.auth.getUser();
    if (error || !user) return null;

    const { data: profile, error: profileError } = await window.supabaseClient
        .from("profiles")
        .select("name, avatar_url, status, role")
        .eq("id", user.id)
        .single();

    if (profileError && profileError.code !== "PGRST116") {
        console.warn("Không lấy được profile người dùng:", profileError);
    }

    return {
        id: user.id,
        email: user.email,
        name: profile?.name || user.email?.split("@")[0] || "Người dùng",
        avatar: profile?.avatar_url || "",
        status: profile?.status || "active",
        role: profile?.role || "member"
    };
}

async function getJournals() {
    const currentUser = await getCurrentUser();
    if (!currentUser) return [];

    const { data, error } = await window.supabaseClient
        .from(JOURNALS_TABLE)
        .select("*")
        .eq("user_id", currentUser.id)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Không lấy nhật kí du lịch:", error);
        return [];
    }

    return Array.isArray(data) ? data : [];
}

async function saveJournal(journal) {
    const currentUser = await getCurrentUser();
    if (!currentUser) return null;

    const { error } = await window.supabaseClient
        .from(JOURNALS_TABLE)
        .insert([{
            user_id: currentUser.id,
            title: journal.title,
            destination: journal.destination,
            summary: journal.summary,
            story: journal.story,
            start_date: journal.startDate,
            end_date: journal.endDate,
            mood: journal.mood,
            timeline: journal.timeline,
            media: journal.media,
            created_at: journal.createdAt
        }]);

    if (error) {
        console.error("Không lưu được nhật kí:", error);
        return null;
    }

    return true;
}

async function deleteJournal(journalId) {
    const currentUser = await getCurrentUser();
    if (!currentUser) return;

    const { error } = await window.supabaseClient
        .from(JOURNALS_TABLE)
        .delete()
        .eq("id", journalId)
        .eq("user_id", currentUser.id);

    if (error) {
        console.error("Không xóa được nhật kí:", error);
    }
}

function formatDate(dateValue) {
    if (!dateValue) return "Chưa chọn";
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return dateValue;
    return date.toLocaleDateString("vi-VN");
}

function readFileAsDataUrl(file) {
    return new Promise(function (resolve, reject) {
        const reader = new FileReader();
        reader.onload = function () { resolve(reader.result); };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function updatePrivacyState(currentUser) {
    if (!currentUser) {
        privacyPill.textContent = "Khách";
        privacyPill.className = "status-pill guest";
        privacyText.textContent = "Bạn cần đăng nhập để tạo và xem nhật kí du lịch riêng của mình.";
        privacyActions.innerHTML = '<a href="account.html" class="inline-link">Đăng nhập</a>';
        journalForm.querySelectorAll("input, textarea, button").forEach(function (element) {
            element.disabled = true;
        });
        return;
    }

    if (currentUser.status === "banned") {
        privacyPill.textContent = "Bị khóa";
        privacyPill.className = "status-pill guest";
        privacyText.textContent = "Tài khoản của bạn đang bị khóa nên tạm thời không thể tạo nhật kí mới.";
        privacyActions.innerHTML = '<a href="account.html" class="inline-link">Xem tài khoản</a>';
        journalForm.querySelectorAll("input, textarea, button").forEach(function (element) {
            element.disabled = true;
        });
        return;
    }

    privacyPill.textContent = "Riêng tư";
    privacyPill.className = "status-pill";
    privacyText.textContent = 'Nhật kí trong trang này chỉ tài khoản ' + currentUser.email + ' mới xem được trên trình duyệt hiện tại.';
    privacyActions.innerHTML = '<a href="account.html" class="inline-link">Quản lý tài khoản</a><span class="meta-text">Chủ sở hữu: ' + escapeHtml(currentUser.name) + '</span>';
    journalForm.querySelectorAll("input, textarea, button").forEach(function (element) {
        element.disabled = false;
    });
}

function addTimelineRow(data) {
    const wrapper = document.createElement("div");
    wrapper.className = "timeline-item-editor";
    wrapper.innerHTML = `
            <label>
                Khung giờ
                <input type="text" class="timeline-time" placeholder="Ví dụ: 06:30" value="${data && data.time ? escapeHtml(data.time) : ""}">
            </label>
            <label>
                Hoạt động / câu chuyện
                <input type="text" class="timeline-activity" placeholder="Ví dụ: Ăn sáng trên ghe và ngắm bình minh" value="${data && data.activity ? escapeHtml(data.activity) : ""}">
            </label>
            <button type="button" class="action-btn delete timeline-remove">Xóa chặng</button>
        `;
    timelineFields.appendChild(wrapper);
}

function collectTimeline() {
    return Array.from(timelineFields.querySelectorAll(".timeline-item-editor")).map(function (item) {
        return {
            time: item.querySelector(".timeline-time").value.trim(),
            activity: item.querySelector(".timeline-activity").value.trim()
        };
    }).filter(function (entry) {
        return entry.time || entry.activity;
    });
}

function renderMediaPreview() {
    mediaPreview.innerHTML = "";
    pendingMedia.forEach(function (item) {
        const wrapper = document.createElement("div");
        wrapper.className = "preview-item";
        wrapper.innerHTML = item.type === "image"
            ? '<img src="' + item.src + '" alt="' + escapeHtml(item.name) + '"><div class="preview-caption">' + escapeHtml(item.name) + '</div>'
            : '<video src="' + item.src + '" controls></video><div class="preview-caption">' + escapeHtml(item.name) + '</div>';
        mediaPreview.appendChild(wrapper);
    });
}

async function renderJournals() {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
        journalCounter.textContent = "0 hành trình";
        journalListContent.innerHTML = '<div class="empty-state">Đăng nhập để xem nhật kí du lịch riêng của bạn.</div>';
        return;
    }

    const query = normalizeText(journalSearch.value);
    const journals = (await getJournals()).slice().sort(function (a, b) {
        return new Date(b.created_at) - new Date(a.created_at);
    }).filter(function (journal) {
        const text = normalizeText(journal.title + ' ' + journal.destination + ' ' + journal.summary + ' ' + journal.story + ' ' + journal.mood);
        return query === "" || text.includes(query);
    });

    journalCounter.textContent = journals.length + ' hành trình';
    journalListContent.innerHTML = "";

    if (!journals.length) {
        journalListContent.innerHTML = '<div class="empty-state">Bạn chưa có nhật kí nào. Hãy tạo một hành trình đầu tiên.</div>';
        return;
    }

    journals.forEach(function (journal) {
        const card = document.createElement("article");
        card.className = "journal-card";
        card.dataset.journalId = journal.id;
        card.innerHTML = ''
            + '<div class="journal-head">'
            + '  <div>'
            + '      <h3>' + escapeHtml(journal.title) + '</h3>'
            + '      <p>' + escapeHtml(journal.destination) + '</p>'
            + '  </div>'
            + '  <div class="journal-meta">'
            + '      <span class="badge"><i class="fa-solid fa-calendar"></i> ' + escapeHtml(formatDate(journal.start_date)) + ' - ' + escapeHtml(formatDate(journal.end_date)) + '</span>'
            + (journal.mood ? '      <span class="badge"><i class="fa-solid fa-wand-magic-sparkles"></i> ' + escapeHtml(journal.mood) + '</span>' : '')
            + '  </div>'
            + '</div>'
            + '<p class="journal-story">' + escapeHtml(journal.summary) + '\n\n' + escapeHtml(journal.story || '') + '</p>'
            + (Array.isArray(journal.timeline) && journal.timeline.length ? '<div class="timeline-display">' + journal.timeline.map(function (entry) {
                return '<div class="timeline-entry"><strong>' + escapeHtml(entry.time || 'Khoảnh khắc') + '</strong><span>' + escapeHtml(entry.activity || 'Chưa thêm mô tả') + '</span></div>';
            }).join('') + '</div>' : '')
            + (Array.isArray(journal.media) && journal.media.length ? '<div class="media-grid">' + journal.media.map(function (item) {
                return item.type === 'image'
                    ? '<div class="media-item"><img src="' + escapeHtml(item.src) + '" alt="' + escapeHtml(item.name) + '"><div class="media-caption">' + escapeHtml(item.name) + '</div></div>'
                    : '<div class="media-item"><video src="' + escapeHtml(item.src) + '" controls></video><div class="media-caption">' + escapeHtml(item.name) + '</div></div>';
            }).join('') + '</div>' : '')
            + '<div class="journal-actions">'
            + '   <button type="button" class="action-btn" data-action="export-json">Xuất JSON</button>'
            + '   <button type="button" class="action-btn" data-action="export-html">Xuất HTML</button>'
            + '   <button type="button" class="action-btn delete" data-action="delete">Xóa nhật kí</button>'
            + '</div>';
        journalListContent.appendChild(card);
    });
}

document.addEventListener("DOMContentLoaded", async function () {
    await ensureSupabaseReady();
    const currentUser = await getCurrentUser();
    updatePrivacyState(currentUser);
    addTimelineRow();
    renderMediaPreview();
    renderJournals();

    journalForm.addEventListener("submit", async function (event) {
        event.preventDefault();
        journalMessage.classList.remove("error");
        journalMessage.textContent = "";

        const user = await getCurrentUser();
        if (!user) {
            journalMessage.textContent = "Bạn cần đăng nhập để tạo nhật kí.";
            journalMessage.classList.add("error");
            return;
        }

        if (user.status === "banned") {
            journalMessage.textContent = "Tài khoản của bạn đang bị khóa nên chưa thể tạo nhật kí mới.";
            journalMessage.classList.add("error");
            return;
        }

        const title = journalForm.title.value.trim();
        const destination = journalForm.destination.value.trim();
        const summary = journalForm.summary.value.trim();
        const story = journalForm.story.value.trim();
        const startDate = journalForm.startDate.value;
        const endDate = journalForm.endDate.value;
        const mood = journalForm.mood.value.trim();
        const timeline = collectTimeline();

        if (!title || !destination || !summary) {
            journalMessage.textContent = "Hãy điền ít nhất tên hành trình, điểm đến và mô tả ngắn.";
            journalMessage.classList.add("error");
            return;
        }

        const journal = {
            title: title,
            destination: destination,
            summary: summary,
            story: story,
            startDate: startDate,
            endDate: endDate,
            mood: mood,
            timeline: timeline,
            media: pendingMedia,
            createdAt: new Date().toISOString()
        };

        const saved = await saveJournal(journal);
        if (!saved) {
            journalMessage.textContent = "Không thể lưu nhật kí. Vui lòng thử lại.";
            journalMessage.classList.add("error");
            return;
        }

        journalForm.reset();
        timelineFields.innerHTML = "";
        addTimelineRow();
        pendingMedia = [];
        mediaInput.value = "";
        renderMediaPreview();
        journalMessage.textContent = "Đã lưu nhật kí du lịch của bạn.";
        await renderJournals();
    });

    journalListContent.addEventListener("click", async function (event) {
        const button = event.target.closest("button[data-action]");
        if (!button) return;
        const card = button.closest(".journal-card");
        const journalId = card ? card.dataset.journalId : null;
        if (!journalId) return;

        if (button.dataset.action === "delete") {
            await deleteJournal(journalId);
            await renderJournals();
            return;
        }

        const journals = await getJournals();
        const journal = journals.find(function (item) { return String(item.id) === String(journalId); });
        if (!journal) return;

        if (button.dataset.action === "export-json") {
            exportJournal(journal, "json");
            return;
        }

        if (button.dataset.action === "export-html") {
            exportJournal(journal, "html");
        }
    });

    journalSearch.addEventListener("input", function () {
        renderJournals();
    });
});
