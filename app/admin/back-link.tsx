import { Link } from "@chakra-ui/react";
import NextLink from "next/link";
import { LuArrowLeft } from "react-icons/lu";

export function BackLink() {
  return (
    <Link asChild fontSize="sm" color="brand.fg" fontWeight="medium" w="fit-content">
      <NextLink href="/admin">
        <LuArrowLeft /> Retour aux magazines
      </NextLink>
    </Link>
  );
}
