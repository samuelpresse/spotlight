"use client";

import { Tabs } from "@chakra-ui/react";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { LuBookOpen, LuHouse } from "react-icons/lu";

const tabs = [
  { value: "magazines", href: "/admin", label: "Magazines", icon: LuBookOpen },
  { value: "accueil", href: "/admin/accueil", label: "Page d'accueil", icon: LuHouse },
];

export function AdminTabs() {
  const pathname = usePathname();
  const value = pathname.startsWith("/admin/accueil") ? "accueil" : "magazines";

  return (
    <Tabs.Root value={value} variant="line" colorPalette="brand" size="lg">
      <Tabs.List>
        {tabs.map(({ value, href, label, icon: Icon }) => (
          <Tabs.Trigger key={value} value={value} asChild>
            <NextLink href={href}>
              <Icon /> {label}
            </NextLink>
          </Tabs.Trigger>
        ))}
      </Tabs.List>
    </Tabs.Root>
  );
}
