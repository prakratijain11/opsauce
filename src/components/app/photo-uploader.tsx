"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Camera, Loader2, Trash2 } from "lucide-react";
import { updateAvatarAction } from "@/lib/actions/profile";
import { initials } from "@/lib/utils";

type Props = {
  name: string;
  avatarUrl?: string | null;
};

const MAX_SOURCE_BYTES = 5 * 1024 * 1024;

/** Center-crop to a square and compress so it fits comfortably in a DB column. */
function resizeToDataUrl(file: File, size = 256): Promise<string> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Canvas unavailable");
        const side = Math.min(image.naturalWidth, image.naturalHeight);
        const sx = (image.naturalWidth - side) / 2;
        const sy = (image.naturalHeight - side) / 2;
        ctx.drawImage(image, sx, sy, side, side, 0, 0, size, size);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      } catch (err) {
        reject(err);
      } finally {
        URL.revokeObjectURL(objectUrl);
      }
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Invalid image"));
    };
    image.src = objectUrl;
  });
}

export function PhotoUploader({ name, avatarUrl }: Props) {
  const router = useRouter();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [preview, setPreview] = React.useState<string | null>(avatarUrl ?? null);
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setPreview(avatarUrl ?? null);
  }, [avatarUrl]);

  async function save(dataUrl: string | null) {
    setError(null);
    setPending(true);
    try {
      const res = await updateAvatarAction(dataUrl);
      if (res && "error" in res && res.error) {
        setError(res.error);
        setPreview(avatarUrl ?? null);
        return;
      }
      setPreview(dataUrl);
      router.refresh();
    } catch {
      setError("Could not save the photo. Please try again.");
      setPreview(avatarUrl ?? null);
    } finally {
      setPending(false);
    }
  }

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    if (file.size > MAX_SOURCE_BYTES) {
      setError("Image is too large — please choose one under 5 MB.");
      return;
    }
    try {
      const dataUrl = await resizeToDataUrl(file);
      await save(dataUrl);
    } catch {
      setError("Could not read that image. Try a JPG or PNG.");
    }
  }

  return (
    <div className="relative shrink-0">
      <div className="grid h-20 w-20 place-items-center overflow-hidden rounded-2xl bg-brand-gradient text-2xl font-bold text-white">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt={name} className="h-full w-full object-cover" />
        ) : (
          initials(name)
        )}
        {pending ? (
          <span className="absolute inset-0 grid place-items-center rounded-2xl bg-black/45">
            <Loader2 className="h-5 w-5 animate-spin text-white" />
          </span>
        ) : null}
      </div>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={pending}
        title="Change profile photo"
        aria-label="Change profile photo"
        className="absolute -bottom-2 -right-2 grid h-8 w-8 place-items-center rounded-full border-2 border-card bg-brand-600 text-white shadow-sm transition hover:bg-brand-700 disabled:opacity-60"
      >
        <Camera className="h-4 w-4" />
      </button>

      {preview ? (
        <button
          type="button"
          onClick={() => save(null)}
          disabled={pending}
          title="Remove photo"
          aria-label="Remove photo"
          className="absolute -bottom-2 -left-2 grid h-8 w-8 place-items-center rounded-full border-2 border-card bg-secondary text-foreground shadow-sm transition hover:bg-muted disabled:opacity-60"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      ) : null}

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={onFileChange}
      />

      {error ? (
        <p className="absolute left-0 top-full mt-3 w-56 rounded-lg border border-danger/30 bg-danger/[0.07] px-3 py-2 text-xs text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
