import { Role } from "@/lib/roles";
import {
    Briefcase, FileText, Handshake, MagnifyingGlass,
    PlusCircle, SquaresFour, UsersThree, type Icon,
} from "@phosphor-icons/react";

export type NavItem = { label: string; href: string; icon: Icon };
export type NavGroup = { label: string; items: NavItem[] };

export const NAV: Record<Role, NavGroup[]> = {
    CLIENT: [{
        label: "Workspace", items: [
            { label: "Overview", href: "/dashboard/client", icon: SquaresFour },
            { label: "My jobs", href: "/dashboard/client/jobs", icon: Briefcase },
            { label: "Post a job", href: "/dashboard/client/jobs/new", icon: PlusCircle },
            { label: "Contracts", href: "/dashboard/client/contracts", icon: Handshake },
        ]
    }],
    FREELANCER: [{
        label: "Workspace", items: [
            { label: "Overview", href: "/dashboard/freelancer", icon: SquaresFour },
            { label: "Find work", href: "/dashboard/freelancer/jobs", icon: MagnifyingGlass },
            { label: "My proposals", href: "/dashboard/freelancer/proposals", icon: FileText },
            { label: "Contracts", href: "/dashboard/freelancer/contracts", icon: Handshake },
        ]
    }],
    ADMIN: [{
        label: "Admin", items: [
            { label: "Overview", href: "/dashboard/admin", icon: SquaresFour },
            { label: "Users", href: "/dashboard/admin/users", icon: UsersThree },
        ]
    }],
};

export function getActiveHref(pathName: string, groups: NavGroup[]) {
    return groups
        .flatMap((g) => g.items.map((i) => i.href))
        .filter((h) => pathName === h || pathName.startsWith(`${h}/`))
        .sort((a, b) => b.length - a.length)[0];
}