FROM node:22-alpine

WORKDIR /app

# Dependencies first for better layer caching
COPY package.json package-lock.json ./
RUN npm ci --include=dev

COPY . .
RUN npx prisma generate && npm run build

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

# Apply the schema (creating the SQLite file if needed), then serve.
CMD ["sh", "-c", "npx prisma db push --skip-generate && npx next start -p 3000"]
