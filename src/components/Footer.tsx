import { Link } from "react-router-dom";
import { SOURCES } from "../data/rules";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <Link to="/" className="brand">
            <img src="./favicon.svg" alt="" className="brand-logo" />
            <span className="brand-name">
              Arizona <b>Brainburg</b>
            </span>
          </Link>
          <p>Официальный информационный портал правил проекта.</p>
        </div>
        <div className="footer-col">
          <h3>Навигация</h3>
          <ul>
            <li>
              <Link to="/rules">Правила</Link>
            </li>
            <li>
              <a href={SOURCES.forumRules} target="_blank" rel="noopener noreferrer">
                Форум
              </a>
            </li>
            <li>
              <Link to="/updates">Обновления</Link>
            </li>
            <li>
              <Link to="/faq">FAQ</Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <p>
          Источник правил: <b>официальный форум и база знаний Arizona RP</b>.
          При расхождении данных приоритет имеет версия на форуме.
        </p>
        <p>
          Информационный портал сообщества Arizona Brainburg. Не является
          официальным сайтом Arizona RP.
        </p>
      </div>
    </footer>
  );
}
