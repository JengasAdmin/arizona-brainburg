import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import RuleCard from "../components/RuleCard";
import { categories, rules, lastSyncDate } from "../data/rules";
import { formatDate, todayIso } from "../lib/format";
import { formatRuleId } from "../lib/search";

type SyncStatus =
  | { kind: "idle" }
  | { kind: "checking" }
  | { kind: "success"; date: string }
  | { kind: "warning"; message: string };

const LAST_CHECK_KEY = "brainburg-last-source-check";

export default function RulesPage() {
  const { categoryId } = useParams<{ categoryId?: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const highlightedId = searchParams.get("rule");

  const validCategory =
    categoryId && categories.some((c) => c.id === categoryId) ? categoryId : null;
  const activeCategory = validCategory ?? "all";

  const [sync, setSync] = useState<SyncStatus>({ kind: "idle" });
  const [lastCheck, setLastCheck] = useState<string | null>(() => {
    try {
      return localStorage.getItem(LAST_CHECK_KEY);
    } catch {
      return null;
    }
  });
  const timerRef = useRef<number | undefined>(undefined);

  const visibleRules = useMemo(
    () =>
      activeCategory === "all"
        ? rules
        : rules.filter((r) => r.category === activeCategory),
    [activeCategory],
  );

  const importantRules = useMemo(
    () => visibleRules.filter((r) => r.important),
    [visibleRules],
  );

  // Подсветка и прокрутка к правилу из параметра ?rule=
  useEffect(() => {
    if (!highlightedId) return;
    const rule = rules.find((r) => r.id === highlightedId);
    if (!rule) return;
    const target = document.getElementById(formatRuleId(rule));
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      const t = window.setTimeout(() => setSearchParams({}, { replace: true }), 2500);
      return () => window.clearTimeout(t);
    }
  }, [highlightedId, visibleRules, setSearchParams]);

  // Отслеживание текущего правила для оглавления
  const [currentRuleId, setCurrentRuleId] = useState<string | null>(null);
  useEffect(() => {
    const onScroll = () => {
      let current: string | null = null;
      for (const rule of visibleRules) {
        const el = document.getElementById(formatRuleId(rule));
        if (el && el.getBoundingClientRect().top <= 120) current = rule.id;
      }
      setCurrentRuleId(current);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [visibleRules]);

  /** Попытка обновления данных из источников. Frontend-only: прямой
   * запрос к форуму блокируется CORS/Cloudflare, поэтому ожидаемо
   * показываем предупреждение и остаёмся на локальных данных. */
  const handleSync = async () => {
    setSync({ kind: "checking" });
    try {
      const controller = new AbortController();
      timerRef.current = window.setTimeout(() => controller.abort(), 6000);
      const resp = await fetch("https://forum.arizona-rp.com/forums/3762/", {
        signal: controller.signal,
        mode: "cors",
      });
      if (!resp.ok) throw new Error(String(resp.status));
      // Источник доступен — фиксируем успешную проверку.
      const date = todayIso();
      setSync({ kind: "success", date });
      setLastCheck(date);
      try {
        localStorage.setItem(LAST_CHECK_KEY, date);
      } catch {
        /* приватный режим браузера — не критично */
      }
    } catch {
      setSync({
        kind: "warning",
        message:
          "Автоматическое обновление источника временно недоступно. Используются последние сохраненные данные.",
      });
    }
  };

  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  const activeCat = categories.find((c) => c.id === activeCategory);

  return (
    <main className="page">
      <nav className="breadcrumbs" aria-label="Хлебные крошки">
        <Link to="/">Главная</Link>
        <span className="sep">→</span>
        <Link to="/rules">Правила</Link>
        {activeCat && (
          <>
            <span className="sep">→</span>
            <span className="current">{activeCat.name}</span>
          </>
        )}
        {highlightedId && currentRuleId && (
          <>
            <span className="sep">→</span>
            <span className="current">
              Пункт {rules.find((r) => r.id === currentRuleId)?.number}
            </span>
          </>
        )}
      </nav>

      <div className="sync-bar">
        <div className="sync-info">
          <b>Последнее обновление:</b> {formatDate(lastSyncDate)}
          {lastCheck && (
            <>
              {" · "}
              <b>Источник проверен:</b> {formatDate(lastCheck)}
            </>
          )}
        </div>
        <button
          className="btn btn-secondary btn-sm"
          onClick={handleSync}
          disabled={sync.kind === "checking"}
        >
          {sync.kind === "checking" ? "Проверка…" : "🔄 Обновить правила"}
        </button>
        {sync.kind === "success" && (
          <div className="sync-status success" role="status">
            ✅ Проверка источника выполнена {formatDate(sync.date)}
          </div>
        )}
        {sync.kind === "warning" && (
          <div className="sync-status warning" role="alert">
            ⚠️ {sync.message}
          </div>
        )}
      </div>

      <div className="rules-layout">
        <aside className="rules-sidebar" aria-label="Категории и оглавление">
          <div className="sidebar-heading">Категории</div>
          <button
            className={`category-btn${activeCategory === "all" ? " active" : ""}`}
            onClick={() => navigate("/rules")}
            aria-current={activeCategory === "all" ? "true" : undefined}
          >
            <span aria-hidden="true">📚</span>
            Все правила
            <span className="cat-count">{rules.length}</span>
          </button>
          {categories.map((cat) => {
            const count = rules.filter((r) => r.category === cat.id).length;
            return (
              <button
                key={cat.id}
                className={`category-btn${activeCategory === cat.id ? " active" : ""}`}
                onClick={() => navigate(`/rules/${cat.id}`)}
                aria-current={activeCategory === cat.id ? "true" : undefined}
              >
                <span className="cat-icon" aria-hidden="true">
                  {cat.icon}
                </span>
                {cat.name}
                <span className="cat-count">{count}</span>
              </button>
            );
          })}

          {activeCategory !== "all" && (
            <>
              <div className="sidebar-heading" style={{ marginTop: 10 }}>
                Оглавление
              </div>
              <ul className="toc-list">
                {visibleRules.map((rule) => (
                  <li key={rule.id}>
                    <a
                      href={`#${formatRuleId(rule)}`}
                      className={currentRuleId === rule.id ? "active" : ""}
                      onClick={(e) => {
                        e.preventDefault();
                        document
                          .getElementById(formatRuleId(rule))
                          ?.scrollIntoView({ behavior: "smooth" });
                      }}
                    >
                      {rule.number} {rule.title}
                    </a>
                  </li>
                ))}
              </ul>
            </>
          )}
        </aside>

        <div>
          {importantRules.length > 0 && (
            <div className="important-banner">
              <h2>⚠️ Важная информация</h2>
              <ul>
                {importantRules.map((rule) => (
                  <li key={rule.id}>
                    <a
                      href={`#${formatRuleId(rule)}`}
                      onClick={(e) => {
                        e.preventDefault();
                        document
                          .getElementById(formatRuleId(rule))
                          ?.scrollIntoView({ behavior: "smooth" });
                      }}
                    >
                      {rule.number} {rule.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {activeCat && (
            <>
              <h1 className="section-title">
                {activeCat.icon} {activeCat.name}
              </h1>
              <p className="section-subtitle">{activeCat.description}</p>
            </>
          )}

          {activeCategory === "all" && (
            <h1 className="section-title">📚 Все правила проекта</h1>
          )}

          {visibleRules.map((rule) => {
            const cat = categories.find((c) => c.id === rule.category);
            return (
              <RuleCard
                key={rule.id}
                rule={rule}
                categoryName={cat?.name ?? ""}
                highlighted={highlightedId === rule.id}
              />
            );
          })}
        </div>
      </div>
    </main>
  );
}
