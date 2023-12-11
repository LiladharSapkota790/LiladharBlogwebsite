const dotenv = require('dotenv');
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const _ = require('lodash');
const logger = require('morgan');
const passportLocalMongoose = require('passport-local-mongoose');
const findOrCreate = require('mongoose-findorcreate');
const connectDB = require('./config/db');
const fetch = require('fetch');

/*now usig mongoose database for myblog*/
const mongoose = require('mongoose');
dotenv.config();

/*This is for authenication*/
const bcrypt = require('bcrypt');
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');
const methodOverride = require('method-override');

const app = express();
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.use(flash());

app.use(logger('dev'));
app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.static('public'));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(function (req, res, next) {
  res.locals.message = req.flash();
  next();
});

app.use(passport.initialize());
app.use(passport.session());

/*connecting with database*/
connectDB();

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  date: {
    type: Date,
    default: Date.now,
  },
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = new mongoose.model('User', userSchema);

passport.use(User.createStrategy());

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});

// Initialize Passport

const {
  checkAuthenticated,
  checkNotAuthenticated,
  authRole,
  adminUser,
} = require('./middleware/auth');

// Common static pages in homerouter
app.use('/', require('./routes/homeroute'));
app.use('/about', require('./routes/homeroute'));
app.use('/contact', require('./routes/homeroute'));
app.use('/thanks', require('./routes/homeroute'));
app.use('/404', require('./routes/homeroute'));
app.use('/register-form', require('./routes/homeroute'));
app.use('/admin/allmessages', require('./routes/homeroute'));

/*Pages related to databases*/
app.use('/content', require('./routes/homeroute'));
app.use('/topics/related/:topicName', require('./routes/homeroute'));

/*_______________________________________________________________________*/

app.use('/admin/compose', require('./routes/homeroute'));

app.use('/allpostsforadminonly', require('./routes/homeroute'));

// account related Pages

/* GET login page. */
app.get('/login', function (req, res) {
  res.render('login');
});

/* get registration page */
// app.get("/register", checkauthenticated, function (req, res) {
//   res.render("signup", {
//     message: ["success"],
//     err: "",
//   });
// });

app.post('/register', function (req, res) {
  User.register(
    {
      username: req.body.username,
    },
    req.body.password,
    function (err, user) {
      if (err) {
        console.log('error registering user' + err);

        res.render('signup', {
          err: err,
        });
        return;
      }

      passport.authenticate('local')(req, res, function () {
        req.flash('success', 'You are successfully registered! Now login here');
        res.redirect('/login');
      });
    }
  );
});

app.post('/login', function (req, res) {
  const user = new User({
    username: req.body.username,
    password: req.body.password,
  });

  req.login(user, function (err) {
    if (err) {
      console.log(err + 'Error frorm loging ');
      res.send(err);
    } else {
      passport.authenticate('local')(req, res, function () {
        req.flash('success', ' Welcome ! Log in successful');
        console.log('I am before redirecting');
        res.redirect('admindashboard');
      });
    }
  });
});

app.get('/users/accountsetting', checkAuthenticated, (req, res) => {
  console.log(req.user.id);
  User.findById(req.user.id, function (err, founduser) {
    if (err) {
      console.log(err);
    } else {
      founduser = founduser;

      res.render('accountsetting', {
        founduser: founduser,
      });
    }
  });
});

//{ _id: new mongodb.ObjectID(id) }, { $set: { name: name, email: email } }, (error, result)

app.post('/user/accountsetting/updateuser', (req, res) => {
  // console.log(req.user);
  User.updateOne(
    {
      username: req.user.username,
    },
    {
      $set: {
        username: req.body.username,
        password: req.body.password,
      },
    },
    {
      overwrite: true,
    },
    function (err) {
      if (err) {
        res.send(err);
      } else {
        res.send('updated');
      }
    }
  );
});

/* Handle Logout */
app.get('/signout', function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    req.flash('success', ' You are logged out successfully!');
    res.redirect('/');
  });
});

app.get('/users/profile', checkAuthenticated, (req, res) => {
  console.log(req.user.username);
  res.render('userDashboard', {
    userdetails: '',
    user: req.user.username,
    userrole: '',
  });
});

app.get('*', (req, res) => {
  res.render('404');
});

app.listen(process.env.PORT || 6790, function () {
  console.log('Server started on port  ');
});
