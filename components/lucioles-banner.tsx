import {
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
import { LuMessageSquare, LuSparkles } from "react-icons/lu";
import { site } from "@/lib/site";
import { Fireflies } from "./fireflies";

export function LuciolesBanner() {
  return (
    <Container
      id="lucioles"
      scrollMarginTop="24"
      maxW="7xl"
      mt={{ base: "16", md: "24" }}
    >
      <Box
        position="relative"
        overflow="hidden"
        rounded="3xl"
        color="silver.50"
        px={{ base: "7", md: "14" }}
        py={{ base: "10", md: "14" }}
        shadow="xl"
        css={{
          backgroundImage:
            "radial-gradient(circle at 85% 20%, color-mix(in srgb, var(--chakra-colors-brand-400) 35%, transparent), transparent 40%), linear-gradient(135deg, var(--chakra-colors-night-900), var(--chakra-colors-night-800) 55%, var(--chakra-colors-brand-900))",
        }}
      >
        <Fireflies onDark />
        <Flex
          position="relative"
          zIndex={2}
          direction={{ base: "column", md: "row" }}
          align={{ md: "center" }}
          justify="space-between"
          gap="8"
        >
          <Stack gap="4" maxW="2xl">
            <Heading
              as="h2"
              fontSize={{ base: "3xl", md: "4xl" }}
              fontWeight="bold"
              letterSpacing="tight"
              lineHeight="1.1"
              color="white"
            >
              Deviens une Luciole
            </Heading>
            <Text fontSize={{ base: "md", md: "lg" }} color="silver.200">
              Devenez l&apos;une de nos Lucioles en nous délivrant les nouvelles
              les plus récentes ou en primeur sur vos Vtubers francophones
              préférés.
            </Text>
            <Text fontSize={{ base: "md", md: "lg" }} color="silver.200">
              Peut-être que votre annonce sera mise en lumière dans la chronique{" "}
              <Text as="em" color="white" fontWeight="medium">
                &laquo;&nbsp;Les Présages des Lueurs&nbsp;&raquo;
              </Text>
              &nbsp;!
            </Text>
          </Stack>
          <HStack gap="3" flexWrap="wrap" flexShrink={0}>
            <Button
              asChild
              size="lg"
              rounded="full"
              bg="silver.100"
              color="night.900"
              _hover={{ bg: "white" }}
              shadow="lg"
            >
              <a
                href={site.newsFormUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <LuMessageSquare /> Rejoins les Lucioles
              </a>
            </Button>
          </HStack>
        </Flex>
      </Box>
    </Container>
  );
}
