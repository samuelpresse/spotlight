import { connection } from "next/server";
import { cache } from "react";
import { db } from "./db";
import { site } from "./site";
import type { HeroSettings } from "./types";

export const HERO_KEY = "hero";

export const heroDefaults: HeroSettings = {
  title: `${site.name},`,
  subtitle: site.tagline.charAt(0).toLowerCase() + site.tagline.slice(1),
  description: site.description,
  imageUrl: "",
};

export const getHeroSettings = cache(async (): Promise<HeroSettings> => {
  await connection();
  const saved = await db().getSetting<Partial<HeroSettings>>(HERO_KEY);
  return {
    title: saved?.title || heroDefaults.title,
    subtitle: saved?.subtitle ?? heroDefaults.subtitle,
    description: saved?.description ?? heroDefaults.description,
    imageUrl: saved?.imageUrl ?? "",
  };
});
