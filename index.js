const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()
app.use(express.static('dist'))
app.use(express.json())
app.use(cors())

morgan.token('data', function (req) { return JSON.stringify(req.body) })
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :data'))

const Athlete = require('./models/athlete')
app.get('/api/athletes', (req, res) => {
  Athlete.find({}).then(athletes => {
    res.json(athletes)
  })
})

app.get('/api/athletes/:id', (req, res, next) => {
  Athlete.findById(req.params.id)
    .then(athlete => {
      if (athlete) {
        res.json(athlete)
      } else {
        res.status(404).end()
      }
    }).catch(error => next(error))
})

app.delete('/api/athletes/:id', (req, res) => {
  Athlete.findByIdAndDelete(req.params.id).then(athlete => {
    res.json(athlete)
  })
})

app.put('/api/athletes/:id', (req, res) => {
  const newAthlete = req.body
  Athlete.findByIdAndUpdate(
    req.params.id, 
    newAthlete,
    { new: true, runValidators: true, context: 'query' }
  ).then(athlete => {
    res.json({
      id: req.params.id,
      name: athlete.name,
      birthDate: athlete.birthDate,
      residence: athlete.residence,
      subscribtionDate: newAthlete.subscribtionDate,
    })
  })
})

app.post('/api/athletes/', (req, res, next) => {
  const newAthlete = req.body
  if (newAthlete.name == undefined && newAthlete.number == undefined) {
    return res.status(400).json({ error: 'The content is missing' })
  }

  const athlete = new Athlete({
    name: newAthlete.name,
    birthDate: newAthlete.birthDate,
    residence: newAthlete.residence,
    subscribtionDate: newAthlete.subscribtionDate,
  })

  athlete.save().then(newAthlete => {
    res.json(newAthlete)
  }).catch(error => next(error))
})

app.get('/api/info', (req, res) =>{
  const time = new Date()
  Athletes.find({}).then(athletes => {
    res.send('<p>Phonebook has info for '
            + athletes.length.toString()
            + ' athletes.<br>'
            + time.toString()
            + '</p>')
  })
})

const errorHandler = (error, req, res, next) => {
  if (error.name === 'CastError') {
    return res.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return res.status(400).json({ error: error.message })
  }
  next(error)
}
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})