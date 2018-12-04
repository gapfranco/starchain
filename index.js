const express = require('express')
const helmet = require('helmet')
const stars = require('./routes/stars')

const port = 8000

const app = express()

app.use(express.json())
app.use(helmet())

app.use('/', stars)

app.listen(port, () => console.log(`Listening on port ${port}`))
