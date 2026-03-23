const express = require('express')
const cors = require('cors')
const cookiparser = require('cookie-parser')
const connection = require('./config/connection')
const dotenv = require('dotenv')
const { Globallimiter } = require('./middlewares/RateLimiter')

dotenv.config()
connection()

// Instnace of Express
const app = express()
app.set('trust proxy',1)

// Middleware
app.use(express.json())
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}))
app.use(cookiparser())
app.use(Globallimiter)

// Auth Router
app.use('/api/auth', require('./routes/AuthRoutes'))
// Transaction Router
app.use('/api/transactions', require('./routes/TransactionRoutes'))
// Budget Router
app.use('/api/budgets', require('./routes/BudgetRoutes'))
// Profile Router
app.use('/api/profile',require('./routes/ProfileRouter'))
// Goal Router
app.use('/api/goal',require('./routes/GoalRouter'))


app.use((err, req, res, next) => {
   const statusCode = err.statusCode || 500;
   res.status(statusCode).json({
      success: false,
      message: err.message || 'Internal Server Error'
   });
});

const PORT = process.env.PORT || 5000
app.listen(PORT, '0.0.0.0', () => console.log(`Server Runnig On ${PORT}`))
