var express = require('express');
var createError = require("http-errors");
var fs = require("fs");
var path = require("path");
var express = require("express");
var cors = require("cors");
var session = require("express-session");
var mongoose = require("mongoose");
var MongoStore = require("connect-mongo")(session);
var bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
var connectDB = require("./config/db");
var morgan = require("morgan");
var helmet = require("helmet");
var swaggerJsDoc = require('swagger-jsdoc')
var swaggerUI = require('swagger-ui-express')





// Swagger Docs Setup
const swaggerOptions = {
  swagger: 3.0,
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Defualt User Api',
      version: '0.1.0',
      description:
        'This is a simple CRUD API application made with Express and documented with Swagger',
      license: {
        name: 'MIT',
        url: 'https://spdx.org/licenses/MIT.html'
      },
      contact: {
        name: 'BEYT',
        url: 'https://beyt.com',
        email: 'info@beyt.com'
      }
    }
  },
  apis: ['./server/routes/*']
}




// Passport Config
const initAuthMiddleware = require("./middleware/initpassport");

// Import Routes
const indexRouter = require("./routes");

// Connect MongoDB
connectDB(process.env.MONGO_URI);

//Initialize App
const app = express();
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "data")));
app.use(cookieParser());
app.enable("trust proxy");

// Session
app.use(
  session({
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
    secret: process.env.SECRET_SESSION_NAME,
    name: process.env.SESSION_COOKIE_NAME,
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: process.env.NODE_ENV,
      expires: Date.now() + parseInt(process.env.COOKIE_EXPIRATION_MS, 10),
      maxAge: parseInt(process.env.COOKIE_EXPIRATION_MS, 10),
    },
  })
);

// CORS
const corsConfig = {
  origin: "http://localhost:3000",
  methods: "GET, HEAD, PUT, PATCH, POST, DELETE",
  credentials: true,
};

app.use(cors(corsConfig));

// Passport middleware
initAuthMiddleware(app);

// Helmet (no-cache)
app.use(helmet());
 
  
// Morgan Logs
const accessLogStream = fs.createWriteStream(
  path.join(__dirname, './logs/access.log'),
  {
    flags: 'a'
  }
)
app.use(morgan("dev"));
app.use(morgan("combined"));
app.use(morgan("combined", { stream: accessLogStream }));
morgan.token("sessionid", function (req, res, param) {
  return req.sessionID ? req.sessionID : "NO SESSION ";
});

morgan.token("user", function (req, res, param) {
  try {
    return req.session.user;
  } catch (error) {
    return null;
  }
});

app.use(
  morgan(
    ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :user :sessionid'
  )
);

// Routers
app.use("/", indexRouter);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  return res.status(err.status || 500).json({ Error: err });
});

module.exports = app;
