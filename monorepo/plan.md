# plan for the monorepo folder

this monorepo will be a clone of the antelope-api-isolate and antelope-frontend-isolate

it will deploy to a new, single Heroku app called antelope-integrated

the root endpoint / will serve the frontend

the /api endpoint will serve the backend

the api will use the same database as the api-isolate, since it is already setup

it will be deployed from a Procfile in monorepo/Procfile that handles both the frontend and backend

Production URL: https://antelope-integrated-app-fb8fae27deb5.herokuapp.com

# acceptance criteria

- first we should allow the api to be deployed in a manner that confirms it is hosted correctly on the /api endpoint
  - api confirmed in https://antelope-integrated-app-fb8fae27deb5.herokuapp.com/api/test


- the Procfile in the root of the monorepo will deploy both the frontend and backend without errors
- the frontend is served from the root endpoint /
- the api is served from the /api endpoint
- the button API test works both in playwright and in manual tests