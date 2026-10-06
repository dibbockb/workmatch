"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowRight,
  CaretDown,
  CircleNotch,
  SignOut,
  Sparkle,
  SquaresFour,
} from "@phosphor-icons/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLogout, useMe } from "@/features/auth/queries";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const DASHBOARD_HOME = {
  ADMIN: "/dashboard/admin",
  CLIENT: "/dashboard/client",
  FREELANCER: "/dashboard/freelancer",
} as const;

function initialsOf(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function AuthActions() {
  const router = useRouter();
  const qc = useQueryClient();
  const { data: user, isPending } = useMe();
  const logout = useLogout();

  async function handleLogout() {
    try {
      await logout.mutateAsync();
    } finally {
      qc.clear();
      router.refresh();
    }
  }

  if (isPending) {
    return <div className="size-9 animate-pulse rounded-full bg-muted" />;
  }

  if (!user) {
    return (
      <>
        <Link
          href="/login"
          className="hidden rounded-full px-3 py-2 text-sm font-medium whitespace-nowrap text-muted-foreground transition-colors hover:text-foreground sm:block"
        >
          Sign in
        </Link>
        <Link
          href="/signup"
          className="group hidden shrink-0 items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold whitespace-nowrap text-primary-foreground shadow-[0_8px_20px_-10px_oklch(0.43_0.04_42/0.8)] transition-colors duration-300 hover:bg-primary/90 sm:inline-flex"
        >
          <Sparkle
            weight="fill"
            className="size-3.5 transition-transform duration-500 ease-spring group-hover:rotate-90 group-hover:scale-125"
          />
          Post a job
          <ArrowRight className="size-3.5 transition-transform duration-500 ease-snappy group-hover:translate-x-0.5" />
        </Link>
      </>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 rounded-full border bg-card py-1 pr-2.5 pl-1 text-sm font-semibold transition-all duration-200 hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring/80">
        <span className="grid size-8 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
          {initialsOf(user.name)}
        </span>
        <span className="hidden max-w-28 truncate sm:block">{user.name}</span>
        <CaretDown className="size-3.5 text-muted-foreground" />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        side="bottom"
        sideOffset={8}
        className="w-64"
      >
        <div className="px-2 py-2">
          <p className="truncate text-sm font-bold">{user.name}</p>
          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          <span className="mt-2 inline-block rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold tracking-wide text-secondary-foreground uppercase">
            {user.role}
          </span>
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          render={<Link href={DASHBOARD_HOME[user.role]} />}
          className="cursor-pointer gap-2"
        >
          <SquaresFour className="size-4" />
          Dashboard
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={handleLogout}
          disabled={logout.isPending}
          className="cursor-pointer gap-2 text-destructive"
        >
          {logout.isPending ? (
            <CircleNotch className="size-4 animate-spin" />
          ) : (
            <SignOut className="size-4" />
          )}
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
