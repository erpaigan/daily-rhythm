Running locally:

Preferred:

export GOOGLE_APPLICATION_CREDENTIALS="config/google-app-credentials.json" (Rename service-account-file.json to google-app-credentials.json and store it inside config folder within the main directory)

This command sets the project's authentication for some Google Cloud services. Make sure to run this command on the same tab in the terminal where you run the server in development mode for Mac users:
export GOOGLE_APPLICATION_CREDENTIALS="KEY_PATH" (example: "/home/user/Downloads/service-account-file.json")

Running development server concurrently with React app:
npm run dev

Building before deployment:
nprm run build