const express = require('express')
const cors = require('cors')
const cookiparser = require('cookie-parser')
const connection = require('./config/connection')
const dotenv = require('dotenv')
const { Globallimiter } = require('./middlewares/RateLimiter')
const auth = require('./routes/AuthRouter')
const profile = require('./routes/ProfileRouter')
const goal = require('./routes/GoalRouter')

dotenv.config()
connection()

// Instnace of Express
const app = express()
app.set('trust proxy',1)

// Middleware
app.use(express.json())
app.use(cors())
app.use(cookiparser())
app.use(Globallimiter)

// Auth Router
app.use('/auth',auth)
app.use('/profile',profile)
app.use('/goal',goal)



app.use((err, req, res, next) => {
   const statusCode = err.statusCode || 500;
   res.status(statusCode).json({
      success: false,
      message: err.message || 'Internal Server Error'
   });
});

const PORT = process.env.PORT || 5000
app.listen(PORT,'0.0.0.0',()=>console.log(`Server Runnig On ${PORT}`))
