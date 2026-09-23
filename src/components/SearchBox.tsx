import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { searchRules, type SearchHit } from "../lib/search";
import { categories } from "../data/rules";

function Highlighted({ text, query }: { text: string; query: string }) {
  const q = query.trim();
  if (!q) return <>{text}</>;
  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "gi"));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === q.toLowerCase() ? <mark key={i}>{part}</mark> : part,
      )}
    </>
  );
}

interface SearchBoxProps {
  autoFocusOnHome?: boolean;
}

export default function SearchBox({ autoFocusOnHome }: SearchBoxProps) {
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [focused, setFocused] = useState(false);
  const navigate = useNavigate();
  const boxRef = useRef<HTMLDivElement>(null);

  // Debounce ввода, чтобы поиск не пересчитывался на каждое нажатие
  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 200);
    return () => clearTimeout(t);
  }, [query]);

  const results: SearchHit[] = debounced ? searchRules(debounced) : [];
  const showResults = focused && debounced.trim().length >= 2;

  // Закрытие по клику вне блока
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setFocused(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const goToRule = (hit: SearchHit) => {
    setFocused(false);
    navigate(`/rules/${hit.rule.category}?rule=${encodeURIComponent(hit.rule.id)}`);
  };

  return (
    <div className="search-wrap" ref={boxRef} role="search">
      <span className="search-icon" aria-hidden="true">
        🔍
      </span>
      <input
        className="search-input"
        type="search"
        placeholder="Поиск по правилам: номер, заголовок, текст…"
        aria-label="Поиск по правилам"
        value={query}
        autoFocus={autoFocusOnHome}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setFocused(true)}
      />
      {query && (
        <button
          className="search-clear"
          aria-label="Очистить поиск"
          onClick={() => {
            setQuery("");
            setDebounced("");
          }}
        >
          ✕
        </button>
      )}
      {showResults && (
        <div
          className="search-results"
          role="listbox"
          aria-label="Результаты поиска"
        >
          {results.length === 0 ? (
            <p className="search-empty">По вашему запросу ничего не найдено</p>
          ) : (
            results.slice(0, 8).map((hit) => {
              const cat = categories.find((c) => c.id === hit.rule.category);
              return (
                <button
                  key={hit.rule.id}
                  className="search-result"
                  style={{
                    width: "100%",
                    background: "none",
                    border: "none",
                    borderBottom: "1px solid var(--border)",
                    textAlign: "left",
                    color: "inherit",
                    font: "inherit",
                    cursor: "pointer",
                  }}
                  onClick={() => goToRule(hit)}
                >
                  <span className="search-result-meta">
                    {cat?.name} · правило {hit.rule.number}
                  </span>
                  <span className="search-result-title">
                    <span className="rule-num">{hit.rule.number}</span>
                    <Highlighted text={hit.rule.title} query={debounced} />
                  </span>
                  <span className="search-result-snippet">
                    <Highlighted text={hit.snippet} query={debounced} />
                  </span>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
