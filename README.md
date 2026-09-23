# Arizona Brainburg — Центр правил

Информационный портал правил игрового проекта Arizona Brainburg.
Frontend-only MVP: React 18 + TypeScript + Vite, без backend и базы данных.

## Запуск

```bash
npm install
npm run dev       # разработка: http://localhost:5173
npm run build     # production-сборка в dist/
npm run preview   # предпросмотр собранной версии
```

## Структура

```
src/
  data/rules.ts        # ВСЕ правила и категории — единственное место правки контента
  lib/search.ts        # поиск по номеру, заголовку, тексту и категории
  lib/format.ts        # даты DD.MM.YYYY
  components/          # Header, Footer, SearchBox, RuleCard, BackToTop
  pages/               # Главная, Правила, Обновления, FAQ, О проекте
  styles/global.css    # тема: тёмный графит + тёмно-красные акценты
```

## Данные правил

Контент лежит в `src/data/rules.ts` (типы `Rule` и `RuleCategory`).
Тексты взяты дословно из официальных источников Arizona RP:

- База знаний, раздел «Правила игры»: https://help.arizona-rp.com/hc/arizona-rp/ru/categories/Rules
- Форум, раздел «Правила проекта» (доступен зарегистрированным): https://forum.arizona-rp.com/forums/3762/

Чтобы добавить правило — допишите объект в массив `rules` (и при необходимости
категорию в `categories`), затем `npm run build`. Статистика, счётчики
категорий и дата обновления пересчитываются автоматически.

Кнопка «Обновить правила» пытается проверить доступность источника; форум
закрыт CORS/Cloudflare-защитой, поэтому при недоступности показывается
предупреждение и используются локальные данные — интерфейс не ломается.

## Роутинг

HashRouter — сайт работает на любом статическом хостинге (GitHub Pages и т.п.)
без серверных настроек: `#/rules`, `#/rules/captures`, `#/faq` и т.д.
