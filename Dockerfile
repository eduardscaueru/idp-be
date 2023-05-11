FROM node:18.16.0-alpine

WORKDIR /app

COPY . .

RUN npm install --legacy-peer-deps

EXPOSE 8083

CMD ["npm", "start"]