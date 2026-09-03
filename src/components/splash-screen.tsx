"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LogoMark } from "@/components/brand/logo";
import { BRAND, DEVELOPED_BY } from "@/lib/brand";

const SESSION_KEY = "oos:splash-seen";

export function SplashScreen({ minDurationMs = 1900 }: { minDurationMs?: number }) {
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(SESSION_KEY) === "1";
    } catch {
      /* storage unavailable — show once */
    }
    if (seen) return;

    setVisible(true);
    document.documentElement.style.overflow = "hidden";

    const t = setTimeout(() => {
      setVisible(false);
      document.documentElement.style.overflow = "";
      try {
        sessionStorage.setItem(SESSION_KEY, "1");
      } catch {
        /* ignore */
      }
    }, minDurationMs);

    return () => {
      clearTimeout(t);
      document.documentElement.style.overflow = "";
    };
  }, [minDurationMs]);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-brand-radial text-white"
        >
          <div className="pointer-events-none absolute inset-0 bg-dotted opacity-40" />

          <motion.div
            initial={{ opacity: 0, y: 14, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex flex-col items-center gap-6"
          >
            <div className="relative">
              <span className="absolute inset-0 -z-10 animate-pulse-ring rounded-[22px] bg-brand-400/40" />
              <LogoMark className="h-16 w-16 drop-shadow-[0_8px_30px_rgba(139,92,246,0.55)]" />
            </div>

            <div className="flex flex-col items-center gap-2">
              <h1 className="font-display text-2xl font-bold tracking-tight">
                {BRAND.name}
              </h1>
              <p className="text-sm text-white/70">&ldquo;{BRAND.tagline}&rdquo;</p>
            </div>

            <div className="mt-1 h-1 w-40 overflow-hidden rounded-full bg-white/10">
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
                className="h-full w-1/2 rounded-full bg-gradient-to-r from-transparent via-white to-transparent"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="absolute bottom-10 flex flex-col items-center gap-1 text-center"
          >
            <span className="text-[0.7rem] uppercase tracking-[0.2em] text-white/45">
              Developed By
            </span>
            <span className="text-sm font-medium text-white/80">{DEVELOPED_BY}</span>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
