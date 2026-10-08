"use client";

import { useActionState, useState } from "react";
import { login, type LoginState } from "@/lib/actions/admin-auth";

export default function LoginForm() {
  const [state, action, pending] = useActionState(login, {} as LoginState);
  const [show, setShow] = useState(false); // password show / hide

  return (
    <form action={action} className="mt-8 grid gap-4" noValidate>
      {state.error && (
        <p role="alert" className="border-[1.5px] border-rose bg-rose/5 px-3 py-2.5 text-[0.8125rem] text-rose-deep">
          {state.error}
        </p>
      )}
      <label className="adm-field">
        <span>Email</span>
        <input name="email" type="email" autoComplete="username" required defaultValue={state.email} />
      </label>
      <div className="adm-field">
        <label htmlFor="adm-password">Password</label>
        <div className="adm-password">
          <input id="adm-password" name="password" type={show ? "text" : "password"} autoComplete="current-password" required />
          {/* eye button — type="button" so it doesn't submit the form */}
          <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? "Hide password" : "Show password"} aria-pressed={show}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
              <circle cx="12" cy="12" r="3" />
              {show && <path d="M3 3l18 18" />}
            </svg>
          </button>
        </div>
      </div>
      <button type="submit" disabled={pending} className="adm-btn adm-btn--primary mt-2 w-full justify-center">
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
