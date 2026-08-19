document.addEventListener("DOMContentLoaded", async function () {
    const MAX_TOTAL_FILE_SIZE = 2 * 1024 * 1024;
    const WARNING_SCORE_LIMIT = 4;
    const BANNED_TERMS = [
        { label: "đồ ngu", severity: 1, category: "công kích", variants: ["đồ ngu", "do ngu"] },
        { label: "cút đi", severity: 1, category: "công kích", variants: ["cút đi", "cut di"] },
        { label: "ngu như chó", severity: 2, category: "công kích", variants: ["ngu như chó", "ngu nhu cho"] },
        { label: "óc chó", severity: 2, category: "công kích", variants: ["óc chó", "oc cho"] },
        { label: "địt mẹ", severity: 3, category: "chửi thề nặng", variants: ["địt mẹ", "dit me"] },
        { label: "đụ má", severity: 3, category: "chửi thề nặng", variants: ["đụ má", "đu má", "du ma"] },
        { label: "cặc", severity: 2, category: "tục tĩu", variants: ["cặc", "cac"] },
        { label: "lồn", severity: 2, category: "tục tĩu", variants: ["lồn", "lon"] },
        { label: "bọn mọi", severity: 4, category: "phân biệt vùng miền", variants: ["bọn mọi", "bon moi"] },
        { label: "đồ bắc kỳ", severity: 4, category: "phân biệt vùng miền", variants: ["đồ bắc kỳ", "do bac ky"] },
        { label: "đồ nam kỳ", severity: 4, category: "phân biệt vùng miền", variants: ["đồ nam kỳ", "do nam ky"] }
    ];
    const ADMIN_EMAILS = ["thiennn0412@gmail.com"];
    const ADMIN_NAMES = ["pham vo nhat thien", "nhat thien"];
    const links = document.querySelectorAll(".navbar a");
    let currentPage = window.location.pathname.split("/").pop();
    if (currentPage === "") currentPage = "forum.html";

    links.forEach(function (link) {
        const href = link.getAttribute("href");
        if (!href || href === "#") return;
        const linkPage = href.split("/").pop();
        if (linkPage === currentPage) link.classList.add("active");
    });

    const postForm = document.getElementById("postForm");
    const mediaInput = document.getElementById("mediaInput");
    const mediaPreview = document.getElementById("mediaPreview");
    const postMessage = document.getElementById("postMessage");
    const postList = document.getElementById("postList");
    const topicFilter = document.getElementById("topicFilter");
    const searchInput = document.getElementById("searchInput");
    const postCounter = document.getElementById("postCounter");
    const statusPill = document.getElementById("statusPill");
    const statusText = document.getElementById("statusText");
    const statusActions = document.getElementById("statusActions");
    const bannedWordList = document.getElementById("bannedWordList");

    let pendingMedia = [];
    let currentUser = null; // Trạng thái user hiện tại

    // reaction: { postId -> { like: number, heart: number, userReaction: 'like'|'heart'|null } }
    let reactionsMap = {};
    // Set of postIds currently being processed (anti double-click)
    const reactionLocks = new Set();

    // --- UTILS ---
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
        return String(text)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/\"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function isAdminIdentity(name, email) {
        const normalizedName = normalizeText(name);
        const normalizedEmail = (email || "").trim().toLowerCase();
        return ADMIN_EMAILS.includes(normalizedEmail) || ADMIN_NAMES.includes(normalizedName);
    }

    function getInitials(name) {
        const parts = (name || "").trim().split(/\s+/).filter(Boolean);
        if (!parts.length) return "U";
        return parts.slice(0, 2).map(function (part) {
            return part.charAt(0).toUpperCase();
        }).join("");
    }

    function renderAvatarHtml(user, extraClass) {
        const className = "avatar-badge" + (extraClass ? " " + extraClass : "");
        if (user && user.avatar) {
            return '<span class="' + className + '"><img src="' + user.avatar + '" alt="' + escapeHtml(user.name || "Avatar") + '"></span>';
        }
        return '<span class="' + className + ' fallback">' + escapeHtml(getInitials(user && user.name)) + '</span>';
    }

    // Ghép Title (danh hiệu) đang active của user vào sau tên, dùng chung cho
    // post/comment. Không tạo hệ thống Title mới — chỉ đọc profiles.active_title
    // đã được preload kèm theo query bài viết/bình luận (tránh N+1 query).
    function formatUserTitleBadgeHtml(title) {
        if (!title || !title.name) return "";
        const icon = title.icon ? escapeHtml(title.icon) + " " : "";
        const isValidColor = /^#[0-9a-fA-F]{3,8}$/.test(title.color || "");
        const styleAttr = isValidColor ? ' style="color:' + title.color + '"' : "";
        return '<span class="user-title-badge"' + styleAttr + '>- ' + icon + escapeHtml(title.name) + '</span>';
    }

    function formatDate(dateValue) {
        const date = new Date(dateValue);
        if (Number.isNaN(date.getTime())) return "Không rõ thời gian";
        return date.toLocaleString("vi-VN", {
            day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit"
        });
    }

    function readFileAsDataUrl(file) {
        return new Promise(function (resolve, reject) {
            const reader = new FileReader();
            reader.onload = function () { resolve(reader.result); };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    function hasPhraseBoundaryMatch(text, phrase) {
        return (" " + text + " ").includes(" " + phrase + " ");
    }

    function detectBannedWord(text) {
        const normalized = normalizeText(text);
        const matchedTerm = BANNED_TERMS.find(function (term) {
            return term.variants.some(function (variant) {
                return hasPhraseBoundaryMatch(normalized, normalizeText(variant));
            });
        });
        return matchedTerm || null;
    }

    function isUserBanned(user) {
        return user && user.status === "banned";
    }

    function isAdmin(user) {
        return user && user.role === "admin";
    }

    // --- SUPABASE DATA FETCHING ---
    async function fetchCurrentUser() {
        const { data: { user }, error } = await supabaseClient.auth.getUser();
        if (error || !user) return null;

        const { data: profile } = await supabaseClient
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

        let role = profile?.role || "member";
        if (isAdminIdentity(profile?.name, user.email)) {
            role = "admin";
            // Tự động cập nhật role admin nếu cấu hình cứng khớp
            if (profile?.role !== "admin") {
                await supabaseClient.from("profiles").update({ role: "admin" }).eq("id", user.id);
            }
        }

        return {
            id: user.id,
            name: profile?.name || user.email?.split("@")[0] || "Người dùng",
            email: user.email,
            status: profile?.status || "active",
            role: role,
            avatar: profile?.avatar_url || "",
            banReason: profile?.ban_reason || "",
            warningCount: Number(profile?.warning_count) || 0,
            violationScore: Number(profile?.violation_score) || 0
        };
    }

    async function getPosts() {
    const { data, error } = await supabaseClient
        .from("posts")
        .select(`
            *,
            profiles (
                id,
                name,
                facebook,
                avatar_url,
                role,
                active_title_id,
                active_title:active_title_id ( id, name, slug, icon, color )
            ),
            comments (
                id,
                user_id,
                content,
                created_at,
                profiles (
                    id,
                    name,
                    avatar_url,
                    role,
                    active_title_id,
                    active_title:active_title_id ( id, name, slug, icon, color )
                )
            )
        `)
        .order("created_at", {
            ascending: false
        });

    if (error) {
        console.error("Lỗi tải bài viết:", error);
        return [];
    }

    return (data || []).map(function (post) {
        return {
            id: String(post.id),
            userId: post.user_id,
            topic: post.topic || "Câu chuyện cá nhân",
            title: post.title || "",
            content: post.content || "",

            authorName: post.profiles?.name || "Người dùng",
            authorEmail: post.profiles?.email || "",
            authorAvatar: post.profiles?.avatar_url || "",
            authorTitle: post.profiles?.active_title || null,

            createdAt: post.created_at,
            pinned: post.pinned || false,
            media: post.media || [],

            comments: (post.comments || [])
                .map(function (comment) {
                    return {
                        id: String(comment.id),
                        userId: comment.user_id,
                        authorName: comment.profiles?.name || "Người dùng",
                        authorEmail: comment.profiles?.email || "",
                        authorAvatar: comment.profiles?.avatar_url || "",
                        authorTitle: comment.profiles?.active_title || null,
                        content: comment.content || "",
                        createdAt: comment.created_at
                    };
                })
                .sort(function (a, b) {
                    return new Date(a.createdAt) - new Date(b.createdAt);
                })
        };
    });
}

    // --- REACTIONS ---
    async function fetchReactions(postIds) {
        if (!postIds || !postIds.length) return;

        // Lấy tổng số reaction theo từng post
        const { data: counts, error: cntErr } = await supabaseClient
            .from("post_reactions")
            .select("post_id, reaction_type")
            .in("post_id", postIds);

        if (cntErr) {
            console.error("Lỗi tải reactions:", cntErr);
            return;
        }

        // Reset map
        postIds.forEach(function (id) {
            reactionsMap[id] = { like: 0, heart: 0, userReaction: null };
        });

        (counts || []).forEach(function (row) {
            const pid = String(row.post_id);
            if (!reactionsMap[pid]) reactionsMap[pid] = { like: 0, heart: 0, userReaction: null };
            if (row.reaction_type === "like") reactionsMap[pid].like++;
            if (row.reaction_type === "heart") reactionsMap[pid].heart++;
        });

        // Nếu đã đăng nhập → lấy reaction của user hiện tại
        if (currentUser) {
            const { data: mine } = await supabaseClient
                .from("post_reactions")
                .select("post_id, reaction_type")
                .eq("user_id", currentUser.id)
                .in("post_id", postIds);

            (mine || []).forEach(function (row) {
                const pid = String(row.post_id);
                if (reactionsMap[pid]) reactionsMap[pid].userReaction = row.reaction_type;
            });
        }
    }

    function createReactionHtml(postId) {
        const r = reactionsMap[postId] || { like: 0, heart: 0, userReaction: null };
        const likeActive  = r.userReaction === "like";
        const heartActive = r.userReaction === "heart";

        const likeLabel  = r.like  > 0 ? r.like  + " Thích" : "Thích";
        const heartLabel = r.heart > 0 ? r.heart + " Tim"   : "Tim";

        return '<div class="post-reactions">'
            + '<div class="reaction-summary">'
            + (r.heart > 0 ? '<span class="rs-heart">&#x2764;&#xFE0F; ' + r.heart + '</span>' : '')
            + (r.like  > 0 ? '<span class="rs-like">&#x1F44D; '  + r.like  + '</span>' : '')
            + '</div>'
            + '<div class="post-divider reaction-divider"></div>'
            + '<div class="reaction-actions">'
            + '<button type="button" class="reaction-btn like-btn' + (likeActive ? ' active-like' : '') + '" data-action="like-post" data-post-id="' + postId + '" aria-label="Thích bài viết">'
            + '<span class="reaction-icon">&#x1F44D;</span> ' + likeLabel
            + '</button>'
            + '<button type="button" class="reaction-btn heart-btn' + (heartActive ? ' active-heart' : '') + '" data-action="heart-post" data-post-id="' + postId + '" aria-label="Tim bài viết">'
            + '<span class="reaction-icon">&#x2764;&#xFE0F;</span> ' + heartLabel
            + '</button>'
            + '<button type="button" class="reaction-btn comment-jump-btn" data-action="jump-comment" data-post-id="' + postId + '" aria-label="Bình luận">'
            + '<span class="reaction-icon">&#x1F4AC;</span> Bình luận'
            + '</button>'
            + '</div>'
            + '</div>';
    }

    async function handleReaction(postId, reactionType) {
        // Chống double-click
        if (reactionLocks.has(postId)) return;
        reactionLocks.add(postId);

        // Disable các nút reaction của post này
        const card = postList.querySelector('[data-post-id="' + postId + '"]');
        const reactionBtns = card ? card.querySelectorAll('.reaction-btn') : [];
        reactionBtns.forEach(function (btn) { btn.disabled = true; });

        try {
            if (!currentUser) {
                showReactionToast("Bạn cần đăng nhập để tương tác với bài viết.");
                return;
            }

            const current = reactionsMap[postId] || { like: 0, heart: 0, userReaction: null };
            const prevReaction = current.userReaction;

            if (prevReaction === reactionType) {
                // Bấm lại cùng reaction → xóa (toggle off)
                const { error } = await supabaseClient
                    .from("post_reactions")
                    .delete()
                    .eq("post_id", postId)
                    .eq("user_id", currentUser.id);

                if (!error) {
                    current[reactionType]--;
                    current.userReaction = null;
                }
            } else if (prevReaction === null) {
                // Chưa có reaction → INSERT mới
                const { error } = await supabaseClient
                    .from("post_reactions")
                    .insert({ post_id: postId, user_id: currentUser.id, reaction_type: reactionType });

                if (!error) {
                    current[reactionType]++;
                    current.userReaction = reactionType;
                }
            } else {
                // Đang có reaction khác → UPDATE
                const { error } = await supabaseClient
                    .from("post_reactions")
                    .update({ reaction_type: reactionType })
                    .eq("post_id", postId)
                    .eq("user_id", currentUser.id);

                if (!error) {
                    current[prevReaction]--;
                    current[reactionType]++;
                    current.userReaction = reactionType;
                }
            }

            reactionsMap[postId] = current;

            // Cập nhật UI không cần reload trang
            updateReactionUi(card, postId);

        } catch (err) {
            console.error("Lỗi reaction:", err);
        } finally {
            reactionLocks.delete(postId);
            reactionBtns.forEach(function (btn) { btn.disabled = false; });
        }
    }

    function updateReactionUi(card, postId) {
        if (!card) return;
        const r = reactionsMap[postId] || { like: 0, heart: 0, userReaction: null };

        // Cập nhật summary
        const summaryEl = card.querySelector('.reaction-summary');
        if (summaryEl) {
            summaryEl.innerHTML =
                (r.heart > 0 ? '<span class="rs-heart">&#x2764;&#xFE0F; ' + r.heart + '</span>' : '') +
                (r.like  > 0 ? '<span class="rs-like">&#x1F44D; '  + r.like  + '</span>' : '');
        }

        // Cập nhật like button
        const likeBtn = card.querySelector('.like-btn');
        if (likeBtn) {
            const likeActive = r.userReaction === "like";
            likeBtn.className = 'reaction-btn like-btn' + (likeActive ? ' active-like' : '');
            likeBtn.innerHTML = '<span class="reaction-icon">&#x1F44D;</span> ' + (r.like > 0 ? r.like + ' Thích' : 'Thích');
        }

        // Cập nhật heart button
        const heartBtn = card.querySelector('.heart-btn');
        if (heartBtn) {
            const heartActive = r.userReaction === "heart";
            heartBtn.className = 'reaction-btn heart-btn' + (heartActive ? ' active-heart' : '');
            heartBtn.innerHTML = '<span class="reaction-icon">&#x2764;&#xFE0F;</span> ' + (r.heart > 0 ? r.heart + ' Tim' : 'Tim');
        }

        // Animation nhẹ
        const activeBtn = r.userReaction === "like" ? likeBtn : (r.userReaction === "heart" ? heartBtn : null);
        if (activeBtn) {
            activeBtn.classList.add('reaction-pop');
            setTimeout(function () { activeBtn.classList.remove('reaction-pop'); }, 350);
        }
    }

    function showReactionToast(message) {
        let toast = document.getElementById('reactionToast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'reactionToast';
            toast.className = 'reaction-toast';
            document.body.appendChild(toast);
        }
        toast.textContent = message;
        toast.classList.add('visible');
        clearTimeout(toast._timer);
        toast._timer = setTimeout(function () { toast.classList.remove('visible'); }, 3000);
    }

    // --- MODERATION ---
    async function banUser(userId, violation, sourceLabel) {
        if (!userId) return null;
        
        // Fetch current profile to get current scores
        const { data: targetProfile } = await supabaseClient
            .from("profiles")
            .select("warning_count, violation_score")
            .eq("id", userId)
            .single();

        const currentWarnings = Number(targetProfile?.warning_count) || 0;
        const currentScore = Number(targetProfile?.violation_score) || 0;

        const nextWarningCount = currentWarnings + 1;
        const nextViolationScore = currentScore + (violation?.severity || 0);
        const violationLabel = violation?.label || "nội dung vi phạm";
        const violationCategory = violation?.category || "vi phạm";
        const banReason = 'Tài khoản bị khóa do phát hiện "' + violationLabel + '" (' + violationCategory + ') trong ' + sourceLabel + '.';

        await supabaseClient.from("profiles").update({
            status: "banned",
            ban_reason: banReason,
            banned_at: new Date().toISOString(),
            warning_count: nextWarningCount,
            violation_score: nextViolationScore,
            last_violation_label: violationLabel,
            last_violation_at: new Date().toISOString()
        }).eq("id", userId);

        if (currentUser && currentUser.id === userId) {
            currentUser = await fetchCurrentUser();
            updateAccountState();
        }

        return banReason;
    }

    async function registerViolation(userId, violation) {
        if (!userId || !violation) return null;

        const { data: targetProfile } = await supabaseClient
            .from("profiles")
            .select("warning_count, violation_score")
            .eq("id", userId)
            .single();

        const nextWarningCount = (Number(targetProfile?.warning_count) || 0) + 1;
        const nextViolationScore = (Number(targetProfile?.violation_score) || 0) + violation.severity;

        // Tự động khóa tài khoản nếu vượt quá giới hạn điểm vi phạm
        if (nextViolationScore >= WARNING_SCORE_LIMIT) {
            await supabaseClient
                .from("profiles")
                .update({
                    status: "banned",
                    ban_reason: "Tài khoản vượt quá giới hạn điểm vi phạm.",
                    banned_at: new Date().toISOString(),
                    warning_count: nextWarningCount,
                    violation_score: nextViolationScore
                })
                .eq("id", userId);

            if (currentUser && currentUser.id === userId) {
                currentUser = await fetchCurrentUser();
                updateAccountState();
            }

            return {
                blocked: true,
                banned: true,
                message: "Tài khoản đã bị khóa do vượt quá giới hạn điểm vi phạm."
            };
        }

        await supabaseClient.from("profiles").update({
            warning_count: nextWarningCount,
            violation_score: nextViolationScore,
            last_violation_label: violation.label,
            last_violation_at: new Date().toISOString()
        }).eq("id", userId);

        if (currentUser && currentUser.id === userId) {
            currentUser = await fetchCurrentUser();
            updateAccountState();
        }

        return {
            blocked: true,
            banned: false,
            message: 'Nội dung bị từ chối vì có "' + violation.label + '" (' + violation.category + '). Cảnh cáo ' + nextWarningCount + ', điểm vi phạm ' + nextViolationScore + '/' + WARNING_SCORE_LIMIT + '. Quản trị viên sẽ xem xét thêm.'
        };
    }

    async function createModerationReport(userId, violation, sourceLabel, originalText) {
        await supabaseClient.from("reports").insert({
            user_id: userId,
            violation_label: violation.label,
            violation_category: violation.category,
            severity: violation.severity,
            source_label: sourceLabel,
            original_text: originalText,
            status: "pending"
        });
    }

    // --- UI UPDATES ---
    function updateAccountState() {
        // --- Profile card elements (new Facebook-style sidebar) ---
        const profileNameEl = document.getElementById("profileName");
        const profileRoleEl = document.getElementById("profileRole");
        const profileAvatarEl = document.getElementById("profileAvatar");
        const composerAvatarEl = document.getElementById("composerAvatar");

        if (!currentUser) {
            if (profileNameEl) profileNameEl.textContent = "Bạn chưa đăng nhập";
            if (profileRoleEl) profileRoleEl.textContent = "";
            if (profileAvatarEl) profileAvatarEl.innerHTML = '<i class="fa-solid fa-user"></i>';
            if (composerAvatarEl) composerAvatarEl.innerHTML = '<i class="fa-solid fa-user"></i>';

            statusPill.textContent = "Khách";
            statusPill.className = "status-pill guest";
            statusText.textContent = "Bạn cần đăng nhập ở trang tài khoản để đăng bài, ghim bài và bình luận.";
            statusActions.innerHTML = '<a href="account.html" class="inline-link">Đăng nhập hoặc đăng ký</a>';
            postForm.querySelectorAll("input, textarea, select, button").forEach(el => el.disabled = true);
            return;
        }

        // Populate profile card
        if (profileNameEl) profileNameEl.textContent = currentUser.name || "Người dùng";
        if (profileRoleEl) profileRoleEl.textContent = isAdmin(currentUser) ? "Quản trị viên" : "Thành viên";
        const avatarHtmlInner = currentUser.avatar
            ? '<img src="' + currentUser.avatar + '" alt="' + escapeHtml(currentUser.name || "Avatar") + '">'
            : escapeHtml(getInitials(currentUser.name));
        if (profileAvatarEl) profileAvatarEl.innerHTML = avatarHtmlInner;
        if (composerAvatarEl) composerAvatarEl.innerHTML = avatarHtmlInner;

        if (isUserBanned(currentUser)) {
            statusPill.textContent = "Đã bị khóa";
            statusPill.className = "status-pill banned";
            statusText.textContent = 'Tài khoản ' + currentUser.email + ' đã bị khóa. Lý do: ' + (currentUser.banReason || 'Vi phạm quy định diễn đàn.');
            statusActions.innerHTML = '<a href="account.html" class="inline-link">Xem trạng thái tài khoản</a><span class="meta-text">Vai trò: ' + (isAdmin(currentUser) ? 'Quản trị viên' : 'Thành viên') + '</span>';
            postForm.querySelectorAll("input, textarea, select, button").forEach(el => el.disabled = true);
            return;
        }

        statusPill.textContent = isAdmin(currentUser) ? "Admin" : "Đang hoạt động";
        statusPill.className = "status-pill";
        statusText.textContent = isAdmin(currentUser)
            ? 'Bạn đang đăng nhập với quyền quản trị. Bạn có thể xóa comment và khóa tài khoản vi phạm.'
            : 'Bạn có thể đăng bài, bình luận và ghim bài của chính mình.'
                + (currentUser.warningCount > 0 ? ' Hiện có ' + currentUser.warningCount + ' cảnh cáo, điểm vi phạm ' + currentUser.violationScore + '/' + WARNING_SCORE_LIMIT + '.' : '');
        statusActions.innerHTML = '<a href="account.html" class="inline-link">Quản lý tài khoản</a>'
            + (isAdmin(currentUser) ? '<a href="admin.html" class="inline-link">Trang quản trị</a>' : '')
            + '<span class="meta-text">Vai trò: ' + (isAdmin(currentUser) ? 'Quản trị viên' : 'Thành viên') + '</span>';
        postForm.querySelectorAll("input, textarea, select, button").forEach(el => el.disabled = false);
    }

    function renderBannedWords() {
        if (!bannedWordList) return;
        bannedWordList.innerHTML = BANNED_TERMS.map(function (term) {
            return '<span>' + escapeHtml(term.label) + ' (' + escapeHtml(term.category) + ')</span>';
        }).join("");
    }

    function renderMediaPreview() {
        mediaPreview.innerHTML = "";
        if (!pendingMedia.length) return;
        pendingMedia.forEach(function (item) {
            const wrapper = document.createElement("div");
            wrapper.className = "preview-item";
            wrapper.innerHTML = item.type === "image"
                ? '<img src="' + item.src + '" alt="' + escapeHtml(item.name) + '"><div class="preview-caption">' + escapeHtml(item.name) + '</div>'
                : '<video src="' + item.src + '" controls></video><div class="preview-caption">' + escapeHtml(item.name) + '</div>';
            mediaPreview.appendChild(wrapper);
        });
    }

    function sortPosts(posts) {
        return posts.slice().sort(function (a, b) {
            if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
            return new Date(b.createdAt) - new Date(a.createdAt);
        });
    }

    function createMediaHtml(media) {
        if (!media || !media.length) return "";
        return '<div class="media-grid">' + media.map(function (item) {
            if (item.type === "image") {
                return '<div class="media-item"><img src="' + item.src + '" alt="' + escapeHtml(item.name) + '"><div class="media-caption">' + escapeHtml(item.name) + '</div></div>';
            }
            return '<div class="media-item"><video src="' + item.src + '" controls></video><div class="media-caption">' + escapeHtml(item.name) + '</div></div>';
        }).join("") + '</div>';
    }

    function createCommentsHtml(comments) {
        if (!comments || !comments.length) {
            return '<div class="meta-text">Chưa có bình luận nào. Hãy là người đầu tiên mở lời.</div>';
        }

        return comments.map(function (comment) {
            const adminActions = isAdmin(currentUser)
                ? '<div class="comment-tools">'
                    + '<button type="button" class="delete-btn mini" data-action="delete-comment" data-comment-id="' + comment.id + '">Xóa</button>'
                    + (currentUser.id !== comment.userId ? '<button type="button" class="secondary-btn mini" data-action="ban-comment-user" data-user-id="' + comment.userId + '">Khóa tài khoản</button>' : '')
                    + '</div>'
                : '';

            // Nút báo cáo bình luận — chỉ hiện cho người khác
            const reportCommentBtn = (!currentUser || currentUser.id !== comment.userId)
                ? '<button type="button" class="rpt-trigger-btn" data-action="report-comment" data-comment-id="' + comment.id + '" data-comment-user="' + comment.userId + '" title="Báo cáo bình luận này" style="margin-left:4px"><i class="fa-solid fa-flag"></i> Báo cáo</button>'
                : '';

            return '<div class="comment-item">'
                + '<div class="comment-head"><div class="comment-author">' + renderAvatarHtml({ name: comment.authorName, avatar: comment.authorAvatar || "" }, "tiny") + '<strong>' + escapeHtml(comment.authorName) + '</strong>' + formatUserTitleBadgeHtml(comment.authorTitle) + '</div>'
                + '<span class="comment-time">' + formatDate(comment.createdAt) + '</span>'
                + reportCommentBtn
                + '</div>'
                + '<div class="comment-body">' + escapeHtml(comment.content) + '</div>'
                + adminActions
                + '</div>';
        }).join("");
    }

    async function renderPosts() {
        const posts = await getPosts();
        const allPosts = sortPosts(posts);
        const query = normalizeText(searchInput.value);
        const activeTopic = topicFilter.value;
        const filteredPosts = allPosts.filter(function (post) {
            const searchable = normalizeText(post.topic + ' ' + post.title + ' ' + post.content + ' ' + post.authorName);
            const matchesTopic = activeTopic === "all" || post.topic === activeTopic;
            const matchesQuery = query === "" || searchable.includes(query);
            return matchesTopic && matchesQuery;
        });

        postCounter.textContent = filteredPosts.length + ' bài viết';
        postList.innerHTML = "";

        if (!filteredPosts.length) {
            postList.innerHTML = '<div class="empty-state"><h3>Chưa có bài phù hợp</h3><p>Hãy đổi bộ lọc hoặc tạo một chủ đề mới để bắt đầu cuộc trò chuyện.</p></div>';
            return;
        }

        // Lấy reactions cho tất cả posts trước khi render
        const postIds = filteredPosts.map(function (p) { return p.id; });
        await fetchReactions(postIds);

        filteredPosts.forEach(function (post) {
            const card = document.createElement("article");
            card.className = post.pinned ? "post-card pinned" : "post-card";
            card.dataset.postId = post.id;
            card.dataset.isPinned = post.pinned;

            const isOwner = currentUser && currentUser.id === post.userId;
            const isCurrentAdmin = isAdmin(currentUser);
            const commentCount = (post.comments || []).length;

            // Facebook-style post card
            card.innerHTML = ''
                // Header: avatar + author + time + badges
                + '<div class="post-head">'
                + '  <div style="display:flex;align-items:flex-start;gap:10px;flex:1;">'
                + '    ' + renderAvatarHtml({ name: post.authorName, avatar: post.authorAvatar || "" }, "") 
                + '    <div style="flex:1;min-width:0;">'
                + '      <span class="author-badge">' + escapeHtml(post.authorName) + '</span>' + formatUserTitleBadgeHtml(post.authorTitle)
                + '      <span class="post-time">' + formatDate(post.createdAt) + '</span>'
                + '      <div class="post-meta" style="margin-top:6px;">'
                + '        <span class="topic-badge"><i class="fa-solid fa-hashtag"></i> ' + escapeHtml(post.topic) + '</span>'
                +          (post.pinned ? '<span class="pin-badge"><i class="fa-solid fa-thumbtack"></i> Đã ghim</span>' : '')
                + '      </div>'
                + '    </div>'
                + '  </div>'
                + '</div>'
                // Title
                + '<div style="padding:8px 16px 0;"><h3 class="" style="font-size:1.05rem;font-weight:700;color:var(--text-primary);line-height:1.35;">' + escapeHtml(post.title) + '</h3></div>'
                // Body
                + '<p class="post-body">' + escapeHtml(post.content) + '</p>'
                // Media
                + createMediaHtml(post.media)
                // Reaction section (Like / Tim / Comment stats + buttons)
                + createReactionHtml(post.id)
                // Nút báo cáo bài viết — chỉ hiện cho người khác (không phải chủ bài)
                + (!isOwner
                    ? '<div style="padding:0 16px 6px;display:flex;justify-content:flex-end;gap:4px"><button type="button" class="rpt-trigger-btn" data-action="report-profile" data-profile-user="' + post.userId + '" title="Báo cáo người dùng này"><i class="fa-solid fa-user-flag"></i> Báo cáo người dùng</button><button type="button" class="rpt-trigger-btn" data-action="report-post" data-post-user="' + post.userId + '" title="Báo cáo bài viết này"><i class="fa-solid fa-flag"></i> Báo cáo</button></div>'
                    : '')
                // Divider before admin actions
                + (isOwner || isCurrentAdmin
                    ? '<div class="post-actions">'
                      + (isOwner ? '<button type="button" class="pin-btn" data-action="toggle-pin"><i class="fa-solid fa-thumbtack"></i> ' + (post.pinned ? 'Bỏ ghim' : 'Ghim') + '</button>' : '')
                      + (isOwner || isCurrentAdmin ? '<button type="button" class="delete-btn" data-action="delete-post"><i class="fa-solid fa-trash"></i> Xóa</button>' : '')
                      + (isCurrentAdmin && (!currentUser || currentUser.id !== post.userId) ? '<button type="button" class="secondary-btn mini" data-action="ban-post-user" data-user-id="' + post.userId + '"><i class="fa-solid fa-ban"></i> Khóa tác giả</button>' : '')
                      + '</div>'
                    : '')
                // Comments section
                + '<div class="comments" id="comments-' + post.id + '">'
                + '  <div class="comment-list">' + createCommentsHtml(post.comments) + '</div>'
                + '  <form class="comment-form" data-post-id="' + post.id + '">'
                + '    <div style="display:flex;align-items:flex-start;gap:10px;">'
                + '      ' + renderAvatarHtml(currentUser || { name: "" }, "tiny")
                + '      <div style="flex:1;"><textarea name="comment" rows="2" placeholder="Viết bình luận..." style="border-radius:999px;padding:9px 18px;min-height:unset;resize:none;"></textarea></div>'
                + '    </div>'
                + '    <div class="form-actions" style="padding-left:40px;">'
                + '      <button type="submit" class="comment-btn" style="background:var(--primary);color:#fff;border:none;border-radius:var(--radius-sm);padding:8px 18px;font:inherit;font-size:0.88rem;font-weight:700;cursor:pointer;"><i class="fa-solid fa-paper-plane"></i> Gửi</button>'
                + '      <p class="form-message" role="status"></p>'
                + '    </div>'
                + '  </form>'
                + '</div>';

            const commentTextarea = card.querySelector('textarea[name="comment"]');
            const commentButton = card.querySelector('.comment-btn');
            if (!currentUser || isUserBanned(currentUser)) {
                commentTextarea.disabled = true;
                commentButton.disabled = true;
                commentTextarea.placeholder = !currentUser ? 'Đăng nhập để bình luận.' : 'Tài khoản đã bị khóa nên không thể bình luận.';
            }

            postList.appendChild(card);
        });
    }

    // --- EVENT LISTENERS ---
    async function handleMediaSelection(files) {
        postMessage.classList.remove("error");
        postMessage.textContent = "";
        pendingMedia = [];
        mediaPreview.innerHTML = "";

        if (!files.length) return;

        const totalSize = Array.from(files).reduce((sum, file) => sum + file.size, 0);

        if (totalSize > MAX_TOTAL_FILE_SIZE) {
            postMessage.textContent = "Tổng dung lượng file quá lớn. Hãy giữ dưới 2MB để lưu ổn định.";
            postMessage.classList.add("error");
            mediaInput.value = "";
            return;
        }

        pendingMedia = await Promise.all(Array.from(files).map(async function (file) {
            const src = await readFileAsDataUrl(file);
            return {
                name: file.name,
                type: file.type.startsWith("video/") ? "video" : "image",
                src: src
            };
        }));
        renderMediaPreview();
    }

    mediaInput.addEventListener("change", function () {
        handleMediaSelection(mediaInput.files).catch(function () {
            postMessage.textContent = "Không thể đọc file đã chọn.";
            postMessage.classList.add("error");
        });
    });

    postForm.addEventListener("submit", async function (event) {
        event.preventDefault();
        postMessage.classList.remove("error");
        postMessage.textContent = "";

        if (!currentUser) {
            postMessage.textContent = "Bạn cần đăng nhập trước khi đăng bài.";
            postMessage.classList.add("error");
            return;
        }

        if (isUserBanned(currentUser)) {
            postMessage.textContent = "Tài khoản của bạn đã bị khóa nên không thể đăng bài.";
            postMessage.classList.add("error");
            return;
        }

        const topic = postForm.topic.value.trim();
        const title = postForm.title.value.trim();
        const content = postForm.content.value.trim();

        if (!topic || !title || !content) {
            postMessage.textContent = "Vui lòng điền đầy đủ chủ đề, tiêu đề và nội dung.";
            postMessage.classList.add("error");
            return;
        }

        const triggerText = topic + ' ' + title + ' ' + content;
        const violation = detectBannedWord(triggerText);
        
        if (violation) {
            const moderationResult = await registerViolation(currentUser.id, violation);
            await createModerationReport(currentUser.id, violation, "bài viết mới", triggerText);
            postMessage.textContent = moderationResult && moderationResult.message
                ? moderationResult.message
                : "Nội dung bị từ chối do vi phạm quy định.";
            postMessage.classList.add("error");
            return;
        }

        const { error } = await supabaseClient
            .from("posts")
            .insert({
                user_id: currentUser.id,
                topic: topic,
                title: title,
                content: content,
                pinned: false,
                media: pendingMedia
            });

        if (error) {
            console.error(error);
            postMessage.textContent = "Không thể đăng bài: " + error.message;
            postMessage.classList.add("error");
            return;
        }

        postForm.reset();
        mediaInput.value = "";
        pendingMedia = [];
        renderMediaPreview();
        postMessage.textContent = "Đăng bài thành công.";
        await renderPosts();
    });

    postList.addEventListener("click", async function (event) {
        const actionButton = event.target.closest("button[data-action]");
        if (!actionButton) return;

        const action = actionButton.dataset.action;

        // --- REACTION ACTIONS (không yêu cầu đăng nhập trước, xử lý bên trong) ---
        if (action === "like-post" || action === "heart-post") {
            const postId = actionButton.dataset.postId;
            const reactionType = action === "like-post" ? "like" : "heart";
            await handleReaction(postId, reactionType);
            return;
        }

        // --- REPORT ACTIONS (dùng window.ReportSystem) ---
        if (action === "report-post") {
            if (!window.ReportSystem) return;
            const card   = event.target.closest('.post-card');
            const postId = card ? card.dataset.postId : null;
            const postUserId = actionButton.dataset.postUser || null;
            window.ReportSystem.open({
                reportedUserId: postUserId,
                sourceType:     'forum_post',
                sourceId:       postId,
                sourceName:     'Bài viết diễn đàn',
                triggerBtn:     actionButton
            });
            return;
        }

        if (action === "report-comment") {
            if (!window.ReportSystem) return;
            const commentId     = actionButton.dataset.commentId     || null;
            const commentUserId = actionButton.dataset.commentUser   || null;
            window.ReportSystem.open({
                reportedUserId: commentUserId,
                sourceType:     'forum_comment',
                sourceId:       commentId,
                sourceName:     'Bình luận diễn đàn',
                triggerBtn:     actionButton
            });
            return;
        }

        if (action === "report-profile") {
            if (!window.ReportSystem) return;
            window.ReportSystem.open({
                reportedUserId: actionButton.dataset.profileUser || null,
                sourceType: 'profile',
                sourceId: actionButton.dataset.profileUser || null,
                sourceName: 'Hồ sơ người dùng',
                triggerBtn: actionButton
            });
            return;
        }

        if (action === "jump-comment") {
            const postId = actionButton.dataset.postId;
            const commentsSection = document.getElementById('comments-' + postId);
            if (commentsSection) {
                commentsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                const textarea = commentsSection.querySelector('textarea[name="comment"]');
                if (textarea && !textarea.disabled) textarea.focus();
            }
            return;
        }

        // --- BÀI VIẾT & ADMIN ACTIONS (yêu cầu đăng nhập) ---
        const card = event.target.closest(".post-card");
        const postId = card ? card.dataset.postId : null;
        if (!currentUser) return;

        try {
            if (action === "toggle-pin") {
                const isPinned = card.dataset.isPinned === "true";
                await supabaseClient.from("posts").update({ pinned: !isPinned }).eq("id", postId).eq("user_id", currentUser.id);
                await renderPosts();
                return;
            }

            if (action === "delete-post") {
                // Cho phép admin xóa bài của người khác, user xóa bài của mình
                let query = supabaseClient.from("posts").delete().eq("id", postId);
                if (!isAdmin(currentUser)) {
                    query = query.eq("user_id", currentUser.id);
                }
                await query;
                await renderPosts();
                return;
            }

            if (action === "ban-post-user") {
                if (!isAdmin(currentUser)) return;
                const targetUserId = actionButton.dataset.userId;
                if (!targetUserId || targetUserId === currentUser.id) return;
                
                await banUser(targetUserId, {
                    label: "vi phạm do quản trị viên xác nhận",
                    severity: WARNING_SCORE_LIMIT,
                    category: "khóa thủ công"
                }, 'bài viết do quản trị viên xử lý');
                await renderPosts();
                return;
            }

            if (action === "delete-comment") {
                if (!isAdmin(currentUser)) return;
                const commentId = actionButton.dataset.commentId;
                await supabaseClient.from("comments").delete().eq("id", commentId);
                await renderPosts();
                return;
            }

            if (action === "ban-comment-user") {
                if (!isAdmin(currentUser)) return;
                const targetUserId = actionButton.dataset.userId;
                if (!targetUserId || targetUserId === currentUser.id) return;
                
                await banUser(targetUserId, {
                    label: "vi phạm do quản trị viên xác nhận",
                    severity: WARNING_SCORE_LIMIT,
                    category: "khóa thủ công"
                }, 'bình luận do quản trị viên xử lý');
                await renderPosts();
                return;
            }
        } catch (err) {
            console.error("Lỗi khi thực hiện hành động:", err);
            alert("Đã xảy ra lỗi khi thực hiện hành động này.");
        }
    });

    postList.addEventListener("submit", async function (event) {
        const form = event.target.closest(".comment-form");
        if (!form) return;

        event.preventDefault();
        const message = form.querySelector(".form-message");
        message.classList.remove("error");
        message.textContent = "";

        if (!currentUser) {
            message.textContent = "Bạn cần đăng nhập để bình luận.";
            message.classList.add("error");
            return;
        }

        if (isUserBanned(currentUser)) {
            message.textContent = "Tài khoản của bạn đã bị khóa.";
            message.classList.add("error");
            return;
        }

        const textarea = form.querySelector('textarea[name="comment"]');
        const content = textarea.value.trim();
        if (!content) {
            message.textContent = "Vui lòng nhập nội dung bình luận.";
            message.classList.add("error");
            return;
        }

        const violation = detectBannedWord(content);
        if (violation) {
            const moderationResult = await registerViolation(currentUser.id, violation);
            await createModerationReport(currentUser.id, violation, "bình luận", content);
            message.textContent = moderationResult && moderationResult.message
                ? moderationResult.message
                : "Nội dung bị từ chối do vi phạm quy định.";
            message.classList.add("error");
            return;
        }

        const postId = form.dataset.postId;
        
        const { error } = await supabaseClient.from("comments").insert({
            post_id: postId,
            user_id: currentUser.id,
            content: content
        });

        if (error) {
            console.error("Lỗi đăng bình luận:", error);
            message.textContent = "Không thể đăng bình luận.";
            message.classList.add("error");
            return;
        }

        textarea.value = "";
        await renderPosts();
    });

    topicFilter.addEventListener("change", renderPosts);
    searchInput.addEventListener("input", renderPosts);

    // --- INITIALIZATION ---
    renderBannedWords();
    currentUser = await fetchCurrentUser();
    updateAccountState();
    await renderPosts();
});
