import {
  Badge,
  Box,
  Button,
  Container,
  Flex,
  Heading,
  HStack,
  Image,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
} from "@chakra-ui/react";
import NextImage from "next/image";
import NextLink from "next/link";
import { Suspense } from "react";
import { LuArrowDown, LuBookOpen, LuSparkles } from "react-icons/lu";
import { EmptyCatalog } from "@/components/empty-catalog";
import { LuciolesBanner } from "@/components/lucioles-banner";
import { MagazineCard } from "@/components/magazine-card";
import heroImage from "@/assets/hero.webp";
import { getPublishedMagazines } from "@/lib/queries";
import { getHeroSettings } from "@/lib/settings";
import { site } from "@/lib/site";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Container
        maxW="7xl"
        id="catalogue"
        scrollMarginTop="20"
        pt={{ base: "14", md: "20" }}
      >
        <Stack gap="3" mb="10" maxW="2xl">
          <Heading
            as="h2"
            fontSize={{ base: "3xl", md: "4xl" }}
            fontWeight="bold"
            letterSpacing="tight"
          >
            {site.catalogTitle}
          </Heading>
          <Text fontSize="lg" color="fg.muted">
            {site.catalogDescription}
          </Text>
        </Stack>
        <Suspense fallback={<CatalogSkeleton />}>
          <Catalog />
        </Suspense>
      </Container>
      <LuciolesBanner />
    </>
  );
}

function Hero() {
  return (
    <Box
      position="relative"
      overflow="hidden"
      borderBottomWidth="1px"
      borderColor="surfaceBorder"
    >
      <Box
        position="absolute"
        top="-40"
        right="-20"
        boxSize="xl"
        rounded="full"
        bg="brand.400"
        opacity={{ base: 0.25, _dark: 0.2 }}
        filter="blur(120px)"
        pointerEvents="none"
      />
      <Box
        position="absolute"
        bottom="-40"
        left="-20"
        boxSize="md"
        rounded="full"
        bg="silver.400"
        opacity={{ base: 0.2, _dark: 0.15 }}
        filter="blur(120px)"
        pointerEvents="none"
      />

      <Container maxW="7xl" position="relative" py={{ base: "14", md: "24" }}>
        <Flex
          direction={{ base: "column", lg: "row" }}
          align="center"
          gap={{ base: "12", lg: "16" }}
        >
          <Stack
            gap="6"
            flex="1.2"
            align={{ base: "center", lg: "flex-start" }}
            textAlign={{ base: "center", lg: "left" }}
          >
            <Suspense fallback={<HeroTextSkeleton />}>
              <HeroText />
            </Suspense>
            <Suspense fallback={<Skeleton h="12" w="64" rounded="full" />}>
              <HeroActions />
            </Suspense>
          </Stack>

          <Box flex="1" w="full" maxW={{ base: "xs", md: "md" }}>
            <Suspense fallback={<Skeleton aspectRatio={0.77} rounded="full" />}>
              <HeroIllustration />
            </Suspense>
          </Box>
        </Flex>
      </Container>
    </Box>
  );
}

async function HeroActions() {
  const [latest] = await getPublishedMagazines();
  return (
    <HStack
      gap="3"
      flexWrap="wrap"
      justify={{ base: "center", lg: "flex-start" }}
    >
      {latest && (
        <Button
          asChild
          size="lg"
          rounded="full"
          colorPalette="brand"
          shadow="lg"
        >
          <NextLink href={`/magazines/${latest.slug}`}>
            <LuBookOpen /> Lire la dernière parution
            {latest.issue && ` (${latest.issue})`}
          </NextLink>
        </Button>
      )}
      <Button asChild size="lg" rounded="full" variant="outline">
        <NextLink href="#catalogue">
          Voir le catalogue <LuArrowDown />
        </NextLink>
      </Button>
    </HStack>
  );
}

