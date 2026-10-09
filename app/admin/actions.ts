"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin, signIn, signOut, adminPasswordConfigured } from "@/lib/auth";
import { db } from "@/lib/db";
import { slugify } from "@/lib/format";
import { deleteFiles, LOCAL_FILE_PREFIX } from "@/lib/storage";
import { getHeroSettings, HERO_KEY } from "@/lib/settings";
import type { HeroSettings, MagazineInput } from "@/lib/types";

export type ActionResult = { ok: true; slug: string } | { ok: false; error: string };


export type LoginState = { ok: boolean; error: string | null };

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  if (!adminPasswordConfigured()) {
    return { ok: false, error: "ADMIN_PASSWORD n'est pas configuré sur le serveur." };
  }
  const ok = await signIn(String(formData.get("password") ?? ""));
  if (!ok) return { ok: false, error: "Mot de passe incorrect." };
  return { ok: true, error: null };
}

export async function logoutAction() {
  await signOut();
}


const isFileUrl = (url: string) => url.startsWith(LOCAL_FILE_PREFIX) || url.startsWith("https://");
const isDate = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value));

function validate(raw: MagazineInput): { data: MagazineInput } | { error: string } {
  const data: MagazineInput = {
    title: String(raw.title ?? "").trim().slice(0, 200),
    slug: slugify(String(raw.slug || raw.title || "")),
    issue: String(raw.issue ?? "").trim().slice(0, 20),
    description: String(raw.description ?? "").trim().slice(0, 2000),
    coverUrl: String(raw.coverUrl ?? ""),
    pdfUrl: String(raw.pdfUrl ?? ""),
    pageCount: Math.max(0, Math.floor(Number(raw.pageCount) || 0)),
    publishedAt: String(raw.publishedAt ?? ""),
    isPublished: Boolean(raw.isPublished),
  };
  if (!data.title) return { error: "Le titre est obligatoire." };
  if (!data.slug) return { error: "L'adresse (slug) est invalide." };
  if (!data.pdfUrl || !isFileUrl(data.pdfUrl)) return { error: "Le fichier PDF est obligatoire." };
  if (data.coverUrl && !isFileUrl(data.coverUrl)) return { error: "L'URL de couverture est invalide." };
  if (!isDate(data.publishedAt)) return { error: "La date de parution est invalide." };
  return { data };
}

export async function checkSlugAvailable(slug: string, exceptId?: number) {
  await requireAdmin();
  return !(await db().slugTaken(slugify(slug), exceptId));
}

export async function saveMagazine(id: number | null, input: MagazineInput): Promise<ActionResult> {
  await requireAdmin();

  const result = validate(input);
  if ("error" in result) return { ok: false, error: result.error };
  const { data } = result;

  try {
    if (await db().slugTaken(data.slug, id ?? undefined)) {
      return { ok: false, error: `L'adresse « ${data.slug} » est déjà utilisée par un autre magazine.` };
    }

    if (id === null) {
      await db().create(data);
    } else {
      const previous = await db().getById(id);
      if (!previous) return { ok: false, error: "Ce magazine n'existe plus." };
      await db().update(id, data);
      await deleteFiles([
        previous.pdfUrl !== data.pdfUrl ? previous.pdfUrl : null,
        previous.coverUrl !== data.coverUrl ? previous.coverUrl : null,
      ]);
    }
  } catch (err) {
    console.error(err);
    return { ok: false, error: "Erreur lors de l'enregistrement dans la base de données." };
  }

  revalidatePath("/", "layout");
  return { ok: true, slug: data.slug };
}

export async function deleteMagazine(id: number): Promise<ActionResult> {
  await requireAdmin();
  try {
    const removed = await db().remove(id);
    if (!removed) return { ok: false, error: "Ce magazine n'existe plus." };
    await deleteFiles([removed.pdfUrl, removed.coverUrl]);
    revalidatePath("/", "layout");
    return { ok: true, slug: removed.slug };
  } catch (err) {
    console.error(err);
    return { ok: false, error: "Erreur lors de la suppression." };
  }
}


export async function saveHeroSettings(input: HeroSettings): Promise<{ ok: true } | { ok: false; error: string }> {
  await requireAdmin();

  const data: HeroSettings = {
    title: String(input.title ?? "").trim().slice(0, 120),
    subtitle: String(input.subtitle ?? "").trim().slice(0, 160),
    description: String(input.description ?? "").trim().slice(0, 600),
    imageUrl: String(input.imageUrl ?? ""),
  };
  if (!data.title) return { ok: false, error: "Le titre est obligatoire." };
  if (data.imageUrl && !isFileUrl(data.imageUrl)) return { ok: false, error: "L'URL de l'image est invalide." };

  try {
    const previous = await getHeroSettings();
    await db().setSetting(HERO_KEY, data);
    if (previous.imageUrl && previous.imageUrl !== data.imageUrl) await deleteFiles([previous.imageUrl]);
  } catch (err) {
    console.error(err);
    return { ok: false, error: "Erreur lors de l'enregistrement dans la base de données." };
  }

  revalidatePath("/", "layout");
  return { ok: true };
}
