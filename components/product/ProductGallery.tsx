"use client";

import { useState } from "react";
import Image from "next/image";

// Main image + thumbnails (oru image-il kooduthal undenkil). Desktop-il hover cheythaal mouse position-il zoom.
export default function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [index, setIndex] = useState(0);
  const [origin, setOrigin] = useState("50% 50%");

  return (
    <div className="pdp-gallery">
      <div
        className="pdp-gallery__main"
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          setOrigin(`${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`);
        }}
      >
        <Image
          src={images[index]}
          alt={name}
          fill
          priority
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="pdp-gallery__img"
          style={{ transformOrigin: origin }}
        />
      </div>

      {images.length > 1 && (
        <div className="pdp-gallery__thumbs">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              className={i === index ? "is-active" : ""}
              aria-label={`Show image ${i + 1}`}
              onClick={() => setIndex(i)}
            >
              <Image src={src} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
