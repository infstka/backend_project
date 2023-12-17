# Используем официальный образ Node.js
FROM node:20

# Установка рабочей директории в контейнере
WORKDIR /backend-project

# Копирование зависимостей и установка npm пакетов
COPY package.json ./
RUN npm install

# Копирование исходного кода в контейнер
COPY . .

# Открытие порта, на котором работает сервер Node.js
EXPOSE 3000

# Команда для запуска сервера Node.js
CMD ["npm", "start"]
