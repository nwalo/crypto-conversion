require('dotenv').config()
const bodyParser = require('body-parser')
const express = require('express')
const session = require('express-session')
const https = require('https')
const cors = require('cors')
const _ = require('lodash')
const passport = require('passport')
const passportLocalMongoose = require('passport-local-mongoose')
const mongoose = require('mongoose')
const findOrCreate = require('mongoose-findorcreate')
// const convert = require('crypto-convert')
const axios = require('axios')

// INITIALIZE MALWARES

const app = express()
app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(express.json())
app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  }),
)
app.use(passport.initialize())
app.use(passport.session())

// DATABASE CONNECTION - MONGODB

// mongoose.connect(process.env.MONGO_URL, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// })

mongoose.connect('mongodb://localhost:27017/crytoDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

// SCHEMA DEFINITIONS

const userSchema = new mongoose.Schema({
  username: String,
  lastName: String,
  firstName: String,
  gender: String,
  country: String,
  phone: Number,
})

userSchema.plugin(passportLocalMongoose)
userSchema.plugin(findOrCreate)

// MODEL DEFINITIONS

const User = mongoose.model('User', userSchema)

passport.use(User.createStrategy())

// GLOBAL SERIALIZATION

passport.serializeUser(function (user, done) {
  done(null, user.id)
})

passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user)
  })
})

// API END POINT

app.get('/', (req, res) => {
  res.render('index')
  console.log('CRYPTO SERVER IS RUNNING ... ')
  // res.send(data)
})

app.post('/convert', (req, res) => {
  const token = req.body.token
  const amount = req.body.amount
  const fiat = req.body.fiat
  axios
    .get(
      `https://api.coinconvert.net/convert/${token}/${fiat}?amount=${amount}`,
    )
    .then((result) => {
      console.log(result.data)
      let data = res.render('convert', {
        data: Number(result.data[fiat.toUpperCase()]).toFixed(2),
        token: token.toUpperCase(),
        amount,
        fiat: fiat.toUpperCase(),
      })
    })
    .catch((err) => {
      console.log('err')
    })

  console.log('CRYPTO SERVER IS RUNNING ... ')
})

let port = process.env.PORT
if (port == null || port == '') {
  port = 5555
}

app.listen(port, function () {
  console.log('server running at port ' + port)
})
