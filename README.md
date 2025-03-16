ReMind
Currently ReMind is available at https://remind.lat in order to run the application locally you can do the following.
Please note that the backend URL is configured via an environment variable on Netlify. Ensure that you set up the appropriate environment variables before running the application.


ReMind setup instructions:

Frontend
The frontend is built using basic HTML, CSS, and JavaScript.
There is no npm start etc needed.

-------

Backend
The backend is built using Node.js.
Please use the below set of commands to run.

cd backend

npm install

------


Running the Backend Server

Before starting the server, make sure to define the backend URL in an environment variable. Create a .env file in the backend directory and add:

BACKEND_URL=http://localhost:3000

Then, start the Node.js server with:

node server.js
