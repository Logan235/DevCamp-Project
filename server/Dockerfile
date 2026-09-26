# Dùng khi deploy server bằng Docker runtime (Render "Docker", Railway, VPS...).
# Cài sẵn g++ để JudgeService chạy engine native bên trong container.
FROM node:22-bookworm-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build && npm prune --omit=dev

FROM node:22-bookworm-slim
ENV NODE_ENV=production
RUN apt-get update \
  && apt-get install -y --no-install-recommends g++ coreutils \
  && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./
EXPOSE 3000
CMD ["node", "dist/main"]
