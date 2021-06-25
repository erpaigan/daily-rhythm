Running locally:

Preferred:

First, setup necessary local development environment variables:

Set the project's authentication for some Google Cloud services (Google service account key). Make sure to run this command on the same tab in the terminal where you run the server in development mode for Mac users:

export GOOGLE_APPLICATION_CREDENTIALS="config/google-app-credentials.json" (Rename service-account-file.json to google-app-credentials.json and store it inside config folder within the main directory)

Set local datastore variables:

gcloud beta emulators datastore env-init (This will list down all the necessary variables you need to run datastore locally, just copy and paste the commands listed on the same terminal window you run the server)

gcloud beta emulators datastore env-unset (You can run this command to unset datastore environment variables and default to using Google Cloud's datastore, just copy and paste the listed commands on the terminal to unset the variables)

Running development server concurrently with React app and datastore:
npm run dev

Building before deployment:
npm run build

Deploy index file before app deployment:
gcloud app deploy index.yaml

Deploying app:
gcloud app deploy