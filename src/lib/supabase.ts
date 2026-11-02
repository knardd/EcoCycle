import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "Konfigurasi Supabase belum lengkap. Pastikan VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY (atau VITE_SUPABASE_PUBLIC_KEY) sudah ada di file .env",
  );
}

export const supabase = createClient(supabaseUrl || "", supabaseAnonKey || "");
