import {
  Avatar,
  Badge,
  Box,
  Button,
  Container,
  Flex,
  Heading,
  HStack,
  Stack,
  Text,
} from "@chakra-ui/react";
import NextImage from "next/image";
import NextLink from "next/link";
import { LuArrowLeft, LuBookOpen, LuSparkles } from "react-icons/lu";
import auteurs from "@/assets/auteurs.jpg";

export const metadata = {
  title: "À propos des auteur.ice.s",
  description:
    "EvilLoony et Skinekko, Jumeaux Cosmiques du Vtubing québécois, à l'origine de Spotlight!.",
};

export default function AboutPage() {
  return (
    <Box
      position="relative"
      css={{
        backgroundImage:
          "radial-gradient(circle at 12% 18%, color-mix(in srgb, var(--chakra-colors-brand-400) 22%, transparent), transparent 38%), radial-gradient(circle at 85% 45%, color-mix(in srgb, var(--chakra-colors-silver-400) 16%, transparent), transparent 28%)",
      }}
    >
      <Container maxW="6xl" position="relative" py={{ base: "12", md: "20" }}>
        <Flex
          direction={{ base: "column", lg: "row" }}
          gap={{ base: "12", lg: "20" }}
          align="center"
        >
          <Box
            flex="1"
            w="full"
            maxW={{ base: "sm", lg: "md" }}
            position="relative"
          >
            <Box
              position="absolute"
              inset="8"
              bg="brand.500"
              filter="blur(56px)"
              opacity={0.45}
              rounded="3xl"
            />
            <Box
              position="relative"
              rounded="3xl"
              overflow="hidden"
              shadow="2xl"
              transform="rotate(-2deg)"
              transition="transform 0.4s ease"
              _hover={{ transform: "rotate(0deg) scale(1.01)" }}
              borderWidth="4px"
              borderColor="surface"
            >
              <NextImage
                src={auteurs}
                alt="EvilLoony et Skinekko sur la couverture de Spotlight! Magazine"
                placeholder="blur"
                priority
                sizes="(max-width: 1024px) 384px, 448px"
                style={{ width: "100%", height: "auto", display: "block" }}
              />
            </Box>
            <Badge
              position="absolute"
              bottom="-4"
              right={{ base: "2", md: "-6" }}
              size="lg"
              rounded="full"
              px="4"
              py="2"
              colorPalette="silver"
              variant="solid"
              shadow="lg"
              transform="rotate(3deg)"
            >
              <LuSparkles /> Jumeaux Cosmiques
            </Badge>
          </Box>

          <Stack flex="1.1" gap="6" maxW="xl">
            <Heading
              as="h1"
              fontSize={{ base: "4xl", md: "5xl" }}
              fontWeight="bold"
              letterSpacing="tight"
              lineHeight="1.1"
            >
              À propos des{" "}
              <Box
                as="span"
                bgGradient="to-r"
                gradientFrom="accentFrom"
                gradientTo="accentTo"
                bgClip="text"
              >
                auteur.ice.s
              </Box>
            </Heading>

            <Stack
              gap="5"
              fontSize={{ base: "md", md: "lg" }}
              color="fg.muted"
              lineHeight="tall"
            >
              <Text>
                Jumeaux Cosmiques du Vtubing québécois,{" "}
                <Text as="strong" color="fg">
                  EvilLoony
                </Text>{" "}
                et{" "}
                <Text as="strong" color="fg">
                  Skinekko
                </Text>{" "}
                se sont rencontrés en 2024 et se sont découverts dès lors
                plusieurs atomes crochus.
              </Text>
              <Text>
                Après un enchaînement de collaborations, de discussions intenses
                et de partages d&apos;univers, les deux créateur.ice.s ont joint
                leurs esprits et leur passion pour la célébrité afin de donner
                vie à{" "}
                <Text as="strong" color="brand.fg">
                  Spotlight!
                </Text>
                . Ce magazine, destiné au milieu virtuel francophone, a pour
                mission de mettre en lumière toutes les facettes de cette
                communauté.
              </Text>
            </Stack>

            <HStack gap="3" pt="2" flexWrap="wrap">
              <Button asChild colorPalette="brand" rounded="full" size="lg">
                <NextLink href="/#catalogue">
                  <LuBookOpen /> Lire les magazines
                </NextLink>
              </Button>
              <Button asChild variant="outline" rounded="full" size="lg">
                <NextLink href="/">
                  <LuArrowLeft /> Retour
                </NextLink>
              </Button>
            </HStack>
          </Stack>
        </Flex>
      </Container>
    </Box>
  );
}
