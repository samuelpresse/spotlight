import { cacheLife, cacheTag } from "next/cache";
import { db } from "./db";

export const MAGAZINES_TAG = "magazines";

export async function getPublishedMagazines() {
  "use cache";
  cacheLife("days");
  cacheTag(MAGAZINES_TAG);
  return db().list();
}

export async function getMagazineBySlug(slug: string) {
  "use cache";
  cacheLife("days");
  cacheTag(MAGAZINES_TAG);
  return db().getBySlug(slug);
}
