FROM node:23

WORKDIR /app

COPY package*.json ./

COPY . .

EXPOSE 80

CMD ["/bin/bash", "/home/startup.sh"]
