const SUPABASE_URL = "https://lkearyxyyblhivsbpgaq.supabase.co";
const SUPABASE_KEY = "sb_publishable_vfMZX2dCXTen-0S-9D7eTg_x1rLKAVW";

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY,
    {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true
        }
    }
);

window.supabaseClient = supabaseClient;

console.log("Supabase đã kết nối!");

// ─── ĐẾM NGƯỜI TRUY CẬP (unique theo trình duyệt, dùng localStorage) ──
(function trackUniqueVisitor() {
    var VISIT_FLAG = 'ktc_visitor_counted';
    try {
        if (localStorage.getItem(VISIT_FLAG)) return; // đã từng truy cập → không tăng
        supabaseClient.rpc('increment_visitor_count').then(function (res) {
            if (!res.error) {
                localStorage.setItem(VISIT_FLAG, '1');
            }
            // Nếu lỗi (mất mạng...) → không set flag, để lần sau thử lại
        });
    } catch (e) {
        console.warn('Không thể ghi nhận lượt truy cập:', e);
    }
})();
