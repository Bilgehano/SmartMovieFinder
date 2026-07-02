# SmartMovieFinder Repository

This repository now separates repository-level content from the runnable application.

## Layout

- `src/` contains the application source tree, Docker Compose stack, frontend, and backend services.
- The repository root is reserved for documentation, planning notes, and other non-application files.

## Common Commands

Start the full stack:

```bash
cd src
docker compose up --build
```

Build individual backend services:

```bash
cd src/backend/user-service
./mvnw package
```

```bash
cd src/backend/catalog-service
./mvnw package
```

Frontend development:

```bash
cd src/frontend
npm install
npm run dev
```

Application-specific notes remain in `src/README.md`.## SmartMovieFinder Services

The backend now runs as two Spring Boot services under `backend/`:

- `backend/user-service/` - merged `user-service` for authentication and user library data
- `backend/catalog-service/` - catalog-service

Each service is independently buildable, containerized, and connected to its own PostgreSQL database.

### Public API

- `api-gateway`: `http://193.197.231.197:8080`

The gateway forwards requests internally:

- `/users/**` -> `user-service`
- `/movies/**` -> `catalog-service`
- `/genres` -> `catalog-service`

The Spring Boot services still run on their own container ports internally, but the frontend only needs the gateway URL that is reachable from your cloud server.

### Main Endpoints

- `/users/**` for registration, login, user lookup, watched movies, favorite genres, and ratings
- `/movies/**`, `/genres`

### Run With Docker

```bash
docker compose up --build
```

After the stack starts, access the API through your server's public IP or DNS name, for example:

```text
http://193.197.231.197:8080
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
- The frontend should call only the API gateway at `http://193.197.231.197:8080` or your public DNS name.
- `user-service` and `catalog-service` are no longer exposed directly on host ports in Docker Compose.
- Docker already publishes the gateway on `0.0.0.0:8080`, so no compose change is required to make it reachable from outside the VM.
- Make sure your BW Cloud security group / firewall allows inbound TCP traffic on port `8080`.
