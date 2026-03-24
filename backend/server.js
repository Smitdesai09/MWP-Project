const express = require('express')
const cors = require('cors')
const cookiparser = require('cookie-parser')
const connection = require('./config/connection')
const dotenv = require('dotenv')
const { Globallimiter } = require('./middlewares/RateLimiter')
<<<<<<< HEAD
const auth = require('./routes/AuthRouter')
const profile = require('./routes/ProfileRouter')
const goal = require('./routes/GoalRouter')
const Profile = require('./models/Profile')
const Goal = require('./models/Goal')


=======
>>>>>>> 389ef2bd5e65c1d61893d230e5e72aa40b9d45c6

dotenv.config()
connection()

// Instnace of Express
const app = express()
<<<<<<< HEAD
app.set('trust proxy', 1)
=======
app.set('trust proxy',1)
>>>>>>> 389ef2bd5e65c1d61893d230e5e72aa40b9d45c6

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
<<<<<<< HEAD
// Profile Router
app.use('/api/profile', profile)
// Goal Router
app.use('/api/goal', goal)





app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        message: err.message || 'Internal Server Error'
    });
=======
// Holding Routerrs
app.use('/api/holdings', require('./routes/HoldingRoutes'))
// Dashboard Router
app.use('/api/dashboard', require('./routes/DashboardRoutes'))
// Goal Router
app.use('/api/goals', require('./routes/GoalRoutes'))
// Profile Router
app.use('/api/profile', require('./routes/ProfileRoutes'))


app.use((err, req, res, next) => {
   const statusCode = err.statusCode || 500;
   res.status(statusCode).json({
      success: false,
      message: err.message || 'Internal Server Error'
   });
>>>>>>> 389ef2bd5e65c1d61893d230e5e72aa40b9d45c6
});

const PORT = process.env.PORT || 5000
app.listen(PORT, '0.0.0.0', () => console.log(`Server Runnig On ${PORT}`))
