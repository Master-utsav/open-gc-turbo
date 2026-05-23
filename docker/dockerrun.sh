#!/bin/bash

# =========================================================
# 1. CREATE SHARED NETWORK
# =========================================================
docker network create open-gc-network

# =========================================================
# 3. REDIS
# =========================================================
docker run -d --name redis-open-gc-container --network open-gc-network --restart unless-stopped -v redis_open_gc_data:/data redis:7-alpine redis-server --appendonly yes

# =========================================================
# 4. HTTP EXPRESS
# =========================================================
docker run -d --name http-express-open-gc-test-container --network open-gc-network --restart unless-stopped --env-file ./envs/http-express.env -p 8080:8080 http-express-open-gc-test-build:latest

# =========================================================
# 5. WEBSOCKET
# =========================================================
docker run -d --name websocket-ws-open-gc-test-container --network open-gc-network --restart unless-stopped --env-file ./envs/websocket-ws.env -p 8081:8081 websocket-ws-open-gc-test-build:latest

# =========================================================
# 6. WEB (Next.js)
# =========================================================
docker run -d --name web-open-gc-test-container --network open-gc-network --restart unless-stopped --env-file ./envs/web.env -p 3000:3000 web-open-gc-test-build:latest