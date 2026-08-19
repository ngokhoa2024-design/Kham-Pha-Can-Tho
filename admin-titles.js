/* ============================================================
   admin-titles.js — Quản lý Title (Danh hiệu)
   Khám Phá Cần Thơ

   Phụ thuộc (đã có sẵn từ admin-logic.js / JS/supabase.js):
   - supabaseClient
   - escHtml(text), formatDate(dateValue), renderError(msg)
   - showToast(message, type), getInitials(name)
   - allUsers (mảng profiles đã load ở admin-logic.js)

   Bảng Supabase liên quan:
   - titles       (id, name, slug, icon, color, description, created_at)
   - user_titles  (id, user_id, title_id, granted_at)
   - profiles.active_title_id (FK -> titles.id, đã dùng ở titles.html/account.html)
   ============================================================ */

'use strict';

// ─── STATE ─────────────────────────────────────────────────────
let allTitlesAdmin = [];      // Toàn bộ danh hiệu trong hệ thống
let editingTitleId = null;    // Title đang được sửa trong modal

// ─── LOAD PANEL (gọi khi chuyển sang panel "titles") ──────────
async function loadTitlesPanel() {
    await loadTitlesList();

    // Đảm bảo dropdown luôn được cập nhật sau khi dữ liệu đã tải
    requestAnimationFrame(function () {
        populateGrantSelects();
    });
}

// ─── A. DANH SÁCH DANH HIỆU ────────────────────────────────────
async function loadTitlesList() {
    const listEl = document.getElementById('adminTitlesList');
    if (!listEl) return;

    listEl.innerHTML = '<div class="empty-state">'
        + '<div class="loading-spinner" style="width:36px;height:36px;border-width:3px"></div>'
        + '<div class="empty-title">Đang tải danh sách...</div></div>';

    try {
        const { data, error } = await supabaseClient
            .from('titles')
            .select('*')
            .order('created_at', { ascending: true });

        if (error) throw error;

        allTitlesAdmin = data || [];
        renderTitlesList(allTitlesAdmin);
        populateGrantSelects();

    } catch (err) {
        console.error('Lỗi tải danh sách title:', err);
        listEl.innerHTML = renderError(err.message);
        showToast('Lỗi tải danh sách title: ' + err.message, 'error');
    }
}

function renderTitlesList(titles) {
    const listEl = document.getElementById('adminTitlesList');
    if (!listEl) return;

    if (!titles || titles.length === 0) {
        listEl.innerHTML = '<div class="empty-state">'
            + '<div class="empty-icon">🏷️</div>'
            + '<div class="empty-title">Chưa có danh hiệu nào</div>'
            + '<div class="empty-sub">Tạo danh hiệu đầu tiên ở form bên dưới.</div></div>';
        return;
    }

    listEl.innerHTML = '<div class="table-wrap"><table class="data-table"><thead><tr>'
        + '<th>Danh hiệu</th><th>Slug</th><th>Mô tả</th><th>Ngày tạo</th><th>Thao tác</th>'
        + '</tr></thead><tbody>'
        + titles.map(function (t) {
            const color = /^#[0-9a-fA-F]{3,8}$/.test(t.color || '') ? t.color : '#0b8a7b';
            return '<tr>'
                + '<td><span style="display:inline-flex;align-items:center;gap:8px;padding:4px 10px;border-radius:999px;background:' + color + '22;color:' + color + ';font-weight:700">'
                +   escHtml(t.icon || '🏷️') + ' ' + escHtml(t.name || '') + '</span></td>'
                + '<td><code>' + escHtml(t.slug || '') + '</code></td>'
                + '<td style="max-width:260px">' + (t.description ? escHtml(t.description) : '<span style="color:var(--text-muted)">—</span>') + '</td>'
                + '<td>' + formatDate(t.created_at) + '</td>'
                + '<td>'
                +   '<button class="btn btn-info btn-sm" onclick="openEditTitleModal(\'' + t.id + '\')"><i class="fa-solid fa-pen"></i> Sửa</button> '
                +   '<button class="btn btn-danger btn-sm" onclick="deleteTitle(\'' + t.id + '\')"><i class="fa-solid fa-trash"></i> Xóa</button>'
                + '</td>'
                + '</tr>';
        }).join('')
        + '</tbody></table></div>';
}

// ─── B. TẠO TITLE MỚI ───────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('createTitleForm');
    if (form) {
        form.addEventListener('submit', async function (e) {
            e.preventDefault();
            await createTitle(form);
        });
    }
});

