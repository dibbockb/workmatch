"use client";

import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/landing/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Field, FieldError } from "@/components/ui/field";
import { Separator } from "@/components/ui/separator";
import {
  DEMO_ACCOUNTS,
  DEMO_ROLES,
  type DemoRole,
} from "@/lib/demo-accounts";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  Briefcase,
  CircleNotch,
  Eye,
  EyeSlash,
  Info,
  Palette,
  ShieldCheck,
} from "@phosphor-icons/react";
import { LoginInput, loginSchema } from "@/features/auth/schemas";
import { useLogin } from "@/features/auth/queries";

const ROLE_ICONS: Record<DemoRole, typeof ShieldCheck> = {
  admin: ShieldCheck,
  client: Briefcase,
  freelancer: Palette,
};

function getNextPath() {
  const next = new URLSearchParams(window.location.search).get("next");
  const safe =
    next &&
    next.startsWith("/") &&
    !next.startsWith("//") &&
    !next.startsWith("/\\");
  return safe ? next : "/dashboard";
}

function getErrorMessage(error: unknown) {
  const e = error as { data?: { message?: string }; statusCode?: number };
  if (e?.data?.message) return e.data.message;
  if (e?.statusCode === 401) return "Invalid email or password.";
  return "Something went wrong. Please try again.";
}

export default function LoginPage() {
  const router = useRouter();
  const loginMutation = useLogin();
  const [showPassword, setShowPassword] = useState(false);
  const [loadingRole, setLoadingRole] = useState<DemoRole | null>(null);

  const busy = loginMutation.isPending || loginMutation.isSuccess;

  async function signIn(values: LoginInput) {
    try {
      await loginMutation.mutateAsync(values);
      router.replace(getNextPath());
      router.refresh();
    } catch {
    }
  }

  const form = useForm({
    defaultValues: { email: "", password: "" } satisfies LoginInput,
    validators: { onSubmit: loginSchema },
    onSubmit: ({ value }) => signIn(value),
  });

  async function handleDemoLogin(role: DemoRole) {
    if (busy) return;
    const account = DEMO_ACCOUNTS[role];
    form.setFieldValue("email", account.email);
    form.setFieldValue("password", account.password);
    setLoadingRole(role);
    await signIn({ email: account.email, password: account.password });
    setLoadingRole(null);
  }

  return (
    <div className="min-h-full bg-background font-sans text-foreground">
      <Navbar />

      <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-5 pt-32 pb-16">
        <div className="animate-rise rounded-4xl border border-border bg-card p-7 shadow-[0_40px_100px_-40px_oklch(0.43_0.04_42/0.5)] sm:p-9">
          <h1 className="mt-5 text-3xl font-bold tracking-[-0.03em]">
            Welcome back
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Sign in to your marketplace workspace.
          </p>

          <p className="mt-7 text-xs font-bold tracking-[0.14em] text-muted-foreground uppercase">
            Try a demo account
          </p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {DEMO_ROLES.map((role) => {
              const Icon = ROLE_ICONS[role];
              const isActive = busy && loadingRole === role;
              return (
                <button
                  key={role}
                  type="button"
                  disabled={busy}
                  onClick={() => handleDemoLogin(role)}
                  className={cn(
                    "flex flex-col items-center gap-1.5 rounded-2xl border px-2 py-3.5 text-[13px] font-bold transition-all duration-500 ease-snappy disabled:cursor-wait disabled:opacity-70",
                    isActive
                      ? "border-primary/60 bg-secondary text-secondary-foreground shadow-md"
                      : "border-border bg-background text-foreground hover:-translate-y-0.5 hover:border-primary/40 hover:bg-secondary hover:text-secondary-foreground hover:shadow-md"
                  )}
                >
                  {isActive ? (
                    <CircleNotch className="size-5 animate-spin" />
                  ) : (
                    <Icon weight="duotone" className="size-5" />
                  )}
                  {DEMO_ACCOUNTS[role].label}
                </button>
              );
            })}
          </div>

          <div className="my-6 flex items-center gap-3 text-xs font-medium text-muted-foreground">
            <Separator className="flex-1 opacity-80" />
            or continue with email
            <Separator className="flex-1 opacity-80" />
          </div>

          <form
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
            className="flex flex-col gap-4"
          >
            <form.Field name="email">
              {(field) => {
                const invalid = field.state.meta.errors.length > 0;
                return (
                  <Field data-invalid={invalid}>
                    <Label htmlFor={field.name}>Email</Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="email"
                      autoComplete="email"
                      placeholder="jhon@doe.com"
                      aria-invalid={invalid}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="transition-all duration-300 ease-spring "
                    />
                    <FieldError errors={field.state.meta.errors} />
                  </Field>
                );
              }}
            </form.Field>

            <form.Field name="password">
              {(field) => {
                const invalid = field.state.meta.errors.length > 0;
                return (
                  <Field data-invalid={invalid}>
                    <div className="flex items-center justify-between">
                      <Label htmlFor={field.name}>Password</Label>
                      <a
                        href="/login"
                        className="text-xs font-semibold text-muted-foreground transition-colors hover:text-primary"
                      >
                        Forgot password?
                      </a>
                    </div>
                    <div className="relative">
                      <Input
                        id={field.name}
                        name={field.name}
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        placeholder="••••••••"
                        aria-invalid={invalid}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        className="pr-10 transition-all duration-300 ease-spring"

                      />
                      <button
                        type="button"
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute top-1/2 right-2.5 grid size-6 -translate-y-1/2 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      >
                        {showPassword ? (
                          <EyeSlash className="size-4" />
                        ) : (
                          <Eye className="size-4" />
                        )}
                      </button>
                    </div>
                    <FieldError errors={field.state.meta.errors} />
                  </Field>
                );
              }}
            </form.Field>

            <Button
              type="submit"
              size="lg"
              disabled={busy}
              className="mt-1 w-full rounded-xl py-3 text-[15px] font-bold"
            >
              {busy && loadingRole === null ? (
                <>
                  <CircleNotch className="size-4 animate-spin" />
                  Signing in…
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="size-4" />
                </>
              )}
            </Button>
          </form>

          {loginMutation.isError && (
            <p
              role="alert"
              className="mt-4 flex items-start gap-2 rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-[13px] leading-relaxed text-destructive"
            >
              <Info className="mt-0.5 size-4 shrink-0" />
              {getErrorMessage(loginMutation.error)}
            </p>
          )}

          <p className="mt-6 text-center text-sm text-muted-foreground">
            New to WorkMatch?{" "}
            <Link
              href="/signup"
              className="font-bold text-primary hover:underline"
            >
              Create an account
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
