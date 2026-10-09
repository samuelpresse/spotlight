import { HStack, IconButton } from "@chakra-ui/react";
import { FaEnvelope, FaInstagram, FaTiktok, FaTwitch, FaXTwitter } from "react-icons/fa6";
import { site } from "@/lib/site";

const { socials } = site;

const links = [
  { label: "X (Twitter)", href: socials.x, icon: FaXTwitter },
  { label: "Twitch", href: socials.twitch, icon: FaTwitch },
  { label: "Instagram", href: socials.instagram, icon: FaInstagram },
  { label: "TikTok", href: socials.tiktok, icon: FaTiktok },
  { label: "Courriel", href: socials.email && `mailto:${socials.email}`, icon: FaEnvelope },
].filter((l) => l.href);

export function SocialLinks({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  return (
    <HStack gap="1">
      {links.map(({ label, href, icon: Icon }) => (
        <IconButton
          key={label}
          asChild
          aria-label={label}
          variant="ghost"
          size={size}
          rounded="full"
          color="fg.muted"
          _hover={{ color: "brand.fg", bg: "brand.subtle" }}
        >
          <a href={href} target={href.startsWith("mailto:") ? undefined : "_blank"} rel="noopener noreferrer">
            <Icon />
          </a>
        </IconButton>
      ))}
    </HStack>
  );
}
