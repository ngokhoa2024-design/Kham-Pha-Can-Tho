/* ============================================================
   admin-logic.js — JavaScript cho Admin Dashboard
   Khám Phá Cần Thơ

   BẢO MẬT:
   Đây là frontend access guard dựa trên profiles.role.
   Quyền truy cập thực tế PHẢI được bảo vệ bằng Supabase RLS
   (Row Level Security) trên từng bảng dữ liệu.
   Frontend guard chỉ là UX layer, không phải bảo mật thực sự.
   ============================================================ */

'use strict';

// ─── STATE ─────────────────────────────────────────────────────
let currentAdmin  = null;
let allUsers      = [];
let allPosts      = [];
let allComments   = [];
let allReports    = [];
const resolvingReports = new Set();
let selectedUser  = null;

const panelTitles = {
    dashboard:  '📊 Tổng quan',
    reports:    '🚨 Báo cáo',
    posts:      '📝 Bài viết',
    comments:   '💬 Bình luận',
    users:      '👥 Người dùng',
    trust:      '⭐ Điểm uy tín',
    violations: '🚫 Lịch sử vi phạm',
    titles:     '🏷️ Quản lý Title',
    settings:   '⚙️ Cài đặt'
};

// ─── INIT ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async function () {
    updateClock();
    setInterval(updateClock, 60000);
    await checkAdminAccess();
});

// ─── ACCESS GUARD ──────────────────────────────────────────────
// Kiểm tra quyền admin từ profiles.role === "admin"
// VÀ profiles.status !== "banned"
// Quyền thực sự phải được bảo vệ bằng Supabase RLS.
async function checkAdminAccess() {
    const loadingEl = document.getElementById('loadingScreen');
    const deniedEl  = document.getElementById('accessDenied');
    const shellEl   = document.getElementById('adminShell');

    try {
        // 1. Kiểm tra user đã đăng nhập chưa
        const { data: { user }, error: userError } = await supabaseClient.auth.getUser();

        if (userError || !user) {
            // Chưa đăng nhập → chuyển về account.html
            window.location.href = 'account.html';
            return;
        }

        // 2. Lấy profile để kiểm tra role và status
        const { data: profile, error: profileError } = await supabaseClient
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (profileError || !profile) {
            showDenied(loadingEl, deniedEl);
            setTimeout(() => { window.location.href = 'account.html'; }, 3000);
            return;
        }

        // 3. Kiểm tra role === "admin" VÀ status !== "banned"
        if (profile.role !== 'admin' || profile.status === 'banned') {
            showDenied(loadingEl, deniedEl);
            setTimeout(() => { window.location.href = 'index.html'; }, 3000);
            return;
        }

        // 4. Admin hợp lệ
        currentAdmin = {
            id:     user.id,
            email:  user.email,
            name:   profile.name || user.email.split('@')[0] || 'Admin',
            avatar: profile.avatar_url || '',
            status: profile.status,
            role:   profile.role
        };

        loadingEl.classList.add('hidden');
        shellEl.classList.remove('hidden');

        renderSidebarAdmin();
        document.getElementById('dbStatus').textContent      = '✓ Đang kết nối';
        document.getElementById('dbStatus').style.color      = 'var(--success)';
        document.getElementById('sessionStatus').textContent = '✓ Đang đăng nhập';
        document.getElementById('sessionStatus').style.color = 'var(--success)';

        // Tải dữ liệu song song
        await Promise.all([loadStats(), loadUsers(), loadReports()]);
        loadPosts();
        loadComments();
        loadTrustData();
        loadWarnedUsers();

        // Bind sự kiện
        bindNav();
        bindSidebarResponsive();
        bindModalBackdrop();

        // Nạp danh hiệu ngay sau khi Admin đã xác thực.
        // Nhờ vậy dropdown Chọn danh hiệu luôn có dữ liệu ngay lần đầu mở trang,
        // không phụ thuộc vào việc người dùng có phải chuyển panel qua lại hay không.
        if (typeof loadTitlesPanel === 'function') {
            await loadTitlesPanel();
        }

    } catch (err) {
        console.error('Lỗi kiểm tra quyền admin:', err);
        showDenied(loadingEl, deniedEl);
    }
}

function showDenied(loadingEl, deniedEl) {
    if (loadingEl) loadingEl.classList.add('hidden');
    if (deniedEl)  deniedEl.classList.remove('hidden');
}

// ─── SIDEBAR ADMIN INFO ────────────────────────────────────────
function getInitials(name) {
    const parts = (name || '').trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return 'A';
    return parts.slice(0, 2).map(p => p.charAt(0).toUpperCase()).join('');
}

function renderSidebarAdmin() {
    if (!currentAdmin) return;
    const nameEl   = document.getElementById('sidebarAdminName');
    const avatarEl = document.getElementById('sidebarAdminAvatar');
    if (nameEl)   nameEl.textContent = currentAdmin.name;
    if (avatarEl) {
        if (currentAdmin.avatar) {
            avatarEl.innerHTML = '<img src="' + escHtml(currentAdmin.avatar) + '" alt="avatar">';
        } else {
            avatarEl.textContent = getInitials(currentAdmin.name);
        }
    }
}

