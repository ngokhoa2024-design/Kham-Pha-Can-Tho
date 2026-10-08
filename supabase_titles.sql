-- ============================================================
-- supabase_titles.sql
-- Hệ thống Title / Danh hiệu - Khám Phá Cần Thơ
--
-- Chạy file này trong Supabase SQL Editor (một lần duy nhất).
-- Không xóa bảng cũ, không ảnh hưởng dữ liệu hiện có.
-- ============================================================

-- ─── 1. THÊM CỘT active_title_id VÀO profiles ──────────────────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS active_title_id uuid;

-- ─── 2. TẠO BẢNG titles ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.titles (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  slug        text NOT NULL,
  description text,
  icon        text DEFAULT '🏷️',
  color       text DEFAULT '#0b8a7b',
  created_by  uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

-- Unique slug
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'titles_slug_key'
  ) THEN
    ALTER TABLE public.titles ADD CONSTRAINT titles_slug_key UNIQUE (slug);
  END IF;
END$$;

-- ─── 3. TẠO BẢNG user_titles ────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_titles (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title_id    uuid NOT NULL REFERENCES public.titles(id) ON DELETE CASCADE,
  unlocked_at timestamptz DEFAULT now()
);

-- Unique (user_id, title_id)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'user_titles_user_id_title_id_key'
  ) THEN
    ALTER TABLE public.user_titles ADD CONSTRAINT user_titles_user_id_title_id_key UNIQUE (user_id, title_id);
  END IF;
END$$;

-- ─── 4. FOREIGN KEY: profiles.active_title_id → titles.id ───────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'profiles_active_title_id_fkey'
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_active_title_id_fkey
      FOREIGN KEY (active_title_id) REFERENCES public.titles(id) ON DELETE SET NULL;
  END IF;
END$$;

-- ─── 5. INDEX ────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_user_titles_user_id  ON public.user_titles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_titles_title_id ON public.user_titles(title_id);
CREATE INDEX IF NOT EXISTS idx_titles_slug          ON public.titles(slug);
CREATE INDEX IF NOT EXISTS idx_profiles_active_title ON public.profiles(active_title_id);

-- ─── 6. TRIGGER: tự cập nhật updated_at khi sửa titles ──────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS titles_set_updated_at ON public.titles;
CREATE TRIGGER titles_set_updated_at
  BEFORE UPDATE ON public.titles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ─── 7. HELPER FUNCTION: kiểm tra admin ─────────────────────────
-- Dùng trong RLS policy để tránh truy vấn vòng lặp
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'admin'
      AND (status IS NULL OR status != 'banned')
  );
$$;

-- ─── 8. ENABLE RLS ───────────────────────────────────────────────
ALTER TABLE public.titles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_titles ENABLE ROW LEVEL SECURITY;

-- ─── 9. RLS POLICIES: titles ────────────────────────────────────

-- Mọi người (kể cả chưa đăng nhập) đọc được danh sách title
DROP POLICY IF EXISTS "titles_select_public"  ON public.titles;
CREATE POLICY "titles_select_public"
  ON public.titles FOR SELECT
  USING (true);

-- Chỉ admin tạo title
DROP POLICY IF EXISTS "titles_insert_admin"   ON public.titles;
CREATE POLICY "titles_insert_admin"
  ON public.titles FOR INSERT
  WITH CHECK (public.is_admin());

-- Chỉ admin sửa title
DROP POLICY IF EXISTS "titles_update_admin"   ON public.titles;
CREATE POLICY "titles_update_admin"
  ON public.titles FOR UPDATE
  USING (public.is_admin());

-- Chỉ admin xóa title
DROP POLICY IF EXISTS "titles_delete_admin"   ON public.titles;
CREATE POLICY "titles_delete_admin"
  ON public.titles FOR DELETE
  USING (public.is_admin());

-- ─── 10. RLS POLICIES: user_titles ──────────────────────────────

-- User xem title của mình; admin xem tất cả
DROP POLICY IF EXISTS "user_titles_select"    ON public.user_titles;
CREATE POLICY "user_titles_select"
  ON public.user_titles FOR SELECT
  USING (user_id = auth.uid() OR public.is_admin());

-- Chỉ admin cấp title cho user
DROP POLICY IF EXISTS "user_titles_insert_admin" ON public.user_titles;
CREATE POLICY "user_titles_insert_admin"
  ON public.user_titles FOR INSERT
  WITH CHECK (public.is_admin());

-- Chỉ admin thu hồi title
DROP POLICY IF EXISTS "user_titles_delete_admin" ON public.user_titles;
CREATE POLICY "user_titles_delete_admin"
  ON public.user_titles FOR DELETE
  USING (public.is_admin());

-- ─── 11. RLS POLICY: profiles.active_title_id ───────────────────
-- User chỉ cập nhật active_title_id của chính mình
-- và chỉ được chọn title mà họ đã sở hữu (hoặc null)

-- Nếu profiles chưa có RLS thì bật lên
-- (Không DROP policy cũ vì profiles có thể đã có policies khác)
-- Tạo policy mới riêng cho active_title_id:

DROP POLICY IF EXISTS "profiles_update_active_title" ON public.profiles;
CREATE POLICY "profiles_update_active_title"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid()
    AND (
      active_title_id IS NULL
      OR EXISTS (
        SELECT 1 FROM public.user_titles ut
        WHERE ut.user_id = auth.uid()
          AND ut.title_id = active_title_id
      )
    )
  );

-- ─── 12. DỮ LIỆU TITLE MẪU ─────────────────────────────────────
-- Chỉ insert nếu bảng đang rỗng
INSERT INTO public.titles (name, slug, description, icon, color)
SELECT * FROM (VALUES
  ('Newbie',      'newbie',      'Thành viên mới toanh',                 '🌱', '#27ae60'),
  ('Explorer',    'explorer',    'Người yêu thích khám phá',             '🗺️', '#3498db'),
  ('Supporter',   'supporter',   'Người ủng hộ website',                 '💚', '#1abc9c'),
  ('Contributor', 'contributor', 'Người đóng góp tích cực cho cộng đồng','✨', '#9b59b6'),
  ('Active',      'active',      'Thành viên hoạt động sôi nổi',         '⚡', '#e67e22'),
  ('Founder',     'founder',     'Thành viên sáng lập',                  '👑', '#f1c40f')
) AS v(name, slug, description, icon, color)
WHERE NOT EXISTS (SELECT 1 FROM public.titles LIMIT 1);

-- ─── 13. COMMENTS ────────────────────────────────────────────────
COMMENT ON TABLE  public.titles            IS 'Danh sách danh hiệu (Title) trên website Khám Phá Cần Thơ';
COMMENT ON TABLE  public.user_titles       IS 'Bảng lưu user nào sở hữu title nào (do admin cấp)';
COMMENT ON COLUMN public.profiles.active_title_id IS 'Title đang được user sử dụng hiện tại (null = không dùng title)';
