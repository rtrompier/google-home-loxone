FROM node

RUN apt-get update && apt-get install libavahi-compat-libdnssd-dev

RUN mkdir /notifier
ADD app.js /notifier
ADD package.json /notifier

RUN npm install

CMD ["node", "/notifier/app.js"]