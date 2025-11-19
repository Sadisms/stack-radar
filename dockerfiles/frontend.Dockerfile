FROM node:22-alpine as builder

WORKDIR /frontend
COPY ./frontend /frontend
RUN npm i --force
RUN npm run build

FROM alpine

COPY --from=builder /frontend/dist/ /build
