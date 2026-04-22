## SmartMovieFinder Services

The backend now runs as two Spring Boot services under `backend/`:

- `backend/user-service/` - merged `user-service` for authentication and user library data
- `backend/catalog-service/` - catalog-service

Each service is independently buildable, containerized, and connected to its own PostgreSQL database.

### Public API

- `api-gateway`: `http://localhost:8080`

The gateway forwards requests internally:

- `/users/**` -> `user-service`
- `/movies/**` -> `catalog-service`
- `/genres` -> `catalog-service`

The Spring Boot services still run on their own container ports internally, but the frontend only needs the gateway URL.

### Main Endpoints

- `/users/**` for registration, login, user lookup, watched movies, favorite genres, and ratings
- `/movies/**`, `/genres`

### Run With Docker

```bash
docker compose up --build
```

### Build Individually

```bash
cd backend/user-service
./mvnw package
```

```bash
cd backend/catalog-service
./mvnw package
```

### Notes

- `user-service` now owns users, authentication, watched movie data, ratings, and favorite genres.
- `catalog-service` owns movie discovery endpoints and TMDB integration.
- The merged user service now stores the `users` table in the same PostgreSQL database as the library data.
- Existing data from the old `identity-service` database is not migrated automatically.
- The frontend should call only the API gateway at `http://localhost:8080`.
- `user-service` and `catalog-service` are no longer exposed directly on host ports in Docker Compose.
