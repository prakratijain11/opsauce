import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { BRAND, DEVELOPED_BY, OPPORTUNITY_CATEGORIES } from "@/lib/brand";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* brand panel */}
      <div className="relative hidden overflow-hidden bg-brand-radial lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="pointer-events-none absolute inset-0 bg-dotted opacity-30" />
        <div className="relative flex items-center justify-between gap-4">
          <Link href="/" className="focus-ring rounded-lg">
            <Logo invert />
          </Link>
          <ThemeToggle className="border-white/15 bg-white/10 text-white/80 hover:border-sand-300/50 hover:bg-white/20 hover:text-white" />
        </div>
        <div className="relative flex flex-col gap-6">
          <h2 className="font-display text-3xl font-bold leading-tight tracking-tight text-white">
            &ldquo;{BRAND.tagline}&rdquo;
          </h2>
          <p className="max-w-sm text-sm leading-relaxed text-white/70">
            {BRAND.subtitle}
          </p>
          <div className="flex flex-wrap gap-2">
            {OPPORTUNITY_CATEGORIES.slice(0, 7).map((c) => (
              <span
                key={c}
                className="rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-1 text-xs text-white/70"
              >
                {c}
              </span>
            ))}
          </div>
        </div>
        <p className="relative text-xs text-white/40">
          Developed By {DEVELOPED_BY} · © {BRAND.year}
        </p>
      </div>

      {/* form panel */}
      <div className="flex flex-col items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center justify-between lg:hidden">
            <Logo />
            <ThemeToggle />
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
