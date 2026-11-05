/**
 * titles-helper.js — Khám Phá Cần Thơ
 * Module dùng chung để hiển thị Title/Danh hiệu trên toàn website.
 *
 * Cách dùng:
 *   <script src="JS/titles-helper.js"></script>
 *   const display = TitlesHelper.formatUsernameWithTitle(profile);
 *   // → "abcd-Supporter" hoặc "abcd"
 */

'use strict';

const TitlesHelper = (() => {

    // ─── FORMAT USERNAME + TITLE ────────────────────────────────────
    /**
     * Trả về chuỗi hiển thị: "username-TitleName" hoặc "username"
     * @param {Object} profile - object có `name` và optionally `active_title` (joined object từ titles)
     *                           hoặc `active_title_name` (string)
     * @returns {string}
     */
    function formatUsernameWithTitle(profile) {
        if (!profile) return '';
        const username = profile.name || '';
        const titleName = _getActiveTitleName(profile);
        if (!titleName) return username;
        return username + '-' + titleName;
    }

    /**
     * Trả về HTML badge cho title, hoặc '' nếu không có title.
     * @param {Object|null} title - object title { name, icon, color } hoặc null
     * @returns {string} HTML string
     */
    function renderTitleBadge(title) {
        if (!title || !title.name) return '';
        const icon  = _escHtml(title.icon  || '🏷️');
        const name  = _escHtml(title.name);
        const color = _safeColor(title.color);
        return `<span class="title-badge" style="--badge-color:${color}" title="Danh hiệu: ${name}">${icon} ${name}</span>`;
    }

    /**
     * Trả về HTML hiển thị username kèm badge title (nếu có).
     * Dùng cho danh sách user, forum, comment, v.v.
     * @param {Object} profile
     * @returns {string} HTML string
     */
    function renderUsernameWithBadge(profile) {
        if (!profile) return '';
        const username = _escHtml(profile.name || '');
        const title    = _getActiveTitleObject(profile);
        const badge    = renderTitleBadge(title);
        if (!badge) return username;
        return `${username} ${badge}`;
    }

    /**
     * Lấy title đang active của user từ Supabase (async).
     * Trả về object title hoặc null.
     * @param {string} userId
     * @param {Object} supabaseClient
     * @returns {Promise<Object|null>}
     */
    async function getUserActiveTitle(userId, supabaseClient) {
        if (!userId || !supabaseClient) return null;
        try {
            const { data, error } = await supabaseClient
                .from('profiles')
                .select('active_title_id, titles:active_title_id(id, name, slug, icon, color)')
                .eq('id', userId)
                .single();
            if (error || !data || !data.active_title_id) return null;
            return data.titles || null;
        } catch (e) {
            console.error('TitlesHelper.getUserActiveTitle:', e);
            return null;
        }
    }

    /**
     * Lấy profile kèm active title (join) — dùng khi load user display.
     * @param {string} userId
     * @param {Object} supabaseClient
     * @returns {Promise<Object|null>} profile object có thêm `.titles`
     */
    async function getProfileWithTitle(userId, supabaseClient) {
        if (!userId || !supabaseClient) return null;
        try {
            const { data, error } = await supabaseClient
                .from('profiles')
                .select('*, titles:active_title_id(id, name, slug, icon, color)')
                .eq('id', userId)
                .single();
            if (error) return null;
            return data;
        } catch (e) {
            console.error('TitlesHelper.getProfileWithTitle:', e);
            return null;
        }
    }

    // ─── INTERNAL HELPERS ───────────────────────────────────────────
    function _getActiveTitleName(profile) {
        // Từ join: profile.titles (object) hoặc profile.active_title (object)
        if (profile.titles?.name)       return profile.titles.name;
        if (profile.active_title?.name) return profile.active_title.name;
        // Từ flat field (nếu có)
        if (profile.active_title_name)  return profile.active_title_name;
        return null;
    }

    function _getActiveTitleObject(profile) {
        if (profile.titles?.name)       return profile.titles;
        if (profile.active_title?.name) return profile.active_title;
        return null;
    }

    function _escHtml(text) {
        return String(text || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function _safeColor(color) {
        // Chỉ cho phép hex color để tránh XSS
        return /^#[0-9a-fA-F]{3,8}$/.test(color || '') ? color : '#0b8a7b';
    }

    // ─── PUBLIC API ─────────────────────────────────────────────────
    return {
        formatUsernameWithTitle,
        renderTitleBadge,
        renderUsernameWithBadge,
        getUserActiveTitle,
        getProfileWithTitle,
    };
})();

// Expose globally
window.TitlesHelper = TitlesHelper;
