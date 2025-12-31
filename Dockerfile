FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source
COPY . .

# Prisma generate
RUN npx prisma generate

# Build TS → JS
RUN npm run build

EXPOSE 3000

CMD ["node", "dist/server.js"]