// ─── CLOCK ─────────────────────────────────────────────────────
function updateClock() {
    const el = document.getElementById('topbarTime');
    if (!el) return;
    el.textContent = new Date().toLocaleString('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
}

// ─── NAVIGATION ────────────────────────────────────────────────
function bindNav() {
    document.querySelectorAll('.sidebar-nav-item').forEach(function (item) {
        item.addEventListener('click', function () {
            const panel = this.getAttribute('data-panel');
            if (panel) switchPanel(panel);
            closeSidebarMobile();
        });
    });

    // Filter tabs user
    document.querySelectorAll('[data-userfilter]').forEach(function (tab) {
        tab.addEventListener('click', function () {
            document.querySelectorAll('[data-userfilter]').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            filterUsers(document.getElementById('userSearch')?.value || '');
        });
    });

    document.getElementById('reportSearch')?.addEventListener('input', function () { renderReports(filteredReports()); });

    // Filter tabs report
    document.querySelectorAll('[data-filter]').forEach(function (tab) {
        tab.addEventListener('click', function () {
            document.querySelectorAll('[data-filter]').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            renderReports(filteredReports());
        });
    });

    // Sign out
    const btnSignOut = document.getElementById('btnSignOut');
    if (btnSignOut) {
        btnSignOut.addEventListener('click', async function () {
            await supabaseClient.auth.signOut();
            window.location.href = 'account.html';
        });
    }
}

function switchPanel(panelId) {
    document.querySelectorAll('.admin-panel').forEach(p => p.classList.remove('active'));
    const target = document.getElementById('panel-' + panelId);
    if (target) target.classList.add('active');

    document.querySelectorAll('.sidebar-nav-item').forEach(function (item) {
        item.classList.toggle('active', item.getAttribute('data-panel') === panelId);
    });

    const titleEl = document.getElementById('topbarTitle');
    if (titleEl) titleEl.textContent = panelTitles[panelId] || panelId;

    // Tải panel Titles theo yêu cầu (lazy load)
    if (panelId === 'titles' && typeof loadTitlesPanel === 'function') {
        loadTitlesPanel();
    }
}

// ─── SIDEBAR RESPONSIVE ────────────────────────────────────────
function bindSidebarResponsive() {
    const hamburger = document.getElementById('topbarHamburger');
    const sidebar   = document.getElementById('adminSidebar');
    const overlay   = document.getElementById('sidebarOverlay');

    if (hamburger) {
        hamburger.addEventListener('click', function () {
            sidebar.classList.toggle('open');
            overlay.classList.toggle('active');
        });
    }
    if (overlay) {
        overlay.addEventListener('click', closeSidebarMobile);
    }
}

function closeSidebarMobile() {
    if (window.innerWidth <= 900) {
        document.getElementById('adminSidebar')?.classList.remove('open');
        document.getElementById('sidebarOverlay')?.classList.remove('active');
    }
}

// ─── STATS (dữ liệu thật từ Supabase) ─────────────────────────
async function loadStats() {
    try {
        const { data: users } = await supabaseClient.from('profiles').select('id, status, role');
        if (users) {
            document.getElementById('statTotalUsers').textContent  = users.length;
            document.getElementById('statActiveUsers').textContent = users.filter(u => u.status !== 'banned').length;
            document.getElementById('statBannedUsers').textContent = users.filter(u => u.status === 'banned').length;
        }

        const { count: postCount } = await supabaseClient.from('posts').select('id', { count: 'exact', head: true });
        if (postCount !== null) document.getElementById('statTotalPosts').textContent = postCount;

        const { count: cmtCount } = await supabaseClient.from('comments').select('id', { count: 'exact', head: true });
        if (cmtCount !== null) document.getElementById('statTotalComments').textContent = cmtCount;

        const { count: reportCount } = await supabaseClient.from('reports').select('id', { count: 'exact', head: true }).eq('status', 'pending');
        if (reportCount !== null) updateReportCounts(reportCount);

    } catch (err) {
        console.error('Lỗi tải stats:', err);
    }
}

// ─── REPORTS (dữ liệu thật từ reports) ────────────────────────
async function loadReports() {
    const listEl = document.getElementById('reportList');
    if (!listEl) return;
    try {
        const { data, error } = await supabaseClient.from('reports').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        const reports = data || [];
        const ids = [...new Set(reports.flatMap(r => [r.reporter_id, r.reported_user_id]).filter(Boolean))];
        let profiles = [];
        if (ids.length) {
            const result = await supabaseClient.from('profiles').select('id,name,avatar_url,trust_score').in('id', ids);
            if (result.error) throw result.error;
            profiles = result.data || [];
        }
        const profileMap = new Map(profiles.map(p => [p.id, p]));
        allReports = reports.map(r => ({ ...r, reporter: profileMap.get(r.reporter_id), reported: profileMap.get(r.reported_user_id) }));
        updateReportCounts(allReports.filter(r => r.status === 'pending').length);
        renderReports(filteredReports());
    } catch (err) {
        console.error('Lỗi tải reports:', err);
        listEl.innerHTML = renderError(err.message);
    }
}

function updateReportCounts(count) {
    const stat = document.getElementById('statPendingReports');
    const badge = document.getElementById('reportBadge');
    if (stat) stat.textContent = String(count);
    if (badge) { badge.textContent = String(count); badge.style.display = count ? '' : 'none'; }
}

function filteredReports() {
    const active = document.querySelector('[data-filter].active')?.dataset.filter || 'all';
    const query = (document.getElementById('reportSearch')?.value || '').trim().toLowerCase();
    return allReports.filter(r => {
        const matchesStatus = active === 'all' || (active === 'ok' ? r.status === 'rejected' : r.status === active);
        const haystack = [r.reason, r.description, r.source_type, r.source_id, r.reporter?.name, r.reported?.name].join(' ').toLowerCase();
        return matchesStatus && (!query || haystack.includes(query));
    });
}

function renderReports(reports) {
    const listEl = document.getElementById('reportList');
    if (!listEl) return;
    if (!reports.length) {
        listEl.innerHTML = '<div class="empty-state"><div class="empty-icon">🚨</div><div class="empty-title">Chưa có báo cáo nào</div><div class="empty-sub">Các báo cáo từ cộng đồng sẽ xuất hiện tại đây.</div></div>';
        return;
    }
    listEl.innerHTML = reports.map(r => {
        const state = r.status === 'resolved' ? ['badge-active', '🟢 Đã xử lý'] : r.status === 'rejected' ? ['badge-neutral', '⚪ Không vi phạm'] : ['badge-pending', '🟠 Chờ xử lý'];
        const source = { forum_post: 'Bài viết diễn đàn', forum_comment: 'Bình luận diễn đàn', buddy: 'Tìm bạn', profile: 'Hồ sơ người dùng', other: 'Khác' }[r.source_type] || r.source_type || 'Khác';
        return '<div class="report-card">'
            + '<div class="report-card-head"><span class="badge ' + state[0] + '">' + state[1] + '</span><div class="report-card-info">'
            + '<div class="report-source">🚩 Nguồn: ' + escHtml(source) + '</div>'
            + '<div class="report-title-text">' + escHtml(r.reporter?.name || 'Người dùng') + ' báo cáo ' + escHtml(r.reported?.name || 'Người dùng') + '</div>'
            + '<div class="report-meta-row"><span>📣 Lý do: <strong>' + escHtml(r.reason) + '</strong></span><span>⭐ Uy tín: <strong>' + getTrustScore(r.reported?.trust_score) + '/100</strong></span><span>🔖 Source ID: ' + escHtml(r.source_id || '—') + '</span><span>🕐 ' + formatDate(r.created_at) + '</span></div></div></div>'
            + '<div class="report-snippet">' + escHtml(r.description || 'Không có mô tả thêm.') + '</div>'
            + (r.admin_note ? '<div class="report-snippet"><strong>Ghi chú admin:</strong> ' + escHtml(r.admin_note) + '</div>' : '')
            + '<div class="report-actions"><button class="btn btn-info btn-sm" onclick="showReportDetail(\'' + r.id + '\')"><i class="fa-solid fa-eye"></i> Xem chi tiết</button>'
            + (r.status === 'pending' ? '<input id="report-note-' + r.id + '" class="toolbar-input" style="max-width:220px" maxlength="500" placeholder="Ghi chú admin (không bắt buộc)">' : '')
            + (r.status === 'pending' ? '<button class="btn btn-danger btn-sm" onclick="resolveReport(\'' + r.id + '\')"><i class="fa-solid fa-shield-halved"></i> Xác nhận vi phạm (' + getPenalty(r.reason) + ' điểm)</button><button class="btn btn-neutral btn-sm" onclick="reviewReport(\'' + r.id + '\', \'rejected\')"><i class="fa-solid fa-check"></i> Từ chối</button>' : '')
            + '</div></div>';
    }).join('');
}

function showReportDetail(id) {
    const r = allReports.find(item => item.id === id);
    if (!r) return;
    const message = 'Người report: ' + (r.reporter?.name || r.reporter_id || '—') + '\nNgười bị report: ' + (r.reported?.name || r.reported_user_id || '—') + '\nNguồn: ' + (r.source_type || 'other') + '\nSource ID: ' + (r.source_id || '—') + '\nLý do: ' + (r.reason || '—') + '\nMô tả: ' + (r.description || 'Không có') + '\nTrạng thái: ' + (r.status || 'pending') + (r.admin_note ? '\nGhi chú admin: ' + r.admin_note : '');
    window.alert(message);
}

async function reviewReport(id, status) {
    if (!currentAdmin || status !== 'rejected') return;
    try {
        const note = (document.getElementById('report-note-' + id)?.value || '').trim();
        const { data, error } = await supabaseClient.from('reports').update({ status: status, reviewed_by: currentAdmin.id, reviewed_at: new Date().toISOString(), admin_note: note || null }).eq('id', id).eq('status', 'pending').select('id');
        if (error) throw error;
        if (!data || !data.length) throw new Error('Báo cáo này đã được xử lý.');
        showToast('Đã từ chối báo cáo. Trust Score không thay đổi.', 'success');
        await loadReports();
    } catch (err) {
        console.error('Lỗi xử lý report:', err);
        showToast('Không thể cập nhật báo cáo: ' + err.message, 'error');
    }
}

function getPenalty(reason) {
    const value = String(reason || '').toLocaleLowerCase('vi-VN');
    if (value.includes('lừa đảo')) return 20;
    if (value.includes('quấy rối') || value.includes('quang cao') || value.includes('quảng cáo')) return 10;
    if (value.includes('nghiêm trọng') || value.includes('nội dung không phù hợp')) return 30;
    return 5;
}

function getTrustScore(value) { return Math.max(0, Math.min(100, Number.isFinite(Number(value)) ? Number(value) : 100)); }

async function resolveReport(id) {
    if (!currentAdmin || resolvingReports.has(id)) return;
    resolvingReports.add(id);
    const note = (document.getElementById('report-note-' + id)?.value || '').trim();
    try {
        const reportResult = await supabaseClient.from('reports').select('*').eq('id', id).eq('status', 'pending').single();
        if (reportResult.error || !reportResult.data) throw new Error('Báo cáo này đã được xử lý.');
        const report = reportResult.data;
        if (!report.reported_user_id) throw new Error('Báo cáo không có người bị báo cáo.');
        const profileResult = await supabaseClient.from('profiles').select('id,trust_score').eq('id', report.reported_user_id).single();
        if (profileResult.error || !profileResult.data) throw new Error('Không tìm thấy hồ sơ người bị báo cáo.');
        const oldScore = getTrustScore(profileResult.data.trust_score), penalty = getPenalty(report.reason), newScore = Math.max(0, oldScore - penalty);
        const scoreUpdate = await supabaseClient.from('profiles').update({ trust_score: newScore }).eq('id', report.reported_user_id).select('id');
        if (scoreUpdate.error || !scoreUpdate.data?.length) throw (scoreUpdate.error || new Error('Không thể cập nhật Trust Score.'));
        const historyResult = await supabaseClient.from('trust_history').insert({ user_id: report.reported_user_id, points_change: -penalty, reason: report.reason, report_id: report.id, admin_id: currentAdmin.id }).select('id').single();
        if (historyResult.error) { await supabaseClient.from('profiles').update({ trust_score: oldScore }).eq('id', report.reported_user_id); throw historyResult.error; }
        const finish = await supabaseClient.from('reports').update({ status: 'resolved', reviewed_by: currentAdmin.id, reviewed_at: new Date().toISOString(), admin_note: note || null }).eq('id', id).eq('status', 'pending').select('id');
        if (finish.error || !finish.data?.length) { await supabaseClient.from('trust_history').delete().eq('id', historyResult.data.id); await supabaseClient.from('profiles').update({ trust_score: oldScore }).eq('id', report.reported_user_id); throw (finish.error || new Error('Báo cáo này đã được xử lý.')); }
        showToast('Đã xác nhận vi phạm. Trust Score đã giảm ' + (oldScore - newScore) + ' điểm.', 'success');
        await Promise.all([loadReports(), loadTrustData()]);
    } catch (err) { console.error('Lỗi xác nhận report:', err); showToast('Không thể xử lý báo cáo: ' + err.message, 'error'); }
    finally { resolvingReports.delete(id); }
}

// ─── USERS (dữ liệu thật từ profiles) ─────────────────────────
async function loadUsers() {
    const listEl = document.getElementById('userList');
    try {
        const { data, error } = await supabaseClient
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        allUsers = data || [];
        renderUsers(allUsers);
    } catch (err) {
        console.error('Lỗi tải users:', err);
        if (listEl) listEl.innerHTML = renderError(err.message);
    }
}

function renderUsers(users) {
    const listEl = document.getElementById('userList');
    if (!listEl) return;
    if (!users || users.length === 0) {
        listEl.innerHTML = '<div class="empty-state"><div class="empty-icon">👥</div><div class="empty-title">Không tìm thấy người dùng</div></div>';
        return;
    }
    listEl.innerHTML = users.map(function (u) {
        const initials   = getInitials(u.name);
        const avatarHtml = u.avatar_url ? '<img src="' + escHtml(u.avatar_url) + '" alt="' + escHtml(u.name || '') + '">' : escHtml(initials);
        const isSelf     = currentAdmin && u.id === currentAdmin.id;
        const isBanned   = u.status === 'banned';
        const isAdm      = u.role === 'admin';
        const rowClass   = isBanned ? 'user-row banned-row' : (isAdm ? 'user-row admin-row' : 'user-row');

        const banBtn = isSelf
            ? '<button class="btn btn-neutral btn-sm" disabled title="Không thể tự khóa mình"><i class="fa-solid fa-ban"></i> Khóa</button>'
            : isBanned
                ? '<button class="btn btn-success btn-sm" onclick="quickUnban(\'' + u.id + '\', event)"><i class="fa-solid fa-lock-open"></i> Mở khóa</button>'
                : '<button class="btn btn-danger btn-sm" onclick="quickBan(\'' + u.id + '\', event)"><i class="fa-solid fa-ban"></i> Khóa</button>';

        return '<div class="' + rowClass + '" onclick="openUserModal(\'' + u.id + '\')">'
            + '<div class="user-avatar">' + avatarHtml + '</div>'
            + '<div class="user-info">'
            +   '<div class="user-name-text">' + escHtml(u.name || 'Chưa có tên') + (isSelf ? ' <small style="color:var(--primary)">(bạn)</small>' : '') + '</div>'
            +   '<div class="user-email-text">' + escHtml(u.facebook ? '🔗 ' + u.facebook : 'Chưa có liên kết') + '</div>'
            +   '<div class="user-badges">'
            +     (isAdm ? '<span class="badge badge-admin">⭐ Admin</span>' : '<span class="badge badge-member">👤 Member</span>')
            +     (isBanned ? '<span class="badge badge-banned">🔴 Đã khóa</span>' : '<span class="badge badge-active">🟢 Hoạt động</span>')
            +     (u.warning_count > 0 ? '<span class="badge badge-pending">⚠ ' + u.warning_count + ' cảnh cáo</span>' : '')
            +   '</div>'
            + '</div>'
            + '<div class="user-actions-inline">' + banBtn + '</div>'
            + '</div>';
    }).join('');
}

function filterUsers(searchVal) {
    const search      = (searchVal !== undefined ? searchVal : (document.getElementById('userSearch')?.value || '')).toLowerCase();
    const statusFilter = document.getElementById('userStatusFilter')?.value || '';
    const tabFilter   = document.querySelector('[data-userfilter].active')?.getAttribute('data-userfilter') || 'all';

    const filtered = allUsers.filter(function (u) {
        const nameMatch = (u.name || '').toLowerCase().includes(search) || (u.facebook || '').toLowerCase().includes(search);
        if (!nameMatch) return false;

        const statusCheck = statusFilter === 'active' ? u.status !== 'banned'
                          : statusFilter === 'banned' ? u.status === 'banned'
                          : statusFilter === 'admin'  ? u.role === 'admin'
                          : true;

        const tabCheck = tabFilter === 'active' ? u.status !== 'banned'
                       : tabFilter === 'banned' ? u.status === 'banned'
                       : tabFilter === 'admin'  ? u.role === 'admin'
                       : true;

        return statusCheck && tabCheck;
    });
    renderUsers(filtered);
}

// ─── USER MODAL ────────────────────────────────────────────────
async function openUserModal(userId) {
    const user = allUsers.find(u => u.id === userId);
    if (!user) return;
    selectedUser = user;

    const modal    = document.getElementById('userModal');
    const avatarEl = document.getElementById('modalAvatar');
    const isSelf   = currentAdmin && user.id === currentAdmin.id;
    const isBanned = user.status === 'banned';

    avatarEl.innerHTML = user.avatar_url
        ? '<img src="' + escHtml(user.avatar_url) + '" alt="avatar">'
        : escHtml(getInitials(user.name));

    document.getElementById('modalUserName').textContent   = (user.name || 'Chưa có tên') + (isSelf ? ' (bạn)' : '');
    document.getElementById('modalUserEmail').textContent  = user.facebook || 'Chưa có liên kết';
    document.getElementById('modalScore').textContent      = getTrustScore(user.trust_score);
    document.getElementById('modalWarnings').textContent   = Number(user.warning_count) || 0;
    document.getElementById('modalPosts').textContent      = '…';

    document.getElementById('modalBadges').innerHTML =
        (user.role === 'admin' ? '<span class="badge badge-admin">⭐ Admin</span>' : '<span class="badge badge-member">👤 Member</span>') +
        (isBanned ? '<span class="badge badge-banned">🔴 Đã khóa</span>' : '<span class="badge badge-active">🟢 Hoạt động</span>');

    const banReasonEl = document.getElementById('modalBanReason');
    if (isBanned && user.ban_reason) {
        banReasonEl.style.display = 'block';
        document.getElementById('modalBanReasonText').textContent = user.ban_reason;
    } else {
        banReasonEl.style.display = 'none';
    }

    const banBtn   = document.getElementById('modalBanBtn');
    const unbanBtn = document.getElementById('modalUnbanBtn');
    banBtn.disabled   = isSelf || isBanned;
    banBtn.title      = isSelf ? 'Không thể tự khóa tài khoản của mình' : '';
    banBtn.innerHTML  = '<i class="fa-solid fa-ban"></i> Khóa tài khoản';
    unbanBtn.style.display = isBanned ? '' : 'none';

    document.getElementById('modalViolations').innerHTML = '<div class="modal-violation-item" style="color:var(--text-muted);font-style:italic">Đang tải lịch sử điểm uy tín...</div>';

    modal.classList.add('open');

    // Đếm bài viết user
    try {
        const { count } = await supabaseClient.from('posts').select('id', { count: 'exact', head: true }).eq('user_id', userId);
        document.getElementById('modalPosts').textContent = count ?? 0;
    } catch (e) { document.getElementById('modalPosts').textContent = '—'; }

    try {
        const { data, error } = await supabaseClient.from('trust_history').select('points_change, reason, report_id, created_at').eq('user_id', userId).order('created_at', { ascending: false }).limit(20);
        if (error) throw error;
        document.getElementById('modalViolations').innerHTML = data?.length
            ? data.map(item => '<div class="modal-violation-item"><strong>' + escHtml(item.points_change) + ' điểm</strong> · ' + escHtml(item.reason) + '<br><small>Report #' + escHtml(item.report_id || '—') + ' · ' + formatDate(item.created_at) + '</small></div>').join('')
            : '<div class="modal-violation-item" style="color:var(--text-muted);font-style:italic">Chưa có lịch sử điểm uy tín.</div>';
    } catch (e) { document.getElementById('modalViolations').innerHTML = '<div class="modal-violation-item" style="color:var(--danger)">Không thể tải lịch sử điểm uy tín.</div>'; }
}

function closeUserModal() {
    document.getElementById('userModal').classList.remove('open');
    selectedUser = null;
}

function bindModalBackdrop() {
    document.getElementById('userModal')?.addEventListener('click', function (e) {
        if (e.target === this) closeUserModal();
    });
}

async function doBan() {
    if (!selectedUser || (currentAdmin && selectedUser.id === currentAdmin.id)) return;
    if (!confirm('Bạn có chắc muốn khóa tài khoản "' + (selectedUser.name || 'này') + '"?')) return;
    await changeUserStatus(selectedUser.id, 'banned');
}

async function doUnban() {
    if (!selectedUser) return;
    if (!confirm('Mở khóa tài khoản "' + (selectedUser.name || 'này') + '"?')) return;
    await changeUserStatus(selectedUser.id, 'active');
}

async function quickBan(userId, event) {
    event.stopPropagation();
    const u = allUsers.find(x => x.id === userId);
    if (!confirm('Khóa tài khoản "' + (u?.name || 'này') + '"?')) return;
    await changeUserStatus(userId, 'banned');
}

async function quickUnban(userId, event) {
    event.stopPropagation();
    await changeUserStatus(userId, 'active');
}

// Tận dụng logic ban/unban từ admin.html gốc (changeStatus → changeUserStatus)
async function changeUserStatus(userId, newStatus) {
    try {
        const { error } = await supabaseClient
            .from('profiles')
            .update({ status: newStatus })
            .eq('id', userId);

        if (error) throw error;
        showToast(
            newStatus === 'banned' ? '🔒 Đã khóa tài khoản!' : '🔓 Đã mở khóa tài khoản!',
            newStatus === 'banned' ? 'warning' : 'success'
        );
        closeUserModal();
        await loadUsers();
        await loadStats();
    } catch (err) {
        console.error('Lỗi đổi trạng thái:', err);
        showToast('Lỗi: ' + err.message, 'error');
    }
}

function viewUserHistory() {
    if (selectedUser) openUserModal(selectedUser.id);
}

// ─── POSTS (dữ liệu thật từ Supabase) ─────────────────────────
async function loadPosts() {
    const listEl = document.getElementById('postList');
    try {
        const { data, error } = await supabaseClient
            .from('posts')
            .select('*, profiles(id, name, avatar_url), comments(id)')
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) throw error;
        allPosts = data || [];
        renderPosts(allPosts);
    } catch (err) {
        console.error('Lỗi tải posts:', err);
        if (listEl) listEl.innerHTML = renderError(err.message);
    }
}

