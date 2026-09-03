import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { BRAND, COPYRIGHT, DEVELOPED_BY, OPPORTUNITY_CATEGORIES } from "@/lib/brand";

const productLinks = [
  { label: "Discover", href: "/explore" },
  { label: "Dashboard", href: "/dashboard" },
  { label: "Deadline Tracking", href: "/dashboard#deadlines" },
  { label: "Document Vault", href: "/documents" },
];

const companyLinks = [
  { label: "About", href: "/about" },
  { label: "Our Mission", href: "/about#mission" },
  { label: "Our Vision", href: "/about#vision" },
  { label: "Meet the Developers", href: "/about#developers" },
];

const resourceLinks = [
  { label: "Sign in", href: "/sign-in" },
  { label: "Create account", href: "/sign-up" },
  { label: "Settings", href: "/settings" },
  { label: "About in app", href: "/settings?tab=about" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-secondary/40">
      <div className="container py-16">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="flex flex-col gap-4">
            <Logo />
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              &ldquo;{BRAND.tagline}&rdquo;
            </p>
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              {BRAND.subtitle}
            </p>
          </div>

          <FooterColumn title="Product" links={productLinks} />
          <FooterColumn title="Company" links={companyLinks} />
          <FooterColumn title="Get Started" links={resourceLinks} />
        </div>

        <div className="mt-12 border-t border-border pt-8">
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
            {OPPORTUNITY_CATEGORIES.map((c, i) => (
              <span key={c} className="inline-flex items-center gap-3">
                {c}
                {i < OPPORTUNITY_CATEGORIES.length - 1 ? (
                  <span className="text-border">•</span>
                ) : null}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-border pt-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>{COPYRIGHT}</p>
          <p>
            Developed By{" "}
            <span className="font-medium text-foreground">{DEVELOPED_BY}</span>
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {title}
      </h3>
      <ul className="flex flex-col gap-2.5">
        {links.map((l) => (
          <li key={l.label}>
            <Link
              href={l.href}
              className="text-sm text-foreground/80 transition-colors hover:text-brand-600"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
