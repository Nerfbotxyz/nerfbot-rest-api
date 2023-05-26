FROM node:16-alpine

CMD mkdir /app
WORKDIR /app
ADD . .
RUN npm install

EXPOSE 1987
ENV HOST=0.0.0.0
ENV PORT=1987

RUN npm run build

HEALTHCHECK --interval=30s --timeout=5s \
  CMD wget \
    --no-verbose \
    --tries=1 \
    --spider \
    http://0.0.0.0:1987/healthcheck || exit 1

ENTRYPOINT npm run start
