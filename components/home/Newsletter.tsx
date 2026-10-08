"use client";

import { useState, useTransition } from "react";
import { subscribe } from "@/lib/actions/newsletter";

type Status = "idle" | "error" | "success";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [serverMsg, setServerMsg] = useState<string>();
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); // page reload aakathirikkaan
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    if (!valid) {
      setStatus("error");
      return;
    }
    // valid → server action → Subscriber table-il save
    const fd = new FormData();
    fd.set("email", email);
    startTransition(async () => {
      const res = await subscribe({ status: "idle" }, fd);
      setStatus(res.status);
      setServerMsg(res.message);
      if (res.status === "success") setEmail("");
    });
  }

  return (
    <section className="news border-y border-rule bg-slate py-16 lg:py-24">
      <div className="page-shell">
        <div className="mx-auto grid max-w-[56rem] gap-10 lg:grid-cols-[minmax(0,1fr)_28rem] lg:items-start lg:gap-2">
          {/* ---------- Left: heading ---------- */}
          <div>
            <p className="news__label">
              <span className="size-2 bg-rose" aria-hidden="true" />
              Newsletter &amp; Dispatches
            </p>
            <h2 className="news__title">Keep in Touch.</h2>
            <p className="mt-5 max-w-[27rem] text-[0.9375rem] leading-relaxed text-ivory/75">
              New collections, quiet edition drops, exhibition invitations, and textile
              essays delivered twice monthly.
            </p>
          </div>

          {/* ---------- Right: form ---------- */}
          <form onSubmit={handleSubmit} noValidate className="lg:pt-10">
            <div className="flex items-end gap-2">
              <label htmlFor="newsletter-email" className="sr-only">
                Email address
              </label>
              <input
                id="newsletter-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setServerMsg(undefined);
                  if (status !== "idle") setStatus("idle");
                }}
                aria-invalid={status === "error"}
                aria-describedby="newsletter-msg"
                className="news__input"
              />
              <button type="submit" disabled={pending} className="news__btn group disabled:opacity-60">
                Join
                <span className="transition-transform group-hover:translate-x-1" aria-hidden="true">→</span>
              </button>
            </div>

            <p id="newsletter-msg" role="status" className={`news__msg ${status !== "idle" ? `news__msg--${status}` : ""}`}>
              {status === "error" && (serverMsg ?? "Please enter a valid email address.")}
              {status === "success" && (serverMsg ?? "Thank you — you're on the list.")}
              {status === "idle" && "No promotional noise. Unsubscribe any time."}
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}
