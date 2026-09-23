/**
 * Генератор src/data/rules.ts из спарсенных тем форума (.scraped/*.json).
 * Запуск: node scripts/generate-rules.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const scrapedDir = path.join(root, ".scraped");

/** Метаданные тем: файл → категория. */
const topics = [
  { file: "batch1.json", pick: 0, cat: "t1", icon: "📜", order: 1 },
  { file: "batch1.json", pick: 1, cat: "t2", icon: "🛡️", order: 2 },
  { file: "batch1.json", pick: 2, cat: "t3", icon: "🏷️", order: 3 },
  { file: "batch1.json", pick: 3, cat: "t4", icon: "🎮", order: 4 },
  { file: "batch1.json", pick: 4, cat: "t5", icon: "💬", order: 5 },
  { file: "single-9451532.json", pick: 0, cat: "t6", icon: "🎤", order: 6 },
  { file: "single-9451519.json", pick: 0, cat: "t7", icon: "💰", order: 7 },
  { file: "single-9451796.json", pick: 0, cat: "t8", icon: "🎪", order: 8 },
  { file: "single-9451834.json", pick: 0, cat: "t9", icon: "🏠", order: 9 },
  { file: "single-9451995.json", pick: 0, cat: "t10", icon: "🌐", order: 10 },
  { file: "single-10477341.json", pick: 0, cat: "bb-tazer", icon: "⚡", order: 11 },
  { file: "single-4878085.json", pick: 0, cat: "bb-stalls", icon: "🛒", order: 12 },
  { file: "single-4726291.json", pick: 0, cat: "bb-vice", icon: "🌴", order: 13 },
];

/** Дата публикации тем раздела 3770 (из списка тем: 22 Мар 2025). */
const FORUM_MAIN_DATE = "2025-03-22";