async function HeroText() {
  const hero = await getHeroSettings();
  return (
    <>
      <Heading
        as="h1"
        fontSize={{ base: "4xl", md: "6xl" }}
        lineHeight="1.05"
        fontWeight="bold"
        letterSpacing="tight"
      >
        {hero.title}
        {hero.subtitle && " "}
        {hero.subtitle && (
          <Box
            as="span"
            bgGradient="to-r"
            gradientFrom="accentFrom"
            gradientTo="accentTo"
            bgClip="text"
          >
            {hero.subtitle}
          </Box>
        )}
      </Heading>
      {hero.description && (
        <Text
          fontSize={{ base: "md", md: "lg" }}
          color="fg.muted"
          maxW="xl"
          whiteSpace="pre-line"
        >
          {hero.description}
        </Text>
      )}
    </>
  );
}

function HeroTextSkeleton() {
  return (
    <Stack gap="4" w="full" maxW="xl" align={{ base: "center", lg: "flex-start" }}>
      <Skeleton h={{ base: "10", md: "14" }} w="90%" />
      <Skeleton h={{ base: "10", md: "14" }} w="70%" />
      <Skeleton h="5" w="full" mt="2" />
      <Skeleton h="5" w="80%" />
    </Stack>
  );
}

async function HeroIllustration() {
  const { imageUrl } = await getHeroSettings();
  return (
    <Box position="relative">
      <Box
        position="absolute"
        left="50%"
        top="45%"
        transform="translate(-50%, -50%)"
        w="95%"
        aspectRatio={1}
        rounded="full"
        bgGradient="to-br"
        gradientFrom="brand.400"
        gradientTo="silver.300"
        opacity={{ base: 0.35, _dark: 0.3 }}
        filter="blur(40px)"
      />
      <Box
        position="absolute"
        left="50%"
        top="45%"
        transform="translate(-50%, -50%)"
        w="80%"
        aspectRatio={1}
        rounded="full"
        borderWidth="2px"
        borderColor={{ base: "brand.200", _dark: "whiteAlpha.200" }}
        borderStyle="dashed"
      />
      <Box
        position="relative"
        filter="drop-shadow(0 24px 32px rgba(30, 10, 60, 0.35))"
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt="Illustration de Spotlight!"
            w="full"
            h="auto"
            display="block"
          />
        ) : (
          <NextImage
            src={heroImage}
            alt="EvilLoony et Skinekko, les auteur.ice.s de Spotlight!"
            placeholder="blur"
            priority
            sizes="(max-width: 768px) 320px, 448px"
            style={{ width: "100%", height: "auto", display: "block" }}
          />
        )}
      </Box>
      <Badge
        asChild
        position="absolute"
        bottom="6%"
        right={{ base: "0", md: "-4" }}
        size="lg"
        rounded="full"
        px="4"
        py="2"
        colorPalette="silver"
        variant="solid"
        shadow="lg"
        transform="rotate(-3deg)"
        transition="transform 0.2s ease"
        _hover={{ transform: "rotate(0deg) scale(1.05)" }}
      >
        <NextLink href="/a-propos">
          <LuSparkles /> Par EvilLoony &amp; Skinekko
        </NextLink>
      </Badge>
    </Box>
  );
}

async function Catalog() {
  const magazines = await getPublishedMagazines();
  if (magazines.length === 0) return <EmptyCatalog />;
  return (
    <SimpleGrid columns={{ base: 1, sm: 2, lg: 3, xl: 4 }} gap="6">
      {magazines.map((magazine) => (
        <MagazineCard key={magazine.id} magazine={magazine} />
      ))}
    </SimpleGrid>
  );
}

function CatalogSkeleton() {
  return (
    <SimpleGrid columns={{ base: 1, sm: 2, lg: 3, xl: 4 }} gap="6">
      {Array.from({ length: 4 }, (_, i) => (
        <Stack key={i} bg="surface" rounded="3xl" p="4" gap="4">
          <Skeleton aspectRatio={3 / 4} rounded="2xl" />
          <Skeleton h="5" w="80%" />
          <Skeleton h="4" w="40%" />
          <Skeleton h="10" rounded="full" />
        </Stack>
      ))}
    </SimpleGrid>
  );
}
