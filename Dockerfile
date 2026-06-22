FROM node:18

WORKDIR /app

# встановлення залежностей
COPY server/package*.json ./server/
WORKDIR /app/server
RUN npm install

# назад у корінь
WORKDIR /app

# копіюємо ВСЕ (сервер + фронт)
COPY . .

EXPOSE 8080

CMD ["node", "server/server.js"]