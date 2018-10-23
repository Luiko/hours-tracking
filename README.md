# hours-tracking
web app to time tracking

## Stack
+ Linux/Ubuntu
+ Nginx
+ NodeJS/HapiJS
+ MongoDB/Mongoose
+ ReactJS/Babel/Webpack
+ Sass/Scss

## Run steps
to run the app you need;

1

MongoDB running in your computer or remote server/service

install dependecies `npm install`

specify some configurations on the ̣`.env` file

* cookie password
`COOKIE_PASSWORD=`
* mongodb connection
`STR_DB_CON=`
* raw cookie for testing
`JERONIMO_AUTH_COOKIE=`
* server port
`PORT=3000`
* boolean if using secure connection
`SECURE_CONN=`
* ssl or tsl requirements
`CERT_PATH=`
`PKEY_PATH=`
* boolean to reject request from public network
`LOCAL=`
* admin user with privileges
`ADMIN=`


also you need to create the `others` folder(for private extensions and plugins) in the
`plugings` folder and in `others` create a empty JavaScript file `index.js`

2

build client files `npm run build`

3

run database tests `npm run test-db`

run server tests `npm run test-be`

4

now you can run the app `node server`


##Folder Structure
client side files
  dist
  │ ...
  src/
  ├── assets
  │   ...
  ├── client.js
  ├── components
  │   ...
  ├── containers
  │   ...
  ├── index.html
  ├── index.scss
  ├── locales
  │   ...
  └── penv.json

server side files
  data
  │ ...
  node_modules
  │ ...
  src/
  ├── controllers
  │   ...
  ├── index.js
  ├── index.test.js
  ├── lib
  │   ...
  ├── models
  │   ...
  ├── plugins
  │   ...
  ├── static
  │   ...
  .gitignore
  .env
