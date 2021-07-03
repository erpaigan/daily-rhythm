
# Readme

Check app running in GCP here [Daily Rhythm](https://daily-rhythm-app.et.r.appspot.com).

## Running locally

First, setup necessary local development environment variables:

Set the project's authentication for some Google Cloud services (Google service account key). Make sure to run this command on the same tab in the terminal where you run the server in development mode for Mac users:

Rename service-account-file.json to google-app-credentials.json and store it inside config folder within the main directory
### `export GOOGLE_APPLICATION_CREDENTIALS="config/google-app-credentials.json"`


Set local datastore variables:

This will list down all the necessary variables you need to run datastore locally, just copy and paste the commands listed on the same terminal window you run the server
### `gcloud beta emulators datastore env-init`


You can run this command to unset datastore environment variables and default to using Google Cloud's datastore, just copy and paste the listed commands on the terminal to unset the variables
### `gcloud beta emulators datastore env-unset`


Running development server concurrently with React app and datastore:
### `npm run dev`


## Deploying to GCP

Building before deployment:
### `npm run build`


Deploy index file before app deployment:
### `gcloud app deploy index.yaml`


Deploying app:
### `gcloud app deploy`
