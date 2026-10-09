"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { uploadProductImage } from "@/lib/actions/admin-products";

const MAX_SIDE = 1400; // px — plenty for the product page, keeps uploads around 150–400 KB

/** Shrinks the photo in the browser before upload (JPEG, longest side ≤ MAX_SIDE) */
async function resizeImage(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file); // respects the photo's EXIF rotation in modern browsers
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("resize failed"))), "image/jpeg", 0.85),
  );
}

// Photo grid for the product form: pick an existing photo, or upload one from the computer / phone gallery.
// The chosen photo is sent with the form as the radio value "image".
export default function PhotoPicker({ initial, options, error }: { initial: string; options: string[]; error?: string }) {
  // a just-uploaded photo may not be in the server list yet after an error re-render — keep it visible
  const [list, setList] = useState(() => (initial && !options.includes(initial) ? [initial, ...options] : options));
  const [picked, setPicked] = useState(initial);
  const [uploadError, setUploadError] = useState("");
  const [uploading, startUpload] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  const onFile = (file: File | undefined) => {
    if (!file) return;
    setUploadError("");
    startUpload(async () => {
      try {
        const blob = await resizeImage(file);
        const fd = new FormData();
        fd.append("file", new File([blob], "photo.jpg", { type: "image/jpeg" }));
        const res = await uploadProductImage(fd);
        if (res.url) {
          setList((l) => [res.url!, ...l]);
          setPicked(res.url);
        } else setUploadError(res.error ?? "Upload failed. Try again.");
      } catch {
        setUploadError("This photo couldn't be read. Try a JPG or PNG.");
      } finally {
        if (fileRef.current) fileRef.current.value = ""; // allow picking the same file again
      }
    });
  };

  return (
    <fieldset aria-describedby={error || uploadError ? "image-error" : undefined}>
      <legend className="sr-only">Choose the product photo</legend>
      <div className="adm-picker">
        {/* upload tile — opens the file picker (computer) or the gallery / camera (phone) */}
        <label className={`adm-picker__upload ${uploading ? "is-busy" : ""}`}>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => onFile(e.target.files?.[0])} disabled={uploading} />
          {uploading ? (
            <span className="adm-search__spinner" aria-hidden="true" />
          ) : (
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 16V4M7 9l5-5 5 5M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" />
            </svg>
          )}
          <span>{uploading ? "Uploading…" : "Upload photo"}</span>
        </label>

        {list.map((src) => (
          <label key={src} className="adm-picker__item">
            <input type="radio" name="image" value={src} checked={picked === src} onChange={() => setPicked(src)} />
            <Image src={src} alt="" fill sizes="96px" className="object-cover object-top" />
          </label>
        ))}
      </div>
      {(uploadError || error) && (
        <span id="image-error" className="adm-field__error mt-2 block" role="alert">
          {uploadError || error}
        </span>
      )}
    </fieldset>
  );
}
