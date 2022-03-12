FROM node:16

WORKDIR /usr/src/app
VOLUME /usr/src/app

CMD [ "npm", "run", "test:dbready" ]
