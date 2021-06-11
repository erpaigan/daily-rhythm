This command sets the project's authentication for some Google Cloud services. Make sure to run this command on the same tab in the terminal where you run the server in development mode for Mac users:
export GOOGLE_APPLICATION_CREDENTIALS="KEY_PATH" (example: "/home/user/Downloads/service-account-file.json")

npm run dev

todos:

server
get datastore emulator to work - gcloud beta emulators datastore start --data-dir="/Users/jhong/gig/datastore/daily-rhythm/"

upsertUser()
Check if request is update or create
If request is to create, check if email already exists
When updating user, do not update password, there will be another route for updating passwords
Role should also depend from where the request was made

add auth middleware for server routes and frontend API calls