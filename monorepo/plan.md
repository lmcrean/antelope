# plan for the monorepo folder

this monorepo will be a clone of the antelope-api-isolate and antelope-frontend-isolate

it will deploy to a new, single Heroku app called antelope-integrated

the root endpoint / will serve the frontend

the /api endpoint will serve the backend

the api will use the same database as the api-isolate, since it is already setup

it will be deployed from a Procfile in monorepo/Procfile that handles both the frontend and backend
