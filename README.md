# SubManager

Платформа управления подписками и шеринга расходов.

## О проекте

SubManager — кроссплатформенное веб-приложение (PWA + Telegram Mini App) для учета регулярных подписок, финансовой аналитики и напоминаний должникам через Telegram.

Ключевые фичи:

- Учет подписок: название, сумма, период, дата списания, категория.
- Аналитика: расходы за период, распределение по категориям, ближайшие списания.
- Сплит-оплата: добавление участников и напоминания должникам.
- PWA: офлайн-режим, установка на домашний экран.
- Telegram Bot: привязка аккаунта, уведомления о платежах.

## Технологии

| Слой | Стек |
|------|------|
| Frontend | React 18, TypeScript, Vite, Redux Toolkit, SCSS |
| Backend | Supabase (PostgreSQL, Auth, RLS), Edge Functions |
| Bot | grammY |
| Infra | Vercel, GitHub Actions |

## Структура проекта

```
subManager/
├── client/                 # Frontend (React + Vite + TypeScript)
│   ├── src/
│   │   ├── app/            # Точка входа, провайдеры, роутинг
│   │   ├── pages/          # Страницы приложения
│   │   ├── widgets/        # Крупные UI-блоки
│   │   ├── features/       # Бизнес-фичи (auth, subscription, split)
│   │   ├── entities/       # Сущности (user, subscription, category)
│   │   └── shared/         # Общие модули (ui, api, lib, config, styles)
│   └── ...
├── server/                 # Backend, Supabase, Telegram Bot
│   ├── supabase/
│   │   ├── migrations/     # SQL-миграции БД
│   │   └── functions/      # Edge Functions
│   └── bot/                # grammY бот
└── .github/                # Workflows (cron, CI)
```

## Быстрый старт

### 1. Установка зависимостей

```bash
cd client
npm install
```

### 2. Настройка Supabase

1. Создай проект на [supabase.com](https://supabase.com).
2. Примени миграции из `server/supabase/migrations/`.
3. Включи Email и Google OAuth в Authentication.

### 3. Переменные окружения

Создай `client/.env.local`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Запуск

```bash
npm run dev
```

## Telegram-бот

Бот живёт в `server/bot` и работает на long polling — публичный URL не нужен.

```bash
cd server
npm install
cp .env.example .env   # вписать BOT_TOKEN от @BotFather
npm run bot            # привязка аккаунтов через /start
npm run remind         # разовая рассылка напоминаний
npm run remind -- --dry  # прогон без отправки (печатает сообщения в консоль)
```

Ежедневные напоминания крутятся через GitHub Actions (`.github/workflows/reminders.yml`, 10:00 МСК). Для работы workflow добавь в репозитории **Settings → Secrets and variables → Actions** три секрета: `BOT_TOKEN`, `SUPABASE_URL`, `SUPABASE_KEY`.

## Команды

| Команда | Описание |
|---------|----------|
| `npm run dev` | Запуск dev-сервера |
| `npm run build` | Сборка production-версии |
| `npm run preview` | Просмотр сборки |
| `npm run lint` | Проверка кода oxlint |

## Roadmap

- [x] Инициализация проекта, FSD, алиасы, базовые стили
- [x] Схема Supabase и RLS-политики
- [x] Авторизация (Email + Google OAuth)
- [x] CRUD подписок
- [x] Дашборд и аналитика
- [x] Сплит-оплата
- [x] Telegram Bot и линкинг аккаунтов
- [x] Cron-напоминания
- [x] PWA (offline, manifest)
- [ ] Inline-кнопки бота («Я перевел»)
- [ ] Telegram Mini App
- [ ] Деплой на Vercel
