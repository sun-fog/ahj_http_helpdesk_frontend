# HelpDesk: Frontend

Домашнее задание к занятию «Работа с HTTP»
([netology-code/ahj-homeworks, ветка AHJ-50, каталог http](https://github.com/netology-code/ahj-homeworks/tree/AHJ-50/http)).

Фронтенд сервиса управления заявками (тикеты), который работает с готовым API:

- `GET ?method=allTickets` — список тикетов (без `description`);
- `GET ?method=ticketById&id=<id>` — полное описание тикета;
- `POST ?method=createTicket` — создание тикета (тело — JSON: `name`, `description`, `status`);
- `POST ?method=updateById&id=<id>` — обновление тикета по `id` (тело — JSON);
- `GET ?method=deleteById&id=<id>` — удаление тикета, успешный ответ — `204`.

## Реализованный функционал

- отображение всех тикетов (загружаются с сервера);
- создание нового тикета (кнопка «Добавить тикет»);
- редактирование тикета (кнопка «✎» — форма запрашивает `ticketById` для предзаполнения);
- удаление тикета (кнопка «✕» — с окном подтверждения);
- отметка о выполнении (чекбокс — обновление через `updateById`);
- просмотр полного описания по клику на тело тикета (отдельный запрос `ticketById`);
- индикатор загрузки и сообщение об ошибке сети.

## Адрес API

Адрес сервера задаётся константой `API_URL` в `src/js/api.js`.
По умолчанию — готовый сервер из задания. Если хотите работать со своим
бэкендом, поднимите сервер из папки `server/` и укажите `'http://localhost:7070/'`.

## Развертывание

```bash
npm install
npm run dev    # запуск dev-сервера на http://localhost:3000
npm run build  # сборка в каталог dist/
```

## Деплой на GitHub Pages

Репозиторий настроен на автоматический деплой через GitHub Actions
(файл `.github/workflows/deploy.yml`): при пуше в `main` проект собирается
через Webpack и публикуется в GitHub Pages. В настройках репозитория
раздел **Settings → Pages → Source** выберите **GitHub Actions**.