function renderPosts(posts) {
    const listEl = document.getElementById('postList');
    if (!listEl) return;
    if (!posts || posts.length === 0) {
        listEl.innerHTML = '<div class="empty-state"><div class="empty-icon">📝</div><div class="empty-title">Không có bài viết nào</div></div>';
        return;
    }
    listEl.innerHTML = posts.map(function (p) {
        const authorName   = p.profiles?.name || 'Người dùng';
        const authorAvatar = p.profiles?.avatar_url || '';
        const cmtCount     = Array.isArray(p.comments) ? p.comments.length : 0;
        const snippet      = (p.content || '').substring(0, 120) + ((p.content || '').length > 120 ? '...' : '');
        const avatarHtml   = authorAvatar ? '<img src="' + escHtml(authorAvatar) + '" alt="avatar">' : escHtml(getInitials(authorName));

        return '<div class="post-row">'
            + '<div class="user-avatar" style="flex-shrink:0">' + avatarHtml + '</div>'
            + '<div class="post-info">'
            +   '<div class="post-title-text">' + escHtml(p.title || '(Không có tiêu đề)') + '</div>'
            +   '<div class="post-meta-text">👤 ' + escHtml(authorName) + ' &nbsp;·&nbsp; 🕐 ' + formatDate(p.created_at) + ' &nbsp;·&nbsp; 💬 ' + cmtCount + ' bình luận &nbsp;·&nbsp; 🏷 ' + escHtml(p.topic || '') + '</div>'
            +   '<div class="post-snippet">' + escHtml(snippet) + '</div>'
            + '</div>'
            + '<div class="post-actions">'
            +   '<a href="forum.html" target="_blank" class="btn btn-info btn-sm"><i class="fa-solid fa-eye"></i> Xem</a>'
            +   '<button class="btn btn-danger btn-sm" onclick="deletePost(\'' + p.id + '\', event)"><i class="fa-solid fa-trash"></i> Xóa</button>'
            + '</div>'
            + '</div>';
    }).join('');
}

