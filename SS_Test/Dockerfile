FROM node:18.17.0 as builder

COPY /Common/ /SignallingTester/Common
WORKDIR /SignallingTester/Common

RUN npm install
RUN npm run build

COPY /SS_Test/ /SignallingTester/SS_Test
WORKDIR /SignallingTester/SS_Test

RUN npm install
RUN npm link ../Common
RUN npm run build

USER node

CMD [ "node", "build/index.js" ]
