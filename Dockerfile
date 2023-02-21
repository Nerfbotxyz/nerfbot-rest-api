FROM node:16-alpine

ADD . .
RUN npm install

EXPOSE 1987
ENV HOST=0.0.0.0
ENV PORT=1987

RUN npm run build

ENTRYPOINT npm run start
