import { connection } from "next/server";
import { cache } from "react";
import { db } from "./db";

export const getPublishedMagazines = cache(async () => {
  await connection();
  return db().list();
});

export const getMagazineBySlug = cache(async (slug: string) => {
  await connection();
  return db().getBySlug(slug);
});
