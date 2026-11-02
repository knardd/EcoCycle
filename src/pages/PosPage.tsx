import { useState } from "react";
import { CheckCircle2, QrCode } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useAuth } from "../contexts/AuthContext";
import { useData } from "../contexts/DataContext";
import { supabase } from "../lib/supabase";
import { playSuccessChime } from "../lib/sound";

export function PosPage() {
  const { user, profile } = useAuth();
  const { categories, transactions, addTransaction, syncData } = useData();

  const [selectedMaterialCode, setSelectedMaterialCode] = useState("PET-1");
  const [weightKgInput, setWeightKgInput] = useState("");
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);
  const [generatedSessionQr, setGeneratedSessionQr] = useState<string | null>(
    null,
  );

  const activeMaterial =
    categories.find((c) => c.code === selectedMaterialCode) || categories[0];
  const parsedWeight = parseFloat(weightKgInput) || 0;
  const estimatedPoints = Math.round(
    parsedWeight * (activeMaterial?.pointsPerKg || 100),
  );

  const handleSubmitDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedWeight <= 0) return;

    // Coba simpan via Supabase RPC jika ada staf login
    if (user && profile?.role !== "student") {
      try {
        const { data, error } = await supabase.rpc(
          "create_waste_deposit_session",
          {
            p_school_id:
              profile?.school_id || "a0000000-0000-0000-0000-000000000001",
            p_material_id: activeMaterial.id,
            p_weight_kg: parsedWeight,
          },
        );

        if (!error && data) {
          playSuccessChime();
          setGeneratedSessionQr(data.qr_code);
          setFeedbackNotice(
            `Sesi timbangan ${data.ref_code} dibuat. Tunjukkan QR di monitor ke siswa untuk dipindai.`,
          );
          setWeightKgInput("");
          syncData();
          return;
        }
      } catch (err) {
        console.warn("Fallback ke transaksi demo lokal:", err);
      }
    }

    // Fallback demo lokal jika offline
    const now = new Date();
    const dd = now.getDate().toString().padStart(2, "0");
    const hh = now.getHours().toString().padStart(2, "0");
    const mm = now.getMinutes().toString().padStart(2, "0");

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const token = `qr_session_${randomSuffix}`;
    const refCode = `TRX-2026-${String(transactions.length + 1).padStart(3, "0")}`;

    const newTx = {
      id: refCode,
      studentName: "Menunggu Scan Siswa",
      studentNis: "Belum Terklaim",
      materialCode: activeMaterial.code,
      materialName: activeMaterial.name,
      weightKg: parsedWeight,
      pointsAwarded: estimatedPoints,
      dateRecorded: `${dd} Nov 2026, ${hh}:${mm} WIB`,
      status: "Menunggu Scan" as const,
    };

    addTransaction(newTx);
    playSuccessChime();
    setGeneratedSessionQr(token);
    setWeightKgInput("");
    setFeedbackNotice(
      `Sesi timbangan ${refCode} berhasil dibuat (+${estimatedPoints} Poin). Tunjukkan QR ke siswa!`,
    );
  };

  return (
    <div className="max-w-4xl space-y-5">
      {feedbackNotice && (
        <div
          role="status"
          className="flex items-center gap-2 rounded-lg bg-brand-light border border-brand-subtle px-4 py-3 text-sm font-medium text-brand-deep"
        >
          <CheckCircle2 className="h-4 w-4 text-brand shrink-0" />
          {feedbackNotice}
        </div>
      )}

      {/* Tampilan QR Sesi yang Baru Dibuat */}
      {generatedSessionQr && (
        <div className="rounded-xl border-2 border-brand-vibrant bg-brand-light/30 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <span className="rounded-full bg-brand text-white px-2.5 py-0.5 text-xs font-bold inline-block">
              Sesi QR Timbangan Aktif
            </span>
            <h3 className="font-display text-base font-bold text-main">
              Tunjukkan ke Siswa untuk Scan
            </h3>
            <p className="text-xs text-muted">
              Identitas siswa akan otomatis tercatat saat siswa memindai QR ini
              via aplikasi.
            </p>
            <p className="text-[11px] text-muted">
              Token Sesi:{" "}
              <span className="font-mono font-bold text-brand">
                {generatedSessionQr}
              </span>
            </p>
          </div>
          <div className="rounded-xl bg-white p-3 border border-brand-subtle shadow-sm text-center flex flex-col items-center">
            <QRCodeSVG
              value={generatedSessionQr}
              size={140}
              level="H"
              includeMargin={true}
              className="rounded-lg"
            />
            <span className="text-[10px] font-semibold text-brand block mt-1.5">
              Pindai dengan Kamera HP Siswa
            </span>
          </div>
        </div>
      )}

      {/* Form Penimbangan */}
      <form
        onSubmit={handleSubmitDeposit}
        className="rounded-xl border border-line bg-white shadow-xs"
      >
        <div className="px-6 py-4 border-b border-line flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="font-display text-base font-bold text-main">
              Penimbangan Sampah Pos
            </h2>
            <p className="text-xs text-muted mt-0.5">
              Pilih jenis material dan masukkan berat timbangan digital. Kode QR
              akan otomatis terbit untuk dipindai siswa.
            </p>
          </div>
          <div className="text-right shrink-0">
            <span className="text-[11px] text-body block">
              Setoran hari ini
            </span>
            <span className="font-display text-lg font-bold text-main">
              {transactions.length}
            </span>
            <span className="text-xs text-muted ml-1">transaksi</span>
          </div>
        </div>

        <div className="p-6 space-y-5">
          <fieldset>
            <legend className="text-xs font-semibold text-main mb-2">
              Jenis Material <span className="text-red-500">*</span>
            </legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {categories.map((cat) => {
                const selected = selectedMaterialCode === cat.code;
                return (
                  <button
                    key={cat.code}
                    type="button"
                    onClick={() => setSelectedMaterialCode(cat.code)}
                    className={`rounded-lg border px-3 py-2.5 text-left transition-colors cursor-pointer ${
                      selected
                        ? "border-brand bg-brand-light/40"
                        : "border-line hover:bg-surface-subtle"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-main">
                        {cat.name}
                      </span>
                      <span
                        className={`shrink-0 rounded px-1.5 py-0.5 text-[11px] font-bold ${
                          selected
                            ? "bg-brand text-white"
                            : "bg-surface-subtle text-muted"
                        }`}
                      >
                        {cat.pointsPerKg}/Kg
                      </span>
                    </div>
                    <p className="mt-0.5 text-[11px] text-body line-clamp-1">
                      {cat.specification}
                    </p>
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
            <div>
              <label
                htmlFor="weight-input"
                className="block text-xs font-semibold text-main mb-1.5"
              >
                Berat Bersih (Kg) <span className="text-red-500">*</span>
              </label>
              <input
                id="weight-input"
                type="number"
                step="0.05"
                min="0.05"
                required
                value={weightKgInput}
                onChange={(e) => setWeightKgInput(e.target.value)}
                placeholder="0.00"
                className="w-full rounded-lg border border-line bg-canvas px-3 py-2.5 text-sm font-semibold text-main focus:bg-white focus:border-brand focus:outline-hidden focus-visible:ring-2 focus-visible:ring-brand/30"
              />
            </div>
            <div className="rounded-lg bg-canvas border border-line p-3 flex justify-between items-center">
              <span className="text-xs text-muted">Perolehan Poin:</span>
              <span className="font-display text-xl font-bold text-brand">
                +{estimatedPoints}{" "}
                <span className="text-xs font-normal text-muted">poin</span>
              </span>
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-brand py-3 text-sm font-bold text-white hover:bg-brand-dark transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <QrCode className="h-4 w-4" />
            Terbitkan Kode QR
          </button>
        </div>
      </form>
    </div>
  );
}
