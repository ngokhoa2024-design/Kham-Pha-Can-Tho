/**
 * admin-titles.js — Quản lý Title/Danh hiệu trong Admin Dashboard
 * Khám Phá Cần Thơ
 *
 * Sử dụng supabaseClient và currentAdmin từ admin-logic.js
 * Sử dụng showToast(), escHtml(), formatDate() từ admin-logic.js
 */

'use strict';

/* ── STATE ── */
let allTitlesList  = [];   // Tất cả titles trong hệ thống
let allUsersCache  = [];   // Cache users từ admin-logic allUsers
let selectedTitleEdit = null; // Title đang sửa

/* ── INIT PANEL ── */
/**
 * Gọi khi admin mở panel "titles".
 * Tải song song danh sách titles và chuẩn bị UI.
 */
async function loadTitlesPanel() {
    await Promise.all([
        loadTitlesList(),
        refreshUsersForTitleGrant()
    ]);
    bindTitleFormEvents();
}

/* ── A. DANH SÁCH TITLE ── */
async function loadTitlesList() {
    const listEl = document.getElementById('adminTitlesList');
    if (!listEl) return;

    listEl.innerHTML = renderTitlesLoading();

    try {
        // Lấy titles kèm số user sở hữu
        const { data: titles, error } = await supabaseClient
            .from('titles')
            .select('*')
            .order('created_at', { ascending: true });

        if (error) throw error;

        allTitlesList = titles || [];

        if (!allTitlesList.length) {
            listEl.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">🏷️</div>
                    <div class="empty-title">Chưa có danh hiệu nào</div>
                    <div class="empty-sub">Tạo danh hiệu đầu tiên bằng form bên dưới.</div>
                </div>`;
            return;
        }

        // Đếm user_titles theo từng title_id
        const { data: counts } = await supabaseClient
            .from('user_titles')
            .select('title_id');

        const countMap = {};
        (counts || []).forEach(r => {
            countMap[r.title_id] = (countMap[r.title_id] || 0) + 1;
        });

        listEl.innerHTML = `
            <div class="table-wrap">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Icon</th>
                            <th>Tên</th>
                            <th>Slug</th>
                            <th>Mô tả</th>
                            <th>Màu</th>
                            <th>Ngày tạo</th>
                            <th>Số user</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${allTitlesList.map(t => {
                            const color = safeColorAdmin(t.color);
                            const ownerCount = countMap[t.id] || 0;
                            return `
                            <tr>
                                <td><span style="font-size:1.4rem">${escHtml(t.icon || '🏷️')}</span></td>
                                <td><strong style="color:${color}">${escHtml(t.name)}</strong></td>
                                <td><code style="font-size:0.78rem;color:var(--text-sub)">${escHtml(t.slug)}</code></td>
                                <td style="font-size:0.82rem;max-width:180px">${escHtml(t.description || '—')}</td>
                                <td>
                                    <span style="display:inline-flex;align-items:center;gap:6px">
                                        <span style="width:16px;height:16px;border-radius:50%;background:${color};display:inline-block;border:1px solid #ddd"></span>
                                        <code style="font-size:0.72rem">${escHtml(t.color || '')}</code>
                                    </span>
                                </td>
                                <td style="font-size:0.78rem;color:var(--text-sub)">${formatDate(t.created_at)}</td>
                                <td>
                                    <span class="badge ${ownerCount > 0 ? 'badge-active' : 'badge-neutral'}">${ownerCount} user</span>
                                </td>
                                <td>
                                    <div style="display:flex;gap:6px;flex-wrap:wrap">
                                        <button class="btn btn-info btn-sm" onclick="openEditTitleModal('${escHtml(t.id)}')">
                                            <i class="fa-solid fa-pen"></i> Sửa
                                        </button>
                                        <button class="btn btn-danger btn-sm" onclick="deleteTitleAdmin('${escHtml(t.id)}', '${escHtml(t.name)}')">
                                            <i class="fa-solid fa-trash"></i> Xóa
                                        </button>
                                    </div>
                                </td>
                            </tr>`;
                        }).join('')}
                    </tbody>
                </table>
            </div>`;

    } catch (err) {
        console.error('Lỗi tải danh sách title:', err);
        listEl.innerHTML = renderError(err.message);
    }
}

/* ── B. TẠO TITLE MỚI ── */
function bindTitleFormEvents() {
    const form = document.getElementById('createTitleForm');
    if (!form) return;
    // Tránh bind nhiều lần
    if (form.dataset.bound) return;
    form.dataset.bound = '1';

    // Auto-generate slug từ tên
    const nameInput = form.querySelector('[name="title_name"]');
    const slugInput = form.querySelector('[name="title_slug"]');
    if (nameInput && slugInput) {
        nameInput.addEventListener('input', function () {
            if (!slugInput.dataset.manualEdit) {
                slugInput.value = generateSlug(this.value);
            }
        });
        slugInput.addEventListener('input', function () {
            this.dataset.manualEdit = this.value ? '1' : '';
        });
    }

    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        await createTitleAdmin(form);
    });
}

async function createTitleAdmin(form) {
    if (!currentAdmin) return;

    const name        = (form.querySelector('[name="title_name"]')?.value || '').trim();
    const slug        = (form.querySelector('[name="title_slug"]')?.value || '').trim();
    const description = (form.querySelector('[name="title_description"]')?.value || '').trim();
    const icon        = (form.querySelector('[name="title_icon"]')?.value || '').trim() || '🏷️';
    const color       = (form.querySelector('[name="title_color"]')?.value || '').trim() || '#0b8a7b';

    if (!name) { showToast('Tên danh hiệu không được trống.', 'error'); return; }
    if (!slug) { showToast('Slug không được trống.', 'error'); return; }
    if (!/^[a-z0-9-]+$/.test(slug)) {
        showToast('Slug chỉ được chứa chữ thường, số và dấu gạch ngang.', 'error');
        return;
    }

    const submitBtn = form.querySelector('[type="submit"]');
    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Đang tạo...'; }

    try {
        const { data, error } = await supabaseClient
            .from('titles')
            .insert({
                name,
                slug,
                description: description || null,
                icon,
                color,
                created_by: currentAdmin.id
            })
            .select()
            .single();

        if (error) throw error;

        showToast(`✅ Đã tạo danh hiệu: ${icon} ${name}`, 'success');
        form.reset();
        delete form.querySelector('[name="title_slug"]').dataset.manualEdit;

        // Cập nhật danh sách ngay
        await loadTitlesList();

        // Refresh dropdown cấp title
        refreshUsersForTitleGrant();

    } catch (err) {
        console.error('Lỗi tạo title:', err);
        if (err.code === '23505') {
            showToast('Slug đã tồn tại. Vui lòng dùng slug khác.', 'error');
        } else {
            showToast('Lỗi tạo danh hiệu: ' + err.message, 'error');
        }
    } finally {
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Tạo Danh Hiệu'; }
    }
}

/* ── SỬA TITLE ── */
function openEditTitleModal(titleId) {
    const title = allTitlesList.find(t => t.id === titleId);
    if (!title) return;
    selectedTitleEdit = title;

    const modal = document.getElementById('editTitleModal');
    if (!modal) return;

    modal.querySelector('[name="edit_title_id"]').value          = title.id;
    modal.querySelector('[name="edit_title_name"]').value        = title.name;
    modal.querySelector('[name="edit_title_slug"]').value        = title.slug;
    modal.querySelector('[name="edit_title_description"]').value = title.description || '';
    modal.querySelector('[name="edit_title_icon"]').value        = title.icon || '🏷️';
    modal.querySelector('[name="edit_title_color"]').value       = title.color || '#0b8a7b';

    modal.classList.add('open');
}

function closeEditTitleModal() {
    const modal = document.getElementById('editTitleModal');
    if (modal) modal.classList.remove('open');
    selectedTitleEdit = null;
}

async function saveEditTitle() {
    if (!currentAdmin || !selectedTitleEdit) return;

    const modal = document.getElementById('editTitleModal');
    if (!modal) return;

    const name        = (modal.querySelector('[name="edit_title_name"]')?.value || '').trim();
    const slug        = (modal.querySelector('[name="edit_title_slug"]')?.value || '').trim();
    const description = (modal.querySelector('[name="edit_title_description"]')?.value || '').trim();
    const icon        = (modal.querySelector('[name="edit_title_icon"]')?.value || '').trim() || '🏷️';
    const color       = (modal.querySelector('[name="edit_title_color"]')?.value || '').trim() || '#0b8a7b';

    if (!name) { showToast('Tên không được trống.', 'error'); return; }
    if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
        showToast('Slug không hợp lệ.', 'error'); return;
    }

    const saveBtn = modal.querySelector('#editTitleSaveBtn');
    if (saveBtn) { saveBtn.disabled = true; saveBtn.textContent = 'Đang lưu...'; }

    try {
        const { error } = await supabaseClient
            .from('titles')
            .update({ name, slug, description: description || null, icon, color })
            .eq('id', selectedTitleEdit.id);

        if (error) throw error;

        showToast(`✅ Đã cập nhật danh hiệu: ${icon} ${name}`, 'success');
        closeEditTitleModal();
        await loadTitlesList();
        refreshUsersForTitleGrant();

    } catch (err) {
        if (err.code === '23505') {
            showToast('Slug đã tồn tại. Vui lòng dùng slug khác.', 'error');
        } else {
            showToast('Lỗi cập nhật: ' + err.message, 'error');
        }
    } finally {
        if (saveBtn) { saveBtn.disabled = false; saveBtn.textContent = 'Lưu thay đổi'; }
    }
}

/* ── XÓA TITLE ── */
async function deleteTitleAdmin(titleId, titleName) {
    if (!currentAdmin) return;
    if (!confirm(`Bạn chắc chắn muốn xóa danh hiệu "${titleName}"?\n\nTất cả user đang sở hữu danh hiệu này sẽ bị thu hồi.`)) return;

    try {
        const { error } = await supabaseClient
            .from('titles')
            .delete()
            .eq('id', titleId);

        if (error) throw error;

        showToast(`🗑 Đã xóa danh hiệu: ${titleName}`, 'success');
        await loadTitlesList();

    } catch (err) {
        showToast('Lỗi xóa danh hiệu: ' + err.message, 'error');
    }
}

/* ── C. CẤP TITLE CHO USER ── */
async function refreshUsersForTitleGrant() {
    // Lấy danh sách users
    if (!allUsers || !allUsers.length) return;
    allUsersCache = allUsers;
    populateGrantSelects();
}

function populateGrantSelects() {
    // Populate user select trong form cấp title
    const userSel  = document.getElementById('grantUserSelect');
    const titleSel = document.getElementById('grantTitleSelect');

    if (userSel) {
        userSel.innerHTML = `<option value="">— Chọn user —</option>` +
            (allUsersCache || []).map(u =>
                `<option value="${escHtml(u.id)}">${escHtml(u.name || 'Chưa có tên')} (${escHtml(u.id.slice(0,8))}...)</option>`
            ).join('');
    }

    if (titleSel) {
        titleSel.innerHTML = `<option value="">— Chọn danh hiệu —</option>` +
            allTitlesList.map(t =>
                `<option value="${escHtml(t.id)}">${escHtml(t.icon || '')} ${escHtml(t.name)}</option>`
            ).join('');
    }

    // Cũng populate user select trong quản lý title của user
    const manageUserSel = document.getElementById('manageTitleUserSelect');
    if (manageUserSel) {
        manageUserSel.innerHTML = `<option value="">— Chọn user để xem title —</option>` +
            (allUsersCache || []).map(u =>
                `<option value="${escHtml(u.id)}">${escHtml(u.name || 'Chưa có tên')} (${escHtml(u.id.slice(0,8))}...)</option>`
            ).join('');
    }
}

async function grantTitleToUser() {
    if (!currentAdmin) return;

    const userId  = document.getElementById('grantUserSelect')?.value;
    const titleId = document.getElementById('grantTitleSelect')?.value;
    const msgEl   = document.getElementById('grantTitleMessage');

    const setMsg = (text, type) => {
        if (!msgEl) return;
        msgEl.textContent = text;
        msgEl.style.color = type === 'error' ? 'var(--danger)' : type === 'success' ? 'var(--success)' : 'var(--text-sub)';
    };

    if (!userId)  { setMsg('Vui lòng chọn user.', 'error'); return; }
    if (!titleId) { setMsg('Vui lòng chọn danh hiệu.', 'error'); return; }

    const grantBtn = document.getElementById('grantTitleBtn');
    if (grantBtn) { grantBtn.disabled = true; grantBtn.textContent = 'Đang cấp...'; }

    try {
        const { data, error } = await supabaseClient
            .from('user_titles')
            .insert({ user_id: userId, title_id: titleId })
            .select('id')
            .single();

        if (error) {
            if (error.code === '23505') {
                setMsg('User đã sở hữu danh hiệu này.', 'error');
            } else {
                throw error;
            }
            return;
        }

        const title = allTitlesList.find(t => t.id === titleId);
        const user  = allUsersCache.find(u => u.id === userId);
        showToast(`✅ Đã cấp "${title?.name || 'title'}" cho "${user?.name || 'user'}"`, 'success');
        setMsg(`✅ Đã cấp thành công!`, 'success');

        // Refresh danh sách titles (count)
        await loadTitlesList();

    } catch (err) {
        showToast('Lỗi cấp danh hiệu: ' + err.message, 'error');
        setMsg('Lỗi: ' + err.message, 'error');
    } finally {
        if (grantBtn) { grantBtn.disabled = false; grantBtn.textContent = 'Cấp Danh Hiệu'; }
    }
}

/* ── D. QUẢN LÝ TITLE CỦA USER ── */
async function loadUserTitleManagement() {
    const userId = document.getElementById('manageTitleUserSelect')?.value;
    const listEl = document.getElementById('userTitleManageList');
    if (!listEl) return;

    if (!userId) {
        listEl.innerHTML = '<p style="color:var(--text-muted);font-size:0.88rem">Chọn user ở trên để xem danh hiệu.</p>';
        return;
    }

    listEl.innerHTML = renderTitlesLoading(true);

    try {
        // Lấy tất cả title của user đó
        const { data: userTitles, error } = await supabaseClient
            .from('user_titles')
            .select('*, title:title_id(*)')
            .eq('user_id', userId)
            .order('unlocked_at', { ascending: false });

        if (error) throw error;

        // Lấy profile để biết active_title_id
        const { data: profile } = await supabaseClient
            .from('profiles')
            .select('name, active_title_id')
            .eq('id', userId)
            .single();

        const user       = allUsersCache.find(u => u.id === userId);
        const userName   = profile?.name || user?.name || 'User này';
        const activeTitleId = profile?.active_title_id || null;

        if (!userTitles || !userTitles.length) {
            listEl.innerHTML = `
                <p style="color:var(--text-muted);font-size:0.88rem">
                    <strong>${escHtml(userName)}</strong> chưa có danh hiệu nào.
                </p>`;
            return;
        }

        listEl.innerHTML = `
            <p style="font-weight:600;margin-bottom:12px;font-size:0.9rem">
                Danh hiệu của <span style="color:var(--primary)">${escHtml(userName)}</span>:
            </p>
            <div style="display:flex;flex-direction:column;gap:10px">
                ${userTitles.map(ut => {
                    const t = ut.title;
                    if (!t) return '';
                    const isActive = t.id === activeTitleId;
                    const color = safeColorAdmin(t.color);
                    return `
                    <div style="display:flex;align-items:center;gap:12px;padding:12px 14px;background:var(--neutral-light);border-radius:var(--r-sm);border:1.5px solid ${isActive ? color : 'var(--border)'}">
                        <span style="font-size:1.3rem">${escHtml(t.icon || '🏷️')}</span>
                        <div style="flex:1;min-width:0">
                            <div style="font-weight:600;color:${color}">${escHtml(t.name)}</div>
                            <div style="font-size:0.75rem;color:var(--text-muted)">
                                Mở khóa: ${formatDate(ut.unlocked_at)}
                                ${isActive ? ' · <strong style="color:' + color + '">Đang sử dụng</strong>' : ''}
                            </div>
                        </div>
                        <button class="btn btn-danger btn-sm" onclick="revokeTitleFromUser('${escHtml(userId)}', '${escHtml(t.id)}', '${escHtml(t.name)}')">
                            <i class="fa-solid fa-xmark"></i> Thu hồi
                        </button>
                    </div>`;
                }).join('')}
            </div>`;

    } catch (err) {
        listEl.innerHTML = renderError(err.message);
    }
}

async function revokeTitleFromUser(userId, titleId, titleName) {
    if (!currentAdmin) return;
    if (!confirm(`Thu hồi danh hiệu "${titleName}" của user này?`)) return;

    try {
        // Xóa khỏi user_titles
        const { error } = await supabaseClient
            .from('user_titles')
            .delete()
            .eq('user_id', userId)
            .eq('title_id', titleId);

        if (error) throw error;

        // Nếu title đó đang active → reset active_title_id
        const { data: profile } = await supabaseClient
            .from('profiles')
            .select('active_title_id')
            .eq('id', userId)
            .single();

        if (profile?.active_title_id === titleId) {
            await supabaseClient
                .from('profiles')
                .update({ active_title_id: null })
                .eq('id', userId);
        }

        showToast(`✅ Đã thu hồi danh hiệu "${titleName}"`, 'success');

        // Refresh
        await Promise.all([loadTitlesList(), loadUserTitleManagement()]);

    } catch (err) {
        showToast('Lỗi thu hồi danh hiệu: ' + err.message, 'error');
    }
}

/* ── UTILS ── */
function generateSlug(text) {
    return (text || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .slice(0, 50);
}

function safeColorAdmin(color) {
    return /^#[0-9a-fA-F]{3,8}$/.test(color || '') ? color : '#0b8a7b';
}

function renderTitlesLoading(compact = false) {
    if (compact) {
        return '<div style="color:var(--text-muted);font-size:0.88rem">Đang tải...</div>';
    }
    return `<div class="empty-state">
        <div class="loading-spinner" style="width:36px;height:36px;border-width:3px"></div>
        <div class="empty-title">Đang tải danh sách...</div>
    </div>`;
}
