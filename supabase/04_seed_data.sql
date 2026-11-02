-- ==============================================================================
-- LANGKAH 4: DATA AWAL / SEED DATA ECOCYCLE (OPSIONAL TAPI SANGAT DISARANKAN)
-- Jalankan di SQL Editor Supabase agar database langsung punya data awal
-- ==============================================================================

-- 1. DATA SEKOLAH AWAL
INSERT INTO public.schools (id, name, address, phone, is_active)
VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'SMP Negeri 1 EcoCycle',
    'Jl. Pendidikan Lingkungan No. 1, Jakarta',
    '021-5551234',
    true
)
ON CONFLICT (id) DO NOTHING;

-- 2. KATALOG MATERIAL SAMPAH GLOBAL / TEMPLATE AWAL
INSERT INTO public.waste_materials (code, name, category, points_per_kg, specification, is_active)
VALUES
(
    'PET-1',
    'Plastik PET 1 (Botol Bening)',
    'Anorganik',
    300,
    'Botol air mineral/jus bersih, label & tutup dilepas, dipipihkan',
    true
),
(
    'HDPE-2',
    'Plastik HDPE (Wadah Keras)',
    'Anorganik',
    250,
    'Botol shampoo, botol sabun cair, jeriken, dibilas bersih',
    true
),
(
    'KARTON',
    'Kardus & Kertas Karton',
    'Serat Kertas',
    150,
    'Kardus cokelat kering dan bersih, diikat per bundel rapi',
    true
),
(
    'JELANTAH',
    'Minyak Jelantah',
    'Cairan Minyak',
    500,
    'Minyak goreng bekas pakai yang disaring, wadah botol tertutup',
    true
),
(
    'KALENG',
    'Logam & Kaleng Aluminium',
    'Anorganik',
    400,
    'Kaleng minuman atau biskuit, bersih dan tidak berkarat parah',
    true
)
ON CONFLICT DO NOTHING;

-- 3. KATALOG REWARD / VOUCHER AWAL UNTUK SEKOLAH CONTOH
INSERT INTO public.voucher_catalog (school_id, title, category, cost_points, is_active)
VALUES
(
    'a0000000-0000-0000-0000-000000000001',
    'Voucher Belanja Koperasi Rp 5.000',
    'Koperasi',
    500,
    true
),
(
    'a0000000-0000-0000-0000-000000000001',
    'Voucher Belanja Koperasi Rp 10.000',
    'Koperasi',
    1000,
    true
),
(
    'a0000000-0000-0000-0000-000000000001',
    'Donasi 1 Bibit Pohon Peneduh',
    'Lingkungan',
    800,
    true
)
ON CONFLICT DO NOTHING;
