/**
 * mobile-nav.js — Xử lý Hamburger Menu & Mobile Sidebar
 * Website: Khám Phá Cần Thơ
 * Không ảnh hưởng tới JS/logic hiện tại (Supabase, Buddy, Account...)
 */
(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {

        const hamburgerBtn = document.getElementById('hamburgerBtn');
        const mobileNav = document.getElementById('mobileNav');
        const mobileOverlay = document.getElementById('mobileOverlay');
        const mobileNavClose = document.getElementById('mobileNavClose');

        if (!hamburgerBtn || !mobileNav) return; // guard: nếu không có nav mobile thì bỏ qua

        // ── Mở sidebar ──────────────────────────────────────────
        function openNav() {
            hamburgerBtn.classList.add('is-open');
            hamburgerBtn.setAttribute('aria-expanded', 'true');
            mobileNav.classList.add('is-open');
            document.body.classList.add('mobile-nav-open');

            if (mobileOverlay) {
                mobileOverlay.classList.add('is-visible');
                // tick nhỏ để transition opacity hoạt động
                requestAnimationFrame(function () {
                    requestAnimationFrame(function () {
                        mobileOverlay.classList.add('is-active');
                    });
                });
            }
        }

        // ── Đóng sidebar ────────────────────────────────────────
        function closeNav() {
            hamburgerBtn.classList.remove('is-open');
            hamburgerBtn.setAttribute('aria-expanded', 'false');
            mobileNav.classList.remove('is-open');
            document.body.classList.remove('mobile-nav-open');

            if (mobileOverlay) {
                mobileOverlay.classList.remove('is-active');
                // Chờ transition xong mới ẩn hoàn toàn
                mobileOverlay.addEventListener('transitionend', function handler() {
                    mobileOverlay.classList.remove('is-visible');
                    mobileOverlay.removeEventListener('transitionend', handler);
                });
            }
        }

        // ── Toggle khi bấm hamburger ────────────────────────────
        hamburgerBtn.addEventListener('click', function () {
            if (mobileNav.classList.contains('is-open')) {
                closeNav();
            } else {
                openNav();
            }
        });

        // ── Nút X ───────────────────────────────────────────────
        if (mobileNavClose) {
            mobileNavClose.addEventListener('click', closeNav);
        }

        // ── Bấm overlay ─────────────────────────────────────────
        if (mobileOverlay) {
            mobileOverlay.addEventListener('click', closeNav);
        }

        // ── Phím ESC ────────────────────────────────────────────
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && mobileNav.classList.contains('is-open')) {
                closeNav();
            }
        });

        // ── Dropdown "Khác" trong mobile sidebar ────────────────
        var dropdownToggle = mobileNav ? mobileNav.querySelector('.mobile-dropdown-toggle') : null;
        var dropdownParent = dropdownToggle ? dropdownToggle.closest('.mobile-dropdown') : null;

        if (dropdownToggle && dropdownParent) {
            dropdownToggle.addEventListener('click', function () {
                var isOpen = dropdownParent.classList.contains('is-open');
                if (isOpen) {
                    dropdownParent.classList.remove('is-open');
                    dropdownToggle.setAttribute('aria-expanded', 'false');
                } else {
                    dropdownParent.classList.add('is-open');
                    dropdownToggle.setAttribute('aria-expanded', 'true');
                }
            });
        }

        // ── Đánh dấu active link dựa theo URL hiện tại ──────────
        var currentPage = window.location.pathname.split('/').pop() || 'index.html';

        var mobileLinks = mobileNav ? mobileNav.querySelectorAll('a') : [];
        mobileLinks.forEach(function (link) {
            var href = link.getAttribute('href');
            if (!href) return;
            var linkPage = href.split('/').pop().split('#')[0];
            if (linkPage === currentPage) {
                link.classList.add('active');
                // Nếu link nằm trong submenu thì tự mở dropdown
                var parentDropdown = link.closest('.mobile-dropdown');
                if (parentDropdown) {
                    parentDropdown.classList.add('is-open');
                    var toggleBtn = parentDropdown.querySelector('.mobile-dropdown-toggle');
                    if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'true');
                }
            }
        });

        // ── Đóng sidebar khi click vào link (chuyển trang) ──────
        mobileLinks.forEach(function (link) {
            link.addEventListener('click', function () {
                // Chỉ đóng nếu là link thực sự điều hướng (không phải anchor #)
                var href = link.getAttribute('href');
                if (href && !href.startsWith('#')) {
                    closeNav();
                }
            });
        });

    }); // end DOMContentLoaded

})();
