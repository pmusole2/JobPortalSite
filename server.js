const express = require('express')
const connectDB = require('./config/db')

const app = express()

// Init Middleware
app.use(express.json({ extended: false }))

app.get('/', res => res.json({ msg: 'Welcome to my app' }))

app.use('/api/users', require('./routes/users'))
app.use('/api/auth', require('./routes/auth'))
app.use('/api/adverts', require('./routes/advert'))

const PORT = process.env.PORT || 5000

app.listen(PORT, () =>
	console.log(`Server running successfully on port ${PORT}`)
)

connectDB()
