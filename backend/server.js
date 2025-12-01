import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './config/mongodb.js'
import connectCloudinary from './config/cloudinary.js'
import adminRouter from './routes/adminRoute.js'
import serviceRouter from './routes/serviceRoute.js'
import userRouter from './routes/userRoute.js'
import eventRouter from './routes/eventRoute.js'
import promoCodeRouter from './routes/promoCodeRoute.js'
import calendarRouter from './routes/calendarRoute.js'

// app config
const app = express()
const port = process.env.PORT || 4000
connectDB()
connectCloudinary()

// middlewares
app.use(express.json())
app.use(cors())

// api endpoints
app.use('/api/admin',adminRouter)
app.use('/api/service',serviceRouter)
app.use('/api/user',userRouter)
app.use('/api/event',eventRouter)
app.use('/api/promo',promoCodeRouter)
app.use('/api/calendar',calendarRouter)
app.get('/', (req, res) => {
  res.send('API working!')
})

app.listen(port, () => console.log("Server started", port))