const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const cookierParser = require('cookie-parser')
const passport = require('passport')
const LocalStrategy = require('passport-local')
const session = require("express-session")
const MongoStore = require('connect-mongo')
const i18n = require('./i18n')
const User = require('./models/user')

const port = process.env.BACKEND_PORT
const url = process.env.VUE_APP_BACKEND_URL

mongoose.connect(process.env.MONGO_URL, {}, () => {
  console.log(i18n.t("alerts.db.success"))
})

passport.use(new LocalStrategy(
  function (username, password, done) {
    User.findOne({ email: username }, async function (err, user) {
      if (err) { return done(err); }
      if (!user) { return done(null, false); }
      if (! await user.verifyPassword(password)) { return done(null, false); }
      return done(null, user);
    });
  }
));

User.find({}, async (err, docs) => {
  if (docs.length === 0) {
    const admin = new User({ email: process.env.ADMIN_EMAIL, name: 'Admin' })
    await admin.setPassword(process.env.ADMIN_PASSWORD)
    await admin.save()
  }
})

const app = express()

app.use(express.json({ limit: '2mb' }))
app.use(express.urlencoded({ limit: '2mb', extended: true }));
app.use(cors({
  credentials: true,
  origin: process.env.VUE_APP_FRONTEND_URL
}))
app.use(cookierParser())

app.use(session({
  store: MongoStore.create(mongoose.connection),
  secret: new Date(Math.random * 100000).toString().toUpperCase(),
  cookie: {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    secure: false
  },
  resave: false,
  saveUninitialized: true
}))

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});

app.use(passport.initialize())
app.use(passport.session());

app.post('/login', passport.authenticate('local', { session: true }), async (req, res) => {
  res.send({ status: 'ok' })
});

app.post('/register', async (req, res) => {
  if (!req.body.password || !req.body.email || !req.body.name || req.body.password.length === 0 || req.body.email.length === 0 || req.body.password.name === 0) {
    res.status(400).send({ message: 'Please provide: password, email and name!' })
  }
  const user = new User({
    name: req.body.name,
    email: req.body.email,
    weekPlan: [[],[],[],[],[],[],[]]
  })
  await user.setPassword(req.body.password)
  try {
    await user.save()
    console.log(user)
    res.send({ message: 'Successfully created new User.' })
  } catch (error) {
    if(error.code === 11000){
      res.status(409).send({ message: 'Already exists: ' + Object.keys(error.keyPattern), duplicates: error.keyValue})
    }else{
      res.status(400).send({ message: 'An error occured while creating the account!', error: error })
    }
  }
})

app.use('/api', async (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    return res.status(401).send({ message: i18n.t("alerts.request.unauthorized") })
  }
})
const routes = require('./routes/routes')
app.use('/api', routes)

require('./initdb')

app.listen(port, () => {
  console.log(`Backend listening at ${url}`)
})