function filterPosts(searchVal) {
    const search = (typeof searchVal === 'string' ? searchVal : (document.getElementById('postSearch')?.value || '')).toLowerCase();
    const topic  = document.getElementById('postTopicFilter')?.value || '';
    const filtered = allPosts.filter(p => {
        const titleMatch = (p.title || '').toLowerCase().includes(search) || (p.content || '').toLowerCase().includes(search);
        const topicMatch = !topic || p.topic === topic;
        return titleMatch && topicMatch;
    });
    renderPosts(filtered);
}

async function deletePost(postId, event) {
    event.stopPropagation();
    if (!confirm('Xóa bài viết này? Thao tác không thể hoàn tác.')) return;
    try {
        // Xóa comments trước, sau đó xóa post (tận dụng logic forum)
        await supabaseClient.from('comments').delete().eq('post_id', postId);
        const { error } = await supabaseClient.from('posts').delete().eq('id', postId);
        if (error) throw error;
        showToast('🗑 Đã xóa bài viết!', 'success');
        await loadPosts();
        await loadStats();
    } catch (err) {
        console.error('Lỗi xóa post:', err);
        showToast('Lỗi xóa bài viết: ' + err.message, 'error');
    }
}

// ─── COMMENTS (dữ liệu thật từ Supabase) ──────────────────────
async function loadComments() {
    const listEl = document.getElementById('commentList');
    try {
        const { data, error } = await supabaseClient
            .from('comments')
            .select('*, profiles(id, name, avatar_url), posts(id, title)')
            .order('created_at', { ascending: false })
            .limit(100);

        if (error) throw error;
        allComments = data || [];
        renderComments(allComments);
    } catch (err) {
        console.error('Lỗi tải comments:', err);
        if (listEl) listEl.innerHTML = renderError(err.message);
    }
}

