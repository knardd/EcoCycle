import { useState, useRef, useEffect, useCallback } from "react";
import { Bot, Sparkles, Send, X, RotateCcw, AlertCircle } from "lucide-react";
import { sendGeminiPrompt, type ChatMessage } from "../services/geminiApi";
import { findInstantFaq, QUICK_PROMPTS } from "../services/instantFaq";

const INITIAL_MESSAGE: ChatMessage = {
  id: "msg-welcome",
  role: "assistant",
  content:
    "Halo! Saya EcoBot, asisten panduan Bank Sampah EcoCycle. Ada yang ingin kamu tanyakan seputar cara setor sampah di pos, nilai poin material, atau panduan memilah sampah?",
  timestamp: "Baru saja",
};

export function AiChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [inputPrompt, setInputPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Otomatis scroll ke pesan terbaru
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  // Fokuskan input saat widget dibuka
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Tutup dengan Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleSendMessage = useCallback(
    async (textToSend?: string) => {
      const text = (textToSend || inputPrompt).trim();
      if (!text || isLoading) return;

      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content: text,
        timestamp: new Date().toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setMessages((prev) => [...prev, userMessage]);
      setInputPrompt("");

      // 1. Cek apakah ada jawaban template instan (0 detik)
      const instantAnswer = findInstantFaq(text);
      if (instantAnswer) {
        const assistantMessage: ChatMessage = {
          id: `bot-instant-${Date.now()}`,
          role: "assistant",
          content: instantAnswer,
          timestamp: new Date().toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
        setMessages((prev) => [...prev, assistantMessage]);
        return;
      }

      // 2. Jika bukan pertanyaan template, proses dengan asisten AI
      setIsLoading(true);

      try {
        const response = await sendGeminiPrompt(text, messages);
        const assistantMessage: ChatMessage = {
          id: `bot-${Date.now()}`,
          role: "assistant",
          content: response,
          timestamp: new Date().toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } catch {
        const errorMessage: ChatMessage = {
          id: `bot-err-${Date.now()}`,
          role: "assistant",
          content:
            "Pertanyaan ini belum ada di panduan instan EcoBot. Silakan pilih salah satu pertanyaan populer atau tanyakan seputar: cara setor sampah, nilai poin plastik, syarat minyak jelantah, atau cara menaikkan peringkat kelas.",
          timestamp: new Date().toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    },
    [inputPrompt, isLoading, messages],
  );

  const handleResetChat = () => {
    setMessages([INITIAL_MESSAGE]);
  };

  return (
    <>
      {/* 1. Floating Trigger Button */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Buka Chat Asisten EcoBot"
          className="fixed bottom-5 right-5 z-40 flex items-center gap-2.5 rounded-full bg-brand px-4 py-3 text-white shadow-lg hover:bg-brand-dark hover:scale-105 active:scale-95 transition-all cursor-pointer group"
        >
          <div className="relative flex items-center justify-center">
            <Bot className="h-5 w-5" />
          </div>
          <span className="font-display text-xs font-bold tracking-wide hidden sm:inline">
            Tanya EcoBot
          </span>
        </button>
      )}

      {/* 2. Floating Chat Panel */}
      {isOpen && (
        <div
          role="dialog"
          aria-labelledby="ecobot-chat-title"
          className="fixed bottom-4 right-4 z-50 flex flex-col w-[calc(100vw-2rem)] sm:w-[380px] h-[540px] max-h-[85vh] rounded-2xl bg-white shadow-2xl border border-line overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200"
        >
          {/* Header Panel */}
          <div className="flex items-center justify-between border-b border-line bg-brand px-4 py-3 text-white">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 text-white backdrop-blur-xs">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <h3
                  id="ecobot-chat-title"
                  className="font-display text-sm font-bold flex items-center gap-1.5"
                >
                  EcoBot AI
                </h3>
                <span className="text-[10px] text-white/80 block leading-tight">
                  Pemandu Resmi Bank Sampah EcoCycle
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleResetChat}
                title="Mulai percakapan baru"
                aria-label="Mulai percakapan baru"
                className="rounded p-1.5 text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Tutup chat"
                aria-label="Tutup chat"
                className="rounded p-1.5 text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Body Pesan */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-canvas">
            {messages.map((msg, index) => {
              const isAssistant = msg.role === "assistant";
              return (
                <div key={msg.id} className="space-y-3">
                  <div
                    className={`flex items-start gap-2 ${
                      isAssistant ? "justify-start" : "justify-end"
                    }`}
                  >
                    {/* Logo avatar robot kecil di samping balon pesan asisten */}
                    {isAssistant && (
                      <div
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-light text-brand border border-brand/20 mt-0.5 shadow-2xs"
                        aria-label="Avatar EcoBot"
                      >
                        <Bot className="h-3.5 w-3.5" />
                      </div>
                    )}

                    <div
                      className={`flex flex-col ${
                        isAssistant ? "items-start" : "items-end"
                      } max-w-[82%] sm:max-w-[85%]`}
                    >
                      <div
                        className={`rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                          isAssistant
                            ? "rounded-tl-xs bg-white text-main border border-line shadow-2xs whitespace-pre-line"
                            : "rounded-tr-xs bg-brand text-white shadow-xs"
                        }`}
                      >
                        {msg.content}
                      </div>
                      <span className="text-[9px] text-muted mt-1 px-1">
                        {msg.timestamp}
                      </span>
                    </div>
                  </div>

                  {/* Tombol Template Pertanyaan: Posisinya di atas (di bawah pesan sambutan pertama) & TIDAK HILANG setelah ditekan */}
                  {index === 0 && (
                    <div className="pt-1 pb-1 space-y-1.5">
                      <span className="text-[10px] font-semibold text-muted flex items-center gap-1 px-1">
                        <Bot className="h-3 w-3 text-brand" />
                        Pertanyaan Populer:
                      </span>
                      <div className="flex flex-col gap-1.5">
                        {QUICK_PROMPTS.map((prompt) => (
                          <button
                            key={prompt}
                            type="button"
                            onClick={() => handleSendMessage(prompt)}
                            disabled={isLoading}
                            className="text-left rounded-xl border border-line bg-white p-2.5 text-[11px] font-medium text-main hover:border-brand hover:bg-brand-light/20 transition-all cursor-pointer shadow-2xs flex items-center justify-between group disabled:opacity-50"
                          >
                            <span className="flex items-center gap-2">
                              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-light text-brand">
                                <Bot className="h-3 w-3" />
                              </div>
                              <span>{prompt}</span>
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Indikator Mengetik */}
            {isLoading && (
              <div className="flex items-start gap-2">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-light text-brand border border-brand/20 mt-0.5 shadow-2xs">
                  <Bot className="h-3.5 w-3.5 text-brand" />
                </div>
                <div className="flex items-center gap-2 rounded-2xl rounded-tl-xs bg-white p-3 text-xs text-muted border border-line w-fit shadow-2xs">
                  <Sparkles className="h-3.5 w-3.5 text-brand animate-spin" />
                  <span>EcoBot sedang merespon...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Footer Form Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="border-t border-line bg-white p-3 flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              placeholder="Tanyakan seputar bank sampah..."
              disabled={isLoading}
              className="flex-1 rounded-lg border border-line bg-canvas px-3 py-2 text-xs text-main placeholder:text-muted focus:bg-white focus:border-brand focus:outline-hidden focus-visible:ring-2 focus-visible:ring-brand/30 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!inputPrompt.trim() || isLoading}
              aria-label="Kirim pesan"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand text-white hover:bg-brand-dark transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>

          {/* Catatan Privasi / Guardrail Info */}
          <div className="bg-surface-subtle px-3 py-1 border-t border-line text-[9px] text-muted text-center flex items-center justify-center gap-1">
            <AlertCircle className="h-2.5 w-2.5 text-brand shrink-0" />
            <span>
              EcoBot fokus menjawab seputar operasional Bank Sampah EcoCycle.
            </span>
          </div>
        </div>
      )}
    </>
  );
}
