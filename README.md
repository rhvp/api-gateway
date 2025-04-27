## Description

API Gateway and Authentication Service

## Installation

```bash
# install app dependencies
$ npm install
```

## MIGRATION && SEEDING

```bash
# database setup
$ npm run db:migrate

$ npm run db:seed
```

## Running the app

```bash
# start app
$ npm run start

# watch mode
$ npm run start:dev
```

## Test

```bash
# unit tests
$ npm run test
```

## Documentation

`https://documenter.getpostman.com/view/7534999/2sB2j1gXBe`

## Instructions

Follow the steps above to setup and bootstrap the app. 
- Default tenants and roles are seeded in the db after successfully following the migration and seeding steps.
- All API requests require `x-tenant-key` header to identify the source tenant.
- Service API requests require a Bearer access token as well as the `x-tenant-key` header property.
- There are two micro-services setup on the application. 
- The default roles only permit read access to the services.
- Calling the 'Add Products' route defined in the documentation above should fail with an `Unauthorized access` error.
- The Oauth2 login architecture is designed to initiate the handshake between the client (frontend) tenant application 
and the google oauth server. 
- The frontend then receives a code after the user authenticates, which it forwards to the 
service Authentication endpoint along with the respective tenant key. 
- The backend completes the Oauth process by validating the code and fetching the 
authenticated user profile details. The user is then loggedin directly if exists or is automatically signed up if doesn't exist.
- A default rate-limit of 5 requests per minute per IP is set to easily test the rate-limiting feature.