# --- STEP 1: BASE INSTALLATION ---
FROM node:20-bookworm-slim AS base
WORKDIR /usr/src/app
RUN apt-get update && apt-get install -y wget && rm -rf /var/lib/apt/lists/*
COPY package*.json ./

# --- STEP 2: DEVELOPMENT TARGET ---
FROM base AS development
RUN npm ci
COPY . .
CMD ["npm", "run", "dev"]

# --- STEP 3: BUILD FOR PRODUCTION ---
FROM base AS build
RUN npm ci
COPY . .
RUN npm run build
RUN npm prune --production

# --- STEP 4: PRODUCTION RUNTIME ---
FROM node:20-bookworm-slim AS production
WORKDIR /usr/src/app
RUN apt-get update && apt-get install -y wget && rm -rf /var/lib/apt/lists/*
COPY --from=build /usr/src/app/package*.json ./
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/.next ./.next
COPY --from=build /usr/src/app/public ./public

EXPOSE 3000
CMD ["npm", "run", "start"]
