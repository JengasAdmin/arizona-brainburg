import { Link } from "react-router-dom";
import SearchBox from "../components/SearchBox";
import {
  categories,
  rules,
  lastSyncDate,
  SOURCES,
} from "../data/rules";
import { formatDate } from "../lib/format";

const demoUpdates = [
  {
    date: "2026-09-23",
    title: "Портал запущен",
    desc: "Создан центр правил Arizona Brainburg: поиск, категории и навигация по правилам.",
  },
];

function pluralRules(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return `${n} правило`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${n} правила`;
  return `${n} правил`;
}

export default function HomePage() {
  const importantRules = rules.filter((r) => r.important).slice(0, 4);

  return (
    <main>
      <section className="hero">
        <span className="hero-badge">
          🛡️ Информационный портал проекта <b>Arizona Brainburg</b>
        </span>
        <h1>
          Правила <span>Arizona Brainburg</span>
        </h1>
        <p>Вся необходимая информация проекта — в одном месте.</p>
        <SearchBox autoFocusOnHome />
        <div className="hero-actions" style={{ marginTop: 24 }}>
          <Link to="/rules" className="btn btn-primary">
            Перейти к правилам
          </Link>
          <a
            href={SOURCES.forumRules}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary"
          >
            Открыть форум ↗
          </a>
        </div>
      </section>

      <div className="page">
        <h2 className="section-title">Категории правил</h2>
        <p className="section-subtitle">
          {categories.length} разделов · правила сгруппированы по источникам проекта
        </p>
        <div className="card-grid">
          {categories.map((cat) => {
            const count = rules.filter((r) => r.category === cat.id).length;
            return (
              <Link key={cat.id} to={`/rules/${cat.id}`} className="card">
                <div className="card-icon" aria-hidden="true">
                  {cat.icon}
                </div>
                <div className="card-title">{cat.name}</div>
                <div className="card-text">{cat.description}</div>
                <span className="card-count">{pluralRules(count)}</span>
              </Link>
            );
          })}
        </div>

        <h2 className="section-title" style={{ marginTop: 44 }}>
          Статистика портала
        </h2>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{rules.length}</div>
            <div className="stat-label">Правил</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{categories.length}</div>
            <div className="stat-label">Разделов</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{rules.filter((r) => r.important).length}</div>
            <div className="stat-label">Важных правил</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{formatDate(lastSyncDate)}</div>
            <div className="stat-label">Последнее обновление</div>
          </div>
        </div>

        <h2 className="section-title" style={{ marginTop: 44 }}>
          Важные правила
        </h2>
        <p className="section-subtitle">
          Правила, которые администрация рекомендует изучить в первую очередь
        </p>
        <div className="card-grid">
          {importantRules.map((rule) => {
            const cat = categories.find((c) => c.id === rule.category);
            return (
              <Link
                key={rule.id}
                to={`/rules/${rule.category}?rule=${encodeURIComponent(rule.id)}`}
                className="card"
              >
                <div className="card-title">
                  {rule.number} · {rule.title}
                </div>
                <div className="card-text">
                  {rule.content.split("\n\n")[0].slice(0, 120)}…
                </div>
                <span className="card-count">{cat?.name}</span>
              </Link>
            );
          })}
        </div>

        <h2 className="section-title" style={{ marginTop: 44 }}>
          Последние обновления
        </h2>
        <div className="update-card">
          <span className="update-date">{formatDate(demoUpdates[0].date)}</span>
          <div className="update-title">{demoUpdates[0].title}</div>
          <div className="update-desc">{demoUpdates[0].desc}</div>
          <Link to="/updates" className="btn btn-secondary btn-sm">
            Все обновления
          </Link>
        </div>

        <div className="notice" style={{ marginTop: 32 }}>
          ℹ️ Полные обновляемые правила проекта размещены на{" "}
          <a href={SOURCES.forumRules} target="_blank" rel="noopener noreferrer">
            официальном форуме Arizona RP
          </a>{" "}
          и доступны зарегистрированным пользователям. Этот портал — удобный
          справочник; при расхождении приоритет имеет версия на форуме.
        </div>
      </div>
    </main>
  );
}
