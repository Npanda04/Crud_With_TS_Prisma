import express from 'express'
import mainRouter from "./Routes/index"
// import cors from 'cors'

const app = express()
// app.use(cors())

app.use(express.json())

app.use('/api/v1', mainRouter)

app.listen(3005, ()=>{
    console.log("msg from app listen")
})