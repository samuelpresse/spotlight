"use client";

import {
  Alert,
  Badge,
  Box,
  Button,
  Field,
  Flex,
  Grid,
  Heading,
  HStack,
  Image,
  Input,
  Progress,
  Stack,
  Text,
  Textarea,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { LuImage, LuRotateCcw, LuSave } from "react-icons/lu";
import defaultHeroImage from "@/assets/hero.webp";
import { toaster } from "@/components/ui/toaster";
import type { HeroSettings } from "@/lib/types";
import { uploadFile, type StorageMode } from "@/lib/upload-client";
import { saveHeroSettings } from "../actions";

type Props = {
  initial: HeroSettings;
  defaults: HeroSettings;
  storageMode: StorageMode;
};

const card = {
  bg: "surface",
  borderWidth: "1px",
  borderColor: "surfaceBorder",
  rounded: "3xl",
  p: { base: "5", md: "7" },
} as const;

export function HeroForm({ initial, defaults, storageMode }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(initial.title);
  const [subtitle, setSubtitle] = useState(initial.subtitle);
  const [description, setDescription] = useState(initial.description);
  const [imageUrl, setImageUrl] = useState(initial.imageUrl);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const imageInput = useRef<HTMLInputElement>(null);

  const filePreview = useMemo(
    () => (imageFile ? URL.createObjectURL(imageFile) : null),
    [imageFile],
  );
  useEffect(
    () => () => void (filePreview && URL.revokeObjectURL(filePreview)),
    [filePreview],
  );
  const previewSrc = filePreview ?? (imageUrl || defaultHeroImage.src);
  const usingDefaultImage = !imageFile && !imageUrl;

  const saving = progress !== null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!title.trim()) return setError("Le titre est obligatoire.");

    try {
      setProgress(0);
      let finalImageUrl = imageUrl;
      if (imageFile) {
        finalImageUrl = await uploadFile(imageFile, storageMode, (p) =>
          setProgress(p),
        );
      }
      setProgress(100);
      const result = await saveHeroSettings({
        title,
        subtitle,
        description,
        imageUrl: finalImageUrl,
      });
      setProgress(null);
      if (!result.ok) return setError(result.error);

      setImageFile(null);
      setImageUrl(finalImageUrl);
      toaster.create({ type: "success", title: "Page d'accueil mise à jour." });
      router.refresh();
    } catch (err) {
      console.error(err);
      setProgress(null);
      setError((err as Error).message || "Une erreur est survenue.");
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Grid
        templateColumns={{ base: "1fr", xl: "1fr 1fr" }}
        gap="6"
        alignItems="start"
      >
        <Stack gap="6" {...card}>
          <Field.Root required>
            <Field.Label>
              Titre <Field.RequiredIndicator />
            </Field.Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={defaults.title}
              maxLength={120}
              size="lg"
            />
          </Field.Root>

          <Field.Root>
            <Field.Label>Sous-titre</Field.Label>
            <Input
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder={defaults.subtitle}
              maxLength={160}
            />
          </Field.Root>

          <Field.Root>
            <Field.Label>Description</Field.Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={defaults.description}
              rows={4}
              autoresize
              maxLength={600}
            />
          </Field.Root>

          <Stack gap="3">
            <Text fontWeight="medium" fontSize="sm">
              Image
            </Text>
            <HStack gap="4" align="center">
              <Box
                boxSize="24"
                rounded="xl"
                bg="brand.subtle"
                borderWidth="1px"
                borderColor="surfaceBorder"
                overflow="hidden"
                flexShrink={0}
              >
                <Image
                  src={previewSrc}
                  alt="Aperçu de l'image"
                  w="full"
                  h="full"
                  objectFit="contain"
                />
              </Box>
              <Stack gap="2">
                <HStack gap="2" flexWrap="wrap">
                  <Button
                    size="sm"
                    variant="outline"
                    rounded="full"
                    onClick={() => imageInput.current?.click()}
                    disabled={saving}
                  >
                    <LuImage /> Changer l&apos;image
                  </Button>
                  {!usingDefaultImage && (
                    <Button
                      size="sm"
                      variant="ghost"
                      rounded="full"
                      disabled={saving}
                      onClick={() => {
                        setImageFile(null);
                        setImageUrl("");
                      }}
                    >
                      <LuRotateCcw /> Image par défaut
                    </Button>
                  )}
                </HStack>
                <Text fontSize="xs" color="fg.muted">
                  {imageFile
                    ? imageFile.name
                    : usingDefaultImage
                      ? "Illustration par défaut"
                      : "Image personnalisée"}
                </Text>
              </Stack>
            </HStack>
            <input
              ref={imageInput}
              type="file"
              accept="image/png,image/webp,image/jpeg"
              hidden
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setImageFile(file);
                e.target.value = "";
              }}
            />
          </Stack>

          {error && (
            <Alert.Root status="error" rounded="xl">
              <Alert.Indicator />
              <Alert.Title>{error}</Alert.Title>
            </Alert.Root>
          )}

          {progress !== null && imageFile && (
            <Progress.Root value={progress} colorPalette="brand" size="sm">
              <Progress.Track rounded="full">
                <Progress.Range />
              </Progress.Track>
            </Progress.Root>
          )}

          <Flex gap="3" justify="space-between" flexWrap="wrap">
            <Button
              variant="ghost"
              rounded="full"
              disabled={saving}
              onClick={() => {
                setTitle(defaults.title);
                setSubtitle(defaults.subtitle);
                setDescription(defaults.description);
              }}
            >
              <LuRotateCcw /> Textes par défaut
            </Button>
            <Button
              type="submit"
              colorPalette="brand"
              rounded="full"
              loading={saving}
            >
              <LuSave /> Enregistrer
            </Button>
          </Flex>
        </Stack>

        <Stack gap="3" position={{ xl: "sticky" }} top={{ xl: "24" }}>
          <Text fontWeight="medium" fontSize="sm" color="fg.muted">
            Aperçu
          </Text>

          <Flex
            bg="canvas"
            borderWidth="1px"
            borderColor="surfaceBorder"
            rounded="3xl"
            p={{ base: "5", md: "8" }}
            gap="6"
            align="center"
            direction={{ base: "column", sm: "row" }}
            overflow="hidden"
            css={{
              backgroundImage:
                "radial-gradient(circle at 85% 30%, color-mix(in srgb, var(--chakra-colors-brand-400) 22%, transparent), transparent 45%)",
            }}
          >
            <Stack gap="3" flex="1.3">
              <Heading
                as="p"
                fontSize={{ base: "2xl", md: "3xl" }}
                lineHeight="1.1"
                fontWeight="bold"
                letterSpacing="tight"
              >
                {title || defaults.title}
                {subtitle && " "}
                {subtitle && (
                  <Box
                    as="span"
                    bgGradient="to-r"
                    gradientFrom="accentFrom"
                    gradientTo="accentTo"
                    bgClip="text"
                  >
                    {subtitle}
                  </Box>
                )}
              </Heading>
              {description && (
                <Text
                  fontSize="sm"
                  color="fg.muted"
                  whiteSpace="pre-line"
                  lineClamp={5}
                >
                  {description}
                </Text>
              )}
            </Stack>
            <Box flex="1" maxW="44">
              <Image
                src={previewSrc}
                alt=""
                w="full"
                h="auto"
                filter="drop-shadow(0 12px 16px rgba(30, 10, 60, 0.3))"
              />
            </Box>
          </Flex>
        </Stack>
      </Grid>
    </form>
  );
}
