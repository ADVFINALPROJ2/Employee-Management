# --- STEP 1: BASE INSTALLATION ---
FROM node:20-alpine AS base
WORKDIR /usr/src/app
RUN apk add --no-cache openssl
COPY package*.json ./
COPY prisma ./prisma/

# --- STEP 2: DEVELOPMENT TARGET ---
FROM base AS development
RUN npm install
COPY . .
RUN npx prisma generate
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["npm", "run", "start:dev"]

# --- STEP 3: BUILD FOR PRODUCTION ---
FROM base AS build
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build
RUN npm prune --production

# --- STEP 4: PRODUCTION RUNTIME ---
FROM node:20-alpine AS production
WORKDIR /usr/src/app
RUN apk add --no-cache openssl wget
COPY --from=build /usr/src/app/package*.json ./
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/prisma ./prisma
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 3001
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "dist/main"]
