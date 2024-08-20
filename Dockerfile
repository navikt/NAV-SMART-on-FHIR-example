FROM node:22-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
COPY . /app
WORKDIR /app

FROM base AS prod-dependencies
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

FROM base AS build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run build

FROM base
COPY --from=prod-dependencies /app/node_modules /app/node_modules
COPY --from=build /app/dist /app/dist

# Use vercel/serve to serve static production content
RUN pnpm add -g serve

EXPOSE 8080
CMD ["serve", "-s", "dist", "-l", "8080"]