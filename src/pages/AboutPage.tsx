import { Link } from "react-router-dom";
import { SOURCES, forumThreadSources, rules } from "../data/rules";
import { formatDate } from "../lib/format";

export default function AboutPage() {
  const lastUpdate = rules.reduce<string>(
    (max, r) => (r.updatedAt && r.updatedAt > max ? r.updatedAt : max),
    "",
  );

  return (
    <main className="page">
      <nav className="breadcrumbs" aria-label="Хлебные крошки">
        <Link to="/">Главная</Link>
        <span className="sep">→</span>
        <span className="current">О проекте</span>
      </nav>

      <h1 className="section-title">О проекте</h1>
      <p className="section-subtitle">Информационный портал правил Arizona Brainburg</p>

      <div className="about-block">
        <h2>🎯 Зачем нужен портал</h2>
        <p>
          Правила проекта Arizona RP разбросаны по темам закрытого форума и базе
          знаний, поэтому их сложно быстро просмотреть и найти нужный пункт.
          Портал собирает правила в одном месте: с поиском по номеру, заголовку
          и тексту, категориями, оглавлением и переходом к оригиналу каждого
          правила.
        </p>
      </div>

      <div className="about-block">
        <h2>📚 Источники правил</h2>
        <p>
          Содержимое правил взято из официальных публичных источников проекта —
          без изменений и дополнений. Последняя синхронизация:{" "}
          {formatDate(lastUpdate)}.
        </p>
        <ul>
          {forumThreadSources.map((s) => (
            <li key={s.url}>
              <a href={s.url} target="_blank" rel="noopener noreferrer">
                {s.label} ↗
              </a>
            </li>
          ))}
        </ul>
        <p>
          Полные обновляемые правила размещены в{" "}
          <a href={SOURCES.forumRules} target="_blank" rel="noopener noreferrer">
            разделе «Правила проекта» форума
          </a>{" "}
          и доступны зарегистрированным пользователям. При расхождении
          приоритет имеет версия на форуме.
        </p>
      </div>

      <div className="notice">
        ⚠️ Портал поддерживается сообществом Arizona Brainburg в информационных
        целях и <b>не является официальным сайтом Arizona RP</b>. Официальные
        ресурсы:{" "}
        <a href={SOURCES.forumMain} target="_blank" rel="noopener noreferrer">
          arizona-rp.com
        </a>{" "}
        и{" "}
        <a href={SOURCES.helpCenter} target="_blank" rel="noopener noreferrer">
          база знаний
        </a>
        .
      </div>

      <div className="about-block">
        <h2>🚀 Планы развития</h2>
        <ul>
          <li>Автоматическая синхронизация правил с форумом</li>
          <li>История изменений каждого правила</li>
          <li>Избранные правила и личные заметки</li>
          <li>Раздел новостей и уведомления об обновлениях</li>
        </ul>
        <p>
          Есть предложение или нашли неточность в правиле? Напишите в тему
          правил на форуме — портал обновляется по мере изменений в
          источниках.
        </p>
      </div>
    </main>
  );
}
