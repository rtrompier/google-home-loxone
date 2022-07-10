FROM node:16

WORKDIR /usr/src/app
COPY . .

RUN npm install pm2 -g
RUN npm ci

EXPOSE 3000
CMD ["pm2-runtime", "/usr/src/app/dist/index.js"]