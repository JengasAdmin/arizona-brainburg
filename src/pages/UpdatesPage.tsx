import { formatDate } from "../lib/format";
import { SOURCES } from "../data/rules";

interface UpdateEntry {
  date: string;
  title: string;
  desc: string;
  sections: string[];
}

/**
 * Демонстрационные данные — показывают формат будущей системы изменений.
 * Реальные изменения правил публикуются на форуме проекта.
 */
const demoUpdates: UpdateEntry[] = [
  {
    date: "2026-09-23",
    title: "Запуск портала правил Arizona Brainburg",
    desc: "Создан единый центр правил: поиск, категории, оглавление и быстрые переходы к оригиналам на форуме и в базе знаний.",
    sections: ["Общие правила", "Правила захватов", "Правила модификаций"],
  },
  {
    date: "2025-07-30",
    title: "Обновление правил захватов и сражений банд",
    desc: "В базе знаний опубликована актуальная редакция: система планирования каптов, реванши, логика «обрезов» и заморозки сражений.",
    sections: ["Правила захватов"],
  },
  {
    date: "2025-07-12",
    title: "Обновление правил модификаций",
    desc: "Уточнены рекомендации по безопасной установке модов и последствия превышения лимита PPS.",
    sections: ["Правила модификаций"],
  },
  {
    date: "2025-03-23",
    title: "Обновление общих правил и наказаний",
    desc: "Актуализирована вводная статья о правилах и наказаниях на Arizona Role Play.",
    sections: ["Общие правила"],
  },
];

export default function UpdatesPage() {
  return (
    <main className="page">
      <nav className="breadcrumbs" aria-label="Хлебные крошки">
        <a href="#/">Главная</a>
        <span className="sep">→</span>
        <span className="current">Обновления</span>
      </nav>

      <h1 className="section-title">Обновления правил</h1>
      <p className="section-subtitle">
        История изменений правил проекта.{" "}
        <span className="demo-note">
          🧪 Ниже — демонстрационные данные, показывающие формат будущей системы
          изменений
        </span>
      </p>

      {demoUpdates.map((u) => (
        <article className="update-card" key={u.date + u.title}>
          <span className="update-date">{formatDate(u.date)}</span>
          <h2 className="update-title">{u.title}</h2>
          <p className="update-desc">{u.desc}</p>
          <div className="update-tags">
            {u.sections.map((s) => (
              <span className="update-tag" key={s}>
                {s}
              </span>
            ))}
          </div>
          <a
            className="btn btn-secondary btn-sm"
            href={SOURCES.forumRules}
            target="_blank"
            rel="noopener noreferrer"
          >
            Подробнее на форуме ↗
          </a>
        </article>
      ))}
    </main>
  );
}
