require('dotenv').config()
const express = require('express')
const cors = require('cors')
const router = require('./controller/index')
const mongoose = require('mongoose')

const app = express()

app.use(cors())
app.use(express.json())
app.use(router)

const port = process.env.PORT || 3000

app.listen(port)

mongoose.connect(process.env.DB_URL)
.then(() => console.log('Connected!'))