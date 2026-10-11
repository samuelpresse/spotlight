import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import { promises as fs } from "fs";
import path from "path";
import type { Magazine, MagazineInput } from "./types";

type Repo = {
  list(opts?: { includeDrafts?: boolean }): Promise<Magazine[]>;
  getById(id: number): Promise<Magazine | null>;
  getBySlug(slug: string): Promise<Magazine | null>;
  slugTaken(slug: string, exceptId?: number): Promise<boolean>;
  create(input: MagazineInput): Promise<Magazine>;
  update(id: number, input: MagazineInput): Promise<Magazine | null>;
  remove(id: number): Promise<Magazine | null>;
  getSetting<T>(key: string): Promise<T | null>;
  setSetting<T>(key: string, value: T): Promise<void>;
};

const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;

export const dbMode: "postgres" | "local" = databaseUrl ? "postgres" : "local";


type Row = {
  id: number;
  slug: string;
  title: string;
  issue: string;
  description: string;
  cover_url: string;
  pdf_url: string;
  page_count: number;
  pages: string[] | null;
  page_ratio: number | null;
  published_at: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

const toMagazine = (r: Row): Magazine => ({
  id: r.id,
  slug: r.slug,
  title: r.title,
  issue: r.issue,
  description: r.description,
  coverUrl: r.cover_url,
  pdfUrl: r.pdf_url,
  pageCount: r.page_count,
  pages: Array.isArray(r.pages) ? r.pages : [],
  pageRatio: Number(r.page_ratio) || 0,
  publishedAt: r.published_at,
  isPublished: r.is_published,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

function postgresRepo(url: string): Repo {
  const sql: NeonQueryFunction<false, false> = neon(url);

  let ready: Promise<unknown> | null = null;
  const init = () =>
    (ready ??= sql`
      CREATE TABLE IF NOT EXISTS magazines (
        id           SERIAL PRIMARY KEY,
        slug         TEXT UNIQUE NOT NULL,
        title        TEXT NOT NULL,
        issue        TEXT NOT NULL DEFAULT '',
        description  TEXT NOT NULL DEFAULT '',
        cover_url    TEXT NOT NULL DEFAULT '',
        pdf_url      TEXT NOT NULL,
        page_count   INTEGER NOT NULL DEFAULT 0,
        published_at DATE NOT NULL DEFAULT CURRENT_DATE,
        is_published BOOLEAN NOT NULL DEFAULT TRUE,
        created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
      )`
      .then(
        () => sql`
          CREATE TABLE IF NOT EXISTS settings (
            key        TEXT PRIMARY KEY,
            value      JSONB NOT NULL,
            updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
          )`
      )
      .then(() => sql`ALTER TABLE magazines ADD COLUMN IF NOT EXISTS pages JSONB NOT NULL DEFAULT '[]'`)
      .then(() => sql`ALTER TABLE magazines ADD COLUMN IF NOT EXISTS page_ratio REAL NOT NULL DEFAULT 0`)
      .catch((err) => {
        ready = null;
        throw err;
      }));

  const columns = sql.unsafe(`id, slug, title, issue, description, cover_url, pdf_url, page_count, pages, page_ratio,
    to_char(published_at, 'YYYY-MM-DD') AS published_at, is_published,
    created_at::text AS created_at, updated_at::text AS updated_at`);

  const one = async (rows: Promise<Record<string, unknown>[]>) => {
    const [row] = await rows;
    return row ? toMagazine(row as Row) : null;
  };

  return {
    async list({ includeDrafts = false } = {}) {
      await init();
      const rows = includeDrafts
        ? await sql`SELECT ${columns} FROM magazines ORDER BY published_at DESC, id DESC`
        : await sql`SELECT ${columns} FROM magazines WHERE is_published ORDER BY published_at DESC, id DESC`;
      return (rows as Row[]).map(toMagazine);
    },
    async getById(id) {
      await init();
      return one(sql`SELECT ${columns} FROM magazines WHERE id = ${id}`);
    },
    async getBySlug(slug) {
      await init();
      return one(sql`SELECT ${columns} FROM magazines WHERE slug = ${slug}`);
    },
    async slugTaken(slug, exceptId = 0) {
      await init();
      const rows = await sql`SELECT 1 FROM magazines WHERE slug = ${slug} AND id <> ${exceptId}`;
      return rows.length > 0;
    },
    async create(m) {
      await init();
      const created = await one(sql`
        INSERT INTO magazines (slug, title, issue, description, cover_url, pdf_url, page_count, pages, page_ratio, published_at, is_published)
        VALUES (${m.slug}, ${m.title}, ${m.issue}, ${m.description}, ${m.coverUrl}, ${m.pdfUrl}, ${m.pageCount},
          ${JSON.stringify(m.pages)}::jsonb, ${m.pageRatio}, ${m.publishedAt}, ${m.isPublished})
        RETURNING ${columns}`);
      return created!;
    },
    async update(id, m) {
      await init();
      return one(sql`
        UPDATE magazines SET
          slug = ${m.slug}, title = ${m.title}, issue = ${m.issue}, description = ${m.description},
          cover_url = ${m.coverUrl}, pdf_url = ${m.pdfUrl}, page_count = ${m.pageCount},
          pages = ${JSON.stringify(m.pages)}::jsonb, page_ratio = ${m.pageRatio},
          published_at = ${m.publishedAt}, is_published = ${m.isPublished}, updated_at = now()
        WHERE id = ${id}
        RETURNING ${columns}`);
    },
    async remove(id) {
      await init();
      return one(sql`DELETE FROM magazines WHERE id = ${id} RETURNING ${columns}`);
    },
    async getSetting<T>(key: string) {
      await init();
      const [row] = await sql`SELECT value FROM settings WHERE key = ${key}`;
      return row ? (row.value as T) : null;
    },
    async setSetting<T>(key: string, value: T) {
      await init();
      const json = JSON.stringify(value);
      await sql`
        INSERT INTO settings (key, value) VALUES (${key}, ${json}::jsonb)
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`;
    },
  };
}


type LocalData = { nextId: number; magazines: Magazine[]; settings?: Record<string, unknown> };

function localRepo(): Repo {
  const file = path.join(process.cwd(), ".data", "db.json");

  const read = async (): Promise<LocalData> => {
    try {
      const data: LocalData = JSON.parse(await fs.readFile(file, "utf8"));
      data.magazines = data.magazines.map((m) => ({ ...m, pages: m.pages ?? [], pageRatio: m.pageRatio ?? 0 }));
      return data;
    } catch {
      return { nextId: 1, magazines: [] };
    }
  };
  const write = async (data: LocalData) => {
    await fs.mkdir(path.dirname(file), { recursive: true });
    await fs.writeFile(file, JSON.stringify(data, null, 2));
  };
  const sorted = (list: Magazine[]) =>
    [...list].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt) || b.id - a.id);

  return {
    async list({ includeDrafts = false } = {}) {
      const { magazines } = await read();
      return sorted(includeDrafts ? magazines : magazines.filter((m) => m.isPublished));
    },
    async getById(id) {
      return (await read()).magazines.find((m) => m.id === id) ?? null;
    },
    async getBySlug(slug) {
      return (await read()).magazines.find((m) => m.slug === slug) ?? null;
    },
    async slugTaken(slug, exceptId = 0) {
      return (await read()).magazines.some((m) => m.slug === slug && m.id !== exceptId);
    },
    async create(input) {
      const data = await read();
      const now = new Date().toISOString();
      const magazine: Magazine = { ...input, id: data.nextId++, createdAt: now, updatedAt: now };
      data.magazines.push(magazine);
      await write(data);
      return magazine;
    },
    async update(id, input) {
      const data = await read();
      const index = data.magazines.findIndex((m) => m.id === id);
      if (index === -1) return null;
      const magazine = { ...data.magazines[index], ...input, updatedAt: new Date().toISOString() };
      data.magazines[index] = magazine;
      await write(data);
      return magazine;
    },
    async remove(id) {
      const data = await read();
      const magazine = data.magazines.find((m) => m.id === id) ?? null;
      data.magazines = data.magazines.filter((m) => m.id !== id);
      await write(data);
      return magazine;
    },
    async getSetting<T>(key: string) {
      return ((await read()).settings?.[key] as T | undefined) ?? null;
    },
    async setSetting<T>(key: string, value: T) {
      const data = await read();
      data.settings = { ...data.settings, [key]: value };
      await write(data);
    },
  };
}

function createRepo(): Repo {
  if (databaseUrl) return postgresRepo(databaseUrl);
  if (process.env.VERCEL) {
    throw new Error(
      "Aucune base de données configurée : ajoute Neon depuis l'onglet Storage de ton projet Vercel (variable DATABASE_URL)."
    );
  }
  return localRepo();
}

let repo: Repo | null = null;
export const db = (): Repo => (repo ??= createRepo());
