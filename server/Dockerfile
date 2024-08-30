FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache docker-cli


COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build 

RUN npx prisma generate

EXPOSE 3000

CMD ["npm" ,"start"]