function renderComments(comments) {
    const listEl = document.getElementById('commentList');
    if (!listEl) return;
    if (!comments || comments.length === 0) {
        listEl.innerHTML = '<div class="empty-state"><div class="empty-icon">💬</div><div class="empty-title">Không có bình luận nào</div></div>';
        return;
    }
    listEl.innerHTML = comments.map(function (c) {
        const authorName   = c.profiles?.name || 'Người dùng';
        const authorAvatar = c.profiles?.avatar_url || '';
        const postTitle    = c.posts?.title || '(Không rõ bài viết)';
        const avatarHtml   = authorAvatar ? '<img src="' + escHtml(authorAvatar) + '" alt="avatar">' : escHtml(getInitials(authorName));

        return '<div class="comment-row">'
            + '<div class="user-avatar" style="flex-shrink:0;width:36px;height:36px;font-size:0.8rem">' + avatarHtml + '</div>'
            + '<div class="comment-info">'
            +   '<div class="comment-author">' + escHtml(authorName) + '</div>'
            +   '<div class="comment-content-text">' + escHtml(c.content || '') + '</div>'
            +   '<div class="comment-meta"><span>📝 ' + escHtml(postTitle) + '</span><span>🕐 ' + formatDate(c.created_at) + '</span></div>'
            + '</div>'
            + '<div class="comment-actions">'
            +   '<button class="btn btn-danger btn-sm" onclick="deleteComment(\'' + c.id + '\', event)"><i class="fa-solid fa-trash"></i> Xóa</button>'
            + '</div>'
            + '</div>';
    }).join('');
}

