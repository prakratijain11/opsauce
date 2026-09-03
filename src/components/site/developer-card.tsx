import { Github, Linkedin, Mail } from "lucide-react";
import { initials } from "@/lib/utils";

interface Developer {
  name: string;
  role: string;
  description: string;
  focus: readonly string[];
  socials: { github: string; linkedin: string; email: string };
}

export function DeveloperCard({ dev, index }: { dev: Developer; index: number }) {
  return (
    <article className="group relative overflow-hidden rounded-3xl border border-border bg-card p-8 shadow-card transition-all duration-500 hover:-translate-y-1 hover:shadow-elevated">
      {/* accent wash */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-brand-gradient opacity-[0.08] blur-2xl transition-opacity duration-500 group-hover:opacity-20" />

      <div className="flex items-center gap-5">
        <div className="relative">
          <div className="grid h-20 w-20 place-items-center rounded-2xl bg-brand-gradient text-2xl font-bold text-white shadow-glow">
            {initials(dev.name)}
          </div>
          <span className="absolute -bottom-1.5 -right-1.5 rounded-full border-2 border-card bg-success px-1.5 py-0.5 text-[0.6rem] font-bold uppercase tracking-wide text-success-foreground">
            0{index + 1}
          </span>
        </div>
        <div>
          <h3 className="font-display text-xl font-bold tracking-tight">{dev.name}</h3>
          <p className="mt-0.5 text-sm font-semibold text-brand-600 dark:text-brand-300">
            {dev.role}
          </p>
        </div>
      </div>

      <p className="mt-6 text-[15px] leading-relaxed text-muted-foreground">
        &ldquo;{dev.description}&rdquo;
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {dev.focus.map((f) => (
          <span
            key={f}
            className="rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground"
          >
            {f}
          </span>
        ))}
      </div>

      <div className="mt-8 flex items-center gap-2 border-t border-border pt-6">
        <SocialLink href={dev.socials.github} label="GitHub">
          <Github className="h-4 w-4" />
        </SocialLink>
        <SocialLink href={dev.socials.linkedin} label="LinkedIn">
          <Linkedin className="h-4 w-4" />
        </SocialLink>
        <SocialLink href={dev.socials.email} label="Email">
          <Mail className="h-4 w-4" />
        </SocialLink>
      </div>
    </article>
  );
}

function SocialLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      aria-label={label}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel="noreferrer noopener"
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-500/10"
    >
      {children}
    </a>
  );
}
