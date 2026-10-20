"use client";

import { useRef, useState } from "react";

export function CapturaArchivo({
  label,
  value,
  onChange,
  error,
}: {
  label: string;
  value: File | null;
  onChange: (archivo: File | null) => void;
  error?: string | null;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [camaraActiva, setCamaraActiva] = useState(false);
  const [errorCamara, setErrorCamara] = useState<string | null>(null);

  async function abrirCamara() {
    setErrorCamara(null);
    try {
      const nuevoStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      setStream(nuevoStream);
      setCamaraActiva(true);
      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = nuevoStream;
          videoRef.current.play();
        }
      });
    } catch {
      setErrorCamara(
        "No pudimos acceder a la cámara. Puedes seleccionar un archivo en su lugar."
      );
    }
  }

  function cerrarCamara() {
    stream?.getTracks().forEach((track) => track.stop());
    setStream(null);
    setCamaraActiva(false);
  }

  function capturarFoto() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);

    canvas.toBlob(
      (blob) => {
        if (blob) {
          onChange(new File([blob], `captura-${Date.now()}.jpg`, { type: "image/jpeg" }));
        }
        cerrarCamara();
      },
      "image/jpeg",
      0.9
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-[14px] font-medium text-ink">{label}</span>

      {!camaraActiva && (
        <>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="rounded-full border border-line px-4 py-2 text-[13px] font-medium text-ink hover:bg-black/5"
            >
              Seleccionar archivo
            </button>
            <button
              type="button"
              onClick={abrirCamara}
              className="rounded-full border border-line px-4 py-2 text-[13px] font-medium text-ink hover:bg-black/5"
            >
              Tomar foto
            </button>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf,image/jpeg,image/png"
            className="hidden"
            onChange={(e) => onChange(e.target.files?.[0] ?? null)}
          />
          <p className="text-[13px] text-muted">
            {value ? `Listo: ${value.name}` : "Sin archivo seleccionado"}
          </p>
          {errorCamara && <p className="text-[13px] text-accent">{errorCamara}</p>}
          {error && <p className="text-[13px] text-accent">{error}</p>}
        </>
      )}

      {camaraActiva && (
        <div className="flex flex-col gap-3 rounded-2xl border border-line p-4">
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <video ref={videoRef} muted playsInline className="w-full rounded-xl bg-black" />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={capturarFoto}
              className="rounded-full bg-ink px-4 py-2 text-[13px] font-semibold text-bg"
            >
              Capturar
            </button>
            <button
              type="button"
              onClick={cerrarCamara}
              className="rounded-full border border-line px-4 py-2 text-[13px] font-medium text-ink"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
