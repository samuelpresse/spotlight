"use client";

import {
  Alert,
  Box,
  chakra,
  Button,
  Field,
  Flex,
  Grid,
  Heading,
  HStack,
  Icon,
  Image,
  Input,
  InputGroup,
  Progress,
  Spinner,
  Stack,
  Switch,
  Text,
  Textarea,
} from "@chakra-ui/react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { LuFileUp, LuImage, LuRotateCcw, LuSave } from "react-icons/lu";
import { toaster } from "@/components/ui/toaster";
import { slugify, today } from "@/lib/format";
import type { Magazine } from "@/lib/types";
import { uploadFile, uploadFiles, type StorageMode } from "@/lib/upload-client";
import { checkSlugAvailable, saveMagazine } from "./actions";

type Props = { magazine?: Magazine; storageMode: StorageMode };

const formatSize = (bytes: number) =>
  bytes < 1024 * 1024 ? `${Math.ceil(bytes / 1024)} Ko` : `${(bytes / 1024 / 1024).toFixed(1)} Mo`;

const card = {
  bg: "surface",
  borderWidth: "1px",
  borderColor: "surfaceBorder",
  rounded: "3xl",
  p: { base: "5", md: "7" },
} as const;

export function MagazineForm(props: Props) {
  const [version, setVersion] = useState(0);
  return (
    <MagazineFormFields
      key={`${version}:${props.magazine?.updatedAt ?? "new"}`}
      {...props}
      onSaved={() => setVersion((v) => v + 1)}
    />
  );
}

