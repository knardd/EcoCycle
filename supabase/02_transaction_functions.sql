-- ==============================================================================
-- LANGKAH 2: FUNGSI TRANSAKSI ATOMIK & QR (docs/DATABASE.md Bagian 3)
-- ==============================================================================

-- 1. FUNGSI CEK SALDO POIN REAL-TIME
CREATE OR REPLACE FUNCTION public.get_user_point_balance(p_user_id UUID)
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
    SELECT COALESCE(SUM(amount), 0)::INTEGER
    FROM public.point_ledger_entries
    WHERE user_id = p_user_id;
$$;

-- 2. TRIGGER OTOMATIS: BUAT PROFIL SAAT USER BARU DAFTAR
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.profiles (
        id,
        school_id,
        role,
        full_name,
        nis,
        class_name
    )
    VALUES (
        NEW.id,
        (NEW.raw_user_meta_data->>'school_id')::UUID,
        COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'student'::user_role),
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        NEW.raw_user_meta_data->>'nis',
        NEW.raw_user_meta_data->>'class_name'
    );
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. FUNGSI 1: STAF INPUT TIMBANGAN & BUAT TOKEN QR
CREATE OR REPLACE FUNCTION public.create_waste_deposit_session(
    p_school_id UUID,
    p_material_id UUID,
    p_weight_kg NUMERIC,
    p_ref_code TEXT DEFAULT NULL
)
RETURNS public.waste_deposits
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_staff_id UUID := auth.uid();
    v_staff_role user_role;
    v_material RECORD;
    v_points_snapshot INTEGER;
    v_total_points INTEGER;
    v_qr_token TEXT;
    v_ref TEXT;
    v_new_deposit public.waste_deposits;
BEGIN
    -- Validasi role staf
    SELECT role INTO v_staff_role FROM public.profiles WHERE id = v_staff_id;
    IF v_staff_role NOT IN ('branch_staff', 'school_admin', 'platform_admin') THEN
        RAISE EXCEPTION 'Akses ditolak: Hanya staf atau admin yang dapat membuat sesi timbangan';
    END IF;

    -- Validasi material
    SELECT * INTO v_material FROM public.waste_materials 
    WHERE id = p_material_id AND is_active = true;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Material sampah tidak ditemukan atau sedang tidak aktif';
    END IF;

    v_points_snapshot := v_material.points_per_kg;
    v_total_points := ROUND(p_weight_kg * v_points_snapshot)::INTEGER;

    -- Generate kode referensi jika kosong (misal: TRX-20261102-ABC123)
    IF p_ref_code IS NULL OR trim(p_ref_code) = '' THEN
        v_ref := 'TRX-' || to_char(now(), 'YYYYMMDD') || '-' || upper(substr(md5(random()::text), 1, 6));
    ELSE
        v_ref := p_ref_code;
    END IF;

    -- Token acak aman untuk QR code agar tidak bisa ditebak siswa
    v_qr_token := 'qr_' || encode(gen_random_bytes(16), 'hex');

    INSERT INTO public.waste_deposits (
        ref_code,
        school_id,
        user_id,
        staff_id,
        material_id,
        weight_kg,
        points_per_kg_snapshot,
        points_awarded,
        qr_code,
        status,
        deposited_at
    )
    VALUES (
        v_ref,
        p_school_id,
        NULL, -- Masih kosong sampai siswa scan
        v_staff_id,
        p_material_id,
        p_weight_kg,
        v_points_snapshot,
        v_total_points,
        v_qr_token,
        'pending_scan',
        now()
    )
    RETURNING * INTO v_new_deposit;

    RETURN v_new_deposit;
END;
$$;

-- 4. FUNGSI 2: SISWA SCAN QR & KLAIM POIN KE LEDGER
CREATE OR REPLACE FUNCTION public.claim_deposit_by_qr(p_qr_token TEXT)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_deposit public.waste_deposits;
    v_material_name TEXT;
BEGIN
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Harap login terlebih dahulu untuk mengklaim poin';
    END IF;

    -- Kunci baris agar tidak bisa di-scan ganda bersamaan
    SELECT * INTO v_deposit
    FROM public.waste_deposits
    WHERE qr_code = p_qr_token
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Kode QR transaksi tidak valid atau tidak ditemukan';
    END IF;

    IF v_deposit.status = 'completed' THEN
        RAISE EXCEPTION 'Kode QR ini sudah pernah diklaim sebelumnya';
    END IF;

    IF v_deposit.status = 'cancelled' THEN
        RAISE EXCEPTION 'Sesi timbangan ini telah dibatalkan oleh staf';
    END IF;

    -- Update transaksi menjadi completed dan pasang user_id siswa
    UPDATE public.waste_deposits
    SET status = 'completed',
        user_id = v_user_id,
        claimed_at = now()
    WHERE id = v_deposit.id;

    -- Ambil nama material untuk catatan buku kas
    SELECT name INTO v_material_name
    FROM public.waste_materials
    WHERE id = v_deposit.material_id;

    -- Terbitkan kredit poin ke buku kas (point_ledger_entries)
    INSERT INTO public.point_ledger_entries (
        school_id,
        user_id,
        amount,
        entry_type,
        reference_id,
        description
    )
    VALUES (
        v_deposit.school_id,
        v_user_id,
        v_deposit.points_awarded,
        'deposit',
        v_deposit.id,
        'Setoran bank sampah: ' || coalesce(v_material_name, 'Sampah') || ' (' || v_deposit.weight_kg || ' kg)'
    );

    RETURN jsonb_build_object(
        'success', true,
        'ref_code', v_deposit.ref_code,
        'points_awarded', v_deposit.points_awarded,
        'weight_kg', v_deposit.weight_kg
    );
