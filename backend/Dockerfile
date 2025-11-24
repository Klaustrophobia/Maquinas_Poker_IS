# 1. Imagen base
FROM node:20-alpine AS builder

# 2. Crear carpeta del proyecto
WORKDIR /app

# 3. Copiar package.json e instalar TODAS las dependencias (incluyendo devDependencies)
COPY package*.json ./
RUN npm ci

# 4. Copiar todo el código
COPY . .

# 5. Compilar Next.js
RUN npm run build

# 6. Imagen final para producción
FROM node:20-alpine AS runner
WORKDIR /app

# 7. Crear usuario no-root para mayor seguridad
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# 8. Copiamos lo necesario de la imagen anterior
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.* ./
COPY --from=builder /app/postcss.config.* ./
COPY --from=builder /app/tailwind.config.* ./

# 9. Cambiar propietario de los archivos
RUN chown -R nextjs:nodejs /app

# 10. Cambiar al usuario no-root
USER nextjs

# 11. Exponer puerto
EXPOSE 3000

# 12. Variables de entorno
ENV PORT=3000
ENV NODE_ENV=production

# Configuración de PostgreSQL
ENV DB_HOST=host.docker.internal
ENV DB_PORT=5432
ENV DB_USERNAME=postgres
ENV DB_PASSWORD=oracle
ENV DB_NAME=Maquinas_Poker
ENV DATABASE_URL="postgresql://postgres:oracle@host.docker.internal:5432/Maquinas_Poker"

# Configuración JWT
ENV JWT_SECRET=una_clave_super_segura_y_larga_que_nadie_mas_sepa

# Configuración de correo (CORREGIDO - con comillas)
ENV MAIL_USER=annymo1996@gmail.com
ENV MAIL_PASS="lpkv nyds yzwo lgsb"
ENV MAIL_SERVICE=gmail
ENV MAIL_FROM="Maquinas de Poker <annymo1996@gmail.com>"

# 13. Ejecutar el servidor
CMD ["npm", "start"]