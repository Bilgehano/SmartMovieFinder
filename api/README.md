# SmartMovieFinder API

All API work in this project is documented with Swagger / OpenAPI.

The backend services currently expose live Swagger UIs and OpenAPI JSON documents on these URLs:

Public server IP: `193.197.230.150`

## Swagger UI

- User Service: http://193.197.230.150:18080/swagger-ui/index.html
- Catalog Service: http://193.197.230.150:18081/swagger-ui/index.html
- Recommendation Service: http://193.197.230.150:18082/swagger-ui/index.html

## OpenAPI JSON

- User Service: http://193.197.230.150:18080/v3/api-docs
- Catalog Service: http://193.197.230.150:18081/v3/api-docs
- Recommendation Service: http://193.197.230.150:18082/v3/api-docs

## Active API Base URLs

- API Gateway: http://193.197.230.150:8080
- User endpoints via gateway: http://193.197.230.150:8080/users
- Movie endpoints via gateway: http://193.197.230.150:8080/movies
- Genre endpoints via gateway: http://193.197.230.150:8080/genres
- Recommendation endpoints via gateway: http://193.197.230.150:8080/recommendations

## Notes

- The Swagger pages are currently exposed directly on the individual backend service ports.
- The API gateway is active on port `8080`, but it does not currently proxy the Swagger UI pages.
- The Docker bridge addresses such as `172.17.0.1` and `172.18.0.1` are internal and should not be used by clients on the network.