function filterComments(searchVal) {
    const search   = (searchVal || '').toLowerCase();
    const filtered = allComments.filter(c =>
        (c.content || '').toLowerCase().includes(search) ||
        (c.profiles?.name || '').toLowerCase().includes(search)
    );
    renderComments(filtered);
}

async function deleteComment(commentId, event) {
    event.stopPropagation();
    if (!confirm('Xóa bình luận này?')) return;
    try {
        const { error } = await supabaseClient.from('comments').delete().eq('id', commentId);
        if (error) throw error;
        showToast('🗑 Đã xóa bình luận!', 'success');
        await loadComments();
        await loadStats();
    } catch (err) {
        showToast('Lỗi: ' + err.message, 'error');
    }
}

// ─── TRUST SCORE (dữ liệu thật từ profiles.trust_score) ───────
async function loadTrustData() {
    const listEl = document.getElementById('trustUserList');
    if (!listEl) return;
    try {
        const { data, error } = await supabaseClient
            .from('profiles')
            .select('id, name, avatar_url, role, status, trust_score')
            .order('trust_score', { ascending: true })
            .limit(20);

        if (error) throw error;
        const users = data || [];
        if (users.length === 0) {
            listEl.innerHTML = '<div class="empty-state"><div class="empty-icon">⭐</div><div class="empty-title">Chưa có dữ liệu điểm uy tín</div></div>';
            return;
        }

        listEl.innerHTML = '<div class="table-wrap"><table class="data-table"><thead><tr><th>Người dùng</th><th>Điểm uy tín</th><th>Cấp độ</th><th>Trạng thái</th></tr></thead><tbody>'
            + users.map(function (u) {
                const score  = getTrustScore(u.trust_score);
                const levelClass = score >= 90 ? 'tl-excellent' : score >= 80 ? 'tl-good' : score >= 70 ? 'tl-warn' : score >= 50 ? 'tl-limit' : score >= 30 ? 'tl-vio' : 'tl-danger';
                const levelLabel = trustLevel(score);
                const avatarHtml = u.avatar_url ? '<img src="' + escHtml(u.avatar_url) + '" alt="avatar">' : escHtml(getInitials(u.name));
                return '<tr>'
                    + '<td><div style="display:flex;align-items:center;gap:10px"><div class="user-avatar" style="width:36px;height:36px;font-size:0.8rem">' + avatarHtml + '</div>' + escHtml(u.name || 'N/A') + '</div></td>'
                    + '<td><div style="display:flex;align-items:center;gap:8px"><strong>' + score + '/100</strong><span class="trust-level-card ' + levelClass + '" style="padding:3px 8px;font-size:0.7rem">' + levelLabel + '</span></div></td>'
                    + '<td>' + escHtml(levelLabel) + '</td>'
                    + '<td>' + (u.status === 'banned' ? '<span class="badge badge-banned">🔴 Khóa</span>' : '<span class="badge badge-active">🟢 Hoạt động</span>') + '</td>'
                    + '</tr>';
            }).join('')
            + '</tbody></table></div>';

    } catch (err) {
        listEl.innerHTML = renderError(err.message);
    }
}

