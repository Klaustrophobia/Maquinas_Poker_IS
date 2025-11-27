FROM node:22-alpine AS base

# Instalar PostgreSQL client en todas las etapas donde lo necesitemos
RUN apk add --no-cache postgresql-client bash

FROM base AS deps
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

FROM base AS builder
WORKDIR /app

COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN npm run build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Crear usuario no-root para mayor seguridad
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Cambiar propietario de los archivos
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json

# Copiar script de espera
COPY --chown=nextjs:nodejs wait-for-db.sh /wait-for-db.sh
RUN chmod +x /wait-for-db.sh

USER nextjs

EXPOSE 3000

CMD ["/wait-for-db.sh", "npm", "run", "start"]