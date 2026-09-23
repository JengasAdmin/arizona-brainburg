import { useState } from "react";
import { NavLink, Link } from "react-router-dom";

const navItems = [
  { to: "/", label: "Главная", end: true },
  { to: "/rules", label: "Правила" },
  { to: "/updates", label: "Обновления" },
  { to: "/faq", label: "FAQ" },
  { to: "/about", label: "О проекте" },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link to="/" className="brand" aria-label="Arizona Brainburg — на главную">
          <img src="./favicon.svg" alt="" className="brand-logo" />
          <span className="brand-name">
            Arizona <b>Brainburg</b>
          </span>
        </Link>
        <button
          className="nav-toggle"
          aria-label={open ? "Закрыть меню" : "Открыть меню"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "✕" : "☰"}
        </button>
        <nav className={`main-nav${open ? " open" : ""}`} aria-label="Основная навигация">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setOpen(false)}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
