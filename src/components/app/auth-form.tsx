"use client";

import * as React from "react";
import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import { AlertCircle, Loader2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signInAction, signUpAction, type AuthState } from "@/lib/actions/auth";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending} className="mt-2 w-full">
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      {label}
    </Button>
  );
}

export function AuthForm({
  mode,
  next,
}: {
  mode: "sign-in" | "sign-up";
  next?: string;
}) {
  const isSignUp = mode === "sign-up";
  const action = isSignUp ? signUpAction : signInAction;
  const [state, formAction] = useFormState<AuthState, FormData>(action, undefined);
  const formRef = React.useRef<HTMLFormElement>(null);

  const handleDemoLogin = () => {
    if (!formRef.current) return;
    const formData = new FormData(formRef.current);
    formData.set("email", "prakrati@opsauce.ai");
    formData.set("password", "demo1234");

    // Since useFormState is tied to the form action,
    // we trigger the action manually using the formAction.
    const event = new Request("http://localhost", {
      method: "POST",
      body: formData,
    });

    // To trigger the server action from client side without a native submit,
    // it's better to just fill the fields and call submit().
    const emailInput = formRef.current.querySelector('input[name="email"]') as HTMLInputElement;
    const passInput = formRef.current.querySelector('input[name="password"]') as HTMLInputElement;
    if (emailInput) emailInput.value = "prakrati@opsauce.ai";
    if (passInput) passInput.value = "demo1234";
    formRef.current.requestSubmit();
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center sm:text-left">
        <h1 className="font-display text-3xl font-bold tracking-tight">
          {isSignUp ? "Create your account" : "Welcome back"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {isSignUp
            ? "Start discovering opportunities meant for you."
            : "Sign in to pick up where you left off."}
        </p>
      </div>

      {state?.error ? (
        <p className="flex items-start gap-2 rounded-xl border border-danger/30 bg-danger/[0.07] px-3.5 py-2.5 text-sm text-danger">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {state.error}
        </p>
      ) : null}

      <form ref={formRef} action={formAction} className="flex flex-col gap-4">
        {!isSignUp && next ? <input type="hidden" name="next" value={next} /> : null}
        {isSignUp ? (
          <Field label="Full name" name="name" type="text" placeholder="Prakrati Jain" autoComplete="name" />
        ) : null}
        <Field
          label="Email"
          name="email"
          type="email"
          placeholder="you@college.edu"
          autoComplete="email"
        />
        <Field
          label="Password"
          name="password"
          type="password"
          placeholder="At least 8 characters"
          autoComplete={isSignUp ? "new-password" : "current-password"}
        />
        <SubmitButton label={isSignUp ? "Create account" : "Sign in"} />
      </form>

      {!isSignUp && (
        <div className="rounded-xl border border-brand-500/20 bg-brand-500/[0.03] p-4 text-center">
          <p className="text-xs text-muted-foreground mb-3">
            Experience the platform instantly with a demo account:
          </p>
          <div className="flex flex-col gap-3">
            <div className="flex justify-center gap-4 text-xs font-medium">
              <p><span className="text-muted-foreground">Email:</span> prakrati@opsauce.ai</p>
              <p><span className="text-muted-foreground">Password:</span> demo1234</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDemoLogin}
              className="mx-auto w-full max-w-xs gap-2 border-brand-500/30 text-brand-600 hover:bg-brand-500/10"
            >
              <Zap className="h-3 w-3" /> Quick Demo Login
            </Button>
          </div>
        </div>
      )}

      <p className="text-center text-sm text-muted-foreground">
        {isSignUp ? "Already have an account? " : "New to OpSauce? "}
        <Link
          href={isSignUp ? "/sign-in" : "/sign-up"}
          className="font-medium text-brand-600 hover:underline"
        >
          {isSignUp ? "Sign in" : "Create an account"}
        </Link>
      </p>
    </div>
  );
}

function Field({
  label,
  name,
  type,
  placeholder,
  autoComplete,
}: {
  label: string;
  name: string;
  type: string;
  placeholder: string;
  autoComplete?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium">{label}</span>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required
        className="focus-ring h-11 rounded-xl border border-input bg-card px-3.5 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-brand-400"
      />
    </label>
  );
}
