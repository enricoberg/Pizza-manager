const express = require('express')
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcrypt');
const expressLayouts = require('express-ejs-layouts')
require('dotenv').config()
const cookieParser = require("cookie-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.set('view engine', 'ejs')
app.set('views', __dirname + '/views')
app.set('layout', __dirname + '/views/layouts/layout')
app.use(expressLayouts)


//app.use(express.static('public'))
app.use(express.static(path.join(__dirname, 'public')))
const connection = require('./configuration.js');


// CONFIGURE SESSIONS
const oneDay = 1000 * 60 * 60 ;
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: oneDay}
  }))

//   -------------------------------------------------------------
connection.query('DELETE FROM sessions');
const indexRouter = require('./routes/auth');
const reservRouter = require('./routes/reserv');
app.use('/', indexRouter);
app.use('/reservations', reservRouter);



app.listen(3000);