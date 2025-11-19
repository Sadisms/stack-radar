FROM node:22-alpine as frontend-builder

WORKDIR /app
COPY ./frontend/package*.json ./
RUN npm ci

COPY ./frontend ./
ENV VITE_API_BASE_URL=/api/v1
RUN npm run build

FROM nginx:alpine

COPY --from=frontend-builder /app/dist /usr/share/nginx/html

COPY ./etc/nginx.conf /etc/nginx/conf.d/default.conf

RUN apk add --no-cache wget

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]