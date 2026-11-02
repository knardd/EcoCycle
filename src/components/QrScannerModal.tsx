import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { X, Camera, AlertCircle, Keyboard } from 'lucide-react'
import { playSuccessChime } from '../lib/sound'

interface QrScannerModalProps {
  isOpen: boolean
  onClose: () => void
  onScanSuccess: (decodedText: string) => void
  title?: string
  description?: string
}

export function QrScannerModal({
  isOpen,
  onClose,
  onScanSuccess,
  title = 'Pindai Kode QR',
  description = 'Arahkan kamera ke gambar QR di layar pos timbangan atau kupon'
}: QrScannerModalProps) {
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [manualMode, setManualMode] = useState<boolean>(false)
  const [manualToken, setManualToken] = useState<string>('')
  const [isScanning, setIsScanning] = useState<boolean>(false)

  const scannerRef = useRef<Html5Qrcode | null>(null)
  const isStoppingRef = useRef<boolean>(false)

  useEffect(() => {
    if (!isOpen || manualMode) return

    let isMounted = true
    const readerId = 'html5-qr-reader-viewport'

    // Beri waktu sejenak agar elemen DOM ter-render
    const timer = setTimeout(async () => {
      try {
        const scanner = new Html5Qrcode(readerId)
        scannerRef.current = scanner

        const config = {
          fps: 10,
          qrbox: { width: 220, height: 220 },
          aspectRatio: 1.0
        }

        await scanner.start(
          { facingMode: 'environment' },
          config,
          (decodedText) => {
            if (!isMounted || isStoppingRef.current) return
            isStoppingRef.current = true

            // Efek suara sukses "ting!"
            playSuccessChime()

            scanner
              .stop()
              .catch(() => {})
              .finally(() => {
                onScanSuccess(decodedText)
                onClose()
              })
          },
          () => {
            // Frame scanner mencari QR (abaikan error per-frame)
          }
        )

        if (isMounted) {
          setIsScanning(true)
          setCameraError(null)
        }
      } catch (err) {
        if (isMounted) {
          const msg = err instanceof Error ? err.message : String(err)
          if (msg.includes('NotAllowedError') || msg.includes('Permission')) {
            setCameraError('Izin akses kamera ditolak. Silakan aktifkan izin kamera di pengaturan browser.')
          } else {
            setCameraError('Kamera tidak terdeteksi atau sedang digunakan aplikasi lain.')
          }
          setManualMode(true)
        }
      }
    }, 150)

    return () => {
      isMounted = false
      clearTimeout(timer)
      if (scannerRef.current) {
        scannerRef.current
          .stop()
          .catch(() => {})
          .finally(() => {
            scannerRef.current = null
          })
      }
    }
  }, [isOpen, manualMode, onClose, onScanSuccess])

  if (!isOpen) return null

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!manualToken.trim()) return
    playSuccessChime()
    onScanSuccess(manualToken.trim())
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-main/60 backdrop-blur-xs">
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl border border-line relative overflow-hidden"
      >
        {/* Tombol Tutup */}
        <button
          onClick={onClose}
          aria-label="Tutup kamera"
          className="absolute top-3 right-3 rounded-lg p-1.5 text-muted hover:bg-surface-subtle hover:text-main z-10 cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-4">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-brand-light text-brand mb-2">
            <Camera className="h-5 w-5" />
          </div>
          <h3 className="font-display text-base font-bold text-main">
            {title}
          </h3>
          <p className="text-xs text-muted mt-0.5 max-w-xs mx-auto">
            {description}
          </p>
        </div>

        {/* Viewport Kamera atau Manual Input */}
        {!manualMode ? (
          <div className="space-y-3">
            <div className="relative mx-auto w-64 h-64 rounded-xl overflow-hidden bg-black flex items-center justify-center border-2 border-brand">
              <div id="html5-qr-reader-viewport" className="w-full h-full" />
              {!isScanning && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 text-white text-xs gap-2 p-4 text-center">
                  <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Menyiapkan kamera...
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setManualMode(true)}
              className="w-full flex items-center justify-center gap-1.5 text-xs text-muted hover:text-brand py-1 cursor-pointer"
            >
              <Keyboard className="h-3.5 w-3.5" />
              Kamera bermasalah? Ketik kode manual
            </button>
          </div>
        ) : (
          <form onSubmit={handleManualSubmit} className="space-y-3">
            {cameraError && (
              <div className="rounded-lg bg-amber-50 border border-amber-200 p-2.5 text-xs text-amber-800 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                <span>{cameraError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-main mb-1">
                Masukkan Token QR
              </label>
              <input
                type="text"
                required
                autoFocus
                value={manualToken}
                onChange={(e) => setManualToken(e.target.value)}
                placeholder="Contoh: qr_8f9a2b1c4d..."
                className="w-full rounded-lg border border-line bg-canvas px-3 py-2 text-xs font-mono text-main focus:bg-white focus:border-brand focus:outline-hidden"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setManualMode(false)}
                className="flex-1 rounded-lg border border-line py-2 text-xs font-semibold text-muted hover:bg-surface-subtle cursor-pointer"
              >
                Coba Kamera Lagi
              </button>
              <button
                type="submit"
                className="flex-1 rounded-lg bg-brand py-2 text-xs font-bold text-white hover:bg-brand-dark cursor-pointer"
              >
                Gunakan Kode
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
