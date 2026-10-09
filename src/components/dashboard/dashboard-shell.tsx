"use client";

import { List, Moon, SignOut, Sun } from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, useEffect, useState } from "react";
import { useTheme } from "next-themes";
import {
	AnimatedSidebar,
	AnimatedSidebarContent,
	AnimatedSidebarFooter,
	AnimatedSidebarGroup,
	AnimatedSidebarGroupContent,
	AnimatedSidebarGroupLabel,
	AnimatedSidebarHeader,
	AnimatedSidebarInset,
	AnimatedSidebarMenu,
	AnimatedSidebarMenuButton,
	AnimatedSidebarMenuItem,
	AnimatedSidebarProvider,
	AnimatedSidebarTrigger,
} from "@/components/motion/animated-sidebar";
import { ROLE_HOME, type Role } from "@/lib/roles";
import { NAV, getActiveHref } from "./nav-config";
import { useMe, useSignOut } from "@/features/auth/queries";

function SidebarThemeItem() {
	const { resolvedTheme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => setMounted(true), []);

	const isDark = mounted && resolvedTheme === "dark";

	return (
		<AnimatedSidebarMenuButton
			icon={
				isDark ? <Sun className="size-4.5" /> : <Moon className="size-4.5" />
			}
			onSelect={() => setTheme(isDark ? "light" : "dark")}
		>
			{isDark ? "Light mode" : "Dark mode"}
		</AnimatedSidebarMenuButton>
	);
}

export function DashboardShell({
	role,
	children,
}: {
	role: Role;
	children: ReactNode;
}) {
	const pathname = usePathname();
	const router = useRouter();
	const { data: user, isPending } = useMe();
	const { signOut, isPending: signingOut } = useSignOut();

	const groups = NAV[role];
	const activeHref = getActiveHref(pathname, groups);

	useEffect(() => {
		if (isPending) return;
		if (!user) router.replace(`/login?next=${encodeURIComponent(pathname)}`);
		else if (user.role !== role) router.replace(ROLE_HOME[user.role]);
	}, [isPending, user, role, pathname, router]);

	return (
		<AnimatedSidebarProvider>
			<AnimatedSidebar ariaLabel={`${role.toLowerCase()} navigation`}>
				<AnimatedSidebarHeader>
					<Link href="/" className="flex items-center gap-2 px-1">
						<span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary font-bold text-primary-foreground">
							W
						</span>
						<span className="truncate font-bold">WorkMatch</span>
					</Link>
				</AnimatedSidebarHeader>

				<AnimatedSidebarContent>
					{groups.map((group) => (
						<AnimatedSidebarGroup key={group.label}>
							<AnimatedSidebarGroupLabel>
								{group.label}
							</AnimatedSidebarGroupLabel>
							<AnimatedSidebarGroupContent>
								<AnimatedSidebarMenu>
									{group.items.map((item) => (
										<AnimatedSidebarMenuItem key={item.href}>
											<AnimatedSidebarMenuButton
												href={item.href}
												icon={<item.icon className="size-4.5" />}
												isActive={item.href === activeHref}
											>
												{item.label}
											</AnimatedSidebarMenuButton>
										</AnimatedSidebarMenuItem>
									))}
								</AnimatedSidebarMenu>
							</AnimatedSidebarGroupContent>
						</AnimatedSidebarGroup>
					))}
				</AnimatedSidebarContent>

				<AnimatedSidebarFooter>
					<AnimatedSidebarMenu>
						<AnimatedSidebarMenuItem>
							<SidebarThemeItem />
						</AnimatedSidebarMenuItem>
						<AnimatedSidebarMenuItem>
							<AnimatedSidebarMenuButton
								icon={<SignOut className="size-4.5" />}
								onSelect={signOut}
								disabled={signingOut}
							>
								Log out
							</AnimatedSidebarMenuButton>
						</AnimatedSidebarMenuItem>
					</AnimatedSidebarMenu>
				</AnimatedSidebarFooter>
			</AnimatedSidebar>

			<AnimatedSidebarInset>
				<header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur">
					<AnimatedSidebarTrigger className="hover:bg-muted">
						<List className="size-5" />
					</AnimatedSidebarTrigger>
					<span className="truncate text-sm text-muted-foreground">
						{user?.name}
					</span>
				</header>
				<div className="flex-1 p-6">{children}</div>
			</AnimatedSidebarInset>
		</AnimatedSidebarProvider>
	);
}
