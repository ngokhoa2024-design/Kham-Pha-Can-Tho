document.addEventListener("DOMContentLoaded", async function () {
    const state = document.getElementById("profileState");
    const content = document.getElementById("profileContent");
    const userId = new URLSearchParams(window.location.search).get("id");

    function showState(message, error) { state.textContent = message; state.classList.toggle("error", !!error); state.hidden = false; }
    function escapeHtml(value) { return String(value || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;"); }
    function trustLevel(score) { if(score >= 95) return "Đại sứ Cần Thơ"; if(score >= 90) return "Người đóng góp tích cực"; if(score >= 80) return "Thành viên uy tín"; if(score >= 70) return "Thành viên mới nổi"; if(score >= 50) return "Đang được theo dõi"; return "Uy tín thấp"; }
    function initials(name) { return (name || "ND").trim().split(/\s+/).slice(0,2).map(function(part){ return part[0]; }).join("").toUpperCase(); }
    function dateText(value) { return value ? new Intl.DateTimeFormat("vi-VN", { dateStyle:"medium" }).format(new Date(value)) : ""; }

    if (!userId) { showState("Không tìm thấy người dùng.", true); return; }
    if (!window.supabaseClient) { showState("Không thể kết nối hệ thống. Vui lòng thử lại sau.", true); return; }

    const [{ data: profile, error: profileError }, { data: posts, error: postsError }, { data: authData }] = await Promise.all([
        supabaseClient.from("public_profiles").select("id, name, avatar_url, trust_score, facebook, facebook_name, active_title_id").eq("id", userId).maybeSingle(),
        supabaseClient.from("posts").select("id, user_id, topic, title, content, created_at").eq("user_id", userId).order("created_at", { ascending:false }),
        supabaseClient.auth.getUser()
    ]);

    if (profileError || !profile) { console.error("Không thể tải hồ sơ:", profileError); showState("Không tìm thấy người dùng.", true); return; }
    if (postsError) console.error("Không thể tải bài đăng:", postsError);

    // Title (danh hiệu) active của user — chỉ 1 dòng cho trang hồ sơ đơn lẻ này
    // nên 1 query riêng là hợp lý, không phải N+1 (không lặp theo danh sách).
    if (profile.active_title_id) {
        const { data: activeTitle, error: titleError } = await supabaseClient
            .from("titles")
            .select("id, name, slug, icon, color")
            .eq("id", profile.active_title_id)
            .maybeSingle();
        if (titleError) {
            console.error("Không thể tải title:", titleError);
        } else if (activeTitle && activeTitle.name) {
            const titleBadge = document.getElementById("profileTitleBadge");
            const isValidColor = /^#[0-9a-fA-F]{3,8}$/.test(activeTitle.color || "");
            if (isValidColor) titleBadge.style.color = activeTitle.color;
            titleBadge.textContent = (activeTitle.icon ? activeTitle.icon + " " : "") + activeTitle.name;
            titleBadge.hidden = false;
        }
    }

    const score = Math.max(0, Math.min(100, Number(profile.trust_score) || 0));
    document.title = "Khám Phá Cần Thơ | " + (profile.name || "Hồ sơ người dùng");
    document.getElementById("profileName").textContent = profile.name || "Người dùng";
    document.getElementById("trustLevel").textContent = trustLevel(score);
    document.getElementById("trustScore").textContent = score + "/100";
    const avatar = document.getElementById("profileAvatar");
    if (profile.avatar_url) { const image = document.createElement("img"); image.src = profile.avatar_url; image.alt = "Ảnh đại diện của " + (profile.name || "người dùng"); avatar.appendChild(image); } else { avatar.textContent = initials(profile.name); }

    if (profile.facebook && profile.facebook_name) {
        const facebookCard = document.getElementById("facebookPublicCard");
        const facebookInfo = document.getElementById("facebookPublicInfo");
        const label = document.createTextNode(profile.facebook_name + " · ");
        const link = document.createElement("a");
        link.href = profile.facebook; link.target = "_blank"; link.rel = "noopener noreferrer"; link.textContent = "Xem Facebook";
        facebookInfo.append(label, link);
        facebookCard.hidden = false;
    }

    const postList = document.getElementById("postList");
    const safePosts = posts || [];
    document.getElementById("postCount").textContent = safePosts.length + " bài viết";
    postList.innerHTML = safePosts.length ? safePosts.map(function(post) { return '<article class="profile-post"><div class="profile-post-meta"><span class="topic"># ' + escapeHtml(post.topic || "Câu chuyện cá nhân") + '</span><span>' + escapeHtml(dateText(post.created_at)) + '</span></div><h3>' + escapeHtml(post.title || "Bài đăng không có tiêu đề") + '</h3><p>' + escapeHtml(post.content) + '</p></article>'; }).join("") : '<div class="empty-posts">Người dùng này chưa có bài đăng công khai.</div>';

    const currentUser = authData && authData.user;
    if ((!currentUser || currentUser.id !== profile.id) && window.ReportSystem) {
        const reportButton = ReportSystem.createButton({ reportedUserId:profile.id, sourceType:"profile", sourceId:profile.id, sourceName:profile.name || "Người dùng" });
        document.getElementById("reportSlot").appendChild(reportButton);
    }
    state.hidden = true;
    content.hidden = false;
});
