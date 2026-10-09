import { promises as fs } from "fs";
import path from "path";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

const root = process.cwd();
const uploads = path.join(root, ".data", "uploads");
const dbFile = path.join(root, ".data", "db.json");

const palettes = [
  [rgb(0.49, 0.23, 0.93), rgb(0.93, 0.29, 0.6), rgb(0.98, 0.96, 1)],
  [rgb(0.05, 0.58, 0.53), rgb(0.23, 0.51, 0.96), rgb(0.94, 0.99, 0.98)],
  [rgb(0.92, 0.35, 0.05), rgb(0.86, 0.15, 0.47), rgb(1, 0.97, 0.93)],
];

const lorem =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.";

async function makePdf({ title, issue, pages, palette }) {
  const [primary, accent, paper] = palette;
  const pdf = await PDFDocument.create();
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const W = 595;
  const H = 842;

  for (let i = 1; i <= pages; i++) {
    const page = pdf.addPage([W, H]);
    const isCover = i === 1;
    const isBack = i === pages;

    if (isCover || isBack) {
      page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: primary });
      page.drawCircle({ x: W * 0.85, y: H * 0.25, size: 260, color: accent, opacity: 0.8 });
      page.drawCircle({ x: W * 0.1, y: H * 0.9, size: 140, color: rgb(1, 1, 1), opacity: 0.12 });
      if (isCover) {
        page.drawText("SPOTLIGHT", { x: 40, y: H - 120, size: 72, font: bold, color: rgb(1, 1, 1) });
        page.drawText(issue, { x: 40, y: H - 200, size: 64, font: bold, color: rgb(1, 1, 1), opacity: 0.9 });
        page.drawText(title, { x: 40, y: 120, size: 26, font: bold, color: rgb(1, 1, 1) });
        page.drawText("Magazine de démonstration", { x: 40, y: 88, size: 16, font: regular, color: rgb(1, 1, 1) });
      } else {
        page.drawText("Merci de nous avoir lus !", { x: 40, y: H / 2, size: 34, font: bold, color: rgb(1, 1, 1) });
        page.drawText("À très vite pour le prochain numéro.", { x: 40, y: H / 2 - 40, size: 18, font: regular, color: rgb(1, 1, 1) });
      }
      continue;
    }

    page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: paper });
    page.drawRectangle({ x: 0, y: H - 70, width: W, height: 70, color: i % 2 ? primary : accent });
    page.drawText(`${title.toUpperCase()}  ·  ${issue}`, { x: 30, y: H - 42, size: 12, font: bold, color: rgb(1, 1, 1) });
    page.drawText(`Article ${i - 1}`, { x: 40, y: H - 160, size: 44, font: bold, color: primary });
    page.drawRectangle({ x: 40, y: H - 520, width: W - 80, height: 320, color: i % 2 ? accent : primary, opacity: 0.25 });
    page.drawText("[ illustration ]", { x: W / 2 - 60, y: H - 365, size: 16, font: regular, color: primary });

    const words = lorem.split(" ");
    let line = "";
    let y = H - 570;
    for (const word of [...words, ...words]) {
      if (regular.widthOfTextAtSize(line + word, 12) > W - 80) {
        page.drawText(line, { x: 40, y, size: 12, font: regular, color: rgb(0.2, 0.2, 0.25) });
        y -= 18;
        line = "";
      }
      line += word + " ";
    }
    page.drawText(line, { x: 40, y, size: 12, font: regular, color: rgb(0.2, 0.2, 0.25) });
    page.drawText(String(i), { x: i % 2 ? W - 50 : 40, y: 30, size: 12, font: bold, color: primary });
  }
  return pdf.save();
}

const magazines = [
  { title: "Spotlight Volume 3", issue: "#3", pages: 28, date: "2026-09-01", description: "Troisième édition : interviews, coulisses et coups de projecteur sur les créateurs de la rentrée." },
  { title: "Spotlight Spécial Été", issue: "Été", pages: 26, date: "2026-07-15", description: "Un numéro spécial pour bien profiter de l'été : jeux, découvertes et portraits." },
  { title: "Spotlight Volume 2", issue: "#2", pages: 30, date: "2026-05-01", description: "Le deuxième numéro, avec un dossier spécial sur les nouveaux talents." },
];

await fs.mkdir(uploads, { recursive: true });
let existing = { nextId: 1, magazines: [] };
try {
  existing = JSON.parse(await fs.readFile(dbFile, "utf8"));
} catch {}

const now = new Date().toISOString();
for (const [i, m] of magazines.entries()) {
  const slug = m.title.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-");
  if (existing.magazines.some((x) => x.slug === slug)) {
    console.log(`= ${slug} existe déjà`);
    continue;
  }
  const file = `demo-${slug}.pdf`;
  await fs.writeFile(path.join(uploads, file), await makePdf({ ...m, palette: palettes[i % palettes.length] }));
  existing.magazines.push({
    id: existing.nextId++,
    slug,
    title: m.title,
    issue: m.issue,
    description: m.description,
    coverUrl: "",
    pdfUrl: `/api/files/${file}`,
    pageCount: m.pages,
    publishedAt: m.date,
    isPublished: true,
    createdAt: now,
    updatedAt: now,
  });
  console.log(`+ ${slug} (${m.pages} pages)`);
}

await fs.writeFile(dbFile, JSON.stringify(existing, null, 2));
console.log("Terminé. Lance `npm run dev` puis ouvre http://localhost:3000");
