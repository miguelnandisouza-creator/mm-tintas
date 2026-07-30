"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, LoaderCircle, Search, X } from "lucide-react";

import {
  lookupBarcodeAction,
  type BarcodeProductMatch,
} from "@/features/admin/actions";

type Detector = {
  detect(source: HTMLVideoElement): Promise<Array<{ rawValue: string }>>;
};
type DetectorConstructor = new (options?: { formats?: string[] }) => Detector;

export function BarcodeProductField({
  value,
  error,
  onChange,
  onResolved,
}: {
  value: string;
  error?: string;
  onChange: (value: string) => void;
  onResolved: (match: BarcodeProductMatch) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<number | null>(null);
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  function stopCamera() {
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setScanning(false);
  }

  useEffect(() => stopCamera, []);

  async function findProduct(code = value) {
    const normalized = code.replace(/\D/g, "");
    onChange(normalized);
    setMessage(null);
    setLoading(true);
    const result = await lookupBarcodeAction(normalized);
    setLoading(false);
    if (!result.ok) return setMessage(result.message);
    onResolved(result.data);
    setMessage(
      result.data.source === "catalog"
        ? "Produto já encontrado no catálogo."
        : "Dados encontrados. Revise as informações antes de salvar.",
    );
  }

  async function startCamera() {
    setMessage(null);
    const BarcodeDetector = (
      window as typeof window & { BarcodeDetector?: DetectorConstructor }
    ).BarcodeDetector;
    if (!BarcodeDetector) {
      return setMessage(
        "A câmera não é compatível neste navegador. Digite o código e use Buscar.",
      );
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      streamRef.current = stream;
      setScanning(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      const detector = new BarcodeDetector({
        formats: ["ean_13", "ean_8", "upc_a", "upc_e", "code_128"],
      });
      timerRef.current = window.setInterval(async () => {
        if (!videoRef.current) return;
        const code = (await detector.detect(videoRef.current))[0]?.rawValue;
        if (code) {
          stopCamera();
          await findProduct(code);
        }
      }, 450);
    } catch {
      stopCamera();
      setMessage("Não foi possível acessar a câmera. Verifique a permissão.");
    }
  }

  return (
    <div>
      <span className="mb-2 block text-sm font-semibold text-slate-800">
        Código de barras / EAN / SKU
      </span>
      <div className="flex gap-2">
        <input
          value={value}
          inputMode="numeric"
          autoComplete="off"
          placeholder="Ex.: 7891234567890"
          onChange={(event) => onChange(event.target.value)}
          className="h-11 min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-950 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
        />
        <button type="button" onClick={() => void findProduct()} disabled={loading || !value.trim()} className="grid size-11 place-items-center rounded-xl bg-blue-700 text-white disabled:opacity-50" aria-label="Buscar produto pelo código">
          {loading ? <LoaderCircle className="size-5 animate-spin" /> : <Search className="size-5" />}
        </button>
        <button type="button" onClick={scanning ? stopCamera : () => void startCamera()} className="grid size-11 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700" aria-label={scanning ? "Fechar câmera" : "Ler código pela câmera"}>
          {scanning ? <X className="size-5" /> : <Camera className="size-5" />}
        </button>
      </div>
      {scanning ? <video ref={videoRef} muted playsInline className="mt-3 aspect-video w-full rounded-xl bg-slate-950 object-cover" /> : null}
      {error || message ? <p className={`mt-1.5 text-xs ${error ? "text-red-600" : "text-slate-500"}`}>{error ?? message}</p> : null}
    </div>
  );
}
