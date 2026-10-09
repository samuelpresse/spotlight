import { Box, Center, Image, Text, type BoxProps } from "@chakra-ui/react";
import type { Magazine } from "@/lib/types";

export function Cover({ magazine, ...props }: { magazine: Pick<Magazine, "coverUrl" | "title"> } & BoxProps) {
  return (
    <Box position="relative" overflow="hidden" aspectRatio={3 / 4} bg="brand.muted" {...props}>
      {magazine.coverUrl ? (
        <Image
          src={magazine.coverUrl}
          alt={`Couverture de ${magazine.title}`}
          w="full"
          h="full"
          objectFit="cover"
          objectPosition="top"
          loading="lazy"
        />
      ) : (
        <Center h="full" bgGradient="to-br" gradientFrom="brand.800" gradientTo="brand.500" p="6">
          <Text fontSize="2xl" fontFamily="heading" fontWeight="bold" color="white" textAlign="center">
            {magazine.title}
          </Text>
        </Center>
      )}
    </Box>
  );
}
