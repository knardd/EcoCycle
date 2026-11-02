-- ==============================================================================
-- LANGKAH 1: TABEL-TABEL INTI ECOCYCLE (docs/DATABASE.md)
-- ==============================================================================

-- 1. EXTENSION & ENUM TYPES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE user_role AS ENUM (
    'student',
    'community_member',
    'branch_staff',
    'school_admin',
    'platform_admin'
);

CREATE TYPE deposit_status AS ENUM (
    'pending_scan',
    'completed',
    'cancelled'
);

CREATE TYPE ledger_entry_type AS ENUM (
    'deposit',
    'voucher_redeem',
    'admin_adjustment'
);

-- 2. TABEL-TABEL INTI

-- 2.1 Unit Sekolah / Cabang
CREATE TABLE schools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    address TEXT,
    phone TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.2 Profil Pengguna (Terkoneksi ke Supabase Auth)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    school_id UUID REFERENCES schools(id) ON DELETE SET NULL,
    role user_role NOT NULL DEFAULT 'student',
    full_name TEXT NOT NULL,
    nis TEXT,
    class_name TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.3 Katalog Material Sampah
CREATE TABLE waste_materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE, -- NULL = template global
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    points_per_kg INTEGER NOT NULL,
    specification TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.4 Transaksi Timbangan & Sesi QR
CREATE TABLE waste_deposits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ref_code TEXT NOT NULL UNIQUE,
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE RESTRICT,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL, -- Kosong dulu, terisi saat siswa scan
    staff_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    material_id UUID NOT NULL REFERENCES waste_materials(id) ON DELETE RESTRICT,
    weight_kg NUMERIC(10,3) NOT NULL,
    points_per_kg_snapshot INTEGER NOT NULL,
    points_awarded INTEGER NOT NULL,
    qr_code TEXT NOT NULL UNIQUE,
    status deposit_status NOT NULL DEFAULT 'pending_scan',
    deposited_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    claimed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.5 Buku Kas Mutasi Poin (Point Ledger)
CREATE TABLE point_ledger_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE RESTRICT,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL, -- Positif = Kredit (+), Negatif = Debit (-)
    entry_type ledger_entry_type NOT NULL,
    reference_id UUID, -- ID transaksi setoran atau klaim voucher
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.6 Katalog Reward / Voucher
CREATE TABLE voucher_catalog (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    category TEXT NOT NULL, -- 'Koperasi' / 'Lingkungan'
    cost_points INTEGER NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.7 Riwayat Klaim Voucher
CREATE TABLE voucher_claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE RESTRICT,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    voucher_id UUID NOT NULL REFERENCES voucher_catalog(id) ON DELETE RESTRICT,
    claim_code TEXT NOT NULL UNIQUE,
    points_spent INTEGER NOT NULL,
    redeemed_at TIMESTAMPTZ, -- Diisi kasir saat ditukar fisik di koperasi
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
