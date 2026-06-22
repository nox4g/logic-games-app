FROM node:18

WORKDIR /app

# копіюємо server
COPY server/package*.json ./server/
WORKDIR /app/server
RUN npm install

# повертаємось в root
WORKDIR /app

# копіюємо весь проєкт
COPY . .

EXPOSE 8080

CMD ["node", "server/server.js"]