function cleanText(text) {
  return text
    .replace(/\u200B|\uFEFF/g, "") // zero-width
    .replace(/^Посмотреть вложение \d+$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Заголовок темы без ведущего номера («1. Общие…» → «Общие…»). */
function stripNumber(title) {
  return title.replace(/^\d+\.\s*/, "").replace(/^Правила Brainburg \| /, "").trim();
}

const shortName = {
  "bb-tazer": "Правила Тайзера",
  "bb-stalls": "Переносные лавки",
  "bb-vice": "Остров Vice City",
};

/**
 * Разбивка темы на пункты правил.
 * Нумерованные темы: строка «N.M …» начинает правило; подпункты N.M.K,
 * «Примечание/Пример/Исключение/Наказание…» и продолжения — прикрепляются к нему.
 * Маркерные темы: ★-строки и содержательные абзацы.
 */
function splitRules(text, { markerPrefix }) {
  const lines = text.split("\n").map((l) => l.trim());
  const items = [];
  let cur = null;

  const numberedRe = /^(\d+\.\d+)(?!\.\d)\s*/; // 4.1, но не 2.1.1
  const subRe = /^\d+\.\d+\.\d+\s*/;

  for (const raw of lines) {
    const line = raw;
    if (!line) {
      if (cur) cur.body.push("");
      continue;
    }
    // Заголовок темы в начале — пропускаем
    if (!cur && !items.length && !numberedRe.test(line) && !line.startsWith("★")) {
      continue;
    }
    const m = line.match(numberedRe);
    if (m) {
      if (cur) items.push(cur);
      cur = { number: m[1], body: [line.slice(m[0].length)] };
      continue;
    }
    if (cur) {
      cur.body.push(subRe.test(line) ? line : line);
      continue;
    }
    // маркерная тема
    if (line.startsWith("★") || /^(Запрещено|Разрешено|Общие положения)/.test(line)) {
      if (cur) items.push(cur);
      cur = { number: null, body: [line.replace(/^★\s*/, "")] };
      continue;
    }
    if (cur) cur.body.push(line);
  }
  if (cur) items.push(cur);

  // Номера для маркерных тем и заголовки-дубли
  const out = [];
  let auto = 0;
  for (const it of items) {
    const body = it.body.join("\n").replace(/\n{2,}/g, "\n\n").trim();
    if (!body || body.length < 12) continue; // мусор/заголовки-огрызки
    auto += 1;
    out.push({
      number: it.number ?? `${markerPrefix}${auto}`,
      content: body,
    });
  }
  return out;
}

const categories = [];
const rules = [];
const threadSources = [];

/** Пункты с самыми строгими санкциями — в блок «Важная информация». */
const IMPORTANT = new Set(["1.1", "1.2", "2.1", "7.1", "7.2"]);

/** Заголовок правила — первое предложение пункта (до точки/двоеточия, ≤90 симв.). */
function makeTitle(item) {
  const firstLine = item.content.split("\n")[0];
  const cut = firstLine.split(/(?<=[.;:!?])\s/)[0];
  const title = (cut.length > 10 && cut.length <= 100 ? cut : firstLine).trim();
  return title.length > 96 ? title.slice(0, 93) + "…" : title;
}

for (const t of topics) {
  const arr = JSON.parse(fs.readFileSync(path.join(scrapedDir, t.file), "utf8"));
  const d = arr[t.pick];
  const text = cleanText(d.text);
  const name = shortName[t.cat] ?? stripNumber(d.title);

  const markerPrefix = t.cat.startsWith("bb-")
    ? { "bb-tazer": "ТЗ-", "bb-stalls": "ЛВ-", "bb-vice": "VC-" }[t.cat]
    : null;
  const items = splitRules(text, { markerPrefix: markerPrefix ?? `X-${t.order}.` });

  const isBrainburg = t.cat.startsWith("bb-");
  categories.push({
    id: t.cat,
    name: isBrainburg ? `Brainburg: ${name}` : d.title.replace(/\.$/, ""),
    description: isBrainburg
      ? "Локальное правило сервера Brainburg (раздел «Правила» форума сервера)."
      : `Раздел ${t.order} основных правил серверов Arizona RP с форума проекта.`,
    icon: t.icon,
  });
  threadSources.push({ label: d.title, url: d.url });

  for (const item of items) {
    rules.push({
      id: `${t.cat}-${item.number.replace(/\./g, "-").toLowerCase()}`,
      number: item.number,
      category: t.cat,
      title: makeTitle(item),
      content: item.content,
      important: IMPORTANT.has(item.number),
      source: d.url,
      sourceLabel: "Форум Arizona RP",
      updatedAt: isBrainburg ? null : FORUM_MAIN_DATE,
    });
  }
}

const ts = `/* СГЕНЕРИРОВАНО scripts/generate-rules.mjs из тем форума — не редактировать вручную.
 * Источники: forum.arizona-rp.com, разделы 3770 (основные правила) и 1868 (Brainburg).
 * Тексты взяты дословно; номера правил соответствуют нумерации тем.
 * Для Brainburg-тем (без нумерации на форуме) номера присвоены порталом
 * с префиксами ТЗ/ЛВ/VC.
 */

export interface Rule {
  id: string;
  number: string;
  category: string;
  title: string;
  content: string;
  important: boolean;
  source: string;
  sourceLabel: string;
  updatedAt: string | null; // null — дата в источнике не указана
}

export interface RuleCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export const SOURCES = {
  helpCenter: "https://help.arizona-rp.com/hc/arizona-rp/ru/categories/Rules",
  forumRules: "https://forum.arizona-rp.com/rules/",
  forumBrainburg: "https://forum.arizona-rp.com/forums/1868/",
  forumMain: "https://arizona-rp.com",
} as const;

export const categories: RuleCategory[] = ${JSON.stringify(categories, null, 2)};

export const rules: Rule[] = ${JSON.stringify(rules, null, 2)};

/** Дата последней синхронизации данных с источниками. */
export const lastSyncDate = "2026-09-23";

/** Прямые ссылки на исходные темы форума. */
export const forumThreadSources: { label: string; url: string }[] = ${JSON.stringify(threadSources, null, 2)};
`;

fs.writeFileSync(path.join(root, "src/data/rules.ts"), ts, "utf8");
console.log(
  `OK: ${categories.length} категорий, ${rules.length} правил → src/data/rules.ts`,
);
for (const c of categories) {
  console.log(`  ${c.icon} ${c.name}: ${rules.filter((r) => r.category === c.id).length}`);
}
