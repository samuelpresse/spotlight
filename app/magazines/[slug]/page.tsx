import {
  Badge,
  Box,
  Breadcrumb,
  Button,
  Container,
  Flex,
  Heading,
  HStack,
  Skeleton,
  Stack,
  Text,
} from "@chakra-ui/react";
import type { Metadata } from "next";
import NextLink from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import {
  LuArrowDown,
  LuCalendar,
  LuDownload,
  LuFileText,
  LuPencil,
} from "react-icons/lu";
import { Cover } from "@/components/cover";
import { MagazineViewer } from "@/components/viewer";
import { isAdmin } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { getMagazineBySlug } from "@/lib/queries";

export async function generateMetadata({
  params,
}: PageProps<"/magazines/[slug]">): Promise<Metadata> {
  const magazine = await getMagazineBySlug((await params).slug);
  if (!magazine) return {};
  return {
    title: magazine.title,
    description: magazine.description,
    openGraph: magazine.coverUrl ? { images: [magazine.coverUrl] } : undefined,
  };
}

export default function MagazinePage({
  params,
}: PageProps<"/magazines/[slug]">) {
  return (
    <Suspense fallback={<MagazineSkeleton />}>
      <MagazineContent slugPromise={params.then((p) => p.slug)} />
    </Suspense>
  );
}

async function MagazineContent({
  slugPromise,
}: {
  slugPromise: Promise<string>;
}) {
  const magazine = await getMagazineBySlug(await slugPromise);
  const admin = await isAdmin();
  if (!magazine || (!magazine.isPublished && !admin)) notFound();

  return (
    <Container maxW="7xl" py={{ base: "8", md: "12" }}>
      <Breadcrumb.Root mb="8" size="sm">
        <Breadcrumb.List>
          <Breadcrumb.Item>
            <Breadcrumb.Link asChild color="brand.fg">
              <NextLink href="/">Accueil</NextLink>
            </Breadcrumb.Link>
          </Breadcrumb.Item>
          <Breadcrumb.Separator />
          <Breadcrumb.Item>
            <Breadcrumb.Link asChild color="brand.fg">
              <NextLink href="/#catalogue">Magazines</NextLink>
            </Breadcrumb.Link>
          </Breadcrumb.Item>
          <Breadcrumb.Separator />
          <Breadcrumb.Item>
            <Breadcrumb.CurrentLink>
              {magazine.issue || magazine.title}
            </Breadcrumb.CurrentLink>
          </Breadcrumb.Item>
        </Breadcrumb.List>
      </Breadcrumb.Root>

      <Flex
        direction={{ base: "column", md: "row" }}
        gap={{ base: "8", md: "12" }}
        align={{ md: "center" }}
        mb={{ base: "10", md: "16" }}
      >
        <Box
          w={{ base: "56", md: "64" }}
          flexShrink={0}
          mx={{ base: "auto", md: "0" }}
        >
          <Cover magazine={magazine} rounded="2xl" shadow="2xl" />
        </Box>

        <Stack gap="4" maxW="2xl">
          <HStack gap="2">
            {magazine.issue && (
              <Badge
                colorPalette="brand"
                variant="subtle"
                rounded="full"
                px="3"
                size="lg"
                textTransform="uppercase"
              >
                Numéro {magazine.issue}
              </Badge>
            )}
            {!magazine.isPublished && (
              <Badge
                colorPalette="orange"
                variant="solid"
                rounded="full"
                px="3"
                size="lg"
              >
                Brouillon — visible par l&apos;admin uniquement
              </Badge>
            )}
          </HStack>
          <Heading
            as="h1"
            fontSize={{ base: "3xl", md: "5xl" }}
            fontWeight="bold"
            letterSpacing="tight"
            lineHeight="1.1"
          >
            {magazine.title}
          </Heading>
          <HStack gap="5" fontSize="sm" color="fg.muted" flexWrap="wrap">
            <HStack gap="1.5">
              <LuCalendar /> Publication : {formatDate(magazine.publishedAt)}
            </HStack>
            {magazine.pageCount > 0 && (
              <HStack gap="1.5">
                <LuFileText /> {magazine.pageCount} pages
              </HStack>
            )}
          </HStack>
          {magazine.description && (
            <Text
              fontSize={{ base: "md", md: "lg" }}
              color="fg.muted"
              whiteSpace="pre-line"
            >
              {magazine.description}
            </Text>
          )}
          <HStack gap="3" pt="2" flexWrap="wrap">
            <Button asChild colorPalette="brand" rounded="full" size="lg">
              <a href="#lecture">
                Lire maintenant <LuArrowDown />
              </a>
            </Button>
            {admin && (
              <Button asChild variant="outline" rounded="full" size="lg">
                <NextLink href={`/admin/${magazine.id}`}>
                  <LuPencil /> Modifier
                </NextLink>
              </Button>
            )}
          </HStack>
        </Stack>
      </Flex>

      <Box id="lecture" scrollMarginTop="20">
        <MagazineViewer pdfUrl={magazine.pdfUrl} title={magazine.title} />
      </Box>

      <Flex justify="center" mt="6">
        <Button asChild variant="ghost" colorPalette="brand" rounded="full">
          <a href={magazine.pdfUrl} target="_blank" rel="noopener" download>
            <LuDownload /> Télécharger la version PDF
          </a>
        </Button>
      </Flex>
    </Container>
  );
}

function MagazineSkeleton() {
  return (
    <Container maxW="7xl" py={{ base: "8", md: "12" }}>
      <Skeleton h="4" w="48" mb="8" />
      <Flex direction={{ base: "column", md: "row" }} gap="12" mb="16">
        <Skeleton
          w={{ base: "56", md: "64" }}
          aspectRatio={3 / 4}
          rounded="2xl"
          mx={{ base: "auto", md: "0" }}
        />
        <Stack gap="4" flex="1" maxW="2xl" justify="center">
          <Skeleton h="6" w="32" rounded="full" />
          <Skeleton h="12" w="80%" />
          <Skeleton h="4" w="60%" />
          <Skeleton h="16" />
        </Stack>
      </Flex>
      <Skeleton h="70vh" rounded="3xl" />
    </Container>
  );
}
