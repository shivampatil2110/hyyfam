const express = require("express");
const app = express();
const session = require("express-session");

// const MemoryStore = require("memorystore")(session);
const bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");

const MySQLStore = require("express-mysql-session")(session);
const keys = require("../../config/keys"); // Store secrets properly

// Configure MySQL session store
const sessionStore = new MySQLStore({
    host: keys.MYSQL_HOST,
    user: keys.MYSQL_USER,
    password: keys.MYSQL_PASSWORD,
    database: keys.MYSQL_DATABASE,
    clearExpired: true,
    checkExpirationInterval: 900000, // Clear expired sessions every 15 mins
    expiration: 86400000, // 1 day session expiration
});

const THIRTY_DAYS = 1000 * 60 * 60 * 24 * 30;
const NINTY_DAYS = 1000 * 60 * 60 * 24 * 90;

const {
    SESS_LIFETIME = NINTY_DAYS,
    NODE_ENV = "developement",
    SESS_NAME = "session",
    SESS_SECRET = "cashbite1234",
    COOKIE_NAME = "hyyzo",
} = process.env;

const IN_PROD = NODE_ENV === "production";

// var sessionStore = new MySQLStore(
//   {
//     checkExpirationInterval: 900000, // How frequently expired sessions will be cleared; milliseconds.
//     expiration: 86400000, // The maximum age of a valid session; milliseconds.
//     createDatabaseTable: true,
//     schema: {
//       tableName: "sessions",
//       columnNames: {
//         session_id: "session_id",
//         expires: "expires",
//         data: "data"
//       }
//     }
//   },
//   connection
// );
// app.use(()=>{console.log(12)});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(
    session({
        name: SESS_NAME,
        secret: SESS_SECRET,
        resave: false,
        saveUninitialized: false,
        proxy: IN_PROD,
        // store: new MemoryStore({
        //   checkPeriod: 86400000, // prune expired entries every 24h
        // }),
        store: sessionStore,
        cookie: {
            secure: IN_PROD,
            httpOnly: false,
            sameSite: "lax",
            domain: process.env.NODE_ENV === "production" ? "hyyfam.com" : undefined,
            maxAge: SESS_LIFETIME,
            name: COOKIE_NAME,
        },
    })
);
//Passport Middleware

//Passport config

// var allowCrossDomain = function(req, res, next) {
//   res.header('Access-Control-Allow-Origin', "*");
//   res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
//   res.header('Access-Control-Allow-Headers', 'Content-Type');
//   next();
// }

// app.use(allowCrossDomain)
module.exports = app;
