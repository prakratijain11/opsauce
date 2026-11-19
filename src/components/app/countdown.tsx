"use client";

import * as React from "react";

function parts(ms: number) {
  const clamped = Math.max(0, ms);
  const days = Math.floor(clamped / 86_400_000);
  const hours = Math.floor((clamped % 86_400_000) / 3_600_000);
  const mins = Math.floor((clamped % 3_600_000) / 60_000);
  const secs = Math.floor((clamped % 60_000) / 1000);
  return { days, hours, mins, secs };
}

export function Countdown({ target, label }: { target: string; label: string }) {
  // `now` starts null so server and client render identical markup; the real
  // clock is only read after mount, avoiding a hydration mismatch.
  const [now, setNow] = React.useState<number | null>(null);

  React.useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const remaining = now === null ? null : new Date(target).getTime() - now;
  const closed = remaining !== null && remaining <= 0;
  const time = remaining === null ? null : parts(remaining);

  const cells = [
    { v: time?.days, l: "Days" },
    { v: time?.hours, l: "Hours" },
    { v: time?.mins, l: "Mins" },
    { v: time?.secs, l: "Secs" },
  ];

  return (
    <div className="rounded-2xl border border-danger/20 bg-danger/[0.06] p-5">
      <p className="text-center text-sm font-semibold text-danger">
        {closed ? "Registration closed" : label}
      </p>
      <div className="mt-4 grid grid-cols-4 gap-2">
        {cells.map((c) => (
          <div key={c.l} className="rounded-xl bg-card py-3 text-center shadow-soft">
            <p className="font-display text-2xl font-bold tabular-nums">
              {c.v === undefined ? "--" : String(c.v).padStart(2, "0")}
            </p>
            <p className="text-[0.65rem] uppercase tracking-wide text-muted-foreground">
              {c.l}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
