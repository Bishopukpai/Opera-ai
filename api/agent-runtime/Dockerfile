FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

# Cloud Run defaults to 8080, matching our internal configuration runner
EXPOSE 8080

CMD [ "npm", "start" ]