async function createTitle(form) {
    const btn = document.getElementById('createTitleSubmitBtn');
    const fd  = new FormData(form);

    const name        = (fd.get('title_name') || '').toString().trim();
    const slug        = (fd.get('title_slug') || '').toString().trim().toLowerCase();
    const icon        = (fd.get('title_icon') || '').toString().trim() || '🏷️';
    const color       = (fd.get('title_color') || '#0b8a7b').toString();
    const description = (fd.get('title_description') || '').toString().trim();

    if (!name || !slug) {
        showToast('Vui lòng nhập tên và slug cho danh hiệu.', 'error');
        return;
    }
    if (!/^[a-z0-9-]+$/.test(slug)) {
        showToast('Slug chỉ được chứa chữ thường, số và dấu gạch ngang.', 'error');
        return;
    }

    if (btn) { btn.disabled = true; btn.textContent = 'Đang tạo...'; }

    try {
        const { error } = await supabaseClient
            .from('titles')
            .insert({
                name: name,
                slug: slug,
                icon: icon,
                color: color,
                description: description || null
            });

        if (error) throw error;

        showToast('✅ Đã tạo danh hiệu "' + name + '"!', 'success');
        form.reset();
        // Reset lại giá trị mặc định sau khi form.reset()
        const iconInput = form.querySelector('[name="title_icon"]');
        if (iconInput) iconInput.value = '🏷️';
        const colorInput = form.querySelector('[name="title_color"]');
        if (colorInput) colorInput.value = '#0b8a7b';

        await loadTitlesList();

    } catch (err) {
        console.error('Lỗi tạo title:', err);
        if (err.code === '23505') {
            showToast('Slug này đã tồn tại, vui lòng chọn slug khác.', 'error');
        } else if (err.code === '42501' || (err.message || '').includes('policy')) {
            showToast('Bạn không có quyền tạo danh hiệu (kiểm tra RLS policy bảng titles).', 'error');
        } else {
            showToast('Lỗi tạo danh hiệu: ' + err.message, 'error');
        }
    } finally {
        if (btn) { btn.disabled = false; btn.textContent = '✨ Tạo Danh Hiệu'; }
    }
}

// ─── SỬA / XÓA TITLE ─────────────────────────────────────────
function openEditTitleModal(titleId) {
    const t = allTitlesAdmin.find(x => x.id === titleId);
    if (!t) return;

    editingTitleId = titleId;
    const modal = document.getElementById('editTitleModal');
    if (!modal) return;

    modal.querySelector('[name="edit_title_id"]').value          = t.id;
    modal.querySelector('[name="edit_title_name"]').value        = t.name || '';
    modal.querySelector('[name="edit_title_slug"]').value         = t.slug || '';
    modal.querySelector('[name="edit_title_icon"]').value         = t.icon || '';
    modal.querySelector('[name="edit_title_color"]').value        = /^#[0-9a-fA-F]{3,8}$/.test(t.color || '') ? t.color : '#0b8a7b';
    modal.querySelector('[name="edit_title_description"]').value  = t.description || '';

    modal.classList.add('open');
}

function closeEditTitleModal() {
    editingTitleId = null;
    const modal = document.getElementById('editTitleModal');
    if (modal) modal.classList.remove('open');
}

async function saveEditTitle() {
    if (!editingTitleId) return;
    const modal = document.getElementById('editTitleModal');
    if (!modal) return;

    const name        = modal.querySelector('[name="edit_title_name"]').value.trim();
    const slug        = modal.querySelector('[name="edit_title_slug"]').value.trim().toLowerCase();
    const icon        = modal.querySelector('[name="edit_title_icon"]').value.trim() || '🏷️';
    const color       = modal.querySelector('[name="edit_title_color"]').value;
    const description = modal.querySelector('[name="edit_title_description"]').value.trim();

    if (!name || !slug) {
        showToast('Vui lòng nhập tên và slug cho danh hiệu.', 'error');
        return;
    }
    if (!/^[a-z0-9-]+$/.test(slug)) {
        showToast('Slug chỉ được chứa chữ thường, số và dấu gạch ngang.', 'error');
        return;
    }

    const btn = document.getElementById('editTitleSaveBtn');
    if (btn) { btn.disabled = true; btn.textContent = 'Đang lưu...'; }

    try {
        const { error } = await supabaseClient
            .from('titles')
            .update({ name, slug, icon, color, description: description || null })
            .eq('id', editingTitleId);

        if (error) throw error;

        showToast('✅ Đã lưu thay đổi!', 'success');
        closeEditTitleModal();
        await loadTitlesList();

    } catch (err) {
        console.error('Lỗi sửa title:', err);
        if (err.code === '23505') {
            showToast('Slug này đã tồn tại, vui lòng chọn slug khác.', 'error');
        } else {
            showToast('Lỗi lưu thay đổi: ' + err.message, 'error');
        }
    } finally {
        if (btn) { btn.disabled = false; btn.textContent = 'Lưu thay đổi'; }
    }
}

