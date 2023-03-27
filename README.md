# Nerfbot REST API

REST API supporting the NERFBot stack.  Accepts requests for image/video uploads, processing requests of those uploads to prepare for training, training requests, and export requests.

## Requirements
- `node` >= `v16 LTS`

## Install
```bash
$ npm i
```
## Build
```bash
$ npm run build
```
## Configure
Make sure you have the following environment variables defined, either manually or via `.env`

### Postgres
- `DB_USER` - username
- `DB_PASS` - password
- `DB_HOST` - host
- `DB_PORT` - port
- `DB_NAME` - defaults to `postgres`
- `DB_SCHEMA` - defaults to `nerfbot`

### S3
- `BUCKET_NAME` - Name of the S3 bucket to use for user uploads

The rest of the information necessary to connect to your AWS S3 buckets should be configured in the environment.  See [AWS CLI](https://aws.amazon.com/cli/) for more info.

### Migrations

Make sure you run the migrations to prep the database structure for the app.
```bash
$ npx knex migrate:latest
```

## Run
```bash
$ npm start
```
or for development in watch mode
```bash
$ npm run dev
```

## REST API

### Authentication

Most endpoints require authentication via api token passed in as a query param e.g. `?token=<my-api-key>`.

This may change to an `Authorization` header in the future.

### Endpoints

More endpoints will be added as functionality is developed.

- `GET` `/healthcheck` - API Healthcheck, returns `200 OK`
- `POST` `/nerf/uploads` - Post a new upload request, one or many files, as form data
- `GET` `/nerf/uploads` - List your upload requests
- `POST` `/nerf/uploads/:uploadId/process` - Post a new process request to prep an upload for training
- `GET` `/nerf/process-requests` - List your process requests (with statuses)
- `GET` `/nerf/process-request/:processRequestId` - Get a process request by ID (with status)