END;
$$;

-- 5. FUNGSI 3: SISWA MENUKARKAN POIN DENGAN VOUCHER
CREATE OR REPLACE FUNCTION public.claim_voucher(p_voucher_id UUID)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_voucher RECORD;
    v_current_balance INTEGER;
    v_claim_code TEXT;
    v_new_claim_id UUID;
BEGIN
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Harap login terlebih dahulu untuk menukarkan voucher';
    END IF;

    -- Ambil data voucher
    SELECT * INTO v_voucher FROM public.voucher_catalog
    WHERE id = p_voucher_id AND is_active = true;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Voucher tidak ditemukan atau sedang tidak aktif';
    END IF;

    -- Periksa saldo terkini siswa
    v_current_balance := public.get_user_point_balance(v_user_id);
    IF v_current_balance < v_voucher.cost_points THEN
        RAISE EXCEPTION 'Poin Anda tidak mencukupi (Saldo: %, Butuh: %)',
            v_current_balance, v_voucher.cost_points;
    END IF;

    -- Buat kode kupon unik (misal: VCR-9B2F1A08)
    v_claim_code := 'VCR-' || upper(substr(encode(gen_random_bytes(4), 'hex'), 1, 8));

    -- Catat kupon di voucher_claims
    INSERT INTO public.voucher_claims (
        school_id,
        user_id,
        voucher_id,
        claim_code,
        points_spent
    )
    VALUES (
        v_voucher.school_id,
        v_user_id,
        v_voucher.id,
        v_claim_code,
        v_voucher.cost_points
    )
    RETURNING id INTO v_new_claim_id;

    -- Potong poin siswa di buku kas (nilai minus)
    INSERT INTO public.point_ledger_entries (
        school_id,
        user_id,
        amount,
        entry_type,
        reference_id,
        description
    )
    VALUES (
        v_voucher.school_id,
        v_user_id,
        -v_voucher.cost_points,
        'voucher_redeem',
        v_new_claim_id,
        'Penukaran voucher: ' || v_voucher.title
    );

    RETURN jsonb_build_object(
        'success', true,
        'claim_code', v_claim_code,
        'voucher_title', v_voucher.title,
        'points_spent', v_voucher.cost_points,
        'remaining_balance', v_current_balance - v_voucher.cost_points
    );
END;
$$;

-- 6. FUNGSI 4: PETUGAS KOPERASI VERIFIKASI VOUCHER FISIK
CREATE OR REPLACE FUNCTION public.redeem_voucher_claim(p_claim_code TEXT)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_staff_id UUID := auth.uid();
    v_staff_role user_role;
    v_claim RECORD;
    v_student_name TEXT;
    v_voucher_title TEXT;
BEGIN
    -- Validasi staf
    SELECT role INTO v_staff_role FROM public.profiles WHERE id = v_staff_id;
    IF v_staff_role NOT IN ('branch_staff', 'school_admin', 'platform_admin') THEN
        RAISE EXCEPTION 'Akses ditolak: Hanya petugas koperasi/admin yang dapat memvalidasi voucher';
    END IF;

    -- Cari dan kunci klaim voucher
    SELECT vc.*, p.full_name AS student_name, cat.title AS voucher_title
    INTO v_claim
    FROM public.voucher_claims vc
    JOIN public.profiles p ON p.id = vc.user_id
    JOIN public.voucher_catalog cat ON cat.id = vc.voucher_id
    WHERE vc.claim_code = p_claim_code
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Kode voucher tidak valid atau tidak ditemukan';
    END IF;

    IF v_claim.redeemed_at IS NOT NULL THEN
        RAISE EXCEPTION 'Voucher ini sudah pernah digunakan pada %',
            to_char(v_claim.redeemed_at, 'DD/MM/YYYY HH24:MI');
    END IF;

    -- Tandai voucher telah digunakan
    UPDATE public.voucher_claims
    SET redeemed_at = now()
    WHERE id = v_claim.id;

    RETURN jsonb_build_object(
        'success', true,
        'claim_code', v_claim.claim_code,
        'student_name', v_claim.student_name,
        'voucher_title', v_claim.voucher_title,
        'redeemed_at', now()
    );
END;
$$;
