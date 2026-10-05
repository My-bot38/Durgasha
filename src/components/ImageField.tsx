"use client";

import { useRef, useState } from "react";

type Props = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
};

// Lets the user paste an image/audio URL OR upload a file (stored as a data URL
// so it works everywhere without external hosting). Keeps things easy.
export default function ImageField({
  label,
  value,
  onChange,
  placeholder,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const handleFile = (file: File) => {
    if (file.size > 4 * 1024 * 1024) {
      alert("File is larger than 4MB. Please pick a smaller image/audio.");
      return;
    }
    setBusy(true);
    const reader = new FileReader();
    reader.onload = () => {
      onChange(String(reader.result));
      setBusy(false);
    };
    reader.onerror = () => setBusy(false);
    reader.readAsDataURL(file);
  };

  const isImage = value && !value.startsWith("audio");

  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-white/60">
        {label}
      </label>
      <div className="flex gap-2">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? "Paste a URL…"}
          className="min-w-0 flex-1 rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-amber-400"
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="shrink-0 rounded-lg bg-white/10 px-3 py-2 text-sm font-medium hover:bg-white/20"
        >
          {busy ? "…" : "Upload"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*,audio/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
            e.target.value = "";
          }}
        />
      </div>
      {value && (
        <div className="mt-2 flex items-center gap-2">
          {isImage && value.length < 500000 ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={value}
              alt="preview"
              className="h-10 w-10 rounded-md object-cover"
            />
          ) : null}
          <button
            type="button"
            onClick={() => onChange("")}
            className="text-xs text-white/40 hover:text-rose-400"
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
}
