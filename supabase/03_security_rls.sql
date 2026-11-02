-- ==============================================================================
-- LANGKAH 3: ROW LEVEL SECURITY (RLS) - SATPAM KEAMANAN MULTI-TENANT
-- Sesuai spesifikasi docs/DATABASE.md Bagian 2
-- ==============================================================================

-- 1. AKTIFKAN RLS PADA SELURUH TABEL
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waste_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waste_deposits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.point_ledger_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voucher_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voucher_claims ENABLE ROW LEVEL SECURITY;

-- 2. HELPER FUNCTION: AMBIL ROLE & SEKOLAH USER SAAT INI (BEBAS REKURSI)
CREATE OR REPLACE FUNCTION public.current_user_school_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT school_id FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- 3. KEBIJAKAN KEAMANAN (POLICIES)

-- 3.1 Tabel schools
CREATE POLICY "Semua user terotentikasi dapat membaca data sekolah"
    ON public.schools FOR SELECT
    TO authenticated
    USING (is_active = true OR current_user_role() = 'platform_admin');

CREATE POLICY "Hanya platform admin yang dapat mengelola sekolah"
    ON public.schools FOR ALL
    TO authenticated
    USING (current_user_role() = 'platform_admin');

-- 3.2 Tabel profiles
CREATE POLICY "Pengguna dapat melihat profil sendiri atau sesama sekolah bagi staf"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (
        id = auth.uid() OR
        (school_id = public.current_user_school_id() AND current_user_role() IN ('branch_staff', 'school_admin')) OR
        current_user_role() = 'platform_admin'
    );

CREATE POLICY "Pengguna hanya dapat mengupdate profil miliknya sendiri"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

-- 3.3 Tabel waste_materials (Katalog Sampah)
CREATE POLICY "Semua pengguna dapat melihat material aktif sekolahnya / template global"
    ON public.waste_materials FOR SELECT
    TO authenticated
    USING (
        is_active = true AND (
            school_id IS NULL OR
            school_id = public.current_user_school_id() OR
            current_user_role() = 'platform_admin'
        )
    );

CREATE POLICY "Admin sekolah mengelola material unitnya sendiri"
    ON public.waste_materials FOR ALL
    TO authenticated
    USING (
        current_user_role() = 'platform_admin' OR (
            current_user_role() = 'school_admin' AND school_id = public.current_user_school_id()
        )
    );

-- 3.4 Tabel waste_deposits (Data Timbangan & QR)
CREATE POLICY "Siswa melihat setorannya sendiri, staf melihat setoran sekolahnya"
    ON public.waste_deposits FOR SELECT
    TO authenticated
    USING (
        user_id = auth.uid() OR
        (school_id = public.current_user_school_id() AND current_user_role() IN ('branch_staff', 'school_admin')) OR
        current_user_role() = 'platform_admin'
    );

-- 3.5 Tabel point_ledger_entries (Buku Kas Saldo Poin)
CREATE POLICY "Siswa melihat mutasi poin miliknya sendiri"
    ON public.point_ledger_entries FOR SELECT
    TO authenticated
    USING (
        user_id = auth.uid() OR
        (school_id = public.current_user_school_id() AND current_user_role() IN ('school_admin', 'branch_staff')) OR
        current_user_role() = 'platform_admin'
    );

-- 3.6 Tabel voucher_catalog (Katalog Hadiah Voucher)
CREATE POLICY "Pengguna dapat melihat voucher aktif di sekolahnya"
    ON public.voucher_catalog FOR SELECT
    TO authenticated
    USING (
        is_active = true AND (
            school_id = public.current_user_school_id() OR
            current_user_role() = 'platform_admin'
        )
    );

CREATE POLICY "Admin sekolah mengelola voucher unitnya"
    ON public.voucher_catalog FOR ALL
    TO authenticated
    USING (
        current_user_role() = 'platform_admin' OR (
            current_user_role() = 'school_admin' AND school_id = public.current_user_school_id()
        )
    );

-- 3.7 Tabel voucher_claims (Riwayat Klaim Kupon)
CREATE POLICY "Siswa melihat klaim miliknya, staf melihat klaim sekolahnya"
    ON public.voucher_claims FOR SELECT
    TO authenticated
    USING (
        user_id = auth.uid() OR
        (school_id = public.current_user_school_id() AND current_user_role() IN ('branch_staff', 'school_admin')) OR
        current_user_role() = 'platform_admin'
    );
