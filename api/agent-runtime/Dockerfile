FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./
# Force a clean dependency tree build matching our latest package updates
RUN npm install --omit=dev

COPY . .

EXPOSE 8080

CMD [ "npm", "start" ]