async function deleteTitle(titleId) {
    const t = allTitlesAdmin.find(x => x.id === titleId);
    const label = t ? (t.icon || '🏷️') + ' ' + t.name : 'danh hiệu này';
    if (!confirm('Xóa ' + label + '? Hành động này sẽ gỡ danh hiệu khỏi mọi user đang sở hữu.')) return;

    try {
        // Gỡ khỏi profiles đang active title này trước (tránh lỗi FK)
        await supabaseClient.from('profiles').update({ active_title_id: null }).eq('active_title_id', titleId);
        // Xóa các bản ghi sở hữu
        await supabaseClient.from('user_titles').delete().eq('title_id', titleId);
        // Xóa title
        const { error } = await supabaseClient.from('titles').delete().eq('id', titleId);
        if (error) throw error;

        showToast('🗑 Đã xóa danh hiệu!', 'success');
        await loadTitlesList();

    } catch (err) {
        console.error('Lỗi xóa title:', err);
        showToast('Lỗi xóa danh hiệu: ' + err.message, 'error');
    }
}

// ─── C. CẤP TITLE CHO USER ──────────────────────────────────────
function populateGrantSelects() {
    const userSelect       = document.getElementById('grantUserSelect');
    const titleSelect      = document.getElementById('grantTitleSelect');
    const manageUserSelect = document.getElementById('manageTitleUserSelect');

    if (userSelect && Array.isArray(allUsers)) {
        const current = userSelect.value;
        userSelect.innerHTML = '<option value="">— Chọn user —</option>'
            + allUsers.map(u => '<option value="' + u.id + '">' + escHtml(u.name || u.id) + '</option>').join('');
        userSelect.value = current;
    }

    if (manageUserSelect && Array.isArray(allUsers)) {
        const current = manageUserSelect.value;
        manageUserSelect.innerHTML = '<option value="">— Chọn user để xem title —</option>'
            + allUsers.map(u => '<option value="' + u.id + '">' + escHtml(u.name || u.id) + '</option>').join('');
        manageUserSelect.value = current;
    }

    if (titleSelect) {
        const current = titleSelect.value;
        titleSelect.innerHTML = '<option value="">— Chọn danh hiệu —</option>'
            + allTitlesAdmin.map(t => '<option value="' + t.id + '">' + escHtml(t.icon || '🏷️') + ' ' + escHtml(t.name || '') + '</option>').join('');
        titleSelect.value = current;
    }
}

async function grantTitleToUser() {
    const userId  = document.getElementById('grantUserSelect')?.value;
    const titleId = document.getElementById('grantTitleSelect')?.value;
    const msgEl   = document.getElementById('grantTitleMessage');
    const btn     = document.getElementById('grantTitleBtn');

    if (!userId || !titleId) {
        if (msgEl) { msgEl.textContent = 'Chọn cả user và danh hiệu.'; msgEl.style.color = '#d13c27'; }
        return;
    }

    if (btn) btn.disabled = true;
    if (msgEl) { msgEl.textContent = 'Đang cấp...'; msgEl.style.color = 'var(--text-muted)'; }

    try {
        // Kiểm tra đã sở hữu chưa để tránh trùng lặp
        const { data: existing, error: checkErr } = await supabaseClient
            .from('user_titles')
            .select('id')
            .eq('user_id', userId)
            .eq('title_id', titleId)
            .maybeSingle();

        if (checkErr) throw checkErr;

        if (existing) {
            if (msgEl) { msgEl.textContent = 'User đã sở hữu danh hiệu này rồi.'; msgEl.style.color = '#d13c27'; }
            return;
        }

        const { error } = await supabaseClient
            .from('user_titles')
            .insert({ user_id: userId, title_id: titleId });

        if (error) throw error;

        if (msgEl) { msgEl.textContent = '✅ Đã cấp danh hiệu thành công!'; msgEl.style.color = '#138c36'; }
        showToast('🎁 Đã cấp danh hiệu cho user!', 'success');

        // Nếu đang xem đúng user này ở mục D, làm mới danh sách
        const manageUserSelect = document.getElementById('manageTitleUserSelect');
        if (manageUserSelect && manageUserSelect.value === userId) {
            await loadUserTitleManagement();
        }

    } catch (err) {
        console.error('Lỗi cấp title:', err);
        if (msgEl) { msgEl.textContent = 'Lỗi: ' + err.message; msgEl.style.color = '#d13c27'; }
        showToast('Lỗi cấp danh hiệu: ' + err.message, 'error');
    } finally {
        if (btn) btn.disabled = false;
    }
}