function trustLevel(score) {
    return score >= 95 ? 'Đại sứ Cần Thơ' : score >= 90 ? 'Người đóng góp tích cực' : score >= 80 ? 'Thành viên uy tín' : score >= 70 ? 'Thành viên mới nổi' : score >= 50 ? 'Đang được theo dõi' : 'Uy tín thấp';
}

// ─── WARNED USERS ──────────────────────────────────────────────
async function loadWarnedUsers() {
    const listEl = document.getElementById('warnedUserList');
    if (!listEl) return;
    try {
        const { data, error } = await supabaseClient
            .from('profiles')
            .select('id, name, avatar_url, warning_count, violation_score, status')
            .gt('warning_count', 0)
            .order('warning_count', { ascending: false });

        if (error) throw error;
        const users = data || [];
        if (users.length === 0) {
            listEl.innerHTML = '<div class="empty-state" style="padding:20px"><div class="empty-icon" style="font-size:2rem">✅</div><div class="empty-title" style="font-size:0.88rem">Không có người dùng nào có cảnh cáo</div></div>';
            return;
        }
        listEl.innerHTML = users.map(function (u) {
            const score    = Math.max(0, 100 - (Number(u.violation_score) || 0));
            const avatarHtml = u.avatar_url ? '<img src="' + escHtml(u.avatar_url) + '" alt="avatar">' : escHtml(getInitials(u.name));
            return '<div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--border-soft)">'
                + '<div class="user-avatar" style="width:36px;height:36px;font-size:0.8rem">' + avatarHtml + '</div>'
                + '<div style="flex:1;min-width:0"><div style="font-weight:600;font-size:0.88rem">' + escHtml(u.name || 'N/A') + '</div>'
                + '<div style="font-size:0.75rem;color:var(--text-muted)">⭐ ' + score + '/100 &nbsp;·&nbsp; ⚠ ' + (Number(u.warning_count) || 0) + ' cảnh cáo</div></div>'
                + (u.status === 'banned' ? '<span class="badge badge-banned">🔴 Khóa</span>' : '<span class="badge badge-pending">⚠ Cảnh cáo</span>')
                + '</div>';
        }).join('');
    } catch (err) {
        listEl.innerHTML = renderError(err.message);
    }
}

// ─── UTILS ─────────────────────────────────────────────────────
function escHtml(text) {
    return String(text || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function formatDate(dateValue) {
    const d = new Date(dateValue);
    if (isNaN(d.getTime())) return 'N/A';
    return d.toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function renderError(msg) {
    return '<div class="empty-state"><div class="empty-icon">⚠️</div><div class="empty-title">Lỗi tải dữ liệu</div><div class="empty-sub">' + escHtml(msg) + '</div></div>';
}

// ─── TOAST ─────────────────────────────────────────────────────
function showToast(message, type) {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast toast-' + (type || 'success');
    const icons = { success: '✅', error: '❌', warning: '⚠️' };
    toast.innerHTML = '<span>' + (icons[type] || '✅') + '</span><span>' + escHtml(message) + '</span>';
    container.appendChild(toast);
    setTimeout(function () {
        toast.classList.add('fadeOut');
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}
