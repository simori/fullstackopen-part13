const express = require('express')
require('express-async-errors');

const app = express()

const { PORT } = require('./util/config')
const { connectToDatabase } = require('./util/db')

const blogsRouter = require('./controllers/blogs')
const usersRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')
const authorRouter = require('./controllers/authors')

app.use(express.json())

app.use('/api/blogs', blogsRouter)
app.use('/api/users', usersRouter)
app.use('/api/login', loginRouter)
app.use('/api/authors', authorRouter)

// this has to be the last loaded middleware.
const errorHandler = (error, request, response, next) => {
  console.error('Error happened! ',error.message)

  if (error.name === 'SequelizeDatabaseError') {
    return response.status(400).send({ error: 'Databassovirhe!' })
  } 

  // 13.9
  if (error.name === 'SequelizeValidationError') {
    console.error('Username is not valid email address!')
    return response.status(400).send({ error: 'Username is not valid email address!' })
  }

  next(error)
}

app.use(errorHandler)

const start = async () => {
  await connectToDatabase()
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}!`)
  })
}

start()