// ─── D. XEM & THU HỒI TITLE CỦA USER ────────────────────────────
async function loadUserTitleManagement() {
    const userId = document.getElementById('manageTitleUserSelect')?.value;
    const listEl = document.getElementById('userTitleManageList');
    if (!listEl) return;

    if (!userId) {
        listEl.innerHTML = '<p style="color:var(--text-muted);font-size:0.88rem">Chọn user ở trên để xem danh hiệu.</p>';
        return;
    }

    listEl.innerHTML = '<div class="empty-state">'
        + '<div class="loading-spinner" style="width:32px;height:32px;border-width:3px"></div>'
        + '<div class="empty-title">Đang tải...</div></div>';

    try {
        const [userTitlesRes, profileRes] = await Promise.all([
            supabaseClient
                .from('user_titles')
                .select('id, title_id, granted_at, titles(id, name, icon, color)')
                .eq('user_id', userId),
            supabaseClient
                .from('profiles')
                .select('active_title_id')
                .eq('id', userId)
                .single()
        ]);

        if (userTitlesRes.error) throw userTitlesRes.error;

        const owned         = userTitlesRes.data || [];
        const activeTitleId = profileRes.data?.active_title_id || null;

        if (owned.length === 0) {
            listEl.innerHTML = '<div class="empty-state" style="padding:20px">'
                + '<div class="empty-icon" style="font-size:1.6rem">🏷️</div>'
                + '<div class="empty-title" style="font-size:0.88rem">User này chưa có danh hiệu nào</div></div>';
            return;
        }

        listEl.innerHTML = owned.map(function (ut) {
            const t = ut.titles;
            if (!t) return '';
            const color    = /^#[0-9a-fA-F]{3,8}$/.test(t.color || '') ? t.color : '#0b8a7b';
            const isActive = t.id === activeTitleId;
            return '<div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--border-soft)">'
                + '<span style="display:inline-flex;align-items:center;gap:6px;padding:4px 10px;border-radius:999px;background:' + color + '22;color:' + color + ';font-weight:700">'
                +   escHtml(t.icon || '🏷️') + ' ' + escHtml(t.name || '') + '</span>'
                + (isActive ? '<span class="badge badge-active">✅ Đang dùng</span>' : '')
                + '<span style="font-size:0.75rem;color:var(--text-muted);margin-left:auto">Cấp lúc: ' + formatDate(ut.granted_at) + '</span>'
                + '<button class="btn btn-danger btn-sm" onclick="revokeUserTitle(\'' + ut.id + '\', \'' + userId + '\', \'' + t.id + '\')">'
                +   '<i class="fa-solid fa-ban"></i> Thu hồi</button>'
                + '</div>';
        }).join('');

    } catch (err) {
        console.error('Lỗi tải title của user:', err);
        listEl.innerHTML = renderError(err.message);
    }
}

async function revokeUserTitle(userTitleId, userId, titleId) {
    if (!confirm('Thu hồi danh hiệu này khỏi user?')) return;

    try {
        const { error } = await supabaseClient.from('user_titles').delete().eq('id', userTitleId);
        if (error) throw error;

        // Nếu user đang dùng (active) đúng title bị thu hồi, gỡ active luôn
        await supabaseClient
            .from('profiles')
            .update({ active_title_id: null })
            .eq('id', userId)
            .eq('active_title_id', titleId);

        showToast('🗑 Đã thu hồi danh hiệu!', 'success');
        await loadUserTitleManagement();

    } catch (err) {
        console.error('Lỗi thu hồi title:', err);
        showToast('Lỗi thu hồi danh hiệu: ' + err.message, 'error');
    }
}
