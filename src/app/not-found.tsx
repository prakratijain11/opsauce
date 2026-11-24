import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="absolute right-6 top-6">
        <ThemeToggle />
      </div>
      <Logo />
      <div>
        <p className="font-display text-6xl font-bold text-primary">404</p>
        <h1 className="mt-2 font-display text-xl font-semibold">
          This page has closed its registration window
        </h1>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist — but plenty of
          opportunities still do.
        </p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button href="/">Back home</Button>
        <Button href="/explore" variant="secondary">
          Explore opportunities
        </Button>
      </div>
    </div>
  );
}
