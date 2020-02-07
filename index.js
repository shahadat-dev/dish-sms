const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
var Fawn = require('fawn')
var compression = require('compression')

const app = express()

// Routes
const sms = require('./routes/api/sms')

// compress all responses
app.use(compression())

// Body parser middleware
app.use(
  bodyParser.urlencoded({
    extended: false
  })
)
app.use(bodyParser.json())

// Cors
app.use(cors())

//DB config
const db = require('./config/keys').mongoURI

// Connect to MongoDB
mongoose
  .connect(db,  { useNewUrlParser: true })
  .then(() => console.log('MongoDB connected.'))
  .catch(err => console.log(err))

// Initialize Fawn
Fawn.init(mongoose)

// Use Routes
app.use('/api/sms', sms)


const port = process.env.PORT || 61952


app.listen(port, () => console.log(`Server is running on port ${port}`))



