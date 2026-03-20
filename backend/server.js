const express = require('express')
const cors = require('cors')
const cookiparser = require('cookie-parser')
const connection = require('./config/connection')
const dotenv = require('dotenv')


dotenv.config()
connection()

// Instnace of Express
const app = express()

// Middleware
app.use(express.json())
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}))
app.use(cookiparser())

// Auth Router
app.use('/auth', require('./routes/AuthRoutes'))
// Transaction Router
app.use('/api/transactions', require('./routes/TransactionRoutes'))


const PORT = process.env.PORT || 5000
app.listen(PORT, '0.0.0.0', () => console.log(`Server Runnig On ${PORT}`))
