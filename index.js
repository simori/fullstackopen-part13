const express = require('express')
const app = express()

const { PORT } = require('./util/config')
const { connectToDatabase } = require('./util/db')

const blogsRouter = require('./controllers/blogs')

app.use(express.json())

app.use('/api/blogs', blogsRouter)

// this has to be the last loaded middleware.
const errorHandler = (error, request, response, next) => {
  console.error('Error happened! ',error.message)

  if (error.name === 'SequelizeDatabaseError') {
    return response.status(400).send({ error: 'Databassovirhe!' })
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