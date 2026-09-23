import type { Rule } from "../data/rules";
import { formatRuleId } from "../lib/search";
import { formatDate } from "../lib/format";

interface RuleCardProps {
  rule: Rule;
  categoryName: string;
  highlighted?: boolean;
}

export default function RuleCard({ rule, categoryName, highlighted }: RuleCardProps) {
  return (
    <article
      className={`rule-card${highlighted ? " highlighted" : ""}`}
      id={formatRuleId(rule)}
      aria-labelledby={`${formatRuleId(rule)}-title`}
    >
      <div className="rule-card-header">
        <span className="rule-number">{rule.number}</span>
        <h3 className="rule-title" id={`${formatRuleId(rule)}-title`}>
          {rule.title}
        </h3>
        {rule.important && (
          <span className="important-badge" title="Правило отмечено как особенно важное">
            ⚠ Важно
          </span>
        )}
      </div>
      <div className="rule-content">
        {rule.content.split("\n\n").map((para, i) =>
          para.startsWith("•") ? (
            <ul key={i}>
              {para
                .split("\n\n")
                .map((item) => item.replace(/^•\s*/, ""))
                .map((item, j) => (
                  <li key={j}>{item}</li>
                ))}
            </ul>
          ) : (
            <p key={i}>{para}</p>
          ),
        )}
      </div>
      <div className="rule-footer">
        <span className="rule-source">
          {categoryName} · обновлено{" "}
          {rule.updatedAt ? formatDate(rule.updatedAt) : "дата не указана"}
        </span>
        <a
          className="rule-link-btn"
          href={rule.source}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Открыть оригинал правила ${rule.number} в новом окне`}
        >
          Открыть оригинал ↗
        </a>
      </div>
    </article>
  );
}