function MagazineFormFields({ magazine, storageMode, onSaved }: Props & { onSaved: () => void }) {
  const router = useRouter();
  const editing = !!magazine;

  const [title, setTitle] = useState(magazine?.title ?? "");
  const [slug, setSlug] = useState(magazine?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(editing);
  const [issue, setIssue] = useState(magazine?.issue ?? "");
  const [description, setDescription] = useState(magazine?.description ?? "");
  const [publishedAt, setPublishedAt] = useState(magazine?.publishedAt ?? today());
  const [isPublished, setIsPublished] = useState(magazine?.isPublished ?? true);

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfInfo, setPdfInfo] = useState<{ pageCount: number; cover: File } | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [customCover, setCustomCover] = useState<File | null>(null);

  const [progress, setProgress] = useState<{ label: string; percent: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  const pdfInput = useRef<HTMLInputElement>(null);
  const coverInput = useRef<HTMLInputElement>(null);

  const effectiveSlug = slugTouched ? slug : slugify(title);
  const coverFile = customCover ?? pdfInfo?.cover ?? null;

  const coverPreview = useMemo(() => (coverFile ? URL.createObjectURL(coverFile) : null), [coverFile]);
  useEffect(() => () => void (coverPreview && URL.revokeObjectURL(coverPreview)), [coverPreview]);

  const pageCount = pdfInfo?.pageCount ?? magazine?.pageCount ?? 0;
  const isLegacy = editing && (magazine?.pages.length ?? 0) === 0;
  const [optimize, setOptimize] = useState(true);
  const convertLegacy = isLegacy && optimize && !pdfFile;
  const saving = progress !== null;

  async function choosePdf(file: File | undefined) {
    if (!file) return;
    if (file.type !== "application/pdf") {
      setError("Le fichier doit être un PDF.");
      return;
    }
    setError(null);
    setPdfFile(file);
    setPdfInfo(null);
    setAnalyzing(true);
    try {
      const { inspectPdf } = await import("@/lib/pdf-client");
      setPdfInfo(await inspectPdf(file));
    } catch (err) {
      console.error(err);
      setPdfFile(null);
      setError("Impossible de lire ce PDF. Est-il protégé ou corrompu ?");
    } finally {
      setAnalyzing(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!title.trim()) return setError("Le titre est obligatoire.");
    if (!effectiveSlug) return setError("L'adresse (slug) est invalide.");
    if (!editing && !pdfFile) return setError("Ajoute le fichier PDF du magazine.");
    if (analyzing) return setError("Patiente pendant l'analyse du PDF…");

    try {
      setProgress({ label: "Vérification…", percent: 0 });
      if (!(await checkSlugAvailable(effectiveSlug, magazine?.id))) {
        setProgress(null);
        return setError(`L'adresse « ${effectiveSlug} » est déjà utilisée. Choisis-en une autre.`);
      }

      let pageFiles: File[] = [];
      let pageRatio = magazine?.pageRatio ?? 0;
      const pdfSource = pdfFile ?? (convertLegacy ? magazine?.pdfUrl : null);
      if (pdfSource) {
        const { renderPdfPages } = await import("@/lib/pdf-client");
        const rendered = await renderPdfPages(pdfSource, effectiveSlug, (done, total) =>
          setProgress({ label: `Préparation des pages… ${done}/${total}`, percent: (done / total) * 100 })
        );
        pageFiles = rendered.pages;
        pageRatio = rendered.ratio;
      }

      let pdfUrl = magazine?.pdfUrl ?? "";
      if (pdfFile) {
        pdfUrl = await uploadFile(pdfFile, storageMode, (percent) =>
          setProgress({ label: "Envoi du PDF…", percent })
        );
      }

      let pages = magazine?.pages ?? [];
      if (pageFiles.length > 0) {
        pages = await uploadFiles(pageFiles, storageMode, (done, total) =>
          setProgress({ label: `Envoi des pages… ${done}/${total}`, percent: (done / total) * 100 })
        );
      }

      let coverUrl = magazine?.coverUrl ?? "";
      if (coverFile) {
        coverUrl = await uploadFile(coverFile, storageMode, (percent) =>
          setProgress({ label: "Envoi de la couverture…", percent })
        );
      }

      setProgress({ label: "Enregistrement…", percent: 100 });
      const result = await saveMagazine(magazine?.id ?? null, {
        title,
        slug: effectiveSlug,
        issue,
        description,
        publishedAt,
        isPublished,
        pdfUrl,
        coverUrl,
        pageCount,
        pages,
        pageRatio,
      });

      if (!result.ok) {
        setProgress(null);
        return setError(result.error);
      }
      toaster.create({ type: "success", title: editing ? "Magazine mis à jour." : "Magazine publié !" });
      onSaved();
      router.push("/admin");
      router.refresh();
    } catch (err) {
      console.error(err);
      setProgress(null);
      setError((err as Error).message || "Une erreur est survenue.");
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Grid templateColumns={{ base: "1fr", lg: "1fr 380px" }} gap="6" alignItems="start">
        <Stack gap="6" {...card}>
          <Heading size="lg">Informations</Heading>

          <Field.Root required>
            <Field.Label>
              Titre <Field.RequiredIndicator />
            </Field.Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Spotlight Volume 5" size="lg" />
          </Field.Root>

          <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap="6">
            <Field.Root>
              <Field.Label>Numéro / édition</Field.Label>
              <Input value={issue} onChange={(e) => setIssue(e.target.value)} placeholder="#5, Juin, Spécial…" maxLength={20} />
              <Field.HelperText>Affiché en grand sur la couverture du catalogue.</Field.HelperText>
            </Field.Root>
            <Field.Root required>
              <Field.Label>
                Date de parution <Field.RequiredIndicator />
              </Field.Label>
              <Input type="date" value={publishedAt} onChange={(e) => setPublishedAt(e.target.value)} />
              <Field.HelperText>Le catalogue est trié par cette date.</Field.HelperText>
            </Field.Root>
          </Grid>

          <Field.Root>
            <Field.Label>Adresse de la page</Field.Label>
            <InputGroup startAddon="/magazines/">
              <Input
                value={effectiveSlug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setSlug(e.target.value);
                }}
                onBlur={() => setSlug(slugify(effectiveSlug))}
                placeholder="spotlight-volume-5"
              />
            </InputGroup>
            <Field.HelperText>Générée automatiquement à partir du titre.</Field.HelperText>
          </Field.Root>

          <Field.Root>
            <Field.Label>Description</Field.Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Au sommaire de ce numéro…"
              rows={5}
              autoresize
              maxLength={2000}
            />
          </Field.Root>
        </Stack>

        <Stack gap="6" position={{ lg: "sticky" }} top={{ lg: "24" }}>
          <Stack gap="4" {...card}>
            <Heading size="md">Fichier PDF {!editing && <Text as="span" color="red.500">*</Text>}</Heading>
            <chakra.button
              type="button"
              onClick={() => pdfInput.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                choosePdf(e.dataTransfer.files[0]);
              }}
              borderWidth="2px"
              borderStyle="dashed"
              borderColor={dragging ? "brand.solid" : "border"}
              bg={dragging ? "brand.subtle" : "transparent"}
              rounded="2xl"
              p="6"
              textAlign="center"
              cursor="pointer"
              transition="all 0.2s"
              _hover={{ borderColor: "brand.solid", bg: "brand.subtle" }}
              disabled={saving}
            >
              <Stack align="center" gap="2">
                {analyzing ? <Spinner color="brand.solid" /> : <Icon as={LuFileUp} boxSize="7" color="brand.fg" />}
                <Text fontWeight="medium" fontSize="sm" wordBreak="break-all">
                  {pdfFile ? pdfFile.name : editing ? "Remplacer le PDF (optionnel)" : "Glisse ton PDF ici ou clique pour choisir"}
                </Text>
                <Text fontSize="xs" color="fg.muted">
                  {analyzing
                    ? "Analyse du PDF…"
                    : pdfFile
                      ? `${formatSize(pdfFile.size)} · ${pageCount} pages`
                      : editing
                        ? `PDF actuel : ${pageCount} pages`
                        : "Idéalement 25 à 30 pages"}
                </Text>
              </Stack>
            </chakra.button>
            <input
              ref={pdfInput}
              type="file"
              accept="application/pdf"
              hidden
              onChange={(e) => {
                choosePdf(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
            {isLegacy && !pdfFile && (
              <Switch.Root
                checked={optimize}
                onCheckedChange={(e) => setOptimize(e.checked)}
                colorPalette="brand"
                size="sm"
                disabled={saving}
              >
                <Switch.HiddenInput />
                <Switch.Control />
                <Switch.Label>
                  <Stack gap="0">
                    <Text fontSize="sm" fontWeight="medium">
                      Optimiser la lecture
                    </Text>
                    <Text fontSize="xs" color="fg.muted">
                      Convertit les pages en images à l&apos;enregistrement : le lecteur se charge plus vite.
                    </Text>
                  </Stack>
                </Switch.Label>
              </Switch.Root>
            )}
          </Stack>

          <Stack gap="4" {...card}>
            <Heading size="md">Couverture</Heading>
            <Box rounded="xl" overflow="hidden" bg="brand.subtle" aspectRatio={3 / 4} maxW="56" mx="auto" w="full" shadow="md">
              {coverPreview || magazine?.coverUrl ? (
                <Image src={coverPreview ?? magazine?.coverUrl} alt="Aperçu de la couverture" w="full" h="full" objectFit="cover" />
              ) : (
                <Flex h="full" align="center" justify="center" p="4" textAlign="center">
                  <Text fontSize="sm" color="fg.muted">
                    La 1re page du PDF sera utilisée automatiquement.
                  </Text>
                </Flex>
              )}
            </Box>
            <HStack justify="center" gap="2" flexWrap="wrap">
              <Button size="sm" variant="outline" rounded="full" onClick={() => coverInput.current?.click()} disabled={saving}>
                <LuImage /> Choisir une image
              </Button>
              {customCover && (
                <Button size="sm" variant="ghost" rounded="full" onClick={() => setCustomCover(null)} disabled={saving}>
                  <LuRotateCcw /> {pdfInfo ? "1re page du PDF" : "Annuler"}
                </Button>
              )}
            </HStack>
            <input
              ref={coverInput}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              hidden
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setCustomCover(file);
                e.target.value = "";
              }}
            />
          </Stack>

          <Stack gap="5" {...card}>
            <Switch.Root
              checked={isPublished}
              onCheckedChange={(e) => setIsPublished(e.checked)}
              colorPalette="brand"
              size="lg"
            >
              <Switch.HiddenInput />
              <Switch.Control />
              <Switch.Label>
                <Stack gap="0">
                  <Text fontWeight="medium">{isPublished ? "Publié" : "Brouillon"}</Text>
                  <Text fontSize="xs" color="fg.muted">
                    {isPublished ? "Visible dans le catalogue" : "Visible uniquement par toi"}
                  </Text>
                </Stack>
              </Switch.Label>
            </Switch.Root>

            {error && (
              <Alert.Root status="error" rounded="xl">
                <Alert.Indicator />
                <Alert.Title>{error}</Alert.Title>
              </Alert.Root>
            )}

            {progress && (
              <Stack gap="1.5">
                <Text fontSize="sm" color="fg.muted">
                  {progress.label}
                </Text>
                <Progress.Root value={progress.percent} colorPalette="brand" size="sm" rounded="full">
                  <Progress.Track rounded="full">
                    <Progress.Range />
                  </Progress.Track>
                </Progress.Root>
              </Stack>
            )}

            <HStack gap="3">
              <Button asChild variant="ghost" rounded="full" flex="1" disabled={saving}>
                <NextLink href="/admin">Annuler</NextLink>
              </Button>
              <Button type="submit" colorPalette="brand" rounded="full" flex="2" loading={saving} disabled={analyzing}>
                <LuSave /> {editing ? "Enregistrer" : "Créer le magazine"}
              </Button>
            </HStack>
          </Stack>
        </Stack>
      </Grid>
    </form>
  );
}
