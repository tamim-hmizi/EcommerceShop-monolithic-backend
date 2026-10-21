# EcommerceShop Monolithic Backend

REST API of the EcommerceShop application as a single Express service backed by MongoDB. It serves the [EcommerceShop-Frontend](https://github.com/tamim-hmizi/EcommerceShop-Frontend) storefront and was the VM (monolith) deployment use case of the QuickOps platform; the same domain was later split into the EcommerceShop microservices for the AKS use case.

## Features

- Authentication: registration and login with bcrypt-hashed passwords and JWT; `protect` and `admin` middleware
- Users: profile update, profile picture upload and removal, admin user management
- Products and categories: public listing and lookup, admin create/update/delete with image upload (Multer, stored in `uploads/`)
- Orders: create and list own orders, admin listing of all orders and status updates (Pending, Processing, Shipped, Delivered)
- Cart: server-side cart with item add/update/remove, clear, and guest cart merge
- Favorites: add, check, remove and list favorite products
- Request validation with express-validator, Helmet, CORS allow-list with credentials, rate limiting (100 requests per 15 minutes per IP)
- Prometheus metrics at `GET /metrics` (prom-client)

## API overview

| Base path | Resource |
|---|---|
| `/api/auth/register`, `/api/auth/login` | Authentication |
| `/api/users` | Profile and admin user management |
| `/api/products` | Products |
| `/api/category` | Categories |
| `/api/orders` | Orders |
| `/api/cart` | Cart |
| `/api/favorites` | Favorites |
| `/uploads` | Uploaded images (static) |
| `/metrics` | Prometheus metrics |

## Tech stack

Node.js 22, Express 5, MongoDB with Mongoose 9, JSON Web Tokens, bcryptjs, Multer 2, express-validator, Helmet, express-rate-limit, Morgan, prom-client. ES modules.

## Environment variables

Copy `.env.example` to `.env`.

| Variable | Description |
|---|---|
| `MONGO_URI` | MongoDB connection string (required) |
| `JWT_SECRET` | Secret used to sign JWTs (required) |
| `PORT` | HTTP port, default `5000` |
| `NODE_ENV` | `production` disables request logging |
| `LOG_LEVEL` | `ERROR`, `WARN`, `INFO` (default) or `DEBUG` |

Allowed CORS origins are defined in `index.js`.

## Run locally

Requires Node.js 22 and a MongoDB instance.

```bash
npm install
npm run dev      # node --watch
npm start
```

There is no build step and no test suite.

## Tests

Integration tests use Node's built-in test runner and Supertest against a real MongoDB:

```bash
docker run -d --name mongo -p 27017:27017 mongo:8
MONGO_URI=mongodb://127.0.0.1:27017 npm test
```

CI runs the same suite with a MongoDB service container on every push and pull request.

## Docker

```bash
docker build -t ecommerceshop-backend .
docker run -p 5000:5000 --env-file .env -v ecommerce-uploads:/app/uploads ecommerceshop-backend
```

The image is based on `node:22-alpine`, installs production dependencies only and runs as the `node` user. Mount a volume on `/app/uploads` to persist uploaded images.

## Related repositories

- [EcommerceShop-Frontend](https://github.com/tamim-hmizi/EcommerceShop-Frontend) - storefront for the monolithic backend
- [EcommerceShop-Frontend-K8S](https://github.com/tamim-hmizi/EcommerceShop-Frontend-K8S) - storefront wired to the microservices
- [EcommerceShop-monolithic-backend](https://github.com/tamim-hmizi/EcommerceShop-monolithic-backend) - Express/MongoDB monolith
- Microservices: [auth](https://github.com/tamim-hmizi/EcommerceShop-microservice-auth), [users](https://github.com/tamim-hmizi/EcommerceShop-microservice-users), [products](https://github.com/tamim-hmizi/EcommerceShop-microservice-products), [categories](https://github.com/tamim-hmizi/EcommerceShop-microservice-categories), [orders](https://github.com/tamim-hmizi/EcommerceShop-microservice-orders), [carts](https://github.com/tamim-hmizi/EcommerceShop-microservice-carts), [favorites](https://github.com/tamim-hmizi/EcommerceShop-microservice-favorites)
- [QuickOps-Frontend](https://github.com/tamim-hmizi/QuickOps-Frontend) - the QuickOps platform that deployed this use case

---

Part of the MERN e-commerce use case for QuickOps, 2025, by Tamim Hmizi: https://tamim-hmizi.github.io/Portfolio/
