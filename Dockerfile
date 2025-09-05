# Этап сборки Vue приложения
FROM node:23 as build-stage

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# Этап с nginx для отдачи статических файлов
FROM nginx:alpine

# Копируем собранные файлы из build-stage в директорию nginx
COPY --from=build-stage /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
