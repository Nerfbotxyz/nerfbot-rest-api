FROM node:16-alpine

ADD . .
RUN npm install

EXPOSE 1987
ENV HOST=0.0.0.0
ENV PORT=1987

RUN npm run build

HEALTHCHECK --interval=5m --timeout=5s \
  CMD curl -f http://localhost:1987/healthcheck || exit 1

ENTRYPOINT npm run start
