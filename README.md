## SmartMovieFinder Services

The backend now runs as two Spring Boot services under `backend/`:

- `backend/user-service/` - merged `user-service` for authentication and user library data
- `backend/catalog-service/` - catalog-service

Each service is independently buildable, containerized, and connected to its own PostgreSQL database.

### Service Ports

- `user-service`: `http://localhost:8080`
- `catalog-service`: `http://localhost:8081`

### Main Endpoints

- `user-service`: `/users/**` for registration, login, user lookup, watched movies, favorite genres, and ratings
- `catalog-service`: `/movies/**`, `/genres`

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
- The frontend now only needs `user-service` and `catalog-service`, or you can add an API gateway later if you want one public backend URL.
