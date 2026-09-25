# build context is repo root (see docker-compose.yml)
FROM node:20-alpine AS build
WORKDIR /repo
COPY package.json package-lock.json tsconfig.base.json ./
COPY apps/web apps/web
COPY apps/desktop/package.json apps/desktop/package.json
RUN npm ci
RUN npm run build --workspace apps/web

FROM nginx:alpine
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /repo/apps/web/dist /usr/share/nginx/html
EXPOSE 80
