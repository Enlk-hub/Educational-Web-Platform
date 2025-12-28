ENTBridge Backend (Spring Boot)

Кратко:
- Java 17, Spring Boot, PostgreSQL, Flyway, JWT (stateless)

Запуск (рекомендуется Docker):

1) В корне проекта выполните:

```bash
docker-compose up --build
```

2) После запуска сервис доступен на `http://localhost:8080`.

Swagger UI: http://localhost:8080/swagger-ui/index.html

Интеграция с фронтендом:
- Поменяйте `baseUrl` в фронтенде на `http://localhost:8080/api/v1`.
- Эндпоинты аутентификации: `/api/v1/auth/login`, `/api/v1/auth/register` — возвращают JSON `{ "token": "...", "user": { ... } }`.
- CORS разрешён для `http://localhost:5173`.

Миграции Flyway находятся в `src/main/resources/db/migration`.

Примечание: пароль в сид-дате выставлен в bcrypt-хеше для значения `password`. Замените секрет `JWT_SECRET` в `docker-compose.yml` на безопасный в проде.
