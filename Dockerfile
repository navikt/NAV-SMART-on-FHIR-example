FROM node:22-alpine AS build
WORKDIR /app
COPY ./package.json /app/package.json
RUN npm i
COPY ./src /app/src
COPY ./index.html /app/index.html
COPY ./public /app/public
COPY ./.env /app/.env
COPY ./tsconfig.app.json /app/tsconfig.app.json
COPY ./tsconfig.json /app/tsconfig.json
COPY ./tsconfig.node.json /app/tsconfig.node.json
COPY ./vite.config.ts /app/vite.config.ts
COPY ./postcss.config.js /app/postcss.config.js
COPY ./tailwind.config.js /app/tailwind.config.js
RUN npm run build

FROM node:22-alpine AS runtime
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY --from=build /app/dist /app/dist
RUN npm add -g serve

EXPOSE 8080
CMD ["serve", "-s", "dist", "-l", "8080"]