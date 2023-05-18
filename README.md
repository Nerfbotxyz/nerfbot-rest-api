# Nerfbot REST API

REST API supporting the NERFBot stack.  Accepts requests for image/video uploads, processing requests of those uploads to prepare for training, training requests, and export requests.

## Requirements
- `node` >= `16 LTS`
- `postgres` >= `14 LTS`
- `AWS S3`
- `redis` >= `6 LTS`

## Install
```bash
$ npm i
```
## Build
```bash
$ npm run build
```
## Configure
Make sure you have the following environment variables defined, either manually
or via `.env`

### Postgres
- `DB_USER` - username
- `DB_PASS` - password
- `DB_HOST` - host
- `DB_PORT` - port
- `DB_NAME` - defaults to `postgres`
- `DB_SCHEMA` - defaults to `nerfbot`

### S3
- `BUCKET_NAME` - Name of s3 bucket to use for user uploads
- `PROCESSED_BUCKET` - Name of s3 bucket to use for processed user uploads
- `TRAINING_BUCKET` - Name of s3 bucket to use for training artifacts
- `RENDERS_BUCKET` - Name of s3 bucket to use for render artifacts
- `EXPORTS_BUCKET` - Name of s3 bucket to use for export artifacts

The rest of the information necessary to connect to your AWS S3 buckets should
be configured in the environment.  See [AWS CLI](https://aws.amazon.com/cli/)
for more info.

### Redis
- `REDIS` - defaults to `redis://127.0.0.1:6379`

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

## How it works

Every step in the overall process, aside from initially uploading user artifacts in step 1 below, is handled by a background job.
The status of these jobs can be fetched via `/nerf/jobs` endpoints with corresponding `jobId` being returned from endpoints that involve background jobs.
When a job is complete, it will contain the corresponding output artifact's id in its `jobData`.
For example, a completed export job's `jobData` will have both `trainingId` from its input and `exportId` from its output.

1) Upload images or video as form data by POSTing to the `/nerf/uploads` endpoint
2) Process an upload by `uploadId` via `/nerf/uploads/:uploadId/process`, making sure to include `mediaType` in the query params (either `images` or `video`)
3) Train on the processed upload artifact by its `processedId` via `/nerf/processed/:processedId/train`
4) Render or Export the NeRF
  - Render a video of the trained artifact by its `trainingId` via `/nerf/trainings/:trainingId/render`
  - Export geometry of the trained artifact by its `trainingId` via `/nerf/trainings/:trainingId/export`

All artifacts from every step are uploaded to their corresponding s3 buckets.

## REST API Reference

### Authentication

Most endpoints require authentication via api token passed in as a query param
e.g. `?token=<my-api-key>`.

This may change to an `Authorization` header in the future.

### Endpoints

More endpoints will be added as functionality is developed.

### General / Info
- `GET` `/healthcheck` - API Healthcheck, returns `200 OK`

### Jobs
- `GET` `/nerf/jobs` - List your job requests
- `GET` `/nerf/jobs/:jobId` - Get a job request by ID

### User Uploads
- `POST` `/nerf/uploads` - Post a new upload request, one or many files, as
form data
- `GET` `/nerf/uploads` - List your upload requests
- `GET` `/nerf/uploads/:uploadId` - Get an upload by `uploadId`
- `POST` `/nerf/uploads/:uploadId/process` - Post a new process job request to
prep an upload for training
  - `?mediaType` **REQUIRED** - either `video` or `images` depending on the type of the user upload artifact

### Processed User Uploads
- `GET` `/nerf/processed` - List your processed upload artifacts
- `GET` `/nerf/processed/:processedId` - Get (info about) a processed upload artifact by `processedId`
- `POST` `/nerf/processed/:processedId/train` - Start training on a processed upload artifact

### NeRF Training Artifacts
- `GET` `/nerf/trainings` - List your NeRF training artifacts
- `GET` `/nerf/trainings/:trainingId` - Get (info about) a NeRF training artfact by `trainingId`
- `POST` `/nerf/trainings/:trainingId/render` - Render a video of a NeRF training artifact
- `POST` `/nerf/trainings/:trainingId/export` - Export geometry of a NeRF training artifact

### Render Artifacts
- `GET` `/nerf/renders` - List your renders
- `GET` `/nerf/renders/:renderId` - Get (info about) a render by `renderId`

### Export Artifacts
- `GET` `/nerf/exports` - List your exports
- `GET` `/nerf/exports/:exportId` - Get (info about) an export by `exportId`
