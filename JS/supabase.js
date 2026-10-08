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
