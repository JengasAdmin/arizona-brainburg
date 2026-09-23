import { categories, rules, type Rule } from "../data/rules";

export interface SearchResult {
  rule: Rule;
  snippet: string;
}

export interface SearchHit {
  rule: Rule;
  snippet: string;
  field: "title" | "content" | "number" | "category";
}

function norm(s: string): string {
  return s.toLowerCase().replace(/ё/g, "е");
}

function makeSnippet(rule: Rule, query: string): string {
  const q = norm(query);
  const paragraphs = rule.content.split("\n\n");
  const hit = paragraphs.find((p) => norm(p).includes(q));
  const text = hit ?? paragraphs[0] ?? "";
  return text.length > 160 ? text.slice(0, 157) + "…" : text;
}

/** Поиск по заголовкам, тексту, номеру и категории правила. */
export function searchRules(query: string): SearchHit[] {
  const q = norm(query.trim());
  if (q.length < 2) return [];

  const hits: SearchHit[] = [];
  for (const rule of rules) {
    const category = categories.find((c) => c.id === rule.category);
    let field: SearchHit["field"] | null = null;

    if (norm(rule.title).includes(q)) field = "title";
    else if (rule.number.includes(q) && /\d/.test(q)) field = "number";
    else if (category && norm(category.name).includes(q)) field = "category";
    else if (norm(rule.content).includes(q)) field = "content";

    if (field) {
      hits.push({ rule, snippet: makeSnippet(rule, query), field });
    }
  }
  return hits;
}

export function formatRuleId(rule: Rule): string {
  return `rule-${rule.number.replace(/\./g, "-")}`;
}
